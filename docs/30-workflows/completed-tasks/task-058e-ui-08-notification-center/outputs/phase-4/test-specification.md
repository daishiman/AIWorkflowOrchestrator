# Phase 4 テスト仕様書

## 方針

058e の差分は既存実装上書きではなく補完なので、既存 056c 契約を維持しつつ以下を Red→Green で固定した。

## 対象テスト

| 層       | ファイル                                                                           | 目的                                                                                 |
| -------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Renderer | `src/renderer/components/organisms/NotificationCenter/NotificationCenter.test.tsx` | 文言、Portal、relative time、mark read、mark all、delete、empty state、outside click |
| Store    | `src/renderer/store/slices/notificationSlice.test.ts`                              | delete と expanded reset、history dedupe                                             |
| Main IPC | `src/main/ipc/notificationHandlers.test.ts`                                        | `notification:delete` の validation / success                                        |
| Main IPC | `src/main/ipc/__tests__/notificationHandlers.test.ts`                              | handler 登録、service 委譲                                                           |
| Preload  | `src/preload/channels.test.ts`                                                     | channel 定数と allowlist                                                             |
| Preload  | `src/preload/__tests__/channels.ui-01-store-ipc-architecture.test.ts`              | UI-01 契約の延長確認                                                                 |

## 先に固定した失敗条件

- `notification:delete` が channel / allowlist / handler に存在しない
- `NotificationCenter` が `お知らせ` 文言へ変わっていない
- `すべて削除` が UI に残っている
- relative time 表示が固定日時のまま
- popover が Portal / dialog 属性を持たない
- delete 後に `expandedNotificationId` が残留する
