# Phase 4 Store / IPC 契約試験計画

## Store 契約

| 契約ID | 観点                   | 期待結果                                      |
| ------ | ---------------------- | --------------------------------------------- |
| ST-01  | `hasFetchedHistory`    | 初回空状態と検索空状態の分岐に使える          |
| ST-02  | `isHistoryLoadingMore` | observer 追補中のみ sentinel loading を出せる |
| ST-03  | `mergeHistoryItems`    | append 時に id ベースで dedupe される         |
| ST-04  | `expandedItemId`       | 単一展開の toggle が安定する                  |
| ST-05  | `buildRequest()`       | query trim、limit / offset 継承が成立する     |

## IPC / preload 契約

| 契約ID | 観点                         | 期待結果                                           |
| ------ | ---------------------------- | -------------------------------------------------- |
| IPC-01 | `history:search` request     | `query`, `filter`, `limit`, `offset` shape を使う  |
| IPC-02 | `history:get-stats` response | 既存 envelope を壊さない                           |
| IPC-03 | handler trim                 | service 呼び出し前に `query.trim()` される         |
| IPC-04 | preload types                | shared 契約と旧 page/filter 型ドリフトが解消される |
| IPC-05 | renderer error surface       | handler failure が empty/error state に接続される  |

## 失敗時の戻り先

- Store 契約が崩れたら Phase 5 の slice 実装単位へ戻す
- IPC / preload 契約が崩れたら shared type と preload types の同期からやり直す
