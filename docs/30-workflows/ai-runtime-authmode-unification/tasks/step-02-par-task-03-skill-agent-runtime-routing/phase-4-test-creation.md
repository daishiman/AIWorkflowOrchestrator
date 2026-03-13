# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| Phase      | 4                                                             |
| Phase名    | テスト作成                                                    |
| タスクID   | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001                      |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 3（設計レビュー） |
| 後続Phase  | Phase 5（実装）                                               |
| ステータス | not_started                                                   |
| 作成日     | 2026-03-13                                                    |
| 機能名     | skill-agent-runtime-routing                                   |

## 目的

Skill / Agent / Skill Creator の runtime ルーティング統一 に必要な成功系、異常系、回帰系テストを定義する。

## 実行タスク

- execute テスト定義: integrated runtime success、missing API key、terminal handoff guidance の execute テストを定義する
- trust テスト定義: permission request、abort、streaming 維持のテストを定義する

## 参照資料

| 参照資料                    | パス                                                             | 内容                                              |
| --------------------------- | ---------------------------------------------------------------- | ------------------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                        | 依存する前提成果物を確認する                      |
| Phase 2（設計）             | `phase-2-design.md`                                              | 依存する前提成果物を確認する                      |
| Phase 3（設計レビュー）     | `phase-3-design-review.md`                                       | 依存する前提成果物を確認する                      |
| SkillExecutor               | `apps/desktop/src/main/services/skill/SkillExecutor.ts`          | skill execute の current path を確認する          |
| AgentExecutor               | `apps/desktop/src/main/services/agent/AgentExecutor.ts`          | agent execute の current path を確認する          |
| skillExecutionAuthPreflight | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts` | renderer preflight の current contract を確認する |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                      | パス                                                                                 | 内容                           |
| ----------------------------- | ------------------------------------------------------------------------------------ | ------------------------------ |
| interfaces-agent-sdk-skill    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`    | skill lifecycle 契約正本       |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | execute 契約と error code 正本 |
| claude-code-agents-workflow   | `.claude/skills/aiworkflow-requirements/references/claude-code-agents-workflow.md`   | internal orchestration 正本    |
| security-skill-execution      | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`      | permission と trust 境界の正本 |
| arch-electron-services        | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`        | Main service DI の正本         |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Skill / Agent / Skill Creator の runtime ルーティング統一 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

テスト作成 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

execute、preflight、permission、streaming、internal orchestration の成功系、異常系、回帰系テストを定義する。

## 成果物

| 成果物           | パス                             | 内容                               |
| ---------------- | -------------------------------- | ---------------------------------- |
| テストマトリクス | `outputs/phase-4/test-matrix.md` | 成功系、異常系、回帰対象を整理する |

## 完了条件

- [ ] 主要成功系と異常系のテストが定義されている

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md) に進む
