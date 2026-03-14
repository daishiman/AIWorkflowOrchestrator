# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 13                                                                                                                                                                                                                                    |
| Phase名    | PR作成                                                                                                                                                                                                                                |
| タスクID   | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001                                                                                                                                                                                              |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証）、Phase 10（最終レビュー）、Phase 11（手動テスト）、Phase 12（ドキュメント） |
| 後続Phase  | なし                                                                                                                                                                                                                                  |
| ステータス | not_started                                                                                                                                                                                                                           |
| 作成日     | 2026-03-13                                                                                                                                                                                                                            |
| 機能名     | skill-agent-runtime-routing                                                                                                                                                                                                           |

## 目的

Skill / Agent / Skill Creator の runtime ルーティング統一 の変更範囲と証跡を PR 用に整理する。

## 実行タスク

- PR サマリ整理: skill、agent、creator への影響範囲を整理する

## 参照資料

| 参照資料                    | パス                                                             | 内容                                              |
| --------------------------- | ---------------------------------------------------------------- | ------------------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                        | 依存する前提成果物を確認する                      |
| Phase 2（設計）             | `phase-2-design.md`                                              | 依存する前提成果物を確認する                      |
| Phase 5（実装）             | `phase-5-implementation.md`                                      | 依存する前提成果物を確認する                      |
| Phase 6（テスト拡充）       | `phase-6-test-expansion.md`                                      | 依存する前提成果物を確認する                      |
| Phase 7（カバレッジ確認）   | `phase-7-coverage-check.md`                                      | 依存する前提成果物を確認する                      |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                                         | 依存する前提成果物を確認する                      |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                                   | 依存する前提成果物を確認する                      |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                                       | 依存する前提成果物を確認する                      |
| Phase 11（手動テスト）      | `phase-11-manual-test.md`                                        | 依存する前提成果物を確認する                      |
| Phase 12（ドキュメント）    | `phase-12-documentation.md`                                      | 依存する前提成果物を確認する                      |
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

PR作成 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 成果物

| 成果物          | パス                                   | 内容                   |
| --------------- | -------------------------------------- | ---------------------- |
| PR サマリ下書き | `outputs/phase-13/pr-summary-draft.md` | 変更点と証跡をまとめる |

## 完了条件

- [ ] PR 用の説明素材が揃っている

## 次のPhase

- なし（仕様書作成完了）
