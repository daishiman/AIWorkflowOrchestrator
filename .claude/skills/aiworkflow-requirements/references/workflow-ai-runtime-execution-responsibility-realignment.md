# AI Runtime Execution Responsibility Realignment ワークフロー仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。
> 管理: `.claude/skills/aiworkflow-requirements/references/`

## 概要

`TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001` を起点に、`auth mode toggle` 由来の認識を `execution responsibility / access capability` 契約へ再配線する current canonical workflow。

本仕様は `workflow-ai-runtime-authmode-unification.md` の historical predecessor を保持したまま、current task 名と current vocabulary で逆引きできる入口を提供する。

## current canonical set

| 区分 | canonical docs |
| --- | --- |
| workflow root docs | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md`, `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md`, `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md`, `docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md`, `docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md`, `docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/index.md`, `docs/30-workflows/step-03-par-task-04-chat-workspace-guidance-action-wiring/index.md` |
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
| workflow planning / task decomposition | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md`, `docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md`, `docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/index.md` | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md` |
| runtime policy centralization task 実体 | `docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/index.md`, `docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/outputs/phase-2/contract-matrix.md`, `docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/outputs/phase-3/gate-decision.md` | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-03-par-task-03-settings-shell-access-matrix-mainline/phase-1-requirements.md`, `docs/30-workflows/step-03-par-task-04-chat-workspace-guidance-action-wiring/index.md`, `docs/30-workflows/step-03-par-task-04-chat-workspace-guidance-action-wiring/phase-1-requirements.md`, `docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-03-par-task-05-terminal-handoff-surface-realization/phase-1-requirements.md` |

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
- Task04（`TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001`）は **design workflow close-out 完了**。workflow root は `implementation_ready`、completed ledger は `spec_created`、Phase 13 は user approval まで blocked。Task04 follow-up は `UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001` / `UT-IMP-CHAT-WORKSPACE-GUIDANCE-RETRY-CONNECTION-IPC-001` / `UT-CLEANUP-CHAT-WORKSPACE-GUIDANCE-STATE-001` / `UT-DESIGN-CHAT-WORKSPACE-GUIDANCE-REASON-PRIORITY-001` の 4件。
- Task05（`TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001`）は **design workflow close-out 完了**。workflow root は `implementation_ready`、completed ledger は `spec_created`、Phase 13 は user approval まで blocked。Task05 follow-up は `UT-EXECUTION-ENV-TERMINAL-001` 等 8 件。
- Task06（`TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001`）は **design workflow close-out 完了**。standalone root は `docs/30-workflows/completed-tasks/step-04-seq-task-06-transcript-to-chat-provenance-linkage/`。TranscriptProvenance 型定義（5フィールド）/ 3操作フロー / provenance chip 設計確定。workflow root は `implementation_ready`、completed ledger は `spec_created`、Phase 13 は user approval まで blocked。Task06 follow-up は `UT-TRANSCRIPT-M-1` / `UT-TRANSCRIPT-M-2` の 2 件。
- focused lane `TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001` は `RuntimePolicyResolver` / `RuntimeSkillCreatorFacade` / `creatorHandlers.ts` の direct caller capability bridge を **Phase 1-12 完了**（Phase 13 は user approval 未取得のため blocked）。`resolveCapability()` を authority とし、4状態 switch + `assertNoSilentFallback` enforcement、`execute()` の terminal handoff 分岐、`creatorHandlers.test.ts` による boundary 正規化検証を実装済み。
- `apps/desktop` / `packages/shared` には centralization を end-to-end で閉じる Task02 起点の実装差分はまだ存在しない。
- downstream Task03-09 は parent workflow 上で `spec_created` / `not_started` のまま。
- current code には `skillHandlers.ts` / `agentHandlers.ts` の旧 resolver 依存、`aiHandlers.ts` の policy bypass + `AI_CHECK_CONNECTION` legacy handler、public `skill-creator:*` surface と internal `creator:*` adapter の未統合、`resolveFromServices()` の subscription service 未統合が残っている。

## Follow-up Backlog

| Task | 内容 | 仕様書 |
| --- | --- | --- |
| TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001 | current code に残る centralization 未完了箇所を実装・共有契約・テストまで収束させる | `docs/30-workflows/unassigned-task/task-imp-runtime-policy-centralization-implementation-closure-001.md` |
| UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001 | blocked guidance から terminal 起動 action を追加する | `docs/30-workflows/unassigned-task/UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001.md` |
| UT-IMP-CHAT-WORKSPACE-GUIDANCE-RETRY-CONNECTION-IPC-001 | blocked guidance から retry connection IPC を追加する | `docs/30-workflows/unassigned-task/UT-IMP-CHAT-WORKSPACE-GUIDANCE-RETRY-CONNECTION-IPC-001.md` |
| UT-CLEANUP-CHAT-WORKSPACE-GUIDANCE-STATE-001 | chat/workspace guidance state の重複と stale branch を整理する | `docs/30-workflows/unassigned-task/UT-CLEANUP-CHAT-WORKSPACE-GUIDANCE-STATE-001.md` |
| UT-DESIGN-CHAT-WORKSPACE-GUIDANCE-REASON-PRIORITY-001 | guidance reason priority / fallback ルールを整理する | `docs/30-workflows/unassigned-task/UT-DESIGN-CHAT-WORKSPACE-GUIDANCE-REASON-PRIORITY-001.md` |
| UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 | internal `creatorHandlers.ts` capability bridge と public `skill-creator:*` IPC / preload surface を統合する | `docs/30-workflows/unassigned-task/UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001.md` |
| UT-IMP-RUNTIME-POLICY-SUBSCRIPTION-SERVICE-INTEGRATION-001 | `RuntimePolicyResolver.resolveFromServices()` に subscription 判定 service を統合する | `docs/30-workflows/unassigned-task/UT-IMP-RUNTIME-POLICY-SUBSCRIPTION-SERVICE-INTEGRATION-001.md` |
| UT-CLEANUP-AI-CHECK-CONNECTION-001 | `llm:check-health` への移行完了後に `AI_CHECK_CONNECTION` legacy handler / channel / preload API を削除する | `docs/30-workflows/unassigned-task/UT-CLEANUP-AI-CHECK-CONNECTION-001.md` |
| UT-CLEANUP-RUNTIME-RESOLVER-001 | 全 surface の policy consumer 移行完了後に deprecated `RuntimeResolver` を削除する | `docs/30-workflows/unassigned-task/UT-CLEANUP-RUNTIME-RESOLVER-001.md` |
| UT-DESIGN-SANITIZE-PLACEMENT-001 | `sanitizeForRenderer()` の配置先を Task04 着手前に確定する | `docs/30-workflows/unassigned-task/UT-DESIGN-SANITIZE-PLACEMENT-001.md` |
| UT-TRANSCRIPT-M-1 | TranscriptProvenance.sourceType に `'file'` を追加し、SelectedFile source 対応 | `docs/30-workflows/unassigned-task/ut-transcript-m1-selected-file-source.md` |
| UT-TRANSCRIPT-M-2 | TranscriptSession 型の独立設計（OP-3 専用メタデータ格納） | `docs/30-workflows/unassigned-task/ut-transcript-m2-session-type.md` |
