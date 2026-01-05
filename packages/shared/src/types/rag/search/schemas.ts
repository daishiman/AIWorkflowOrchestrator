/**
 * CONV-03-05: Search Query and Result Zod Schemas
 * HybridRAG検索エンジンのZodスキーマ定義
 *
 * @module @repo/shared/types/rag/search/schemas
 *
 * 実装内容:
 * - 全25型のZodスキーマ定義
 * - カスタムrefineバリデーション（searchWeights、dateRange、highlightOffset）
 * - 日本語エラーメッセージ
 */

import { z } from "zod";

// =============================================================================
// Branded Types スキーマ（簡略化）
// =============================================================================

/**
 * FileId スキーマ（Branded Type）
 */
export const fileIdSchema = z.string();

/**
 * ChunkId スキーマ（Branded Type）
 */
export const chunkIdSchema = z.string();

/**
 * EntityId スキーマ（Branded Type）
 */
export const entityIdSchema = z.string();

/**
 * CommunityId スキーマ（Branded Type）
 */
export const communityIdSchema = z.string();

// =============================================================================
// 列挙型スキーマ
// =============================================================================

/**
 * クエリタイプスキーマ
 */
export const queryTypeSchema = z.enum(
  ["local", "global", "relationship", "hybrid"],
  {
    message:
      "クエリタイプは local, global, relationship, hybrid のいずれかである必要があります",
  },
);

export type QueryType = z.infer<typeof queryTypeSchema>;

/**
 * 検索戦略スキーマ
 */
export const searchStrategySchema = z.enum(
  ["keyword", "semantic", "graph", "hybrid"],
  {
    message:
      "検索戦略は keyword, semantic, graph, hybrid のいずれかである必要があります",
  },
);

export type SearchStrategy = z.infer<typeof searchStrategySchema>;

/**
 * 検索結果タイプスキーマ
 */
export const searchResultTypeSchema = z.enum(["chunk", "entity", "community"], {
  message:
    "結果タイプは chunk, entity, community のいずれかである必要があります",
});

export type SearchResultType = z.infer<typeof searchResultTypeSchema>;

// =============================================================================
// 検索クエリ関連スキーマ
// =============================================================================

/**
 * 日付範囲スキーマ
 * start <= endである必要がある（片方がnullの場合は開放区間として許可）
 */
export const dateRangeSchema = z
  .object({
    start: z.date().nullable(),
    end: z.date().nullable(),
  })
  .refine(
    (data) => {
      if (data.start !== null && data.end !== null) {
        return data.start <= data.end;
      }
      return true; // 片方がnullの場合は開放区間として許可
    },
    { message: "開始日は終了日以前である必要があります" },
  );

export type DateRange = z.infer<typeof dateRangeSchema>;

/**
 * 検索重みスキーマ
 * 各重みは0.0-1.0の範囲、合計は1.0である必要がある
 */
export const searchWeightsSchema = z
  .object({
    keyword: z.number().min(0).max(1),
    semantic: z.number().min(0).max(1),
    graph: z.number().min(0).max(1),
  })
  .refine(
    (weights) => {
      const sum = weights.keyword + weights.semantic + weights.graph;
      return Math.abs(sum - 1.0) < 0.01;
    },
    { message: "検索重みの合計は1.0である必要があります" },
  );

export type SearchWeights = z.infer<typeof searchWeightsSchema>;

/**
 * 検索フィルタースキーマ
 */
export const searchFiltersSchema = z.object({
  fileIds: z.array(fileIdSchema).nullable(),
  entityTypes: z.array(z.string()).nullable(),
  dateRange: dateRangeSchema.nullable(),
  minRelevance: z.number().min(0).max(1).default(0.3),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;

/**
 * 検索オプションスキーマ
 */
export const searchOptionsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  includeMetadata: z.boolean().default(true),
  includeHighlights: z.boolean().default(true),
  rerankEnabled: z.boolean().default(true),
  cragEnabled: z.boolean().default(false),
  strategies: z.array(searchStrategySchema).min(1).default(["hybrid"]),
  weights: searchWeightsSchema.default({
    keyword: 0.35,
    semantic: 0.35,
    graph: 0.3,
  }),
});

export type SearchOptions = z.infer<typeof searchOptionsSchema>;

/**
 * 検索クエリスキーマ
 */
export const searchQuerySchema = z.object({
  text: z.string().min(1).max(1000),
  type: queryTypeSchema,
  embedding: z.instanceof(Float32Array).nullable(),
  filters: searchFiltersSchema,
  options: searchOptionsSchema,
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

/**
 * クエリ分類スキーマ
 */
export const queryClassificationSchema = z.object({
  originalQuery: z.string(),
  type: queryTypeSchema,
  confidence: z.number().min(0).max(1),
  extractedEntities: z.array(z.string()),
  suggestedWeights: searchWeightsSchema,
  expandedQueries: z.array(z.string()),
});

export type QueryClassification = z.infer<typeof queryClassificationSchema>;

// =============================================================================
// 検索結果関連スキーマ
// =============================================================================

/**
 * ハイライトオフセットスキーマ
 * start < endである必要がある
 */
export const highlightOffsetSchema = z
  .object({
    start: z.number().int().min(0),
    end: z.number().int().min(0),
  })
  .refine((data) => data.start < data.end, {
    message: "開始位置は終了位置より小さい必要があります",
  });

export type HighlightOffset = z.infer<typeof highlightOffsetSchema>;

/**
 * ハイライトスキーマ
 */
export const highlightSchema = z.object({
  field: z.string(),
  fragment: z.string(),
  offsets: z.array(highlightOffsetSchema),
});

export type Highlight = z.infer<typeof highlightSchema>;

/**
 * 検索結果コンテンツスキーマ
 */
export const searchResultContentSchema = z.object({
  text: z.string(),
  summary: z.string().nullable(),
  contextBefore: z.string().nullable(),
  contextAfter: z.string().nullable(),
});

export type SearchResultContent = z.infer<typeof searchResultContentSchema>;

/**
 * CRAGスコアスキーマ
 */
export const cragScoreSchema = z.object({
  relevance: z.enum(["correct", "incorrect", "ambiguous"]),
  confidence: z.number().min(0).max(1),
  needsWebSearch: z.boolean(),
  refinedQuery: z.string().nullable(),
});

export type CRAGScore = z.infer<typeof cragScoreSchema>;

/**
 * 関連度スコアスキーマ
 */
export const relevanceScoreSchema = z.object({
  combined: z.number().min(0).max(1),
  keyword: z.number().min(0).max(1),
  semantic: z.number().min(0).max(1),
  graph: z.number().min(0).max(1),
  rerank: z.number().min(0).max(1).nullable(),
  crag: cragScoreSchema.nullable(),
});

export type RelevanceScore = z.infer<typeof relevanceScoreSchema>;

/**
 * 検索結果ソーススキーマ
 */
export const searchResultSourcesSchema = z.object({
  chunkId: chunkIdSchema.nullable(),
  fileId: fileIdSchema.nullable(),
  entityIds: z.array(entityIdSchema),
  communityId: communityIdSchema.nullable(),
  relationIds: z.array(z.string()),
});

export type SearchResultSources = z.infer<typeof searchResultSourcesSchema>;

/**
 * 検索結果アイテムスキーマ
 */
export const searchResultItemSchema = z.object({
  id: z.string(),
  type: searchResultTypeSchema,
  score: z.number().min(0).max(1),
  relevance: relevanceScoreSchema,
  content: searchResultContentSchema,
  highlights: z.array(highlightSchema),
  sources: searchResultSourcesSchema,
});

export type SearchResultItem = z.infer<typeof searchResultItemSchema>;

/**
 * 戦略メトリクススキーマ
 */
export const strategyMetricSchema = z.object({
  enabled: z.boolean(),
  resultCount: z.number().int().min(0),
  processingTime: z.number().min(0),
  topScore: z.number().min(0).max(1),
});

export type StrategyMetric = z.infer<typeof strategyMetricSchema>;

/**
 * 検索戦略メトリクススキーマ
 */
export const searchStrategyMetricsSchema = z.object({
  keyword: strategyMetricSchema,
  semantic: strategyMetricSchema,
  graph: strategyMetricSchema,
});

export type SearchStrategyMetrics = z.infer<typeof searchStrategyMetricsSchema>;

/**
 * 検索結果スキーマ
 */
export const searchResultSchema = z.object({
  query: searchQuerySchema,
  results: z.array(searchResultItemSchema),
  totalCount: z.number().int().min(0),
  processingTime: z.number().min(0),
  strategies: searchStrategyMetricsSchema,
});

export type SearchResult = z.infer<typeof searchResultSchema>;

// =============================================================================
// 設定関連スキーマ
// =============================================================================

/**
 * RRF設定スキーマ
 */
export const rrfConfigSchema = z.object({
  k: z.number().int().min(1).max(1000).default(60),
  normalizeScores: z.boolean().default(true),
});

export type RRFConfig = z.infer<typeof rrfConfigSchema>;

/**
 * リランキング設定スキーマ
 */
export const rerankConfigSchema = z.object({
  enabled: z.boolean().default(true),
  model: z.string().default("cross-encoder/ms-marco-MiniLM-L-6-v2"),
  topK: z.number().int().min(1).max(100).default(50),
  batchSize: z.number().int().min(1).max(32).default(16),
});

export type RerankConfig = z.infer<typeof rerankConfigSchema>;

// =============================================================================
// スキーマバージョン情報
// =============================================================================

/**
 * スキーマバージョン情報
 */
export const SCHEMA_VERSION = {
  version: "1.0.0",
  releaseDate: "2025-12-18",
  changes: [
    "初版リリース",
    "全25型のスキーマ定義",
    "カスタムバリデーション（searchWeights、dateRange）",
  ],
} as const;
