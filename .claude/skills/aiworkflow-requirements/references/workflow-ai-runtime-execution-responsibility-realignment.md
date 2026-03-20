# AI Runtime Execution Responsibility Realignment ワークフロー仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。
> 管理: `.claude/skills/aiworkflow-requirements/references/`

## 概要

`TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001` を起点に、`auth mode toggle` 由来の認識を `execution responsibility / access capability` 契約へ再配線する current canonical workflow。

本仕様は `workflow-ai-runtime-authmode-unification.md` の historical predecessor を保持したまま、current task 名と current vocabulary で逆引きできる入口を提供する。

## current canonical set

| 区分 | canonical docs |
| --- | --- |
| workflow root docs | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md`, `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md`, `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md`, `docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md`, `docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md` |
| workflow 正本 | `references/workflow-ai-runtime-execution-responsibility-realignment.md` |
| predecessor | `references/workflow-ai-runtime-authmode-unification.md` |
| auth / capability 入口 | `references/interfaces-auth.md`, `references/interfaces-auth-core.md` |
| IPC / runtime 入口 | `references/api-ipc-system.md`, `references/api-ipc-system-core.md`, `references/llm-ipc-types.md` |
| state / UI 入口 | `references/arch-state-management.md`, `references/arch-state-management-core.md`, `references/ui-ux-navigation.md`, `references/ui-ux-settings-core.md` |
| security 境界 | `references/security-electron-ipc-core.md`, `references/security-principles.md` |
| governance | `references/task-workflow.md`, `references/task-workflow-backlog.md`, `references/task-workflow-completed.md`, `references/lessons-learned.md`, `references/lessons-learned-current.md` |

## extraction matrix

| 実装・監査対象 | 先に読む | 必要に応じて読む |
| --- | --- | --- |
| workflow planning / task decomposition | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md`, `docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md` | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md` |
| UI/UX mainline / handoff | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md`, `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md` | `ui-ux-navigation.md`, `ui-ux-settings-core.md` |
| capability foundation | `interfaces-auth.md`, `interfaces-auth-core.md`, `arch-state-management-core.md` | `workflow-ai-runtime-authmode-unification.md` |
| runtime policy / health route | `api-ipc-system.md`, `api-ipc-system-core.md`, `llm-ipc-types.md` | `security-electron-ipc-core.md`, `security-principles.md` |
| settings public shell / bypass | `ui-ux-navigation.md`, `ui-ux-settings-core.md` | `lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` |
| ViewType / renderView consumer | `ui-ux-navigation.md`, `lessons-learned-viewtype-electron-ui.md` | `arch-state-management-core.md` |
| same-wave sync | `task-workflow.md`, `task-workflow-completed.md`, `task-workflow-backlog.md`, `lessons-learned.md` | `lessons-learned-current.md`, `lessons-learned-phase12-workflow-lifecycle.md` |

## 実装同期ルール

1. worktree でも `.claude/skills/aiworkflow-requirements/` を canonical root として実更新する。
2. `task-workflow.md` を completed family / backlog family の入口として扱い、child file を直接更新しても親入口を同ターンで更新する。
3. `system-spec-update-summary.md` / `documentation-changelog.md` / `phase12-task-spec-compliance-check.md` に planned wording を残さない。
4. Phase 13 は user approval 取得まで `blocked` とし、completed にしない。
