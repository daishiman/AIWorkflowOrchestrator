# Server-Side Rate Limiting（サーバー側レート制限）

## 概要

サーバー側でレート制限を実装することで、
APIの安定性を保ち、リソースの公平な配分を実現します。

## 設計の考慮事項

### レート制限キー

| キータイプ     | 用途             | 長所         | 短所             |
| -------------- | ---------------- | ------------ | ---------------- |
| IPアドレス     | 匿名ユーザー     | 実装簡単     | NAT/プロキシ問題 |
| ユーザーID     | 認証済みユーザー | 正確         | 認証必須         |
| APIキー        | 開発者向け       | 課金連携可能 | 管理が必要       |
| エンドポイント | リソース保護     | きめ細か     | 設定複雑         |
| 複合キー       | 柔軟な制限       | 多層防御     | 実装複雑         |

### 制限値の決定

```typescript
// 制限値の設計例
const rateLimits = {
  // グローバル制限
  global: {
    windowMs: 60 * 1000, // 1分
    max: 1000, // 全体で1000リクエスト/分
  },

  // ユーザー別制限
  perUser: {
    anonymous: { windowMs: 60 * 1000, max: 20 },
    authenticated: { windowMs: 60 * 1000, max: 100 },
    premium: { windowMs: 60 * 1000, max: 500 },
  },

  // エンドポイント別制限
  perEndpoint: {
    "POST /api/auth/login": { windowMs: 60 * 1000, max: 5 }, // ブルートフォース対策
    "POST /api/upload": { windowMs: 60 * 1000, max: 10 }, // 重い処理
    "GET /api/users": { windowMs: 60 * 1000, max: 60 }, // 一般的な読み取り
  },
};
```

## Express.js 実装

### 基本ミドルウェア

```typescript
import { Request, Response, NextFunction } from "express";

interface RateLimitConfig {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
  handler?: (req: Request, res: Response) => void;
  skip?: (req: Request) => boolean;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

class RateLimitStore {
  private records: Map<string, RateLimitRecord> = new Map();

  get(key: string): RateLimitRecord | undefined {
    return this.records.get(key);
  }

  set(key: string, record: RateLimitRecord): void {
    this.records.set(key, record);
  }

  // 定期クリーンアップ
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.records) {
      if (record.resetAt < now) {
        this.records.delete(key);
      }
    }
  }
}

function rateLimit(config: RateLimitConfig) {
  const store = new RateLimitStore();
  const {
    windowMs,
    max,
    keyGenerator = (req) => req.ip || "unknown",
    handler = defaultHandler,
    skip = () => false,
  } = config;

  // 定期クリーンアップ
  setInterval(() => store.cleanup(), windowMs);

  return (req: Request, res: Response, next: NextFunction): void => {
    // スキップ条件
    if (skip(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();
    let record = store.get(key);

    // 新規またはリセット
    if (!record || record.resetAt < now) {
      record = { count: 0, resetAt: now + windowMs };
      store.set(key, record);
    }

    // ヘッダー設定
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - record.count - 1));
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetAt / 1000));

    // 制限チェック
    if (record.count >= max) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      return handler(req, res);
    }

    record.count++;
    next();
  };
}

function defaultHandler(req: Request, res: Response): void {
  res.status(429).json({
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later.",
    },
  });
}

// 使用例
const app = express();

app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1分
    max: 100, // 100リクエスト
  }),
);
```

### 階層型レート制限

```typescript
// 複数のレート制限を組み合わせ
function compositeRateLimit(configs: RateLimitConfig[]) {
  const limiters = configs.map((config) => rateLimit(config));

  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    for (const limiter of limiters) {
      const result = await new Promise<boolean>((resolve) => {
        limiter(req, res, () => resolve(true));
        // 429を返した場合はfalse
        if (res.statusCode === 429) {
          resolve(false);
        }
      });

      if (!result) return;
    }

    next();
  };
}

// 使用例
app.use(
  compositeRateLimit([
    // 短期バースト制限
    { windowMs: 1000, max: 10 },
    // 中期制限
    { windowMs: 60 * 1000, max: 100 },
    // 長期制限
    { windowMs: 60 * 60 * 1000, max: 1000 },
  ]),
);
```

## Redis分散レート制限

### Sliding Window Counter with Redis

```typescript
import Redis from "ioredis";

class RedisRateLimiter {
  constructor(
    private readonly redis: Redis,
    private readonly windowMs: number,
    private readonly max: number,
  ) {}

  async isAllowed(key: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
  }> {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const redisKey = `ratelimit:${key}`;

    // Lua スクリプトでアトミックに処理
    const script = `
      local key = KEYS[1]
      local windowStart = tonumber(ARGV[1])
      local now = tonumber(ARGV[2])
      local max = tonumber(ARGV[3])
      local windowMs = tonumber(ARGV[4])

      -- 古いエントリを削除
      redis.call('ZREMRANGEBYSCORE', key, '-inf', windowStart)

      -- 現在のカウントを取得
      local count = redis.call('ZCARD', key)

      if count >= max then
        -- 最古のエントリの時間を取得
        local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
        local resetAt = oldest[2] and (tonumber(oldest[2]) + windowMs) or (now + windowMs)
        return {0, max - count, resetAt}
      end

      -- 新しいエントリを追加
      redis.call('ZADD', key, now, now .. ':' .. math.random())
      redis.call('PEXPIRE', key, windowMs)

      return {1, max - count - 1, now + windowMs}
    `;

    const result = (await this.redis.eval(
      script,
      1,
      redisKey,
      windowStart,
      now,
      this.max,
      this.windowMs,
    )) as [number, number, number];

    return {
      allowed: result[0] === 1,
      remaining: result[1],
      resetAt: result[2],
    };
  }
}

// Express ミドルウェア
function redisRateLimit(limiter: RedisRateLimiter) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const key = req.ip || "unknown";
    const result = await limiter.isAllowed(key);

    res.setHeader("X-RateLimit-Limit", limiter.max);
    res.setHeader("X-RateLimit-Remaining", result.remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(result.resetAt / 1000));

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
      res.setHeader("Retry-After", retryAfter);
      res.status(429).json({
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests",
          retryAfter,
        },
      });
      return;
    }

    next();
  };
}
```

### Token Bucket with Redis

```typescript
class RedisTokenBucket {
  constructor(
    private readonly redis: Redis,
    private readonly capacity: number,
    private readonly refillRate: number, // トークン/秒
  ) {}

  async consume(
    key: string,
    tokens: number = 1,
  ): Promise<{
    allowed: boolean;
    remaining: number;
    retryAfter?: number;
  }> {
    const script = `
      local key = KEYS[1]
      local capacity = tonumber(ARGV[1])
      local refillRate = tonumber(ARGV[2])
      local tokens = tonumber(ARGV[3])
      local now = tonumber(ARGV[4])

      local data = redis.call('HMGET', key, 'tokens', 'lastRefill')
      local currentTokens = tonumber(data[1]) or capacity
      local lastRefill = tonumber(data[2]) or now

      -- トークン補充
      local elapsed = (now - lastRefill) / 1000
      local refillAmount = elapsed * refillRate
      currentTokens = math.min(capacity, currentTokens + refillAmount)

      if currentTokens < tokens then
        -- 不足分のトークンが補充されるまでの時間
        local needed = tokens - currentTokens
        local waitMs = math.ceil(needed / refillRate * 1000)
        return {0, math.floor(currentTokens), waitMs}
      end

      currentTokens = currentTokens - tokens
      redis.call('HMSET', key, 'tokens', currentTokens, 'lastRefill', now)
      redis.call('PEXPIRE', key, 3600000) -- 1時間でTTL

      return {1, math.floor(currentTokens), 0}
    `;

    const now = Date.now();
    const result = (await this.redis.eval(
      script,
      1,
      `bucket:${key}`,
      this.capacity,
      this.refillRate,
      tokens,
      now,
    )) as [number, number, number];

    return {
      allowed: result[0] === 1,
      remaining: result[1],
      retryAfter: result[2] > 0 ? result[2] : undefined,
    };
  }
}
```

## グレースフルデグラデーション

### 段階的制限

```typescript
interface DegradationConfig {
  thresholds: Array<{
    usage: number; // 使用率（0-1）
    action: "allow" | "throttle" | "reject";
    delay?: number; // throttle時の遅延
  }>;
}

function gracefulDegradation(config: DegradationConfig) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const usage = await getCurrentUsage(); // システム負荷を取得

    for (const threshold of config.thresholds.sort(
      (a, b) => b.usage - a.usage,
    )) {
      if (usage >= threshold.usage) {
        switch (threshold.action) {
          case "reject":
            return res.status(503).json({
              error: {
                code: "SERVICE_OVERLOADED",
                message: "Service temporarily unavailable",
              },
            });

          case "throttle":
            if (threshold.delay) {
              await sleep(threshold.delay);
            }
            break;

          case "allow":
            break;
        }
        break;
      }
    }

    next();
  };
}

// 使用例
app.use(
  gracefulDegradation({
    thresholds: [
      { usage: 0.9, action: "reject" }, // 90%以上: 拒否
      { usage: 0.8, action: "throttle", delay: 500 }, // 80%以上: 遅延
      { usage: 0.7, action: "throttle", delay: 100 }, // 70%以上: 軽い遅延
      { usage: 0, action: "allow" }, // それ以外: 許可
    ],
  }),
);
```

## モニタリング

### メトリクス収集

```typescript
interface RateLimitMetrics {
  totalRequests: number;
  allowedRequests: number;
  rejectedRequests: number;
  rejectionRate: number;
}

class MetricsCollector {
  private metrics: Map<string, RateLimitMetrics> = new Map();

  record(key: string, allowed: boolean): void {
    let m = this.metrics.get(key);
    if (!m) {
      m = {
        totalRequests: 0,
        allowedRequests: 0,
        rejectedRequests: 0,
        rejectionRate: 0,
      };
      this.metrics.set(key, m);
    }

    m.totalRequests++;
    if (allowed) {
      m.allowedRequests++;
    } else {
      m.rejectedRequests++;
    }
    m.rejectionRate = m.rejectedRequests / m.totalRequests;
  }

  getMetrics(key: string): RateLimitMetrics | undefined {
    return this.metrics.get(key);
  }

  getAllMetrics(): Map<string, RateLimitMetrics> {
    return new Map(this.metrics);
  }
}
```

## チェックリスト

### 設計時

- [ ] 適切なキー戦略を選択したか？
- [ ] 制限値は妥当か？
- [ ] 分散環境を考慮したか？

### 実装時

- [ ] 標準ヘッダーを返しているか？
- [ ] エラーレスポンスが適切か？
- [ ] ストレージの耐障害性は？

### 運用時

- [ ] メトリクスを収集しているか？
- [ ] アラートを設定しているか？
- [ ] 制限値の調整が可能か？

## 参考

- **RFC 6585**: Additional HTTP Status Codes
- **express-rate-limit**: Express.js rate limiting middleware
