# Phase 4: テストマトリクス

## タスクID: TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001

## 作成日: 2026-04-12

## テストシナリオ TC-01〜TC-06

| TC番号   | テスト名                                                 | 入力                                                               | 期待結果          | RED/GREEN    |
| -------- | -------------------------------------------------------- | ------------------------------------------------------------------ | ----------------- | ------------ |
| 既存更新 | `weekly weekdays が空配列のとき空文字を返す`             | `{ frequency: "weekly", weekdays: [], hour: 9, minute: 0 }`        | `""`              | RED (実装前) |
| TC-01    | `frequency='weekly' かつ weekdays=[] のとき空文字を返す` | `{ frequency: "weekly", weekdays: [], hour: 9, minute: 0 }`        | `""`              | RED (実装前) |
| TC-02    | `weekdays=[0]（日曜のみ）で正常なcron式が返る`           | `{ frequency: "weekly", weekdays: [0], hour: 9, minute: 0 }`       | `"0 9 * * 0"`     | GREEN        |
| TC-03    | `weekdays=[1,3,5]（複数曜日）で正常なcron式が返る`       | `{ frequency: "weekly", weekdays: [1, 3, 5], hour: 9, minute: 0 }` | `"0 9 * * 1,3,5"` | GREEN        |
| TC-04    | `frequency='daily' のとき weekday 影響を受けない`        | `{ frequency: "daily", hour: 9, minute: 0 }`                       | `"0 9 * * *"`     | GREEN        |
| TC-05    | `frequency='every-hour' のとき weekday 影響を受けない`   | `{ frequency: "every-hour", minute: 30 }`                          | `"30 * * * *"`    | GREEN        |

## Phase 6 拡充テスト TC-07〜TC-10

| TC番号 | テスト名                                                        | 入力                                                                               | 期待結果          | RED/GREEN    |
| ------ | --------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------- | ------------ |
| TC-07  | `weekdays空かつweekly → 空文字を返す`                           | `{ frequency: "weekly", weekdays: [], hour: 9, minute: 0 }`                        | `""`              | RED (実装前) |
| TC-08  | `weekdays の順序と重複を正規化する`                             | `{ frequency: "weekly", weekdays: [5, 1, 3, 3], hour: 9, minute: 0 }`              | `"0 9 * * 1,3,5"` | GREEN        |
| TC-09  | `frequency=every-hour のとき weekdays は cron 式に反映されない` | `{ frequency: "every-hour", weekdays: [1, 3, 5], minute: 0, hour: 8 }`             | `"0 * * * *"`     | GREEN        |
| TC-10  | `frequency=monthly のとき weekdays は cron 式に反映されない`    | `{ frequency: "monthly", weekdays: [1, 3, 5], hour: 8, minute: 0, dayOfMonth: 1 }` | `"0 8 1 * *"`     | GREEN        |
