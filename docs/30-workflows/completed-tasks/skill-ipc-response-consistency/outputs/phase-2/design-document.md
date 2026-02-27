# 統合設計書: skill IPC レスポンス一貫性（方針C）

> **Phase 2 Task 2-5 成果物**
> **作成日**: 2026-02-27
> **タスク**: UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001
> **入力**: outputs/phase-2/contract-profiles.md, preload-unification-plan.md, type-sync-plan.md, migration-steps.md

---

## 1. 設計概要

### 1.1 方針C: プロファイル明示 + Preload 単一化

既存の Main 側レスポンスパターンを尊重しつつ、4つの契約プロファイル（Profile-A/B/C/D）で分類・明示化する。Preload 層は各プロファイルに従って `safeInvoke` / `safeInvokeUnwrap` を選択し、Renderer に対して一貫した型解釈を提供する。

```
AS-IS:
  Main --- [ラッパー/直接/例外が混在] ---> Preload --- [safeInvoke/Unwrap混在] ---> Renderer
                                                                                    |
                                                                          [解釈パターン混在]

  問題:
  (1) エラーメッセージ未サニタイズ（10チャネル）--- セキュリティ原則違反
  (2) バリデーション return/throw 混在（optimize系3 + file系6チャネル）
  (3) skill:abort の型定義不一致（boolean vs void）
  (4) 成功レスポンスの data フィールド欠落（file系4チャネル）

TO-BE:
  Main --- [プロファイル明示で固定] ---> Preload --- [プロファイルに応じた変換] ---> Renderer
                                                                                    |
                                                                          [単一の戻り値解釈]

  改善:
  (1) sanitizeErrorMessage による全エラーサニタイズ
  (2) バリデーション throw 統一
  (3) 契約プロファイル表による明示的分類
  (4) Preload API シグネチャの統一型提供
```

### 1.2 方針C を選択した理由

| 評価軸         | 方針A（直接返却統一）    | 方針B（ラッパー統一）  | **方針C（プロファイル明示）**      |
| -------------- | ------------------------ | ---------------------- | ---------------------------------- |
| 要件充足性     | 高                       | 高                     | **高**                             |
| 実装変更コスト | 高（16チャネル変更）     | 中（4チャネル変更）    | **低（3チャネル + サニタイズ）**   |
| 後方互換性     | 低（Renderer 影響大）    | 低（既存 throw 変更）  | **高（Renderer 影響なし）**        |
| 契約明瞭性     | 高                       | 中                     | **高（プロファイル表で明示）**     |
| テスト影響範囲 | 大                       | 大                     | **中（エラーメッセージ更新のみ）** |
| **総合評価**   | 長期最適だが短期リスク大 | 中間案だが成果が限定的 | **短期リスク最小で効果が高い**     |

---

## 2. 契約プロファイル定義（サマリー）

### 2.1 4つのプロファイル

| プロファイル  | 戻り値パターン                                             | Preload 関数          | チャネル数 |
| ------------- | ---------------------------------------------------------- | --------------------- | ---------- |
| **Profile-A** | `{ success: true, data: T }` / `{ success: false, error }` | `safeInvokeUnwrap<T>` | 16         |
| **Profile-B** | `T` 直接返却 / throw                                       | `safeInvoke<T>`       | 2          |
| **Profile-C** | `boolean` / `T \| null`                                    | `safeInvoke<T>`       | 2          |
| **Profile-D** | `void`                                                     | `safeInvoke<void>`    | 0          |

### 2.2 チャネル分類

**Profile-A（16チャネル）**: skill:list, skill:scan, skill:getImported, skill:get-detail, skill:execute, skill:analyze, skill:improve, skill:optimize, skill:optimize:variants, skill:optimize:evaluate, skill:readFile, skill:writeFile, skill:createFile, skill:deleteFile, skill:listBackups, skill:restoreBackup

**Profile-B（2チャネル）**: skill:import, skill:remove

**Profile-C（2チャネル）**: skill:abort, skill:get-status

---

## 3. 修正内容サマリー

### 3.1 コード変更

| 修正項目                  | 対象ファイル     | 変更箇所数               | 影響範囲                           |
| ------------------------- | ---------------- | ------------------------ | ---------------------------------- |
| sanitizeErrorMessage 適用 | skillHandlers.ts | 10箇所（catch ブロック） | エラーメッセージの内容変更のみ     |
| バリデーション throw 統一 | skillHandlers.ts | 3箇所（optimize 系）     | バリデーション失敗時の伝播方式変更 |
| abort コメント追加        | skill-api.ts     | 1箇所（JSDoc）           | ドキュメントのみ                   |

### 3.2 非コード変更

| 修正項目           | 対象                                 | 内容                 |
| ------------------ | ------------------------------------ | -------------------- |
| 契約プロファイル表 | outputs/phase-2/contract-profiles.md | 全20チャネルの分類表 |
| 設計書             | outputs/phase-2/design-document.md   | 本文書               |

---

## 4. sanitizeErrorMessage 設計

### 4.1 処理フロー（既知パターンマッチング方式）

```
error (unknown)
  |
  +-- log.error("[IPC Error] fallbackMessage:", error)  // サニタイズ前の完全なエラーをログ
  |
  +-- instanceof Error でない場合 --> fallbackMessage を返却
  |
  +-- instanceof Error の場合
        |
        +-- error.message を取得
        +-- KNOWN_ERROR_PATTERNS からパターンマッチング
        |     ENOENT/no such file    --> "ファイルが見つかりません"
        |     EACCES/permission denied --> "アクセス権限がありません"
        |     ENOSPC/no space        --> "ディスク容量が不足しています"
        |     ETIMEDOUT/timeout      --> "操作がタイムアウトしました"
        |     SKILL_NOT_FOUND        --> "スキルが見つかりません"
        |
        +-- パターン不一致の場合 --> fallbackMessage を返却
```

**設計方針**: skillFileHandlers.ts の `isKnownSkillFileError` パターンと同様に、既知のエラーをユーザー向けメッセージに変換し、未知のエラーは汎用フォールバックメッセージで一律サニタイズする。

### 4.2 実装

```typescript
import log from "electron-log";

const KNOWN_ERROR_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /ENOENT|no such file/i, message: "ファイルが見つかりません" },
  { pattern: /EACCES|permission denied/i, message: "アクセス権限がありません" },
  { pattern: /ENOSPC|no space/i, message: "ディスク容量が不足しています" },
  { pattern: /ETIMEDOUT|timeout/i, message: "操作がタイムアウトしました" },
  { pattern: /SKILL_NOT_FOUND/i, message: "スキルが見つかりません" },
];

export function sanitizeErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  const rawMessage = error instanceof Error ? error.message : String(error);
  log.error(`[IPC Error] ${fallbackMessage}:`, error);

  for (const { pattern, message } of KNOWN_ERROR_PATTERNS) {
    if (pattern.test(rawMessage)) {
      return message;
    }
  }

  return fallbackMessage;
}
```

### 4.3 適用箇所

```typescript
// 変更前（10チャネル共通パターン）
catch (error) {
  return {
    success: false,
    error: error instanceof Error ? error.message : "フォールバック",
  };
}

// 変更後
catch (error) {
  return {
    success: false,
    error: sanitizeErrorMessage(error, "フォールバック"),
  };
}
```

### 4.4 セキュリティ考慮

| 脅威                 | 対策                                 | sanitizeErrorMessage での処理                |
| -------------------- | ------------------------------------ | -------------------------------------------- |
| ファイルパス漏洩     | 未知エラーはフォールバックで一律返却 | `error.message` を直接 Renderer に送出しない |
| スタックトレース漏洩 | 同上                                 | 未知エラーは汎用メッセージで置換             |
| 機密情報漏洩         | 同上                                 | 既知パターン以外は全てフォールバック         |
| デバッグ情報保全     | サニタイズ前のログ出力               | `log.error` で完全なエラー情報をログに記録   |
| 内部サービス名漏洩   | 非 Error は汎用メッセージ            | `String(error)` は既知パターン以外は非送出   |

---

## 5. バリデーション throw 統一設計

### 5.1 AS-IS と TO-BE の差分

```typescript
// AS-IS（optimize 系 3チャネル）
if (typeof args?.prompt !== "string" || args.prompt.trim() === "") {
  return { success: false, error: "プロンプトが指定されていません" };
}

// TO-BE（他チャネルと統一）
if (typeof args?.prompt !== "string" || args.prompt.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "prompt must be a non-empty string",
  };
}
```

### 5.2 エラー伝播経路の変化

| 経路             | AS-IS                                         | TO-BE                              |
| ---------------- | --------------------------------------------- | ---------------------------------- |
| Main 側          | `return { success: false }` -- 正常レスポンス | `throw { code, message }` -- 例外  |
| Electron IPC     | レスポンスとして送出                          | エラーとしてシリアライズ           |
| safeInvokeUnwrap | `throw new Error(result.error)`               | Electron IPC がそのまま reject     |
| Renderer         | `catch(error)`                                | `catch(error)`                     |
| **最終結果**     | **同一: Renderer の catch に到達**            | **同一: Renderer の catch に到達** |

Renderer 到達時の挙動は同一であるため、Renderer 側のコード変更は不要。ただし、エラーオブジェクトの形状が微妙に異なる可能性がある（`Error.message` vs シリアライズされた `{ code, message }`）。

---

## 6. Preload 単一化設計（サマリー）

### 6.1 変更なし

既存の safeInvoke / safeInvokeUnwrap の使い分けは既にプロファイルに準拠している。

| 条件                               | Preload 関数       | 対応状況                      |
| ---------------------------------- | ------------------ | ----------------------------- |
| Main が `{ success, data }` を返す | `safeInvokeUnwrap` | 全 Profile-A チャネルで適合   |
| Main が直接返却する                | `safeInvoke`       | 全 Profile-B/C チャネルで適合 |

### 6.2 skill:abort の型不一致

- **現状**: `safeInvoke<void>` だが Main は `boolean` を返す
- **対応**: `safeInvoke<boolean>` に型パラメータを修正する（migration-steps.md Step 5 参照）
- **根拠**: Main 側が `boolean` を返却している事実を正確に型定義に反映する。Renderer 側は戻り値を使用していない（fire-and-forget パターン）ため影響なし

---

## 7. 型定義同期設計（サマリー）

### 7.1 変更不要

全 skill 関連型は `@repo/shared` から import されており、shared と Preload の型定義は一致している。本タスクでは型定義の変更を行わない。

### 7.2 P23/P32 リスク

**低**。型定義変更がないため、二重更新漏れのリスクは発生しない。

---

## 8. 移行計画（サマリー）

ハイブリッド方式を採用する。横断的変更（エラーサニタイズ）は一括適用し、チャネル固有の変更は Step 単位で段階的に移行する。

| Step | 対象                                 | リスク | 依存     | ロールバック容易性 |
| ---- | ------------------------------------ | ------ | -------- | ------------------ |
| 1    | sanitizeErrorMessage インフラ導入    | 低     | なし     | 高（ファイル削除） |
| 2    | skillHandlers エラーサニタイズ適用   | 中     | Step 1   | 高（git revert）   |
| 3    | optimize 系バリデーション throw 統一 | 中     | Step 2   | 高（git revert）   |
| 4    | improve バリデーション強化           | 低     | なし     | 高（git revert）   |
| 5    | abort Preload 型定義修正             | 低     | なし     | 高（型パラメータ） |
| 6    | file ハンドラ改善（オプション）      | 低     | なし     | 高（git revert）   |
| 7    | 契約プロファイル表の公式化           | なし   | Step 1-6 | 高（ドキュメント） |

依存関係図:

```
Step 1 → Step 2 → Step 3 → Step 7
Step 4 (独立)
Step 5 (独立)
Step 6 (独立)
```

詳細は `outputs/phase-2/migration-steps.md` を参照。

---

## 9. AR-1 ~ AR-7 準拠状況（TO-BE）

| AR-ID | 制約                                                     | TO-BE 判定 | 対応する設計要素                                |
| ----- | -------------------------------------------------------- | ---------- | ----------------------------------------------- |
| AR-1  | skill:import は skillName 受け取り、ImportedSkill を返す | **適合**   | Profile-B 分類で明示                            |
| AR-2  | safeInvokeUnwrap / safeInvoke の選択ルール               | **適合**   | Preload 単一化設計                              |
| AR-3  | validateIpcSender + P42 3段バリデーション                | **適合**   | 全14チャネルで実装済み + optimize 系 throw 統一 |
| AR-4  | Main 側入力検証と早期拒否                                | **適合**   | optimize 系 throw 統一で完全準拠                |
| AR-5  | 型同期（shared/preload）                                 | **適合**   | 型変更なし。既存の一致を維持                    |
| AR-6  | タスク参照整合                                           | **適合**   | 変更なし                                        |
| AR-7  | skill:remove 戻り値契約は RemoveResult                   | **適合**   | Profile-B 分類で明示                            |

---

## 10. 関連成果物一覧

| 成果物             | パス                                          | 状況     |
| ------------------ | --------------------------------------------- | -------- |
| 契約プロファイル表 | `outputs/phase-2/contract-profiles.md`        | 作成済み |
| Preload 単一化設計 | `outputs/phase-2/preload-unification-plan.md` | 作成済み |
| 型定義同期計画     | `outputs/phase-2/type-sync-plan.md`           | 作成済み |
| 移行手順           | `outputs/phase-2/migration-steps.md`          | 作成済み |
| 設計全体サマリー   | `outputs/phase-2/design-document.md`          | 本文書   |
