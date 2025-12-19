/**
 * CONV-03-05: Search Query and Result Types
 * HybridRAG検索エンジンの型定義
 *
 * @module @repo/shared/types/rag/search
 */

import type { ChunkId, EntityId, CommunityId, FileId } from "../branded";

// ==================== Enums & Constants ====================

/**
 * ユーザーの検索意図を分類するクエリタイプ
 */
export const QueryTypes = {
  LOCAL: "local",
  GLOBAL: "global",
  RELATIONSHIP: "relationship",
  HYBRID: "hybrid",
} as const;

export type QueryType = (typeof QueryTypes)[keyof typeof QueryTypes];

/**
 * 検索アルゴリズムを識別する戦略タイプ
 */
export const SearchStrategies = {
  KEYWORD: "keyword",
  SEMANTIC: "semantic",
  GRAPH: "graph",
  HYBRID: "hybrid",
} as const;

export type SearchStrategy =
  (typeof SearchStrategies)[keyof typeof SearchStrategies];

/**
 * 検索結果アイテムの種類を識別するタイプ
 */
export const SearchResultTypes = {
  CHUNK: "chunk",
  ENTITY: "entity",
  COMMUNITY: "community",
} as const;

export type SearchResultType =
  (typeof SearchResultTypes)[keyof typeof SearchResultTypes];

// ==================== Search Query Types ====================

/**
 * 検索クエリインターフェース
 */
export interface SearchQuery {
  readonly text: string;
  readonly type: QueryType;
  readonly embedding: Float32Array | null;
  readonly filters: SearchFilters;
  readonly options: SearchOptions;
}

/**
 * 検索フィルター
 */
export interface SearchFilters {
  readonly fileIds: ReadonlyArray<FileId> | null;
  readonly entityTypes: ReadonlyArray<string> | null;
  readonly dateRange: DateRange | null;
  readonly minRelevance: number; // 0.0-1.0
}

/**
 * 日付範囲フィルター
 */
export interface DateRange {
  readonly start: Date | null;
  readonly end: Date | null;
}

/**
 * 検索オプション
 */
export interface SearchOptions {
  readonly limit: number; // 1-100
  readonly offset: number; // 0以上
  readonly includeMetadata: boolean;
  readonly includeHighlights: boolean;
  readonly rerankEnabled: boolean;
  readonly cragEnabled: boolean;
  readonly strategies: ReadonlyArray<SearchStrategy>;
  readonly weights: SearchWeights;
}

/**
 * 検索戦略の重み（合計1.0）
 */
export interface SearchWeights {
  readonly keyword: number; // 0.0-1.0
  readonly semantic: number; // 0.0-1.0
  readonly graph: number; // 0.0-1.0
}

// ==================== Search Result Types ====================

/**
 * 統合検索結果
 */
export interface SearchResult {
  readonly query: SearchQuery;
  readonly results: ReadonlyArray<SearchResultItem>;
  readonly totalCount: number;
  readonly processingTime: number; // ミリ秒
  readonly strategies: SearchStrategyMetrics;
}

/**
 * 個別検索結果アイテム
 */
export interface SearchResultItem {
  readonly id: string;
  readonly type: SearchResultType;
  readonly score: number; // 0.0-1.0
  readonly relevance: RelevanceScore;
  readonly content: SearchResultContent;
  readonly highlights: ReadonlyArray<Highlight>;
  readonly sources: SearchResultSources;
}

/**
 * 関連度スコア詳細
 */
export interface RelevanceScore {
  readonly combined: number; // 0.0-1.0
  readonly keyword: number; // 0.0-1.0
  readonly semantic: number; // 0.0-1.0
  readonly graph: number; // 0.0-1.0
  readonly rerank: number | null; // 0.0-1.0
  readonly crag: CRAGScore | null;
}

/**
 * CRAG評価スコア
 */
export interface CRAGScore {
  readonly relevance: "correct" | "incorrect" | "ambiguous";
  readonly confidence: number; // 0.0-1.0
  readonly needsWebSearch: boolean;
  readonly refinedQuery: string | null;
}

/**
 * 検索結果コンテンツ
 */
export interface SearchResultContent {
  readonly text: string;
  readonly summary: string | null;
  readonly contextBefore: string | null;
  readonly contextAfter: string | null;
}

/**
 * ハイライト情報
 */
export interface Highlight {
  readonly field: string;
  readonly fragment: string;
  readonly offsets: ReadonlyArray<HighlightOffset>;
}

/**
 * ハイライトオフセット
 */
export interface HighlightOffset {
  readonly start: number; // 0以上
  readonly end: number; // start < end
}

/**
 * 検索結果ソース情報
 */
export interface SearchResultSources {
  readonly chunkId: ChunkId | null;
  readonly fileId: FileId | null;
  readonly entityIds: ReadonlyArray<EntityId>;
  readonly communityId: CommunityId | null;
  readonly relationIds: ReadonlyArray<string>;
}

/**
 * 検索戦略メトリクス
 */
export interface SearchStrategyMetrics {
  readonly keyword: StrategyMetric;
  readonly semantic: StrategyMetric;
  readonly graph: StrategyMetric;
}

/**
 * 個別戦略メトリクス
 */
export interface StrategyMetric {
  readonly enabled: boolean;
  readonly resultCount: number;
  readonly processingTime: number; // ミリ秒
  readonly topScore: number; // 0.0-1.0
}

// ==================== Utility Function Types ====================

/**
 * ランク付き検索結果アイテム（RRF用）
 */
export interface RankedItem {
  readonly id: string;
  readonly rank: number; // 1始まり
  readonly originalScore?: number;
}

/**
 * 各戦略のランク付きリスト
 */
export interface RankedLists {
  readonly keyword: ReadonlyArray<RankedItem>;
  readonly semantic: ReadonlyArray<RankedItem>;
  readonly graph: ReadonlyArray<RankedItem>;
}

/**
 * RRF計算結果
 */
export interface RRFResult {
  readonly id: string;
  readonly rrfScore: number;
  readonly scoreBreakdown: {
    readonly keyword: number;
    readonly semantic: number;
    readonly graph: number;
  };
}

/**
 * 重複排除戦略
 */
export type DeduplicationStrategy =
  | "max_score"
  | "sum_score"
  | "first"
  | "last";

/**
 * クエリ拡張設定
 */
export interface QueryExpansionConfig {
  readonly maxExpansions: number; // 最大拡張数（デフォルト: 5）
  readonly includeSynonyms: boolean; // 同義語を含む（デフォルト: true）
  readonly includeRelated: boolean; // 関連語を含む（デフォルト: true）
  readonly language: "ja" | "en"; // 言語
}

/**
 * 拡張されたクエリ
 */
export interface ExpandedQuery {
  readonly original: string;
  readonly expanded: ReadonlyArray<string>;
  readonly metadata: {
    readonly synonymCount: number;
    readonly relatedCount: number;
  };
}

/**
 * 結果マージ設定
 */
export interface MergeConfig {
  readonly deduplicationStrategy: DeduplicationStrategy;
  readonly maxResults?: number;
  readonly minScore?: number;
}

/**
 * ソートオプション
 */
export interface SortOptions {
  readonly direction: "asc" | "desc"; // デフォルト: 'desc'
  readonly tieBreaker?: <T extends { readonly score: number }>(
    a: T,
    b: T,
  ) => number;
}

// ==================== Query Classification ====================

/**
 * クエリ分類結果
 */
export interface QueryClassification {
  readonly originalQuery: string;
  readonly type: QueryType;
  readonly confidence: number; // 0.0-1.0
  readonly extractedEntities: ReadonlyArray<string>;
  readonly suggestedWeights: SearchWeights;
  readonly expandedQueries: ReadonlyArray<string>;
}

// ==================== Configuration Types ====================

/**
 * RRF設定
 */
export interface RRFConfig {
  readonly k: number; // 1-1000
  readonly normalizeScores: boolean;
}

/**
 * リランキング設定
 */
export interface RerankConfig {
  readonly enabled: boolean;
  readonly model: string;
  readonly topK: number; // 1-100
  readonly batchSize: number; // 1-32
}

// ==================== Default Values ====================

/**
 * デフォルトの検索オプション
 */
export const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
  limit: 20,
  offset: 0,
  includeMetadata: true,
  includeHighlights: true,
  rerankEnabled: true,
  cragEnabled: false,
  strategies: ["hybrid"],
  weights: {
    keyword: 0.35,
    semantic: 0.35,
    graph: 0.3,
  },
} as const;

/**
 * デフォルトのRRF設定
 */
export const DEFAULT_RRF_CONFIG: RRFConfig = {
  k: 60,
  normalizeScores: true,
} as const;

/**
 * デフォルトのリランキング設定
 */
export const DEFAULT_RERANK_CONFIG: RerankConfig = {
  enabled: true,
  model: "cross-encoder/ms-marco-MiniLM-L-6-v2",
  topK: 50,
  batchSize: 16,
} as const;

// ==================== Type Guards ====================

/**
 * SearchResultItemがChunk結果かどうかを判定する型ガード
 */
export function isChunkResult(
  item: SearchResultItem,
): item is SearchResultItem & { sources: { chunkId: ChunkId } } {
  return item.type === "chunk" && item.sources.chunkId !== null;
}

/**
 * SearchResultItemがEntity結果かどうかを判定する型ガード
 */
export function isEntityResult(
  item: SearchResultItem,
): item is SearchResultItem & {
  sources: { entityIds: ReadonlyArray<EntityId> };
} {
  return item.type === "entity" && item.sources.entityIds.length > 0;
}

/**
 * SearchResultItemがCommunity結果かどうかを判定する型ガード
 */
export function isCommunityResult(
  item: SearchResultItem,
): item is SearchResultItem & { sources: { communityId: CommunityId } } {
  return item.type === "community" && item.sources.communityId !== null;
}
