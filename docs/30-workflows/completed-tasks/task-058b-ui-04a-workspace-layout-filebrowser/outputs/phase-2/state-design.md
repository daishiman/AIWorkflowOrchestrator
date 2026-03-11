# Phase 2 状態設計

## state 配置

| state                                                                  | 置き場所                   | 理由                                   |
| ---------------------------------------------------------------------- | -------------------------- | -------------------------------------- |
| `workspace`, `folderFileTrees`, `workspaceIsLoading`, `workspaceError` | `workspaceSlice`           | 既存責務のまま再利用                   |
| `selectedFiles`                                                        | `fileSelectionSlice`       | file context 連携の既存契約            |
| `fileContexts`                                                         | `chatEditSlice`            | 04B 連携の既存契約                     |
| `selectedFilePath`                                                     | local state                | 04A view 固有で 04B/04C 境界に流すだけ |
| `selectedFileContent` / `selectedFileMeta`                             | local state                | watcher 再読込の transient state       |
| `isFilePanelOpen`, `isPreviewOpen`, `layoutMode`                       | local state + localStorage | UI 固有                                |
| `filePanelWidth`, `previewPanelWidth`                                  | local state + localStorage | UI 固有数値                            |
| `activeOverlayPanel`                                                   | local state                | mobile 専用                            |
| `watchStatus`, `watchError`                                            | local state                | 画面表示専用                           |

## selector ルール

- `useWorkspace`, `useFolderFileTrees`, `useWorkspaceLoading`, `useWorkspaceError`, `useAddFolder`, `useSetWorkspaceSelectedFile` を個別利用する。
- `selectedFiles` や派生 filter は合成 selector を増やさない。
- 配列派生が必要な場合のみ `useShallow` を使う。

## 状態遷移

1. mount 時に `loadWorkspace()`
2. folder ありなら tree を表示、なければ zero state
3. file click / keyboard select で `selectedFilePath` 更新
4. `setWorkspaceSelectedFile()` と `file:read` を実行
5. `useFileWatcher` が watch 再接続
6. `file:changed` 受信時に metadata / status bar を更新
