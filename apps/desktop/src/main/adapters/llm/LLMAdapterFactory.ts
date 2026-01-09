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
import { OpenAIAdapter } from "./OpenAIAdapter";
import { AnthropicAdapter } from "./AnthropicAdapter";
import { GoogleAdapter } from "./GoogleAdapter";
import { xAIAdapter } from "./xAIAdapter";
import { SecureStorage } from "@/main/services/secureStorage";

/**
 * アダプターファクトリ関数型
 */
type AdapterFactory = (
  apiKey: string,
  config?: Partial<Omit<LLMAdapterConfig, "apiKey">>,
) => ILLMAdapter;

/**
 * サポートされるプロバイダーIDのリスト
 */
const SUPPORTED_PROVIDER_IDS: LLMProviderId[] = [
  "openai",
  "anthropic",
  "google",
  "xai",
];

/**
 * LLMAdapterFactory
 * アダプターの作成・キャッシュ管理を行うファクトリー
 */
class LLMAdapterFactoryImpl {
  private readonly factories = new Map<LLMProviderId, AdapterFactory>();
  private readonly instances = new Map<LLMProviderId, ILLMAdapter>();

  constructor() {
    // デフォルトアダプターを登録
    this.register(
      "openai",
      (apiKey, config) => new OpenAIAdapter(apiKey, config),
    );
    this.register(
      "anthropic",
      (apiKey, config) => new AnthropicAdapter(apiKey, config),
    );
    this.register(
      "google",
      (apiKey, config) => new GoogleAdapter(apiKey, config),
    );
    this.register("xai", (apiKey, config) => new xAIAdapter(apiKey, config));
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
