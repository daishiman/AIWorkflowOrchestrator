# Phase 12 システム仕様更新計画

## 更新対象

| ファイル                                                     | 更新内容                                       | 状態 |
| ------------------------------------------------------------ | ---------------------------------------------- | ---- |
| `ui-ux-feature-components.md`                                | Workspace Layout Foundation セクション追加     | 更新 |
| `arch-state-management.md`                                   | state ownership / persist / watcher guard 追加 | 更新 |
| `ui-ux-navigation.md`                                        | `workspace` ViewType の layout 契約追加        | 更新 |
| `security-electron-ipc.md`                                   | file watch lifecycle 追加                      | 更新 |
| `api-ipc-system.md`                                          | workspace file watch IPC API 追加              | 更新 |
| `task-workflow.md`                                           | 完了台帳、苦戦箇所、検証証跡追加               | 更新 |
| `lessons-learned.md`                                         | 04A 固有教訓追加                               | 更新 |
| `indexes/topic-map.md` / `indexes/keywords.json`             | 見出し追加後の索引再生成                       | 更新 |
| `task-specification-creator/references/phase-11-12-guide.md` | worktree static server capture ルール追加      | 更新 |

## no-change

| ファイル                   | 理由                                           |
| -------------------------- | ---------------------------------------------- |
| `master-design.md`         | `WorkspaceView` の view 定義は既存記載で十分   |
| `architecture-overview.md` | Renderer / Main / Preload の境界自体は変更なし |
