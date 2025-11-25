# Circuit Breaker（サーキットブレーカー）

## 概要

サーキットブレーカーは、外部サービスの障害が連鎖的にシステム全体に波及することを防ぐパターンです。
電気回路のブレーカーと同様に、異常を検知すると「回路を開いて」リクエストを遮断します。

## 状態遷移

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│    ┌──────────┐         失敗閾値到達         ┌────────┐ │
│    │  Closed  │ ────────────────────────────▶│  Open  │ │
│    │ (正常)   │                              │ (遮断) │ │
│    └──────────┘                              └────────┘ │
│         ▲                                        │      │
│         │                                        │      │
│         │ 成功               タイムアウト経過    │      │
│         │                                        ▼      │
│    ┌──────────┐                             ┌─────────┐ │
│    │          │◀────────── 失敗 ────────────│Half-Open│ │
│    │          │                             │ (試行)  │ │
│    └──────────┘                             └─────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 状態の詳細

### Closed（閉じた状態 = 正常）

- リクエストは通常通り外部サービスに送信される
- 失敗をカウント
- 失敗カウントが閾値に達したらOpen状態へ遷移

### Open（開いた状態 = 遮断）

- リクエストは外部サービスに送信されない
- 即座にエラーを返す（Fast Fail）
- 設定されたタイムアウト後にHalf-Open状態へ遷移

### Half-Open（半開き状態 = 試行）

- 限定的なリクエストを外部サービスに送信
- 成功すればClosed状態へ復帰
- 失敗すればOpen状態へ戻る

## パラメータ設計

### 基本パラメータ

| パラメータ | 推奨値 | 説明 |
|-----------|--------|------|
| failureThreshold | 5-10 | Open状態への遷移失敗回数 |
| successThreshold | 2-3 | Half-Open→Closedの成功回数 |
| timeout | 30-60秒 | Open状態の継続時間 |
| halfOpenMaxCalls | 1-3 | Half-Open時の同時リクエスト数 |

### 用途別推奨値

#### 高可用性システム（即座の遮断）
```typescript
const config = {
  failureThreshold: 3,
  successThreshold: 2,
  timeout: 10000,       // 10秒
  halfOpenMaxCalls: 1,
};
```

#### 標準システム
```typescript
const config = {
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 30000,       // 30秒
  halfOpenMaxCalls: 2,
};
```

#### 耐障害性重視
```typescript
const config = {
  failureThreshold: 10,
  successThreshold: 5,
  timeout: 60000,       // 60秒
  halfOpenMaxCalls: 3,
};
```

## 実装パターン

### 基本実装

```typescript
enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

class CircuitBreaker<T> {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime?: Date;
  private halfOpenCalls = 0;

  constructor(private readonly config: CircuitBreakerConfig) {}

  async execute(fn: () => Promise<T>): Promise<T> {
    // Open状態のチェック
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.transitionTo(CircuitState.HALF_OPEN);
      } else {
        throw new CircuitOpenError('Circuit is open');
      }
    }

    // Half-Open時の同時リクエスト制限
    if (this.state === CircuitState.HALF_OPEN) {
      if (this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
        throw new CircuitOpenError('Circuit is half-open, max calls reached');
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

  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      this.halfOpenCalls--;

      if (this.successCount >= this.config.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
      }
    } else {
      // Closedでは失敗カウントをリセット
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenCalls--;
      this.transitionTo(CircuitState.OPEN);
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.transitionTo(CircuitState.OPEN);
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return true;

    const elapsed = Date.now() - this.lastFailureTime.getTime();
    return elapsed >= this.config.timeout;
  }

  private transitionTo(newState: CircuitState): void {
    const previousState = this.state;
    this.state = newState;

    // 状態遷移時のリセット
    if (newState === CircuitState.CLOSED) {
      this.failureCount = 0;
      this.successCount = 0;
    } else if (newState === CircuitState.HALF_OPEN) {
      this.successCount = 0;
      this.halfOpenCalls = 0;
    }

    this.onStateChange(previousState, newState);
  }

  private onStateChange(from: CircuitState, to: CircuitState): void {
    console.log({
      event: 'circuit_state_change',
      from,
      to,
      failureCount: this.failureCount,
      timestamp: new Date().toISOString(),
    });
  }

  getState(): CircuitState {
    return this.state;
  }

  getMetrics(): CircuitMetrics {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }
}
```

## フォールバック戦略

### キャッシュフォールバック

```typescript
class CachedCircuitBreaker<T> extends CircuitBreaker<T> {
  private cache: Map<string, { data: T; timestamp: number }> = new Map();

  async executeWithFallback(
    key: string,
    fn: () => Promise<T>,
    fallbackFn?: () => T
  ): Promise<T> {
    try {
      const result = await this.execute(fn);
      this.cache.set(key, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      if (error instanceof CircuitOpenError) {
        // キャッシュから返却
        const cached = this.cache.get(key);
        if (cached) {
          return cached.data;
        }

        // フォールバック関数
        if (fallbackFn) {
          return fallbackFn();
        }
      }
      throw error;
    }
  }
}
```

### デフォルト値フォールバック

```typescript
async function withDefaultFallback<T>(
  circuitBreaker: CircuitBreaker<T>,
  fn: () => Promise<T>,
  defaultValue: T
): Promise<T> {
  try {
    return await circuitBreaker.execute(fn);
  } catch (error) {
    if (error instanceof CircuitOpenError) {
      return defaultValue;
    }
    throw error;
  }
}
```

## 高度な実装

### 時間ウィンドウベース

```typescript
class SlidingWindowCircuitBreaker {
  private readonly window: { timestamp: number; success: boolean }[] = [];
  private readonly windowSize: number; // ミリ秒

  isTripped(): boolean {
    const now = Date.now();
    const windowStart = now - this.windowSize;

    // ウィンドウ内のイベントのみ
    const windowEvents = this.window.filter(e => e.timestamp >= windowStart);

    const failures = windowEvents.filter(e => !e.success).length;
    const total = windowEvents.length;

    // エラー率ベースの判定
    return total > 10 && failures / total > 0.5;
  }
}
```

### エラー率ベース

```typescript
class ErrorRateCircuitBreaker {
  private successCount = 0;
  private failureCount = 0;

  private getErrorRate(): number {
    const total = this.successCount + this.failureCount;
    if (total === 0) return 0;
    return this.failureCount / total;
  }

  shouldOpen(): boolean {
    const total = this.successCount + this.failureCount;
    // 最小サンプル数を確保
    if (total < this.config.minimumCalls) return false;
    return this.getErrorRate() >= this.config.errorRateThreshold;
  }
}
```

## モニタリング

### 収集すべきメトリクス

```typescript
interface CircuitBreakerMetrics {
  // 現在の状態
  state: CircuitState;

  // カウンター
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rejectedRequests: number; // Open時の拒否

  // 率
  errorRate: number;
  rejectionRate: number;

  // 時間
  lastStateChange: Date;
  timeInCurrentState: number;

  // 状態遷移履歴
  stateTransitions: Array<{
    from: CircuitState;
    to: CircuitState;
    timestamp: Date;
  }>;
}
```

### アラート設定

```typescript
function checkAlerts(metrics: CircuitBreakerMetrics): void {
  // Open状態が長時間継続
  if (
    metrics.state === CircuitState.OPEN &&
    metrics.timeInCurrentState > 5 * 60 * 1000 // 5分
  ) {
    alert('Circuit breaker has been open for 5 minutes');
  }

  // 短時間で複数回の状態遷移
  const recentTransitions = metrics.stateTransitions.filter(
    t => Date.now() - t.timestamp.getTime() < 60 * 1000
  );
  if (recentTransitions.length > 10) {
    alert('Circuit breaker is flapping');
  }
}
```

## チェックリスト

### 設計時
- [ ] 失敗閾値が外部サービスの特性に合っているか？
- [ ] タイムアウトが適切か（短すぎ/長すぎない）？
- [ ] フォールバック戦略が定義されているか？

### 実装時
- [ ] 状態遷移がログに記録されているか？
- [ ] メトリクスが収集されているか？
- [ ] スレッドセーフか（必要な場合）？

### 運用時
- [ ] 状態がモニタリング可能か？
- [ ] アラートが設定されているか？
- [ ] 閾値の調整が可能か？

## アンチパターン

### ❌ 共有サーキットブレーカー

```typescript
// NG: すべてのエンドポイントで同じインスタンス
const sharedBreaker = new CircuitBreaker(config);
await sharedBreaker.execute(() => api.getUsers());
await sharedBreaker.execute(() => api.getOrders()); // 別エンドポイントなのに影響を受ける
```

### ❌ フォールバックなし

```typescript
// NG: Open時にユーザーに即エラー
try {
  return await circuitBreaker.execute(fn);
} catch (error) {
  throw error; // ユーザーにそのままエラー
}
```

### ❌ 厳しすぎる閾値

```typescript
// NG: 1回の失敗でOpen
const config = {
  failureThreshold: 1, // 厳しすぎる
  timeout: 60000,
};
```

## 参考

- **『Release It!』** Michael T. Nygard著 - Chapter 5: Stability Patterns
- **Martin Fowler**: CircuitBreaker pattern
