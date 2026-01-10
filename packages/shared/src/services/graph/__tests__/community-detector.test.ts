/**
 * Community Detector Unit Tests
 *
 * TDD Phase 4: Red状態 - 実装前のテスト
 *
 * @module community-detector.test
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createEntityId, createCommunityId } from "../../../types/rag/branded";
import { ok, err, isOk, isErr } from "../../../types/rag/result";

// NOTE: 以下のインポートはPhase 5で実装される
// 現時点ではテストは失敗する（Red状態）
import { CommunityDetector } from "../community-detector";
import { LeidenAlgorithm } from "../leiden-algorithm";
import type { ICommunityDetector } from "../interfaces/community-detector.interface";
import type { ICommunityRepository } from "../interfaces/community-repository.interface";
import type {
  IKnowledgeGraphStore,
  StoredEntity,
} from "../knowledge-graph-store";
import type {
  Community,
  CommunityStructure,
  CommunityDetectionOptions,
} from "../types";

// ============================================
// モック定義
// ============================================

/**
 * IKnowledgeGraphStoreのモック
 */
function createMockGraphStore(): IKnowledgeGraphStore {
  return {
    getEntity: vi.fn().mockResolvedValue(ok(null)),
    findEntities: vi.fn().mockResolvedValue(ok([])),
    getRelations: vi.fn().mockResolvedValue(ok([])),
    getStats: vi.fn().mockResolvedValue(ok({ entities: 0, relations: 0 })),
    upsertEntity: vi.fn().mockResolvedValue(ok(undefined)),
    addRelation: vi.fn().mockResolvedValue(ok(undefined)),
    deleteEntity: vi.fn().mockResolvedValue(ok(undefined)),
    deleteRelation: vi.fn().mockResolvedValue(ok(undefined)),
    findSimilarEntities: vi.fn().mockResolvedValue(ok([])),
    getEntityByName: vi.fn().mockResolvedValue(ok(null)),
    findRelations: vi.fn().mockResolvedValue(ok([])),
    getRelation: vi.fn().mockResolvedValue(ok(null)),
    traverse: vi.fn().mockResolvedValue(
      ok({
        startEntity: null,
        paths: [],
        visitedEntities: [],
        maxDepthReached: 0,
      }),
    ),
    findShortestPath: vi.fn().mockResolvedValue(ok(null)),
    getNeighbors: vi.fn().mockResolvedValue(ok([])),
    bulkUpsertEntities: vi.fn().mockResolvedValue(ok([])),
    bulkAddRelations: vi.fn().mockResolvedValue(ok([])),
  } as unknown as IKnowledgeGraphStore;
}

/**
 * ICommunityRepositoryのモック
 */
function createMockCommunityRepo(): ICommunityRepository {
  return {
    insert: vi.fn().mockResolvedValue(ok({})),
    insertMany: vi.fn().mockResolvedValue(ok([])),
    findById: vi.fn().mockResolvedValue(ok(null)),
    findByEntityId: vi.fn().mockResolvedValue(ok([])),
    findByLevel: vi.fn().mockResolvedValue(ok([])),
    deleteAll: vi.fn().mockResolvedValue(ok(undefined)),
    addEntityCommunityMapping: vi.fn().mockResolvedValue(ok(undefined)),
    addEntityCommunityMappings: vi.fn().mockResolvedValue(ok(undefined)),
  };
}

/**
 * テストエンティティを生成
 */
function createTestEntities(count: number): StoredEntity[] {
  return Array.from({ length: count }, (_, i) => ({
    id: createEntityId(`entity-${i}`),
    name: `Entity ${i}`,
    normalizedName: `entity ${i}`,
    type: "concept",
    aliases: [],
    importance: 0.5,
    mentionCount: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

/**
 * テストコミュニティ構造を生成
 */
function createTestCommunityStructure(): CommunityStructure {
  const community1: Community = {
    id: createCommunityId("community-1"),
    level: 0,
    memberEntityIds: [createEntityId("entity-1"), createEntityId("entity-2")],
    childCommunityIds: [],
    size: 2,
    internalEdges: 1,
    externalEdges: 1,
    modularity: 0.3,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const community2: Community = {
    id: createCommunityId("community-2"),
    level: 0,
    memberEntityIds: [createEntityId("entity-3"), createEntityId("entity-4")],
    childCommunityIds: [],
    size: 2,
    internalEdges: 1,
    externalEdges: 1,
    modularity: 0.3,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    communities: [community1, community2],
    levels: 1,
    totalModularity: 0.6,
    entityToCommunity: new Map([
      [createEntityId("entity-1"), [community1.id]],
      [createEntityId("entity-2"), [community1.id]],
      [createEntityId("entity-3"), [community2.id]],
      [createEntityId("entity-4"), [community2.id]],
    ]),
  };
}

// ============================================
// テストスイート
// ============================================

describe("CommunityDetector", () => {
  let detector: ICommunityDetector;
  let mockGraphStore: IKnowledgeGraphStore;
  let mockCommunityRepo: ICommunityRepository;
  let leiden: LeidenAlgorithm;

  beforeEach(() => {
    mockGraphStore = createMockGraphStore();
    mockCommunityRepo = createMockCommunityRepo();
    leiden = new LeidenAlgorithm();
    detector = new CommunityDetector(leiden, mockGraphStore, mockCommunityRepo);
  });

  // --------------------------------------------
  // detect()
  // --------------------------------------------
  describe("detect()", () => {
    it("GraphStoreからデータを取得してコミュニティを検出する", async () => {
      // Given: GraphStoreにエンティティとリレーションがある
      const entities = createTestEntities(6);
      vi.mocked(mockGraphStore.findEntities).mockResolvedValue(ok(entities));
      vi.mocked(mockGraphStore.getStats).mockResolvedValue(
        ok({ entities: 6, relations: 7 }),
      );

      // When: detect()を実行
      const result = await detector.detect();

      // Then: 成功してCommunityDetectionResultが返る
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.structure.communities.length).toBeGreaterThanOrEqual(
          0,
        );
        expect(result.data.processingTimeMs).toBeGreaterThan(0);
      }
    });

    it("オプションパラメータを渡せる", async () => {
      // Given: GraphStoreにデータがある
      const entities = createTestEntities(10);
      vi.mocked(mockGraphStore.findEntities).mockResolvedValue(ok(entities));

      const options: CommunityDetectionOptions = {
        resolution: 1.5,
        maxLevels: 2,
        seed: 12345,
      };

      // When: オプション付きでdetect()を実行
      const result = await detector.detect(options);

      // Then: 成功
      expect(isOk(result)).toBe(true);
    });

    it("空のグラフでも成功する", async () => {
      // Given: GraphStoreが空
      vi.mocked(mockGraphStore.findEntities).mockResolvedValue(ok([]));
      vi.mocked(mockGraphStore.getStats).mockResolvedValue(
        ok({ entities: 0, relations: 0 }),
      );

      // When: detect()を実行
      const result = await detector.detect();

      // Then: 空のStructureで成功
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.structure.communities).toHaveLength(0);
      }
    });

    it("GraphStore障害時にResult.errを返す", async () => {
      // Given: GraphStoreがエラーを返す
      vi.mocked(mockGraphStore.findEntities).mockResolvedValue(
        err(new Error("Database connection failed")),
      );

      // When: detect()を実行
      const result = await detector.detect();

      // Then: Result.errが返される
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.message).toContain("connection");
      }
    });
  });

  // --------------------------------------------
  // saveResults()
  // --------------------------------------------
  describe("saveResults()", () => {
    it("検出結果をDBに保存できる", async () => {
      // Given: コミュニティ構造がある
      const structure = createTestCommunityStructure();

      // When: saveResults()を実行
      const result = await detector.saveResults(structure);

      // Then: 成功
      expect(isOk(result)).toBe(true);
      expect(mockCommunityRepo.deleteAll).toHaveBeenCalled();
      expect(mockCommunityRepo.insertMany).toHaveBeenCalled();
    });

    it("既存データを削除してから保存する", async () => {
      // Given: コミュニティ構造がある
      const structure = createTestCommunityStructure();

      // When: saveResults()を実行
      await detector.saveResults(structure);

      // Then: deleteAllが先に呼ばれる
      const deleteCall = vi.mocked(mockCommunityRepo.deleteAll).mock
        .invocationCallOrder[0];
      const insertCall = vi.mocked(mockCommunityRepo.insertMany).mock
        .invocationCallOrder[0];
      expect(deleteCall).toBeLessThan(insertCall);
    });

    it("エンティティ-コミュニティマッピングも保存する", async () => {
      // Given: コミュニティ構造がある
      const structure = createTestCommunityStructure();

      // When: saveResults()を実行
      await detector.saveResults(structure);

      // Then: マッピングが保存される
      expect(mockCommunityRepo.addEntityCommunityMappings).toHaveBeenCalled();
    });

    it("保存失敗時にResult.errを返す", async () => {
      // Given: Repositoryがエラーを返す
      vi.mocked(mockCommunityRepo.insertMany).mockResolvedValue(
        err(new Error("Insert failed")),
      );

      const structure = createTestCommunityStructure();

      // When: saveResults()を実行
      const result = await detector.saveResults(structure);

      // Then: Result.errが返される
      expect(isErr(result)).toBe(true);
    });
  });

  // --------------------------------------------
  // getCommunitiesForEntity()
  // --------------------------------------------
  describe("getCommunitiesForEntity()", () => {
    it("エンティティが属するコミュニティを取得できる", async () => {
      // Given: エンティティがコミュニティに属している
      const entityId = createEntityId("entity-1");
      const communities: Community[] = [
        {
          id: createCommunityId("community-1"),
          level: 0,
          memberEntityIds: [entityId],
          childCommunityIds: [],
          size: 1,
          internalEdges: 0,
          externalEdges: 0,
          modularity: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(mockCommunityRepo.findByEntityId).mockResolvedValue(
        ok(communities),
      );

      // When: getCommunitiesForEntity()を実行
      const result = await detector.getCommunitiesForEntity(entityId);

      // Then: コミュニティが返される
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe(communities[0].id);
      }
    });

    it("存在しないエンティティは空配列を返す", async () => {
      // Given: エンティティが存在しない
      const entityId = createEntityId("non-existent");
      vi.mocked(mockCommunityRepo.findByEntityId).mockResolvedValue(ok([]));

      // When: getCommunitiesForEntity()を実行
      const result = await detector.getCommunitiesForEntity(entityId);

      // Then: 空配列が返される
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toHaveLength(0);
      }
    });
  });

  // --------------------------------------------
  // getCommunitiesByLevel()
  // --------------------------------------------
  describe("getCommunitiesByLevel()", () => {
    it("指定レベルのコミュニティを取得できる", async () => {
      // Given: レベル0のコミュニティがある
      const communities: Community[] = [
        {
          id: createCommunityId("community-1"),
          level: 0,
          memberEntityIds: [],
          childCommunityIds: [],
          size: 0,
          internalEdges: 0,
          externalEdges: 0,
          modularity: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(mockCommunityRepo.findByLevel).mockResolvedValue(
        ok(communities),
      );

      // When: getCommunitiesByLevel(0)を実行
      const result = await detector.getCommunitiesByLevel(0);

      // Then: コミュニティが返される
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toHaveLength(1);
      }
    });

    it("存在しないレベルは空配列を返す", async () => {
      // Given: レベル10のコミュニティがない
      vi.mocked(mockCommunityRepo.findByLevel).mockResolvedValue(ok([]));

      // When: getCommunitiesByLevel(10)を実行
      const result = await detector.getCommunitiesByLevel(10);

      // Then: 空配列が返される
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toHaveLength(0);
      }
    });
  });

  // --------------------------------------------
  // getCommunityMembers()
  // --------------------------------------------
  describe("getCommunityMembers()", () => {
    it("コミュニティのメンバーエンティティを取得できる", async () => {
      // Given: コミュニティとメンバーがある
      const communityId = createCommunityId("community-1");
      const memberIds = [
        createEntityId("entity-1"),
        createEntityId("entity-2"),
      ];

      const community: Community = {
        id: communityId,
        level: 0,
        memberEntityIds: memberIds,
        childCommunityIds: [],
        size: 2,
        internalEdges: 1,
        externalEdges: 0,
        modularity: 0.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockCommunityRepo.findById).mockResolvedValue(ok(community));

      const entities = memberIds.map((id, i) => ({
        id,
        name: `Entity ${i}`,
        normalizedName: `entity ${i}`,
        type: "concept",
        aliases: [],
        importance: 0.5,
        mentionCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      vi.mocked(mockGraphStore.getEntity).mockImplementation(async (id) => {
        const entity = entities.find((e) => e.id === id);
        return ok(entity || null);
      });

      // When: getCommunityMembers()を実行
      const result = await detector.getCommunityMembers(communityId);

      // Then: メンバーエンティティが返される
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.length).toBe(2);
      }
    });

    it("存在しないコミュニティでエラーを返す", async () => {
      // Given: コミュニティが存在しない
      const communityId = createCommunityId("non-existent");
      vi.mocked(mockCommunityRepo.findById).mockResolvedValue(ok(null));

      // When: getCommunityMembers()を実行
      const result = await detector.getCommunityMembers(communityId);

      // Then: Result.errが返される
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.message).toContain("not found");
      }
    });
  });

  // --------------------------------------------
  // エラーハンドリング
  // --------------------------------------------
  describe("エラーハンドリング", () => {
    it("全メソッドがResult型を返す", async () => {
      // Given: 様々なメソッド

      // When/Then: 各メソッドの戻り値を確認
      const detectResult = await detector.detect();
      expect(detectResult).toHaveProperty("success");

      const saveResult = await detector.saveResults(
        createTestCommunityStructure(),
      );
      expect(saveResult).toHaveProperty("success");

      const getForEntityResult = await detector.getCommunitiesForEntity(
        createEntityId("test"),
      );
      expect(getForEntityResult).toHaveProperty("success");

      const getByLevelResult = await detector.getCommunitiesByLevel(0);
      expect(getByLevelResult).toHaveProperty("success");

      const getMembersResult = await detector.getCommunityMembers(
        createCommunityId("test"),
      );
      expect(getMembersResult).toHaveProperty("success");
    });
  });

  // --------------------------------------------
  // 追加テスト: saveResults エラーケース
  // --------------------------------------------
  describe("saveResults() - 追加エラーケース", () => {
    it("deleteAll失敗時にResult.errを返す", async () => {
      // Given: deleteAllがエラーを返す
      vi.mocked(mockCommunityRepo.deleteAll).mockResolvedValue(
        err(new Error("Delete failed")),
      );

      const structure = createTestCommunityStructure();

      // When: saveResults()を実行
      const result = await detector.saveResults(structure);

      // Then: Result.errが返される
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.message).toContain("delete");
      }
    });

    it("addEntityCommunityMappings失敗時にResult.errを返す", async () => {
      // Given: addEntityCommunityMappingsがエラーを返す
      vi.mocked(mockCommunityRepo.addEntityCommunityMappings).mockResolvedValue(
        err(new Error("Mapping failed")),
      );

      const structure = createTestCommunityStructure();

      // When: saveResults()を実行
      const result = await detector.saveResults(structure);

      // Then: Result.errが返される
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.message).toContain("mapping");
      }
    });

    it("空のマッピングではaddEntityCommunityMappingsが呼ばれない", async () => {
      // Given: マッピングが空のコミュニティ構造
      const structure: CommunityStructure = {
        communities: [],
        levels: 0,
        totalModularity: 0,
        entityToCommunity: new Map(),
      };

      // When: saveResults()を実行
      const result = await detector.saveResults(structure);

      // Then: 成功し、addEntityCommunityMappingsは呼ばれない
      expect(isOk(result)).toBe(true);
      expect(
        mockCommunityRepo.addEntityCommunityMappings,
      ).not.toHaveBeenCalled();
    });

    it("例外発生時にResult.errを返す", async () => {
      // Given: deleteAllが例外をスロー
      vi.mocked(mockCommunityRepo.deleteAll).mockRejectedValue(
        new Error("Unexpected error"),
      );

      const structure = createTestCommunityStructure();

      // When: saveResults()を実行
      const result = await detector.saveResults(structure);

      // Then: Result.errが返される
      expect(isErr(result)).toBe(true);
    });
  });

  // --------------------------------------------
  // 追加テスト: getCommunitiesForEntity エラーケース
  // --------------------------------------------
  describe("getCommunitiesForEntity() - 追加エラーケース", () => {
    it("Repository障害時にResult.errを返す", async () => {
      // Given: findByEntityIdがエラーを返す
      vi.mocked(mockCommunityRepo.findByEntityId).mockResolvedValue(
        err(new Error("Query failed")),
      );

      const entityId = createEntityId("entity-1");

      // When: getCommunitiesForEntity()を実行
      const result = await detector.getCommunitiesForEntity(entityId);

      // Then: Result.errが返される
      expect(isErr(result)).toBe(true);
    });

    it("例外発生時にResult.errを返す", async () => {
      // Given: findByEntityIdが例外をスロー
      vi.mocked(mockCommunityRepo.findByEntityId).mockRejectedValue(
        new Error("Unexpected error"),
      );

      const entityId = createEntityId("entity-1");

      // When: getCommunitiesForEntity()を実行
      const result = await detector.getCommunitiesForEntity(entityId);

      // Then: Result.errが返される
      expect(isErr(result)).toBe(true);
    });
  });

  // --------------------------------------------
  // 追加テスト: getCommunitiesByLevel エラーケース
  // --------------------------------------------
  describe("getCommunitiesByLevel() - 追加エラーケース", () => {
    it("Repository障害時にResult.errを返す", async () => {
      // Given: findByLevelがエラーを返す
      vi.mocked(mockCommunityRepo.findByLevel).mockResolvedValue(
        err(new Error("Query failed")),
      );

      // When: getCommunitiesByLevel()を実行
      const result = await detector.getCommunitiesByLevel(0);

      // Then: Result.errが返される
      expect(isErr(result)).toBe(true);
    });

    it("例外発生時にResult.errを返す", async () => {
      // Given: findByLevelが例外をスロー
      vi.mocked(mockCommunityRepo.findByLevel).mockRejectedValue(
        new Error("Unexpected error"),
      );

      // When: getCommunitiesByLevel()を実行
      const result = await detector.getCommunitiesByLevel(0);

      // Then: Result.errが返される
      expect(isErr(result)).toBe(true);
    });
  });

  // --------------------------------------------
  // 追加テスト: getCommunityMembers エラーケース
  // --------------------------------------------
  describe("getCommunityMembers() - 追加エラーケース", () => {
    it("Repository障害時にResult.errを返す", async () => {
      // Given: findByIdがエラーを返す
      vi.mocked(mockCommunityRepo.findById).mockResolvedValue(
        err(new Error("Query failed")),
      );

      const communityId = createCommunityId("community-1");

      // When: getCommunityMembers()を実行
      const result = await detector.getCommunityMembers(communityId);

      // Then: Result.errが返される
      expect(isErr(result)).toBe(true);
    });

    it("例外発生時にResult.errを返す", async () => {
      // Given: findByIdが例外をスロー
      vi.mocked(mockCommunityRepo.findById).mockRejectedValue(
        new Error("Unexpected error"),
      );

      const communityId = createCommunityId("community-1");

      // When: getCommunityMembers()を実行
      const result = await detector.getCommunityMembers(communityId);

      // Then: Result.errが返される
      expect(isErr(result)).toBe(true);
    });

    it("一部のエンティティ取得に失敗しても他は返す", async () => {
      // Given: コミュニティと一部取得失敗するエンティティ
      const communityId = createCommunityId("community-1");
      const memberIds = [
        createEntityId("entity-1"),
        createEntityId("entity-2"),
        createEntityId("entity-missing"),
      ];

      const community: Community = {
        id: communityId,
        level: 0,
        memberEntityIds: memberIds,
        childCommunityIds: [],
        size: 3,
        internalEdges: 0,
        externalEdges: 0,
        modularity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(mockCommunityRepo.findById).mockResolvedValue(ok(community));

      vi.mocked(mockGraphStore.getEntity).mockImplementation(async (id) => {
        if (id === memberIds[2]) {
          return ok(null); // 見つからない
        }
        return ok({
          id,
          name: `Entity`,
          normalizedName: `entity`,
          type: "concept",
          aliases: [],
          importance: 0.5,
          mentionCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      // When: getCommunityMembers()を実行
      const result = await detector.getCommunityMembers(communityId);

      // Then: 見つかった2エンティティのみ返される
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.length).toBe(2);
      }
    });
  });

  // --------------------------------------------
  // 追加テスト: detect() グラフデータ読み込み
  // --------------------------------------------
  describe("detect() - グラフデータ読み込み", () => {
    it("getRelations失敗を無視して続行する", async () => {
      // Given: 一部のgetRelationsがエラーを返す
      const entities = createTestEntities(3);
      vi.mocked(mockGraphStore.findEntities).mockResolvedValue(ok(entities));

      let callCount = 0;
      vi.mocked(mockGraphStore.getRelations).mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          return err(new Error("Relations error"));
        }
        return ok([]);
      });

      // When: detect()を実行
      const result = await detector.detect();

      // Then: 成功する（エラーは無視される）
      expect(isOk(result)).toBe(true);
    });

    it("エンティティとリレーションからエッジを正しく構築する", async () => {
      // Given: エンティティとリレーションがある
      const entities = createTestEntities(3);
      vi.mocked(mockGraphStore.findEntities).mockResolvedValue(ok(entities));

      vi.mocked(mockGraphStore.getRelations).mockImplementation(
        async (entityId) => {
          if (entityId === entities[0].id) {
            return ok([
              {
                id: "rel-1",
                sourceEntityId: entities[0].id,
                targetEntityId: entities[1].id,
                type: "related",
                weight: 1.0,
                confidence: 0.9,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ]);
          }
          return ok([]);
        },
      );

      // When: detect()を実行
      const result = await detector.detect();

      // Then: 成功する
      expect(isOk(result)).toBe(true);
    });

    it("detect()で例外発生時にResult.errを返す", async () => {
      // Given: findEntitiesが例外をスロー
      vi.mocked(mockGraphStore.findEntities).mockRejectedValue(
        new Error("Unexpected error"),
      );

      // When: detect()を実行
      const result = await detector.detect();

      // Then: Result.errが返される
      expect(isErr(result)).toBe(true);
    });
  });

  // --------------------------------------------
  // 統合テスト: データフロー
  // --------------------------------------------
  describe("統合テスト - データフロー", () => {
    it("detect → saveResults フローが正しく動作する", async () => {
      // Given: グラフデータ
      const entities = createTestEntities(6);
      vi.mocked(mockGraphStore.findEntities).mockResolvedValue(ok(entities));
      vi.mocked(mockGraphStore.getRelations).mockResolvedValue(ok([]));

      // When: detect → saveResults
      const detectResult = await detector.detect();
      expect(isOk(detectResult)).toBe(true);

      if (isOk(detectResult)) {
        const saveResult = await detector.saveResults(
          detectResult.data.structure,
        );
        expect(isOk(saveResult)).toBe(true);
      }
    });

    it("同一seedで再現可能な結果を得られる", async () => {
      // Given: 同一グラフと同一seed
      const entities = createTestEntities(10);
      vi.mocked(mockGraphStore.findEntities).mockResolvedValue(ok(entities));

      // 各エンティティ間のリレーションを設定
      vi.mocked(mockGraphStore.getRelations).mockImplementation(async (id) => {
        const idx = entities.findIndex((e) => e.id === id);
        if (idx >= 0 && idx < entities.length - 1) {
          return ok([
            {
              id: `rel-${idx}`,
              sourceEntityId: entities[idx].id,
              targetEntityId: entities[idx + 1].id,
              type: "related",
              weight: 1.0,
              confidence: 0.9,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]);
        }
        return ok([]);
      });

      // When: 同一seedで2回実行
      const result1 = await detector.detect({ seed: 42 });
      const result2 = await detector.detect({ seed: 42 });

      // Then: 結果が一致
      expect(isOk(result1)).toBe(true);
      expect(isOk(result2)).toBe(true);
      if (isOk(result1) && isOk(result2)) {
        expect(result1.data.structure.communities.length).toBe(
          result2.data.structure.communities.length,
        );
        expect(result1.data.structure.totalModularity).toBe(
          result2.data.structure.totalModularity,
        );
      }
    });
  });
});
