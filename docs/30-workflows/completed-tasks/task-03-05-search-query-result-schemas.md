# CONV-03-05: 検索クエリ・結果スキーマ定義

## 概要

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| タスクID | CONV-03-05                              |
| タスク名 | 検索クエリ・結果スキーマ定義            |
| 依存     | CONV-03-01                              |
| 規模     | 小                                      |
| 出力場所 | `packages/shared/src/types/rag/search/` |

## 目的

HybridRAG検索エンジンで使用する検索クエリ、検索結果、リランキングの型とZodスキーマを定義する。
CONV-07（HybridRAG検索エンジン）の基盤となる。

## 成果物

### 1. 検索型定義

```typescript
// packages/shared/src/types/rag/search/types.ts

import type { ChunkId, EntityId, CommunityId, FileId } from "../branded";
import type { ChunkEntity } from "../chunk/types";
import type {
  EntityEntity,
  RelationEntity,
  CommunityEntity,
} from "../graph/types";

/**
 * クエリタイプ（検索意図分類）
 */
export const QueryTypes = {
  LOCAL: "local", // 具体的な事実・詳細情報
  GLOBAL: "global", // 全体的な概要・要約
  RELATIONSHIP: "relationship", // エンティティ間の関係
  HYBRID: "hybrid", // 複合クエリ
} as const;

export type QueryType = (typeof QueryTypes)[keyof typeof QueryTypes];

/**
 * 検索戦略
 */
export const SearchStrategies = {
  KEYWORD: "keyword", // BM25/FTS5
  SEMANTIC: "semantic", // ベクトル検索
  GRAPH: "graph", // グラフ検索
  HYBRID: "hybrid", // 3戦略融合
} as const;

export type SearchStrategy =
  (typeof SearchStrategies)[keyof typeof SearchStrategies];

/**
 * 検索クエリ
 */
export interface SearchQuery {
  readonly text: string;
  readonly type: QueryType;
  readonly embedding: Float32Array | null; // 事前計算済み埋め込み
  readonly filters: SearchFilters;
  readonly options: SearchOptions;
}

/**
 * 検索フィルター
 */
export interface SearchFilters {
  readonly fileIds: readonly FileId[] | null;
  readonly entityTypes: readonly string[] | null;
  readonly dateRange: DateRange | null;
  readonly minRelevance: number; // 最小関連度スコア
}

/**
 * 日付範囲
 */
export interface DateRange {
  readonly start: Date | null;
  readonly end: Date | null;
}

/**
 * 検索オプション
 */
export interface SearchOptions {
  readonly limit: number;
  readonly offset: number;
  readonly includeMetadata: boolean;
  readonly includeHighlights: boolean;
  readonly rerankEnabled: boolean;
  readonly cragEnabled: boolean; // Corrective RAG
  readonly strategies: readonly SearchStrategy[];
  readonly weights: SearchWeights;
}

/**
 * 検索戦略の重み
 */
export interface SearchWeights {
  readonly keyword: number; // BM25重み
  readonly semantic: number; // ベクトル検索重み
  readonly graph: number; // グラフ検索重み
}

/**
 * 統合検索結果
 */
export interface SearchResult {
  readonly query: SearchQuery;
  readonly results: readonly SearchResultItem[];
  readonly totalCount: number;
  readonly processingTime: number; // ms
  readonly strategies: SearchStrategyMetrics;
}

/**
 * 検索結果アイテム
 */
export interface SearchResultItem {
  readonly id: string;
  readonly type: SearchResultType;
  readonly score: number; // 融合後スコア
  readonly relevance: RelevanceScore;
  readonly content: SearchResultContent;
  readonly highlights: readonly Highlight[];
  readonly sources: SearchResultSources;
}

/**
 * 検索結果タイプ
 */
export const SearchResultTypes = {
  CHUNK: "chunk",
  ENTITY: "entity",
  COMMUNITY: "community",
} as const;

export type SearchResultType =
  (typeof SearchResultTypes)[keyof typeof SearchResultTypes];

/**
 * 関連度スコア詳細
 */
export interface RelevanceScore {
  readonly combined: number; // 統合スコア
  readonly keyword: number; // BM25スコア
  readonly semantic: number; // コサイン類似度
  readonly graph: number; // グラフ中心性
  readonly rerank: number | null; // リランクスコア
  readonly crag: CRAGScore | null; // CRAG評価
}

/**
 * CRAG（Corrective RAG）スコア
 */
export interface CRAGScore {
  readonly relevance: "correct" | "incorrect" | "ambiguous";
  readonly confidence: number;
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
 * ハイライト（マッチ箇所）
 */
export interface Highlight {
  readonly field: string;
  readonly fragment: string;
  readonly offsets: readonly HighlightOffset[];
}

/**
 * ハイライトオフセット
 */
export interface HighlightOffset {
  readonly start: number;
  readonly end: number;
}

/**
 * 検索結果ソース情報
 */
export interface SearchResultSources {
  readonly chunkId: ChunkId | null;
  readonly fileId: FileId | null;
  readonly entityIds: readonly EntityId[];
  readonly communityId: CommunityId | null;
  readonly relationIds: readonly string[];
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
  readonly processingTime: number;
  readonly topScore: number;
}

/**
 * RRF（Reciprocal Rank Fusion）設定
 */
export interface RRFConfig {
  readonly k: number; // RRF定数（通常60）
  readonly normalizeScores: boolean;
}

/**
 * リランキング設定
 */
export interface RerankConfig {
  readonly enabled: boolean;
  readonly model: string; // 'cross-encoder/ms-marco-MiniLM-L-6-v2' など
  readonly topK: number; // リランク対象数
  readonly batchSize: number;
}

/**
 * クエリ分類結果
 */
export interface QueryClassification {
  readonly originalQuery: string;
  readonly type: QueryType;
  readonly confidence: number;
  readonly extractedEntities: readonly string[];
  readonly suggestedWeights: SearchWeights;
  readonly expandedQueries: readonly string[]; // クエリ拡張
}
```

### 2. Zodスキーマ

```typescript
// packages/shared/src/types/rag/search/schemas.ts

import { z } from "zod";
import { uuidSchema } from "../schemas";

/**
 * クエリタイプスキーマ
 */
export const queryTypeSchema = z.enum([
  "local",
  "global",
  "relationship",
  "hybrid",
]);

/**
 * 検索戦略スキーマ
 */
export const searchStrategySchema = z.enum([
  "keyword",
  "semantic",
  "graph",
  "hybrid",
]);

/**
 * 検索結果タイプスキーマ
 */
export const searchResultTypeSchema = z.enum(["chunk", "entity", "community"]);

/**
 * 日付範囲スキーマ
 */
export const dateRangeSchema = z
  .object({
    start: z.date().nullable(),
    end: z.date().nullable(),
  })
  .refine((range) => !range.start || !range.end || range.start <= range.end, {
    message: "start must be before or equal to end",
  });

/**
 * 検索フィルタースキーマ
 */
export const searchFiltersSchema = z.object({
  fileIds: z.array(uuidSchema).nullable(),
  entityTypes: z.array(z.string()).nullable(),
  dateRange: dateRangeSchema.nullable(),
  minRelevance: z.number().min(0).max(1).default(0.3),
});

/**
 * 検索重みスキーマ
 */
export const searchWeightsSchema = z
  .object({
    keyword: z.number().min(0).max(1),
    semantic: z.number().min(0).max(1),
    graph: z.number().min(0).max(1),
  })
  .refine((w) => Math.abs(w.keyword + w.semantic + w.graph - 1.0) < 0.01, {
    message: "Weights must sum to 1.0",
  });

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

/**
 * 検索クエリスキーマ
 */
export const searchQuerySchema = z.object({
  text: z.string().min(1).max(1000),
  type: queryTypeSchema.default("hybrid"),
  embedding: z.array(z.number()).nullable(),
  filters: searchFiltersSchema,
  options: searchOptionsSchema,
});

/**
 * ハイライトオフセットスキーマ
 */
export const highlightOffsetSchema = z.object({
  start: z.number().int().min(0),
  end: z.number().int().min(0),
});

/**
 * ハイライトスキーマ
 */
export const highlightSchema = z.object({
  field: z.string(),
  fragment: z.string(),
  offsets: z.array(highlightOffsetSchema),
});

/**
 * CRAGスコアスキーマ
 */
export const cragScoreSchema = z.object({
  relevance: z.enum(["correct", "incorrect", "ambiguous"]),
  confidence: z.number().min(0).max(1),
  needsWebSearch: z.boolean(),
  refinedQuery: z.string().nullable(),
});

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

/**
 * 検索結果コンテンツスキーマ
 */
export const searchResultContentSchema = z.object({
  text: z.string(),
  summary: z.string().nullable(),
  contextBefore: z.string().nullable(),
  contextAfter: z.string().nullable(),
});

/**
 * 検索結果ソーススキーマ
 */
export const searchResultSourcesSchema = z.object({
  chunkId: uuidSchema.nullable(),
  fileId: uuidSchema.nullable(),
  entityIds: z.array(uuidSchema),
  communityId: uuidSchema.nullable(),
  relationIds: z.array(uuidSchema),
});

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

/**
 * 戦略メトリクススキーマ
 */
export const strategyMetricSchema = z.object({
  enabled: z.boolean(),
  resultCount: z.number().int().min(0),
  processingTime: z.number().min(0),
  topScore: z.number().min(0).max(1),
});

/**
 * 検索戦略メトリクススキーマ
 */
export const searchStrategyMetricsSchema = z.object({
  keyword: strategyMetricSchema,
  semantic: strategyMetricSchema,
  graph: strategyMetricSchema,
});

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

/**
 * RRF設定スキーマ
 */
export const rrfConfigSchema = z.object({
  k: z.number().int().min(1).max(1000).default(60),
  normalizeScores: z.boolean().default(true),
});

/**
 * リランキング設定スキーマ
 */
export const rerankConfigSchema = z.object({
  enabled: z.boolean().default(true),
  model: z.string().default("cross-encoder/ms-marco-MiniLM-L-6-v2"),
  topK: z.number().int().min(1).max(100).default(50),
  batchSize: z.number().int().min(1).max(32).default(16),
});

/**
 * クエリ分類結果スキーマ
 */
export const queryClassificationSchema = z.object({
  originalQuery: z.string(),
  type: queryTypeSchema,
  confidence: z.number().min(0).max(1),
  extractedEntities: z.array(z.string()),
  suggestedWeights: searchWeightsSchema,
  expandedQueries: z.array(z.string()),
});
```

### 3. 検索ユーティリティ

```typescript
// packages/shared/src/types/rag/search/utils.ts

import type {
  SearchWeights,
  QueryType,
  RelevanceScore,
  SearchResultItem,
  RRFConfig,
} from "./types";
import { QueryTypes, SearchStrategies } from "./types";

/**
 * クエリタイプに応じたデフォルト重み
 */
export const getDefaultWeights = (queryType: QueryType): SearchWeights => {
  switch (queryType) {
    case QueryTypes.LOCAL:
      return { keyword: 0.35, semantic: 0.35, graph: 0.3 };
    case QueryTypes.GLOBAL:
      return { keyword: 0.2, semantic: 0.3, graph: 0.5 };
    case QueryTypes.RELATIONSHIP:
      return { keyword: 0.2, semantic: 0.2, graph: 0.6 };
    case QueryTypes.HYBRID:
    default:
      return { keyword: 0.33, semantic: 0.34, graph: 0.33 };
  }
};

/**
 * RRF（Reciprocal Rank Fusion）スコア計算
 */
export const calculateRRFScore = (
  ranks: {
    keyword: number | null;
    semantic: number | null;
    graph: number | null;
  },
  weights: SearchWeights,
  config: RRFConfig = { k: 60, normalizeScores: true },
): number => {
  const { k, normalizeScores } = config;
  let score = 0;
  let totalWeight = 0;

  if (ranks.keyword !== null) {
    score += weights.keyword * (1 / (k + ranks.keyword));
    totalWeight += weights.keyword;
  }
  if (ranks.semantic !== null) {
    score += weights.semantic * (1 / (k + ranks.semantic));
    totalWeight += weights.semantic;
  }
  if (ranks.graph !== null) {
    score += weights.graph * (1 / (k + ranks.graph));
    totalWeight += weights.graph;
  }

  if (normalizeScores && totalWeight > 0) {
    score /= totalWeight;
  }

  return score;
};

/**
 * スコアの正規化（0-1範囲に）
 */
export const normalizeScores = (
  items: SearchResultItem[],
): SearchResultItem[] => {
  if (items.length === 0) return items;

  const maxScore = Math.max(...items.map((item) => item.score));
  const minScore = Math.min(...items.map((item) => item.score));
  const range = maxScore - minScore;

  if (range === 0) return items;

  return items.map((item) => ({
    ...item,
    score: (item.score - minScore) / range,
  }));
};

/**
 * 重複排除（同一チャンクをマージ）
 */
export const deduplicateResults = (
  items: SearchResultItem[],
  strategy: "max_score" | "sum_score" = "max_score",
): SearchResultItem[] => {
  const seen = new Map<string, SearchResultItem>();

  for (const item of items) {
    const existing = seen.get(item.id);
    if (!existing) {
      seen.set(item.id, item);
    } else if (strategy === "max_score") {
      if (item.score > existing.score) {
        seen.set(item.id, item);
      }
    } else {
      // sum_score: スコアを合算
      seen.set(item.id, {
        ...existing,
        score: existing.score + item.score,
        relevance: {
          ...existing.relevance,
          combined: existing.relevance.combined + item.relevance.combined,
        },
      });
    }
  }

  return Array.from(seen.values());
};

/**
 * ハイライトフラグメント生成
 */
export const generateHighlightFragment = (
  text: string,
  matches: readonly { start: number; end: number }[],
  contextChars: number = 50,
  maxFragmentLength: number = 200,
): string => {
  if (matches.length === 0) return text.slice(0, maxFragmentLength);

  const firstMatch = matches[0];
  const start = Math.max(0, firstMatch.start - contextChars);
  const end = Math.min(text.length, firstMatch.end + contextChars);

  let fragment = text.slice(start, end);

  // 先頭・末尾が切れている場合は省略記号を追加
  if (start > 0) fragment = "..." + fragment;
  if (end < text.length) fragment = fragment + "...";

  return fragment.slice(0, maxFragmentLength);
};

/**
 * クエリ拡張（同義語・関連語追加）
 */
export const expandQuery = (
  query: string,
  synonyms: Record<string, string[]>,
): string[] => {
  const words = query.toLowerCase().split(/\s+/);
  const expansions: string[] = [query];

  for (const word of words) {
    if (synonyms[word]) {
      for (const synonym of synonyms[word]) {
        const expandedQuery = query.replace(
          new RegExp(`\\b${word}\\b`, "gi"),
          synonym,
        );
        if (!expansions.includes(expandedQuery)) {
          expansions.push(expandedQuery);
        }
      }
    }
  }

  return expansions;
};

/**
 * 検索結果のフィルタリング
 */
export const filterByMinRelevance = (
  items: SearchResultItem[],
  minRelevance: number,
): SearchResultItem[] => {
  return items.filter((item) => item.relevance.combined >= minRelevance);
};

/**
 * 検索結果のソート
 */
export const sortByScore = (
  items: SearchResultItem[],
  order: "asc" | "desc" = "desc",
): SearchResultItem[] => {
  return [...items].sort((a, b) =>
    order === "desc" ? b.score - a.score : a.score - b.score,
  );
};

/**
 * CRAG関連度判定
 */
export const evaluateCRAGRelevance = (
  score: number,
): "correct" | "incorrect" | "ambiguous" => {
  if (score >= 0.7) return "correct";
  if (score <= 0.3) return "incorrect";
  return "ambiguous";
};
```

### 4. バレルエクスポート

```typescript
// packages/shared/src/types/rag/search/index.ts

export * from "./types";
export * from "./schemas";
export * from "./utils";
```

## ディレクトリ構造

```
packages/shared/src/types/rag/search/
├── index.ts      # バレルエクスポート
├── types.ts      # 型定義
├── schemas.ts    # Zodスキーマ
└── utils.ts      # ユーティリティ関数
```

## 受け入れ条件

- [ ] `SearchQuery`, `SearchResult`, `SearchResultItem` 型が定義されている
- [ ] `QueryType`, `SearchStrategy` 列挙型が定義されている
- [ ] `SearchWeights`, `RRFConfig`, `RerankConfig` 型が定義されている
- [ ] `CRAGScore`, `RelevanceScore` 型が定義されている
- [ ] 全型に対応するZodスキーマが定義されている
- [ ] RRFスコア計算関数が実装されている
- [ ] 重複排除・正規化ユーティリティが実装されている
- [ ] クエリタイプ別デフォルト重みが定義されている
- [ ] 単体テストが作成されている

## 依存関係

### このタスクが依存するもの

- CONV-03-01: 基本型・共通インターフェース定義

### このタスクに依存するもの

- CONV-07-01: クエリ分類器実装
- CONV-07-02: キーワード検索戦略
- CONV-07-03: ベクトル検索戦略
- CONV-07-04: グラフ検索戦略
- CONV-07-05: RRF Fusion + リランキング
- CONV-07-06: CRAG実装
- CONV-07-07: HybridRAG統合サービス
