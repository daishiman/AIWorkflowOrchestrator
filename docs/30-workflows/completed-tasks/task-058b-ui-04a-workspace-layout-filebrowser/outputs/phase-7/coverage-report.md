# Phase 7 カバレッジレポート

## 実行コマンド

```bash
cd apps/desktop
pnpm exec vitest run --coverage \
  --coverage.reporter=text-summary \
  --coverage.include='src/renderer/views/WorkspaceView/**/*.{ts,tsx}' \
  --coverage.include='src/main/ipc/fileHandlers.ts' \
  src/renderer/views/WorkspaceView/PanelToggleBar.test.tsx \
  src/renderer/views/WorkspaceView/WorkspaceStatusBar.test.tsx \
  src/renderer/views/WorkspaceView/FileBrowserPanel.test.tsx \
  src/renderer/views/WorkspaceView/FileTreeNode.test.tsx \
  src/renderer/views/WorkspaceView/FileContextMenu.test.tsx \
  src/renderer/views/WorkspaceView/PanelResizeHandle.test.tsx \
  src/renderer/views/WorkspaceView/WorkspaceShell.test.tsx \
  src/renderer/views/WorkspaceView/WorkspaceView.test.tsx \
  src/renderer/views/WorkspaceView/hooks/useWorkspaceLayout.test.ts \
  src/renderer/views/WorkspaceView/hooks/usePanelResize.test.ts \
  src/renderer/views/WorkspaceView/hooks/useFileWatcher.test.ts \
  src/main/ipc/fileHandlers.test.ts
```

## 結果

| 指標       | 実績   | 基準    | 判定 |
| ---------- | ------ | ------- | ---- |
| Statements | 91.64% | 80%以上 | PASS |
| Branches   | 81.78% | 60%以上 | PASS |
| Functions  | 96.36% | 80%以上 | PASS |
| Lines      | 91.64% | 80%以上 | PASS |

## 重要 hook

| hook                 | 判定                                                   |
| -------------------- | ------------------------------------------------------ |
| `useWorkspaceLayout` | 主要分岐を網羅                                         |
| `usePanelResize`     | forward / reverse / keyboard / reset を網羅            |
| `useFileWatcher`     | start / stop / debounce / guard / callback swap を網羅 |

## 総括

Phase 7 の gate は通過。Phase 6 へ戻す未達項目は検出されなかった。
