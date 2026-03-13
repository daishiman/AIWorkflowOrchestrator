# Phase 4 Output: Test Case Matrix

| ID    | concern                              | 種別        | 実装先                              | 結果 |
| ----- | ------------------------------------ | ----------- | ----------------------------------- | ---- |
| T4-01 | no-match は候補を残さない            | unit        | `quickFileSearchResilience.test.ts` | PASS |
| T4-02 | 同スコアは path 順で deterministic   | unit        | `quickFileSearchResilience.test.ts` | PASS |
| T4-03 | query 空文字は idle state            | unit        | `quickFileSearchResilience.test.ts` | PASS |
| T4-04 | top 10 制御                          | hook        | `useQuickFileSearch.test.ts`        | PASS |
| T4-05 | `Cmd/Ctrl+P` と Arrow/Enter/Escape   | hook        | `useQuickFileSearch.test.ts`        | PASS |
| T4-06 | Quick Search empty state             | component   | `QuickFileSearch.test.tsx`          | PASS |
| T4-07 | timeout 5秒 + 3回 retry              | unit        | `previewResilience.test.ts`         | PASS |
| T4-08 | read failure detail 保持             | unit        | `previewResilience.test.ts`         | PASS |
| T4-09 | parse failure は source fallback     | component   | `PreviewPanel.test.tsx`             | PASS |
| T4-10 | transport error は taxonomy heading  | component   | `PreviewPanel.test.tsx`             | PASS |
| T4-11 | render crash reset                   | component   | `PreviewErrorBoundary.test.tsx`     | PASS |
| T4-12 | workspace 統合で timeout status 表示 | integration | `WorkspaceView.test.tsx`            | PASS |
