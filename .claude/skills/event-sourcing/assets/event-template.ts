/**
 * ドメインイベント実装テンプレート
 * Usage: このテンプレートを基にドメイン固有のイベントを実装
 */

// === 基本インターフェース ===

interface EventMetadata {
  correlationId: string;
  causationId: string;
  userId: string;
  timestamp: Date;
}

interface DomainEvent<T extends string = string, P = unknown> {
  readonly type: T;
  readonly version: number;
  readonly aggregateId: string;
  readonly payload: P;
  readonly metadata: EventMetadata;
  readonly occurredAt: Date;
}

// === イベントファクトリー ===

function createEvent<T extends string, P>(
  type: T,
  aggregateId: string,
  payload: P,
  metadata: Partial<EventMetadata> = {},
): DomainEvent<T, P> {
  return {
    type,
    version: 1,
    aggregateId,
    payload,
    metadata: {
      correlationId: metadata.correlationId ?? crypto.randomUUID(),
      causationId: metadata.causationId ?? "",
      userId: metadata.userId ?? "system",
      timestamp: metadata.timestamp ?? new Date(),
    },
    occurredAt: new Date(),
  };
}

// === 具体的なイベント例 ===

// イベントペイロード型
interface OrderPlacedPayload {
  customerId: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  totalAmount: number;
}

interface OrderConfirmedPayload {
  confirmedBy: string;
}

interface OrderCancelledPayload {
  reason: string;
  cancelledBy: string;
}

// イベント型
type OrderPlaced = DomainEvent<"OrderPlaced", OrderPlacedPayload>;
type OrderConfirmed = DomainEvent<"OrderConfirmed", OrderConfirmedPayload>;
type OrderCancelled = DomainEvent<"OrderCancelled", OrderCancelledPayload>;

// ユニオン型
type OrderEvent = OrderPlaced | OrderConfirmed | OrderCancelled;

// === イベント作成ヘルパー ===

const OrderEvents = {
  placed: (
    orderId: string,
    payload: OrderPlacedPayload,
    metadata?: Partial<EventMetadata>,
  ): OrderPlaced => createEvent("OrderPlaced", orderId, payload, metadata),

  confirmed: (
    orderId: string,
    payload: OrderConfirmedPayload,
    metadata?: Partial<EventMetadata>,
  ): OrderConfirmed =>
    createEvent("OrderConfirmed", orderId, payload, metadata),

  cancelled: (
    orderId: string,
    payload: OrderCancelledPayload,
    metadata?: Partial<EventMetadata>,
  ): OrderCancelled =>
    createEvent("OrderCancelled", orderId, payload, metadata),
};

// === 使用例 ===
/*
const event = OrderEvents.placed("order-123", {
  customerId: "customer-456",
  items: [{ productId: "prod-1", quantity: 2, price: 1000 }],
  totalAmount: 2000,
});
*/

export type { DomainEvent, EventMetadata, OrderEvent };
export { createEvent, OrderEvents };
