/**
 * CONV-03-05: Search Zod Schemas Validation Tests
 * Zodスキーマのバリデーションテスト
 *
 * @module @repo/shared/types/rag/search/__tests__/schemas
 */

import { describe, it, expect } from "vitest";
import {
  queryTypeSchema,
  searchStrategySchema,
  searchResultTypeSchema,
  dateRangeSchema,
  searchWeightsSchema,
  searchFiltersSchema,
  searchOptionsSchema,
  highlightOffsetSchema,
  cragScoreSchema,
  rrfConfigSchema,
  rerankConfigSchema,
  SCHEMA_VERSION,
} from "../schemas";

// ==================== queryTypeSchema Tests ====================

describe("queryTypeSchema", () => {
  describe("正常系", () => {
    it("Given: 有効なクエリタイプ, When: バリデーション, Then: 成功", () => {
      const validTypes = ["local", "global", "relationship", "hybrid"];
      validTypes.forEach((type) => {
        const result = queryTypeSchema.safeParse(type);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("異常系", () => {
    it("Given: 無効なクエリタイプ, When: バリデーション, Then: 失敗", () => {
      const result = queryTypeSchema.safeParse("invalid");
      expect(result.success).toBe(false);
    });

    it("Given: 無効な値, When: バリデーション, Then: 日本語エラーメッセージ", () => {
      const result = queryTypeSchema.safeParse("invalid");
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "クエリタイプは local, global, relationship, hybrid のいずれかである必要があります",
        );
      }
    });
  });
});

// ==================== searchStrategySchema Tests ====================

describe("searchStrategySchema", () => {
  describe("正常系", () => {
    it("Given: 有効な検索戦略, When: バリデーション, Then: 成功", () => {
      const validStrategies = ["keyword", "semantic", "graph", "hybrid"];
      validStrategies.forEach((strategy) => {
        const result = searchStrategySchema.safeParse(strategy);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("異常系", () => {
    it("Given: 無効な検索戦略, When: バリデーション, Then: 日本語エラーメッセージ", () => {
      const result = searchStrategySchema.safeParse("invalid");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "検索戦略は keyword, semantic, graph, hybrid のいずれかである必要があります",
        );
      }
    });
  });
});

// ==================== searchResultTypeSchema Tests ====================

describe("searchResultTypeSchema", () => {
  describe("正常系", () => {
    it("Given: 有効な結果タイプ, When: バリデーション, Then: 成功", () => {
      const validTypes = ["chunk", "entity", "community"];
      validTypes.forEach((type) => {
        const result = searchResultTypeSchema.safeParse(type);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("異常系", () => {
    it("Given: 無効な結果タイプ, When: バリデーション, Then: 日本語エラーメッセージ", () => {
      const result = searchResultTypeSchema.safeParse("invalid");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "結果タイプは chunk, entity, community のいずれかである必要があります",
        );
      }
    });
  });
});

// ==================== searchWeightsSchema Tests ====================

describe("searchWeightsSchema", () => {
  describe("正常系", () => {
    it("Given: 正常な重み（合計1.0）, When: バリデーション, Then: 成功", () => {
      const result = searchWeightsSchema.safeParse({
        keyword: 0.35,
        semantic: 0.35,
        graph: 0.3,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("異常系 - refineバリデーション (TDD Red)", () => {
    it("Given: 合計が1.0でない重み, When: バリデーション, Then: 失敗してエラーメッセージ", () => {
      const result = searchWeightsSchema.safeParse({
        keyword: 0.5,
        semantic: 0.5,
        graph: 0.5,
      });
      // TDD Red: refine未実装のため、このテストは失敗するはず
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "検索重みの合計は1.0である必要があります",
        );
      }
    });
  });

  describe("境界値", () => {
    it("Given: 許容誤差内（0.999）, When: バリデーション, Then: 成功", () => {
      const result = searchWeightsSchema.safeParse({
        keyword: 0.334,
        semantic: 0.333,
        graph: 0.333,
      });
      // TDD Red: refine未実装でも、基本バリデーションは通過
      expect(result.success).toBe(true);
    });

    it("Given: 各重みが0.0-1.0範囲外, When: バリデーション, Then: 失敗", () => {
      const result = searchWeightsSchema.safeParse({
        keyword: -0.1,
        semantic: 0.5,
        graph: 0.6,
      });
      expect(result.success).toBe(false);
    });
  });
});

// ==================== dateRangeSchema Tests ====================

describe("dateRangeSchema", () => {
  describe("正常系", () => {
    it("Given: 正常な日付範囲, When: バリデーション, Then: 成功", () => {
      const result = dateRangeSchema.safeParse({
        start: new Date("2024-01-01"),
        end: new Date("2024-12-31"),
      });
      expect(result.success).toBe(true);
    });

    it("Given: 両方がnull, When: バリデーション, Then: 成功", () => {
      const result = dateRangeSchema.safeParse({
        start: null,
        end: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("異常系 - refineバリデーション (TDD Red)", () => {
    it("Given: 逆転した日付範囲, When: バリデーション, Then: 失敗してエラーメッセージ", () => {
      const result = dateRangeSchema.safeParse({
        start: new Date("2024-12-31"),
        end: new Date("2024-01-01"),
      });
      // TDD Red: refine未実装のため、このテストは失敗するはず
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "開始日は終了日以前である必要があります",
        );
      }
    });
  });

  describe("境界値", () => {
    it("Given: 片方がnull（開放区間）, When: バリデーション, Then: 成功", () => {
      const result1 = dateRangeSchema.safeParse({
        start: new Date("2024-01-01"),
        end: null,
      });
      expect(result1.success).toBe(true);

      const result2 = dateRangeSchema.safeParse({
        start: null,
        end: new Date("2024-12-31"),
      });
      expect(result2.success).toBe(true);
    });

    it("Given: 同じ日付, When: バリデーション, Then: 成功", () => {
      const sameDate = new Date("2024-06-15");
      const result = dateRangeSchema.safeParse({
        start: sameDate,
        end: sameDate,
      });
      expect(result.success).toBe(true);
    });
  });
});

// ==================== highlightOffsetSchema Tests ====================

describe("highlightOffsetSchema", () => {
  describe("正常系", () => {
    it("Given: start < end, When: バリデーション, Then: 成功", () => {
      const result = highlightOffsetSchema.safeParse({
        start: 0,
        end: 10,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("異常系 - refineバリデーション (TDD Red)", () => {
    it("Given: start >= end, When: バリデーション, Then: 失敗してエラーメッセージ", () => {
      const result = highlightOffsetSchema.safeParse({
        start: 10,
        end: 5,
      });
      // TDD Red: refine未実装のため、このテストは失敗するはず
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "開始位置は終了位置より小さい必要があります",
        );
      }
    });

    it("Given: start == end, When: バリデーション, Then: 失敗", () => {
      const result = highlightOffsetSchema.safeParse({
        start: 5,
        end: 5,
      });
      // TDD Red: refine未実装のため、このテストは失敗するはず
      expect(result.success).toBe(false);
    });
  });

  describe("境界値", () => {
    it("Given: 負の値, When: バリデーション, Then: 失敗", () => {
      const result = highlightOffsetSchema.safeParse({
        start: -1,
        end: 10,
      });
      expect(result.success).toBe(false);
    });

    it("Given: start=0, end=1, When: バリデーション, Then: 成功", () => {
      const result = highlightOffsetSchema.safeParse({
        start: 0,
        end: 1,
      });
      expect(result.success).toBe(true);
    });
  });
});

// ==================== searchFiltersSchema Tests ====================

describe("searchFiltersSchema", () => {
  describe("正常系", () => {
    it("Given: 有効なフィルター, When: バリデーション, Then: 成功", () => {
      const result = searchFiltersSchema.safeParse({
        fileIds: ["file-1", "file-2"],
        entityTypes: ["person", "organization"],
        dateRange: {
          start: new Date("2024-01-01"),
          end: new Date("2024-12-31"),
        },
        minRelevance: 0.5,
      });
      expect(result.success).toBe(true);
    });

    it("Given: 全てnull, When: バリデーション, Then: 成功（デフォルト値適用）", () => {
      const result = searchFiltersSchema.safeParse({
        fileIds: null,
        entityTypes: null,
        dateRange: null,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.minRelevance).toBe(0.3); // デフォルト値
      }
    });
  });

  describe("異常系", () => {
    it("Given: minRelevanceが範囲外, When: バリデーション, Then: 失敗", () => {
      const result = searchFiltersSchema.safeParse({
        fileIds: null,
        entityTypes: null,
        dateRange: null,
        minRelevance: 1.5,
      });
      expect(result.success).toBe(false);
    });
  });
});

// ==================== searchOptionsSchema Tests ====================

describe("searchOptionsSchema", () => {
  describe("正常系", () => {
    it("Given: 有効なオプション, When: バリデーション, Then: 成功", () => {
      const result = searchOptionsSchema.safeParse({
        limit: 50,
        offset: 10,
        includeMetadata: true,
        includeHighlights: true,
        rerankEnabled: true,
        cragEnabled: false,
        strategies: ["keyword", "semantic"],
        weights: { keyword: 0.5, semantic: 0.5, graph: 0.0 },
      });
      expect(result.success).toBe(true);
    });

    it("Given: 最小限のオプション, When: バリデーション, Then: デフォルト値適用", () => {
      const result = searchOptionsSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
        expect(result.data.offset).toBe(0);
        expect(result.data.strategies).toEqual(["hybrid"]);
      }
    });
  });

  describe("異常系", () => {
    it("Given: limit < 1, When: バリデーション, Then: 失敗", () => {
      const result = searchOptionsSchema.safeParse({
        limit: 0,
      });
      expect(result.success).toBe(false);
    });

    it("Given: limit > 100, When: バリデーション, Then: 失敗", () => {
      const result = searchOptionsSchema.safeParse({
        limit: 101,
      });
      expect(result.success).toBe(false);
    });

    it("Given: strategies空配列, When: バリデーション, Then: 失敗", () => {
      const result = searchOptionsSchema.safeParse({
        strategies: [],
      });
      expect(result.success).toBe(false);
    });
  });
});

// ==================== cragScoreSchema Tests ====================

describe("cragScoreSchema", () => {
  describe("正常系", () => {
    it("Given: 有効なCRAGスコア（correct）, When: バリデーション, Then: 成功", () => {
      const result = cragScoreSchema.safeParse({
        relevance: "correct",
        confidence: 0.9,
        needsWebSearch: false,
        refinedQuery: null,
      });
      expect(result.success).toBe(true);
    });

    it("Given: 有効なCRAGスコア（ambiguous）, When: バリデーション, Then: 成功", () => {
      const result = cragScoreSchema.safeParse({
        relevance: "ambiguous",
        confidence: 0.5,
        needsWebSearch: true,
        refinedQuery: "機械学習 入門",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("異常系", () => {
    it("Given: 無効なrelevance値, When: バリデーション, Then: 失敗", () => {
      const result = cragScoreSchema.safeParse({
        relevance: "invalid",
        confidence: 0.5,
        needsWebSearch: false,
        refinedQuery: null,
      });
      expect(result.success).toBe(false);
    });

    it("Given: confidence範囲外, When: バリデーション, Then: 失敗", () => {
      const result = cragScoreSchema.safeParse({
        relevance: "correct",
        confidence: 1.5,
        needsWebSearch: false,
        refinedQuery: null,
      });
      expect(result.success).toBe(false);
    });
  });
});

// ==================== rrfConfigSchema Tests ====================

describe("rrfConfigSchema", () => {
  describe("正常系", () => {
    it("Given: 有効なRRF設定, When: バリデーション, Then: 成功", () => {
      const result = rrfConfigSchema.safeParse({
        k: 60,
        normalizeScores: true,
      });
      expect(result.success).toBe(true);
    });

    it("Given: 最小限の設定, When: バリデーション, Then: デフォルト値適用", () => {
      const result = rrfConfigSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.k).toBe(60);
        expect(result.data.normalizeScores).toBe(true);
      }
    });
  });

  describe("境界値", () => {
    it("Given: k=1（最小値）, When: バリデーション, Then: 成功", () => {
      const result = rrfConfigSchema.safeParse({ k: 1 });
      expect(result.success).toBe(true);
    });

    it("Given: k=1000（最大値）, When: バリデーション, Then: 成功", () => {
      const result = rrfConfigSchema.safeParse({ k: 1000 });
      expect(result.success).toBe(true);
    });

    it("Given: k=0（範囲外）, When: バリデーション, Then: 失敗", () => {
      const result = rrfConfigSchema.safeParse({ k: 0 });
      expect(result.success).toBe(false);
    });

    it("Given: k=1001（範囲外）, When: バリデーション, Then: 失敗", () => {
      const result = rrfConfigSchema.safeParse({ k: 1001 });
      expect(result.success).toBe(false);
    });
  });
});

// ==================== rerankConfigSchema Tests ====================

describe("rerankConfigSchema", () => {
  describe("正常系", () => {
    it("Given: 有効なリランキング設定, When: バリデーション, Then: 成功", () => {
      const result = rerankConfigSchema.safeParse({
        enabled: true,
        model: "custom-model",
        topK: 30,
        batchSize: 8,
      });
      expect(result.success).toBe(true);
    });

    it("Given: 最小限の設定, When: バリデーション, Then: デフォルト値適用", () => {
      const result = rerankConfigSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.enabled).toBe(true);
        expect(result.data.model).toBe("cross-encoder/ms-marco-MiniLM-L-6-v2");
        expect(result.data.topK).toBe(50);
        expect(result.data.batchSize).toBe(16);
      }
    });
  });

  describe("境界値", () => {
    it("Given: topK=1（最小値）, When: バリデーション, Then: 成功", () => {
      const result = rerankConfigSchema.safeParse({ topK: 1 });
      expect(result.success).toBe(true);
    });

    it("Given: topK=100（最大値）, When: バリデーション, Then: 成功", () => {
      const result = rerankConfigSchema.safeParse({ topK: 100 });
      expect(result.success).toBe(true);
    });

    it("Given: batchSize=32（最大値）, When: バリデーション, Then: 成功", () => {
      const result = rerankConfigSchema.safeParse({ batchSize: 32 });
      expect(result.success).toBe(true);
    });

    it("Given: batchSize=33（範囲外）, When: バリデーション, Then: 失敗", () => {
      const result = rerankConfigSchema.safeParse({ batchSize: 33 });
      expect(result.success).toBe(false);
    });
  });
});

// ==================== SCHEMA_VERSION Tests ====================

describe("SCHEMA_VERSION", () => {
  it("Given: スキーマバージョン情報, When: アクセス, Then: 正しい値", () => {
    expect(SCHEMA_VERSION.version).toBe("1.0.0");
    expect(SCHEMA_VERSION.releaseDate).toBe("2025-12-18");
    expect(SCHEMA_VERSION.changes).toContain("初版リリース");
  });
});
