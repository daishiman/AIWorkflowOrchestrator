/**
 * APIキーストレージ
 *
 * AIプロバイダーのAPIキーを安全に保存・取得・削除
 * Electron の safeStorage API を使用して暗号化
 *
 * @see docs/30-workflows/api-key-management/architecture.md
 */

import { safeStorage } from "electron";
import Store from "electron-store";
import {
  AI_PROVIDERS,
  AI_PROVIDER_META,
  API_KEY_ERROR_CODES,
} from "@repo/shared/types/api-keys";
import type {
  AIProvider,
  ApiKeyEntry,
  ApiKeySaveResult,
  ApiKeyDeleteResult,
  ProviderListResult,
  ProviderStatus,
} from "@repo/shared/types/api-keys";

// ============================================================
// Constants
// ============================================================

const STORE_KEY = "apiKeys";

// ============================================================
// Store Type
// ============================================================

interface ApiKeyStoreSchema {
  apiKeys: Record<string, ApiKeyEntry>;
}

// ============================================================
// Lazy Store Initialization
// ============================================================

let store: Store<ApiKeyStoreSchema> | null = null;

function getStore(): Store<ApiKeyStoreSchema> {
  if (!store) {
    store = new Store<ApiKeyStoreSchema>({
      name: "api-keys",
      encryptionKey: "knowledge-studio-api-keys",
      defaults: {
        apiKeys: {},
      },
    });
  }
  return store;
}

// ============================================================
// Storage Interface
// ============================================================

/**
 * APIキーストレージインターフェース
 */
export interface ApiKeyStorage {
  /** APIキーを保存（暗号化） */
  saveApiKey(provider: AIProvider, apiKey: string): Promise<ApiKeySaveResult>;
  /** APIキーを取得（復号化）- Main Process内部専用 */
  getApiKey(provider: AIProvider): Promise<string | null>;
  /** APIキーを削除 */
  deleteApiKey(provider: AIProvider): Promise<ApiKeyDeleteResult>;
  /** 全プロバイダーのステータスを取得 */
  listProviders(): Promise<ProviderListResult>;
  /** 指定プロバイダーのAPIキーが登録済みか確認 */
  hasApiKey(provider: AIProvider): Promise<boolean>;
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * エラーメッセージからAPIキーを除去（セキュリティ対策）
 */
function sanitizeErrorMessage(error: unknown, apiKey?: string): string {
  const message = error instanceof Error ? error.message : "Unknown error";

  if (!apiKey) {
    return message;
  }

  // APIキーパターンを除去
  let sanitized = message;
  sanitized = sanitized.replace(new RegExp(apiKey, "g"), "[REDACTED]");
  sanitized = sanitized.replace(/sk-[a-zA-Z0-9]+/g, "[REDACTED]");
  sanitized = sanitized.replace(/sk-ant-[a-zA-Z0-9-]+/g, "[REDACTED]");
  sanitized = sanitized.replace(/xai-[a-zA-Z0-9]+/g, "[REDACTED]");

  return sanitized;
}

/**
 * 現在のISO 8601タイムスタンプを取得
 */
function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

// ============================================================
// Factory Function
// ============================================================

/**
 * ApiKeyStorage 実装を作成
 *
 * @returns ApiKeyStorage インターフェース
 */
export function createApiKeyStorage(): ApiKeyStorage {
  return {
    /**
     * APIキーを保存（暗号化）
     */
    saveApiKey: async (
      provider: AIProvider,
      apiKey: string,
    ): Promise<ApiKeySaveResult> => {
      try {
        const isEncryptionAvailable = safeStorage.isEncryptionAvailable();

        // 本番環境では暗号化必須
        if (!isEncryptionAvailable && process.env.NODE_ENV === "production") {
          return {
            success: false,
            errorCode: API_KEY_ERROR_CODES.ENCRYPTION_NOT_AVAILABLE,
            errorMessage: "Encryption is not available in production mode",
          };
        }

        let encryptedKey: string;

        try {
          if (isEncryptionAvailable) {
            const encrypted = safeStorage.encryptString(apiKey);
            encryptedKey = encrypted.toString("base64");
          } else {
            // 開発環境では平文保存（警告付き）
            console.warn(
              "[ApiKeyStorage] Encryption not available, storing in plain text (dev mode)",
            );
            encryptedKey = apiKey;
          }
        } catch (encryptError) {
          return {
            success: false,
            errorCode: API_KEY_ERROR_CODES.ENCRYPTION_FAILED,
            errorMessage: sanitizeErrorMessage(encryptError, apiKey),
          };
        }

        const now = getCurrentTimestamp();
        const existingKeys = getStore().get(STORE_KEY) || {};
        const existingEntry = existingKeys[provider];

        const entry: ApiKeyEntry = {
          provider,
          encryptedKey,
          createdAt: existingEntry?.createdAt || now,
          updatedAt: now,
          lastValidatedAt: existingEntry?.lastValidatedAt || null,
        };

        getStore().set(STORE_KEY, {
          ...existingKeys,
          [provider]: entry,
        });

        return { success: true };
      } catch (error) {
        return {
          success: false,
          errorCode: API_KEY_ERROR_CODES.SAVE_FAILED,
          errorMessage: sanitizeErrorMessage(error, apiKey),
        };
      }
    },

    /**
     * APIキーを取得（復号化）- Main Process内部専用
     *
     * @note このメソッドはRenderer側に公開しない（NFR-SEC-008）
     */
    getApiKey: async (provider: AIProvider): Promise<string | null> => {
      try {
        const keys = getStore().get(STORE_KEY) || {};
        const entry = keys[provider];

        if (!entry) {
          return null;
        }

        const isEncryptionAvailable = safeStorage.isEncryptionAvailable();

        if (isEncryptionAvailable) {
          try {
            const encrypted = Buffer.from(entry.encryptedKey, "base64");
            return safeStorage.decryptString(encrypted);
          } catch {
            // 復号化失敗時はnullを返す（ログにAPIキーを出さない）
            return null;
          }
        } else {
          // 開発環境では平文を返す
          return entry.encryptedKey;
        }
      } catch {
        return null;
      }
    },

    /**
     * APIキーを削除
     */
    deleteApiKey: async (provider: AIProvider): Promise<ApiKeyDeleteResult> => {
      try {
        const keys = getStore().get(STORE_KEY) || {};

        // キーが存在しなくても成功扱い（冪等性）
        if (!keys[provider]) {
          return { success: true };
        }

        const { [provider]: _, ...remainingKeys } = keys;
        getStore().set(STORE_KEY, remainingKeys);

        return { success: true };
      } catch (error) {
        return {
          success: false,
          errorCode: API_KEY_ERROR_CODES.DELETE_FAILED,
          errorMessage: sanitizeErrorMessage(error),
        };
      }
    },

    /**
     * 全プロバイダーのステータスを取得
     *
     * @note APIキーの値は含まない（NFR-SEC-008）
     */
    listProviders: async (): Promise<ProviderListResult> => {
      const keys = getStore().get(STORE_KEY) || {};

      const providers: ProviderStatus[] = AI_PROVIDERS.map((provider) => {
        const entry = keys[provider];
        const meta = AI_PROVIDER_META[provider];

        return {
          provider,
          displayName: meta.displayName,
          status: entry ? "registered" : "not_registered",
          lastValidatedAt: entry?.lastValidatedAt || null,
        };
      });

      const registeredCount = providers.filter(
        (p) => p.status === "registered",
      ).length;

      return {
        providers,
        registeredCount,
        totalCount: AI_PROVIDERS.length,
      };
    },

    /**
     * 指定プロバイダーのAPIキーが登録済みか確認
     */
    hasApiKey: async (provider: AIProvider): Promise<boolean> => {
      const keys = getStore().get(STORE_KEY) || {};
      return !!keys[provider];
    },
  };
}

// ============================================================
// Test Utilities
// ============================================================

/**
 * テスト用: ストアをクリア
 */
export function clearApiKeyStore(): void {
  getStore().clear();
}

/**
 * テスト用: ストアインスタンスをリセット
 */
export function resetApiKeyStore(): void {
  store = null;
}
