# TASK-SKILL-LIFECYCLE-02: 会話基盤・セッション統合

## 概要

通常チャット、Workspace 文脈付きチャット、Skill 作成/改善チャットを、共通セッション・ストリーミング・履歴基盤上に統合する設計タスク。

## メタ情報

| 項目         | 内容                    |
| ------------ | ----------------------- |
| タスクID     | TASK-SKILL-LIFECYCLE-02 |
| タスク種別   | 設計                    |
| 優先度       | 高                      |
| ステータス   | not_started             |
| 依存タスク   | TASK-SKILL-LIFECYCLE-01 |
| ブロック対象 | TASK-SKILL-LIFECYCLE-03 |

## 受入基準

| ID   | 基準                                                                             |
| ---- | -------------------------------------------------------------------------------- |
| AC-1 | モード差分を持つ共通チャット基盤が設計されている                                 |
| AC-2 | ストリーミング、履歴、文脈注入、永続化の契約が定義されている                     |
| AC-3 | 現行 ChatView / WorkspaceView / skill-creator 導線との接続戦略が明文化されている |
| AC-4 | Task03 で再利用する API・状態契約が定義されている                                |

## Phase 一覧

| Phase | 名称             | ファイル                                                       | ステータス  |
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

## スコープ

**含む**:

- 共通チャットドメインモデル
- ストリーミングと履歴永続化の整理
- Workspace 文脈注入と通常チャットのモード整理

**含まない**:

- Skill Creator の具体 UI 導線
- スキル実行/改善の orchestration 詳細
