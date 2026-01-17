/**
 * @file CRAG テストヘルパー
 * @description Corrective RAG テスト用のモック・ファクトリー関数
 */

import { vi } from "vitest";
import type { ChunkId } from "../../../../types/rag/branded";
import type { Result } from "../../../../types/rag/result";
import { ok, err } from "../../../../types/rag/result";
import type { FusedSearchResult, SourceInfo } from "../../fusion/types";

// =============================================================================
// 型定義（実装前のため、ここで仮定義）
// =============================================================================

/**
 * LLMクライアントインターフェース
 */
export interface ILLMClient {
  complete(options: {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<Result<string, Error>>;
}

/**
 * Web検索結果
 */
export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * Web検索インターフェース
 */
export interface IWebSearcher {
  search(
    query: string,
    limit: number,
  ): Promise<Result<WebSearchResult[], Error>>;
}

/**
 * 関連性アクション
 */
export type RelevanceAction = "correct" | "incorrect" | "ambiguous";

/**
 * 個別スコア
 */
export interface IndividualScore {
  chunkId: ChunkId;
  score: number;
  reason: string;
}

/**
 * 関連性評価結果
 */
export interface RelevanceEvaluation {
  overallScore: number;
  action: RelevanceAction;
  individualScores: IndividualScore[];
  reasoning: string;
}

/**
 * 関連性評価器インターフェース
 */
export interface IRelevanceEvaluator {
  evaluate(
    query: string,
    results: FusedSearchResult[],
  ): Promise<Result<RelevanceEvaluation, Error>>;
}

/**
 * 補正アクション
 */
export type CorrectionAction =
  | { type: "keep"; reason: string }
  | { type: "discard"; reason: string }
  | { type: "refine"; refinedQuery: string }
  | { type: "web_search"; searchQuery: string }
  | { type: "expand"; expansionStrategy: string };

/**
 * CRAG処理結果
 */
export interface CRAGResult {
  results: FusedSearchResult[];
  evaluation: {
    relevanceScore: number;
    action: RelevanceAction;
    corrections: CorrectionAction[];
  };
  augmentedContext?: string;
}

// =============================================================================
// モックファクトリー
// =============================================================================

/**
 * モックLLMクライアント生成オプション
 */
interface MockLLMClientConfig {
  response?: string;
  shouldFail?: boolean;
  error?: Error;
}

/**
 * モックLLMクライアントを生成
 */
export const createMockLLMClient = (
  config: MockLLMClientConfig = {},
): ILLMClient => ({
  complete: vi.fn().mockImplementation(async () => {
    if (config.shouldFail) {
      return err(config.error ?? new Error("LLM API failed"));
    }
    return ok(config.response ?? "{}");
  }),
});

/**
 * モックWeb検索プロバイダー生成オプション
 */
interface MockWebSearcherConfig {
  results?: WebSearchResult[];
  shouldFail?: boolean;
  error?: Error;
}

/**
 * モックWeb検索プロバイダーを生成
 */
export const createMockWebSearcher = (
  config: MockWebSearcherConfig = {},
): IWebSearcher => ({
  search: vi.fn().mockImplementation(async () => {
    if (config.shouldFail) {
      return err(config.error ?? new Error("Web search failed"));
    }
    return ok(config.results ?? []);
  }),
});

/**
 * モック評価器生成オプション
 */
interface MockEvaluatorConfig {
  action?: RelevanceAction;
  overallScore?: number;
  individualScores?: IndividualScore[];
  shouldFail?: boolean;
  error?: Error;
}

/**
 * モック評価器を生成
 */
export const createMockEvaluator = (
  config: MockEvaluatorConfig = {},
): IRelevanceEvaluator => ({
  evaluate: vi.fn().mockImplementation(async () => {
    if (config.shouldFail) {
      return err(config.error ?? new Error("Evaluation failed"));
    }
    return ok({
      overallScore: config.overallScore ?? 0.5,
      action: config.action ?? "ambiguous",
      individualScores: config.individualScores ?? [],
      reasoning: "Mock evaluation reasoning",
    });
  }),
});

// =============================================================================
// テストデータファクトリー
// =============================================================================

/**
 * モックFusedSearchResult配列を生成
 */
export const createMockFusedResults = (
  count: number,
  scoreRange?: { min: number; max: number },
): FusedSearchResult[] => {
  return Array.from({ length: count }, (_, i) => {
    const score = scoreRange
      ? scoreRange.min +
        (scoreRange.max - scoreRange.min) * (i / (count - 1 || 1))
      : 0.5 + i * 0.1;

    return {
      chunkId: `chunk-${i}` as ChunkId,
      content: `Test content for chunk ${i}. This is sample text for testing purposes.`,
      fusedScore: score,
      sources: [
        {
          strategy: "semantic" as const,
          rank: i,
          score: 0.8 - i * 0.1,
        },
      ] as SourceInfo[],
      metadata: {
        testIndex: i,
        testCategory: "mock",
      },
    };
  });
};

/**
 * モックWeb検索結果を生成
 */
export const createMockWebSearchResults = (
  count: number,
): WebSearchResult[] => {
  return Array.from({ length: count }, (_, i) => ({
    title: `Web Result ${i + 1}`,
    url: `https://example.com/result-${i + 1}`,
    snippet: `This is a snippet for web result ${i + 1}. Contains relevant information.`,
  }));
};

/**
 * モック個別スコアを生成
 */
export const createMockIndividualScores = (
  chunkIds: string[],
  scores: number[],
): IndividualScore[] => {
  return chunkIds.map((id, i) => ({
    chunkId: id as ChunkId,
    score: scores[i] ?? 0.5,
    reason: `Evaluation reason for ${id}`,
  }));
};

// =============================================================================
// LLMレスポンスフィクスチャ
// =============================================================================

/**
 * LLMレスポンスフィクスチャ
 */
export const LLM_RESPONSES = {
  HIGH_RELEVANCE: JSON.stringify({
    evaluations: [
      { score: 9, reason: "Directly answers the question" },
      { score: 8, reason: "Highly relevant content" },
      { score: 8, reason: "Good supporting information" },
    ],
  }),

  LOW_RELEVANCE: JSON.stringify({
    evaluations: [
      { score: 2, reason: "Off-topic content" },
      { score: 1, reason: "Completely irrelevant" },
    ],
  }),

  MIXED_RELEVANCE: JSON.stringify({
    evaluations: [
      { score: 8, reason: "Good match" },
      { score: 3, reason: "Weak connection" },
      { score: 5, reason: "Partial match" },
    ],
  }),

  SINGLE_HIGH: JSON.stringify({
    evaluations: [{ score: 8, reason: "Good match" }],
  }),

  SINGLE_LOW: JSON.stringify({
    evaluations: [{ score: 2, reason: "Not relevant" }],
  }),

  INVALID_JSON: "This is not valid JSON",

  EMPTY_EVALUATIONS: JSON.stringify({ evaluations: [] }),

  WEIGHTED_TEST: JSON.stringify({
    evaluations: [
      { score: 9, reason: "Excellent" },
      { score: 8, reason: "Very good" },
      { score: 7, reason: "Good" },
    ],
  }),
};

// =============================================================================
// Web検索結果フィクスチャ
// =============================================================================

/**
 * Web検索結果フィクスチャ
 */
export const WEB_SEARCH_RESULTS = {
  STANDARD: [
    {
      title: "TypeScript Documentation",
      url: "https://www.typescriptlang.org/docs",
      snippet: "TypeScript is a typed superset of JavaScript...",
    },
    {
      title: "TypeScript Handbook",
      url: "https://www.typescriptlang.org/docs/handbook",
      snippet: "The TypeScript Handbook is the definitive guide...",
    },
  ],

  EMPTY: [] as WebSearchResult[],

  LARGE_SET: Array(10)
    .fill(null)
    .map((_, i) => ({
      title: `Result ${i + 1}`,
      url: `https://example.com/${i + 1}`,
      snippet: `Snippet for result ${i + 1}`,
    })),
};
