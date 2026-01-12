/**
 * @file 検索戦略モジュールエクスポート
 * @description VectorSearchStrategy, CachedVectorSearchStrategy等のエクスポート
 * CONV-07-03: HybridRAGセマンティック検索
 */

// 型定義
export {
  type ISearchStrategy,
  type Result,
  Ok,
  Err,
  ok,
  err,
  MAX_QUERY_LENGTH,
  MIN_LIMIT,
  MAX_LIMIT,
  DEFAULT_LIMIT,
} from "./types";

// VectorSearchStrategy
export { VectorSearchStrategy } from "./vector-search-strategy";

// CachedVectorSearchStrategy
export {
  CachedVectorSearchStrategy,
  type CachedVectorSearchOptions,
  type CacheStats,
} from "./cached-vector-search-strategy";
