# RAG・Knowledge Graph アーキテクチャ設計

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

本ドキュメントはAIWorkflowOrchestratorプロジェクトのRAG（Retrieval-Augmented Generation）アーキテクチャのインデックスです。
各カテゴリは以下の分割ドキュメントで詳細を定義しています。

---

## ドキュメント構成

| カテゴリ             | ファイル                                                 | 説明                                   |
| -------------------- | -------------------------------------------------------- | -------------------------------------- |
| Knowledge Graph型定義 | [rag-knowledge-graph.md](./rag-knowledge-graph.md)       | Entity/Relation/Community型、Zodバリデーション |
| ベクトル検索・同期   | [rag-vector-search.md](./rag-vector-search.md)           | DiskANN、オフライン同期、VectorSearchStrategy  |
| Desktop状態管理      | [rag-desktop-state.md](./rag-desktop-state.md)           | テーマ、ワークスペース、LLM選択        |
| RAGサービス群        | [rag-services.md](./rag-services.md)                     | クエリ分類、NER、Leiden Algorithm      |
| クエリパイプライン   | [rag-query-pipeline.md](./rag-query-pipeline.md)         | GraphRAG、HybridRAG統合パイプライン    |

---

## アーキテクチャ概要図

RAGパイプラインは、ドキュメントからクエリ応答生成までの一連の処理フローで構成される。

### インデックス構築フロー

ドキュメントは以下の順序で処理され、Knowledge Graphに格納される。

| ステップ | 処理内容 | 出力 |
| -------- | -------- | ---- |
| 1. 変換 | ドキュメントをテキスト形式に変換 | プレーンテキスト |
| 2. チャンキング | テキストを意味単位で分割 | チャンク配列 |
| 3. NER | 固有表現抽出（52種類のエンティティタイプ） | Entityノード |
| 4. 関係抽出 | エンティティ間の関係を特定（15種類の関係タイプ） | Relationエッジ |
| 5. コミュニティ検出 | Leiden Algorithmによるクラスタリング | Communityノード |

### 検索戦略（Triple Search）

Knowledge Graphに対して、3種類の検索戦略を並列実行する。

| 検索戦略 | 技術 | 特徴 |
| -------- | ---- | ---- |
| Keyword Search | SQLite FTS5（BM25） | 正確なキーワードマッチ、高速 |
| Semantic Search | DiskANN | ベクトル類似度検索、意味的関連性 |
| Graph Search | コミュニティ要約 | グラフ構造活用、文脈理解 |

### 統合エンジン（HybridRAG Engine）

3つの検索結果はHybridRAG Engineで統合される。統合処理は以下の順序で実行される。

| 処理 | 説明 |
| ---- | ---- |
| RRF（Reciprocal Rank Fusion） | 複数検索結果のスコア統合 |
| Reranking | Cross-encoderによる再順位付け |
| CRAG（Corrective RAG） | 検索結果の妥当性検証と補正 |

---

## 主要コンポーネント

### Knowledge Graph層

| コンポーネント   | 責務                                 | 詳細                                   |
| ---------------- | ------------------------------------ | -------------------------------------- |
| EntityEntity     | ノード（52種類のエンティティタイプ） | [rag-knowledge-graph.md](./rag-knowledge-graph.md) |
| RelationEntity   | エッジ（15種類の関係タイプ）         | [rag-knowledge-graph.md](./rag-knowledge-graph.md) |
| CommunityEntity  | クラスター（Leiden Algorithm）       | [rag-knowledge-graph.md](./rag-knowledge-graph.md) |

### 検索層

| コンポーネント       | 責務                           | 詳細                                   |
| -------------------- | ------------------------------ | -------------------------------------- |
| KeywordSearchStrategy | BM25キーワード検索             | [rag-query-pipeline.md](./rag-query-pipeline.md) |
| VectorSearchStrategy  | DiskANNセマンティック検索      | [rag-vector-search.md](./rag-vector-search.md) |
| GraphSearchStrategy   | コミュニティベースグラフ検索   | [rag-query-pipeline.md](./rag-query-pipeline.md) |

### サービス層

| サービス             | 責務                           | 詳細                                   |
| -------------------- | ------------------------------ | -------------------------------------- |
| QueryClassifier      | クエリタイプ分類               | [rag-services.md](./rag-services.md) |
| EntityExtractor      | NERエンティティ抽出            | [rag-services.md](./rag-services.md) |
| CommunityDetector    | Leiden Algorithmコミュニティ検出| [rag-services.md](./rag-services.md) |
| GraphRAGQueryService | コミュニティ要約活用クエリ     | [rag-query-pipeline.md](./rag-query-pipeline.md) |
| HybridRAGEngine      | Triple Search統合パイプライン  | [rag-query-pipeline.md](./rag-query-pipeline.md) |

---

## テスト品質サマリー

| コンポーネント      | テストケース数 | Line Coverage |
| ------------------- | -------------- | ------------- |
| Knowledge Graph型   | 230            | 99.2%         |
| クエリ分類器        | 186            | 94.13%        |
| NER                 | 224            | 97.1%         |
| Leiden Algorithm    | 52             | 92.06%        |
| VectorSearchStrategy | 83            | 98.71%        |
| GraphRAGQuery       | 44             | 100%          |
| HybridRAG           | 39             | 94.32%        |

---

## 変更履歴

| Version | Date       | Changes                                            |
| ------- | ---------- | -------------------------------------------------- |
| 2.0.0   | 2026-01-26 | 5ファイルに分割（945行→インデックス+詳細ファイル） |
| 1.1.0   | 2026-01-26 | コードブロック（ASCIIアート図）を表形式・文章に変換 |
| 1.0.0   | 2026-01-25 | 初版作成                                           |

---

## 関連ドキュメント

- [アーキテクチャパターン](./architecture-patterns.md)
- [インターフェース定義（RAG Search）](./interfaces-rag-search.md)
- [インターフェース定義（Knowledge Graph Store）](./interfaces-rag-knowledge-graph-store.md)
