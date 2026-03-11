# Phase 8 state shape review

## 追加 state

| state                  | 役割                            | 判定                 |
| ---------------------- | ------------------------------- | -------------------- |
| `hasFetchedHistory`    | 初回空状態と検索空状態の分離    | 維持                 |
| `isHistoryLoadingMore` | observer 追補中表示             | 維持                 |
| `pendingOpenFilePath`  | file card から editor deep-open | `editorSlice` に配置 |

## 維持した state

- `query`
- `historyItems`
- `historyStats`
- `expandedItemId`
- `error`
- `hasMore`

## 削除または縮退したもの

- filter UI に依存する renderer 表現
- `load more` ボタン中心の操作フロー
