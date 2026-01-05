/**
 * LLMEntityExtractor テスト
 * @description TDD Red Phase - 実装前のテスト作成
 */

import { describe, it, expect } from "vitest";
import { LLMEntityExtractor } from "../entity-extractor";
import type { EntityExtractionOptionsInput } from "../types";
import {
  createMockLLMProvider,
  createErrorMockLLMProvider,
  createInvalidJsonMockLLMProvider,
  defaultMockEntities,
} from "./mocks/llm-provider.mock";
import type { Chunk } from "../../chunking/types";

// テスト用チャンク
const createMockChunk = (content: string, id: string = "chunk-1"): Chunk => ({
  id,
  content,
  tokenCount: content.split(/\s+/).length,
  position: { start: 0, end: content.length },
  metadata: { strategy: "fixed" as const },
});

describe("LLMEntityExtractor", () => {
  describe("extract", () => {
    it("テキストからエンティティを抽出できる", async () => {
      const mockProvider = createMockLLMProvider(defaultMockEntities);
      const extractor = new LLMEntityExtractor(mockProvider);
      const chunk = createMockChunk(
        "TypeScriptはMicrosoftが開発したプログラミング言語です。",
      );

      const result = await extractor.extract(chunk);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.entities.length).toBeGreaterThan(0);
        expect(result.data.chunkId).toBe("chunk-1");
        expect(result.data.processingTimeMs).toBeGreaterThanOrEqual(0);
        expect(result.data.modelUsed).toBe("mock-model-1.0");
      }
    });

    it("指定タイプのみ抽出できる", async () => {
      const mockProvider = createMockLLMProvider(defaultMockEntities);
      const extractor = new LLMEntityExtractor(mockProvider);
      const chunk = createMockChunk(
        "TypeScriptとReactを使用して、Microsoftのプロジェクトを構築。",
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

    it("信頼度でフィルタリングできる", async () => {
      const mockProvider = createMockLLMProvider(defaultMockEntities);
      const extractor = new LLMEntityExtractor(mockProvider);
      const chunk = createMockChunk("TypeScript and React development.");
      const options: EntityExtractionOptionsInput = {
        minConfidence: 0.9,
      };

      const result = await extractor.extract(chunk, options);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.entities.every((e) => e.confidence >= 0.9)).toBe(
          true,
        );
      }
    });

    it("最大抽出数を制限できる", async () => {
      const mockProvider = createMockLLMProvider(defaultMockEntities);
      const extractor = new LLMEntityExtractor(mockProvider);
      const chunk = createMockChunk("Multiple entities in text.");
      const options: EntityExtractionOptionsInput = {
        maxEntitiesPerChunk: 2,
      };

      const result = await extractor.extract(chunk, options);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.entities.length).toBeLessThanOrEqual(2);
      }
    });

    it("説明を生成できる", async () => {
      const mockProvider = createMockLLMProvider(defaultMockEntities);
      const extractor = new LLMEntityExtractor(mockProvider);
      const chunk = createMockChunk("TypeScript programming language.");
      const options: EntityExtractionOptionsInput = {
        generateDescriptions: true,
      };

      const result = await extractor.extract(chunk, options);

      expect(result.success).toBe(true);
      if (result.success) {
        const entityWithDescription = result.data.entities.find(
          (e) => e.description,
        );
        expect(entityWithDescription).toBeDefined();
      }
    });

    it("エイリアスを抽出できる", async () => {
      const mockProvider = createMockLLMProvider(defaultMockEntities);
      const extractor = new LLMEntityExtractor(mockProvider);
      const chunk = createMockChunk("TypeScript (TS) is a language.");

      const result = await extractor.extract(chunk);

      expect(result.success).toBe(true);
      if (result.success) {
        const tsEntity = result.data.entities.find(
          (e) => e.normalizedName === "typescript",
        );
        expect(tsEntity?.aliases).toBeDefined();
      }
    });

    it("メンション情報を含める", async () => {
      const mockProvider = createMockLLMProvider(defaultMockEntities);
      const extractor = new LLMEntityExtractor(mockProvider);
      const chunk = createMockChunk("TypeScriptはTypeScriptの機能を活用する。");

      const result = await extractor.extract(chunk);

      expect(result.success).toBe(true);
      if (result.success) {
        const entity = result.data.entities[0];
        expect(entity.mentions).toBeDefined();
        expect(entity.mentions.length).toBeGreaterThan(0);
        expect(entity.mentions[0].chunkId).toBe("chunk-1");
        expect(entity.mentions[0].startPosition).toBeGreaterThanOrEqual(0);
        expect(entity.mentions[0].context).toBeDefined();
      }
    });

    it("LLMエラー時にエラーを返す", async () => {
      const mockProvider = createErrorMockLLMProvider("LLM API Error");
      const extractor = new LLMEntityExtractor(mockProvider);
      const chunk = createMockChunk("Some text.");

      const result = await extractor.extract(chunk);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("不正なJSONレスポンス時にエラーを返す", async () => {
      const mockProvider = createInvalidJsonMockLLMProvider();
      const extractor = new LLMEntityExtractor(mockProvider);
      const chunk = createMockChunk("Some text.");

      const result = await extractor.extract(chunk);

      expect(result.success).toBe(false);
    });

    it("空のチャンクでも処理できる", async () => {
      const mockProvider = createMockLLMProvider([]);
      const extractor = new LLMEntityExtractor(mockProvider);
      const chunk = createMockChunk("");

      const result = await extractor.extract(chunk);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.entities).toEqual([]);
      }
    });

    it("最小名前長でフィルタリングできる", async () => {
      const mockEntitiesWithShortName = [
        ...defaultMockEntities,
        {
          name: "A",
          normalizedName: "a",
          type: "other",
          confidence: 0.9,
        },
      ];
      const mockProvider = createMockLLMProvider(mockEntitiesWithShortName);
      const extractor = new LLMEntityExtractor(mockProvider);
      const chunk = createMockChunk("A and TypeScript.");
      const options: EntityExtractionOptionsInput = {
        minNameLength: 2,
      };

      const result = await extractor.extract(chunk, options);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.entities.every((e) => e.name.length >= 2)).toBe(
          true,
        );
      }
    });
  });

  describe("extractBatch", () => {
    it("複数チャンクからバッチ抽出できる", async () => {
      const mockProvider = createMockLLMProvider(defaultMockEntities);
      const extractor = new LLMEntityExtractor(mockProvider);
      const chunks = [
        createMockChunk("TypeScript code.", "chunk-1"),
        createMockChunk("React component.", "chunk-2"),
        createMockChunk("Microsoft Azure.", "chunk-3"),
      ];

      const result = await extractor.extractBatch(chunks);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.results.length).toBe(3);
        expect(result.data.totalEntities).toBeGreaterThan(0);
        expect(result.data.processingTimeMs).toBeGreaterThanOrEqual(0);
      }
    });

    it("エラー時もスキップして継続する", async () => {
      // First call succeeds, second fails, third succeeds
      let callCount = 0;
      const mockProvider = {
        modelId: "mock-partial-error",
        generate: async () => {
          callCount++;
          if (callCount === 2) {
            return { success: false, error: new Error("Partial error") };
          }
          return {
            success: true,
            data: {
              text: JSON.stringify({ entities: defaultMockEntities }),
              tokensUsed: 100,
            },
          };
        },
      };

      const extractor = new LLMEntityExtractor(mockProvider as any);
      const chunks = [
        createMockChunk("Chunk 1", "chunk-1"),
        createMockChunk("Chunk 2", "chunk-2"),
        createMockChunk("Chunk 3", "chunk-3"),
      ];

      const result = await extractor.extractBatch(chunks);

      expect(result.success).toBe(true);
      if (result.success) {
        // Should have 2 successful results (chunk 1 and 3)
        expect(result.data.results.length).toBe(2);
      }
    });

    it("空の配列を処理できる", async () => {
      const mockProvider = createMockLLMProvider(defaultMockEntities);
      const extractor = new LLMEntityExtractor(mockProvider);

      const result = await extractor.extractBatch([]);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.results).toEqual([]);
        expect(result.data.totalEntities).toBe(0);
      }
    });
  });

  describe("mergeEntities", () => {
    it("重複エンティティをマージできる", async () => {
      const mockProvider = createMockLLMProvider([]);
      const extractor = new LLMEntityExtractor(mockProvider);

      const results = [
        {
          entities: [
            {
              name: "TypeScript",
              normalizedName: "typescript",
              type: "technology" as const,
              confidence: 0.9,
              aliases: [],
              mentions: [
                {
                  chunkId: "chunk-1",
                  startPosition: 0,
                  endPosition: 10,
                  context: "TypeScript is...",
                },
              ],
            },
          ],
          chunkId: "chunk-1",
          processingTimeMs: 100,
          modelUsed: "mock",
        },
        {
          entities: [
            {
              name: "typescript",
              normalizedName: "typescript",
              type: "technology" as const,
              confidence: 0.8,
              aliases: ["TS"],
              mentions: [
                {
                  chunkId: "chunk-2",
                  startPosition: 5,
                  endPosition: 15,
                  context: "...typescript code",
                },
              ],
            },
          ],
          chunkId: "chunk-2",
          processingTimeMs: 100,
          modelUsed: "mock",
        },
      ];

      const merged = extractor.mergeEntities(results as any);

      expect(merged.length).toBe(1);
      expect(merged[0].normalizedName).toBe("typescript");
    });

    it("メンションを集約できる", async () => {
      const mockProvider = createMockLLMProvider([]);
      const extractor = new LLMEntityExtractor(mockProvider);

      const results = [
        {
          entities: [
            {
              name: "TypeScript",
              normalizedName: "typescript",
              type: "technology" as const,
              confidence: 0.9,
              aliases: [],
              mentions: [
                {
                  chunkId: "chunk-1",
                  startPosition: 0,
                  endPosition: 10,
                  context: "Context 1",
                },
              ],
            },
          ],
          chunkId: "chunk-1",
          processingTimeMs: 100,
          modelUsed: "mock",
        },
        {
          entities: [
            {
              name: "TypeScript",
              normalizedName: "typescript",
              type: "technology" as const,
              confidence: 0.85,
              aliases: [],
              mentions: [
                {
                  chunkId: "chunk-2",
                  startPosition: 20,
                  endPosition: 30,
                  context: "Context 2",
                },
              ],
            },
          ],
          chunkId: "chunk-2",
          processingTimeMs: 100,
          modelUsed: "mock",
        },
      ];

      const merged = extractor.mergeEntities(results as any);

      expect(merged[0].mentions.length).toBe(2);
    });

    it("信頼度は最大値を採用する", async () => {
      const mockProvider = createMockLLMProvider([]);
      const extractor = new LLMEntityExtractor(mockProvider);

      const results = [
        {
          entities: [
            {
              name: "TypeScript",
              normalizedName: "typescript",
              type: "technology" as const,
              confidence: 0.7,
              aliases: [],
              mentions: [],
            },
          ],
          chunkId: "chunk-1",
          processingTimeMs: 100,
          modelUsed: "mock",
        },
        {
          entities: [
            {
              name: "TypeScript",
              normalizedName: "typescript",
              type: "technology" as const,
              confidence: 0.95,
              aliases: [],
              mentions: [],
            },
          ],
          chunkId: "chunk-2",
          processingTimeMs: 100,
          modelUsed: "mock",
        },
      ];

      const merged = extractor.mergeEntities(results as any);

      expect(merged[0].confidence).toBe(0.95);
    });

    it("エイリアスをマージできる", async () => {
      const mockProvider = createMockLLMProvider([]);
      const extractor = new LLMEntityExtractor(mockProvider);

      const results = [
        {
          entities: [
            {
              name: "TypeScript",
              normalizedName: "typescript",
              type: "technology" as const,
              confidence: 0.9,
              aliases: ["TS"],
              mentions: [],
            },
          ],
          chunkId: "chunk-1",
          processingTimeMs: 100,
          modelUsed: "mock",
        },
        {
          entities: [
            {
              name: "TypeScript",
              normalizedName: "typescript",
              type: "technology" as const,
              confidence: 0.9,
              aliases: ["TypeScript Language"],
              mentions: [],
            },
          ],
          chunkId: "chunk-2",
          processingTimeMs: 100,
          modelUsed: "mock",
        },
      ];

      const merged = extractor.mergeEntities(results as any);

      expect(merged[0].aliases).toContain("TS");
      expect(merged[0].aliases).toContain("TypeScript Language");
    });

    it("説明は長い方を採用する", async () => {
      const mockProvider = createMockLLMProvider([]);
      const extractor = new LLMEntityExtractor(mockProvider);

      const results = [
        {
          entities: [
            {
              name: "TypeScript",
              normalizedName: "typescript",
              type: "technology" as const,
              confidence: 0.9,
              description: "A language",
              aliases: [],
              mentions: [],
            },
          ],
          chunkId: "chunk-1",
          processingTimeMs: 100,
          modelUsed: "mock",
        },
        {
          entities: [
            {
              name: "TypeScript",
              normalizedName: "typescript",
              type: "technology" as const,
              confidence: 0.9,
              description:
                "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript",
              aliases: [],
              mentions: [],
            },
          ],
          chunkId: "chunk-2",
          processingTimeMs: 100,
          modelUsed: "mock",
        },
      ];

      const merged = extractor.mergeEntities(results as any);

      expect(merged[0].description?.length).toBeGreaterThan(20);
    });
  });
});
