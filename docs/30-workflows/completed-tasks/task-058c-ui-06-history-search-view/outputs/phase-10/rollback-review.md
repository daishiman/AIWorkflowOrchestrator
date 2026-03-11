# Phase 10 rollback review

## 戻し条件

| 条件                          | 監視点                     | 戻し先                                    |
| ----------------------------- | -------------------------- | ----------------------------------------- |
| timeline が描画されない       | initial render             | `HistorySearchView/index.tsx` 差し替え前  |
| observer が無限発火する       | network / log / spinner    | `useInfiniteScroll.ts` + sentinel         |
| file 導線が editor を開かない | `pendingOpenFilePath` 残留 | `editorSlice.ts` / `EditorView/index.tsx` |
| preload 契約が壊れる          | typecheck / runtime invoke | `preload/types.ts`                        |

## 判定

戻し単位は UI、observer、editor open、preload 契約の 4 つに分けて管理可能。
