# ベクトル検索戦略 (DiskANN) - タスク指示書

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | CONV-07-03                               |
| タスク名     | ベクトル検索戦略 (DiskANN)               |
| 親タスク     | CONV-07 (HybridRAG検索エンジン)          |
| 依存タスク   | CONV-04-04 (DiskANNベクトルインデックス) |
| 規模         | 中                                       |
| 見積もり工数 | 0.5日                                    |
| ステータス   | 未実施                                   |

---

## 1. 目的

libSQL/Tursoのベクトル検索機能を使用したセマンティック検索戦略を実装する。HybridRAGのTriple Searchの2つ目の検索源。

---

## 2. 成果物

- `packages/shared/src/services/search/strategies/vector-search-strategy.ts`
- `packages/shared/src/services/search/strategies/__tests__/vector-search-strategy.test.ts`

---

## 3. 入力

- 検索クエリ文字列
- 埋め込みプロバイダー（クエリの埋め込み生成用）
- 検索オプション（limit, filters, threshold）

---

## 4. 出力

検索結果（SearchResult[]）

- コサイン類似度スコア（0-1）
- チャンクコンテンツ
- メタデータ

---

## 5. 実装仕様

### 5.1 ベクトル検索戦略

```typescript
// packages/shared/src/services/search/strategies/vector-search-strategy.ts
export class VectorSearchStrategy implements ISearchStrategy {
  readonly name = "semantic";

  constructor(
    private readonly db: DrizzleClient,
    private readonly embeddingProvider: IEmbeddingProvider,
  ) {}

  async search(
    query: string,
    limit: number,
    filters?: SearchFilters,
    options?: VectorSearchOptions,
  ): Promise<Result<SearchResult[], Error>> {
    try {
      // 1. クエリの埋め込みを生成
      const embeddingResult = await this.embeddingProvider.embedSingle(query);
      if (!embeddingResult.success) {
        return err(embeddingResult.error);
      }

      const queryEmbedding = embeddingResult.data;

      // 2. ベクトル検索を実行
      const filterClauses = this.buildFilterClauses(filters);
      const threshold = options?.threshold ?? 0.3; // コサイン距離の閾値

      const sql = `
        SELECT
          c.id as chunk_id,
          c.content,
          c.file_id,
          c.metadata,
          e.embedding,
          vector_distance_cos(e.embedding, ?) as distance
        FROM embeddings e
        JOIN content_chunks c ON e.chunk_id = c.id
        ${filterClauses.join ? `JOIN files f ON c.file_id = f.id` : ""}
        WHERE vector_distance_cos(e.embedding, ?) <= ?
        ${filterClauses.where.length > 0 ? `AND ${filterClauses.where.join(" AND ")}` : ""}
        ORDER BY distance ASC
        LIMIT ?
      `;

      const params = [
        this.formatEmbedding(queryEmbedding),
        this.formatEmbedding(queryEmbedding),
        threshold,
        ...filterClauses.params,
        limit,
      ];

      const results = await this.db.execute(sql, params);

      return ok(
        results.rows.map((row) => ({
          chunkId: row.chunk_id as ChunkId,
          content: row.content as string,
          score: this.distanceToSimilarity(row.distance as number),
          source: "semantic" as const,
          metadata: {
            fileId: row.file_id,
            distance: row.distance,
            ...JSON.parse(row.metadata || "{}"),
          },
        })),
      );
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Vector search failed"),
      );
    }
  }

  /**
   * 埋め込みをSQL用のフォーマットに変換
   * libSQLは vector('[1.0, 2.0, ...]') 形式を使用
   */
  private formatEmbedding(embedding: number[]): string {
    return `vector('[${embedding.join(",")}]')`;
  }

  /**
   * コサイン距離をコサイン類似度に変換
   * distance = 1 - similarity
   */
  private distanceToSimilarity(distance: number): number {
    return Math.max(0, Math.min(1, 1 - distance));
  }

  /**
   * フィルタ条件を構築
   */
  private buildFilterClauses(filters?: SearchFilters): {
    join: boolean;
    where: string[];
    params: unknown[];
  } {
    if (!filters) {
      return { join: false, where: [], params: [] };
    }

    const where: string[] = [];
    const params: unknown[] = [];
    let needsJoin = false;

    if (filters.fileIds && filters.fileIds.length > 0) {
      where.push(`c.file_id IN (${filters.fileIds.map(() => "?").join(", ")})`);
      params.push(...filters.fileIds);
    }

    if (filters.fileTypes && filters.fileTypes.length > 0) {
      needsJoin = true;
      where.push(
        `f.mime_type IN (${filters.fileTypes.map(() => "?").join(", ")})`,
      );
      params.push(...filters.fileTypes);
    }

    if (filters.dateRange) {
      where.push("c.created_at >= ? AND c.created_at <= ?");
      params.push(filters.dateRange.from, filters.dateRange.to);
    }

    if (filters.workspaceIds && filters.workspaceIds.length > 0) {
      needsJoin = true;
      where.push(
        `f.workspace_id IN (${filters.workspaceIds.map(() => "?").join(", ")})`,
      );
      params.push(...filters.workspaceIds);
    }

    return { join: needsJoin, where, params };
  }
}

export interface VectorSearchOptions {
  /**
   * コサイン距離の閾値（デフォルト: 0.3）
   * これより遠い結果は除外
   */
  threshold?: number;

  /**
   * インデックスを使用するか（大規模データ用）
   */
  useIndex?: boolean;
}
```

### 5.2 キャッシュ付きベクトル検索

```typescript
export class CachedVectorSearchStrategy implements ISearchStrategy {
  readonly name = "semantic";

  private readonly cache = new Map<
    string,
    {
      embedding: number[];
      timestamp: number;
    }
  >();
  private readonly cacheMaxAge = 5 * 60 * 1000; // 5分

  constructor(
    private readonly baseStrategy: VectorSearchStrategy,
    private readonly embeddingProvider: IEmbeddingProvider,
  ) {}

  async search(
    query: string,
    limit: number,
    filters?: SearchFilters,
    options?: VectorSearchOptions,
  ): Promise<Result<SearchResult[], Error>> {
    // キャッシュされた埋め込みを使用
    const cacheKey = this.getCacheKey(query);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheMaxAge) {
      // キャッシュヒット
      return this.searchWithEmbedding(
        cached.embedding,
        limit,
        filters,
        options,
      );
    }

    // 新規埋め込み生成
    const embeddingResult = await this.embeddingProvider.embedSingle(query);
    if (!embeddingResult.success) {
      return err(embeddingResult.error);
    }

    // キャッシュに保存
    this.cache.set(cacheKey, {
      embedding: embeddingResult.data,
      timestamp: Date.now(),
    });

    // 古いキャッシュをクリーンアップ
    this.cleanupCache();

    return this.searchWithEmbedding(
      embeddingResult.data,
      limit,
      filters,
      options,
    );
  }

  private getCacheKey(query: string): string {
    return query.toLowerCase().trim();
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache) {
      if (now - value.timestamp > this.cacheMaxAge) {
        this.cache.delete(key);
      }
    }
  }

  private async searchWithEmbedding(
    embedding: number[],
    limit: number,
    filters?: SearchFilters,
    options?: VectorSearchOptions,
  ): Promise<Result<SearchResult[], Error>> {
    // 直接埋め込みを使用した検索
    // baseStrategyを拡張して埋め込み直接入力に対応
  }
}
```

---

## 6. テストケース

```typescript
describe("VectorSearchStrategy", () => {
  it("基本的なセマンティック検索が動作する", async () => {
    const strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);
    const result = await strategy.search("型安全なプログラミング", 10);

    expect(result.success).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0].source).toBe("semantic");
  });

  it("類似度スコアが0-1の範囲", async () => {
    const strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);
    const result = await strategy.search("test query", 10);

    expect(result.success).toBe(true);
    for (const item of result.data) {
      expect(item.score).toBeGreaterThanOrEqual(0);
      expect(item.score).toBeLessThanOrEqual(1);
    }
  });

  it("閾値でフィルタリングされる", async () => {
    const strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);
    const result = await strategy.search("test query", 10, undefined, {
      threshold: 0.2,
    });

    expect(result.success).toBe(true);
    // 距離が0.2以下 = 類似度が0.8以上の結果のみ
    for (const item of result.data) {
      expect(item.score).toBeGreaterThanOrEqual(0.8);
    }
  });

  it("フィルタが正しく適用される", async () => {
    const strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);
    const result = await strategy.search("test", 10, {
      fileTypes: ["text/markdown"],
    });

    expect(result.success).toBe(true);
  });

  it("結果が類似度順でソートされる", async () => {
    const strategy = new VectorSearchStrategy(mockDb, mockEmbeddingProvider);
    const result = await strategy.search("test", 10);

    expect(result.success).toBe(true);
    for (let i = 1; i < result.data.length; i++) {
      expect(result.data[i].score).toBeLessThanOrEqual(
        result.data[i - 1].score,
      );
    }
  });

  it("埋め込みプロバイダーエラー時にエラーを返す", async () => {
    const failingProvider = {
      embedSingle: vi.fn().mockResolvedValue(err(new Error("API error"))),
    };
    const strategy = new VectorSearchStrategy(mockDb, failingProvider as any);
    const result = await strategy.search("test", 10);

    expect(result.success).toBe(false);
  });
});

describe("CachedVectorSearchStrategy", () => {
  it("同じクエリでキャッシュが使用される", async () => {
    const strategy = new CachedVectorSearchStrategy(baseStrategy, mockProvider);

    await strategy.search("test query", 10);
    await strategy.search("test query", 10);

    // 埋め込み生成は1回のみ
    expect(mockProvider.embedSingle).toHaveBeenCalledTimes(1);
  });
});
```

---

## 7. 完了条件

- [ ] `VectorSearchStrategy`クラスが実装済み
- [ ] クエリの埋め込み生成が動作する
- [ ] libSQLベクトル検索が動作する
- [ ] コサイン距離が類似度に正しく変換される
- [ ] 閾値によるフィルタリングが動作する
- [ ] フィルタ条件が正しく適用される
- [ ] 結果が類似度順でソートされる
- [ ] エラーハンドリングが動作する
- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] JSDocコメントが記述されている

---

## 8. 次のタスク

- CONV-07-04: グラフ検索戦略

---

## 9. 参照情報

- CONV-04-04: DiskANNベクトルインデックス
- CONV-06-02: 埋め込みプロバイダー
- CONV-07: HybridRAG検索エンジン（親タスク）
- [libSQL Vector Search](https://turso.tech/blog/turso-native-vector-search-now-in-beta)

---

## 10. ベクトル検索のパフォーマンス指標

| データ規模     | 検索時間（目標） | インデックス使用 |
| -------------- | ---------------- | ---------------- |
| < 10,000件     | < 50ms           | 不要             |
| 10,000-100,000 | < 100ms          | 推奨             |
| > 100,000件    | < 200ms          | 必須             |
