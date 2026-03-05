# Phase 11 画面カバレッジマトリクス

| テストケース | 画面/状態                 | 証跡                                                 | 判定 | N/A理由                   |
| ------------ | ------------------------- | ---------------------------------------------------- | ---- | ------------------------- |
| TC-11-01     | Dashboard表示回帰         | `screenshots/TC-11-01-dashboard-after.png`           | PASS | -                         |
| TC-11-02     | Chat History空状態        | `screenshots/TC-11-02-chat-history-after.png`        | PASS | -                         |
| TC-11-03     | History Page履歴一覧      | `screenshots/TC-11-03-history-page-after.png`        | PASS | -                         |
| TC-11-04     | notification id検証エラー | `NON_VISUAL: screenshots/non-visual-placeholder.png` | PASS | UI変更ではなくIPC契約検証 |
| TC-11-05     | invalid sender拒否        | `NON_VISUAL: screenshots/non-visual-placeholder.png` | PASS | UI変更ではなくIPC契約検証 |
| TC-11-06     | 未認証更新拒否            | `NON_VISUAL: screenshots/non-visual-placeholder.png` | PASS | UI変更ではなくIPC契約検証 |

## Apple UI/UX エンジニア視点コメント

- Dashboard/Chat History/History Page の3導線で視覚回帰を確認し、情報階層と可読性に退行なし。
- 今回はロジック中心タスクのため、異常系3ケースは `NON_VISUAL` で契約テスト証跡に紐付けた。
