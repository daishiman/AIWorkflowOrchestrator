# Level 4: エキスパートパターン

## スケールとパフォーマンス

### フラグ評価のキャッシング

```typescript
class FlagCache {
  private cache = new Map<string, { value: boolean; expiresAt: number }>();
  private readonly TTL = 60_000; // 1分

  get(key: string): boolean | undefined {
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.expiresAt) {
      return entry.value;
    }
    return undefined;
  }

  set(key: string, value: boolean): void {
    this.cache.set(key, { value, expiresAt: Date.now() + this.TTL });
  }
}
```

### バッチ評価

複数フラグを一度に評価:

```typescript
async function evaluateFlags(
  flagNames: string[],
  context: EvaluationContext,
): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};

  // バッチでリモート設定を取得
  const configs = await fetchFlagConfigs(flagNames);

  for (const config of configs) {
    results[config.name] = evaluateFlag(config, context);
  }

  return results;
}
```

## 障害時の挙動

### サーキットブレーカー

```typescript
class FlagServiceCircuitBreaker {
  private failures = 0;
  private lastFailure: number = 0;
  private readonly threshold = 5;
  private readonly resetTimeout = 30_000;

  async evaluate<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    if (this.isOpen()) {
      return fallback; // フォールバック値を返す
    }

    try {
      const result = await fn();
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure();
      return fallback;
    }
  }

  private isOpen(): boolean {
    if (this.failures >= this.threshold) {
      return Date.now() - this.lastFailure < this.resetTimeout;
    }
    return false;
  }
}
```

## フラグガバナンス

### 自動クリーンアップ

```typescript
async function auditStaleFlags(): Promise<string[]> {
  const flags = await getAllFlags();
  const staleFlags: string[] = [];

  for (const flag of flags) {
    // 90日以上変更なしのフラグを検出
    if (flag.lastModified < Date.now() - 90 * 24 * 60 * 60 * 1000) {
      staleFlags.push(flag.name);
    }

    // 100%ロールアウトで30日以上経過
    if (
      flag.rollout?.percentage === 100 &&
      flag.fullRolloutDate < Date.now() - 30 * 24 * 60 * 60 * 1000
    ) {
      staleFlags.push(flag.name);
    }
  }

  return staleFlags;
}
```

## 参考リンク

- Feature Toggles (Martin Fowler blog)
- Continuous Delivery (Jez Humble)
