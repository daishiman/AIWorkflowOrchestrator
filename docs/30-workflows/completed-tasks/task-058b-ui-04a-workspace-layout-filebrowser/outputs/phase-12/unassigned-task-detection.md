# Phase 12 未タスク検出レポート

## 判定

新規未タスク: **1件**

## 確認ソース

| ソース                                           | 結果                                                                                                       |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| 元タスク仕様                                     | 04A の責務外は既存後続タスク 04B / 04C に整理済み                                                          |
| Phase 3 / Phase 10                               | 未タスク化が必要な MINOR 指摘なし                                                                          |
| Phase 11                                         | contrast 問題は同一ターンで修正済みだが、current build source pinning と visual checklist の共通化は未実装 |
| TODO/FIXME/HACK/XXX                              | current task 差分由来の新規検出なし                                                                        |
| Phase 12 retrospective                           | `UT-IMP-WORKSPACE-PHASE11-CURRENT-BUILD-CAPTURE-GUARD-001` を追加                                          |
| `audit-unassigned-tasks --json --diff-from HEAD` | `currentViolations=0`, `baselineViolations=135`                                                            |
| `verify-unassigned-links`                        | `213/213` existing                                                                                         |

## 新規未タスク

| 未タスクID                                               | 概要                                                                                                                                               | 仕様書                                                                                                                                                          |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UT-IMP-WORKSPACE-PHASE11-CURRENT-BUILD-CAPTURE-GUARD-001 | Workspace 系 UI の screenshot source を current worktree build へ固定し、reverse resize / watcher 更新 / light theme contrast の再監査を共通化する | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/unassigned-task/task-imp-workspace-phase11-current-build-capture-guard-001.md` |

## 補足

- 04B / 04C は本タスクの依存先ではなく、既に定義済みの後続実装タスクとして扱う。
- 今回の未タスクは 04A 本体の未実装ではなく、再監査運用の自動化・共通化を扱う。
