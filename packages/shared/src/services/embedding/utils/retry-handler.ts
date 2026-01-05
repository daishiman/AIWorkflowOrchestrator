/**
 * リトライハンドラー
 *
 * @description 指数バックオフでリトライを実行
 */

import type { RetryOptions } from "../types/embedding.types";
import { sleep } from "./async-utils";

/**
 * デフォルトリトライ設定
 */
export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitter: true,
};

/**
 * リトライハンドラー
 */
export class RetryHandler {
  constructor(private defaultConfig: RetryOptions = DEFAULT_RETRY_OPTIONS) {}

  /**
   * リトライ実行
   *
   * @param fn - 実行する関数
   * @param customConfig - カスタム設定
   * @returns 実行結果
   */
  async retry<T>(
    fn: () => Promise<T>,
    customConfig?: Partial<RetryOptions>,
  ): Promise<T> {
    const config: RetryOptions = {
      ...this.defaultConfig,
      ...customConfig,
    };

    let lastError: Error = new Error("Unknown error");

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (!this.isRetryable(lastError) || attempt === config.maxRetries) {
          throw lastError;
        }

        const delay = this.calculateDelay(attempt, config);
        await sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * リトライ可能なエラーかチェック
   *
   * @param error - エラー
   * @returns リトライ可能な場合true
   */
  isRetryable(error: Error): boolean {
    const message = error.message.toLowerCase();

    // リトライ可能なエラーパターン
    const retryablePatterns = [
      "timeout",
      "econnreset",
      "etimedout",
      "econnrefused",
      "rate limit",
      "429",
      "500",
      "502",
      "503",
      "504",
      "network",
      "socket hang up",
      "temporarily unavailable",
    ];

    return retryablePatterns.some((pattern) => message.includes(pattern));
  }

  /**
   * 遅延時間を計算（指数バックオフ + ジッター）
   *
   * @param attempt - 試行回数
   * @param config - リトライ設定
   * @returns 遅延時間（ミリ秒）
   */
  private calculateDelay(attempt: number, config: RetryOptions): number {
    let delay =
      config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt);

    delay = Math.min(delay, config.maxDelayMs);

    if (config.jitter) {
      // 0.5〜1.5倍のジッターを適用
      delay *= 0.5 + Math.random();
    }

    return Math.floor(delay);
  }
}
