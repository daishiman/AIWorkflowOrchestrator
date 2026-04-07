# Phase 2: テスト戦略

## タスクID: TASK-SDK-04-U1-F1

## テスト変更方針

### 既存テストの変更方針

| 変更前（free_text 残留）                 | 変更後（single_select 対応）   |
| ---------------------------------------- | ------------------------------ |
| `textValue: "Looks good, approved"`      | 削除（single_select では不要） |
| `textValue: "Please improve..."`         | 削除（single_select では不要） |
| `textValue: "This approach is wrong..."` | 削除（single_select では不要） |
| `textValue: "some feedback"`             | 削除（single_select では不要） |
| `textValue: "Approved"`                  | 削除（single_select では不要） |

### 変更対象テスト（TC-MOD）

| TC-ID    | テスト名                                                                | 変更箇所                     |
| -------- | ----------------------------------------------------------------------- | ---------------------------- |
| TC-MOD-1 | `verification_review approve → verifyResult.nextAction が handoff`      | `textValue` 削除             |
| TC-MOD-2 | `verification_review improve → verifyResult.nextAction が improve`      | `textValue` 削除             |
| TC-MOD-3 | `verification_review reject → currentPhase が plan に遷移`              | `textValue` 削除             |
| TC-MOD-4 | `verification_review で未知の selectedOptionId は no-op フォールバック` | `textValue` 削除             |
| TC-MOD-5 | `phase 遷移なしの場合は phase_transition artifact が記録されない`       | `textValue: "Approved"` 削除 |

## 新規テストケース（TC-NEW）

| TC-ID    | テスト名                                                              | 期待結果                                          |
| -------- | --------------------------------------------------------------------- | ------------------------------------------------- |
| TC-NEW-1 | `createVerificationReviewRequest()` が `kind: "single_select"` を返す | `awaitingUserInput.kind === "single_select"`      |
| TC-NEW-2 | `createVerificationReviewRequest()` の options に3選択肢が含まれる    | options.length === 3, ids: approve/improve/reject |
| TC-NEW-3 | `validateUserInputSubmission` が空の selectedOptionId を拒否する      | `"selectedOptionId is invalid"` エラー            |

### TC-NEW 実装方針

- TC-NEW-1/2: `recordExecutionFailure()` または `recordVerifyFailure()` の public API 経由でテスト（private method 直アクセス禁止: Feedback P0-09-U1）
- TC-NEW-3: `submitUserInput()` に `selectedOptionId: undefined` を渡してエラーを確認

## テストファイル対象

```
apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
```

## テスト実行コマンド

```bash
pnpm exec vitest run \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
```
