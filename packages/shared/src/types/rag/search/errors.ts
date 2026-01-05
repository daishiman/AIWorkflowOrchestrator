/**
 * CONV-03-05: Search Utility Errors
 * 検索ユーティリティ関数のエラー型定義
 *
 * @module @repo/shared/types/rag/search/errors
 */

import type { SearchWeights } from "./types";

/**
 * ユーティリティ関数のベースエラークラス
 */
export class SearchUtilsError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "SearchUtilsError";
  }
}

/**
 * 検索重みの合計が1.0でない場合のエラー
 */
export class InvalidWeightsError extends SearchUtilsError {
  constructor(weights: SearchWeights) {
    super("検索重みの合計は1.0である必要があります", "INVALID_WEIGHTS", {
      weights,
      sum: weights.keyword + weights.semantic + weights.graph,
    });
    this.name = "InvalidWeightsError";
  }
}

/**
 * すべての検索戦略の結果が空の場合のエラー
 */
export class EmptyRankedListsError extends SearchUtilsError {
  constructor() {
    super("すべての検索戦略の結果が空です", "EMPTY_RANKED_LISTS");
    this.name = "EmptyRankedListsError";
  }
}

/**
 * RRF定数kが無効な値の場合のエラー
 */
export class InvalidKValueError extends SearchUtilsError {
  constructor(k: number) {
    super("RRF定数kは1以上である必要があります", "INVALID_K_VALUE", { k });
    this.name = "InvalidKValueError";
  }
}

/**
 * 閾値が0.0〜1.0の範囲外の場合のエラー
 */
export class InvalidThresholdError extends SearchUtilsError {
  constructor(threshold: number) {
    super("閾値は0.0〜1.0の範囲である必要があります", "INVALID_THRESHOLD", {
      threshold,
    });
    this.name = "InvalidThresholdError";
  }
}
