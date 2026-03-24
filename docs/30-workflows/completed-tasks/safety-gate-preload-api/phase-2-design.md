# Phase 2: 設計

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 2                          |
| 機能名   | safety-gate-preload-api    |
| タスクID | UT-06-003-PRELOAD-API-IMPL |
| 作成日   | 2026-03-23                 |
| 前提     | Phase 1 要件定義           |

## 目的

Phase 1 で定義した要件に基づき、`evaluateSafety` メソッドのインターフェース設計・実装設計を行う。

## 実行タスク

- アーキテクチャ設計: 通信チェーンと `safeInvoke` パターンの選択
- IPC 4層整合性チェック: チャンネル定義・ホワイトリスト・ハンドラ・Preload API の整合確認
- インターフェース設計: `SkillAPI` への `evaluateSafety` メソッド追加設計
- 型定義設計: レスポンス型と `IpcResult<T>` 非互換の解決
- Pitfall 対策設計: P23, P27, P42, P60, P61 への対策を明示
- テスト設計: テストケースとモック構成の設計

## 参照資料

| 資料名             | パス                                                 | 説明                     |
| ------------------ | ---------------------------------------------------- | ------------------------ |
| Phase 1 要件定義   | `phase-1-requirements.md`                            | FR/NFR/AC 定義           |
| skill-api.ts       | `preload/skill-api.ts`                               | 変更対象ファイル         |
| safetyGateHandlers | `main/ipc/safetyGateHandlers.ts`                     | Main ハンドラの応答形式  |
| 共有型定義         | `packages/shared/src/types/safety-gate.ts`           | SafetyGateResult 型      |
| IPC 契約チェック   | `references/ipc-contract-checklist.md`               | Phase 1-6 チェックリスト |
| 実装パターン       | `references/architecture-implementation-patterns.md` | safeInvoke パターン      |

## 実行手順

### ステップ 1: 通信チェーンの設計

```
Renderer                  Preload                    Main
   |                         |                         |
   |-- evaluateSafety() -->  |                         |
   |                         |-- safeInvoke() -------> |
   |                         |   (SKILL_EVALUATE_SAFETY)|
   |                         |                         |-- safetyGate.evaluate()
   |                         |                         |
   |                         |<-- { success, data } ---|
   |<-- SafetyGateResult ----|                         |
```

### ステップ 2: 設計判断 — `safeInvoke` vs `safeInvokeUnwrap`

| パターン           | 戻り値                                                     | エラーハンドリング        |
| ------------------ | ---------------------------------------------------------- | ------------------------- |
| `safeInvoke`       | `{ success: boolean, data?: T, error?: E }` をそのまま返す | Renderer 側で判定         |
| `safeInvokeUnwrap` | `T`（data を展開して返す）                                 | Error throw（Preload 内） |

**判断**: `safeInvoke` を使用する。

**理由**:

- SafetyGate の評価結果は「安全/警告/危険」を含む情報であり、`success: false` も正常な業務フローの一部
- `safeInvokeUnwrap` は `success: false` を Error throw するが、SafetyGate ではバリデーションエラーと評価結果の失敗を Renderer 側で区別する必要がある
- Renderer 側が `success`, `data`, `error` を個別にハンドリングできる方が柔軟

### ステップ 3: IPC 4層整合性チェック

| 層                | 確認内容                                    | ファイル                  | 状態               |
| ----------------- | ------------------------------------------- | ------------------------- | ------------------ |
| 1. 定数定義       | `IPC_CHANNELS.SKILL_EVALUATE_SAFETY` が存在 | `preload/channels.ts:371` | 完了               |
| 2. ホワイトリスト | `ALLOWED_INVOKE_CHANNELS` に登録済み        | `preload/channels.ts:647` | 完了               |
| 3. ハンドラ登録   | `ipcMain.handle` で処理                     | `safetyGateHandlers.ts`   | 完了               |
| 4. Preload API    | `contextBridge` 経由で公開                  | `preload/skill-api.ts`    | **本タスクで追加** |

### ステップ 4: レスポンス型設計

Main ハンドラの実際のレスポンス型:

```typescript
type EvaluateSafetyResponse =
  | { success: true; data: SafetyGateResult }
  | { success: false; error: { code: string; message: string } };
```

**`IpcResult<T>` との非互換**: 既存の `IpcResult<T>` は `error?: string` だが、SafetyGate ハンドラは `error?: { code: string; message: string }` を返す。インライン型定義で対応する。

Preload 層の `evaluateSafety` メソッドの戻り値型:

```typescript
evaluateSafety: (skillName: string) =>
  Promise<{
    success: boolean;
    data?: SafetyGateResult;
    error?: { code: string; message: string };
  }>;
```

### ステップ 5: インターフェース設計

```typescript
// apps/desktop/src/preload/skill-api.ts の SkillAPI interface に追加
import type { SafetyGateResult } from "@repo/shared";

export interface SkillAPI {
  // ... 既存メソッド ...

  // === SafetyGate API (UT-06-003-PRELOAD-API-IMPL) ===
  evaluateSafety: (skillName: string) => Promise<{
    success: boolean;
    data?: SafetyGateResult;
    error?: { code: string; message: string };
  }>;
}
```

### ステップ 6: 実装設計

```typescript
// apps/desktop/src/preload/skill-api.ts の skillAPI object に追加
evaluateSafety: (skillName: string) =>
  safeInvoke(IPC_CHANNELS.SKILL_EVALUATE_SAFETY, skillName),
```

### ステップ 7: Pitfall 対策設計

| Pitfall | 対策                                                                           |
| ------- | ------------------------------------------------------------------------------ |
| P23     | `SafetyGateResult` は `@repo/shared` から import。Preload 層に独自型定義しない |
| P27     | `safeInvoke` の第1引数は `IPC_CHANNELS.SKILL_EVALUATE_SAFETY` 定数を使用       |
| P42     | `skillName` の型チェックは Main 側で3段バリデーション実施済み                  |
| P60     | Main ハンドラのラップ形式を確認済み。`safeInvoke` でそのまま返す               |
| P61     | Main 側が `SafetyGatePort` インターフェースに依存済み。Preload 層は影響なし    |

### ステップ 8: テスト設計

| ID  | テスト内容                                                                      | カテゴリ         |
| --- | ------------------------------------------------------------------------------- | ---------------- |
| T-1 | `evaluateSafety` が `IPC_CHANNELS.SKILL_EVALUATE_SAFETY` で `safeInvoke` を呼ぶ | 正常系           |
| T-2 | `skillName` 引数が正しく `safeInvoke` に渡される                                | 正常系           |
| T-3 | 戻り値の型が `{ success, data, error }` 形式                                    | 正常系           |
| T-4 | チャンネルがホワイトリストに含まれることを確認                                  | セキュリティ     |
| T-5 | `evaluateSafety` プロパティが `SkillAPI` に存在する                             | インターフェース |
| T-6 | `invokeWithTimeout` のエラーが伝搬する                                          | 異常系           |

### ステップ 9: IPC ハンドラ設計確認項目

- [x] IPC ハンドラの依存先が Port/Interface であること — Main 側は `SafetyGatePort` に依存（P61準拠）
- [x] IPC レスポンス形式（ラップ形式）を設計時点で明示的に決定済み

## 統合テスト連携

| 確認項目         | 内容                                   | 設計での対応                    |
| ---------------- | -------------------------------------- | ------------------------------- |
| IPC 通信チェーン | Renderer -> Preload -> Main の往復通信 | 通信チェーン図を作成            |
| 型整合性         | `SafetyGateResult` が全層で一致        | `@repo/shared` からの共有を設計 |
| レスポンス形式   | ラップ形式の一貫性                     | `IpcResult<T>` 非互換を文書化   |
| テスト設計       | T-1〜T-6 の6テストケース               | テスト設計テーブルを作成        |

## 多角的チェック観点（AIが判断）

| 観点               | 適用 | 確認内容                                               |
| ------------------ | ---- | ------------------------------------------------------ |
| セキュリティ       | 該当 | safeInvoke + ホワイトリスト + Main 側3段バリデーション |
| API設計            | 該当 | SkillAPI インターフェースへのメソッド追加設計          |
| アーキテクチャ     | 該当 | IPC 4層整合性チェック完了                              |
| エラーハンドリング | 該当 | ラップ形式と IpcResult<T> 非互換の解決                 |
| IPC通信            | 該当 | safeInvoke パターンの選択根拠を文書化                  |

## サブタスク管理

1. 参照資料の確認
2. 通信チェーンの設計
3. safeInvoke vs safeInvokeUnwrap の判断
4. IPC 4層整合性チェック
5. レスポンス型設計（IpcResult<T> 非互換対応）
6. インターフェース + 実装設計
7. Pitfall 対策設計
8. テスト設計
9. 完了条件の検証

## 成果物

| 成果物 | パス                                                          | 説明           |
| ------ | ------------------------------------------------------------- | -------------- |
| 設計書 | `docs/30-workflows/safety-gate-preload-api/phase-2-design.md` | 本ドキュメント |

## 完了条件

- [x] 通信チェーン図が作成されている
- [x] `safeInvoke` vs `safeInvokeUnwrap` の判断と根拠が記録されている
- [x] IPC 4層整合性チェックテーブルが完了している
- [x] レスポンス型設計と `IpcResult<T>` 非互換の文書化が完了している
- [x] `SkillAPI` インターフェースの設計が完了している
- [x] Pitfall 対策（P23, P27, P42, P60, P61）が明示されている
- [x] テスト設計（T-1〜T-6）が完了している
- [x] IPC ハンドラ設計確認項目がチェックされている
- [x] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 3: 設計レビュー
