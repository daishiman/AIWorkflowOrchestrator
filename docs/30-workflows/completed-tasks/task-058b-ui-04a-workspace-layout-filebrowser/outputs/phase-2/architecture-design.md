# Phase 2 アーキテクチャ設計

## レイヤ責務

| レイヤ             | 実装                                                       | 責務                                                     |
| ------------------ | ---------------------------------------------------------- | -------------------------------------------------------- |
| Renderer View      | `WorkspaceView`                                            | layout mode 判定、panel 配置、手動操作の統合             |
| Renderer Hook      | `useWorkspaceLayout`, `usePanelResize`, `useFileWatcher`   | UI 状態、persist、watch lifecycle                        |
| Renderer Component | shell / toggle / status bar / file browser / resize handle | 表示責務                                                 |
| Renderer Store     | `workspaceSlice`, `fileSelectionSlice`, `chatEditSlice`    | 永続 workspace、selected file context、chat file context |
| Preload            | `window.electronAPI.file/workspace`                        | invoke / on の安全な公開                                 |
| Main IPC           | `fileHandlers.ts`, `workspaceHandlers.ts`                  | tree/read/watch の bridge                                |
| Main Service       | `FileWatcher`                                              | chokidar ベース監視                                      |

## 依存方向

- View は hook と presentational component にのみ依存する。
- hook は selector と preload API に依存する。
- Main watcher 実装は Renderer を知らず、IPC event のみ publish する。
- 04A は 04B / 04C を import しない。placeholder slot で境界を維持する。

## レイアウトモード決定式

```ts
type WorkspaceLayoutMode =
  | "chat-only"
  | "chat+files"
  | "chat+preview"
  | "3-pane";

function resolveLayoutMode(input: {
  isFilePanelOpen: boolean;
  isPreviewOpen: boolean;
  width: number;
}): WorkspaceLayoutMode {
  if (input.isFilePanelOpen && input.isPreviewOpen && input.width >= 1440) {
    return "3-pane";
  }
  if (input.isFilePanelOpen) return "chat+files";
  if (input.isPreviewOpen) return "chat+preview";
  return "chat-only";
}
```

## Persist 方針

| key                     | 値                                                      |
| ----------------------- | ------------------------------------------------------- |
| `workspace-layout-mode` | `chat-only` / `chat+files` / `chat+preview` / `3-pane`  |
| `workspace-panel-sizes` | `{ filePanelWidth: number, previewPanelWidth: number }` |

## watcher 方針

- 選択ファイル単位で `file:watch-start` を 1 本だけ維持する。
- 切替時は旧 watch を停止してから新 watch を開始する。
- `file:changed` 受信後は対象 path 一致時のみ `file:read` を再実行する。
- hook 外に module scope guard を置き、HMR / 二重 mount 時も 1 本以上登録しない。
