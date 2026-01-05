/**
 * @file schemas.ts 単体テスト
 * @module @repo/shared/types/rag/chunk/schemas.test
 * @description チャンク・埋め込みZodスキーマのTDDテスト（Red フェーズ）
 *
 * TDD原則に従い、実装（schemas.ts）前にテストを作成。
 * 本テストは実装完了まで全て失敗する想定（Red状態）。
 *
 * テスト対象:
 * - 列挙型スキーマ（chunkingStrategySchema, embeddingProviderSchema）
 * - 基本インターフェーススキーマ（chunkPositionSchema, chunkOverlapSchema）
 * - 設定スキーマ（embeddingModelConfigSchema, chunkingConfigSchema）
 * - エンティティスキーマ（chunkEntitySchema, embeddingEntitySchema）
 * - 結果スキーマ（chunkingResultSchema, embeddingGenerationResultSchema）
 * - バッチ処理スキーマ（batchEmbeddingInputSchema）
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";

// テスト対象のインポート（schemas.ts がまだ存在しないため、テストは失敗する）
import {
  // 列挙型スキーマ
  chunkingStrategySchema,
  embeddingProviderSchema,
  // 基本インターフェーススキーマ
  chunkPositionSchema,
  chunkOverlapSchema,
  // 設定スキーマ
  embeddingModelConfigSchema,
  chunkingConfigSchema,
  // エンティティスキーマ
  chunkEntitySchema,
  embeddingEntitySchema,
  // 結果スキーマ
  chunkingResultSchema,
  embeddingGenerationResultSchema,
  batchEmbeddingInputSchema,
} from "./schemas";

// =============================================================================
// テストデータファクトリ
// =============================================================================

/**
 * 有効なUUID v4を生成
 */
const validUUID = "550e8400-e29b-41d4-a716-446655440000";

/**
 * 有効なSHA-256ハッシュ（64文字の16進数）
 */
const validHash = "a".repeat(64);

/**
 * 有効なChunkPositionデータを生成
 */
const createValidChunkPosition = () => ({
  index: 0,
  startLine: 1,
  endLine: 10,
  startChar: 0,
  endChar: 500,
  parentHeader: null,
});

/**
 * 有効なChunkEntityデータを生成
 */
const createValidChunkEntity = () => ({
  id: validUUID,
  fileId: validUUID,
  content: "This is a test chunk content",
  contextualContent: null,
  position: createValidChunkPosition(),
  strategy: "recursive" as const,
  tokenCount: 10,
  hash: validHash,
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
});

/**
 * 有効なEmbeddingEntityデータを生成
 */
const createValidEmbeddingEntity = () => ({
  id: validUUID,
  chunkId: validUUID,
  vector: [0.1, 0.2, 0.3], // Zodでは配列として扱う
  modelId: "text-embedding-3-small",
  dimensions: 3,
  normalizedMagnitude: 1.0,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// =============================================================================
// 1. 列挙型スキーマテスト
// =============================================================================

describe("chunkingStrategySchema", () => {
  describe("正常系", () => {
    const validStrategies = [
      "fixed_size",
      "semantic",
      "recursive",
      "sentence",
      "paragraph",
      "markdown_header",
      "code_block",
    ] as const;

    validStrategies.forEach((strategy) => {
      it(`should accept valid strategy: ${strategy}`, () => {
        const result = chunkingStrategySchema.safeParse(strategy);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(strategy);
        }
      });
    });
  });

  describe("異常系", () => {
    it("should reject invalid strategy string", () => {
      const result = chunkingStrategySchema.safeParse("invalid_strategy");
      expect(result.success).toBe(false);
    });

    it("should reject empty string", () => {
      const result = chunkingStrategySchema.safeParse("");
      expect(result.success).toBe(false);
    });

    it("should reject number", () => {
      const result = chunkingStrategySchema.safeParse(123);
      expect(result.success).toBe(false);
    });

    it("should reject null", () => {
      const result = chunkingStrategySchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it("should reject undefined", () => {
      const result = chunkingStrategySchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });
  });

  describe("エラーメッセージ", () => {
    it("should return Japanese error message for invalid value", () => {
      const result = chunkingStrategySchema.safeParse("invalid");
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        expect(errorMessage).toContain("チャンキング戦略");
        expect(errorMessage).toContain("fixed_size");
        expect(errorMessage).toContain("semantic");
        expect(errorMessage).toContain("recursive");
      }
    });
  });
});

describe("embeddingProviderSchema", () => {
  describe("正常系", () => {
    const validProviders = ["openai", "cohere", "voyage", "local"] as const;

    validProviders.forEach((provider) => {
      it(`should accept valid provider: ${provider}`, () => {
        const result = embeddingProviderSchema.safeParse(provider);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(provider);
        }
      });
    });
  });

  describe("異常系", () => {
    it("should reject invalid provider string", () => {
      const result = embeddingProviderSchema.safeParse("aws");
      expect(result.success).toBe(false);
    });

    it("should reject uppercase value", () => {
      const result = embeddingProviderSchema.safeParse("OPENAI");
      expect(result.success).toBe(false);
    });

    it("should reject empty string", () => {
      const result = embeddingProviderSchema.safeParse("");
      expect(result.success).toBe(false);
    });
  });

  describe("エラーメッセージ", () => {
    it("should return Japanese error message for invalid value", () => {
      const result = embeddingProviderSchema.safeParse("invalid");
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        expect(errorMessage).toContain("埋め込みプロバイダー");
        expect(errorMessage).toContain("openai");
        expect(errorMessage).toContain("cohere");
        expect(errorMessage).toContain("voyage");
        expect(errorMessage).toContain("local");
      }
    });
  });
});

// =============================================================================
// 2. 基本インターフェーススキーマテスト
// =============================================================================

describe("chunkPositionSchema", () => {
  describe("正常系", () => {
    it("should accept valid position with null parentHeader", () => {
      const result = chunkPositionSchema.safeParse(createValidChunkPosition());
      expect(result.success).toBe(true);
    });

    it("should accept valid position with string parentHeader", () => {
      const data = {
        ...createValidChunkPosition(),
        parentHeader: "## Introduction",
      };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept minimum valid values", () => {
      const data = {
        index: 0,
        startLine: 1,
        endLine: 1,
        startChar: 0,
        endChar: 0,
        parentHeader: null,
      };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("境界値テスト - index", () => {
    it("should accept index = 0 (minimum)", () => {
      const data = { ...createValidChunkPosition(), index: 0 };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject index = -1 (below minimum)", () => {
      const data = { ...createValidChunkPosition(), index: -1 };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject non-integer index", () => {
      const data = { ...createValidChunkPosition(), index: 0.5 };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("境界値テスト - startLine", () => {
    it("should accept startLine = 1 (minimum)", () => {
      const data = { ...createValidChunkPosition(), startLine: 1 };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject startLine = 0 (below minimum)", () => {
      const data = { ...createValidChunkPosition(), startLine: 0 };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject negative startLine", () => {
      const data = { ...createValidChunkPosition(), startLine: -1 };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("境界値テスト - endLine", () => {
    it("should accept endLine = 1 (minimum)", () => {
      const data = { ...createValidChunkPosition(), startLine: 1, endLine: 1 };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject endLine = 0 (below minimum)", () => {
      const data = { ...createValidChunkPosition(), endLine: 0 };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("境界値テスト - startChar", () => {
    it("should accept startChar = 0 (minimum)", () => {
      const data = { ...createValidChunkPosition(), startChar: 0 };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject startChar = -1 (below minimum)", () => {
      const data = { ...createValidChunkPosition(), startChar: -1 };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("境界値テスト - endChar", () => {
    it("should accept endChar = 0 (minimum)", () => {
      const data = { ...createValidChunkPosition(), startChar: 0, endChar: 0 };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject endChar = -1 (below minimum)", () => {
      const data = { ...createValidChunkPosition(), endChar: -1 };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("refine - endLine >= startLine", () => {
    it("should accept endLine = startLine", () => {
      const data = {
        ...createValidChunkPosition(),
        startLine: 5,
        endLine: 5,
      };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept endLine > startLine", () => {
      const data = {
        ...createValidChunkPosition(),
        startLine: 5,
        endLine: 10,
      };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject endLine < startLine", () => {
      const data = {
        ...createValidChunkPosition(),
        startLine: 10,
        endLine: 5,
      };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("refine - endChar >= startChar", () => {
    it("should accept endChar = startChar", () => {
      const data = {
        ...createValidChunkPosition(),
        startChar: 100,
        endChar: 100,
      };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept endChar > startChar", () => {
      const data = {
        ...createValidChunkPosition(),
        startChar: 100,
        endChar: 200,
      };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject endChar < startChar", () => {
      const data = {
        ...createValidChunkPosition(),
        startChar: 200,
        endChar: 100,
      };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("エラーメッセージ", () => {
    it("should return Japanese error message for index < 0", () => {
      const data = { ...createValidChunkPosition(), index: -1 };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        expect(errorMessage).toContain("index");
        expect(errorMessage).toContain("0以上");
      }
    });

    it("should return Japanese error message for startLine < 1", () => {
      const data = { ...createValidChunkPosition(), startLine: 0 };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        expect(errorMessage).toContain("startLine");
        expect(errorMessage).toContain("1以上");
      }
    });

    it("should return Japanese error message for endLine < startLine", () => {
      const data = {
        ...createValidChunkPosition(),
        startLine: 10,
        endLine: 5,
      };
      const result = chunkPositionSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        expect(errorMessage).toContain("endLine");
        expect(errorMessage).toContain("startLine以上");
      }
    });
  });
});

describe("chunkOverlapSchema", () => {
  describe("正常系", () => {
    it("should accept valid overlap with null chunk IDs", () => {
      const data = {
        prevChunkId: null,
        nextChunkId: null,
        overlapTokens: 0,
      };
      const result = chunkOverlapSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept valid overlap with UUID chunk IDs", () => {
      const data = {
        prevChunkId: validUUID,
        nextChunkId: validUUID,
        overlapTokens: 50,
      };
      const result = chunkOverlapSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("境界値テスト - overlapTokens", () => {
    it("should accept overlapTokens = 0 (minimum)", () => {
      const data = {
        prevChunkId: null,
        nextChunkId: null,
        overlapTokens: 0,
      };
      const result = chunkOverlapSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject overlapTokens = -1 (below minimum)", () => {
      const data = {
        prevChunkId: null,
        nextChunkId: null,
        overlapTokens: -1,
      };
      const result = chunkOverlapSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("異常系", () => {
    it("should reject invalid UUID for prevChunkId", () => {
      const data = {
        prevChunkId: "invalid-uuid",
        nextChunkId: null,
        overlapTokens: 0,
      };
      const result = chunkOverlapSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject non-integer overlapTokens", () => {
      const data = {
        prevChunkId: null,
        nextChunkId: null,
        overlapTokens: 50.5,
      };
      const result = chunkOverlapSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

// =============================================================================
// 3. 設定スキーマテスト
// =============================================================================

describe("embeddingModelConfigSchema", () => {
  describe("正常系", () => {
    it("should accept valid OpenAI config", () => {
      const data = {
        provider: "openai",
        modelId: "text-embedding-3-small",
        dimensions: 1536,
        maxTokens: 8191,
        batchSize: 100,
      };
      const result = embeddingModelConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept valid Cohere config", () => {
      const data = {
        provider: "cohere",
        modelId: "embed-english-v3.0",
        dimensions: 1024,
        maxTokens: 512,
        batchSize: 96,
      };
      const result = embeddingModelConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept valid local config", () => {
      const data = {
        provider: "local",
        modelId: "all-MiniLM-L6-v2",
        dimensions: 384,
        maxTokens: 256,
        batchSize: 32,
      };
      const result = embeddingModelConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("境界値テスト - dimensions", () => {
    it("should accept dimensions = 64 (minimum)", () => {
      const data = {
        provider: "openai",
        modelId: "test",
        dimensions: 64,
        maxTokens: 100,
        batchSize: 10,
      };
      const result = embeddingModelConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept dimensions = 4096 (maximum)", () => {
      const data = {
        provider: "openai",
        modelId: "test",
        dimensions: 4096,
        maxTokens: 100,
        batchSize: 10,
      };
      const result = embeddingModelConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject dimensions = 63 (below minimum)", () => {
      const data = {
        provider: "openai",
        modelId: "test",
        dimensions: 63,
        maxTokens: 100,
        batchSize: 10,
      };
      const result = embeddingModelConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject dimensions = 4097 (above maximum)", () => {
      const data = {
        provider: "openai",
        modelId: "test",
        dimensions: 4097,
        maxTokens: 100,
        batchSize: 10,
      };
      const result = embeddingModelConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("境界値テスト - maxTokens", () => {
    it("should accept maxTokens = 1 (minimum)", () => {
      const data = {
        provider: "openai",
        modelId: "test",
        dimensions: 100,
        maxTokens: 1,
        batchSize: 10,
      };
      const result = embeddingModelConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept maxTokens = 8192 (maximum)", () => {
      const data = {
        provider: "openai",
        modelId: "test",
        dimensions: 100,
        maxTokens: 8192,
        batchSize: 10,
      };
      const result = embeddingModelConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject maxTokens = 0 (below minimum)", () => {
      const data = {
        provider: "openai",
        modelId: "test",
        dimensions: 100,
        maxTokens: 0,
        batchSize: 10,
      };
      const result = embeddingModelConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject maxTokens = 8193 (above maximum)", () => {
      const data = {
        provider: "openai",
        modelId: "test",
        dimensions: 100,
        maxTokens: 8193,
        batchSize: 10,
      };
      const result = embeddingModelConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("境界値テスト - batchSize", () => {
    it("should accept batchSize = 1 (minimum)", () => {
      const data = {
        provider: "openai",
        modelId: "test",
        dimensions: 100,
        maxTokens: 100,
        batchSize: 1,
      };
      const result = embeddingModelConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept batchSize = 100 (maximum)", () => {
      const data = {
        provider: "openai",
        modelId: "test",
        dimensions: 100,
        maxTokens: 100,
        batchSize: 100,
      };
      const result = embeddingModelConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject batchSize = 0 (below minimum)", () => {
      const data = {
        provider: "openai",
        modelId: "test",
        dimensions: 100,
        maxTokens: 100,
        batchSize: 0,
      };
      const result = embeddingModelConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject batchSize = 101 (above maximum)", () => {
      const data = {
        provider: "openai",
        modelId: "test",
        dimensions: 100,
        maxTokens: 100,
        batchSize: 101,
      };
      const result = embeddingModelConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("エラーメッセージ", () => {
    it("should return Japanese error message for dimensions < 64", () => {
      const data = {
        provider: "openai",
        modelId: "test",
        dimensions: 63,
        maxTokens: 100,
        batchSize: 10,
      };
      const result = embeddingModelConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        expect(errorMessage).toContain("dimensions");
        expect(errorMessage).toContain("64以上");
      }
    });
  });
});

describe("chunkingConfigSchema", () => {
  describe("正常系", () => {
    it("should accept valid config with all fields", () => {
      const data = {
        strategy: "recursive",
        targetSize: 512,
        minSize: 100,
        maxSize: 1024,
        overlapSize: 50,
        preserveBoundaries: true,
        includeContext: true,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should apply default values when fields are omitted", () => {
      const data = {
        strategy: "recursive",
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.targetSize).toBe(512); // default
        expect(result.data.minSize).toBe(100); // default
        expect(result.data.maxSize).toBe(1024); // default
        expect(result.data.overlapSize).toBe(50); // default
        expect(result.data.preserveBoundaries).toBe(true); // default
        expect(result.data.includeContext).toBe(true); // default
      }
    });
  });

  describe("境界値テスト - targetSize", () => {
    it("should accept targetSize = 50 (minimum)", () => {
      const data = {
        strategy: "recursive",
        targetSize: 50,
        minSize: 10,
        maxSize: 100,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept targetSize = 2000 (maximum)", () => {
      const data = {
        strategy: "recursive",
        targetSize: 2000,
        minSize: 1000,
        maxSize: 4000,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject targetSize = 49 (below minimum)", () => {
      const data = {
        strategy: "recursive",
        targetSize: 49,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject targetSize = 2001 (above maximum)", () => {
      const data = {
        strategy: "recursive",
        targetSize: 2001,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("境界値テスト - minSize", () => {
    it("should accept minSize = 10 (minimum)", () => {
      const data = {
        strategy: "recursive",
        targetSize: 50,
        minSize: 10,
        maxSize: 100,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept minSize = 1000 (maximum)", () => {
      const data = {
        strategy: "recursive",
        targetSize: 1500,
        minSize: 1000,
        maxSize: 2000,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject minSize = 9 (below minimum)", () => {
      const data = {
        strategy: "recursive",
        minSize: 9,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject minSize = 1001 (above maximum)", () => {
      const data = {
        strategy: "recursive",
        minSize: 1001,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("境界値テスト - maxSize", () => {
    it("should accept maxSize = 100 (minimum)", () => {
      const data = {
        strategy: "recursive",
        targetSize: 50,
        minSize: 10,
        maxSize: 100,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept maxSize = 4000 (maximum)", () => {
      const data = {
        strategy: "recursive",
        targetSize: 2000,
        minSize: 1000,
        maxSize: 4000,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject maxSize = 99 (below minimum)", () => {
      const data = {
        strategy: "recursive",
        maxSize: 99,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject maxSize = 4001 (above maximum)", () => {
      const data = {
        strategy: "recursive",
        maxSize: 4001,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("境界値テスト - overlapSize", () => {
    it("should accept overlapSize = 0 (minimum)", () => {
      const data = {
        strategy: "recursive",
        overlapSize: 0,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept overlapSize = 500 (maximum)", () => {
      const data = {
        strategy: "recursive",
        overlapSize: 500,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject overlapSize = -1 (below minimum)", () => {
      const data = {
        strategy: "recursive",
        overlapSize: -1,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject overlapSize = 501 (above maximum)", () => {
      const data = {
        strategy: "recursive",
        overlapSize: 501,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("refine - minSize <= targetSize", () => {
    it("should accept minSize = targetSize", () => {
      const data = {
        strategy: "recursive",
        targetSize: 500,
        minSize: 500,
        maxSize: 1000,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept minSize < targetSize", () => {
      const data = {
        strategy: "recursive",
        targetSize: 500,
        minSize: 100,
        maxSize: 1000,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject minSize > targetSize", () => {
      const data = {
        strategy: "recursive",
        targetSize: 100,
        minSize: 200,
        maxSize: 500,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("refine - targetSize <= maxSize", () => {
    it("should accept targetSize = maxSize", () => {
      const data = {
        strategy: "recursive",
        targetSize: 1000,
        minSize: 500,
        maxSize: 1000,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept targetSize < maxSize", () => {
      const data = {
        strategy: "recursive",
        targetSize: 500,
        minSize: 100,
        maxSize: 1000,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject targetSize > maxSize", () => {
      const data = {
        strategy: "recursive",
        targetSize: 1500,
        minSize: 100,
        maxSize: 1000,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("エラーメッセージ", () => {
    it("should return Japanese error message for targetSize < 50", () => {
      const data = {
        strategy: "recursive",
        targetSize: 49,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        expect(errorMessage).toContain("targetSize");
        expect(errorMessage).toContain("50以上");
      }
    });

    it("should return Japanese error message for minSize > targetSize", () => {
      const data = {
        strategy: "recursive",
        targetSize: 100,
        minSize: 200,
        maxSize: 500,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        expect(errorMessage).toContain("minSize");
        expect(errorMessage).toContain("targetSize以下");
      }
    });

    it("should return Japanese error message for targetSize > maxSize", () => {
      const data = {
        strategy: "recursive",
        targetSize: 1500,
        minSize: 100,
        maxSize: 1000,
      };
      const result = chunkingConfigSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        expect(errorMessage).toContain("targetSize");
        expect(errorMessage).toContain("maxSize以下");
      }
    });
  });
});

// =============================================================================
// 4. エンティティスキーマテスト
// =============================================================================

describe("chunkEntitySchema", () => {
  describe("正常系", () => {
    it("should accept valid chunk entity", () => {
      const result = chunkEntitySchema.safeParse(createValidChunkEntity());
      expect(result.success).toBe(true);
    });

    it("should accept chunk entity with contextualContent", () => {
      const data = {
        ...createValidChunkEntity(),
        contextualContent: "This document discusses AI. This is a test chunk.",
      };
      const result = chunkEntitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept chunk entity with metadata", () => {
      const data = {
        ...createValidChunkEntity(),
        metadata: { language: "en", importance: 0.8 },
      };
      const result = chunkEntitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("異常系 - id", () => {
    it("should reject invalid UUID for id", () => {
      const data = { ...createValidChunkEntity(), id: "invalid-uuid" };
      const result = chunkEntitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject missing id", () => {
      const data = createValidChunkEntity();
      // @ts-expect-error - intentionally testing missing field
      delete data.id;
      const result = chunkEntitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("異常系 - content", () => {
    it("should reject empty content", () => {
      const data = { ...createValidChunkEntity(), content: "" };
      const result = chunkEntitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject non-string content", () => {
      const data = { ...createValidChunkEntity(), content: 123 };
      const result = chunkEntitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("異常系 - hash", () => {
    it("should reject hash with wrong length (too short)", () => {
      const data = { ...createValidChunkEntity(), hash: "a".repeat(63) };
      const result = chunkEntitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject hash with wrong length (too long)", () => {
      const data = { ...createValidChunkEntity(), hash: "a".repeat(65) };
      const result = chunkEntitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject hash with invalid characters", () => {
      const data = { ...createValidChunkEntity(), hash: "g".repeat(64) };
      const result = chunkEntitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept valid SHA-256 hash (lowercase hex)", () => {
      const validHash = "0123456789abcdef".repeat(4);
      const data = { ...createValidChunkEntity(), hash: validHash };
      const result = chunkEntitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("異常系 - tokenCount", () => {
    it("should reject tokenCount = 0", () => {
      const data = { ...createValidChunkEntity(), tokenCount: 0 };
      const result = chunkEntitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject negative tokenCount", () => {
      const data = { ...createValidChunkEntity(), tokenCount: -1 };
      const result = chunkEntitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject non-integer tokenCount", () => {
      const data = { ...createValidChunkEntity(), tokenCount: 10.5 };
      const result = chunkEntitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("異常系 - strategy", () => {
    it("should reject invalid strategy", () => {
      const data = { ...createValidChunkEntity(), strategy: "invalid" };
      const result = chunkEntitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("エラーメッセージ", () => {
    it("should return Japanese error message for empty content", () => {
      const data = { ...createValidChunkEntity(), content: "" };
      const result = chunkEntitySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        expect(errorMessage).toContain("チャンク本文");
        expect(errorMessage).toContain("1文字以上");
      }
    });

    it("should return Japanese error message for invalid hash length", () => {
      const data = { ...createValidChunkEntity(), hash: "abc" };
      const result = chunkEntitySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        expect(errorMessage).toContain("hash");
        expect(errorMessage).toContain("SHA-256");
        expect(errorMessage).toContain("64文字");
      }
    });
  });
});

describe("embeddingEntitySchema", () => {
  describe("正常系", () => {
    it("should accept valid embedding entity", () => {
      const result = embeddingEntitySchema.safeParse(
        createValidEmbeddingEntity(),
      );
      expect(result.success).toBe(true);
    });

    it("should accept embedding with large vector", () => {
      const data = {
        ...createValidEmbeddingEntity(),
        vector: Array(1536).fill(0.001),
        dimensions: 1536,
      };
      const result = embeddingEntitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("境界値テスト - vector", () => {
    it("should accept vector with 64 elements (minimum)", () => {
      const data = {
        ...createValidEmbeddingEntity(),
        vector: Array(64).fill(0.1),
        dimensions: 64,
      };
      const result = embeddingEntitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept vector with 4096 elements (maximum)", () => {
      const data = {
        ...createValidEmbeddingEntity(),
        vector: Array(4096).fill(0.001),
        dimensions: 4096,
      };
      const result = embeddingEntitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject vector with 63 elements (below minimum)", () => {
      const data = {
        ...createValidEmbeddingEntity(),
        vector: Array(63).fill(0.1),
        dimensions: 63,
      };
      const result = embeddingEntitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject vector with 4097 elements (above maximum)", () => {
      const data = {
        ...createValidEmbeddingEntity(),
        vector: Array(4097).fill(0.001),
        dimensions: 4097,
      };
      const result = embeddingEntitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("境界値テスト - normalizedMagnitude", () => {
    it("should accept normalizedMagnitude = 0.99 (minimum)", () => {
      const data = {
        ...createValidEmbeddingEntity(),
        normalizedMagnitude: 0.99,
      };
      const result = embeddingEntitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept normalizedMagnitude = 1.01 (maximum)", () => {
      const data = {
        ...createValidEmbeddingEntity(),
        normalizedMagnitude: 1.01,
      };
      const result = embeddingEntitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject normalizedMagnitude = 0.98 (below minimum)", () => {
      const data = {
        ...createValidEmbeddingEntity(),
        normalizedMagnitude: 0.98,
      };
      const result = embeddingEntitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject normalizedMagnitude = 1.02 (above maximum)", () => {
      const data = {
        ...createValidEmbeddingEntity(),
        normalizedMagnitude: 1.02,
      };
      const result = embeddingEntitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("refine - vector.length === dimensions", () => {
    it("should accept when vector.length equals dimensions", () => {
      const data = {
        ...createValidEmbeddingEntity(),
        vector: Array(100).fill(0.1),
        dimensions: 100,
      };
      const result = embeddingEntitySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject when vector.length does not equal dimensions", () => {
      const data = {
        ...createValidEmbeddingEntity(),
        vector: Array(100).fill(0.1),
        dimensions: 200,
      };
      const result = embeddingEntitySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("エラーメッセージ", () => {
    it("should return Japanese error message for vector.length !== dimensions", () => {
      const data = {
        ...createValidEmbeddingEntity(),
        vector: Array(100).fill(0.1),
        dimensions: 200,
      };
      const result = embeddingEntitySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        expect(errorMessage).toContain("vector");
        expect(errorMessage).toContain("dimensions");
        expect(errorMessage).toContain("一致");
      }
    });

    it("should return Japanese error message for normalizedMagnitude out of range", () => {
      const data = {
        ...createValidEmbeddingEntity(),
        normalizedMagnitude: 0.5,
      };
      const result = embeddingEntitySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        expect(errorMessage).toContain("normalizedMagnitude");
        expect(errorMessage).toContain("0.99以上");
      }
    });
  });
});

// =============================================================================
// 5. 結果スキーマテスト
// =============================================================================

describe("chunkingResultSchema", () => {
  describe("正常系", () => {
    it("should accept valid chunking result with empty chunks", () => {
      const data = {
        fileId: validUUID,
        chunks: [],
        totalTokens: 0,
        averageChunkSize: 0,
        processingTime: 100.5,
      };
      const result = chunkingResultSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept valid chunking result with chunks", () => {
      const data = {
        fileId: validUUID,
        chunks: [createValidChunkEntity()],
        totalTokens: 100,
        averageChunkSize: 100,
        processingTime: 150.5,
      };
      const result = chunkingResultSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("異常系", () => {
    it("should reject invalid fileId", () => {
      const data = {
        fileId: "invalid-uuid",
        chunks: [],
        totalTokens: 0,
        averageChunkSize: 0,
        processingTime: 100,
      };
      const result = chunkingResultSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject negative totalTokens", () => {
      const data = {
        fileId: validUUID,
        chunks: [],
        totalTokens: -1,
        averageChunkSize: 0,
        processingTime: 100,
      };
      const result = chunkingResultSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject negative processingTime", () => {
      const data = {
        fileId: validUUID,
        chunks: [],
        totalTokens: 0,
        averageChunkSize: 0,
        processingTime: -1,
      };
      const result = chunkingResultSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

describe("embeddingGenerationResultSchema", () => {
  describe("正常系", () => {
    it("should accept valid embedding generation result", () => {
      const data = {
        chunkId: validUUID,
        embedding: createValidEmbeddingEntity(),
        processingTime: 250.3,
        tokensUsed: 10,
      };
      const result = embeddingGenerationResultSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("異常系", () => {
    it("should reject invalid chunkId", () => {
      const data = {
        chunkId: "invalid-uuid",
        embedding: createValidEmbeddingEntity(),
        processingTime: 250.3,
        tokensUsed: 10,
      };
      const result = embeddingGenerationResultSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject negative tokensUsed", () => {
      const data = {
        chunkId: validUUID,
        embedding: createValidEmbeddingEntity(),
        processingTime: 250.3,
        tokensUsed: -1,
      };
      const result = embeddingGenerationResultSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject non-integer tokensUsed", () => {
      const data = {
        chunkId: validUUID,
        embedding: createValidEmbeddingEntity(),
        processingTime: 250.3,
        tokensUsed: 10.5,
      };
      const result = embeddingGenerationResultSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});

// =============================================================================
// 6. バッチ処理スキーマテスト
// =============================================================================

describe("batchEmbeddingInputSchema", () => {
  describe("正常系", () => {
    it("should accept valid batch input with single chunk", () => {
      const data = {
        chunks: [{ id: validUUID, content: "Test content" }],
        modelConfig: {
          provider: "openai",
          modelId: "text-embedding-3-small",
          dimensions: 1536,
          maxTokens: 8191,
          batchSize: 100,
        },
      };
      const result = batchEmbeddingInputSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept valid batch input with multiple chunks", () => {
      const data = {
        chunks: [
          { id: validUUID, content: "Chunk 1" },
          { id: "660e8400-e29b-41d4-a716-446655440000", content: "Chunk 2" },
        ],
        modelConfig: {
          provider: "openai",
          modelId: "text-embedding-3-small",
          dimensions: 1536,
          maxTokens: 8191,
          batchSize: 100,
        },
      };
      const result = batchEmbeddingInputSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("境界値テスト - chunks array", () => {
    it("should accept chunks with 1 element (minimum)", () => {
      const data = {
        chunks: [{ id: validUUID, content: "Test" }],
        modelConfig: {
          provider: "openai",
          modelId: "test",
          dimensions: 100,
          maxTokens: 100,
          batchSize: 10,
        },
      };
      const result = batchEmbeddingInputSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept chunks with 100 elements (maximum)", () => {
      const chunks = Array(100)
        .fill(null)
        .map((_, i) => ({
          id: `550e8400-e29b-41d4-a716-44665544${i.toString().padStart(4, "0")}`,
          content: `Chunk ${i}`,
        }));
      const data = {
        chunks,
        modelConfig: {
          provider: "openai",
          modelId: "test",
          dimensions: 100,
          maxTokens: 100,
          batchSize: 10,
        },
      };
      const result = batchEmbeddingInputSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject empty chunks array (below minimum)", () => {
      const data = {
        chunks: [],
        modelConfig: {
          provider: "openai",
          modelId: "test",
          dimensions: 100,
          maxTokens: 100,
          batchSize: 10,
        },
      };
      const result = batchEmbeddingInputSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject chunks with 101 elements (above maximum)", () => {
      const chunks = Array(101)
        .fill(null)
        .map((_, i) => ({
          id: validUUID,
          content: `Chunk ${i}`,
        }));
      const data = {
        chunks,
        modelConfig: {
          provider: "openai",
          modelId: "test",
          dimensions: 100,
          maxTokens: 100,
          batchSize: 10,
        },
      };
      const result = batchEmbeddingInputSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("異常系 - chunk content", () => {
    it("should reject chunk with empty content", () => {
      const data = {
        chunks: [{ id: validUUID, content: "" }],
        modelConfig: {
          provider: "openai",
          modelId: "test",
          dimensions: 100,
          maxTokens: 100,
          batchSize: 10,
        },
      };
      const result = batchEmbeddingInputSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject chunk with invalid id", () => {
      const data = {
        chunks: [{ id: "invalid-uuid", content: "Test" }],
        modelConfig: {
          provider: "openai",
          modelId: "test",
          dimensions: 100,
          maxTokens: 100,
          batchSize: 10,
        },
      };
      const result = batchEmbeddingInputSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("エラーメッセージ", () => {
    it("should return Japanese error message for empty chunks", () => {
      const data = {
        chunks: [],
        modelConfig: {
          provider: "openai",
          modelId: "test",
          dimensions: 100,
          maxTokens: 100,
          batchSize: 10,
        },
      };
      const result = batchEmbeddingInputSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        expect(errorMessage).toContain("chunks");
        expect(errorMessage).toContain("最低1件");
      }
    });

    it("should return Japanese error message for too many chunks", () => {
      const chunks = Array(101)
        .fill(null)
        .map(() => ({
          id: validUUID,
          content: "Test",
        }));
      const data = {
        chunks,
        modelConfig: {
          provider: "openai",
          modelId: "test",
          dimensions: 100,
          maxTokens: 100,
          batchSize: 10,
        },
      };
      const result = batchEmbeddingInputSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        expect(errorMessage).toContain("chunks");
        expect(errorMessage).toContain("最大100件");
      }
    });
  });
});

// =============================================================================
// 7. 型推論テスト
// =============================================================================

describe("型推論テスト", () => {
  describe("スキーマからの型推論", () => {
    it("should infer correct type from chunkingStrategySchema", () => {
      type InferredStrategy = z.infer<typeof chunkingStrategySchema>;
      const strategy: InferredStrategy = "recursive";
      expect(strategy).toBe("recursive");
    });

    it("should infer correct type from embeddingProviderSchema", () => {
      type InferredProvider = z.infer<typeof embeddingProviderSchema>;
      const provider: InferredProvider = "openai";
      expect(provider).toBe("openai");
    });

    it("should infer correct type from chunkPositionSchema", () => {
      type InferredPosition = z.infer<typeof chunkPositionSchema>;
      const position: InferredPosition = {
        index: 0,
        startLine: 1,
        endLine: 10,
        startChar: 0,
        endChar: 500,
        parentHeader: null,
      };
      expect(position.index).toBe(0);
    });

    it("should infer correct type from chunkEntitySchema", () => {
      type InferredEntity = z.infer<typeof chunkEntitySchema>;
      const entity: InferredEntity = {
        id: validUUID,
        fileId: validUUID,
        content: "Test",
        contextualContent: null,
        position: {
          index: 0,
          startLine: 1,
          endLine: 1,
          startChar: 0,
          endChar: 4,
          parentHeader: null,
        },
        strategy: "recursive",
        tokenCount: 1,
        hash: validHash,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(entity.content).toBe("Test");
    });
  });
});
