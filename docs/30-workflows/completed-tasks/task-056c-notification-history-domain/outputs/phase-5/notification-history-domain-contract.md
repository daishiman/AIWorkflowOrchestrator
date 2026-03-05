# Phase 5 ドメイン契約書

## Notification 契約

### 入出力契約

| API         | Request               | Response                        | エラー                                                |
| ----------- | --------------------- | ------------------------------- | ----------------------------------------------------- |
| getHistory  | `{ limit?, offset? }` | `{ notifications, totalCount }` | `INVALID_SENDER`, `INTERNAL_ERROR`                    |
| markRead    | `{ id }`              | `{ updatedCount }`              | `INVALID_SENDER`, `AUTH_REQUIRED`, `VALIDATION_ERROR` |
| markAllRead | なし                  | `{ updatedCount }`              | `INVALID_SENDER`, `AUTH_REQUIRED`                     |
| clear       | `{ onlyRead? }`       | `{ removedCount }`              | `INVALID_SENDER`, `AUTH_REQUIRED`                     |

### 状態不変条件

- `unreadCount === notifications.filter(readAt === null).length`
- `notifications.length <= 100`
- `activeFilter` は `all | info | success | warning | error | system`

## HistorySearch 契約

### 入出力契約

| API      | Request                                 | Response                                          | エラー                                                 |
| -------- | --------------------------------------- | ------------------------------------------------- | ------------------------------------------------------ |
| search   | `{ query, filters?, page?, pageSize? }` | `{ results, pagination, stats }`                  | `INVALID_SENDER`, `VALIDATION_ERROR`, `INTERNAL_ERROR` |
| getStats | なし                                    | `{ totalCount, byType, unreadNotificationCount }` | `INVALID_SENDER`, `INTERNAL_ERROR`                     |

### 状態不変条件

- `query.trim() === ""` は検索拒否
- `pagination.hasNext` は `page * pageSize < total` で算出
- `lastExecutedAt` は `applySearchResponse` 時のみ更新
