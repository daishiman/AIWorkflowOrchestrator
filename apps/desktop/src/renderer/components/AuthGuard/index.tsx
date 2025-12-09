import React from "react";
import { useAppStore } from "../../store";
import { AuthView } from "../../views/AuthView";
import { LoadingScreen } from "./LoadingScreen";

/**
 * AuthGuardの内部状態
 */
type AuthGuardState = "checking" | "authenticated" | "unauthenticated";

/**
 * AuthGuardのProps
 */
export interface AuthGuardProps {
  /** 認証済み時に表示する子コンポーネント */
  children: React.ReactNode;

  /** ローディング中に表示するカスタムコンポーネント（省略時はデフォルトローディング画面） */
  fallback?: React.ReactNode;
}

/**
 * 認証ガードコンポーネント
 *
 * 認証状態に基づいて表示を制御する:
 * - checking: ローディング画面
 * - authenticated: 子コンポーネント
 * - unauthenticated: AuthView（ログイン画面）
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const isLoading = useAppStore((state) => state.isLoading);

  // 認証状態の判定
  const getAuthState = (): AuthGuardState => {
    if (isLoading) return "checking";
    if (isAuthenticated) return "authenticated";
    return "unauthenticated";
  };

  const authState = getAuthState();

  // 状態に応じたレンダリング
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
