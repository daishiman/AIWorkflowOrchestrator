# Phase 5 変更ファイル計画

| ファイル                                                                                   | 区分 | 目的                                         |
| ------------------------------------------------------------------------------------------ | ---- | -------------------------------------------- |
| `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`                                  | 更新 | timeout/retry, preview/search 統合           |
| `apps/desktop/src/renderer/views/WorkspaceView/components/QuickFileSearch.tsx`             | 追加 | Cmd/Ctrl+P モーダル                          |
| `apps/desktop/src/renderer/views/WorkspaceView/hooks/useQuickFileSearch.ts`                | 追加 | scoring / keyboard / open-close              |
| `apps/desktop/src/renderer/views/WorkspaceView/components/PreviewPanel/*.tsx`              | 追加 | preview renderer 群                          |
| `apps/desktop/src/renderer/views/WorkspaceView/__tests__/*.test.tsx`                       | 追加 | preview/search/error boundary tests          |
| `apps/desktop/src/renderer/views/WorkspaceView/hooks/__tests__/useQuickFileSearch.test.ts` | 追加 | scoring / stable sort / keyboard tests       |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceView.test.tsx`                     | 更新 | timeout / attach / error / integration tests |
| `apps/desktop/scripts/capture-task-059b-phase11-screenshots.mjs`                           | 追加 | current build screenshot capture             |
| `apps/desktop/package.json`                                                                | 更新 | screenshot コマンド登録                      |

## 実装結果

- 変更対象は仕様範囲内に収まった
- Main / preload 契約は既存再利用のまま維持した
