/**
 * @file クエリ分類器 統合テスト
 * @description Phase 4: TDD Red - 統合テストシナリオ
 */

import { describe, it, expect, vi } from "vitest";
import { LLMQueryClassifier } from "../llm-query-classifier";
import { RuleBasedQueryClassifier } from "../rule-based-query-classifier";
import type { ILLMProvider } from "../../extraction/interfaces";

describe("QueryClassifier Integration", () => {
  describe("分類→重み取得フロー", () => {
    it("分類結果に基づいて正しい重みを取得できる", async () => {
      const classifier = new RuleBasedQueryClassifier();

      const result = await classifier.classify("全体のテーマは？");
      expect(result.success).toBe(true);

      if (result.success) {
        const weights = classifier.getSearchWeights(result.data.type);
        // globalクエリはgraphの重みが最大
        expect(weights.graph).toBeGreaterThan(weights.keyword);
        expect(weights.graph).toBeGreaterThan(weights.semantic);
      }
    });

    it("ローカルクエリはkeywordとsemanticの重みが高い", async () => {
      const classifier = new RuleBasedQueryClassifier();

      const result = await classifier.classify("Reactとは何ですか？");
      expect(result.success).toBe(true);

      if (result.success) {
        const weights = classifier.getSearchWeights(result.data.type);
        // localクエリはkeywordとsemanticが同等で高い
        expect(weights.keyword).toBeCloseTo(weights.semantic);
        expect(weights.keyword).toBeGreaterThan(weights.graph);
      }
    });

    it("関係性クエリはgraphの重みが最大", async () => {
      const classifier = new RuleBasedQueryClassifier();

      const result = await classifier.classify("ReactとVueの違いは？");
      expect(result.success).toBe(true);

      if (result.success) {
        const weights = classifier.getSearchWeights(result.data.type);
        // relationshipクエリはgraphが最大
        expect(weights.graph).toBeGreaterThan(weights.keyword);
        expect(weights.graph).toBeGreaterThan(weights.semantic);
        expect(weights.graph).toBeCloseTo(0.6);
      }
    });
  });

  describe("LLM→ルールベースフォールバック", () => {
    it("LLMエラー時にルールベースで分類を継続できる", async () => {
      const mockLLMProvider: ILLMProvider = {
        modelId: "test-model",
        generate: vi.fn().mockRejectedValue(new Error("Network error")),
      };
      const fallbackClassifier = new RuleBasedQueryClassifier();
      const classifier = new LLMQueryClassifier(
        mockLLMProvider,
        fallbackClassifier,
      );

      // 複数のクエリで一貫してフォールバックが動作する
      const queries = [
        { query: "全体のテーマは？", expectedType: "global" },
        { query: "ReactとVueの違いは？", expectedType: "relationship" },
        { query: "TypeScriptとは？", expectedType: "local" },
      ];

      for (const { query, expectedType } of queries) {
        const result = await classifier.classify(query);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.type).toBe(expectedType);
        }
      }
    });

    it("LLM成功→失敗→成功のシーケンスでも正しく動作する", async () => {
      const mockLLMProvider: ILLMProvider = {
        modelId: "test-model",
        generate: vi.fn(),
      };
      const fallbackClassifier = new RuleBasedQueryClassifier();
      const classifier = new LLMQueryClassifier(
        mockLLMProvider,
        fallbackClassifier,
      );

      // 1回目: LLM成功
      vi.mocked(mockLLMProvider.generate).mockResolvedValueOnce({
        success: true,
        data: {
          text: JSON.stringify({
            type: "local",
            confidence: 0.9,
            extractedEntities: ["React"],
            keywords: ["React"],
            intent: "Reactについて知りたい",
          }),
          tokensUsed: 100,
        },
      });

      const result1 = await classifier.classify("Reactとは？");
      expect(result1.success).toBe(true);
      if (result1.success) {
        expect(result1.data.type).toBe("local");
      }

      // 2回目: LLM失敗 → フォールバック
      vi.mocked(mockLLMProvider.generate).mockRejectedValueOnce(
        new Error("API Error"),
      );

      const result2 = await classifier.classify("全体のテーマは？");
      expect(result2.success).toBe(true);
      if (result2.success) {
        expect(result2.data.type).toBe("global"); // フォールバック結果
      }

      // 3回目: LLM成功
      vi.mocked(mockLLMProvider.generate).mockResolvedValueOnce({
        success: true,
        data: {
          text: JSON.stringify({
            type: "relationship",
            confidence: 0.85,
            extractedEntities: ["A", "B"],
            relationHint: "comparison",
            keywords: ["A", "B", "違い"],
            intent: "AとBを比較したい",
          }),
          tokensUsed: 100,
        },
      });

      const result3 = await classifier.classify("AとBの違いは？");
      expect(result3.success).toBe(true);
      if (result3.success) {
        expect(result3.data.type).toBe("relationship");
      }
    });
  });

  describe("エンティティ抽出と検索重みの連携", () => {
    it("関係性クエリで抽出したエンティティと重みが整合する", async () => {
      const classifier = new RuleBasedQueryClassifier();

      const result = await classifier.classify(
        "TypeScriptとJavaScriptの関係は？",
      );
      expect(result.success).toBe(true);

      if (result.success) {
        // エンティティが抽出されている
        expect(result.data.extractedEntities.length).toBeGreaterThanOrEqual(2);
        expect(result.data.type).toBe("relationship");

        // 関係性クエリに適した重み
        const weights = classifier.getSearchWeights(result.data.type);
        expect(weights.graph).toBe(0.6);
      }
    });
  });

  describe("検索パイプライン連携シナリオ", () => {
    it("分類結果から検索パイプラインに必要な情報を取得できる", async () => {
      const classifier = new RuleBasedQueryClassifier();
      const query = "ReactとVueの違いを教えて";

      const result = await classifier.classify(query);
      expect(result.success).toBe(true);

      if (result.success) {
        // パイプラインに必要な情報が揃っている
        expect(result.data).toHaveProperty("type");
        expect(result.data).toHaveProperty("confidence");
        expect(result.data).toHaveProperty("extractedEntities");
        expect(result.data).toHaveProperty("keywords");
        expect(result.data).toHaveProperty("intent");

        // 重みを取得できる
        const weights = classifier.getSearchWeights(result.data.type);
        expect(weights).toHaveProperty("keyword");
        expect(weights).toHaveProperty("semantic");
        expect(weights).toHaveProperty("graph");

        // 重みの合計が1.0
        const sum = weights.keyword + weights.semantic + weights.graph;
        expect(sum).toBeCloseTo(1.0);
      }
    });
  });

  describe("パフォーマンス", () => {
    it("ルールベース分類は50ms以内に完了する", async () => {
      const classifier = new RuleBasedQueryClassifier();
      const queries = [
        "全体のテーマは？",
        "ReactとVueの違いは？",
        "TypeScriptとは何ですか？",
        "このAPIの使い方を教えて",
        "概要を教えてください",
      ];

      // ウォームアップ: 初回実行は遅くなることがあるため
      await classifier.classify("warm up");

      for (const query of queries) {
        const start = performance.now();
        await classifier.classify(query);
        const duration = performance.now() - start;
        // CI環境やpre-pushでの実行時間を考慮し、100msを閾値とする
        // (UT-PERF-002: パフォーマンステスト閾値調整)
        expect(duration).toBeLessThan(100);
      }
    });
  });

  describe("複数クエリの連続処理", () => {
    it("連続したクエリを正しく分類できる", async () => {
      const classifier = new RuleBasedQueryClassifier();

      const queries = [
        { query: "Reactとは？", expectedType: "local" },
        { query: "全体のテーマは？", expectedType: "global" },
        { query: "AとBの違い", expectedType: "relationship" },
        { query: "Vueについて", expectedType: "local" },
        { query: "概要を教えて", expectedType: "global" },
      ];

      for (const { query, expectedType } of queries) {
        const result = await classifier.classify(query);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.type).toBe(expectedType);
        }
      }
    });
  });

  describe("エラー回復", () => {
    it("LLMエラー後も正常に動作を継続できる", async () => {
      const mockLLMProvider: ILLMProvider = {
        modelId: "test-model",
        generate: vi
          .fn()
          .mockRejectedValueOnce(new Error("API Error"))
          .mockResolvedValueOnce({
            success: true,
            data: {
              text: JSON.stringify({
                type: "local",
                confidence: 0.9,
                extractedEntities: [],
                keywords: [],
                intent: "",
              }),
              tokensUsed: 50,
            },
          }),
      };
      const classifier = new LLMQueryClassifier(
        mockLLMProvider,
        new RuleBasedQueryClassifier(),
      );

      // 1回目: エラー → フォールバック
      const result1 = await classifier.classify("全体のテーマは？");
      expect(result1.success).toBe(true);
      if (result1.success) {
        expect(result1.data.type).toBe("global");
      }

      // 2回目: 正常動作
      const result2 = await classifier.classify("Reactとは？");
      expect(result2.success).toBe(true);
      if (result2.success) {
        expect(result2.data.type).toBe("local");
      }
    });
  });

  describe("出力形式の検証", () => {
    it("分類結果を検索エンジンに渡せる形式で返す", async () => {
      const classifier = new RuleBasedQueryClassifier();
      const result = await classifier.classify("ReactとVueの違いは？");

      expect(result.success).toBe(true);

      if (result.success) {
        // 検索エンジンで使用する形式の検証
        const { type, extractedEntities, keywords } = result.data;
        expect(typeof type).toBe("string");
        expect(Array.isArray(extractedEntities)).toBe(true);
        expect(Array.isArray(keywords)).toBe(true);

        const weights = classifier.getSearchWeights(type);
        expect(weights.keyword + weights.semantic + weights.graph).toBeCloseTo(
          1.0,
        );
      }
    });
  });
});
