# Phase 11 発見事項

## Issue-01: current worktree で dev capture が起動しない

| 項目         | 内容                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| 重要度       | 中                                                                                                           |
| 症状         | `electron-vite dev` 実行時に `esbuild@0.25.12` が `@esbuild/darwin-arm64` を参照し `darwin-x64` 不整合で失敗 |
| 影響         | current build 直撮りの自動 capture が実行できない                                                            |
| 回避         | fallback review board capture を実行し、current workflow に TC 証跡を保存                                    |
| 関連未タスク | `docs/30-workflows/unassigned-task/task-fix-worktree-native-binary-guard-001.md`                             |

## Issue-02: Phase 11 capture script の stdout 詰まり

| 項目   | 内容                                                                                         |
| ------ | -------------------------------------------------------------------------------------------- |
| 重要度 | 低                                                                                           |
| 症状   | dev server 子プロセス stdout 未読でスクリプトが待機し続けることがある                        |
| 対応   | `apps/desktop/scripts/capture-ai-runtime-step02-task10-phase11.mjs` で stdout を購読して解消 |
| 状態   | 解消済み                                                                                     |
