# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 1                                        |
| Phase名    | 要件定義                                 |
| タスクID   | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001 |
| 前提Phase  | なし                                     |
| 後続Phase  | Phase 2（設計）                          |
| ステータス | not_started                              |
| 作成日     | 2026-03-13                               |
| 機能名     | skill-agent-runtime-routing              |

## 目的

Skill / Agent / Skill Creator の現状 integrated runtime / terminal handoff 経路を把握する。

## 実行タスク

- 経路棚卸し: SkillExecutor、SkillService、SkillScheduler、PermissionResolver、AgentExecutor、ExecutionManager、SkillCreatorService、AgentHandler、shared AgentClient、Claude CLI IPC、`useSkillExecution`、`useAgent`、Agent SDK UI の認証と runtime 経路を整理する
- 既存保証抽出: preflight、permission、streaming 契約として維持すべきものを抽出する
- role 対応付け: Planner、Executor、Improver の internal role と既存 API を対応付ける

## 参照資料

| 参照資料                    | パス                                                                                       | 内容                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| SkillExecutor               | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                                    | skill execute の current path を確認する                   |
| SkillService                | `apps/desktop/src/main/services/skill/SkillService.ts`                                     | skill execute facade と creator handoff を確認する         |
| SkillScheduler              | `apps/desktop/src/main/services/skill/SkillScheduler.ts`                                   | 実行スケジュールと runtime handoff を確認する              |
| PermissionResolver          | `apps/desktop/src/main/services/skill/PermissionResolver.ts`                               | permission と access capability の境界を確認する           |
| AgentExecutor               | `apps/desktop/src/main/services/agent/AgentExecutor.ts`                                    | agent execute の current path を確認する                   |
| ExecutionManager            | `apps/desktop/src/main/services/agent/ExecutionManager.ts`                                 | agent execution state と cancel 契約を確認する             |
| skillExecutionAuthPreflight | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts`                           | renderer preflight の current contract を確認する          |
| useSkillExecution           | `apps/desktop/src/renderer/hooks/useSkillExecution.ts`                                     | renderer skill execute hook の current contract を確認する |
| AgentHandler                | `apps/desktop/src/main/agent/agent-handler.ts`                                             | agent IPC と SDK 実行面の current path を確認する          |
| skillHandlers               | `apps/desktop/src/main/ipc/skillHandlers.ts`                                               | skill execute IPC の current authority を確認する          |
| preload skill-api           | `apps/desktop/src/preload/skill-api.ts`                                                    | preload skill API 契約を確認する                           |
| shared AgentClient          | `packages/shared/src/agent/agent-client.ts`                                                | renderer / main をまたぐ Agent SDK 実行契約を確認する      |
| useAgent                    | `apps/desktop/src/renderer/hooks/useAgent.ts`                                              | Agent Hook の runtime handoff を確認する                   |
| AgentChatInterface          | `apps/desktop/src/renderer/components/organisms/AgentChatInterface/AgentChatInterface.tsx` | Agent chat UI の state / streaming surface を確認する      |
| AgentSDKPage                | `apps/desktop/src/renderer/pages/AgentSDKPage/index.tsx`                                   | Agent SDK UI surface の auth / session 契約を確認する      |
| Claude CLI IPC              | `apps/desktop/src/main/claude-cli/ipc-handler.ts`                                          | terminal surface の session / launcher 契約を確認する      |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                         | パス                                                                                    | 内容                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| interfaces-agent-sdk-skill       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`       | skill lifecycle 契約正本                                     |
| interfaces-agent-sdk             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`             | Agent SDK 基本契約と型の正本                                 |
| interfaces-agent-sdk-ui          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`          | Agent SDK UI / Hook の正本                                   |
| interfaces-agent-sdk-executor    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`    | execute 契約と error code 正本                               |
| interfaces-agent-sdk-integration | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md` | Claude CLI / Agent SDK 統合の正本                            |
| claude-code-agents-workflow      | `.claude/skills/aiworkflow-requirements/references/claude-code-agents-workflow.md`      | internal orchestration 正本                                  |
| ui-ux-agent-execution            | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`            | Agent surface の UI 契約                                     |
| security-skill-execution         | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`         | permission と trust 境界の正本                               |
| security-electron-ipc            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`            | IPC sender / error envelope の正本                           |
| arch-electron-services           | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`           | Main service DI の正本                                       |
| arch-claude-cli                  | `.claude/skills/aiworkflow-requirements/references/arch-claude-cli.md`                  | Claude Code terminal / session / preload architecture の正本 |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Skill / Agent / Skill Creator の runtime ルーティング統一 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

要件定義 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

execute、preflight、permission、streaming、internal orchestration の接続要件を要件として明文化する。

## 成果物

| 成果物       | パス                                         | 内容                           |
| ------------ | -------------------------------------------- | ------------------------------ |
| 要件整理     | `outputs/phase-1/requirements-definition.md` | 要件、制約、受入基準を整理する |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲と除外範囲を明記する   |

## 完了条件

- [ ] runtime と auth-mode の現状経路が Skill / Agent / Creator / Agent SDK UI / Hook / CLI まで整理されている
- [ ] 維持すべき preflight と permission 契約が抜き出されている

## 次のPhase

- [Phase 2（設計）](./phase-2-design.md) に進む
