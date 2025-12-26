/**
 * 埋め込みサービス エントリーポイント
 *
 * @description 埋め込み生成に関するすべてのエクスポート
 */

// Types
export type {
  EmbeddingModelId,
  ProviderName,
  ProviderConfig,
  EmbedOptions,
  BatchEmbedOptions,
  EmbeddingResult,
  BatchEmbeddingResult,
  RetryOptions,
  RateLimitConfig,
  CircuitBreakerConfig,
  EmbeddingMetric,
} from "./types/embedding.types";

// Errors
export {
  EmbeddingError,
  ProviderError,
  RateLimitError,
  TimeoutError,
  TokenLimitError,
  CircuitBreakerError,
} from "./types/errors";

// Providers
export type { IEmbeddingProvider } from "./providers/interfaces";
export { BaseEmbeddingProvider } from "./providers/base-embedding-provider";
export { OpenAIEmbeddingProvider } from "./providers/openai-provider";
export { Qwen3EmbeddingProvider } from "./providers/qwen3-provider";

// Utils
export { RateLimiter } from "./utils/rate-limiter";
export { CircuitBreaker } from "./utils/circuit-breaker";
export type { CircuitState } from "./utils/circuit-breaker";
export { RetryHandler, DEFAULT_RETRY_OPTIONS } from "./utils/retry-handler";
export {
  MetricsCollector,
  type EmbeddingStatistics,
} from "./utils/metrics-collector";
export { cosineSimilarity, hashContent } from "./utils/math-utils";
export { sleep, withTimeout } from "./utils/async-utils";

// Factory
export { EmbeddingProviderFactory } from "./factory/embedding-provider-factory";

// Service
export {
  EmbeddingService,
  type EmbeddingServiceConfig,
} from "./embedding-service";

// Batch Processor
export {
  EmbeddingBatchProcessor,
  DEFAULT_BATCH_CONFIG,
  type BatchProcessorConfig,
  type BatchProcessResult,
  type BatchProgressCallback,
} from "./batch-processor";

// Pipeline
export {
  EmbeddingPipeline,
  PipelineMetricsCollector,
  PipelineError,
  PreprocessingError,
  ChunkingError,
  EmbeddingStageError,
  DeduplicationError,
  type DocumentType,
  type PipelineInput,
  type PipelineConfig,
  type PipelineOutput,
  type PipelineProgress,
  type PipelineStage,
  type StageTimings,
  type ChunkWithEmbedding,
  type DeduplicationConfig,
  type PipelineMetric,
} from "./pipeline";
