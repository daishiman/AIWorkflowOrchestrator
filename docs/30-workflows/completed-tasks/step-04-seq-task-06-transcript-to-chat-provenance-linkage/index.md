# transcript-to-chat-provenance-linkage - タスク実行仕様書

## メタ情報

| 項目         | 内容                                               |
| ------------ | -------------------------------------------------- |
| タスクID     | TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001 |
| タスク名     | transcript-to-chat-provenance-linkage              |
| 分類         | 設計                                               |
| 対象機能     | Transcript -> Chat provenance linkage              |
| 優先度       | 高                                                 |
| 見積もり規模 | 小規模                                             |
| ステータス   | implementation_ready                               |
| 作成日       | 2026-03-19                                         |

## タスク概要

### 目的

transcript -> chat 手動連携の 3 操作として固定し、出所表示と追跡可能性を失わない導線を設計する。

### 背景

1. 旧監査では Transcript -> Chat 手動連携と provenance 表示が未接続と判定された。
2. terminal handoff surface ができても provenance がないと、手動操作時の責任分界が曖昧になる。
3. chat / workspace / terminal 間の接続点として、この task を独立させると state と UX の責務が整理しやすい。

### 最終ゴール

Transcript provenance chip、copy transcript / copy prompt / open chat の 3 操作、履歴上の出所表示が一貫して定義される。

### 成果物一覧

| 種別       | 成果物                                   | 配置先                                                                               |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------------------------ |
| 仕様書     | index.md / phase-1〜13                   | docs/30-workflows/step-04-seq-task-06-transcript-to-chat-provenance-linkage/         |
| 設計成果物 | outputs/phase-\*/                        | docs/30-workflows/step-04-seq-task-06-transcript-to-chat-provenance-linkage/outputs/ |
| 実装ガイド | outputs/phase-12/implementation-guide.md | 後続実装フェーズの handoff                                                           |

## 参照ファイル

| 参照資料                   | パス                                                                                                          | 内容                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 親パック index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                    | 依存順・並列可否・Agent Team 分担      |
| historical predecessor     | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md                 | 既存 execution responsibility 問題設定 |
| current canonical workflow | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md | required spec 抽出の current 入口      |
| codepath-1                 | apps/desktop/src/renderer/views/WorkspaceView/components/TranscriptProvenanceChip.tsx                         | 現状コード/関連ドキュメント            |
| codepath-2                 | apps/desktop/src/renderer/views/WorkspaceView/components/TranscriptPanel.tsx                                  | 現状コード/関連ドキュメント            |
| codepath-3                 | apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx                                          | 現状コード/関連ドキュメント            |
| codepath-4                 | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md                           | 現状コード/関連ドキュメント            |

## 受入基準（AC）

| ID   | 基準                                                                      |
| ---- | ------------------------------------------------------------------------- |
| AC-1 | transcript から chat への 3 操作フローが明文化されている                  |
| AC-2 | provenance chip の表示条件と copy 後の状態が定義されている                |
| AC-3 | terminal handoff と transcript copy が競合しない責務分離になっている      |
| AC-4 | manual path の auditability を失わない metadata contract が設計されている |

## 依存関係

- TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001
- TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001

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

- Transcript -> Chat provenance linkage に必要な state / action / IPC / manual walkthrough の観点を各 Phase で更新する
- 旧パックの drift と新パックの contract を比較し、Phase 3/10/11/12 で evidence を残す

## Phase 完了時の必須アクション

- 本 Phase 内の全タスクを 100% 実行完了と記録する
- 成果物パスと完了条件を確認する
- `artifacts.json` / `outputs/artifacts.json` / index / phase 本文の同期方針を確認する
