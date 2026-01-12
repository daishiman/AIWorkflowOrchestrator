# アーキテクチャドキュメント更新記録

## Phase 12 Task 3: アーキテクチャドキュメント更新

---

## 1. システムアーキテクチャ概要

### 1.1 HybridRAG Triple Search アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SearchService                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                   HybridRAGSearchStrategy                      │  │
│  │  ┌─────────────┬─────────────────────┬─────────────────────┐  │  │
│  │  │  Keyword    │      Semantic       │       Graph         │  │  │
│  │  │  Strategy   │      Strategy       │      Strategy       │  │  │
│  │  │  (FTS5/BM25)│   (DiskANN/Cosine)  │   (GraphRAG)        │  │  │
│  │  └─────────────┴──────────┬──────────┴─────────────────────┘  │  │
│  │                           │                                    │  │
│  │                           ▼                                    │  │
│  │              ┌────────────────────────┐                        │  │
│  │              │  VectorSearchStrategy  │ ← NEW                  │  │
│  │              │  - IEmbeddingProvider  │                        │  │
│  │              │  - libSQL/DiskANN      │                        │  │
│  │              │  - Cosine Similarity   │                        │  │
│  │              └────────────────────────┘                        │  │
│  │                           │                                    │  │
│  │              ┌────────────▼────────────┐                       │  │
│  │              │ CachedVectorSearchStrategy│ ← NEW               │  │
│  │              │  - LRU Cache (1000)     │                       │  │
│  │              │  - TTL 5分              │                       │  │
│  │              └─────────────────────────┘                       │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. コンポーネント関係

### 2.1 クラス依存関係

```
┌─────────────────────────────────────────────────────────────────┐
│                        ISearchStrategy                           │
│                         <<interface>>                            │
│  + name: string                                                  │
│  + search(query, limit, filters): Result<SearchResultItem[]>    │
│  + getMetrics(): StrategyMetric                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ implements
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌────────────────┐  ┌────────────────┐
│KeywordSearch  │  │VectorSearch    │  │GraphSearch     │
│Strategy       │  │Strategy        │  │Strategy        │
│(FTS5/BM25)    │  │(DiskANN)       │  │(GraphRAG)      │
└───────────────┘  └───────┬────────┘  └────────────────┘
                           │
                           │ extends (機能拡張)
                           ▼
                  ┌────────────────────┐
                  │CachedVectorSearch  │
                  │Strategy            │
                  │(LRU Cache)         │
                  └────────────────────┘
```

### 2.2 依存関係

```
VectorSearchStrategy
    ├── LibSQLDatabase (drizzle-orm/libsql)
    │     └── libSQL/Turso接続
    ├── IEmbeddingProvider
    │     └── OpenAIEmbeddingProvider
    │           └── OpenAI API
    └── searchByVector (db/queries/vector-search)
          └── DiskANN Index (libSQL)

CachedVectorSearchStrategy
    ├── VectorSearchStrategyと同様
    └── LRU Cache (Map)
```

---

## 3. データフロー

### 3.1 検索リクエストフロー

```
┌──────────┐     ┌──────────────────┐     ┌───────────────────┐
│  User    │────▶│ HybridRAG        │────▶│ VectorSearch      │
│  Query   │     │ SearchStrategy   │     │ Strategy          │
└──────────┘     └──────────────────┘     └─────────┬─────────┘
                                                    │
                 ┌──────────────────────────────────┤
                 │                                  │
                 ▼                                  ▼
         ┌───────────────┐              ┌───────────────────┐
         │ Embedding     │              │ libSQL            │
         │ Provider      │              │ Database          │
         │ (OpenAI)      │              │ (DiskANN Index)   │
         └───────────────┘              └───────────────────┘
                 │                                  │
                 │ Float32Array                     │ VectorSearchResult[]
                 │                                  │
                 └──────────────────┬───────────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ SearchResultItem[]  │
                         │ (score, content,    │
                         │  sources)           │
                         └─────────────────────┘
```

### 3.2 詳細検索フロー

```
1. クエリ受信
   └── search(query: "TypeScript型安全", limit: 10)

2. 入力バリデーション
   └── validateInput(query, limit)
       ├── 空クエリチェック
       ├── クエリ長チェック (≤1000)
       └── limit範囲チェック (1-100)

3. 埋め込み生成
   └── generateQueryEmbedding(query)
       └── embeddingProvider.embed(query)
           └── Float32Array (1536次元)

4. ベクトル検索
   └── executeVectorSearch(vector, limit, filters)
       └── searchByVector(db, vector, options)
           └── DiskANN cosine distance search

5. 結果変換
   └── vectorResults.map(toSearchResultItem)
       └── VectorSearchResult → SearchResultItem

6. フィルタリング
   └── minRelevanceフィルタ適用

7. メトリクス更新
   └── lastMetric = { resultCount, processingTime, topScore }

8. 結果返却
   └── ok(results: SearchResultItem[])
```

---

## 4. キャッシュアーキテクチャ

### 4.1 LRUキャッシュ構造

```
┌─────────────────────────────────────────────────────────────┐
│                  CachedVectorSearchStrategy                  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    LRU Cache (Map)                      │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │ Key: "query" (lowercase, trimmed)                │  │ │
│  │  │ Value: { embedding: Float32Array, timestamp }    │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                         │ │
│  │  maxSize: 1000                                          │ │
│  │  TTL: 5分 (cacheMaxAge: 300000ms)                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Statistics:                                                 │
│  - cacheHits: number                                         │
│  - cacheMisses: number                                       │
│  - hitRate: hits / (hits + misses)                           │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 キャッシュ動作

```
┌─────────────┐
│ search()    │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ getCacheKey()    │
│ (lowercase+trim) │
└────────┬─────────┘
         │
         ▼
    ┌─────────┐
    │ キャッシュ │
    │ 存在?    ├─── No ─────────────────────┐
    └────┬────┘                              │
         │ Yes                               │
         ▼                                   ▼
    ┌─────────┐                      ┌───────────────┐
    │ TTL    ├── Expired ───────────▶│ embed()       │
    │ 有効?   │                       │ 新規生成      │
    └────┬────┘                       └───────┬───────┘
         │ Valid                              │
         ▼                                    ▼
    ┌─────────────┐                   ┌───────────────┐
    │ cacheHits++ │                   │ cache.set()   │
    │ LRU更新     │                   │ evictIfNeeded │
    └──────┬──────┘                   │ cacheMisses++ │
           │                          └───────┬───────┘
           │                                  │
           └──────────────┬───────────────────┘
                          ▼
                 ┌────────────────┐
                 │ 埋め込み返却   │
                 │ Float32Array   │
                 └────────────────┘
```

---

## 5. 技術スタック統合

### 5.1 データベース統合

| コンポーネント | 技術               | 役割                    |
| -------------- | ------------------ | ----------------------- |
| DB接続         | drizzle-orm/libsql | ORM / クエリビルダー    |
| ベクトル検索   | libSQL DiskANN     | 近似最近傍探索          |
| 類似度計算     | Cosine Distance    | ベクトル類似度 (0〜1)   |
| インデックス   | vector_top_k()     | DiskANNインデックス使用 |

### 5.2 埋め込み統合

| コンポーネント | 技術                   | 役割                   |
| -------------- | ---------------------- | ---------------------- |
| 埋め込みモデル | text-embedding-3-small | OpenAI埋め込み         |
| ベクトル次元   | 1536                   | 埋め込みベクトルサイズ |
| データ型       | Float32Array           | 効率的なメモリ使用     |

---

## 6. 追加されたコンポーネント

| コンポーネント             | ファイル                         | 説明                      |
| -------------------------- | -------------------------------- | ------------------------- |
| VectorSearchStrategy       | vector-search-strategy.ts        | 基本ベクトル検索          |
| CachedVectorSearchStrategy | cached-vector-search-strategy.ts | キャッシュ付き検索        |
| types                      | types.ts                         | ISearchStrategy, Result型 |
| index                      | index.ts                         | エクスポート              |

---

## 7. 既存システムへの影響

### 7.1 変更なし

- KeywordSearchStrategy - 変更なし
- GraphSearchStrategy - 変更なし
- HybridRAGSearchStrategy - VectorSearchStrategy統合可能

### 7.2 新規追加

- VectorSearchStrategy - Semantic検索担当
- CachedVectorSearchStrategy - キャッシュ最適化版

---

## Phase 12 Task 3 完了記録

| 項目     | 内容           |
| -------- | -------------- |
| 完了日時 | 2026-01-12     |
| 成果物   | 本ドキュメント |
| 判定     | 完了           |
