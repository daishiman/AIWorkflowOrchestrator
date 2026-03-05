# Phase 11 証跡要件

## 必須証跡

| 区分                | 必須    | ファイル                                                 |
| ------------------- | ------- | -------------------------------------------------------- |
| TC-11-01 正常表示   | 必須[A] | `screenshots/tc-11-01-import-success.png`                |
| TC-11-02 入力不正   | 必須[B] | `screenshots/tc-11-02-validation-error.png`              |
| TC-11-03 sender拒否 | 必須[B] | `screenshots/tc-11-03-unauthorized.png`                  |
| TC-11-04 境界分離   | 必須[A] | `screenshots/tc-11-04-channel-boundary.png`              |
| TC-11-04 診断ログ   | 必須[A] | `screenshots/tc-11-04-channel-boundary-diagnostics.json` |

## 命名規則

- `tc-11-XX-<状態名>.png`
- 実画面状態を示す語を必ず含める

## 完了条件

- 必須[A][B]の撮影率 100%
- `manual-test-result.md` の全TCに `.png` 証跡を紐付ける
