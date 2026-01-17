/**
 * Circuit Breaker Template
 * サーキットブレーカーパターンの実装テンプレート
 */

export enum CircuitState {
  CLOSED = "CLOSED", // 正常動作
  OPEN = "OPEN", // 遮断状態
  HALF_OPEN = "HALF_OPEN", // 試行状態
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // 開放までの失敗回数
  resetTimeoutMs: number; // 半開放までの待機時間
  successThreshold: number; // 閉鎖までの成功回数
}

export const defaultCircuitConfig: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeoutMs: 60000,
  successThreshold: 2,
};

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private successes = 0;
  private lastFailureTime?: number;

  constructor(private config: CircuitBreakerConfig = defaultCircuitConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (
        Date.now() - (this.lastFailureTime ?? 0) >=
        this.config.resetTimeoutMs
      ) {
        this.state = CircuitState.HALF_OPEN;
        this.successes = 0;
      } else {
        throw new Error("Circuit is OPEN - request blocked");
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.failures = 0;
      }
    } else {
      this.failures = 0;
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
    } else if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = undefined;
  }
}

// 使用例
// const circuitBreaker = new CircuitBreaker();
// try {
//   const result = await circuitBreaker.execute(() => externalApiCall());
// } catch (error) {
//   if (error.message.includes('Circuit is OPEN')) {
//     // フォールバック処理
//   }
// }
