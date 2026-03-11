# Phase 5 仕様同期候補

## Step 2 更新対象

| 正本仕様                      | 更新理由                                                                                         | 判定 |
| ----------------------------- | ------------------------------------------------------------------------------------------------ | ---- |
| `ui-ux-feature-components.md` | `WorkspaceView` 04A の UI責務、component 階層、Phase 11 証跡を正式化する                         | 更新 |
| `arch-state-management.md`    | local state / `workspaceSlice` / `fileSelectionSlice` / panel persist / watch guard を明文化する | 更新 |
| `task-workflow.md`            | 完了台帳、実行証跡、苦戦箇所を追加する                                                           | 更新 |
| `lessons-learned.md`          | reverse resize、callback ref、static server capture への切替教訓を残す                           | 更新 |
| `security-electron-ipc.md`    | file watch lifecycle の sender push / cleanup / allowlist 境界を追加する                         | 更新 |
| `api-ipc-system.md`           | file watch IPC contract を API 観点で明文化する                                                  | 更新 |
| `ui-ux-navigation.md`         | `workspace` view の layout mode 契約を簡潔に追記する                                             | 更新 |

## no-change 記録

| 正本仕様                   | 理由                                                                  |
| -------------------------- | --------------------------------------------------------------------- |
| `master-design.md`         | `WorkspaceView` の view 位置付け自体は既存記載で足りる                |
| `architecture-overview.md` | 層構造の新規追加はなく、既存 Renderer / Main / Preload 境界で説明可能 |
