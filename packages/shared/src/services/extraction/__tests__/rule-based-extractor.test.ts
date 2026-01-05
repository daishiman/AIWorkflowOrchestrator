/**
 * RuleBasedEntityExtractor テスト
 * @description TDD Red Phase - 実装前のテスト作成
 */

import { describe, it, expect } from "vitest";
import { RuleBasedEntityExtractor } from "../rule-based-extractor";
import type { EntityExtractionOptionsInput } from "../types";
import type { Chunk } from "../../chunking/types";

// テスト用チャンク
const createMockChunk = (content: string, id: string = "chunk-1"): Chunk => ({
  id,
  content,
  tokenCount: content.split(/\s+/).length,
  position: { start: 0, end: content.length },
  metadata: { strategy: "fixed" as const },
});

describe("RuleBasedEntityExtractor", () => {
  describe("extract", () => {
    it("技術名を抽出できる", async () => {
      const extractor = new RuleBasedEntityExtractor();
      const chunk = createMockChunk(
        "ReactとVueはJavaScriptフレームワークです。TypeScriptも人気があります。",
      );

      const result = await extractor.extract(chunk);

      expect(result.success).toBe(true);
      if (result.success) {
        const names = result.data.entities.map((e) => e.name.toLowerCase());
        expect(names).toContain("react");
        expect(names).toContain("vue");
        expect(names).toContain("javascript");
        expect(names).toContain("typescript");
      }
    });

    it("組織名を抽出できる", async () => {
      const extractor = new RuleBasedEntityExtractor();
      const chunk = createMockChunk(
        "GoogleとMicrosoftはテック企業です。OpenAIはAI研究機関です。",
      );

      const result = await extractor.extract(chunk);

      expect(result.success).toBe(true);
      if (result.success) {
        const names = result.data.entities.map((e) => e.name.toLowerCase());
        expect(names).toContain("google");
        expect(names).toContain("microsoft");
        expect(names).toContain("openai");
      }
    });

    it("日付を抽出できる", async () => {
      const extractor = new RuleBasedEntityExtractor();
      const chunk = createMockChunk(
        "プロジェクトは2024-01-15に開始し、2024年12月31日に完了予定。",
      );

      const result = await extractor.extract(chunk);

      expect(result.success).toBe(true);
      if (result.success) {
        const dateEntities = result.data.entities.filter(
          (e) => e.type === "date",
        );
        expect(dateEntities.length).toBeGreaterThanOrEqual(1);
      }
    });

    it("重複を除外できる", async () => {
      const extractor = new RuleBasedEntityExtractor();
      const chunk = createMockChunk(
        "ReactはReactの機能を活用。ReactでUIを構築。",
      );

      const result = await extractor.extract(chunk);

      expect(result.success).toBe(true);
      if (result.success) {
        const reactEntities = result.data.entities.filter(
          (e) => e.normalizedName === "react",
        );
        expect(reactEntities.length).toBe(1);
      }
    });

    it("指定タイプのみ抽出できる", async () => {
      const extractor = new RuleBasedEntityExtractor();
      const chunk = createMockChunk(
        "Microsoft develops TypeScript. Released on 2024-01-15.",
      );
      const options: EntityExtractionOptionsInput = {
        types: ["technology"],
      };

      const result = await extractor.extract(chunk, options);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.entities.every((e) => e.type === "technology")).toBe(
          true,
        );
      }
    });

    it("最大抽出数を制限できる", async () => {
      const extractor = new RuleBasedEntityExtractor();
      const chunk = createMockChunk(
        "React, Vue, Angular, Next.js, TypeScript, JavaScript, Node.js",
      );
      const options: EntityExtractionOptionsInput = {
        maxEntitiesPerChunk: 3,
      };

      const result = await extractor.extract(chunk, options);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.entities.length).toBeLessThanOrEqual(3);
      }
    });

    it("メンション情報を含める", async () => {
      const extractor = new RuleBasedEntityExtractor();
      const chunk = createMockChunk("ReactでUIを作成。Reactは人気。");

      const result = await extractor.extract(chunk);

      expect(result.success).toBe(true);
      if (result.success) {
        const reactEntity = result.data.entities.find(
          (e) => e.normalizedName === "react",
        );
        expect(reactEntity?.mentions).toBeDefined();
        expect(reactEntity?.mentions.length).toBeGreaterThan(0);
        expect(reactEntity?.mentions[0].chunkId).toBe("chunk-1");
      }
    });

    it("空のテキストでも処理できる", async () => {
      const extractor = new RuleBasedEntityExtractor();
      const chunk = createMockChunk("");

      const result = await extractor.extract(chunk);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.entities).toEqual([]);
      }
    });

    it("パターンにマッチしないテキストでも処理できる", async () => {
      const extractor = new RuleBasedEntityExtractor();
      const chunk = createMockChunk(
        "これはパターンにマッチしないテキストです。",
      );

      const result = await extractor.extract(chunk);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.entities.length).toBe(0);
      }
    });

    it("処理時間を記録する", async () => {
      const extractor = new RuleBasedEntityExtractor();
      const chunk = createMockChunk("React and TypeScript.");

      const result = await extractor.extract(chunk);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.processingTimeMs).toBeGreaterThanOrEqual(0);
        expect(result.data.modelUsed).toBe("rule-based");
      }
    });
  });

  describe("extractBatch", () => {
    it("複数チャンクからバッチ抽出できる", async () => {
      const extractor = new RuleBasedEntityExtractor();
      const chunks = [
        createMockChunk("React development.", "chunk-1"),
        createMockChunk("Microsoft products.", "chunk-2"),
        createMockChunk("Release on 2024-01-15.", "chunk-3"),
      ];

      const result = await extractor.extractBatch(chunks);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.results.length).toBe(3);
        expect(result.data.totalEntities).toBeGreaterThan(0);
      }
    });

    it("空の配列を処理できる", async () => {
      const extractor = new RuleBasedEntityExtractor();

      const result = await extractor.extractBatch([]);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.results).toEqual([]);
      }
    });
  });

  describe("mergeEntities", () => {
    it("重複エンティティをマージできる", async () => {
      const extractor = new RuleBasedEntityExtractor();

      const results = [
        {
          entities: [
            {
              name: "React",
              normalizedName: "react",
              type: "technology" as const,
              confidence: 0.8,
              aliases: [],
              mentions: [
                {
                  chunkId: "chunk-1",
                  startPosition: 0,
                  endPosition: 5,
                  context: "React is...",
                },
              ],
            },
          ],
          chunkId: "chunk-1",
          processingTimeMs: 5,
          modelUsed: "rule-based",
        },
        {
          entities: [
            {
              name: "React",
              normalizedName: "react",
              type: "technology" as const,
              confidence: 0.8,
              aliases: [],
              mentions: [
                {
                  chunkId: "chunk-2",
                  startPosition: 10,
                  endPosition: 15,
                  context: "...using React",
                },
              ],
            },
          ],
          chunkId: "chunk-2",
          processingTimeMs: 5,
          modelUsed: "rule-based",
        },
      ];

      const merged = extractor.mergeEntities(results as any);

      expect(merged.length).toBe(1);
      expect(merged[0].mentions.length).toBe(2);
    });
  });
});
