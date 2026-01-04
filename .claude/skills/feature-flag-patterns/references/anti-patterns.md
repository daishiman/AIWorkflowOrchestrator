# アンチパターン集

## フラグのネスト

### 問題

```typescript
// ❌ 悪い例: ネストされたフラグ
if (isEnabled("feature-a")) {
  if (isEnabled("feature-b")) {
    // 4つの状態を考慮する必要がある
  }
}
```

### 解決策

```typescript
// ✅ 良い例: 独立したフラグ
const config = {
  useNewCheckout: isEnabled("new-checkout"),
  useNewPayment: isEnabled("new-payment"),
};
```

## 無期限フラグ

### 問題

- テクニカルデットの蓄積
- コードの複雑化
- メンテナンスコストの増加

### 解決策

```typescript
const flag: FeatureFlag = {
  name: "my-feature",
  expiresAt: "2026-03-01", // 必須
  owner: "team-name", // 責任者を明確に
};
```

## ビジネスロジックへの埋め込み

### 問題

```typescript
// ❌ 悪い例: ビジネスロジックにフラグを散らばらせる
function calculatePrice(item: Item): number {
  let price = item.basePrice;

  if (isEnabled("summer-discount")) {
    price *= 0.9;
  }

  if (isEnabled("loyalty-bonus")) {
    price *= 0.95;
  }

  return price;
}
```

### 解決策

```typescript
// ✅ 良い例: ストラテジーパターンで分離
interface PricingStrategy {
  calculate(item: Item): number;
}

const strategy = isEnabled("new-pricing")
  ? new NewPricingStrategy()
  : new LegacyPricingStrategy();

const price = strategy.calculate(item);
```

## 命名の不統一

### 問題

```typescript
// ❌ 悪い例: 一貫性のない命名
isEnabled("new_checkout"); // snake_case
isEnabled("newPaymentFlow"); // camelCase
isEnabled("NEW-DASHBOARD"); // UPPER-KEBAB
```

### 解決策

```typescript
// ✅ 良い例: kebab-caseで統一
isEnabled("new-checkout");
isEnabled("new-payment-flow");
isEnabled("new-dashboard");
```

## テストの欠如

### 問題

- フラグの両状態がテストされていない
- 本番で予期せぬ挙動

### 解決策

```typescript
describe("checkout flow", () => {
  it("works with new checkout enabled", () => {
    mockFlag("new-checkout", true);
    // テスト
  });

  it("works with new checkout disabled", () => {
    mockFlag("new-checkout", false);
    // テスト
  });
});
```

## 回避すべきパターン一覧

| パターン              | 問題         | 対策                   |
| --------------------- | ------------ | ---------------------- |
| フラグのネスト        | 状態爆発     | フラットな構造に       |
| 無期限フラグ          | デット蓄積   | 有効期限を設定         |
| ロジック埋め込み      | 可読性低下   | ストラテジーパターン   |
| 命名不統一            | 管理困難     | 命名規則を統一         |
| テスト不足            | 予期せぬ挙動 | 両状態をテスト         |
| デフォルト値が unsafe | 障害時に問題 | 安全な値をデフォルトに |
