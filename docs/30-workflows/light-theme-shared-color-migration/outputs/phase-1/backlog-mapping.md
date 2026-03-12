# Phase 1 Output: Backlog Mapping

## 統合対象

| 既存 backlog                                    | 判断 | 理由                                |
| ----------------------------------------------- | ---- | ----------------------------------- |
| `task-fix-settings-light-theme-contrast-001.md` | 統合 | Settings domain hardcode と同一責務 |

## 分離維持対象

| 既存 backlog                                                 | 判断 | 理由                                    |
| ------------------------------------------------------------ | ---- | --------------------------------------- |
| `task-imp-auth-timeout-fallback-light-contrast-guard-001.md` | 分離 | timeout fallback 固有 UI                |
| `task-ut-ui-03-light-secondary-text-contrast-001.md`         | 分離 | token palette / secondary text 側の課題 |
| `task-imp-light-theme-contrast-regression-guard-001.md`      | 分離 | screenshot / audit 標準化タスク         |

## system spec 同期先

| 文書                          | 反映内容                                    |
| ----------------------------- | ------------------------------------------- |
| `ui-ux-design-system.md`      | task registry と design token 観点          |
| `task-workflow.md`            | backlog / evidence / 未タスク導線           |
| `lessons-learned.md`          | current build capture、token/component 分離 |
| `ui-ux-feature-components.md` | Settings / Auth / Workspace の feature 追記 |
