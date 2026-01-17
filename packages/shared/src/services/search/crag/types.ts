/**
 * @file CRAG型定義
 * @description CONV-07-06: Corrective RAG - 型定義・インターフェース
 */

import type { ChunkId } from "../../../types/rag/branded";
import type { Result } from "../../../types/rag/result";
import type { FusedSearchResult } from "../fusion/types";

// =============================================================================
// 関連性評価型
// =============================================================================

/**
 * 関連性評価アクション
 */
export type RelevanceAction = "correct" | "incorrect" | "ambiguous";

/**
 * 個別の検索結果に対するスコア
 */
export interface IndividualScore {
  /** チャンクID */
  chunkId: ChunkId;
  /** 関連性スコア（0.0-1.0） */
  score: number;
  /** スコアの理由 */
  reason: string;
}

/**
 * 関連性評価の結果
 */
export interface RelevanceEvaluation {
  /**
   * 全体の関連性スコア（0.0-1.0）
   * 上位結果に重みを付けた加重平均
   */
  overallScore: number;
  /**
   * 評価に基づくアクション
   * - correct: 結果が十分に関連性がある
   * - incorrect: 結果が関連性がない
   * - ambiguous: 結果の品質が混在
   */
  action: RelevanceAction;
  /** 各結果の個別スコア */
  individualScores: IndividualScore[];
  /** 評価の推論理由 */
  reasoning: string;
}

/**
 * RelevanceEvaluatorの設定オプション
 */
export interface EvaluatorOptions {
  /**
   * 評価する最大結果数
   * @default 5
   */
  maxEvaluate?: number;
  /**
   * "correct"判定の閾値
   * この値以上のスコアで"correct"と判定
   * @default 0.7
   */
  correctThreshold?: number;
  /**
   * "incorrect"判定の閾値
   * この値以下のスコアで"incorrect"と判定
   * @default 0.3
   */
  incorrectThreshold?: number;
}

/**
 * 関連性評価器のインターフェース
 */
export interface IRelevanceEvaluator {
  /**
   * 検索結果全体の関連性を評価
   * @param query 検索クエリ
   * @param results 検索結果配列
   * @returns 評価結果（成功時）またはエラー（失敗時）
   */
  evaluate(
    query: string,
    results: FusedSearchResult[],
  ): Promise<Result<RelevanceEvaluation, Error>>;
}

// =============================================================================
// CorrectiveRAG型
// =============================================================================

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
 * CRAG処理の結果
 */
export interface CRAGResult {
  /**
   * 補正後の検索結果
   * - correct: 入力結果（またはRefinement後）
   * - incorrect: 空配列
   * - ambiguous: フィルタ後の結果
   */
  results: FusedSearchResult[];
  /** 評価情報 */
  evaluation: {
    /** 関連性スコア */
    relevanceScore: number;
    /** 実行されたアクション */
    action: RelevanceAction;
    /** 実行された補正アクション */
    corrections: CorrectionAction[];
  };
  /**
   * Web検索による補強コンテキスト
   * incorrect/ambiguousでWeb検索が実行された場合に設定
   */
  augmentedContext?: string;
}

/**
 * CorrectiveRAGの設定オプション
 */
export interface CRAGOptions {
  /**
   * Web検索による補強を有効にするか
   * @default false
   */
  enableWebSearch?: boolean;
  /**
   * Knowledge Refinementを有効にするか
   * @default false
   */
  enableRefinement?: boolean;
  /**
   * Ambiguous時のフィルタ閾値
   * この値未満のスコアの結果を除外
   * @default 0.4
   */
  ambiguousFilterThreshold?: number;
  /**
   * Web検索を行う前の最小結果数
   * フィルタ後の結果数がこれ未満の場合にWeb検索を実行
   * @default 3
   */
  minResultsBeforeWebSearch?: number;
  /**
   * Web検索の結果数上限
   * @default 5
   */
  webSearchLimit?: number;
}

/**
 * Corrective RAGのインターフェース
 */
export interface ICorrectiveRAG {
  /**
   * 検索結果を評価・補正
   * @param query 検索クエリ
   * @param results 検索結果配列
   * @returns CRAG処理結果（成功時）またはエラー（失敗時）
   */
  process(
    query: string,
    results: FusedSearchResult[],
  ): Promise<Result<CRAGResult, Error>>;
}

// =============================================================================
// 外部依存インターフェース
// =============================================================================

/**
 * LLMクライアントのインターフェース
 */
export interface ILLMClient {
  /**
   * プロンプトに対する補完を生成
   * @param options 補完オプション
   * @returns 生成されたテキスト（成功時）またはエラー（失敗時）
   */
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
  /** 結果のタイトル */
  title: string;
  /** 結果のURL */
  url: string;
  /** 結果のスニペット */
  snippet: string;
}

/**
 * Web検索プロバイダーのインターフェース
 */
export interface IWebSearcher {
  /**
   * Web検索を実行
   * @param query 検索クエリ
   * @param limit 結果数上限
   * @returns 検索結果（成功時）またはエラー（失敗時）
   */
  search(
    query: string,
    limit: number,
  ): Promise<Result<WebSearchResult[], Error>>;
}

// =============================================================================
// 定数
// =============================================================================

/**
 * デフォルト設定値
 */
export const CRAG_DEFAULTS = {
  /** 評価する最大結果数 */
  MAX_EVALUATE: 5,
  /** "correct"判定の閾値 */
  CORRECT_THRESHOLD: 0.7,
  /** "incorrect"判定の閾値 */
  INCORRECT_THRESHOLD: 0.3,
  /** Ambiguous時のフィルタ閾値 */
  AMBIGUOUS_FILTER_THRESHOLD: 0.4,
  /** Web検索前の最小結果数 */
  MIN_RESULTS_BEFORE_WEB_SEARCH: 3,
  /** Web検索結果数上限 */
  WEB_SEARCH_LIMIT: 5,
  /** LLM評価のタイムアウト（ミリ秒） */
  EVALUATION_TIMEOUT_MS: 10000,
  /** LLM評価の最大トークン数 */
  MAX_TOKENS: 500,
  /** LLM評価の温度 */
  TEMPERATURE: 0,
} as const;

// =============================================================================
// 型ガード・ユーティリティ
// =============================================================================

/**
 * CRAGResultの型ガード - correct判定
 */
export function isCRAGResultCorrect(result: CRAGResult): boolean {
  return result.evaluation.action === "correct";
}

/**
 * CRAGResultの型ガード - incorrect判定
 */
export function isCRAGResultIncorrect(result: CRAGResult): boolean {
  return result.evaluation.action === "incorrect";
}

/**
 * CRAGResultの型ガード - ambiguous判定
 */
export function isCRAGResultAmbiguous(result: CRAGResult): boolean {
  return result.evaluation.action === "ambiguous";
}

/**
 * CorrectionActionの型ガード - keep
 */
export function isKeepAction(
  action: CorrectionAction,
): action is { type: "keep"; reason: string } {
  return action.type === "keep";
}

/**
 * CorrectionActionの型ガード - discard
 */
export function isDiscardAction(
  action: CorrectionAction,
): action is { type: "discard"; reason: string } {
  return action.type === "discard";
}

/**
 * CorrectionActionの型ガード - web_search
 */
export function isWebSearchAction(
  action: CorrectionAction,
): action is { type: "web_search"; searchQuery: string } {
  return action.type === "web_search";
}
