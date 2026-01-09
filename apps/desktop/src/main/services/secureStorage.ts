/**
 * @file SecureStorage Service for LLM API Keys
 * @description LLMプロバイダーのAPIキーを安全に保存・取得するサービス
 * @feature chat-multi-llm-switching
 */

import { safeStorage } from "electron";
import Store from "electron-store";
import type { LLMProviderId } from "@repo/shared/types/llm/schemas";

interface ApiKeyStoreSchema {
  apiKeys: Record<string, string>;
}

// 遅延初期化（テスト時にモックが間に合うように）
let store: Store<ApiKeyStoreSchema> | null = null;

function getStore(): Store<ApiKeyStoreSchema> {
  if (!store) {
    store = new Store<ApiKeyStoreSchema>({
      name: "llm-api-keys",
      encryptionKey: "knowledge-studio-llm-keys",
      defaults: {
        apiKeys: {},
      },
    });
  }
  return store;
}

/**
 * 暗号化してストレージキーを生成
 */
function getStorageKey(providerId: LLMProviderId): string {
  return `llm.${providerId}.apiKey`;
}

/**
 * SecureStorage - LLM API キー管理
 */
export const SecureStorage = {
  /**
   * APIキーを安全に保存
   */
  async setApiKey(providerId: LLMProviderId, apiKey: string): Promise<void> {
    try {
      const key = getStorageKey(providerId);
      const apiKeys = getStore().get("apiKeys") || {};

      if (safeStorage.isEncryptionAvailable()) {
        const encrypted = safeStorage.encryptString(apiKey);
        apiKeys[key] = encrypted.toString("base64");
      } else {
        // 暗号化が利用できない場合は警告を出して平文で保存（開発環境向け）
        console.warn(
          "[SecureStorage] Encryption not available, storing API key in plain text",
        );
        apiKeys[key] = apiKey;
      }

      getStore().set("apiKeys", apiKeys);
    } catch (error) {
      console.error("[SecureStorage] Failed to store API key:", error);
      throw error;
    }
  },

  /**
   * APIキーを取得
   */
  async getApiKey(providerId: LLMProviderId): Promise<string | null> {
    try {
      const key = getStorageKey(providerId);
      const apiKeys = getStore().get("apiKeys") || {};
      const stored = apiKeys[key];

      if (!stored) {
        return null;
      }

      if (safeStorage.isEncryptionAvailable()) {
        try {
          const encrypted = Buffer.from(stored, "base64");
          return safeStorage.decryptString(encrypted);
        } catch {
          // 復号化に失敗した場合は平文として返す（フォールバック）
          return stored;
        }
      } else {
        return stored;
      }
    } catch (error) {
      console.error("[SecureStorage] Failed to retrieve API key:", error);
      return null;
    }
  },

  /**
   * APIキーを削除
   */
  async deleteApiKey(providerId: LLMProviderId): Promise<void> {
    try {
      const key = getStorageKey(providerId);
      const apiKeys = getStore().get("apiKeys") || {};
      delete apiKeys[key];
      getStore().set("apiKeys", apiKeys);
    } catch (error) {
      console.error("[SecureStorage] Failed to delete API key:", error);
      throw error;
    }
  },

  /**
   * 全APIキーをクリア
   */
  async clearAllApiKeys(): Promise<void> {
    try {
      getStore().set("apiKeys", {});
    } catch (error) {
      console.error("[SecureStorage] Failed to clear API keys:", error);
      throw error;
    }
  },

  /**
   * APIキーが設定されているか確認
   */
  async hasApiKey(providerId: LLMProviderId): Promise<boolean> {
    const apiKey = await SecureStorage.getApiKey(providerId);
    return apiKey !== null && apiKey.length > 0;
  },
};

/**
 * テスト用: ストアをクリア
 */
export function clearSecureStore(): void {
  getStore().clear();
}

/**
 * テスト用: ストアインスタンスをリセット
 */
export function resetSecureStore(): void {
  store = null;
}
