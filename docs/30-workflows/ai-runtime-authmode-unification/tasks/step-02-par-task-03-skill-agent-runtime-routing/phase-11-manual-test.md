# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 11                                                                                                                                                                                  |
| Phase名    | 手動テスト                                                                                                                                                                          |
| タスクID   | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001                                                                                                                                            |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証）、Phase 10（最終レビュー） |
| 後続Phase  | Phase 12（ドキュメント）                                                                                                                                                            |
| ステータス | not_started                                                                                                                                                                         |
| 作成日     | 2026-03-13                                                                                                                                                                          |
| 機能名     | skill-agent-runtime-routing                                                                                                                                                         |

## 目的

Skill / Agent / Skill Creator の runtime ルーティング統一 の代表シナリオを手動で確認する。

## 実行タスク

- skill execute 確認: API key で integrated execute が動くことを確認する
- terminal handoff 確認: skill / agent / creator から terminal launcher と prompt bundle が返ることを確認する
- creator handoff 確認: creator から improve と execute への handoff を確認する
- permission UI 確認: permission dialog と runtime banner の整合を確認する

## テストケース

| テストケース | 目的                     | 期待結果                                                        |
| ------------ | ------------------------ | --------------------------------------------------------------- |
| TC-11-01     | integrated skill execute | permission と preflight の契約が維持される                      |
| TC-11-02     | terminal handoff         | launcher、prompt bundle、manual boundary が UI 契約通りに見える |
| TC-11-03     | creator handoff          | Planner、Executor、Improver が UI に漏れない                    |
| TC-11-04     | permission surface       | permission dialog と runtime banner が job 名基準で表示される   |

## 画面カバレッジマトリクス

| テストケース | 対象画面                | 状態               | 証跡計画                                  |
| ------------ | ----------------------- | ------------------ | ----------------------------------------- |
| TC-11-01     | Skill / Agent           | integrated runtime | TC-11-01-skill-agent-runtime.png          |
| TC-11-02     | Skill / Agent / Creator | terminal handoff   | TC-11-02-skill-agent-terminal-handoff.png |
| TC-11-03     | Skill Lifecycle         | creator handoff    | TC-11-03-creator-handoff.png              |
| TC-11-04     | Skill / Agent           | permission surface | TC-11-04-skill-agent-permission.png       |

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
| SkillExecutor               | `apps/desktop/src/main/services/skill/SkillExecutor.ts`          | skill execute の current path を確認する          |
| AgentExecutor               | `apps/desktop/src/main/services/agent/AgentExecutor.ts`          | agent execute の current path を確認する          |
| skillExecutionAuthPreflight | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts` | renderer preflight の current contract を確認する |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                      | パス                                                                                 | 内容                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| interfaces-agent-sdk-skill    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`    | skill lifecycle 契約正本                                   |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | execute 契約と error code 正本                             |
| claude-code-agents-workflow   | `.claude/skills/aiworkflow-requirements/references/claude-code-agents-workflow.md`   | internal orchestration 正本                                |
| security-skill-execution      | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`      | permission と trust 境界の正本                             |
| arch-electron-services        | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`        | Main service DI の正本                                     |
| pack UI/UX 正本               | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`             | skill / agent / creator の screenshot 契約と状態を確認する |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Skill / Agent / Skill Creator の runtime ルーティング統一 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

手動テスト の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

execute、preflight、permission、streaming、internal orchestration の代表シナリオを手動で確認する。

## 成果物

| 成果物         | パス                                     | 内容                                  |
| -------------- | ---------------------------------------- | ------------------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 代表シナリオの結果を記録する          |
| 撮影計画       | `outputs/phase-11/screenshot-plan.json`  | 代表画面の撮影対象と TC-ID を整理する |

## 完了条件

- [ ] 代表シナリオが PASS している
- [ ] integrated execute / permission / handoff / creator 導線が screenshot 証跡に残っている

## 次のPhase

- [Phase 12（ドキュメント）](./phase-12-documentation.md) に進む
