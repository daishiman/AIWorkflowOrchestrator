# Bulkhead Pattern（バルクヘッドパターン）

## 概要

バルクヘッドパターンは、船の隔壁（bulkhead）にならい、システムのリソースを分離することで
一部の障害が全体に波及することを防ぐパターンです。

## なぜ必要か

### 問題: リソース共有による障害連鎖

```
┌─────────────────────────────────────────────┐
│           共有スレッドプール (100)            │
├─────────────────────────────────────────────┤
│  Service A │  Service B │  Service C       │
│  (正常)    │  (障害)    │  (正常)          │
│            │            │                  │
│  使用: 10  │  使用: 90  │  使用: 0 (枯渇!) │
└─────────────────────────────────────────────┘

Service B の障害で、Service C も使えなくなる！
```

### 解決: バルクヘッドによるリソース分離

```
┌─────────────────────────────────────────────┐
│  Service A  │   Service B   │  Service C   │
│  Pool (30)  │   Pool (40)   │  Pool (30)   │
├─────────────┼───────────────┼──────────────┤
│  使用: 10   │   使用: 40    │  使用: 10    │
│  空き: 20   │   (上限到達)  │  空き: 20    │
└─────────────┴───────────────┴──────────────┘

Service B が枯渇しても、他は影響なし！
```

## バルクヘッドの種類

### 1. スレッドプールバルクヘッド

各サービスに専用のスレッドプールを割り当て。

```typescript
class ThreadPoolBulkhead {
  private readonly semaphore: Semaphore;
  private readonly queue: Array<() => void> = [];

  constructor(
    private readonly maxConcurrent: number,
    private readonly maxQueue: number,
  ) {
    this.semaphore = new Semaphore(maxConcurrent);
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.queue.length >= this.maxQueue) {
      throw new BulkheadFullError("Queue is full");
    }

    await this.semaphore.acquire();

    try {
      return await fn();
    } finally {
      this.semaphore.release();
    }
  }
}
```

### 2. セマフォバルクヘッド

同時実行数のみを制限（軽量）。

```typescript
class SemaphoreBulkhead {
  private permits: number;
  private readonly waiting: Array<() => void> = [];

  constructor(private readonly maxPermits: number) {
    this.permits = maxPermits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    return new Promise((resolve) => {
      this.waiting.push(resolve);
    });
  }

  release(): void {
    if (this.waiting.length > 0) {
      const next = this.waiting.shift()!;
      next();
    } else {
      this.permits++;
    }
  }
}
```

### 3. 接続プールバルクヘッド

データベースや外部API接続に特化。

```typescript
class ConnectionPoolBulkhead {
  private readonly pool: Connection[] = [];
  private readonly available: Connection[] = [];
  private readonly waiting: Array<(conn: Connection) => void> = [];

  constructor(
    private readonly maxConnections: number,
    private readonly factory: () => Connection,
  ) {
    // プール初期化
    for (let i = 0; i < maxConnections; i++) {
      const conn = factory();
      this.pool.push(conn);
      this.available.push(conn);
    }
  }

  async acquire(): Promise<Connection> {
    if (this.available.length > 0) {
      return this.available.pop()!;
    }

    return new Promise((resolve) => {
      this.waiting.push(resolve);
    });
  }

  release(conn: Connection): void {
    if (this.waiting.length > 0) {
      const next = this.waiting.shift()!;
      next(conn);
    } else {
      this.available.push(conn);
    }
  }
}
```

## パラメータ設計

### 基本パラメータ

| パラメータ    | 説明             | 考慮事項                     |
| ------------- | ---------------- | ---------------------------- |
| maxConcurrent | 最大同時実行数   | サービスの処理能力に合わせる |
| maxQueue      | 最大キュー長     | 待機時間の許容度に合わせる   |
| timeout       | 取得タイムアウト | ユーザー体験に影響           |

### サービス別設計

```typescript
// 重要度別のバルクヘッド設定
const bulkheadConfigs = {
  // 高優先度サービス
  payment: {
    maxConcurrent: 50,
    maxQueue: 100,
    timeout: 5000,
  },

  // 中優先度サービス
  inventory: {
    maxConcurrent: 30,
    maxQueue: 50,
    timeout: 10000,
  },

  // 低優先度サービス
  notification: {
    maxConcurrent: 10,
    maxQueue: 20,
    timeout: 30000,
  },
};
```

## 実装パターン

### サービスごとのバルクヘッド

```typescript
class BulkheadManager {
  private readonly bulkheads: Map<string, ThreadPoolBulkhead> = new Map();

  getBulkhead(serviceName: string): ThreadPoolBulkhead {
    if (!this.bulkheads.has(serviceName)) {
      const config = bulkheadConfigs[serviceName] || defaultConfig;
      this.bulkheads.set(
        serviceName,
        new ThreadPoolBulkhead(config.maxConcurrent, config.maxQueue),
      );
    }
    return this.bulkheads.get(serviceName)!;
  }

  async execute<T>(serviceName: string, fn: () => Promise<T>): Promise<T> {
    const bulkhead = this.getBulkhead(serviceName);
    return bulkhead.execute(fn);
  }
}

// 使用例
const manager = new BulkheadManager();
await manager.execute("payment", () => paymentApi.charge(amount));
await manager.execute("inventory", () => inventoryApi.reserve(items));
```

### サーキットブレーカーとの組み合わせ

```typescript
class ResilientClient {
  constructor(
    private readonly bulkhead: ThreadPoolBulkhead,
    private readonly circuitBreaker: CircuitBreaker,
    private readonly retrier: RetryExecutor,
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // 1. バルクヘッド: 同時実行数制限
    return this.bulkhead.execute(async () => {
      // 2. サーキットブレーカー: 障害遮断
      return this.circuitBreaker.execute(async () => {
        // 3. リトライ: 一時的障害からの復旧
        return this.retrier.execute(fn);
      });
    });
  }
}
```

## モニタリング

### 収集すべきメトリクス

```typescript
interface BulkheadMetrics {
  // 現在の状態
  activeCalls: number;
  queueLength: number;
  availablePermits: number;

  // カウンター
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  rejectedCalls: number; // バルクヘッドフル

  // 時間
  averageWaitTime: number;
  maxWaitTime: number;

  // 率
  utilizationRate: number; // activeCalls / maxConcurrent
  rejectionRate: number;
}
```

### ダッシュボード表示例

```
┌─────────────────────────────────────────────────────────┐
│ Bulkhead: payment-service                               │
├─────────────────────────────────────────────────────────┤
│ Active:  45/50   [██████████████████████████░░░░] 90%   │
│ Queue:   12/100  [████░░░░░░░░░░░░░░░░░░░░░░░░░░] 12%   │
│ Rejected: 3/min                                         │
└─────────────────────────────────────────────────────────┘
```

## チェックリスト

### 設計時

- [ ] サービスごとにバルクヘッドが分離されているか？
- [ ] maxConcurrentがサービスの処理能力に合っているか？
- [ ] 高優先度サービスに十分なリソースが割り当てられているか？

### 実装時

- [ ] タイムアウトが設定されているか？
- [ ] 拒否時の処理が実装されているか？
- [ ] メトリクスが収集されているか？

### 運用時

- [ ] 使用率がモニタリングされているか？
- [ ] 拒否率にアラートが設定されているか？
- [ ] リソース配分の調整が可能か？

## アンチパターン

### ❌ 共有バルクヘッド

```typescript
// NG: すべてのサービスで共有
const sharedBulkhead = new ThreadPoolBulkhead(100, 200);
await sharedBulkhead.execute(() => serviceA.call());
await sharedBulkhead.execute(() => serviceB.call());
```

### ❌ 無制限のキュー

```typescript
// NG: キューサイズが無制限
const bulkhead = new ThreadPoolBulkhead(50, Infinity);
// メモリを使い果たす可能性
```

### ❌ タイムアウトなし

```typescript
// NG: 永遠に待機
await bulkhead.acquire(); // デッドロックの可能性
```

## 参考

- **『Release It!』** Michael T. Nygard著 - Chapter 5: Stability Patterns
- **Resilience4j**: Java向けバルクヘッド実装
