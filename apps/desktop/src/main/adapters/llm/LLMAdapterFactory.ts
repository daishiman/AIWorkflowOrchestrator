/**
 * @file LLMAdapterFactory
 * @description LLMアダプターのファクトリークラス
 * @feature chat-multi-llm-switching
 *
 * シングルトンパターンでアダプターインスタンスをキャッシュし、
 * APIキー変更時は clearInstance() でキャッシュをクリアする
 */

import type { LLMProviderId } from "@repo/shared/types/llm/schemas";
import type { ILLMAdapter, LLMAdapterConfig } from "./types";
import {
  OpenAICompatibleAdapter,
  type OpenAICompatibleProviderConfig,
} from "./OpenAICompatibleAdapter";
import { AnthropicAdapter } from "./AnthropicAdapter";
import { GoogleAdapter } from "./GoogleAdapter";
import { SecureStorage } from "@/main/services/secureStorage";

/**
 * アダプターファクトリ関数型
 */
type AdapterFactory = (
  apiKey: string,
  config?: Partial<Omit<LLMAdapterConfig, "apiKey">>,
) => ILLMAdapter;

/**
 * OpenAI互換プロバイダーの設定マップ
 * 新しいOpenAI互換プロバイダーはここに追加するだけで対応可能
 */
const OPENAI_COMPATIBLE_CONFIGS: Record<
  string,
  OpenAICompatibleProviderConfig
> = {
  openai: {
    providerId: "openai",
    defaultBaseUrl: "https://api.openai.com/v1",
  },
  xai: {
    providerId: "xai",
    defaultBaseUrl: "https://api.x.ai/v1",
  },
  openrouter: {
    providerId: "openrouter",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    extraHeaders: {
      "HTTP-Referer": "https://aiworkflow.app",
      "X-Title": "AIWorkflowOrchestrator",
    },
  },
};

/**
 * サポートされるプロバイダーIDのリスト
 */
const SUPPORTED_PROVIDER_IDS: LLMProviderId[] = [
  "openai",
  "anthropic",
  "google",
  "xai",
  "openrouter",
];

/**
 * LLMAdapterFactory
 * アダプターの作成・キャッシュ管理を行うファクトリー
 */
class LLMAdapterFactoryImpl {
  private readonly factories = new Map<LLMProviderId, AdapterFactory>();
  private readonly instances = new Map<LLMProviderId, ILLMAdapter>();

  constructor() {
    // OpenAI互換プロバイダーを設定駆動で一括登録
    for (const [id, providerConfig] of Object.entries(
      OPENAI_COMPATIBLE_CONFIGS,
    )) {
      this.register(
        id as LLMProviderId,
        (apiKey, config) =>
          new OpenAICompatibleAdapter(providerConfig, apiKey, config),
      );
    }

    // 独自API形式のプロバイダーは個別アダプターで登録
    this.register(
      "anthropic",
      (apiKey, config) => new AnthropicAdapter(apiKey, config),
    );
    this.register(
      "google",
      (apiKey, config) => new GoogleAdapter(apiKey, config),
    );
  }

  /**
   * アダプターファクトリを登録
   */
  register(providerId: LLMProviderId, factory: AdapterFactory): void {
    this.factories.set(providerId, factory);
    // 既存インスタンスをクリア（再登録時用）
    this.instances.delete(providerId);
  }

  /**
   * アダプターインスタンスを取得
   * シングルトンパターン（APIキー変更時は clearInstance() を呼ぶ）
   */
  async getAdapter(providerId: LLMProviderId): Promise<ILLMAdapter> {
    // キャッシュ確認
    const cached = this.instances.get(providerId);
    if (cached) {
      return cached;
    }

    // ファクトリ取得
    const factory = this.factories.get(providerId);
    if (!factory) {
      throw new Error(`Unknown provider: ${providerId}`);
    }

    // APIキー取得
    const apiKey = await SecureStorage.getApiKey(providerId);
    if (!apiKey || apiKey.length === 0) {
      throw new Error(`API key not found for provider: ${providerId}`);
    }

    // インスタンス生成
    const adapter = factory(apiKey);
    this.instances.set(providerId, adapter);

    return adapter;
  }

  /**
   * APIキーが設定されているか確認
   */
  async hasApiKey(providerId: LLMProviderId): Promise<boolean> {
    const apiKey = await SecureStorage.getApiKey(providerId);
    return apiKey !== null && apiKey.length > 0;
  }

  /**
   * サポートされる全プロバイダーIDを取得
   */
  getAllProviderIds(): LLMProviderId[] {
    return [...SUPPORTED_PROVIDER_IDS];
  }

  /**
   * 特定プロバイダーのキャッシュをクリア（APIキー変更時）
   */
  clearInstance(providerId: LLMProviderId): void {
    this.instances.delete(providerId);
  }

  /**
   * 全キャッシュをクリア
   */
  clearAllInstances(): void {
    this.instances.clear();
  }
}

/**
 * LLMAdapterFactory シングルトンインスタンス
 */
export const LLMAdapterFactory = new LLMAdapterFactoryImpl();
