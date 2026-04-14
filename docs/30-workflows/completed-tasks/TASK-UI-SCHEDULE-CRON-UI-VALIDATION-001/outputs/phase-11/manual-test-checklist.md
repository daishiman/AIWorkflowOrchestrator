# Phase 11 - 手動テストチェックリスト

## 実施概要

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| タスクID | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 |
| フェーズ | Phase 11                                |
| 実施日   | 2026-04-13                              |
| 判定     | PASS                                    |

## チェックリスト

| ID        | チェック項目                       | 期待結果                                                   | 証跡                                                   | 状態 |
| --------- | ---------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------ | ---- |
| CHK-11-01 | smoke test でハーネス route を開く | `phase11-task-ui-schedule-visual-picker.html` が表示される | `screenshots/phase11-capture-metadata.json`            | PASS |
| CHK-11-02 | weekly + 空曜日                    | `role="alert"` のエラーが表示される                        | `screenshots/scene-01-weekly-empty-weekdays-error.png` | PASS |
| CHK-11-03 | weekly + 曜日選択済み              | エラーが消え、正常表示になる                               | `screenshots/scene-02-weekly-valid-weekdays-ok.png`    | PASS |
| CHK-11-04 | monthly + 無効日付                 | `role="alert"` のエラーが表示される                        | `screenshots/scene-03-monthly-invalid-date-error.png`  | PASS |
| CHK-11-05 | monthly + 有効日付                 | エラーが消え、正常表示になる                               | `screenshots/scene-04-monthly-valid-date-ok.png`       | PASS |
| CHK-11-06 | 証跡ファイル保存                   | 4枚の PNG と metadata / plan が保存される                  | `screenshot-plan.json`, `screenshot-coverage.md`       | PASS |

## 備考

- monthly の無効値はハーネスの `value` 注入で再現した。
- 直接入力モードの検証は本タスクの対象外として切り分けた。
