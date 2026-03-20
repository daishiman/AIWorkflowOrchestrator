# slide-modifier-manual-fallback-alignment - タスク実行仕様書

## メタ情報

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 |
| タスク名     | slide-modifier-manual-fallback-alignment              |
| 分類         | 設計                                                  |
| 対象機能     | Slide / Modifier manual fallback alignment            |
| 優先度       | 中                                                    |
| 見積もり規模 | 中規模                                                |
| ステータス   | spec_created                                          |
| 作成日       | 2026-03-19                                            |

## タスク概要

### 目的

slide / modifier の direct SDK path・silent fallback・manual guidance 不足を整理し、terminal handoff 契約に沿った legacy cleanup の実行仕様を作る。

### 背景

1. 旧監査では Slide / Modifier に manual fallback guidance 不足と direct SDK path 残存がある。
2. Task05 の terminal surface を受けて legacy path を正しく後段で整理する必要がある。
3. slide 系は review harness よりもさらに独立した legacy lane なので、mainline とは分けて扱うべきである。

### 最終ゴール

Slide / Modifier が integrated runtime と manual fallback を明示的に分け、legacy direct SDK path の整理順と UI guidance を確定する。

### 成果物一覧

| 種別       | 成果物                                   | 配置先                                                                                                                                        |
| ---------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 仕様書     | index.md / phase-1〜13                   | docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-05-par-task-08-slide-modifier-manual-fallback-alignment/         |
| 設計成果物 | outputs/phase-\*/                        | docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-05-par-task-08-slide-modifier-manual-fallback-alignment/outputs/ |
| 実装ガイド | outputs/phase-12/implementation-guide.md | 後続実装フェーズの handoff                                                                                                                    |

## 参照ファイル

| 参照資料                   | パス                                                                                                          | 内容                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 親パック index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                    | 依存順・並列可否・Atent Team 分担      |
| historical predecessor     | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md                 | 既存 execution responsibility 問題設定 |
| current canonical workflow | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md | required spec 抽出の current 入口      |
| codepath-1                 | apps/desktop/src/renderer/slide/SlideWorkspace.tsx                                                            | 現状コード/関連ドキュメント            |
| codepath-2                 | apps/desktop/src/renderer/phase11-slide-ai-runtime-alignment.tsx                                              | 現状コード/関連ドキュメント            |
| codepath-3                 | apps/desktop/src/main/services/slide/agent-client.ts                                                          | 現状コード/関連ドキュメント            |
| codepath-4                 | apps/desktop/src/main/services/slide/modifier-skill.ts                                                        | 現状コード/関連ドキュメント            |

## 受入基準（AC）

| ID   | 基準                                                               |
| ---- | ------------------------------------------------------------------ |
| AC-1 | Slide / Modifier の runtime lane と manual lane が明示されている   |
| AC-2 | direct SDK / silent fallback の整理順と ownership が定義されている |
| AC-3 | slide-specific screenshot / walkthrough contract が定義されている  |
| AC-4 | Task09 governance が拾う follow-up ルールが明記されている          |

## 依存関係

- TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001
- TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001

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

- Slide / Modifier manual fallback alignment に必要な state / action / IPC / manual walkthrough の観点を各 Phase で更新する
- 旧パックの drift と新パックの contract を比較し、Phase 3/10/11/12 で evidence を残す

## Phase 完了時の必須アクション

- 本 Phase 内の全タスクを 100% 実行完了と記録する
- 成果物パスと完了条件を確認する
- `artifacts.json` / `outputs/artifacts.json` / index / phase 本文の同期方針を確認する
