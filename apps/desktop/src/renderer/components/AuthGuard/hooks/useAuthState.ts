/**
 * 認証状態フック
 *
 * Zustandストアから認証状態を取得し、
 * AuthGuardDisplayStateに変換して返すカスタムフック。
 *
 * @module AuthGuard/hooks/useAuthState
 */

import { useAppStore } from "../../../store";
import { getAuthState } from "../utils/getAuthState";
import type { AuthGuardDisplayState } from "../types";

/**
 * 認証状態を取得するカスタムフック
 *
 * Zustandストアから`isLoading`と`isAuthenticated`を取得し、
 * `getAuthState`関数で表示状態に変換する。
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

  const authState = getAuthState({ isLoading, isAuthenticated });

  // デバッグ用ログ（開発環境のみ）
  if (import.meta.env.DEV) {
    console.log(
      "[useAuthState] isLoading:",
      isLoading,
      "isAuthenticated:",
      isAuthenticated,
      "→ authState:",
      authState,
    );
  }

  return authState;
};
