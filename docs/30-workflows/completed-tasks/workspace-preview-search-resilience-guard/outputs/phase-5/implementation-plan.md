# Phase 5 Output: Implementation Plan

## 実行結果

- ステータス: completed
- 実装順序: Lane A(search utility) と Lane B(preview resilience) を先に収束し、Lane C(error taxonomy) を UI に適用、最後に Lane D(doc sync) を Phase 12 へ送った

## 変更ファイル

| Lane       | 役割                    | 主な変更ファイル                                                                                                                                    |
| ---------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| SubAgent-A | search resilience       | `apps/desktop/src/renderer/views/WorkspaceView/utils/quickFileSearchResilience.ts`, `hooks/useQuickFileSearch.ts`, `components/QuickFileSearch.tsx` |
| SubAgent-B | preview read resilience | `apps/desktop/src/renderer/views/WorkspaceView/utils/previewResilience.ts`, `index.tsx`                                                             |
| SubAgent-C | taxonomy / fallback UI  | `components/PreviewPanel/PreviewPanel.tsx`, `components/PreviewPanel/PreviewErrorBoundary.tsx`                                                      |
| SubAgent-D | test / docs sync        | `__tests__/quickFileSearchResilience.test.ts`, `__tests__/previewResilience.test.ts`, `WorkspaceView.test.tsx`, workflow `outputs/phase-*`          |

## 実装判断

- 新規 IPC は追加せず、`window.electronAPI.file.read` を `readPreviewFileWithResilience()` でラップした
- search match gate は `buildSearchResults()` に寄せ、hook から scoring detail を排除した
- parse failure は recoverable error として `preview-structured-fallback-alert` へ分離した
- transport / parse / crash / no-match を `PreviewSurfaceError` に揃え、heading と status text を helper 化した
