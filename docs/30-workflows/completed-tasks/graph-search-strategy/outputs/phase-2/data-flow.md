# GraphSearchStrategy データフロー設計

> Phase 2 成果物
> 作成日: 2026-01-13
> 機能名: graph-search-strategy

---

## 概要

GraphSearchStrategyの3種類の検索（local/global/relationship）のデータフローを設計する。

---

## 全体フロー

```
                              search(query, limit, filters, options)
                                           │
                                           ▼
                              ┌───────────────────────┐
                              │    validateInput()    │
                              │  - query長チェック    │
                              │  - limit範囲チェック  │
                              └───────────────────────┘
                                           │
                                           ▼
                         ┌─────────────────┼─────────────────┐
                         │                 │                 │
                 queryType="local"  queryType="global"  queryType="relationship"
                         │                 │                 │
                         ▼                 ▼                 ▼
                ┌────────────────┐ ┌────────────────┐ ┌──────────────────────┐
                │ localSearch()  │ │ globalSearch() │ │ relationshipSearch() │
                └────────────────┘ └────────────────┘ └──────────────────────┘
                         │                 │                 │
                         └─────────────────┼─────────────────┘
                                           │
                                           ▼
                              ┌───────────────────────┐
                              │  toSearchResultItem() │
                              │  スコアでソート        │
                              │  limit件に切り詰め    │
                              └───────────────────────┘
                                           │
                                           ▼
                              Result<SearchResultItem[], Error>
```

---

## localSearch フロー

エンティティベースの検索。クエリに関連するエンティティを見つけ、関連チャンクを返す。

### シーケンス図

```
┌──────────┐    ┌─────────────────┐    ┌───────────────┐    ┌────────────┐
│  Client  │    │GraphSearchStrategy│   │EmbeddingProvider│  │ GraphStore │
└────┬─────┘    └────────┬────────┘    └───────┬───────┘    └─────┬──────┘
     │                   │                      │                  │
     │ localSearch()     │                      │                  │
     │──────────────────>│                      │                  │
     │                   │                      │                  │
     │                   │ embed(query)         │                  │
     │                   │─────────────────────>│                  │
     │                   │                      │                  │
     │                   │<─────────────────────│                  │
     │                   │   queryEmbedding     │                  │
     │                   │                      │                  │
     │                   │ findSimilarEntities(embedding, limit)  │
     │                   │─────────────────────────────────────────>│
     │                   │                      │                  │
     │                   │<─────────────────────────────────────────│
     │                   │   EntityMatch[]      │                  │
     │                   │                      │                  │
     │                   │ [for each entity]    │                  │
     │                   │ getEntityChunks()    │                  │
     │                   │─────────────────────────────────────────>│
     │                   │<─────────────────────────────────────────│
     │                   │   ChunkInfo[]        │                  │
     │                   │                      │                  │
     │                   │ calculateLocalScore()│                  │
     │                   │ toSearchResultItem() │                  │
     │                   │                      │                  │
     │<──────────────────│                      │                  │
     │ SearchResultItem[]│                      │                  │
```

### 処理ステップ

```
1. generateQueryEmbedding(query)
   │
   └─> IEmbeddingProvider.embed(query)
       └─> Float32Array (384次元)

2. findSimilarEntities(embedding, limit * 2, entityThreshold)
   │
   └─> IKnowledgeGraphStore.findSimilarEntities()
       └─> EntityMatch[] (類似エンティティ)

3. フィルタ適用
   │
   ├─> entityTypesフィルタ（指定タイプのみ）
   └─> thresholdフィルタ（類似度閾値以上）

4. getEntityChunks(entityId, filters)
   │
   └─> entity_chunk_links経由でチャンク取得
       └─> ChunkInfo[]

5. スコア計算
   │
   └─> calculateLocalScore(entitySimilarity, chunkRelevance)
       └─> score = entitySimilarity * 0.6 + chunkRelevance * 0.4

6. 結果生成
   │
   └─> toSearchResultItem() + ソート + limit適用
       └─> SearchResultItem[]
```

---

## globalSearch フロー

コミュニティサマリベースの検索。高レベルの概念的な質問に対応。

### シーケンス図

```
┌──────────┐    ┌─────────────────┐    ┌───────────────┐    ┌────────────────────┐
│  Client  │    │GraphSearchStrategy│   │EmbeddingProvider│  │CommunitySummarizer │
└────┬─────┘    └────────┬────────┘    └───────┬───────┘    └─────────┬──────────┘
     │                   │                      │                      │
     │ globalSearch()    │                      │                      │
     │──────────────────>│                      │                      │
     │                   │                      │                      │
     │                   │ [check summarizer]   │                      │
     │                   │ (null? → fallback)   │                      │
     │                   │                      │                      │
     │                   │ searchSummaries(query, options)             │
     │                   │─────────────────────────────────────────────>│
     │                   │                      │                      │
     │                   │<─────────────────────────────────────────────│
     │                   │   CommunitySummary[] │                      │
     │                   │                      │                      │
     │                   │ calculateGlobalScore()                      │
     │                   │ toSearchResultItem() │                      │
     │                   │                      │                      │
     │<──────────────────│                      │                      │
     │ SearchResultItem[]│                      │                      │
```

### 処理ステップ

```
1. CommunitySummarizerチェック
   │
   ├─> null → localSearch()にフォールバック
   └─> 存在 → 続行

2. searchSummaries(query, options)
   │
   └─> ICommunitySummarizer.searchSummaries()
       └─> CommunitySummary[] (類似サマリ)

3. スコア計算
   │
   └─> calculateGlobalScore(summarySimilarity)
       └─> score = summarySimilarity (直接使用)

4. 結果生成
   │
   └─> type: "community"
       └─> sources.communityId = summary.communityId
```

---

## relationshipSearch フロー

関係パスベースの検索。エンティティ間の関係を辿る。

### シーケンス図

```
┌──────────┐    ┌─────────────────┐    ┌───────────────┐    ┌────────────┐
│  Client  │    │GraphSearchStrategy│   │EmbeddingProvider│  │ GraphStore │
└────┬─────┘    └────────┬────────┘    └───────┬───────┘    └─────┬──────┘
     │                   │                      │                  │
     │relationshipSearch()│                     │                  │
     │──────────────────>│                      │                  │
     │                   │                      │                  │
     │                   │ extractQueryEntities(query)              │
     │                   │ (embed → findSimilar)│                  │
     │                   │─────────────────────>│                  │
     │                   │<─────────────────────│                  │
     │                   │─────────────────────────────────────────>│
     │                   │<─────────────────────────────────────────│
     │                   │   EntityMatch[]      │                  │
     │                   │                      │                  │
     │                   │ [2+ entities found?] │                  │
     │                   │                      │                  │
     │                   │ findShortestPath(entity1, entity2)      │
     │                   │─────────────────────────────────────────>│
     │                   │<─────────────────────────────────────────│
     │                   │   PathInfo           │                  │
     │                   │                      │                  │
     │                   │ traverse(startEntity, depth)            │
     │                   │─────────────────────────────────────────>│
     │                   │<─────────────────────────────────────────│
     │                   │   TraversalResult    │                  │
     │                   │                      │                  │
     │                   │ getRelatedChunks()   │                  │
     │                   │─────────────────────────────────────────>│
     │                   │<─────────────────────────────────────────│
     │                   │   ChunkInfo[]        │                  │
     │                   │                      │                  │
     │<──────────────────│                      │                  │
     │ SearchResultItem[]│                      │                  │
```

### 処理ステップ

```
1. extractQueryEntities(query, threshold)
   │
   ├─> generateQueryEmbedding(query)
   └─> findSimilarEntities(embedding, topK=5)
       └─> EntityMatch[] (上位エンティティ)

2. エンティティ数チェック
   │
   ├─> 0件 → ok([]) 空結果
   ├─> 1件 → traverse()のみ実行
   └─> 2件以上 → findShortestPath + traverse

3. findShortestPath(entity1.id, entity2.id)
   │
   └─> IKnowledgeGraphStore.findShortestPath()
       └─> PathInfo (最短経路)

4. traverse(startEntityId, { depth: traversalDepth })
   │
   └─> IKnowledgeGraphStore.traverse()
       └─> TraversalResult (周辺ノード)

5. getRelatedChunks()
   │
   ├─> パス上のエッジ（relation）からチャンク取得
   └─> トラバーサル結果のエンティティからチャンク取得

6. スコア計算
   │
   └─> calculatePathScore(distance, chunkRelevance)
       └─> score = (1 / (1 + distance)) * 0.5 + chunkRelevance * 0.5

7. 結果生成
   │
   └─> sources.relationIds = path.relationIds
       └─> sources.entityIds = path.entityIds
```

---

## スコアリングロジック

### localSearch スコア

```typescript
calculateLocalScore(entitySimilarity: number, chunkRelevance: number): number {
  const ENTITY_WEIGHT = 0.6;
  const CHUNK_WEIGHT = 0.4;
  return entitySimilarity * ENTITY_WEIGHT + chunkRelevance * CHUNK_WEIGHT;
}
```

### globalSearch スコア

```typescript
calculateGlobalScore(summarySimilarity: number): number {
  return summarySimilarity; // サマリ類似度をそのまま使用
}
```

### relationshipSearch スコア

```typescript
calculatePathScore(distance: number, chunkRelevance: number): number {
  const DISTANCE_WEIGHT = 0.5;
  const CHUNK_WEIGHT = 0.5;
  // 距離が近いほど高スコア
  const distanceScore = 1 / (1 + distance);
  return distanceScore * DISTANCE_WEIGHT + chunkRelevance * CHUNK_WEIGHT;
}
```

---

## エラーハンドリングフロー

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Error Handling Flow                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  validateInput() ─────> 失敗 ────> err(ValidationError)             │
│        │                                                             │
│        ▼ 成功                                                        │
│  embed() ─────────────> 失敗 ────> err(EmbeddingError)              │
│        │                                                             │
│        ▼ 成功                                                        │
│  findSimilarEntities() ─> 失敗 ─> err(GraphStoreError)              │
│        │                                                             │
│        ▼ 成功                                                        │
│  結果が0件 ───────────> ok([]) (空配列で正常終了)                   │
│        │                                                             │
│        ▼ 1件以上                                                     │
│  getEntityChunks() ───> 部分失敗 ─> 成功分のみ返却                  │
│        │                                                             │
│        ▼ 成功                                                        │
│  スコア計算 ──────────> (例外なし)                                   │
│        │                                                             │
│        ▼                                                             │
│  ok(SearchResultItem[])                                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 変更履歴

| 日付       | 変更内容                |
| ---------- | ----------------------- |
| 2026-01-13 | 初版作成（Phase 2完了） |
