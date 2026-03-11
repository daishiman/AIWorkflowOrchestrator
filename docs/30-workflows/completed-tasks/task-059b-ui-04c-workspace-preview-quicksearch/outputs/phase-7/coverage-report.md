# Phase 7 カバレッジレポート

## 実行コマンド

```bash
cd apps/desktop
pnpm exec vitest run --coverage \
  --coverage.reporter=json-summary \
  --coverage.reporter=text-summary \
  --coverage.include='src/renderer/views/WorkspaceView/**/*.{ts,tsx}' \
  src/renderer/views/WorkspaceView/PanelToggleBar.test.tsx \
  src/renderer/views/WorkspaceView/WorkspaceStatusBar.test.tsx \
  src/renderer/views/WorkspaceView/FileBrowserPanel.test.tsx \
  src/renderer/views/WorkspaceView/FileTreeNode.test.tsx \
  src/renderer/views/WorkspaceView/WorkspaceShell.test.tsx \
  src/renderer/views/WorkspaceView/WorkspaceView.test.tsx \
  src/renderer/views/WorkspaceView/__tests__/PreviewPanel.test.tsx \
  src/renderer/views/WorkspaceView/__tests__/PreviewErrorBoundary.test.tsx \
  src/renderer/views/WorkspaceView/__tests__/QuickFileSearch.test.tsx \
  src/renderer/views/WorkspaceView/hooks/useWorkspaceLayout.test.ts \
  src/renderer/views/WorkspaceView/hooks/usePanelResize.test.ts \
  src/renderer/views/WorkspaceView/hooks/useFileWatcher.test.ts \
  src/renderer/views/WorkspaceView/hooks/__tests__/useQuickFileSearch.test.ts
```

## 結果

| 指標       | 実績   | 基準    | 判定 |
| ---------- | ------ | ------- | ---- |
| Statements | 89.47% | 80%以上 | PASS |
| Branches   | 79.43% | 60%以上 | PASS |
| Functions  | 93.87% | 80%以上 | PASS |
| Lines      | 89.47% | 80%以上 | PASS |

## テスト資産

| 項目             | 値                                            |
| ---------------- | --------------------------------------------- |
| Test files       | 13                                            |
| Tests            | 52                                            |
| coverage summary | `apps/desktop/coverage/coverage-summary.json` |

## 判定

- Phase 7 gate は PASS
- Phase 6 へ戻す blocking gap は検出していない
