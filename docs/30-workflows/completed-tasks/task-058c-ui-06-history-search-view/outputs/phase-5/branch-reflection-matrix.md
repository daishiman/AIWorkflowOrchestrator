# Phase 5 ブランチ反映マトリクス

| 要件 / 設計         | 実装反映先                                           | 結果                       |
| ------------------- | ---------------------------------------------------- | -------------------------- |
| タイトル変更        | `HistorySearchView/index.tsx`                        | `あなたの記録` に変更      |
| filter / stats 廃止 | `HistorySearchView/index.tsx`                        | 不要 UI を削除             |
| timeline group      | `useTimelineGroups.ts`, `TimelineGroup.tsx`          | 日付見出しでグループ化     |
| accordion           | `HistoryItemCard/*`                                  | 詳細開閉を実装             |
| observer 追補       | `useInfiniteScroll.ts`, `InfiniteScrollSentinel.tsx` | ボタン依存を廃止           |
| dedupe append       | `historySearchSlice.ts`                              | id 重複を抑止              |
| file deep-open      | `editorSlice.ts`, `EditorView/index.tsx`             | file card から editor open |
| screenshot 証跡     | `capture-task-058c-phase11-screenshots.mjs`          | Phase 11 用 png を生成     |
