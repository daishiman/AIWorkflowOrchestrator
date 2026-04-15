# スクリーンショットカバレッジ（Phase 11）

## タスク: TASK-CRON-CUSTOM-VALIDATION-001

| SC ID | 対象シナリオ              | 対応ユニットテスト | 取得状況                            |
| ----- | ------------------------- | ------------------ | ----------------------------------- |
| SC-01 | direct input 初期有効状態 | CV-05, CV-06       | `SC-01_direct-input-initial.png`    |
| SC-02 | 空文字エラー表示          | CV-01, CV-12       | `SC-02_empty-input-error.png`       |
| SC-03 | 4フィールド syntax エラー | CV-02              | `SC-03_syntax-error-4fields.png`    |
| SC-04 | day-of-month=0 エラー     | CV-03              | `SC-04_day-of-month-zero-error.png` |
| SC-05 | 有効 cron 式正常状態      | CV-05              | `SC-05_valid-cron-no-error.png`     |

**ユニットテスト代替**: 全シナリオは CV-01〜CV-20（20件 GREEN）で機能検証済み。
