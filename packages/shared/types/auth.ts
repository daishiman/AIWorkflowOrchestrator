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

// === 拡張プロフィール型 ===

/**
 * IANA タイムゾーン識別子
 * @example "Asia/Tokyo", "America/New_York", "Europe/London"
 */
export type Timezone = string;

/**
 * BCP 47 言語タグ
 * @example "ja", "en", "zh-CN", "zh-TW", "ko"
 */
export type Locale = "ja" | "en" | "zh-CN" | "zh-TW" | "ko";

/**
 * サポートするロケール一覧
 */
export const SUPPORTED_LOCALES: Locale[] = ["ja", "en", "zh-CN", "zh-TW", "ko"];

/**
 * ロケール表示名マッピング
 */
export const LOCALE_DISPLAY_NAMES: Record<Locale, string> = {
  ja: "日本語",
  en: "English",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  ko: "한국어",
};

/**
 * 通知設定
 */
export interface NotificationSettings {
  /** メール通知を受け取る */
  email: boolean;
  /** デスクトップ通知を表示する */
  desktop: boolean;
  /** 通知音を鳴らす */
  sound: boolean;
  /** ワークフロー完了時に通知 */
  workflowComplete: boolean;
  /** ワークフローエラー時に通知 */
  workflowError: boolean;
}

/**
 * デフォルトの通知設定
 */
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  email: true,
  desktop: true,
  sound: true,
  workflowComplete: true,
  workflowError: true,
};

/**
 * ユーザー設定（将来の拡張用）
 */
export interface UserPreferences {
  [key: string]: unknown;
}

/**
 * デフォルトのユーザー設定
 */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {};

/**
 * 拡張ユーザープロフィール
 * 既存の UserProfile を拡張
 */
export interface ExtendedUserProfile extends UserProfile {
  /** タイムゾーン (IANA形式) */
  timezone: Timezone;
  /** ロケール (BCP 47形式) */
  locale: Locale;
  /** 通知設定 */
  notificationSettings: NotificationSettings;
  /** ユーザー設定 */
  preferences: UserPreferences;
}

/**
 * デフォルトの拡張プロフィール値
 */
export const DEFAULT_EXTENDED_PROFILE: Pick<
  ExtendedUserProfile,
  "timezone" | "locale" | "notificationSettings" | "preferences"
> = {
  timezone: "Asia/Tokyo",
  locale: "ja",
  notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
  preferences: DEFAULT_USER_PREFERENCES,
};

// === IPC ペイロード型 ===

/**
 * タイムゾーン更新ペイロード
 */
export interface UpdateTimezonePayload {
  timezone: Timezone;
}

/**
 * ロケール更新ペイロード
 */
export interface UpdateLocalePayload {
  locale: Locale;
}

/**
 * 通知設定更新ペイロード
 */
export interface UpdateNotificationSettingsPayload {
  notificationSettings: Partial<NotificationSettings>;
}

/**
 * プロフィールエクスポートレスポンス
 */
export interface ProfileExportResponse {
  success: boolean;
  filePath?: string;
  error?: string;
}

/**
 * プロフィールインポートペイロード
 */
export interface ProfileImportPayload {
  filePath: string;
}

/**
 * プロフィールインポートレスポンス
 */
export interface ProfileImportResponse {
  success: boolean;
  profile?: Partial<ExtendedUserProfile>;
  error?: string;
}

/**
 * 連携プロバイダー情報（エクスポート用）
 */
export interface ExportedLinkedProvider {
  provider: OAuthProvider;
  linkedAt: string;
}

/**
 * AIプロバイダー登録状態（エクスポート用）
 * セキュリティ: APIキー自体は含まない
 */
export interface ExportedAIProviderStatus {
  provider: string;
  registered: boolean;
  lastValidatedAt: string | null;
}

/**
 * プロフィールエクスポートデータ
 *
 * セキュリティ考慮事項:
 * - email: 除外 (個人識別情報)
 * - avatarUrl: 除外 (Supabase Storage URL = ユーザー識別可能)
 * - id: 除外 (内部識別子)
 * - APIキー: 除外 (機密情報)
 */
export interface ProfileExportData {
  /** エクスポート形式バージョン */
  version: "1.0";
  /** エクスポート日時 (ISO 8601) */
  exportedAt: string;
  /** 表示名 */
  displayName: string;
  /** タイムゾーン (間接的位置情報として扱う) */
  timezone: Timezone;
  /** ロケール */
  locale: Locale;
  /** 通知設定 */
  notificationSettings: NotificationSettings;
  /** ユーザー設定 */
  preferences: UserPreferences;
  /** 連携プロバイダー一覧（オプション） */
  linkedProviders?: ExportedLinkedProvider[];
  /** AIプロバイダー登録状態（オプション、キー自体は含まない） */
  aiProviders?: ExportedAIProviderStatus[];
  /** アカウント作成日 */
  accountCreatedAt?: string;
  /** プラン情報（参照用） */
  plan?: string;
}

/**
 * インポート制限定数
 */
export const IMPORT_LIMITS = {
  /** 最大ファイルサイズ (1MB) */
  MAX_FILE_SIZE: 1024 * 1024,
  /** 表示名最大長 */
  MAX_DISPLAY_NAME_LENGTH: 100,
  /** プロフィールエクスポートバージョン */
  CURRENT_VERSION: "1.0" as const,
} as const;

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
  DELETE_FAILED: "profile/delete-failed",
  DELETE_EMAIL_MISMATCH: "profile/delete-email-mismatch",
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
