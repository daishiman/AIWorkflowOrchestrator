# オニオンアーキテクチャ（Onion Architecture）

## 概要

Jeffrey Palermo が提唱したアーキテクチャパターン。
Clean Architecture の先駆けとなった概念。

## 基本構造

```
        ┌─────────────────────────────────────────────┐
        │            Infrastructure                    │
        │  ┌───────────────────────────────────────┐  │
        │  │         Application Services          │  │
        │  │  ┌─────────────────────────────────┐  │  │
        │  │  │       Domain Services           │  │  │
        │  │  │  ┌───────────────────────────┐  │  │  │
        │  │  │  │                           │  │  │  │
        │  │  │  │     Domain Model          │  │  │  │
        │  │  │  │   (Entities & Values)     │  │  │  │
        │  │  │  │                           │  │  │  │
        │  │  │  └───────────────────────────┘  │  │  │
        │  │  │       Domain Services           │  │  │
        │  │  └─────────────────────────────────┘  │  │
        │  │         Application Services          │  │
        │  └───────────────────────────────────────┘  │
        │            Infrastructure                    │
        └─────────────────────────────────────────────┘
```

## レイヤー詳細

### 1. Domain Model（最内層）

**責務**:

- エンティティ（Entity）
- 値オブジェクト（Value Object）
- ドメインイベント

**特徴**:

- 外部依存なし
- 純粋なビジネスルール

```typescript
// domain/entities/Order.ts
export class Order {
  constructor(
    private readonly id: OrderId,
    private readonly customerId: CustomerId,
    private items: OrderItem[],
    private status: OrderStatus,
  ) {}

  addItem(item: OrderItem): void {
    if (this.status !== "draft") {
      throw new DomainError("Cannot modify non-draft order");
    }
    this.items.push(item);
  }

  submit(): void {
    if (this.items.length === 0) {
      throw new DomainError("Cannot submit empty order");
    }
    this.status = "submitted";
  }

  calculateTotal(): Money {
    return this.items.reduce(
      (sum, item) => sum.add(item.subtotal),
      Money.zero(),
    );
  }
}
```

### 2. Domain Services

**責務**:

- 複数エンティティにまたがるビジネスロジック
- リポジトリインターフェースの定義

```typescript
// domain/services/PricingService.ts
export class PricingService {
  calculateDiscount(order: Order, customer: Customer): Money {
    let discount = Money.zero();

    // VIP顧客割引
    if (customer.isVIP()) {
      discount = discount.add(order.calculateTotal().multiply(0.1));
    }

    // 大量注文割引
    if (order.totalQuantity() > 100) {
      discount = discount.add(order.calculateTotal().multiply(0.05));
    }

    return discount;
  }
}

// domain/repositories/IOrderRepository.ts
export interface IOrderRepository {
  findById(id: OrderId): Promise<Order | null>;
  save(order: Order): Promise<void>;
  findByCustomer(customerId: CustomerId): Promise<Order[]>;
}
```

### 3. Application Services

**責務**:

- ユースケースのオーケストレーション
- トランザクション管理
- DTO変換

```typescript
// application/services/OrderApplicationService.ts
export class OrderApplicationService {
  constructor(
    private orderRepository: IOrderRepository,
    private customerRepository: ICustomerRepository,
    private pricingService: PricingService,
    private eventBus: IEventBus,
  ) {}

  async createOrder(dto: CreateOrderDTO): Promise<OrderDTO> {
    // トランザクション開始
    const customer = await this.customerRepository.findById(dto.customerId);
    if (!customer) {
      throw new ApplicationError("Customer not found");
    }

    const order = new Order(
      OrderId.generate(),
      customer.id,
      dto.items.map((item) => OrderItem.fromDTO(item)),
      "draft",
    );

    const discount = this.pricingService.calculateDiscount(order, customer);
    order.applyDiscount(discount);

    await this.orderRepository.save(order);

    // イベント発行
    this.eventBus.publish(new OrderCreatedEvent(order.id));

    return OrderDTO.from(order);
  }
}
```

### 4. Infrastructure（最外層）

**責務**:

- データベースアクセス
- 外部API連携
- フレームワーク統合

```typescript
// infrastructure/repositories/DrizzleOrderRepository.ts
export class DrizzleOrderRepository implements IOrderRepository {
  async findById(id: OrderId): Promise<Order | null> {
    const row = await db.query.orders.findFirst({
      where: eq(orders.id, id.value),
      with: { items: true },
    });

    return row ? this.toDomain(row) : null;
  }

  async save(order: Order): Promise<void> {
    await db.transaction(async (tx) => {
      await tx
        .insert(orders)
        .values(this.toRow(order))
        .onConflictDoUpdate({ target: orders.id, set: this.toRow(order) });

      // 注文アイテムの保存
      // ...
    });
  }

  private toDomain(row: OrderRow): Order {
    return new Order(
      new OrderId(row.id),
      new CustomerId(row.customerId),
      row.items.map((item) => OrderItem.fromRow(item)),
      row.status as OrderStatus,
    );
  }
}
```

## Clean Architecture との違い

| 観点       | Onion Architecture     | Clean Architecture      |
| ---------- | ---------------------- | ----------------------- |
| 提唱者     | Jeffrey Palermo (2008) | Robert C. Martin (2012) |
| レイヤー数 | 4層（柔軟）            | 4層（明確）             |
| 用語       | Domain Model, Services | Entities, Use Cases     |
| フォーカス | ドメイン中心           | ビジネスルール中心      |
| 依存方向   | 外→内                  | 外→内                   |

## ディレクトリ構成

```
src/
├── domain/
│   ├── entities/
│   │   ├── Order.ts
│   │   └── Customer.ts
│   ├── values/
│   │   ├── Money.ts
│   │   └── OrderId.ts
│   ├── services/
│   │   └── PricingService.ts
│   ├── repositories/
│   │   └── IOrderRepository.ts
│   └── events/
│       └── OrderCreatedEvent.ts
├── application/
│   ├── services/
│   │   └── OrderApplicationService.ts
│   └── dto/
│       ├── CreateOrderDTO.ts
│       └── OrderDTO.ts
└── infrastructure/
    ├── repositories/
    │   └── DrizzleOrderRepository.ts
    ├── events/
    │   └── EventBusImpl.ts
    └── web/
        └── controllers/
```

## チェックリスト

- [ ] Domain Modelが外部依存を持っていないか
- [ ] Domain Servicesがビジネスロジックに集中しているか
- [ ] Application Servicesがオーケストレーションに徹しているか
- [ ] Infrastructureがすべての技術的詳細を含んでいるか
- [ ] 依存の方向が外側から内側のみか
