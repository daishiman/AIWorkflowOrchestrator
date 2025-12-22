/**
 * 認証状態判定ユーティリティ
 *
 * 認証状態を判定する純粋関数を提供する。
 * Zustandストアから独立しており、テストが容易。
 *
 * @module AuthGuard/utils/getAuthState
 */

import type { AuthGuardDisplayState } from "../types";

/**
 * 認証状態判定の入力パラメータ
 */
export interface AuthStateInput {
  /** ローディング中かどうか */
  isLoading: boolean;
  /** 認証済みかどうか */
  isAuthenticated: boolean;
}

/**
 * 認証状態を判定する純粋関数
 *
 * @param input - 認証状態の入力パラメータ
 * @returns 現在のAuthGuardDisplayState
 *
 * @example
 * ```typescript
 * // ローディング中
 * getAuthState({ isLoading: true, isAuthenticated: false }); // "checking"
 *
 * // 認証済み
 * getAuthState({ isLoading: false, isAuthenticated: true }); // "authenticated"
 *
 * // 未認証
 * getAuthState({ isLoading: false, isAuthenticated: false }); // "unauthenticated"
 * ```
 */
export const getAuthState = ({
  isLoading,
  isAuthenticated,
}: AuthStateInput): AuthGuardDisplayState => {
  // ローディング中は常にchecking状態を優先
  if (isLoading) return "checking";

  // 認証済みならauthenticated
  if (isAuthenticated) return "authenticated";

  // それ以外はunauthenticated
  return "unauthenticated";
};
