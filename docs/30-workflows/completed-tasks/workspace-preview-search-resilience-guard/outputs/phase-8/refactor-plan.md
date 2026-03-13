# Phase 8 Output: Refactor Plan

## 実施した整理

| 項目                    | 内容                                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| search logic 抽出       | `useQuickFileSearch.ts` から scoring / sort / empty state を `quickFileSearchResilience.ts` へ移動 |
| preview resilience 抽出 | timeout / retry / taxonomy helper を `previewResilience.ts` に集約                                 |
| UI error message 統一   | `PreviewPanel` と `PreviewErrorBoundary` が同じ helper で見出しを出すよう統一                      |
| state reset 明示化      | file 選択時に content / size / extension / error を先に初期化し、stale preview を防止              |

## 非採用

- new shared package 化: 今回は WorkspaceView 内で閉じた reusable utility に留めた
- IPC wrapper 共通層の新設: `file.read` 以外へ波及する設計変更になるため見送った
