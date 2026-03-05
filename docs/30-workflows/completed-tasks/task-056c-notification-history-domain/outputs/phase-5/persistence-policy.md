# Phase 5 永続化ポリシー

## 1. 正本と保存境界

| レイヤー | 正本データ           | 保存方式                               | 実装                        |
| -------- | -------------------- | -------------------------------------- | --------------------------- |
| Main     | Notification履歴     | `electron-store(notification-history)` | `createNotificationService` |
| Renderer | Notification表示状態 | Zustand persist(localStorage)          | `notificationSlice`         |
| Renderer | HistorySearch状態    | 非永続（セッションのみ）               | `historySearchSlice`        |

## 2. 通知件数上限ポリシー

- 上限件数: **100件**。
- 追加時手順:

1. 新規通知を先頭へ追加。
2. ID重複時は新規データで置換（`ingestNotification`）。
3. `trimNotifications` で100件に制限。
4. `unreadCount` を再計算。

## 3. 削除/既読更新ポリシー

| 操作     | Main                       | Renderer                         |
| -------- | -------------------------- | -------------------------------- |
| 単一既読 | `markRead(notificationId)` | 成功時 `markAsRead(id)`          |
| 全件既読 | `markAllRead()`            | 成功時 `markAllAsRead()`         |
| 全件削除 | `clear()`                  | 成功時 `clearAllNotifications()` |

- Main成功をトリガーにRendererを更新し、二重正本を回避する。

## 4. 復元順序

1. RendererのNotificationCenter mount時に `notification:get-history(limit=100, offset=0)` を実行。
2. `setNotificationHistory` で時刻降順へ正規化してStore同期。
3. 起動中の新規通知は `notification:new` pushで追補。
4. unmount時に `onNew` 購読解除でリークを防止。

## 5. 整合性ルール

- `unreadCount` は配列から導出し、直接インクリメントしない。
- `expandedNotificationId` は削除/全削除時に必ず解放する。
- 不正timestampはISO現在時刻へ正規化し、表示崩れを回避する。

## 6. 監査結果

- 初期同期、push追補、既読更新、全削除の順で整合確認済み。
- 100件上限のトリムロジックはユニットテストで検証済み。
