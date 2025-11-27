# 非同期統合パターン詳細ガイド

## 1. Message Queue パターン

### 基本アーキテクチャ

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Producer    │ ──► │    Queue     │ ──► │  Consumer    │
│  (MCP Tool)  │     │  (Redis/     │     │  (Worker)    │
└──────────────┘     │  RabbitMQ)   │     └──────────────┘
                     └──────────────┘
```

### プロデューサー実装

```typescript
interface MessageQueue {
  publish(queue: string, message: any): Promise<void>;
  subscribe(queue: string, handler: (message: any) => Promise<void>): Promise<void>;
}

class RedisMessageQueue implements MessageQueue {
  private client: Redis;

  constructor(connectionString: string) {
    this.client = new Redis(connectionString);
  }

  async publish(queue: string, message: any): Promise<void> {
    const payload = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      data: message
    };

    await this.client.lpush(queue, JSON.stringify(payload));
  }

  async subscribe(
    queue: string,
    handler: (message: any) => Promise<void>
  ): Promise<void> {
    while (true) {
      try {
        // BRPOP でブロッキング取得
        const result = await this.client.brpop(queue, 0);
        if (result) {
          const [, payload] = result;
          const message = JSON.parse(payload);
          await handler(message);
        }
      } catch (error) {
        console.error('Error processing message:', error);
        // エラー後に少し待機
        await sleep(1000);
      }
    }
  }
}
```

### コンシューマー実装

```typescript
interface ConsumerConfig {
  concurrency: number;
  maxRetries: number;
  retryDelay: number;
  deadLetterQueue?: string;
}

class MessageConsumer {
  private running = false;
  private activeJobs = 0;

  constructor(
    private queue: MessageQueue,
    private config: ConsumerConfig
  ) {}

  async start(
    queueName: string,
    handler: (message: any) => Promise<void>
  ): Promise<void> {
    this.running = true;

    while (this.running) {
      if (this.activeJobs >= this.config.concurrency) {
        await sleep(100);
        continue;
      }

      this.processNext(queueName, handler);
    }
  }

  private async processNext(
    queueName: string,
    handler: (message: any) => Promise<void>
  ): Promise<void> {
    this.activeJobs++;

    try {
      await this.queue.subscribe(queueName, async (message) => {
        await this.processWithRetry(message, handler);
      });
    } finally {
      this.activeJobs--;
    }
  }

  private async processWithRetry(
    message: any,
    handler: (message: any) => Promise<void>
  ): Promise<void> {
    const retries = message.retries || 0;

    try {
      await handler(message.data);
    } catch (error) {
      if (retries < this.config.maxRetries) {
        // リトライキューに再投入
        await sleep(this.config.retryDelay * Math.pow(2, retries));
        message.retries = retries + 1;
        await this.queue.publish(message.queue, message);
      } else if (this.config.deadLetterQueue) {
        // Dead Letter Queue に移動
        await this.queue.publish(this.config.deadLetterQueue, {
          ...message,
          error: error.message,
          failedAt: new Date().toISOString()
        });
      }
    }
  }

  stop(): void {
    this.running = false;
  }
}
```

## 2. Pub/Sub パターン

### トピックベースの通信

```typescript
interface PubSubClient {
  publish(topic: string, message: any): Promise<void>;
  subscribe(topic: string, handler: (message: any) => void): () => void;
}

class EventBus implements PubSubClient {
  private subscribers: Map<string, Set<(message: any) => void>> = new Map();

  async publish(topic: string, message: any): Promise<void> {
    const handlers = this.subscribers.get(topic);
    if (handlers) {
      const payload = {
        id: generateUUID(),
        topic,
        timestamp: new Date().toISOString(),
        data: message
      };

      for (const handler of handlers) {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in handler for topic ${topic}:`, error);
        }
      }
    }
  }

  subscribe(topic: string, handler: (message: any) => void): () => void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }

    this.subscribers.get(topic)!.add(handler);

    // Unsubscribe 関数を返す
    return () => {
      this.subscribers.get(topic)?.delete(handler);
    };
  }
}

// パターンマッチングサポート
class PatternEventBus extends EventBus {
  async publish(topic: string, message: any): Promise<void> {
    // 完全一致
    await super.publish(topic, message);

    // ワイルドカードマッチング
    const parts = topic.split('.');
    for (let i = parts.length - 1; i >= 0; i--) {
      const pattern = [...parts.slice(0, i), '*'].join('.');
      await super.publish(pattern, message);
    }
  }
}
```

### イベントフィルタリング

```typescript
interface EventFilter {
  topic?: string | RegExp;
  type?: string;
  attributes?: Record<string, any>;
}

class FilteredSubscriber {
  constructor(
    private eventBus: PubSubClient,
    private filter: EventFilter
  ) {}

  subscribe(handler: (message: any) => void): () => void {
    return this.eventBus.subscribe('*', (message) => {
      if (this.matchesFilter(message)) {
        handler(message);
      }
    });
  }

  private matchesFilter(message: any): boolean {
    if (this.filter.topic) {
      if (typeof this.filter.topic === 'string') {
        if (message.topic !== this.filter.topic) return false;
      } else {
        if (!this.filter.topic.test(message.topic)) return false;
      }
    }

    if (this.filter.type && message.data?.type !== this.filter.type) {
      return false;
    }

    if (this.filter.attributes) {
      for (const [key, value] of Object.entries(this.filter.attributes)) {
        if (message.data?.[key] !== value) return false;
      }
    }

    return true;
  }
}
```

## 3. Saga パターン

### オーケストレーションSaga

```typescript
interface SagaStep<TContext> {
  name: string;
  execute: (context: TContext) => Promise<TContext>;
  compensate: (context: TContext) => Promise<TContext>;
}

class SagaOrchestrator<TContext> {
  private steps: SagaStep<TContext>[] = [];
  private completedSteps: SagaStep<TContext>[] = [];

  addStep(step: SagaStep<TContext>): this {
    this.steps.push(step);
    return this;
  }

  async execute(initialContext: TContext): Promise<TContext> {
    let context = initialContext;
    this.completedSteps = [];

    try {
      for (const step of this.steps) {
        console.log(`Executing step: ${step.name}`);
        context = await step.execute(context);
        this.completedSteps.push(step);
      }

      return context;
    } catch (error) {
      console.error('Saga failed, starting compensation:', error);
      await this.compensate(context);
      throw new SagaFailedError('Saga execution failed', error as Error);
    }
  }

  private async compensate(context: TContext): Promise<void> {
    // 逆順で補償
    for (const step of this.completedSteps.reverse()) {
      try {
        console.log(`Compensating step: ${step.name}`);
        await step.compensate(context);
      } catch (compensateError) {
        console.error(`Compensation failed for ${step.name}:`, compensateError);
        // 補償失敗はログに記録し、続行
      }
    }
  }
}

// 使用例: 注文処理Saga
interface OrderContext {
  orderId: string;
  userId: string;
  amount: number;
  inventoryReserved?: boolean;
  paymentProcessed?: boolean;
  shippingScheduled?: boolean;
}

const orderSaga = new SagaOrchestrator<OrderContext>()
  .addStep({
    name: 'Reserve Inventory',
    execute: async (ctx) => {
      await inventoryService.reserve(ctx.orderId, ctx.items);
      return { ...ctx, inventoryReserved: true };
    },
    compensate: async (ctx) => {
      await inventoryService.release(ctx.orderId);
      return { ...ctx, inventoryReserved: false };
    }
  })
  .addStep({
    name: 'Process Payment',
    execute: async (ctx) => {
      await paymentService.charge(ctx.userId, ctx.amount);
      return { ...ctx, paymentProcessed: true };
    },
    compensate: async (ctx) => {
      await paymentService.refund(ctx.userId, ctx.amount);
      return { ...ctx, paymentProcessed: false };
    }
  })
  .addStep({
    name: 'Schedule Shipping',
    execute: async (ctx) => {
      await shippingService.schedule(ctx.orderId);
      return { ...ctx, shippingScheduled: true };
    },
    compensate: async (ctx) => {
      await shippingService.cancel(ctx.orderId);
      return { ...ctx, shippingScheduled: false };
    }
  });
```

### コレオグラフィーSaga

```typescript
// イベント駆動の分散Saga
interface SagaEvent {
  sagaId: string;
  stepName: string;
  status: 'started' | 'completed' | 'failed';
  data: any;
}

class ChoreographySaga {
  constructor(
    private eventBus: PubSubClient,
    private sagaId: string
  ) {}

  async start(initialData: any): Promise<void> {
    await this.eventBus.publish('saga.started', {
      sagaId: this.sagaId,
      data: initialData
    });
  }

  // 各サービスはイベントをリッスンして反応
  static createHandler(
    eventBus: PubSubClient,
    config: {
      listenTo: string;
      execute: (data: any) => Promise<any>;
      onSuccess: string;
      onFailure: string;
    }
  ): () => void {
    return eventBus.subscribe(config.listenTo, async (event) => {
      try {
        const result = await config.execute(event.data);
        await eventBus.publish(config.onSuccess, {
          sagaId: event.sagaId,
          data: result
        });
      } catch (error) {
        await eventBus.publish(config.onFailure, {
          sagaId: event.sagaId,
          error: error.message
        });
      }
    });
  }
}
```

## 4. 冪等性の保証

### 冪等キーパターン

```typescript
interface IdempotencyStore {
  get(key: string): Promise<any | null>;
  set(key: string, value: any, ttl?: number): Promise<void>;
}

class IdempotentProcessor {
  constructor(
    private store: IdempotencyStore,
    private ttl: number = 86400 // 24時間
  ) {}

  async process<T>(
    idempotencyKey: string,
    operation: () => Promise<T>
  ): Promise<T> {
    // 既存の結果を確認
    const existing = await this.store.get(idempotencyKey);
    if (existing) {
      console.log('Returning cached result for key:', idempotencyKey);
      return existing as T;
    }

    // 処理実行
    const result = await operation();

    // 結果を保存
    await this.store.set(idempotencyKey, result, this.ttl);

    return result;
  }
}

// 使用例
const processor = new IdempotentProcessor(redisStore);

async function createOrder(orderId: string, data: any): Promise<Order> {
  return processor.process(`order:create:${orderId}`, async () => {
    const order = await orderService.create(data);
    return order;
  });
}
```

### メッセージ重複排除

```typescript
class DeduplicatedConsumer {
  private processedIds: Set<string> = new Set();
  private maxSize = 10000;

  async process(
    message: { id: string; data: any },
    handler: (data: any) => Promise<void>
  ): Promise<boolean> {
    // 重複チェック
    if (this.processedIds.has(message.id)) {
      console.log('Duplicate message ignored:', message.id);
      return false;
    }

    // 処理
    await handler(message.data);

    // IDを記録
    this.processedIds.add(message.id);

    // サイズ制限
    if (this.processedIds.size > this.maxSize) {
      const firstId = this.processedIds.values().next().value;
      this.processedIds.delete(firstId);
    }

    return true;
  }
}
```

## 5. バックプレッシャー

### 流量制御

```typescript
class BackpressureController {
  private pending = 0;
  private waiters: (() => void)[] = [];

  constructor(private maxConcurrency: number) {}

  async acquire(): Promise<void> {
    if (this.pending < this.maxConcurrency) {
      this.pending++;
      return;
    }

    // 空きを待つ
    await new Promise<void>((resolve) => {
      this.waiters.push(resolve);
    });

    this.pending++;
  }

  release(): void {
    this.pending--;

    // 待機中のタスクがあれば解放
    const waiter = this.waiters.shift();
    if (waiter) {
      waiter();
    }
  }

  async withBackpressure<T>(operation: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await operation();
    } finally {
      this.release();
    }
  }
}

// 使用例
const controller = new BackpressureController(10); // 最大10並列

async function processMessages(messages: any[]): Promise<void> {
  await Promise.all(
    messages.map((msg) =>
      controller.withBackpressure(() => processMessage(msg))
    )
  );
}
```

## 6. Dead Letter Queue

### DLQ管理

```typescript
interface DeadLetter {
  originalMessage: any;
  error: string;
  failedAt: Date;
  retryCount: number;
  queue: string;
}

class DeadLetterManager {
  constructor(
    private dlqQueue: MessageQueue,
    private dlqName: string
  ) {}

  async moveToDeadLetter(
    message: any,
    error: Error,
    sourceQueue: string
  ): Promise<void> {
    const deadLetter: DeadLetter = {
      originalMessage: message,
      error: error.message,
      failedAt: new Date(),
      retryCount: message.retries || 0,
      queue: sourceQueue
    };

    await this.dlqQueue.publish(this.dlqName, deadLetter);
  }

  async reprocess(
    targetQueue: MessageQueue,
    filter?: (dl: DeadLetter) => boolean
  ): Promise<number> {
    let count = 0;

    // DLQからメッセージを取得して再処理
    // 実装は使用するキューシステムに依存

    return count;
  }

  async getDeadLetters(limit: number = 100): Promise<DeadLetter[]> {
    // DLQ内のメッセージ一覧を取得
    return [];
  }
}
```

## 7. チェックリスト

### 非同期統合実装チェック

- [ ] メッセージの永続化は設定済み？
- [ ] 冪等性は保証？
- [ ] Dead Letter Queue は設定？
- [ ] バックプレッシャーは実装？
- [ ] 監視/アラートは設定？
- [ ] リトライロジックは適切？
- [ ] 順序保証が必要な場合は実装済み？
