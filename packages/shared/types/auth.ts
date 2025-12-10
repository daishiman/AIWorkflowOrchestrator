/**
 * 認証関連の型定義
 *
 * Supabase認証とプロフィール管理のための型を定義
 */

// === OAuth プロバイダー ===

/**
 * サポートするOAuthプロバイダー
 */
export type OAuthProvider = "google" | "github" | "discord";

/**
 * 有効なプロバイダーかを検証
 */
export function isValidProvider(provider: unknown): provider is OAuthProvider {
  return (
    typeof provider === "string" &&
    ["google", "github", "discord"].includes(provider)
  );
}

// === ユーザー情報 ===

/**
 * 認証ユーザー情報
 */
export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  provider: OAuthProvider;
  createdAt: string;
  lastSignInAt: string;
}

/**
 * ユーザープラン
 */
export type UserPlan = "free" | "pro" | "enterprise";

/**
 * ユーザープロフィール（Supabase user_profiles テーブル）
 */
export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  plan: UserPlan;
  createdAt: string;
  updatedAt: string;
}

/**
 * プロフィール更新可能フィールド
 */
export interface ProfileUpdateFields {
  displayName?: string;
  avatarUrl?: string | null;
}

/**
 * 連携プロバイダー情報
 */
export interface LinkedProvider {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  linkedAt: string;
}

// === セッション ===

/**
 * 認証セッション情報
 */
export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  isOffline: boolean;
}

/**
 * 認証状態
 */
export interface AuthState {
  authenticated: boolean;
  user?: AuthUser;
  error?: string;
  isOffline?: boolean;
}

// === IPC レスポンス ===

/**
 * IPC エラー型
 */
export interface IPCError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * IPC レスポンスの基本型
 */
export interface IPCResponse<T> {
  success: boolean;
  data?: T;
  error?: IPCError;
}

// === 認証エラーコード ===

export const AUTH_ERROR_CODES = {
  LOGIN_FAILED: "auth/login-failed",
  LOGOUT_FAILED: "auth/logout-failed",
  SESSION_FAILED: "auth/session-failed",
  REFRESH_FAILED: "auth/refresh-failed",
  INVALID_PROVIDER: "auth/invalid-provider",
  NETWORK_ERROR: "auth/network-error",
  TOKEN_EXPIRED: "auth/token-expired",
} as const;

export const PROFILE_ERROR_CODES = {
  GET_FAILED: "profile/get-failed",
  UPDATE_FAILED: "profile/update-failed",
  PROVIDERS_FAILED: "profile/providers-failed",
  LINK_FAILED: "profile/link-failed",
  UNLINK_FAILED: "profile/unlink-failed",
  VALIDATION_FAILED: "profile/validation-failed",
} as const;

export const AVATAR_ERROR_CODES = {
  UPLOAD_FAILED: "avatar/upload-failed",
  UPLOAD_CANCELLED: "avatar/upload-cancelled",
  USE_PROVIDER_FAILED: "avatar/use-provider-failed",
  PROVIDER_NOT_LINKED: "avatar/provider-not-linked",
  NO_PROVIDER_AVATAR: "avatar/no-provider-avatar",
  REMOVE_FAILED: "avatar/remove-failed",
  FILE_TOO_LARGE: "avatar/file-too-large",
  INVALID_FILE_TYPE: "avatar/invalid-file-type",
} as const;

// === バリデーション ===

/**
 * 表示名のバリデーション制約
 */
export const DISPLAY_NAME_CONSTRAINTS = {
  minLength: 3,
  maxLength: 30,
} as const;

/**
 * 表示名を検証
 */
export function validateDisplayName(
  name: string,
): { valid: true } | { valid: false; message: string } {
  if (name.length < DISPLAY_NAME_CONSTRAINTS.minLength) {
    return {
      valid: false,
      message: `Display name must be at least ${DISPLAY_NAME_CONSTRAINTS.minLength} characters`,
    };
  }
  if (name.length > DISPLAY_NAME_CONSTRAINTS.maxLength) {
    return {
      valid: false,
      message: `Display name must be at most ${DISPLAY_NAME_CONSTRAINTS.maxLength} characters`,
    };
  }
  return { valid: true };
}

/**
 * アバターURLを検証（HTTPS必須）
 */
export function validateAvatarUrl(
  url: string | null,
): { valid: true } | { valid: false; message: string } {
  if (url === null) {
    return { valid: true };
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      return { valid: false, message: "Avatar URL must use HTTPS" };
    }
    return { valid: true };
  } catch {
    return { valid: false, message: "Invalid URL format" };
  }
}

// === ユーティリティ型 ===

/**
 * Supabaseユーザーから AuthUser への変換用型
 */
export interface SupabaseUserMetadata {
  name?: string;
  full_name?: string;
  avatar_url?: string;
}

/**
 * Supabase Identity型
 *
 * identity_data内のフィールドはプロバイダーによって異なる:
 * - Google: picture (アバターURL)
 * - GitHub: avatar_url
 * - Discord: avatar_url
 */
export interface SupabaseIdentity {
  id: string;
  provider: string;
  identity_data?: {
    email?: string;
    name?: string;
    avatar_url?: string;
    picture?: string; // Google uses 'picture' instead of 'avatar_url'
  };
  created_at: string;
}
