# AI Runtime Execution Responsibility Realignment ワークフロー仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。
> 管理: `.claude/skills/aiworkflow-requirements/references/`

## 概要

`TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001` を起点に、`auth mode toggle` 由来の認識を `execution responsibility / access capability` 契約へ再配線する current canonical workflow。

本仕様は `workflow-ai-runtime-authmode-unification.md` の historical predecessor を保持したまま、current task 名と current vocabulary で逆引きできる入口を提供する。

## current canonical set

| 区分 | canonical docs |
| --- | --- |
| workflow root docs | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md`, `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md`, `docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md`, `docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md`, `docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md`, `docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/index.md`, `docs/30-workflows/step-03-par-task-04-chat-workspace-guidance-action-wiring/index.md`, `docs/30-workflows/completed-tasks/task-exec-scope-definition-path-update-001/index.md` |
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
| Task01 follow-up path correction (`UT-EXEC-01`) | `docs/30-workflows/completed-tasks/task-exec-scope-definition-path-update-001/index.md`, `docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-1/scope-definition.md` | `docs/30-workflows/completed-tasks/unassigned-task/task-exec-scope-definition-path-update-001.md`, `docs/30-workflows/completed-tasks/unassigned-task/task-ut-exec-01-scope-definition-execution-capability-path.md`, `references/arch-execution-capability-contract.md` |

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
5. docs-only close-out で `scope-definition.md` の Implementation Anchor を追補する場合も、対象 source file の実在確認と completed ledger / lessons / quick-reference への same-wave sync を省略しない。
6. duplicate source / ID collision を見つけた場合は current diff 起因か wider governance baseline かを先に分離し、baseline なら新規未タスクを増やさず根拠だけを Phase 12 evidence へ残す。

## 実装ステータススナップショット（2026-03-27）

- Task02（`TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001`）は **design workflow close-out 完了**。workflow root は `implementation_ready`、completed ledger は `spec_created` として扱う。
- Task04（`TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001`）は **design workflow close-out 完了**。workflow root は `implementation_ready`、completed ledger は `spec_created`、Phase 13 は user approval まで blocked。Task04 follow-up は `UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001` / `UT-IMP-CHAT-WORKSPACE-GUIDANCE-RETRY-CONNECTION-IPC-001` / `UT-CLEANUP-CHAT-WORKSPACE-GUIDANCE-STATE-001` / `UT-DESIGN-CHAT-WORKSPACE-GUIDANCE-REASON-PRIORITY-001` の 4件。
- Task05（`TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001`）は **design workflow close-out 完了**。workflow root は `implementation_ready`、completed ledger は `spec_created`、Phase 13 は user approval まで blocked。Task05 follow-up は `UT-EXECUTION-ENV-TERMINAL-001` 等 8 件。
- Task06（`TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001`）は **design workflow close-out 完了**。standalone root は `docs/30-workflows/completed-tasks/step-04-seq-task-06-transcript-to-chat-provenance-linkage/`。TranscriptProvenance 型定義（5フィールド）/ 3操作フロー / provenance chip 設計確定。workflow root は `implementation_ready`、completed ledger は `spec_created`、Phase 13 は user approval まで blocked。Task06 follow-up は `UT-TRANSCRIPT-M-1` / `UT-TRANSCRIPT-M-2` の 2 件。
- focused lane `TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001` は `RuntimePolicyResolver` / `RuntimeSkillCreatorFacade` / `creatorHandlers.ts` の direct caller capability bridge を **Phase 1-12 完了**（Phase 13 は user approval 未取得のため blocked）。`resolveCapability()` を authority とし、4状態 switch + `assertNoSilentFallback` enforcement、`execute()` の terminal handoff 分岐、`creatorHandlers.test.ts` による boundary 正規化検証を実装済み。
- `TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001` は **Phase 1-12 完了**（2026-03-27）。`apps/desktop/src/main/ipc/index.ts` が `RuntimePolicyResolver` / `createAuthModeService()` / `StubSubscriptionAuthProvider` を共通注入し、`agentHandlers.ts` / `skillHandlers.ts` は `resolveWithService(authModeService.getMode())` を通じて `integrated_api` / `terminal_handoff` を実消費する current code に同期した。Phase 13 は user approval 未取得のため blocked。
- downstream Task03-09 は parent workflow 上で `spec_created` / `not_started` のまま。
- current code の runtime policy carry-over は `aiHandlers.ts` の policy bypass + `AI_CHECK_CONNECTION` legacy handler、slide / runtime service 側の deprecated `RuntimeResolver` 参照、sanitize helper 配置判断の 3 点に絞られた。
- TASK-SC-02-RUNTIME-POLICY-CLOSURE（2026-03-22）で RuntimePolicyResolver に ISubscriptionAuthProvider.validateToken() による subscription 判定を統合済み。3パターン分岐（integrated_api / terminal_handoff subscription / terminal_handoff no-auth）が安定動作している。
- Task07（`TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001`）は **design workflow close-out 完了**（2026-03-23）。ChatPanel review harness を task-specification-creator Phase 11 に整合。8状態定義（idle/loading/streaming/complete/error/review/guidance/terminal）、3 Lane 設計（Review Board Integration / State Machine Harness / Handoff Navigation）、GAP-01〜04 の no-op 排除設計を確定。workflow root は `implementation_ready`、completed ledger は `spec_created`、Phase 13 は user approval まで blocked。Task07 follow-up は `UT-CHATPANEL-OPEN-TERMINAL-IPC-HANDLER` / `UT-CHATPANEL-PROPS-ROLE-TYPE` / `UT-VIEWTYPE-TERMINAL-ADDITION` の 3 件。
- Task09（`TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001`）は **design workflow close-out 完了**（2026-03-23）。Canonical Source Table（5カテゴリ）、Bridge Rule（legacy 無期限保持 + 新規追加禁止）、State Machine（spec_created→implementation_ready→completed、type 別条件分岐）、Same-Wave Sync Protocol（Step A→E 順序実行）、Follow-up Formalization 3ステップを governance 仕様として確定。workflow root は `implementation_ready`、completed ledger は `spec_created`、Phase 13 は user approval まで blocked。Task09 follow-up は `UT-WORKTREE-RSYNC-CAUTION-001` の 1 件。
- `UT-EXEC-01` follow-up workflow（2026-03-27）で、Task01 Phase 10 MINOR-1 の actual target を `docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-1/scope-definition.md` に補正し、D. Implementation Anchor に `packages/shared/src/types/execution-capability.ts` を追記済み。source unassigned 2 件は actual target / duplicate reference の区別を明記した。
- UT-EXEC-01（`task-exec-scope-definition-path-update-001`）は **Phase 12 close-out sync 完了**（2026-03-27）。Task01 `scope-definition.md` の D. Implementation Anchor に `packages/shared/src/types/execution-capability.ts` を追加し、execution capability / UI state / CTA contract の実装正本を current family へ接続した。duplicate source / ID collision は wider governance baseline と判定し、新規未タスクは 0 件。

## Follow-up Backlog

| Task | 内容 | 仕様書 |
| --- | --- | --- |
| ~~TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001~~ | ~~current code に残る centralization 未完了箇所を実装・共有契約・テストまで収束させる~~ | ~~完了: 2026-03-27。current workflow `docs/30-workflows/completed-tasks/task-imp-runtime-policy-centralization-implementation-closure-001/` に Phase 1-12 成果物を出力~~ |
| UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001 | blocked guidance から terminal 起動 action を追加する | `docs/30-workflows/unassigned-task/UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001.md` |
| UT-IMP-CHAT-WORKSPACE-GUIDANCE-RETRY-CONNECTION-IPC-001 | blocked guidance から retry connection IPC を追加する | `docs/30-workflows/unassigned-task/UT-IMP-CHAT-WORKSPACE-GUIDANCE-RETRY-CONNECTION-IPC-001.md` |
| UT-CLEANUP-CHAT-WORKSPACE-GUIDANCE-STATE-001 | chat/workspace guidance state の重複と stale branch を整理する | `docs/30-workflows/unassigned-task/UT-CLEANUP-CHAT-WORKSPACE-GUIDANCE-STATE-001.md` |
| UT-DESIGN-CHAT-WORKSPACE-GUIDANCE-REASON-PRIORITY-001 | guidance reason priority / fallback ルールを整理する | `docs/30-workflows/unassigned-task/UT-DESIGN-CHAT-WORKSPACE-GUIDANCE-REASON-PRIORITY-001.md` |
| ~~UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001~~ | ~~internal `creatorHandlers.ts` capability bridge と public `skill-creator:*` IPC / preload surface を統合する~~ | ~~完了: 2026-03-21。`task-workflow-completed-ipc-contract-preload-alignment.md` を参照~~ |
| UT-IMP-RUNTIME-POLICY-SUBSCRIPTION-SERVICE-INTEGRATION-001 | `RuntimePolicyResolver.resolveFromServices()` に subscription 判定 service を統合する — **完了**（TASK-SC-02, 2026-03-22） | `docs/30-workflows/unassigned-task/UT-IMP-RUNTIME-POLICY-SUBSCRIPTION-SERVICE-INTEGRATION-001.md` |
| UT-CLEANUP-AI-CHECK-CONNECTION-001 | `llm:check-health` への移行完了後に `AI_CHECK_CONNECTION` legacy handler / channel / preload API を削除する | `docs/30-workflows/unassigned-task/UT-CLEANUP-AI-CHECK-CONNECTION-001.md` |
| UT-CLEANUP-RUNTIME-RESOLVER-001 | 全 surface の policy consumer 移行完了後に deprecated `RuntimeResolver` を削除する | `docs/30-workflows/unassigned-task/UT-CLEANUP-RUNTIME-RESOLVER-001.md` |
| UT-DESIGN-SANITIZE-PLACEMENT-001 | `sanitizeForRenderer()` の配置先を Task04 着手前に確定する | `docs/30-workflows/unassigned-task/UT-DESIGN-SANITIZE-PLACEMENT-001.md` |
| UT-TRANSCRIPT-M-1 | TranscriptProvenance.sourceType に `'file'` を追加し、SelectedFile source 対応 | `docs/30-workflows/unassigned-task/ut-transcript-m1-selected-file-source.md` |
| UT-TRANSCRIPT-M-2 | TranscriptSession 型の独立設計（OP-3 専用メタデータ格納） | `docs/30-workflows/unassigned-task/ut-transcript-m2-session-type.md` |
| UT-CHATPANEL-OPEN-TERMINAL-IPC-HANDLER | openTerminal IPC handler の確認・実装 | `docs/30-workflows/unassigned-task/ut-chatpanel-open-terminal-ipc-handler.md` |
| UT-CHATPANEL-PROPS-ROLE-TYPE | ChatPanelProps role 型追加検討 | `docs/30-workflows/unassigned-task/ut-chatpanel-props-role-type.md` |
| UT-VIEWTYPE-TERMINAL-ADDITION | ViewType に "terminal" を追加 | `docs/30-workflows/unassigned-task/ut-viewtype-terminal-addition.md` |
| UT-WORKTREE-RSYNC-CAUTION-001 | rsync コマンドの worktree 環境注意書き追加（R-15 関連） | `docs/30-workflows/unassigned-task/worktree-rsync-caution-annotation.md` |
