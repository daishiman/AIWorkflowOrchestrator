# Phase 6 Hook / Component テストマトリクス

| 対象                | ケース                                              | 状態            |
| ------------------- | --------------------------------------------------- | --------------- |
| `useTimelineGroups` | 同日 group、降順、invalid timestamp、metadata 欠損  | 実装済み / PASS |
| `useInfiniteScroll` | observer attach、disconnect、guard 条件             | 実装済み / PASS |
| `HistorySearchView` | 初期表示、検索、accordion、empty / error、file open | 実装済み / PASS |
| `HistoryEmptyState` | 初期空 / 検索空 / error copy                        | View 経由で網羅 |
| `TimelineGroup`     | sticky 日付見出しと item rendering                  | View 経由で網羅 |

## 不足として残したもの

- `useDebouncedValue.ts` の単体テストは view 経由で観測しており、専用 test は未追加
- keyboard focus ring の見た目は自動 test ではなく Phase 11 の手動確認へ移送
