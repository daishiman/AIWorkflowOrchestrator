# Phase 1: 要件定義書

## タスクID: TASK-SDK-04-U1-F1

## 概要

`createVerificationReviewRequest()` が `free_text` kind のままであるため、
`applyVerificationReviewTransition()` の遷移ロジックへ到達できない状態を解消する。

---

## 1. 機能要件

### FR-1: kind 変更

| ID   | 要件                                                                              |
| ---- | --------------------------------------------------------------------------------- |
| FR-1 | `createVerificationReviewRequest()` が `kind: "single_select"` を返すこと         |
| FR-2 | `options` に `approve` / `improve` / `reject` の3つの選択肢が含まれること         |
| FR-3 | 各 option の `id` が `applyVerificationReviewTransition()` の期待値と一致すること |

### FR-2: テスト更新

| ID   | 要件                                                                                                |
| ---- | --------------------------------------------------------------------------------------------------- |
| FR-4 | verification_review 関連テストの submission が `selectedOptionId` のみを使用すること                |
| FR-5 | `validateUserInputSubmission` が `selectedOptionId` の不正値（null/undefined/空文字）を拒否すること |

---

## 2. 非機能要件

| ID    | 要件                                                                               |
| ----- | ---------------------------------------------------------------------------------- |
| NFR-1 | Main Process 内の変更のみ（IPC/Preload/Renderer 変更なし）                         |
| NFR-2 | TypeScript の型エラーが発生しないこと（typecheck 0 errors）                        |
| NFR-3 | `verification_review` の未知 option は no-op fallback として許容する（後方互換性） |

---

## 3. 現行実装の確認結果

### createVerificationReviewRequest() の現状（調査日: 2026-04-06）

`apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` を確認した結果:

- **実装状態**: `kind: "single_select"` 、options（approve/improve/reject）は **既に実装済み**
- `recordExecutionFailure()` と `recordVerifyFailure()` の両方から呼ばれている
- `applyVerificationReviewTransition()` は `selectedOptionId`（approve/improve/reject）で判定

### テストファイルの現状

`apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` を確認:

- TC-MOD-1〜3: `textValue` と `selectedOptionId` が **両方**含まれている（`textValue` 削除が必要）
- NFR-3テスト: `textValue` が含まれている（削除が必要）
- Phase_transition テスト（approve）: `textValue` が含まれている（削除が必要）
- TC-NEW-1〜3: 未追加

---

## 4. 変更スコープ

### 変更対象ファイル

| ファイル                                                                              | 変更種別 | 変更内容                                                        |
| ------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` | 修正     | `textValue` 削除、TC-NEW-1〜3 追加、TC-ADD-1〜5 追加（Phase 6） |

### 変更不要ファイル

| ファイル                                                               | 理由                              |
| ---------------------------------------------------------------------- | --------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | 実装済み（kind: "single_select"） |
| `packages/shared/src/types/skillCreator.ts`                            | `single_select` 型が既に定義済み  |

---

## 5. 型定義確認結果

`packages/shared/src/types/skillCreator.ts` で以下を確認:

```typescript
export type SkillCreatorUserInputKind =
  | "single_select" // ← 定義済み
  | "multi_select"
  | "free_text"
  | "secret"
  | "confirm";

export interface SkillCreatorUserInputOption {
  id: string;
  label: string;
  description?: string;
}
```

`single_select` と `SkillCreatorUserInputOption` は既に型定義済み。

---

## 6. 依存関係

| 依存タスク     | 状態 | 説明                                           |
| -------------- | ---- | ---------------------------------------------- |
| TASK-SDK-04-U1 | 完了 | `applyVerificationReviewTransition()` 実装済み |

---

## 実行記録

- P50チェック（既実装状態の調査）: 完了
- 要件抽出: 完了
- 受け入れ基準定義: 完了（AC-1〜AC-4）
- 依存確認: 完了
- 命名規則確認: camelCase/describe-it 構造で定義
