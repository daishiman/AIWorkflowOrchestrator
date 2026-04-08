# 手動テストチェックリスト

## タスク: UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001

## チェック対象

| No. | チェック項目                                            | evidence                                 | 判定 |
| --- | ------------------------------------------------------- | ---------------------------------------- | ---- |
| 1   | `skillName` が `undefined` のとき valid                 | `manual-test-result.md` / TC-01          | PASS |
| 2   | `skillName` が空文字列 `""` のとき invalid              | `manual-test-result.md` / EC-01          | PASS |
| 3   | `skillName` が空白のみ `"   "` のとき invalid           | `manual-test-result.md` / TC-03          | PASS |
| 4   | `skillName` が 100 文字のとき valid                     | `manual-test-result.md` / TC-06          | PASS |
| 5   | `skillName` が 101 文字のとき invalid                   | `manual-test-result.md` / TC-05          | PASS |
| 6   | `purpose` が 10 文字のとき valid                        | `manual-test-result.md` / EC-05          | PASS |
| 7   | `purpose` が 9 文字のとき invalid                       | `manual-test-result.md` / TC-08          | PASS |
| 8   | `purpose` が 500 文字のとき valid                       | `manual-test-result.md` / TC-10          | PASS |
| 9   | `purpose` が 501 文字のとき invalid                     | `manual-test-result.md` / TC-09          | PASS |
| 10  | `purpose` の前後空白が trim される                      | `manual-test-result.md` / コードレビュー | PASS |
| 11  | `validateSkillInfoForm` を barrel export から呼べる     | `manual-test-result.md` / EC-12          | PASS |
| 12  | `SkillInfoValidationInput` が `category` を受け取らない | `manual-test-result.md` / EC-13          | PASS |

## 判定

**PASS** - `manual-test-result.md` の evidence と整合しており、Phase 11 の手動確認要件を満たす。
