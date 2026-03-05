# Phase 2 Notificationドメイン設計

## 1. 責務境界

| レイヤー       | 責務                                         | 対象                                                                                                     |
| -------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Main IPC       | invokeハンドラ + sender検証 + P42 + sanitize | `notification:get-history`, `notification:mark-read`, `notification:mark-all-read`, `notification:clear` |
| Main Event     | push配信                                     | `notification:new`                                                                                       |
| Preload        | invoke/onの安全ラッパ                        | `safeInvoke`, `safeOn`                                                                                   |
| Renderer Store | 状態遷移                                     | `notificationSlice`                                                                                      |

## 2. 状態モデル

| State                    | 型               | 初期値  | 更新契機                       |
| ------------------------ | ---------------- | ------- | ------------------------------ |
| `notifications`          | `Notification[]` | `[]`    | add/delete/clear/history同期   |
| `unreadCount`            | `number`         | `0`     | add/read/all-read/delete/clear |
| `isPopoverOpen`          | `boolean`        | `false` | UI操作                         |
| `expandedNotificationId` | `string \| null` | `null`  | UI操作/削除/clear              |

## 3. アクション規約

| Action                  | 入力                                   | 副作用順序                                                       |
| ----------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| `addNotification`       | `Omit<Notification, "id" \| "isRead">` | ID採番 → timestamp正規化 → 先頭追加 → trim(100件) → unread再計算 |
| `markAsRead`            | `{ id: string }`                       | 対象既読化 → unread再計算                                        |
| `markAllAsRead`         | `なし`                                 | 全件既読化 → unread=0                                            |
| `deleteNotification`    | `{ id: string }`                       | 対象削除 → unread再計算 → 展開ID解放                             |
| `clearAllNotifications` | `なし`                                 | 配列初期化 → unread=0 → 展開ID解放                               |

## 4. IPC契約（Notification）

| Channel                      | 方向   | 引数型                                | 戻り値型                                                                            |
| ---------------------------- | ------ | ------------------------------------- | ----------------------------------------------------------------------------------- |
| `notification:get-history`   | invoke | `{ limit?: number; offset?: number }` | `{ success, data?: { notifications: Notification[]; totalCount: number }, error? }` |
| `notification:mark-read`     | invoke | `{ notificationId: string }`          | `{ success, data?: { updated: boolean }, error? }`                                  |
| `notification:mark-all-read` | invoke | `なし`                                | `{ success, data?: { updatedCount: number }, error? }`                              |
| `notification:clear`         | invoke | `なし`                                | `{ success, data?: { deletedCount: number }, error? }`                              |
| `notification:new`           | on     | `{ notification: Notification }`      | Event push                                                                          |

## 5. 失敗時契約

- 返却フォーマットは全チャネル `success/data/error` で統一。
- `validateIpcSender` 不正は `IPC_UNAUTHORIZED` / `IPC_FORBIDDEN` 系を返却。
- `notificationId` は P42 3段検証で `VALIDATION_ERROR`。
- 例外は `UNKNOWN_ERROR` + sanitize済みmessage。

## 6. イベント購読設計

- Rendererは `notification.onNew(callback)` を使用し、必ずcleanup関数を保持する。
- 同一コンポーネント再マウント時にcleanupを呼び、二重購読リークを防止する。
- push payload受信時はStore `addNotification` を1回だけ実行する。
