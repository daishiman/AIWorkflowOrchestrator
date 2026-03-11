# Phase 4 テスト仕様書

## 目的

`WorkspaceView` 04A のレイアウト基盤を Red から固定し、Phase 5 で最小実装に集中できる状態を作る。

## テスト戦略

| 層          | 対象                                                                                                                                 | 方針                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Component   | `PanelToggleBar`, `FileBrowserPanel`, `FileTreeNode`, `FileContextMenu`, `PanelResizeHandle`, `WorkspaceShell`, `WorkspaceStatusBar` | 見た目ではなく contract を固定する。role / text / callback を検証する |
| Hook        | `useWorkspaceLayout`, `usePanelResize`, `useFileWatcher`                                                                             | layout mode、persist、drag、watch lifecycle の分岐を直接固定する      |
| Integration | `WorkspaceView`, `fileHandlers.ts`                                                                                                   | Renderer と Main IPC の接続を task scope で検証する                   |

## 採用したテストファイル

| ファイル                                                                         | 検証内容                                                       |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `apps/desktop/src/renderer/views/WorkspaceView/PanelToggleBar.test.tsx`          | file / preview toggle の switch contract                       |
| `apps/desktop/src/renderer/views/WorkspaceView/FileBrowserPanel.test.tsx`        | loading / zero state / tree / error / context menu action      |
| `apps/desktop/src/renderer/views/WorkspaceView/FileTreeNode.test.tsx`            | expand / select / keyboard nav / context menu                  |
| `apps/desktop/src/renderer/views/WorkspaceView/FileContextMenu.test.tsx`         | attach / preview open / close                                  |
| `apps/desktop/src/renderer/views/WorkspaceView/PanelResizeHandle.test.tsx`       | separator / drag handler delegation / dblclick                 |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceShell.test.tsx`          | inline panel / overlay panel / status bar composition          |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceStatusBar.test.tsx`      | selected file / layout / watch state / error text              |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceView.test.tsx`           | 初期表示 / file select / attach / preview open / error surface |
| `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceLayout.test.ts` | breakpoint / persist / broken storage fallback / overlay close |
| `apps/desktop/src/renderer/views/WorkspaceView/hooks/usePanelResize.test.ts`     | drag / reverse drag / keyboard / reset                         |
| `apps/desktop/src/renderer/views/WorkspaceView/hooks/useFileWatcher.test.ts`     | start / stop / debounce / guard / callback swap                |
| `apps/desktop/src/main/ipc/fileHandlers.test.ts`                                 | `FILE_WATCH_START` / `FILE_WATCH_STOP` / `FILE_CHANGED` push   |

## テスト規約

| 項目          | 採用内容                                                              |
| ------------- | --------------------------------------------------------------------- |
| DOM操作       | `fireEvent` を使用                                                    |
| 実行環境      | `happy-dom` + React Testing Library                                   |
| Store access  | 個別 selector mock のみ使用                                           |
| localStorage  | `workspace-layout-mode`, `workspace-panel-sizes` を test ごとに reset |
| watcher guard | `resetFileWatcherGuard()` で module scope guard を明示 reset          |

## 実績

- Phase 4 で設計した test surface はすべて実装済み。
- 追加テストは後続 Phase 6 で境界値・a11y・error 系まで拡張した。
