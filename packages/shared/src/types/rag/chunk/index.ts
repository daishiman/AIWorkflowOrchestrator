/**
 * @file チャンク・埋め込み型定義バレルエクスポート
 * @module @repo/shared/types/rag/chunk
 * @description RAGパイプラインにおけるチャンキングと埋め込み生成の型定義、スキーマ、ユーティリティ
 *
 * このモジュールは以下をエクスポートします:
 * - 型定義（types.ts）: インターフェース、型エイリアス、列挙型
 * - Zodスキーマ（schemas.ts）: ランタイムバリデーション
 * - ユーティリティ（utils.ts）: ベクトル演算、変換、推定関数、デフォルト設定
 *
 * @example
 * ```typescript
 * import {
 *   // 型定義
 *   ChunkEntity,
 *   EmbeddingEntity,
 *   ChunkingStrategy,
 *
 *   // Zodスキーマ
 *   chunkEntitySchema,
 *   embeddingEntitySchema,
 *
 *   // ユーティリティ
 *   cosineSimilarity,
 *   normalizeVector,
 *   defaultChunkingConfig,
 * } from '@repo/shared/types/rag/chunk';
 * ```
 */

// =============================================================================
// 型定義（types.ts）
// =============================================================================

// 列挙型定数
export { ChunkingStrategies, EmbeddingProviders } from "./types";

// 型エイリアス
export type { ChunkingStrategy, EmbeddingProvider } from "./types";

// 基本インターフェース
export type { ChunkPosition, ChunkOverlap } from "./types";

// エンティティインターフェース
export type { ChunkEntity, EmbeddingEntity } from "./types";

// 設定インターフェース
export type { EmbeddingModelConfig, ChunkingConfig } from "./types";

// 結果インターフェース
export type { ChunkingResult, EmbeddingGenerationResult } from "./types";

// =============================================================================
// Zodスキーマ（schemas.ts）
// =============================================================================

// 列挙型スキーマ
export { chunkingStrategySchema, embeddingProviderSchema } from "./schemas";

// 基本インターフェーススキーマ
export { chunkPositionSchema, chunkOverlapSchema } from "./schemas";

// 設定スキーマ
export { embeddingModelConfigSchema, chunkingConfigSchema } from "./schemas";

// エンティティスキーマ
export { chunkEntitySchema, embeddingEntitySchema } from "./schemas";

// 結果スキーマ
export {
  chunkingResultSchema,
  embeddingGenerationResultSchema,
} from "./schemas";

// バッチ処理スキーマ
export { batchEmbeddingInputSchema } from "./schemas";

// =============================================================================
// ユーティリティ（utils.ts）
// =============================================================================

// ベクトル演算関数
export {
  normalizeVector,
  vectorMagnitude,
  cosineSimilarity,
  euclideanDistance,
  dotProduct,
} from "./utils";

// Base64変換関数
export { vectorToBase64, base64ToVector } from "./utils";

// トークン推定関数
export { estimateTokenCount } from "./utils";

// デフォルト設定
export { defaultChunkingConfig, defaultEmbeddingModelConfigs } from "./utils";
