# runtime-policy-centralization - タスク実行仕様書

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| タスク名     | runtime-policy-centralization              |
| 分類         | 設計                                       |
| 対象機能     | surface 横断 runtime policy の中央集約     |
| 優先度       | 高                                         |
| 見積もり規模 | 中規模                                     |
| ステータス   | implementation_ready                       |
| 作成日       | 2026-03-19                                 |
| 更新日       | 2026-03-21                                 |

## タスク概要

### 目的

surface ごとの if 分岐を shared runtime policy / health contract / handoff contract に集約し、local 判定禁止を実体化する。

### 背景

1. Chat / Workspace / Slide / Skill Docs で独自判定が残ると、surface 間で blocked 理由と CTA が食い違う。
2. llm:check-health と AI_CHECK_CONNECTION の優先経路が混在しており、health row の説明責任が壊れている。
3. Task01 の contract foundation を実際の service / store / IPC 境界へ落とし込む中央 task が必要である。

### 最終ゴール

RuntimePolicy / HealthPolicy / HandoffGuidance の消費契約、surface 禁止事項、legacy health route の扱いを一つの centralization design として定義する。

本 task は design task であり、workflow root の完了意味は `implementation_ready` である。production code の中央集約実装完了は含まれず、残差分は follow-up task と downstream implementation task で追跡する。

### 成果物一覧

| 種別       | 成果物                                   | 配置先                                                                                       |
| ---------- | ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| 仕様書     | index.md / phase-1〜13                   | docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/         |
| 設計成果物 | outputs/phase-\*/                        | docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/outputs/ |
| 実装ガイド | outputs/phase-12/implementation-guide.md | 後続実装フェーズの handoff                                                                   |

## 参照ファイル

| 参照資料                   | パス                                                                                                          | 内容                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 親パック index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                    | 依存順・並列可否・Agent Team 分担      |
| historical predecessor     | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md                 | 既存 execution responsibility 問題設定 |
| current canonical workflow | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md | required spec 抽出の current 入口      |
| codepath-1                 | apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts                                               | 現状コード/関連ドキュメント            |
| codepath-2                 | apps/desktop/src/main/services/runtime/RuntimeResolver.ts                                                     | 現状コード/関連ドキュメント            |
| codepath-3                 | apps/desktop/src/main/ipc/aiHandlers.ts                                                                       | 現状コード/関連ドキュメント            |
| codepath-4                 | apps/desktop/src/renderer/store/slices/authModeSlice.ts                                                       | 現状コード/関連ドキュメント            |
| codepath-5                 | apps/desktop/src/renderer/store/slices/llmSlice.ts                                                            | 現状コード/関連ドキュメント            |

## 受入基準（AC）

| ID   | 基準                                                                                      |
| ---- | ----------------------------------------------------------------------------------------- |
| AC-1 | surface-local 判定を禁止する ownership table が定義されている                             |
| AC-2 | health route は llm:check-health を primary とし、legacy route の残置条件が定義されている |
| AC-3 | RuntimePolicy / HandoffGuidance / Health DTO の責務境界が Phase 2 で図示されている        |
| AC-4 | Step 03 以降が参照する policy consumption contract が完成している                         |

## 依存関係

- TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001

## タスク分解サマリー

| ID   | フェーズ   | サブタスク名     | 責務                                                 | 依存 |
| ---- | ---------- | ---------------- | ---------------------------------------------------- | ---- |
| T-01 | Phase 1    | 要件定義         | 現状棚卸し・AC・対象境界を定義する                   | -    |
| T-02 | Phase 2    | 設計             | concern / state / ownership / validation を設計する  | T-01 |
| T-03 | Phase 3    | 設計レビュー     | gate と戻り先を固定する                              | T-02 |
| T-04 | Phase 4-7  | テスト/実装計画  | future implementation の execution plan を組み立てる | T-03 |
| T-05 | Phase 8-13 | 品質/文書/PR準備 | refactor / QA / spec sync / handover を整理する      | T-04 |

## Phase 一覧

| Phase | 名称             | 仕様書                                                         | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed  |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed  |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed  |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed  |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed  |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed  |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed  |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed  |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | completed  |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | blocked    |

## 統合テスト連携（Phase 1〜11 で必須）

- surface 横断 runtime policy の中央集約 に必要な state / action / IPC / manual walkthrough の観点を各 Phase で更新する
- 旧パックの drift と新パックの contract を比較し、Phase 3/10/11/12 で evidence を残す

## Phase 完了時の必須アクション

- 本 Phase 内の全タスクを 100% 実行完了と記録する
- 成果物パスと完了条件を確認する
- `artifacts.json` / `outputs/artifacts.json` / index / phase 本文の同期方針を確認する
