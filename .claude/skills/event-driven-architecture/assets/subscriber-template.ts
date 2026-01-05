/**
 * Event Subscriber Template
 * Implements idempotent event handling for event-driven architecture
 */

import type { EventBase } from "./publisher-template";

// Event handler interface
export interface EventHandler<T extends EventBase> {
  eventType: string;
  handle(event: T): Promise<void>;
}

// Idempotency store interface
export interface IdempotencyStore {
  isProcessed(eventId: string): Promise<boolean>;
  markProcessed(eventId: string): Promise<void>;
}

// Dead letter queue interface
export interface DeadLetterQueue {
  send(event: EventBase, error: Error): Promise<void>;
}

// Event subscriber with retry and idempotency
export class EventSubscriber {
  private readonly handlers: Map<string, EventHandler<EventBase>> = new Map();
  private readonly idempotencyStore: IdempotencyStore;
  private readonly dlq: DeadLetterQueue;
  private readonly maxRetries: number;

  constructor(
    idempotencyStore: IdempotencyStore,
    dlq: DeadLetterQueue,
    maxRetries = 3,
  ) {
    this.idempotencyStore = idempotencyStore;
    this.dlq = dlq;
    this.maxRetries = maxRetries;
  }

  register<T extends EventBase>(handler: EventHandler<T>): void {
    this.handlers.set(handler.eventType, handler as EventHandler<EventBase>);
  }

  async handleMessage(message: string): Promise<void> {
    let event: EventBase;

    // Parse event
    try {
      event = JSON.parse(message);
    } catch (error) {
      console.error("Failed to parse event message", { error, message });
      return; // Cannot retry unparseable messages
    }

    // Check idempotency
    const isProcessed = await this.idempotencyStore.isProcessed(event.eventId);
    if (isProcessed) {
      console.log("Event already processed, skipping", {
        eventId: event.eventId,
      });
      return;
    }

    // Find handler
    const handler = this.handlers.get(event.eventType);
    if (!handler) {
      console.warn("No handler registered for event type", {
        eventType: event.eventType,
      });
      return;
    }

    // Process with retry
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await handler.handle(event);
        await this.idempotencyStore.markProcessed(event.eventId);
        console.log("Event processed successfully", {
          eventId: event.eventId,
          eventType: event.eventType,
          attempt,
        });
        return;
      } catch (error) {
        lastError = error as Error;
        console.error("Event processing failed", {
          eventId: event.eventId,
          attempt,
          error: lastError.message,
        });

        // Exponential backoff
        if (attempt < this.maxRetries) {
          await this.delay(Math.pow(2, attempt) * 100);
        }
      }
    }

    // Send to DLQ after all retries exhausted
    if (lastError) {
      console.error("Sending event to DLQ after max retries", {
        eventId: event.eventId,
      });
      await this.dlq.send(event, lastError);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// In-memory idempotency store (for development/testing)
export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly processed: Set<string> = new Set();

  async isProcessed(eventId: string): Promise<boolean> {
    return this.processed.has(eventId);
  }

  async markProcessed(eventId: string): Promise<void> {
    this.processed.add(eventId);
  }
}

// Console DLQ (for development/testing)
export class ConsoleDeadLetterQueue implements DeadLetterQueue {
  async send(event: EventBase, error: Error): Promise<void> {
    console.error("DLQ:", {
      eventId: event.eventId,
      eventType: event.eventType,
      error: error.message,
    });
  }
}

// Usage example
/*
const subscriber = new EventSubscriber(
  new InMemoryIdempotencyStore(),
  new ConsoleDeadLetterQueue()
);

subscriber.register({
  eventType: "order.created",
  async handle(event) {
    console.log("Processing order:", event.data);
    // Business logic here
  },
});

await subscriber.handleMessage(JSON.stringify(event));
*/
