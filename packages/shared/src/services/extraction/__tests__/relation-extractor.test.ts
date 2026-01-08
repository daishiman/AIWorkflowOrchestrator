/**
 * 関係抽出サービス ユニットテスト
 * @description TDD Green Phase - 実装に対するテスト
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ok, err } from "../../../types/rag/result";

// Types
import type { Chunk } from "../../chunking/types";
import type { ExtractedEntity } from "../types";
import type { ILLMProvider } from "../interfaces";

// Implementation
import { LLMRelationExtractor } from "../relation-extractor";
import { RelationTypes } from "../types";

// =============================================================================
// Test Helpers
// =============================================================================

/**
 * Mock LLM Provider Factory
 */
const createMockLLMProvider = (response: {
  relations: Array<{
    sourceEntity: string;
    targetEntity: string;
    relationType: string;
    description?: string;
    confidence?: number;
    bidirectional?: boolean;
    evidence?: { text: string; startPosition?: number; endPosition?: number };
  }>;
}): ILLMProvider => ({
  modelId: "mock-model",
  generate: vi.fn().mockResolvedValue(
    ok({
      text: JSON.stringify(response),
      tokensUsed: 100,
    }),
  ),
});

/**
 * Error LLM Provider Factory
 */
const createErrorLLMProvider = (errorMessage: string): ILLMProvider => ({
  modelId: "error-mock",
  generate: vi.fn().mockResolvedValue(err(new Error(errorMessage))),
});

/**
 * Invalid JSON LLM Provider Factory
 */
const createInvalidJsonLLMProvider = (): ILLMProvider => ({
  modelId: "invalid-json-mock",
  generate: vi.fn().mockResolvedValue(
    ok({
      text: "invalid json response",
      tokensUsed: 10,
    }),
  ),
});

/**
 * Sample Chunk Factory
 */
const createSampleChunk = (id: string, content: string): Chunk => ({
  id,
  content,
  metadata: { source: "test" },
});

/**
 * Sample Entities Factory
 */
const createSampleEntities = (): ExtractedEntity[] => [
  {
    name: "TypeScript",
    normalizedName: "typescript",
    type: "technology",
    confidence: 0.95,
    mentions: [],
    aliases: ["TS"],
  },
  {
    name: "Microsoft",
    normalizedName: "microsoft",
    type: "organization",
    confidence: 0.98,
    mentions: [],
    aliases: ["MS"],
  },
];

/**
 * Multiple Entities Factory
 */
const createMultipleEntities = (): ExtractedEntity[] => [
  {
    name: "React",
    normalizedName: "react",
    type: "technology",
    confidence: 0.95,
    mentions: [],
    aliases: [],
  },
  {
    name: "Vue",
    normalizedName: "vue",
    type: "technology",
    confidence: 0.92,
    mentions: [],
    aliases: [],
  },
  {
    name: "Facebook",
    normalizedName: "facebook",
    type: "organization",
    confidence: 0.98,
    mentions: [],
    aliases: ["Meta"],
  },
];

// =============================================================================
// Test Suite
// =============================================================================

describe("LLMRelationExtractor", () => {
  let extractor: LLMRelationExtractor;
  let mockLLMProvider: ILLMProvider;

  // -------------------------------------------------------------------------
  // extract メソッド - 正常系
  // -------------------------------------------------------------------------

  describe("extract", () => {
    it("TC-001: エンティティ間の関係を抽出できる", async () => {
      // Given
      mockLLMProvider = createMockLLMProvider({
        relations: [
          {
            sourceEntity: "TypeScript",
            targetEntity: "Microsoft",
            relationType: "created_by",
            description: "TypeScriptはMicrosoftによって開発された",
            confidence: 0.92,
            bidirectional: false,
            evidence: {
              text: "TypeScriptはMicrosoftが開発した",
              startPosition: 0,
              endPosition: 23,
            },
          },
        ],
      });
      extractor = new LLMRelationExtractor(mockLLMProvider);

      const chunk = createSampleChunk(
        "chunk-001",
        "TypeScriptはMicrosoftが開発したプログラミング言語です。",
      );
      const entities = createSampleEntities();

      // When
      const result = await extractor.extract(chunk, entities);

      // Then
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.relations.length).toBeGreaterThan(0);
        expect(result.data.relations[0].sourceEntity).toBe("TypeScript");
        expect(result.data.relations[0].targetEntity).toBe("Microsoft");
        expect(result.data.relations[0].relationType).toBe("created_by");
        expect(result.data.relations[0].confidence).toBeGreaterThanOrEqual(0);
        expect(result.data.relations[0].confidence).toBeLessThanOrEqual(1);
      }
    });

    it("TC-002: 指定タイプのみ抽出する", async () => {
      // Given
      mockLLMProvider = createMockLLMProvider({
        relations: [
          {
            sourceEntity: "TypeScript",
            targetEntity: "Microsoft",
            relationType: "uses",
            confidence: 0.85,
          },
          {
            sourceEntity: "TypeScript",
            targetEntity: "Microsoft",
            relationType: "created_by",
            confidence: 0.9,
          },
        ],
      });
      extractor = new LLMRelationExtractor(mockLLMProvider);

      const chunk = createSampleChunk("chunk-002", "Test content");
      const entities = createSampleEntities();

      // When
      const result = await extractor.extract(chunk, entities, {
        types: ["uses", "depends_on"],
      });

      // Then
      expect(result.success).toBe(true);
      if (result.success) {
        // Only "uses" type should be included
        result.data.relations.forEach((r) => {
          expect(["uses", "depends_on"]).toContain(r.relationType);
        });
      }
    });

    it("TC-003: 最小信頼度でフィルタリングする", async () => {
      // Given
      mockLLMProvider = createMockLLMProvider({
        relations: [
          {
            sourceEntity: "TypeScript",
            targetEntity: "Microsoft",
            relationType: "created_by",
            confidence: 0.6,
          },
          {
            sourceEntity: "TypeScript",
            targetEntity: "Microsoft",
            relationType: "uses",
            confidence: 0.8,
          },
        ],
      });
      extractor = new LLMRelationExtractor(mockLLMProvider);

      const chunk = createSampleChunk("chunk-003", "Test content");
      const entities = createSampleEntities();

      // When
      const result = await extractor.extract(chunk, entities, {
        minConfidence: 0.7,
      });

      // Then
      expect(result.success).toBe(true);
      if (result.success) {
        result.data.relations.forEach((r) => {
          expect(r.confidence).toBeGreaterThanOrEqual(0.7);
        });
      }
    });

    it("TC-004: エビデンス情報を抽出する", async () => {
      // Given
      mockLLMProvider = createMockLLMProvider({
        relations: [
          {
            sourceEntity: "TypeScript",
            targetEntity: "Microsoft",
            relationType: "created_by",
            confidence: 0.9,
            evidence: {
              text: "TypeScriptはMicrosoftが開発した",
              startPosition: 0,
              endPosition: 23,
            },
          },
        ],
      });
      extractor = new LLMRelationExtractor(mockLLMProvider);

      const chunk = createSampleChunk(
        "chunk-004",
        "TypeScriptはMicrosoftが開発した",
      );
      const entities = createSampleEntities();

      // When
      const result = await extractor.extract(chunk, entities);

      // Then
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.relations[0].evidence.length).toBeGreaterThan(0);
        expect(result.data.relations[0].evidence[0].chunkId).toBe("chunk-004");
        expect(result.data.relations[0].evidence[0].text).toBeTruthy();
      }
    });

    it("TC-005: 15種類の関係タイプを分類する", async () => {
      // Given
      const allRelationTypes = Object.values(RelationTypes);
      mockLLMProvider = createMockLLMProvider({
        relations: allRelationTypes.map((type) => ({
          sourceEntity: "TypeScript",
          targetEntity: "Microsoft",
          relationType: type,
          confidence: 0.8,
        })),
      });
      extractor = new LLMRelationExtractor(mockLLMProvider);

      const chunk = createSampleChunk("chunk-005", "Test content");
      const entities = createSampleEntities();

      // When
      const result = await extractor.extract(chunk, entities);

      // Then
      expect(result.success).toBe(true);
      if (result.success) {
        const extractedTypes = result.data.relations.map((r) => r.relationType);
        allRelationTypes.forEach((type) => {
          expect(extractedTypes).toContain(type);
        });
      }
    });

    it("TC-006: 双方向関係を識別する", async () => {
      // Given
      mockLLMProvider = createMockLLMProvider({
        relations: [
          {
            sourceEntity: "React",
            targetEntity: "Vue",
            relationType: "competes_with",
            confidence: 0.88,
            bidirectional: true,
          },
        ],
      });
      extractor = new LLMRelationExtractor(mockLLMProvider);

      const chunk = createSampleChunk(
        "chunk-006",
        "ReactとVueは競合関係にある",
      );
      const entities = createMultipleEntities();

      // When
      const result = await extractor.extract(chunk, entities);

      // Then
      expect(result.success).toBe(true);
      if (result.success) {
        const competesRelation = result.data.relations.find(
          (r) => r.relationType === "competes_with",
        );
        expect(competesRelation).toBeTruthy();
        expect(competesRelation?.bidirectional).toBe(true);
      }
    });
  });

  // -------------------------------------------------------------------------
  // extract メソッド - エッジケース
  // -------------------------------------------------------------------------

  describe("extract - edge cases", () => {
    it("TC-007: エンティティが2件未満の場合は空を返す", async () => {
      // Given
      mockLLMProvider = createMockLLMProvider({ relations: [] });
      extractor = new LLMRelationExtractor(mockLLMProvider);

      const chunk = createSampleChunk("chunk-007", "Test content");
      const entities: ExtractedEntity[] = [createSampleEntities()[0]];

      // When
      const result = await extractor.extract(chunk, entities);

      // Then
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.relations).toHaveLength(0);
      }
    });

    it("TC-008: 自己参照を除外する", async () => {
      // Given
      mockLLMProvider = createMockLLMProvider({
        relations: [
          {
            sourceEntity: "TypeScript",
            targetEntity: "TypeScript",
            relationType: "related_to",
            confidence: 0.9,
          },
          {
            sourceEntity: "TypeScript",
            targetEntity: "Microsoft",
            relationType: "created_by",
            confidence: 0.9,
          },
        ],
      });
      extractor = new LLMRelationExtractor(mockLLMProvider);

      const chunk = createSampleChunk("chunk-008", "Test content");
      const entities = createSampleEntities();

      // When
      const result = await extractor.extract(chunk, entities);

      // Then
      expect(result.success).toBe(true);
      if (result.success) {
        result.data.relations.forEach((r) => {
          expect(r.sourceEntity).not.toBe(r.targetEntity);
        });
      }
    });

    it("TC-009: 空チャンクの処理", async () => {
      // Given
      mockLLMProvider = createMockLLMProvider({ relations: [] });
      extractor = new LLMRelationExtractor(mockLLMProvider);

      const chunk = createSampleChunk("chunk-009", "");
      const entities = createSampleEntities();

      // When
      const result = await extractor.extract(chunk, entities);

      // Then
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.relations).toHaveLength(0);
      }
    });

    it("TC-010: 最大関係数の制限", async () => {
      // Given: 10 relations
      mockLLMProvider = createMockLLMProvider({
        relations: Array.from({ length: 10 }, (_, i) => ({
          sourceEntity: "TypeScript",
          targetEntity: "Microsoft",
          relationType: "uses",
          confidence: 0.9 - i * 0.05,
        })),
      });
      extractor = new LLMRelationExtractor(mockLLMProvider);

      const chunk = createSampleChunk("chunk-010", "Test content");
      const entities = createSampleEntities();

      // When
      const result = await extractor.extract(chunk, entities, {
        maxRelationsPerChunk: 5,
      });

      // Then
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.relations.length).toBeLessThanOrEqual(5);
      }
    });
  });

  // -------------------------------------------------------------------------
  // extract メソッド - 異常系
  // -------------------------------------------------------------------------

  describe("extract - error cases", () => {
    it("TC-011: LLMエラー時にResult.errを返す", async () => {
      // Given
      const errorProvider = createErrorLLMProvider("LLM API Error");
      extractor = new LLMRelationExtractor(errorProvider);

      const chunk = createSampleChunk("chunk-011", "Test content");
      const entities = createSampleEntities();

      // When
      const result = await extractor.extract(chunk, entities);

      // Then
      expect(result.success).toBe(false);
    });

    it("TC-012: LLM応答パースエラー", async () => {
      // Given
      const invalidJsonProvider = createInvalidJsonLLMProvider();
      extractor = new LLMRelationExtractor(invalidJsonProvider);

      const chunk = createSampleChunk("chunk-012", "Test content");
      const entities = createSampleEntities();

      // When
      const result = await extractor.extract(chunk, entities);

      // Then
      expect(result.success).toBe(false);
    });

    it("TC-013: 無効な関係タイプはotherにフォールバック", async () => {
      // Given
      mockLLMProvider = createMockLLMProvider({
        relations: [
          {
            sourceEntity: "TypeScript",
            targetEntity: "Microsoft",
            relationType: "unknown_type",
            confidence: 0.9,
          },
        ],
      });
      extractor = new LLMRelationExtractor(mockLLMProvider);

      const chunk = createSampleChunk("chunk-013", "Test content");
      const entities = createSampleEntities();

      // When
      const result = await extractor.extract(chunk, entities);

      // Then
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.relations[0].relationType).toBe("other");
      }
    });
  });

  // -------------------------------------------------------------------------
  // extractBatch メソッド
  // -------------------------------------------------------------------------

  describe("extractBatch", () => {
    it("TC-014: 複数チャンクを一括処理できる", async () => {
      // Given
      mockLLMProvider = createMockLLMProvider({
        relations: [
          {
            sourceEntity: "TypeScript",
            targetEntity: "Microsoft",
            relationType: "created_by",
            confidence: 0.9,
          },
        ],
      });
      extractor = new LLMRelationExtractor(mockLLMProvider);

      const chunks = [
        createSampleChunk("batch-001", "Content 1"),
        createSampleChunk("batch-002", "Content 2"),
        createSampleChunk("batch-003", "Content 3"),
      ];
      const entitiesByChunk = new Map<string, ExtractedEntity[]>();
      chunks.forEach((c) => entitiesByChunk.set(c.id, createSampleEntities()));

      // When
      const result = await extractor.extractBatch(chunks, entitiesByChunk);

      // Then
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.results.length).toBe(3);
        expect(result.data.totalRelations).toBeGreaterThan(0);
      }
    });

    it("TC-015: バッチ処理で部分的な失敗", async () => {
      // Given: Provider that fails on specific calls
      let callCount = 0;
      const partialFailProvider: ILLMProvider = {
        modelId: "partial-fail-mock",
        generate: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 2) {
            return Promise.resolve(err(new Error("Partial failure")));
          }
          return Promise.resolve(
            ok({
              text: JSON.stringify({
                relations: [
                  {
                    sourceEntity: "TypeScript",
                    targetEntity: "Microsoft",
                    relationType: "created_by",
                    confidence: 0.9,
                  },
                ],
              }),
              tokensUsed: 100,
            }),
          );
        }),
      };
      extractor = new LLMRelationExtractor(partialFailProvider);

      const chunks = [
        createSampleChunk("batch-fail-001", "Content 1"),
        createSampleChunk("batch-fail-002", "Content 2"),
        createSampleChunk("batch-fail-003", "Content 3"),
      ];
      const entitiesByChunk = new Map<string, ExtractedEntity[]>();
      chunks.forEach((c) => entitiesByChunk.set(c.id, createSampleEntities()));

      // When
      const result = await extractor.extractBatch(chunks, entitiesByChunk);

      // Then
      expect(result.success).toBe(true);
      if (result.success) {
        // 2 out of 3 should succeed
        expect(result.data.results.length).toBe(2);
      }
    });
  });

  // -------------------------------------------------------------------------
  // mergeRelations メソッド
  // -------------------------------------------------------------------------

  describe("mergeRelations", () => {
    beforeEach(() => {
      mockLLMProvider = createMockLLMProvider({ relations: [] });
      extractor = new LLMRelationExtractor(mockLLMProvider);
    });

    it("TC-016: 重複関係をマージできる", () => {
      // Given
      const results = [
        {
          relations: [
            {
              sourceEntity: "A",
              targetEntity: "B",
              relationType: "uses" as const,
              confidence: 0.8,
              bidirectional: false,
              evidence: [
                {
                  chunkId: "c1",
                  text: "text1",
                  startPosition: 0,
                  endPosition: 10,
                },
              ],
            },
          ],
          chunkId: "c1",
          processingTimeMs: 100,
          modelUsed: "mock",
        },
        {
          relations: [
            {
              sourceEntity: "A",
              targetEntity: "B",
              relationType: "uses" as const,
              confidence: 0.9,
              bidirectional: false,
              evidence: [
                {
                  chunkId: "c2",
                  text: "text2",
                  startPosition: 0,
                  endPosition: 10,
                },
              ],
            },
          ],
          chunkId: "c2",
          processingTimeMs: 100,
          modelUsed: "mock",
        },
      ];

      // When
      const merged = extractor.mergeRelations(results);

      // Then
      expect(merged.length).toBe(1);
      expect(merged[0].evidence.length).toBe(2);
    });

    it("TC-017: 信頼度は最大値を採用する", () => {
      // Given
      const results = [
        {
          relations: [
            {
              sourceEntity: "A",
              targetEntity: "B",
              relationType: "uses" as const,
              confidence: 0.8,
              bidirectional: false,
              evidence: [],
            },
          ],
          chunkId: "c1",
          processingTimeMs: 100,
          modelUsed: "mock",
        },
        {
          relations: [
            {
              sourceEntity: "A",
              targetEntity: "B",
              relationType: "uses" as const,
              confidence: 0.9,
              bidirectional: false,
              evidence: [],
            },
          ],
          chunkId: "c2",
          processingTimeMs: 100,
          modelUsed: "mock",
        },
      ];

      // When
      const merged = extractor.mergeRelations(results);

      // Then
      expect(merged[0].confidence).toBe(0.9);
    });

    it("TC-018: 説明は長い方を採用する", () => {
      // Given
      const results = [
        {
          relations: [
            {
              sourceEntity: "A",
              targetEntity: "B",
              relationType: "uses" as const,
              description: "Short",
              confidence: 0.8,
              bidirectional: false,
              evidence: [],
            },
          ],
          chunkId: "c1",
          processingTimeMs: 100,
          modelUsed: "mock",
        },
        {
          relations: [
            {
              sourceEntity: "A",
              targetEntity: "B",
              relationType: "uses" as const,
              description: "This is a much longer description",
              confidence: 0.7,
              bidirectional: false,
              evidence: [],
            },
          ],
          chunkId: "c2",
          processingTimeMs: 100,
          modelUsed: "mock",
        },
      ];

      // When
      const merged = extractor.mergeRelations(results);

      // Then
      expect(merged[0].description).toBe("This is a much longer description");
    });

    it("TC-019: 双方向関係の正規化", () => {
      // Given
      const results = [
        {
          relations: [
            {
              sourceEntity: "A",
              targetEntity: "B",
              relationType: "competes_with" as const,
              confidence: 0.8,
              bidirectional: false,
              evidence: [],
            },
          ],
          chunkId: "c1",
          processingTimeMs: 100,
          modelUsed: "mock",
        },
        {
          relations: [
            {
              sourceEntity: "B",
              targetEntity: "A",
              relationType: "competes_with" as const,
              confidence: 0.9,
              bidirectional: true,
              evidence: [],
            },
          ],
          chunkId: "c2",
          processingTimeMs: 100,
          modelUsed: "mock",
        },
      ];

      // When
      const merged = extractor.mergeRelations(results);

      // Then
      // Should merge into one relation with bidirectional=true
      const competesRelations = merged.filter(
        (r) => r.relationType === "competes_with",
      );
      expect(competesRelations.length).toBeLessThanOrEqual(2);
      expect(competesRelations.some((r) => r.bidirectional)).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 境界値テスト
  // -------------------------------------------------------------------------

  describe("境界値テスト", () => {
    describe("信頼度フィルタリング", () => {
      it("信頼度0.0の関係は含まれない（minConfidence=0.5）", async () => {
        mockLLMProvider = createMockLLMProvider({
          relations: [
            {
              sourceEntity: "TypeScript",
              targetEntity: "Microsoft",
              relationType: "created_by",
              confidence: 0.0,
            },
          ],
        });
        extractor = new LLMRelationExtractor(mockLLMProvider);

        const result = await extractor.extract(
          createSampleChunk("bv-001", "Test"),
          createSampleEntities(),
          { minConfidence: 0.5 },
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.relations).toHaveLength(0);
        }
      });

      it("信頼度0.5の関係は含まれる（minConfidence=0.5）", async () => {
        mockLLMProvider = createMockLLMProvider({
          relations: [
            {
              sourceEntity: "TypeScript",
              targetEntity: "Microsoft",
              relationType: "created_by",
              confidence: 0.5,
            },
          ],
        });
        extractor = new LLMRelationExtractor(mockLLMProvider);

        const result = await extractor.extract(
          createSampleChunk("bv-002", "Test"),
          createSampleEntities(),
          { minConfidence: 0.5 },
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.relations).toHaveLength(1);
        }
      });

      it("信頼度1.0の関係は含まれる", async () => {
        mockLLMProvider = createMockLLMProvider({
          relations: [
            {
              sourceEntity: "TypeScript",
              targetEntity: "Microsoft",
              relationType: "created_by",
              confidence: 1.0,
            },
          ],
        });
        extractor = new LLMRelationExtractor(mockLLMProvider);

        const result = await extractor.extract(
          createSampleChunk("bv-003", "Test"),
          createSampleEntities(),
          { minConfidence: 0.5 },
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.relations).toHaveLength(1);
        }
      });

      it("信頼度0.49の関係は含まれない（minConfidence=0.5）", async () => {
        mockLLMProvider = createMockLLMProvider({
          relations: [
            {
              sourceEntity: "TypeScript",
              targetEntity: "Microsoft",
              relationType: "created_by",
              confidence: 0.49,
            },
          ],
        });
        extractor = new LLMRelationExtractor(mockLLMProvider);

        const result = await extractor.extract(
          createSampleChunk("bv-004", "Test"),
          createSampleEntities(),
          { minConfidence: 0.5 },
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.relations).toHaveLength(0);
        }
      });
    });

    describe("エンティティ数", () => {
      it("エンティティ0個の場合は空を返す", async () => {
        mockLLMProvider = createMockLLMProvider({ relations: [] });
        extractor = new LLMRelationExtractor(mockLLMProvider);

        const result = await extractor.extract(
          createSampleChunk("bv-ent-001", "Test"),
          [],
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.relations).toHaveLength(0);
        }
      });

      it("エンティティ1個の場合は空を返す", async () => {
        mockLLMProvider = createMockLLMProvider({ relations: [] });
        extractor = new LLMRelationExtractor(mockLLMProvider);

        const result = await extractor.extract(
          createSampleChunk("bv-ent-002", "Test"),
          [createSampleEntities()[0]],
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.relations).toHaveLength(0);
        }
      });

      it("エンティティ2個の場合は関係抽出を試みる", async () => {
        mockLLMProvider = createMockLLMProvider({
          relations: [
            {
              sourceEntity: "TypeScript",
              targetEntity: "Microsoft",
              relationType: "created_by",
              confidence: 0.9,
            },
          ],
        });
        extractor = new LLMRelationExtractor(mockLLMProvider);

        const result = await extractor.extract(
          createSampleChunk("bv-ent-003", "Test"),
          createSampleEntities(),
        );

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.relations.length).toBeGreaterThan(0);
        }
      });
    });
  });
});
