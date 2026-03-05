# Phase 2 ドメイン境界設計書

## Notification ドメイン

| 要素     | 設計内容                                                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| State    | `notifications`, `unreadCount`, `activeFilter`, `isPopoverOpen`                                                                                       |
| Action   | `setNotifications`, `addNotification`, `markAsRead`, `markAllAsRead`, `deleteNotification`, `clearNotifications`, `setActiveFilter`, `setPopoverOpen` |
| Rule     | 100件上限。超過時は「既読の最古」優先、既読が無い場合は「未読最古」を削除                                                                             |
| Selector | `getFilteredNotifications`                                                                                                                            |

## HistorySearch ドメイン

| 要素   | 設計内容                                                                                                                                       |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| State  | `query`, `filters`, `results`, `stats`, `pagination`, `historySearchIsLoading`, `historySearchError`                                           |
| Action | `setQuery`, `setFilters`, `resetFilters`, `setPagination`, `startSearch`, `applySearchResponse`, `failSearch`, `clearResults`, `getResultById` |
| Rule   | query空文字は実行不可。`applySearchResponse` で `hasNext/hasPrev` を再計算                                                                     |

## 境界ルール

- Renderer: UI状態管理と即時反映に専念
- Preload: 型付き invoke/on API の境界
- Main: sender検証、入力検証、認証ゲート、エラーコード返却
