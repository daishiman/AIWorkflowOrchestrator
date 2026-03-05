# Phase 2 IPC契約設計書

## 追加チャネル

| チャネル                     | request                   | response                         | 更新種別 | 備考             |
| ---------------------------- | ------------------------- | -------------------------------- | -------- | ---------------- |
| `history:search`             | `HistorySearchRequest`    | `HistorySearchResponse`          | 読み取り | `query` 必須     |
| `history:get-stats`          | なし                      | `HistorySearchStatsResponse`     | 読み取り | 集計返却         |
| `notification:get-history`   | `{ limit?, offset? }`     | `NotificationGetHistoryResponse` | 読み取り | limit sanitize   |
| `notification:mark-read`     | `{ id }`                  | `NotificationMutationResponse`   | 更新     | 認証必須         |
| `notification:mark-all-read` | なし                      | `NotificationMutationResponse`   | 更新     | 認証必須         |
| `notification:clear`         | `{ onlyRead? }`           | `NotificationMutationResponse`   | 更新     | 認証必須         |
| `notification:new`           | `NotificationHistoryItem` | event                            | event    | Main -> Renderer |

## セキュリティ要件

- invoke: `ALLOWED_INVOKE_CHANNELS` に明示登録
- on: `ALLOWED_ON_CHANNELS` に `notification:new` を登録
- Main handler: `validateSender` で URL と sender 一致を検証
- 更新系通知IPC: `AUTH_REQUIRED` を返す認証ゲートを適用
