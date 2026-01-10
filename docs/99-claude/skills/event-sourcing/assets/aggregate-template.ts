/**
 * アグリゲート実装テンプレート
 * Usage: このテンプレートを基にドメイン固有のアグリゲートを実装
 */

import type { DomainEvent, EventMetadata } from "./event-template";

// === 基本アグリゲートクラス ===

abstract class AggregateRoot<TEvent extends DomainEvent> {
  private _uncommittedEvents: TEvent[] = [];
  private _version: number = 0;

  protected constructor(public readonly id: string) {}

  get version(): number {
    return this._version;
  }

  get uncommittedEvents(): readonly TEvent[] {
    return this._uncommittedEvents;
  }

  // イベントを適用（状態変更）
  protected apply(event: TEvent): void {
    this.applyEvent(event);
    this._uncommittedEvents.push(event);
    this._version++;
  }

  // イベントから状態を再構築
  loadFromHistory(events: TEvent[]): void {
    for (const event of events) {
      this.applyEvent(event);
      this._version++;
    }
  }

  // コミット済みとしてマーク
  markEventsAsCommitted(): void {
    this._uncommittedEvents = [];
  }

  // サブクラスで実装: イベントを状態に適用
  protected abstract applyEvent(event: TEvent): void;
}

// === 具体的なアグリゲート例 ===

type OrderStatus = "Draft" | "Placed" | "Confirmed" | "Cancelled";

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

// イベント型（簡略化）
interface OrderPlacedEvent extends DomainEvent<"OrderPlaced"> {
  payload: { customerId: string; items: OrderItem[]; totalAmount: number };
}
interface OrderConfirmedEvent extends DomainEvent<"OrderConfirmed"> {
  payload: { confirmedBy: string };
}
interface OrderCancelledEvent extends DomainEvent<"OrderCancelled"> {
  payload: { reason: string };
}

type OrderEvent = OrderPlacedEvent | OrderConfirmedEvent | OrderCancelledEvent;

class OrderAggregate extends AggregateRoot<OrderEvent> {
  private _status: OrderStatus = "Draft";
  private _customerId: string = "";
  private _items: OrderItem[] = [];
  private _totalAmount: number = 0;

  static create(orderId: string): OrderAggregate {
    return new OrderAggregate(orderId);
  }

  static reconstitute(orderId: string, events: OrderEvent[]): OrderAggregate {
    const order = new OrderAggregate(orderId);
    order.loadFromHistory(events);
    return order;
  }

  // コマンド: 注文を発行
  place(
    customerId: string,
    items: OrderItem[],
    metadata?: Partial<EventMetadata>,
  ): void {
    if (this._status !== "Draft") {
      throw new Error("Order can only be placed from Draft status");
    }
    if (items.length === 0) {
      throw new Error("Order must have at least one item");
    }

    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    this.apply({
      type: "OrderPlaced",
      version: 1,
      aggregateId: this.id,
      payload: { customerId, items, totalAmount },
      metadata: {
        correlationId: metadata?.correlationId ?? crypto.randomUUID(),
        causationId: metadata?.causationId ?? "",
        userId: metadata?.userId ?? "system",
        timestamp: metadata?.timestamp ?? new Date(),
      },
      occurredAt: new Date(),
    });
  }

  // コマンド: 注文を確認
  confirm(confirmedBy: string, metadata?: Partial<EventMetadata>): void {
    if (this._status !== "Placed") {
      throw new Error("Order can only be confirmed from Placed status");
    }

    this.apply({
      type: "OrderConfirmed",
      version: 1,
      aggregateId: this.id,
      payload: { confirmedBy },
      metadata: {
        correlationId: metadata?.correlationId ?? crypto.randomUUID(),
        causationId: metadata?.causationId ?? "",
        userId: metadata?.userId ?? "system",
        timestamp: metadata?.timestamp ?? new Date(),
      },
      occurredAt: new Date(),
    });
  }

  // イベント適用
  protected applyEvent(event: OrderEvent): void {
    switch (event.type) {
      case "OrderPlaced":
        this._status = "Placed";
        this._customerId = event.payload.customerId;
        this._items = event.payload.items;
        this._totalAmount = event.payload.totalAmount;
        break;
      case "OrderConfirmed":
        this._status = "Confirmed";
        break;
      case "OrderCancelled":
        this._status = "Cancelled";
        break;
    }
  }

  // Getters
  get status(): OrderStatus {
    return this._status;
  }
  get customerId(): string {
    return this._customerId;
  }
  get items(): readonly OrderItem[] {
    return this._items;
  }
  get totalAmount(): number {
    return this._totalAmount;
  }
}

export { AggregateRoot, OrderAggregate };
