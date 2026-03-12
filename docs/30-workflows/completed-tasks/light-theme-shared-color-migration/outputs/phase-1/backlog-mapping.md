# Phase 1 成果物: backlog-mapping

## 統合マップ

| 種別 | パス                                                                                                                                           | 現在の扱い                                                   |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 吸収 | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/unassigned-task/task-fix-settings-light-theme-contrast-001.md`              | 本タスクの Batch D で直接解消を狙う                          |
| 参照 | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/unassigned-task/task-imp-auth-timeout-fallback-light-contrast-guard-001.md` | AuthTimeoutFallback の残件があれば Phase 12 未タスクへ移送   |
| 参照 | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/unassigned-task/task-ut-ui-03-light-secondary-text-contrast-001.md`       | token 改善教訓のみ流用。AgentView 実装は触らない             |
| 参照 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                           | Phase 12 で `spec_created` / 完了台帳 / 未タスク同期先に使う |
| 参照 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                                                         | light theme の切り分け教訓を追記する先                       |

## 重複防止ルール

- token 値を変えたくなった場合は本タスクで処理せず、foundation 側の契約へ戻す
- AuthTimeoutFallback 単独の改善は本タスクの blocker にしない
- repo-wide `white/slate/zinc` 全除去は行わず、target file 契約に限定する

## Phase 12 へ渡す候補

| 条件                                            | 送付先                                                                     |
| ----------------------------------------------- | -------------------------------------------------------------------------- |
| target file 内にまだ `white/slate/zinc` が残る  | `outputs/phase-12/unassigned-task-detection.md`                            |
| Phase 11 で light theme glare / contrast が残る | `docs/30-workflows/unassigned-task/` の新規未タスク候補                    |
| spec と実装で target file 一覧がずれる          | `ui-ux-components.md` / `ui-ux-feature-components.md` / `task-workflow.md` |
