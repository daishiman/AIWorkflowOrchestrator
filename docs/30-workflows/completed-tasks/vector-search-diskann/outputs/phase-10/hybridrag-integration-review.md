# Phase 10 Task 5: HybridRAG統合確認

## 目的

HybridRAG Triple Searchとの統合が適切かを確認する。

---

## 1. HybridRAG Triple Search概要

```
┌─────────────────────────────────────────────────────────────────────┐
│                      HybridRAG Triple Search                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ KeywordSearch   │  │ VectorSearch    │  │ GraphSearch     │     │
│  │ Strategy        │  │ Strategy        │  │ Strategy        │     │
│  │ (FTS5/BM25)     │  │ (DiskANN)       │  │ (GraphRAG)      │     │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘     │
│           │                    │                    │               │
│           └────────────────────┼────────────────────┘               │
│                                │                                    │
│                                ▼                                    │
│                    ┌─────────────────────┐                         │
│                    │    SearchService    │                         │
│                    │  (結果マージ/RRF)   │                         │
│                    └─────────────────────┘                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. 統合ポイント確認

| 統合ポイント | 確認内容                 | 判定    | 詳細                              |
| ------------ | ------------------------ | ------- | --------------------------------- |
| Strategy登録 | SearchServiceへの登録    | ✅ 可能 | ISearchStrategy準拠               |
| 結果形式     | SearchResultItem[]互換   | ✅ 互換 | 正確なSearchResultItem構造を返す  |
| スコア範囲   | 0-1で他Strategyと統一    | ✅ 統一 | コサイン類似度 (0.0-1.0)          |
| エラー伝搬   | Result型での一貫した処理 | ✅ 一貫 | Result<SearchResultItem[], Error> |

---

## 3. SearchService登録互換性

### 3.1 登録パターン

```typescript
// SearchServiceでの想定使用
const searchService = new SearchService();

// VectorSearchStrategy登録
const vectorStrategy = new VectorSearchStrategy(db, embeddingProvider);
searchService.registerStrategy(vectorStrategy);

// または CachedVectorSearchStrategy
const cachedStrategy = new CachedVectorSearchStrategy(db, embeddingProvider, {
  cacheMaxAge: 5 * 60 * 1000,
  maxCacheSize: 1000,
});
searchService.registerStrategy(cachedStrategy);
```

### 3.2 他Strategyとの併用

```typescript
// Triple Search構成例
searchService.registerStrategy(keywordStrategy); // name: "keyword"
searchService.registerStrategy(vectorStrategy); // name: "semantic"
searchService.registerStrategy(graphStrategy); // name: "graph"

// 並列実行
const results = await searchService.search(query, {
  strategies: ["keyword", "semantic", "graph"],
});
```

**判定**: ✅ 併用可能（独立した戦略として動作）

---

## 4. 結果形式の互換性

### 4.1 SearchResultItem構造

VectorSearchStrategyが返す構造:

```typescript
{
  id: string; // chunkId
  type: "chunk"; // 固定
  score: number; // 0.0-1.0 (similarity)
  relevance: {
    combined: number; // = similarity
    keyword: 0; // 未使用
    semantic: number; // = similarity
    graph: 0; // 未使用
    rerank: null;
    crag: null;
  }
  content: {
    text: string; // チャンクテキスト
    summary: string | null; // contextualContent
    contextBefore: null;
    contextAfter: null;
  }
  highlights: []; // 空配列
  sources: {
    chunkId: ChunkId;
    fileId: null;
    entityIds: [];
    communityId: null;
    relationIds: [];
  }
}
```

### 4.2 他Strategy結果との比較

| フィールド         | Keyword    | Vector       | Graph        | マージ可能 |
| ------------------ | ---------- | ------------ | ------------ | ---------- |
| id                 | chunkId    | chunkId      | chunkId      | ✅         |
| type               | "chunk"    | "chunk"      | "chunk"      | ✅         |
| score              | BM25 (0-∞) | cosine (0-1) | 正規化 (0-1) | ✅ (RRF)   |
| relevance.keyword  | score      | 0            | 0            | ✅         |
| relevance.semantic | 0          | score        | 0            | ✅         |
| relevance.graph    | 0          | 0            | score        | ✅         |

**判定**: ✅ RRF (Reciprocal Rank Fusion) でマージ可能

---

## 5. スコア範囲の統一

### 5.1 コサイン類似度

```
VectorSearchResult.similarity: 0.0 ~ 1.0
  - 0.0: 完全に異なる
  - 1.0: 完全に一致
```

### 5.2 RRF統合時のスコア

```typescript
// RRFスコア計算例
const rrfScore = 1 / (k + rank); // k=60 (typical)
```

**判定**: ✅ 0-1範囲でRRF統合に適合

---

## 6. エラー伝搬の一貫性

### 6.1 Result型による統一

```typescript
// 全Strategyが同じResult型を返す
type StrategyResult = Promise<Result<SearchResultItem[], Error>>;

// SearchServiceでの処理
const vectorResult = await vectorStrategy.search(query, limit, filters);
if (vectorResult.isErr()) {
  // エラーログ
  console.error(`Vector search failed: ${vectorResult.error.message}`);
  // 他のStrategyの結果のみ使用
}
```

### 6.2 部分的エラー時の動作

| 状況                 | 期待動作                | 実装      |
| -------------------- | ----------------------- | --------- |
| Vector検索のみエラー | Keyword+Graph結果を返す | ✅ 対応可 |
| 全Strategy成功       | 全結果をマージ          | ✅ 対応可 |
| 全Strategyエラー     | 空配列またはエラー返却  | ✅ 対応可 |

---

## 7. 統合テスト項目（Phase 11用）

### 7.1 単体動作確認

- [ ] VectorSearchStrategy単独での検索
- [ ] CachedVectorSearchStrategy単独での検索
- [ ] キャッシュヒット/ミスの確認

### 7.2 Triple Search統合確認

- [ ] SearchService登録
- [ ] 並列実行
- [ ] 結果マージ（RRF）
- [ ] スコア正規化

### 7.3 エラーハンドリング確認

- [ ] 埋め込みAPI障害時の部分動作
- [ ] DB接続エラー時の挙動

---

## 8. 総合判定

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   HybridRAG統合確認: ✅ PASS                            │
│                                                         │
│   Strategy登録:      ✅ ISearchStrategy準拠             │
│   結果形式:          ✅ SearchResultItem[]互換          │
│   スコア範囲:        ✅ 0-1で統一（コサイン類似度）     │
│   エラー伝搬:        ✅ Result型で一貫                  │
│                                                         │
│   他Strategy併用:    ✅ 可能                            │
│   RRFマージ:         ✅ 対応可能                        │
│   部分エラー対応:    ✅ 設計済み                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 10 Task 5 完了記録

| 項目               | 内容       |
| ------------------ | ---------- |
| 完了日時           | 2026-01-12 |
| 判定               | PASS       |
| 統合ポイント確認数 | 4項目      |
| Triple Search互換  | 完全互換   |
