# GraphSearchStrategy 実装タスク

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| タスクID     | CONV-07-04                         |
| タスク名     | グラフ検索戦略                     |
| 親タスク     | CONV-07 (HybridRAG検索エンジン)    |
| 依存タスク   | CONV-08-01 (Knowledge Graph Store) |
| 規模         | 中                                 |
| 見積もり工数 | 0.5日                              |
| ステータス   | 仕様書作成完了                     |
| 作成日       | 2026-01-12                         |

---

## 概要

Knowledge Graphを使用したグラフ検索戦略（GraphSearchStrategy）を実装する。HybridRAGのTriple Searchの3つ目の検索源として、エンティティ関係とコミュニティサマリを活用した検索機能を提供する。

### 背景

HybridRAGは3つの検索戦略を統合して高精度な検索を実現する:

1. **KeywordSearchStrategy** (FTS5/BM25) - 実装済み
2. **VectorSearchStrategy** (DiskANN) - 実装済み
3. **GraphSearchStrategy** (Knowledge Graph) - **本タスクで実装**

GraphSearchStrategyは、Knowledge Graphのエンティティ、関係、コミュニティ構造を活用し、単なるテキストマッチングやベクトル類似度では発見できない意味的な関連性を検索する。

### 目標

- `ISearchStrategy`インターフェースに準拠したGraphSearchStrategyを実装
- 3種類のクエリタイプ（local/global/relationship）に対応
- グラフトラバーサル、最短経路探索、コミュニティサマリ検索を統合

---

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                      HybridRAG Triple Search                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ KeywordSearch   │  │ VectorSearch    │  │ GraphSearch     │  │
│  │ Strategy        │  │ Strategy        │  │ Strategy ★      │  │
│  │ (FTS5/BM25)     │  │ (DiskANN/Cosine)│  │ (KG/Community)  │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                    │            │
│           └────────────────────┼────────────────────┘            │
│                                ↓                                 │
│                    ┌─────────────────────┐                       │
│                    │   RRF Fusion        │                       │
│                    │   + Reranking       │                       │
│                    └─────────────────────┘                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 成果物

| 成果物              | パス                                                                                                 | 説明           |
| ------------------- | ---------------------------------------------------------------------------------------------------- | -------------- |
| GraphSearchStrategy | `packages/shared/src/services/search/strategies/graph-search-strategy.ts`                            | 検索戦略実装   |
| テストファイル      | `packages/shared/src/services/search/strategies/__tests__/graph-search-strategy.test.ts`             | ユニットテスト |
| 統合テストファイル  | `packages/shared/src/services/search/strategies/__tests__/graph-search-strategy.integration.test.ts` | 統合テスト     |

---

## Phase一覧

| Phase | 名称                 | 仕様書                      | ステータス   | 成果物                                             |
| ----- | -------------------- | --------------------------- | ------------ | -------------------------------------------------- |
| 1     | 要件定義             | phase-1-requirements.md     | 仕様書作成済 | requirements-definition.md, acceptance-criteria.md |
| 2     | 設計                 | phase-2-design.md           | 仕様書作成済 | architecture-design.md, domain-model.md            |
| 3     | 設計レビューゲート   | phase-3-design-review.md    | 仕様書作成済 | design-review-result.md                            |
| 4     | テスト作成           | phase-4-test.md             | 仕様書作成済 | test-specification.md, テストファイル              |
| 5     | 実装                 | phase-5-implementation.md   | 仕様書作成済 | graph-search-strategy.ts                           |
| 6     | テスト拡充           | phase-6-test-enhancement.md | 仕様書作成済 | coverage-report.md                                 |
| 7     | テストカバレッジ確認 | phase-7-coverage-check.md   | 仕様書作成済 | coverage-report.md                                 |
| 8     | リファクタリング     | phase-8-refactoring.md      | 仕様書作成済 | refactoring-report.md                              |
| 9     | 品質保証             | phase-9-quality.md          | 仕様書作成済 | quality-report.md                                  |
| 10    | 最終レビューゲート   | phase-10-final-review.md    | 仕様書作成済 | final-review-result.md                             |
| 11    | 手動テスト検証       | phase-11-manual-test.md     | 仕様書作成済 | manual-test-result.md                              |
| 12    | ドキュメント更新     | phase-12-documentation.md   | 仕様書作成済 | implementation-guide.md                            |
| 13    | PR作成               | phase-13-pr.md              | 仕様書作成済 | pr-info.md                                         |

---

## 依存関係

### 前提タスク

| タスクID   | タスク名               | ステータス |
| ---------- | ---------------------- | ---------- |
| CONV-08-01 | Knowledge Graph Store  | 完了       |
| CONV-08-02 | コミュニティ検出       | 完了       |
| CONV-08-03 | コミュニティサマリ生成 | 完了       |

### 後続タスク

| タスクID   | タスク名               | 説明                       |
| ---------- | ---------------------- | -------------------------- |
| CONV-07-05 | RRF Fusion + Reranking | 検索結果統合・リランキング |

---

## システム仕様参照

| 参照資料              | パス                                                                                          | 内容                |
| --------------------- | --------------------------------------------------------------------------------------------- | ------------------- |
| RAGアーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/architecture-rag.md`                       | HybridRAG全体設計   |
| 検索インターフェース  | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`                  | ISearchStrategy定義 |
| Knowledge Graph Store | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md`   | グラフストア仕様    |
| コミュニティ検出      | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-detection.md`     | Leidenアルゴリズム  |
| コミュニティサマリ    | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md` | サマリ生成仕様      |

---

## クエリタイプ別検索戦略

| クエリタイプ | 検索戦略           | 主な用途             | 例                           |
| ------------ | ------------------ | -------------------- | ---------------------------- |
| local        | エンティティベース | 具体的な情報検索     | 「UserServiceの実装は？」    |
| global       | コミュニティサマリ | 高レベル概念・全体像 | 「アーキテクチャの概要は？」 |
| relationship | パス検索           | エンティティ間の関係 | 「AとBの関係は？」           |

---

## 次のステップ

Phase 1: 要件定義 を実行してください。

`docs/30-workflows/graph-search-strategy/phase-1-requirements.md`
