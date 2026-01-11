/**
 * @file パターンマッチング網羅テスト
 * @description CONV-07-01 Phase 6: クエリ分類器のパターン網羅テスト
 */

import { describe, expect, it } from "vitest";
import { RuleBasedQueryClassifier } from "../rule-based-query-classifier";

describe("パターンマッチング網羅テスト", () => {
  const classifier = new RuleBasedQueryClassifier();

  describe("日本語グローバルパターン", () => {
    it.each([
      "全体のテーマ",
      "全体は何？",
      "概要を説明して",
      "主な話題は",
      "主要な話題について",
      "何について書いてある？",
      "どんな内容ですか",
      "要約して",
      "まとめてください",
      "書かれていますか",
    ])("'%s' をglobalに分類する", async (query) => {
      const result = await classifier.classify(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("global");
      }
    });
  });

  describe("英語グローバルパターン", () => {
    it.each([
      "give me an overview",
      "summary please",
      "summarize this",
      "what is this about",
      "what is this document about",
      "what is the main topic",
      "what is the main theme",
      "what are the main points",
    ])("'%s' をglobalに分類する", async (query) => {
      const result = await classifier.classify(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("global");
      }
    });
  });

  describe("日本語関係性パターン", () => {
    it.each([
      { query: "ReactとVueの関係", entities: ["React", "Vue"] },
      {
        query: "TypeScriptとJavaScriptの違い",
        entities: ["TypeScript", "JavaScript"],
      },
      { query: "NodeとDenoの比較", entities: ["Node", "Deno"] },
      { query: "データがモデルに与える影響", entities: ["データ", "モデル"] },
      { query: "なぜReactがVue", entities: ["React", "Vue"] },
      { query: "AとBはどう関連しているか", entities: ["A", "B"] },
    ])(
      "'$query' をrelationshipに分類し、エンティティを抽出する",
      async ({ query, entities }) => {
        const result = await classifier.classify(query);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.type).toBe("relationship");
          for (const entity of entities) {
            expect(result.data.extractedEntities).toContain(entity);
          }
        }
      },
    );
  });

  describe("英語関係性パターン", () => {
    it.each([
      {
        query: "relationship between React and Vue",
        entities: ["React", "Vue"],
      },
      {
        query: "difference between TypeScript and JavaScript",
        entities: ["TypeScript", "JavaScript"],
      },
      { query: "compare React and Angular", entities: ["React", "Angular"] },
      { query: "compare React with Vue", entities: ["React", "Vue"] },
      {
        query: "how does caching affect performance",
        entities: ["caching", "performance"],
      },
      { query: "how does A impact B", entities: ["A", "B"] },
    ])(
      "'$query' をrelationshipに分類し、エンティティを抽出する",
      async ({ query, entities }) => {
        const result = await classifier.classify(query);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.type).toBe("relationship");
          for (const entity of entities) {
            expect(result.data.extractedEntities).toContain(entity);
          }
        }
      },
    );
  });

  describe("関係性ヒント検出", () => {
    it.each([
      { query: "AとBの違い", hint: "comparison" },
      { query: "AとBの比較", hint: "comparison" },
      { query: "difference between A and B", hint: "comparison" },
      { query: "compare A and B", hint: "comparison" },
    ])("'$query' のヒントは 'comparison'", async ({ query }) => {
      const result = await classifier.classify(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.relationHint).toBe("comparison");
      }
    });

    it.each([
      { query: "AとBの関係", hint: "association" },
      { query: "AとBはどう関連", hint: "association" },
      { query: "relationship between A and B", hint: "association" },
    ])("'$query' のヒントは 'association'", async ({ query }) => {
      const result = await classifier.classify(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.relationHint).toBe("association");
      }
    });

    it.each([
      { query: "AがBに与える影響", hint: "causation" },
      { query: "how does A affect B", hint: "causation" },
      { query: "how does A impact B", hint: "causation" },
      { query: "なぜAがBを", hint: "causation" },
    ])("'$query' のヒントは 'causation'", async ({ query }) => {
      const result = await classifier.classify(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.relationHint).toBe("causation");
      }
    });
  });

  describe("ローカルクエリ（デフォルト）", () => {
    it.each([
      "Reactとは",
      "useStateの使い方",
      "GraphQLについて",
      "Dockerとは何ですか",
      "TypeScriptの型システム",
      "what is React",
      "explain useState",
      "how to use Docker",
    ])("'%s' をlocalに分類する", async (query) => {
      const result = await classifier.classify(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("local");
      }
    });
  });

  describe("エンティティ抽出（ローカル）", () => {
    it("英語の固有名詞を抽出する", async () => {
      const result = await classifier.classify("React Hooksについて");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedEntities).toContain("React Hooks");
      }
    });

    it("カタカナ語を抽出する", async () => {
      const result = await classifier.classify("コンポーネントの設計パターン");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedEntities).toContain("コンポーネント");
        expect(result.data.extractedEntities).toContain("パターン");
      }
    });

    it("複数のカタカナ語を抽出する", async () => {
      const result =
        await classifier.classify("レンダリングとパフォーマンスについて");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.extractedEntities).toContain("レンダリング");
        expect(result.data.extractedEntities).toContain("パフォーマンス");
      }
    });
  });

  describe("キーワード抽出", () => {
    it("日本語のストップワードを除去する", async () => {
      const result = await classifier.classify("Reactについて教えてください");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.keywords).not.toContain("について");
        expect(result.data.keywords).not.toContain("ください");
        expect(result.data.keywords).not.toContain("て");
      }
    });

    it("英語のストップワードを除去する", async () => {
      const result = await classifier.classify("What is the concept of React?");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.keywords).not.toContain("What");
        expect(result.data.keywords).not.toContain("is");
        expect(result.data.keywords).not.toContain("the");
        expect(result.data.keywords).not.toContain("of");
      }
    });

    it("1文字のワードを除去する", async () => {
      const result = await classifier.classify("A B C について");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.keywords).not.toContain("A");
        expect(result.data.keywords).not.toContain("B");
        expect(result.data.keywords).not.toContain("C");
      }
    });
  });

  describe("信頼度", () => {
    it("グローバルパターンマッチの信頼度は0.7以上", async () => {
      const result = await classifier.classify("全体のテーマは？");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.confidence).toBeGreaterThanOrEqual(0.7);
      }
    });

    it("関係性パターンマッチの信頼度は0.7以上", async () => {
      const result = await classifier.classify("ReactとVueの違い");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.confidence).toBeGreaterThanOrEqual(0.7);
      }
    });

    it("ローカル（デフォルト）の信頼度は0.5", async () => {
      const result = await classifier.classify("TypeScriptについて");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.confidence).toBe(0.5);
      }
    });
  });

  describe("意図（intent）生成", () => {
    it("グローバルクエリの意図を生成する", async () => {
      const result = await classifier.classify("全体のテーマは？");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.intent).toContain("全体");
      }
    });

    it("関係性クエリの意図にエンティティを含む", async () => {
      const result = await classifier.classify("ReactとVueの違い");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.intent).toContain("React");
        expect(result.data.intent).toContain("Vue");
      }
    });

    it("ローカルクエリの意図にエンティティを含む", async () => {
      const result = await classifier.classify("TypeScriptについて");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.intent).toContain("TypeScript");
      }
    });
  });
});
