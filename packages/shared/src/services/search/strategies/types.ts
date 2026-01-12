/**
 * @file 検索戦略インターフェース定義
 * @description ISearchStrategy, Result型など共通型を定義
 * CONV-07-03: HybridRAGセマンティック検索
 */

import type {
  SearchResultItem,
  SearchFilters,
  StrategyMetric,
} from "../../../types/rag/search/types";

// ==========================================
// Result型定義（メソッドベースAPI）
// ==========================================

/**
 * 成功結果クラス
 */
export class Ok<T> {
  readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  isOk(): this is Ok<T> {
    return true;
  }

  isErr(): this is Err<never> {
    return false;
  }
}

/**
 * エラー結果クラス
 */
export class Err<E> {
  readonly error: E;

  constructor(error: E) {
    this.error = error;
  }

  isOk(): this is Ok<never> {
    return false;
  }

  isErr(): this is Err<E> {
    return true;
  }
}

/**
 * Result型（成功/エラーの判別共用体）
 */
export type Result<T, E = Error> = Ok<T> | Err<E>;

/**
 * 成功結果を生成
 */
export function ok<T>(value: T): Ok<T> {
  return new Ok(value);
}

/**
 * エラー結果を生成
 */
export function err<E>(error: E): Err<E> {
  return new Err(error);
}

// ==========================================
// 検索戦略インターフェース
// ==========================================

/**
 * 検索戦略インターフェース
 * Keyword/Semantic/Graph検索の共通インターフェース
 */
export interface ISearchStrategy {
  /**
   * 戦略名（"keyword" | "semantic" | "graph"）
   */
  readonly name: string;

  /**
   * 検索を実行する
   *
   * @param query - 検索クエリテキスト
   * @param limit - 最大取得件数
   * @param filters - 検索フィルター（オプション）
   * @returns 検索結果アイテムの配列
   */
  search(
    query: string,
    limit: number,
    filters?: SearchFilters,
  ): Promise<Result<SearchResultItem[], Error>>;

  /**
   * 戦略のメトリクスを取得する
   */
  getMetrics(): StrategyMetric;
}

// ==========================================
// 定数
// ==========================================

/**
 * 最大クエリ長
 */
export const MAX_QUERY_LENGTH = 1000;

/**
 * 最小取得件数
 */
export const MIN_LIMIT = 1;

/**
 * 最大取得件数
 */
export const MAX_LIMIT = 100;

/**
 * デフォルト取得件数
 */
export const DEFAULT_LIMIT = 20;
