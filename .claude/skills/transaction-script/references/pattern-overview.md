# トランザクションスクリプトパターン詳解

## 概要

トランザクションスクリプトは、ビジネスロジックを手続き型で組織化するパターンです。
各リクエストに対して一つのスクリプト（手続き）が対応し、そのスクリプトが
すべての処理を直接実行します。

## パターンの起源

マーティン・ファウラーが『Patterns of Enterprise Application Architecture (PofEAA)』で定義。
エンタープライズアプリケーションにおけるドメインロジックパターンの一つです。

## 構造

```
┌─────────────────────────────────────────────┐
│           プレゼンテーション層              │
│          (Controller/Handler)               │
└─────────────────────┬───────────────────────┘
                      │ リクエスト
                      ▼
┌─────────────────────────────────────────────┐
│         トランザクションスクリプト          │
│  ┌─────────────────────────────────────┐    │
│  │ 1. 入力検証                         │    │
│  │ 2. データ取得（リポジトリ経由）     │    │
│  │ 3. ビジネスロジック実行             │    │
│  │ 4. データ永続化                     │    │
│  │ 5. 結果返却                         │    │
│  └─────────────────────────────────────┘    │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│              データソース層                 │
│         (Repository/Gateway)                │
└─────────────────────────────────────────────┘
```

## 実装パターン

### 基本形

```typescript
async function processOrder(
  orderId: string,
  userId: string,
): Promise<OrderResult> {
  // 1. 入力検証
  if (!orderId || !userId) {
    throw new ValidationError("OrderId and UserId are required");
  }

  // 2. データ取得
  const order = await orderRepository.findById(orderId);
  const user = await userRepository.findById(userId);

  if (!order || !user) {
    throw new NotFoundError("Order or User not found");
  }

  // 3. ビジネスロジック
  if (order.status !== "pending") {
    throw new BusinessError("Order is not in pending status");
  }

  const total = calculateTotal(order.items);
  const discount = calculateDiscount(user.tier, total);
  const finalAmount = total - discount;

  // 4. 永続化
  order.status = "processed";
  order.amount = finalAmount;
  order.processedAt = new Date();
  await orderRepository.save(order);

  // 5. 結果返却
  return {
    orderId: order.id,
    amount: finalAmount,
    status: order.status,
  };
}
```

### クラスベース

```typescript
class OrderProcessor {
  constructor(
    private orderRepository: OrderRepository,
    private userRepository: UserRepository,
  ) {}

  async process(orderId: string, userId: string): Promise<OrderResult> {
    // 同様の処理...
  }
}
```

## 特徴

### 利点

1. **シンプル**: 手続き型で直感的
2. **理解しやすい**: 上から下への流れ
3. **変更容易**: 影響範囲が限定的
4. **デバッグ容易**: 処理フローが明確

### 欠点

1. **重複しやすい**: 類似ロジックの重複
2. **スケール困難**: 複雑になると管理困難
3. **ドメイン知識分散**: ビジネスルールが散在

## ベストプラクティス

### すべきこと

- 一つのスクリプトは一つのトランザクション
- 明確な関数名でトランザクションを表現
- 共通ロジックは関数に抽出

### 避けるべきこと

- 巨大なスクリプト（100行超）
- 深いネスト（3段階超）
- 過度な抽象化

## 適用条件

### 適切な場合

- シンプルなビジネスロジック
- CRUD操作が中心
- チームが手続き型に慣れている
- 短期プロジェクト

### 不適切な場合

- 複雑なビジネスルール
- 同じルールが複数箇所で必要
- エンティティ間の関係が複雑
- 長期的な保守が必要
