/**
 * @file GraphSearchStrategy 統合テスト
 * @description Phase 4: TDD Red - 統合テストシナリオ
 * CONV-07-04: HybridRAGグラフ検索
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GraphSearchStrategy } from "../graph-search-strategy";
import type { IEmbeddingProvider } from "../../../embedding/providers/interfaces";
import type {
  EntityId,
  ChunkId,
  RelationId,
  CommunityId,
} from "../../../../types/rag/branded";
import { ok, err } from "../../../../types/rag/result";

// Branded Type Creator
const createEntityId = (id: string): EntityId => id as EntityId;
const createChunkId = (id: string): ChunkId => id as ChunkId;
const createRelationId = (id: string): RelationId => id as RelationId;
const createCommunityId = (id: string): CommunityId => id as CommunityId;

// テスト用モックデータ
const mockEmbedding = new Array(384).fill(0.1);

const mockEntityMatches = [
  {
    id: createEntityId("entity-1"),
    name: "TypeScript",
    normalizedName: "typescript",
    type: "technology" as const,
    description: "プログラミング言語",
    aliases: [],
    embedding: null,
    chunkIds: [createChunkId("chunk-1")],
    mentionCount: 1,
    importance: 0.85,
    attributes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: createEntityId("entity-2"),
    name: "JavaScript",
    normalizedName: "javascript",
    type: "technology" as const,
    description: null,
    aliases: [],
    embedding: null,
    chunkIds: [createChunkId("chunk-2")],
    mentionCount: 1,
    importance: 0.75,
    attributes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockChunks = [
  {
    chunkId: createChunkId("chunk-1"),
    content: "TypeScriptの型システムについて解説します。",
    contextualContent: "プログラミング言語の型システム",
    relevance: 0.9,
  },
];

const mockCommunitySummaries = [
  {
    communityId: createCommunityId("community-1"),
    level: 1,
    summary: "プログラミング言語に関するコミュニティ",
    keywords: ["TypeScript", "JavaScript"],
    mainEntities: ["TypeScript", "JavaScript"],
    mainRelations: ["extends"],
    sentiment: "neutral" as const,
    confidence: 0.9,
    tokenCount: 50,
    createdAt: new Date(),
  },
];

const mockStoredRelation = {
  id: createRelationId("rel-1"),
  sourceEntityId: createEntityId("entity-1"),
  targetEntityId: createEntityId("entity-2"),
  relationType: "related_to" as const,
  description: "関連する技術",
  weight: 0.8,
  evidence: [],
  bidirectional: false,
  attributes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTraversalResult = {
  startEntity: mockEntityMatches[0],
  paths: [
    {
      entities: mockEntityMatches,
      relations: [mockStoredRelation],
      totalWeight: 0.8,
    },
  ],
  visitedEntities: mockEntityMatches,
  maxDepthReached: 1,
};

// モック型定義
interface MockGraphStore {
  findSimilarEntities: ReturnType<typeof vi.fn>;
  traverse: ReturnType<typeof vi.fn>;
  findShortestPath: ReturnType<typeof vi.fn>;
  getRelationsByEntity: ReturnType<typeof vi.fn>;
  addEntity: ReturnType<typeof vi.fn>;
  getEntity: ReturnType<typeof vi.fn>;
  updateEntity: ReturnType<typeof vi.fn>;
  deleteEntity: ReturnType<typeof vi.fn>;
  searchEntities: ReturnType<typeof vi.fn>;
  addRelation: ReturnType<typeof vi.fn>;
  getRelation: ReturnType<typeof vi.fn>;
  deleteRelation: ReturnType<typeof vi.fn>;
  getNeighbors: ReturnType<typeof vi.fn>;
  bulkUpsertEntities: ReturnType<typeof vi.fn>;
  bulkAddRelations: ReturnType<typeof vi.fn>;
  getStats: ReturnType<typeof vi.fn>;
  getEntityByName: ReturnType<typeof vi.fn>;
}

interface MockCommunitySummarizer {
  summarize: ReturnType<typeof vi.fn>;
  summarizeAll: ReturnType<typeof vi.fn>;
  searchSummaries: ReturnType<typeof vi.fn>;
  updateSummary: ReturnType<typeof vi.fn>;
}

describe("GraphSearchStrategy 統合テスト", () => {
  let mockGraphStore: MockGraphStore;
  let mockEmbeddingProvider: IEmbeddingProvider;
  let mockCommunitySummarizer: MockCommunitySummarizer;

  beforeEach(() => {
    mockGraphStore = {
      findSimilarEntities: vi.fn().mockResolvedValue(ok(mockEntityMatches)),
      traverse: vi.fn().mockResolvedValue(ok(mockTraversalResult)),
      findShortestPath: vi.fn().mockResolvedValue(
        ok({
          entities: mockEntityMatches,
          relations: [mockStoredRelation],
          totalWeight: 0.8,
        }),
      ),
      getRelationsByEntity: vi.fn().mockResolvedValue(ok(mockChunks)),
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
      getEntityByName: vi.fn(),
    };

    mockEmbeddingProvider = {
      modelId:
        "text-embedding-3-small" as unknown as IEmbeddingProvider["modelId"],
      providerName: "openai" as unknown as IEmbeddingProvider["providerName"],
      dimensions: 384,
      maxTokens: 8192,
      embed: vi.fn().mockResolvedValue({
        embedding: mockEmbedding,
        tokenCount: 10,
      }),
      embedBatch: vi.fn(),
      countTokens: vi.fn().mockReturnValue(10),
      healthCheck: vi.fn().mockResolvedValue(true),
    };

    mockCommunitySummarizer = {
      summarize: vi.fn(),
      summarizeAll: vi.fn(),
      searchSummaries: vi.fn().mockResolvedValue(ok(mockCommunitySummaries)),
      updateSummary: vi.fn(),
    };
  });

  // ==========================================
  // GraphStore連携テスト
  // ==========================================

  describe("GraphStore連携テスト", () => {
    it("findSimilarEntitiesを正しく呼び出す", async () => {
      const strategy = new GraphSearchStrategy(
        mockGraphStore as unknown as Parameters<
          typeof GraphSearchStrategy
        >[0] extends infer T
          ? T
          : never,
        mockEmbeddingProvider,
        mockCommunitySummarizer as unknown as Parameters<
          typeof GraphSearchStrategy
        >[2],
      );

      await strategy.search("テストクエリ", 10);

      expect(mockGraphStore.findSimilarEntities).toHaveBeenCalledWith(
        expect.any(Array),
        expect.any(Number),
        expect.any(Number),
      );
    });

    it("traverseを正しいオプションで呼び出す", async () => {
      // 2つ以上のエンティティを返すことでrelationshipSearchがtraverseを呼ぶ
      mockGraphStore.findSimilarEntities.mockResolvedValue(
        ok(mockEntityMatches),
      );

      const strategy = new GraphSearchStrategy(
        mockGraphStore as unknown as Parameters<
          typeof GraphSearchStrategy
        >[0] extends infer T
          ? T
          : never,
        mockEmbeddingProvider,
        mockCommunitySummarizer as unknown as Parameters<
          typeof GraphSearchStrategy
        >[2],
      );

      await strategy.search("テスト", 10, undefined, {
        queryType: "relationship",
        traversalDepth: 3,
      });

      expect(mockGraphStore.traverse).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ maxDepth: 3 }),
      );
    });

    it("findShortestPathを正しく呼び出す", async () => {
      const strategy = new GraphSearchStrategy(
        mockGraphStore as unknown as Parameters<
          typeof GraphSearchStrategy
        >[0] extends infer T
          ? T
          : never,
        mockEmbeddingProvider,
        mockCommunitySummarizer as unknown as Parameters<
          typeof GraphSearchStrategy
        >[2],
      );

      await strategy.search("テスト", 10, undefined, {
        queryType: "relationship",
      });

      expect(mockGraphStore.findShortestPath).toHaveBeenCalledWith(
        "entity-1",
        "entity-2",
        expect.any(Number),
      );
    });
  });

  // ==========================================
  // EmbeddingProvider連携テスト
  // ==========================================

  describe("EmbeddingProvider連携テスト", () => {
    it("embedを正しく呼び出す", async () => {
      const strategy = new GraphSearchStrategy(
        mockGraphStore as unknown as Parameters<
          typeof GraphSearchStrategy
        >[0] extends infer T
          ? T
          : never,
        mockEmbeddingProvider,
        mockCommunitySummarizer as unknown as Parameters<
          typeof GraphSearchStrategy
        >[2],
      );

      const query = "TypeScript型システム";
      await strategy.search(query, 10);

      expect(mockEmbeddingProvider.embed).toHaveBeenCalledWith(query);
    });

    it("埋め込みベクトルを正しく渡す", async () => {
      const mockEmbeddingArray = new Array(384).fill(0.5);
      mockEmbeddingProvider.embed = vi.fn().mockResolvedValue({
        embedding: mockEmbeddingArray,
        tokenCount: 10,
      });

      const strategy = new GraphSearchStrategy(
        mockGraphStore as unknown as Parameters<
          typeof GraphSearchStrategy
        >[0] extends infer T
          ? T
          : never,
        mockEmbeddingProvider,
        mockCommunitySummarizer as unknown as Parameters<
          typeof GraphSearchStrategy
        >[2],
      );

      await strategy.search("テスト", 10);

      const calledEmbedding =
        mockGraphStore.findSimilarEntities.mock.calls[0][0];
      expect(Array.isArray(calledEmbedding)).toBe(true);
      expect(calledEmbedding.length).toBe(384);
    });
  });

  // ==========================================
  // CommunitySummarizer連携テスト
  // ==========================================

  describe("CommunitySummarizer連携テスト", () => {
    it("searchSummariesを正しく呼び出す", async () => {
      const strategy = new GraphSearchStrategy(
        mockGraphStore as unknown as Parameters<
          typeof GraphSearchStrategy
        >[0] extends infer T
          ? T
          : never,
        mockEmbeddingProvider,
        mockCommunitySummarizer as unknown as Parameters<
          typeof GraphSearchStrategy
        >[2],
      );

      const query = "機械学習アルゴリズム";
      await strategy.search(query, 10, undefined, { queryType: "global" });

      expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalledWith(
        query,
        expect.objectContaining({ limit: 10 }),
      );
    });

    it("レベル指定が正しく渡される", async () => {
      const strategy = new GraphSearchStrategy(
        mockGraphStore as unknown as Parameters<
          typeof GraphSearchStrategy
        >[0] extends infer T
          ? T
          : never,
        mockEmbeddingProvider,
        mockCommunitySummarizer as unknown as Parameters<
          typeof GraphSearchStrategy
        >[2],
      );

      await strategy.search("テスト", 10, undefined, {
        queryType: "global",
        communityThreshold: 0.6,
      });

      expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalled();
    });
  });

  // ==========================================
  // End-to-Endテスト
  // ==========================================

  describe("End-to-End", () => {
    it("localSearchで実際のチャンクが取得できる", async () => {
      const strategy = new GraphSearchStrategy(
        mockGraphStore as unknown as Parameters<
          typeof GraphSearchStrategy
        >[0] extends infer T
          ? T
          : never,
        mockEmbeddingProvider,
        mockCommunitySummarizer as unknown as Parameters<
          typeof GraphSearchStrategy
        >[2],
      );

      const result = await strategy.search("テストクエリ", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        // 埋め込み生成
        expect(mockEmbeddingProvider.embed).toHaveBeenCalledTimes(1);
        // エンティティ検索
        expect(mockGraphStore.findSimilarEntities).toHaveBeenCalledTimes(1);
        // 結果検証
        expect(result.value.length).toBeGreaterThan(0);
        expect(result.value[0].sources.entityIds.length).toBeGreaterThan(0);
      }
    });

    it("globalSearchでコミュニティサマリが取得できる", async () => {
      const strategy = new GraphSearchStrategy(
        mockGraphStore as unknown as Parameters<
          typeof GraphSearchStrategy
        >[0] extends infer T
          ? T
          : never,
        mockEmbeddingProvider,
        mockCommunitySummarizer as unknown as Parameters<
          typeof GraphSearchStrategy
        >[2],
      );

      const result = await strategy.search("テスト", 10, undefined, {
        queryType: "global",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk() && result.value.length > 0) {
        expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalledTimes(
          1,
        );
        expect(result.value[0].type).toBe("community");
        expect(result.value[0].sources.communityId).toBeDefined();
      }
    });

    it("relationshipSearchでパスが取得できる", async () => {
      const strategy = new GraphSearchStrategy(
        mockGraphStore as unknown as Parameters<
          typeof GraphSearchStrategy
        >[0] extends infer T
          ? T
          : never,
        mockEmbeddingProvider,
        mockCommunitySummarizer as unknown as Parameters<
          typeof GraphSearchStrategy
        >[2],
      );

      const result = await strategy.search("テスト", 10, undefined, {
        queryType: "relationship",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(mockEmbeddingProvider.embed).toHaveBeenCalled();
        expect(mockGraphStore.findSimilarEntities).toHaveBeenCalled();
        expect(mockGraphStore.findShortestPath).toHaveBeenCalled();
        expect(mockGraphStore.traverse).toHaveBeenCalled();
      }
    });
  });

  // ==========================================
  // エラーハンドリングテスト
  // ==========================================

  describe("エラーハンドリングテスト", () => {
    it("埋め込みAPI障害時にエラーを返す", async () => {
      const failingProvider = {
        ...mockEmbeddingProvider,
        embed: vi.fn().mockRejectedValue(new Error("API connection timeout")),
      };
      const strategy = new GraphSearchStrategy(
        mockGraphStore as unknown as Parameters<
          typeof GraphSearchStrategy
        >[0] extends infer T
          ? T
          : never,
        failingProvider,
        mockCommunitySummarizer as unknown as Parameters<
          typeof GraphSearchStrategy
        >[2],
      );

      const result = await strategy.search("テスト", 10);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("embedding");
      }
      // GraphStoreは呼ばれない
      expect(mockGraphStore.findSimilarEntities).not.toHaveBeenCalled();
    });

    it("GraphStore障害時にエラーを返す", async () => {
      mockGraphStore.findSimilarEntities.mockResolvedValue(
        err(new Error("Database connection failed")),
      );

      const strategy = new GraphSearchStrategy(
        mockGraphStore as unknown as Parameters<
          typeof GraphSearchStrategy
        >[0] extends infer T
          ? T
          : never,
        mockEmbeddingProvider,
        mockCommunitySummarizer as unknown as Parameters<
          typeof GraphSearchStrategy
        >[2],
      );

      const result = await strategy.search("テスト", 10);

      expect(result.isErr()).toBe(true);
    });

    it("部分エラー時は成功分のみ返却", async () => {
      mockGraphStore.getRelationsByEntity
        .mockResolvedValueOnce(ok(mockChunks)) // 1件目成功
        .mockResolvedValueOnce(err(new Error("Failed"))); // 2件目失敗

      const strategy = new GraphSearchStrategy(
        mockGraphStore as unknown as Parameters<
          typeof GraphSearchStrategy
        >[0] extends infer T
          ? T
          : never,
        mockEmbeddingProvider,
        mockCommunitySummarizer as unknown as Parameters<
          typeof GraphSearchStrategy
        >[2],
      );

      const result = await strategy.search("テスト", 10);

      expect(result.isOk()).toBe(true);
    });
  });

  // ==========================================
  // パフォーマンステスト（基本）
  // ==========================================

  describe("パフォーマンス（基本）", () => {
    it("検索が100ms以内に完了する", async () => {
      const strategy = new GraphSearchStrategy(
        mockGraphStore as unknown as Parameters<
          typeof GraphSearchStrategy
        >[0] extends infer T
          ? T
          : never,
        mockEmbeddingProvider,
        mockCommunitySummarizer as unknown as Parameters<
          typeof GraphSearchStrategy
        >[2],
      );
      const startTime = performance.now();

      await strategy.search("パフォーマンステスト", 10);

      const elapsed = performance.now() - startTime;
      // モックなので非常に高速なはず
      expect(elapsed).toBeLessThan(100);
    });

    it("メトリクスに処理時間が正しく記録される", async () => {
      const strategy = new GraphSearchStrategy(
        mockGraphStore as unknown as Parameters<
          typeof GraphSearchStrategy
        >[0] extends infer T
          ? T
          : never,
        mockEmbeddingProvider,
        mockCommunitySummarizer as unknown as Parameters<
          typeof GraphSearchStrategy
        >[2],
      );

      await strategy.search("メトリクステスト", 10);
      const metrics = strategy.getMetrics();

      expect(metrics.processingTime).toBeGreaterThan(0);
      expect(metrics.processingTime).toBeLessThan(1000);
    });
  });

  // ==========================================
  // フォールバック動作テスト
  // ==========================================

  describe("フォールバック動作テスト", () => {
    it("CommunitySummarizer未設定時はlocalSearchにフォールバック", async () => {
      const strategyWithoutSummarizer = new GraphSearchStrategy(
        mockGraphStore as unknown as Parameters<
          typeof GraphSearchStrategy
        >[0] extends infer T
          ? T
          : never,
        mockEmbeddingProvider,
        undefined,
      );

      await strategyWithoutSummarizer.search("テスト", 10, undefined, {
        queryType: "global",
      });

      expect(mockGraphStore.findSimilarEntities).toHaveBeenCalled();
    });

    it("searchSummariesエラー時はResult.errを返す", async () => {
      mockCommunitySummarizer.searchSummaries.mockResolvedValue(
        err(new Error("Summarizer error")),
      );

      const strategy = new GraphSearchStrategy(
        mockGraphStore as unknown as Parameters<
          typeof GraphSearchStrategy
        >[0] extends infer T
          ? T
          : never,
        mockEmbeddingProvider,
        mockCommunitySummarizer as unknown as Parameters<
          typeof GraphSearchStrategy
        >[2],
      );

      const result = await strategy.search("テスト", 10, undefined, {
        queryType: "global",
      });

      expect(result.isErr()).toBe(true);
    });
  });

  // ==========================================
  // 実行順序テスト
  // ==========================================

  describe("実行順序テスト", () => {
    it("埋め込み生成→GraphStore検索の順序で実行される", async () => {
      const callOrder: string[] = [];

      const orderedGraphStore = {
        ...mockGraphStore,
        findSimilarEntities: vi.fn().mockImplementation(() => {
          callOrder.push("graphStore");
          return Promise.resolve(ok(mockEntityMatches));
        }),
      };

      const orderedProvider = {
        ...mockEmbeddingProvider,
        embed: vi.fn().mockImplementation(() => {
          callOrder.push("embed");
          return Promise.resolve({
            embedding: mockEmbedding,
            tokenCount: 10,
          });
        }),
      };

      const strategy = new GraphSearchStrategy(
        orderedGraphStore as unknown as Parameters<
          typeof GraphSearchStrategy
        >[0] extends infer T
          ? T
          : never,
        orderedProvider,
        mockCommunitySummarizer as unknown as Parameters<
          typeof GraphSearchStrategy
        >[2],
      );

      await strategy.search("順序テスト", 10);

      expect(callOrder).toEqual(["embed", "graphStore"]);
    });
  });
});
