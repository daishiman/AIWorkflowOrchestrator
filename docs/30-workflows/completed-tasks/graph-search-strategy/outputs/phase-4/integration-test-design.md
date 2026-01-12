# GraphSearchStrategy 統合テスト設計書

> Phase 4 成果物
> 作成日: 2026-01-13
> 機能名: graph-search-strategy

---

## 概要

GraphSearchStrategyと依存サービス（IKnowledgeGraphStore、IEmbeddingProvider、ICommunitySummarizer）との連携を検証する統合テストを設計する。

---

## 統合テストシナリオ

### 1. GraphStore連携テスト

#### シナリオ1-1: findSimilarEntities連携

```typescript
describe("GraphStore連携 - findSimilarEntities", () => {
  it("埋め込みベクトルを正しく渡してfindSimilarEntitiesを呼び出す", async () => {
    // Given
    const mockEmbedding = new Float32Array(384).fill(0.1);
    mockEmbeddingProvider.embed.mockResolvedValue({
      embedding: Array.from(mockEmbedding),
      tokenCount: 10,
    });
    mockGraphStore.findSimilarEntities.mockResolvedValue(ok(mockEntities));

    // When
    await strategy.search("テストクエリ", 10, undefined, {
      queryType: "local",
    });

    // Then
    expect(mockGraphStore.findSimilarEntities).toHaveBeenCalledWith(
      expect.any(Float32Array),
      expect.any(Number),
      expect.any(Number),
    );
  });

  it("limit * 2件のエンティティを取得する（マージン設定）", async () => {
    // Given
    const limit = 5;

    // When
    await strategy.search("テスト", limit, undefined, { queryType: "local" });

    // Then
    expect(mockGraphStore.findSimilarEntities).toHaveBeenCalledWith(
      expect.anything(),
      limit * 2, // マージン込み
      expect.any(Number),
    );
  });
});
```

#### シナリオ1-2: traverse連携

```typescript
describe("GraphStore連携 - traverse", () => {
  it("traverseを正しいオプションで呼び出す", async () => {
    // Given
    const startEntityId = "entity-1" as EntityId;
    mockGraphStore.findSimilarEntities.mockResolvedValue(ok([mockEntities[0]]));
    mockGraphStore.traverse.mockResolvedValue(
      ok({ entities: [], relations: [], depths: new Map() }),
    );

    // When
    await strategy.search("テスト", 10, undefined, {
      queryType: "relationship",
      traversalDepth: 3,
    });

    // Then
    expect(mockGraphStore.traverse).toHaveBeenCalledWith(
      startEntityId,
      expect.objectContaining({ depth: 3 }),
    );
  });

  it("traversalDepthが未指定時はデフォルト値2を使用", async () => {
    // When
    await strategy.search("テスト", 10, undefined, {
      queryType: "relationship",
    });

    // Then
    expect(mockGraphStore.traverse).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ depth: 2 }),
    );
  });
});
```

#### シナリオ1-3: findShortestPath連携

```typescript
describe("GraphStore連携 - findShortestPath", () => {
  it("2エンティティ以上の場合にfindShortestPathを呼び出す", async () => {
    // Given
    mockGraphStore.findSimilarEntities.mockResolvedValue(ok(mockEntities)); // 2件
    mockGraphStore.findShortestPath.mockResolvedValue(
      ok(["entity-1", "entity-2"]),
    );
    mockGraphStore.traverse.mockResolvedValue(
      ok({ entities: [], relations: [], depths: new Map() }),
    );

    // When
    await strategy.search("テスト", 10, undefined, {
      queryType: "relationship",
    });

    // Then
    expect(mockGraphStore.findShortestPath).toHaveBeenCalledWith(
      "entity-1",
      "entity-2",
    );
  });

  it("1エンティティの場合はfindShortestPathを呼び出さない", async () => {
    // Given
    mockGraphStore.findSimilarEntities.mockResolvedValue(ok([mockEntities[0]])); // 1件

    // When
    await strategy.search("テスト", 10, undefined, {
      queryType: "relationship",
    });

    // Then
    expect(mockGraphStore.findShortestPath).not.toHaveBeenCalled();
  });
});
```

#### シナリオ1-4: getRelationsByEntity連携

```typescript
describe("GraphStore連携 - getRelationsByEntity", () => {
  it("エンティティからチャンク取得時に関係情報を取得", async () => {
    // Given
    mockGraphStore.findSimilarEntities.mockResolvedValue(ok(mockEntities));
    mockGraphStore.getRelationsByEntity.mockResolvedValue(ok(mockRelations));

    // When
    await strategy.search("テスト", 10, undefined, { queryType: "local" });

    // Then
    expect(mockGraphStore.getRelationsByEntity).toHaveBeenCalled();
  });
});
```

---

### 2. EmbeddingProvider連携テスト

#### シナリオ2-1: embed呼び出し

```typescript
describe("EmbeddingProvider連携 - embed", () => {
  it("クエリ文字列でembed()を呼び出す", async () => {
    // Given
    const query = "TypeScript型システム";

    // When
    await strategy.search(query, 10);

    // Then
    expect(mockEmbeddingProvider.embed).toHaveBeenCalledWith(query);
  });

  it("埋め込み結果をFloat32Arrayに変換してGraphStoreに渡す", async () => {
    // Given
    const mockEmbeddingArray = new Array(384).fill(0.5);
    mockEmbeddingProvider.embed.mockResolvedValue({
      embedding: mockEmbeddingArray,
      tokenCount: 10,
    });

    // When
    await strategy.search("テスト", 10);

    // Then
    const calledEmbedding = mockGraphStore.findSimilarEntities.mock.calls[0][0];
    expect(calledEmbedding).toBeInstanceOf(Float32Array);
    expect(calledEmbedding.length).toBe(384);
  });
});
```

#### シナリオ2-2: エラーハンドリング

```typescript
describe("EmbeddingProvider連携 - エラー", () => {
  it("embed()失敗時にResult.errを返す", async () => {
    // Given
    mockEmbeddingProvider.embed.mockRejectedValue(new Error("API timeout"));

    // When
    const result = await strategy.search("テスト", 10);

    // Then
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toContain("embedding");
    }
  });

  it("embed()失敗時はGraphStoreを呼び出さない", async () => {
    // Given
    mockEmbeddingProvider.embed.mockRejectedValue(new Error("API error"));

    // When
    await strategy.search("テスト", 10);

    // Then
    expect(mockGraphStore.findSimilarEntities).not.toHaveBeenCalled();
  });
});
```

---

### 3. CommunitySummarizer連携テスト

#### シナリオ3-1: searchSummaries呼び出し

```typescript
describe("CommunitySummarizer連携 - searchSummaries", () => {
  it("globalSearchでsearchSummariesを呼び出す", async () => {
    // Given
    const query = "機械学習アルゴリズム";
    mockCommunitySummarizer.searchSummaries.mockResolvedValue(
      ok(mockSummaries),
    );

    // When
    await strategy.search(query, 10, undefined, { queryType: "global" });

    // Then
    expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalledWith(
      query,
      expect.objectContaining({ limit: 10 }),
    );
  });

  it("communityThresholdオプションが正しく渡される", async () => {
    // Given
    mockCommunitySummarizer.searchSummaries.mockResolvedValue(
      ok(mockSummaries),
    );

    // When
    await strategy.search("テスト", 10, undefined, {
      queryType: "global",
      communityThreshold: 0.6,
    });

    // Then
    expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ threshold: 0.6 }),
    );
  });
});
```

#### シナリオ3-2: フォールバック動作

```typescript
describe("CommunitySummarizer連携 - フォールバック", () => {
  it("CommunitySummarizer未設定時はlocalSearchにフォールバック", async () => {
    // Given
    const strategyWithoutSummarizer = new GraphSearchStrategy(
      mockGraphStore,
      mockEmbeddingProvider,
      undefined, // CommunitySummarizerなし
    );

    // When
    await strategyWithoutSummarizer.search("テスト", 10, undefined, {
      queryType: "global",
    });

    // Then
    expect(mockGraphStore.findSimilarEntities).toHaveBeenCalled();
    // searchSummariesは呼ばれない（mockがないので確認不要）
  });

  it("searchSummariesエラー時はResult.errを返す", async () => {
    // Given
    mockCommunitySummarizer.searchSummaries.mockResolvedValue(
      err(new Error("Summarizer error")),
    );

    // When
    const result = await strategy.search("テスト", 10, undefined, {
      queryType: "global",
    });

    // Then
    expect(result.isErr()).toBe(true);
  });
});
```

---

### 4. End-to-End フロー

#### シナリオ4-1: localSearch E2E

```typescript
describe("E2E - localSearch", () => {
  it("埋め込み生成→エンティティ検索→チャンク取得→結果変換の全フロー", async () => {
    // Given
    setupMocksForLocalSearch();

    // When
    const result = await strategy.search("テストクエリ", 10);

    // Then
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      // 埋め込み生成
      expect(mockEmbeddingProvider.embed).toHaveBeenCalledTimes(1);
      // エンティティ検索
      expect(mockGraphStore.findSimilarEntities).toHaveBeenCalledTimes(1);
      // チャンク取得
      expect(mockGraphStore.getRelationsByEntity).toHaveBeenCalled();
      // 結果検証
      expect(result.value.length).toBeGreaterThan(0);
      expect(result.value[0].type).toBe("chunk");
      expect(result.value[0].sources.entityIds.length).toBeGreaterThan(0);
    }
  });
});
```

#### シナリオ4-2: globalSearch E2E

```typescript
describe("E2E - globalSearch", () => {
  it("サマリ検索→結果変換の全フロー", async () => {
    // Given
    setupMocksForGlobalSearch();

    // When
    const result = await strategy.search("テスト", 10, undefined, {
      queryType: "global",
    });

    // Then
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalledTimes(1);
      expect(result.value[0].type).toBe("community");
      expect(result.value[0].sources.communityId).toBeDefined();
    }
  });
});
```

#### シナリオ4-3: relationshipSearch E2E

```typescript
describe("E2E - relationshipSearch", () => {
  it("エンティティ抽出→最短経路→トラバーサル→結果変換の全フロー", async () => {
    // Given
    setupMocksForRelationshipSearch();

    // When
    const result = await strategy.search("テスト", 10, undefined, {
      queryType: "relationship",
    });

    // Then
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(mockEmbeddingProvider.embed).toHaveBeenCalled();
      expect(mockGraphStore.findSimilarEntities).toHaveBeenCalled();
      expect(mockGraphStore.findShortestPath).toHaveBeenCalled();
      expect(mockGraphStore.traverse).toHaveBeenCalled();
      expect(result.value[0].sources.relationIds.length).toBeGreaterThan(0);
    }
  });
});
```

---

### 5. エラーハンドリング連携テスト

#### シナリオ5-1: 連続エラー

```typescript
describe("エラーハンドリング連携", () => {
  it("GraphStoreエラー後は後続処理をスキップ", async () => {
    // Given
    mockGraphStore.findSimilarEntities.mockResolvedValue(
      err(new Error("DB connection failed")),
    );

    // When
    const result = await strategy.search("テスト", 10);

    // Then
    expect(result.isErr()).toBe(true);
    // チャンク取得は呼ばれない
    expect(mockGraphStore.getRelationsByEntity).not.toHaveBeenCalled();
  });

  it("部分エラー時は成功分のみ返却", async () => {
    // Given
    mockGraphStore.findSimilarEntities.mockResolvedValue(ok(mockEntities));
    mockGraphStore.getRelationsByEntity
      .mockResolvedValueOnce(ok(mockChunks)) // 1件目成功
      .mockResolvedValueOnce(err(new Error("Failed"))); // 2件目失敗

    // When
    const result = await strategy.search("テスト", 10);

    // Then
    expect(result.isOk()).toBe(true);
    // 成功分のみ含まれる
  });
});
```

---

## テスト環境設定

### モックファクトリ

```typescript
// test-utils/graph-search-mocks.ts
export const createMockGraphStore = (): IKnowledgeGraphStore => ({
  findSimilarEntities: vi.fn().mockResolvedValue(ok([])),
  traverse: vi
    .fn()
    .mockResolvedValue(ok({ entities: [], relations: [], depths: new Map() })),
  findShortestPath: vi.fn().mockResolvedValue(ok(null)),
  getRelationsByEntity: vi.fn().mockResolvedValue(ok([])),
  // 他のメソッドは使用しない
  addEntity: vi.fn(),
  getEntity: vi.fn(),
  updateEntity: vi.fn(),
  deleteEntity: vi.fn(),
  searchEntities: vi.fn(),
  addRelation: vi.fn(),
  getRelation: vi.fn(),
  deleteRelation: vi.fn(),
  getNeighbors: vi.fn(),
  bulkUpsertEntities: vi.fn(),
  bulkAddRelations: vi.fn(),
  getStats: vi.fn(),
});

export const createMockEmbeddingProvider = (): IEmbeddingProvider => ({
  modelId: "text-embedding-3-small" as any,
  providerName: "openai" as any,
  dimensions: 384,
  maxTokens: 8192,
  embed: vi.fn().mockResolvedValue({
    embedding: new Array(384).fill(0.1),
    tokenCount: 10,
  }),
  embedBatch: vi.fn(),
  countTokens: vi.fn().mockReturnValue(10),
  healthCheck: vi.fn().mockResolvedValue(true),
});

export const createMockCommunitySummarizer = (): ICommunitySummarizer => ({
  summarize: vi.fn(),
  summarizeAll: vi.fn(),
  searchSummaries: vi.fn().mockResolvedValue(ok([])),
  updateSummary: vi.fn(),
});
```

---

## 変更履歴

| 日付       | 変更内容                |
| ---------- | ----------------------- |
| 2026-01-13 | 初版作成（Phase 4完了） |
