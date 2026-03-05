# Phase 6 回帰テストマトリクス

| 回帰対象         | 懸念                               | テスト                                                    | 結果 |
| ---------------- | ---------------------------------- | --------------------------------------------------------- | ---- |
| 既存IPCチャネル  | 新規チャネル追加で許可集合が崩れる | `src/preload/channels.test.ts`                            | PASS |
| Store統合        | 既存slice合成に副作用              | `notificationSlice.test.ts`, `historySearchSlice.test.ts` | PASS |
| 認証フロー       | 更新系IPCで未認証を許可してしまう  | `notificationHandlers.test.ts`                            | PASS |
| history 検索契約 | query空文字許容の回帰              | `historySearchHandlers.test.ts`                           | PASS |
