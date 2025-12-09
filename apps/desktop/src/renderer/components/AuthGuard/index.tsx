import React from "react";
import { useAppStore } from "../../store";
import { AuthView } from "../../views/AuthView";
import { LoadingScreen } from "./LoadingScreen";

/**
 * 認証ガードの表示状態を表す型
 *
 * 各状態の意味:
 * - `checking`: 認証状態を確認中（ローディング表示）
 * - `authenticated`: 認証済み（子コンポーネントを表示）
 * - `unauthenticated`: 未認証（ログイン画面を表示）
 *
 * @remarks
 * より厳密な型定義（Discriminated Union）は `./types.ts` を参照
 */
type AuthGuardDisplayState = "checking" | "authenticated" | "unauthenticated";

/**
 * AuthGuardコンポーネントのProps
 */
export interface AuthGuardProps {
  /** 認証済み時に表示する子コンポーネント */
  children: React.ReactNode;

  /**
   * ローディング中に表示するカスタムコンポーネント
   * @default LoadingScreen
   */
  fallback?: React.ReactNode;
}

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
export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const isLoading = useAppStore((state) => state.isLoading);

  /**
   * 現在の認証状態を判定する
   *
   * @returns 現在のAuthGuardDisplayState
   */
  const getAuthState = (): AuthGuardDisplayState => {
    if (isLoading) return "checking";
    if (isAuthenticated) return "authenticated";
    return "unauthenticated";
  };

  const authState = getAuthState();

  switch (authState) {
    case "checking":
      return <>{fallback ?? <LoadingScreen />}</>;

    case "authenticated":
      return <>{children}</>;

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
export type { AuthGuardState, AuthError, AuthErrorCode } from "./types";
export {
  isAuthenticated,
  isChecking,
  isUnauthenticated,
  isError,
  hasExpiresAt,
  assertNever,
} from "./types";
