# ヘキサゴナルアーキテクチャ（Ports and Adapters）

## 概要

Alistair Cockburn が提唱したアーキテクチャパターン。
「Ports and Adapters」とも呼ばれる。

## 核心概念

### 基本構造

```
          ┌─────────────────────────────────────────┐
          │              Adapters                   │
          │  ┌───────────────────────────────────┐  │
          │  │            Ports                  │  │
          │  │  ┌───────────────────────────┐   │  │
          │  │  │                           │   │  │
 Input    │  │  │      Application Core     │   │  │    Output
Adapters ─┼──┼──│     (Business Logic)      │───┼──┼── Adapters
          │  │  │                           │   │  │
          │  │  └───────────────────────────┘   │  │
          │  │            Ports                  │  │
          │  └───────────────────────────────────┘  │
          │              Adapters                   │
          └─────────────────────────────────────────┘
```

### ポート（Port）

- アプリケーションコアとの**接点を定義するインターフェース**
- **Driving Port（入力）**: アプリケーションを駆動する側
- **Driven Port（出力）**: アプリケーションが駆動する側

### アダプター（Adapter）

- ポートの**具体的な実装**
- 外部技術とアプリケーションコアを接続

## コード例

### ポート定義（入力側）

```typescript
// ports/input/IOrderService.ts
export interface IOrderService {
  createOrder(customerId: string, items: OrderItem[]): Promise<Order>;
  getOrder(orderId: string): Promise<Order | null>;
  cancelOrder(orderId: string): Promise<void>;
}
```

### ポート定義（出力側）

```typescript
// ports/output/IOrderRepository.ts
export interface IOrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  delete(id: string): Promise<void>;
}

// ports/output/IPaymentGateway.ts
export interface IPaymentGateway {
  charge(customerId: string, amount: number): Promise<PaymentResult>;
  refund(paymentId: string): Promise<void>;
}
```

### アプリケーションコア

```typescript
// application/OrderService.ts
export class OrderService implements IOrderService {
  constructor(
    private orderRepository: IOrderRepository,
    private paymentGateway: IPaymentGateway
  ) {}

  async createOrder(customerId: string, items: OrderItem[]): Promise<Order> {
    const order = new Order(customerId, items);

    // ビジネスロジック
    order.validate();
    const total = order.calculateTotal();

    // 出力ポートを通じた外部操作
    await this.paymentGateway.charge(customerId, total);
    await this.orderRepository.save(order);

    return order;
  }

  async getOrder(orderId: string): Promise<Order | null> {
    return this.orderRepository.findById(orderId);
  }

  async cancelOrder(orderId: string): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new Error('Order not found');

    order.cancel();
    await this.paymentGateway.refund(order.paymentId);
    await this.orderRepository.save(order);
  }
}
```

### アダプター実装（入力側）

```typescript
// adapters/input/http/OrderController.ts
export class OrderController {
  constructor(private orderService: IOrderService) {}

  async createOrder(req: Request, res: Response): Promise<void> {
    const { customerId, items } = req.body;

    const order = await this.orderService.createOrder(customerId, items);

    res.status(201).json(order);
  }
}

// adapters/input/cli/OrderCLI.ts
export class OrderCLI {
  constructor(private orderService: IOrderService) {}

  async execute(args: string[]): Promise<void> {
    const [command, ...params] = args;

    switch (command) {
      case 'create':
        await this.orderService.createOrder(params[0], JSON.parse(params[1]));
        break;
      // ...
    }
  }
}
```

### アダプター実装（出力側）

```typescript
// adapters/output/database/PostgresOrderRepository.ts
export class PostgresOrderRepository implements IOrderRepository {
  async save(order: Order): Promise<void> {
    await db.insert(orders).values(order.toDTO());
  }

  async findById(id: string): Promise<Order | null> {
    const row = await db.select().from(orders).where(eq(orders.id, id));
    return row ? Order.fromDTO(row) : null;
  }

  async delete(id: string): Promise<void> {
    await db.delete(orders).where(eq(orders.id, id));
  }
}

// adapters/output/payment/StripePaymentGateway.ts
export class StripePaymentGateway implements IPaymentGateway {
  async charge(customerId: string, amount: number): Promise<PaymentResult> {
    const intent = await stripe.paymentIntents.create({
      amount,
      customer: customerId,
    });
    return { paymentId: intent.id, status: 'success' };
  }

  async refund(paymentId: string): Promise<void> {
    await stripe.refunds.create({ payment_intent: paymentId });
  }
}
```

## ディレクトリ構成

```
src/
├── application/           # アプリケーションコア
│   ├── domain/           # ドメインモデル
│   │   ├── entities/
│   │   └── services/
│   └── services/         # アプリケーションサービス
├── ports/
│   ├── input/            # Driving Ports
│   │   └── IOrderService.ts
│   └── output/           # Driven Ports
│       ├── IOrderRepository.ts
│       └── IPaymentGateway.ts
└── adapters/
    ├── input/            # Primary/Driving Adapters
    │   ├── http/
    │   ├── graphql/
    │   └── cli/
    └── output/           # Secondary/Driven Adapters
        ├── database/
        ├── payment/
        └── messaging/
```

## メリット

1. **技術独立性**: コアロジックが外部技術に依存しない
2. **テスタビリティ**: アダプターをモックに差し替え可能
3. **柔軟性**: 同じポートに複数のアダプターを接続可能
4. **保守性**: 技術変更がコアに影響しない

## チェックリスト

- [ ] アプリケーションコアが外部技術に依存していないか
- [ ] ポートがインターフェースとして定義されているか
- [ ] 入力と出力のアダプターが明確に分離されているか
- [ ] 依存性注入でアダプターを接続しているか
