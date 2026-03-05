# Phase 6 成果物: 回帰マトリクス

| 領域     | 代表テスト                                      | 結果 | 補足                                     |
| -------- | ----------------------------------------------- | ---- | ---------------------------------------- |
| Store    | `notificationSlice.test.ts`                     | PASS | 8ケース（上限100件トリム/既読同期/削除） |
| Store    | `historySearchSlice.test.ts`                    | PASS | 7ケース（検索・追補・エラー・リセット）  |
| Main IPC | `notificationHandlers.test.ts`                  | PASS | 4ケース（sender拒否・P42検証）           |
| Main IPC | `historySearchHandlers.test.ts`                 | PASS | 5ケース（sender拒否・filter検証）        |
| Preload  | `channels.ui-01-store-ipc-architecture.test.ts` | PASS | 3ケース（allowlist整合）                 |
| UI導線   | `AppDock.test.tsx`                              | PASS | 22ケース（9ナビ項目・遷移）              |

## 実行コマンド

- `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/notificationHandlers.test.ts src/main/ipc/__tests__/historySearchHandlers.test.ts src/preload/__tests__/channels.ui-01-store-ipc-architecture.test.ts src/renderer/store/slices/notificationSlice.test.ts src/renderer/store/slices/historySearchSlice.test.ts src/renderer/components/organisms/AppDock/AppDock.test.tsx`

## 判定

- 総計: **6 files / 49 tests PASS**
- 回帰: **0件**
