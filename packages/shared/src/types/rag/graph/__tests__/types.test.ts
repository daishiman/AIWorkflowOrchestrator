/**
 * @file Knowledge Graph型定義のユニットテスト
 * @module @repo/shared/types/rag/graph/__tests__/types.test
 * @description TDD Red Phase - 実装前のテストケース作成
 *
 * テスト観点:
 * - EntityTypes定数（48種類）
 * - RelationTypes定数（23種類）
 * - EntityEntity型（構造、境界値）
 * - RelationEntity型
 * - CommunityEntity型
 * - Value Objects（EntityMention, RelationEvidence, GraphStatistics）
 * - Float32Array型の使用
 * - ChunkEntityRelation
 */

import { describe, it, expect } from "vitest";
import {
  // 定数
  EntityTypes,
  RelationTypes,
  // 型（型チェック用）
  type EntityType,
  type RelationType,
  type EntityEntity,
  type RelationEntity,
  type CommunityEntity,
  type EntityMention,
  type RelationEvidence,
  type GraphStatistics,
  type ChunkEntityRelation,
} from "../types";
import {
  createChunkId,
  generateEntityId,
  generateRelationId,
  generateCommunityId,
} from "../../branded";

// =============================================================================
// EntityTypes定数のテスト
// =============================================================================

describe("EntityTypes", () => {
  describe("定数の存在確認", () => {
    it("should have 52 entity types defined", () => {
      // Arrange & Act
      const entityTypeCount = Object.keys(EntityTypes).length;

      // Assert
      expect(entityTypeCount).toBe(52);
    });

    describe("人物・組織カテゴリ (4種類)", () => {
      it("should have PERSON type", () => {
        expect(EntityTypes.PERSON).toBe("person");
      });

      it("should have ORGANIZATION type", () => {
        expect(EntityTypes.ORGANIZATION).toBe("organization");
      });

      it("should have ROLE type", () => {
        expect(EntityTypes.ROLE).toBe("role");
      });

      it("should have TEAM type", () => {
        expect(EntityTypes.TEAM).toBe("team");
      });
    });

    describe("場所・時間カテゴリ (3種類)", () => {
      it("should have LOCATION type", () => {
        expect(EntityTypes.LOCATION).toBe("location");
      });

      it("should have DATE type", () => {
        expect(EntityTypes.DATE).toBe("date");
      });

      it("should have EVENT type", () => {
        expect(EntityTypes.EVENT).toBe("event");
      });
    });

    describe("ビジネス・経営カテゴリ (9種類)", () => {
      it("should have all business types", () => {
        expect(EntityTypes.COMPANY).toBe("company");
        expect(EntityTypes.PRODUCT).toBe("product");
        expect(EntityTypes.SERVICE).toBe("service");
        expect(EntityTypes.BRAND).toBe("brand");
        expect(EntityTypes.STRATEGY).toBe("strategy");
        expect(EntityTypes.METRIC).toBe("metric");
        expect(EntityTypes.BUSINESS_PROCESS).toBe("business_process");
        expect(EntityTypes.MARKET).toBe("market");
        expect(EntityTypes.CUSTOMER).toBe("customer");
      });
    });

    describe("技術全般カテゴリ (5種類)", () => {
      it("should have all technology types", () => {
        expect(EntityTypes.TECHNOLOGY).toBe("technology");
        expect(EntityTypes.TOOL).toBe("tool");
        expect(EntityTypes.METHOD).toBe("method");
        expect(EntityTypes.STANDARD).toBe("standard");
        expect(EntityTypes.PROTOCOL).toBe("protocol");
      });
    });

    describe("コード・ソフトウェアカテゴリ (7種類)", () => {
      it("should have all code types", () => {
        expect(EntityTypes.PROGRAMMING_LANGUAGE).toBe("programming_language");
        expect(EntityTypes.FRAMEWORK).toBe("framework");
        expect(EntityTypes.LIBRARY).toBe("library");
        expect(EntityTypes.API).toBe("api");
        expect(EntityTypes.FUNCTION).toBe("function");
        expect(EntityTypes.CLASS).toBe("class");
        expect(EntityTypes.MODULE).toBe("module");
      });
    });

    describe("抽象概念カテゴリ (5種類)", () => {
      it("should have all concept types", () => {
        expect(EntityTypes.CONCEPT).toBe("concept");
        expect(EntityTypes.THEORY).toBe("theory");
        expect(EntityTypes.PRINCIPLE).toBe("principle");
        expect(EntityTypes.PATTERN).toBe("pattern");
        expect(EntityTypes.MODEL).toBe("model");
      });
    });

    describe("ドキュメント構造カテゴリ (5種類)", () => {
      it("should have all document structure types", () => {
        expect(EntityTypes.DOCUMENT).toBe("document");
        expect(EntityTypes.CHAPTER).toBe("chapter");
        expect(EntityTypes.SECTION).toBe("section");
        expect(EntityTypes.PARAGRAPH).toBe("paragraph");
        expect(EntityTypes.HEADING).toBe("heading");
      });
    });

    describe("ドキュメント要素カテゴリ (9種類)", () => {
      it("should have all document element types", () => {
        expect(EntityTypes.KEYWORD).toBe("keyword");
        expect(EntityTypes.SUMMARY).toBe("summary");
        expect(EntityTypes.FIGURE).toBe("figure");
        expect(EntityTypes.TABLE).toBe("table");
        expect(EntityTypes.LIST).toBe("list");
        expect(EntityTypes.QUOTE).toBe("quote");
        expect(EntityTypes.CODE_SNIPPET).toBe("code_snippet");
        expect(EntityTypes.FORMULA).toBe("formula");
        expect(EntityTypes.EXAMPLE).toBe("example");
      });
    });

    describe("メディアカテゴリ (4種類)", () => {
      it("should have all media types", () => {
        expect(EntityTypes.IMAGE).toBe("image");
        expect(EntityTypes.VIDEO).toBe("video");
        expect(EntityTypes.AUDIO).toBe("audio");
        expect(EntityTypes.DIAGRAM).toBe("diagram");
      });
    });

    describe("その他カテゴリ (1種類)", () => {
      it("should have OTHER type", () => {
        expect(EntityTypes.OTHER).toBe("other");
      });
    });
  });

  describe("型安全性", () => {
    it("should be readonly (as const)", () => {
      // EntityTypesはas constで定義されているため、型レベルでは変更不可
      // ランタイムでの変更はTypeScriptでは検出できないが、設計意図を確認
      expect(Object.isFrozen(EntityTypes)).toBe(false); // as constはObject.freezeではない
    });

    it("should have snake_case values", () => {
      // すべての値がsnake_caseであることを確認
      Object.values(EntityTypes).forEach((value) => {
        expect(value).toMatch(/^[a-z]+(_[a-z]+)*$/);
      });
    });
  });
});

// =============================================================================
// RelationTypes定数のテスト
// =============================================================================

describe("RelationTypes", () => {
  describe("定数の存在確認", () => {
    it("should have 23 relation types defined", () => {
      const relationTypeCount = Object.keys(RelationTypes).length;
      expect(relationTypeCount).toBe(23);
    });

    describe("汎用関係 (4種類)", () => {
      it("should have all generic relations", () => {
        expect(RelationTypes.RELATED_TO).toBe("related_to");
        expect(RelationTypes.PART_OF).toBe("part_of");
        expect(RelationTypes.HAS_PART).toBe("has_part");
        expect(RelationTypes.BELONGS_TO).toBe("belongs_to");
      });
    });

    describe("時間的関係 (3種類)", () => {
      it("should have all temporal relations", () => {
        expect(RelationTypes.PRECEDED_BY).toBe("preceded_by");
        expect(RelationTypes.FOLLOWED_BY).toBe("followed_by");
        expect(RelationTypes.CONCURRENT_WITH).toBe("concurrent_with");
      });
    });

    describe("技術的関係 (7種類)", () => {
      it("should have all technical relations", () => {
        expect(RelationTypes.USES).toBe("uses");
        expect(RelationTypes.USED_BY).toBe("used_by");
        expect(RelationTypes.IMPLEMENTS).toBe("implements");
        expect(RelationTypes.EXTENDS).toBe("extends");
        expect(RelationTypes.DEPENDS_ON).toBe("depends_on");
        expect(RelationTypes.CALLS).toBe("calls");
        expect(RelationTypes.IMPORTS).toBe("imports");
      });
    });

    describe("階層関係 (2種類)", () => {
      it("should have all hierarchy relations", () => {
        expect(RelationTypes.PARENT_OF).toBe("parent_of");
        expect(RelationTypes.CHILD_OF).toBe("child_of");
      });
    });

    describe("参照関係 (4種類)", () => {
      it("should have all reference relations", () => {
        expect(RelationTypes.REFERENCES).toBe("references");
        expect(RelationTypes.REFERENCED_BY).toBe("referenced_by");
        expect(RelationTypes.DEFINES).toBe("defines");
        expect(RelationTypes.DEFINED_BY).toBe("defined_by");
      });
    });

    describe("人物関係 (3種類)", () => {
      it("should have all person relations", () => {
        expect(RelationTypes.AUTHORED_BY).toBe("authored_by");
        expect(RelationTypes.WORKS_FOR).toBe("works_for");
        expect(RelationTypes.COLLABORATES_WITH).toBe("collaborates_with");
      });
    });
  });

  describe("型安全性", () => {
    it("should have snake_case values", () => {
      Object.values(RelationTypes).forEach((value) => {
        expect(value).toMatch(/^[a-z]+(_[a-z]+)*$/);
      });
    });
  });
});

// =============================================================================
// EntityEntity型のテスト
// =============================================================================

describe("EntityEntity", () => {
  // テスト用のモックデータ作成ヘルパー
  const createMockEntityEntity = (
    overrides: Partial<EntityEntity> = {},
  ): EntityEntity => ({
    id: generateEntityId(),
    name: "Test Entity",
    normalizedName: "test entity",
    type: "person" as EntityType,
    description: "A test entity",
    aliases: ["alias1", "alias2"],
    embedding: null,
    importance: 0.5,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe("必須フィールド", () => {
    it("should have all required fields", () => {
      const entity = createMockEntityEntity();

      expect(entity.id).toBeDefined();
      expect(entity.name).toBeDefined();
      expect(entity.normalizedName).toBeDefined();
      expect(entity.type).toBeDefined();
      expect(entity.aliases).toBeDefined();
      expect(entity.importance).toBeDefined();
      expect(entity.metadata).toBeDefined();
      expect(entity.createdAt).toBeDefined();
      expect(entity.updatedAt).toBeDefined();
    });
  });

  describe("オプショナルフィールド", () => {
    it("should allow null for description", () => {
      const entity = createMockEntityEntity({ description: null });
      expect(entity.description).toBeNull();
    });

    it("should allow null for embedding", () => {
      const entity = createMockEntityEntity({ embedding: null });
      expect(entity.embedding).toBeNull();
    });
  });

  describe("importance境界値テスト", () => {
    it("should accept importance = 0.0 (minimum)", () => {
      const entity = createMockEntityEntity({ importance: 0.0 });
      expect(entity.importance).toBe(0.0);
    });

    it("should accept importance = 0.5 (middle)", () => {
      const entity = createMockEntityEntity({ importance: 0.5 });
      expect(entity.importance).toBe(0.5);
    });

    it("should accept importance = 1.0 (maximum)", () => {
      const entity = createMockEntityEntity({ importance: 1.0 });
      expect(entity.importance).toBe(1.0);
    });
  });

  describe("Float32Array embedding", () => {
    it("should accept Float32Array for embedding", () => {
      const embedding = new Float32Array([0.1, 0.2, 0.3]);
      const entity = createMockEntityEntity({ embedding });

      expect(entity.embedding).toBeInstanceOf(Float32Array);
      expect(entity.embedding?.length).toBe(3);
    });

    it("should accept 512-dimensional embedding", () => {
      const embedding = new Float32Array(512).fill(0.1);
      const entity = createMockEntityEntity({ embedding });

      expect(entity.embedding?.length).toBe(512);
    });

    it("should accept 1536-dimensional embedding", () => {
      const embedding = new Float32Array(1536).fill(0.1);
      const entity = createMockEntityEntity({ embedding });

      expect(entity.embedding?.length).toBe(1536);
    });
  });

  describe("aliases配列", () => {
    it("should accept empty aliases array", () => {
      const entity = createMockEntityEntity({ aliases: [] });
      expect(entity.aliases).toHaveLength(0);
    });

    it("should accept multiple aliases", () => {
      const aliases = ["alias1", "alias2", "alias3"];
      const entity = createMockEntityEntity({ aliases });
      expect(entity.aliases).toEqual(aliases);
    });
  });

  describe("EntityType", () => {
    it("should accept all 48 entity types", () => {
      const allTypes = Object.values(EntityTypes);

      allTypes.forEach((type) => {
        const entity = createMockEntityEntity({ type: type as EntityType });
        expect(entity.type).toBe(type);
      });
    });
  });
});

// =============================================================================
// RelationEntity型のテスト
// =============================================================================

describe("RelationEntity", () => {
  const createMockRelationEvidence = (): RelationEvidence => ({
    chunkId: createChunkId("550e8400-e29b-41d4-a716-446655440000"),
    excerpt: "This is evidence text",
    confidence: 0.9,
  });

  const createMockRelationEntity = (
    overrides: Partial<RelationEntity> = {},
  ): RelationEntity => ({
    id: generateRelationId(),
    sourceId: generateEntityId(),
    targetId: generateEntityId(),
    type: "uses" as RelationType,
    description: "A test relation",
    weight: 0.5,
    bidirectional: false,
    evidence: [createMockRelationEvidence()],
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe("必須フィールド", () => {
    it("should have all required fields", () => {
      const relation = createMockRelationEntity();

      expect(relation.id).toBeDefined();
      expect(relation.sourceId).toBeDefined();
      expect(relation.targetId).toBeDefined();
      expect(relation.type).toBeDefined();
      expect(relation.weight).toBeDefined();
      expect(relation.bidirectional).toBeDefined();
      expect(relation.evidence).toBeDefined();
      expect(relation.metadata).toBeDefined();
      expect(relation.createdAt).toBeDefined();
      expect(relation.updatedAt).toBeDefined();
    });
  });

  describe("weight境界値テスト", () => {
    it("should accept weight = 0.0 (minimum)", () => {
      const relation = createMockRelationEntity({ weight: 0.0 });
      expect(relation.weight).toBe(0.0);
    });

    it("should accept weight = 1.0 (maximum)", () => {
      const relation = createMockRelationEntity({ weight: 1.0 });
      expect(relation.weight).toBe(1.0);
    });
  });

  describe("bidirectional", () => {
    it("should accept true for bidirectional relations", () => {
      const relation = createMockRelationEntity({ bidirectional: true });
      expect(relation.bidirectional).toBe(true);
    });

    it("should accept false for unidirectional relations", () => {
      const relation = createMockRelationEntity({ bidirectional: false });
      expect(relation.bidirectional).toBe(false);
    });
  });

  describe("evidence配列", () => {
    it("should have at least one evidence", () => {
      const relation = createMockRelationEntity();
      expect(relation.evidence.length).toBeGreaterThanOrEqual(1);
    });

    it("should accept multiple evidences", () => {
      const evidences = [
        createMockRelationEvidence(),
        createMockRelationEvidence(),
      ];
      const relation = createMockRelationEntity({ evidence: evidences });
      expect(relation.evidence).toHaveLength(2);
    });
  });

  describe("RelationType", () => {
    it("should accept all 23 relation types", () => {
      const allTypes = Object.values(RelationTypes);

      allTypes.forEach((type) => {
        const relation = createMockRelationEntity({
          type: type as RelationType,
        });
        expect(relation.type).toBe(type);
      });
    });
  });

  describe("sourceIdとtargetIdの関係", () => {
    it("should allow different sourceId and targetId", () => {
      const sourceId = generateEntityId();
      const targetId = generateEntityId();
      const relation = createMockRelationEntity({ sourceId, targetId });

      expect(relation.sourceId).not.toBe(relation.targetId);
    });

    // 注意: 自己ループ（sourceId === targetId）の禁止はスキーマレベルで検証
  });
});

// =============================================================================
// CommunityEntity型のテスト
// =============================================================================

describe("CommunityEntity", () => {
  const createMockCommunityEntity = (
    overrides: Partial<CommunityEntity> = {},
  ): CommunityEntity => ({
    id: generateCommunityId(),
    level: 0,
    parentId: null,
    name: "Test Community",
    summary: "A test community",
    memberEntityIds: [generateEntityId()],
    memberCount: 1,
    embedding: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe("必須フィールド", () => {
    it("should have all required fields", () => {
      const community = createMockCommunityEntity();

      expect(community.id).toBeDefined();
      expect(community.level).toBeDefined();
      expect(community.name).toBeDefined();
      expect(community.summary).toBeDefined();
      expect(community.memberEntityIds).toBeDefined();
      expect(community.memberCount).toBeDefined();
      expect(community.createdAt).toBeDefined();
      expect(community.updatedAt).toBeDefined();
    });
  });

  describe("level階層", () => {
    it("should accept level = 0 (lowest)", () => {
      const community = createMockCommunityEntity({ level: 0 });
      expect(community.level).toBe(0);
    });

    it("should accept level > 0 for higher levels", () => {
      const community = createMockCommunityEntity({
        level: 1,
        parentId: generateCommunityId(),
      });
      expect(community.level).toBe(1);
    });
  });

  describe("parentId階層制約", () => {
    it("should have parentId = null when level = 0", () => {
      const community = createMockCommunityEntity({ level: 0, parentId: null });
      expect(community.parentId).toBeNull();
    });

    it("should allow parentId when level > 0", () => {
      const parentId = generateCommunityId();
      const community = createMockCommunityEntity({ level: 1, parentId });
      expect(community.parentId).toBe(parentId);
    });
  });

  describe("memberEntityIdsとmemberCount", () => {
    it("should have matching memberCount and memberEntityIds.length", () => {
      const memberEntityIds = [generateEntityId(), generateEntityId()];
      const community = createMockCommunityEntity({
        memberEntityIds,
        memberCount: memberEntityIds.length,
      });

      expect(community.memberCount).toBe(community.memberEntityIds.length);
    });

    it("should have at least one member", () => {
      const community = createMockCommunityEntity();
      expect(community.memberEntityIds.length).toBeGreaterThanOrEqual(1);
      expect(community.memberCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe("CommunityEntityはWithMetadataを継承しない", () => {
    it("should not have metadata field", () => {
      const community = createMockCommunityEntity();
      // @ts-expect-error CommunityEntityにはmetadataプロパティがない
      expect(community.metadata).toBeUndefined();
    });
  });
});

// =============================================================================
// Value Objectsのテスト
// =============================================================================

describe("EntityMention", () => {
  const createMockEntityMention = (
    overrides: Partial<EntityMention> = {},
  ): EntityMention => ({
    startChar: 0,
    endChar: 10,
    surfaceForm: "test text",
    ...overrides,
  });

  describe("不変条件", () => {
    it("should have startChar >= 0", () => {
      const mention = createMockEntityMention({ startChar: 0 });
      expect(mention.startChar).toBeGreaterThanOrEqual(0);
    });

    it("should have endChar > startChar", () => {
      const mention = createMockEntityMention({ startChar: 5, endChar: 15 });
      expect(mention.endChar).toBeGreaterThan(mention.startChar);
    });

    it("should have non-empty surfaceForm", () => {
      const mention = createMockEntityMention({ surfaceForm: "React" });
      expect(mention.surfaceForm.length).toBeGreaterThan(0);
    });
  });

  describe("境界値テスト", () => {
    it("should accept startChar = 0", () => {
      const mention = createMockEntityMention({ startChar: 0, endChar: 1 });
      expect(mention.startChar).toBe(0);
    });

    it("should accept large endChar values", () => {
      const mention = createMockEntityMention({
        startChar: 0,
        endChar: 1000000,
      });
      expect(mention.endChar).toBe(1000000);
    });
  });
});

describe("RelationEvidence", () => {
  const createMockRelationEvidence = (
    overrides: Partial<RelationEvidence> = {},
  ): RelationEvidence => ({
    chunkId: createChunkId("550e8400-e29b-41d4-a716-446655440000"),
    excerpt: "This is evidence text",
    confidence: 0.9,
    ...overrides,
  });

  describe("confidence境界値テスト", () => {
    it("should accept confidence = 0.0 (minimum)", () => {
      const evidence = createMockRelationEvidence({ confidence: 0.0 });
      expect(evidence.confidence).toBe(0.0);
    });

    it("should accept confidence = 0.5 (middle)", () => {
      const evidence = createMockRelationEvidence({ confidence: 0.5 });
      expect(evidence.confidence).toBe(0.5);
    });

    it("should accept confidence = 1.0 (maximum)", () => {
      const evidence = createMockRelationEvidence({ confidence: 1.0 });
      expect(evidence.confidence).toBe(1.0);
    });
  });

  describe("excerpt", () => {
    it("should have non-empty excerpt", () => {
      const evidence = createMockRelationEvidence({
        excerpt: "Some text",
      });
      expect(evidence.excerpt.length).toBeGreaterThan(0);
    });
  });
});

describe("GraphStatistics", () => {
  const createMockGraphStatistics = (
    overrides: Partial<GraphStatistics> = {},
  ): GraphStatistics => ({
    entityCount: 100,
    relationCount: 200,
    communityCount: 10,
    averageDegree: 4.0,
    density: 0.04,
    connectedComponents: 1,
    ...overrides,
  });

  describe("カウント値", () => {
    it("should have non-negative entityCount", () => {
      const stats = createMockGraphStatistics({ entityCount: 0 });
      expect(stats.entityCount).toBeGreaterThanOrEqual(0);
    });

    it("should have non-negative relationCount", () => {
      const stats = createMockGraphStatistics({ relationCount: 0 });
      expect(stats.relationCount).toBeGreaterThanOrEqual(0);
    });

    it("should have non-negative communityCount", () => {
      const stats = createMockGraphStatistics({ communityCount: 0 });
      expect(stats.communityCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("density境界値テスト", () => {
    it("should accept density = 0.0 (sparse graph)", () => {
      const stats = createMockGraphStatistics({ density: 0.0 });
      expect(stats.density).toBe(0.0);
    });

    it("should accept density = 1.0 (complete graph)", () => {
      const stats = createMockGraphStatistics({ density: 1.0 });
      expect(stats.density).toBe(1.0);
    });
  });

  describe("connectedComponents", () => {
    it("should have at least 1 connected component", () => {
      const stats = createMockGraphStatistics({ connectedComponents: 1 });
      expect(stats.connectedComponents).toBeGreaterThanOrEqual(1);
    });
  });
});

// =============================================================================
// ChunkEntityRelationのテスト
// =============================================================================

describe("ChunkEntityRelation", () => {
  const createMockChunkEntityRelation = (
    overrides: Partial<ChunkEntityRelation> = {},
  ): ChunkEntityRelation => ({
    chunkId: createChunkId("550e8400-e29b-41d4-a716-446655440000"),
    entityId: generateEntityId(),
    mentionCount: 3,
    positions: [
      { startChar: 0, endChar: 5, surfaceForm: "React" },
      { startChar: 10, endChar: 15, surfaceForm: "React" },
      { startChar: 20, endChar: 25, surfaceForm: "React" },
    ],
    ...overrides,
  });

  describe("必須フィールド", () => {
    it("should have all required fields", () => {
      const relation = createMockChunkEntityRelation();

      expect(relation.chunkId).toBeDefined();
      expect(relation.entityId).toBeDefined();
      expect(relation.mentionCount).toBeDefined();
      expect(relation.positions).toBeDefined();
    });
  });

  describe("mentionCountとpositions.length", () => {
    it("should have matching mentionCount and positions.length", () => {
      const relation = createMockChunkEntityRelation();
      expect(relation.mentionCount).toBe(relation.positions.length);
    });

    it("should have at least one position", () => {
      const relation = createMockChunkEntityRelation();
      expect(relation.positions.length).toBeGreaterThanOrEqual(1);
      expect(relation.mentionCount).toBeGreaterThanOrEqual(1);
    });
  });
});

// =============================================================================
// 型の構造テスト（コンパイル時検証）
// =============================================================================

describe("型の構造テスト", () => {
  it("should satisfy type constraints at compile time", () => {
    // これらのテストはコンパイル時に型チェックされる
    // ランタイムではすべてtrueを返す

    // EntityType型が正しいリテラル型であることを確認
    const entityType: EntityType = "person";
    expect(entityType).toBe("person");

    // RelationType型が正しいリテラル型であることを確認
    const relationType: RelationType = "uses";
    expect(relationType).toBe("uses");
  });
});
