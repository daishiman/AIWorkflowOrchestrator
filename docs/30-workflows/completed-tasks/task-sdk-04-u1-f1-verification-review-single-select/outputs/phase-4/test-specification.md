# Phase 4: テスト仕様書

## タスクID: TASK-SDK-04-U1-F1

## テストファイル

`apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`

---

## 変更対象テスト（TC-MOD）

| TC-ID    | テスト名                                                                          | 変更内容                     | 期待結果     |
| -------- | --------------------------------------------------------------------------------- | ---------------------------- | ------------ |
| TC-MOD-1 | `verification_review approve → verifyResult.nextAction が handoff`                | `textValue` 削除             | approve 遷移 |
| TC-MOD-2 | `verification_review improve → verifyResult.nextAction が improve`                | `textValue` 削除             | improve 遷移 |
| TC-MOD-3 | `verification_review reject → currentPhase が plan に遷移し nextAction が review` | `textValue` 削除             | reject 遷移  |
| TC-MOD-4 | `verification_review で未知の selectedOptionId は no-op フォールバックする`       | `textValue` 削除             | no-op 許容   |
| TC-MOD-5 | `phase 遷移なしの場合は phase_transition artifact が記録されない`                 | `textValue: "Approved"` 削除 | undefined    |

## 新規テスト（TC-NEW）

| TC-ID    | テスト名                                                                                | 期待結果                               |
| -------- | --------------------------------------------------------------------------------------- | -------------------------------------- |
| TC-NEW-1 | `verification_review awaitingUserInput の kind が single_select である`                 | `kind === "single_select"`             |
| TC-NEW-2 | `verification_review awaitingUserInput の options に approve/improve/reject が含まれる` | options.length === 3, ids 一致         |
| TC-NEW-3 | `verification_review で selectedOptionId が未指定の場合は拒否される`                    | `"selectedOptionId is invalid"` エラー |

## 拡張テスト（TC-ADD）

| TC-ID    | テスト名                                                                                        | 期待結果                           |
| -------- | ----------------------------------------------------------------------------------------------- | ---------------------------------- |
| TC-ADD-1 | `verification_review で selectedOptionId が空文字の場合は拒否される`                            | バリデーションエラー               |
| TC-ADD-2 | `recordVerifyFailure 経由の verification_review で selectedOptionId が未指定の場合は拒否される` | バリデーションエラー               |
| TC-ADD-3 | `plan_review で selectedOptionId が未知の文字列の場合は拒否される`                              | バリデーションエラー               |
| TC-ADD-4 | `recordExecutionFailure 経由で kind: single_select の verification_review request が生成される` | kind: "single_select", options 3件 |
| TC-ADD-5 | `recordVerifyFailure 経由で kind: single_select の verification_review request が生成される`    | kind: "single_select", options 3件 |

## AC 対応表

| AC-ID | 検証方法                     | 対応 TC                         |
| ----- | ---------------------------- | ------------------------------- |
| AC-1  | TC-NEW-1, TC-ADD-4, TC-ADD-5 | `kind === "single_select"` 確認 |
| AC-2  | TC-NEW-2                     | options の id/数 確認           |
| AC-3  | TC-NEW-3, TC-ADD-1, TC-ADD-2 | 不正値拒否確認                  |
| AC-4  | TC-MOD-1〜5                  | 既存テスト回帰確認              |
