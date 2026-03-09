/**
 * 認証状態フック
 *
 * Zustandストアから認証状態を取得し、
 * AuthGuardDisplayStateに変換して返すカスタムフック。
 * 10秒のタイムアウト機構を持ち、認証確認が長時間かかる場合に
 * フォールバックUIへの遷移を可能にする。
 *
 * @module AuthGuard/hooks/useAuthState
 */

import { useState, useEffect } from "react";
import { useAppStore } from "../../../store";
import { getAuthState } from "../utils/getAuthState";
import type { AuthGuardDisplayState } from "../types";

/** 認証タイムアウト時間（ミリ秒） */
export const AUTH_TIMEOUT_MS = 10_000;

/**
 * 認証状態を取得するカスタムフック
 *
 * Zustandストアから`isLoading`と`isAuthenticated`を取得し、
 * `getAuthState`関数で表示状態に変換する。
 * isLoadingがtrueのまま AUTH_TIMEOUT_MS を超過すると "timed-out" を返す。
 *
 * @returns 現在のAuthGuardDisplayState
 *
 * @example
 * ```tsx
 * const authState = useAuthState();
 *
 * switch (authState) {
 *   case "checking":
 *     return <LoadingScreen />;
 *   case "timed-out":
 *     return <AuthTimeoutFallback />;
 *   case "authenticated":
 *     return <Dashboard />;
 *   case "unauthenticated":
 *     return <LoginPage />;
 * }
 * ```
 */
export const useAuthState = (): AuthGuardDisplayState => {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const isLoading = useAppStore((state) => state.isLoading);
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsTimedOut(true);
    }, AUTH_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isLoading]);

  return getAuthState({ isLoading, isAuthenticated, isTimedOut });
};
