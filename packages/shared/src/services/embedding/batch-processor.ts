/**
 * 埋め込みバッチプロセッサー
 *
 * @description 大量のテキストを効率的にバッチ処理し、レート制限に対応
 */

import type {
  EmbeddingModelId as _EmbeddingModelId,
  EmbedOptions,
  EmbeddingResult,
  RateLimitConfig,
} from "./types/embedding.types";
import type { IEmbeddingProvider } from "./providers/interfaces";
import { RateLimiter } from "./utils/rate-limiter";
import { RetryHandler, DEFAULT_RETRY_OPTIONS } from "./utils/retry-handler";
import { MetricsCollector } from "./utils/metrics-collector";
import {
  RateLimitError,
  EmbeddingError as _EmbeddingError,
} from "./types/errors";
import { sleep } from "./utils/async-utils";

/**
 * バッチ処理設定
 */
export interface BatchProcessorConfig {
  /** バッチサイズ（デフォルト: 100） */
  batchSize: number;
  /** 並列度（デフォルト: 5） */
  concurrency: number;
  /** バッチ間の遅延（ミリ秒、デフォルト: 100） */
  delayBetweenBatches: number;
  /** 適応型バッチサイズ有効化（デフォルト: true） */
  adaptiveBatchSize: boolean;
  /** 最小バッチサイズ（デフォルト: 10） */
  minBatchSize: number;
  /** 最大リトライ回数（デフォルト: 3） */
  maxRetries: number;
  /** リトライ初期遅延（ミリ秒、デフォルト: 1000） */
  retryInitialDelay: number;
  /** リトライ最大遅延（ミリ秒、デフォルト: 30000） */
  retryMaxDelay: number;
}

/**
 * バッチ処理結果
 */
export interface BatchProcessResult {
  /** 成功した埋め込み結果 */
  embeddings: Array<{
    index: number;
    result: EmbeddingResult;
  }>;
  /** 失敗したインデックスとエラー */
  errors: Array<{
    index: number;
    error: string;
    retryable: boolean;
  }>;
  /** 統計情報 */
  stats: {
    /** 総処理時間（ミリ秒） */
    totalTimeMs: number;
    /** 総トークン数 */
    totalTokens: number;
    /** 成功数 */
    successCount: number;
    /** 失敗数 */
    failureCount: number;
    /** バッチ数 */
    batchCount: number;
    /** リトライ数 */
    retryCount: number;
    /** 最終バッチサイズ（適応型の場合） */
    finalBatchSize: number;
  };
}

/**
 * バッチ処理進捗コールバック
 */
export type BatchProgressCallback = (progress: {
  processed: number;
  total: number;
  successCount: number;
  failureCount: number;
  currentBatchSize: number;
}) => void;

/**
 * デフォルトバッチ処理設定
 */
export const DEFAULT_BATCH_CONFIG: BatchProcessorConfig = {
  batchSize: 100,
  concurrency: 5,
  delayBetweenBatches: 100,
  adaptiveBatchSize: true,
  minBatchSize: 10,
  maxRetries: 3,
  retryInitialDelay: 1000,
  retryMaxDelay: 30000,
};

/**
 * 埋め込みバッチプロセッサー
 */
export class EmbeddingBatchProcessor {
  private config: BatchProcessorConfig;
  private rateLimiter: RateLimiter;
  private retryHandler: RetryHandler;
  private metricsCollector: MetricsCollector;
  private currentBatchSize: number;

  constructor(
    private provider: IEmbeddingProvider,
    rateLimitConfig: RateLimitConfig,
    config: Partial<BatchProcessorConfig> = {},
    metricsCollector?: MetricsCollector,
  ) {
    this.config = { ...DEFAULT_BATCH_CONFIG, ...config };
    this.currentBatchSize = this.config.batchSize;
    this.rateLimiter = new RateLimiter(rateLimitConfig);
    this.retryHandler = new RetryHandler({
      ...DEFAULT_RETRY_OPTIONS,
      maxRetries: this.config.maxRetries,
      initialDelayMs: this.config.retryInitialDelay,
      maxDelayMs: this.config.retryMaxDelay,
    });
    this.metricsCollector = metricsCollector || new MetricsCollector();
  }

  /**
   * テキスト配列をバッチ処理
   *
   * @param texts - 処理対象テキスト配列
   * @param options - 埋め込みオプション
   * @param onProgress - 進捗コールバック
   * @returns バッチ処理結果
   */
  async process(
    texts: string[],
    options?: EmbedOptions,
    onProgress?: BatchProgressCallback,
  ): Promise<BatchProcessResult> {
    const startTime = Date.now();

    const embeddings: BatchProcessResult["embeddings"] = [];
    const errors: BatchProcessResult["errors"] = [];
    let totalTokens = 0;
    let retryCount = 0;
    let batchCount = 0;

    // バッチに分割
    const batches = this.createBatches(texts);

    // 並列処理キュー
    const processingQueue: Promise<void>[] = [];
    let processedCount = 0;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchStartIndex = this.calculateBatchStartIndex(
        batches,
        batchIndex,
      );

      // バッチ間の遅延
      if (batchIndex > 0 && this.config.delayBetweenBatches > 0) {
        await sleep(this.config.delayBetweenBatches);
      }

      // バッチ処理をキューに追加
      const batchPromise = this.processBatch(
        batch,
        batchStartIndex,
        options,
      ).then((batchResult) => {
        // 結果を集約
        embeddings.push(...batchResult.embeddings);
        errors.push(...batchResult.errors);
        totalTokens += batchResult.totalTokens;
        retryCount += batchResult.retryCount;
        batchCount++;

        processedCount += batch.length;

        // 進捗コールバック
        onProgress?.({
          processed: processedCount,
          total: texts.length,
          successCount: embeddings.length,
          failureCount: errors.length,
          currentBatchSize: this.currentBatchSize,
        });

        // 適応型バッチサイズ調整
        if (this.config.adaptiveBatchSize) {
          this.adjustBatchSize(batchResult.errors.length > 0);
        }
      });

      processingQueue.push(batchPromise);

      // 並列度制御
      if (processingQueue.length >= this.config.concurrency) {
        await Promise.race(processingQueue);
        // 完了したPromiseを削除（Promise.raceで少なくとも1つは完了）
        processingQueue.length = 0;
      }
    }

    // 残りのバッチを完了
    await Promise.all(processingQueue);

    return {
      embeddings,
      errors,
      stats: {
        totalTimeMs: Date.now() - startTime,
        totalTokens,
        successCount: embeddings.length,
        failureCount: errors.length,
        batchCount,
        retryCount,
        finalBatchSize: this.currentBatchSize,
      },
    };
  }

  /**
   * 単一バッチを処理
   */
  private async processBatch(
    texts: string[],
    startIndex: number,
    options?: EmbedOptions,
  ): Promise<{
    embeddings: BatchProcessResult["embeddings"];
    errors: BatchProcessResult["errors"];
    totalTokens: number;
    retryCount: number;
  }> {
    const embeddings: BatchProcessResult["embeddings"] = [];
    const errors: BatchProcessResult["errors"] = [];
    let totalTokens = 0;
    let retryCount = 0;

    // 各テキストを処理
    const results = await Promise.allSettled(
      texts.map(async (text, indexInBatch) => {
        const globalIndex = startIndex + indexInBatch;

        try {
          // トークン数を計算
          const tokenCount = this.provider.countTokens(text);

          // レート制限チェック
          await this.rateLimiter.acquire(1, tokenCount);

          // リトライ付き埋め込み生成
          const result = await this.retryHandler.retry(
            async () => {
              return await this.provider.embed(text, options);
            },
            {
              maxRetries: this.config.maxRetries,
            },
          );

          return { globalIndex, result };
        } catch (error) {
          // リトライ回数をカウント
          if (this.isRetryableError(error)) {
            retryCount++;
          }
          throw { globalIndex, error };
        }
      }),
    );

    // 結果を集約
    for (const outcome of results) {
      if (outcome.status === "fulfilled") {
        const { globalIndex, result } = outcome.value;
        embeddings.push({ index: globalIndex, result });
        totalTokens += result.tokenCount;

        // メトリクス記録
        this.metricsCollector.recordEmbedding({
          modelId: this.provider.modelId,
          tokenCount: result.tokenCount,
          processingTimeMs: result.processingTimeMs,
          success: true,
        });
      } else {
        const { globalIndex, error } = outcome.reason as {
          globalIndex: number;
          error: unknown;
        };
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const isRetryable = this.isRetryableError(error);

        errors.push({
          index: globalIndex,
          error: errorMessage,
          retryable: isRetryable,
        });

        // エラーメトリクス記録
        this.metricsCollector.recordEmbedding({
          modelId: this.provider.modelId,
          tokenCount: 0,
          processingTimeMs: 0,
          success: false,
          error: errorMessage,
        });
      }
    }

    return { embeddings, errors, totalTokens, retryCount };
  }

  /**
   * テキスト配列をバッチに分割
   */
  private createBatches(texts: string[]): string[][] {
    const batches: string[][] = [];
    for (let i = 0; i < texts.length; i += this.currentBatchSize) {
      batches.push(texts.slice(i, i + this.currentBatchSize));
    }
    return batches;
  }

  /**
   * バッチ開始インデックスを計算
   */
  private calculateBatchStartIndex(
    batches: string[][],
    batchIndex: number,
  ): number {
    let startIndex = 0;
    for (let i = 0; i < batchIndex; i++) {
      startIndex += batches[i].length;
    }
    return startIndex;
  }

  /**
   * 適応型バッチサイズ調整
   */
  private adjustBatchSize(hasErrors: boolean): void {
    if (hasErrors) {
      // エラー発生時はバッチサイズを半減
      this.currentBatchSize = Math.max(
        this.config.minBatchSize,
        Math.floor(this.currentBatchSize / 2),
      );
    } else {
      // 成功時は徐々にバッチサイズを増加（元のサイズまで）
      this.currentBatchSize = Math.min(
        this.config.batchSize,
        Math.floor(this.currentBatchSize * 1.2),
      );
    }
  }

  /**
   * リトライ可能なエラーかチェック
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof RateLimitError) {
      return true;
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes("timeout") ||
        message.includes("rate limit") ||
        message.includes("429") ||
        message.includes("500") ||
        message.includes("502") ||
        message.includes("503") ||
        message.includes("504") ||
        message.includes("network") ||
        message.includes("econnreset")
      );
    }

    return false;
  }

  /**
   * 失敗したアイテムを再処理
   *
   * @param texts - 元のテキスト配列
   * @param errors - 失敗したエラー情報
   * @param options - 埋め込みオプション
   * @returns 再処理結果
   */
  async retryFailed(
    texts: string[],
    errors: BatchProcessResult["errors"],
    options?: EmbedOptions,
  ): Promise<BatchProcessResult> {
    // リトライ可能なエラーのみ抽出
    const retryableErrors = errors.filter((e) => e.retryable);

    if (retryableErrors.length === 0) {
      return {
        embeddings: [],
        errors: [],
        stats: {
          totalTimeMs: 0,
          totalTokens: 0,
          successCount: 0,
          failureCount: 0,
          batchCount: 0,
          retryCount: 0,
          finalBatchSize: this.currentBatchSize,
        },
      };
    }

    // 失敗したテキストを抽出
    const failedTexts = retryableErrors.map((e) => texts[e.index]);

    // 再処理（バッチサイズを縮小）
    const originalBatchSize = this.currentBatchSize;
    this.currentBatchSize = Math.max(
      this.config.minBatchSize,
      Math.floor(this.currentBatchSize / 2),
    );

    const result = await this.process(failedTexts, options);

    // インデックスを元に戻す
    const remappedEmbeddings = result.embeddings.map((emb, idx) => ({
      index: retryableErrors[idx].index,
      result: emb.result,
    }));

    const remappedErrors = result.errors.map((err, _idx) => ({
      index: retryableErrors[err.index].index,
      error: err.error,
      retryable: err.retryable,
    }));

    // バッチサイズを復元
    this.currentBatchSize = originalBatchSize;

    return {
      embeddings: remappedEmbeddings,
      errors: remappedErrors,
      stats: result.stats,
    };
  }

  /**
   * 現在のバッチサイズを取得
   */
  getCurrentBatchSize(): number {
    return this.currentBatchSize;
  }

  /**
   * バッチサイズをリセット
   */
  resetBatchSize(): void {
    this.currentBatchSize = this.config.batchSize;
  }

  /**
   * メトリクス収集を取得
   */
  getMetricsCollector(): MetricsCollector {
    return this.metricsCollector;
  }
}
