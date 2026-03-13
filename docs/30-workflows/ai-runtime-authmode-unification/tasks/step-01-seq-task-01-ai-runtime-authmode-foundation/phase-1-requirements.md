# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 1                                            |
| Phase名    | 要件定義                                     |
| タスクID   | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 |
| 前提Phase  | なし                                         |
| 後続Phase  | Phase 2（設計）                              |
| ステータス | not_started                                  |
| 作成日     | 2026-03-13                                   |
| 機能名     | ai-runtime-authmode-foundation               |

## 目的

全 AI surface × access capability × provider selection の現在地を把握し、どの経路が `Integrated API Runtime`、`Claude Code terminal handoff`、`Claude Code terminal only`、`guidance only` のどれに属するかを明文化する。ここでは `legacy authMode` を残すかどうかではなく、`実行責任` と `手動操作境界` を正しく分離することを固定する。

## 実行タスク

- 3軸 inventory: ChatView、LLM Selector、System Prompt、Workspace Chat Edit、Workspace Chat Panel、Skill、Agent、Skill Creator、Skill Docs、ChatPanel、Agent SDK UI / Hook / Claude CLI、Slide reverse sync、RAG / AI_INDEX / Embedding / Extraction / Graph Summary / CRAG / Reranking を `surface × access capability × provider/model` で整理する
- capability 分類: `integrated-api`、`terminal-handoff`、`terminal-only`、`guidance-only`、`stub/todo` の 5 区分で整理する
- state / cache 整理: selected config、adapter cache clear、再起動要否、changed event、terminal availability 更新契約の不足を列挙する
- security / permission 整理: sender 検証、error envelope、権限確認、guidance、`no auto-send` 境界の不足を列挙する

## 参照資料

| 参照資料                    | パス                                                                   | 内容                                                                 |
| --------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------- |
| AuthModeService             | `apps/desktop/src/main/services/auth/AuthModeService.ts`               | legacy authMode の移行レイヤを確認する                               |
| authModeSlice               | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`              | renderer の legacy state と changed event 受信点を確認する           |
| skillExecutionAuthPreflight | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts`       | renderer preflight が access capability を誤判定していないか確認する |
| chatEditHandlers            | `apps/desktop/src/main/handlers/chatEditHandlers.ts`                   | Workspace Chat Edit の runtime 入口と stub 経路を確認する            |
| SkillDocGenerator           | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`            | Skill Docs の queryFn DI と provider 接続点を確認する                |
| SkillExecutor               | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                | API キー直読みに依存する経路を確認する                               |
| AgentExecutor               | `apps/desktop/src/main/services/agent/AgentExecutor.ts`                | agent 実行の runtime 入口を確認する                                  |
| AgentHandler                | `apps/desktop/src/main/agent/agent-handler.ts`                         | agent IPC と SDK 実行面の current path を確認する                    |
| shared AgentClient          | `packages/shared/src/agent/agent-client.ts`                            | renderer / main をまたぐ Agent SDK 実行契約を確認する                |
| useAgent                    | `apps/desktop/src/renderer/hooks/useAgent.ts`                          | Agent Hook の runtime handoff を確認する                             |
| AgentSDKPage                | `apps/desktop/src/renderer/pages/AgentSDKPage/index.tsx`               | Agent SDK UI surface の auth / session 契約を確認する                |
| Claude CLI IPC              | `apps/desktop/src/main/claude-cli/ipc-handler.ts`                      | terminal surface の session / output / launcher 契約を確認する       |
| slide skill-executor        | `apps/desktop/src/main/slide/skill-executor.ts`                        | slide reverse-sync 系 AI 実行面を確認する                            |
| slide agent-client          | `apps/desktop/src/main/slide/agent-client.ts`                          | legacy slide agent client の direct SDK 経路を確認する               |
| SlideWorkspace              | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx`                   | slide renderer surface と reverse-sync 導線を確認する                |
| LLMAdapterFactory           | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`              | LLM adapter の認証解決点を確認する                                   |
| WorkspaceChatPanel          | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx` | workspace chat surface の runtime 接点を確認する                     |
| ChatPanel                   | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`              | placeholder 導線と real AI chat 結線点を確認する                     |
| aiHandlers                  | `apps/desktop/src/main/ipc/aiHandlers.ts`                              | AI_CHAT / AI_CHECK_CONNECTION / AI_INDEX の TODO と分岐を確認する    |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                        | パス                                                                                                   | 内容                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| interfaces-auth                                 | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                                 | legacy authMode migration と error code 正本                       |
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
| ui-ux-llm-selector                              | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`                              | selector UI の正本                                                 |
| ui-ux-system-prompt                             | `.claude/skills/aiworkflow-requirements/references/ui-ux-system-prompt.md`                             | system prompt UI の正本                                            |
| ui-ux-navigation                                | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                | settings bypass と lifecycle 導線の正本                            |
| ui-ux-feature-components                        | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                        | Chat / Workspace / Skill surface 構成の正本                        |
| ui-ux-agent-execution                           | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                           | Agent surface の UI 契約                                           |
| architecture-overview                           | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                           | 全体責務境界の正本                                                 |
| architecture-rag                                | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                                | RAG / graph / search の正本                                        |
| arch-claude-cli                                 | `.claude/skills/aiworkflow-requirements/references/arch-claude-cli.md`                                 | Claude Code terminal / session / preload 経路の正本                |
| workflow-apikey-chat-tool-integration-alignment | `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | integrated runtime の selected config と auth key ルール           |
| arch-state-management                           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                           | access card / selected config / terminal availability state の正本 |
| task-workflow                                   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                   | 完了タスク / 未タスク / 証跡の正本                                 |
| lessons-learned                                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                 | DI ドリフト / spec sync 教訓の正本                                 |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、全 AI surface の access matrix foundation の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

要件定義 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

runtime resolver、capability evaluation、terminal boundary、IPC、cache invalidation の接続要件を要件として明文化する。

## 成果物

| 成果物       | パス                                         | 内容                           |
| ------------ | -------------------------------------------- | ------------------------------ |
| 要件整理     | `outputs/phase-1/requirements-definition.md` | 要件、制約、受入基準を整理する |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲と除外範囲を明記する   |

## 完了条件

- [ ] surface inventory が ChatView / selector / prompt / Workspace Chat Panel / Agent SDK UI / Hook / Claude CLI / Slide / RAG / embedding / extraction / graph summary / CRAG / reranking まで含んでいる
- [ ] 各 surface に `integrated-api` / `terminal-handoff` / `terminal-only` / `guidance-only` / `stub/todo` の割り当てがある
- [ ] selected config / adapter cache / changed event / terminal availability の現状差分が列挙されている
- [ ] 権限確認、error envelope、`no auto-send` 境界の不足点が列挙されている

## 次のPhase

- [Phase 2（設計）](./phase-2-design.md) に進む
