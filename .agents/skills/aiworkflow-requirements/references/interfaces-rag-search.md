# 検索クエリ・結果型定義

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

本ドキュメントはAIWorkflowOrchestratorプロジェクトのHybridRAG検索エンジンインターフェースのインデックスです。
Keyword検索・Semantic検索・Graph検索を統合し、RRF（Reciprocal Rank Fusion）とCRAGによる高精度な検索を実現。

**親ドキュメント**: [interfaces-rag.md](./interfaces-rag.md)

**実装場所**: `packages/shared/src/types/rag/search/`

---

## ドキュメント構成

| カテゴリ               | ファイル                                     | 説明                                        |
| ---------------------- | -------------------------------------------- | ------------------------------------------- |
| 基本型・設定           | [rag-search-types.md](./rag-search-types.md) | SearchQuery/Result型、列挙型、検索設定型    |
| キーワード検索         | [rag-search-keyword.md](./rag-search-keyword.md) | FTS5/BM25全文検索戦略                   |
| ベクトル検索           | [rag-search-vector.md](./rag-search-vector.md)   | DiskANNセマンティック検索戦略           |
| グラフ検索             | [rag-search-graph.md](./rag-search-graph.md)     | Knowledge Graphベース検索戦略           |
| Corrective RAG         | [rag-search-crag.md](./rag-search-crag.md)       | LLM関連性評価・自己修正パイプライン     |
| HybridRAG統合          | [rag-search-hybrid.md](./rag-search-hybrid.md)   | 4ステージ統合エンジン、Factory          |

---

## 検索戦略一覧

| 戦略クラス                 | name       | 説明                       | 詳細                       |
| -------------------------- | ---------- | -------------------------- | -------------------------- |
| KeywordSearchStrategy      | "keyword"  | FTS5/BM25全文検索          | [rag-search-keyword.md](./rag-search-keyword.md) |
| VectorSearchStrategy       | "semantic" | DiskANNベクトル検索        | [rag-search-vector.md](./rag-search-vector.md)   |
| CachedVectorSearchStrategy | "semantic" | キャッシュ付きベクトル検索 | [rag-search-vector.md](./rag-search-vector.md)   |
| GraphSearchStrategy        | "graph"    | GraphRAGクエリ検索         | [rag-search-graph.md](./rag-search-graph.md)     |

---

## HybridRAGパイプライン

HybridRAGは5ステージで構成され、クエリ分類から最終結果出力まで一貫した処理フローを実現する。

### パイプライン処理フロー

| ステージ | 処理内容 | 説明 |
| -------- | -------- | ---- |
| 1. Query Classification | クエリ分類 | 入力クエリを解析し、最適な検索戦略を決定 |
| 2. Triple Search | 3並列検索 | Keyword/Semantic/Graphの3戦略を並列実行 |
| 3. RRF Fusion | スコア統合 | Reciprocal Rank Fusionで各検索結果を統合 |
| 4. Reranking | 再ランキング | 統合結果をLLMまたはクロスエンコーダで再順位付け |
| 5. CRAG | 関連性評価 | Corrective RAGによる結果の品質評価と自己修正 |

### Triple Search（並列検索）

ステージ2では以下の3戦略が並列実行される。

| 検索戦略 | 手法 | 特徴 |
| -------- | ---- | ---- |
| Keyword | FTS5/BM25 | 完全一致・部分一致に強い全文検索 |
| Semantic | DiskANN | 意味的類似性に基づくベクトル検索 |
| Graph | GraphRAG | 関係性・文脈を考慮したナレッジグラフ検索 |

クエリ入力から最終結果までの流れ: Query → Triple Search（並列） → RRF統合 → Rerank → CRAG → Results

---

## 品質メトリクス サマリー

| コンポーネント       | テスト数 | Line Coverage | Branch Coverage |
| -------------------- | -------- | ------------- | --------------- |
| 検索型定義           | 123      | 96.93%        | -               |
| KeywordSearch        | 35       | 93.39%        | -               |
| VectorSearch         | 83       | 98.71%        | 95.65%          |
| GraphSearch          | 69       | 94.54%        | 90.21%          |
| CRAG                 | 23       | 80%+          | 60%+            |
| HybridRAG統合        | 39       | 94.32%        | 91.66%          |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                     |
| ---------- | ---------- | -------------------------------------------- |
| 2026-01-26 | 7.1.0      | spec-guidelines準拠: コードブロックを表形式に変換 |
| 2026-01-26 | 7.0.0      | 6ファイルに分割（805行→インデックス+詳細）   |
| 2026-01-19 | 6.10.0     | キーワード検索戦略詳細化                     |
| 2026-01-17 | 6.9.0      | HybridRAGEngine、HybridRAGFactory追加        |
| 2026-01-17 | 6.8.0      | Corrective RAG詳細セクション追加             |
| 2026-01-13 | 6.7.0      | GraphSearchStrategy詳細セクション追加        |
| 2026-01-12 | 6.6.0      | VectorSearchStrategy・CachedVector追加       |
| 2026-01-11 | 6.5.0      | KeywordSearchStrategyセクション追加          |
| 2026-01-10 | 6.0.0      | HybridRAGSearcherインターフェース詳細化      |

---

## 関連ドキュメント

- [RAG・ファイル選択インターフェース](./interfaces-rag.md)
- [Search Service API](./api-internal-search.md)
- [チャンク検索API](./api-internal-chunk-search.md)
- [RAGアーキテクチャ](./architecture-rag.md)
