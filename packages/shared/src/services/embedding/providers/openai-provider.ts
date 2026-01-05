/**
 * OpenAI埋め込みプロバイダー
 *
 * @description text-embedding-3-large / text-embedding-3-small に対応
 */

import OpenAI from "openai";
import { encoding_for_model, type TiktokenModel } from "tiktoken";
import type {
  EmbeddingModelId,
  ProviderName,
  ProviderConfig,
  EmbedOptions,
} from "../types/embedding.types";
import type { RateLimiter } from "../utils/rate-limiter";
import type { CircuitBreaker } from "../utils/circuit-breaker";
import type { RetryHandler } from "../utils/retry-handler";
import type { MetricsCollector } from "../utils/metrics-collector";
import { BaseEmbeddingProvider } from "./base-embedding-provider";
import { ProviderError } from "../types/errors";

/**
 * OpenAI埋め込みプロバイダー
 */
export class OpenAIEmbeddingProvider extends BaseEmbeddingProvider {
  readonly modelId: EmbeddingModelId = "EMB-002";
  readonly providerName: ProviderName = "openai";
  readonly dimensions: number = 3072;
  readonly maxTokens: number = 8191;

  private client: OpenAI;
  private modelName: "text-embedding-3-large" | "text-embedding-3-small";

  constructor(
    config: ProviderConfig,
    rateLimiter: RateLimiter,
    circuitBreaker: CircuitBreaker,
    retryHandler: RetryHandler,
    metricsCollector: MetricsCollector,
    modelName:
      | "text-embedding-3-large"
      | "text-embedding-3-small" = "text-embedding-3-large",
  ) {
    super(config, rateLimiter, circuitBreaker, retryHandler, metricsCollector);

    this.modelName = modelName;

    try {
      this.client = new OpenAI({
        apiKey: config.apiKey || process.env.OPENAI_API_KEY,
        timeout: config.timeout,
      });
    } catch (error) {
      throw new ProviderError(
        `Failed to initialize OpenAI client: ${error instanceof Error ? error.message : String(error)}`,
        "openai",
        { cause: error },
      );
    }
  }

  /**
   * 内部埋め込み生成
   *
   * @param text - 埋め込み対象テキスト
   * @param options - 埋め込みオプション
   * @returns 埋め込みベクトル
   */
  protected async embedInternal(
    text: string,
    options?: EmbedOptions,
  ): Promise<number[]> {
    try {
      const response = await this.client.embeddings.create({
        model: this.modelName,
        input: text,
        dimensions: options?.dimensions || this.dimensions,
        encoding_format: "float",
      });

      if (!response.data || response.data.length === 0) {
        throw new Error("Empty response from OpenAI API");
      }

      return response.data[0].embedding;
    } catch (error) {
      throw new ProviderError(
        `OpenAI API error: ${error instanceof Error ? error.message : String(error)}`,
        "openai",
        { cause: error },
      );
    }
  }

  /**
   * トークン数をカウント
   *
   * @param text - カウント対象テキスト
   * @returns トークン数
   */
  countTokens(text: string): number {
    try {
      const encoder = encoding_for_model(this.modelName as TiktokenModel);
      const tokens = encoder.encode(text);
      const count = tokens.length;
      encoder.free();
      return count;
    } catch (error) {
      // tiktokenが失敗した場合は簡易計算にフォールバック
      console.warn(
        `Failed to use tiktoken, falling back to simple estimation: ${error}`,
      );
      return Math.ceil(text.length / 4);
    }
  }

  /**
   * デフォルトバッチサイズを取得
   *
   * @returns デフォルトバッチサイズ
   */
  protected getDefaultBatchSize(): number {
    return 100;
  }

  /**
   * デフォルト並列度を取得
   *
   * @returns デフォルト並列度
   */
  protected getDefaultConcurrency(): number {
    return 5;
  }
}
