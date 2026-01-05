/**
 * @file RAG型定義バレルエクスポート
 * @module @repo/shared/types/rag
 * @description 全ての型定義を単一のインポートパスで提供
 *
 * @example
 * // 単一のインポートで全ての型にアクセス
 * import {
 *   // Result型
 *   ok, err, isOk, isErr, map, flatMap, mapErr, all,
 *   type Result, type Success, type Failure,
 *
 *   // Branded Types
 *   createFileId, generateFileId,
 *   type FileId, type ChunkId, type EntityId,
 *
 *   // エラー型
 *   ErrorCodes, createRAGError,
 *   type ErrorCode, type RAGError, type BaseError,
 *
 *   // インターフェース
 *   type Repository, type Converter, type SearchStrategy,
 *   type Timestamped, type WithMetadata, type PaginatedResult,
 *
 *   // Zodスキーマ
 *   uuidSchema, timestampedSchema, ragErrorSchema,
 * } from '@repo/shared/types/rag';
 */

// =============================================================================
// Result型 - Railway Oriented Programming
// =============================================================================

export {
  // 型
  type Success,
  type Failure,
  type Result,
  // コンストラクタ
  ok,
  err,
  // 型ガード
  isOk,
  isErr,
  // モナド操作
  map,
  flatMap,
  mapErr,
  all,
} from "./result";

// =============================================================================
// Branded Types - 名目的型付け
// =============================================================================

export {
  // 型
  type Brand,
  type FileId,
  type ChunkId,
  type ConversionId,
  type EntityId,
  type RelationId,
  type CommunityId,
  type EmbeddingId,
  // 型キャスト関数
  createFileId,
  createChunkId,
  createConversionId,
  createEntityId,
  createRelationId,
  createCommunityId,
  createEmbeddingId,
  // UUID生成関数
  generateUUID,
  generateFileId,
  generateChunkId,
  generateConversionId,
  generateEntityId,
  generateRelationId,
  generateCommunityId,
  generateEmbeddingId,
} from "./branded";

// =============================================================================
// エラー型
// =============================================================================

export {
  // 定数
  ErrorCodes,
  // 型
  type ErrorCode,
  type BaseError,
  type RAGError,
  // ファクトリ関数
  createRAGError,
} from "./errors";

// =============================================================================
// 共通インターフェース
// =============================================================================

export {
  // ミックスイン
  type Timestamped,
  type WithMetadata,
  // ページネーション
  type PaginationParams,
  type PaginatedResult,
  // 非同期ステータス
  type AsyncStatus,
  // パターン
  type Repository,
  type Converter,
  type SearchStrategy,
} from "./interfaces";

// =============================================================================
// Zodスキーマ
// =============================================================================

export {
  // スキーマ
  uuidSchema,
  timestampedSchema,
  metadataSchema,
  paginationParamsSchema,
  asyncStatusSchema,
  errorCodeSchema,
  ragErrorSchema,
  // 型（スキーマから推論）
  type UUID,
  type TimestampedSchema,
  type MetadataSchema,
  type PaginationParamsSchema,
  type AsyncStatusSchema,
  type ErrorCodeSchema,
  type RAGErrorSchema,
} from "./schemas";
