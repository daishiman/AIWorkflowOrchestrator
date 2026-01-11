/**
 * CommunitySummarizer テスト
 *
 * @description
 * コミュニティ要約生成サービスのユニットテスト・統合テスト
 * TDD Green Phase: 実装後のテスト
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { CommunitySummarizer } from "../community-summarizer";
import type {
  Community,
  CommunityStructure,
  StoredEntity,
  StoredRelation,
  CommunitySummary,
} from "../types";
import type { IKnowledgeGraphStore } from "../knowledge-graph-store";
import type { ICommunityRepository } from "../interfaces/community-repository.interface";
import type { ILLMProvider } from "../../extraction/interfaces";
import type { IEmbeddingProvider } from "../../embedding/providers/interfaces";
import type {
  EntityId,
  CommunityId,
  RelationId,
} from "../../../types/rag/branded";
import { ok, err } from "../../../types/rag/result";

// Branded Type Creators
const createEntityId = (id: string): EntityId => id as EntityId;
const createCommunityId = (id: string): CommunityId => id as CommunityId;
const createRelationId = (id: string): RelationId => id as RelationId;

// Mock Data
const mockEntity: StoredEntity = {
  id: createEntityId("entity-1"),
  name: "TypeScript",
  normalizedName: "typescript",
  type: "technology" as any,
  description: "静的型付けプログラミング言語",
  aliases: ["TS"],
  chunkIds: [],
  mentionCount: 10,
  importance: 0.85,
  embedding: null,
  attributes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockEntity2: StoredEntity = {
  id: createEntityId("entity-2"),
  name: "JavaScript",
  normalizedName: "javascript",
  type: "technology" as any,
  description: "動的型付けプログラミング言語",
  aliases: ["JS"],
  chunkIds: [],
  mentionCount: 15,
  importance: 0.9,
  embedding: null,
  attributes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRelation: StoredRelation = {
  id: createRelationId("relation-1"),
  sourceEntityId: createEntityId("entity-1"),
  targetEntityId: createEntityId("entity-2"),
  relationType: "SUPERSET_OF" as any,
  description: "TypeScriptはJavaScriptのスーパーセット",
  weight: 0.95,
  bidirectional: false,
  evidence: [],
  attributes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCommunity: Community = {
  id: createCommunityId("community-1"),
  level: 0,
  memberEntityIds: [createEntityId("entity-1"), createEntityId("entity-2")],
  childCommunityIds: [],
  parentCommunityId: undefined,
  size: 2,
  internalEdges: 1,
  externalEdges: 0,
  modularity: 0.5,
  summary: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCommunityWithChildren: Community = {
  ...mockCommunity,
  id: createCommunityId("parent-community"),
  level: 1,
  childCommunityIds: [
    createCommunityId("child-1"),
    createCommunityId("child-2"),
  ],
};

const mockCommunityStructure: CommunityStructure = {
  communities: [mockCommunity],
  levels: 1,
  totalModularity: 0.5,
  entityToCommunity: new Map([
    [createEntityId("entity-1"), [createCommunityId("community-1")]],
    [createEntityId("entity-2"), [createCommunityId("community-1")]],
  ]),
};

const mockLLMResponse = {
  text: JSON.stringify({
    summary: "このグループはプログラミング言語に関連するエンティティです",
    keywords: ["TypeScript", "JavaScript", "プログラミング"],
    mainEntities: ["TypeScript", "JavaScript"],
    mainRelations: ["TypeScriptはJavaScriptのスーパーセット"],
    sentiment: "neutral",
    confidence: 0.85,
  }),
  tokensUsed: 150,
};

const mockChildSummary: CommunitySummary = {
  communityId: createCommunityId("child-1"),
  level: 0,
  summary: "子コミュニティの要約",
  keywords: ["child", "keyword"],
  mainEntities: ["ChildEntity"],
  mainRelations: ["ChildRelation"],
  sentiment: "neutral",
  confidence: 0.8,
  tokenCount: 50,
  embedding: new Array(384).fill(0.1),
  createdAt: new Date(),
};

// Mock Providers
const createMockLLMProvider = (): ILLMProvider => ({
  modelId: "test-model",
  generate: vi.fn(),
});

const createMockEmbeddingProvider = (): IEmbeddingProvider => ({
  modelId: "test-embedding" as any,
  providerName: "test" as any,
  dimensions: 384,
  maxTokens: 8192,
  embed: vi.fn(),
  embedBatch: vi.fn(),
  countTokens: vi.fn().mockReturnValue(10),
  healthCheck: vi.fn().mockResolvedValue(true),
});

const createMockGraphStore = (): Partial<IKnowledgeGraphStore> => ({
  getEntity: vi.fn(),
  getRelations: vi.fn(),
});

const createMockCommunityRepo = (): Partial<ICommunityRepository> => ({
  findById: vi.fn(),
  getSummary: vi.fn(),
  updateSummary: vi.fn(),
  searchSummariesByEmbedding: vi.fn(),
});

describe("CommunitySummarizer", () => {
  let mockLLM: ILLMProvider;
  let mockEmbedding: IEmbeddingProvider;
  let mockGraphStore: Partial<IKnowledgeGraphStore>;
  let mockCommunityRepo: Partial<ICommunityRepository>;
  let summarizer: CommunitySummarizer;

  beforeEach(() => {
    mockLLM = createMockLLMProvider();
    mockEmbedding = createMockEmbeddingProvider();
    mockGraphStore = createMockGraphStore();
    mockCommunityRepo = createMockCommunityRepo();

    // Default mock implementations
    vi.mocked(mockLLM.generate).mockResolvedValue(ok(mockLLMResponse));
    vi.mocked(mockEmbedding.embed).mockResolvedValue({
      embedding: new Array(384).fill(0.1),
      tokensUsed: 10,
    });
    vi.mocked(mockGraphStore.getEntity!).mockImplementation(async (id) => {
      if (id === createEntityId("entity-1")) return ok(mockEntity);
      if (id === createEntityId("entity-2")) return ok(mockEntity2);
      return ok(null);
    });
    vi.mocked(mockGraphStore.getRelations!).mockResolvedValue(
      ok([mockRelation]),
    );
    vi.mocked(mockCommunityRepo.getSummary!).mockResolvedValue(ok(null));
    vi.mocked(mockCommunityRepo.updateSummary!).mockResolvedValue(
      ok(undefined),
    );
    vi.mocked(mockCommunityRepo.findById!).mockResolvedValue(ok(mockCommunity));
    vi.mocked(mockCommunityRepo.searchSummariesByEmbedding!).mockResolvedValue(
      ok([]),
    );

    summarizer = new CommunitySummarizer(
      mockLLM,
      mockEmbedding,
      mockGraphStore as IKnowledgeGraphStore,
      mockCommunityRepo as ICommunityRepository,
    );
  });

  describe("summarize()", () => {
    it("コミュニティの要約を生成できる", async () => {
      const result = await summarizer.summarize(
        mockCommunity,
        [mockEntity, mockEntity2],
        [mockRelation],
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.summary).toBeDefined();
        expect(result.data.summary.length).toBeGreaterThan(0);
        expect(result.data.keywords.length).toBeGreaterThan(0);
        expect(result.data.mainEntities.length).toBeGreaterThan(0);
        expect(result.data.confidence).toBeGreaterThanOrEqual(0);
        expect(result.data.confidence).toBeLessThanOrEqual(1);
        expect(result.data.createdAt).toBeInstanceOf(Date);
      }
    });

    it("子コミュニティの要約を使用できる", async () => {
      vi.mocked(mockCommunityRepo.getSummary!).mockResolvedValue(
        ok(mockChildSummary),
      );

      const result = await summarizer.summarize(
        mockCommunityWithChildren,
        [mockEntity],
        [mockRelation],
        { useChildSummaries: true },
      );

      expect(result.success).toBe(true);
      expect(mockCommunityRepo.getSummary).toHaveBeenCalledTimes(2);
    });

    it("埋め込みを生成できる", async () => {
      const result = await summarizer.summarize(
        mockCommunity,
        [mockEntity],
        [mockRelation],
        { generateEmbedding: true },
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.embedding).toBeDefined();
        expect(result.data.embedding?.length).toBe(384);
      }
    });

    it("埋め込み生成をスキップできる", async () => {
      const result = await summarizer.summarize(
        mockCommunity,
        [mockEntity],
        [mockRelation],
        { generateEmbedding: false },
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.embedding).toBeUndefined();
      }
      expect(mockEmbedding.embed).not.toHaveBeenCalled();
    });

    it("LLM失敗時にエラーを返す", async () => {
      vi.mocked(mockLLM.generate).mockResolvedValue(
        err(new Error("LLM generation failed")),
      );

      const result = await summarizer.summarize(
        mockCommunity,
        [mockEntity],
        [mockRelation],
      );

      expect(result.success).toBe(false);
    });

    it("JSONパース失敗時にエラーを返す", async () => {
      vi.mocked(mockLLM.generate).mockResolvedValue(
        ok({
          text: "not a valid json",
          tokensUsed: 0,
        }),
      );

      const result = await summarizer.summarize(
        mockCommunity,
        [mockEntity],
        [mockRelation],
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain("JSON");
      }
    });

    it("DB保存失敗時にエラーを返す", async () => {
      vi.mocked(mockCommunityRepo.updateSummary!).mockResolvedValue(
        err(new Error("Database connection failed")),
      );

      const result = await summarizer.summarize(
        mockCommunity,
        [mockEntity],
        [mockRelation],
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain("Failed to save summary");
      }
    });

    it("無効なconfidence値はデフォルト値になる", async () => {
      vi.mocked(mockLLM.generate).mockResolvedValue(
        ok({
          text: JSON.stringify({
            summary: "テスト要約",
            keywords: ["test"],
            mainEntities: ["Entity1"],
            mainRelations: ["Relation1"],
            sentiment: "neutral",
            confidence: "invalid", // 無効な値
          }),
          tokensUsed: 100,
        }),
      );

      const result = await summarizer.summarize(
        mockCommunity,
        [mockEntity],
        [mockRelation],
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.confidence).toBe(0.5); // デフォルト値
      }
    });

    it("埋め込み失敗時も要約は成功する", async () => {
      vi.mocked(mockEmbedding.embed).mockRejectedValue(
        new Error("Embedding failed"),
      );

      const result = await summarizer.summarize(
        mockCommunity,
        [mockEntity],
        [mockRelation],
        { generateEmbedding: true },
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.embedding).toBeUndefined();
      }
    });

    it("スタイル指定が反映される", async () => {
      await summarizer.summarize(mockCommunity, [mockEntity], [mockRelation], {
        summaryStyle: "technical",
      });

      const prompt = vi.mocked(mockLLM.generate).mock.calls[0][0];
      expect(prompt).toContain("技術的な観点から");
    });
  });

  describe("summarizeAll()", () => {
    it("全コミュニティの要約を生成できる", async () => {
      const result = await summarizer.summarizeAll(mockCommunityStructure);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.summaries.length).toBe(
          mockCommunityStructure.communities.length,
        );
        expect(result.data.failedCommunities.length).toBe(0);
      }
    });

    it("階層順（子→親）で処理される", async () => {
      const multiLevelStructure: CommunityStructure = {
        communities: [
          {
            ...mockCommunity,
            id: createCommunityId("level-2"),
            level: 2,
            memberEntityIds: [],
          },
          {
            ...mockCommunity,
            id: createCommunityId("level-0"),
            level: 0,
            memberEntityIds: [],
          },
          {
            ...mockCommunity,
            id: createCommunityId("level-1"),
            level: 1,
            memberEntityIds: [],
          },
        ],
        levels: 3,
        totalModularity: 0.5,
        entityToCommunity: new Map(),
      };

      const result = await summarizer.summarizeAll(multiLevelStructure);

      expect(result.success).toBe(true);
      // レベル0、1、2の順で処理されることを確認
      const calls = vi.mocked(mockLLM.generate).mock.calls;
      expect(calls.length).toBe(3);
    });

    it("統計情報が集計される", async () => {
      const result = await summarizer.summarizeAll(mockCommunityStructure);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.totalTokensUsed).toBeGreaterThan(0);
        expect(result.data.processingTimeMs).toBeGreaterThanOrEqual(0);
      }
    });

    it("TC-A-03: 並列処理制限が機能する", async () => {
      const multipleCommunitiesStructure: CommunityStructure = {
        communities: Array.from({ length: 10 }, (_, i) => ({
          ...mockCommunity,
          id: createCommunityId(`community-${i}`),
          level: 0,
          memberEntityIds: [],
        })),
        levels: 1,
        totalModularity: 0.5,
        entityToCommunity: new Map(),
      };

      const result = await summarizer.summarizeAll(
        multipleCommunitiesStructure,
        {
          maxConcurrency: 3,
        },
      );

      expect(result.success).toBe(true);
      // 10件全ての要約が生成されることを確認
      if (result.success) {
        expect(result.data.summaries.length).toBe(10);
      }
    });

    it("TC-A-04: 部分失敗時も他のコミュニティは処理される", async () => {
      // 特定のコミュニティでのみ失敗するようにモック設定
      let callCount = 0;
      vi.mocked(mockLLM.generate).mockImplementation(async () => {
        callCount++;
        if (callCount === 2) {
          return err(new Error("Simulated failure"));
        }
        return ok(mockLLMResponse);
      });

      const multipleCommunitiesStructure: CommunityStructure = {
        communities: Array.from({ length: 3 }, (_, i) => ({
          ...mockCommunity,
          id: createCommunityId(`community-${i}`),
          level: 0,
          memberEntityIds: [],
        })),
        levels: 1,
        totalModularity: 0.5,
        entityToCommunity: new Map(),
      };

      const result = await summarizer.summarizeAll(
        multipleCommunitiesStructure,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        // 3件中2件は成功するはず
        expect(result.data.summaries.length).toBe(2);
      }
    });
  });

  describe("searchSummaries()", () => {
    it("セマンティック検索ができる", async () => {
      vi.mocked(
        mockCommunityRepo.searchSummariesByEmbedding!,
      ).mockResolvedValue(ok([mockChildSummary]));

      const result = await summarizer.searchSummaries("プログラミング");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBeGreaterThan(0);
      }
    });

    it("レベル指定検索ができる", async () => {
      vi.mocked(
        mockCommunityRepo.searchSummariesByEmbedding!,
      ).mockResolvedValue(ok([mockChildSummary]));

      const result = await summarizer.searchSummaries("query", { level: 0 });

      expect(result.success).toBe(true);
      expect(mockCommunityRepo.searchSummariesByEmbedding).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({ level: 0 }),
      );
    });

    it("limit制限が機能する", async () => {
      await summarizer.searchSummaries("query", { limit: 5 });

      expect(mockCommunityRepo.searchSummariesByEmbedding).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({ limit: 5 }),
      );
    });

    it("クエリ埋め込み失敗時にエラーを返す", async () => {
      vi.mocked(mockEmbedding.embed).mockRejectedValue(
        new Error("Embedding failed"),
      );

      const result = await summarizer.searchSummaries("query");

      expect(result.success).toBe(false);
    });

    it("TC-Q-04: 類似度順にソートされた結果を返す", async () => {
      const sortedSummaries = [
        { ...mockChildSummary, communityId: createCommunityId("high-sim") },
        {
          ...mockChildSummary,
          communityId: createCommunityId("mid-sim"),
          summary: "中程度類似要約",
        },
        {
          ...mockChildSummary,
          communityId: createCommunityId("low-sim"),
          summary: "低類似要約",
        },
      ];
      vi.mocked(
        mockCommunityRepo.searchSummariesByEmbedding!,
      ).mockResolvedValue(ok(sortedSummaries));

      const result = await summarizer.searchSummaries("TypeScript");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(3);
        expect(result.data[0].communityId).toBe(createCommunityId("high-sim"));
      }
    });
  });

  describe("updateSummary()", () => {
    it("要約を更新できる", async () => {
      const result = await summarizer.updateSummary(
        createCommunityId("community-1"),
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.createdAt).toBeDefined();
      }
    });

    it("存在しないコミュニティIDでエラーを返す", async () => {
      vi.mocked(mockCommunityRepo.findById!).mockResolvedValue(ok(null));

      const result = await summarizer.updateSummary(
        createCommunityId("non-existent"),
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain("not found");
      }
    });

    it("TC-U-03: createdAtが新しい日時で更新される", async () => {
      const beforeUpdate = new Date();
      await new Promise((resolve) => setTimeout(resolve, 10)); // 10ms待機

      const result = await summarizer.updateSummary(
        createCommunityId("community-1"),
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.createdAt.getTime()).toBeGreaterThanOrEqual(
          beforeUpdate.getTime(),
        );
      }
    });
  });

  describe("Edge Cases", () => {
    it("空のコミュニティを処理できる", async () => {
      const emptyCommunity: Community = {
        ...mockCommunity,
        memberEntityIds: [],
        size: 0,
      };

      const result = await summarizer.summarize(emptyCommunity, [], []);

      // 空のコミュニティでも要約は生成される
      expect(result.success).toBe(true);
    });

    it("単一エンティティのコミュニティを処理できる", async () => {
      const singleEntityCommunity: Community = {
        ...mockCommunity,
        memberEntityIds: [createEntityId("entity-1")],
        size: 1,
      };

      const result = await summarizer.summarize(
        singleEntityCommunity,
        [mockEntity],
        [],
      );

      expect(result.success).toBe(true);
    });

    it("大量エンティティでも正常に処理できる", async () => {
      const manyEntities = Array.from({ length: 100 }, (_, i) => ({
        ...mockEntity,
        id: createEntityId(`entity-${i}`),
        name: `Entity ${i}`,
        importance: 1 - i * 0.01,
      }));

      await summarizer.summarize(mockCommunity, manyEntities, []);

      const prompt = vi.mocked(mockLLM.generate).mock.calls[0][0];
      // 上位20件のみがプロンプトに含まれることを確認
      expect(prompt).toContain("Entity 0");
      expect(prompt).not.toContain("Entity 25");
    });

    it("TC-E-04: 大量関係でも正常に処理できる", async () => {
      const manyRelations = Array.from({ length: 50 }, (_, i) => ({
        ...mockRelation,
        id: createRelationId(`relation-${i}`),
        relationType: `TYPE_${i}` as any,
        weight: 1 - i * 0.01,
      }));

      await summarizer.summarize(mockCommunity, [mockEntity], manyRelations);

      const prompt = vi.mocked(mockLLM.generate).mock.calls[0][0];
      // 上位30件のみがプロンプトに含まれることを確認
      expect(prompt).toContain("TYPE_0");
      expect(prompt).toContain("TYPE_29");
      expect(prompt).not.toContain("TYPE_35");
    });

    it("TC-E-05: 深い階層レベルのコミュニティも正常に処理できる", async () => {
      const deepLevelCommunity: Community = {
        ...mockCommunity,
        id: createCommunityId("deep-level"),
        level: 5,
      };

      const result = await summarizer.summarize(
        deepLevelCommunity,
        [mockEntity],
        [mockRelation],
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.level).toBe(5);
      }
    });
  });
});

describe("Integration Tests", () => {
  let mockLLM: ILLMProvider;
  let mockEmbedding: IEmbeddingProvider;
  let mockGraphStore: Partial<IKnowledgeGraphStore>;
  let mockCommunityRepo: Partial<ICommunityRepository>;
  let summarizer: CommunitySummarizer;

  beforeEach(() => {
    mockLLM = createMockLLMProvider();
    mockEmbedding = createMockEmbeddingProvider();
    mockGraphStore = createMockGraphStore();
    mockCommunityRepo = createMockCommunityRepo();

    vi.mocked(mockLLM.generate).mockResolvedValue(ok(mockLLMResponse));
    vi.mocked(mockEmbedding.embed).mockResolvedValue({
      embedding: new Array(384).fill(0.1),
      tokensUsed: 10,
    });
    vi.mocked(mockGraphStore.getEntity!).mockResolvedValue(ok(mockEntity));
    vi.mocked(mockGraphStore.getRelations!).mockResolvedValue(
      ok([mockRelation]),
    );
    vi.mocked(mockCommunityRepo.getSummary!).mockResolvedValue(ok(null));
    vi.mocked(mockCommunityRepo.updateSummary!).mockResolvedValue(
      ok(undefined),
    );
    vi.mocked(mockCommunityRepo.findById!).mockResolvedValue(ok(mockCommunity));

    summarizer = new CommunitySummarizer(
      mockLLM,
      mockEmbedding,
      mockGraphStore as IKnowledgeGraphStore,
      mockCommunityRepo as ICommunityRepository,
    );
  });

  describe("ILLMProvider統合", () => {
    it("TC-I-01: generate()の応答がパースされる", async () => {
      const result = await summarizer.summarize(
        mockCommunity,
        [mockEntity],
        [mockRelation],
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.summary).toBe(
          "このグループはプログラミング言語に関連するエンティティです",
        );
        expect(result.data.keywords).toEqual([
          "TypeScript",
          "JavaScript",
          "プログラミング",
        ]);
      }
    });

    it("TC-I-02: LLMエラー時にResult.errを返却する", async () => {
      vi.mocked(mockLLM.generate).mockResolvedValue(
        err(new Error("LLM service unavailable")),
      );

      const result = await summarizer.summarize(
        mockCommunity,
        [mockEntity],
        [mockRelation],
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain("LLM generation failed");
      }
    });

    it("generate()が正しいパラメータで呼び出される", async () => {
      await summarizer.summarize(mockCommunity, [mockEntity], [mockRelation]);

      expect(mockLLM.generate).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          temperature: 0.3,
          responseFormat: "json",
        }),
      );
    });
  });

  describe("IEmbeddingProvider統合", () => {
    it("embed()が要約テキストで呼び出される", async () => {
      await summarizer.summarize(mockCommunity, [mockEntity], [mockRelation]);

      expect(mockEmbedding.embed).toHaveBeenCalled();
    });

    it("TC-I-07: searchSummariesでクエリ埋め込みが生成される", async () => {
      vi.mocked(
        mockCommunityRepo.searchSummariesByEmbedding!,
      ).mockResolvedValue(ok([]));

      await summarizer.searchSummaries("プログラミング");

      expect(mockEmbedding.embed).toHaveBeenCalledWith("プログラミング");
    });
  });

  describe("ICommunityRepository統合", () => {
    it("TC-I-11: 子コミュニティ要約がgetSummary()で取得される", async () => {
      vi.mocked(mockCommunityRepo.getSummary!).mockResolvedValue(
        ok(mockChildSummary),
      );

      await summarizer.summarize(
        mockCommunityWithChildren,
        [mockEntity],
        [mockRelation],
        { useChildSummaries: true },
      );

      expect(mockCommunityRepo.getSummary).toHaveBeenCalledTimes(2);
    });

    it("updateSummary()が呼び出される", async () => {
      await summarizer.summarize(mockCommunity, [mockEntity], [mockRelation]);

      expect(mockCommunityRepo.updateSummary).toHaveBeenCalledWith(
        mockCommunity.id,
        expect.any(Object),
      );
    });

    it("TC-I-13: updateSummary()でfindById()が呼び出される", async () => {
      await summarizer.updateSummary(createCommunityId("community-1"));

      expect(mockCommunityRepo.findById).toHaveBeenCalledWith(
        createCommunityId("community-1"),
      );
    });
  });
});
