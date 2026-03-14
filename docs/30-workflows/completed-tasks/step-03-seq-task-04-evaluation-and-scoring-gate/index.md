# TASK-SKILL-LIFECYCLE-04: 採点・評価・受け入れゲート統合

## 概要

`作る -> 採点する -> 改善する -> 再採点する -> 使う/保存する` の品質ループを定義するタスク。分析スコア、評価 API、合否ゲートを単一ライフサイクルへ統合する。

## メタ情報

| 項目         | 内容                            |
| ------------ | ------------------------------- |
| タスクID     | TASK-SKILL-LIFECYCLE-04         |
| タスク種別   | 設計                            |
| 優先度       | 高                              |
| ステータス   | in_progress                     |
| 依存タスク   | TASK-SKILL-LIFECYCLE-01, 02, 03 |
| ブロック対象 | TASK-SKILL-LIFECYCLE-05         |

## 受入基準

| ID   | 基準                                             |
| ---- | ------------------------------------------------ |
| AC-1 | 採点ポイントと採点主体が定義されている           |
| AC-2 | 改善前後スコア比較ができる設計になっている       |
| AC-3 | スコアによる導線分岐が定義されている             |
| AC-4 | 作成フローと利用フローの両方で評価が再利用できる |
| AC-5 | aiworkflow 正本仕様の抽出手順が固定されている    |

## SubAgent 編成

| SubAgent   | 関心ごと              | 主な担当Phase |
| ---------- | --------------------- | ------------- |
| SubAgent-A | 評価モデル/UX導線     | 1,2,4,11      |
| SubAgent-B | IPC契約/セキュリティ  | 1,2,5,9       |
| SubAgent-C | 実装アンカー/仕様同期 | 1,3,7,12      |
| Lead       | 判定統合/最終ゲート   | 3,10,13       |

## aiworkflow-requirements 抽出状況

| 項目                 | 状態 | 参照                                      |
| -------------------- | ---- | ----------------------------------------- |
| 抽出手順の固定       | 完了 | `./aiworkflow-requirements-extraction.md` |
| 必須仕様セットの定義 | 完了 | `./aiworkflow-requirements-extraction.md` |
| 実装アンカー照合     | 完了 | `./aiworkflow-requirements-extraction.md` |

## エレガンス監査

| 項目                   | 状態 | 参照                           |
| ---------------------- | ---- | ------------------------------ |
| 思考法20観点の適用     | 完了 | `./elegance-thinking-audit.md` |
| 矛盾・漏れ・依存の監査 | 完了 | `./elegance-thinking-audit.md` |

## Phase 一覧

| Phase | 名称             | ファイル                                                       | ステータス |
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
