# Phase 2 コンポーネント設計

## コンポーネント分割

| 種別         | 名前                  | 責務                                                       |
| ------------ | --------------------- | ---------------------------------------------------------- |
| organism     | `NotificationCenter`  | Bell trigger、history sync、購読管理、responsive mode 分岐 |
| subcomponent | `NotificationPopover` | Portal、dialog 属性、focus trap、outside click             |
| subcomponent | `NotificationHeader`  | `お知らせ` / `すべて既読` / close                          |
| subcomponent | `NotificationList`    | empty state 切替、スクロール領域                           |
| subcomponent | `NotificationItem`    | unread dot、relative time、expand、delete affordance       |
| atom reuse   | `EmptyState`          | 0件表示                                                    |
| atom reuse   | `Bell` + badge        | unread count 表示                                          |

## 状態設計

| 状態                     | 保存先      | 理由                     |
| ------------------------ | ----------- | ------------------------ |
| `notifications`          | store       | ドメイン状態             |
| `unreadCount`            | store       | badge / live region 共有 |
| `isPopoverOpen`          | store       | Bell と popover 間共有   |
| `expandedNotificationId` | store       | 1件展開制約の正本        |
| `pendingDeleteId`        | local state | 一時 UI 状態             |
| `liveMessage`            | local state | 画面内通知専用           |
| focus refs               | ref         | 再描画不要               |

## responsive ルール

| mode    | 挙動                                               |
| ------- | -------------------------------------------------- |
| desktop | Bell 右下アンカー、幅 360px                        |
| tablet  | Bell 右下アンカー、最大幅 360px、viewport 余白優先 |
| mobile  | 画面中央寄せ overlay、最大幅 `calc(100vw - 24px)`  |
