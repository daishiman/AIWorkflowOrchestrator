# RAG・Knowledge Graph アーキテクチャ設計

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

本ドキュメントはAIWorkflowOrchestratorプロジェクトのRAG（Retrieval-Augmented Generation）アーキテクチャのインデックスです。
各カテゴリは以下の分割ドキュメントで詳細を定義しています。

## current runtime snapshot（2026-03-21）

| 領域 | current status | 主参照 |
| --- | --- | --- |
| AI IPC legacy health | `AI_CHECK_CONNECTION` は `disconnected` を返す legacy guidance surface | `api-ipc-system-core.md` |
| AI IPC legacy index | `AI_INDEX` は zero-count + `errors: string[]` の guidance stub | `api-ipc-system-core.md`, `llm-ipc-types.md` |
| Community IPC | `COMMUNITY_*` は `NOT_IN_SCOPE` guidance-only | `api-ipc-system-core.md`, `llm-ipc-types.md` |
| GraphRAG | community search failure を warn + `fallbackReason` で可視化 | `interfaces-rag-graphrag-query.md`, `rag-query-pipeline.md` |
| HybridRAGFactory | 実装完了。`createFull()` / `createLite()` は `HybridRAGEngine` を返し、keyword adapter・3系統LLM分離・CRAG条件分岐を current runtime として提供する。graph queryType 非伝播は follow-up 管理 | `rag-search-hybrid.md` |
| CommunitySummarizer | embedding failure は partial failure として扱い、要約保存を継続 | `interfaces-rag-community-summarization.md` |

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

## known issues

### P64: ILLMClient 型二重定義問題（UT-RAG-08-002 で検出）

`HybridRAGFactory` 実装時に注意が必要な known issue。

| ファイル | 型名 | `complete()` シグネチャ | 用途 |
| --- | --- | --- | --- |
| `services/llm/types.ts` | `ILLMClient` | `complete(prompt: string, options?)` | `LLMReranker` |
| `services/search/crag/types.ts` | `ILLMClient` | `complete({ prompt, maxTokens, temperature })` | `RelevanceEvaluator` |

この2つの `ILLMClient` は同名だが互換性がない。`createFull()` 実装時に
`LLMReranker` と `RelevanceEvaluator` に同一インスタンスを渡すことはできず、
config 側で `rerankerLlmClient` と `cragLlmClient` を別フィールドとして区別する。

---

## 変更履歴

| Version | Date       | Changes                                            |
| ------- | ---------- | -------------------------------------------------- |
| 2.0.3   | 2026-03-21 | UT-RAG-08-002 実装完了を反映。HybridRAGFactory runtime を実配線済みに更新し、known limitation を follow-up 前提へ補正 |
| 2.0.2   | 2026-03-20 | UT-RAG-08-002 Phase 1-13 仕様書作成完了を反映。HybridRAGFactory runtime を「仕様書作成完了・実装待ち」に更新。P64（ILLMClient 型二重定義）known issue を追記 |
| 2.0.1   | 2026-03-19 | Task08 current-state snapshot を追加。IPC legacy guidance / GraphRAG fallback / HybridRAGFactory not-ready / CommunitySummarizer partial failure を反映 |
| 2.0.0   | 2026-01-26 | 5ファイルに分割（945行→インデックス+詳細ファイル） |
| 1.1.0   | 2026-01-26 | コードブロック（ASCIIアート図）を表形式・文章に変換 |
| 1.0.0   | 2026-01-25 | 初版作成                                           |

---

## 関連ドキュメント

- [アーキテクチャパターン](./architecture-patterns.md)
- [インターフェース定義（RAG Search）](./interfaces-rag-search.md)
- [インターフェース定義（Knowledge Graph Store）](./interfaces-rag-knowledge-graph-store.md)
