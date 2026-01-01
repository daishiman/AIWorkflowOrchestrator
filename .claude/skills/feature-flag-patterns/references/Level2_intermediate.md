# Level 2: Feature Flag 実装パターン

## 目的

実践的なFeature Flag実装パターンと、プロダクション環境での使用方法を学ぶ。

---

## 実装アーキテクチャ

### レイヤー構造

```
┌─────────────────────────────────┐
│  Application Code               │  ← ビジネスロジック
├─────────────────────────────────┤
│  Feature Flag Service (Facade)  │  ← 抽象化レイヤー
├─────────────────────────────────┤
│  Flag Provider (LaunchDarkly等) │  ← 実装レイヤー
└─────────────────────────────────┘
```

---

## 実装パターン

### Pattern 1: Simple Boolean Toggle

**適用**: 小規模プロジェクト、シンプルなON/OFF制御

```typescript
// config/feature-flags.ts
export const featureFlags = {
  newDashboard: process.env.FEATURE_NEW_DASHBOARD === 'true',
  darkMode: process.env.FEATURE_DARK_MODE === 'true',
} as const;

// 使用例
if (featureFlags.newDashboard) {
  return <NewDashboard />;
}
```

**長所**: シンプル、依存なし
**短所**: 動的変更不可、ユーザー単位制御不可

### Pattern 2: Configuration Service

**適用**: 中規模プロジェクト、環境別設定が必要

```typescript
// services/feature-flag-service.ts
class FeatureFlagService {
  private config: FeatureFlagConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  isEnabled(flagName: string, context?: EvaluationContext): boolean {
    const flag = this.config.flags[flagName];
    if (!flag) {
      logger.warn(`Unknown flag: ${flagName}`);
      return false; // Safe default
    }

    return this.evaluate(flag, context);
  }

  private evaluate(flag: FlagConfig, context?: EvaluationContext): boolean {
    // デフォルト値
    if (!context) return flag.defaultValue;

    // ユーザーターゲティング
    if (flag.targetUsers && context.userId) {
      return flag.targetUsers.includes(context.userId);
    }

    // パーセンテージロールアウト
    if (flag.rolloutPercentage !== undefined) {
      return this.isInRollout(context.userId, flag.rolloutPercentage);
    }

    return flag.defaultValue;
  }

  private isInRollout(userId: string, percentage: number): boolean {
    // ハッシュベースの一貫した割り当て
    const hash = this.hashUserId(userId);
    return hash % 100 < percentage;
  }
}
```

### Pattern 3: External Provider Integration

**適用**: 大規模プロジェクト、高度なターゲティングが必要

```typescript
// services/feature-flag-service.ts
import { LDClient } from "launchdarkly-node-server-sdk";

class FeatureFlagService {
  private client: LDClient;

  async isEnabled(
    flagName: string,
    context: EvaluationContext,
  ): Promise<boolean> {
    try {
      return await this.client.variation(
        flagName,
        this.buildLDContext(context),
        false, // デフォルト値
      );
    } catch (error) {
      logger.error("Flag evaluation failed", { flagName, error });
      return false; // Safe fallback
    }
  }

  private buildLDContext(context: EvaluationContext) {
    return {
      kind: "user",
      key: context.userId,
      email: context.userEmail,
      custom: {
        organizationId: context.organizationId,
        plan: context.plan,
      },
    };
  }
}
```

---

## フラグ評価コンテキスト

### Evaluation Context設計

```typescript
interface EvaluationContext {
  // ユーザー情報
  userId: string;
  userEmail?: string;
  userRole?: string[];

  // 組織情報
  organizationId?: string;
  organizationPlan?: "free" | "pro" | "enterprise";

  // 環境情報
  environment: "development" | "staging" | "production";
  region?: string;

  // リクエスト情報
  requestId?: string;
  timestamp: number;
}
```

---

## フラグ設定フォーマット

### JSON Schema

```json
{
  "flags": {
    "release_new_checkout": {
      "type": "release",
      "enabled": true,
      "defaultValue": false,
      "rolloutPercentage": 10,
      "targetUsers": ["user_123", "user_456"],
      "targetOrganizations": ["org_abc"],
      "expiryDate": "2025-03-31",
      "owner": "checkout-team",
      "description": "新しいチェックアウトフロー"
    },
    "exp_button_color": {
      "type": "experiment",
      "enabled": true,
      "variants": {
        "control": { "color": "blue", "weight": 50 },
        "treatment": { "color": "red", "weight": 50 }
      },
      "expiryDate": "2025-02-28",
      "owner": "growth-team"
    }
  }
}
```

---

## テスト戦略

### Unit Test

```typescript
describe("FeatureFlagService", () => {
  let service: FeatureFlagService;

  beforeEach(() => {
    service = new FeatureFlagService();
  });

  describe("release_new_checkout", () => {
    it("should return false when flag is disabled", () => {
      const context = { userId: "user_123", environment: "production" };
      expect(service.isEnabled("release_new_checkout", context)).toBe(false);
    });

    it("should return true for target users", () => {
      const context = { userId: "user_123", environment: "production" };
      expect(service.isEnabled("release_new_checkout", context)).toBe(true);
    });

    it("should respect rollout percentage", () => {
      // 10%ロールアウト時のテスト
      const results = new Array(100).fill(0).map((_, i) => {
        const context = { userId: `user_${i}`, environment: "production" };
        return service.isEnabled("release_new_checkout", context);
      });

      const enabledCount = results.filter(Boolean).length;
      expect(enabledCount).toBeGreaterThanOrEqual(5); // 5-15%の範囲
      expect(enabledCount).toBeLessThanOrEqual(15);
    });
  });
});
```

### Integration Test

```typescript
describe("Feature Flag Integration", () => {
  it("should maintain consistent evaluation within session", async () => {
    const userId = "user_123";
    const context = { userId, environment: "production" };

    // 同じユーザーIDで複数回評価
    const results = await Promise.all([
      service.isEnabled("release_new_checkout", context),
      service.isEnabled("release_new_checkout", context),
      service.isEnabled("release_new_checkout", context),
    ]);

    // すべて同じ結果であること
    expect(new Set(results).size).toBe(1);
  });
});
```

---

## ロギングとモニタリング

### フラグ評価ログ

```typescript
class FeatureFlagService {
  isEnabled(flagName: string, context: EvaluationContext): boolean {
    const startTime = Date.now();
    const result = this.evaluate(flagName, context);
    const duration = Date.now() - startTime;

    logger.debug("Flag evaluated", {
      flagName,
      result,
      userId: context.userId,
      duration,
      timestamp: new Date().toISOString(),
    });

    // メトリクス送信
    metrics.increment("feature_flag.evaluation", {
      flag: flagName,
      result: result.toString(),
    });

    return result;
  }
}
```

### メトリクス収集

監視すべき指標:

| メトリクス                 | 目的                 |
| -------------------------- | -------------------- |
| 評価回数                   | 使用頻度の把握       |
| 評価レイテンシ             | パフォーマンス監視   |
| エラー率                   | 障害検知             |
| フラグごとのTrue/False比率 | ロールアウト進捗確認 |

---

## パフォーマンス最適化

### Caching Strategy

```typescript
class FeatureFlagService {
  private cache: Map<string, CachedFlag> = new Map();
  private cacheTTL = 60000; // 1分

  async isEnabled(
    flagName: string,
    context: EvaluationContext,
  ): Promise<boolean> {
    const cacheKey = `${flagName}:${context.userId}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.value;
    }

    const value = await this.evaluateFromProvider(flagName, context);

    this.cache.set(cacheKey, {
      value,
      timestamp: Date.now(),
    });

    return value;
  }
}
```

### Batch Evaluation

```typescript
// 複数フラグを一度に評価
const flags = await service.evaluateMultiple(
  ["release_new_checkout", "exp_button_color", "dark_mode"],
  context,
);

// { release_new_checkout: true, exp_button_color: 'red', dark_mode: false }
```

---

## エラーハンドリング

### Graceful Degradation

```typescript
class FeatureFlagService {
  isEnabled(flagName: string, context: EvaluationContext): boolean {
    try {
      return this.evaluate(flagName, context);
    } catch (error) {
      logger.error("Flag evaluation failed", {
        flagName,
        error,
        context,
      });

      // Safe fallback
      return this.getSafeDefault(flagName);
    }
  }

  private getSafeDefault(flagName: string): boolean {
    // Release Toggles: デフォルトOFF（安全）
    if (flagName.startsWith("release_")) return false;

    // Ops Toggles: デフォルトON（機能有効）
    if (flagName.startsWith("ops_")) return true;

    // その他: 保守的にOFF
    return false;
  }
}
```

---

## 次のステップ

Level 2を理解したら、Level 3で高度な戦略を学ぶ:

- [Level3_advanced.md](Level3_advanced.md)
