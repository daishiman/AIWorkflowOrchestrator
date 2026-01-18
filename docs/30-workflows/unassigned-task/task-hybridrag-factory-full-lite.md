# HybridRAGFactory createFull/createLite 実装タスク

## タスク情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | HRF-001                                         |
| タスク名   | HybridRAGFactory createFull/createLite 完全実装 |
| 優先度     | 中                                              |
| 発見元     | CONV-07-07 Phase 10 最終レビュー                |
| 発見日     | 2026-01-17                                      |
| ステータス | 未着手                                          |

---

## 概要

### 背景

CONV-07-07（HybridRAG統合）の実装において、HybridRAGFactoryの`createFull()`と`createLite()`メソッドは依存モジュールが未完成のためstub実装となっている。現在は`createForTesting()`のみが完全動作する状態。

### 目的

依存モジュールが完成した後に、`createFull()`と`createLite()`メソッドを完全実装し、本番環境で使用可能なHybridRAGEngineを生成できるようにする。

---

## タスク詳細

### 対象ファイル

**パス**: `packages/shared/src/services/search/hybrid-rag-factory.ts`

### 現状

```typescript
// 現在はエラーをスローするstub実装
static createFull(_config: FullHybridRAGConfig): HybridRAGEngine {
  throw new Error(
    "createFull() is not yet implemented. " +
    "Dependent modules (LLMQueryClassifier, VectorSearchStrategy, etc.) are required. " +
    "Use createForTesting() with mocks for now.",
  );
}

static createLite(_config: LiteHybridRAGConfig): HybridRAGEngine {
  throw new Error(
    "createLite() is not yet implemented. " +
    "Dependent modules (VectorSearchStrategy, GraphSearchStrategy, etc.) are required. " +
    "Use createForTesting() with mocks for now.",
  );
}
```

### 期待される実装

#### createFull()

- LLMQueryClassifierを使用した高精度クエリ分類
- KeywordSearchStrategy（FTS5/BM25）
- VectorSearchStrategy（DiskANN）
- GraphSearchStrategy（Knowledge Graph）
- 選択可能なReranker（Cohere/Voyage/LLM/None）
- CorrectiveRAG（RelevanceEvaluator + Web検索オプション）

#### createLite()

- RuleBasedQueryClassifierを使用した軽量クエリ分類
- KeywordSearchStrategy（FTS5/BM25）
- VectorSearchStrategy（DiskANN）
- GraphSearchStrategy（Knowledge Graph）
- NoOpReranker（リランキング無効）
- CRAG無効

---

## 依存関係

### 前提タスク（依存モジュール）

| タスクID   | 機能名                 | 状態   |
| ---------- | ---------------------- | ------ |
| CONV-07-01 | QueryClassifier        | 実装済 |
| CONV-07-02 | KeywordSearchStrategy  | 実装済 |
| CONV-07-03 | SemanticSearchStrategy | 実装済 |
| CONV-07-04 | GraphSearchStrategy    | 実装済 |
| CONV-07-05 | RRFFusion              | 実装済 |
| CONV-07-06 | Reranker/CRAG          | 実装済 |

### 統合が必要なモジュール

| モジュール               | パス                                                 | 用途                   |
| ------------------------ | ---------------------------------------------------- | ---------------------- |
| LLMQueryClassifier       | services/search/llm-query-classifier.ts              | LLMベースクエリ分類    |
| RuleBasedQueryClassifier | services/search/rule-based-query-classifier.ts       | ルールベースクエリ分類 |
| KeywordSearchStrategy    | services/search/keyword-search-strategy.ts           | キーワード検索         |
| VectorSearchStrategy     | services/search/strategies/vector-search-strategy.ts | ベクトル検索           |
| GraphSearchStrategy      | services/search/strategies/graph-search-strategy.ts  | グラフ検索             |
| CohereReranker           | services/search/reranking/cohere-reranker.ts         | Cohereリランキング     |
| VoyageReranker           | services/search/reranking/voyage-reranker.ts         | Voyageリランキング     |
| LLMReranker              | services/search/reranking/llm-reranker.ts            | LLMリランキング        |
| CorrectiveRAG            | services/search/crag/corrective-rag.ts               | CRAG補正               |
| RelevanceEvaluator       | services/search/crag/relevance-evaluator.ts          | 関連性評価             |

---

## 実装方針

### アプローチ

1. **依存モジュール確認**: 各モジュールのインターフェースと実装状態を確認
2. **プレースホルダー置換**: 型定義をプレースホルダーから実際の型にインポート変更
3. **createFull()実装**: LLMベースのフル機能版を実装
4. **createLite()実装**: ルールベースの軽量版を実装
5. **テスト追加**: 統合テストを追加

### 完了条件

- [ ] `createFull()` が FullHybridRAGConfig を受け取り、正常にHybridRAGEngineを生成
- [ ] `createLite()` が LiteHybridRAGConfig を受け取り、正常にHybridRAGEngineを生成
- [ ] プレースホルダー型定義がすべて実際のモジュールインポートに置換
- [ ] 統合テストが追加され、全テストがPASS
- [ ] 型チェック・lint・フォーマットがPASS

---

## 備考

### 実装順序

1. まずVectorSearchStrategyとGraphSearchStrategyのDB依存部分を確認
2. Rerankerの各実装（Cohere/Voyage/LLM）の利用可能性を確認
3. CorrectiveRAGのWebSearcher統合状況を確認
4. 上記が揃ったタイミングでcreateFullとcreateLiteを実装

### 注意事項

- プレースホルダー型（IEmbeddingProvider等）は実際の型に置き換え必要
- DrizzleClientの型は@repo/shared/db/clientから取得
- API キー設定はconfig経由で渡す設計を維持

---

## 関連ドキュメント

- `docs/30-workflows/hybridrag-integration/outputs/phase-12/implementation-guide.md`
- `docs/30-workflows/hybridrag-integration/outputs/phase-10/final-review-result.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`
