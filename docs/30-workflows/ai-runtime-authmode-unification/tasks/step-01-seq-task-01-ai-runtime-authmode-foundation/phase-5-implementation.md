# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 5                                            |
| Phase名    | 実装                                         |
| タスクID   | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 |
| 前提Phase  | Phase 4（テスト作成）                        |
| 後続Phase  | Phase 6（テスト拡充）                        |
| ステータス | not_started                                  |
| 作成日     | 2026-03-13                                   |
| 機能名     | ai-runtime-authmode-foundation               |

## 目的

全 AI surface の access matrix foundation の実装順序と変更境界を整理する。

## 実行タスク

- DI 順序整理: AuthModeService、LLMAdapterFactory、SkillExecutor、AgentExecutor への DI 順序を整理する
- 切替反映整理: selected config と access capability を main 主導へ寄せる

## 参照資料

| 参照資料              | パス                                                      | 内容                                   |
| --------------------- | --------------------------------------------------------- | -------------------------------------- |
| Phase 4（テスト作成） | `phase-4-test-creation.md`                                | 依存する前提成果物を確認する           |
| AuthModeService       | `apps/desktop/src/main/services/auth/AuthModeService.ts`  | legacy authMode の移行レイヤを確認する |
| SkillExecutor         | `apps/desktop/src/main/services/skill/SkillExecutor.ts`   | API キー直読みに依存する経路を確認する |
| AgentExecutor         | `apps/desktop/src/main/services/agent/AgentExecutor.ts`   | agent 実行の runtime 入口を確認する    |
| LLMAdapterFactory     | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts` | LLM adapter の認証解決点を確認する     |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                        | パス                                                                                                   | 内容                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| interfaces-auth                                 | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`                                 | auth-mode 公開契約と error code 正本                               |
| api-ipc-system                                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                  | AI_CHAT、auth key、selected config の IPC 正本                     |
| security-electron-ipc                           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                           | sender 検証、secret masking、error envelope                        |
| ui-ux-settings                                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                  | access card / launcher / guidance の表示契約                       |
| workflow-apikey-chat-tool-integration-alignment | `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | integrated runtime の selected config と auth key ルール           |
| arch-state-management                           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                           | access card / selected config / terminal availability state の正本 |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、全 AI surface の access matrix foundation の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

実装 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

runtime resolver、credential validation、IPC、cache invalidation の実装順序と接続点を記録する。

## 成果物

| 成果物   | パス                                     | 内容                         |
| -------- | ---------------------------------------- | ---------------------------- |
| 実装計画 | `outputs/phase-5/implementation-plan.md` | 実装順序と変更対象を整理する |

## 完了条件

- [ ] 実装順序が明確になっている
- [ ] 依存タスクとの接続点が整理されている

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md) に進む
