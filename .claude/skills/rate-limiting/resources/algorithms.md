# Rate Limiting Algorithms（レート制限アルゴリズム）

## 概要

レート制限アルゴリズムは、リクエストの流量を制御するための手法です。
各アルゴリズムには特徴があり、用途に応じて選択します。

## アルゴリズム比較

| アルゴリズム | メモリ使用 | 精度 | バースト | 実装難易度 |
|------------|----------|------|---------|----------|
| Token Bucket | 低 | 中 | 許容 | 中 |
| Leaky Bucket | 低 | 高 | 抑制 | 低 |
| Fixed Window | 低 | 低 | 境界問題 | 低 |
| Sliding Window Log | 高 | 高 | 許容 | 中 |
| Sliding Window Counter | 中 | 中〜高 | 許容 | 中 |

## Token Bucket

### 概念

一定レートでトークンが補充されるバケットから、リクエストごとにトークンを消費する方式。
バースト（一時的な大量リクエスト）を許容しながら、長期的なレートを制限。

```
┌────────────────────────┐
│  Token Bucket          │
│  ┌──────────────────┐  │
│  │ ○ ○ ○ ○ ○ ○ ○ ○  │  │  Tokens (max: 10)
│  └──────────────────┘  │
│         ↑              │
│    1 token/sec         │  Refill rate
│         ↓              │
│    [Request] → -1      │  Consume
└────────────────────────┘
```

### 実装

```typescript
class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private readonly capacity: number,    // バケット容量
    private readonly refillRate: number   // トークン/秒
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  /**
   * トークンを消費できるか確認し、消費する
   */
  consume(tokens: number = 1): boolean {
    this.refill();

    if (this.tokens < tokens) {
      return false;
    }

    this.tokens -= tokens;
    return true;
  }

  /**
   * トークンを補充
   */
  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const refillAmount = elapsed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + refillAmount);
    this.lastRefill = now;
  }

  /**
   * 次にリクエスト可能になるまでの待機時間
   */
  getWaitTime(tokens: number = 1): number {
    this.refill();

    if (this.tokens >= tokens) {
      return 0;
    }

    const needed = tokens - this.tokens;
    return Math.ceil(needed / this.refillRate * 1000);
  }

  /**
   * 現在のトークン数
   */
  getTokens(): number {
    this.refill();
    return this.tokens;
  }
}

// 使用例
const bucket = new TokenBucket(10, 1); // 容量10、1トークン/秒

if (bucket.consume()) {
  // リクエスト処理
} else {
  const waitTime = bucket.getWaitTime();
  // waitTime後にリトライ
}
```

## Leaky Bucket

### 概念

一定レートでリクエストを処理するキュー。
入力レートに関係なく、出力レートは一定。

```
┌────────────────────────┐
│  Leaky Bucket          │
│  ┌──────────────────┐  │
│  │ ● ● ● ● ●        │←─ Add requests
│  │ ● ● ● ● ●        │  │
│  │ ● ● ● ● ●        │  │
│  └──────┬───────────┘  │
│         │              │
│         ▼              │
│    [Process] 1/sec     │  Fixed output rate
└────────────────────────┘
```

### 実装

```typescript
class LeakyBucket {
  private queue: number = 0;
  private lastLeak: number;

  constructor(
    private readonly capacity: number,  // キュー容量
    private readonly leakRate: number   // 処理レート（リクエスト/秒）
  ) {
    this.lastLeak = Date.now();
  }

  /**
   * リクエストを追加
   */
  add(): boolean {
    this.leak();

    if (this.queue >= this.capacity) {
      return false; // キュー満杯
    }

    this.queue++;
    return true;
  }

  /**
   * キューからリクエストを処理（漏れる）
   */
  private leak(): void {
    const now = Date.now();
    const elapsed = (now - this.lastLeak) / 1000;
    const leaked = elapsed * this.leakRate;

    this.queue = Math.max(0, this.queue - leaked);
    this.lastLeak = now;
  }

  /**
   * 現在のキュー長
   */
  getQueueLength(): number {
    this.leak();
    return this.queue;
  }

  /**
   * 次にリクエスト可能になるまでの待機時間
   */
  getWaitTime(): number {
    this.leak();

    if (this.queue < this.capacity) {
      return 0;
    }

    const overflow = this.queue - this.capacity + 1;
    return Math.ceil(overflow / this.leakRate * 1000);
  }
}
```

## Fixed Window

### 概念

固定時間ウィンドウ（例：1分）ごとにカウンターをリセット。
実装は簡単だが、ウィンドウ境界で2倍のリクエストが通る可能性あり。

```
Window 1 (0:00-1:00)     Window 2 (1:00-2:00)
┌─────────────────┐      ┌─────────────────┐
│ Count: 100/100  │      │ Count: 0/100    │
│ (limit reached) │      │ (reset)         │
└─────────────────┘      └─────────────────┘
         ↑
    Boundary: 0:59に100リクエスト
              1:01に100リクエスト = 2分間で200リクエスト
```

### 実装

```typescript
class FixedWindow {
  private count: number = 0;
  private windowStart: number;

  constructor(
    private readonly windowMs: number,  // ウィンドウサイズ（ミリ秒）
    private readonly limit: number      // 制限
  ) {
    this.windowStart = Date.now();
  }

  /**
   * リクエストが許可されるか確認
   */
  allow(): boolean {
    const now = Date.now();

    // 新しいウィンドウに移行
    if (now - this.windowStart >= this.windowMs) {
      this.windowStart = now;
      this.count = 0;
    }

    if (this.count >= this.limit) {
      return false;
    }

    this.count++;
    return true;
  }

  /**
   * 残りリクエスト数
   */
  getRemaining(): number {
    const now = Date.now();
    if (now - this.windowStart >= this.windowMs) {
      return this.limit;
    }
    return Math.max(0, this.limit - this.count);
  }

  /**
   * リセットまでの時間
   */
  getResetTime(): number {
    return this.windowStart + this.windowMs;
  }
}
```

## Sliding Window Log

### 概念

各リクエストのタイムスタンプを保存し、現在時刻から一定期間内のリクエスト数をカウント。
最も正確だが、メモリ使用量が大きい。

```
Time: 10:05:30
Window: 1 minute

Log: [10:04:35, 10:04:45, 10:05:00, 10:05:15, 10:05:25]
      ↑ expired  ↑ expired  ↑ valid   ↑ valid   ↑ valid

Count = 3 (valid entries)
```

### 実装

```typescript
class SlidingWindowLog {
  private timestamps: number[] = [];

  constructor(
    private readonly windowMs: number,  // ウィンドウサイズ
    private readonly limit: number      // 制限
  ) {}

  /**
   * リクエストが許可されるか確認
   */
  allow(): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // 期限切れエントリを削除
    this.timestamps = this.timestamps.filter(ts => ts > windowStart);

    if (this.timestamps.length >= this.limit) {
      return false;
    }

    this.timestamps.push(now);
    return true;
  }

  /**
   * 残りリクエスト数
   */
  getRemaining(): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const validCount = this.timestamps.filter(ts => ts > windowStart).length;
    return Math.max(0, this.limit - validCount);
  }

  /**
   * 次にリクエスト可能になるまでの待機時間
   */
  getWaitTime(): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // 有効なエントリのみ
    this.timestamps = this.timestamps.filter(ts => ts > windowStart);

    if (this.timestamps.length < this.limit) {
      return 0;
    }

    // 最古のエントリが期限切れになる時間
    const oldest = Math.min(...this.timestamps);
    return oldest + this.windowMs - now;
  }
}
```

## Sliding Window Counter

### 概念

Fixed WindowとSliding Window Logの中間。
現在ウィンドウと前ウィンドウの加重平均を使用。

```
Previous Window    Current Window
[Count: 40]        [Count: 20]
                        ↑
                   Now: 70% into window

Weighted Count = 40 * 0.3 + 20 = 32
```

### 実装

```typescript
class SlidingWindowCounter {
  private prevCount: number = 0;
  private currCount: number = 0;
  private windowStart: number;

  constructor(
    private readonly windowMs: number,
    private readonly limit: number
  ) {
    this.windowStart = Date.now();
  }

  /**
   * リクエストが許可されるか確認
   */
  allow(): boolean {
    this.updateWindow();

    const count = this.getWeightedCount();

    if (count >= this.limit) {
      return false;
    }

    this.currCount++;
    return true;
  }

  private updateWindow(): void {
    const now = Date.now();
    const elapsed = now - this.windowStart;

    if (elapsed >= this.windowMs) {
      // 1ウィンドウ以上経過
      const windowsPassed = Math.floor(elapsed / this.windowMs);

      if (windowsPassed === 1) {
        this.prevCount = this.currCount;
      } else {
        this.prevCount = 0;
      }

      this.currCount = 0;
      this.windowStart = now - (elapsed % this.windowMs);
    }
  }

  private getWeightedCount(): number {
    const now = Date.now();
    const elapsed = now - this.windowStart;
    const weight = elapsed / this.windowMs;

    // 前ウィンドウの重み + 現ウィンドウのカウント
    return this.prevCount * (1 - weight) + this.currCount;
  }

  getRemaining(): number {
    this.updateWindow();
    const count = this.getWeightedCount();
    return Math.max(0, this.limit - Math.ceil(count));
  }
}
```

## 分散環境での実装

### Redis Token Bucket

```typescript
import Redis from 'ioredis';

class RedisTokenBucket {
  constructor(
    private readonly redis: Redis,
    private readonly capacity: number,
    private readonly refillRate: number
  ) {}

  async consume(key: string, tokens: number = 1): Promise<boolean> {
    const now = Date.now();

    // Lua スクリプトでアトミックに処理
    const script = `
      local key = KEYS[1]
      local capacity = tonumber(ARGV[1])
      local refillRate = tonumber(ARGV[2])
      local tokens = tonumber(ARGV[3])
      local now = tonumber(ARGV[4])

      local bucket = redis.call('HMGET', key, 'tokens', 'lastRefill')
      local currentTokens = tonumber(bucket[1]) or capacity
      local lastRefill = tonumber(bucket[2]) or now

      local elapsed = (now - lastRefill) / 1000
      local refillAmount = elapsed * refillRate
      currentTokens = math.min(capacity, currentTokens + refillAmount)

      if currentTokens < tokens then
        return 0
      end

      currentTokens = currentTokens - tokens
      redis.call('HMSET', key, 'tokens', currentTokens, 'lastRefill', now)
      redis.call('EXPIRE', key, 3600)

      return 1
    `;

    const result = await this.redis.eval(
      script,
      1,
      key,
      this.capacity,
      this.refillRate,
      tokens,
      now
    );

    return result === 1;
  }
}
```

## チェックリスト

### 設計時
- [ ] ユースケースに適したアルゴリズムを選択したか？
- [ ] バースト許容が必要か検討したか？
- [ ] 分散環境での動作を考慮したか？

### 実装時
- [ ] メモリ使用量は許容範囲か？
- [ ] 境界条件を正しく処理しているか？
- [ ] 時間の同期問題を考慮したか？

## 参考

- **『System Design Interview』** Alex Xu著
- **Google Cloud**: Rate Limiting Strategies
