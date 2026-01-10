# Level 4: イベントソーシングと高度なパターン

## イベントソーシング実装

### イベント適用ロジック

```typescript
abstract class EventSourcedAggregate {
  protected id: string;
  protected version: number = 0;
  private uncommittedEvents: DomainEvent[] = [];

  // イベント適用（状態再構築用）
  abstract apply(event: DomainEvent): void;

  // イベント発行（新規イベント生成用）
  protected addEvent(event: DomainEvent): void {
    this.uncommittedEvents.push(event);
    this.apply(event); // 即座に状態に反映
    this.version++;
  }

  getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  clearUncommittedEvents(): void {
    this.uncommittedEvents = [];
  }

  loadFromHistory(events: DomainEvent[]): void {
    events.forEach((event) => {
      this.apply(event);
      this.version = event.aggregateVersion;
    });
  }
}

class OrderAggregate extends EventSourcedAggregate {
  private status: OrderStatus = OrderStatus.New;
  private items: OrderItem[] = [];
  private customerId?: string;

  // コマンド（ビジネスロジック）
  placeOrder(customerId: string, items: OrderItem[]): void {
    if (this.status !== OrderStatus.New) {
      throw new Error("Order already placed");
    }
    if (items.length === 0) {
      throw new Error("Order must have at least one item");
    }

    this.addEvent({
      eventId: uuid(),
      eventType: "OrderPlaced",
      eventVersion: 1,
      aggregateId: this.id,
      aggregateType: "Order",
      aggregateVersion: this.version + 1,
      occurredAt: new Date(),
      data: { customerId, items },
    });
  }

  // イベント適用（状態変更のみ）
  apply(event: DomainEvent): void {
    switch (event.eventType) {
      case "OrderPlaced":
        this.applyOrderPlaced(event);
        break;
      case "OrderShipped":
        this.applyOrderShipped(event);
        break;
      case "OrderCancelled":
        this.applyOrderCancelled(event);
        break;
    }
  }

  private applyOrderPlaced(event: DomainEvent): void {
    this.customerId = event.data.customerId;
    this.items = event.data.items;
    this.status = OrderStatus.Placed;
  }

  private applyOrderShipped(event: DomainEvent): void {
    this.status = OrderStatus.Shipped;
  }

  private applyOrderCancelled(event: DomainEvent): void {
    this.status = OrderStatus.Cancelled;
  }
}
```

### リポジトリパターン

```typescript
class EventSourcedRepository<T extends EventSourcedAggregate> {
  constructor(
    private eventStore: EventStore,
    private snapshotStore: SnapshotStore,
    private aggregateFactory: () => T,
  ) {}

  async load(aggregateId: string): Promise<T> {
    const snapshot = await this.snapshotStore.getSnapshot(aggregateId);
    const fromVersion = snapshot?.version ?? 0;
    const events = await this.eventStore.getEvents(aggregateId, fromVersion);

    if (events.length === 0 && !snapshot) {
      throw new Error(`Aggregate ${aggregateId} not found`);
    }

    const aggregate = this.aggregateFactory();

    if (snapshot) {
      aggregate.loadFromSnapshot(snapshot);
    }

    aggregate.loadFromHistory(events);

    return aggregate;
  }

  async save(aggregate: T): Promise<void> {
    const events = aggregate.getUncommittedEvents();
    if (events.length === 0) return;

    await this.eventStore.append(
      aggregate.id,
      events,
      aggregate.version - events.length,
    );

    // スナップショット作成
    if (this.shouldCreateSnapshot(aggregate)) {
      await this.snapshotStore.saveSnapshot(
        aggregate.id,
        aggregate.version,
        aggregate.getState(),
      );
    }

    aggregate.clearUncommittedEvents();
  }

  private shouldCreateSnapshot(aggregate: T): boolean {
    return aggregate.version % 100 === 0;
  }
}
```

## CQRS統合

### Read Model (プロジェクション)

```typescript
// 読み取り専用モデル
interface OrderListItem {
  orderId: string;
  customerName: string;
  totalAmount: number;
  status: string;
  placedAt: Date;
}

// プロジェクター
class OrderListProjection implements EventHandler {
  async handle(event: DomainEvent): Promise<void> {
    switch (event.eventType) {
      case "OrderPlaced":
        await this.projectOrderPlaced(event);
        break;
      case "OrderShipped":
        await this.projectOrderShipped(event);
        break;
    }
  }

  private async projectOrderPlaced(event: DomainEvent): Promise<void> {
    await this.db.query(
      `INSERT INTO order_list_view (order_id, customer_name, total_amount, status, placed_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        event.aggregateId,
        event.data.customerName,
        event.data.totalAmount,
        "Placed",
        event.occurredAt,
      ],
    );
  }

  private async projectOrderShipped(event: DomainEvent): Promise<void> {
    await this.db.query(
      `UPDATE order_list_view
       SET status = 'Shipped', shipped_at = $1
       WHERE order_id = $2`,
      [event.occurredAt, event.aggregateId],
    );
  }
}
```

## イベントバージョニング

### Upcasting

古いバージョンのイベントを新しいバージョンに変換:

```typescript
interface EventUpcaster {
  upcast(event: DomainEvent): DomainEvent;
  canUpcast(event: DomainEvent): boolean;
}

class OrderPlacedV1ToV2Upcaster implements EventUpcaster {
  canUpcast(event: DomainEvent): boolean {
    return event.eventType === "OrderPlaced" && event.eventVersion === 1;
  }

  upcast(event: DomainEvent): DomainEvent {
    // V1: { items: string[] }
    // V2: { items: { productId: string, quantity: number }[] }
    return {
      ...event,
      eventVersion: 2,
      data: {
        ...event.data,
        items: event.data.items.map((productId: string) => ({
          productId,
          quantity: 1, // デフォルト値
        })),
      },
    };
  }
}

class EventUpcasterChain {
  private upcasters: EventUpcaster[] = [];

  register(upcaster: EventUpcaster): void {
    this.upcasters.push(upcaster);
  }

  upcast(event: DomainEvent): DomainEvent {
    let current = event;
    for (const upcaster of this.upcasters) {
      if (upcaster.canUpcast(current)) {
        current = upcaster.upcast(current);
      }
    }
    return current;
  }
}
```

## サガパターン

複数の集約にまたがる長時間実行プロセス:

```typescript
class OrderSaga {
  private state:
    | "initial"
    | "inventory_reserved"
    | "payment_processed"
    | "completed" = "initial";

  async handle(event: DomainEvent): Promise<void> {
    switch (event.eventType) {
      case "OrderPlaced":
        await this.reserveInventory(event);
        break;
      case "InventoryReserved":
        await this.processPayment(event);
        break;
      case "PaymentProcessed":
        await this.shipOrder(event);
        break;
      case "PaymentFailed":
        await this.compensateInventory(event);
        break;
    }
  }

  private async reserveInventory(event: DomainEvent): Promise<void> {
    // インベントリサービスにコマンド送信
    await this.commandBus.send(new ReserveInventoryCommand(event.data));
    this.state = "inventory_reserved";
  }

  private async compensateInventory(event: DomainEvent): Promise<void> {
    // 補償トランザクション
    await this.commandBus.send(new ReleaseInventoryCommand(event.data));
  }
}
```

## 時間遡行クエリ

特定時点の状態を再構築:

```typescript
class TemporalQuery {
  async getAggregateAt(aggregateId: string, pointInTime: Date): Promise<EventSourcedAggregate> {
    const events = await this.eventStore.getEventsUntil(aggregateId, pointInTime);

    const aggregate = this.aggregateFactory();
    aggregate.loadFromHistory(events);

    return aggregate;
  }
}

// EventStoreに追加メソッド
async getEventsUntil(aggregateId: string, until: Date): Promise<DomainEvent[]> {
  const result = await this.pool.query(
    `SELECT * FROM events
     WHERE aggregate_id = $1 AND occurred_at <= $2
     ORDER BY sequence_number ASC`,
    [aggregateId, until]
  );

  return result.rows.map(row => this.rowToEvent(row));
}
```

## イベントリプレイ

```typescript
class EventReplayer {
  async replay(
    fromPosition: number = 0,
    batchSize: number = 1000,
  ): Promise<void> {
    let currentPosition = fromPosition;
    let hasMore = true;

    while (hasMore) {
      const events = await this.eventStore.getAllEvents(
        currentPosition,
        batchSize,
      );

      if (events.length === 0) {
        hasMore = false;
        break;
      }

      for (const event of events) {
        await this.eventRouter.route(event);
      }

      currentPosition += events.length;
      console.log(`Replayed ${currentPosition} events`);
    }
  }
}
```

## まとめ

Level 4では以下の高度なパターンを学びました:

- イベントソーシング完全実装
- CQRS統合とプロジェクション
- イベントバージョニングとUpcasting
- サガパターンによる分散トランザクション
- 時間遡行クエリ
- イベントリプレイ機構

これらのパターンを組み合わせることで、拡張性が高く監査可能なイベント駆動システムを構築できます。
