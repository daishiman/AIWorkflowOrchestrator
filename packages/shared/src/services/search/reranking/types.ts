/**
 * @file Reranking型定義
 * @description CONV-07-05: RRF Fusion + Reranking - Reranking関連の型定義
 */

import type { Result } from "../../../types/rag/result";
import type { FusedSearchResult } from "../fusion/types";

// Re-export FusedSearchResult for convenience
export type { FusedSearchResult } from "../fusion/types";

// =============================================================================
// Rerankerインターフェース
// =============================================================================

/**
 * Rerankerインターフェース
 */
export interface IReranker {
  /**
   * 候補をリランキング
   * @param query ユーザークエリ
   * @param candidates リランキング対象の候補
   * @param limit 返却する最大件数
   * @returns リランキング後の結果（rerankedScore設定済み）
   */
  rerank(
    query: string,
    candidates: FusedSearchResult[],
    limit: number,
  ): Promise<Result<FusedSearchResult[], Error>>;
}

// =============================================================================
// LLMRerankerオプション
// =============================================================================

/**
 * LLMRerankerの設定オプション
 */
export interface LLMRerankerOptions {
  /** バッチサイズ（一度にスコアリングする候補数） */
  batchSize?: number;
  /** limit以下の候補数の場合にスキップするか */
  skipIfBelowLimit?: boolean;
  /** プロンプトテンプレート */
  promptTemplate?: string;
}

// =============================================================================
// CohereRerankerオプション
// =============================================================================

/**
 * CohereRerankerの設定オプション
 */
export interface CohereRerankerOptions {
  /** 使用するモデル */
  model?: string;
  /** タイムアウト（ミリ秒） */
  timeoutMs?: number;
  /** APIエンドポイント */
  endpoint?: string;
}

/**
 * Cohere Rerank APIレスポンス
 */
export interface CohereRerankResponse {
  results: Array<{
    index: number;
    relevance_score: number;
  }>;
}

// =============================================================================
// VoyageRerankerオプション
// =============================================================================

/**
 * VoyageRerankerの設定オプション
 */
export interface VoyageRerankerOptions {
  /** 使用するモデル */
  model?: string;
  /** タイムアウト（ミリ秒） */
  timeoutMs?: number;
  /** APIエンドポイント */
  endpoint?: string;
}

/**
 * Voyage Rerank APIレスポンス
 */
export interface VoyageRerankResponse {
  data: Array<{
    index: number;
    relevance_score: number;
  }>;
}
