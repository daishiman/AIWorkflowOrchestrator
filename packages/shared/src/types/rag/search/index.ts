/**
 * CONV-03-05: Search Query and Result Module
 * HybridRAG検索エンジンの型定義・スキーマ・ユーティリティ関数
 *
 * @module @repo/shared/types/rag/search
 */

// ==================== Types ====================
export {
  // Enums & Constants
  QueryTypes,
  SearchStrategies,
  SearchResultTypes,

  // Query Types
  type QueryType,
  type SearchStrategy,
  type SearchResultType,
  type SearchQuery,
  type SearchFilters,
  type DateRange,
  type SearchOptions,
  type SearchWeights,
  type QueryClassification,

  // Result Types
  type SearchResult,
  type SearchResultItem,
  type RelevanceScore,
  type CRAGScore,
  type SearchResultContent,
  type Highlight,
  type HighlightOffset,
  type SearchResultSources,
  type SearchStrategyMetrics,
  type StrategyMetric,

  // Utility Types
  type RankedItem,
  type RankedLists,
  type RRFResult,
  type DeduplicationStrategy,
  type QueryExpansionConfig,
  type ExpandedQuery,
  type MergeConfig,
  type SortOptions,

  // Configuration Types
  type RRFConfig,
  type RerankConfig,

  // Default Values
  DEFAULT_SEARCH_OPTIONS,
  DEFAULT_RRF_CONFIG,
  DEFAULT_RERANK_CONFIG,

  // Type Guards
  isChunkResult,
  isEntityResult,
  isCommunityResult,
} from "./types";

// ==================== Schemas ====================
export {
  // Branded Types Schemas
  fileIdSchema,
  chunkIdSchema,
  entityIdSchema,
  communityIdSchema,

  // Enum Schemas
  queryTypeSchema,
  searchStrategySchema,
  searchResultTypeSchema,

  // Query Schemas
  dateRangeSchema,
  searchWeightsSchema,
  searchFiltersSchema,
  searchOptionsSchema,
  searchQuerySchema,
  queryClassificationSchema,

  // Result Schemas
  highlightOffsetSchema,
  highlightSchema,
  searchResultContentSchema,
  cragScoreSchema,
  relevanceScoreSchema,
  searchResultSourcesSchema,
  searchResultItemSchema,
  strategyMetricSchema,
  searchStrategyMetricsSchema,
  searchResultSchema,

  // Config Schemas
  rrfConfigSchema,
  rerankConfigSchema,

  // Schema Version
  SCHEMA_VERSION,
} from "./schemas";

// ==================== Utils ====================
export {
  // Functions
  calculateRRFScore,
  normalizeScores,
  deduplicateResults,
  expandQuery,
  calculateCRAGScore,
  mergeSearchResults,
  sortByRelevance,
  filterByThreshold,

  // Error Classes
  SearchUtilsError,
  InvalidWeightsError,
  EmptyRankedListsError,
  InvalidKValueError,
  InvalidThresholdError,
} from "./utils";
