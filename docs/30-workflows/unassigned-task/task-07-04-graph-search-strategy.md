# グラフ検索戦略 - タスク指示書

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| タスクID     | CONV-07-04                         |
| タスク名     | グラフ検索戦略                     |
| 親タスク     | CONV-07 (HybridRAG検索エンジン)    |
| 依存タスク   | CONV-08-01 (Knowledge Graph Store) |
| 規模         | 中                                 |
| 見積もり工数 | 0.5日                              |
| ステータス   | 未実施                             |

---

## 1. 目的

Knowledge Graphを使用したグラフ検索戦略を実装する。HybridRAGのTriple Searchの3つ目の検索源。エンティティ関係とコミュニティサマリを活用した検索。

---

## 2. 成果物

- `packages/shared/src/services/search/strategies/graph-search-strategy.ts`
- `packages/shared/src/services/search/strategies/__tests__/graph-search-strategy.test.ts`

---

## 3. 入力

- 検索クエリ文字列
- クエリタイプ（local/global/relationship）
- 検索オプション（limit, filters, traversalDepth）

---

## 4. 出力

検索結果（SearchResult[]）

- グラフベースの関連度スコア（0-1）
- エンティティ/コミュニティ情報
- 関連コンテンツ

---

## 5. 実装仕様

### 5.1 グラフ検索戦略

```typescript
// packages/shared/src/services/search/strategies/graph-search-strategy.ts
import type { ISearchStrategy, SearchResult, SearchFilters } from "../types";
import type { IKnowledgeGraphStore } from "@/services/knowledge-graph/store";
import type { IEmbeddingProvider } from "@/services/embedding/provider";
import type { QueryType } from "../query-classifier";
import { ok, err, type Result } from "@/types/result";

export class GraphSearchStrategy implements ISearchStrategy {
  readonly name = "graph";

  constructor(
    private readonly graphStore: IKnowledgeGraphStore,
    private readonly embeddingProvider: IEmbeddingProvider,
  ) {}

  async search(
    query: string,
    limit: number,
    filters?: SearchFilters,
    options?: GraphSearchOptions,
  ): Promise<Result<SearchResult[], Error>> {
    try {
      const queryType = options?.queryType ?? "local";

      // クエリタイプに応じた検索戦略を選択
      switch (queryType) {
        case "global":
          return this.globalSearch(query, limit, filters, options);
        case "relationship":
          return this.relationshipSearch(query, limit, filters, options);
        case "local":
        default:
          return this.localSearch(query, limit, filters, options);
      }
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error("Graph search failed"),
      );
    }
  }

  /**
   * ローカル検索: エンティティベースの検索
   * クエリに関連するエンティティを見つけ、関連コンテンツを取得
   */
  private async localSearch(
    query: string,
    limit: number,
    filters?: SearchFilters,
    options?: GraphSearchOptions,
  ): Promise<Result<SearchResult[], Error>> {
    // 1. クエリの埋め込みを生成
    const embeddingResult = await this.embeddingProvider.embedSingle(query);
    if (!embeddingResult.success) {
      return err(embeddingResult.error);
    }

    // 2. 類似エンティティを検索
    const entityLimit = Math.ceil(limit * 1.5); // 余裕を持って取得
    const similarEntities = await this.graphStore.findSimilarEntities(
      embeddingResult.data,
      entityLimit,
      options?.entityThreshold ?? 0.5,
    );

    if (!similarEntities.success) {
      return err(similarEntities.error);
    }

    // 3. エンティティから関連チャンクを取得
    const results: SearchResult[] = [];
    const seenChunks = new Set<string>();

    for (const entity of similarEntities.data) {
      // エンティティに関連するチャンクを取得
      const chunks = await this.getEntityChunks(entity.id, filters);
      if (!chunks.success) continue;

      for (const chunk of chunks.data) {
        if (seenChunks.has(chunk.chunkId)) continue;
        seenChunks.add(chunk.chunkId);

        results.push({
          chunkId: chunk.chunkId,
          content: chunk.content,
          score: this.calculateLocalScore(entity.similarity, chunk.relevance),
          source: "graph" as const,
          metadata: {
            entityId: entity.id,
            entityName: entity.name,
            entityType: entity.type,
            ...chunk.metadata,
          },
        });
      }

      if (results.length >= limit) break;
    }

    // スコア順でソートして返す
    results.sort((a, b) => b.score - a.score);
    return ok(results.slice(0, limit));
  }

  /**
   * グローバル検索: コミュニティサマリベースの検索
   * 高レベルの概念的な質問に対応
   */
  private async globalSearch(
    query: string,
    limit: number,
    filters?: SearchFilters,
    options?: GraphSearchOptions,
  ): Promise<Result<SearchResult[], Error>> {
    // 1. クエリの埋め込みを生成
    const embeddingResult = await this.embeddingProvider.embedSingle(query);
    if (!embeddingResult.success) {
      return err(embeddingResult.error);
    }

    // 2. 類似コミュニティサマリを検索
    const communities = await this.graphStore.findSimilarCommunities(
      embeddingResult.data,
      limit,
      options?.communityThreshold ?? 0.4,
    );

    if (!communities.success) {
      return err(communities.error);
    }

    // 3. コミュニティサマリを結果として返す
    const results: SearchResult[] = communities.data.map((community) => ({
      chunkId: `community-${community.id}` as ChunkId,
      content: community.summary,
      score: community.similarity,
      source: "graph" as const,
      metadata: {
        communityId: community.id,
        communityLevel: community.level,
        entityCount: community.entityCount,
        keyEntities: community.keyEntities,
      },
    }));

    return ok(results);
  }

  /**
   * 関係検索: エンティティ間の関係を辿る検索
   * 「AとBの関係は？」のような質問に対応
   */
  private async relationshipSearch(
    query: string,
    limit: number,
    filters?: SearchFilters,
    options?: GraphSearchOptions,
  ): Promise<Result<SearchResult[], Error>> {
    // 1. クエリからエンティティを抽出（簡易版）
    const entities = await this.extractQueryEntities(query);
    if (entities.length < 2) {
      // 2エンティティ未満の場合はローカル検索にフォールバック
      return this.localSearch(query, limit, filters, options);
    }

    // 2. エンティティ間のパスを検索
    const [sourceEntity, targetEntity] = entities;
    const maxDepth = options?.traversalDepth ?? 3;

    const pathResult = await this.graphStore.findShortestPath(
      sourceEntity.id,
      targetEntity.id,
      maxDepth,
    );

    if (!pathResult.success) {
      return err(pathResult.error);
    }

    const results: SearchResult[] = [];

    if (pathResult.data) {
      // パスが見つかった場合
      const path = pathResult.data;

      // パス上の各エッジに関連するチャンクを取得
      for (const edge of path.edges) {
        const chunks = await this.getRelationChunks(edge.relationId, filters);
        if (!chunks.success) continue;

        for (const chunk of chunks.data) {
          results.push({
            chunkId: chunk.chunkId,
            content: chunk.content,
            score: this.calculatePathScore(path.distance, chunk.relevance),
            source: "graph" as const,
            metadata: {
              pathDistance: path.distance,
              relationId: edge.relationId,
              relationType: edge.type,
              sourceEntity: sourceEntity.name,
              targetEntity: targetEntity.name,
              ...chunk.metadata,
            },
          });
        }
      }
    }

    // 3. グラフトラバーサルで関連コンテンツも取得
    const traversalResult = await this.graphStore.traverse(sourceEntity.id, {
      maxDepth: maxDepth,
      limit: limit - results.length,
      relationTypes: options?.relationTypes,
    });

    if (traversalResult.success) {
      for (const node of traversalResult.data.nodes) {
        if (node.id === sourceEntity.id) continue;

        const chunks = await this.getEntityChunks(node.id, filters);
        if (!chunks.success) continue;

        for (const chunk of chunks.data.slice(0, 2)) {
          // 各エンティティから最大2チャンク
          results.push({
            chunkId: chunk.chunkId,
            content: chunk.content,
            score: this.calculateTraversalScore(node.depth, chunk.relevance),
            source: "graph" as const,
            metadata: {
              entityId: node.id,
              entityName: node.name,
              depth: node.depth,
              ...chunk.metadata,
            },
          });
        }
      }
    }

    results.sort((a, b) => b.score - a.score);
    return ok(results.slice(0, limit));
  }

  /**
   * クエリからエンティティを抽出（簡易版）
   */
  private async extractQueryEntities(
    query: string,
  ): Promise<Array<{ id: EntityId; name: string }>> {
    // 実際の実装ではNERまたはLLMを使用
    // ここでは類似エンティティ検索で代用
    const embeddingResult = await this.embeddingProvider.embedSingle(query);
    if (!embeddingResult.success) return [];

    const entities = await this.graphStore.findSimilarEntities(
      embeddingResult.data,
      5,
      0.6,
    );

    if (!entities.success) return [];
    return entities.data.map((e) => ({ id: e.id, name: e.name }));
  }

  /**
   * エンティティに関連するチャンクを取得
   */
  private async getEntityChunks(
    entityId: EntityId,
    filters?: SearchFilters,
  ): Promise<
    Result<
      Array<{
        chunkId: ChunkId;
        content: string;
        relevance: number;
        metadata: Record<string, unknown>;
      }>,
      Error
    >
  > {
    // entity_chunk_links テーブルから取得
    // 実装は依存するリポジトリを使用
  }

  /**
   * 関係に関連するチャンクを取得
   */
  private async getRelationChunks(
    relationId: RelationId,
    filters?: SearchFilters,
  ): Promise<
    Result<
      Array<{
        chunkId: ChunkId;
        content: string;
        relevance: number;
        metadata: Record<string, unknown>;
      }>,
      Error
    >
  > {
    // 関係の出現箇所からチャンクを取得
  }

  /**
   * ローカル検索のスコア計算
   */
  private calculateLocalScore(
    entitySimilarity: number,
    chunkRelevance: number,
  ): number {
    // エンティティ類似度とチャンク関連度の加重平均
    return entitySimilarity * 0.6 + chunkRelevance * 0.4;
  }

  /**
   * パス検索のスコア計算
   */
  private calculatePathScore(distance: number, chunkRelevance: number): number {
    // 距離が近いほど高スコア
    const distanceScore = 1 / (1 + distance * 0.2);
    return distanceScore * 0.5 + chunkRelevance * 0.5;
  }

  /**
   * トラバーサル検索のスコア計算
   */
  private calculateTraversalScore(
    depth: number,
    chunkRelevance: number,
  ): number {
    // 深度が浅いほど高スコア
    const depthScore = 1 / (1 + depth * 0.3);
    return depthScore * 0.4 + chunkRelevance * 0.6;
  }
}

export interface GraphSearchOptions {
  /**
   * クエリタイプ（検索戦略の選択に使用）
   */
  queryType?: QueryType;

  /**
   * エンティティ類似度の閾値（デフォルト: 0.5）
   */
  entityThreshold?: number;

  /**
   * コミュニティ類似度の閾値（デフォルト: 0.4）
   */
  communityThreshold?: number;

  /**
   * グラフトラバーサルの最大深度（デフォルト: 3）
   */
  traversalDepth?: number;

  /**
   * フィルタする関係タイプ
   */
  relationTypes?: string[];
}
```

---

## 6. テストケース

```typescript
describe("GraphSearchStrategy", () => {
  describe("localSearch", () => {
    it("エンティティベースの検索が動作する", async () => {
      const strategy = new GraphSearchStrategy(
        mockGraphStore,
        mockEmbeddingProvider,
      );
      const result = await strategy.search("TypeScript", 10, undefined, {
        queryType: "local",
      });

      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].source).toBe("graph");
    });

    it("エンティティメタデータが含まれる", async () => {
      const strategy = new GraphSearchStrategy(
        mockGraphStore,
        mockEmbeddingProvider,
      );
      const result = await strategy.search("React hooks", 10, undefined, {
        queryType: "local",
      });

      expect(result.success).toBe(true);
      expect(result.data[0].metadata.entityId).toBeDefined();
      expect(result.data[0].metadata.entityName).toBeDefined();
    });
  });

  describe("globalSearch", () => {
    it("コミュニティサマリベースの検索が動作する", async () => {
      const strategy = new GraphSearchStrategy(
        mockGraphStore,
        mockEmbeddingProvider,
      );
      const result = await strategy.search(
        "プロジェクト全体のアーキテクチャは？",
        10,
        undefined,
        { queryType: "global" },
      );

      expect(result.success).toBe(true);
      expect(result.data[0].metadata.communityId).toBeDefined();
    });

    it("コミュニティレベル情報が含まれる", async () => {
      const strategy = new GraphSearchStrategy(
        mockGraphStore,
        mockEmbeddingProvider,
      );
      const result = await strategy.search("全体構造", 10, undefined, {
        queryType: "global",
      });

      expect(result.success).toBe(true);
      expect(result.data[0].metadata.communityLevel).toBeDefined();
    });
  });

  describe("relationshipSearch", () => {
    it("エンティティ間の関係検索が動作する", async () => {
      const strategy = new GraphSearchStrategy(
        mockGraphStore,
        mockEmbeddingProvider,
      );
      const result = await strategy.search(
        "UserServiceとDatabaseの関係は？",
        10,
        undefined,
        { queryType: "relationship" },
      );

      expect(result.success).toBe(true);
    });

    it("パス距離がメタデータに含まれる", async () => {
      const strategy = new GraphSearchStrategy(
        mockGraphStore,
        mockEmbeddingProvider,
      );
      const result = await strategy.search(
        "AuthとSessionの接続",
        10,
        undefined,
        { queryType: "relationship" },
      );

      expect(result.success).toBe(true);
      // パスが見つかった場合
      if (result.data.length > 0 && result.data[0].metadata.pathDistance) {
        expect(result.data[0].metadata.pathDistance).toBeGreaterThanOrEqual(1);
      }
    });

    it("2エンティティ未満の場合はローカル検索にフォールバック", async () => {
      const strategy = new GraphSearchStrategy(
        mockGraphStore,
        mockEmbeddingProvider,
      );
      const result = await strategy.search("TypeScript", 10, undefined, {
        queryType: "relationship",
      });

      expect(result.success).toBe(true);
      // ローカル検索として動作
    });
  });

  describe("スコアリング", () => {
    it("スコアが0-1の範囲", async () => {
      const strategy = new GraphSearchStrategy(
        mockGraphStore,
        mockEmbeddingProvider,
      );
      const result = await strategy.search("test", 10);

      expect(result.success).toBe(true);
      for (const item of result.data) {
        expect(item.score).toBeGreaterThanOrEqual(0);
        expect(item.score).toBeLessThanOrEqual(1);
      }
    });

    it("結果がスコア順でソートされる", async () => {
      const strategy = new GraphSearchStrategy(
        mockGraphStore,
        mockEmbeddingProvider,
      );
      const result = await strategy.search("test", 10);

      expect(result.success).toBe(true);
      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].score).toBeLessThanOrEqual(
          result.data[i - 1].score,
        );
      }
    });
  });

  describe("エラーハンドリング", () => {
    it("埋め込みプロバイダーエラー時にエラーを返す", async () => {
      const failingProvider = {
        embedSingle: vi.fn().mockResolvedValue(err(new Error("API error"))),
      };
      const strategy = new GraphSearchStrategy(
        mockGraphStore,
        failingProvider as any,
      );
      const result = await strategy.search("test", 10);

      expect(result.success).toBe(false);
    });

    it("グラフストアエラー時にエラーを返す", async () => {
      const failingStore = {
        findSimilarEntities: vi
          .fn()
          .mockResolvedValue(err(new Error("Store error"))),
      };
      const strategy = new GraphSearchStrategy(
        failingStore as any,
        mockEmbeddingProvider,
      );
      const result = await strategy.search("test", 10);

      expect(result.success).toBe(false);
    });
  });
});
```

---

## 7. 完了条件

- [ ] `GraphSearchStrategy`クラスが実装済み
- [ ] localSearch（エンティティベース）が動作する
- [ ] globalSearch（コミュニティサマリベース）が動作する
- [ ] relationshipSearch（関係検索）が動作する
- [ ] グラフトラバーサルが動作する
- [ ] 各検索タイプで適切なスコアリングが行われる
- [ ] フィルタ条件が正しく適用される
- [ ] エラーハンドリングが動作する
- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] JSDocコメントが記述されている

---

## 8. 次のタスク

- CONV-07-05: RRF Fusion + Reranking

---

## 9. 参照情報

- CONV-08-01: Knowledge Graph Store
- CONV-08-02: コミュニティ検出 (Leiden)
- CONV-08-03: コミュニティサマリ生成
- CONV-07: HybridRAG検索エンジン（親タスク）
- [GraphRAG Paper](https://arxiv.org/abs/2404.16130)

---

## 10. クエリタイプ別検索戦略

| クエリタイプ | 検索戦略           | 主な用途                     | 例                           |
| ------------ | ------------------ | ---------------------------- | ---------------------------- |
| local        | エンティティベース | 具体的な情報検索             | 「UserServiceの実装は？」    |
| global       | コミュニティサマリ | 高レベル概念・全体像         | 「アーキテクチャの概要は？」 |
| relationship | パス検索           | エンティティ間の関係         | 「AとBの関係は？」           |
| hybrid       | 複合検索           | 複合的なクエリ（他戦略併用） | 「Xの使い方とYとの違い」     |
