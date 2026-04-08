# テストマトリクス

## タスク: UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001

## テストケース一覧（TC-01〜TC-12）

| TC番号 | 対象関数                | 入力                                             | 期待結果                                                                                                     | 受入基準         |
| ------ | ----------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ---------------- |
| TC-01  | `validateSkillName`     | `undefined`                                      | `{ valid: true }`                                                                                            | —                |
| TC-02  | `validateSkillName`     | `null`                                           | `{ valid: true }`                                                                                            | —                |
| TC-03  | `validateSkillName`     | `"  "` (空白のみ)                                | `{ valid: false, error: "スキル名を入力してください" }`                                                      | AC-1, AC-4       |
| TC-04  | `validateSkillName`     | `"テスト"` (通常文字列)                          | `{ valid: true }`                                                                                            | —                |
| TC-05  | `validateSkillName`     | 101文字の文字列                                  | `{ valid: false, error: "スキル名は100文字以内で入力してください" }`                                         | AC-4             |
| TC-06  | `validateSkillName`     | 100文字の文字列                                  | `{ valid: true }`                                                                                            | —                |
| TC-07  | `validatePurpose`       | 10文字以上の文字列                               | `{ valid: true }`                                                                                            | —                |
| TC-08  | `validatePurpose`       | 9文字の文字列                                    | `{ valid: false, error: "目的は10文字以上で入力してください" }`                                              | AC-2, AC-4       |
| TC-09  | `validatePurpose`       | 501文字の文字列                                  | `{ valid: false, error: "目的は500文字以内で入力してください" }`                                             | AC-4             |
| TC-10  | `validatePurpose`       | 500文字の文字列                                  | `{ valid: true }`                                                                                            | —                |
| TC-11  | `validateSkillInfoForm` | skillName: 有効, purpose: 10文字以上             | `{ isValid: true, skillName: undefined, purpose: undefined }`                                                | AC-3             |
| TC-12  | `validateSkillInfoForm` | skillName: `"  "`, purpose: `"短い"` (9文字以下) | `{ isValid: false, skillName: "スキル名を入力してください", purpose: "目的は10文字以上で入力してください" }` | AC-1, AC-2, AC-4 |

## 境界値分析

| フィールド  | 境界値  | 期待    |
| ----------- | ------- | ------- |
| `skillName` | 100文字 | valid   |
| `skillName` | 101文字 | invalid |
| `purpose`   | 9文字   | invalid |
| `purpose`   | 10文字  | valid   |
| `purpose`   | 500文字 | valid   |
| `purpose`   | 501文字 | invalid |
