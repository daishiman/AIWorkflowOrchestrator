/**
 * AuthGuard型定義モジュール
 *
 * 認証ガードコンポーネントで使用する型定義と型ガード関数を提供する。
 *
 * @module AuthGuard/types
 */

import type { AuthUser } from "../../../preload/types";

// ============================================================
// エクスポート型定義
// ============================================================

/**
 * 認証ガードの状態を表すDiscriminated Union
 *
 * 各状態の意味:
 * - `checking`: 認証状態を確認中
 * - `authenticated`: 認証済み（user情報を含む）
 * - `unauthenticated`: 未認証
 *
 * @example
 * ```typescript
 * const state: AuthGuardState = { status: "authenticated", user: currentUser };
 *
 * // switch文での網羅性チェック
 * switch (state.status) {
 *   case "checking":
 *     return <LoadingScreen />;
 *   case "authenticated":
 *     return children;
 *   case "unauthenticated":
 *     return <AuthView />;
 *   // TypeScriptがdefaultケースなしでも網羅的と判断
 * }
 * ```
 */
export type AuthGuardState =
  | { status: "checking" }
  | { status: "authenticated"; user: AuthUser }
  | { status: "unauthenticated" };

/**
 * 認証エラーの型定義
 *
 * @example
 * ```typescript
 * const error: AuthError = {
 *   code: "NETWORK_ERROR",
 *   message: "ネットワーク接続を確認してください",
 *   originalError: new Error("fetch failed"),
 * };
 * ```
 */
export interface AuthError {
  /** エラーコード */
  code: AuthErrorCode;
  /** ユーザー向けエラーメッセージ */
  message: string;
  /** 元のエラーオブジェクト（デバッグ用） */
  originalError?: Error;
}

/**
 * 認証エラーコード
 *
 * - `NETWORK_ERROR`: ネットワーク接続の問題
 * - `AUTH_FAILED`: 認証処理の失敗
 * - `TIMEOUT`: リクエストのタイムアウト
 * - `SESSION_EXPIRED`: セッション有効期限切れ
 * - `PROVIDER_ERROR`: OAuthプロバイダーエラー
 * - `PROFILE_UPDATE_FAILED`: プロフィール更新失敗
 * - `LINK_PROVIDER_FAILED`: アカウント連携失敗
 * - `UNKNOWN`: 未分類のエラー
 */
export type AuthErrorCode =
  | "NETWORK_ERROR"
  | "AUTH_FAILED"
  | "TIMEOUT"
  | "SESSION_EXPIRED"
  | "PROVIDER_ERROR"
  | "PROFILE_UPDATE_FAILED"
  | "LINK_PROVIDER_FAILED"
  | "UNKNOWN";

// ============================================================
// 型ガード関数
// ============================================================

/**
 * 認証済み状態かどうかを判定する型ガード
 *
 * @param state - AuthGuardState
 * @returns 認証済みの場合true
 *
 * @example
 * ```typescript
 * if (isAuthenticated(state)) {
 *   // state.user にアクセス可能（型推論される）
 *   console.log(state.user.email);
 * }
 * ```
 */
export const isAuthenticated = (
  state: AuthGuardState,
): state is { status: "authenticated"; user: AuthUser } => {
  return state.status === "authenticated";
};

/**
 * 確認中状態かどうかを判定する型ガード
 *
 * @param state - AuthGuardState
 * @returns 確認中の場合true
 */
export const isChecking = (
  state: AuthGuardState,
): state is { status: "checking" } => {
  return state.status === "checking";
};

/**
 * 未認証状態かどうかを判定する型ガード
 *
 * @param state - AuthGuardState
 * @returns 未認証の場合true
 */
export const isUnauthenticated = (
  state: AuthGuardState,
): state is { status: "unauthenticated" } => {
  return state.status === "unauthenticated";
};

/**
 * Errorインスタンスかどうかを判定する型ガード
 *
 * @param error - unknown型のエラー
 * @returns Errorインスタンスの場合true
 *
 * @example
 * ```typescript
 * try {
 *   throw new Error("test");
 * } catch (e) {
 *   if (isError(e)) {
 *     console.log(e.message); // e は Error 型
 *   }
 * }
 * ```
 */
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

/**
 * expiresAtプロパティを持つオブジェクトかどうかを判定する型ガード
 *
 * @param obj - unknown型のオブジェクト
 * @returns expiresAtを持つ場合true
 *
 * @example
 * ```typescript
 * if (hasExpiresAt(event)) {
 *   const expiryTime = event.expiresAt; // number 型
 * }
 * ```
 */
export const hasExpiresAt = (obj: unknown): obj is { expiresAt: number } => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "expiresAt" in obj &&
    typeof (obj as Record<string, unknown>).expiresAt === "number"
  );
};

// ============================================================
// 網羅性チェックヘルパー
// ============================================================

/**
 * switch文の網羅性チェック用ヘルパー
 *
 * TypeScriptの網羅性チェックを活用し、
 * すべてのケースが処理されていることをコンパイル時に保証する。
 *
 * @param _value - never型（すべてのケースが処理された後の値）
 * @throws 実行時に到達した場合はエラー
 *
 * @example
 * ```typescript
 * switch (state.status) {
 *   case "checking":
 *     return <Loading />;
 *   case "authenticated":
 *     return <Dashboard />;
 *   case "unauthenticated":
 *     return <Login />;
 *   default:
 *     return assertNever(state);
 * }
 * ```
 */
export const assertNever = (_value: never): never => {
  throw new Error(`Unexpected value: ${JSON.stringify(_value)}`);
};
