# Level 1: ドメインイベントパターンの基礎

## ドメインイベントとは

ドメインイベントは、ビジネスドメイン内で発生した**重要な出来事**を表すオブジェクトです。
これは過去の事実であり、変更することはできません。

### 主な特徴

- **不変性**: 一度発生したイベントは変更できない
- **過去形**: イベント名は過去形の動詞句（OrderPlaced, PaymentProcessed）
- **タイムスタンプ**: いつ発生したかを記録
- **識別性**: 一意のIDを持つ
- **意図の明確化**: ビジネスの言葉で名前付け

### なぜドメインイベントを使うのか

1. **ビジネスの可視化**: システムで何が起きたか明確
2. **監査ログ**: すべての変更履歴を自動的に記録
3. **システム間連携**: イベントを通じた疎結合な統合
4. **時間遡行**: 過去の任意の時点の状態を再現可能
5. **拡張性**: 新しい機能を既存コードに影響なく追加

## 基本概念

### イベントの構造

すべてのドメインイベントは以下の要素を含むべきです:

```typescript
interface DomainEvent {
  // 識別情報
  eventId: string; // イベントの一意ID
  eventType: string; // イベントタイプ名
  eventVersion: number; // イベントスキーマバージョン

  // 集約情報
  aggregateId: string; // どの集約で発生したか
  aggregateType: string; // 集約の種類
  aggregateVersion: number; // 集約のバージョン（シーケンス番号）

  // 時間情報
  occurredAt: Date; // イベント発生日時

  // 追跡情報
  correlationId?: string; // 相関ID（同一ビジネスプロセス）
  causationId?: string; // 因果ID（このイベントの原因となったイベント）

  // ペイロード
  data: EventData; // イベント固有のデータ
  metadata?: Record<string, any>; // 追加のメタデータ
}
```

### イベントの例

```typescript
// 注文が配置されたイベント
interface OrderPlacedEvent extends DomainEvent {
  eventType: "OrderPlaced";
  aggregateType: "Order";
  data: {
    orderId: string;
    customerId: string;
    items: OrderItem[];
    totalAmount: Money;
    shippingAddress: Address;
  };
}

// 支払いが処理されたイベント
interface PaymentProcessedEvent extends DomainEvent {
  eventType: "PaymentProcessed";
  aggregateType: "Payment";
  data: {
    paymentId: string;
    orderId: string;
    amount: Money;
    paymentMethod: string;
    transactionId: string;
  };
}
```

## イベント命名規則

### 基本ルール

1. **過去形を使用**: `OrderPlaced`, `PaymentProcessed`, `InventoryReserved`
2. **ビジネス用語**: 技術用語ではなくドメインの言葉
3. **明確な意味**: 何が起きたか一目で分かる
4. **動詞+名詞**: `{動詞過去形}{名詞}` のパターン

### 良い例・悪い例

| 良い例              | 悪い例             | 理由                                 |
| ------------------- | ------------------ | ------------------------------------ |
| OrderPlaced         | OrderCreate        | 過去形でない                         |
| PaymentProcessed    | PaymentData        | 出来事を表していない                 |
| CustomerRegistered  | NewCustomer        | 動詞がない                           |
| InventoryReserved   | UpdateInventory    | ビジネス用語でない                   |
| ProductPriceChanged | ProductUpdated     | 何が変わったか不明確                 |
| OrderShipped        | OrderStatusChanged | 抽象的すぎる（何に変わったか不明確） |

## イベントの発行

### 集約からの発行

ドメインイベントは通常、集約のビジネスロジックが実行された結果として発行されます:

```typescript
class Order {
  private uncommittedEvents: DomainEvent[] = [];

  placeOrder(customerId: string, items: OrderItem[]): void {
    // ビジネスルールの検証
    if (items.length === 0) {
      throw new Error("Order must have at least one item");
    }

    // 状態変更
    this.status = OrderStatus.Placed;
    this.items = items;

    // イベント発行
    this.addEvent({
      eventId: uuid(),
      eventType: "OrderPlaced",
      eventVersion: 1,
      aggregateId: this.id,
      aggregateType: "Order",
      aggregateVersion: this.version + 1,
      occurredAt: new Date(),
      data: {
        orderId: this.id,
        customerId,
        items,
        totalAmount: this.calculateTotal(),
      },
    });
  }

  private addEvent(event: DomainEvent): void {
    this.uncommittedEvents.push(event);
    this.version++;
  }

  getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  clearUncommittedEvents(): void {
    this.uncommittedEvents = [];
  }
}
```

## イベントの永続化

### 基本的な保存

イベントは追記専用（Append-only）のストレージに保存します:

```typescript
interface EventStore {
  // イベントを追記
  append(
    aggregateId: string,
    events: DomainEvent[],
    expectedVersion: number,
  ): Promise<void>;

  // 集約のイベントストリームを取得
  getEvents(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]>;
}
```

### 楽観的同時実行制御

複数のプロセスが同時に同じ集約を更新しようとした場合、
Expected Versionチェックでコンフリクトを検出します:

```typescript
async function saveAggregate(aggregate: Order): Promise<void> {
  const events = aggregate.getUncommittedEvents();
  if (events.length === 0) return;

  try {
    await eventStore.append(
      aggregate.id,
      events,
      aggregate.version - events.length,
    );
    aggregate.clearUncommittedEvents();
  } catch (error) {
    if (error instanceof ConcurrencyError) {
      throw new Error("Aggregate has been modified by another process");
    }
    throw error;
  }
}
```

## 簡単な実践例

### ステップ1: イベントを定義

```typescript
interface UserRegisteredEvent extends DomainEvent {
  eventType: "UserRegistered";
  data: {
    userId: string;
    email: string;
    name: string;
  };
}
```

### ステップ2: 集約でイベントを発行

```typescript
class User {
  register(email: string, name: string): void {
    // ビジネスルール検証
    if (!this.isValidEmail(email)) {
      throw new Error("Invalid email");
    }

    // イベント発行
    this.addEvent({
      eventId: uuid(),
      eventType: "UserRegistered",
      eventVersion: 1,
      aggregateId: this.id,
      aggregateType: "User",
      aggregateVersion: 1,
      occurredAt: new Date(),
      data: { userId: this.id, email, name },
    });
  }
}
```

### ステップ3: イベントを保存

```typescript
const user = new User();
user.register("user@example.com", "John Doe");

const events = user.getUncommittedEvents();
await eventStore.append(user.id, events, 0);
```

## まとめ

Level 1では以下を学びました:

- ドメインイベントは過去の事実を表す不変オブジェクト
- イベント名は過去形の動詞句で、ビジネスの言葉を使う
- イベントには識別情報、集約情報、時間情報、ペイロードが含まれる
- イベントは集約のビジネスロジック実行時に発行される
- イベントは追記専用のストレージに保存される
- 楽観的同時実行制御でコンフリクトを検出する

次のレベルでは、イベントストアの実装詳細とスナップショット機構について学びます。
