/**
 * APIキー管理関連の型定義
 *
 * AIプロバイダーのAPIキーを安全に管理するための型を定義
 *
 * @see docs/30-workflows/api-key-management/data-model.md
 */

import { z } from "zod";
import type { IPCResponse } from "./auth";

// ============================================================
// AIプロバイダー（列挙型）
// ============================================================

/**
 * サポートするAIプロバイダー
 *
 * @see requirements.md セクション2「対応AIプロバイダー」
 */
export type AIProvider = "openai" | "anthropic" | "google" | "xai";

/**
 * AIプロバイダーの一覧（イテレーション用）
 */
export const AI_PROVIDERS: readonly AIProvider[] = [
  "openai",
  "anthropic",
  "google",
  "xai",
] as const;

/**
 * 有効なAIプロバイダーかを検証（Type Guard）
 */
export function isValidAIProvider(value: unknown): value is AIProvider {
  return (
    typeof value === "string" && AI_PROVIDERS.includes(value as AIProvider)
  );
}

// ============================================================
// プロバイダー情報（メタデータ）
// ============================================================

/**
 * AIプロバイダーのメタデータ
 */
export interface AIProviderMeta {
  /** プロバイダーID */
  id: AIProvider;
  /** 表示名 */
  displayName: string;
  /** APIキーのプレフィックス（バリデーション用、任意） */
  keyPrefix?: string;
  /** 検証用エンドポイントのベースURL */
  validationEndpoint: string;
  /** 検証用HTTPメソッド */
  validationMethod: "GET" | "POST";
}

/**
 * プロバイダーメタデータの定義
 */
export const AI_PROVIDER_META: Record<AIProvider, AIProviderMeta> = {
  openai: {
    id: "openai",
    displayName: "OpenAI",
    keyPrefix: "sk-",
    validationEndpoint: "https://api.openai.com/v1/models",
    validationMethod: "GET",
  },
  anthropic: {
    id: "anthropic",
    displayName: "Anthropic",
    keyPrefix: "sk-ant-",
    validationEndpoint: "https://api.anthropic.com/v1/messages",
    validationMethod: "POST",
  },
  google: {
    id: "google",
    displayName: "Google AI",
    keyPrefix: undefined, // プレフィックスなし
    validationEndpoint: "https://generativelanguage.googleapis.com/v1/models",
    validationMethod: "GET",
  },
  xai: {
    id: "xai",
    displayName: "xAI",
    keyPrefix: "xai-",
    validationEndpoint: "https://api.x.ai/v1/models",
    validationMethod: "GET",
  },
} as const;

// ============================================================
// APIキーエントリ（エンティティ）
// ============================================================

/**
 * APIキーエントリ（保存用データ構造）
 *
 * @note このインターフェースは内部用。Renderer側には公開しない。
 */
export interface ApiKeyEntry {
  /** プロバイダー */
  provider: AIProvider;
  /** 暗号化されたAPIキー（Base64エンコード済み） */
  encryptedKey: string;
  /** 登録日時（ISO 8601形式） */
  createdAt: string;
  /** 更新日時（ISO 8601形式） */
  updatedAt: string;
  /** 最終検証日時（ISO 8601形式、null = 未検証） */
  lastValidatedAt: string | null;
}

/**
 * APIキー登録用入力データ
 */
export interface ApiKeySaveInput {
  /** プロバイダー */
  provider: AIProvider;
  /** APIキー（平文） */
  apiKey: string;
  /** 保存前に検証するか */
  validateBeforeSave?: boolean;
}

/**
 * APIキー削除用入力データ
 */
export interface ApiKeyDeleteInput {
  /** プロバイダー */
  provider: AIProvider;
}

// ============================================================
// 検証結果（値オブジェクト）
// ============================================================

/**
 * APIキー検証の状態
 */
export type ApiKeyValidationStatus =
  | "valid"
  | "invalid"
  | "network_error"
  | "timeout"
  | "unknown_error";

/**
 * APIキー検証結果
 */
export interface ApiKeyValidationResult {
  /** プロバイダー */
  provider: AIProvider;
  /** 検証状態 */
  status: ApiKeyValidationStatus;
  /** 検証日時（ISO 8601形式） */
  validatedAt: string;
  /** エラーメッセージ（status が valid 以外の場合） */
  errorMessage?: string;
  /** HTTPステータスコード（API応答時のみ） */
  httpStatusCode?: number;
}

/**
 * 検証結果が有効かを判定
 */
export function isValidApiKey(result: ApiKeyValidationResult): boolean {
  return result.status === "valid";
}

// ============================================================
// プロバイダーステータス（一覧表示用）
// ============================================================

/**
 * プロバイダーの登録状態
 */
export type RegistrationStatus = "registered" | "not_registered";

/**
 * プロバイダーステータス（UI表示用）
 *
 * @note APIキーの値は含まない（セキュリティ要件: NFR-SEC-008）
 */
export interface ProviderStatus {
  /** プロバイダー */
  provider: AIProvider;
  /** 表示名 */
  displayName: string;
  /** 登録状態 */
  status: RegistrationStatus;
  /** 最終検証日時（ISO 8601形式、null = 未検証または未登録） */
  lastValidatedAt: string | null;
}

/**
 * プロバイダー一覧レスポンス
 */
export interface ProviderListResult {
  /** 全プロバイダーのステータス */
  providers: ProviderStatus[];
  /** 登録済みプロバイダー数 */
  registeredCount: number;
  /** 総プロバイダー数 */
  totalCount: number;
}

// ============================================================
// エラーコード定義
// ============================================================

/**
 * APIキー関連エラーコード
 *
 * @see auth.ts AUTH_ERROR_CODES パターン参照
 */
export const API_KEY_ERROR_CODES = {
  // 保存エラー
  SAVE_FAILED: "api-key/save-failed",
  ENCRYPTION_FAILED: "api-key/encryption-failed",
  ENCRYPTION_NOT_AVAILABLE: "api-key/encryption-not-available",

  // 取得エラー
  GET_FAILED: "api-key/get-failed",
  DECRYPTION_FAILED: "api-key/decryption-failed",
  NOT_FOUND: "api-key/not-found",

  // 削除エラー
  DELETE_FAILED: "api-key/delete-failed",

  // 検証エラー
  VALIDATION_FAILED: "api-key/validation-failed",
  VALIDATION_TIMEOUT: "api-key/validation-timeout",
  VALIDATION_NETWORK_ERROR: "api-key/validation-network-error",

  // 入力バリデーションエラー
  INVALID_PROVIDER: "api-key/invalid-provider",
  INVALID_API_KEY_FORMAT: "api-key/invalid-api-key-format",
  EMPTY_API_KEY: "api-key/empty-api-key",
  API_KEY_TOO_LONG: "api-key/api-key-too-long",

  // IPC エラー
  IPC_FORBIDDEN: "api-key/ipc-forbidden",
  IPC_INVALID_SENDER: "api-key/ipc-invalid-sender",
} as const;

export type ApiKeyErrorCode =
  (typeof API_KEY_ERROR_CODES)[keyof typeof API_KEY_ERROR_CODES];

// ============================================================
// 操作結果型（Design Review M-1対応）
// ============================================================

/**
 * APIキー保存結果（内部用）
 */
export interface ApiKeySaveResult {
  success: boolean;
  errorCode?: ApiKeyErrorCode;
  errorMessage?: string;
}

/**
 * APIキー削除結果（内部用）
 */
export interface ApiKeyDeleteResult {
  success: boolean;
  errorCode?: ApiKeyErrorCode;
  errorMessage?: string;
}

// ============================================================
// IPCレスポンス型
// ============================================================

/**
 * APIキー保存レスポンス
 */
export type ApiKeySaveResponse = IPCResponse<{
  provider: AIProvider;
  savedAt: string;
}>;

/**
 * APIキー削除レスポンス
 */
export type ApiKeyDeleteResponse = IPCResponse<{
  provider: AIProvider;
  deletedAt: string;
}>;

/**
 * APIキー検証レスポンス
 */
export type ApiKeyValidateResponse = IPCResponse<ApiKeyValidationResult>;

/**
 * APIキー一覧レスポンス
 */
export type ApiKeyListResponse = IPCResponse<ProviderListResult>;

// ============================================================
// Zodスキーマ定義
// ============================================================

/**
 * AIプロバイダースキーマ（ホワイトリスト方式）
 */
export const aiProviderSchema = z.enum([
  "openai",
  "anthropic",
  "google",
  "xai",
]);

/**
 * APIキー制約
 */
export const API_KEY_CONSTRAINTS = {
  minLength: 1,
  maxLength: 256,
  /** 禁止文字パターン（インジェクション対策） */
  forbiddenPattern: /[<>'";&|]/,
} as const;

/**
 * APIキー文字列スキーマ
 *
 * @see security-requirements.md NFR-SEC-004
 */
export const apiKeyStringSchema = z
  .string()
  .min(API_KEY_CONSTRAINTS.minLength, "APIキーを入力してください")
  .max(API_KEY_CONSTRAINTS.maxLength, "APIキーが長すぎます")
  .refine(
    (key) => !API_KEY_CONSTRAINTS.forbiddenPattern.test(key),
    "無効な文字が含まれています",
  );

/**
 * APIキー保存入力スキーマ
 */
export const apiKeySaveInputSchema = z.object({
  provider: aiProviderSchema,
  apiKey: apiKeyStringSchema,
  validateBeforeSave: z.boolean().optional().default(false),
});

/**
 * APIキー削除入力スキーマ
 */
export const apiKeyDeleteInputSchema = z.object({
  provider: aiProviderSchema,
});

/**
 * APIキー検証入力スキーマ
 */
export const apiKeyValidateInputSchema = z.object({
  provider: aiProviderSchema,
  apiKey: apiKeyStringSchema,
});

// ============================================================
// バリデーション関数
// ============================================================

/**
 * APIキーのフォーマットを検証
 *
 * @see auth.ts validateDisplayName パターン参照
 */
export function validateApiKeyFormat(
  apiKey: string,
): { valid: true } | { valid: false; message: string } {
  if (apiKey.length === 0) {
    return { valid: false, message: "APIキーを入力してください" };
  }
  if (apiKey.length > API_KEY_CONSTRAINTS.maxLength) {
    return { valid: false, message: "APIキーが長すぎます" };
  }
  if (API_KEY_CONSTRAINTS.forbiddenPattern.test(apiKey)) {
    return { valid: false, message: "無効な文字が含まれています" };
  }
  return { valid: true };
}

/**
 * プロバイダー固有のAPIキープレフィックスを検証（オプション）
 */
export function validateApiKeyPrefix(
  provider: AIProvider,
  apiKey: string,
): { valid: true } | { valid: false; message: string } {
  const meta = AI_PROVIDER_META[provider];
  if (meta.keyPrefix && !apiKey.startsWith(meta.keyPrefix)) {
    return {
      valid: false,
      message: `${meta.displayName}のAPIキーは「${meta.keyPrefix}」で始まる必要があります`,
    };
  }
  return { valid: true };
}

// ============================================================
// IPCチャネル定義
// ============================================================

/**
 * APIキー管理用IPCチャネル名
 */
export const API_KEY_IPC_CHANNELS = {
  SAVE: "apiKey:save",
  GET: "apiKey:get", // Main Process内部専用
  DELETE: "apiKey:delete",
  VALIDATE: "apiKey:validate",
  LIST: "apiKey:list",
} as const;

export type ApiKeyIpcChannel =
  (typeof API_KEY_IPC_CHANNELS)[keyof typeof API_KEY_IPC_CHANNELS];

/**
 * Preloadスクリプトで公開するAPIキー関連メソッド
 *
 * @note GET は公開しない（セキュリティ要件: NFR-SEC-008）
 */
export interface ApiKeyPreloadApi {
  save: (input: ApiKeySaveInput) => Promise<ApiKeySaveResponse>;
  delete: (input: ApiKeyDeleteInput) => Promise<ApiKeyDeleteResponse>;
  validate: (input: {
    provider: AIProvider;
    apiKey: string;
  }) => Promise<ApiKeyValidateResponse>;
  list: () => Promise<ApiKeyListResponse>;
}
