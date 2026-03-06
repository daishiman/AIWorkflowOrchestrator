/**
 * 認証モード関連の型定義
 *
 * Claude Agent SDK のスキル実行時に使用する認証方式を管理するための型定義。
 * サブスクリプション認証（Claude Code CLI）と APIキー認証の切り替えをサポート。
 *
 * @module auth-mode
 * @see docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/outputs/phase-2/auth-mode-service-design.md
 */

// =============================================================================
// 基本型定義
// =============================================================================

/**
 * 認証モード
 *
 * subscription: Claude Code CLIサブスクリプション認証（Keychain経由）
 * api-key: Anthropic APIキー認証（既存AuthKeyService）
 */
export type AuthMode = "subscription" | "api-key";

/**
 * 認証モードのデフォルト値
 */
export const DEFAULT_AUTH_MODE: AuthMode = "subscription";

/**
 * 有効な認証モードの配列
 */
export const VALID_AUTH_MODES: readonly AuthMode[] = [
  "subscription",
  "api-key",
] as const;

// =============================================================================
// 公開 transport 型定義
// =============================================================================

/**
 * auth-mode 公開エラーコード
 */
export const AUTH_MODE_ERROR_CODES = {
  INVALID_SENDER: "auth-mode/invalid-sender",
  INVALID_MODE: "auth-mode/invalid-mode",
  NO_CREDENTIALS: "auth-mode/no-credentials",
  NO_API_KEY: "auth-mode/no-api-key",
  NO_SUBSCRIPTION_TOKEN: "auth-mode/no-subscription-token",
  STORAGE_FAILED: "auth-mode/storage-failed",
  STORAGE_READ_FAILED: "auth-mode/storage-read-failed",
  UNKNOWN_ERROR: "auth-mode/unknown-error",
} as const;

export type AuthModeErrorCode =
  (typeof AUTH_MODE_ERROR_CODES)[keyof typeof AUTH_MODE_ERROR_CODES];

/**
 * auth-mode 公開エラー
 */
export interface IPCError {
  code: AuthModeErrorCode;
  message: string;
  guidance?: string;
}

/**
 * auth-mode 公開レスポンス envelope
 */
export interface IPCResponse<T> {
  success: boolean;
  data?: T;
  error?: IPCError;
}

/**
 * auth-mode 公開 status DTO
 */
export interface AuthModeStatus {
  mode: AuthMode;
  isValid: boolean;
  hasCredentials: boolean;
  message: string;
  errorCode?: AuthModeErrorCode;
  guidance?: string;
  lastCheckedAt: number;
}

/**
 * 互換維持用 alias
 */
export type AuthStatus = AuthModeStatus;

/**
 * auth-mode 画面表示で使う標準メッセージ
 */
export const AUTH_MODE_ERROR_MESSAGES: Record<AuthModeErrorCode, string> = {
  [AUTH_MODE_ERROR_CODES.INVALID_SENDER]: "不正な送信元です",
  [AUTH_MODE_ERROR_CODES.INVALID_MODE]: "認証方式が不正です",
  [AUTH_MODE_ERROR_CODES.NO_CREDENTIALS]: "認証情報が見つかりません",
  [AUTH_MODE_ERROR_CODES.NO_API_KEY]: "APIキーが設定されていません",
  [AUTH_MODE_ERROR_CODES.NO_SUBSCRIPTION_TOKEN]:
    "サブスクリプションが見つかりません",
  [AUTH_MODE_ERROR_CODES.STORAGE_FAILED]: "認証方式の保存に失敗しました",
  [AUTH_MODE_ERROR_CODES.STORAGE_READ_FAILED]: "認証方式の取得に失敗しました",
  [AUTH_MODE_ERROR_CODES.UNKNOWN_ERROR]: "予期しないエラーが発生しました",
};

// =============================================================================
// イベント型定義
// =============================================================================

/**
 * 認証モード変更イベント
 */
export interface AuthModeChangeEvent {
  /** 変更前のモード */
  previousMode: AuthMode;
  /** 変更後のモード */
  newMode: AuthMode;
  /** 変更日時（Unix timestamp in ms） */
  timestamp: number;
}

/**
 * 認証モード変更リスナー型
 */
export type AuthModeChangeListener = (event: AuthModeChangeEvent) => void;

// =============================================================================
// サブスクリプション認証エラーコード定義
// =============================================================================

/**
 * サブスクリプション認証エラーコード
 */
export const SUBSCRIPTION_AUTH_ERROR_CODES = {
  /** Keychain アクセスエラー */
  KEYCHAIN_ACCESS_ERROR: 3020,
  /** トークン未保存 */
  TOKEN_NOT_FOUND: 3021,
  /** トークン形式不正 */
  INVALID_TOKEN_FORMAT: 3022,
  /** トークン期限切れ */
  TOKEN_EXPIRED: 3023,
  /** Keychain アクセス拒否 */
  KEYCHAIN_ACCESS_DENIED: 3024,
  /** Claude Code CLI 未インストール */
  CLI_NOT_INSTALLED: 3025,
  /** プラットフォーム非対応 */
  PLATFORM_NOT_SUPPORTED: 3026,
} as const;

export type SubscriptionAuthErrorCode =
  (typeof SUBSCRIPTION_AUTH_ERROR_CODES)[keyof typeof SUBSCRIPTION_AUTH_ERROR_CODES];

/**
 * サブスクリプション認証エラーメッセージとガイダンス
 */
export const SUBSCRIPTION_AUTH_ERROR_MESSAGES: Record<
  SubscriptionAuthErrorCode,
  { message: string; guidance: string }
> = {
  [SUBSCRIPTION_AUTH_ERROR_CODES.KEYCHAIN_ACCESS_ERROR]: {
    message: "Keychainへのアクセスに失敗しました",
    guidance: "しばらく待ってから再試行してください",
  },
  [SUBSCRIPTION_AUTH_ERROR_CODES.TOKEN_NOT_FOUND]: {
    message: "認証トークンが見つかりません",
    guidance: "Claude Code CLIで /login を実行してログインしてください",
  },
  [SUBSCRIPTION_AUTH_ERROR_CODES.INVALID_TOKEN_FORMAT]: {
    message: "認証トークンの形式が不正です",
    guidance: "Claude Code CLIで再ログインしてください",
  },
  [SUBSCRIPTION_AUTH_ERROR_CODES.TOKEN_EXPIRED]: {
    message: "認証トークンの有効期限が切れています",
    guidance: "Claude Code CLIで再ログインしてください",
  },
  [SUBSCRIPTION_AUTH_ERROR_CODES.KEYCHAIN_ACCESS_DENIED]: {
    message: "Keychainへのアクセスが拒否されました",
    guidance:
      "システム環境設定 > セキュリティとプライバシー で許可してください",
  },
  [SUBSCRIPTION_AUTH_ERROR_CODES.CLI_NOT_INSTALLED]: {
    message: "Claude Code CLIがインストールされていません",
    guidance: "Claude Code CLI をインストールしてください",
  },
  [SUBSCRIPTION_AUTH_ERROR_CODES.PLATFORM_NOT_SUPPORTED]: {
    message: "このプラットフォームはサポートされていません",
    guidance: "この機能は macOS のみ対応しています",
  },
};

// =============================================================================
// Keychainアクセス インターフェース
// =============================================================================

/**
 * Keychain アクセスのインターフェース
 *
 * keytar ライブラリのラッパー。テスト時にモック可能。
 */
export interface IKeychainAccess {
  /**
   * Keychain からパスワード（トークン）を取得
   *
   * @param service - サービス名
   * @param account - アカウント名
   * @returns パスワード、未保存の場合は null
   */
  getPassword(service: string, account: string): Promise<string | null>;

  /**
   * Keychain にパスワードを保存
   *
   * @param service - サービス名
   * @param account - アカウント名
   * @param password - 保存するパスワード
   */
  setPassword(
    service: string,
    account: string,
    password: string,
  ): Promise<void>;

  /**
   * Keychain からパスワードを削除
   *
   * @param service - サービス名
   * @param account - アカウント名
   * @returns 削除成功の場合 true
   */
  deletePassword(service: string, account: string): Promise<boolean>;
}

// =============================================================================
// トークン関連型定義
// =============================================================================

/**
 * Claude Code CLI トークン情報
 *
 * macOS Keychain から取得したトークンデータの構造
 */
export interface ClaudeCodeTokenData {
  /** OAuth Access Token (sk-ant-oat01-...) */
  accessToken: string;
  /** OAuth Refresh Token (sk-ant-ort01-...) */
  refreshToken?: string;
  /** トークン取得日時 */
  retrievedAt: number;
}

/**
 * トークンキャッシュエントリ
 */
export interface TokenCacheEntry {
  /** キャッシュされたトークン */
  token: string;
  /** キャッシュ作成日時 */
  cachedAt: number;
  /** キャッシュ有効期限 */
  expiresAt: number;
}

// =============================================================================
// 定数定義
// =============================================================================

/**
 * Keychain サービス名
 * Claude Code CLI が使用するサービス名と一致させる
 */
export const KEYCHAIN_SERVICE_NAME = "Claude Code-credentials";

/**
 * キャッシュ TTL（ミリ秒）
 * 5分 = 300,000ms
 */
export const TOKEN_CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * OAuth Access Token のプレフィックス
 */
export const OAUTH_ACCESS_TOKEN_PREFIX = "sk-ant-oat01-";

/**
 * OAuth Refresh Token のプレフィックス
 */
export const OAUTH_REFRESH_TOKEN_PREFIX = "sk-ant-ort01-";

/**
 * 環境変数名
 */
export const ENV_CLAUDE_CODE_OAUTH_TOKEN = "CLAUDE_CODE_OAUTH_TOKEN";

/**
 * トークンの最大長
 */
export const MAX_TOKEN_LENGTH = 500;

/**
 * トークンの最小長
 */
export const MIN_TOKEN_LENGTH = 20;

// =============================================================================
// サービスインターフェース
// =============================================================================

/**
 * サブスクリプション認証プロバイダーのインターフェース
 *
 * Claude Code CLI が macOS Keychain に保存した
 * OAuth トークンを取得・管理する。
 */
export interface ISubscriptionAuthProvider {
  /**
   * OAuth トークンを取得
   *
   * 取得優先順位:
   * 1. メモリキャッシュ（5分TTL）
   * 2. macOS Keychain
   * 3. CLAUDE_CODE_OAUTH_TOKEN 環境変数
   *
   * @returns Access Token、未認証の場合は null
   */
  getToken(): Promise<string | null>;

  /**
   * トークンの存在確認
   *
   * @returns トークンが存在する場合 true
   */
  hasToken(): Promise<boolean>;

  /**
   * トークンの有効性を検証
   *
   * トークン形式と有効期限を確認する。
   * 注意: APIリクエストによる実際の検証は行わない（コスト削減）。
   *
   * @returns 有効なトークンの場合 true
   */
  validateToken(): Promise<boolean>;

  /**
   * トークンキャッシュをクリア
   *
   * Keychain の更新を反映するために使用。
   */
  clearCache(): void;
}

/**
 * 認証モード管理サービスのインターフェース
 *
 * 認証方式（サブスクリプション/APIキー）の管理と
 * 適切な認証プロバイダーへのルーティングを担う。
 */
export interface IAuthModeService {
  /**
   * 現在の認証モードを取得
   *
   * @returns 現在の認証モード
   */
  getMode(): Promise<AuthMode>;

  /**
   * 認証モードを設定
   *
   * @param mode - 設定する認証モード
   * @throws Error - モード設定失敗時
   */
  setMode(mode: AuthMode): Promise<void>;

  /**
   * 認証状態を取得
   *
   * 現在のモードに応じた認証有効性を確認する。
   *
   * @returns 認証状態
   */
  getStatus(): Promise<AuthStatus>;

  /**
   * 現在のモードで認証トークン/キーを取得
   *
   * subscription: Keychain経由でOAuthトークンを取得
   * api-key: AuthKeyService経由でAPIキーを取得
   *
   * @returns 認証トークン/キー、未認証の場合はnull
   */
  getCredential(): Promise<string | null>;

  /**
   * 認証モード変更リスナーを登録
   *
   * @param listener - 変更通知を受け取るコールバック
   * @returns リスナー解除関数
   */
  onModeChange(listener: AuthModeChangeListener): () => void;

  /**
   * 指定モードの認証が有効かを検証
   *
   * @param mode - 検証対象のモード
   * @returns 有効な場合true
   */
  validateMode(mode: AuthMode): Promise<boolean>;
}

// =============================================================================
// ストレージ型定義
// =============================================================================

/**
 * 認証モード設定のストアスキーマ
 */
export interface AuthModeStoreSchema {
  /** 認証モード設定 */
  authMode?: AuthMode;
  /** 最終変更日時 */
  authModeUpdatedAt?: number;
}

/**
 * ストア設定
 */
export const AUTH_MODE_STORE_CONFIG = {
  /** Store 名 */
  name: "auth-mode-store",
  /** スキーマ定義（electron-store v8+） */
  schema: {
    authMode: {
      type: "string",
      enum: ["subscription", "api-key"],
      default: "subscription",
    },
    authModeUpdatedAt: {
      type: "number",
    },
  },
} as const;

// =============================================================================
// IPC 型定義
// =============================================================================

/**
 * auth-mode:get レスポンス
 */
export interface AuthModeResponse {
  mode: AuthMode;
}

/**
 * auth-mode:get IPC レスポンス
 */
export type AuthModeGetResponse = IPCResponse<AuthModeResponse>;

/**
 * auth-mode:set リクエスト
 */
export interface AuthModeSetRequest {
  mode: AuthMode;
}

/**
 * auth-mode:set レスポンス
 */
export type AuthModeSetResponse = IPCResponse<void>;

/**
 * auth-mode:status IPC レスポンス
 */
export type AuthModeStatusResponse = IPCResponse<AuthModeStatus>;

/**
 * auth-mode:validate リクエスト
 */
export interface AuthModeValidateRequest {
  mode?: AuthMode;
}

/**
 * auth-mode:validate IPC レスポンス
 */
export type AuthModeValidateResponse = IPCResponse<AuthModeStatus>;

/**
 * auth-mode:changed イベント
 */
export interface AuthModeChangedEvent {
  previousMode: AuthMode;
  mode: AuthMode;
  status: AuthModeStatus;
  changedAt: number;
}
