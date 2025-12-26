/**
 * チャンキングサービスのエクスポート
 */

// 型定義
export type {
  ChunkingStrategy,
  DocumentType,
  ChunkBoundary,
  PoolingStrategy,
  BaseChunkingOptions,
  FixedChunkingOptions,
  SentenceChunkingOptions,
  SemanticChunkingOptions,
  HierarchicalChunkingOptions,
  HeadingPattern,
  ContextualEmbeddingsOptions,
  LateChunkingOptions,
  ChunkingOptions,
  ChunkingInput,
  ChunkPosition,
  ChunkOverlap,
  ChunkMetadata,
  Chunk,
  HierarchicalChunk,
  ContextualChunk,
  ChunkingStatistics,
  ChunkingOutput,
} from "./types";

// インターフェース
export type {
  IChunkingStrategy,
  ITokenizer,
  IEmbeddingClient,
  ILLMClient,
  LLMOptions,
} from "./interfaces";

// エラー
export {
  ChunkingError,
  ValidationError,
  TokenizationError,
  EmbeddingError,
  LLMError,
} from "./errors";

// 戦略
export { BaseChunkingStrategy } from "./strategies/base-chunking-strategy";
export { FixedChunkingStrategy } from "./strategies/fixed-chunking-strategy";
export { SentenceChunkingStrategy } from "./strategies/sentence-chunking-strategy";
export { SemanticChunkingStrategy } from "./strategies/semantic-chunking-strategy";
export { HierarchicalChunkingStrategy } from "./strategies/hierarchical-chunking-strategy";

// サービス
export { ChunkingService } from "./chunking-service";
