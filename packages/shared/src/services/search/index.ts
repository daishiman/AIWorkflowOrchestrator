/**
 * @file 検索モジュール
 * @description CONV-07-01: クエリ分類器, CONV-07-02: キーワード検索, CONV-08-04: GraphRAGクエリ統合
 */

// Query Classifier Types
export {
  queryTypeSchema,
  searchWeightsSchema,
  queryClassificationSchema,
  DEFAULT_CLASSIFICATION_OPTIONS,
  SEARCH_WEIGHTS,
  type QueryType,
  type SearchWeights,
  type QueryClassification,
  type QueryClassificationOptions,
  type IQueryClassifier,
} from "./types";

// Query Classifier Implementations
export { RuleBasedQueryClassifier } from "./rule-based-query-classifier";
export { LLMQueryClassifier } from "./llm-query-classifier";

// Keyword Search Strategy (CONV-07-02)
export {
  KeywordSearchStrategy,
  MAX_QUERY_LENGTH,
  DEFAULT_SCALE_FACTOR,
  SEARCH_TIMEOUT_MS,
  type KeywordSearchError,
  type KeywordNearOptions,
  type IKeywordSearchStrategy,
} from "./keyword-search-strategy";

// GraphRAG Query Service (CONV-08-04)
export { GraphRAGQueryService } from "./graphrag-query-service";
export type {
  IGraphRAGQueryService,
  GraphRAGQueryServiceDependencies,
  GraphRAGQueryOptions,
  GraphRAGQueryResponse,
  GraphRAGQueryError,
  CommunitySummaryReference,
  ChunkReference,
  EntityReference,
  SearchStrategy,
  QueryMetadata,
} from "./graphrag-query-service";
