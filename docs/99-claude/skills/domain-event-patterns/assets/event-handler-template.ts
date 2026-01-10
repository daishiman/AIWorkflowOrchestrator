/**
 * イベントハンドラーテンプレート
 *
 * 使用方法:
 *   1. このファイルをコピーして新しいハンドラーを作成
 *   2. {{EventName}} を処理するイベント名に置換
 *   3. handle メソッドにビジネスロジックを実装
 */

import type { DomainEvent } from "./domain-event-template";

// イベントハンドラーインターフェース
export interface EventHandler<T extends DomainEvent> {
  readonly eventType: string;
  handle(event: T): Promise<void>;
}

// べき等性を保証するためのインターフェース
export interface IdempotentEventHandler<T extends DomainEvent>
  extends EventHandler<T> {
  hasProcessed(eventId: string): Promise<boolean>;
  markAsProcessed(eventId: string): Promise<void>;
}

// 具体的なイベントハンドラー
export class {{EventName}}Handler
  implements IdempotentEventHandler<DomainEvent>
{
  readonly eventType = "{{aggregateType}}.{{EventName}}";

  private processedEvents: Set<string> = new Set();

  constructor(
    // 依存関係をコンストラクタで注入
    // private readonly repository: SomeRepository,
    // private readonly eventStore: EventStore,
  ) {}

  /**
   * イベントが既に処理済みかチェック
   */
  async hasProcessed(eventId: string): Promise<boolean> {
    // 実際の実装では永続化されたストアを確認
    return this.processedEvents.has(eventId);
  }

  /**
   * イベントを処理済みとしてマーク
   */
  async markAsProcessed(eventId: string): Promise<void> {
    // 実際の実装では永続化
    this.processedEvents.add(eventId);
  }

  /**
   * イベントを処理
   *
   * べき等性: 同じイベントが複数回呼ばれても同じ結果を保証
   */
  async handle(event: DomainEvent): Promise<void> {
    // べき等性チェック
    if (await this.hasProcessed(event.eventId)) {
      console.log(`Event ${event.eventId} already processed, skipping`);
      return;
    }

    try {
      // ビジネスロジックをここに実装
      await this.processEvent(event);

      // 成功したら処理済みとしてマーク
      await this.markAsProcessed(event.eventId);
    } catch (error) {
      // エラーハンドリング
      console.error(`Failed to process event ${event.eventId}:`, error);
      throw error;
    }
  }

  /**
   * 実際のビジネスロジック
   */
  private async processEvent(event: DomainEvent): Promise<void> {
    // TODO: イベントに応じたビジネスロジックを実装
    // 例:
    // const aggregate = await this.repository.findById(event.aggregateId);
    // aggregate.applyEvent(event);
    // await this.repository.save(aggregate);
    console.log(`Processing event: ${event.eventType}`, event.payload);
  }
}

// イベントディスパッチャー
export class EventDispatcher {
  private handlers: Map<string, EventHandler<DomainEvent>[]> = new Map();

  /**
   * ハンドラーを登録
   */
  register(handler: EventHandler<DomainEvent>): void {
    const handlers = this.handlers.get(handler.eventType) || [];
    handlers.push(handler);
    this.handlers.set(handler.eventType, handlers);
  }

  /**
   * イベントをディスパッチ
   */
  async dispatch(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];

    if (handlers.length === 0) {
      console.warn(`No handlers registered for event type: ${event.eventType}`);
      return;
    }

    // 全てのハンドラーを並列実行
    await Promise.all(handlers.map((h) => h.handle(event)));
  }

  /**
   * 複数イベントを順次ディスパッチ
   */
  async dispatchAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.dispatch(event);
    }
  }
}
