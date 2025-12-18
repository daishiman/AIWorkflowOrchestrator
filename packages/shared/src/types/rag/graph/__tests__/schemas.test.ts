/**
 * @file Knowledge Graph Zodスキーマのユニットテスト
 * @module @repo/shared/types/rag/graph/__tests__/schemas.test
 * @description TDD Red Phase - Zodバリデーションのテストケース
 *
 * テスト観点:
 * - 正常系バリデーション（すべてのフィールドが正しい）
 * - 異常系バリデーション（必須フィールド欠落、型不一致、範囲外）
 * - カスタムバリデーション（embedding次元数、自己ループ禁止、階層制約）
 * - 境界値テスト（min, max値）
 * - 型推論の正確性（z.infer<>）
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  // 列挙型スキーマ
  entityTypeSchema,
  relationTypeSchema,
  // Value Objectスキーマ
  entityMentionSchema,
  relationEvidenceSchema,
  graphStatisticsSchema,
  // Entityスキーマ
  entityEntitySchema,
  relationEntitySchema,
  communityEntitySchema,
  // 関連型スキーマ
  chunkEntityRelationSchema,
} from "../schemas";

// =============================================================================
// entityTypeSchemaのテスト
// =============================================================================

describe("entityTypeSchema", () => {
  describe("正常系", () => {
    it("should accept valid entity type 'person'", () => {
      const result = entityTypeSchema.safeParse("person");
      expect(result.success).toBe(true);
    });

    it("should accept all 52 entity types", () => {
      const validTypes = [
        // 1. 人物・組織カテゴリ (4種類)
        "person",
        "organization",
        "role",
        "team",
        // 2. 場所・時間カテゴリ (3種類)
        "location",
        "date",
        "event",
        // 3. ビジネス・経営カテゴリ (9種類)
        "company",
        "product",
        "service",
        "brand",
        "strategy",
        "metric",
        "business_process",
        "market",
        "customer",
        // 4. 技術全般カテゴリ (5種類)
        "technology",
        "tool",
        "method",
        "standard",
        "protocol",
        // 5. コード・ソフトウェアカテゴリ (7種類)
        "programming_language",
        "framework",
        "library",
        "api",
        "function",
        "class",
        "module",
        // 6. 抽象概念カテゴリ (5種類)
        "concept",
        "theory",
        "principle",
        "pattern",
        "model",
        // 7. ドキュメント構造カテゴリ (5種類)
        "document",
        "chapter",
        "section",
        "paragraph",
        "heading",
        // 8. ドキュメント要素カテゴリ (9種類)
        "keyword",
        "summary",
        "figure",
        "table",
        "list",
        "quote",
        "code_snippet",
        "formula",
        "example",
        // 9. メディアカテゴリ (4種類)
        "image",
        "video",
        "audio",
        "diagram",
        // 10. その他カテゴリ (1種類)
        "other",
      ];

      expect(validTypes).toHaveLength(52);

      validTypes.forEach((type) => {
        const result = entityTypeSchema.safeParse(type);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("異常系", () => {
    it("should reject invalid entity type", () => {
      const result = entityTypeSchema.safeParse("invalid_type");
      expect(result.success).toBe(false);
    });

    it("should reject number", () => {
      const result = entityTypeSchema.safeParse(123);
      expect(result.success).toBe(false);
    });

    it("should reject null", () => {
      const result = entityTypeSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it("should reject empty string", () => {
      const result = entityTypeSchema.safeParse("");
      expect(result.success).toBe(false);
    });
  });
});

// =============================================================================
// relationTypeSchemaのテスト
// =============================================================================

describe("relationTypeSchema", () => {
  describe("正常系", () => {
    it("should accept valid relation type 'uses'", () => {
      const result = relationTypeSchema.safeParse("uses");
      expect(result.success).toBe(true);
    });

    it("should accept all 23 relation types", () => {
      const validTypes = [
        // 汎用関係 (4種類)
        "related_to",
        "part_of",
        "has_part",
        "belongs_to",
        // 時間的関係 (3種類)
        "preceded_by",
        "followed_by",
        "concurrent_with",
        // 技術的関係 (7種類)
        "uses",
        "used_by",
        "implements",
        "extends",
        "depends_on",
        "calls",
        "imports",
        // 階層関係 (2種類)
        "parent_of",
        "child_of",
        // 参照関係 (4種類)
        "references",
        "referenced_by",
        "defines",
        "defined_by",
        // 人物関係 (3種類)
        "authored_by",
        "works_for",
        "collaborates_with",
      ];

      expect(validTypes).toHaveLength(23);

      validTypes.forEach((type) => {
        const result = relationTypeSchema.safeParse(type);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("異常系", () => {
    it("should reject invalid relation type", () => {
      const result = relationTypeSchema.safeParse("invalid_relation");
      expect(result.success).toBe(false);
    });
  });
});

// =============================================================================
// entityMentionSchemaのテスト
// =============================================================================

describe("entityMentionSchema", () => {
  describe("正常系", () => {
    it("should accept valid entity mention", () => {
      const mention = {
        startChar: 0,
        endChar: 10,
        surfaceForm: "React",
      };

      const result = entityMentionSchema.safeParse(mention);
      expect(result.success).toBe(true);
    });
  });

  describe("カスタムバリデーション: endChar > startChar", () => {
    it("should reject when endChar <= startChar", () => {
      const mention = {
        startChar: 10,
        endChar: 10, // 同じ値
        surfaceForm: "Test",
      };

      const result = entityMentionSchema.safeParse(mention);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("greater than");
      }
    });

    it("should reject when endChar < startChar", () => {
      const mention = {
        startChar: 10,
        endChar: 5, // startCharより小さい
        surfaceForm: "Test",
      };

      const result = entityMentionSchema.safeParse(mention);
      expect(result.success).toBe(false);
    });
  });

  describe("境界値テスト", () => {
    it("should accept startChar = 0", () => {
      const mention = {
        startChar: 0,
        endChar: 1,
        surfaceForm: "a",
      };

      const result = entityMentionSchema.safeParse(mention);
      expect(result.success).toBe(true);
    });

    it("should reject negative startChar", () => {
      const mention = {
        startChar: -1,
        endChar: 10,
        surfaceForm: "Test",
      };

      const result = entityMentionSchema.safeParse(mention);
      expect(result.success).toBe(false);
    });

    it("should reject empty surfaceForm", () => {
      const mention = {
        startChar: 0,
        endChar: 10,
        surfaceForm: "",
      };

      const result = entityMentionSchema.safeParse(mention);
      expect(result.success).toBe(false);
    });
  });
});

// =============================================================================
// relationEvidenceSchemaのテスト
// =============================================================================

describe("relationEvidenceSchema", () => {
  describe("正常系", () => {
    it("should accept valid relation evidence", () => {
      const evidence = {
        chunkId: "550e8400-e29b-41d4-a716-446655440000",
        excerpt: "This is evidence text",
        confidence: 0.9,
      };

      const result = relationEvidenceSchema.safeParse(evidence);
      expect(result.success).toBe(true);
    });
  });

  describe("confidence境界値テスト", () => {
    it("should accept confidence = 0.0", () => {
      const evidence = {
        chunkId: "550e8400-e29b-41d4-a716-446655440000",
        excerpt: "Text",
        confidence: 0.0,
      };

      const result = relationEvidenceSchema.safeParse(evidence);
      expect(result.success).toBe(true);
    });

    it("should accept confidence = 1.0", () => {
      const evidence = {
        chunkId: "550e8400-e29b-41d4-a716-446655440000",
        excerpt: "Text",
        confidence: 1.0,
      };

      const result = relationEvidenceSchema.safeParse(evidence);
      expect(result.success).toBe(true);
    });

    it("should reject confidence > 1.0", () => {
      const evidence = {
        chunkId: "550e8400-e29b-41d4-a716-446655440000",
        excerpt: "Text",
        confidence: 1.5,
      };

      const result = relationEvidenceSchema.safeParse(evidence);
      expect(result.success).toBe(false);
    });

    it("should reject negative confidence", () => {
      const evidence = {
        chunkId: "550e8400-e29b-41d4-a716-446655440000",
        excerpt: "Text",
        confidence: -0.1,
      };

      const result = relationEvidenceSchema.safeParse(evidence);
      expect(result.success).toBe(false);
    });
  });

  describe("excerpt文字数制約", () => {
    it("should reject empty excerpt", () => {
      const evidence = {
        chunkId: "550e8400-e29b-41d4-a716-446655440000",
        excerpt: "",
        confidence: 0.9,
      };

      const result = relationEvidenceSchema.safeParse(evidence);
      expect(result.success).toBe(false);
    });

    it("should accept 500 characters (max)", () => {
      const evidence = {
        chunkId: "550e8400-e29b-41d4-a716-446655440000",
        excerpt: "a".repeat(500),
        confidence: 0.9,
      };

      const result = relationEvidenceSchema.safeParse(evidence);
      expect(result.success).toBe(true);
    });

    it("should reject 501 characters (over max)", () => {
      const evidence = {
        chunkId: "550e8400-e29b-41d4-a716-446655440000",
        excerpt: "a".repeat(501),
        confidence: 0.9,
      };

      const result = relationEvidenceSchema.safeParse(evidence);
      expect(result.success).toBe(false);
    });
  });

  describe("chunkId UUID形式", () => {
    it("should accept valid UUID", () => {
      const evidence = {
        chunkId: "550e8400-e29b-41d4-a716-446655440000",
        excerpt: "Text",
        confidence: 0.9,
      };

      const result = relationEvidenceSchema.safeParse(evidence);
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID", () => {
      const evidence = {
        chunkId: "invalid-uuid",
        excerpt: "Text",
        confidence: 0.9,
      };

      const result = relationEvidenceSchema.safeParse(evidence);
      expect(result.success).toBe(false);
    });
  });
});

// =============================================================================
// graphStatisticsSchemaのテスト
// =============================================================================

describe("graphStatisticsSchema", () => {
  describe("正常系", () => {
    it("should accept valid graph statistics", () => {
      const stats = {
        entityCount: 100,
        relationCount: 200,
        communityCount: 10,
        averageDegree: 4.0,
        density: 0.04,
        connectedComponents: 1,
      };

      const result = graphStatisticsSchema.safeParse(stats);
      expect(result.success).toBe(true);
    });
  });

  describe("カウント値の境界値テスト", () => {
    it("should accept entityCount = 0", () => {
      const stats = {
        entityCount: 0,
        relationCount: 0,
        communityCount: 0,
        averageDegree: 0,
        density: 0,
        connectedComponents: 1,
      };

      const result = graphStatisticsSchema.safeParse(stats);
      expect(result.success).toBe(true);
    });

    it("should reject negative entityCount", () => {
      const stats = {
        entityCount: -1,
        relationCount: 0,
        communityCount: 0,
        averageDegree: 0,
        density: 0,
        connectedComponents: 1,
      };

      const result = graphStatisticsSchema.safeParse(stats);
      expect(result.success).toBe(false);
    });
  });

  describe("density境界値テスト", () => {
    it("should accept density = 0.0", () => {
      const stats = {
        entityCount: 10,
        relationCount: 0,
        communityCount: 0,
        averageDegree: 0,
        density: 0.0,
        connectedComponents: 1,
      };

      const result = graphStatisticsSchema.safeParse(stats);
      expect(result.success).toBe(true);
    });

    it("should accept density = 1.0", () => {
      const stats = {
        entityCount: 10,
        relationCount: 45,
        communityCount: 0,
        averageDegree: 9,
        density: 1.0,
        connectedComponents: 1,
      };

      const result = graphStatisticsSchema.safeParse(stats);
      expect(result.success).toBe(true);
    });

    it("should reject density > 1.0", () => {
      const stats = {
        entityCount: 10,
        relationCount: 50,
        communityCount: 0,
        averageDegree: 10,
        density: 1.1,
        connectedComponents: 1,
      };

      const result = graphStatisticsSchema.safeParse(stats);
      expect(result.success).toBe(false);
    });

    it("should reject negative density", () => {
      const stats = {
        entityCount: 10,
        relationCount: 0,
        communityCount: 0,
        averageDegree: 0,
        density: -0.1,
        connectedComponents: 1,
      };

      const result = graphStatisticsSchema.safeParse(stats);
      expect(result.success).toBe(false);
    });
  });

  describe("connectedComponents", () => {
    it("should accept connectedComponents = 1", () => {
      const stats = {
        entityCount: 10,
        relationCount: 10,
        communityCount: 0,
        averageDegree: 2,
        density: 0.1,
        connectedComponents: 1,
      };

      const result = graphStatisticsSchema.safeParse(stats);
      expect(result.success).toBe(true);
    });

    it("should reject connectedComponents = 0", () => {
      const stats = {
        entityCount: 10,
        relationCount: 10,
        communityCount: 0,
        averageDegree: 2,
        density: 0.1,
        connectedComponents: 0,
      };

      const result = graphStatisticsSchema.safeParse(stats);
      expect(result.success).toBe(false);
    });
  });
});

// =============================================================================
// entityEntitySchemaのテスト
// =============================================================================

describe("entityEntitySchema", () => {
  const createValidEntity = (overrides: Record<string, unknown> = {}) => ({
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "React",
    normalizedName: "react",
    type: "framework",
    description: "A JavaScript library",
    aliases: ["React.js", "ReactJS"],
    embedding: null,
    importance: 0.8,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe("正常系", () => {
    it("should accept valid entity with all fields", () => {
      const entity = createValidEntity();
      const result = entityEntitySchema.safeParse(entity);
      expect(result.success).toBe(true);
    });

    it("should accept entity with null description", () => {
      const entity = createValidEntity({ description: null });
      const result = entityEntitySchema.safeParse(entity);
      expect(result.success).toBe(true);
    });

    it("should accept entity with null embedding", () => {
      const entity = createValidEntity({ embedding: null });
      const result = entityEntitySchema.safeParse(entity);
      expect(result.success).toBe(true);
    });

    it("should accept empty aliases array", () => {
      const entity = createValidEntity({ aliases: [] });
      const result = entityEntitySchema.safeParse(entity);
      expect(result.success).toBe(true);
    });
  });

  describe("異常系: 必須フィールド欠落", () => {
    it("should reject when name is missing", () => {
      const entity = createValidEntity();
      delete (entity as { name?: string }).name;

      const result = entityEntitySchema.safeParse(entity);
      expect(result.success).toBe(false);
    });

    it("should reject when type is missing", () => {
      const entity = createValidEntity();
      delete (entity as { type?: string }).type;

      const result = entityEntitySchema.safeParse(entity);
      expect(result.success).toBe(false);
    });
  });

  describe("name文字数制約", () => {
    it("should reject empty name", () => {
      const entity = createValidEntity({ name: "" });
      const result = entityEntitySchema.safeParse(entity);
      expect(result.success).toBe(false);
    });

    it("should accept 255 characters (max)", () => {
      const entity = createValidEntity({ name: "a".repeat(255) });
      const result = entityEntitySchema.safeParse(entity);
      expect(result.success).toBe(true);
    });

    it("should reject 256 characters (over max)", () => {
      const entity = createValidEntity({ name: "a".repeat(256) });
      const result = entityEntitySchema.safeParse(entity);
      expect(result.success).toBe(false);
    });
  });

  describe("importance境界値テスト", () => {
    it("should accept importance = 0.0", () => {
      const entity = createValidEntity({ importance: 0.0 });
      const result = entityEntitySchema.safeParse(entity);
      expect(result.success).toBe(true);
    });

    it("should accept importance = 1.0", () => {
      const entity = createValidEntity({ importance: 1.0 });
      const result = entityEntitySchema.safeParse(entity);
      expect(result.success).toBe(true);
    });

    it("should reject importance > 1.0", () => {
      const entity = createValidEntity({ importance: 1.1 });
      const result = entityEntitySchema.safeParse(entity);
      expect(result.success).toBe(false);
    });

    it("should reject negative importance", () => {
      const entity = createValidEntity({ importance: -0.1 });
      const result = entityEntitySchema.safeParse(entity);
      expect(result.success).toBe(false);
    });
  });

  describe("embedding次元数チェック", () => {
    it("should accept 512-dimensional embedding", () => {
      const entity = createValidEntity({ embedding: new Array(512).fill(0.1) });
      const result = entityEntitySchema.safeParse(entity);
      expect(result.success).toBe(true);
    });

    it("should accept 768-dimensional embedding", () => {
      const entity = createValidEntity({ embedding: new Array(768).fill(0.1) });
      const result = entityEntitySchema.safeParse(entity);
      expect(result.success).toBe(true);
    });

    it("should accept 1024-dimensional embedding", () => {
      const entity = createValidEntity({
        embedding: new Array(1024).fill(0.1),
      });
      const result = entityEntitySchema.safeParse(entity);
      expect(result.success).toBe(true);
    });

    it("should accept 1536-dimensional embedding", () => {
      const entity = createValidEntity({
        embedding: new Array(1536).fill(0.1),
      });
      const result = entityEntitySchema.safeParse(entity);
      expect(result.success).toBe(true);
    });

    it("should reject invalid dimension (100)", () => {
      const entity = createValidEntity({ embedding: new Array(100).fill(0.1) });
      const result = entityEntitySchema.safeParse(entity);
      expect(result.success).toBe(false);
    });

    it("should reject empty embedding array", () => {
      const entity = createValidEntity({ embedding: [] });
      const result = entityEntitySchema.safeParse(entity);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("non-empty");
      }
    });
  });
});

// =============================================================================
// relationEntitySchemaのテスト
// =============================================================================

describe("relationEntitySchema", () => {
  const createValidRelation = (overrides: Record<string, unknown> = {}) => ({
    id: "650e8400-e29b-41d4-a716-446655440001",
    sourceId: "550e8400-e29b-41d4-a716-446655440000",
    targetId: "550e8400-e29b-41d4-a716-446655440002",
    type: "uses",
    description: "Next.js uses React",
    weight: 0.9,
    bidirectional: false,
    evidence: [
      {
        chunkId: "750e8400-e29b-41d4-a716-446655440003",
        excerpt: "Next.js is built on top of React",
        confidence: 0.95,
      },
    ],
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe("正常系", () => {
    it("should accept valid relation", () => {
      const relation = createValidRelation();
      const result = relationEntitySchema.safeParse(relation);
      expect(result.success).toBe(true);
    });
  });

  describe("カスタムバリデーション: 自己ループ禁止", () => {
    it("should reject when sourceId === targetId", () => {
      const sameId = "550e8400-e29b-41d4-a716-446655440000";
      const relation = createValidRelation({
        sourceId: sameId,
        targetId: sameId,
      });

      const result = relationEntitySchema.safeParse(relation);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("self-loops");
      }
    });
  });

  describe("evidence最小数", () => {
    it("should accept single evidence", () => {
      const relation = createValidRelation();
      const result = relationEntitySchema.safeParse(relation);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.evidence).toHaveLength(1);
      }
    });

    it("should reject empty evidence array", () => {
      const relation = createValidRelation({ evidence: [] });
      const result = relationEntitySchema.safeParse(relation);
      expect(result.success).toBe(false);
    });
  });

  describe("weight境界値テスト", () => {
    it("should accept weight = 0.0", () => {
      const relation = createValidRelation({ weight: 0.0 });
      const result = relationEntitySchema.safeParse(relation);
      expect(result.success).toBe(true);
    });

    it("should accept weight = 1.0", () => {
      const relation = createValidRelation({ weight: 1.0 });
      const result = relationEntitySchema.safeParse(relation);
      expect(result.success).toBe(true);
    });

    it("should reject weight > 1.0", () => {
      const relation = createValidRelation({ weight: 1.1 });
      const result = relationEntitySchema.safeParse(relation);
      expect(result.success).toBe(false);
    });

    it("should reject negative weight", () => {
      const relation = createValidRelation({ weight: -0.1 });
      const result = relationEntitySchema.safeParse(relation);
      expect(result.success).toBe(false);
    });
  });
});

// =============================================================================
// communityEntitySchemaのテスト
// =============================================================================

describe("communityEntitySchema", () => {
  const createValidCommunity = (overrides: Record<string, unknown> = {}) => ({
    id: "850e8400-e29b-41d4-a716-446655440004",
    level: 0,
    parentId: null,
    name: "React Ecosystem",
    summary: "A community about React and related frameworks",
    memberEntityIds: [
      "550e8400-e29b-41d4-a716-446655440000",
      "550e8400-e29b-41d4-a716-446655440001",
    ],
    memberCount: 2,
    embedding: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  describe("正常系", () => {
    it("should accept valid community", () => {
      const community = createValidCommunity();
      const result = communityEntitySchema.safeParse(community);
      expect(result.success).toBe(true);
    });
  });

  describe("カスタムバリデーション: memberCountとmemberEntityIds.length", () => {
    it("should reject when memberCount != memberEntityIds.length", () => {
      const community = createValidCommunity({
        memberCount: 5, // 実際は2個
      });

      const result = communityEntitySchema.safeParse(community);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("memberCount");
      }
    });
  });

  describe("カスタムバリデーション: level = 0 → parentId = null", () => {
    it("should accept level = 0 with parentId = null", () => {
      const community = createValidCommunity({ level: 0, parentId: null });
      const result = communityEntitySchema.safeParse(community);
      expect(result.success).toBe(true);
    });

    it("should accept level > 0 with parentId", () => {
      const community = createValidCommunity({
        level: 1,
        parentId: "850e8400-e29b-41d4-a716-446655440005",
      });
      const result = communityEntitySchema.safeParse(community);
      expect(result.success).toBe(true);
    });

    // Note: level = 0 but parentId != null のケースは設計上禁止
    // スキーマのカスタムバリデーションで検証される
  });

  describe("memberEntityIds最小数", () => {
    it("should accept single member", () => {
      const community = createValidCommunity({
        memberEntityIds: ["550e8400-e29b-41d4-a716-446655440000"],
        memberCount: 1,
      });
      const result = communityEntitySchema.safeParse(community);
      expect(result.success).toBe(true);
    });

    it("should reject empty memberEntityIds", () => {
      const community = createValidCommunity({
        memberEntityIds: [],
        memberCount: 0,
      });
      const result = communityEntitySchema.safeParse(community);
      expect(result.success).toBe(false);
    });
  });

  describe("embedding次元数チェック", () => {
    it("should accept 512-dimensional embedding", () => {
      const community = createValidCommunity({
        embedding: new Array(512).fill(0.1),
      });
      const result = communityEntitySchema.safeParse(community);
      expect(result.success).toBe(true);
    });

    it("should reject invalid dimension (100)", () => {
      const community = createValidCommunity({
        embedding: new Array(100).fill(0.1),
      });
      const result = communityEntitySchema.safeParse(community);
      expect(result.success).toBe(false);
    });

    it("should reject empty embedding array", () => {
      const community = createValidCommunity({ embedding: [] });
      const result = communityEntitySchema.safeParse(community);
      expect(result.success).toBe(false);
    });
  });

  describe("CommunityEntityにはmetadataフィールドなし", () => {
    it("should reject when metadata field is present", () => {
      const community = createValidCommunity({ metadata: { key: "value" } });
      // 厳格モードではunknownフィールドが拒否される
      const result = communityEntitySchema.strict().safeParse(community);
      expect(result.success).toBe(false);
    });
  });
});

// =============================================================================
// chunkEntityRelationSchemaのテスト
// =============================================================================

describe("chunkEntityRelationSchema", () => {
  const createValidChunkEntityRelation = (
    overrides: Record<string, unknown> = {},
  ) => ({
    chunkId: "750e8400-e29b-41d4-a716-446655440003",
    entityId: "550e8400-e29b-41d4-a716-446655440000",
    mentionCount: 2,
    positions: [
      { startChar: 0, endChar: 5, surfaceForm: "React" },
      { startChar: 10, endChar: 15, surfaceForm: "React" },
    ],
    ...overrides,
  });

  describe("正常系", () => {
    it("should accept valid chunk-entity relation", () => {
      const relation = createValidChunkEntityRelation();
      const result = chunkEntityRelationSchema.safeParse(relation);
      expect(result.success).toBe(true);
    });
  });

  describe("カスタムバリデーション: mentionCount === positions.length", () => {
    it("should reject when mentionCount != positions.length", () => {
      const relation = createValidChunkEntityRelation({
        mentionCount: 5, // 実際は2個
      });

      const result = chunkEntityRelationSchema.safeParse(relation);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("mentionCount");
      }
    });
  });

  describe("positions最小数", () => {
    it("should accept single position", () => {
      const relation = createValidChunkEntityRelation({
        positions: [{ startChar: 0, endChar: 5, surfaceForm: "React" }],
        mentionCount: 1,
      });
      const result = chunkEntityRelationSchema.safeParse(relation);
      expect(result.success).toBe(true);
    });

    it("should reject empty positions array", () => {
      const relation = createValidChunkEntityRelation({
        positions: [],
        mentionCount: 0,
      });
      const result = chunkEntityRelationSchema.safeParse(relation);
      expect(result.success).toBe(false);
    });
  });
});

// =============================================================================
// 型推論の検証
// =============================================================================

describe("型推論", () => {
  it("should infer correct type from entityEntitySchema", () => {
    type InferredEntity = z.infer<typeof entityEntitySchema>;

    // コンパイル時にこの型が正しいことを確認
    const entity: InferredEntity = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "React",
      normalizedName: "react",
      type: "framework",
      description: null,
      aliases: [],
      embedding: null,
      importance: 0.8,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(entity.name).toBe("React");
  });

  it("should infer correct type from relationEntitySchema", () => {
    type InferredRelation = z.infer<typeof relationEntitySchema>;

    const relation: InferredRelation = {
      id: "650e8400-e29b-41d4-a716-446655440001",
      sourceId: "550e8400-e29b-41d4-a716-446655440000",
      targetId: "550e8400-e29b-41d4-a716-446655440002",
      type: "uses",
      description: null,
      weight: 0.9,
      bidirectional: false,
      evidence: [
        {
          chunkId: "750e8400-e29b-41d4-a716-446655440003",
          excerpt: "evidence",
          confidence: 0.9,
        },
      ],
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(relation.type).toBe("uses");
  });
});
