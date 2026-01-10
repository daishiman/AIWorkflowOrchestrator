# ロールアウト戦略

## パーセンテージベース

### 段階的ロールアウト

```
1%  → 社内テスト（1-3日）
10% → 早期採用者（3-7日）
50% → 一般ユーザー（7-14日）
100% → 全ユーザー
```

### 実装

```typescript
function isEnabledByPercentage(
  flagName: string,
  userId: string,
  percentage: number,
): boolean {
  const hash = murmurhash3(flagName + userId) % 100;
  return hash < percentage;
}
```

## コホートベース

### ユーザー属性による分類

| 属性         | 例                      |
| ------------ | ----------------------- |
| 国・地域     | JP, US, EU              |
| プラン       | free, pro, enterprise   |
| ユーザー種別 | internal, beta, general |

### 実装

```typescript
function isEnabledByCohort(
  context: EvaluationContext,
  targetCohorts: string[],
): boolean {
  const userCohorts = getUserCohorts(context.userId);
  return targetCohorts.some((cohort) => userCohorts.includes(cohort));
}
```

## カナリアリリース

### 特徴

- 少数のサーバー/インスタンスで先行リリース
- メトリクス監視で問題を早期検出
- 自動ロールバック条件を設定

### 監視メトリクス

| メトリクス     | 閾値例 | アクション       |
| -------------- | ------ | ---------------- |
| エラー率       | > 1%   | 自動ロールバック |
| レイテンシ P99 | > 2秒  | アラート         |
| 成功率         | < 99%  | 調査             |

## 時間ベース

### スケジュールリリース

```typescript
interface ScheduledRollout {
  flagName: string;
  schedule: {
    startAt: Date;
    endAt: Date;
    percentage: number;
  }[];
}

// 例: 業務時間外に段階的ロールアウト
const schedule: ScheduledRollout = {
  flagName: "new-feature",
  schedule: [
    { startAt: new Date("2026-01-05T22:00:00Z"), endAt: null, percentage: 10 },
    { startAt: new Date("2026-01-06T22:00:00Z"), endAt: null, percentage: 50 },
    { startAt: new Date("2026-01-07T22:00:00Z"), endAt: null, percentage: 100 },
  ],
};
```

## ロールバック戦略

### Kill Switch

```typescript
async function killSwitch(flagName: string): Promise<void> {
  await flagService.update(flagName, {
    enabled: false,
    rollout: { percentage: 0 },
    reason: "Emergency rollback",
  });

  logger.alert(`Kill switch activated: ${flagName}`);
}
```
