/**
 * レート制限クラス
 *
 * @description Token Bucket Algorithmを使用したレート制限
 */

import type { RateLimitConfig } from "../types/embedding.types";
import { RateLimitError } from "../types/errors";
import { sleep } from "./async-utils";

/**
 * レート制限クラス
 */
export class RateLimiter {
  private requestTokens: number;
  private tokenTokens: number;
  private readonly requestCapacity: number;
  private readonly tokenCapacity: number;
  private lastRefill: number;

  constructor(private config: RateLimitConfig) {
    this.requestCapacity = config.requestsPerMinute;
    this.tokenCapacity = config.tokensPerMinute;
    this.requestTokens = this.requestCapacity;
    this.tokenTokens = this.tokenCapacity;
    this.lastRefill = Date.now();
  }

  /**
   * トークンを取得（待機を含む）
   *
   * @param requests - リクエスト数
   * @param tokens - トークン数
   */
  async acquire(requests: number, tokens: number): Promise<void> {
    // 無限の場合はスキップ
    if (this.requestCapacity === Infinity && this.tokenCapacity === Infinity) {
      return;
    }

    const maxWaitTime = 60000; // 最大1分待機
    const startTime = Date.now();

    while (true) {
      this.refill();

      if (this.requestTokens >= requests && this.tokenTokens >= tokens) {
        this.requestTokens -= requests;
        this.tokenTokens -= tokens;
        return;
      }

      // タイムアウトチェック
      if (Date.now() - startTime > maxWaitTime) {
        throw new RateLimitError(
          "Rate limit exceeded, max wait time reached",
          this.calculateWaitTime(requests, tokens),
        );
      }

      // 待機時間を計算
      const waitTime = Math.min(
        this.calculateWaitTime(requests, tokens),
        1000, // 最大1秒ずつ待機
      );
      await sleep(waitTime);
    }
  }

  /**
   * トークンを補充
   */
  private refill(): void {
    const now = Date.now();
    const elapsedMs = now - this.lastRefill;
    const elapsedMinutes = elapsedMs / 60000;

    if (this.requestCapacity !== Infinity) {
      this.requestTokens = Math.min(
        this.requestCapacity,
        this.requestTokens + this.requestCapacity * elapsedMinutes,
      );
    }

    if (this.tokenCapacity !== Infinity) {
      this.tokenTokens = Math.min(
        this.tokenCapacity,
        this.tokenTokens + this.tokenCapacity * elapsedMinutes,
      );
    }

    this.lastRefill = now;
  }

  /**
   * 待機時間を計算
   */
  private calculateWaitTime(requests: number, tokens: number): number {
    let requestWait = 0;
    let tokenWait = 0;

    if (this.requestCapacity !== Infinity && this.requestTokens < requests) {
      requestWait =
        ((requests - this.requestTokens) / this.requestCapacity) * 60000;
    }

    if (this.tokenCapacity !== Infinity && this.tokenTokens < tokens) {
      tokenWait = ((tokens - this.tokenTokens) / this.tokenCapacity) * 60000;
    }

    return Math.max(requestWait, tokenWait, 100); // 最低100ms
  }

  /**
   * 現在の利用可能トークン数を取得
   */
  getAvailableTokens(): { requests: number; tokens: number } {
    this.refill();
    return {
      requests: this.requestTokens,
      tokens: this.tokenTokens,
    };
  }
}
