/**
 * サーキットブレーカー
 *
 * @description 障害検出時に自動的に回路を開く
 */

import type { CircuitBreakerConfig } from "../types/embedding.types";
import { CircuitBreakerError } from "../types/errors";

/**
 * サーキットブレーカーの状態
 */
export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

/**
 * サーキットブレーカー
 */
export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private successCount: number = 0;

  constructor(private config: CircuitBreakerConfig) {}

  /**
   * 保護された実行
   *
   * @param fn - 実行する関数
   * @returns 実行結果
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeout) {
        this.state = "HALF_OPEN";
        this.successCount = 0;
      } else {
        throw new CircuitBreakerError("Circuit breaker is OPEN", "OPEN");
      }
    }

    try {
      const result = await fn();

      if (this.state === "HALF_OPEN") {
        this.successCount++;
        // 成功が続いたら閉じる
        if (this.successCount >= 3) {
          this.state = "CLOSED";
          this.failureCount = 0;
          this.successCount = 0;
        }
      } else {
        // CLOSEDの場合は失敗カウントをリセット
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.config.errorThreshold) {
        this.state = "OPEN";
      }

      throw error;
    }
  }

  /**
   * 状態を取得
   */
  getState(): CircuitState {
    // OPENでタイムアウトが経過した場合はHALF_OPENに遷移
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeout) {
        return "HALF_OPEN";
      }
    }
    return this.state;
  }

  /**
   * 失敗回数を取得
   */
  getFailureCount(): number {
    return this.failureCount;
  }

  /**
   * リセット
   */
  reset(): void {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.successCount = 0;
  }

  /**
   * 強制的にOPEN状態にする
   */
  forceOpen(): void {
    this.state = "OPEN";
    this.lastFailureTime = Date.now();
  }
}
