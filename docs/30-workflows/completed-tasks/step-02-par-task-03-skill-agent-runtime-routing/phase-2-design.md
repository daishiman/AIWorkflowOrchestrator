# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 2                                        |
| Phase名    | 設計                                     |
| タスクID   | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001 |
| 前提Phase  | Phase 1（要件定義）                      |
| 後続Phase  | Phase 3（設計レビュー）                  |
| ステータス | completed                                |
| 作成日     | 2026-03-13                               |
| 機能名     | skill-agent-runtime-routing              |

## 目的

Skill / Agent / Skill Creator が同じ runtime 契約を使いながら責務分離を保つ設計を作る。

## 実行タスク

- policy 設計: access capability 解決と engine 選択を分離した shared runtime policy を定義する
- role 設計: Planner、Executor、Improver を internal orchestration として定義する
- authority 設計: preflight、permission、streaming、session / status の authority をどこに置くか決める
- agent UI 設計: `useAgent`、AgentChatInterface、AgentSDKPage が受け取る status / error / guidance の最小公開面を定義する
- terminal handoff 設計: Claude Code terminal surface へ渡す prompt bundle、cwd、suggested command、manual retry ルールを定義する

## 設計方針

- access capability 解決は execute 入口で行い local 判定を増やさない
- internal role は UI の mode 切替にしない
- permission と preflight は既存 execute 契約を再利用する

## Agent Team / SubAgent 分担

| 役割                          | 主担当                                            | 参照仕様                                                                                                                                                   |
| ----------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundation Agent              | foundation 契約と参照順序を固定する               | workflow-ai-runtime-authmode-unification.md / resource-map.md / quick-reference.md                                                                         |
| Runtime Routing Agent         | executor、agent、creator の解決契約を整理する     | interfaces-agent-sdk-executor.md / interfaces-agent-sdk-integration.md                                                                                     |
| Lifecycle Orchestration Agent | Planner、Executor、Improver の役割を整理する      | interfaces-agent-sdk-skill.md / claude-code-agents-workflow.md / ui-ux-agent-execution.md / ui-ux-feature-components.md                                    |
| Auth-Settings Agent           | settings/auth/IPC 境界を固定する                  | ui-ux-settings.md / interfaces-auth.md / api-ipc-system.md                                                                                                 |
| Permission Agent              | preflight、permission、streaming の維持設計を行う | security-skill-execution.md / security-electron-ipc.md / arch-electron-services.md / arch-claude-cli.md                                                    |
| Ledger Agent                  | 同期先台帳と legacy 互換を管理する                | task-workflow.md / lessons-learned.md / task-workflow-backlog.md / legacy-ordinal-family-register.md / task-imp-ai-runtime-test-separation-criteria-001.md |

## 参照資料

| 参照資料                    | パス                                                                                       | 内容                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                                                  | 依存する前提成果物を確認する                          |
| pack parent index           | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                               | 実行順序、依存グラフ、共通方針の正本を確認する        |
| pack design audit           | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`                 | 多角的監査の結論、禁止事項、依存整合を確認する        |
| pack UI/UX 図解             | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`                      | 5図セットの画面構成、状態遷移、CTA 導線を確認する     |
| SkillExecutor               | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                                    | skill execute の current path を確認する              |
| AgentExecutor               | `apps/desktop/src/main/services/agent/AgentExecutor.ts`                                    | agent execute の current path を確認する              |
| skillExecutionAuthPreflight | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts`                           | renderer preflight の current contract を確認する     |
| AgentHandler                | `apps/desktop/src/main/agent/agent-handler.ts`                                             | agent IPC と SDK 実行面の current path を確認する     |
| shared AgentClient          | `packages/shared/src/agent/agent-client.ts`                                                | renderer / main をまたぐ Agent SDK 実行契約を確認する |
| useAgent                    | `apps/desktop/src/renderer/hooks/useAgent.ts`                                              | Agent Hook の runtime handoff を確認する              |
| AgentChatInterface          | `apps/desktop/src/renderer/components/organisms/AgentChatInterface/AgentChatInterface.tsx` | Agent chat UI の state / streaming surface を確認する |
| AgentSDKPage                | `apps/desktop/src/renderer/pages/AgentSDKPage/index.tsx`                                   | Agent SDK UI surface の auth / session 契約を確認する |
| Claude CLI IPC              | `apps/desktop/src/main/claude-cli/ipc-handler.ts`                                          | terminal surface の session / launcher 契約を確認する |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                         | パス                                                                                            | 内容                                                                      |
| -------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| aiworkflow resource map          | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                | 本タスク種別の必須抽出仕様セットを固定する                                |
| aiworkflow quick reference       | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                             | 検索キーワードと参照順序を固定する                                        |
| workflow-ai-runtime-authmode     | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | foundation 契約、current canonical set、artifact inventory を継承する     |
| ui-ux-settings                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                           | Settings 3領域の UI 契約を継承する                                        |
| ui-ux-feature-components         | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                 | surface責務とUIコンポーネント境界を継承する                               |
| interfaces-auth                  | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                          | capability / auth-mode 契約を継承する                                     |
| api-ipc-system                   | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                           | runtime 解決と IPC 経路契約を継承する                                     |
| legacy register                  | `.claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md`           | 旧 filename 互換管理を確認する                                            |
| interfaces-agent-sdk-skill       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`               | skill lifecycle 契約正本                                                  |
| interfaces-agent-sdk             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`                     | Agent SDK 基本契約と型の正本                                              |
| interfaces-agent-sdk-ui          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`                  | Agent SDK UI / Hook の正本                                                |
| interfaces-agent-sdk-executor    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`            | execute 契約と error code 正本                                            |
| interfaces-agent-sdk-integration | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md`         | Claude CLI / Agent SDK 統合の正本                                         |
| claude-code-agents-workflow      | `.claude/skills/aiworkflow-requirements/references/claude-code-agents-workflow.md`              | internal orchestration 正本                                               |
| ui-ux-agent-execution            | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                    | Agent surface の UI 契約                                                  |
| security-skill-execution         | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                 | permission と trust 境界の正本                                            |
| security-electron-ipc            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                    | IPC sender / error envelope の正本                                        |
| arch-electron-services           | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`                   | Main service DI の正本                                                    |
| arch-claude-cli                  | `.claude/skills/aiworkflow-requirements/references/arch-claude-cli.md`                          | Claude Code terminal / session / preload architecture の正本              |
| task-workflow                    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                            | 完了記録と関連未タスクの同期先を固定する                                  |
| lessons-learned                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                          | 苦戦箇所と再利用手順の同期先を固定する                                    |
| task-workflow-backlog            | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                    | follow-up未タスクの台帳状態を確認する                                     |
| follow-up 未タスク               | `docs/30-workflows/unassigned-task/task-imp-ai-runtime-test-separation-criteria-001.md`         | AI runtime/authmode の継続改善タスクを確認する                            |
| pack UI/UX 正本                  | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                        | skill / agent / creator の permission、handoff、runtime banner を確認する |

## UI/UX リアライズ

| 観点             | 内容                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| 画面構成         | lifecycle panel、execution bar、permission dialog、result summary、terminal handoff card で構成する |
| Primary CTA      | `実行する` または `改善する`                                                                        |
| Secondary CTA    | `terminal で続ける` `権限詳細を見る`                                                                |
| 状態             | `preflight` `permission` `streaming` `handoff` `failed` `completed` を扱う                          |
| マイクロコピー   | internal role は見せず、`作成` `実行` `改善` の job 名で統一する                                    |
| アクセシビリティ | permission dialog、handoff card、execution log の順に focus できるようにする                        |
| 常設導線         | lifecycle header に固定 `Terminal` ボタンを置き、どの job からでも terminal dock を開けるようにする |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Skill / Agent / Skill Creator の runtime ルーティング統一 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

設計 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

execute、preflight、permission、streaming、internal orchestration の契約、state、IPC、security 境界を設計へ反映する。

## 成果物

| 成果物       | パス                                   | 内容                                                          |
| ------------ | -------------------------------------- | ------------------------------------------------------------- |
| 設計サマリー | `outputs/phase-2/design-summary.md`    | 責務境界、依存関係、接続順序を整理する                        |
| 契約一覧     | `outputs/phase-2/contract-matrix.md`   | IPC、state、runtime 契約を一覧化する                          |
| UI/UX 実体化 | `outputs/phase-2/ui-ux-realization.md` | execution bar、permission、handoff、result summary を整理する |

## 完了条件

- [ ] shared runtime policy が Skill / Agent / Creator / Agent SDK UI / Hook / CLI まで定義されている
- [ ] internal role と UI surface の責務分離が明文化されている
- [ ] permission / streaming / terminal handoff の UI 状態と導線が定義されている

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md) に進む
