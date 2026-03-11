# Phase 4 統合テストマトリクス

| フロー    | Renderer                  | Preload          | Main                 | 判定観点                   |
| --------- | ------------------------- | ---------------- | -------------------- | -------------------------- |
| 初期同期  | `getHistory` を起動時呼出 | allowlist invoke | 履歴返却             | 一覧と badge へ反映        |
| push 受信 | `onNew` 購読              | on channel       | `notification:new`   | unread と live region 更新 |
| 個別既読  | 項目押下                  | `markRead`       | validation + service | unreadCount 減少           |
| 全件既読  | header ボタン             | `markAllRead`    | validation + service | 全件 read 化               |
| 個別削除  | swipe/delete ボタン       | `delete`         | validation + service | item 除去と expanded reset |
| close     | Escape/outside click      | なし             | なし                 | focus return               |
