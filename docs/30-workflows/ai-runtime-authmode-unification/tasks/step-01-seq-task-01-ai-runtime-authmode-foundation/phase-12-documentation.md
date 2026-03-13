# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 12                                                                                                                                                                                                          |
| Phase名    | ドキュメント                                                                                                                                                                                                |
| タスクID   | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001                                                                                                                                                                |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証）、Phase 10（最終レビュー）、Phase 11（手動テスト） |
| 後続Phase  | Phase 13（PR作成）                                                                                                                                                                                          |
| ステータス | completed                                                                                                                                                                                                   |
| 作成日     | 2026-03-13                                                                                                                                                                                                  |
| 更新日     | 2026-03-14                                                                                                                                                                                                  |
| 機能名     | ai-runtime-authmode-foundation                                                                                                                                                                              |

## 目的

全 AI surface の access matrix foundation の内容を system spec と task 台帳へ同期する。

## 実行タスク

- ドキュメント同期: implementation guide、changelog、未タスク、feedback を整理する

## Phase 12 必須タスク

- 実装ガイド作成: Part 1 と Part 2 の 2 部構成で implementation guide を作成する
- system spec 同期: interfaces-auth.md / api-ipc-system.md / api-ipc-agent.md / interfaces-llm.md / llm-streaming.md / llm-ipc-types.md / llm-workspace-chat-edit.md / llm-embedding.md / interfaces-agent-sdk.md / interfaces-agent-sdk-ui.md / interfaces-agent-sdk-executor.md / interfaces-agent-sdk-integration.md / interfaces-agent-sdk-skill.md / security-electron-ipc.md / security-skill-execution.md / ui-ux-settings.md / ui-ux-llm-selector.md / ui-ux-system-prompt.md / ui-ux-navigation.md / ui-ux-feature-components.md / ui-ux-agent-execution.md / architecture-overview.md / architecture-rag.md / arch-claude-cli.md / arch-state-management.md / task-workflow.md / lessons-learned.md を更新対象として固定する
- 変更履歴作成: documentation changelog を出力する
- 未タスク検出: 残件があれば formalize し、0件でも検出結果を出力する
- スキルフィードバック記録: 改善観点を 0 件でも記録する

### システム仕様同期先

- interfaces-auth.md
- api-ipc-system.md
- api-ipc-agent.md
- interfaces-llm.md
- llm-streaming.md
- llm-ipc-types.md
- llm-workspace-chat-edit.md
- llm-embedding.md
- interfaces-agent-sdk.md
- interfaces-agent-sdk-ui.md
- interfaces-agent-sdk-executor.md
- interfaces-agent-sdk-integration.md
- interfaces-agent-sdk-skill.md
- security-electron-ipc.md
- security-skill-execution.md
- ui-ux-settings.md
- ui-ux-llm-selector.md
- ui-ux-system-prompt.md
- ui-ux-navigation.md
- ui-ux-feature-components.md
- ui-ux-agent-execution.md
- architecture-overview.md
- architecture-rag.md
- arch-claude-cli.md
- arch-state-management.md
- task-workflow.md
- lessons-learned.md

## 参照資料

| 参照資料                    | パス                                                             | 内容                                                                 |
| --------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                        | 依存する前提成果物を確認する                                         |
| Phase 2（設計）             | `phase-2-design.md`                                              | 依存する前提成果物を確認する                                         |
| Phase 5（実装）             | `phase-5-implementation.md`                                      | 依存する前提成果物を確認する                                         |
| Phase 6（テスト拡充）       | `phase-6-test-expansion.md`                                      | 依存する前提成果物を確認する                                         |
| Phase 7（カバレッジ確認）   | `phase-7-coverage-check.md`                                      | 依存する前提成果物を確認する                                         |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                                         | 依存する前提成果物を確認する                                         |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                                   | 依存する前提成果物を確認する                                         |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                                       | 依存する前提成果物を確認する                                         |
| Phase 11（手動テスト）      | `phase-11-manual-test.md`                                        | 依存する前提成果物を確認する                                         |
| AuthModeService             | `apps/desktop/src/main/services/auth/AuthModeService.ts`         | legacy authMode の移行レイヤを確認する                               |
| authModeSlice               | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`        | renderer の mode 状態と changed event 受信点を確認する               |
| skillExecutionAuthPreflight | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts` | renderer preflight が access capability を誤判定していないか確認する |
| chatEditHandlers            | `apps/desktop/src/main/handlers/chatEditHandlers.ts`             | Workspace Chat Edit の runtime 入口と stub 経路を確認する            |
| SkillDocGenerator           | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`      | Skill Docs の queryFn DI と provider 接続点を確認する                |
| SkillExecutor               | `apps/desktop/src/main/services/skill/SkillExecutor.ts`          | API キー直読みに依存する経路を確認する                               |
| AgentExecutor               | `apps/desktop/src/main/services/agent/AgentExecutor.ts`          | agent 実行の runtime 入口を確認する                                  |
| AgentHandler                | `apps/desktop/src/main/agent/agent-handler.ts`                   | agent IPC と SDK 実行面の current path を確認する                    |
| useAgent                    | `apps/desktop/src/renderer/hooks/useAgent.ts`                    | Agent Hook の runtime handoff を確認する                             |
| AgentSDKPage                | `apps/desktop/src/renderer/pages/AgentSDKPage/index.tsx`         | Agent SDK UI surface の auth / session 契約を確認する                |
| Claude CLI IPC              | `apps/desktop/src/main/claude-cli/ipc-handler.ts`                | terminal surface の session / launcher 契約を確認する                |
| slide skill-executor        | `apps/desktop/src/main/slide/skill-executor.ts`                  | slide reverse-sync 系 AI 実行面を確認する                            |
| slide agent-client          | `apps/desktop/src/main/slide/agent-client.ts`                    | legacy slide agent client の direct SDK 経路を確認する               |
| LLMAdapterFactory           | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`        | LLM adapter の認証解決点を確認する                                   |
| ChatPanel                   | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`        | placeholder 導線と real AI chat 結線点を確認する                     |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                        | パス                                                                                                   | 内容                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| interfaces-auth                                 | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                                 | auth-mode 公開契約と error code 正本                               |
| api-ipc-system                                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                  | AI_CHAT、auth key、selected config の IPC 正本                     |
| api-ipc-agent                                   | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                   | Workspace Chat Edit / Skill Docs 周辺の IPC 正本                   |
| interfaces-llm                                  | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                                  | Workspace Chat / LLM surface 契約の正本                            |
| llm-streaming                                   | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`                                   | streaming contract の正本                                          |
| llm-ipc-types                                   | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`                                   | provider/model 解決順の正本                                        |
| llm-workspace-chat-edit                         | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                         | Workspace Chat Edit 詳細契約                                       |
| llm-embedding                                   | `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`                                   | embedding provider と pipeline の正本                              |
| interfaces-agent-sdk                            | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`                            | Agent SDK 基本契約と型の正本                                       |
| interfaces-agent-sdk-ui                         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`                         | Agent SDK UI / Hook の正本                                         |
| interfaces-agent-sdk-executor                   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`                   | SkillExecutor / PermissionResolver / auth key DI の正本            |
| interfaces-agent-sdk-integration                | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md`                | Claude CLI / Agent SDK 統合の正本                                  |
| interfaces-agent-sdk-skill                      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                      | SkillService / ChatPanel / SkillDocGenerator 契約の正本            |
| security-electron-ipc                           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                           | sender 検証、secret masking、error envelope                        |
| security-skill-execution                        | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                        | 実行権限と危険ツール境界の正本                                     |
| ui-ux-settings                                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                  | access card / launcher / guidance の表示契約                       |
| ui-ux-navigation                                | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                | settings bypass と lifecycle 導線の正本                            |
| ui-ux-feature-components                        | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                        | Chat / Workspace / Skill surface 構成の正本                        |
| ui-ux-agent-execution                           | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                           | Agent surface の UI 契約                                           |
| architecture-overview                           | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                           | 全体責務境界の正本                                                 |
| architecture-rag                                | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                                | RAG / graph / search の正本                                        |
| workflow-apikey-chat-tool-integration-alignment | `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | integrated runtime の selected config と auth key ルール           |
| arch-claude-cli                                 | `.claude/skills/aiworkflow-requirements/references/arch-claude-cli.md`                                 | Claude Code terminal / session / preload architecture の正本       |
| arch-state-management                           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                           | access card / selected config / terminal availability state の正本 |
| task-workflow                                   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                   | 完了タスク / 未タスク / 証跡の正本                                 |
| lessons-learned                                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                 | DI ドリフト / spec sync 教訓の正本                                 |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、全 AI surface の access matrix foundation の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

ドキュメント の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 成果物

| 成果物               | パス                                            | 内容                                                                                                          |
| -------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | Part 1 と Part 2 の 2 部構成でまとめる                                                                        |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`   | 仕様書更新履歴を残す                                                                                          |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md` | 残件があれば formalize する                                                                                   |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | 改善観点を記録する                                                                                            |
| 仕様同期計画         | `outputs/phase-12/system-spec-sync-plan.md`     | auth / IPC / LLM / Workspace Chat / Skill Executor / security / navigation / state / 台帳の更新方針を整理する |

## 完了条件

- [x] spec sync 先が定義されている
- [x] 同期先が auth / IPC / LLM / Agent SDK UI / Claude CLI / Slide / Workspace Chat / Skill Executor / RAG / security / navigation / state / 台帳まで漏れなく含まれている
- [x] 未タスク方針が明記されている

## 次のPhase

- [Phase 13（PR作成）](./phase-13-pr-creation.md) に進む
