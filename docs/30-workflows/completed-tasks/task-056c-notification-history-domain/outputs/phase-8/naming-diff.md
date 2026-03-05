# Phase 8 命名差分一覧

## 1. Store/Action命名

| 旧/曖昧表現                         | 新命名                                           | 理由                                               |
| ----------------------------------- | ------------------------------------------------ | -------------------------------------------------- |
| push通知を `addNotification` で受理 | `ingestNotification`                             | Main発行IDを保持する取り込み専用アクションを明確化 |
| 履歴同期専用操作なし                | `setNotificationHistory`                         | 初期同期処理を意図付きで分離                       |
| 検索時filter固定 `all`              | `historySearchFilter` + `setHistorySearchFilter` | UI選択値を状態へ保持                               |
| 統計状態なし                        | `historySearchStats` + `historySearchStatsError` | 統計取得責務を明示                                 |

## 2. UI要素命名（testid含む）

| 旧                   | 新                                                 |
| -------------------- | -------------------------------------------------- |
| プレースホルダーView | `history-search-view`（実装済みビュー）            |
| 通知導線なし         | `notification-bell-button`, `notification-popover` |
| 統計表示導線なし     | `history-stats-panel`                              |

## 3. IPC補助命名

| 旧                                   | 新                                               |
| ------------------------------------ | ------------------------------------------------ |
| `notification:new` payload整形が暗黙 | `NotificationPushPayload`, `emitNotificationNew` |

## 4. 互換性

- channel文字列は既存契約を維持（破壊的変更なし）。
- Preload API名（`markRead`, `markAllRead`, `clear`, `search`, `getStats`, `onNew`）は維持。
