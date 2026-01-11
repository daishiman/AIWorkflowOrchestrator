/**
 * @file LLMクエリ分類器テスト
 * @description Phase 4: TDD Red - LLMベース分類器のテスト
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { LLMQueryClassifier } from "../llm-query-classifier";
import { RuleBasedQueryClassifier } from "../rule-based-query-classifier";
import type { ILLMProvider } from "../../extraction/interfaces";
import type { QueryType, IQueryClassifier } from "../types";

describe("LLMQueryClassifier", () => {
  let classifier: LLMQueryClassifier;
  let mockLLMProvider: ILLMProvider;
  let fallbackClassifier: IQueryClassifier;

  beforeEach(() => {
    mockLLMProvider = {
      modelId: "test-model",
      generate: vi.fn(),
    };
    fallbackClassifier = new RuleBasedQueryClassifier();
    classifier = new LLMQueryClassifier(mockLLMProvider, fallbackClassifier);
  });

  describe("classify", () => {
    it("ローカルクエリを正しく分類する", async () => {
      vi.mocked(mockLLMProvider.generate).mockResolvedValue({
        success: true,
        data: {
          text: JSON.stringify({
            type: "local",
            confidence: 0.9,
            extractedEntities: ["TypeScript"],
            keywords: ["TypeScript", "定義"],
            intent: "TypeScriptについての情報を求めている",
          }),
          tokensUsed: 100,
        },
      });

      const result = await classifier.classify("TypeScriptとは何ですか？");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("local");
        expect(result.data.confidence).toBeGreaterThan(0.5);
      }
    });

    it("グローバルクエリを正しく分類する", async () => {
      vi.mocked(mockLLMProvider.generate).mockResolvedValue({
        success: true,
        data: {
          text: JSON.stringify({
            type: "global",
            confidence: 0.85,
            extractedEntities: [],
            keywords: ["テーマ", "全体"],
            intent: "ドキュメント全体のテーマを把握したい",
          }),
          tokensUsed: 100,
        },
      });

      const result = await classifier.classify(
        "このドキュメント全体のテーマは何ですか？",
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("global");
      }
    });

    it("関係性クエリを正しく分類しエンティティを抽出する", async () => {
      vi.mocked(mockLLMProvider.generate).mockResolvedValue({
        success: true,
        data: {
          text: JSON.stringify({
            type: "relationship",
            confidence: 0.9,
            extractedEntities: ["React", "Vue"],
            relationHint: "comparison",
            keywords: ["React", "Vue", "違い"],
            intent: "ReactとVueの違いを比較したい",
          }),
          tokensUsed: 100,
        },
      });

      const result = await classifier.classify("ReactとVueの違いは何ですか？");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("relationship");
        expect(result.data.extractedEntities).toContain("React");
        expect(result.data.extractedEntities).toContain("Vue");
        expect(result.data.relationHint).toBe("comparison");
      }
    });

    it("信頼度が閾値未満の場合はhybridにフォールバックする", async () => {
      vi.mocked(mockLLMProvider.generate).mockResolvedValue({
        success: true,
        data: {
          text: JSON.stringify({
            type: "local",
            confidence: 0.3, // 閾値0.6未満
            extractedEntities: [],
            keywords: [],
            intent: "",
          }),
          tokensUsed: 100,
        },
      });

      const result = await classifier.classify("あいまいなクエリ", {
        minConfidence: 0.6,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("hybrid");
      }
    });

    it("LLMエラー時にルールベースにフォールバックする", async () => {
      vi.mocked(mockLLMProvider.generate).mockRejectedValue(
        new Error("API error"),
      );

      const result = await classifier.classify("全体のテーマは？");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("global"); // ルールベースの結果
      }
    });

    it("JSONパースエラー時にルールベースにフォールバックする", async () => {
      vi.mocked(mockLLMProvider.generate).mockResolvedValue({
        success: true,
        data: {
          text: "これはJSONではありません",
          tokensUsed: 100,
        },
      });

      const result = await classifier.classify("全体のテーマは？");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("global"); // ルールベースの結果
      }
    });

    it("LLMレスポンスがエラーの場合にルールベースにフォールバックする", async () => {
      vi.mocked(mockLLMProvider.generate).mockResolvedValue({
        success: false,
        error: new Error("Rate limit exceeded"),
      });

      const result = await classifier.classify("全体のテーマは？");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("global"); // ルールベースの結果
      }
    });

    it("不完全なJSONレスポンスでフォールバックする", async () => {
      vi.mocked(mockLLMProvider.generate).mockResolvedValue({
        success: true,
        data: {
          text: JSON.stringify({
            type: "local",
            // 必須フィールドが欠けている
          }),
          tokensUsed: 100,
        },
      });

      const result = await classifier.classify("全体のテーマは？");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("global"); // ルールベースの結果
      }
    });
  });

  describe("オプション", () => {
    it("useLLM: falseの場合はルールベースを使用する", async () => {
      const result = await classifier.classify("全体のテーマは？", {
        useLLM: false,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("global");
      }
      expect(mockLLMProvider.generate).not.toHaveBeenCalled();
    });

    it("カスタムminConfidenceが適用される", async () => {
      vi.mocked(mockLLMProvider.generate).mockResolvedValue({
        success: true,
        data: {
          text: JSON.stringify({
            type: "local",
            confidence: 0.7,
            extractedEntities: [],
            keywords: [],
            intent: "",
          }),
          tokensUsed: 100,
        },
      });

      const result = await classifier.classify("クエリ", {
        minConfidence: 0.8, // 0.7 < 0.8なのでhybridになる
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("hybrid");
      }
    });

    it("デフォルトのminConfidence(0.6)が適用される", async () => {
      vi.mocked(mockLLMProvider.generate).mockResolvedValue({
        success: true,
        data: {
          text: JSON.stringify({
            type: "local",
            confidence: 0.7, // 0.6以上なのでそのまま
            extractedEntities: [],
            keywords: [],
            intent: "",
          }),
          tokensUsed: 100,
        },
      });

      const result = await classifier.classify("クエリ");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("local");
      }
    });
  });

  describe("getSearchWeights", () => {
    it("ルールベース分類器と同じ重みを返す", () => {
      const ruleBasedClassifier = new RuleBasedQueryClassifier();

      const types: QueryType[] = ["local", "global", "relationship", "hybrid"];
      for (const type of types) {
        const llmWeights = classifier.getSearchWeights(type);
        const ruleWeights = ruleBasedClassifier.getSearchWeights(type);

        expect(llmWeights.keyword).toBeCloseTo(ruleWeights.keyword);
        expect(llmWeights.semantic).toBeCloseTo(ruleWeights.semantic);
        expect(llmWeights.graph).toBeCloseTo(ruleWeights.graph);
      }
    });
  });
});
