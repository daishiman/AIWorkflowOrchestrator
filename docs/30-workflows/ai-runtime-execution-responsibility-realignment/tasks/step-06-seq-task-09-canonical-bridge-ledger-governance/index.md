# canonical-bridge-ledger-governance - タスク実行仕様書

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 |
| タスク名     | canonical-bridge-ledger-governance              |
| 分類         | 設計                                            |
| 対象機能     | canonical bridge / workflow ledger governance   |
| 優先度       | 高                                              |
| 見積もり規模 | 中規模                                          |
| ステータス   | spec_created                                    |
| 作成日       | 2026-03-19                                      |

## タスク概要

### 目的

bridge drift・completed 定義の曖昧さ・unassigned formalization のばらつきを収束し、spec_created から implementation_ready へ進める governance lane を定義する。

### 背景

1. 旧監査で Step-01 bridge canonical drift、follow-up 完了定義の曖昧さ、台帳同期の分散が主要リスクとして残った。
2. 各 task が正しく終わっても ledger がズレると、完了管理と次 task の依存判断が壊れる。
3. この governance を最後に閉じないと、新パック自体が再び drift する。

### 最終ゴール

canonical source table、bridge rule、spec_created / implementation_ready / completed の定義、task-workflow / backlog / lessons の同期手順が一つの governance 仕様として固定される。

### 成果物一覧

| 種別       | 成果物                                   | 配置先                                                                                                                                  |
| ---------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 仕様書     | index.md / phase-1〜13                   | docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-06-seq-task-09-canonical-bridge-ledger-governance/         |
| 設計成果物 | outputs/phase-\*/                        | docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-06-seq-task-09-canonical-bridge-ledger-governance/outputs/ |
| 実装ガイド | outputs/phase-12/implementation-guide.md | 後続実装フェーズの handoff                                                                                                              |

## 参照ファイル

| 参照資料                   | パス                                                                                                          | 内容                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 親パック index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                    | 依存順・並列可否・Agent Team 分担      |
| historical predecessor     | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md                 | 既存 execution responsibility 問題設定 |
| current canonical workflow | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md | required spec 抽出の current 入口      |
| codepath-1                 | docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md   | foundation 契約の正本                  |
| codepath-2                 | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                    | 親パック依存順と lane 分離             |
| codepath-3                 | .claude/skills/aiworkflow-requirements/references/task-workflow.md                                            | 現状コード/関連ドキュメント            |
| codepath-4                 | .claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md                                    | 現状コード/関連ドキュメント            |
| codepath-5                 | .claude/skills/aiworkflow-requirements/references/lessons-learned.md                                          | 現状コード/関連ドキュメント            |

## 受入基準（AC）

| ID   | 基準                                                                              |
| ---- | --------------------------------------------------------------------------------- |
| AC-1 | canonical source table と compatibility bridge rule が定義されている              |
| AC-2 | spec_created / implementation_ready / completed の状態遷移が定義されている        |
| AC-3 | task-workflow / backlog / lessons / legacy register の same-wave 更新ルールがある |
| AC-4 | follow-up formalization と current/baseline の切り分けが一貫している              |

## 依存関係

- TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001
- TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001
- TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001
- TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001
- TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001
- TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
- TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001
- TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001

## タスク分解サマリー

| ID   | フェーズ   | サブタスク名     | 責務                                                 | 依存 |
| ---- | ---------- | ---------------- | ---------------------------------------------------- | ---- |
| T-01 | Phase 1    | 要件定義         | 現状棚卸し・AC・対象境界を定義する                   | -    |
| T-02 | Phase 2    | 設計             | concern / state / ownership / validation を設計する  | T-01 |
| T-03 | Phase 3    | 設計レビュー     | gate と戻り先を固定する                              | T-02 |
| T-04 | Phase 4-7  | テスト/実装計画  | future implementation の execution plan を組み立てる | T-03 |
| T-05 | Phase 8-13 | 品質/文書/PR準備 | refactor / QA / spec sync / handover を整理する      | T-04 |

## Phase 一覧

| Phase | 名称             | 仕様書                                                         | ステータス  |
| ----- | ---------------- | -------------------------------------------------------------- | ----------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | not_started |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | not_started |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | not_started |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | not_started |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | not_started |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | not_started |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | not_started |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | not_started |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | not_started |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | not_started |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | not_started |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | not_started |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | not_started |

## 統合テスト連携（Phase 1〜11 で必須）

- canonical bridge / workflow ledger governance に必要な state / action / IPC / manual walkthrough の観点を各 Phase で更新する
- 旧パックの drift と新パックの contract を比較し、Phase 3/10/11/12 で evidence を残す

## Phase 完了時の必須アクション

- 本 Phase 内の全タスクを 100% 実行完了と記録する
- 成果物パスと完了条件を確認する
- `artifacts.json` / `outputs/artifacts.json` / index / phase 本文の同期方針を確認する
