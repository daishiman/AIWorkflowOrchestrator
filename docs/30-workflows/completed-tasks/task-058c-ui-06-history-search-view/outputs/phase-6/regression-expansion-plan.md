# Phase 6 回帰拡充計画

## 追加した回帰観点

| 分類       | 追加内容                           | 反映先                                                     |
| ---------- | ---------------------------------- | ---------------------------------------------------------- |
| Search     | デバウンス後の絞り込み、trim query | `HistorySearchView.test.tsx`, `historySearchSlice.test.ts` |
| Timeline   | 日付グループ、`日付不明` 退避      | `useTimelineGroups.test.tsx`                               |
| Pagination | observer 発火時のみ追補            | `useInfiniteScroll.test.tsx`                               |
| Store      | dedupe append、初回取得状態        | `historySearchSlice.test.ts`                               |
| IPC        | trim 済み query の service 伝搬    | `historySearchHandlers.test.ts`                            |
| Navigation | file card から editor open         | `HistorySearchView.test.tsx`                               |

## 実行結果

- 対象 test suite: 5 files / 26 tests
- 2026-03-10 に PASS
- 旧 stats/filter 前提テストは timeline 前提に全面更新済み
