# Phase 4 テスト仕様書

## テスト方針

- Store Slice: 状態遷移・上限管理・検索応答反映を unit で固定
- Main IPC: sender検証・入力検証・認証拒否・成功応答を unit で固定
- Preload Channels: 定数値、許可チャネル集合を unit で固定
- Type Safety: `typecheck` を必須ゲート化

## 対象

| レイヤ         | 対象ファイル               | テストファイル                  |
| -------------- | -------------------------- | ------------------------------- |
| Renderer Store | `notificationSlice.ts`     | `notificationSlice.test.ts`     |
| Renderer Store | `historySearchSlice.ts`    | `historySearchSlice.test.ts`    |
| Main IPC       | `notificationHandlers.ts`  | `notificationHandlers.test.ts`  |
| Main IPC       | `historySearchHandlers.ts` | `historySearchHandlers.test.ts` |
| Preload        | `channels.ts`              | `channels.test.ts`              |

## 成功条件

- 対象5テストファイルが全PASS
- 通知上限・認証拒否・queryバリデーションを必須ケース化
