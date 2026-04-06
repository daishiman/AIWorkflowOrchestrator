# Phase 5: 変更ファイル一覧

## タスクID: TASK-SDK-04-U1-F1

## 修正ファイル

| #   | ファイルパス                                                                          | 変更種別 | 変更内容                                                      |
| --- | ------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------- |
| 1   | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` | 修正     | `textValue` 削除（5箇所）、TC-NEW-1〜3 追加、TC-ADD-1〜5 追加 |

## 変更なしファイル（確認済み）

| ファイルパス                                                           | 確認内容                                   |
| ---------------------------------------------------------------------- | ------------------------------------------ |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | `kind: "single_select"` 実装済み、変更不要 |
| `packages/shared/src/types/skillCreator.ts`                            | `single_select` 型定義済み、変更不要       |

## 新規作成ファイル

なし

## diff 概要（test.ts）

### textValue 削除（5箇所）

```diff
- textValue: "Looks good, approved",
  selectedOptionId: "approve",

- textValue: "Please improve the error handling",
  selectedOptionId: "improve",

- textValue: "This approach is wrong, start over",
  selectedOptionId: "reject",

- textValue: "some feedback",
  selectedOptionId: "unknown_option",

- textValue: "Approved",
  selectedOptionId: "approve",
```

### TC-NEW-1〜3 追加（新規テスト 3件）

- `verification_review awaitingUserInput の kind が single_select である`
- `verification_review awaitingUserInput の options に approve/improve/reject が含まれる`
- `verification_review で selectedOptionId が未指定の場合は拒否される`

### TC-ADD-1〜5 追加（拡張テスト 5件）

- `verification_review で selectedOptionId が空文字の場合は拒否される`
- `recordVerifyFailure 経由の verification_review で selectedOptionId が未指定の場合は拒否される`
- `plan_review で selectedOptionId が未知の文字列の場合は拒否される`
- `recordExecutionFailure 経由で kind: single_select の verification_review request が生成される`
- `recordVerifyFailure 経由で kind: single_select の verification_review request が生成される`
