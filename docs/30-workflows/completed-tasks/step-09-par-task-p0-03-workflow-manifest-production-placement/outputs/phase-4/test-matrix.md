# Phase 4 — テストマトリクス (TASK-P0-03)

## テスト対象

Production workflow-manifest.json の構造・整合性検証

## テストマトリクス

| ID    | テストケース                                                   | 対応AC | PASS条件                                       | 結果 |
| ----- | -------------------------------------------------------------- | ------ | ---------------------------------------------- | ---- |
| TC-01 | canonical manifest を loadManifest() でエラーなく読み込む      | AC-1,3 | WorkflowManifest object returned without error | PASS |
| TC-02 | schemaVersion が 1 である                                      | AC-6   | `manifest.schemaVersion === 1`                 | PASS |
| TC-03 | 全 resource descriptor の path が実在ファイルを指す            | AC-4   | `fs.access()` success for all                  | PASS |
| TC-04 | phases が 5 phase を含む                                       | AC-5   | `phases.length === 5`                          | PASS |
| TC-05 | entry/exit hooks が定義されている                              | AC-7   | `entry.length > 0 && exit.length > 0`          | PASS |
| TC-06 | 全 phase の entryHookId が entry[] に存在する                  | AC-7   | all `entryHookId` in `entry[].id`              | PASS |
| TC-07 | 全 phase の exitHookId が exit[] に存在する                    | AC-7   | all `exitHookId` in `exit[].id`                | PASS |
| TC-08 | canonical と mirror の manifest が同一内容である               | AC-2   | content equality                               | PASS |
| TC-09 | 全 resource の kind が agent/reference/schema/asset のいずれか | AC-4   | valid kind set                                 | PASS |
| TC-10 | phase の dependsOn が正しい依存順序を形成する                  | AC-5   | sequential dependency chain                    | PASS |

## 結果サマリ

- **合計**: 10 テストケース
- **PASS**: 10
- **FAIL**: 0
- **カバー AC**: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7
