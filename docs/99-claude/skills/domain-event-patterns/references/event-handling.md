# Level 3: イベントハンドリングとメッセージング

イベント駆動アーキテクチャにおけるイベント発行・購読・処理の実装。

## イベントパブリッシャー

### Outbox Pattern

トランザクション境界とイベント発行の一貫性を保証:

```typescript
// Outboxテーブル
CREATE TABLE outbox (
  id BIGSERIAL PRIMARY KEY,
  event_id UUID NOT NULL UNIQUE,
  aggregate_id UUID NOT NULL,
  event_type VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
);

// 実装
class OutboxEventPublisher {
  async publishWithTransaction(
    events: DomainEvent[],
    transaction: DatabaseTransaction,
  ): Promise<void> {
    // イベントをOutboxテーブルに挿入（同一トランザクション内）
    for (const event of events) {
      await transaction.query(
        `INSERT INTO outbox (event_id, aggregate_id, event_type, payload)
         VALUES ($1, $2, $3, $4)`,
        [event.eventId, event.aggregateId, event.eventType, JSON.stringify(event)]
      );
    }
  }
}

// バックグラウンドワーカー
class OutboxProcessor {
  async processOutbox(): Promise<void> {
    const pendingEvents = await this.db.query(
      `SELECT * FROM outbox WHERE status = 'pending' ORDER BY id LIMIT 100`
    );

    for (const row of pendingEvents.rows) {
      try {
        await this.messagePublisher.publish(row.payload);
        await this.markAsPublished(row.id);
      } catch (error) {
        await this.markAsFailed(row.id, error);
      }
    }
  }
}
```

## イベントハンドラー

### べき等性の実装

```typescript
interface EventHandler {
  handle(event: DomainEvent): Promise<void>;
  canHandle(eventType: string): boolean;
}

class OrderPlacedHandler implements EventHandler {
  private processedEvents: Set<string> = new Set();

  canHandle(eventType: string): boolean {
    return eventType === "OrderPlaced";
  }

  async handle(event: DomainEvent): Promise<void> {
    // べき等性チェック（処理済みイベントをスキップ）
    if (this.processedEvents.has(event.eventId)) {
      console.log(`Event ${event.eventId} already processed, skipping`);
      return;
    }

    // ビジネスロジック実行
    await this.reserveInventory(event.data.items);

    // 処理済みマーク
    this.processedEvents.add(event.eventId);
  }

  private async reserveInventory(items: OrderItem[]): Promise<void> {
    // 在庫予約ロジック...
  }
}
```

### エラーハンドリングとリトライ

```typescript
class ResilientEventHandler {
  constructor(
    private handler: EventHandler,
    private deadLetterQueue: DeadLetterQueue,
  ) {}

  async handleWithRetry(event: DomainEvent, maxRetries = 3): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.handler.handle(event);
        return; // 成功
      } catch (error) {
        lastError = error as Error;

        if (this.isTransientError(error)) {
          const backoff = Math.pow(2, attempt) * 1000; // 指数バックオフ
          await this.sleep(backoff);
        } else {
          // 永続的エラー：即座にDLQへ
          await this.deadLetterQueue.send(event, error as Error);
          return;
        }
      }
    }

    // 最大リトライ回数到達
    await this.deadLetterQueue.send(event, lastError!);
  }

  private isTransientError(error: any): boolean {
    return (
      error.code === "ECONNREFUSED" ||
      error.code === "ETIMEDOUT" ||
      error.status === 503
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

## メッセージング統合

### RabbitMQ

```typescript
class RabbitMQEventPublisher {
  async publish(event: DomainEvent): Promise<void> {
    const exchange = "domain-events";
    const routingKey = event.eventType;

    await this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(event)),
      {
        persistent: true,
        messageId: event.eventId,
        timestamp: event.occurredAt.getTime(),
        headers: {
          correlationId: event.correlationId,
          causationId: event.causationId,
        },
      },
    );
  }
}

class RabbitMQEventSubscriber {
  async subscribe(eventType: string, handler: EventHandler): Promise<void> {
    const queue = `${eventType}-queue`;

    await this.channel.assertQueue(queue, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "dlx",
        "x-message-ttl": 86400000, // 24時間
      },
    });

    await this.channel.bindQueue(queue, "domain-events", eventType);

    this.channel.consume(queue, async (msg) => {
      if (!msg) return;

      try {
        const event = JSON.parse(msg.content.toString());
        await handler.handle(event);
        this.channel.ack(msg);
      } catch (error) {
        this.channel.nack(msg, false, false); // DLQへ
      }
    });
  }
}
```

### Kafka

```typescript
class KafkaEventPublisher {
  async publish(event: DomainEvent): Promise<void> {
    await this.producer.send({
      topic: "domain-events",
      messages: [
        {
          key: event.aggregateId,
          value: JSON.stringify(event),
          headers: {
            eventType: event.eventType,
            correlationId: event.correlationId,
          },
        },
      ],
    });
  }
}

class KafkaEventSubscriber {
  async subscribe(eventType: string, handler: EventHandler): Promise<void> {
    const consumer = this.kafka.consumer({
      groupId: `${eventType}-handler-group`,
    });

    await consumer.connect();
    await consumer.subscribe({ topic: "domain-events" });

    await consumer.run({
      eachMessage: async ({ message }) => {
        const event = JSON.parse(message.value!.toString());
        if (event.eventType === eventType) {
          await handler.handle(event);
        }
      },
    });
  }
}
```

## イベントルーティング

```typescript
class EventRouter {
  private handlers: Map<string, EventHandler[]> = new Map();

  register(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  async route(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) ?? [];

    const results = await Promise.allSettled(
      handlers.map((handler) => handler.handle(event)),
    );

    // エラーハンドリング
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `Handler ${index} failed for event ${event.eventType}:`,
          result.reason,
        );
      }
    });
  }
}
```

## モニタリング

```typescript
class EventMetrics {
  private processedCount = new Counter({
    name: "events_processed_total",
    help: "Total number of events processed",
    labelNames: ["event_type", "status"],
  });

  private processingDuration = new Histogram({
    name: "event_processing_duration_seconds",
    help: "Event processing duration",
    labelNames: ["event_type"],
  });

  async trackHandling(
    event: DomainEvent,
    handler: () => Promise<void>,
  ): Promise<void> {
    const timer = this.processingDuration.startTimer({
      event_type: event.eventType,
    });

    try {
      await handler();
      this.processedCount.inc({
        event_type: event.eventType,
        status: "success",
      });
    } catch (error) {
      this.processedCount.inc({
        event_type: event.eventType,
        status: "failure",
      });
      throw error;
    } finally {
      timer();
    }
  }
}
```

## まとめ

Level 3では以下を学びました:

- Outbox Patternによるトランザクション一貫性
- べき等なイベントハンドラーの実装
- エラーハンドリングとリトライ戦略
- RabbitMQ/Kafkaとの統合
- イベントルーティングとモニタリング

次のLevel 4では、イベントソーシングとCQRSの高度なパターンを学びます。
