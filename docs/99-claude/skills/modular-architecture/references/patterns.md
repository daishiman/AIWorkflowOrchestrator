# モジュール設計パターン

> 相対パス: `references/patterns.md`
> 読込条件: 設計時

---

## インターフェース分離パターン

### 基本形

```typescript
// 巨大なインターフェースを避ける
interface IWorker {
  work(): void;
  eat(): void; // ロボットには不要
  sleep(): void; // ロボットには不要
}

// 分離されたインターフェース
interface IWorkable {
  work(): void;
}

interface IFeedable {
  eat(): void;
}

interface ISleepable {
  sleep(): void;
}

// 人間
class Human implements IWorkable, IFeedable, ISleepable {
  work(): void {}
  eat(): void {}
  sleep(): void {}
}

// ロボット
class Robot implements IWorkable {
  work(): void {}
}
```

---

## ファサードパターン

複雑なサブシステムを単純なインターフェースで隠蔽。

```typescript
// サブシステムの複雑さを隠蔽
class OrderFacade {
  private inventory: InventoryService;
  private payment: PaymentService;
  private shipping: ShippingService;

  async placeOrder(order: Order): Promise<OrderResult> {
    await this.inventory.reserve(order.items);
    await this.payment.charge(order.payment);
    await this.shipping.schedule(order.address);
    return { success: true };
  }
}
```

---

## アダプターパターン

既存のインターフェースを期待されるインターフェースに変換。

```typescript
// 既存のサードパーティライブラリ
class LegacyPaymentGateway {
  processPayment(amount: number, card: string): boolean {}
}

// 期待されるインターフェース
interface PaymentProcessor {
  process(payment: PaymentRequest): Promise<PaymentResult>;
}

// アダプター
class PaymentAdapter implements PaymentProcessor {
  constructor(private legacy: LegacyPaymentGateway) {}

  async process(payment: PaymentRequest): Promise<PaymentResult> {
    const success = this.legacy.processPayment(
      payment.amount,
      payment.cardNumber,
    );
    return { success, transactionId: generateId() };
  }
}
```

---

## ポートとアダプター（ヘキサゴナル）

```
                  ┌──────────────────────┐
   Primary        │                      │      Secondary
   Adapters       │    Domain Core       │      Adapters
  (Driving)       │                      │     (Driven)
                  │                      │
┌─────────┐       │   ┌──────────────┐   │       ┌─────────┐
│   API   │──────>│   │  Use Cases   │   │──────>│   DB    │
└─────────┘       │   └──────────────┘   │       └─────────┘
                  │         │            │
┌─────────┐       │   ┌─────▼────────┐   │       ┌─────────┐
│   CLI   │──────>│   │   Entities   │   │──────>│ External│
└─────────┘       │   └──────────────┘   │       │   API   │
                  │                      │       └─────────┘
                  └──────────────────────┘
```

### ポート（インターフェース）

```typescript
// Primary Port（ドメインを呼び出す）
interface OrderService {
  createOrder(request: CreateOrderRequest): Promise<Order>;
  getOrder(id: string): Promise<Order>;
}

// Secondary Port（ドメインが呼び出す）
interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
}
```

---

## 依存性注入パターン

```typescript
// インターフェース定義
interface Logger {
  log(message: string): void;
}

interface Database {
  query(sql: string): Promise<any>;
}

// 依存性注入を使用
class UserService {
  constructor(
    private logger: Logger,
    private db: Database,
  ) {}

  async getUser(id: string): Promise<User> {
    this.logger.log(`Fetching user ${id}`);
    return this.db.query(`SELECT * FROM users WHERE id = ?`, [id]);
  }
}

// 実行時に具象を注入
const service = new UserService(new ConsoleLogger(), new PostgresDatabase());
```

---

## モジュール間通信パターン

### 同期通信

```typescript
// 直接呼び出し（強い結合）
class OrderModule {
  private inventoryModule: InventoryModule;

  createOrder(items: Item[]): void {
    this.inventoryModule.reserve(items);
  }
}
```

### イベント駆動（疎結合）

```typescript
// イベント発行
class OrderModule {
  private eventBus: EventBus;

  createOrder(items: Item[]): void {
    this.eventBus.publish(new OrderCreatedEvent(items));
  }
}

// イベント購読
class InventoryModule {
  @Subscribe(OrderCreatedEvent)
  onOrderCreated(event: OrderCreatedEvent): void {
    this.reserve(event.items);
  }
}
```

---

## 循環依存の解消パターン

### パターン1: インターフェース抽出

```typescript
// 循環依存
// A → B → A

// 解決：インターフェースを抽出
// A → IB ← B
interface IB {
  method(): void;
}

class A {
  constructor(private b: IB) {}
}

class B implements IB {
  method(): void {}
}
```

### パターン2: イベント化

```typescript
// 循環依存
// Order → Invoice → Order

// 解決：イベントで疎結合化
class Order {
  complete(): void {
    this.eventBus.publish(new OrderCompletedEvent(this.id));
  }
}

class Invoice {
  @Subscribe(OrderCompletedEvent)
  onCreate(event: OrderCompletedEvent): void {
    this.generateFor(event.orderId);
  }
}
```

---

## チェックリスト

- [ ] インターフェースが適切に分離されている
- [ ] ファサードで複雑さが隠蔽されている
- [ ] 外部依存がアダプターで抽象化されている
- [ ] 依存性が注入されている
- [ ] 循環依存が解消されている

---

## 参照

- **基本概念**: See [basics.md](basics.md)
- **レイヤー設計**: See [layered-architecture.md](layered-architecture.md)
