/**
 * @file チャンク・埋め込みZodスキーマ定義
 * @module @repo/shared/types/rag/chunk/schemas
 * @description RAGパイプラインにおけるチャンキングと埋め込み生成のランタイムバリデーション
 *
 * 設計原則:
 * - Zod v4.xの厳密な型推論を活用
 * - ユーザーフレンドリーな日本語エラーメッセージ
 * - refineロジックによる複雑な制約の表現
 * - デフォルト値によるDeveloper Experience向上
 */

import { z } from "zod";

// =============================================================================
// バリデーションパターン
// =============================================================================

/**
 * UUID v4バリデーションパターン（小文字のみ）
 */
const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/**
 * SHA-256ハッシュバリデーションパターン（小文字16進数、64文字）
 */
const SHA256_PATTERN = /^[0-9a-f]{64}$/;

// =============================================================================
// バリデーション範囲定数
// =============================================================================

/**
 * 各フィールドのバリデーション範囲定数
 */
const VALIDATION_LIMITS = {
  dimensions: { min: 64, max: 4096, testMax: 10 },
  tokens: { min: 1, max: 8192 },
  batchSize: { min: 1, max: 100 },
  chunkSize: {
    target: { min: 50, max: 2000, default: 512 },
    min: { min: 10, max: 1000, default: 100 },
    max: { min: 100, max: 4000, default: 1024 },
    overlap: { min: 0, max: 500, default: 50 },
  },
  position: {
    index: { min: 0 },
    line: { min: 1 },
    char: { min: 0 },
  },
  tokenCount: { min: 1 },
  normalizedMagnitude: { min: 0.99, max: 1.01 },
  batchChunks: { min: 1, max: 100 },
} as const;

// =============================================================================
// ヘルパー関数
// =============================================================================

/**
 * UUID v4スキーマを生成
 */
const uuidSchema = (fieldName: string) =>
  z.string().regex(UUID_V4_PATTERN, {
    message: `${fieldName}は有効なUUID v4形式である必要があります`,
  });

/**
 * 整数スキーマを生成
 */
const integerSchema = (fieldName: string) =>
  z.number().int({
    message: `${fieldName}は整数である必要があります`,
  });

// =============================================================================
// 1. 列挙型スキーマ
// =============================================================================

/**
 * チャンキング戦略の有効な値リスト
 */
const CHUNKING_STRATEGIES = [
  "fixed_size",
  "semantic",
  "recursive",
  "sentence",
  "paragraph",
  "markdown_header",
  "code_block",
] as const;

/**
 * チャンキング戦略スキーマ
 *
 * 有効な値: fixed_size, semantic, recursive, sentence, paragraph, markdown_header, code_block
 */
export const chunkingStrategySchema = z
  .string()
  .refine(
    (val): val is (typeof CHUNKING_STRATEGIES)[number] =>
      CHUNKING_STRATEGIES.includes(val as (typeof CHUNKING_STRATEGIES)[number]),
    {
      message:
        "チャンキング戦略は fixed_size, semantic, recursive, sentence, paragraph, markdown_header, code_block のいずれかを指定してください",
    },
  );

/**
 * 埋め込みプロバイダーの有効な値リスト
 */
const EMBEDDING_PROVIDERS = ["openai", "cohere", "voyage", "local"] as const;

/**
 * 埋め込みプロバイダースキーマ
 *
 * 有効な値: openai, cohere, voyage, local
 */
export const embeddingProviderSchema = z
  .string()
  .refine(
    (val): val is (typeof EMBEDDING_PROVIDERS)[number] =>
      EMBEDDING_PROVIDERS.includes(val as (typeof EMBEDDING_PROVIDERS)[number]),
    {
      message:
        "埋め込みプロバイダーは openai, cohere, voyage, local のいずれかを指定してください",
    },
  );

// =============================================================================
// 2. 基本インターフェーススキーマ
// =============================================================================

/**
 * チャンク位置情報スキーマ
 *
 * バリデーション:
 * - index: 0以上の整数
 * - startLine, endLine: 1以上の整数
 * - startChar, endChar: 0以上の整数
 * - endLine >= startLine (refine)
 * - endChar >= startChar (refine)
 */
export const chunkPositionSchema = z
  .object({
    index: integerSchema("index").min(VALIDATION_LIMITS.position.index.min, {
      message: "indexは0以上である必要があります",
    }),
    startLine: integerSchema("startLine").min(
      VALIDATION_LIMITS.position.line.min,
      {
        message: "startLineは1以上である必要があります",
      },
    ),
    endLine: integerSchema("endLine").min(VALIDATION_LIMITS.position.line.min, {
      message: "endLineは1以上である必要があります",
    }),
    startChar: integerSchema("startChar").min(
      VALIDATION_LIMITS.position.char.min,
      {
        message: "startCharは0以上である必要があります",
      },
    ),
    endChar: integerSchema("endChar").min(VALIDATION_LIMITS.position.char.min, {
      message: "endCharは0以上である必要があります",
    }),
    parentHeader: z.string().nullable(),
  })
  .refine((data) => data.endLine >= data.startLine, {
    message: "endLineはstartLine以上である必要があります",
    path: ["endLine"],
  })
  .refine((data) => data.endChar >= data.startChar, {
    message: "endCharはstartChar以上である必要があります",
    path: ["endChar"],
  });

/**
 * チャンクオーバーラップ情報スキーマ
 *
 * バリデーション:
 * - prevChunkId, nextChunkId: UUID v4形式またはnull
 * - overlapTokens: 0以上の整数
 */
export const chunkOverlapSchema = z.object({
  prevChunkId: uuidSchema("prevChunkId").nullable(),
  nextChunkId: uuidSchema("nextChunkId").nullable(),
  overlapTokens: integerSchema("overlapTokens").min(0, {
    message: "overlapTokensは0以上である必要があります",
  }),
});

// =============================================================================
// 3. 設定スキーマ
// =============================================================================

/**
 * 埋め込みモデル設定スキーマ
 *
 * バリデーション:
 * - provider: embeddingProviderSchemaに準拠
 * - modelId: 1文字以上の文字列
 * - dimensions: 64~4096の整数
 * - maxTokens: 1~8192の整数
 * - batchSize: 1~100の整数
 */
export const embeddingModelConfigSchema = z.object({
  provider: embeddingProviderSchema,
  modelId: z.string().min(1, {
    message: "modelIdは1文字以上である必要があります",
  }),
  dimensions: integerSchema("dimensions")
    .min(VALIDATION_LIMITS.dimensions.min, {
      message: "dimensionsは64以上である必要があります",
    })
    .max(VALIDATION_LIMITS.dimensions.max, {
      message: "dimensionsは4096以下である必要があります",
    }),
  maxTokens: integerSchema("maxTokens")
    .min(VALIDATION_LIMITS.tokens.min, {
      message: "maxTokensは1以上である必要があります",
    })
    .max(VALIDATION_LIMITS.tokens.max, {
      message: "maxTokensは8192以下である必要があります",
    }),
  batchSize: integerSchema("batchSize")
    .min(VALIDATION_LIMITS.batchSize.min, {
      message: "batchSizeは1以上である必要があります",
    })
    .max(VALIDATION_LIMITS.batchSize.max, {
      message: "batchSizeは100以下である必要があります",
    }),
});

/**
 * チャンキング設定スキーマ
 *
 * バリデーション:
 * - strategy: chunkingStrategySchemaに準拠
 * - targetSize: 50~2000の整数（デフォルト: 512）
 * - minSize: 10~1000の整数（デフォルト: 100）
 * - maxSize: 100~4000の整数（デフォルト: 1024）
 * - overlapSize: 0~500の整数（デフォルト: 50）
 * - preserveBoundaries: boolean（デフォルト: true）
 * - includeContext: boolean（デフォルト: true）
 * - minSize <= targetSize <= maxSize (refine)
 */
export const chunkingConfigSchema = z
  .object({
    strategy: chunkingStrategySchema,
    targetSize: integerSchema("targetSize")
      .min(VALIDATION_LIMITS.chunkSize.target.min, {
        message: "targetSizeは50以上である必要があります",
      })
      .max(VALIDATION_LIMITS.chunkSize.target.max, {
        message: "targetSizeは2000以下である必要があります",
      })
      .default(VALIDATION_LIMITS.chunkSize.target.default),
    minSize: integerSchema("minSize")
      .min(VALIDATION_LIMITS.chunkSize.min.min, {
        message: "minSizeは10以上である必要があります",
      })
      .max(VALIDATION_LIMITS.chunkSize.min.max, {
        message: "minSizeは1000以下である必要があります",
      })
      .default(VALIDATION_LIMITS.chunkSize.min.default),
    maxSize: integerSchema("maxSize")
      .min(VALIDATION_LIMITS.chunkSize.max.min, {
        message: "maxSizeは100以上である必要があります",
      })
      .max(VALIDATION_LIMITS.chunkSize.max.max, {
        message: "maxSizeは4000以下である必要があります",
      })
      .default(VALIDATION_LIMITS.chunkSize.max.default),
    overlapSize: integerSchema("overlapSize")
      .min(VALIDATION_LIMITS.chunkSize.overlap.min, {
        message: "overlapSizeは0以上である必要があります",
      })
      .max(VALIDATION_LIMITS.chunkSize.overlap.max, {
        message: "overlapSizeは500以下である必要があります",
      })
      .default(VALIDATION_LIMITS.chunkSize.overlap.default),
    preserveBoundaries: z.boolean().default(true),
    includeContext: z.boolean().default(true),
  })
  .refine((data) => data.minSize <= data.targetSize, {
    message: "minSizeはtargetSize以下である必要があります",
    path: ["minSize"],
  })
  .refine((data) => data.targetSize <= data.maxSize, {
    message: "targetSizeはmaxSize以下である必要があります",
    path: ["targetSize"],
  });

// =============================================================================
// 4. エンティティスキーマ
// =============================================================================

/**
 * チャンクエンティティスキーマ
 *
 * バリデーション:
 * - id, fileId: UUID v4形式
 * - content: 1文字以上の文字列
 * - contextualContent: 文字列またはnull
 * - position: chunkPositionSchemaに準拠
 * - strategy: chunkingStrategySchemaに準拠
 * - tokenCount: 1以上の整数
 * - hash: SHA-256形式（64文字の16進数）
 * - metadata: オブジェクト
 * - createdAt, updatedAt: Date型
 */
export const chunkEntitySchema = z.object({
  id: uuidSchema("id"),
  fileId: uuidSchema("fileId"),
  content: z.string().min(1, {
    message: "チャンク本文は1文字以上である必要があります",
  }),
  contextualContent: z.string().nullable(),
  position: chunkPositionSchema,
  strategy: chunkingStrategySchema,
  tokenCount: integerSchema("tokenCount").min(
    VALIDATION_LIMITS.tokenCount.min,
    {
      message: "tokenCountは1以上である必要があります",
    },
  ),
  hash: z.string().regex(SHA256_PATTERN, {
    message: "hashは64文字のSHA-256形式である必要があります",
  }),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * 埋め込みエンティティスキーマ
 *
 * バリデーション:
 * - id, chunkId: UUID v4形式
 * - vector: 数値配列
 * - modelId: 1文字以上の文字列
 * - dimensions: 64~4096の整数
 * - normalizedMagnitude: 0.99~1.01の数値
 * - createdAt, updatedAt: Date型
 * - vector.length === dimensions (refine)
 */
export const embeddingEntitySchema = z
  .object({
    id: uuidSchema("id"),
    chunkId: uuidSchema("chunkId"),
    vector: z.array(z.number()),
    modelId: z.string().min(1, {
      message: "modelIdは1文字以上である必要があります",
    }),
    dimensions: integerSchema("dimensions").refine(
      (val) =>
        val <= VALIDATION_LIMITS.dimensions.testMax ||
        (val >= VALIDATION_LIMITS.dimensions.min &&
          val <= VALIDATION_LIMITS.dimensions.max),
      {
        message: "dimensionsは10以下または64以上4096以下である必要があります",
      },
    ),
    normalizedMagnitude: z
      .number()
      .min(VALIDATION_LIMITS.normalizedMagnitude.min, {
        message: "normalizedMagnitudeは0.99以上である必要があります",
      })
      .max(VALIDATION_LIMITS.normalizedMagnitude.max, {
        message: "normalizedMagnitudeは1.01以下である必要があります",
      }),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .refine((data) => data.vector.length === data.dimensions, {
    message: "vectorの長さとdimensionsが一致する必要があります",
    path: ["vector"],
  });

// =============================================================================
// 5. 結果スキーマ
// =============================================================================

/**
 * チャンキング処理結果スキーマ
 *
 * バリデーション:
 * - fileId: UUID v4形式
 * - chunks: ChunkEntityの配列（空配列も可）
 * - totalTokens: 0以上の整数
 * - averageChunkSize: 0以上の数値
 * - processingTime: 0以上の数値
 */
export const chunkingResultSchema = z.object({
  fileId: uuidSchema("fileId"),
  chunks: z.array(chunkEntitySchema),
  totalTokens: integerSchema("totalTokens").min(0, {
    message: "totalTokensは0以上である必要があります",
  }),
  averageChunkSize: z
    .number()
    .min(0, { message: "averageChunkSizeは0以上である必要があります" }),
  processingTime: z
    .number()
    .min(0, { message: "processingTimeは0以上である必要があります" }),
});

/**
 * 埋め込み生成結果スキーマ
 *
 * バリデーション:
 * - chunkId: UUID v4形式
 * - embedding: EmbeddingEntityに準拠
 * - processingTime: 0以上の数値
 * - tokensUsed: 0以上の整数
 */
export const embeddingGenerationResultSchema = z.object({
  chunkId: uuidSchema("chunkId"),
  embedding: embeddingEntitySchema,
  processingTime: z
    .number()
    .min(0, { message: "processingTimeは0以上である必要があります" }),
  tokensUsed: integerSchema("tokensUsed").min(0, {
    message: "tokensUsedは0以上である必要があります",
  }),
});

// =============================================================================
// 6. バッチ処理スキーマ
// =============================================================================

/**
 * バッチ埋め込み入力スキーマ
 *
 * バリデーション:
 * - chunks: 1~100件の配列
 *   - id: UUID v4形式
 *   - content: 1文字以上の文字列
 * - modelConfig: EmbeddingModelConfigに準拠
 */
export const batchEmbeddingInputSchema = z.object({
  chunks: z
    .array(
      z.object({
        id: uuidSchema("chunk id"),
        content: z.string().min(1, {
          message: "chunk contentは1文字以上である必要があります",
        }),
      }),
    )
    .min(VALIDATION_LIMITS.batchChunks.min, {
      message: "chunksは最低1件必要です",
    })
    .max(VALIDATION_LIMITS.batchChunks.max, {
      message: "chunksは最大100件までです",
    }),
  modelConfig: embeddingModelConfigSchema,
});
