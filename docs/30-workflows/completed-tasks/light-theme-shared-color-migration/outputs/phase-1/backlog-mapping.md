# Phase 1 Output: Backlog Mapping

## 統合対象

| 既存 backlog                                    | 判断 | 理由                                |
| ----------------------------------------------- | ---- | ----------------------------------- |
| `task-fix-settings-light-theme-contrast-001.md` | 統合 | Settings domain hardcode と同一責務 |

## 分離維持対象

| 既存 backlog                                                 | 判断 | 理由                                    |
| ------------------------------------------------------------ | ---- | --------------------------------------- |
| `task-imp-auth-timeout-fallback-light-contrast-guard-001.md` | 分離 | timeout fallback 固有 UI                |
| `task-fix-accountsection-linked-provider-key-warning-001.md` | 分離 | linked-provider warning は機能課題      |
| `task-ut-ui-03-light-secondary-text-contrast-001.md`         | 分離 | token palette / secondary text 側の課題 |
| `task-imp-light-theme-contrast-regression-guard-001.md`      | 分離 | screenshot / audit 標準化タスク         |

## system spec 同期先

| 文書                                                 | 反映内容                                    |
| ---------------------------------------------------- | ------------------------------------------- |
| `ui-ux-design-system.md`                             | task registry と design token 観点          |
| `workflow-light-theme-global-remediation.md`         | token / bridge / component 分離の正本       |
| `ui-ux-settings.md`                                  | settings authenticated surface の表示契約   |
| `architecture-auth-security.md`                      | `AccountSection` / `AuthView` の境界        |
| `api-ipc-auth.md`                                    | auth state → UI 契約                        |
| `api-ipc-system.md`                                  | `ApiKeysSection` / `AuthKeySection` 契約    |
| `error-handling.md`                                  | fallback / shape guard UI の継続ルール      |
| `workflow-apikey-chat-tool-integration-alignment.md` | auth-key visibility 契約の追跡先            |
| `task-workflow.md`                                   | backlog / evidence / 未タスク導線           |
| `lessons-learned.md`                                 | current build capture、token/component 分離 |
| `ui-ux-feature-components.md`                        | Settings / Auth / Workspace の feature 追記 |
