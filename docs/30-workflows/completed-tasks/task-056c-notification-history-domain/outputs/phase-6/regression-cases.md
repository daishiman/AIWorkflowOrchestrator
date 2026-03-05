# Phase 6 回帰ケース一覧

## 1. 追加回帰ケース

| RC-ID | 区分          | ケース                     | 期待結果                                   | 実装テスト                                                 |
| ----- | ------------- | -------------------------- | ------------------------------------------ | ---------------------------------------------------------- |
| RC-01 | Notification  | 初期同期 `getHistory` 実行 | `setNotificationHistory`で履歴が反映される | `NotificationCenter.test.tsx`                              |
| RC-02 | Notification  | push購読解除               | unmount時に`unsubscribe()`が1回呼ばれる    | `NotificationCenter.test.tsx`                              |
| RC-03 | Notification  | 単一既読                   | `markRead`成功時のみStore既読化            | `NotificationCenter.test.tsx`                              |
| RC-04 | Notification  | 外部通知取り込み           | `ingestNotification`でID維持・重複除去     | `notificationSlice.test.ts`                                |
| RC-05 | Notification  | 履歴同期                   | `setNotificationHistory`で時刻降順ソート   | `notificationSlice.test.ts`                                |
| RC-06 | HistorySearch | フィルタ指定検索           | `chat/file/skill`で検索条件が反映される    | `historySearchSlice.test.ts`, `HistorySearchView.test.tsx` |
| RC-07 | HistorySearch | ページング追補             | `loadMore`で既存結果に連結                 | `historySearchSlice.test.ts`, `HistorySearchView.test.tsx` |
| RC-08 | HistorySearch | 統計取得                   | `loadHistorySearchStats`成功時に統計更新   | `historySearchSlice.test.ts`                               |
| RC-09 | HistorySearch | 統計失敗                   | `historySearchStatsError`へ文言設定        | `historySearchSlice.test.ts`                               |
| RC-10 | Main IPC      | push配信条件               | 破棄済みwindowでは配信しない               | `notificationHandlers.test.ts`                             |

## 2. 異常系強化ケース

| EC-ID | 対象                     | 入力                           | 期待エラー         | 実装テスト                      |
| ----- | ------------------------ | ------------------------------ | ------------------ | ------------------------------- |
| EC-01 | `notification:mark-read` | `notificationId` が数値        | `VALIDATION_ERROR` | `notificationHandlers.test.ts`  |
| EC-02 | `notification:mark-read` | `notificationId` が空文字/空白 | `VALIDATION_ERROR` | `notificationHandlers.test.ts`  |
| EC-03 | `history:search`         | `query` 型不一致               | `VALIDATION_ERROR` | `historySearchHandlers.test.ts` |
| EC-04 | `history:search`         | `filter` 不正値                | `VALIDATION_ERROR` | `historySearchHandlers.test.ts` |

## 3. 失敗時切り分けフロー

1. Main: sender検証結果とvalidation error codeを確認。
2. Renderer Store: `isHistorySearching`/`historySearchError` の遷移を確認。
3. UI: preload mock返却型と`data-testid`探索条件を確認。
