# Phase 4: テストコード内 Dead Code 参照確認

## タスクID: TASK-RALLY-001

## 確認目的

テストコード内に削除対象の dead code（`_handleSubmitWorkflowInput`、旧入力 state 変数）への直接参照がないことを確認する。

## 確認コマンドと結果

### `_handleSubmitWorkflowInput` の確認

```bash
grep -rn "_handleSubmitWorkflowInput" \
  apps/desktop/src/**/__tests__/
```

**結果**: テストファイルに参照なし（0件）。
coverage report（lcov.info, HTML）のみに記録があるが、これは非ソースファイルのため削除影響なし。

### `selectedOptionId` / `textAnswer` / `secretAnswer` / `confirmAnswer` の確認

テストファイルに `selectedOptionId` 等の記述が存在するが、これらは以下の別コンテキストである：

| ファイル                                         | 用途                                                                          | 削除影響 |
| ------------------------------------------------ | ----------------------------------------------------------------------------- | -------- |
| `skillCreatorHandlers.runtime.test.ts`           | `SkillCreatorUserInputSubmission` の `selectedOptionId` プロパティ（API契約） | なし     |
| `SkillCreatorWorkflowEngine.test.ts`             | 同上                                                                          | なし     |
| `SkillLifecyclePanel.llm-generation.test.tsx`    | IPC経由submitのpayload `selectedOptionId` / `selectedOptionIds`               | なし     |
| `SkillLifecyclePanel.error-persistence.test.tsx` | IPC経由submitのpayload                                                        | なし     |
| `useInterviewState.test.ts`                      | `single_select` 回答型の `selectedOptionId` フィールド                        | なし     |
| `ConversationalInterview.test.tsx`               | IPC payloadの `selectedOptionId`                                              | なし     |
| `skill-creator-api.runtime.test.ts`              | API payload                                                                   | なし     |

**判定**: SkillLifecyclePanel.tsx の React state としての `selectedOptionId`（`useState`）への参照はテストコードに存在しない。テストコード内の `selectedOptionId` は全て IPC submission payload のプロパティであり、削除対象とは別物。

## 結論

- `_handleSubmitWorkflowInput` のテストコード参照: **0件（なし）**
- 削除対象 state の React state としてのテストコード参照: **0件（なし）**
- **Phase 4 テスト作成完了条件を満たす**

## 完了確認

- [x] テストコード内の `_handleSubmitWorkflowInput` 参照: 0件確認
- [x] テストコード内の削除対象 state 変数の React state 参照: 0件確認
- [x] テストコードの変更が不要であることを確認した
