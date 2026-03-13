# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 2                                            |
| Phase名    | 設計                                         |
| タスクID   | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 |
| 前提Phase  | Phase 1（要件定義）                          |
| 後続Phase  | Phase 3（設計レビュー）                      |
| ステータス | not_started                                  |
| 作成日     | 2026-03-13                                   |
| 機能名     | ai-runtime-authmode-foundation               |

## 目的

全 surface が再利用する `access capability` 契約、`integrated runtime` 契約、`user-operated terminal surface` 契約の依存境界を設計する。

## 実行タスク

- resolver 設計: `AIAccessCapabilityResolver`、`AIRuntimeResolver`、`CredentialProvider` の責務境界を定義する
- 3層責務設計: renderer preflight、preload transport、main authority の責務分離を定義する
- 解決順設計: `legacy authMode migration`、`providerId/modelId` 解決、selected config fallback、terminal availability 反映の順序を定義する
- fallback ルール設計: silent stub fallback 禁止、silent terminal fallback 禁止、cache clear 条件を定義する

## 設計方針

- access capability と provider / engine 選択は別責務として扱う
- main process が最終 authority を持ち、renderer の preflight は UX 補助に限定する
- production 経路は資格情報不足時に fail-fast し、stub や terminal へ自動退避しない
- access card 変更時は `status/validate` 再評価、selected config 再解決、adapter cache clear、terminal availability 再読込を一連の反映単位にする
- `legacy authMode` は移行レイヤとしてのみ残し、実体の capability は `integratedRuntime` と `terminalSurface` へ正規化する

## 設計論点

| 論点                              | 採用方針                                                                                      | 判定理由                                                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| capability と provider 選択の結合 | 分離する                                                                                      | capability は実行責任、provider/model は推論先であり、結合すると selected config の再利用と UI 状態が壊れやすい |
| fail-fast と UX                   | Main は理由付き fail-fast、Renderer は guidance と launcher を補助表示する                    | 誤成功を防ぎつつ再設定導線を失わないため                                                                        |
| cache と即時反映                  | capability 変更時に adapter cache clear と terminal availability refresh を必須とする         | stale runtime や stale launcher 状態のまま Chat / Skill / Docs が動くのを防ぐため                               |
| legacy authMode の扱い            | 移行レイヤとしてのみ保持し、surface は access capability を参照する                           | 古い設定互換を保ちつつ、誤った toggle semantics を再発明しないため                                              |
| terminal handoff                  | `copy command / open cwd / launch shell` は許可、`auto send / hidden prompt injection` は禁止 | user-operated boundary を仕様として固定するため                                                                 |

## Atent Team / SubAgent 分担

| 役割                         | 主担当                                     |
| ---------------------------- | ------------------------------------------ |
| Template Compliance Agent    | phase 構造と必須セクションを維持する       |
| Runtime Contract Agent       | resolver、credential、cache 契約を定義する |
| System Spec Extraction Agent | aiworkflow-requirements の参照を抽出する   |

## 参照資料

| 参照資料                    | パス                                                                       | 内容                                                                 |
| --------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                                  | 依存する前提成果物を確認する                                         |
| pack parent index           | `docs/30-workflows/ai-runtime-authmode-unification/index.md`               | 実行順序、依存グラフ、共通方針の正本を確認する                       |
| pack design audit           | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md` | 多角的監査の結論、禁止事項、依存整合を確認する                       |
| pack UI/UX 図解             | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`      | 5図セットの画面構成、状態遷移、CTA 導線を確認する                    |
| AuthModeService             | `apps/desktop/src/main/services/auth/AuthModeService.ts`                   | legacy authMode の移行レイヤを確認する                               |
| authModeSlice               | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`                  | renderer の legacy state と changed event 受信点を確認する           |
| skillExecutionAuthPreflight | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts`           | renderer preflight が access capability を誤判定していないか確認する |
| chatEditHandlers            | `apps/desktop/src/main/handlers/chatEditHandlers.ts`                       | Workspace Chat Edit の runtime 入口と stub 経路を確認する            |
| SkillDocGenerator           | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`                | Skill Docs の queryFn DI と provider 接続点を確認する                |
| SkillExecutor               | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                    | API キー直読みに依存する経路を確認する                               |
| AgentExecutor               | `apps/desktop/src/main/services/agent/AgentExecutor.ts`                    | agent 実行の runtime 入口を確認する                                  |
| LLMAdapterFactory           | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`                  | LLM adapter の認証解決点を確認する                                   |
| ChatPanel                   | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                  | placeholder 導線と real AI chat 結線点を確認する                     |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                        | パス                                                                                                   | 内容                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| interfaces-auth                                 | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                                 | auth-mode 公開契約と error code 正本                                  |
| api-ipc-system                                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                  | AI_CHAT、auth key、selected config の IPC 正本                        |
| api-ipc-agent                                   | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                   | Workspace Chat Edit / Skill Docs 周辺の IPC 正本                      |
| interfaces-llm                                  | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                                  | Workspace Chat / LLM surface 契約の正本                               |
| llm-ipc-types                                   | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`                                   | provider/model 解決順の正本                                           |
| llm-workspace-chat-edit                         | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                         | Workspace Chat Edit 詳細契約                                          |
| interfaces-agent-sdk-executor                   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`                   | SkillExecutor / PermissionResolver / auth key DI の正本               |
| interfaces-agent-sdk-skill                      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                      | SkillService / ChatPanel / SkillDocGenerator 契約の正本               |
| security-electron-ipc                           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                           | sender 検証、secret masking、error envelope                           |
| security-skill-execution                        | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                        | 実行権限と危険ツール境界の正本                                        |
| ui-ux-settings                                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                  | access card / launcher / guidance の表示契約                          |
| ui-ux-navigation                                | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                | settings bypass と lifecycle 導線の正本                               |
| ui-ux-feature-components                        | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                        | Chat / Workspace / Skill surface 構成の正本                           |
| architecture-overview                           | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                           | 全体責務境界の正本                                                    |
| workflow-apikey-chat-tool-integration-alignment | `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | integrated runtime の selected config と auth key ルール              |
| arch-state-management                           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                           | access card / selected config / terminal availability state の正本    |
| task-workflow                                   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                   | 完了タスク / 未タスク / 証跡の正本                                    |
| lessons-learned                                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                 | DI ドリフト / spec sync 教訓の正本                                    |
| pack UI/UX 正本                                 | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                               | cross-surface の access card、handoff card、guidance block を確認する |

## UI/UX リアライズ

| 観点            | 内容                                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| 横断 UI 契約    | Access Capability Card、Runtime Banner、Handoff Card、Guidance Block の 4 パターンを shared contract にする |
| source of truth | card の状態値は Main の capability 判定を正本とし、Renderer は補助説明だけを持つ                            |
| surface 表示    | 各 surface は `ready` `handoff` `unavailable` `blocked` を共通語彙で表現する                                |
| マイクロコピー  | `この画面で自動実行する` と `terminal で手動実行する` の 2 文系を全 surface に配る                          |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、全 AI surface の access matrix foundation の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

設計 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

runtime resolver、capability evaluation、terminal boundary、IPC、cache invalidation の契約、state、security 境界を設計へ反映する。

## 成果物

| 成果物       | パス                                   | 内容                                      |
| ------------ | -------------------------------------- | ----------------------------------------- |
| 設計サマリー | `outputs/phase-2/design-summary.md`    | 責務境界、依存関係、接続順序を整理する    |
| 契約一覧     | `outputs/phase-2/contract-matrix.md`   | IPC、state、runtime 契約を一覧化する      |
| UI/UX 実体化 | `outputs/phase-2/ui-ux-realization.md` | cross-surface UI パターンと語彙を整理する |

## 完了条件

- [ ] 共通 access capability / runtime 契約が 1 つに定義されている
- [ ] bypass 経路と silent terminal fallback が禁止事項として整理されている
- [ ] selected config 解決順と legacy authMode migration 順が分離されている
- [ ] 後続タスクが依存する shared contract と terminal handoff contract が確定している
- [ ] cross-surface UI パターンと共通語彙が固定されている

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md) に進む
