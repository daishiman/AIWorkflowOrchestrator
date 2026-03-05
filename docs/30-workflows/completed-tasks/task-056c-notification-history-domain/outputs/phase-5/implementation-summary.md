# Phase 5 実装サマリー

## 実装結果

- 実装日: 2026-03-05
- 実装方針: Store/IPC/Preload の責務分離を維持した最小実装

## 変更ファイル

| 種別 | ファイル                                                            | 内容                                          |
| ---- | ------------------------------------------------------------------- | --------------------------------------------- |
| 追加 | `apps/desktop/src/renderer/store/slices/notificationSlice.ts`       | 通知状態・100件上限・既読管理                 |
| 追加 | `apps/desktop/src/renderer/store/slices/historySearchSlice.ts`      | 履歴検索状態・統計・ページング                |
| 変更 | `apps/desktop/src/renderer/store/index.ts`                          | 2Slice統合、persist追加、selector公開         |
| 追加 | `apps/desktop/src/main/ipc/notificationHandlers.ts`                 | sender検証、認証ゲート、CRUD契約              |
| 追加 | `apps/desktop/src/main/ipc/historySearchHandlers.ts`                | query検証、検索/統計契約                      |
| 変更 | `apps/desktop/src/main/ipc/index.ts`                                | 新規2handler登録                              |
| 変更 | `apps/desktop/src/preload/channels.ts`                              | history/notification チャネル追加             |
| 変更 | `apps/desktop/src/preload/types.ts`                                 | request/response型と API interface 追加       |
| 変更 | `apps/desktop/src/preload/index.ts`                                 | `electronAPI.notification/historySearch` 追加 |
| 追加 | `apps/desktop/src/renderer/store/slices/notificationSlice.test.ts`  | 7 tests                                       |
| 追加 | `apps/desktop/src/renderer/store/slices/historySearchSlice.test.ts` | 7 tests                                       |
| 追加 | `apps/desktop/src/main/ipc/notificationHandlers.test.ts`            | 5 tests                                       |
| 追加 | `apps/desktop/src/main/ipc/historySearchHandlers.test.ts`           | 4 tests                                       |
| 変更 | `apps/desktop/src/preload/channels.test.ts`                         | 14 tests に拡張                               |

## 重要な実装判断

1. 更新系通知IPCは未認証時に `AUTH_REQUIRED` を返却
2. 通知上限は Renderer 側で制御し、UI応答性を優先
3. Main の検索/通知サービスは in-memory factory とし、将来DI置換可能に設計
