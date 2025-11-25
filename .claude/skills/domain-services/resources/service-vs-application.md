# ドメインサービス vs アプリケーションサービス

## 概要

DDDでは「ドメインサービス」と「アプリケーションサービス」という2種類のサービスがあります。
この2つは役割が異なり、適切に区別することが重要です。

## 基本的な違い

| 観点 | ドメインサービス | アプリケーションサービス |
|-----|---------------|---------------------|
| **レイヤー** | ドメイン層 | アプリケーション層 |
| **責務** | ビジネスロジック | ユースケースの調整 |
| **依存** | ドメインオブジェクトのみ | インフラストラクチャも含む |
| **状態** | ステートレス | ステートレス |
| **知識** | ドメイン知識 | アプリケーション知識 |

## 詳細比較

### ドメインサービス

**役割**: エンティティや値オブジェクトに属さないドメインロジックをカプセル化

**特徴**:
- 純粋なビジネスロジック
- インフラストラクチャに依存しない
- ユビキタス言語で命名
- ドメインエキスパートが理解できる

```typescript
// ドメインサービスの例
class PricingService {
  // 純粋な計算ロジック
  calculateDiscount(order: Order, customer: Customer): Percentage {
    const baseDiscount = this.getMemberDiscount(customer.rank);
    const volumeDiscount = this.getVolumeDiscount(order.totalQuantity);
    return baseDiscount.add(volumeDiscount).max(Percentage.of(30));
  }

  private getMemberDiscount(rank: CustomerRank): Percentage {
    switch (rank) {
      case CustomerRank.PLATINUM: return Percentage.of(15);
      case CustomerRank.GOLD: return Percentage.of(10);
      default: return Percentage.of(0);
    }
  }

  private getVolumeDiscount(quantity: number): Percentage {
    if (quantity >= 100) return Percentage.of(10);
    if (quantity >= 50) return Percentage.of(5);
    return Percentage.of(0);
  }
}
```

### アプリケーションサービス

**役割**: ユースケースを実現するためのオーケストレーション

**特徴**:
- ユースケースの調整
- トランザクション制御
- リポジトリとの連携
- 外部サービスとの連携

```typescript
// アプリケーションサービスの例
class OrderApplicationService {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly customerRepository: ICustomerRepository,
    private readonly inventoryService: IInventoryService,
    private readonly pricingService: PricingService,  // ドメインサービスを使用
    private readonly emailService: IEmailService
  ) {}

  async placeOrder(command: PlaceOrderCommand): Promise<OrderId> {
    // トランザクション開始
    return this.unitOfWork.execute(async () => {
      // 1. 顧客を取得
      const customer = await this.customerRepository.getById(command.customerId);

      // 2. 在庫確認（外部サービス）
      const availability = await this.inventoryService.checkAvailability(
        command.items
      );
      if (!availability.isAvailable) {
        throw new InsufficientInventoryError(availability.unavailableItems);
      }

      // 3. 注文作成
      const order = Order.create({
        customerId: customer.id,
        items: command.items,
        shippingAddress: command.shippingAddress,
      });

      // 4. 価格計算（ドメインサービス使用）
      const discount = this.pricingService.calculateDiscount(order, customer);
      order.applyDiscount(discount);

      // 5. 永続化
      await this.orderRepository.save(order);

      // 6. 通知（外部サービス）
      await this.emailService.sendOrderConfirmation(customer.email, order);

      return order.id;
    });
  }
}
```

## 配置と依存関係

```
┌─────────────────────────────────────────────────────────────┐
│                   Presentation Layer                        │
│                     (Controllers)                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Application Services                       │   │
│  │  - OrderApplicationService                          │   │
│  │  - UserApplicationService                           │   │
│  │  - InventoryApplicationService                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
        │                    │                     │
        │                    ▼                     │
        │  ┌────────────────────────────────────┐ │
        │  │         Domain Layer               │ │
        │  │                                    │ │
        │  │  ┌──────────────────────────────┐ │ │
        │  │  │     Domain Services          │ │ │
        │  │  │  - PricingService            │ │ │
        │  │  │  - ShippingCostService       │ │ │
        │  │  │  - TransferService           │ │ │
        │  │  └──────────────────────────────┘ │ │
        │  │                                    │ │
        │  │  ┌──────────────────────────────┐ │ │
        │  │  │   Entities & Value Objects   │ │ │
        │  │  │  - Order, Customer, Money    │ │ │
        │  │  └──────────────────────────────┘ │ │
        │  │                                    │ │
        │  │  ┌──────────────────────────────┐ │ │
        │  │  │   Repository Interfaces      │ │ │
        │  │  │  - IOrderRepository          │ │ │
        │  │  └──────────────────────────────┘ │ │
        │  └────────────────────────────────────┘ │
        │                                         │
        ▼                                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                       │
│  - Repository Implementations                               │
│  - External Service Adapters                                │
│  - Database Access                                          │
└─────────────────────────────────────────────────────────────┘
```

## 判断フローチャート

```
操作を実装したい
    │
    ├─ 外部リソース（DB、API）が必要？
    │    └─ Yes → アプリケーションサービス
    │
    ├─ トランザクション制御が必要？
    │    └─ Yes → アプリケーションサービス
    │
    ├─ ユースケースの調整が主な役割？
    │    └─ Yes → アプリケーションサービス
    │
    ├─ 純粋なビジネスロジック？
    │    └─ Yes → ドメインサービス（または エンティティ）
    │
    └─ 複数の集約をまたがるドメインロジック？
         └─ Yes → ドメインサービス
```

## 具体例による比較

### 例1: 送金処理

```typescript
// ❌ アプリケーションサービスにドメインロジックを入れない
class TransferApplicationService {
  async transfer(command: TransferCommand): Promise<void> {
    const fromAccount = await this.accountRepository.getById(command.from);
    const toAccount = await this.accountRepository.getById(command.to);
    const amount = Money.of(command.amount, command.currency);

    // ❌ ビジネスロジックがアプリケーション層に漏れている
    if (fromAccount.balance.isLessThan(amount)) {
      throw new InsufficientFundsError();
    }
    fromAccount.setBalance(fromAccount.balance.subtract(amount));
    toAccount.setBalance(toAccount.balance.add(amount));

    await this.accountRepository.save(fromAccount);
    await this.accountRepository.save(toAccount);
  }
}

// ✅ ドメインサービスにビジネスロジックをカプセル化
class TransferService {
  transfer(from: Account, to: Account, amount: Money): void {
    if (from.balance.isLessThan(amount)) {
      throw new InsufficientFundsError();
    }
    from.withdraw(amount);
    to.deposit(amount);
  }
}

class TransferApplicationService {
  constructor(
    private readonly accountRepository: IAccountRepository,
    private readonly transferService: TransferService
  ) {}

  async transfer(command: TransferCommand): Promise<void> {
    const fromAccount = await this.accountRepository.getById(command.from);
    const toAccount = await this.accountRepository.getById(command.to);
    const amount = Money.of(command.amount, command.currency);

    // ✅ ドメインサービスを呼び出す
    this.transferService.transfer(fromAccount, toAccount, amount);

    await this.accountRepository.save(fromAccount);
    await this.accountRepository.save(toAccount);
  }
}
```

### 例2: 価格計算

```typescript
// ✅ ドメインサービス: 純粋な計算ロジック
class PricingService {
  calculateFinalPrice(
    order: Order,
    customer: Customer,
    coupons: Coupon[]
  ): Money {
    let price = order.subtotal;

    // 会員割引
    price = this.applyMemberDiscount(price, customer);

    // クーポン適用
    price = this.applyCoupon(price, order, coupons);

    // 税金計算
    price = this.addTax(price);

    return price;
  }
}

// ✅ アプリケーションサービス: データ取得とオーケストレーション
class CheckoutApplicationService {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly customerRepository: ICustomerRepository,
    private readonly couponRepository: ICouponRepository,
    private readonly pricingService: PricingService
  ) {}

  async calculatePrice(orderId: OrderId): Promise<PriceDetails> {
    // データ取得（インフラストラクチャ依存）
    const order = await this.orderRepository.getById(orderId);
    const customer = await this.customerRepository.getById(order.customerId);
    const coupons = await this.couponRepository.findValidFor(order);

    // ドメインサービス呼び出し（純粋なビジネスロジック）
    const finalPrice = this.pricingService.calculateFinalPrice(
      order,
      customer,
      coupons
    );

    return new PriceDetails(order.subtotal, finalPrice);
  }
}
```

## チェックリスト

### ドメインサービスチェック

- [ ] インフラストラクチャに依存していないか？
- [ ] ステートレスか？
- [ ] ドメインオブジェクトのみを操作しているか？
- [ ] ビジネスロジックを表現しているか？
- [ ] ドメインエキスパートが理解できる名前か？

### アプリケーションサービスチェック

- [ ] ユースケースを表現しているか？
- [ ] 適切にドメインサービスを使用しているか？
- [ ] ビジネスロジックが漏れていないか？
- [ ] トランザクション境界が明確か？
- [ ] 外部サービスとの連携を適切に行っているか？
