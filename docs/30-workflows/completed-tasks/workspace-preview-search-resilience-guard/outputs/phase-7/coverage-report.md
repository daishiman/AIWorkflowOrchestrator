# Phase 7 Output: Coverage Report

## 実行結果

- ステータス: completed
- 実行方法: WorkspaceView 関連 7 test file を対象に targeted coverage を採取

## カバレッジ

| 指標       | 値                 |
| ---------- | ------------------ |
| Statements | 81.63% (2512/3077) |
| Branches   | 73.79% (397/538)   |
| Functions  | 78.41% (109/139)   |
| Lines      | 81.63% (2512/3077) |

## 対象コマンド

```bash
cd apps/desktop
pnpm exec vitest run \
  src/renderer/views/WorkspaceView/__tests__/quickFileSearchResilience.test.ts \
  src/renderer/views/WorkspaceView/__tests__/previewResilience.test.ts \
  src/renderer/views/WorkspaceView/hooks/__tests__/useQuickFileSearch.test.ts \
  src/renderer/views/WorkspaceView/__tests__/QuickFileSearch.test.tsx \
  src/renderer/views/WorkspaceView/__tests__/PreviewPanel.test.tsx \
  src/renderer/views/WorkspaceView/__tests__/PreviewErrorBoundary.test.tsx \
  src/renderer/views/WorkspaceView/WorkspaceView.test.tsx \
  --config vitest.config.ts \
  --maxWorkers 1 \
  --coverage.enabled true \
  --coverage.reporter text-summary \
  --coverage.thresholds.lines 0 \
  --coverage.thresholds.functions 0 \
  --coverage.thresholds.statements 0 \
  --coverage.thresholds.branches 0 \
  --coverage.include "src/renderer/views/WorkspaceView/**/*.ts" \
  --coverage.include "src/renderer/views/WorkspaceView/**/*.tsx"
```
