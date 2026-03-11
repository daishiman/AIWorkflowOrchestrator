# Phase 2 state / IPC 設計

## store 設計

| action                      | 用途         | 備考         |
| --------------------------- | ------------ | ------------ |
| `setNotificationHistory`    | 初期同期     | 既存再利用   |
| `ingestNotification`        | push 受信    | 既存再利用   |
| `markAsRead`                | 個別既読     | 押下時に利用 |
| `markAllAsRead`             | 一括既読     | 既存再利用   |
| `deleteNotification`        | 個別削除反映 | 既存再利用   |
| `setPopoverOpen`            | open/close   | 既存再利用   |
| `setExpandedNotificationId` | 1件展開制御  | 既存再利用   |

## IPC 設計

| channel                      | 種別   | request               | response                        | 方針            |
| ---------------------------- | ------ | --------------------- | ------------------------------- | --------------- |
| `notification:get-history`   | invoke | `{ limit?, offset? }` | `{ notifications, totalCount }` | 継続利用        |
| `notification:mark-read`     | invoke | `{ notificationId }`  | `{ updated }`                   | 継続利用        |
| `notification:mark-all-read` | invoke | なし                  | `{ updatedCount }`              | 継続利用        |
| `notification:delete`        | invoke | `{ notificationId }`  | `{ deleted: boolean }`          | 新規追加        |
| `notification:new`           | on     | push payload          | unsubscribe                     | 継続利用        |
| `notification:clear`         | invoke | なし                  | `{ deletedCount }`              | UI 未使用にする |

## delete バリデーション

1. sender 検証に成功すること
2. `notificationId` が string であること
3. 空文字ではないこと
4. trim 後に空白のみではないこと

## エラー方針

- main は `sanitizeErrorMessage()` を通す
- renderer は console へ吐くだけでなく live region へ失敗メッセージを反映する
- delete 失敗時は UI optimistic update を行わない
