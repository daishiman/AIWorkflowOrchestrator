/**
 * プロジェクション実装テンプレート
 * Usage: このテンプレートを基にRead Modelの投影を実装
 */

import type { DomainEvent } from "./event-template";

// === 基本プロジェクションインターフェース ===

interface Projection<TEvent extends DomainEvent, TReadModel> {
  // イベントを処理してRead Modelを更新
  project(event: TEvent): Promise<void>;

  // 特定のIDでRead Modelを取得
  getById(id: string): Promise<TReadModel | null>;

  // 全イベントからRead Modelを再構築
  rebuild(events: TEvent[]): Promise<void>;
}

// === Read Modelの例 ===

interface OrderReadModel {
  orderId: string;
  customerId: string;
  customerName: string; // 非正規化データ
  status: string;
  totalAmount: number;
  itemCount: number;
  placedAt: Date;
  updatedAt: Date;
}

// === プロジェクション実装例 ===

// インメモリストア（本番ではDBを使用）
type InMemoryStore<T> = Map<string, T>;

class OrderProjection implements Projection<DomainEvent, OrderReadModel> {
  private store: InMemoryStore<OrderReadModel> = new Map();

  // 外部サービス（例: 顧客名取得）
  private async getCustomerName(customerId: string): Promise<string> {
    // 実際の実装ではAPIコールやDB参照
    return `Customer ${customerId}`;
  }

  async project(event: DomainEvent): Promise<void> {
    switch (event.type) {
      case "OrderPlaced":
        await this.handleOrderPlaced(event);
        break;
      case "OrderConfirmed":
        await this.handleOrderConfirmed(event);
        break;
      case "OrderCancelled":
        await this.handleOrderCancelled(event);
        break;
    }
  }

  private async handleOrderPlaced(event: DomainEvent): Promise<void> {
    const payload = event.payload as {
      customerId: string;
      items: unknown[];
      totalAmount: number;
    };

    const customerName = await this.getCustomerName(payload.customerId);

    const readModel: OrderReadModel = {
      orderId: event.aggregateId,
      customerId: payload.customerId,
      customerName,
      status: "Placed",
      totalAmount: payload.totalAmount,
      itemCount: payload.items.length,
      placedAt: event.occurredAt,
      updatedAt: new Date(),
    };

    this.store.set(event.aggregateId, readModel);
  }

  private async handleOrderConfirmed(event: DomainEvent): Promise<void> {
    const existing = this.store.get(event.aggregateId);
    if (existing) {
      existing.status = "Confirmed";
      existing.updatedAt = new Date();
    }
  }

  private async handleOrderCancelled(event: DomainEvent): Promise<void> {
    const existing = this.store.get(event.aggregateId);
    if (existing) {
      existing.status = "Cancelled";
      existing.updatedAt = new Date();
    }
  }

  async getById(id: string): Promise<OrderReadModel | null> {
    return this.store.get(id) ?? null;
  }

  async rebuild(events: DomainEvent[]): Promise<void> {
    this.store.clear();
    for (const event of events) {
      await this.project(event);
    }
  }

  // クエリメソッド
  async getByCustomer(customerId: string): Promise<OrderReadModel[]> {
    return Array.from(this.store.values()).filter(
      (o) => o.customerId === customerId,
    );
  }

  async getByStatus(status: string): Promise<OrderReadModel[]> {
    return Array.from(this.store.values()).filter((o) => o.status === status);
  }

  async getRecent(limit: number): Promise<OrderReadModel[]> {
    return Array.from(this.store.values())
      .sort((a, b) => b.placedAt.getTime() - a.placedAt.getTime())
      .slice(0, limit);
  }
}

// === イベントハンドラー統合 ===

class ProjectionEventHandler {
  constructor(private projections: Projection<DomainEvent, unknown>[]) {}

  async handle(event: DomainEvent): Promise<void> {
    await Promise.all(this.projections.map((p) => p.project(event)));
  }
}

// === 使用例 ===
/*
const orderProjection = new OrderProjection();
const handler = new ProjectionEventHandler([orderProjection]);

// イベント発行時に呼び出し
await handler.handle(orderPlacedEvent);

// クエリ
const order = await orderProjection.getById("order-123");
const customerOrders = await orderProjection.getByCustomer("customer-456");
*/

export type { Projection, OrderReadModel };
export { OrderProjection, ProjectionEventHandler };
