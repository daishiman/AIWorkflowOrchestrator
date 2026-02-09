/**
 * 認証方式選択機能の型定義
 *
 * TASK-AUTH-MODE-SELECTION-001
 * Phase 2: IPC・型定義設計
 *
 * @see ipc-specification.md - IPC仕様書
 * @see cli-auth-investigation.md - CLI認証調査結果
 */

// ============================================================================
// 認証方式 (AuthMode)
// ============================================================================

/**
 * 認証方式
 *
 * @description
 * - subscription: Claude サブスクリプション（macOS Keychain経由）
 *   - Claude Code CLIの認証情報を利用
 *   - トークン形式: `sk-ant-oat01-` (OAuth Access Token)
 *
 * - api-key: Anthropic API Key（electron-store + safeStorage）
 *   - ユーザーが直接入力したAPIキーを利用
 *   - キー形式: `sk-ant-api03-`
 */
export type AuthMode = "subscription" | "api-key";

/**
 * 有効な認証方式の配列
 * バリデーション用
 */
export const VALID_AUTH_MODES: readonly AuthMode[] = [
  "subscription",
  "api-key",
] as const;

/**
 * 認証方式のバリデーション
 */
export function isValidAuthMode(value: unknown): value is AuthMode {
  return (
    typeof value === "string" && VALID_AUTH_MODES.includes(value as AuthMode)
  );
}

/**
 * デフォルトの認証方式
 * 初回起動時またはマイグレーション時に使用
 */
export const DEFAULT_AUTH_MODE: AuthMode = "api-key";

// ============================================================================
// 認証方式の状態 (AuthModeStatus)
// ============================================================================

/**
 * 認証方式の状態
 *
 * @description
 * 現在の認証方式と、その認証情報の有効性を表す。
 * UIの認証状態インジケーターで使用される。
 */
export interface AuthModeStatus {
  /** 現在の認証方式 */
  mode: AuthMode;

  /**
   * 認証済みかどうか
   *
   * - subscription: トークンが存在し、有効期限内
   * - api-key: キーが存在し、フォーマットが正しい
   */
  isAuthenticated: boolean;

  /**
   * 認証情報が存在するか
   *
   * - subscription: Keychainにエントリが存在する
   * - api-key: electron-storeにキーが保存されている
   */
  hasCredentials: boolean;

  /**
   * トークン有効期限
   * サブスクリプション認証時のみ設定される
   * Unixタイムスタンプ（秒）
   */
  tokenExpiresAt?: number;

  /**
   * 最終検証日時
   * Unixタイムスタンプ（秒）
   */
  lastValidatedAt?: number;

  /**
   * 認証エラー情報
   * エラー状態の場合のみ設定される
   */
  error?: AuthModeStatusError;
}

/**
 * 認証状態エラー
 */
export interface AuthModeStatusError {
  /** エラーコード */
  code: AuthModeErrorCode;

  /** ユーザー向けメッセージ */
  message: string;

  /**
   * 復旧ガイダンス
   * ユーザーが問題を解決するための手順
   */
  guidance?: string;
}

// ============================================================================
// バリデーション結果 (AuthModeValidationResult)
// ============================================================================

/**
 * 認証方式バリデーション結果
 *
 * @description
 * auth-mode:validate の応答として使用される。
 * 認証情報の詳細な検証結果を含む。
 */
export interface AuthModeValidationResult {
  /**
   * 認証情報が有効か
   * すべての検証チェックをパスした場合にtrue
   */
  isValid: boolean;

  /** 検証した認証方式 */
  mode: AuthMode;

  /** 認証情報が存在するか */
  hasCredentials: boolean;

  /**
   * エラー詳細
   * 検証失敗時のみ設定される
   */
  error?: AuthModeValidationError;

  /**
   * トークン情報
   * サブスクリプション認証時のみ設定される
   */
  tokenInfo?: TokenInfo;
}

/**
 * バリデーションエラー
 */
export interface AuthModeValidationError {
  /** エラーコード */
  code: AuthModeErrorCode;

  /** ユーザー向けメッセージ */
  message: string;

  /** 復旧ガイダンス */
  guidance: string;
}

/**
 * トークン情報
 * サブスクリプション認証時のOAuthトークン状態
 */
export interface TokenInfo {
  /**
   * 有効期限
   * Unixタイムスタンプ（秒）
   */
  expiresAt?: number;

  /** 期限切れかどうか */
  isExpired: boolean;

  /**
   * リフレッシュが必要か
   * 有効期限が近い場合（例: 5分以内）にtrue
   */
  needsRefresh: boolean;
}

// ============================================================================
// イベント (AuthModeChangedEvent)
// ============================================================================

/**
 * 認証方式変更イベント
 *
 * @description
 * auth-mode:changed チャンネルで通知されるペイロード。
 * 認証方式が変更された際に、すべてのRendererプロセスに送信される。
 */
export interface AuthModeChangedEvent {
  /** 変更前の認証方式 */
  previousMode: AuthMode;

  /** 変更後の認証方式 */
  currentMode: AuthMode;

  /**
   * 変更日時
   * Unixタイムスタンプ（秒）
   */
  timestamp: number;

  /**
   * 新しいモードで認証済みか
   * 切り替え直後の認証状態を示す
   */
  isAuthenticated: boolean;
}

// ============================================================================
// エラーコード (AuthModeErrorCode)
// ============================================================================

/**
 * 認証方式関連エラーコード
 *
 * @description
 * エラーコードは以下のカテゴリに分類される:
 * - バリデーションエラー: 入力値の検証失敗
 * - 認証情報エラー: 認証情報の存在/形式の問題
 * - トークンエラー: OAuthトークンのライフサイクル問題
 * - Keychainエラー: macOS Keychainアクセスの問題
 * - ストレージエラー: electron-storeの読み書き問題
 * - 内部エラー: 予期しないエラー
 */
export const AUTH_MODE_ERROR_CODES = {
  // === バリデーションエラー ===
  /** 無効な認証方式が指定された */
  INVALID_MODE: "auth-mode/invalid-mode",

  // === 認証情報エラー ===
  /** 認証情報が存在しない */
  NO_CREDENTIALS: "auth-mode/no-credentials",
  /** APIキーが設定されていない */
  NO_API_KEY: "auth-mode/no-api-key",
  /** サブスクリプショントークンが存在しない */
  NO_SUBSCRIPTION_TOKEN: "auth-mode/no-subscription-token",
  /** APIキーのフォーマットが無効 */
  INVALID_API_KEY_FORMAT: "auth-mode/invalid-api-key-format",
  /** トークンのフォーマットが無効 */
  INVALID_TOKEN_FORMAT: "auth-mode/invalid-token-format",

  // === トークンエラー ===
  /** トークンが期限切れ */
  TOKEN_EXPIRED: "auth-mode/token-expired",
  /** トークンのリフレッシュが必要 */
  TOKEN_NEEDS_REFRESH: "auth-mode/token-needs-refresh",
  /** トークンのリフレッシュに失敗 */
  TOKEN_REFRESH_FAILED: "auth-mode/token-refresh-failed",

  // === Keychainエラー ===
  /** Keychainアクセスが拒否された */
  KEYCHAIN_ACCESS_DENIED: "auth-mode/keychain-access-denied",
  /** Keychainエントリが見つからない */
  KEYCHAIN_NOT_FOUND: "auth-mode/keychain-not-found",
  /** Keychainアクセスに失敗 */
  KEYCHAIN_ERROR: "auth-mode/keychain-error",

  // === ストレージエラー ===
  /** 設定の永続化に失敗 */
  STORAGE_FAILED: "auth-mode/storage-failed",
  /** 設定の読み込みに失敗 */
  STORAGE_READ_FAILED: "auth-mode/storage-read-failed",

  // === 内部エラー ===
  /** 不明なエラー */
  UNKNOWN_ERROR: "auth-mode/unknown-error",
} as const;

/**
 * 認証方式エラーコード型
 */
export type AuthModeErrorCode =
  (typeof AUTH_MODE_ERROR_CODES)[keyof typeof AUTH_MODE_ERROR_CODES];

// ============================================================================
// エラーガイダンス
// ============================================================================

/**
 * エラーコードに対応するガイダンスメッセージ
 *
 * @description
 * ユーザーが問題を解決するための具体的な手順を提供する。
 * UIでエラーメッセージと共に表示される。
 */
export const AUTH_MODE_ERROR_GUIDANCE: Record<AuthModeErrorCode, string> = {
  [AUTH_MODE_ERROR_CODES.INVALID_MODE]:
    "認証方式の設定が破損しています。アプリを再起動してください。",

  [AUTH_MODE_ERROR_CODES.NO_CREDENTIALS]:
    "認証情報が設定されていません。設定画面から認証を設定してください。",

  [AUTH_MODE_ERROR_CODES.NO_API_KEY]:
    "APIキーが設定されていません。設定画面でAPIキーを入力してください。",

  [AUTH_MODE_ERROR_CODES.NO_SUBSCRIPTION_TOKEN]:
    "Claude Codeの認証情報が見つかりません。Claude Code CLIで `/login` を実行してログインしてください。",

  [AUTH_MODE_ERROR_CODES.INVALID_API_KEY_FORMAT]:
    "APIキーの形式が正しくありません。`sk-ant-api03-`で始まるキーを入力してください。",

  [AUTH_MODE_ERROR_CODES.INVALID_TOKEN_FORMAT]:
    "トークンの形式が正しくありません。Claude Code CLIで再度ログインしてください。",

  [AUTH_MODE_ERROR_CODES.TOKEN_EXPIRED]:
    "認証トークンの有効期限が切れています。Claude Code CLIで `/login` を実行して再ログインしてください。",

  [AUTH_MODE_ERROR_CODES.TOKEN_NEEDS_REFRESH]:
    "認証トークンの更新が必要です。しばらく待ってから再試行してください。",

  [AUTH_MODE_ERROR_CODES.TOKEN_REFRESH_FAILED]:
    "認証トークンの更新に失敗しました。Claude Code CLIで再度ログインしてください。",

  [AUTH_MODE_ERROR_CODES.KEYCHAIN_ACCESS_DENIED]:
    "Keychainへのアクセスが拒否されました。システム環境設定 > セキュリティとプライバシー でアクセスを許可してください。",

  [AUTH_MODE_ERROR_CODES.KEYCHAIN_NOT_FOUND]:
    "Claude Codeの認証情報がKeychainに見つかりません。Claude Code CLIでログインしてください。",

  [AUTH_MODE_ERROR_CODES.KEYCHAIN_ERROR]:
    "Keychainへのアクセス中にエラーが発生しました。macOSを再起動するか、Keychain Accessアプリで問題を確認してください。",

  [AUTH_MODE_ERROR_CODES.STORAGE_FAILED]:
    "設定の保存に失敗しました。ディスク容量を確認し、アプリを再起動してください。",

  [AUTH_MODE_ERROR_CODES.STORAGE_READ_FAILED]:
    "設定の読み込みに失敗しました。アプリを再起動してください。",

  [AUTH_MODE_ERROR_CODES.UNKNOWN_ERROR]:
    "予期しないエラーが発生しました。問題が続く場合はサポートにお問い合わせください。",
};

// ============================================================================
// IPC リクエスト/レスポンス型
// ============================================================================

/**
 * auth-mode:set リクエストペイロード
 */
export interface AuthModeSetRequest {
  mode: AuthMode;
}

/**
 * auth-mode:validate リクエストペイロード
 */
export interface AuthModeValidateRequest {
  mode: AuthMode;
}

// ============================================================================
// IPCResponse 型（再エクスポート用）
// ============================================================================

/**
 * IPC レスポンスの基本型
 *
 * @description
 * packages/shared/types/auth.ts からの再エクスポート用定義。
 * 認証方式選択機能のIPC通信で使用される。
 *
 * @see packages/shared/types/auth.ts#IPCResponse
 */
export interface IPCResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ============================================================================
// ストレージキー定義
// ============================================================================

/**
 * electron-storeのストレージキー
 */
export const AUTH_MODE_STORAGE_KEYS = {
  /** 認証方式設定 */
  AUTH_MODE: "settings.authMode",
  /** 最終検証日時 */
  LAST_VALIDATED_AT: "settings.authModeLastValidatedAt",
} as const;

/**
 * Keychainのサービス名
 * Claude Code CLIが使用するサービス名と同一
 */
export const KEYCHAIN_SERVICE_NAME = "Claude Code-credentials";

// ============================================================================
// トークン検証定数
// ============================================================================

/**
 * トークン関連の定数
 */
export const TOKEN_CONSTANTS = {
  /**
   * リフレッシュが必要と判断する閾値（秒）
   * 有効期限までこの時間以下になったらリフレッシュを推奨
   */
  REFRESH_THRESHOLD_SECONDS: 5 * 60, // 5分

  /**
   * APIキーのプレフィックス
   */
  API_KEY_PREFIX: "sk-ant-api03-",

  /**
   * OAuth Access Tokenのプレフィックス
   */
  OAUTH_ACCESS_TOKEN_PREFIX: "sk-ant-oat01-",

  /**
   * OAuth Refresh Tokenのプレフィックス
   */
  OAUTH_REFRESH_TOKEN_PREFIX: "sk-ant-ort01-",
} as const;

// ============================================================================
// バリデーションヘルパー
// ============================================================================

/**
 * APIキーのフォーマットを検証
 */
export function isValidApiKeyFormat(key: string): boolean {
  return key.startsWith(TOKEN_CONSTANTS.API_KEY_PREFIX);
}

/**
 * OAuth Access Tokenのフォーマットを検証
 */
export function isValidOAuthAccessTokenFormat(token: string): boolean {
  return token.startsWith(TOKEN_CONSTANTS.OAUTH_ACCESS_TOKEN_PREFIX);
}

/**
 * OAuth Refresh Tokenのフォーマットを検証
 */
export function isValidOAuthRefreshTokenFormat(token: string): boolean {
  return token.startsWith(TOKEN_CONSTANTS.OAUTH_REFRESH_TOKEN_PREFIX);
}

/**
 * トークンが期限切れかどうかを判定
 *
 * @param expiresAt 有効期限（Unixタイムスタンプ秒）
 * @returns 期限切れの場合true
 */
export function isTokenExpired(expiresAt: number | undefined): boolean {
  if (expiresAt === undefined) {
    return false; // 有効期限不明の場合は期限切れとみなさない
  }
  const now = Math.floor(Date.now() / 1000);
  return now >= expiresAt;
}

/**
 * トークンがリフレッシュ必要かどうかを判定
 *
 * @param expiresAt 有効期限（Unixタイムスタンプ秒）
 * @returns リフレッシュが必要な場合true
 */
export function needsTokenRefresh(expiresAt: number | undefined): boolean {
  if (expiresAt === undefined) {
    return false;
  }
  const now = Math.floor(Date.now() / 1000);
  const remainingSeconds = expiresAt - now;
  return remainingSeconds <= TOKEN_CONSTANTS.REFRESH_THRESHOLD_SECONDS;
}

// ============================================================================
// UI用ヘルパー型
// ============================================================================

/**
 * 認証方式の表示情報
 */
export interface AuthModeDisplayInfo {
  /** 認証方式ID */
  mode: AuthMode;
  /** 表示ラベル（日本語） */
  label: string;
  /** 説明文 */
  description: string;
  /** アイコン識別子 */
  icon: string;
}

/**
 * 認証方式の表示情報マップ
 */
export const AUTH_MODE_DISPLAY_INFO: Record<AuthMode, AuthModeDisplayInfo> = {
  subscription: {
    mode: "subscription",
    label: "サブスクリプション",
    description:
      "Claude Code CLIの認証を使用します。Claude Proプラン以上が必要です。",
    icon: "subscription",
  },
  "api-key": {
    mode: "api-key",
    label: "APIキー",
    description: "Anthropic APIキーを使用します。従量課金制です。",
    icon: "api-key",
  },
};
