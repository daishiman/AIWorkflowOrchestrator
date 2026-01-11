/**
 * @file ルールベースクエリ分類器テスト
 * @description Phase 4: TDD Red - ルールベース分類器のテスト
 */

import { describe, it, expect, beforeEach } from "vitest";
import { RuleBasedQueryClassifier } from "../rule-based-query-classifier";
import type { QueryType } from "../types";

describe("RuleBasedQueryClassifier", () => {
  let classifier: RuleBasedQueryClassifier;

  beforeEach(() => {
    classifier = new RuleBasedQueryClassifier();
  });

  describe("classify", () => {
    describe("グローバルクエリの分類", () => {
      it.each([
        ["全体のテーマは？", "global"],
        ["概要を教えて", "global"],
        ["このドキュメントは何について書かれている？", "global"],
        ["主要な話題は何ですか？", "global"],
        ["要約してください", "global"],
        ["まとめを教えて", "global"],
        ["何について書かれていますか？", "global"],
      ])("日本語: '%s' を %s に分類する", async (query, expectedType) => {
        const result = await classifier.classify(query);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.type).toBe(expectedType);
        }
      });

      it.each([
        ["What is this document about?", "global"],
        ["Give me an overview", "global"],
        ["What is the main topic?", "global"],
        ["Summarize this document", "global"],
        ["What are the main themes?", "global"],
      ])("英語: '%s' を %s に分類する", async (query, expectedType) => {
        const result = await classifier.classify(query);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.type).toBe(expectedType);
        }
      });
    });

    describe("関係性クエリの分類", () => {
      it.each([
        ["ReactとVueの違いは？", "relationship"],
        ["TypeScriptとJavaScriptの関係は？", "relationship"],
        ["AがBに与える影響は？", "relationship"],
        ["なぜReactがVueより人気なのか？", "relationship"],
        ["ReactとVueの比較をして", "relationship"],
        ["AとBはどう関連していますか？", "relationship"],
      ])("日本語: '%s' を %s に分類する", async (query, expectedType) => {
        const result = await classifier.classify(query);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.type).toBe(expectedType);
        }
      });

      it.each([
        ["What is the relationship between A and B?", "relationship"],
        ["Compare React and Vue", "relationship"],
        ["What is the difference between X and Y?", "relationship"],
        ["How does A affect B?", "relationship"],
        ["How does climate change impact agriculture?", "relationship"],
      ])("英語: '%s' を %s に分類する", async (query, expectedType) => {
        const result = await classifier.classify(query);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.type).toBe(expectedType);
        }
      });

      it("関係性クエリからエンティティを抽出する (日本語)", async () => {
        const result = await classifier.classify("ReactとVueの違いは？");
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.extractedEntities).toContain("React");
          expect(result.data.extractedEntities).toContain("Vue");
        }
      });

      it("関係性クエリからエンティティを抽出する (英語)", async () => {
        const result = await classifier.classify("Compare React with Angular");
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.extractedEntities).toContain("React");
          expect(result.data.extractedEntities).toContain("Angular");
        }
      });

      it("関係のヒントを抽出する (comparison)", async () => {
        const result = await classifier.classify("ReactとVueの違いは？");
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.relationHint).toBe("comparison");
        }
      });

      it("関係のヒントを抽出する (causation)", async () => {
        const result = await classifier.classify("AがBに与える影響は？");
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.relationHint).toBe("causation");
        }
      });
    });

    describe("ローカルクエリの分類", () => {
      it.each([
        ["Reactとは何ですか？", "local"],
        ["TypeScriptの特徴は？", "local"],
        ["このAPIの使い方を教えて", "local"],
        ["useStateフックについて", "local"],
        ["Promiseの説明をして", "local"],
      ])("日本語: '%s' を %s に分類する", async (query, expectedType) => {
        const result = await classifier.classify(query);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.type).toBe(expectedType);
        }
      });

      it.each([
        ["What is React?", "local"],
        ["Explain useState hook", "local"],
        ["How to use this API?", "local"],
      ])("英語: '%s' を %s に分類する", async (query, expectedType) => {
        const result = await classifier.classify(query);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.type).toBe(expectedType);
        }
      });

      it("ローカルクエリからエンティティを抽出する", async () => {
        const result = await classifier.classify("Reactとは何ですか？");
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.extractedEntities).toContain("React");
        }
      });
    });

    describe("キーワード抽出", () => {
      it("助詞を除去してキーワードを抽出する", async () => {
        const result = await classifier.classify("Reactのフックについて教えて");
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.keywords).toContain("React");
          expect(result.data.keywords).toContain("フック");
          expect(result.data.keywords).not.toContain("の");
          expect(result.data.keywords).not.toContain("について");
        }
      });

      it("英語のストップワードを除去する", async () => {
        const result = await classifier.classify(
          "What is the difference between React and Vue?",
        );
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.keywords).toContain("React");
          expect(result.data.keywords).toContain("Vue");
          expect(result.data.keywords).not.toContain("the");
          expect(result.data.keywords).not.toContain("is");
        }
      });
    });

    describe("信頼度", () => {
      it("分類結果に信頼度が含まれる", async () => {
        const result = await classifier.classify("全体のテーマは？");
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.confidence).toBeGreaterThanOrEqual(0);
          expect(result.data.confidence).toBeLessThanOrEqual(1);
        }
      });

      it("パターンマッチの信頼度は0.7以上", async () => {
        const result = await classifier.classify("全体のテーマは？");
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.confidence).toBeGreaterThanOrEqual(0.7);
        }
      });

      it("デフォルト分類(local)の信頼度は0.5", async () => {
        const result = await classifier.classify("あいまいなクエリ");
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.type).toBe("local");
          expect(result.data.confidence).toBe(0.5);
        }
      });
    });

    describe("意図(intent)の抽出", () => {
      it("意図を1文で説明する", async () => {
        const result = await classifier.classify("Reactとは？");
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.intent).toBeTruthy();
          expect(typeof result.data.intent).toBe("string");
        }
      });
    });
  });

  describe("getSearchWeights", () => {
    it("localクエリに正しい重みを返す", () => {
      const weights = classifier.getSearchWeights("local");
      expect(weights.keyword).toBeCloseTo(0.35);
      expect(weights.semantic).toBeCloseTo(0.35);
      expect(weights.graph).toBeCloseTo(0.3);
    });

    it("globalクエリに正しい重みを返す", () => {
      const weights = classifier.getSearchWeights("global");
      expect(weights.keyword).toBeCloseTo(0.2);
      expect(weights.semantic).toBeCloseTo(0.3);
      expect(weights.graph).toBeCloseTo(0.5);
    });

    it("relationshipクエリに正しい重みを返す", () => {
      const weights = classifier.getSearchWeights("relationship");
      expect(weights.keyword).toBeCloseTo(0.2);
      expect(weights.semantic).toBeCloseTo(0.2);
      expect(weights.graph).toBeCloseTo(0.6);
    });

    it("hybridクエリに均等な重みを返す", () => {
      const weights = classifier.getSearchWeights("hybrid");
      expect(weights.keyword).toBeCloseTo(0.33);
      expect(weights.semantic).toBeCloseTo(0.33);
      expect(weights.graph).toBeCloseTo(0.34);
    });

    it("重みの合計が1.0になる", () => {
      const types: QueryType[] = ["local", "global", "relationship", "hybrid"];
      for (const type of types) {
        const weights = classifier.getSearchWeights(type);
        const sum = weights.keyword + weights.semantic + weights.graph;
        expect(sum).toBeCloseTo(1.0);
      }
    });
  });
});
