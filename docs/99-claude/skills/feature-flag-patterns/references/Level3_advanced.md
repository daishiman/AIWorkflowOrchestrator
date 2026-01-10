# Level 3: 高度な戦略

## 複雑なロールアウト戦略

### コホートベースロールアウト

ユーザー属性に基づいてロールアウトを制御:

```typescript
interface CohortRule {
  attribute: string; // "country" | "plan" | "userGroup"
  operator: "eq" | "in" | "gt" | "lt";
  value: string | string[] | number;
}

function evaluateCohort(user: User, rules: CohortRule[]): boolean {
  return rules.every((rule) => {
    const userValue = user[rule.attribute];
    switch (rule.operator) {
      case "eq":
        return userValue === rule.value;
      case "in":
        return (rule.value as string[]).includes(userValue);
      // ...
    }
  });
}
```

### ダークローンチ

ユーザーに見せずに本番データで新機能をテスト:

```typescript
async function darkLaunch(request: Request): Promise<void> {
  // 新旧両方で処理を実行
  const [oldResult, newResult] = await Promise.all([
    oldImplementation(request),
    newImplementation(request).catch((err) => ({ error: err })),
  ]);

  // 結果を比較・ログ（古い結果を返す）
  if (JSON.stringify(oldResult) !== JSON.stringify(newResult)) {
    logger.warn("Dark launch mismatch", { oldResult, newResult });
  }
}
```

## マルチバリエントフラグ

A/Bテスト以上のバリエーション:

```typescript
type Variant = "control" | "variant_a" | "variant_b" | "variant_c";

function getVariant(flagName: string, userId: string): Variant {
  const hash = hashUserId(flagName + userId) % 100;
  if (hash < 25) return "control";
  if (hash < 50) return "variant_a";
  if (hash < 75) return "variant_b";
  return "variant_c";
}
```

## フラグ依存関係管理

フラグ間の依存関係を明示的に管理:

```typescript
const flagDependencies: Record<string, string[]> = {
  "new-checkout": ["payment-v2", "cart-v2"],
  "payment-v2": [],
};

function canEnableFlag(flagName: string): boolean {
  const deps = flagDependencies[flagName] || [];
  return deps.every((dep) => isEnabled(dep));
}
```
