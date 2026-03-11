# Phase 1 要件定義書

## 調査サマリー

| 項目                 | 現状                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| `WorkspaceView`      | `apps/desktop/src/renderer/views/WorkspaceView/index.tsx` は stub 表示のみ |
| `workspaceSlice`     | load/save/add/remove folder、tree 読込、selected file 永続化を実装済み     |
| `fileSelectionSlice` | `selectedFiles` の追加・削除・並べ替え・エラー保持を実装済み               |
| `SlideInPanel`       | overlay、Escape close、focus trap を実装済み                               |
| `MasterDetailLayout` | desktop / mobile overlay の基本レイアウト部品として再利用可能              |
| `file:watch-*`       | preload 契約はあるが Main の `fileHandlers.ts` に handler 未実装           |

## 機能要件

| 要件ID | 要件                                                                                                        | 根拠                       |
| ------ | ----------------------------------------------------------------------------------------------------------- | -------------------------- |
| FR-01  | 初期表示は `chat-only` とし、中央ペインを主役にする                                                         | 元タスク 3.1 / 3.2         |
| FR-02  | 上部トグルで file panel と preview panel を独立開閉できる                                                   | 元タスク 3.4               |
| FR-03  | 両トグル ON かつ 1440px 以上では `3-pane` に遷移する                                                        | 元タスク 3.1 / 3.3         |
| FR-04  | 1024px 未満では panel を overlay 表示し、`SlideInPanel` 契約に合わせる                                      | 元タスク 3.3 / 3.5         |
| FR-05  | file panel は `workspaceSlice.folderFileTrees` を再帰描画する                                               | 元タスク 3.2 / 3.7         |
| FR-06  | ファイル選択時に `workspace.lastSelectedFileId`、status bar、file context 連携導線を更新する                | 元タスク 2 / 4、既存 store |
| FR-07  | watcher は `file:watch-start` / `file:watch-stop` / `file:changed` を使って選択中ファイルの再読込に接続する | 元タスク 5、preload 契約   |
| FR-08  | layout mode は `workspace-layout-mode`、panel size は `workspace-panel-sizes` に永続化する                  | 元タスク 3.1 / 3.6         |
| FR-09  | 新規 Zustand slice は追加せず、画面固有 state は local state / hook に閉じる                                | `arch-state-management.md` |
| FR-10  | 04B / 04C が後続実装できるよう、chat 本体・preview 本体は placeholder 境界に留める                          | task index / 元タスク境界  |

## 非機能要件

| 要件ID | 要件                                                                                 |
| ------ | ------------------------------------------------------------------------------------ |
| NFR-01 | toggle、tree、status bar、overlay close は WCAG 2.1 AA に合わせる                    |
| NFR-02 | Zustand は個別セレクタのみ使い、派生値には `useShallow` を必要時のみ使う             |
| NFR-03 | watcher 登録は二重登録防止ガードを持ち、unmount / 切替で必ず解除する                 |
| NFR-04 | component / hook テストは happy-dom + React Testing Library + `fireEvent` 基準に従う |
| NFR-05 | 3-pane resize は最小 / 最大幅を固定し、dblclick reset を提供する                     |

## 依存境界

| 境界            | 04A の責務                                                    | 04A に含めない責務                            |
| --------------- | ------------------------------------------------------------- | --------------------------------------------- |
| 04A ↔ 04B       | selected file path、添付導線 placeholder、chat 領域レイアウト | chat message list、prompt 実行、diff/apply UI |
| 04A ↔ 04C       | preview panel open state、selected file、placeholder          | preview renderer、本格 quick search           |
| Renderer ↔ Main | 既存 `workspace:*` / `file:*` 利用のみ                        | 新規 channel 追加                             |

## 既存資産の再利用方針

- `WorkspaceSidebar` は tree / zero state / add folder UI の土台として再利用する。
- `SlideInPanel` は mobile overlay にそのまま使う。
- `MasterDetailLayout` は実装参考に留め、04A は 3-pane 要件があるため専用 shell を用意する。
- `FileWatcher` service は Main に存在するため、IPC handler 追加時の実装基盤として流用する。
