/**
 * 埋め込みプロバイダー基底クラス
 *
 * @description 共通機能を提供し、テンプレートメソッドパターンを実装
 */

import type {
  EmbeddingModelId,
  ProviderName,
  ProviderConfig,
  EmbedOptions,
  BatchEmbedOptions,
  EmbeddingResult,
  BatchEmbeddingResult,
} from "../types/embedding.types";
import type { IEmbeddingProvider } from "./interfaces";
import { RateLimiter } from "../utils/rate-limiter";
import { CircuitBreaker } from "../utils/circuit-breaker";
import { RetryHandler } from "../utils/retry-handler";
import { MetricsCollector } from "../utils/metrics-collector";
import { EmbeddingError, TokenLimitError } from "../types/errors";
import { sleep } from "../utils/async-utils";

/**
 * 埋め込みプロバイダー基底クラス
 */
export abstract class BaseEmbeddingProvider implements IEmbeddingProvider {
  abstract readonly modelId: EmbeddingModelId;
  abstract readonly providerName: ProviderName;
  abstract readonly dimensions: number;
  abstract readonly maxTokens: number;

  protected rateLimiter: RateLimiter;
  protected circuitBreaker: CircuitBreaker;
  protected retryHandler: RetryHandler;
  protected metricsCollector: MetricsCollector;

  constructor(
    protected config: ProviderConfig,
    rateLimiter: RateLimiter,
    circuitBreaker: CircuitBreaker,
    retryHandler: RetryHandler,
    metricsCollector: MetricsCollector,
  ) {
    this.rateLimiter = rateLimiter;
    this.circuitBreaker = circuitBreaker;
    this.retryHandler = retryHandler;
    this.metricsCollector = metricsCollector;
  }

  /**
   * 埋め込み生成（テンプレートメソッド）
   *
   * @param text - 埋め込み対象テキスト
   * @param options - 埋め込みオプション
   * @returns 埋め込み結果
   */
  async embed(text: string, options?: EmbedOptions): Promise<EmbeddingResult> {
    const startTime = Date.now();

    try {
      // トークン数カウント
      const tokenCount = this.countTokens(text);

      // 最大トークン数チェック
      if (tokenCount > this.maxTokens) {
        throw new TokenLimitError(
          `Text exceeds max tokens: ${tokenCount} > ${this.maxTokens}`,
          tokenCount,
          this.maxTokens,
        );
      }

      // レート制限チェック
      await this.rateLimiter.acquire(1, tokenCount);

      // Circuit Breakerで保護された実行
      const embedding = await this.circuitBreaker.execute(() =>
        this.retryHandler.retry(
          () => this.embedInternal(text, options),
          options?.retry,
        ),
      );

      const processingTimeMs = Date.now() - startTime;

      // メトリクス記録
      this.metricsCollector.recordEmbedding({
        modelId: this.modelId,
        tokenCount,
        processingTimeMs,
        success: true,
      });

      return {
        embedding,
        tokenCount,
        model: String(this.modelId),
        processingTimeMs,
      };
    } catch (err) {
      const processingTimeMs = Date.now() - startTime;

      // エラーメトリクス記録
      this.metricsCollector.recordEmbedding({
        modelId: this.modelId,
        tokenCount: 0,
        processingTimeMs,
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });

      throw new EmbeddingError(
        `Embedding failed for model ${this.modelId}: ${err instanceof Error ? err.message : String(err)}`,
        { cause: err },
      );
    }
  }

  /**
   * バッチ埋め込み生成
   *
   * @param texts - 埋め込み対象テキスト配列
   * @param options - バッチ埋め込みオプション
   * @returns バッチ埋め込み結果
   */
  async embedBatch(
    texts: string[],
    options?: BatchEmbedOptions,
  ): Promise<BatchEmbeddingResult> {
    const startTime = Date.now();
    const batchSize = options?.batchSize || this.getDefaultBatchSize();
    const concurrency = options?.concurrency || this.getDefaultConcurrency();
    const delayMs = options?.delayBetweenBatches || 0;

    const embeddings: EmbeddingResult[] = [];
    const errors: Array<{ index: number; error: string }> = [];
    let processedCount = 0;

    // バッチに分割
    const batches: string[][] = [];
    for (let i = 0; i < texts.length; i += batchSize) {
      batches.push(texts.slice(i, i + batchSize));
    }

    // 並列実行
    const batchPromises = batches.map(async (batch, batchIndex) => {
      // バッチ間の遅延
      if (batchIndex > 0 && delayMs > 0) {
        await sleep(delayMs);
      }

      // バッチ内の並列処理
      const batchResults = await Promise.allSettled(
        batch.map((text, indexInBatch) =>
          this.embed(text, options).then((result) => ({
            globalIndex: batchIndex * batchSize + indexInBatch,
            result,
          })),
        ),
      );

      // 結果の集約
      for (const outcome of batchResults) {
        if (outcome.status === "fulfilled") {
          embeddings[outcome.value.globalIndex] = outcome.value.result;
        } else {
          const globalIndex =
            batchIndex * batchSize + batchResults.indexOf(outcome);
          errors.push({
            index: globalIndex,
            error:
              outcome.reason instanceof Error
                ? outcome.reason.message
                : String(outcome.reason),
          });
        }
      }

      processedCount += batch.length;
      options?.onProgress?.(processedCount, texts.length);
    });

    // 並列度制御
    await this.executeWithConcurrency(batchPromises, concurrency);

    const totalTokens = embeddings.reduce(
      (sum, emb) => sum + (emb?.tokenCount || 0),
      0,
    );
    const totalProcessingTimeMs = Date.now() - startTime;

    return {
      embeddings,
      errors,
      totalTokens,
      totalProcessingTimeMs,
    };
  }

  /**
   * 内部埋め込み生成（サブクラスで実装）
   *
   * @param text - 埋め込み対象テキスト
   * @param options - 埋め込みオプション
   * @returns 埋め込みベクトル
   */
  protected abstract embedInternal(
    text: string,
    options?: EmbedOptions,
  ): Promise<number[]>;

  /**
   * トークン数カウント（サブクラスで実装）
   *
   * @param text - カウント対象テキスト
   * @returns トークン数
   */
  abstract countTokens(text: string): number;

  /**
   * ヘルスチェック
   *
   * @returns ヘルスチェック成功時true
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testText = "health check";
      await this.embed(testText, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * デフォルトバッチサイズを取得
   *
   * @returns デフォルトバッチサイズ
   */
  protected abstract getDefaultBatchSize(): number;

  /**
   * デフォルト並列度を取得
   *
   * @returns デフォルト並列度
   */
  protected abstract getDefaultConcurrency(): number;

  /**
   * 並列度制御付き実行
   *
   * @param promises - 実行するPromise配列
   * @param concurrency - 並列度
   */
  private async executeWithConcurrency<T>(
    promises: Promise<T>[],
    concurrency: number,
  ): Promise<void> {
    const executing: Promise<void>[] = [];

    for (const promise of promises) {
      const p = promise.then(() => {
        executing.splice(executing.indexOf(p), 1);
      });

      executing.push(p);

      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);
  }
}
