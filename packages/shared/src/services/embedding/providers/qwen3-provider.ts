/**
 * Qwen3埋め込みプロバイダー
 *
 * @description DashScope API経由でQwen3-Embedding-8Bを使用
 * MTEB多言語1位の高精度埋め込みモデル
 */

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
import { ProviderError, TimeoutError } from "../types/errors";

/**
 * DashScope APIレスポンス型
 */
interface DashScopeEmbeddingResponse {
  output: {
    embeddings: Array<{
      embedding: number[];
      text_index: number;
    }>;
  };
  usage: {
    total_tokens: number;
  };
  request_id: string;
}

/**
 * DashScope APIエラーレスポンス型
 */
interface DashScopeErrorResponse {
  code: string;
  message: string;
  request_id: string;
}

/**
 * Qwen3埋め込みプロバイダー
 */
export class Qwen3EmbeddingProvider extends BaseEmbeddingProvider {
  readonly modelId: EmbeddingModelId = "EMB-001";
  readonly providerName: ProviderName = "dashscope";
  readonly dimensions: number = 4096;
  readonly maxTokens: number = 8192;

  private apiKey: string;
  private apiEndpoint: string;

  constructor(
    config: ProviderConfig,
    rateLimiter: RateLimiter,
    circuitBreaker: CircuitBreaker,
    retryHandler: RetryHandler,
    metricsCollector: MetricsCollector,
  ) {
    super(config, rateLimiter, circuitBreaker, retryHandler, metricsCollector);

    this.apiKey = config.apiKey || process.env.DASHSCOPE_API_KEY || "";
    this.apiEndpoint =
      config.apiEndpoint ||
      "https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding";

    if (!this.apiKey) {
      throw new ProviderError(
        "DashScope API key is required. Set DASHSCOPE_API_KEY environment variable or provide apiKey in config.",
        "dashscope",
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
    const timeout = options?.timeout || this.config.timeout || 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "qwen3-embedding-8b",
          input: {
            texts: [text],
          },
          parameters: {
            dimension: options?.dimensions || this.dimensions,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = (await response.json()) as DashScopeErrorResponse;
        throw new ProviderError(
          `DashScope API error: ${response.status} ${response.statusText} - ${errorBody.message || "Unknown error"}`,
          "dashscope",
        );
      }

      const data = (await response.json()) as DashScopeEmbeddingResponse;

      if (
        !data.output ||
        !data.output.embeddings ||
        data.output.embeddings.length === 0
      ) {
        throw new ProviderError(
          "Empty response from DashScope API",
          "dashscope",
        );
      }

      return data.output.embeddings[0].embedding;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        throw new TimeoutError(
          `DashScope API request timed out after ${timeout}ms`,
          timeout,
        );
      }

      if (error instanceof ProviderError || error instanceof TimeoutError) {
        throw error;
      }

      throw new ProviderError(
        `DashScope API error: ${error instanceof Error ? error.message : String(error)}`,
        "dashscope",
        { cause: error },
      );
    }
  }

  /**
   * トークン数をカウント
   *
   * Qwen3のトークナイザーを使用（簡略化実装）
   * 実際には Qwen のトークナイザーを使用すべきだが、
   * 依存関係を減らすため簡易計算を使用
   *
   * @param text - カウント対象テキスト
   * @returns トークン数
   */
  countTokens(text: string): number {
    // Qwen3のトークナイザーの特性に基づく簡易計算
    // 日本語・中国語は約1.5文字/トークン、英語は約4文字/トークン
    // 混合テキストの場合は平均的な値を使用

    // Unicode カテゴリで言語を判定
    const cjkPattern = /[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g;
    const cjkMatches = text.match(cjkPattern);
    const cjkCount = cjkMatches ? cjkMatches.length : 0;
    const otherCount = text.length - cjkCount;

    // CJK文字は約1.5文字/トークン、その他は約4文字/トークン
    const estimatedTokens =
      Math.ceil(cjkCount / 1.5) + Math.ceil(otherCount / 4);

    return Math.max(1, estimatedTokens);
  }

  /**
   * デフォルトバッチサイズを取得
   *
   * @returns デフォルトバッチサイズ
   */
  protected getDefaultBatchSize(): number {
    return 50;
  }

  /**
   * デフォルト並列度を取得
   *
   * @returns デフォルト並列度
   */
  protected getDefaultConcurrency(): number {
    return 3;
  }
}
