import type { FC } from "react";
import { AuthView } from "../../views/AuthView";
import { LoadingScreen } from "./LoadingScreen";
import { useAuthState } from "./hooks/useAuthState";
import type { AuthGuardProps } from "./types";

/**
 * 認証ガードコンポーネント
 *
 * アプリケーションへのアクセスを認証状態に基づいて制御する。
 * - checking: ローディング画面（またはカスタムfallback）を表示
 * - authenticated: 子コンポーネントを表示
 * - unauthenticated: ログイン画面（AuthView）を表示
 *
 * @component
 * @example
 * ```tsx
 * // 基本的な使用方法
 * <AuthGuard>
 *   <ProtectedContent />
 * </AuthGuard>
 *
 * // カスタムローディング画面を使用
 * <AuthGuard fallback={<CustomLoader />}>
 *   <Dashboard />
 * </AuthGuard>
 * ```
 */
export const AuthGuard: FC<AuthGuardProps> = ({ children, fallback }) => {
  const authState = useAuthState();

  switch (authState) {
    case "checking":
      return fallback ?? <LoadingScreen />;

    case "authenticated":
      return children;

    case "unauthenticated":
      return <AuthView />;
  }
};

AuthGuard.displayName = "AuthGuard";

// ============================================================
// 関連コンポーネント・型定義の再エクスポート
// ============================================================

export { LoadingScreen } from "./LoadingScreen";
export { AuthErrorBoundary } from "./AuthErrorBoundary";
export type { AuthErrorBoundaryProps } from "./AuthErrorBoundary";
export type {
  AuthGuardProps,
  AuthGuardDisplayState,
  AuthGuardState,
  AuthError,
  AuthErrorCode,
} from "./types";
export {
  isAuthenticated,
  isChecking,
  isUnauthenticated,
  isError,
  hasExpiresAt,
  assertNever,
} from "./types";

// ユーティリティ・フックの再エクスポート
export { useAuthState } from "./hooks/useAuthState";
export { getAuthState } from "./utils/getAuthState";
export type { AuthStateInput } from "./utils/getAuthState";
