/**
 * Rate Limiter Template
 *
 * レート制限の実装テンプレート
 * 使用方法: このテンプレートをコピーし、プレースホルダーを実装してください
 *
 * 含まれる機能:
 * - Token Bucket アルゴリズム
 * - Sliding Window アルゴリズム
 * - Express ミドルウェア
 * - Redis 対応
 */

// ============================================
// 1. 型定義
// ============================================

export interface RateLimitResult {
  /** リクエストが許可されたか */
  allowed: boolean;

  /** 残りリクエスト数 */
  remaining: number;

  /** リセット時刻（Unix時間ミリ秒） */
  resetAt: number;

  /** リトライまでの待機時間（ミリ秒） */
  retryAfter?: number;
}

export interface RateLimiterConfig {
  /** キー生成関数 */
  keyGenerator?: (req: Request) => string;

  /** 制限超過時のハンドラー */
  onLimitExceeded?: (req: Request, res: Response, result: RateLimitResult) => void;

  /** スキップ条件 */
  skip?: (req: Request) => boolean;
}

// ============================================
// 2. Token Bucket
// ============================================

export interface TokenBucketConfig {
  /** バケット容量 */
  capacity: number;

  /** トークン補充レート（トークン/秒） */
  refillRate: number;
}

export class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(private readonly config: TokenBucketConfig) {
    this.tokens = config.capacity;
    this.lastRefill = Date.now();
  }

  /**
   * トークンを消費
   */
  consume(tokens: number = 1): RateLimitResult {
    this.refill();

    const resetAt = Date.now() + Math.ceil(
      (this.config.capacity - this.tokens) / this.config.refillRate * 1000
    );

    if (this.tokens < tokens) {
      const needed = tokens - this.tokens;
      const retryAfter = Math.ceil(needed / this.config.refillRate * 1000);

      return {
        allowed: false,
        remaining: Math.floor(this.tokens),
        resetAt,
        retryAfter,
      };
    }

    this.tokens -= tokens;

    return {
      allowed: true,
      remaining: Math.floor(this.tokens),
      resetAt,
    };
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(
      this.config.capacity,
      this.tokens + elapsed * this.config.refillRate
    );
    this.lastRefill = now;
  }
}

// ============================================
// 3. Sliding Window Counter
// ============================================

export interface SlidingWindowConfig {
  /** ウィンドウサイズ（ミリ秒） */
  windowMs: number;

  /** 最大リクエスト数 */
  limit: number;
}

export class SlidingWindowCounter {
  private prevCount: number = 0;
  private currCount: number = 0;
  private windowStart: number;

  constructor(private readonly config: SlidingWindowConfig) {
    this.windowStart = Date.now();
  }

  /**
   * リクエストをカウント
   */
  increment(): RateLimitResult {
    this.updateWindow();

    const count = this.getWeightedCount();
    const resetAt = this.windowStart + this.config.windowMs;

    if (count >= this.config.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfter: resetAt - Date.now(),
      };
    }

    this.currCount++;

    return {
      allowed: true,
      remaining: Math.max(0, this.config.limit - Math.ceil(count) - 1),
      resetAt,
    };
  }

  private updateWindow(): void {
    const now = Date.now();
    const elapsed = now - this.windowStart;

    if (elapsed >= this.config.windowMs) {
      const windowsPassed = Math.floor(elapsed / this.config.windowMs);

      if (windowsPassed === 1) {
        this.prevCount = this.currCount;
      } else {
        this.prevCount = 0;
      }

      this.currCount = 0;
      this.windowStart = now - (elapsed % this.config.windowMs);
    }
  }

  private getWeightedCount(): number {
    const now = Date.now();
    const elapsed = now - this.windowStart;
    const weight = elapsed / this.config.windowMs;

    return this.prevCount * (1 - weight) + this.currCount;
  }
}

// ============================================
// 4. レート制限ストア
// ============================================

export interface RateLimitStore {
  get(key: string): Promise<TokenBucket | SlidingWindowCounter | null>;
  set(key: string, limiter: TokenBucket | SlidingWindowCounter): Promise<void>;
}

/**
 * インメモリストア
 */
export class MemoryStore implements RateLimitStore {
  private readonly store: Map<string, TokenBucket | SlidingWindowCounter> = new Map();

  async get(key: string): Promise<TokenBucket | SlidingWindowCounter | null> {
    return this.store.get(key) || null;
  }

  async set(key: string, limiter: TokenBucket | SlidingWindowCounter): Promise<void> {
    this.store.set(key, limiter);
  }
}

// ============================================
// 5. Express ミドルウェア
// ============================================

import { Request, Response, NextFunction } from "express";

export interface RateLimitMiddlewareConfig extends RateLimiterConfig {
  /** アルゴリズム設定 */
  algorithm: "token-bucket" | "sliding-window";

  /** Token Bucket 設定 */
  tokenBucket?: TokenBucketConfig;

  /** Sliding Window 設定 */
  slidingWindow?: SlidingWindowConfig;

  /** ストア */
  store?: RateLimitStore;
}

/**
 * レート制限ミドルウェアを作成
 */
export function createRateLimitMiddleware(config: RateLimitMiddlewareConfig) {
  const store = config.store || new MemoryStore();

  const keyGenerator = config.keyGenerator || ((req: Request) => req.ip || "unknown");

  const onLimitExceeded = config.onLimitExceeded || ((req: Request, res: Response, result: RateLimitResult) => {
    res.status(429).json({
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests",
        retryAfter: result.retryAfter,
      },
    });
  });

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // スキップ条件
    if (config.skip?.(req)) {
      return next();
    }

    const key = keyGenerator(req);

    // リミッターを取得または作成
    let limiter = await store.get(key);

    if (!limiter) {
      if (config.algorithm === "token-bucket" && config.tokenBucket) {
        limiter = new TokenBucket(config.tokenBucket);
      } else if (config.algorithm === "sliding-window" && config.slidingWindow) {
        limiter = new SlidingWindowCounter(config.slidingWindow);
      } else {
        throw new Error("Invalid rate limiter configuration");
      }
      await store.set(key, limiter);
    }

    // レート制限チェック
    const result = limiter instanceof TokenBucket
      ? limiter.consume()
      : limiter.increment();

    // ヘッダー設定
    res.setHeader("X-RateLimit-Limit",
      config.algorithm === "token-bucket"
        ? config.tokenBucket!.capacity
        : config.slidingWindow!.limit
    );
    res.setHeader("X-RateLimit-Remaining", result.remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(result.resetAt / 1000));

    if (!result.allowed) {
      if (result.retryAfter) {
        res.setHeader("Retry-After", Math.ceil(result.retryAfter / 1000));
      }
      return onLimitExceeded(req, res, result);
    }

    next();
  };
}

// ============================================
// 6. デコレーター版（クラスメソッド用）
// ============================================

/**
 * レート制限デコレーター
 */
export function RateLimit(config: TokenBucketConfig | SlidingWindowConfig) {
  const limiter = "capacity" in config
    ? new TokenBucket(config)
    : new SlidingWindowCounter(config);

  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const result = limiter instanceof TokenBucket
        ? limiter.consume()
        : limiter.increment();

      if (!result.allowed) {
        throw new RateLimitError(
          "Rate limit exceeded",
          result.retryAfter || 0
        );
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfter: number
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}

// ============================================
// 7. 使用例
// ============================================

/*
// Express ミドルウェアとして使用
import express from 'express';

const app = express();

// Token Bucket（バースト許容）
app.use('/api', createRateLimitMiddleware({
  algorithm: 'token-bucket',
  tokenBucket: {
    capacity: 100,    // 最大100リクエスト
    refillRate: 10,   // 10リクエスト/秒で補充
  },
}));

// Sliding Window（厳密な制限）
app.use('/api/sensitive', createRateLimitMiddleware({
  algorithm: 'sliding-window',
  slidingWindow: {
    windowMs: 60 * 1000,  // 1分
    limit: 10,            // 10リクエスト/分
  },
  keyGenerator: (req) => req.user?.id || req.ip,
}));

// カスタムハンドラー
app.use('/api/premium', createRateLimitMiddleware({
  algorithm: 'token-bucket',
  tokenBucket: { capacity: 1000, refillRate: 100 },
  onLimitExceeded: (req, res, result) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Upgrade to premium for higher limits',
        retryAfter: result.retryAfter,
        upgradeUrl: '/pricing',
      },
    });
  },
}));

// 特定条件でスキップ
app.use(createRateLimitMiddleware({
  algorithm: 'sliding-window',
  slidingWindow: { windowMs: 60000, limit: 100 },
  skip: (req) => req.headers['x-internal-request'] === 'true',
}));

// デコレーターとして使用
class ApiService {
  @RateLimit({ capacity: 10, refillRate: 1 })
  async expensiveOperation(): Promise<Result> {
    // ...
  }
}
*/
