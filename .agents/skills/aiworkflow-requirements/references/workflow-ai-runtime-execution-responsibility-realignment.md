# AI Runtime Execution Responsibility Realignment ワークフロー仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。
> 管理: `.claude/skills/aiworkflow-requirements/references/`

## 概要

`TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001` を起点に、`auth mode toggle` 由来の認識を `execution responsibility / access capability` 契約へ再配線する current canonical workflow。

本仕様は `workflow-ai-runtime-authmode-unification.md` の historical predecessor を保持したまま、current task 名と current vocabulary で逆引きできる入口を提供する。

## current canonical set

| 区分 | canonical docs |
| --- | --- |
| workflow root docs | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md`, `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md`, `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md`, `docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md`, `docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md`, `docs/30-workflows/step-02-seq-task-02-runtime-policy-centralization/index.md` |
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
| workflow planning / task decomposition | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md`, `docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md`, `docs/30-workflows/step-02-seq-task-02-runtime-policy-centralization/index.md` | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md` |
| runtime policy centralization task 実体 | `docs/30-workflows/step-02-seq-task-02-runtime-policy-centralization/index.md`, `docs/30-workflows/step-02-seq-task-02-runtime-policy-centralization/outputs/phase-2/contract-matrix.md`, `docs/30-workflows/step-02-seq-task-02-runtime-policy-centralization/outputs/phase-3/gate-decision.md` | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-03-par-task-03-settings-shell-access-matrix-mainline/phase-1-requirements.md`, `docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-03-par-task-04-chat-workspace-guidance-action-wiring/phase-1-requirements.md`, `docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-03-par-task-05-terminal-handoff-surface-realization/phase-1-requirements.md` |
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

## 実装ステータススナップショット（2026-03-21）

- Task02（`TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001`）は **design workflow close-out 完了**。workflow root は `implementation_ready`、completed ledger は `spec_created` として扱う。
- `apps/desktop` / `packages/shared` には centralization を end-to-end で閉じる Task02 起点の実装差分はまだ存在しない。
- downstream Task03-09 は parent workflow 上で `spec_created` / `not_started` のまま。
- current code には `skillHandlers.ts` / `agentHandlers.ts` の旧 resolver 依存、`aiHandlers.ts` の policy bypass + `AI_CHECK_CONNECTION` legacy handler、`RuntimeSkillCreatorFacade.ts` の decision 未消費、shared transport / test coverage 不足が残っている。

## Follow-up Backlog

| Task | 内容 | 仕様書 |
| --- | --- | --- |
| TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001 | current code に残る centralization 未完了箇所を実装・共有契約・テストまで収束させる | `docs/30-workflows/unassigned-task/task-imp-runtime-policy-centralization-implementation-closure-001.md` |
| UT-CLEANUP-AI-CHECK-CONNECTION-001 | `llm:check-health` への移行完了後に `AI_CHECK_CONNECTION` legacy handler / channel / preload API を削除する | `docs/30-workflows/unassigned-task/UT-CLEANUP-AI-CHECK-CONNECTION-001.md` |
| UT-CLEANUP-RUNTIME-RESOLVER-001 | 全 surface の policy consumer 移行完了後に deprecated `RuntimeResolver` を削除する | `docs/30-workflows/unassigned-task/UT-CLEANUP-RUNTIME-RESOLVER-001.md` |
| UT-DESIGN-SANITIZE-PLACEMENT-001 | `sanitizeForRenderer()` の配置先を Task04 着手前に確定する | `docs/30-workflows/unassigned-task/UT-DESIGN-SANITIZE-PLACEMENT-001.md` |
