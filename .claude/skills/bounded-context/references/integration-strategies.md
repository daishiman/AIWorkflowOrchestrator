# 統合戦略

## 概要

境界付けられたコンテキスト間の統合には、様々な戦略があります。
このドキュメントでは、技術的な統合パターンと実装戦略を解説します。

## 同期統合 vs 非同期統合

### 同期統合（リクエスト/レスポンス）

**特徴**:

- 即座に結果が必要
- 強い一貫性
- シンプルな実装

**パターン**:

- REST API
- gRPC
- GraphQL

```typescript
// 同期統合の例
class ShippingService {
  async createShipment(orderId: string): Promise<Shipment> {
    // 同期的に販売コンテキストのAPIを呼び出し
    const order = await this.salesApi.getOrder(orderId);
    return Shipment.create(order);
  }
}
```

**メリット**:

- 実装がシンプル
- 即時のフィードバック
- デバッグが容易

**デメリット**:

- 強い結合
- 可用性の連鎖
- レイテンシの累積

### 非同期統合（イベント駆動）

**特徴**:

- 疎結合
- 高い可用性
- 結果整合性

**パターン**:

- ドメインイベント
- メッセージキュー
- イベントソーシング

```typescript
// 非同期統合の例
// 販売コンテキスト
class OrderService {
  async confirmOrder(orderId: OrderId): Promise<void> {
    const order = await this.orderRepository.getById(orderId);
    order.confirm();
    await this.orderRepository.save(order);

    // イベントを発行
    await this.eventPublisher.publish(
      new OrderConfirmedEvent(order.id, order.items, order.shippingAddress),
    );
  }
}

// 配送コンテキスト
class OrderConfirmedHandler {
  async handle(event: OrderConfirmedEvent): Promise<void> {
    // イベントを受信して処理
    const shipment = Shipment.createFrom(event);
    await this.shipmentRepository.save(shipment);
  }
}
```

**メリット**:

- 疎結合
- 独立したスケーリング
- 障害耐性

**デメリット**:

- 実装が複雑
- 結果整合性の管理
- デバッグが困難

## 統合パターン詳細

### 1. REST API 統合

```typescript
// 公開API（上流コンテキスト）
@Controller("api/v1/orders")
class OrdersApiController {
  @Get(":id")
  async getOrder(@Param("id") id: string): Promise<OrderDto> {
    const order = await this.orderService.getById(id);
    return OrderDto.fromDomain(order);
  }
}

// クライアント（下流コンテキスト）
class SalesApiClient implements ISalesApi {
  constructor(private readonly httpClient: HttpClient) {}

  async getOrder(orderId: string): Promise<OrderDto> {
    const response = await this.httpClient.get(
      `${this.baseUrl}/api/v1/orders/${orderId}`,
    );
    return response.data;
  }
}
```

### 2. ドメインイベント統合

```typescript
// イベント定義（公開言語）
interface OrderConfirmedEvent {
  eventType: "OrderConfirmed";
  occurredAt: string;
  payload: {
    orderId: string;
    customerId: string;
    items: Array<{
      productId: string;
      quantity: number;
    }>;
    shippingAddress: {
      street: string;
      city: string;
      postalCode: string;
    };
  };
}

// 発行側（販売コンテキスト）
class OrderEventPublisher {
  async publish(event: DomainEvent): Promise<void> {
    // メッセージキューに発行
    await this.messageQueue.publish("order.events", JSON.stringify(event));
  }
}

// 購読側（配送コンテキスト）
class OrderEventSubscriber {
  async subscribe(): Promise<void> {
    await this.messageQueue.subscribe("order.events", async (message) => {
      const event = JSON.parse(message);
      await this.handleEvent(event);
    });
  }

  private async handleEvent(event: OrderConfirmedEvent): Promise<void> {
    // ACLで変換
    const shipment = this.adapter.translateToShipment(event);
    await this.shipmentRepository.save(shipment);
  }
}
```

### 3. サガパターン（分散トランザクション）

複数コンテキストにまたがるトランザクションの管理。

```typescript
// オーケストレーション型サガ
class OrderSaga {
  async execute(createOrderCommand: CreateOrderCommand): Promise<void> {
    const sagaId = SagaId.generate();

    try {
      // Step 1: 注文作成
      const orderId = await this.salesService.createOrder(createOrderCommand);

      // Step 2: 在庫予約
      await this.inventoryService.reserveStock(
        orderId,
        createOrderCommand.items,
      );

      // Step 3: 支払い処理
      await this.paymentService.processPayment(
        orderId,
        createOrderCommand.payment,
      );

      // 完了
      await this.salesService.confirmOrder(orderId);
    } catch (error) {
      // 補償トランザクション
      await this.compensate(sagaId, error);
      throw error;
    }
  }

  private async compensate(sagaId: SagaId, error: Error): Promise<void> {
    const history = await this.sagaRepository.getHistory(sagaId);

    // 逆順で補償
    for (const step of history.reverse()) {
      switch (step.type) {
        case "PAYMENT_PROCESSED":
          await this.paymentService.refund(step.paymentId);
          break;
        case "STOCK_RESERVED":
          await this.inventoryService.releaseStock(step.reservationId);
          break;
        case "ORDER_CREATED":
          await this.salesService.cancelOrder(step.orderId);
          break;
      }
    }
  }
}
```

### 4. CQRS（コマンドクエリ責務分離）

```typescript
// コマンド側（書き込み）- 販売コンテキスト
class OrderCommandService {
  async createOrder(command: CreateOrderCommand): Promise<OrderId> {
    const order = Order.create(command);
    await this.orderRepository.save(order);

    // イベント発行
    await this.eventPublisher.publish(order.pullDomainEvents());

    return order.id;
  }
}

// クエリ側（読み取り）- レポートコンテキスト
class OrderQueryService {
  async getOrderSummary(orderId: string): Promise<OrderSummaryDto> {
    // 非正規化されたリードモデルから取得
    return this.readModelRepository.getOrderSummary(orderId);
  }
}

// 読み取りモデル同期
class OrderReadModelSynchronizer {
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    // 読み取りモデルを更新
    await this.readModelRepository.upsert({
      orderId: event.orderId,
      customerName: event.customerName,
      totalAmount: event.totalAmount,
      status: "CREATED",
      createdAt: event.occurredAt,
    });
  }
}
```

## データ一貫性戦略

### 強い一貫性（Strong Consistency）

```typescript
// 同一トランザクション内で更新
async createOrderWithPayment(command: CreateOrderCommand): Promise<void> {
  await this.unitOfWork.execute(async () => {
    const order = Order.create(command);
    await this.orderRepository.save(order);

    const payment = Payment.create(order.id, command.paymentInfo);
    await this.paymentRepository.save(payment);
  });
}
```

### 結果整合性（Eventual Consistency）

```typescript
// イベント駆動で結果的に整合
// 販売コンテキスト
async confirmOrder(orderId: OrderId): Promise<void> {
  const order = await this.orderRepository.getById(orderId);
  order.confirm();
  await this.orderRepository.save(order);

  // イベント発行（非同期で処理される）
  await this.eventPublisher.publish(new OrderConfirmedEvent(order));
}

// 配送コンテキスト（イベントハンドラ）
async handleOrderConfirmed(event: OrderConfirmedEvent): Promise<void> {
  // 結果的に整合する
  const shipment = Shipment.createFrom(event);
  await this.shipmentRepository.save(shipment);
}
```

### アウトボックスパターン

イベント発行の信頼性を確保。

```typescript
async confirmOrder(orderId: OrderId): Promise<void> {
  await this.unitOfWork.execute(async () => {
    const order = await this.orderRepository.getById(orderId);
    order.confirm();
    await this.orderRepository.save(order);

    // 同一トランザクションでアウトボックスに保存
    await this.outboxRepository.save(
      new OutboxMessage(new OrderConfirmedEvent(order))
    );
  });

  // 別プロセスでアウトボックスからイベントを発行
}

// アウトボックスプロセッサ
async processOutbox(): Promise<void> {
  const messages = await this.outboxRepository.getUnpublished();

  for (const message of messages) {
    await this.eventPublisher.publish(message.event);
    await this.outboxRepository.markAsPublished(message.id);
  }
}
```

## エラーハンドリング

### リトライ戦略

```typescript
class RetryableEventHandler {
  private readonly maxRetries = 3;
  private readonly backoffMs = [1000, 5000, 30000];

  async handle(event: DomainEvent): Promise<void> {
    let lastError: Error;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        await this.processEvent(event);
        return;
      } catch (error) {
        lastError = error;

        if (attempt < this.maxRetries - 1) {
          await this.sleep(this.backoffMs[attempt]);
        }
      }
    }

    // リトライ失敗 → デッドレターキューへ
    await this.deadLetterQueue.send(event, lastError);
  }
}
```

### サーキットブレーカー

```typescript
class CircuitBreaker {
  private failures = 0;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private readonly threshold = 5;
  private readonly timeout = 30000;

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      throw new CircuitOpenError();
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = "CLOSED";
  }

  private onFailure(): void {
    this.failures++;
    if (this.failures >= this.threshold) {
      this.state = "OPEN";
      setTimeout(() => {
        this.state = "HALF_OPEN";
      }, this.timeout);
    }
  }
}
```

## 選択ガイド

| 要件                               | 推奨戦略                |
| ---------------------------------- | ----------------------- |
| 即時の一貫性                       | 同期統合 + 強い一貫性   |
| 高い可用性                         | 非同期統合 + 結果整合性 |
| 複数コンテキストのトランザクション | サガパターン            |
| 読み取り性能の最適化               | CQRS                    |
| イベント発行の信頼性               | アウトボックスパターン  |
| 障害耐性                           | サーキットブレーカー    |
