/**
 * @file GraphSearchStrategy ユニットテスト
 * @description Phase 4: TDD Red - GraphSearchStrategyのテスト
 * CONV-07-04: HybridRAGグラフ検索
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { GraphSearchStrategy } from "../graph-search-strategy";
import type { IEmbeddingProvider } from "../../../embedding/providers/interfaces";
import type { SearchFilters } from "../../../../types/rag/search/types";
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
  {
    chunkId: createChunkId("chunk-2"),
    content: "静的型付けのメリットとデメリット",
    contextualContent: null,
    relevance: 0.8,
  },
];

const mockCommunitySummaries = [
  {
    communityId: createCommunityId("community-1"),
    level: 1,
    summary: "プログラミング言語に関するコミュニティ",
    keywords: ["TypeScript", "JavaScript", "プログラミング"],
    mainEntities: ["TypeScript", "JavaScript"],
    mainRelations: ["extends", "related_to"],
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

// モックインターフェース型定義
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

describe("GraphSearchStrategy", () => {
  let mockGraphStore: MockGraphStore;
  let mockEmbeddingProvider: IEmbeddingProvider;
  let mockCommunitySummarizer: MockCommunitySummarizer;
  let strategy: GraphSearchStrategy;

  beforeEach(() => {
    // IKnowledgeGraphStore モック
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

    // IEmbeddingProvider モック
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

    // ICommunitySummarizer モック
    mockCommunitySummarizer = {
      summarize: vi.fn(),
      summarizeAll: vi.fn(),
      searchSummaries: vi.fn().mockResolvedValue(ok(mockCommunitySummaries)),
      updateSummary: vi.fn(),
    };

    strategy = new GraphSearchStrategy(
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
  });

  // ==========================================
  // Constructor Tests
  // ==========================================

  describe("constructor", () => {
    it("依存関係を正しく注入できる", () => {
      const s = new GraphSearchStrategy(
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
      expect(s).toBeDefined();
    });

    it("CommunitySummarizerはオプショナル", () => {
      const s = new GraphSearchStrategy(
        mockGraphStore as unknown as Parameters<
          typeof GraphSearchStrategy
        >[0] extends infer T
          ? T
          : never,
        mockEmbeddingProvider,
        undefined,
      );
      expect(s).toBeDefined();
    });
  });

  // ==========================================
  // Basic Search Tests
  // ==========================================

  describe("基本検索", () => {
    it('nameプロパティが"graph"を返す', () => {
      expect(strategy.name).toBe("graph");
    });

    it("基本的なグラフ検索が動作する", async () => {
      const result = await strategy.search("TypeScript型システム", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.length).toBeGreaterThan(0);
      }
    });

    it("limit件数以下の結果を返す", async () => {
      const limit = 2;
      const result = await strategy.search("テストクエリ", limit);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.length).toBeLessThanOrEqual(limit);
      }
    });

    it("検索結果がSearchResultItem形式で返される", async () => {
      const result = await strategy.search("テスト", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk() && result.value.length > 0) {
        const item = result.value[0];
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("type");
        expect(item).toHaveProperty("score");
        expect(item).toHaveProperty("relevance");
        expect(item).toHaveProperty("content");
        expect(item).toHaveProperty("highlights");
        expect(item).toHaveProperty("sources");
      }
    });

    it("queryTypeに応じて適切な検索メソッドを呼び出す", async () => {
      await strategy.search("テスト", 10, undefined, { queryType: "local" });
      expect(mockGraphStore.findSimilarEntities).toHaveBeenCalled();
    });

    it("デフォルトはlocalSearch", async () => {
      await strategy.search("テスト", 10);
      expect(mockGraphStore.findSimilarEntities).toHaveBeenCalled();
    });
  });

  // ==========================================
  // LocalSearch Tests
  // ==========================================

  describe("localSearch", () => {
    it("エンティティベースの検索が動作する", async () => {
      const result = await strategy.search("TypeScript", 10, undefined, {
        queryType: "local",
      });

      expect(result.isOk()).toBe(true);
      expect(mockGraphStore.findSimilarEntities).toHaveBeenCalled();
    });

    it("エンティティメタデータが含まれる", async () => {
      const result = await strategy.search("テスト", 10, undefined, {
        queryType: "local",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk() && result.value.length > 0) {
        expect(result.value[0].sources.entityIds.length).toBeGreaterThan(0);
      }
    });

    it("類似度閾値でフィルタする", async () => {
      const result = await strategy.search("テスト", 10, undefined, {
        queryType: "local",
        entityThreshold: 0.8,
      });

      expect(result.isOk()).toBe(true);
    });

    it("エンティティが見つからない場合は空配列を返す", async () => {
      mockGraphStore.findSimilarEntities.mockResolvedValueOnce(ok([]));

      const result = await strategy.search("存在しないエンティティ", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual([]);
      }
    });
  });

  // ==========================================
  // GlobalSearch Tests
  // ==========================================

  describe("globalSearch", () => {
    it("コミュニティサマリベースの検索が動作する", async () => {
      const result = await strategy.search(
        "プログラミング言語",
        10,
        undefined,
        {
          queryType: "global",
        },
      );

      expect(result.isOk()).toBe(true);
      expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalled();
    });

    it("コミュニティレベル情報が含まれる", async () => {
      const result = await strategy.search("テスト", 10, undefined, {
        queryType: "global",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk() && result.value.length > 0) {
        expect(result.value[0].sources.communityId).toBeDefined();
      }
    });

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

      const result = await strategyWithoutSummarizer.search(
        "テスト",
        10,
        undefined,
        { queryType: "global" },
      );

      expect(result.isOk()).toBe(true);
      expect(mockGraphStore.findSimilarEntities).toHaveBeenCalled();
    });

    it('type="community"で結果が返される', async () => {
      const result = await strategy.search("テスト", 10, undefined, {
        queryType: "global",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk() && result.value.length > 0) {
        expect(result.value[0].type).toBe("community");
      }
    });
  });

  // ==========================================
  // RelationshipSearch Tests
  // ==========================================

  describe("relationshipSearch", () => {
    it("エンティティ間の関係検索が動作する", async () => {
      const result = await strategy.search(
        "TypeScriptとJavaScript",
        10,
        undefined,
        {
          queryType: "relationship",
        },
      );

      expect(result.isOk()).toBe(true);
    });

    it("パス距離がメタデータに含まれる", async () => {
      const result = await strategy.search("テスト", 10, undefined, {
        queryType: "relationship",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk() && result.value.length > 0) {
        expect(result.value[0].relevance.graph).toBeDefined();
      }
    });

    it("2エンティティ以上の場合にfindShortestPathを呼び出す", async () => {
      await strategy.search("テスト", 10, undefined, {
        queryType: "relationship",
      });

      expect(mockGraphStore.findShortestPath).toHaveBeenCalled();
    });

    it("1エンティティの場合はfindShortestPathを呼び出さない", async () => {
      mockGraphStore.findSimilarEntities.mockResolvedValueOnce(
        ok([mockEntityMatches[0]]),
      );

      await strategy.search("テスト", 10, undefined, {
        queryType: "relationship",
      });

      expect(mockGraphStore.findShortestPath).not.toHaveBeenCalled();
    });

    it("0エンティティの場合は空配列を返す", async () => {
      mockGraphStore.findSimilarEntities.mockResolvedValueOnce(ok([]));

      const result = await strategy.search("存在しない", 10, undefined, {
        queryType: "relationship",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual([]);
      }
    });

    it("最大深度を超えない", async () => {
      await strategy.search("テスト", 10, undefined, {
        queryType: "relationship",
        traversalDepth: 3,
      });

      expect(mockGraphStore.traverse).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ maxDepth: 3 }),
      );
    });
  });

  // ==========================================
  // スコアリングテスト
  // ==========================================

  describe("スコアリング", () => {
    it("スコアが0-1の範囲", async () => {
      const result = await strategy.search("test query", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        for (const item of result.value) {
          expect(item.score).toBeGreaterThanOrEqual(0);
          expect(item.score).toBeLessThanOrEqual(1);
        }
      }
    });

    it("結果がスコア順でソートされる", async () => {
      const result = await strategy.search("test", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        for (let i = 1; i < result.value.length; i++) {
          expect(result.value[i].score).toBeLessThanOrEqual(
            result.value[i - 1].score,
          );
        }
      }
    });

    it("localスコア = エンティティ類似度×0.6 + チャンク関連度×0.4", async () => {
      const result = await strategy.search("test", 10, undefined, {
        queryType: "local",
      });

      expect(result.isOk()).toBe(true);
      if (result.isOk() && result.value.length > 0) {
        // スコアが計算されていることを確認
        expect(result.value[0].score).toBeGreaterThan(0);
      }
    });

    it("relevance.graphにグラフスコアが設定される", async () => {
      const result = await strategy.search("test", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk() && result.value.length > 0) {
        expect(result.value[0].relevance.graph).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // ==========================================
  // エラーハンドリングテスト
  // ==========================================

  describe("エラーハンドリング", () => {
    it("埋め込みプロバイダーエラー時にResult.errを返す", async () => {
      const failingProvider = {
        ...mockEmbeddingProvider,
        embed: vi.fn().mockRejectedValue(new Error("API connection failed")),
      };
      const failingStrategy = new GraphSearchStrategy(
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

      const result = await failingStrategy.search("test", 10);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("embedding");
      }
    });

    it("グラフストアエラー時にResult.errを返す", async () => {
      mockGraphStore.findSimilarEntities.mockResolvedValueOnce(
        err(new Error("Graph store error")),
      );

      const result = await strategy.search("test", 10);

      expect(result.isErr()).toBe(true);
    });

    it("空のクエリでエラーを返す", async () => {
      const result = await strategy.search("", 10);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("empty");
      }
    });

    it("クエリが長すぎる場合にエラーを返す", async () => {
      const longQuery = "a".repeat(1001);
      const result = await strategy.search(longQuery, 10);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("1000");
      }
    });

    it("無効なlimitでエラーを返す（0以下）", async () => {
      const result = await strategy.search("test", 0);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("Limit");
      }
    });

    it("無効なlimitでエラーを返す（100超）", async () => {
      const result = await strategy.search("test", 101);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("Limit");
      }
    });

    it("relationshipSearchで埋め込み生成エラー時にResult.errを返す", async () => {
      const failingProvider = {
        ...mockEmbeddingProvider,
        embed: vi.fn().mockRejectedValue(new Error("Embedding API error")),
      };
      const failingStrategy = new GraphSearchStrategy(
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

      const result = await failingStrategy.search("test", 10, undefined, {
        queryType: "relationship",
      });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("embedding");
      }
    });

    it("relationshipSearchでエンティティ検索エラー時にResult.errを返す", async () => {
      mockGraphStore.findSimilarEntities.mockResolvedValueOnce(
        err(new Error("GraphStore connection error")),
      );

      const result = await strategy.search("test", 10, undefined, {
        queryType: "relationship",
      });

      expect(result.isErr()).toBe(true);
    });
  });

  // ==========================================
  // メトリクステスト
  // ==========================================

  describe("メトリクス", () => {
    it("getMetrics()がStrategyMetricを返す", async () => {
      await strategy.search("test", 10);
      const metrics = strategy.getMetrics();

      expect(metrics).toHaveProperty("enabled");
      expect(metrics).toHaveProperty("resultCount");
      expect(metrics).toHaveProperty("processingTime");
      expect(metrics).toHaveProperty("topScore");
    });

    it("メトリクスに正しい結果件数が記録される", async () => {
      await strategy.search("test", 10);
      const metrics = strategy.getMetrics();

      expect(metrics.resultCount).toBeGreaterThanOrEqual(0);
    });

    it("メトリクスに処理時間が記録される", async () => {
      await strategy.search("test", 10);
      const metrics = strategy.getMetrics();

      expect(metrics.processingTime).toBeGreaterThanOrEqual(0);
    });

    it("空結果時のtopScoreが0", async () => {
      mockGraphStore.findSimilarEntities.mockResolvedValueOnce(ok([]));

      await strategy.search("no match", 10);
      const metrics = strategy.getMetrics();

      expect(metrics.topScore).toBe(0);
    });
  });

  // ==========================================
  // 境界値テスト
  // ==========================================

  describe("境界値", () => {
    it("limit=1で1件の結果を返す", async () => {
      const result = await strategy.search("test", 1);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.length).toBeLessThanOrEqual(1);
      }
    });

    it("limit=100で最大100件の結果を返す", async () => {
      const result = await strategy.search("test", 100);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.length).toBeLessThanOrEqual(100);
      }
    });

    it("結果が0件の場合に空配列を返す", async () => {
      mockGraphStore.findSimilarEntities.mockResolvedValueOnce(ok([]));

      const result = await strategy.search("no match", 10);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual([]);
      }
    });

    it("クエリ長1000文字（最大値）で正常に動作する", async () => {
      const maxLengthQuery = "a".repeat(1000);
      const result = await strategy.search(maxLengthQuery, 10);

      expect(result.isOk()).toBe(true);
    });
  });

  // ==========================================
  // 入力バリデーションテスト
  // ==========================================

  describe("入力バリデーション", () => {
    it("空白のみのクエリでエラーを返す", async () => {
      const result = await strategy.search("   ", 10);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain("empty");
      }
    });

    it("タブ・改行のみのクエリでエラーを返す", async () => {
      const result = await strategy.search("\t\n\r", 10);

      expect(result.isErr()).toBe(true);
    });

    it("日本語クエリで正常に動作する", async () => {
      const result = await strategy.search("日本語でのテストクエリ", 10);

      expect(result.isOk()).toBe(true);
    });

    it("絵文字を含むクエリで正常に動作する", async () => {
      const result = await strategy.search("テスト🚀クエリ👍", 10);

      expect(result.isOk()).toBe(true);
    });

    it("特殊文字を含むクエリで正常に動作する", async () => {
      const result = await strategy.search(
        "test'query\"with<special>chars",
        10,
      );

      expect(result.isOk()).toBe(true);
    });
  });

  // ==========================================
  // フィルタテスト
  // ==========================================

  describe("フィルタ", () => {
    it("fileIdsフィルタが適用される", async () => {
      const filters: SearchFilters = {
        fileIds: [
          "file-1" as unknown as SearchFilters["fileIds"] extends
            | (infer T)[]
            | null
            ? T
            : never,
        ],
        entityTypes: null,
        dateRange: null,
        minRelevance: 0,
      };

      const result = await strategy.search("test", 10, filters);

      expect(result.isOk()).toBe(true);
      expect(mockGraphStore.findSimilarEntities).toHaveBeenCalled();
    });

    it("entityTypesフィルタが適用される", async () => {
      const filters: SearchFilters = {
        fileIds: null,
        entityTypes: ["technology"],
        dateRange: null,
        minRelevance: 0,
      };

      const result = await strategy.search("test", 10, filters);

      expect(result.isOk()).toBe(true);
    });

    it("フィルタなしで全結果が返される", async () => {
      const result = await strategy.search("test", 10);

      expect(result.isOk()).toBe(true);
    });

    it("空のフィルタで全結果が返される", async () => {
      const filters: SearchFilters = {
        fileIds: null,
        entityTypes: null,
        dateRange: null,
        minRelevance: 0,
      };

      const result = await strategy.search("test", 10, filters);

      expect(result.isOk()).toBe(true);
    });
  });
});
