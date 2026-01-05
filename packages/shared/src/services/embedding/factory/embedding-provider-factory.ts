/**
 * 埋め込みプロバイダーファクトリー
 *
 * @description プロバイダーの動的生成とレート制限設定を提供
 */

import type {
  EmbeddingModelId,
  ProviderConfig,
  RateLimitConfig,
  CircuitBreakerConfig,
} from "../types/embedding.types";
import type { IEmbeddingProvider } from "../providers/interfaces";
import { OpenAIEmbeddingProvider } from "../providers/openai-provider";
import { Qwen3EmbeddingProvider } from "../providers/qwen3-provider";
import { RateLimiter } from "../utils/rate-limiter";
import { CircuitBreaker } from "../utils/circuit-breaker";
import { RetryHandler, DEFAULT_RETRY_OPTIONS } from "../utils/retry-handler";
import { MetricsCollector } from "../utils/metrics-collector";

/**
 * 埋め込みプロバイダーファクトリー
 */
export class EmbeddingProviderFactory {
  /**
   * プロバイダーを生成
   *
   * @param modelId - モデルID
   * @param config - プロバイダー設定
   * @param rateLimitConfig - レート制限設定（省略時はモデルIDから取得）
   * @param circuitBreakerConfig - Circuit Breaker設定（省略時はデフォルト）
   * @param metricsCollector - メトリクス収集（省略時は新規作成）
   * @returns プロバイダーインスタンス
   */
  static createProvider(
    modelId: EmbeddingModelId,
    config: ProviderConfig,
    rateLimitConfig?: RateLimitConfig,
    circuitBreakerConfig?: CircuitBreakerConfig,
    metricsCollector?: MetricsCollector,
  ): IEmbeddingProvider {
    // デフォルト設定を取得
    const rateLimitCfg = rateLimitConfig || this.getRateLimitConfig(modelId);
    const circuitBreakerCfg =
      circuitBreakerConfig || this.getDefaultCircuitBreakerConfig();
    const metrics = metricsCollector || new MetricsCollector();

    // ユーティリティクラスのインスタンスを作成
    const rateLimiter = new RateLimiter(rateLimitCfg);
    const circuitBreaker = new CircuitBreaker(circuitBreakerCfg);
    const retryHandler = new RetryHandler(DEFAULT_RETRY_OPTIONS);

    // モデルIDに応じてプロバイダーを生成
    switch (modelId) {
      case "EMB-001":
        // Qwen3EmbeddingProvider
        return new Qwen3EmbeddingProvider(
          config,
          rateLimiter,
          circuitBreaker,
          retryHandler,
          metrics,
        );

      case "EMB-002":
        // OpenAIEmbeddingProvider
        return new OpenAIEmbeddingProvider(
          config,
          rateLimiter,
          circuitBreaker,
          retryHandler,
          metrics,
        );

      case "EMB-003":
        // VoyageEmbeddingProvider（将来実装）
        throw new Error(
          `Provider for model ${modelId} (Voyage) is not yet implemented`,
        );

      case "EMB-004":
        // BGEM3Provider（将来実装）
        throw new Error(
          `Provider for model ${modelId} (BGE-M3) is not yet implemented`,
        );

      case "EMB-005":
        // EmbeddingGemmaProvider（将来実装）
        throw new Error(
          `Provider for model ${modelId} (Embedding-Gemma) is not yet implemented`,
        );

      default: {
        const _exhaustiveCheck: never = modelId;
        throw new Error(`Unknown model ID: ${_exhaustiveCheck}`);
      }
    }
  }

  /**
   * レート制限設定を取得
   *
   * @param modelId - モデルID
   * @returns レート制限設定
   */
  static getRateLimitConfig(modelId: EmbeddingModelId): RateLimitConfig {
    const configs: Record<EmbeddingModelId, RateLimitConfig> = {
      "EMB-001": { requestsPerMinute: 500, tokensPerMinute: 500000 },
      "EMB-002": { requestsPerMinute: 3000, tokensPerMinute: 1000000 },
      "EMB-003": { requestsPerMinute: 300, tokensPerMinute: 1000000 },
      "EMB-004": { requestsPerMinute: Infinity, tokensPerMinute: Infinity },
      "EMB-005": { requestsPerMinute: Infinity, tokensPerMinute: Infinity },
    };

    return configs[modelId];
  }

  /**
   * デフォルトCircuit Breaker設定を取得
   *
   * @returns Circuit Breaker設定
   */
  static getDefaultCircuitBreakerConfig(): CircuitBreakerConfig {
    return {
      errorThreshold: 5,
      timeout: 30000,
      resetTimeout: 60000,
    };
  }

  /**
   * 複数プロバイダーをバッチ生成
   *
   * @param modelIds - モデルID配列
   * @param configMap - モデルIDごとの設定マップ
   * @param sharedMetrics - 共有メトリクス収集（省略時は新規作成）
   * @returns プロバイダーインスタンス配列
   */
  static createProviders(
    modelIds: EmbeddingModelId[],
    configMap: Map<EmbeddingModelId, ProviderConfig>,
    sharedMetrics?: MetricsCollector,
  ): IEmbeddingProvider[] {
    const metrics = sharedMetrics || new MetricsCollector();

    return modelIds.map((modelId) => {
      const config = configMap.get(modelId);
      if (!config) {
        throw new Error(`No config found for model ${modelId}`);
      }

      return this.createProvider(
        modelId,
        config,
        undefined,
        undefined,
        metrics,
      );
    });
  }
}
