# 要件定義書: skill IPC レスポンス一貫性

> **Phase 1 Task 1-5 成果物**
> **作成日**: 2026-02-27
> **タスク**: UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001
> **入力**: contract-matrix.md, preload-mapping.md, renderer-expectations.md, as-is-gap-analysis.md

---

## 1. スコープ

### 1.1 対象範囲

skillHandlers.ts の14チャネルを主対象とし、skillFileHandlers.ts の6チャネルを副次対象とする IPC 契約統一タスク。

| 対象ファイル                                     | チャネル数 | 優先度     |
| ------------------------------------------------ | ---------- | ---------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts`     | 14         | 主対象     |
| `apps/desktop/src/main/ipc/skillFileHandlers.ts` | 6          | 副次対象   |
| `apps/desktop/src/preload/skill-api.ts`          | 19メソッド | 型定義修正 |

### 1.2 14チャネル一覧（skillHandlers.ts）

| #   | チャネル                  | AS-IS パターン                                           | TO-BE プロファイル |
| --- | ------------------------- | -------------------------------------------------------- | ------------------ |
| 1   | `skill:list`              | ラッパー返却(W) + raw エラー                             | Profile-A          |
| 2   | `skill:scan`              | ラッパー返却(W) + raw エラー                             | Profile-A          |
| 3   | `skill:getImported`       | ラッパー返却(W) + raw エラー + log.error                 | Profile-A          |
| 4   | `skill:import`            | 直接返却(D) + throw                                      | Profile-B          |
| 5   | `skill:remove`            | 直接返却(D) + throw                                      | Profile-B          |
| 6   | `skill:get-detail`        | ラッパー返却(W) + raw エラー                             | Profile-A          |
| 7   | `skill:execute`           | ラッパー返却(W) + raw エラー                             | Profile-A          |
| 8   | `skill:abort`             | プリミティブ返却(P) boolean                              | Profile-C          |
| 9   | `skill:get-status`        | プリミティブ返却(P/D) null許容                           | Profile-C          |
| 10  | `skill:analyze`           | ラッパー返却(W) + raw エラー                             | Profile-A          |
| 11  | `skill:improve`           | ラッパー返却(W) + raw エラー                             | Profile-A          |
| 12  | `skill:optimize`          | ラッパー返却(W) + **return バリデーション** + raw エラー | Profile-A          |
| 13  | `skill:optimize:variants` | ラッパー返却(W) + **return バリデーション** + raw エラー | Profile-A          |
| 14  | `skill:optimize:evaluate` | ラッパー返却(W) + **return バリデーション** + raw エラー | Profile-A          |

### 1.3 スコープ外

| 対象                                            | 除外理由                                                               |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| `skill:get-detail` の Preload API 追加          | ハンドラが Renderer から呼ばれていない（デッドコード）。別タスクで対応 |
| `SkillExecutionResponse.success` フィールド除去 | 後方互換性の破壊リスクが高い。ドキュメント明記で対応                   |
| `RemoveResult.success` フィールド名変更         | 既存型契約の変更リスク。プロファイル分類で対応                         |
| `OperationResult<T>` ラッパーの廃止             | P25 波及影響リスク。別タスクで対応                                     |
| `skillCreatorHandlers.ts`                       | 本タスクは `skill:` プレフィックスチャネルのみ                         |

---

## 2. 要件一覧

### FR-01: optimize 系バリデーション統一（return から throw へ）

| 項目             | 内容                                                                                                                                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **対象チャネル** | `skill:optimize`, `skill:optimize:variants`, `skill:optimize:evaluate`                                                                                                                                                       |
| **AS-IS**        | バリデーション失敗時に `return { success: false, error: "プロンプトが指定されていません" }` で返却                                                                                                                           |
| **TO-BE**        | バリデーション失敗時に `throw { code: "VALIDATION_ERROR", message: "prompt must be a non-empty string" }` で返却                                                                                                             |
| **根拠**         | `skill:import`, `skill:remove`, `skill:execute`, `skill:abort`, `skill:get-status`, `skill:get-detail`, `skill:analyze`, `skill:improve` の全てが throw パターンを使用。optimize 系3チャネルのみ return パターンであり不統一 |
| **影響範囲**     | skillHandlers.ts L460-461, L492-493, L527-528 の3箇所。Preload 側は `safeInvokeUnwrap` で受け取るため、return `{ success: false }` は `safeInvokeUnwrap` 内で throw に変換されており、Renderer 到達時の挙動に変化なし        |
| **テスト影響**   | バリデーションエラー時の Main 側挙動テストの期待値更新が必要                                                                                                                                                                 |

### FR-02: sanitizeErrorMessage 全 catch 適用

| 項目                            | 内容                                                                                                                                                                                                             |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **対象チャネル**                | `skill:list`, `skill:scan`, `skill:getImported`, `skill:get-detail`, `skill:execute`, `skill:analyze`, `skill:improve`, `skill:optimize`, `skill:optimize:variants`, `skill:optimize:evaluate`（合計10チャネル） |
| **AS-IS**                       | `error instanceof Error ? error.message : "フォールバックメッセージ"` パターンで `error.message` を直接 Renderer に返却。内部情報（ファイルパス、スタックトレース、サービス名）の漏洩リスク                      |
| **TO-BE**                       | `sanitizeErrorMessage(error)` 関数を全 catch ブロックに適用。既に skillHandlers.ts の先頭に `sanitizeErrorMessage` 関数が定義済み（L46-59）だが、実際の catch ブロックでは使用されていない                       |
| **sanitizeErrorMessage の処理** | (1) スタックトレース除去 (2) Unix/Windows パス置換 `[path]` (3) 機密情報マスク `$1=***` (4) 非 Error オブジェクトは汎用メッセージ                                                                                |
| **根拠**                        | `04-electron-security.md` の「エラーはサニタイズしてから Renderer に送る -- 内部情報を漏洩しない」原則。skillFileHandlers.ts は `isKnownSkillFileError` でサニタイズ済み                                         |
| **テスト影響**                  | エラーメッセージの期待値更新（サニタイズ後メッセージへの変更）                                                                                                                                                   |

### FR-03: Preload API 型整合（skill:abort の void/boolean 不一致確認）

| 項目             | 内容                                                                                                                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **対象チャネル** | `skill:abort`                                                                                                                                                                                                     |
| **AS-IS**        | Main 側は `boolean` を返却（`return false` / `return _skillExecutorInstance.abort(executionId)`）。Preload 型定義は `safeInvoke<void>` で `Promise<void>`                                                         |
| **TO-BE**        | Preload 型定義を `Promise<boolean>` に修正するか、Main 側を `void` 返却に変更                                                                                                                                     |
| **推奨**         | Renderer 側が戻り値を使用していない（fire-and-forget パターン）ため、Preload 型定義の修正のみで対応。`safeInvoke<void>` を維持し、Main 側の boolean 返却は実害なしとして許容。ドキュメントで Profile-C として明記 |
| **影響範囲**     | `skill-api.ts` L53 の型定義（任意）、`skill-api.ts` L231 の実装（任意）                                                                                                                                           |

### FR-04: 契約ドリフト検出テスト

| 項目               | 内容                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **目的**           | 将来の契約変更時に不整合を早期検出するテストを追加                                                                                                                       |
| **テスト内容**     | (1) 全14チャネルの validateIpcSender 呼び出し検証 (2) バリデーション失敗時の throw 統一検証 (3) sanitizeErrorMessage 適用検証 (4) Profile 分類に基づくレスポンス形式検証 |
| **カバレッジ基準** | Line 80%以上、Branch 60%以上、Function 80%以上                                                                                                                           |

---

## 3. 受入基準

### AC-01: P42 3段バリデーション

全14チャネルの文字列引数に対して、以下の3段バリデーションが適用されていること。

```typescript
// P42準拠: 3段バリデーション
if (typeof param !== "string" || param.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "param must be a non-empty string",
  };
}
```

| チャネル                | 対象引数                      | 現状             | 判定             |
| ----------------------- | ----------------------------- | ---------------- | ---------------- |
| skill:import            | skillName                     | 3段 + throw      | 適合             |
| skill:remove            | skillName                     | 3段 + throw      | 適合             |
| skill:get-detail        | args.skillId                  | 3段 + throw      | 適合             |
| skill:execute           | args.skillName / args.skillId | 3段 + throw      | 適合             |
| skill:abort             | executionId                   | 3段 + throw      | 適合             |
| skill:get-status        | executionId                   | 3段 + throw      | 適合             |
| skill:analyze           | args.skillName                | 3段 + throw      | 適合             |
| skill:improve           | args.skillName                | 3段 + throw      | 適合             |
| skill:optimize          | args.prompt                   | 3段 + **return** | **FR-01 で修正** |
| skill:optimize:variants | args.prompt                   | 3段 + **return** | **FR-01 で修正** |
| skill:optimize:evaluate | args.prompt                   | 3段 + **return** | **FR-01 で修正** |
| skill:list              | なし（引数オプショナル）      | N/A              | 適合             |
| skill:scan              | なし（引数なし）              | N/A              | 適合             |
| skill:getImported       | なし（引数なし）              | N/A              | 適合             |

### AC-02: エラーサニタイゼーション

skillHandlers.ts の全10チャネル（ラッパー返却型で catch ブロックを持つチャネル）で `sanitizeErrorMessage` が適用されていること。

| チャネル                | 現状                     | TO-BE                         |
| ----------------------- | ------------------------ | ----------------------------- |
| skill:list              | `error.message` 直接使用 | `sanitizeErrorMessage(error)` |
| skill:scan              | `error.message` 直接使用 | `sanitizeErrorMessage(error)` |
| skill:getImported       | `error.message` 直接使用 | `sanitizeErrorMessage(error)` |
| skill:get-detail        | `error.message` 直接使用 | `sanitizeErrorMessage(error)` |
| skill:execute           | `error.message` 直接使用 | `sanitizeErrorMessage(error)` |
| skill:analyze           | `error.message` 直接使用 | `sanitizeErrorMessage(error)` |
| skill:improve           | `error.message` 直接使用 | `sanitizeErrorMessage(error)` |
| skill:optimize          | `error.message` 直接使用 | `sanitizeErrorMessage(error)` |
| skill:optimize:variants | `error.message` 直接使用 | `sanitizeErrorMessage(error)` |
| skill:optimize:evaluate | `error.message` 直接使用 | `sanitizeErrorMessage(error)` |

### AC-03: 14チャネル全ての validateIpcSender

全14チャネルで `validateIpcSender` + `toIPCValidationError` が実装されていること。

**現状**: 全14チャネルで実装済み。受入基準は既に充足。

### AC-04: 契約プロファイル分類完了

全20チャネル（14 + 6）が Profile-A/B/C/D のいずれかに分類され、プロファイル表が文書化されていること。

---

## 4. AR制約準拠状況

| AR-ID | 制約                                                                          | 現状判定     | TO-BE判定 | 対応する FR |
| ----- | ----------------------------------------------------------------------------- | ------------ | --------- | ----------- |
| AR-1  | `skill:import` は `skillName: string` 受け取り、`ImportedSkill` を返す        | **適合**     | 適合      | -           |
| AR-2  | `{ success, data }` 系は `safeInvokeUnwrap`、直接返却系は `safeInvoke` を選択 | **部分適合** | 適合      | FR-03       |
| AR-3  | `validateIpcSender` + 文字列 `.trim()` 非空検証を全ハンドラで実施             | **適合**     | 適合      | AC-01       |
| AR-4  | IPC 入力検証を Main 側で行い、不正入力を早期拒否                              | **部分適合** | 適合      | FR-01       |
| AR-5  | 型同期（shared/preload）・仕様同期・テスト検証を必須で実施                    | **適合**     | 適合      | FR-03       |
| AR-6  | タスク ID と指示書パスの参照整合を維持                                        | **適合**     | 適合      | -           |
| AR-7  | `skill:remove` の戻り値契約は `RemoveResult`、Preload 側型と乖離させない      | **部分適合** | 適合      | AC-04       |

---

## 5. 非機能要件

### NFR-1: 後方互換性

| 制約                   | 内容                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------- |
| Renderer 側            | 既存の Renderer コードの戻り値解釈パターンを変更しない。Preload 層で差分を吸収する |
| テスト                 | 既存テストの期待値変更は最小限に抑える。エラーメッセージの期待値変更のみ許容       |
| SkillExecutionResponse | `success` フィールドは維持。ドキュメントで二重 success の意味を明記する            |

### NFR-2: セキュリティ

| 制約               | 内容                                                                         |
| ------------------ | ---------------------------------------------------------------------------- |
| エラーサニタイズ   | 全ハンドラのエラーメッセージが Renderer に送出される前にサニタイズされること |
| validateIpcSender  | 全ハンドラで送信元検証が実施されること（現状維持）                           |
| P42 バリデーション | 文字列引数の3段バリデーションが全ハンドラで実施されること                    |

### NFR-3: パフォーマンス

| 制約           | 内容                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| サニタイズ処理 | 同期処理（正規表現マッチ）で実装し、IPC レスポンス遅延を最小化。sanitizeErrorMessage は4つの正規表現置換のみ |
| 既存パス       | 正常系の処理パスに変更を加えない                                                                             |

### NFR-4: テスト

| 制約           | 内容                                                        |
| -------------- | ----------------------------------------------------------- |
| カバレッジ基準 | Line 80%以上、Branch 60%以上、Function 80%以上を維持        |
| テスト変更範囲 | エラーメッセージ期待値の更新、バリデーション throw 対応のみ |

---

## 6. 移行制約

### MC-1: 段階的移行

| ステップ | 対象                                              | 理由                                                           |
| -------- | ------------------------------------------------- | -------------------------------------------------------------- |
| Step 1   | sanitizeErrorMessage 全 catch 適用（10チャネル）  | 全チャネルに横断的に適用可能。既存の戻り値パターンを変更しない |
| Step 2   | optimize 系バリデーション throw 統一（3チャネル） | ラッパー返却 + return パターンを throw に変更。影響が限定的    |
| Step 3   | skill:abort 型定義修正（1チャネル）               | Preload 型定義の確認のみ。Main 側の変更は不要                  |
| Step 4   | 契約プロファイル表の公式化                        | ドキュメント作成のみ。コード変更なし                           |

### MC-2: ロールバック方針

各ステップは独立してコミット可能であり、問題が発生した場合は該当ステップのみを revert する。

### MC-3: P23/P32 準拠

型定義を変更する場合は、`packages/shared` と `apps/desktop/src/preload` の両方を同一コミットで更新する。

---

## 7. 成功指標

| 指標                             | 基準値                                                           | 検証方法                 |
| -------------------------------- | ---------------------------------------------------------------- | ------------------------ |
| 全チャネルのプロファイル分類完了 | 20/20                                                            | 契約プロファイル表の突合 |
| エラーメッセージサニタイズ適用率 | 10/10（skillHandlers.ts の raw パターン全て）                    | コードレビュー + テスト  |
| バリデーション throw 統一率      | 3/3（optimize 系）                                               | コードレビュー + テスト  |
| 型定義不一致の解消               | 0 件                                                             | `pnpm typecheck` 成功    |
| テスト全 PASS                    | 100%                                                             | `pnpm test` 実行         |
| セキュリティ原則準拠             | 全ハンドラで validateIpcSender + サニタイズ + P42 バリデーション | セキュリティレビュー     |

---

## 8. 不整合ギャップ一覧（as-is-gap-analysis.md からの引用）

### Critical

| ID   | 対象                     | 不整合                                                 |
| ---- | ------------------------ | ------------------------------------------------------ |
| G-01 | 10チャネル（ラッパー型） | エラーメッセージ未サニタイズ: `error.message` 直接返却 |

### High

| ID   | 対象                                                      | 不整合                                             |
| ---- | --------------------------------------------------------- | -------------------------------------------------- |
| G-02 | skill:import, skill:remove, skill:abort, skill:get-status | ラッパー不使用（直接返却）によるレスポンス形式混在 |
| G-03 | skill:abort                                               | Main 側 `boolean` vs Preload 型 `Promise<void>`    |

### Medium

| ID   | 対象                           | 不整合                                                     |
| ---- | ------------------------------ | ---------------------------------------------------------- |
| G-04 | optimize 系3チャネル           | バリデーション失敗時 return（throw ではない）              |
| G-05 | skillFileHandlers.ts 6チャネル | バリデーション失敗時 return（throw ではない）              |
| G-06 | skill:execute                  | 二重 success パターン                                      |
| G-07 | skill:remove                   | RemoveResult.success と IpcResult.success の同名混同リスク |
| G-08 | skill:improve                  | analysis 引数の型チェック不足                              |

### Low

| ID   | 対象                           | 不整合                                        |
| ---- | ------------------------------ | --------------------------------------------- |
| G-09 | skillFileHandlers.ts 4チャネル | 成功レスポンスに data フィールドなし          |
| G-10 | skill:get-detail               | Preload API に対応メソッドなし                |
| G-11 | useSkillExecution.ts           | response.success === false 分岐がデッドコード |
| G-12 | skill:getImported              | log.error が他チャネルにない                  |

---

## 9. Phase 2 への入力サマリー

| 設計項目             | 入力情報                                                                      |
| -------------------- | ----------------------------------------------------------------------------- |
| 契約プロファイル定義 | 不整合パターン分類（パターン1-4）、チャネル別の戻り値/Preload/Renderer 対応表 |
| Preload 単一化設計   | safeInvoke/safeInvokeUnwrap の使い分け現状マッピング、型定義の同期状況        |
| 型定義同期計画       | AR-5 適合状況、P23/P32 準拠の更新手順                                         |
| 移行ステップ設計     | 移行制約（MC-1 ~ MC-3）、優先度別不整合一覧（G-01 ~ G-12）                    |
| 統合設計書           | 方針C の具体的な適用計画、AS-IS から TO-BE への変換ルール                     |

---

## 10. 関連タスク・Pitfall 参照

| 参照                                | 内容                                                       |
| ----------------------------------- | ---------------------------------------------------------- |
| P23                                 | API 二重定義の型管理複雑性                                 |
| P32                                 | 型定義の二箇所同時更新必須                                 |
| P42                                 | 文字列引数の `.trim()` バリデーション漏れ                  |
| P44                                 | skill:import/remove IPC インターフェース不整合（解決済み） |
| P45                                 | IPC 引数命名の契約ドリフト（解決済み）                     |
| UT-FIX-SKILL-IMPORT-INTERFACE-001   | skill:import インターフェース修正（完了）                  |
| UT-FIX-SKILL-REMOVE-INTERFACE-001   | skill:remove インターフェース修正（完了）                  |
| UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 | skill:import 戻り値型修正（完了）                          |
