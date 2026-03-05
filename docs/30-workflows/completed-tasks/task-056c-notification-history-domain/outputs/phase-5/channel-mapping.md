# Phase 5 チャネル対応表

| IPCチャネル                  | preload API                | main handler                    | service                                         | テスト                          |
| ---------------------------- | -------------------------- | ------------------------------- | ----------------------------------------------- | ------------------------------- |
| `history:search`             | `historySearch.search`     | `registerHistorySearchHandlers` | `createInMemoryHistorySearchService.search`     | `historySearchHandlers.test.ts` |
| `history:get-stats`          | `historySearch.getStats`   | `registerHistorySearchHandlers` | `createInMemoryHistorySearchService.getStats`   | `historySearchHandlers.test.ts` |
| `notification:get-history`   | `notification.getHistory`  | `registerNotificationHandlers`  | `createInMemoryNotificationService.getHistory`  | `notificationHandlers.test.ts`  |
| `notification:mark-read`     | `notification.markRead`    | `registerNotificationHandlers`  | `createInMemoryNotificationService.markRead`    | `notificationHandlers.test.ts`  |
| `notification:mark-all-read` | `notification.markAllRead` | `registerNotificationHandlers`  | `createInMemoryNotificationService.markAllRead` | `notificationHandlers.test.ts`  |
| `notification:clear`         | `notification.clear`       | `registerNotificationHandlers`  | `createInMemoryNotificationService.clear`       | `notificationHandlers.test.ts`  |
| `notification:new`           | `safeOn(notification:new)` | `emitNotification`              | N/A(event dispatch)                             | `channels.test.ts`              |
