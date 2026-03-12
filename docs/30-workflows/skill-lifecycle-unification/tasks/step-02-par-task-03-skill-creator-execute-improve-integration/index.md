# TASK-SKILL-LIFECYCLE-03: Skill Creator 表導線化と作成・実行・改善統合

## 概要

`skillCreatorAPI`、既存 wizard、スキル実行、改善導線を再統合し、単一会話フローとして成立させる設計タスク。内部では `Atent Team` / `SubAgent` / `Codex` を使える前提を持つが、ユーザー体験には単一導線として表現する。

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | TASK-SKILL-LIFECYCLE-03                          |
| タスク種別   | 設計                                             |
| 優先度       | 高                                               |
| ステータス   | not_started                                      |
| 依存タスク   | TASK-SKILL-LIFECYCLE-01, TASK-SKILL-LIFECYCLE-02 |
| ブロック対象 | TASK-SKILL-LIFECYCLE-04, TASK-SKILL-LIFECYCLE-05 |

## 受入基準

| ID   | 基準                                                   |
| ---- | ------------------------------------------------------ |
| AC-1 | `skillCreatorAPI` の位置づけが決定している             |
| AC-2 | wizard と会話導線の責務統合方針がある                  |
| AC-3 | `作成 -> 実行 -> 改善` の単一フローが定義されている    |
| AC-4 | 内部オーケストレーションとユーザー導線が分離されている |

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

- Skill Creator の表導線化判断
- `skillCreatorAPI` と wizard の二重系統整理
- 作成/実行/改善の単一フロー設計
- internal Atent Team / SubAgent / Codex 利用契約

**含まない**:

- 共通会話基盤そのものの設計
- 一次導線とナビゲーションの再編
