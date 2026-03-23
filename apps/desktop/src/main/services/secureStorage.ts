/**
 * @file SecureStorage Service for LLM API Keys
 * @description LLM 実行経路は Settings の API キーストアを単一正本として参照する
 * @feature chat-multi-llm-switching
 */

import type { AIProvider } from "@repo/shared/types/api-keys";
import type { LLMProviderId } from "@repo/shared/types/llm/schemas";
import {
  createApiKeyStorage,
  clearApiKeyStore,
  resetApiKeyStore,
} from "../infrastructure/apiKeyStorage";

const apiKeyStorage = createApiKeyStorage();
const ALL_PROVIDERS: LLMProviderId[] = [
  "openai",
  "anthropic",
  "google",
  "xai",
  "openrouter",
];

function toAIProvider(providerId: LLMProviderId): AIProvider {
  // LLMProviderId は AIProvider のスーパーセット（"openrouter" 追加分）
  // apiKeyStorage は文字列キーで保存するため、実行時の互換性は保証される
  return providerId as AIProvider;
}

/**
 * SecureStorage - LLM API キー管理
 *
 * Note:
 * - `api-keys` ストアを単一正本として利用する。
 * - 既存の LLM 呼び出し側 API を保つため、Facade として公開する。
 */
export const SecureStorage = {
  async setApiKey(providerId: LLMProviderId, apiKey: string): Promise<void> {
    const result = await apiKeyStorage.saveApiKey(
      toAIProvider(providerId),
      apiKey,
    );
    if (!result.success) {
      throw new Error(result.errorMessage ?? "Failed to save API key");
    }
  },

  async getApiKey(providerId: LLMProviderId): Promise<string | null> {
    return apiKeyStorage.getApiKey(toAIProvider(providerId));
  },

  async deleteApiKey(providerId: LLMProviderId): Promise<void> {
    const result = await apiKeyStorage.deleteApiKey(toAIProvider(providerId));
    if (!result.success) {
      throw new Error(result.errorMessage ?? "Failed to delete API key");
    }
  },

  async clearAllApiKeys(): Promise<void> {
    await Promise.all(
      ALL_PROVIDERS.map((providerId) =>
        apiKeyStorage.deleteApiKey(toAIProvider(providerId)),
      ),
    );
  },

  async hasApiKey(providerId: LLMProviderId): Promise<boolean> {
    return apiKeyStorage.hasApiKey(toAIProvider(providerId));
  },
};

/**
 * テスト用: ストアをクリア
 */
export function clearSecureStore(): void {
  clearApiKeyStore();
}

/**
 * テスト用: ストアインスタンスをリセット
 */
export function resetSecureStore(): void {
  resetApiKeyStore();
}
