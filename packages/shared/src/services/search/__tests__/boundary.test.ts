/**
 * @file 境界値テスト
 * @description CONV-07-01 Phase 6: クエリ分類器の境界値テスト
 */

import { describe, expect, it, vi } from "vitest";
import { LLMQueryClassifier } from "../llm-query-classifier";
import { RuleBasedQueryClassifier } from "../rule-based-query-classifier";
import type { ILLMProvider } from "../../extraction/interfaces";

describe("境界値テスト", () => {
  describe("クエリ長", () => {
    it("1文字のクエリを処理できる", async () => {
      const classifier = new RuleBasedQueryClassifier();
      const result = await classifier.classify("あ");
      expect(result.success).toBe(true);
    });

    it("空文字のクエリを処理できる", async () => {
      const classifier = new RuleBasedQueryClassifier();
      const result = await classifier.classify("");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("local"); // デフォルト
      }
    });

    it("1000文字のクエリを処理できる", async () => {
      const classifier = new RuleBasedQueryClassifier();
      const longQuery = "あ".repeat(1000);
      const result = await classifier.classify(longQuery);
      expect(result.success).toBe(true);
    });

    it("5000文字のクエリを処理できる", async () => {
      const classifier = new RuleBasedQueryClassifier();
      const veryLongQuery = "テスト".repeat(1667);
      const result = await classifier.classify(veryLongQuery);
      expect(result.success).toBe(true);
    });
  });

  describe("信頼度境界", () => {
    it("信頼度0.6の場合はhybridにフォールバックしない", async () => {
      const mockLLMProvider = {
        generate: vi.fn().mockResolvedValue({
          success: true,
          data: {
            text: JSON.stringify({
              type: "local",
              confidence: 0.6,
              extractedEntities: [],
              keywords: [],
              intent: "test",
            }),
          },
        }),
        modelId: "test-model",
      } as unknown as ILLMProvider;

      const classifier = new LLMQueryClassifier(
        mockLLMProvider,
        new RuleBasedQueryClassifier(),
      );

      const result = await classifier.classify("クエリ", {
        minConfidence: 0.6,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("local");
      }
    });

    it("信頼度0.59の場合はhybridにフォールバックする", async () => {
      const mockLLMProvider = {
        generate: vi.fn().mockResolvedValue({
          success: true,
          data: {
            text: JSON.stringify({
              type: "local",
              confidence: 0.59,
              extractedEntities: [],
              keywords: [],
              intent: "test",
            }),
          },
        }),
        modelId: "test-model",
      } as unknown as ILLMProvider;

      const classifier = new LLMQueryClassifier(
        mockLLMProvider,
        new RuleBasedQueryClassifier(),
      );

      const result = await classifier.classify("クエリ", {
        minConfidence: 0.6,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("hybrid");
      }
    });

    it("信頼度0.0の場合はhybridにフォールバックする", async () => {
      const mockLLMProvider = {
        generate: vi.fn().mockResolvedValue({
          success: true,
          data: {
            text: JSON.stringify({
              type: "local",
              confidence: 0.0,
              extractedEntities: [],
              keywords: [],
              intent: "test",
            }),
          },
        }),
        modelId: "test-model",
      } as unknown as ILLMProvider;

      const classifier = new LLMQueryClassifier(
        mockLLMProvider,
        new RuleBasedQueryClassifier(),
      );

      const result = await classifier.classify("クエリ");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("hybrid");
      }
    });

    it("信頼度1.0の場合は正常に処理される", async () => {
      const mockLLMProvider = {
        generate: vi.fn().mockResolvedValue({
          success: true,
          data: {
            text: JSON.stringify({
              type: "global",
              confidence: 1.0,
              extractedEntities: [],
              keywords: [],
              intent: "test",
            }),
          },
        }),
        modelId: "test-model",
      } as unknown as ILLMProvider;

      const classifier = new LLMQueryClassifier(
        mockLLMProvider,
        new RuleBasedQueryClassifier(),
      );

      const result = await classifier.classify("概要");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("global");
        expect(result.data.confidence).toBe(1.0);
      }
    });
  });

  describe("検索重み境界", () => {
    const classifier = new RuleBasedQueryClassifier();

    it("localの検索重みは合計1.0", () => {
      const weights = classifier.getSearchWeights("local");
      expect(weights.keyword + weights.semantic + weights.graph).toBeCloseTo(
        1.0,
        2,
      );
    });

    it("globalの検索重みは合計1.0", () => {
      const weights = classifier.getSearchWeights("global");
      expect(weights.keyword + weights.semantic + weights.graph).toBeCloseTo(
        1.0,
        2,
      );
    });

    it("relationshipの検索重みは合計1.0", () => {
      const weights = classifier.getSearchWeights("relationship");
      expect(weights.keyword + weights.semantic + weights.graph).toBeCloseTo(
        1.0,
        2,
      );
    });

    it("hybridの検索重みは合計1.0", () => {
      const weights = classifier.getSearchWeights("hybrid");
      expect(weights.keyword + weights.semantic + weights.graph).toBeCloseTo(
        1.0,
        2,
      );
    });
  });
});
