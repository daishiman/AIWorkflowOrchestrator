# Phase 2 アーキテクチャ設計

## 目的

058e の UI 要求を既存通知ドメインへ上乗せし、Renderer / Preload / Main の責務を崩さずに差分を収束させる。

## 構成

```text
AppLayout
  └─ NotificationCenter
      ├─ BellTrigger
      ├─ NotificationPopover (Portal)
      │   ├─ NotificationHeader
      │   ├─ NotificationList
      │   │   └─ NotificationItem[]
      │   └─ LiveRegion
      └─ history sync / onNew subscription

Renderer
  └─ window.electronAPI.notification.{getHistory,markRead,markAllRead,delete,onNew}

Main
  └─ registerNotificationHandlers()
      └─ NotificationService.{getHistory,markRead,markAllRead,delete,clear}
```

## 境界方針

| 層           | 責務                                                    | 非責務              |
| ------------ | ------------------------------------------------------- | ------------------- |
| Renderer     | 表示、展開状態、削除操作起点、relative time、focus 管理 | 永続化、sender 検証 |
| Preload      | 安全な channel 公開、型境界                             | ビジネスルール      |
| Main handler | 入力検証、sender 検証、service 委譲                     | UI 状態             |
| Service      | 永続データの読取・更新                                  | DOM / preload       |

## 変更方針

- `notification:clear` は残すが UI からは利用しない
- `notification:delete` は invoke channel として新設する
- store 既存の `deleteNotification` を IPC 成功後同期へ再利用する
- 既読化は `setExpandedNotificationId` と `markAsRead` の順序競合を避ける
