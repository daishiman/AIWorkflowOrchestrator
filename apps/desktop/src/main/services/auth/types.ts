/**
 * 認証キー管理サービスの型定義
 *
 * Claude Agent SDK 用の Anthropic API Key 管理に使用する型定義。
 *
 * @see architecture-design.md
 * @see type-definitions.md
 */

// =================================================================
// エラーコード定義
// =================================================================

/**
 * 認証キー関連のエラーコード
 *
 * External Service Error 範囲 (3000-3999) を使用
 */
export const AUTH_KEY_ERROR_CODES = {
  /** 認証キー未設定 */
  NOT_SET: 3001,
  /** 認証キー無効 */
  INVALID: 3002,
  /** 認証キーバリデーションエラー */
  VALIDATION_FAILED: 3003,
  /** 暗号化不可 (Infrastructure Error 範囲) */
  ENCRYPTION_UNAVAILABLE: 4001,
  /** ストレージエラー */
  STORAGE_ERROR: 4002,
  /** ネットワークエラー */
  NETWORK_ERROR: 3004,
} as const;

export type AuthKeyErrorCode =
  (typeof AUTH_KEY_ERROR_CODES)[keyof typeof AUTH_KEY_ERROR_CODES];

// =================================================================
// エラー型定義
// =================================================================

/**
 * 認証キーエラーコード（文字列型）
 */
export type AuthKeyErrorCodeString =
  | "VALIDATION_ERROR"
  | "STORAGE_ERROR"
  | "ENCRYPTION_ERROR"
  | "NETWORK_ERROR"
  | "AUTHENTICATION_ERROR";

/**
 * 認証キー操作エラー
 */
export interface AuthKeyError {
  code: AuthKeyErrorCodeString;
  message: string;
  details?: unknown;
}

/**
 * 認証キー操作結果
 */
export interface AuthKeyServiceResult<T> {
  success: boolean;
  data?: T;
  error?: AuthKeyError;
}

/**
 * 認証キーバリデーション結果
 */
export interface AuthKeyValidationResult {
  isValid: boolean;
  message?: string;
}

// =================================================================
// インターフェース定義
// =================================================================

/**
 * 認証キー管理サービスのインターフェース
 *
 * Anthropic API Key の設定・取得・検証・削除を提供する。
 * SkillExecutor はこのインターフェースに依存する（DIP）。
 */
export interface IAuthKeyService {
  /**
   * 認証キーを暗号化して保存
   *
   * @param key - Anthropic API Key
   * @throws AuthKeyValidationError - キーが不正な形式の場合
   */
  setKey(key: string): Promise<void>;

  /**
   * 認証キーを取得（復号済み）
   *
   * 取得優先順位:
   * 1. electron-store に保存されたキー
   * 2. ANTHROPIC_API_KEY 環境変数
   *
   * @returns 認証キー、未設定の場合は null
   */
  getKey(): Promise<string | null>;

  /**
   * 認証キーの存在確認
   *
   * @returns キーが設定されている場合 true
   */
  hasKey(): Promise<boolean>;

  /**
   * 認証キーを Anthropic API で検証
   *
   * @param key - 検証対象のキー
   * @returns 有効なキーの場合 true
   */
  validateKey(key: string): Promise<boolean>;

  /**
   * 認証キーを削除
   *
   * 保存されたキーとキャッシュを両方クリアする。
   */
  deleteKey(): Promise<void>;
}

/**
 * 認証キーストレージのインターフェース
 *
 * safeStorage を使用した暗号化/復号と
 * electron-store を使用した永続化を提供する。
 */
export interface IAuthKeyStorage {
  /**
   * 認証キーを暗号化して保存
   *
   * @param key - 保存する認証キー
   * @throws EncryptionUnavailableError - 暗号化が利用不可の場合（本番環境）
   */
  store(key: string): Promise<void>;

  /**
   * 認証キーを取得（復号済み）
   *
   * @returns 復号された認証キー、未保存の場合は null
   */
  retrieve(): Promise<string | null>;

  /**
   * 認証キーを削除
   */
  delete(): Promise<void>;

  /**
   * 認証キーの存在確認
   *
   * @returns 保存されている場合 true
   */
  exists(): Promise<boolean>;
}

// =================================================================
// IPC 型定義
// =================================================================

/**
 * auth-key:set リクエスト
 */
export interface AuthKeySetRequest {
  /** Anthropic API Key */
  key: string;
}

/**
 * auth-key:set レスポンス
 */
export interface AuthKeySetResponse {
  success: boolean;
  error?: string;
}

/**
 * auth-key:exists レスポンス
 */
export interface AuthKeyExistsResponse {
  exists: boolean;
}

/**
 * auth-key:validate リクエスト
 */
export interface AuthKeyValidateRequest {
  /** 検証対象のキー */
  key: string;
}

/**
 * auth-key:validate レスポンス
 */
export interface AuthKeyValidateResponse {
  valid: boolean;
  error?: string;
}

/**
 * auth-key:delete レスポンス
 */
export interface AuthKeyDeleteResponse {
  success: boolean;
  error?: string;
}

// =================================================================
// ストレージ型定義
// =================================================================

/**
 * auth-key-store のスキーマ
 */
export interface AuthKeyStoreSchema {
  /** Base64 エンコードされた暗号化済みキー */
  encryptedAuthKey?: string;
}

/**
 * ストレージ設定
 */
export interface AuthKeyStorageConfig {
  /** Store 名（デフォルト: "auth-key-store"） */
  storeName?: string;
  /** 暗号化キー（electron-store の encryptionKey） */
  encryptionKey?: string;
}

// =================================================================
// 定数定義
// =================================================================

/** 認証キー Store 名 */
export const AUTH_KEY_STORE_NAME = "auth-key-store";

/** 暗号化済みキーの Store キー */
export const ENCRYPTED_AUTH_KEY = "encryptedAuthKey";

/** 環境変数名 */
export const ENV_ANTHROPIC_API_KEY = "ANTHROPIC_API_KEY";

/** キーの最大長 */
export const MAX_KEY_LENGTH = 200;

/** キーの最小長 */
export const MIN_KEY_LENGTH = 1;

/** Anthropic API Key のプレフィックスパターン */
export const ANTHROPIC_API_KEY_PREFIX_PATTERN = /^sk-ant-api\d{2}-/;

/** Anthropic API Key のサニタイズ用パターン（ログ出力時に使用） */
export const ANTHROPIC_API_KEY_SANITIZE_PATTERN =
  /sk-ant-api\d{2}-[A-Za-z0-9_-]+/g;

// =================================================================
// Anthropic API 定数
// =================================================================

/** Anthropic API エンドポイント */
export const ANTHROPIC_API_ENDPOINT = "https://api.anthropic.com/v1/messages";

/** Anthropic API バージョン */
export const ANTHROPIC_API_VERSION = "2023-06-01";

/** API検証用のモデル（最小コストのモデル） */
export const ANTHROPIC_VALIDATION_MODEL = "claude-3-haiku-20240307";
