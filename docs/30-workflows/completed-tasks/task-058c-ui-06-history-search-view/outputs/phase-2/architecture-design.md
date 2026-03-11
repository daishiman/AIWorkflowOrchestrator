# Phase 2 アーキテクチャ設計

## コンポーネント構成

```text
HistorySearchView
|- HistorySearchBar
|- TimelineGroup[]
|  |- TimelineGroupHeader
|  |- ChatHistoryCard / FileHistoryCard / SkillHistoryCard
|- InfiniteScrollSentinel
|- HistoryEmptyState
```

## Hook 構成

| Hook                | 役割                                       |
| ------------------- | ------------------------------------------ |
| `useDebouncedValue` | 検索 query の 300ms デバウンス             |
| `useTimelineGroups` | 結果の降順 sort と日付グルーピング         |
| `useInfiniteScroll` | sentinel の監視と `loadMoreHistory()` 発火 |

## Store 設計

### 維持する state

- `historySearchQuery`
- `historySearchResults`
- `historySearchTotalCount`
- `historySearchHasMore`
- `historySearchError`
- `expandedItemId`
- `historySearchStats` / `historySearchStatsError`

### 削除しないが UI から切り離す state

- `historySearchFilter`
  理由: 既存 `history:search` 契約との互換維持と append 継承の簡潔性のため。UI では固定値 `all` を使う。

### 追加する state

- `hasFetchedHistory`
- `isHistoryLoadingMore`
- `pendingOpenFilePath`

## データフロー

1. `HistorySearchView` mount 時に `searchHistory("", 0, "all")` を実行する
2. input 更新は local/selector 値へ反映し、`useDebouncedValue` が 300ms 後に検索を実行する
3. `useTimelineGroups` が結果を日付ラベルごとに分割する
4. 最下部 sentinel が可視化されると `loadMoreHistory()` を実行する
5. file 導線は `requestOpenFile(path)` を store に積み、`currentView=editor` へ切り替える
6. EditorView は pending path を消費して IPC 読み込みする

## 非機能設計

| 観点                | 設計値                                      |
| ------------------- | ------------------------------------------- |
| デバウンス          | 300ms                                       |
| observer threshold  | `0.1`                                       |
| observer rootMargin | `0px 0px 200px 0px`                         |
| アコーディオン      | `button` + `aria-expanded` + region         |
| sticky header       | mobile では検索バーの直下、desktop では上端 |
| mobile search bar   | `position: sticky`                          |

## ドリフト是正方針

- `index.md` が参照する正本タスクパスは Phase 12 で現実体へ同期する
- `preload/types.ts` の旧 HistorySearch 契約は Phase 5 で現契約に揃える
