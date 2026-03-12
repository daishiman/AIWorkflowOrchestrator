# Phase 12 成果物: unassigned-task-detection

## 判定結果

- 新規未タスク: **2件**
- 理由: Phase 11 視覚検証で確認した残課題（shared component の固定色移行 / contrast 回帰ガード）を起票し、その後 shared color migration は完了に伴い `docs/30-workflows/completed-tasks/task-fix-light-theme-shared-color-migration-001.md` へ移管、contrast guard は completed workflow と archive task spec へ同期した。

## 監査ログ

| 観点                                                                      | 結果                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| token 基盤差分由来の未実施項目                                            | 2件（正式指示書作成済み）                                                                                                                                                                                                                                                                                                                                         |
| 画面レビュー由来の新規 blocker                                            | 2件（どちらも次タスクへ分離）                                                                                                                                                                                                                                                                                                                                     |
| 配置先要件                                                                | `task-fix-light-theme-shared-color-migration-001` は起票後に `docs/30-workflows/completed-tasks/task-fix-light-theme-shared-color-migration-001.md` へ完了移管、`task-imp-light-theme-contrast-regression-guard-001` は `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/` と `docs/30-workflows/completed-tasks/unassigned-task/` に同期 |
| `audit-unassigned-tasks --json --diff-from HEAD --target-file <new-file>` | currentViolations=0（2件とも）                                                                                                                                                                                                                                                                                                                                    |
| `audit-unassigned-tasks --json --diff-from HEAD`                          | currentViolations=0 / baselineViolations=133                                                                                                                                                                                                                                                                                                                      |
| `verify-unassigned-links.js`                                              | ALL_LINKS_EXIST（missing=0）                                                                                                                                                                                                                                                                                                                                      |

## follow-up 指示書の現行配置

- `docs/30-workflows/completed-tasks/task-fix-light-theme-shared-color-migration-001.md`
- `docs/30-workflows/completed-tasks/unassigned-task/task-imp-light-theme-contrast-regression-guard-001.md`

## 補足

- `light-theme-contrast-regression-guard` は 2026-03-12 に completed workflow として完了し、正本は `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/` に、archive task spec は `docs/30-workflows/completed-tasks/unassigned-task/` に保持している。
- `light-theme-shared-color-migration` も completed workflow / completed task spec へ移管済みで、token foundation 由来 follow-up の canonical path は current backlog ではなく completed-tasks 側の archive を参照する。
