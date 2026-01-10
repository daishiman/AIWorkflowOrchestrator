/**
 * Circuit Breaker Template
 *
 * サーキットブレーカーの実装テンプレート
 * 使用方法: このテンプレートをコピーし、プレースホルダーを実装してください
 *
 * 含まれる機能:
 * - 3状態管理（Closed, Open, Half-Open）
 * - 設定可能な閾値
 * - フォールバックサポート
 * - メトリクス収集
 */

// ============================================
// 1. 状態定義
// ============================================

export enum CircuitState {
  /** 正常状態：リクエストは通常通り送信 */
  CLOSED = "CLOSED",

  /** 遮断状態：リクエストは即座に失敗 */
  OPEN = "OPEN",

  /** 半開状態：限定的なリクエストで復旧を試行 */
  HALF_OPEN = "HALF_OPEN",
}

// ============================================
// 2. 設定型定義
// ============================================

export interface CircuitBreakerConfig {
  /** Open状態への遷移に必要な連続失敗回数 */
  failureThreshold: number;

  /** Half-Open→Closedへの遷移に必要な連続成功回数 */
  successThreshold: number;

  /** Open状態からHalf-Openへの遷移までの時間（ミリ秒） */
  timeout: number;

  /** Half-Open状態での最大同時リクエスト数 */
  halfOpenMaxCalls: number;

  /** 状態変更時のコールバック（オプション） */
  onStateChange?: (from: CircuitState, to: CircuitState) => void;
}

// ============================================
// 3. デフォルト設定
// ============================================

export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 30000,
  halfOpenMaxCalls: 2,
};

// ============================================
// 4. エラー型定義
// ============================================

export class CircuitOpenError extends Error {
  constructor(
    message = "Circuit breaker is open",
    public readonly state: CircuitState = CircuitState.OPEN,
  ) {
    super(message);
    this.name = "CircuitOpenError";
  }
}

// ============================================
// 5. メトリクス型定義
// ============================================

export interface CircuitBreakerMetrics {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rejectedRequests: number;
  lastFailureTime: Date | null;
  lastStateChange: Date | null;
  stateTransitions: Array<{
    from: CircuitState;
    to: CircuitState;
    timestamp: Date;
  }>;
}

// ============================================
// 6. サーキットブレーカー実装
// ============================================

export class CircuitBreaker<T> {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: Date | null = null;
  private lastStateChange: Date | null = null;
  private halfOpenCalls = 0;

  // メトリクス
  private totalRequests = 0;
  private successfulRequests = 0;
  private failedRequests = 0;
  private rejectedRequests = 0;
  private stateTransitions: Array<{
    from: CircuitState;
    to: CircuitState;
    timestamp: Date;
  }> = [];

  private readonly config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...config };
  }

  /**
   * 関数を実行（サーキットブレーカー経由）
   */
  async execute(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    // Open状態のチェック
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.transitionTo(CircuitState.HALF_OPEN);
      } else {
        this.rejectedRequests++;
        throw new CircuitOpenError(
          `Circuit is open. Will attempt reset in ${this.getRemainingTimeout()}ms`,
        );
      }
    }

    // Half-Open時の同時リクエスト制限
    if (this.state === CircuitState.HALF_OPEN) {
      if (this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
        this.rejectedRequests++;
        throw new CircuitOpenError(
          "Circuit is half-open, max concurrent calls reached",
          CircuitState.HALF_OPEN,
        );
      }
      this.halfOpenCalls++;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * フォールバック付き実行
   */
  async executeWithFallback(
    fn: () => Promise<T>,
    fallback: () => T | Promise<T>,
  ): Promise<T> {
    try {
      return await this.execute(fn);
    } catch (error) {
      if (error instanceof CircuitOpenError) {
        return fallback();
      }
      throw error;
    }
  }

  /**
   * 成功時の処理
   */
  private onSuccess(): void {
    this.successfulRequests++;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      this.halfOpenCalls--;

      if (this.successCount >= this.config.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Closedでは失敗カウントをリセット
      this.failureCount = 0;
    }
  }

  /**
   * 失敗時の処理
   */
  private onFailure(): void {
    this.failedRequests++;
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenCalls--;
      this.transitionTo(CircuitState.OPEN);
    } else if (this.state === CircuitState.CLOSED) {
      if (this.failureCount >= this.config.failureThreshold) {
        this.transitionTo(CircuitState.OPEN);
      }
    }
  }

  /**
   * リセット試行の判定
   */
  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return true;

    const elapsed = Date.now() - this.lastFailureTime.getTime();
    return elapsed >= this.config.timeout;
  }

  /**
   * 残りタイムアウト時間
   */
  private getRemainingTimeout(): number {
    if (!this.lastFailureTime) return 0;

    const elapsed = Date.now() - this.lastFailureTime.getTime();
    return Math.max(0, this.config.timeout - elapsed);
  }

  /**
   * 状態遷移
   */
  private transitionTo(newState: CircuitState): void {
    const previousState = this.state;
    this.state = newState;
    this.lastStateChange = new Date();

    // 状態遷移履歴に追加
    this.stateTransitions.push({
      from: previousState,
      to: newState,
      timestamp: this.lastStateChange,
    });

    // 履歴を100件に制限
    if (this.stateTransitions.length > 100) {
      this.stateTransitions = this.stateTransitions.slice(-100);
    }

    // 状態遷移時のリセット
    switch (newState) {
      case CircuitState.CLOSED:
        this.failureCount = 0;
        this.successCount = 0;
        break;
      case CircuitState.HALF_OPEN:
        this.successCount = 0;
        this.halfOpenCalls = 0;
        break;
      case CircuitState.OPEN:
        // Openへの遷移時は何もリセットしない
        break;
    }

    // コールバック呼び出し
    if (this.config.onStateChange) {
      this.config.onStateChange(previousState, newState);
    }

    // ログ出力
    console.log({
      event: "circuit_state_change",
      from: previousState,
      to: newState,
      failureCount: this.failureCount,
      successCount: this.successCount,
      timestamp: this.lastStateChange.toISOString(),
    });
  }

  // ============================================
  // パブリックAPI
  // ============================================

  /**
   * 現在の状態を取得
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * サーキットが利用可能かどうか
   */
  isAvailable(): boolean {
    if (this.state === CircuitState.CLOSED) return true;
    if (this.state === CircuitState.OPEN) return this.shouldAttemptReset();
    if (this.state === CircuitState.HALF_OPEN) {
      return this.halfOpenCalls < this.config.halfOpenMaxCalls;
    }
    return false;
  }

  /**
   * メトリクスを取得
   */
  getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      rejectedRequests: this.rejectedRequests,
      lastFailureTime: this.lastFailureTime,
      lastStateChange: this.lastStateChange,
      stateTransitions: [...this.stateTransitions],
    };
  }

  /**
   * 手動でサーキットをリセット
   */
  reset(): void {
    this.transitionTo(CircuitState.CLOSED);
  }

  /**
   * 手動でサーキットをオープン
   */
  trip(): void {
    this.transitionTo(CircuitState.OPEN);
  }
}

// ============================================
// 7. サーキットブレーカーレジストリ
// ============================================

/**
 * 複数のサーキットブレーカーを管理
 */
export class CircuitBreakerRegistry {
  private readonly breakers: Map<string, CircuitBreaker<unknown>> = new Map();
  private readonly defaultConfig: Partial<CircuitBreakerConfig>;

  constructor(defaultConfig: Partial<CircuitBreakerConfig> = {}) {
    this.defaultConfig = defaultConfig;
  }

  /**
   * サーキットブレーカーを取得（存在しなければ作成）
   */
  get<T>(
    name: string,
    config?: Partial<CircuitBreakerConfig>,
  ): CircuitBreaker<T> {
    if (!this.breakers.has(name)) {
      this.breakers.set(
        name,
        new CircuitBreaker<T>({ ...this.defaultConfig, ...config }),
      );
    }
    return this.breakers.get(name) as CircuitBreaker<T>;
  }

  /**
   * すべてのメトリクスを取得
   */
  getAllMetrics(): Record<string, CircuitBreakerMetrics> {
    const result: Record<string, CircuitBreakerMetrics> = {};
    for (const [name, breaker] of this.breakers) {
      result[name] = breaker.getMetrics();
    }
    return result;
  }

  /**
   * すべてのサーキットブレーカーをリセット
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }
}

// ============================================
// 8. 使用例
// ============================================

/*
// 基本的な使用
const breaker = new CircuitBreaker<User>({
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 30000,
});

const user = await breaker.execute(() => api.getUser(userId));

// フォールバック付き
const user = await breaker.executeWithFallback(
  () => api.getUser(userId),
  () => ({ id: userId, name: 'Unknown' }) // キャッシュまたはデフォルト値
);

// レジストリ使用
const registry = new CircuitBreakerRegistry({ timeout: 60000 });
const paymentBreaker = registry.get<PaymentResult>('payment-service');
const inventoryBreaker = registry.get<InventoryResult>('inventory-service');

// 状態変更のリスニング
const breaker = new CircuitBreaker({
  onStateChange: (from, to) => {
    if (to === CircuitState.OPEN) {
      alert('Circuit breaker opened!');
    }
  },
});

// メトリクス取得
const metrics = breaker.getMetrics();
console.log(`State: ${metrics.state}, Failures: ${metrics.failureCount}`);
*/
