# Quota Management（クォータ管理）

## 概要

クォータ管理は、APIの使用量を追跡し、
契約やプランに基づいた制限を適用するための仕組みです。

## クォータ vs レート制限

| 観点     | レート制限     | クォータ       |
| -------- | -------------- | -------------- |
| 目的     | バースト制御   | 使用量制限     |
| 期間     | 短期（秒〜分） | 長期（日〜月） |
| リセット | 自動           | 計画的         |
| 課金連携 | なし           | あり           |
| 超過時   | 一時拒否       | 追加課金/停止  |

## クォータ設計

### 階層型クォータ

```typescript
interface QuotaConfig {
  // 基本クォータ
  daily: number; // 1日あたり
  monthly: number; // 1ヶ月あたり

  // 細分化クォータ
  perEndpoint?: Record<string, number>;

  // リソース別クォータ
  storage?: number; // バイト
  compute?: number; // CPU秒

  // バースト許容
  burstAllowance?: number;
}

const quotaPlans: Record<string, QuotaConfig> = {
  free: {
    daily: 1000,
    monthly: 10000,
    perEndpoint: {
      "POST /api/generate": 100,
      "POST /api/upload": 10,
    },
    storage: 100 * 1024 * 1024, // 100MB
  },

  pro: {
    daily: 10000,
    monthly: 100000,
    perEndpoint: {
      "POST /api/generate": 1000,
      "POST /api/upload": 100,
    },
    storage: 1024 * 1024 * 1024, // 1GB
    burstAllowance: 0.1, // 10%追加許容
  },

  enterprise: {
    daily: 100000,
    monthly: 1000000,
    storage: 10 * 1024 * 1024 * 1024, // 10GB
    burstAllowance: 0.2,
  },
};
```

## 使用量追跡

### 基本実装

```typescript
interface UsageRecord {
  userId: string;
  period: string; // "2024-01" (月) or "2024-01-15" (日)
  endpoint?: string;
  count: number;
  lastUpdated: Date;
}

class UsageTracker {
  private readonly storage: Map<string, UsageRecord> = new Map();

  async increment(
    userId: string,
    endpoint?: string,
    amount: number = 1,
  ): Promise<UsageRecord> {
    const dailyKey = this.getDailyKey(userId, endpoint);
    const monthlyKey = this.getMonthlyKey(userId, endpoint);

    // 日次と月次の両方を更新
    await Promise.all([
      this.incrementKey(dailyKey, amount),
      this.incrementKey(monthlyKey, amount),
    ]);

    return this.storage.get(dailyKey)!;
  }

  private async incrementKey(key: string, amount: number): Promise<void> {
    let record = this.storage.get(key);

    if (!record) {
      const [userId, period, endpoint] = key.split(":");
      record = {
        userId,
        period,
        endpoint: endpoint || undefined,
        count: 0,
        lastUpdated: new Date(),
      };
      this.storage.set(key, record);
    }

    record.count += amount;
    record.lastUpdated = new Date();
  }

  async getUsage(
    userId: string,
    type: "daily" | "monthly",
    endpoint?: string,
  ): Promise<number> {
    const key =
      type === "daily"
        ? this.getDailyKey(userId, endpoint)
        : this.getMonthlyKey(userId, endpoint);

    return this.storage.get(key)?.count || 0;
  }

  private getDailyKey(userId: string, endpoint?: string): string {
    const date = new Date().toISOString().split("T")[0];
    return endpoint ? `${userId}:${date}:${endpoint}` : `${userId}:${date}`;
  }

  private getMonthlyKey(userId: string, endpoint?: string): string {
    const month = new Date().toISOString().slice(0, 7);
    return endpoint ? `${userId}:${month}:${endpoint}` : `${userId}:${month}`;
  }
}
```

### Redis実装

```typescript
class RedisUsageTracker {
  constructor(private readonly redis: Redis) {}

  async increment(
    userId: string,
    endpoint?: string,
    amount: number = 1,
  ): Promise<{ daily: number; monthly: number }> {
    const now = new Date();
    const dailyKey = this.getDailyKey(userId, endpoint, now);
    const monthlyKey = this.getMonthlyKey(userId, endpoint, now);

    const pipeline = this.redis.pipeline();

    // 日次カウンター
    pipeline.incrby(dailyKey, amount);
    pipeline.expire(dailyKey, 48 * 3600); // 48時間でTTL

    // 月次カウンター
    pipeline.incrby(monthlyKey, amount);
    pipeline.expire(monthlyKey, 35 * 24 * 3600); // 35日でTTL

    const results = await pipeline.exec();

    return {
      daily: (results?.[0]?.[1] as number) || 0,
      monthly: (results?.[2]?.[1] as number) || 0,
    };
  }

  async getUsage(
    userId: string,
    endpoint?: string,
  ): Promise<{
    daily: number;
    monthly: number;
  }> {
    const now = new Date();
    const dailyKey = this.getDailyKey(userId, endpoint, now);
    const monthlyKey = this.getMonthlyKey(userId, endpoint, now);

    const [daily, monthly] = await this.redis.mget(dailyKey, monthlyKey);

    return {
      daily: parseInt(daily || "0", 10),
      monthly: parseInt(monthly || "0", 10),
    };
  }

  private getDailyKey(
    userId: string,
    endpoint: string | undefined,
    date: Date,
  ): string {
    const day = date.toISOString().split("T")[0];
    return endpoint
      ? `quota:daily:${userId}:${endpoint}:${day}`
      : `quota:daily:${userId}:${day}`;
  }

  private getMonthlyKey(
    userId: string,
    endpoint: string | undefined,
    date: Date,
  ): string {
    const month = date.toISOString().slice(0, 7);
    return endpoint
      ? `quota:monthly:${userId}:${endpoint}:${month}`
      : `quota:monthly:${userId}:${month}`;
  }
}
```

## クォータ強制

### ミドルウェア実装

```typescript
interface QuotaResult {
  allowed: boolean;
  usage: {
    daily: number;
    monthly: number;
  };
  limits: {
    daily: number;
    monthly: number;
  };
  remaining: {
    daily: number;
    monthly: number;
  };
  resetAt: {
    daily: number;
    monthly: number;
  };
}

class QuotaEnforcer {
  constructor(
    private readonly tracker: RedisUsageTracker,
    private readonly plans: Record<string, QuotaConfig>,
  ) {}

  async check(
    userId: string,
    plan: string,
    endpoint?: string,
  ): Promise<QuotaResult> {
    const config = this.plans[plan];
    if (!config) {
      throw new Error(`Unknown plan: ${plan}`);
    }

    const usage = await this.tracker.getUsage(userId, endpoint);

    // エンドポイント別制限
    let dailyLimit = config.daily;
    let monthlyLimit = config.monthly;

    if (endpoint && config.perEndpoint?.[endpoint]) {
      dailyLimit = Math.min(dailyLimit, config.perEndpoint[endpoint]);
    }

    // バースト許容
    if (config.burstAllowance) {
      dailyLimit = Math.floor(dailyLimit * (1 + config.burstAllowance));
      monthlyLimit = Math.floor(monthlyLimit * (1 + config.burstAllowance));
    }

    const allowed = usage.daily < dailyLimit && usage.monthly < monthlyLimit;

    return {
      allowed,
      usage,
      limits: { daily: dailyLimit, monthly: monthlyLimit },
      remaining: {
        daily: Math.max(0, dailyLimit - usage.daily),
        monthly: Math.max(0, monthlyLimit - usage.monthly),
      },
      resetAt: {
        daily: this.getNextDayReset(),
        monthly: this.getNextMonthReset(),
      },
    };
  }

  private getNextDayReset(): number {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }

  private getNextMonthReset(): number {
    const nextMonth = new Date();
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
    nextMonth.setUTCDate(1);
    nextMonth.setUTCHours(0, 0, 0, 0);
    return nextMonth.getTime();
  }
}

// Express ミドルウェア
function quotaMiddleware(enforcer: QuotaEnforcer) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const userId = req.user?.id;
    const plan = req.user?.plan || "free";
    const endpoint = `${req.method} ${req.path}`;

    if (!userId) {
      return next();
    }

    const result = await enforcer.check(userId, plan, endpoint);

    // ヘッダー設定
    res.setHeader("X-Quota-Limit-Daily", result.limits.daily);
    res.setHeader("X-Quota-Remaining-Daily", result.remaining.daily);
    res.setHeader(
      "X-Quota-Reset-Daily",
      Math.ceil(result.resetAt.daily / 1000),
    );
    res.setHeader("X-Quota-Limit-Monthly", result.limits.monthly);
    res.setHeader("X-Quota-Remaining-Monthly", result.remaining.monthly);
    res.setHeader(
      "X-Quota-Reset-Monthly",
      Math.ceil(result.resetAt.monthly / 1000),
    );

    if (!result.allowed) {
      res.status(429).json({
        error: {
          code: "QUOTA_EXCEEDED",
          message: "Quota exceeded",
          usage: result.usage,
          limits: result.limits,
          resetAt: result.resetAt,
        },
      });
      return;
    }

    // 使用量を記録
    await enforcer.tracker.increment(userId, endpoint);

    next();
  };
}
```

## アラートと通知

### クォータアラート

```typescript
interface AlertConfig {
  thresholds: number[]; // [0.5, 0.8, 0.9, 1.0]
  notifyFn: (
    userId: string,
    usage: number,
    limit: number,
    threshold: number,
  ) => Promise<void>;
}

class QuotaAlertManager {
  private sentAlerts: Map<string, Set<number>> = new Map();

  constructor(private readonly config: AlertConfig) {}

  async checkAndAlert(
    userId: string,
    usage: number,
    limit: number,
  ): Promise<void> {
    const ratio = usage / limit;
    const alertKey = `${userId}:${this.getCurrentPeriod()}`;

    let sentThresholds = this.sentAlerts.get(alertKey);
    if (!sentThresholds) {
      sentThresholds = new Set();
      this.sentAlerts.set(alertKey, sentThresholds);
    }

    for (const threshold of this.config.thresholds) {
      if (ratio >= threshold && !sentThresholds.has(threshold)) {
        await this.config.notifyFn(userId, usage, limit, threshold);
        sentThresholds.add(threshold);
      }
    }
  }

  private getCurrentPeriod(): string {
    return new Date().toISOString().slice(0, 7); // YYYY-MM
  }

  // 月初にリセット
  resetAlerts(): void {
    this.sentAlerts.clear();
  }
}

// 使用例
const alertManager = new QuotaAlertManager({
  thresholds: [0.5, 0.8, 0.9, 1.0],
  notifyFn: async (userId, usage, limit, threshold) => {
    console.log(
      `User ${userId}: ${threshold * 100}% quota used (${usage}/${limit})`,
    );
    // メール送信、Slack通知など
  },
});
```

## ダッシュボード用データ

### 使用量サマリー

```typescript
interface UsageSummary {
  userId: string;
  plan: string;
  period: {
    start: Date;
    end: Date;
  };
  usage: {
    total: number;
    byEndpoint: Record<string, number>;
    byDay: Array<{ date: string; count: number }>;
  };
  quota: {
    limit: number;
    remaining: number;
    percentUsed: number;
  };
}

async function getUserUsageSummary(
  userId: string,
  tracker: RedisUsageTracker,
  plans: Record<string, QuotaConfig>,
  userPlan: string,
): Promise<UsageSummary> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const usage = await tracker.getUsage(userId);
  const config = plans[userPlan];

  return {
    userId,
    plan: userPlan,
    period: {
      start: monthStart,
      end: monthEnd,
    },
    usage: {
      total: usage.monthly,
      byEndpoint: {}, // 詳細実装
      byDay: [], // 詳細実装
    },
    quota: {
      limit: config.monthly,
      remaining: Math.max(0, config.monthly - usage.monthly),
      percentUsed: (usage.monthly / config.monthly) * 100,
    },
  };
}
```

## チェックリスト

### 設計時

- [ ] プラン別のクォータを定義したか？
- [ ] リセット周期を決定したか？
- [ ] アラート閾値を設定したか？

### 実装時

- [ ] 使用量追跡が正確か？
- [ ] アトミックなインクリメントか？
- [ ] ダウンタイム時の対応は？

### 運用時

- [ ] 使用量ダッシュボードがあるか？
- [ ] アラート通知が機能しているか？
- [ ] プラン変更時の処理は？

## 参考

- **Stripe API**: Usage-based billing
- **AWS**: Service Quotas
