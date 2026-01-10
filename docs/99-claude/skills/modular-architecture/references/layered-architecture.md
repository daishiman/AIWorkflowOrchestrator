# レイヤードアーキテクチャ

> 相対パス: `references/layered-architecture.md`
> 読込条件: 高度な設計時

---

## レイヤー構造

```
┌─────────────────────────────────────────────────────┐
│              Presentation Layer                      │
│   (Controllers, Views, DTOs, Validators)            │
├─────────────────────────────────────────────────────┤
│              Application Layer                       │
│   (Use Cases, Application Services, Commands)       │
├─────────────────────────────────────────────────────┤
│                Domain Layer                          │
│   (Entities, Value Objects, Domain Services)        │
├─────────────────────────────────────────────────────┤
│             Infrastructure Layer                     │
│   (Repositories, External APIs, Frameworks)         │
└─────────────────────────────────────────────────────┘

        依存の方向: 上 → 下（ドメインは何にも依存しない）
```

---

## 各レイヤーの責務

### Presentation Layer

| 責務           | 説明                        |
| -------------- | --------------------------- |
| リクエスト処理 | HTTP/CLI/GUIからの入力処理  |
| バリデーション | 入力値の形式検証            |
| レスポンス変換 | ドメインオブジェクトをDTOへ |
| 認証・認可     | アクセス制御                |

```typescript
// Controller例
@Controller("/orders")
class OrderController {
  constructor(private orderUseCase: CreateOrderUseCase) {}

  @Post()
  async create(@Body() dto: CreateOrderDto): Promise<OrderDto> {
    const order = await this.orderUseCase.execute(dto.toCommand());
    return OrderDto.from(order);
  }
}
```

### Application Layer

| 責務                     | 説明                                 |
| ------------------------ | ------------------------------------ |
| ユースケース実装         | ビジネスフローのオーケストレーション |
| トランザクション管理     | 一貫性の保証                         |
| ドメインサービス呼び出し | 複数エンティティの協調               |
| イベント発行             | ドメインイベントの発行               |

```typescript
// Use Case例
class CreateOrderUseCase {
  constructor(
    private orderRepo: OrderRepository,
    private inventoryService: InventoryService,
    private eventBus: EventBus,
  ) {}

  async execute(command: CreateOrderCommand): Promise<Order> {
    const order = Order.create(command.customerId, command.items);
    await this.inventoryService.reserve(order.items);
    await this.orderRepo.save(order);
    this.eventBus.publish(new OrderCreatedEvent(order.id));
    return order;
  }
}
```

### Domain Layer

| 責務             | 説明                               |
| ---------------- | ---------------------------------- |
| ビジネスルール   | ドメイン固有のロジック             |
| エンティティ     | 識別子を持つオブジェクト           |
| 値オブジェクト   | 不変で識別子を持たないオブジェクト |
| ドメインサービス | エンティティに属さないロジック     |

```typescript
// Entity例
class Order {
  private constructor(
    public readonly id: OrderId,
    public readonly customerId: CustomerId,
    private items: OrderItem[],
    private status: OrderStatus,
  ) {}

  static create(customerId: CustomerId, items: OrderItem[]): Order {
    if (items.length === 0) {
      throw new DomainError("Order must have at least one item");
    }
    return new Order(
      OrderId.generate(),
      customerId,
      items,
      OrderStatus.Pending,
    );
  }

  complete(): void {
    if (this.status !== OrderStatus.Paid) {
      throw new DomainError("Cannot complete unpaid order");
    }
    this.status = OrderStatus.Completed;
  }
}

// Value Object例
class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: Currency,
  ) {}

  static of(amount: number, currency: Currency): Money {
    if (amount < 0) {
      throw new DomainError("Amount cannot be negative");
    }
    return new Money(amount, currency);
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new DomainError("Currency mismatch");
    }
    return Money.of(this.amount + other.amount, this.currency);
  }
}
```

### Infrastructure Layer

| 責務               | 説明                           |
| ------------------ | ------------------------------ |
| データ永続化       | DBへの保存・取得               |
| 外部API連携        | サードパーティサービス呼び出し |
| メッセージング     | キュー、イベントバス           |
| フレームワーク統合 | DI、ロギング、設定             |

```typescript
// Repository実装例
class PostgresOrderRepository implements OrderRepository {
  constructor(private db: Database) {}

  async save(order: Order): Promise<void> {
    await this.db.query(
      "INSERT INTO orders (id, customer_id, status) VALUES ($1, $2, $3)",
      [order.id.value, order.customerId.value, order.status],
    );
  }

  async findById(id: OrderId): Promise<Order | null> {
    const row = await this.db.queryOne("SELECT * FROM orders WHERE id = $1", [
      id.value,
    ]);
    return row ? this.toDomain(row) : null;
  }
}
```

---

## 依存関係ルール

### 許可される依存

| 依存元         | 依存先                        |
| -------------- | ----------------------------- |
| Presentation   | Application, Domain           |
| Application    | Domain                        |
| Infrastructure | Domain (インターフェース実装) |

### 禁止される依存

| 依存元      | 依存先                                    |
| ----------- | ----------------------------------------- |
| Domain      | Application, Infrastructure, Presentation |
| Application | Infrastructure, Presentation              |

---

## ディレクトリ構造例

```
src/
├── presentation/
│   ├── controllers/
│   ├── dto/
│   └── validators/
├── application/
│   ├── usecases/
│   ├── commands/
│   └── queries/
├── domain/
│   ├── entities/
│   ├── valueObjects/
│   ├── services/
│   └── repositories/  ← インターフェースのみ
└── infrastructure/
    ├── persistence/   ← Repository実装
    ├── external/
    └── config/
```

---

## チェックリスト

- [ ] ドメインレイヤーが他レイヤーに依存していない
- [ ] インターフェースがドメインに定義されている
- [ ] 実装がインフラストラクチャに配置されている
- [ ] レイヤー飛び越えアクセスがない
- [ ] ユースケースがトランザクション境界を管理している

---

## 参照

- **基本概念**: See [basics.md](basics.md)
- **設計パターン**: See [patterns.md](patterns.md)
