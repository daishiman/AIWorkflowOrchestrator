# 受け入れ基準 (AC-1〜AC-8)

## タスク: TASK-CRON-CUSTOM-VALIDATION-001

| AC番号 | 条件                                                      | 期待結果                                                                        |
| ------ | --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| AC-1   | direct input モードで空文字入力時                         | エラーメッセージ（role="alert"）が表示され、onValidationChange(false)が呼ばれる |
| AC-2   | direct input モードでフィールド数が5でないcron式入力時    | エラーが表示され、onValidationChange(false)が呼ばれる                           |
| AC-3   | direct input モードでday-of-monthが数値かつ0の場合        | エラーが表示され、onValidationChange(false)が呼ばれる                           |
| AC-4   | direct input モードでday-of-monthが数値かつ32以上の場合   | エラーが表示され、onValidationChange(false)が呼ばれる                           |
| AC-5   | direct input モードで有効なcron式入力時                   | エラーが表示されず、onValidationChange(true)が呼ばれる                          |
| AC-6   | day-of-monthフィールドが`*`/`*/2`/`-`区間など非数値の場合 | エラーを表示しない                                                              |
| AC-7   | visual モードからdirect input モードへ切り替えた際        | バリデーション状態が正しく再計算される                                          |
| AC-8   | `onValidationChange` がundefinedの場合                    | エラーなく動作する                                                              |

## 検証方法

各ACはVitest/React Testing Libraryのユニットテストで検証する。
テストケースCV-01〜CV-12がAC-1〜AC-8に対応する。
