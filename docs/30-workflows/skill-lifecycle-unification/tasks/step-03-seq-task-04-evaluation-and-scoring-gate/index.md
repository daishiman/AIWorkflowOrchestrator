# TASK-SKILL-LIFECYCLE-04: 採点・評価・受け入れゲート統合

## 概要

`作る -> 採点する -> 改善する -> 再採点する -> 使う/保存する` の品質ループを定義するタスク。分析スコア、評価 API、合否ゲートを単一ライフサイクルへ組み込む。Task04 単独で導線を持つのではなく、Task03 と Task05 の遷移制御層として機能させる。

## メタ情報

| 項目         | 内容                            |
| ------------ | ------------------------------- |
| タスクID     | TASK-SKILL-LIFECYCLE-04         |
| タスク種別   | 設計                            |
| 優先度       | 高                              |
| ステータス   | not_started                     |
| 依存タスク   | TASK-SKILL-LIFECYCLE-01, 02, 03 |
| ブロック対象 | TASK-SKILL-LIFECYCLE-05         |

## 受入基準

| ID   | 基準                                             |
| ---- | ------------------------------------------------ |
| AC-1 | 採点ポイントと採点主体が定義されている           |
| AC-2 | 改善前後スコア比較ができる設計になっている       |
| AC-3 | スコアによる導線分岐が定義されている             |
| AC-4 | 作成フローと利用フローの両方で評価が再利用できる |

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
