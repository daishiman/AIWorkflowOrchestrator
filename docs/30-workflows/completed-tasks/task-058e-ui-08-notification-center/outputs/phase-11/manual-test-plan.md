# Phase 11 手動テスト計画

## テストケース

| テストケース | viewport         | 内容                                      |
| ------------ | ---------------- | ----------------------------------------- |
| TC-11-01     | desktop 1440x900 | Bell idle badge の見え方                  |
| TC-11-02     | desktop 1440x900 | popover open の全体バランス               |
| TC-11-03     | desktop 1440x900 | item expanded の階層・可読性              |
| TC-11-04     | tablet 1024x768  | tablet open の横幅・アンカー              |
| TC-11-05     | mobile 390x844   | mobile overlay open の収まり              |
| TC-11-06     | desktop 1440x900 | empty state の視認性                      |
| TC-11-07     | desktop 1440x900 | delete reveal の affordance と hit target |

## 画面カバレッジマトリクス

| テストケース | 画面状態            | 証跡ファイル                                     |
| ------------ | ------------------- | ------------------------------------------------ |
| TC-11-01     | idle badge          | `screenshots/TC-11-01-desktop-idle-badge.png`    |
| TC-11-02     | popover open        | `screenshots/TC-11-02-desktop-popover-open.png`  |
| TC-11-03     | item expanded       | `screenshots/TC-11-03-desktop-item-expanded.png` |
| TC-11-04     | tablet open         | `screenshots/TC-11-04-tablet-popover-open.png`   |
| TC-11-05     | mobile overlay open | `screenshots/TC-11-05-mobile-overlay-open.png`   |
| TC-11-06     | empty state         | `screenshots/TC-11-06-empty-state.png`           |
| TC-11-07     | delete reveal       | `screenshots/TC-11-07-desktop-delete-reveal.png` |
