# 拡充テストケース記録 - TASK-UI-SCHEDULE-CRON-SEMANTIC-001

## TC-09〜TC-16 一覧

| TC ID | cron 式          | semantic | 期待結果          | 観点                                                     |
| ----- | ---------------- | -------- | ----------------- | -------------------------------------------------------- |
| TC-09 | `"0 0 30 2 *"`   | `true`   | エラー（非 null） | 2月30日も存在しない                                      |
| TC-10 | `"0 0 31 4 *"`   | `true`   | エラー（非 null） | 4月31日は存在しない（4月���30日まで）                    |
| TC-11 | `"0 0 31 6 *"`   | `true`   | エラー（非 null） | 6月31日は存在しない                                      |
| TC-12 | `"0 0 31 9 *"`   | `true`   | エラー（非 null） | 9月31日は存在しない                                      |
| TC-13 | `"0 0 31 11 *"`  | `true`   | エラー（非 null） | 11月31日は存在しない                                     |
| TC-14 | `"0 0 31 4 *"`   | `false`  | PASS（null）      | semantic=false は後方互換                                |
| TC-15 | `""`             | `true`   | エラー（非 null） | 空文字は semantic チェック前に構文エラーで reject        |
| TC-16 | `"0 0 31 2 1-5"` | `true`   | エラー（非 null） | cron-parser の実挙動に合わせ、安全側に到達不能として扱う |

## TC-16 安全側判定の仕様確定

`cron-parser@5.5.0` は day-of-month と day-of-week の複合指定を安全側に判定する。
`"0 0 31 2 1-5"` は `CronExpressionParser.parse()` 段階で例外 "Invalid explicit day of month definition" を投げる。

判断: TC-16 の期待値を `not.toBeNull()` とし、安全側判定を採用。ユーザーには「2月31日」という存在しない日付の組み合わせとして適切なエラーが表示される。
