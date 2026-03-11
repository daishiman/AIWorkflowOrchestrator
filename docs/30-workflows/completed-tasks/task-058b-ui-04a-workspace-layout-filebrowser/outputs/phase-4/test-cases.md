# Phase 4 テストケース一覧

## Component

| TC ID   | 対象                 | ケース               | 期待結果                                          |
| ------- | -------------------- | -------------------- | ------------------------------------------------- |
| P4-C-01 | `PanelToggleBar`     | file toggle click    | `onToggleFilePanel` が 1 回呼ばれる               |
| P4-C-02 | `PanelToggleBar`     | preview toggle click | `onTogglePreview` が 1 回呼ばれる                 |
| P4-C-03 | `FileBrowserPanel`   | workspace empty      | zero state と add folder CTA が表示される         |
| P4-C-04 | `FileBrowserPanel`   | workspace error      | alert が表示される                                |
| P4-C-05 | `FileTreeNode`       | folder ArrowRight    | folder が展開される                               |
| P4-C-06 | `FileTreeNode`       | file Enter           | 対象 file が選択される                            |
| P4-C-07 | `FileContextMenu`    | attach click         | attach callback が呼ばれる                        |
| P4-C-08 | `PanelResizeHandle`  | dblclick             | width reset callback が呼ばれる                   |
| P4-C-09 | `WorkspaceShell`     | mobile overlay       | overlay panel だけが表示される                    |
| P4-C-10 | `WorkspaceStatusBar` | selected file        | file path / ext / size / watch state が表示される |

## Hook

| TC ID   | 対象                 | ケース             | 期待結果                                |
| ------- | -------------------- | ------------------ | --------------------------------------- |
| P4-H-01 | `useWorkspaceLayout` | default state      | `chat-only` で開始する                  |
| P4-H-02 | `useWorkspaceLayout` | 1440px + both open | `3-pane` になる                         |
| P4-H-03 | `useWorkspaceLayout` | broken storage     | default 値へ復帰する                    |
| P4-H-04 | `usePanelResize`     | drag               | min / max の範囲で width 更新           |
| P4-H-05 | `usePanelResize`     | reverse drag       | preview panel 側で向きが反転する        |
| P4-H-06 | `useFileWatcher`     | file change        | 300ms debounce 後に callback が呼ばれる |
| P4-H-07 | `useFileWatcher`     | same path remount  | guard により二重 watch を回避する       |

## Integration

| TC ID   | 対象              | ケース                    | 期待結果                                                   |
| ------- | ----------------- | ------------------------- | ---------------------------------------------------------- |
| P4-I-01 | `WorkspaceView`   | load 後 file select       | file content / status bar / preview placeholder が同期する |
| P4-I-02 | `WorkspaceView`   | context menu preview open | preview panel が開く                                       |
| P4-I-03 | `WorkspaceView`   | file read failure         | error surface が表示される                                 |
| P4-I-04 | `fileHandlers.ts` | watch start               | `watchId` を返し `FILE_CHANGED` push を結線する            |
| P4-I-05 | `fileHandlers.ts` | watch stop                | watcher を停止し map から削除する                          |

## 失敗起点の観点

- `WorkspaceView` stub のままでは `WorkspaceView.test.tsx` が失敗する。
- Main 側 `FILE_WATCH_START` / `STOP` 未実装では `fileHandlers.test.ts` の watch 系ケースが失敗する。
- preview panel の reverse resize 未実装では `usePanelResize.test.ts` が失敗する。
