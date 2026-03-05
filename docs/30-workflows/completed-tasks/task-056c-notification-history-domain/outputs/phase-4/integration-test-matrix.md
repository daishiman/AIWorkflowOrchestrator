# Phase 4 統合テストマトリクス

| 観点                  | Renderer         | Preload                          | Main                                 | 判定            |
| --------------------- | ---------------- | -------------------------------- | ------------------------------------ | --------------- |
| Notification 履歴取得 | request生成      | `notification.getHistory` invoke | `notification:get-history` handler   | PASS            |
| Notification 既読更新 | action実行       | `notification.markRead` invoke   | `notification:mark-read` + auth gate | PASS            |
| History 検索          | query/filter設定 | `historySearch.search` invoke    | `history:search` + query validation  | PASS            |
| History 統計取得      | stats参照        | `historySearch.getStats` invoke  | `history:get-stats` handler          | PASS            |
| 通知イベント受信      | state反映予定    | `safeOn(notification:new)`       | `emitNotification`                   | N/A（UI未実装） |
