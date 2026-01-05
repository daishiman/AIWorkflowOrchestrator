/**
 * @file Knowledge Graphユーティリティ関数のユニットテスト
 * @module @repo/shared/types/rag/graph/__tests__/utils.test
 * @description TDD Red Phase - ユーティリティ関数のテストケース
 *
 * テスト観点:
 * - normalizeEntityName（正規化ロジック、境界値、エッジケース）
 * - getInverseRelationType（逆関係マップの網羅性）
 * - calculateEntityImportance（PageRankアルゴリズム、境界値）
 * - generateCommunityName（命名ロジック、ソート、フォーマット）
 * - getEntityTypeCategory（カテゴリマップの網羅性）
 * - calculateGraphDensity（数式の正確性、境界値）
 */

import { describe, it, expect } from "vitest";
import {
  normalizeEntityName,
  getInverseRelationType,
  calculateEntityImportance,
  generateCommunityName,
  getEntityTypeCategory,
  calculateGraphDensity,
} from "../utils";
import type { EntityEntity, RelationEntity } from "../types";
import { EntityTypes, RelationTypes } from "../types";
import { generateEntityId, generateRelationId } from "../../branded";

// =============================================================================
// normalizeEntityNameのテスト
// =============================================================================

describe("normalizeEntityName", () => {
  describe("正常系", () => {
    it("should convert to lowercase", () => {
      expect(normalizeEntityName("React")).toBe("react");
      expect(normalizeEntityName("TYPESCRIPT")).toBe("typescript");
    });

    it("should remove special characters", () => {
      expect(normalizeEntityName("React.js")).toBe("reactjs");
      expect(normalizeEntityName("Next.js 15")).toBe("nextjs 15");
      expect(normalizeEntityName("C++")).toBe("c");
    });

    it("should normalize whitespace", () => {
      expect(normalizeEntityName("Claude  3.5  Sonnet")).toBe(
        "claude 3 5 sonnet",
      );
      expect(normalizeEntityName("  TypeScript  ")).toBe("typescript");
    });

    it("should preserve hyphens", () => {
      expect(normalizeEntityName("API-Gateway")).toBe("api-gateway");
      expect(normalizeEntityName("Model-View-Controller")).toBe(
        "model-view-controller",
      );
    });

    it("should preserve non-ASCII characters", () => {
      expect(normalizeEntityName("日本語テスト")).toBe("日本語テスト");
      expect(normalizeEntityName("TypeScript 開発")).toBe("typescript 開発");
    });
  });

  describe("境界値テスト", () => {
    it("should handle empty string", () => {
      expect(normalizeEntityName("")).toBe("");
    });

    it("should handle single character", () => {
      expect(normalizeEntityName("A")).toBe("a");
    });

    it("should handle numbers only", () => {
      expect(normalizeEntityName("123")).toBe("123");
      expect(normalizeEntityName("2024")).toBe("2024");
    });

    it("should handle whitespace only", () => {
      expect(normalizeEntityName("   ")).toBe("");
    });

    it("should handle special characters only", () => {
      expect(normalizeEntityName("...")).toBe("");
      expect(normalizeEntityName("!!!")).toBe("");
    });
  });

  describe("エッジケース", () => {
    it("should remove underscores", () => {
      expect(normalizeEntityName("___test___")).toBe("test");
    });

    it("should handle mixed case with numbers", () => {
      expect(normalizeEntityName("GPT-4")).toBe("gpt-4");
      expect(normalizeEntityName("Claude3.5")).toBe("claude3 5"); // 数字間ピリオドは空白に変換
    });

    it("should be idempotent", () => {
      const input = "React.js";
      const normalized = normalizeEntityName(input);
      expect(normalizeEntityName(normalized)).toBe(normalized);
    });
  });
});

// =============================================================================
// getInverseRelationTypeのテスト
// =============================================================================

describe("getInverseRelationType", () => {
  describe("技術的関係の逆関係", () => {
    it("should return 'used_by' for 'uses'", () => {
      expect(getInverseRelationType(RelationTypes.USES)).toBe(
        RelationTypes.USED_BY,
      );
    });

    it("should return 'uses' for 'used_by'", () => {
      expect(getInverseRelationType(RelationTypes.USED_BY)).toBe(
        RelationTypes.USES,
      );
    });
  });

  describe("汎用関係の逆関係", () => {
    it("should return 'has_part' for 'part_of'", () => {
      expect(getInverseRelationType(RelationTypes.PART_OF)).toBe(
        RelationTypes.HAS_PART,
      );
    });

    it("should return 'part_of' for 'has_part'", () => {
      expect(getInverseRelationType(RelationTypes.HAS_PART)).toBe(
        RelationTypes.PART_OF,
      );
    });

    it("should return 'has_part' for 'belongs_to'", () => {
      expect(getInverseRelationType(RelationTypes.BELONGS_TO)).toBe(
        RelationTypes.HAS_PART,
      );
    });
  });

  describe("時間的関係の逆関係", () => {
    it("should return 'followed_by' for 'preceded_by'", () => {
      expect(getInverseRelationType(RelationTypes.PRECEDED_BY)).toBe(
        RelationTypes.FOLLOWED_BY,
      );
    });

    it("should return 'preceded_by' for 'followed_by'", () => {
      expect(getInverseRelationType(RelationTypes.FOLLOWED_BY)).toBe(
        RelationTypes.PRECEDED_BY,
      );
    });
  });

  describe("階層関係の逆関係", () => {
    it("should return 'child_of' for 'parent_of'", () => {
      expect(getInverseRelationType(RelationTypes.PARENT_OF)).toBe(
        RelationTypes.CHILD_OF,
      );
    });

    it("should return 'parent_of' for 'child_of'", () => {
      expect(getInverseRelationType(RelationTypes.CHILD_OF)).toBe(
        RelationTypes.PARENT_OF,
      );
    });
  });

  describe("参照関係の逆関係", () => {
    it("should return 'referenced_by' for 'references'", () => {
      expect(getInverseRelationType(RelationTypes.REFERENCES)).toBe(
        RelationTypes.REFERENCED_BY,
      );
    });

    it("should return 'references' for 'referenced_by'", () => {
      expect(getInverseRelationType(RelationTypes.REFERENCED_BY)).toBe(
        RelationTypes.REFERENCES,
      );
    });

    it("should return 'defined_by' for 'defines'", () => {
      expect(getInverseRelationType(RelationTypes.DEFINES)).toBe(
        RelationTypes.DEFINED_BY,
      );
    });

    it("should return 'defines' for 'defined_by'", () => {
      expect(getInverseRelationType(RelationTypes.DEFINED_BY)).toBe(
        RelationTypes.DEFINES,
      );
    });
  });

  describe("双方向関係（逆関係なし）", () => {
    it("should return null for 'related_to'", () => {
      expect(getInverseRelationType(RelationTypes.RELATED_TO)).toBeNull();
    });

    it("should return null for 'concurrent_with'", () => {
      expect(getInverseRelationType(RelationTypes.CONCURRENT_WITH)).toBeNull();
    });

    it("should return null for 'collaborates_with'", () => {
      expect(
        getInverseRelationType(RelationTypes.COLLABORATES_WITH),
      ).toBeNull();
    });
  });

  describe("単方向関係（逆関係なし）", () => {
    it("should return null for 'implements'", () => {
      expect(getInverseRelationType(RelationTypes.IMPLEMENTS)).toBeNull();
    });

    it("should return null for 'extends'", () => {
      expect(getInverseRelationType(RelationTypes.EXTENDS)).toBeNull();
    });

    it("should return null for 'depends_on'", () => {
      expect(getInverseRelationType(RelationTypes.DEPENDS_ON)).toBeNull();
    });

    it("should return null for 'calls'", () => {
      expect(getInverseRelationType(RelationTypes.CALLS)).toBeNull();
    });

    it("should return null for 'imports'", () => {
      expect(getInverseRelationType(RelationTypes.IMPORTS)).toBeNull();
    });

    it("should return null for 'authored_by'", () => {
      expect(getInverseRelationType(RelationTypes.AUTHORED_BY)).toBeNull();
    });

    it("should return null for 'works_for'", () => {
      expect(getInverseRelationType(RelationTypes.WORKS_FOR)).toBeNull();
    });
  });

  describe("逆関係の対称性（双方向）", () => {
    it("should satisfy: inverse(inverse(type)) === type", () => {
      const symmetricTypes = [
        RelationTypes.USES,
        RelationTypes.USED_BY,
        RelationTypes.PART_OF,
        RelationTypes.HAS_PART,
        RelationTypes.PARENT_OF,
        RelationTypes.CHILD_OF,
        RelationTypes.PRECEDED_BY,
        RelationTypes.FOLLOWED_BY,
        RelationTypes.REFERENCES,
        RelationTypes.REFERENCED_BY,
        RelationTypes.DEFINES,
        RelationTypes.DEFINED_BY,
      ];

      symmetricTypes.forEach((type) => {
        const inverse = getInverseRelationType(type);
        if (inverse) {
          const inverseOfInverse = getInverseRelationType(inverse);
          expect(inverseOfInverse).toBe(type);
        }
      });
    });
  });
});

// =============================================================================
// calculateEntityImportanceのテスト
// =============================================================================

describe("calculateEntityImportance", () => {
  const createMockRelation = (
    sourceId: string,
    targetId: string,
  ): RelationEntity =>
    ({
      id: generateRelationId(),
      sourceId,
      targetId,
      type: "uses",
      description: null,
      weight: 0.5,
      bidirectional: false,
      evidence: [],
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    }) as RelationEntity;

  describe("孤立エンティティ", () => {
    it("should return 0.0 for entity with no relations", () => {
      const entityId = generateEntityId();
      const relations: RelationEntity[] = [];

      const importance = calculateEntityImportance(entityId, relations);
      expect(importance).toBe(0.0);
    });
  });

  describe("出次数のみ", () => {
    it("should calculate score for outbound relations only", () => {
      const entityId = generateEntityId();
      const targetId1 = generateEntityId();
      const targetId2 = generateEntityId();

      const relations = [
        createMockRelation(entityId, targetId1),
        createMockRelation(entityId, targetId2),
      ];

      const importance = calculateEntityImportance(entityId, relations);
      // 出次数2, 入次数0 → baseScore = 2/20 = 0.1, bonus = 0 → 0.1
      expect(importance).toBeCloseTo(0.1, 2);
    });
  });

  describe("入次数のみ", () => {
    it("should calculate score with inbound bonus", () => {
      const entityId = generateEntityId();
      const sourceId1 = generateEntityId();
      const sourceId2 = generateEntityId();

      const relations = [
        createMockRelation(sourceId1, entityId),
        createMockRelation(sourceId2, entityId),
      ];

      const importance = calculateEntityImportance(entityId, relations);
      // 出次数0, 入次数2 → baseScore = 2/20 = 0.1, bonus = 2/10 = 0.2 → 0.3
      expect(importance).toBeCloseTo(0.3, 2);
    });
  });

  describe("出入次数の組み合わせ", () => {
    it("should calculate score for mixed relations", () => {
      const entityId = generateEntityId();
      const other1 = generateEntityId();
      const other2 = generateEntityId();

      const relations = [
        createMockRelation(entityId, other1), // 出次数
        createMockRelation(other2, entityId), // 入次数
      ];

      const importance = calculateEntityImportance(entityId, relations);
      // 出次数1, 入次数1 → baseScore = 2/20 = 0.1, bonus = 1/10 = 0.1 → 0.2
      expect(importance).toBeCloseTo(0.2, 2);
    });
  });

  describe("境界値: 上限到達", () => {
    it("should cap at 1.0 with 20 total connections", () => {
      const entityId = generateEntityId();
      const relations: RelationEntity[] = [];

      // 20個の出次数を作成
      for (let i = 0; i < 20; i++) {
        relations.push(createMockRelation(entityId, generateEntityId()));
      }

      const importance = calculateEntityImportance(entityId, relations);
      // 出次数20 → baseScore = 20/20 = 1.0, bonus = 0 → 1.0
      expect(importance).toBe(1.0);
    });

    it("should cap at 1.0 with high inbound connections", () => {
      const entityId = generateEntityId();
      const relations: RelationEntity[] = [];

      // 10個の入次数を作成
      for (let i = 0; i < 10; i++) {
        relations.push(createMockRelation(generateEntityId(), entityId));
      }

      const importance = calculateEntityImportance(entityId, relations);
      // 入次数10 → baseScore = 10/20 = 0.5, bonus = 10/10 = 0.2 → 0.7
      expect(importance).toBeCloseTo(0.7, 2);
    });

    it("should not exceed 1.0", () => {
      const entityId = generateEntityId();
      const relations: RelationEntity[] = [];

      // 100個の関係を作成（過剰）
      for (let i = 0; i < 50; i++) {
        relations.push(createMockRelation(entityId, generateEntityId()));
        relations.push(createMockRelation(generateEntityId(), entityId));
      }

      const importance = calculateEntityImportance(entityId, relations);
      expect(importance).toBeLessThanOrEqual(1.0);
      expect(importance).toBe(1.0);
    });
  });

  describe("エッジケース", () => {
    it("should handle empty relations array", () => {
      const entityId = generateEntityId();
      const importance = calculateEntityImportance(entityId, []);
      expect(importance).toBe(0.0);
    });

    it("should handle relations not involving the entity", () => {
      const entityId = generateEntityId();
      const other1 = generateEntityId();
      const other2 = generateEntityId();

      const relations = [createMockRelation(other1, other2)];

      const importance = calculateEntityImportance(entityId, relations);
      expect(importance).toBe(0.0);
    });
  });
});

// =============================================================================
// generateCommunityNameのテスト
// =============================================================================

describe("generateCommunityName", () => {
  const createMockEntity = (name: string, importance: number): EntityEntity =>
    ({
      id: generateEntityId(),
      name,
      normalizedName: name.toLowerCase(),
      type: "framework",
      description: null,
      aliases: [],
      embedding: null,
      importance,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    }) as EntityEntity;

  describe("空コミュニティ", () => {
    it("should return 'Empty Community' for empty array", () => {
      expect(generateCommunityName([])).toBe("Empty Community");
    });
  });

  describe("単一メンバー", () => {
    it("should return entity name for single member", () => {
      const entities = [createMockEntity("React", 0.9)];
      expect(generateCommunityName(entities)).toBe("React");
    });
  });

  describe("2メンバー", () => {
    it("should return 'A & B' format", () => {
      const entities = [
        createMockEntity("React", 0.9),
        createMockEntity("Next.js", 0.8),
      ];
      expect(generateCommunityName(entities)).toBe("React & Next.js");
    });
  });

  describe("3メンバー以上", () => {
    it("should return 'A, B & N others' format for 3 members", () => {
      const entities = [
        createMockEntity("React", 0.9),
        createMockEntity("Next.js", 0.8),
        createMockEntity("Remix", 0.7),
      ];
      expect(generateCommunityName(entities)).toBe("React, Next.js & 1 others");
    });

    it("should return 'A, B & N others' format for 5 members", () => {
      const entities = [
        createMockEntity("React", 0.9),
        createMockEntity("Next.js", 0.8),
        createMockEntity("Remix", 0.7),
        createMockEntity("Gatsby", 0.6),
        createMockEntity("Create React App", 0.5),
      ];
      expect(generateCommunityName(entities)).toBe("React, Next.js & 3 others");
    });
  });

  describe("重要度順ソート", () => {
    it("should sort by importance (descending)", () => {
      const entities = [
        createMockEntity("TypeScript", 0.5), // 低い重要度
        createMockEntity("JavaScript", 0.9), // 高い重要度
      ];

      // 重要度順: JavaScript (0.9) → TypeScript (0.5)
      expect(generateCommunityName(entities)).toBe("JavaScript & TypeScript");
    });

    it("should prioritize high-importance entities in 'A, B & N others' format", () => {
      const entities = [
        createMockEntity("Low1", 0.1),
        createMockEntity("Low2", 0.2),
        createMockEntity("High1", 0.9),
        createMockEntity("High2", 0.8),
      ];

      expect(generateCommunityName(entities)).toBe("High1, High2 & 2 others");
    });
  });

  describe("非ASCII文字対応", () => {
    it("should handle Japanese entity names", () => {
      const entities = [createMockEntity("日本語エンティティ", 0.8)];
      expect(generateCommunityName(entities)).toBe("日本語エンティティ");
    });
  });

  describe("不変性", () => {
    it("should not modify original entities array", () => {
      const entities = [
        createMockEntity("React", 0.5),
        createMockEntity("Next.js", 0.9),
      ];
      const originalOrder = entities.map((e) => e.name);

      generateCommunityName(entities);

      // 元の配列は変更されていない
      expect(entities.map((e) => e.name)).toEqual(originalOrder);
    });
  });
});

// =============================================================================
// getEntityTypeCategoryのテスト
// =============================================================================

describe("getEntityTypeCategory", () => {
  describe("人物・組織カテゴリ (4種類)", () => {
    it("should return '人物・組織' for person types", () => {
      expect(getEntityTypeCategory(EntityTypes.PERSON)).toBe("人物・組織");
      expect(getEntityTypeCategory(EntityTypes.ORGANIZATION)).toBe(
        "人物・組織",
      );
      expect(getEntityTypeCategory(EntityTypes.ROLE)).toBe("人物・組織");
      expect(getEntityTypeCategory(EntityTypes.TEAM)).toBe("人物・組織");
    });
  });

  describe("場所・時間カテゴリ (3種類)", () => {
    it("should return '場所・時間' for location/time types", () => {
      expect(getEntityTypeCategory(EntityTypes.LOCATION)).toBe("場所・時間");
      expect(getEntityTypeCategory(EntityTypes.DATE)).toBe("場所・時間");
      expect(getEntityTypeCategory(EntityTypes.EVENT)).toBe("場所・時間");
    });
  });

  describe("ビジネス・経営カテゴリ (9種類)", () => {
    it("should return 'ビジネス・経営' for business types", () => {
      expect(getEntityTypeCategory(EntityTypes.COMPANY)).toBe("ビジネス・経営");
      expect(getEntityTypeCategory(EntityTypes.PRODUCT)).toBe("ビジネス・経営");
      expect(getEntityTypeCategory(EntityTypes.SERVICE)).toBe("ビジネス・経営");
      expect(getEntityTypeCategory(EntityTypes.BRAND)).toBe("ビジネス・経営");
      expect(getEntityTypeCategory(EntityTypes.STRATEGY)).toBe(
        "ビジネス・経営",
      );
      expect(getEntityTypeCategory(EntityTypes.METRIC)).toBe("ビジネス・経営");
      expect(getEntityTypeCategory(EntityTypes.BUSINESS_PROCESS)).toBe(
        "ビジネス・経営",
      );
      expect(getEntityTypeCategory(EntityTypes.MARKET)).toBe("ビジネス・経営");
      expect(getEntityTypeCategory(EntityTypes.CUSTOMER)).toBe(
        "ビジネス・経営",
      );
    });
  });

  describe("技術全般カテゴリ (5種類)", () => {
    it("should return '技術全般' for general technology types", () => {
      expect(getEntityTypeCategory(EntityTypes.TECHNOLOGY)).toBe("技術全般");
      expect(getEntityTypeCategory(EntityTypes.TOOL)).toBe("技術全般");
      expect(getEntityTypeCategory(EntityTypes.METHOD)).toBe("技術全般");
      expect(getEntityTypeCategory(EntityTypes.STANDARD)).toBe("技術全般");
      expect(getEntityTypeCategory(EntityTypes.PROTOCOL)).toBe("技術全般");
    });
  });

  describe("コード・ソフトウェアカテゴリ (7種類)", () => {
    it("should return 'コード・ソフトウェア' for code types", () => {
      expect(getEntityTypeCategory(EntityTypes.PROGRAMMING_LANGUAGE)).toBe(
        "コード・ソフトウェア",
      );
      expect(getEntityTypeCategory(EntityTypes.FRAMEWORK)).toBe(
        "コード・ソフトウェア",
      );
      expect(getEntityTypeCategory(EntityTypes.LIBRARY)).toBe(
        "コード・ソフトウェア",
      );
      expect(getEntityTypeCategory(EntityTypes.API)).toBe(
        "コード・ソフトウェア",
      );
      expect(getEntityTypeCategory(EntityTypes.FUNCTION)).toBe(
        "コード・ソフトウェア",
      );
      expect(getEntityTypeCategory(EntityTypes.CLASS)).toBe(
        "コード・ソフトウェア",
      );
      expect(getEntityTypeCategory(EntityTypes.MODULE)).toBe(
        "コード・ソフトウェア",
      );
    });
  });

  describe("抽象概念カテゴリ (5種類)", () => {
    it("should return '抽象概念' for concept types", () => {
      expect(getEntityTypeCategory(EntityTypes.CONCEPT)).toBe("抽象概念");
      expect(getEntityTypeCategory(EntityTypes.THEORY)).toBe("抽象概念");
      expect(getEntityTypeCategory(EntityTypes.PRINCIPLE)).toBe("抽象概念");
      expect(getEntityTypeCategory(EntityTypes.PATTERN)).toBe("抽象概念");
      expect(getEntityTypeCategory(EntityTypes.MODEL)).toBe("抽象概念");
    });
  });

  describe("ドキュメント構造カテゴリ (5種類)", () => {
    it("should return 'ドキュメント構造' for document structure types", () => {
      expect(getEntityTypeCategory(EntityTypes.DOCUMENT)).toBe(
        "ドキュメント構造",
      );
      expect(getEntityTypeCategory(EntityTypes.CHAPTER)).toBe(
        "ドキュメント構造",
      );
      expect(getEntityTypeCategory(EntityTypes.SECTION)).toBe(
        "ドキュメント構造",
      );
      expect(getEntityTypeCategory(EntityTypes.PARAGRAPH)).toBe(
        "ドキュメント構造",
      );
      expect(getEntityTypeCategory(EntityTypes.HEADING)).toBe(
        "ドキュメント構造",
      );
    });
  });

  describe("ドキュメント要素カテゴリ (9種類)", () => {
    it("should return 'ドキュメント要素' for document element types", () => {
      expect(getEntityTypeCategory(EntityTypes.KEYWORD)).toBe(
        "ドキュメント要素",
      );
      expect(getEntityTypeCategory(EntityTypes.SUMMARY)).toBe(
        "ドキュメント要素",
      );
      expect(getEntityTypeCategory(EntityTypes.FIGURE)).toBe(
        "ドキュメント要素",
      );
      expect(getEntityTypeCategory(EntityTypes.TABLE)).toBe("ドキュメント要素");
      expect(getEntityTypeCategory(EntityTypes.LIST)).toBe("ドキュメント要素");
      expect(getEntityTypeCategory(EntityTypes.QUOTE)).toBe("ドキュメント要素");
      expect(getEntityTypeCategory(EntityTypes.CODE_SNIPPET)).toBe(
        "ドキュメント要素",
      );
      expect(getEntityTypeCategory(EntityTypes.FORMULA)).toBe(
        "ドキュメント要素",
      );
      expect(getEntityTypeCategory(EntityTypes.EXAMPLE)).toBe(
        "ドキュメント要素",
      );
    });
  });

  describe("メディアカテゴリ (4種類)", () => {
    it("should return 'メディア' for media types", () => {
      expect(getEntityTypeCategory(EntityTypes.IMAGE)).toBe("メディア");
      expect(getEntityTypeCategory(EntityTypes.VIDEO)).toBe("メディア");
      expect(getEntityTypeCategory(EntityTypes.AUDIO)).toBe("メディア");
      expect(getEntityTypeCategory(EntityTypes.DIAGRAM)).toBe("メディア");
    });
  });

  describe("その他カテゴリ (1種類)", () => {
    it("should return 'その他' for other type", () => {
      expect(getEntityTypeCategory(EntityTypes.OTHER)).toBe("その他");
    });
  });

  describe("全52種類の網羅性", () => {
    it("should have category for all 52 entity types", () => {
      const allTypes = Object.values(EntityTypes);
      expect(allTypes).toHaveLength(52);

      allTypes.forEach((type) => {
        const category = getEntityTypeCategory(type);
        expect(category).toBeDefined();
        expect(category.length).toBeGreaterThan(0);
      });
    });
  });
});

// =============================================================================
// calculateGraphDensityのテスト
// =============================================================================

describe("calculateGraphDensity", () => {
  describe("境界値: エンティティ数", () => {
    it("should return 0.0 for 0 entities", () => {
      const density = calculateGraphDensity(0, 0);
      expect(density).toBe(0.0);
    });

    it("should return 0.0 for 1 entity", () => {
      const density = calculateGraphDensity(1, 0);
      expect(density).toBe(0.0);
    });

    it("should calculate density for 2 entities", () => {
      // 2エンティティ、1関係 → maxEdges = 1 → density = 1/1 = 1.0
      const density = calculateGraphDensity(2, 1);
      expect(density).toBe(1.0);
    });
  });

  describe("疎グラフ", () => {
    it("should return 0.0 for graph with no relations", () => {
      const density = calculateGraphDensity(10, 0);
      expect(density).toBe(0.0);
    });

    it("should calculate low density", () => {
      // 100エンティティ、200関係 → maxEdges = 4950 → density = 200/4950 ≈ 0.0404
      const density = calculateGraphDensity(100, 200);
      expect(density).toBeCloseTo(0.0404, 4);
    });
  });

  describe("中密度グラフ", () => {
    it("should calculate medium density", () => {
      // 100エンティティ、2475関係 → maxEdges = 4950 → density = 2475/4950 = 0.5
      const density = calculateGraphDensity(100, 2475);
      expect(density).toBeCloseTo(0.5, 2);
    });
  });

  describe("完全グラフ", () => {
    it("should return 1.0 for complete graph (2 entities)", () => {
      const density = calculateGraphDensity(2, 1);
      expect(density).toBe(1.0);
    });

    it("should return 1.0 for complete graph (10 entities)", () => {
      // 10エンティティ → maxEdges = 45
      const density = calculateGraphDensity(10, 45);
      expect(density).toBe(1.0);
    });
  });

  describe("異常値対策", () => {
    it("should cap at 1.0 when relationCount > maxEdges", () => {
      // 10エンティティ、100関係（異常に多い） → density = 1.0（クリップ）
      const density = calculateGraphDensity(10, 100);
      expect(density).toBe(1.0);
    });
  });

  describe("大規模グラフ", () => {
    it("should handle large graphs (1000 entities)", () => {
      // 1000エンティティ、10000関係 → maxEdges = 499500 → density ≈ 0.02
      const density = calculateGraphDensity(1000, 10000);
      expect(density).toBeCloseTo(0.02, 2);
    });
  });

  describe("数式の正確性", () => {
    it("should calculate density using correct formula", () => {
      const entityCount = 10;
      const relationCount = 20;
      const maxEdges = (entityCount * (entityCount - 1)) / 2; // 45
      const expectedDensity = relationCount / maxEdges; // 20/45 ≈ 0.444

      const density = calculateGraphDensity(entityCount, relationCount);
      expect(density).toBeCloseTo(expectedDensity, 3);
    });
  });
});

// =============================================================================
// パフォーマンステスト
// =============================================================================

describe("パフォーマンス", () => {
  describe("calculateEntityImportance", () => {
    it("should handle large relation arrays efficiently", () => {
      const entityId = generateEntityId();
      const relations: RelationEntity[] = [];

      // 10,000個の関係を作成
      for (let i = 0; i < 10000; i++) {
        const mockRelation = {
          id: generateRelationId(),
          sourceId: i % 2 === 0 ? entityId : generateEntityId(),
          targetId: i % 2 === 0 ? generateEntityId() : entityId,
          type: "uses",
          description: null,
          weight: 0.5,
          bidirectional: false,
          evidence: [],
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        } as RelationEntity;
        relations.push(mockRelation);
      }

      const start = performance.now();
      calculateEntityImportance(entityId, relations);
      const end = performance.now();

      // 10,000関係でも100ms以内に完了すべき
      expect(end - start).toBeLessThan(100);
    });
  });

  describe("generateCommunityName", () => {
    it("should handle large entity arrays efficiently", () => {
      const entities: EntityEntity[] = [];

      // 1,000個のエンティティを作成
      for (let i = 0; i < 1000; i++) {
        entities.push({
          id: generateEntityId(),
          name: `Entity${i}`,
          normalizedName: `entity${i}`,
          type: "concept",
          description: null,
          aliases: [],
          embedding: null,
          importance: Math.random(),
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        } as EntityEntity);
      }

      const start = performance.now();
      generateCommunityName(entities);
      const end = performance.now();

      // 1,000エンティティでも50ms以内に完了すべき
      expect(end - start).toBeLessThan(50);
    });
  });
});
