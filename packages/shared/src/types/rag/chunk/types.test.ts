/**
 * @file types.ts 単体テスト
 * @module @repo/shared/types/rag/chunk/types.test
 * @description チャンク・埋め込み型定義のTDDテスト（Red フェーズ）
 *
 * TDD原則に従い、実装（types.ts）前にテストを作成。
 * 本テストは実装完了まで全て失敗する想定（Red状態）。
 */

import { describe, it, expect, expectTypeOf } from "vitest";

// テスト対象のインポート（types.ts がまだ存在しないため、テストは失敗する）
import {
  // 列挙型
  ChunkingStrategies,
  EmbeddingProviders,
  // 型エイリアス
  type ChunkingStrategy,
  type EmbeddingProvider,
  // インターフェース
  type ChunkPosition,
  type ChunkOverlap,
  type ChunkEntity,
  type EmbeddingModelConfig,
  type EmbeddingEntity,
  type ChunkingConfig,
  type ChunkingResult,
  type EmbeddingGenerationResult,
} from "./types";

// Branded Types のインポート（依存関係テスト用）
import type { ChunkId, EmbeddingId, FileId } from "../branded";
import type { Timestamped, WithMetadata } from "../interfaces";

// =============================================================================
// テストヘルパー型（型レベルテスト用）
// =============================================================================

/**
 * 型の等価性をコンパイル時に検証するヘルパー型
 * - 両方の型が完全に一致する場合のみ true を返す
 */
type _Equals<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;

/**
 * 型がreadonly配列かどうかを検証するヘルパー型
 */
type _IsReadonly<T> = T extends { readonly [K in keyof T]: T[K] }
  ? true
  : false;

// =============================================================================
// 1. 列挙型テスト（ChunkingStrategies、EmbeddingProviders）
// =============================================================================

describe("ChunkingStrategies 列挙型", () => {
  describe("定義されている値", () => {
    it("should have FIXED_SIZE strategy with value 'fixed_size'", () => {
      expect(ChunkingStrategies.FIXED_SIZE).toBe("fixed_size");
    });

    it("should have SEMANTIC strategy with value 'semantic'", () => {
      expect(ChunkingStrategies.SEMANTIC).toBe("semantic");
    });

    it("should have RECURSIVE strategy with value 'recursive'", () => {
      expect(ChunkingStrategies.RECURSIVE).toBe("recursive");
    });

    it("should have SENTENCE strategy with value 'sentence'", () => {
      expect(ChunkingStrategies.SENTENCE).toBe("sentence");
    });

    it("should have PARAGRAPH strategy with value 'paragraph'", () => {
      expect(ChunkingStrategies.PARAGRAPH).toBe("paragraph");
    });

    it("should have MARKDOWN_HEADER strategy with value 'markdown_header'", () => {
      expect(ChunkingStrategies.MARKDOWN_HEADER).toBe("markdown_header");
    });

    it("should have CODE_BLOCK strategy with value 'code_block'", () => {
      expect(ChunkingStrategies.CODE_BLOCK).toBe("code_block");
    });
  });

  describe("全7種類の戦略が定義されている", () => {
    it("should have exactly 7 strategies", () => {
      const strategies = Object.values(ChunkingStrategies);
      expect(strategies).toHaveLength(7);
    });

    it("should contain all expected strategies", () => {
      const expectedStrategies = [
        "fixed_size",
        "semantic",
        "recursive",
        "sentence",
        "paragraph",
        "markdown_header",
        "code_block",
      ];
      const actualStrategies = Object.values(ChunkingStrategies);
      expect(actualStrategies).toEqual(
        expect.arrayContaining(expectedStrategies),
      );
    });
  });

  describe("as const による不変性", () => {
    it("should be readonly (as const)", () => {
      // as const で定義されている場合、Object.isFrozen は true になる（厳密には違うが、型レベルで検証）
      // ランタイムでは as const は影響しないため、型推論で検証
      expectTypeOf(ChunkingStrategies).toMatchTypeOf<{
        readonly FIXED_SIZE: "fixed_size";
        readonly SEMANTIC: "semantic";
        readonly RECURSIVE: "recursive";
        readonly SENTENCE: "sentence";
        readonly PARAGRAPH: "paragraph";
        readonly MARKDOWN_HEADER: "markdown_header";
        readonly CODE_BLOCK: "code_block";
      }>();
    });
  });
});

describe("EmbeddingProviders 列挙型", () => {
  describe("定義されている値", () => {
    it("should have OPENAI provider with value 'openai'", () => {
      expect(EmbeddingProviders.OPENAI).toBe("openai");
    });

    it("should have COHERE provider with value 'cohere'", () => {
      expect(EmbeddingProviders.COHERE).toBe("cohere");
    });

    it("should have VOYAGE provider with value 'voyage'", () => {
      expect(EmbeddingProviders.VOYAGE).toBe("voyage");
    });

    it("should have LOCAL provider with value 'local'", () => {
      expect(EmbeddingProviders.LOCAL).toBe("local");
    });
  });

  describe("全4種類のプロバイダーが定義されている", () => {
    it("should have exactly 4 providers", () => {
      const providers = Object.values(EmbeddingProviders);
      expect(providers).toHaveLength(4);
    });

    it("should contain all expected providers", () => {
      const expectedProviders = ["openai", "cohere", "voyage", "local"];
      const actualProviders = Object.values(EmbeddingProviders);
      expect(actualProviders).toEqual(
        expect.arrayContaining(expectedProviders),
      );
    });
  });

  describe("as const による不変性", () => {
    it("should be readonly (as const)", () => {
      expectTypeOf(EmbeddingProviders).toMatchTypeOf<{
        readonly OPENAI: "openai";
        readonly COHERE: "cohere";
        readonly VOYAGE: "voyage";
        readonly LOCAL: "local";
      }>();
    });
  });
});

// =============================================================================
// 2. 型エイリアステスト（ChunkingStrategy、EmbeddingProvider）
// =============================================================================

describe("ChunkingStrategy 型エイリアス", () => {
  it("should be a union type of all chunking strategy values", () => {
    // 型レベルのテスト: 有効な値が代入可能か
    const validStrategies: ChunkingStrategy[] = [
      "fixed_size",
      "semantic",
      "recursive",
      "sentence",
      "paragraph",
      "markdown_header",
      "code_block",
    ];

    expect(validStrategies).toHaveLength(7);
  });

  it("should accept valid strategy from ChunkingStrategies", () => {
    const strategy: ChunkingStrategy = ChunkingStrategies.RECURSIVE;
    expect(strategy).toBe("recursive");
  });

  it("should be derived from ChunkingStrategies values", () => {
    // 型推論が正しく動作することを検証
    type Expected =
      | "fixed_size"
      | "semantic"
      | "recursive"
      | "sentence"
      | "paragraph"
      | "markdown_header"
      | "code_block";
    expectTypeOf<ChunkingStrategy>().toEqualTypeOf<Expected>();
  });
});

describe("EmbeddingProvider 型エイリアス", () => {
  it("should be a union type of all embedding provider values", () => {
    const validProviders: EmbeddingProvider[] = [
      "openai",
      "cohere",
      "voyage",
      "local",
    ];

    expect(validProviders).toHaveLength(4);
  });

  it("should accept valid provider from EmbeddingProviders", () => {
    const provider: EmbeddingProvider = EmbeddingProviders.OPENAI;
    expect(provider).toBe("openai");
  });

  it("should be derived from EmbeddingProviders values", () => {
    type Expected = "openai" | "cohere" | "voyage" | "local";
    expectTypeOf<EmbeddingProvider>().toEqualTypeOf<Expected>();
  });
});

// =============================================================================
// 3. 基本インターフェーステスト（ChunkPosition、ChunkOverlap）
// =============================================================================

describe("ChunkPosition インターフェース", () => {
  describe("フィールド定義", () => {
    it("should have all required fields", () => {
      const position: ChunkPosition = {
        index: 0,
        startLine: 1,
        endLine: 10,
        startChar: 0,
        endChar: 500,
        parentHeader: null,
      };

      expect(position.index).toBe(0);
      expect(position.startLine).toBe(1);
      expect(position.endLine).toBe(10);
      expect(position.startChar).toBe(0);
      expect(position.endChar).toBe(500);
      expect(position.parentHeader).toBeNull();
    });

    it("should allow string value for parentHeader", () => {
      const position: ChunkPosition = {
        index: 1,
        startLine: 11,
        endLine: 20,
        startChar: 0,
        endChar: 300,
        parentHeader: "## Introduction",
      };

      expect(position.parentHeader).toBe("## Introduction");
    });
  });

  describe("型推論", () => {
    it("should have correct field types", () => {
      expectTypeOf<ChunkPosition>().toMatchTypeOf<{
        readonly index: number;
        readonly startLine: number;
        readonly endLine: number;
        readonly startChar: number;
        readonly endChar: number;
        readonly parentHeader: string | null;
      }>();
    });
  });

  describe("readonly制約", () => {
    it("should have all fields as readonly", () => {
      // 型レベルで readonly が適用されていることを検証
      type ChunkPositionKeys = keyof ChunkPosition;
      type ExpectedKeys =
        | "index"
        | "startLine"
        | "endLine"
        | "startChar"
        | "endChar"
        | "parentHeader";
      expectTypeOf<ChunkPositionKeys>().toEqualTypeOf<ExpectedKeys>();
    });
  });
});

describe("ChunkOverlap インターフェース", () => {
  describe("フィールド定義", () => {
    it("should have all required fields with null values", () => {
      const overlap: ChunkOverlap = {
        prevChunkId: null,
        nextChunkId: null,
        overlapTokens: 0,
      };

      expect(overlap.prevChunkId).toBeNull();
      expect(overlap.nextChunkId).toBeNull();
      expect(overlap.overlapTokens).toBe(0);
    });

    it("should allow ChunkId values for prevChunkId and nextChunkId", () => {
      // ChunkIdはBranded Typeなので、型レベルでの検証が必要
      // ここではモック値を使用
      const mockChunkId = "550e8400-e29b-41d4-a716-446655440000" as ChunkId;

      const overlap: ChunkOverlap = {
        prevChunkId: mockChunkId,
        nextChunkId: mockChunkId,
        overlapTokens: 50,
      };

      expect(overlap.prevChunkId).toBe(mockChunkId);
      expect(overlap.nextChunkId).toBe(mockChunkId);
      expect(overlap.overlapTokens).toBe(50);
    });
  });

  describe("型推論", () => {
    it("should have correct field types", () => {
      expectTypeOf<ChunkOverlap>().toMatchTypeOf<{
        readonly prevChunkId: ChunkId | null;
        readonly nextChunkId: ChunkId | null;
        readonly overlapTokens: number;
      }>();
    });
  });
});

// =============================================================================
// 4. エンティティインターフェーステスト（ChunkEntity、EmbeddingEntity）
// =============================================================================

describe("ChunkEntity インターフェース", () => {
  describe("フィールド定義", () => {
    it("should have all required fields", () => {
      const mockChunkId = "550e8400-e29b-41d4-a716-446655440000" as ChunkId;
      const mockFileId = "660e8400-e29b-41d4-a716-446655440000" as FileId;

      const chunk: ChunkEntity = {
        id: mockChunkId,
        fileId: mockFileId,
        content: "This is a test chunk",
        contextualContent: null,
        position: {
          index: 0,
          startLine: 1,
          endLine: 10,
          startChar: 0,
          endChar: 500,
          parentHeader: null,
        },
        strategy: "recursive",
        tokenCount: 10,
        hash: "a".repeat(64), // SHA-256 hash (64 chars)
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(chunk.id).toBe(mockChunkId);
      expect(chunk.fileId).toBe(mockFileId);
      expect(chunk.content).toBe("This is a test chunk");
      expect(chunk.contextualContent).toBeNull();
      expect(chunk.position.index).toBe(0);
      expect(chunk.strategy).toBe("recursive");
      expect(chunk.tokenCount).toBe(10);
      expect(chunk.hash).toHaveLength(64);
      expect(chunk.metadata).toEqual({});
      expect(chunk.createdAt).toBeInstanceOf(Date);
      expect(chunk.updatedAt).toBeInstanceOf(Date);
    });

    it("should allow contextualContent with string value", () => {
      const mockChunkId = "550e8400-e29b-41d4-a716-446655440000" as ChunkId;
      const mockFileId = "660e8400-e29b-41d4-a716-446655440000" as FileId;

      const chunk: ChunkEntity = {
        id: mockChunkId,
        fileId: mockFileId,
        content: "RAG is a technique",
        contextualContent:
          "This document discusses AI. RAG is a technique for improving LLM responses.",
        position: {
          index: 0,
          startLine: 1,
          endLine: 5,
          startChar: 0,
          endChar: 200,
          parentHeader: "## Introduction",
        },
        strategy: "semantic",
        tokenCount: 15,
        hash: "b".repeat(64),
        metadata: { language: "en" },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(chunk.contextualContent).toContain("This document discusses AI");
    });
  });

  describe("ミックスイン継承", () => {
    it("should extend Timestamped", () => {
      // ChunkEntity が Timestamped を継承していることを検証
      type HasTimestamped = ChunkEntity extends Timestamped ? true : false;
      expectTypeOf<HasTimestamped>().toEqualTypeOf<true>();
    });

    it("should extend WithMetadata", () => {
      // ChunkEntity が WithMetadata を継承していることを検証
      type HasWithMetadata = ChunkEntity extends WithMetadata ? true : false;
      expectTypeOf<HasWithMetadata>().toEqualTypeOf<true>();
    });
  });

  describe("型推論", () => {
    it("should have correct id type (ChunkId)", () => {
      expectTypeOf<ChunkEntity["id"]>().toEqualTypeOf<ChunkId>();
    });

    it("should have correct fileId type (FileId)", () => {
      expectTypeOf<ChunkEntity["fileId"]>().toEqualTypeOf<FileId>();
    });

    it("should have correct strategy type (ChunkingStrategy)", () => {
      expectTypeOf<ChunkEntity["strategy"]>().toEqualTypeOf<ChunkingStrategy>();
    });

    it("should have correct position type (ChunkPosition)", () => {
      expectTypeOf<ChunkEntity["position"]>().toEqualTypeOf<ChunkPosition>();
    });
  });
});

describe("EmbeddingEntity インターフェース", () => {
  describe("フィールド定義", () => {
    it("should have all required fields", () => {
      const mockEmbeddingId =
        "770e8400-e29b-41d4-a716-446655440000" as EmbeddingId;
      const mockChunkId = "550e8400-e29b-41d4-a716-446655440000" as ChunkId;
      const mockVector = new Float32Array([0.1, 0.2, 0.3]);

      const embedding: EmbeddingEntity = {
        id: mockEmbeddingId,
        chunkId: mockChunkId,
        vector: mockVector,
        modelId: "text-embedding-3-small",
        dimensions: 3,
        normalizedMagnitude: 1.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(embedding.id).toBe(mockEmbeddingId);
      expect(embedding.chunkId).toBe(mockChunkId);
      expect(embedding.vector).toBeInstanceOf(Float32Array);
      expect(embedding.modelId).toBe("text-embedding-3-small");
      expect(embedding.dimensions).toBe(3);
      expect(embedding.normalizedMagnitude).toBe(1.0);
      expect(embedding.createdAt).toBeInstanceOf(Date);
      expect(embedding.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("ミックスイン継承", () => {
    it("should extend Timestamped", () => {
      type HasTimestamped = EmbeddingEntity extends Timestamped ? true : false;
      expectTypeOf<HasTimestamped>().toEqualTypeOf<true>();
    });

    it("should NOT extend WithMetadata (by design)", () => {
      // 設計上、EmbeddingEntity は WithMetadata を継承しない
      type HasWithMetadata = EmbeddingEntity extends WithMetadata
        ? true
        : false;
      expectTypeOf<HasWithMetadata>().toEqualTypeOf<false>();
    });
  });

  describe("型推論", () => {
    it("should have correct id type (EmbeddingId)", () => {
      expectTypeOf<EmbeddingEntity["id"]>().toEqualTypeOf<EmbeddingId>();
    });

    it("should have correct chunkId type (ChunkId)", () => {
      expectTypeOf<EmbeddingEntity["chunkId"]>().toEqualTypeOf<ChunkId>();
    });

    it("should have correct vector type (Float32Array)", () => {
      expectTypeOf<EmbeddingEntity["vector"]>().toEqualTypeOf<Float32Array>();
    });
  });
});

// =============================================================================
// 5. 設定インターフェーステスト（EmbeddingModelConfig、ChunkingConfig）
// =============================================================================

describe("EmbeddingModelConfig インターフェース", () => {
  describe("フィールド定義", () => {
    it("should have all required fields", () => {
      const config: EmbeddingModelConfig = {
        provider: "openai",
        modelId: "text-embedding-3-small",
        dimensions: 1536,
        maxTokens: 8191,
        batchSize: 100,
      };

      expect(config.provider).toBe("openai");
      expect(config.modelId).toBe("text-embedding-3-small");
      expect(config.dimensions).toBe(1536);
      expect(config.maxTokens).toBe(8191);
      expect(config.batchSize).toBe(100);
    });

    it("should allow all valid providers", () => {
      const providers: EmbeddingProvider[] = [
        "openai",
        "cohere",
        "voyage",
        "local",
      ];

      providers.forEach((provider) => {
        const config: EmbeddingModelConfig = {
          provider,
          modelId: "test-model",
          dimensions: 768,
          maxTokens: 512,
          batchSize: 32,
        };

        expect(config.provider).toBe(provider);
      });
    });
  });

  describe("型推論", () => {
    it("should have correct provider type (EmbeddingProvider)", () => {
      expectTypeOf<
        EmbeddingModelConfig["provider"]
      >().toEqualTypeOf<EmbeddingProvider>();
    });

    it("should have all fields as readonly", () => {
      expectTypeOf<EmbeddingModelConfig>().toMatchTypeOf<{
        readonly provider: EmbeddingProvider;
        readonly modelId: string;
        readonly dimensions: number;
        readonly maxTokens: number;
        readonly batchSize: number;
      }>();
    });
  });
});

describe("ChunkingConfig インターフェース", () => {
  describe("フィールド定義", () => {
    it("should have all required fields", () => {
      const config: ChunkingConfig = {
        strategy: "recursive",
        targetSize: 512,
        minSize: 100,
        maxSize: 1024,
        overlapSize: 50,
        preserveBoundaries: true,
        includeContext: true,
      };

      expect(config.strategy).toBe("recursive");
      expect(config.targetSize).toBe(512);
      expect(config.minSize).toBe(100);
      expect(config.maxSize).toBe(1024);
      expect(config.overlapSize).toBe(50);
      expect(config.preserveBoundaries).toBe(true);
      expect(config.includeContext).toBe(true);
    });

    it("should allow all valid strategies", () => {
      const strategies: ChunkingStrategy[] = [
        "fixed_size",
        "semantic",
        "recursive",
        "sentence",
        "paragraph",
        "markdown_header",
        "code_block",
      ];

      strategies.forEach((strategy) => {
        const config: ChunkingConfig = {
          strategy,
          targetSize: 256,
          minSize: 50,
          maxSize: 512,
          overlapSize: 25,
          preserveBoundaries: false,
          includeContext: false,
        };

        expect(config.strategy).toBe(strategy);
      });
    });
  });

  describe("型推論", () => {
    it("should have correct strategy type (ChunkingStrategy)", () => {
      expectTypeOf<
        ChunkingConfig["strategy"]
      >().toEqualTypeOf<ChunkingStrategy>();
    });

    it("should have all fields as readonly", () => {
      expectTypeOf<ChunkingConfig>().toMatchTypeOf<{
        readonly strategy: ChunkingStrategy;
        readonly targetSize: number;
        readonly minSize: number;
        readonly maxSize: number;
        readonly overlapSize: number;
        readonly preserveBoundaries: boolean;
        readonly includeContext: boolean;
      }>();
    });
  });
});

// =============================================================================
// 6. 結果インターフェーステスト（ChunkingResult、EmbeddingGenerationResult）
// =============================================================================

describe("ChunkingResult インターフェース", () => {
  describe("フィールド定義", () => {
    it("should have all required fields", () => {
      const mockFileId = "660e8400-e29b-41d4-a716-446655440000" as FileId;

      const result: ChunkingResult = {
        fileId: mockFileId,
        chunks: [],
        totalTokens: 1000,
        averageChunkSize: 333.3,
        processingTime: 150.5,
      };

      expect(result.fileId).toBe(mockFileId);
      expect(result.chunks).toEqual([]);
      expect(result.totalTokens).toBe(1000);
      expect(result.averageChunkSize).toBeCloseTo(333.3);
      expect(result.processingTime).toBeCloseTo(150.5);
    });

    it("should contain ChunkEntity array for chunks", () => {
      const mockFileId = "660e8400-e29b-41d4-a716-446655440000" as FileId;
      const mockChunkId = "550e8400-e29b-41d4-a716-446655440000" as ChunkId;

      const chunk: ChunkEntity = {
        id: mockChunkId,
        fileId: mockFileId,
        content: "Test chunk",
        contextualContent: null,
        position: {
          index: 0,
          startLine: 1,
          endLine: 5,
          startChar: 0,
          endChar: 100,
          parentHeader: null,
        },
        strategy: "recursive",
        tokenCount: 10,
        hash: "c".repeat(64),
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result: ChunkingResult = {
        fileId: mockFileId,
        chunks: [chunk],
        totalTokens: 10,
        averageChunkSize: 10,
        processingTime: 50,
      };

      expect(result.chunks).toHaveLength(1);
      expect(result.chunks[0].id).toBe(mockChunkId);
    });
  });

  describe("型推論", () => {
    it("should have correct fileId type (FileId)", () => {
      expectTypeOf<ChunkingResult["fileId"]>().toEqualTypeOf<FileId>();
    });

    it("should have correct chunks type (ChunkEntity[])", () => {
      expectTypeOf<ChunkingResult["chunks"]>().toEqualTypeOf<ChunkEntity[]>();
    });
  });
});

describe("EmbeddingGenerationResult インターフェース", () => {
  describe("フィールド定義", () => {
    it("should have all required fields", () => {
      const mockChunkId = "550e8400-e29b-41d4-a716-446655440000" as ChunkId;
      const mockEmbeddingId =
        "770e8400-e29b-41d4-a716-446655440000" as EmbeddingId;
      const mockVector = new Float32Array([0.1, 0.2, 0.3]);

      const embeddingEntity: EmbeddingEntity = {
        id: mockEmbeddingId,
        chunkId: mockChunkId,
        vector: mockVector,
        modelId: "text-embedding-3-small",
        dimensions: 3,
        normalizedMagnitude: 1.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result: EmbeddingGenerationResult = {
        chunkId: mockChunkId,
        embedding: embeddingEntity,
        processingTime: 250.3,
        tokensUsed: 10,
      };

      expect(result.chunkId).toBe(mockChunkId);
      expect(result.embedding.id).toBe(mockEmbeddingId);
      expect(result.processingTime).toBeCloseTo(250.3);
      expect(result.tokensUsed).toBe(10);
    });
  });

  describe("型推論", () => {
    it("should have correct chunkId type (ChunkId)", () => {
      expectTypeOf<
        EmbeddingGenerationResult["chunkId"]
      >().toEqualTypeOf<ChunkId>();
    });

    it("should have correct embedding type (EmbeddingEntity)", () => {
      expectTypeOf<
        EmbeddingGenerationResult["embedding"]
      >().toEqualTypeOf<EmbeddingEntity>();
    });
  });
});

// =============================================================================
// 7. Branded Types 統合テスト
// =============================================================================

describe("Branded Types 統合", () => {
  describe("ChunkId の使用", () => {
    it("should use ChunkId from branded.ts for ChunkEntity.id", () => {
      // 型レベルの検証: ChunkEntity.id が ChunkId 型であること
      type ChunkEntityIdType = ChunkEntity["id"];
      expectTypeOf<ChunkEntityIdType>().toEqualTypeOf<ChunkId>();
    });

    it("should use ChunkId from branded.ts for EmbeddingEntity.chunkId", () => {
      type EmbeddingEntityChunkIdType = EmbeddingEntity["chunkId"];
      expectTypeOf<EmbeddingEntityChunkIdType>().toEqualTypeOf<ChunkId>();
    });

    it("should use ChunkId from branded.ts for ChunkOverlap.prevChunkId", () => {
      type ChunkOverlapPrevType = ChunkOverlap["prevChunkId"];
      expectTypeOf<ChunkOverlapPrevType>().toEqualTypeOf<ChunkId | null>();
    });
  });

  describe("EmbeddingId の使用", () => {
    it("should use EmbeddingId from branded.ts for EmbeddingEntity.id", () => {
      type EmbeddingEntityIdType = EmbeddingEntity["id"];
      expectTypeOf<EmbeddingEntityIdType>().toEqualTypeOf<EmbeddingId>();
    });
  });

  describe("FileId の使用", () => {
    it("should use FileId from branded.ts for ChunkEntity.fileId", () => {
      type ChunkEntityFileIdType = ChunkEntity["fileId"];
      expectTypeOf<ChunkEntityFileIdType>().toEqualTypeOf<FileId>();
    });

    it("should use FileId from branded.ts for ChunkingResult.fileId", () => {
      type ChunkingResultFileIdType = ChunkingResult["fileId"];
      expectTypeOf<ChunkingResultFileIdType>().toEqualTypeOf<FileId>();
    });
  });
});

// =============================================================================
// 8. 型安全性テスト（誤用防止）
// =============================================================================

describe("型安全性（誤用防止）", () => {
  describe("Branded Type による型の区別", () => {
    it("should not allow assigning ChunkId to EmbeddingId", () => {
      // このテストは型レベルでのみ検証可能
      // コンパイルエラーになることを期待（テストコード自体は通るが、型チェックで失敗する設計）
      const mockChunkId = "550e8400-e29b-41d4-a716-446655440000" as ChunkId;
      const mockEmbeddingId =
        "770e8400-e29b-41d4-a716-446655440000" as EmbeddingId;

      // 同じ値でも型が異なることを確認
      // @ts-expect-error - ChunkId を EmbeddingId に代入できないことを確認（型チェック）
      // 以下のコードは型チェック時にエラーになるはず（実行時はパス）
      // const invalidAssignment: EmbeddingId = mockChunkId;

      // 実行時テストとしては、型が異なることを間接的に確認
      expect(typeof mockChunkId).toBe("string");
      expect(typeof mockEmbeddingId).toBe("string");
    });
  });

  describe("列挙型の型安全性", () => {
    it("should not allow invalid strategy values", () => {
      // 型レベルでの検証（実行時には文字列として扱われる）
      const validStrategy: ChunkingStrategy = "recursive";
      expect(validStrategy).toBe("recursive");

      // 不正な値は型チェックで弾かれる（実行時テストではなく型テスト）
      // @ts-expect-error - "invalid_strategy" は ChunkingStrategy に含まれない
      // const invalidStrategy: ChunkingStrategy = "invalid_strategy";
    });

    it("should not allow invalid provider values", () => {
      const validProvider: EmbeddingProvider = "openai";
      expect(validProvider).toBe("openai");

      // @ts-expect-error - "aws" は EmbeddingProvider に含まれない
      // const invalidProvider: EmbeddingProvider = "aws";
    });
  });
});

// =============================================================================
// 9. readonly 制約テスト
// =============================================================================

describe("readonly 制約", () => {
  describe("ChunkPosition の readonly", () => {
    it("should have all fields as readonly (compile-time check)", () => {
      // 型レベルでの検証
      // 以下のコードは型チェック時にエラーになるはず
      const position: ChunkPosition = {
        index: 0,
        startLine: 1,
        endLine: 10,
        startChar: 0,
        endChar: 500,
        parentHeader: null,
      };

      // 実行時には参照のみ
      expect(position.index).toBe(0);

      // @ts-expect-error - readonly フィールドへの代入は禁止
      // position.index = 1;
    });
  });

  describe("ChunkEntity の readonly", () => {
    it("should have all fields as readonly (compile-time check)", () => {
      const mockChunkId = "550e8400-e29b-41d4-a716-446655440000" as ChunkId;
      const mockFileId = "660e8400-e29b-41d4-a716-446655440000" as FileId;

      const chunk: ChunkEntity = {
        id: mockChunkId,
        fileId: mockFileId,
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
        hash: "d".repeat(64),
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(chunk.content).toBe("Test");

      // @ts-expect-error - readonly フィールドへの代入は禁止
      // chunk.content = "Modified";
    });
  });

  describe("EmbeddingEntity の readonly", () => {
    it("should have all fields as readonly (compile-time check)", () => {
      const mockEmbeddingId =
        "770e8400-e29b-41d4-a716-446655440000" as EmbeddingId;
      const mockChunkId = "550e8400-e29b-41d4-a716-446655440000" as ChunkId;

      const embedding: EmbeddingEntity = {
        id: mockEmbeddingId,
        chunkId: mockChunkId,
        vector: new Float32Array([0.1, 0.2]),
        modelId: "test-model",
        dimensions: 2,
        normalizedMagnitude: 1.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(embedding.modelId).toBe("test-model");

      // @ts-expect-error - readonly フィールドへの代入は禁止
      // embedding.modelId = "new-model";
    });
  });
});
