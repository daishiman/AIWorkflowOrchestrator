# Phase 1 受け入れ基準

## 受け入れ基準一覧

| AC    | 条件                                                                             | 判定結果 |
| ----- | -------------------------------------------------------------------------------- | -------- |
| AC-01 | `notificationSlice` が追加され、基本操作（追加/既読/一括既読/削除/クリア）が可能 | PASS     |
| AC-02 | 通知上限100件ルール（既読優先削除）がテストで保証される                          | PASS     |
| AC-03 | `historySearchSlice` が追加され、検索状態管理が可能                              | PASS     |
| AC-04 | `history:search` が query 必須バリデーションを持つ                               | PASS     |
| AC-05 | `history:get-stats` が統計値を返却する                                           | PASS     |
| AC-06 | `notification:*` IPC が sender 検証を持つ                                        | PASS     |
| AC-07 | 通知更新系IPCが未認証時に拒否される                                              | PASS     |
| AC-08 | Preload 経由で history/notification API が公開される                             | PASS     |
| AC-09 | `channels.ts` の許可チャネルに新規チャネルが反映される                           | PASS     |
| AC-10 | 追加テスト + typecheck が通過する                                                | PASS     |

## 実測コマンド

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/store/slices/notificationSlice.test.ts \
  src/renderer/store/slices/historySearchSlice.test.ts \
  src/main/ipc/notificationHandlers.test.ts \
  src/main/ipc/historySearchHandlers.test.ts \
  src/preload/channels.test.ts
pnpm --filter @repo/desktop typecheck
```
