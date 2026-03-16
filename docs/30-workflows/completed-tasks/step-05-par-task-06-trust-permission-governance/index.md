# TASK-SKILL-LIFECYCLE-06: 信頼・権限・ガバナンス統合

## 概要

スキル実行時の権限要求、危険操作、承認履歴、説明責任を統合し、`使えるが危険` な導線にならないようにする補助レイヤタスク。

## メタ情報

| 項目         | 内容                        |
| ------------ | --------------------------- |
| タスクID     | TASK-SKILL-LIFECYCLE-06     |
| タスク種別   | 設計                        |
| 優先度       | 高                          |
| ステータス   | spec_created                |
| 依存タスク   | TASK-SKILL-LIFECYCLE-03, 05 |
| ブロック対象 | TASK-SKILL-LIFECYCLE-08     |

## 受入基準

| ID   | 基準                                      |
| ---- | ----------------------------------------- |
| AC-1 | 危険操作の権限境界が明確                  |
| AC-2 | 承認履歴と取り消し方針が定義されている    |
| AC-3 | 実行導線に説明責任が組み込まれている      |
| AC-4 | 共有/公開前の安全性ゲートと接続されている |

## 主要設計要素

| 要素               | 内容                                                          |
| ------------------ | ------------------------------------------------------------- |
| ToolRiskConfig     | リスクレベル4段階(Critical/High/Medium/Low) x 確認スタイル4種 |
| AllowedToolEntryV2 | 既存型 + 失効ポリシー(session/time_24h/time_7d/permanent)     |
| SafetyGatePort     | Task-08 公開前安全性ゲート契約                                |
| 権限状態4モード    | denied / approved_once / approved / revoked                   |
| 説明責任UI挿入点   | INS-01(CTA) / INS-02(実行中) / INS-03(結果)                   |
| 拒否fallback       | abort / skip / retry(最大3回)                                 |

## Phase 一覧

| Phase | 名称             | ファイル                                                       | ステータス   |
| ----- | ---------------- | -------------------------------------------------------------- | ------------ |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | spec_created |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | spec_created |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | spec_created |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | spec_created |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | spec_created |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | spec_created |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | spec_created |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | spec_created |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | spec_created |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | spec_created |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | spec_created |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | spec_created |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | blocked      |
