// Types
export * from "./types";

// Skill types from src/types
export * from "./src/types/skill";

// Agent Execution types (AGENT-005)
export * from "./src/types/agent-execution";

// Core
export * from "./core";

// Infrastructure
export * from "./infrastructure";

// =============================================================================
// Services
// =============================================================================

/**
 * Graph Service - Community関連型
 * Knowledge Graphサービスから提供される型定義。
 * Entity、Relation、Community、Graph関連の型を含む。
 *
 * @see packages/shared/src/services/graph/index.ts
 */
export type {
  // Entity関連
  StoredEntity,
  ExtractedEntity,
  EntityMention,
  // Relation関連
  StoredRelation,
  ExtractedRelation,
  RelationEvidence,
  // Graph関連
  GraphNode,
  GraphEdge,
  GraphPath,
  GraphTraversalResult,
  GraphStats,
  // Community関連
  Community,
  CommunitySummary,
  CommunityStructure,
  CommunityDetectionOptions,
  CommunityDetectionResult,
  CommunityDetectionStats,
  CommunitySummarizationOptions,
  CommunitySummarizationResult,
  // Query関連
  EntityQuery,
  TraversalOptions,
  RelationQueryOptions,
} from "./src/services/graph";

/**
 * Graph Service - 値（enum, class, function）
 * エラーコード、エラークラス、ユーティリティ関数を含む。
 */
export {
  CommunityErrorCode,
  CommunityDetectionError,
  CommunitySummarizationErrorCode,
  CommunitySummarizationError,
  normalizeEntityName,
} from "./src/services/graph";

// =============================================================================
// RAG Types (Branded IDs)
// =============================================================================

/**
 * Branded ID型
 * 異なるIDの誤用をコンパイル時に検出可能にする型システム。
 *
 * @see packages/shared/src/types/rag/branded.ts
 */
export type {
  Brand,
  FileId,
  ChunkId,
  ConversionId,
  EntityId,
  RelationId,
  CommunityId,
  EmbeddingId,
} from "./src/types/rag/branded";

/**
 * Branded ID - 型キャスト関数
 */
export {
  createFileId,
  createChunkId,
  createConversionId,
  createEntityId,
  createRelationId,
  createCommunityId,
  createEmbeddingId,
} from "./src/types/rag/branded";

/**
 * Branded ID - UUID生成関数
 */
export {
  generateUUID,
  generateFileId,
  generateChunkId,
  generateConversionId,
  generateEntityId,
  generateRelationId,
  generateCommunityId,
  generateEmbeddingId,
} from "./src/types/rag/branded";

// Utils
export * from "./utils";

// Slide
export * from "./src/slide";
