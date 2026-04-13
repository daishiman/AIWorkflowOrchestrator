# Phase 4: テスト仕様書

## テストケース一覧

| テスト名                                                     | AC番号     | 期待動作                            |
| ------------------------------------------------------------ | ---------- | ----------------------------------- |
| InvalidConfigError - name が 'InvalidConfigError' であること | AC-05 関連 | `err.name === "InvalidConfigError"` |
| InvalidConfigError - Error のインスタンスであること          | AC-05 関連 | `err instanceof Error === true`     |
| InvalidConfigError - message が正しく設定されること          | AC-05 関連 | `err.message === "some message"`    |
| weekdays=[] ガード - InvalidConfigError をスローすること     | AC-01      | `throw InvalidConfigError`          |
| weekdays=[] ガード - 適切なメッセージが含まれること          | AC-05      | メッセージ一致確認                  |
| 正常系 - weekdays=[0]                                        | AC-02      | `"0 9 * * 0"`                       |
| 正常系 - weekdays=[1,2,3,4,5]                                | AC-03      | `"0 9 * * 1,2,3,4,5"`               |
| 正常系 - weekdays=[0,1,2,3,4,5,6]                            | AC-04      | `"0 9 * * 0,1,2,3,4,5,6"`           |
| 回帰 - daily でエラーにならないこと                          | 回帰       | スローしない                        |
| 回帰 - every-minute                                          | 回帰       | `"* * * * *"`                       |
| 回帰 - every-hour                                            | 回帰       | `"30 * * * *"`                      |
| 回帰 - monthly                                               | 回帰       | `"0 9 15 * *"`                      |

## テストファイルパス

`apps/desktop/src/renderer/utils/__tests__/cronConverter.test.ts`
