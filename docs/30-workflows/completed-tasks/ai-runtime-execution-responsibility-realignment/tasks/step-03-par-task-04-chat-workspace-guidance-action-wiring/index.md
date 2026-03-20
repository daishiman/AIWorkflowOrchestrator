# chat-workspace-guidance-action-wiring - タスク実行仕様書

## メタ情報

| 項目         | 内容                                               |
| ------------ | -------------------------------------------------- |
| タスクID     | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| タスク名     | chat-workspace-guidance-action-wiring              |
| 分類         | 設計                                               |
| 対象機能     | Main Chat / Workspace の blocked guidance 実配線   |
| 優先度       | 高                                                 |
| 見積もり規模 | 中規模                                             |
| ステータス   | spec_created                                       |
| 作成日       | 2026-03-19                                         |

## タスク概要

### 目的

main chat と workspace surface の blocked 状態を actionable guidance に変換し、settings 遷移・launcher 起動・copy action を no-op 無しで設計する。

### 背景

1. 旧監査では WorkspaceChatPanel の blocked CTA がラベルだけで、onAction 未接続と判定された。
2. surface 側の独自判定が残ると、same reason に対して違う CTA が並ぶ。
3. mainline UI を review harness より先に回復するため、chat / workspace guidance の責務を独立化する。

### 最終ゴール

blocked reason -> action mapping、settings / launcher / copy 導線、policy consumption boundary が main chat / workspace で一貫する。

### 成果物一覧

| 種別       | 成果物                                   | 配置先                                                                                                                                     |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 仕様書     | index.md / phase-1〜13                   | docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-03-par-task-04-chat-workspace-guidance-action-wiring/         |
| 設計成果物 | outputs/phase-\*/                        | docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-03-par-task-04-chat-workspace-guidance-action-wiring/outputs/ |
| 実装ガイド | outputs/phase-12/implementation-guide.md | 後続実装フェーズの handoff                                                                                                                 |

## 参照ファイル

| 参照資料                   | パス                                                                                                          | 内容                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 親パック index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                    | 依存順・並列可否・Atent Team 分担      |
| historical predecessor     | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md                 | 既存 execution responsibility 問題設定 |
| current canonical workflow | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md | required spec 抽出の current 入口      |
| codepath-1                 | apps/desktop/src/renderer/views/ChatView/index.tsx                                                            | 現状コード/関連ドキュメント            |
| codepath-2                 | apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx                                          | 現状コード/関連ドキュメント            |
| codepath-3                 | apps/desktop/src/renderer/views/WorkspaceView/components/GuidanceBlock.tsx                                    | 現状コード/関連ドキュメント            |
| codepath-4                 | apps/desktop/src/renderer/hooks/useWorkspaceChatController.ts                                                 | 現状コード/関連ドキュメント            |
| codepath-5                 | apps/desktop/src/renderer/store/slices/chatSlice.ts                                                           | 現状コード/関連ドキュメント            |

## 受入基準（AC）

| ID   | 基準                                                                                 |
| ---- | ------------------------------------------------------------------------------------ |
| AC-1 | blocked reason ごとに primary / secondary action が定義されている                    |
| AC-2 | ChatView と WorkspaceChatPanel が local runtime 判定を持たない                       |
| AC-3 | workspace context / selected config / handoff summary の受け渡し境界が明示されている |
| AC-4 | no-op CTA を排除する wiring plan と test matrix がある                               |

## 依存関係

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

- Main Chat / Workspace の blocked guidance 実配線 に必要な state / action / IPC / manual walkthrough の観点を各 Phase で更新する
- 旧パックの drift と新パックの contract を比較し、Phase 3/10/11/12 で evidence を残す

## Phase 完了時の必須アクション

- 本 Phase 内の全タスクを 100% 実行完了と記録する
- 成果物パスと完了条件を確認する
- `artifacts.json` / `outputs/artifacts.json` / index / phase 本文の同期方針を確認する
