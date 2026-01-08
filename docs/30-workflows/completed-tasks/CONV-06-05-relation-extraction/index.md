# CONV-06-05: 関係抽出サービス - ワークフロー

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| タスクID     | CONV-06-05                         |
| タスク名     | 関係抽出サービス                   |
| 親タスク     | CONV-06 (埋め込み生成パイプライン) |
| 依存タスク   | CONV-06-04 (エンティティ抽出)      |
| 規模         | 中                                 |
| 見積もり工数 | 1日                                |
| ステータス   | 実施中                             |
| 作成日       | 2026-01-07                         |

---

## 目的

抽出されたエンティティ間の関係性を識別し、Knowledge Graphのエッジを構築するサービスを実装する。

---

## スコープ

### 含むもの

- `IRelationExtractor` インターフェース定義
- `LLMRelationExtractor` 実装
- 関係タイプ（RelationType）スキーマ定義
- 関係抽出プロンプト設計
- バッチ抽出機能
- 関係のマージ（重複統合）機能
- `ExtractionPipeline` の関係抽出統合
- ユニットテスト・統合テスト

### 含まないもの

- Knowledge Graph ストア実装（CONV-08-01で対応）
- グラフデータベース選定・構築
- グラフ可視化UI

---

## 成果物

| 成果物             | パス                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| 関係抽出サービス   | `packages/shared/src/services/extraction/relation-extractor.ts`                 |
| 関係抽出プロンプト | `packages/shared/src/services/extraction/prompts/relation-extraction-prompt.ts` |
| 型定義（追加）     | `packages/shared/src/services/extraction/types.ts`                              |
| テストコード       | `packages/shared/src/services/extraction/__tests__/relation-extractor.test.ts`  |

---

## Phase構成

| Phase | 名称                 | 使用スキル                                                                                 | ステータス |
| ----- | -------------------- | ------------------------------------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | acceptance-criteria-writing, functional-non-functional-requirements                        | 未実施     |
| 2     | 設計                 | clean-architecture-principles, interface-segregation, type-safety-patterns, zod-validation | 未実施     |
| 3     | 設計レビューゲート   | code-smell-detection                                                                       | 未実施     |
| 4     | テスト作成           | tdd-principles, test-doubles                                                               | 未実施     |
| 5     | 実装                 | type-safety-patterns, error-handling-patterns                                              | 未実施     |
| 6     | テスト拡充           | boundary-value-analysis, flaky-test-prevention                                             | 未実施     |
| 7     | テストカバレッジ確認 | -                                                                                          | 未実施     |
| 8     | リファクタリング     | refactoring-patterns, clean-code-practices                                                 | 未実施     |
| 9     | 品質保証             | static-analysis                                                                            | 未実施     |
| 10    | 最終レビューゲート   | -                                                                                          | 未実施     |
| 11    | 手動テスト検証       | -                                                                                          | 未実施     |
| 12    | ドキュメント更新     | technical-documentation-guide                                                              | 未実施     |
| 13    | PR作成               | /ai:diff-to-pr                                                                             | 未実施     |

---

## スキル選定理由

| スキル                                 | 選定理由                                                           |
| -------------------------------------- | ------------------------------------------------------------------ |
| acceptance-criteria-writing            | 関係抽出の受け入れ基準を明確に定義するため                         |
| functional-non-functional-requirements | 機能要件（関係タイプ、信頼度）と非機能要件（パフォーマンス）を整理 |
| clean-architecture-principles          | IRelationExtractor インターフェースによる依存関係逆転の設計        |
| interface-segregation                  | 抽出・マージ・バッチの責務分離                                     |
| type-safety-patterns                   | Zod + TypeScriptによる型安全な関係データ構造                       |
| zod-validation                         | ExtractedRelation, RelationType スキーマのバリデーション           |
| code-smell-detection                   | 設計段階での問題早期発見                                           |
| tdd-principles                         | 失敗するテストから実装を開始（Red-Green-Refactor）                 |
| test-doubles                           | LLMプロバイダーのモック化                                          |
| error-handling-patterns                | LLM応答パース失敗、バリデーションエラーの適切な処理                |
| boundary-value-analysis                | 信頼度の境界値（0.0, 0.5, 1.0）、最大関係数のテスト                |
| flaky-test-prevention                  | LLMモック使用による安定したテスト                                  |
| refactoring-patterns                   | 重複コードの抽出、メソッドの整理                                   |
| clean-code-practices                   | 読みやすいコード、適切な命名                                       |
| static-analysis                        | ESLint、型チェックによる品質担保                                   |
| technical-documentation-guide          | 実装ガイド、API仕様の文書化                                        |

---

## Phase別仕様書

| Phase | ファイル名                         |
| ----- | ---------------------------------- |
| 1     | `phase-1-requirements.md`          |
| 2     | `phase-2-design.md`                |
| 3     | `phase-3-design-review.md`         |
| 4     | `phase-4-test-creation.md`         |
| 5     | `phase-5-implementation.md`        |
| 6     | `phase-6-test-expansion.md`        |
| 7     | `phase-7-coverage-verification.md` |
| 8     | `phase-8-refactoring.md`           |
| 9     | `phase-9-quality-assurance.md`     |
| 10    | `phase-10-final-review.md`         |
| 11    | `phase-11-manual-testing.md`       |
| 12    | `phase-12-documentation.md`        |
| 13    | `phase-13-pr-creation.md`          |

---

## 参照情報

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                          | 内容                       |
| -------------------------- | ----------------------------------------------------------------------------- | -------------------------- |
| エンティティ・関係スキーマ | `.claude/skills/aiworkflow-requirements/references/entity-relation-schema.md` | エンティティと関係の型定義 |
| 埋め込みパイプライン       | `.claude/skills/aiworkflow-requirements/references/embedding-pipeline.md`     | パイプライン全体設計       |

### 関連タスク

| タスク     | 関係   | 説明                         |
| ---------- | ------ | ---------------------------- |
| CONV-06-04 | 依存元 | エンティティ抽出サービス     |
| CONV-08-01 | 後続   | Knowledge Graph ストア実装   |
| CONV-06    | 親     | 埋め込み生成パイプライン全体 |

### 元タスク指示書

- `docs/30-workflows/unassigned-task/task-06-05-relation-extraction.md`

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-07 | 初版作成 |
