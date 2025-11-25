# ドメインサービスの使いどころ

## 概要

ドメインサービスは、DDDにおいて「エンティティや値オブジェクトに自然に属さない
ドメインロジック」をカプセル化するために使用します。

このドキュメントでは、ドメインサービスが必要な場面と判断基準を解説します。

## 基本的な判断フロー

```
ドメインロジックが必要
    │
    ├─ 特定のエンティティに属する？
    │    └─ Yes → エンティティのメソッドとして実装
    │
    ├─ 値オブジェクトの操作？
    │    └─ Yes → 値オブジェクトのメソッドとして実装
    │
    ├─ 複数の集約をまたがる？
    │    └─ Yes → ドメインサービス
    │
    ├─ ビジネスポリシー/計算ロジック？
    │    └─ Yes → ドメインサービス
    │
    └─ 外部リソースが必要？
         └─ Yes → アプリケーションサービス
```

## ドメインサービスが必要な場面

### 1. 複数の集約をまたがる操作

**特徴**:
- 1つのエンティティに属さない操作
- 複数のエンティティを協調させる
- どのエンティティが主体か不明確

**例：送金処理**

```typescript
// ❌ どちらのAccountに属するか不明確
class Account {
  transferTo(target: Account, amount: Money): void {
    this.withdraw(amount);
    target.deposit(amount);  // 他の集約を操作している
  }
}

// ✅ ドメインサービスで表現
class TransferService {
  transfer(from: Account, to: Account, amount: Money): void {
    if (from.balance.isLessThan(amount)) {
      throw new InsufficientFundsError();
    }
    from.withdraw(amount);
    to.deposit(amount);
  }
}
```

**例：在庫予約**

```typescript
// 複数の在庫から予約する操作
class InventoryReservationService {
  reserve(
    items: OrderItem[],
    warehouses: Warehouse[]
  ): ReservationResult {
    const reservations: Reservation[] = [];

    for (const item of items) {
      const warehouse = this.findAvailableWarehouse(item, warehouses);
      if (!warehouse) {
        throw new ItemNotAvailableError(item.productId);
      }
      reservations.push(warehouse.reserve(item));
    }

    return ReservationResult.success(reservations);
  }
}
```

### 2. ビジネスポリシーの適用

**特徴**:
- ビジネスルールを表現
- 条件に基づく判断
- 複雑な計算ロジック

**例：価格計算ポリシー**

```typescript
class PricingService {
  calculateFinalPrice(
    order: Order,
    customer: Customer,
    coupons: Coupon[]
  ): Money {
    let price = order.subtotal;

    // 会員ランク割引
    const memberDiscount = this.getMemberDiscount(customer.rank);
    price = price.multiply(1 - memberDiscount);

    // クーポン適用（最大割引のものを選択）
    const applicableCoupon = this.selectBestCoupon(coupons, order);
    if (applicableCoupon) {
      price = applicableCoupon.apply(price);
    }

    // 最低価格の保証
    return price.max(order.minimumPrice);
  }

  private getMemberDiscount(rank: CustomerRank): Percentage {
    switch (rank) {
      case CustomerRank.PLATINUM: return Percentage.of(15);
      case CustomerRank.GOLD: return Percentage.of(10);
      case CustomerRank.SILVER: return Percentage.of(5);
      default: return Percentage.of(0);
    }
  }
}
```

**例：配送料計算**

```typescript
class ShippingCostService {
  calculate(
    destination: Address,
    items: OrderItem[],
    shippingMethod: ShippingMethod
  ): Money {
    // 基本料金
    const baseCost = shippingMethod.baseCost;

    // 重量による追加料金
    const totalWeight = items.reduce(
      (sum, item) => sum + item.weight * item.quantity,
      0
    );
    const weightSurcharge = this.calculateWeightSurcharge(totalWeight);

    // 地域による追加料金
    const zoneSurcharge = this.calculateZoneSurcharge(destination);

    return baseCost.add(weightSurcharge).add(zoneSurcharge);
  }
}
```

### 3. 変換・マッピング処理

**特徴**:
- ドメインオブジェクト間の変換
- フォーマット変換
- 集約間のマッピング

**例：注文から請求書への変換**

```typescript
class InvoiceGenerationService {
  generateFromOrder(order: Order, customer: Customer): Invoice {
    return Invoice.create({
      invoiceNumber: InvoiceNumber.generate(),
      customerId: customer.id,
      billingAddress: customer.billingAddress,
      items: order.items.map(item => InvoiceItem.fromOrderItem(item)),
      subtotal: order.subtotal,
      tax: this.calculateTax(order),
      total: order.total,
      dueDate: this.calculateDueDate(customer.paymentTerms),
    });
  }

  private calculateTax(order: Order): Money {
    // 税金計算ロジック
  }

  private calculateDueDate(terms: PaymentTerms): Date {
    // 支払期限計算ロジック
  }
}
```

### 4. 検証・バリデーションサービス

**特徴**:
- 複数エンティティにまたがる検証
- ビジネスルールの整合性チェック

**例：注文可否チェック**

```typescript
class OrderValidationService {
  validate(
    customer: Customer,
    items: OrderItem[],
    shippingAddress: Address
  ): ValidationResult {
    const errors: ValidationError[] = [];

    // 顧客の状態チェック
    if (!customer.isActive) {
      errors.push(new ValidationError('顧客アカウントが無効です'));
    }

    // 与信限度チェック
    const orderTotal = this.calculateTotal(items);
    if (customer.creditLimit.isLessThan(orderTotal)) {
      errors.push(new ValidationError('与信限度を超えています'));
    }

    // 配送先チェック
    if (!this.isDeliverableArea(shippingAddress)) {
      errors.push(new ValidationError('配送対象外の地域です'));
    }

    // 商品在庫チェック
    for (const item of items) {
      if (!item.isAvailable) {
        errors.push(new ValidationError(`${item.productName}は在庫切れです`));
      }
    }

    return errors.length === 0
      ? ValidationResult.valid()
      : ValidationResult.invalid(errors);
  }
}
```

## ドメインサービスを使わない場面

### 1. エンティティに属するロジック

```typescript
// ❌ ドメインサービスにしない
class OrderService {
  addItem(order: Order, item: OrderItem): void {
    order.items.push(item);  // エンティティの内部状態を操作
  }
}

// ✅ エンティティのメソッド
class Order {
  addItem(item: OrderItem): void {
    this._items.push(item);
    this.recalculateTotal();
  }
}
```

### 2. 値オブジェクトの操作

```typescript
// ❌ ドメインサービスにしない
class MoneyService {
  add(a: Money, b: Money): Money {
    return Money.of(a.amount + b.amount, a.currency);
  }
}

// ✅ 値オブジェクトのメソッド
class Money {
  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return Money.of(this.amount + other.amount, this.currency);
  }
}
```

### 3. インフラストラクチャが必要な操作

```typescript
// ❌ ドメインサービスでDBアクセス
class UserDomainService {
  async isEmailUnique(email: EmailAddress): Promise<boolean> {
    const existing = await this.db.query('SELECT ...');  // インフラ依存
    return !existing;
  }
}

// ✅ アプリケーションサービスで処理
class UserApplicationService {
  async register(email: string): Promise<User> {
    const emailAddress = EmailAddress.of(email);
    const existing = await this.userRepository.findByEmail(emailAddress);
    if (existing) {
      throw new EmailAlreadyExistsError();
    }
    return this.userRepository.save(User.create(emailAddress));
  }
}
```

## 判断チェックリスト

### ドメインサービスにすべき場合

- [ ] 操作が特定のエンティティに属さない
- [ ] 複数の集約をまたがる操作である
- [ ] ビジネスポリシーを表現している
- [ ] ステートレスに実装できる
- [ ] インフラストラクチャに依存しない

### エンティティに実装すべき場合

- [ ] 操作がエンティティの状態を変更する
- [ ] 操作がエンティティの不変条件に関わる
- [ ] 操作がエンティティのライフサイクルに関わる

### アプリケーションサービスにすべき場合

- [ ] 外部システムとの連携が必要
- [ ] トランザクション制御が必要
- [ ] ユースケースの調整が必要
- [ ] リポジトリアクセスが必要
