# イベント駆動設計ガイド

## 1. イベント設計原則

### イベントの特性

```yaml
良いイベント:
  - 不変性: 一度発生したイベントは変更されない
  - 自己完結: 必要な情報をすべて含む
  - 意味的明確さ: 何が起きたかを明確に表現
  - タイムスタンプ付き: いつ発生したかを記録

悪いイベント:
  - コマンド形式: "CreateUser" ではなく "UserCreated"
  - 不完全: 処理に追加クエリが必要
  - 曖昧: "DataChanged" のような汎用的な名前
```

### イベント命名規則

```
パターン: [エンティティ][動詞過去形]

例:
  - UserCreated
  - OrderPlaced
  - PaymentProcessed
  - InventoryReserved
  - ShipmentDispatched
  - EmailSent

集約イベント:
  - OrderCompletedWithAllItems
  - UserRegistrationCompleted
```

## 2. イベントスキーマ設計

### CloudEvents仕様

```typescript
interface CloudEvent {
  // 必須フィールド
  specversion: "1.0";
  id: string; // 一意識別子
  type: string; // イベントタイプ
  source: string; // イベントソース
  time?: string; // ISO 8601 タイムスタンプ

  // オプションフィールド
  datacontenttype?: string; // data のコンテンツタイプ
  dataschema?: string; // data のスキーマURI
  subject?: string; // イベントの対象
  data?: any; // イベントデータ

  // 拡張フィールド
  [key: string]: any;
}

// 具体例
const userCreatedEvent: CloudEvent = {
  specversion: "1.0",
  id: "a3b4c5d6-e7f8-9012-3456-789012345678",
  type: "com.example.user.created",
  source: "/services/user-service",
  time: "2025-11-27T10:30:00.000Z",
  datacontenttype: "application/json",
  subject: "user-123",
  data: {
    userId: "user-123",
    email: "user@example.com",
    createdAt: "2025-11-27T10:30:00.000Z",
  },
};
```

### ドメインイベント

```typescript
// ベースイベント
abstract class DomainEvent {
  readonly id: string;
  readonly occurredAt: Date;
  readonly aggregateId: string;
  readonly version: number;

  constructor(aggregateId: string, version: number) {
    this.id = generateUUID();
    this.occurredAt = new Date();
    this.aggregateId = aggregateId;
    this.version = version;
  }

  abstract get eventType(): string;
}

// 具体的なイベント
class OrderPlaced extends DomainEvent {
  get eventType(): string {
    return "OrderPlaced";
  }

  constructor(
    aggregateId: string,
    version: number,
    public readonly customerId: string,
    public readonly items: OrderItem[],
    public readonly totalAmount: number,
  ) {
    super(aggregateId, version);
  }
}

class OrderShipped extends DomainEvent {
  get eventType(): string {
    return "OrderShipped";
  }

  constructor(
    aggregateId: string,
    version: number,
    public readonly trackingNumber: string,
    public readonly carrier: string,
  ) {
    super(aggregateId, version);
  }
}
```

## 3. Event Sourcing

### イベントストア実装

```typescript
interface EventStore {
  append(
    streamId: string,
    events: DomainEvent[],
    expectedVersion: number,
  ): Promise<void>;
  getEvents(streamId: string, fromVersion?: number): Promise<DomainEvent[]>;
  getSnapshot(streamId: string): Promise<Snapshot | null>;
  saveSnapshot(snapshot: Snapshot): Promise<void>;
}

interface Snapshot {
  streamId: string;
  version: number;
  state: any;
  createdAt: Date;
}

class PostgresEventStore implements EventStore {
  constructor(private db: Database) {}

  async append(
    streamId: string,
    events: DomainEvent[],
    expectedVersion: number,
  ): Promise<void> {
    const currentVersion = await this.getCurrentVersion(streamId);

    if (currentVersion !== expectedVersion) {
      throw new OptimisticConcurrencyError(
        `Expected version ${expectedVersion}, but found ${currentVersion}`,
      );
    }

    const transaction = await this.db.beginTransaction();

    try {
      for (const event of events) {
        await transaction.query(
          `INSERT INTO events (stream_id, version, event_type, data, occurred_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            streamId,
            event.version,
            event.eventType,
            JSON.stringify(event),
            event.occurredAt,
          ],
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getEvents(streamId: string, fromVersion = 0): Promise<DomainEvent[]> {
    const rows = await this.db.query(
      `SELECT data FROM events
       WHERE stream_id = $1 AND version >= $2
       ORDER BY version ASC`,
      [streamId, fromVersion],
    );

    return rows.map((row) => this.deserializeEvent(row.data));
  }

  private deserializeEvent(data: any): DomainEvent {
    // イベントタイプに基づいてデシリアライズ
    // 実装は省略
    return data;
  }

  private async getCurrentVersion(streamId: string): Promise<number> {
    const result = await this.db.query(
      `SELECT MAX(version) as version FROM events WHERE stream_id = $1`,
      [streamId],
    );
    return result[0]?.version ?? 0;
  }
}
```

### 集約の再構築

```typescript
abstract class EventSourcedAggregate {
  protected version = 0;
  private uncommittedEvents: DomainEvent[] = [];

  constructor(protected readonly id: string) {}

  // イベントを適用
  protected apply(event: DomainEvent): void {
    this.when(event);
    this.version++;
    this.uncommittedEvents.push(event);
  }

  // イベントハンドラー（サブクラスで実装）
  protected abstract when(event: DomainEvent): void;

  // 履歴からの再構築
  loadFromHistory(events: DomainEvent[]): void {
    for (const event of events) {
      this.when(event);
      this.version = event.version;
    }
  }

  getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  clearUncommittedEvents(): void {
    this.uncommittedEvents = [];
  }
}

// 具体的な集約
class Order extends EventSourcedAggregate {
  private status: OrderStatus = "pending";
  private items: OrderItem[] = [];

  static create(
    orderId: string,
    customerId: string,
    items: OrderItem[],
  ): Order {
    const order = new Order(orderId);
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    order.apply(new OrderPlaced(orderId, 1, customerId, items, totalAmount));
    return order;
  }

  ship(trackingNumber: string, carrier: string): void {
    if (this.status !== "confirmed") {
      throw new Error("Order must be confirmed before shipping");
    }

    this.apply(
      new OrderShipped(this.id, this.version + 1, trackingNumber, carrier),
    );
  }

  protected when(event: DomainEvent): void {
    if (event instanceof OrderPlaced) {
      this.items = event.items;
      this.status = "pending";
    } else if (event instanceof OrderShipped) {
      this.status = "shipped";
    }
    // 他のイベントハンドラー...
  }
}
```

## 4. CQRS (Command Query Responsibility Segregation)

### コマンド側

```typescript
// コマンド定義
interface Command {
  readonly type: string;
}

class PlaceOrderCommand implements Command {
  readonly type = "PlaceOrder";

  constructor(
    public readonly customerId: string,
    public readonly items: OrderItem[],
  ) {}
}

// コマンドハンドラー
interface CommandHandler<T extends Command> {
  handle(command: T): Promise<void>;
}

class PlaceOrderHandler implements CommandHandler<PlaceOrderCommand> {
  constructor(
    private orderRepository: OrderRepository,
    private eventBus: EventBus,
  ) {}

  async handle(command: PlaceOrderCommand): Promise<void> {
    // ビジネスロジック検証
    await this.validateCustomer(command.customerId);
    await this.validateItems(command.items);

    // 集約の作成
    const orderId = generateOrderId();
    const order = Order.create(orderId, command.customerId, command.items);

    // 保存
    await this.orderRepository.save(order);

    // イベント発行
    for (const event of order.getUncommittedEvents()) {
      await this.eventBus.publish(event);
    }
  }
}
```

### クエリ側

```typescript
// クエリ定義
interface Query {
  readonly type: string;
}

class GetOrderDetailsQuery implements Query {
  readonly type = "GetOrderDetails";

  constructor(public readonly orderId: string) {}
}

// クエリハンドラー
interface QueryHandler<T extends Query, R> {
  handle(query: T): Promise<R>;
}

class GetOrderDetailsHandler implements QueryHandler<
  GetOrderDetailsQuery,
  OrderDetailsDto
> {
  constructor(private readDb: ReadDatabase) {}

  async handle(query: GetOrderDetailsQuery): Promise<OrderDetailsDto> {
    const result = await this.readDb.query(
      `SELECT * FROM order_details_view WHERE order_id = $1`,
      [query.orderId],
    );

    if (!result) {
      throw new NotFoundError("Order not found");
    }

    return result;
  }
}

// 読み取りモデルの更新（プロジェクション）
class OrderProjection {
  constructor(private readDb: ReadDatabase) {}

  async project(event: DomainEvent): Promise<void> {
    if (event instanceof OrderPlaced) {
      await this.readDb.query(
        `INSERT INTO order_details_view
         (order_id, customer_id, status, total_amount, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          event.aggregateId,
          event.customerId,
          "pending",
          event.totalAmount,
          event.occurredAt,
        ],
      );
    } else if (event instanceof OrderShipped) {
      await this.readDb.query(
        `UPDATE order_details_view
         SET status = 'shipped', tracking_number = $2, updated_at = $3
         WHERE order_id = $1`,
        [event.aggregateId, event.trackingNumber, event.occurredAt],
      );
    }
  }
}
```

## 5. Webhook 統合

### Webhook受信

```typescript
interface WebhookConfig {
  secret?: string;
  signatureHeader?: string;
  signatureAlgorithm?: "sha256" | "sha1";
}

class WebhookReceiver {
  constructor(private config: WebhookConfig) {}

  async receive(headers: Record<string, string>, body: string): Promise<any> {
    // 署名検証
    if (this.config.secret && this.config.signatureHeader) {
      const signature = headers[this.config.signatureHeader];
      if (!this.verifySignature(body, signature)) {
        throw new UnauthorizedError("Invalid webhook signature");
      }
    }

    // ペイロードのパース
    const payload = JSON.parse(body);

    return payload;
  }

  private verifySignature(body: string, signature: string): boolean {
    const algorithm = this.config.signatureAlgorithm || "sha256";
    const expected = crypto
      .createHmac(algorithm, this.config.secret!)
      .update(body)
      .digest("hex");

    // GitHub形式: sha256=xxxxx
    const actualSignature = signature.replace(/^sha\d+=/, "");

    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(actualSignature),
    );
  }
}
```

### Webhook送信

```typescript
interface WebhookTarget {
  url: string;
  secret?: string;
  events: string[];
}

class WebhookDispatcher {
  constructor(private targets: WebhookTarget[]) {}

  async dispatch(eventType: string, payload: any): Promise<void> {
    const matchingTargets = this.targets.filter(
      (t) => t.events.includes(eventType) || t.events.includes("*"),
    );

    const promises = matchingTargets.map((target) =>
      this.sendWebhook(target, eventType, payload),
    );

    const results = await Promise.allSettled(promises);

    // 失敗したWebhookをログ
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `Webhook failed for ${matchingTargets[index].url}:`,
          result.reason,
        );
      }
    });
  }

  private async sendWebhook(
    target: WebhookTarget,
    eventType: string,
    payload: any,
  ): Promise<void> {
    const body = JSON.stringify({
      event: eventType,
      timestamp: new Date().toISOString(),
      data: payload,
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Webhook-Event": eventType,
    };

    if (target.secret) {
      const signature = crypto
        .createHmac("sha256", target.secret)
        .update(body)
        .digest("hex");
      headers["X-Webhook-Signature"] = `sha256=${signature}`;
    }

    const response = await fetch(target.url, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`);
    }
  }
}
```

## 6. イベントバージョニング

### スキーマ進化

```typescript
interface EventUpgrader {
  fromVersion: number;
  toVersion: number;
  upgrade(oldEvent: any): any;
}

class EventVersionManager {
  private upgraders: Map<string, EventUpgrader[]> = new Map();

  registerUpgrader(eventType: string, upgrader: EventUpgrader): void {
    if (!this.upgraders.has(eventType)) {
      this.upgraders.set(eventType, []);
    }
    this.upgraders.get(eventType)!.push(upgrader);
    this.upgraders
      .get(eventType)!
      .sort((a, b) => a.fromVersion - b.fromVersion);
  }

  upgrade(eventType: string, event: any, targetVersion: number): any {
    const upgraders = this.upgraders.get(eventType) || [];
    let currentEvent = event;
    let currentVersion = event.version || 1;

    for (const upgrader of upgraders) {
      if (currentVersion >= targetVersion) break;
      if (currentVersion === upgrader.fromVersion) {
        currentEvent = upgrader.upgrade(currentEvent);
        currentVersion = upgrader.toVersion;
      }
    }

    return currentEvent;
  }
}

// 使用例
const versionManager = new EventVersionManager();

// v1 → v2 のアップグレード
versionManager.registerUpgrader("OrderPlaced", {
  fromVersion: 1,
  toVersion: 2,
  upgrade: (oldEvent) => ({
    ...oldEvent,
    version: 2,
    // 新しいフィールドを追加
    currency: "JPY", // デフォルト値
    // フィールド名変更
    orderTotal: oldEvent.totalAmount,
    totalAmount: undefined,
  }),
});
```

## 7. チェックリスト

### イベント駆動設計チェック

- [ ] イベントスキーマは明確？
- [ ] バージョニング戦略は定義？
- [ ] 冪等なイベントハンドラー？
- [ ] 順序保証が必要な場所は特定？
- [ ] 失敗時のリカバリー戦略？
- [ ] 監視/アラートは設定？
- [ ] イベントの保持期間は決定？
