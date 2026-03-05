# Phase 11 証跡インデックス

| ID       | 種別                   | 証跡                                                           | 備考                                    |
| -------- | ---------------------- | -------------------------------------------------------------- | --------------------------------------- |
| EV-11-01 | Unit Test              | `src/renderer/store/slices/notificationSlice.test.ts`          | Notificationドメイン回帰（NON_VISUAL）  |
| EV-11-02 | Unit Test              | `src/renderer/store/slices/historySearchSlice.test.ts`         | HistorySearchドメイン回帰（NON_VISUAL） |
| EV-11-03 | Unit Test              | `src/main/ipc/historySearchHandlers.test.ts`                   | TC-11-05                                |
| EV-11-04 | Unit Test              | `src/main/ipc/notificationHandlers.test.ts`                    | TC-11-04, TC-11-05, TC-11-06            |
| EV-11-05 | Unit Test              | `src/preload/channels.test.ts`                                 | IPCチャネル整合                         |
| EV-11-06 | TypeCheck              | `pnpm --filter @repo/desktop typecheck`                        | 型契約整合                              |
| EV-11-07 | Screenshot             | `outputs/phase-11/screenshots/TC-11-01-dashboard-after.png`    | TC-11-01                                |
| EV-11-08 | Screenshot             | `outputs/phase-11/screenshots/TC-11-02-chat-history-after.png` | TC-11-02                                |
| EV-11-09 | Screenshot             | `outputs/phase-11/screenshots/TC-11-03-history-page-after.png` | TC-11-03                                |
| EV-11-10 | Placeholder Screenshot | `outputs/phase-11/screenshots/non-visual-placeholder.png`      | TC-11-04〜06 の NON_VISUAL 証跡アンカー |

## スクリーンショット

- 実画面証跡: `TC-11-01`〜`TC-11-03` は導線回帰をスクリーンショットで記録。
- 非視覚証跡: `TC-11-04`〜`TC-11-06` は契約テスト起点のため `NON_VISUAL` アンカーを使用。
