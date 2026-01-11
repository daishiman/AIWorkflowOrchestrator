/**
 * @file クエリ分類器 型定義テスト
 * @description Phase 4: TDD Red - 型スキーマのバリデーションテスト
 */

import { describe, it, expect } from "vitest";
import {
  queryTypeSchema,
  searchWeightsSchema,
  queryClassificationSchema,
} from "../types";

describe("QueryType Schema", () => {
  describe("有効なクエリタイプ", () => {
    it.each(["local", "global", "relationship", "hybrid"])(
      "'%s' を受け入れる",
      (type) => {
        const result = queryTypeSchema.safeParse(type);
        expect(result.success).toBe(true);
      },
    );
  });

  describe("無効なクエリタイプ", () => {
    it("無効な文字列を拒否する", () => {
      expect(queryTypeSchema.safeParse("invalid").success).toBe(false);
    });

    it("空文字列を拒否する", () => {
      expect(queryTypeSchema.safeParse("").success).toBe(false);
    });

    it("nullを拒否する", () => {
      expect(queryTypeSchema.safeParse(null).success).toBe(false);
    });

    it("undefinedを拒否する", () => {
      expect(queryTypeSchema.safeParse(undefined).success).toBe(false);
    });

    it("数値を拒否する", () => {
      expect(queryTypeSchema.safeParse(123).success).toBe(false);
    });
  });
});

describe("SearchWeights Schema", () => {
  describe("有効な重み", () => {
    it("合計1.0の重みを受け入れる", () => {
      const weights = { keyword: 0.35, semantic: 0.35, graph: 0.3 };
      const result = searchWeightsSchema.safeParse(weights);
      expect(result.success).toBe(true);
    });

    it("localタイプの重み(0.35, 0.35, 0.3)を受け入れる", () => {
      const weights = { keyword: 0.35, semantic: 0.35, graph: 0.3 };
      const result = searchWeightsSchema.safeParse(weights);
      expect(result.success).toBe(true);
    });

    it("globalタイプの重み(0.2, 0.3, 0.5)を受け入れる", () => {
      const weights = { keyword: 0.2, semantic: 0.3, graph: 0.5 };
      const result = searchWeightsSchema.safeParse(weights);
      expect(result.success).toBe(true);
    });

    it("relationshipタイプの重み(0.2, 0.2, 0.6)を受け入れる", () => {
      const weights = { keyword: 0.2, semantic: 0.2, graph: 0.6 };
      const result = searchWeightsSchema.safeParse(weights);
      expect(result.success).toBe(true);
    });

    it("hybridタイプの重み(0.33, 0.33, 0.34)を受け入れる", () => {
      const weights = { keyword: 0.33, semantic: 0.33, graph: 0.34 };
      const result = searchWeightsSchema.safeParse(weights);
      expect(result.success).toBe(true);
    });

    it("浮動小数点誤差を許容する (合計0.99の場合)", () => {
      const weights = { keyword: 0.33, semantic: 0.33, graph: 0.33 };
      const result = searchWeightsSchema.safeParse(weights);
      expect(result.success).toBe(true);
    });
  });

  describe("無効な重み", () => {
    it("合計が1.0を超える重みを拒否する", () => {
      const weights = { keyword: 0.5, semantic: 0.5, graph: 0.5 };
      const result = searchWeightsSchema.safeParse(weights);
      expect(result.success).toBe(false);
    });

    it("合計が1.0未満の重みを拒否する", () => {
      const weights = { keyword: 0.2, semantic: 0.2, graph: 0.2 };
      const result = searchWeightsSchema.safeParse(weights);
      expect(result.success).toBe(false);
    });

    it("負の値を拒否する", () => {
      const weights = { keyword: -0.1, semantic: 0.6, graph: 0.5 };
      const result = searchWeightsSchema.safeParse(weights);
      expect(result.success).toBe(false);
    });

    it("1を超える値を拒否する", () => {
      const weights = { keyword: 1.1, semantic: 0, graph: 0 };
      const result = searchWeightsSchema.safeParse(weights);
      expect(result.success).toBe(false);
    });

    it("必須フィールドがない場合を拒否する", () => {
      const weights = { keyword: 0.5, semantic: 0.5 };
      const result = searchWeightsSchema.safeParse(weights);
      expect(result.success).toBe(false);
    });
  });
});

describe("QueryClassification Schema", () => {
  describe("有効な分類結果", () => {
    it("必須フィールドのみの結果を受け入れる", () => {
      const classification = {
        type: "local",
        confidence: 0.9,
        extractedEntities: ["React"],
        keywords: ["React", "とは"],
        intent: "Reactについての情報を求めている",
      };
      const result = queryClassificationSchema.safeParse(classification);
      expect(result.success).toBe(true);
    });

    it("relationHintを含む結果を受け入れる", () => {
      const classification = {
        type: "relationship",
        confidence: 0.85,
        extractedEntities: ["React", "Vue"],
        relationHint: "comparison",
        keywords: ["React", "Vue", "違い"],
        intent: "ReactとVueの違いを比較したい",
      };
      const result = queryClassificationSchema.safeParse(classification);
      expect(result.success).toBe(true);
    });

    it("空のエンティティ配列を受け入れる", () => {
      const classification = {
        type: "global",
        confidence: 0.8,
        extractedEntities: [],
        keywords: ["テーマ"],
        intent: "ドキュメント全体のテーマを知りたい",
      };
      const result = queryClassificationSchema.safeParse(classification);
      expect(result.success).toBe(true);
    });
  });

  describe("無効な分類結果", () => {
    it("信頼度が0未満の場合を拒否する", () => {
      const classification = {
        type: "local",
        confidence: -0.1,
        extractedEntities: [],
        keywords: [],
        intent: "",
      };
      const result = queryClassificationSchema.safeParse(classification);
      expect(result.success).toBe(false);
    });

    it("信頼度が1を超える場合を拒否する", () => {
      const classification = {
        type: "local",
        confidence: 1.1,
        extractedEntities: [],
        keywords: [],
        intent: "",
      };
      const result = queryClassificationSchema.safeParse(classification);
      expect(result.success).toBe(false);
    });

    it("無効なクエリタイプを拒否する", () => {
      const classification = {
        type: "invalid",
        confidence: 0.9,
        extractedEntities: [],
        keywords: [],
        intent: "",
      };
      const result = queryClassificationSchema.safeParse(classification);
      expect(result.success).toBe(false);
    });
  });
});
