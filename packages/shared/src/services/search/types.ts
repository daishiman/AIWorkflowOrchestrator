/**
 * @file クエリ分類器 型定義
 * @description CONV-07-01: クエリ分類器の型・スキーマ定義
 */

import { z } from "zod";
import type { Result } from "../../types/rag/result";

// =============================================================================
// Query Type
// =============================================================================

/**
 * クエリタイプ
 * - local: 特定エンティティ・事実に関する質問
 * - global: 全体テーマ・傾向に関する質問
 * - relationship: エンティティ間関係に関する質問
 * - hybrid: 複合・不明な場合のデフォルト
 */
export const queryTypeSchema = z.enum([
  "local",
  "global",
  "relationship",
  "hybrid",
]);

export type QueryType = z.infer<typeof queryTypeSchema>;

// =============================================================================
// Search Weights
// =============================================================================

/**
 * 検索重み（合計1.0）
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
      return Math.abs(sum - 1.0) < 0.02; // 浮動小数点誤差許容
    },
    { message: "検索重みの合計は1.0である必要があります" },
  );

export type SearchWeights = z.infer<typeof searchWeightsSchema>;

// =============================================================================
// Query Classification
// =============================================================================

/**
 * クエリ分類結果スキーマ
 */
export const queryClassificationSchema = z.object({
  type: queryTypeSchema,
  confidence: z.number().min(0).max(1),
  extractedEntities: z.array(z.string()),
  relationHint: z.string().optional(),
  keywords: z.array(z.string()),
  intent: z.string(),
});

export type QueryClassification = z.infer<typeof queryClassificationSchema>;

// =============================================================================
// Classification Options
// =============================================================================

/**
 * クエリ分類オプション
 */
export interface QueryClassificationOptions {
  /** LLMを使用するか（falseの場合はルールベース） */
  useLLM?: boolean;
  /** 最小信頼度（これ未満はhybridにフォールバック） */
  minConfidence?: number;
  /** エンティティ抽出を行うか */
  extractEntities?: boolean;
}

/**
 * デフォルトオプション
 */
export const DEFAULT_CLASSIFICATION_OPTIONS: Required<QueryClassificationOptions> =
  {
    useLLM: true,
    minConfidence: 0.6,
    extractEntities: true,
  };

// =============================================================================
// Search Weights Constants
// =============================================================================

/**
 * クエリタイプ別検索重み
 */
export const SEARCH_WEIGHTS: Record<QueryType, SearchWeights> = {
  local: { keyword: 0.35, semantic: 0.35, graph: 0.3 },
  global: { keyword: 0.2, semantic: 0.3, graph: 0.5 },
  relationship: { keyword: 0.2, semantic: 0.2, graph: 0.6 },
  hybrid: { keyword: 0.33, semantic: 0.33, graph: 0.34 },
};

// =============================================================================
// Interface
// =============================================================================

/**
 * クエリ分類器インターフェース
 */
export interface IQueryClassifier {
  /**
   * クエリを分類
   */
  classify(
    query: string,
    options?: QueryClassificationOptions,
  ): Promise<Result<QueryClassification, Error>>;

  /**
   * クエリタイプに応じた検索重みを取得
   */
  getSearchWeights(type: QueryType): SearchWeights;
}
