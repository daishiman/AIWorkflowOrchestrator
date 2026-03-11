# Phase 2 コンポーネント設計

## 追加/更新対象

| 種別      | ファイル                                                  | 役割                                        |
| --------- | --------------------------------------------------------- | ------------------------------------------- |
| view      | `apps/desktop/src/renderer/views/WorkspaceView/index.tsx` | 04A 統合エントリ                            |
| component | `WorkspaceShell.tsx`                                      | 4 モード共通 shell                          |
| component | `PanelToggleBar.tsx`                                      | file / preview switch                       |
| component | `FileBrowserPanel.tsx`                                    | zero state / tree / error / add folder      |
| component | `WorkspaceStatusBar.tsx`                                  | selected file / mode / watch status         |
| component | `PreviewPlaceholderPanel.tsx`                             | 04C までの placeholder                      |
| component | `ChatPlaceholderPanel.tsx`                                | 04B までの placeholder                      |
| component | `PanelResizeHandle.tsx`                                   | pointer / keyboard resize                   |
| component | `FileTreeNode.tsx`                                        | role=treeitem, keyboard nav, recursive node |
| hook      | `useWorkspaceLayout.ts`                                   | width / toggle / persist / derived mode     |
| hook      | `usePanelResize.ts`                                       | width clamp / reset                         |
| hook      | `useFileWatcher.ts`                                       | watch lifecycle / read refresh              |

## 再利用対象

| 既存部品             | 利用方法                                                                                               |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| `WorkspaceSidebar`   | zero state と add folder UI の文言・test id を参照しつつ、04A 用 panel へ一部ロジックを移植または wrap |
| `SlideInPanel`       | mobile overlay panel に直接使用                                                                        |
| `MasterDetailLayout` | mobile overlay の構成参考。3-pane 本体は専用実装                                                       |

## test id 方針

- `workspace-view`
- `workspace-toggle-file`
- `workspace-toggle-preview`
- `workspace-file-panel`
- `workspace-chat-panel`
- `workspace-preview-panel`
- `workspace-status-bar`
- `workspace-resize-file`
- `workspace-resize-preview`
- `workspace-mobile-overlay`

## アクセシビリティ

- toggle は `role="switch"` + `aria-checked`
- tree root は `role="tree"`、node は `role="treeitem"`
- resize handle は `role="separator"` + `aria-orientation="vertical"`
- status bar は `role="status"` を使い、選択ファイル変更を読み上げ可能にする
