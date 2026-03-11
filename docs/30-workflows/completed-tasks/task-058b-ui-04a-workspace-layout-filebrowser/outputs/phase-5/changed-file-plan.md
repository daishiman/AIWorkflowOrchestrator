# Phase 5 変更ファイル計画

## Renderer

| パス                                                                        | 種別 | 内容                                   |
| --------------------------------------------------------------------------- | ---- | -------------------------------------- |
| `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`                   | 更新 | stub を本実装へ置換                    |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceShell.tsx`          | 追加 | 3-pane / overlay shell                 |
| `apps/desktop/src/renderer/views/WorkspaceView/FileBrowserPanel.tsx`        | 追加 | file tree / zero state / error surface |
| `apps/desktop/src/renderer/views/WorkspaceView/FileTreeNode.tsx`            | 追加 | tree item + keyboard nav               |
| `apps/desktop/src/renderer/views/WorkspaceView/FileContextMenu.tsx`         | 追加 | attach / preview shortcut              |
| `apps/desktop/src/renderer/views/WorkspaceView/PanelToggleBar.tsx`          | 追加 | file / preview toggle                  |
| `apps/desktop/src/renderer/views/WorkspaceView/PanelResizeHandle.tsx`       | 追加 | drag / keyboard / reset handle         |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceStatusBar.tsx`      | 追加 | selected file / watch state bar        |
| `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceLayout.ts` | 追加 | mode 計算 / persist / breakpoint       |
| `apps/desktop/src/renderer/views/WorkspaceView/hooks/usePanelResize.ts`     | 追加 | width clamp / drag / reverse drag      |
| `apps/desktop/src/renderer/views/WorkspaceView/hooks/useFileWatcher.ts`     | 追加 | watch lifecycle / debounce / guard     |
| `apps/desktop/src/renderer/views/WorkspaceView/hooks/useFileContextMenu.ts` | 追加 | context menu state                     |
| `apps/desktop/src/renderer/main.tsx`                                        | 更新 | Phase 11 harness route を追加          |

## Main / Script

| パス                                                                  | 種別 | 内容                                       |
| --------------------------------------------------------------------- | ---- | ------------------------------------------ |
| `apps/desktop/src/main/ipc/fileHandlers.ts`                           | 更新 | watch start / stop の Main handler を追加  |
| `apps/desktop/scripts/capture-task-058b-workspace-layout-phase11.mjs` | 追加 | static preview ベースの screenshot capture |

## Tests

- Renderer component / hook test 11ファイルを追加または更新した。
- Main IPC `fileHandlers.test.ts` に watch 系ケースを追加した。
