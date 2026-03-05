# Phase 2 永続化ポリシー設計書

## Notification

| 項目       | 方針                                             |
| ---------- | ------------------------------------------------ | ----- |
| 永続化対象 | Renderer `notifications`（`persist.partialize`） |
| 上限       | 100件 (`MAX_NOTIFICATION_HISTORY`)               |
| 削除優先度 | 1) 既読最古 2) 未読最古                          |
| 既読管理   | `readAt: string                                  | null` |

## HistorySearch

| 項目       | 方針                                             |
| ---------- | ------------------------------------------------ |
| 永続化対象 | なし（セッション状態）                           |
| 理由       | 一時検索条件・結果のため、再現性より即時性を優先 |
| 初期値     | フィルタ全種類ON、page=1、pageSize=20            |

## Main IPC Service

- `createInMemoryNotificationService` と `createInMemoryHistorySearchService` を採用。
- DB接続は対象外。将来は repository DI に差し替え可能な interface を維持。
