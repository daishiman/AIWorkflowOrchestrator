# Phase 1: 要件定義 — TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001

## メタ情報

| 項目     | 値                                              |
| -------- | ----------------------------------------------- |
| Phase    | 1                                               |
| タスクID | TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 |
| 機能名   | ut-rt-01-execute-improve-adapter-guard-001      |
| 作成日   | 2026-04-04                                      |

## 目的

`RuntimeSkillCreatorFacade` の `execute()` と `improve()` に `_llmAdapterStatus` チェックを追加するための要件を確定する。`plan()` での既実装パターンを基準とし、各メソッドの返却型に適合したエラーレスポンス型を設計する。

## 実行タスク

### Task 1-0: P50チェック（既実装状態の調査）

- `RuntimeSkillCreatorFacade.ts` の `plan()` メソッドで実装済みのステータスチェックパターンを確認する（L763-782 付近）
- `_executeInternal()` と `improve()` にガードが未実装であることを確認する
- `RuntimeSkillCreatorExecuteResponse` と `RuntimeSkillCreatorImproveResponse` の型定義を確認する（`packages/shared/src/types/skillCreator.ts`）
- `adapter-status.test.ts` の T-COMPAT-02 テストが `improve()` の挙動を確認していることを把握する

**現行コードの命名規則分析**:

| 種別               | パターン                              | 例                                        |
| ------------------ | ------------------------------------- | ----------------------------------------- |
| エラーコード       | `snake_case` 文字列                   | `"llm_adapter_unavailable"`               |
| エラーレスポンス型 | `RuntimeSkillCreatorXxxErrorResponse` | `RuntimeSkillCreatorImproveErrorResponse` |
| ステータス変数     | `_llmAdapterStatus`                   | `"initializing" \| "ready" \| "failed"`   |
| actionable 変換    | `toActionableMessage(reason)`         | APIキー系→日本語メッセージ                |

### Task 1-1: 現行実装の差分調査

`plan()` 実装済みチェック（参照パターン）:

```typescript
// 実装済み: plan() 先頭（L763-782）
if (this._llmAdapterStatus === "failed") {
  return {
    success: false,
    error: {
      code: "llm_adapter_unavailable",
      message: toActionableMessage(this._llmAdapterFailureReason),
    },
  };
}
if (this._llmAdapterStatus === "initializing") {
  return {
    success: false,
    error: {
      code: "llm_adapter_unavailable",
      message: "LLMAdapter の初期化中です。しばらくお待ちください",
    },
  };
}
```

未実装箇所:

| メソッド             | 実装場所                           | 現状                                                                                     |
| -------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| `_executeInternal()` | `resolveDecision()` 呼び出しより前 | ガードなし                                                                               |
| `improve()`          | `resolveDecision()` 呼び出しより前 | ガードなし（`!this.llmAdapter` チェックは存在するが `_llmAdapterStatus` チェックはなし） |

### Task 1-2: 返却型の分析

| メソッド    | 現在の返却型                         | エラーサポート                                               |
| ----------- | ------------------------------------ | ------------------------------------------------------------ |
| `plan()`    | `RuntimeSkillCreatorPlanResponse`    | `RuntimeSkillCreatorPlanErrorResponse` を union に持つ       |
| `improve()` | `RuntimeSkillCreatorImproveResponse` | `RuntimeSkillCreatorImproveErrorResponse` を union に持つ ✅ |
| `execute()` | `RuntimeSkillCreatorExecuteResponse` | エラー union なし ⚠️ → 新型追加が必要                        |

`RuntimeSkillCreatorExecuteResponse` の現在の定義:

```typescript
export type RuntimeSkillCreatorExecuteResponse =
  | RuntimeSkillCreatorExecuteResult
  | { type: "terminal_handoff"; bundle: TerminalHandoffBundle };
```

### Task 1-3: 機能要件定義

| ID   | 要件                                                                                    |
| ---- | --------------------------------------------------------------------------------------- |
| FR-1 | `_executeInternal()` は `_llmAdapterStatus === "failed"` 時に早期 return する           |
| FR-2 | `_executeInternal()` は `_llmAdapterStatus === "initializing"` 時に早期 return する     |
| FR-3 | `improve()` は `_llmAdapterStatus === "failed"` 時に早期 return する                    |
| FR-4 | `improve()` は `_llmAdapterStatus === "initializing"` 時に早期 return する              |
| FR-5 | エラーメッセージは `toActionableMessage()` を経由し、APIキー系エラーを日本語化する      |
| FR-6 | `RuntimeSkillCreatorExecuteErrorResponse` 型を新設し、execute の返却型 union に追加する |
| FR-7 | 既存のアダプター null チェック（`!this.llmAdapter`）は削除しない（別ガード）            |

### Task 1-4: 受入基準定義

| ID   | 受入基準                                                                                                                                            |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | `execute()` が `_llmAdapterStatus === "failed"` 時に `{ success: false, error: { code: "llm_adapter_unavailable", message: <actionable> } }` を返す |
| AC-2 | `execute()` が `_llmAdapterStatus === "initializing"` 時に上記と同構造・初期化中メッセージを返す                                                    |
| AC-3 | `improve()` が `_llmAdapterStatus === "failed"` 時に同様のエラーを返す                                                                              |
| AC-4 | `improve()` が `_llmAdapterStatus === "initializing"` 時に同様のエラーを返す                                                                        |
| AC-5 | APIキー系エラー理由で `failed` の場合、メッセージが「APIキーを設定してください」になる                                                              |
| AC-6 | `status === "ready"` では既存の `execute()` / `improve()` の動作に変化がない                                                                        |
| AC-7 | `RuntimeSkillCreatorExecuteErrorResponse` が TypeScript コンパイルエラーなしでエクスポートされる                                                    |

### Task 1-5: エッジケース洗い出し

| ケース | 説明                                                                     | 対応                                               |
| ------ | ------------------------------------------------------------------------ | -------------------------------------------------- |
| E-1    | `failed` → `setLLMAdapter()` リカバリー後に `execute()` を呼ぶ           | "ready" に遷移後は正常実行                         |
| E-2    | `failed` 理由が null の場合                                              | `toActionableMessage(null)` → デフォルトメッセージ |
| E-3    | `initializing` 中に `execute()` を並列呼び出し                           | 全て即座にエラーを返す（待機しない）               |
| E-4    | `improve()` で空の skillName が渡される場合                              | ステータスチェック → バリデーションの順に評価      |
| E-5    | `verifyAndImproveLoop()` 内で `improve()` が "initializing" エラーを返す | ループが `finalStatus: "error"` で終了する         |

## 参照資料

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `packages/shared/src/types/skillCreator.ts`（L749: `RuntimeSkillCreatorImproveErrorResponse`, L787: `RuntimeSkillCreatorExecuteResponse`）
- `packages/shared/src/types/index.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.adapter-status.test.ts`
- `docs/30-workflows/unassigned-task/task-ut-rt-01-execute-improve-adapter-guard-001.md`

## 成果物

- Phase 1 要件定義書（本ファイル）
- 現行実装の差分調査結果
- 機能要件 FR-1〜FR-7
- 受入基準 AC-1〜AC-7
- エッジケース E-1〜E-5

## 完了条件

- [x] `plan()` の既実装パターンを確認し記録した
- [x] `execute()` / `improve()` にガードが未実装であることを確認した
- [x] `RuntimeSkillCreatorExecuteResponse` に型追加が必要と判定した
- [x] FR-1〜FR-7 の機能要件が定義された
- [x] AC-1〜AC-7 の受入基準が定義された
- [x] エッジケースが5件以上洗い出された

## 次のPhase

Phase 2: 設計
