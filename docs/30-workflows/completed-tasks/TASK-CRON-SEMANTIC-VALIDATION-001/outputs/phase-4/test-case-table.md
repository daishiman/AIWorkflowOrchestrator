# テストケーステーブル

## メタ情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| Phase    | 4                                 |
| タスクID | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 作成日   | 2026-04-12                        |

---

## TC-SV-01〜07 詳細

| TC番号   | 入力            | 期待結果                 | AC対応 | テストコード場所                    |
| -------- | --------------- | ------------------------ | ------ | ----------------------------------- |
| TC-SV-01 | `"0 9 31 2 *"`  | not null (string)        | AC-1   | scheduleConfigValidator.test.ts:73  |
| TC-SV-02 | `"0 9 30 2 *"`  | not null (string)        | AC-2   | scheduleConfigValidator.test.ts:79  |
| TC-SV-03 | `"0 9 29 2 *"`  | null                     | AC-3   | scheduleConfigValidator.test.ts:85  |
| TC-SV-04 | `"0 9 1 2 *"`   | null                     | AC-4   | scheduleConfigValidator.test.ts:89  |
| TC-SV-05 | `"0 9 * * *"`   | null                     | AC-4   | scheduleConfigValidator.test.ts:93  |
| TC-SV-06 | `"0 9 * * 1-5"` | null                     | AC-4   | scheduleConfigValidator.test.ts:97  |
| TC-SV-07 | `"invalid"`     | not null (string)        | 構文   | scheduleConfigValidator.test.ts:103 |
| AC-5     | `"0 9 31 2 *"`  | /[\u3040-\u9FFF]/ を含む | AC-5   | scheduleConfigValidator.test.ts:110 |
