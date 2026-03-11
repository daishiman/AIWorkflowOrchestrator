# Phase 2 状態設計

| state                                                                | 所有者                                                | 理由                                                |
| -------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| `selectedFilePath`                                                   | `WorkspaceView` local state + 既存 workspace selector | FileBrowser / QuickSearch / Editor 導線の接点だから |
| `selectedFileContent` / `size` / `extension` / `error` / `isLoading` | `WorkspaceView` local state                           | `file:read` lifecycle を 1 箇所で閉じるため         |
| `mode` / `isWrap`                                                    | `PreviewPanel` local state                            | preview 表示の局所状態だから                        |
| `isOpen` / `query` / `results` / `selectedIndex`                     | `useQuickFileSearch`                                  | 検索ダイアログ固有の状態だから                      |
| `watchState` / `watchError`                                          | `useFileWatcher`                                      | watcher の開始/解除/失敗を hook で閉じるため        |

## store 再利用方針

- `useWorkspace`, `useFolderFileTrees`, `useSetWorkspaceSelectedFile`, `useAddFiles` を再利用
- 新規 Zustand slice は追加しない
- 04C の state は local state / hook に限定した
