# Phase 12 成果物: unassigned-task-detection

## 判定結果

- 新規未タスク: **2件**
- 理由: Phase 11 視覚検証で確認した残課題（shared component の固定色移行 / contrast 回帰ガード）を formalize した。`task-fix-light-theme-shared-color-migration-001` は親 workflow 配下に維持し、`task-imp-light-theme-contrast-regression-guard-001` は実装完了後に completed archive へ移管した。

## 監査ログ

| 観点                                                                      | 結果                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| token 基盤差分由来の未実施項目                                            | 2件（正式指示書作成済み）                                                                                                                                                                                                                                               |
| 画面レビュー由来の新規 blocker                                            | 2件（どちらも次タスクへ分離）                                                                                                                                                                                                                                           |
| 配置先要件                                                                | `task-fix-light-theme-shared-color-migration-001` は `docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/`、`task-imp-light-theme-contrast-regression-guard-001` は実装完了後に `docs/30-workflows/completed-tasks/unassigned-task/` へ移管 |
| `audit-unassigned-tasks --json --diff-from HEAD --target-file <new-file>` | currentViolations=0（2件とも）                                                                                                                                                                                                                                          |
| `audit-unassigned-tasks --json --diff-from HEAD`                          | currentViolations=0 / baselineViolations=133                                                                                                                                                                                                                            |
| `verify-unassigned-links.js`                                              | ALL_LINKS_EXIST（missing=0）                                                                                                                                                                                                                                            |

## 新規作成した未タスク指示書

- `docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/task-fix-light-theme-shared-color-migration-001.md`
- `docs/30-workflows/completed-tasks/unassigned-task/task-imp-light-theme-contrast-regression-guard-001.md`

## 補足

- `light-theme-contrast-regression-guard` は 2026-03-12 に実装 workflow として完了し、正本は `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/` へ移管した。
- 未着手バックログとして残る正本は `docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/`（shared color migration）である。
