# Level 3: Advanced MCP Server Patterns

## Advanced Architecture Patterns

### Hexagonal Architecture (Ports and Adapters)

Organize your MCP server to be independent of external concerns:

```
src/
├── domain/                    # Core business logic
│   ├── models/
│   ├── services/
│   └── ports/                 # Interfaces for external dependencies
│       ├── file-repository.ts
│       └── api-client.ts
├── application/               # Use cases and orchestration
│   ├── use-cases/
│   │   ├── process-file.ts
│   │   └── fetch-data.ts
│   └── tools/                 # MCP tool definitions
│       ├── read-file-tool.ts
│       └── fetch-data-tool.ts
└── infrastructure/            # Adapters (external implementations)
    ├── mcp/                   # MCP server adapter
    ├── file-system/           # File system adapter
    └── http/                  # HTTP client adapter
```

**Example Implementation**:

```typescript
// domain/ports/file-repository.ts
export interface FileRepository {
  read(path: string): Promise<string>;
  write(path: string, content: string): Promise<void>;
  list(directory: string): Promise<string[]>;
}

// infrastructure/file-system/fs-file-repository.ts
import * as fs from "fs/promises";

export class FsFileRepository implements FileRepository {
  constructor(private readonly basePath: string) {}

  async read(path: string): Promise<string> {
    const fullPath = join(this.basePath, path);
    return await fs.readFile(fullPath, "utf-8");
  }

  async write(path: string, content: string): Promise<void> {
    const fullPath = join(this.basePath, path);
    await fs.writeFile(fullPath, content, "utf-8");
  }

  async list(directory: string): Promise<string[]> {
    const fullPath = join(this.basePath, directory);
    return await fs.readdir(fullPath);
  }
}

// application/use-cases/process-file.ts
export class ProcessFileUseCase {
  constructor(private readonly fileRepository: FileRepository) {}

  async execute(path: string): Promise<string> {
    const content = await this.fileRepository.read(path);
    return this.processContent(content);
  }

  private processContent(content: string): string {
    // Business logic
    return content.trim().toUpperCase();
  }
}

// application/tools/process-file-tool.ts
export function createProcessFileTool(useCase: ProcessFileUseCase) {
  return {
    name: "process-file",
    description: "Process file contents",
    inputSchema: ProcessFileSchema,
    handler: async (args: ProcessFileArgs) => {
      const result = await useCase.execute(args.path);
      return { content: [{ type: "text", text: result }] };
    },
  };
}
```

### Event-Driven Architecture

Implement domain events for complex workflows:

```typescript
// domain/events/domain-event.ts
export interface DomainEvent {
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly type: string;
}

export class FileProcessedEvent implements DomainEvent {
  readonly type = "FileProcessed";
  readonly occurredAt: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly filePath: string,
    public readonly result: string,
  ) {
    this.occurredAt = new Date();
  }
}

// domain/event-bus.ts
type EventHandler<T extends DomainEvent> = (event: T) => Promise<void>;

export class EventBus {
  private handlers: Map<string, EventHandler<any>[]> = new Map();

  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
  ): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    await Promise.all(handlers.map((handler) => handler(event)));
  }
}

// application/event-handlers/file-processed-handler.ts
export class FileProcessedHandler {
  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: FileProcessedEvent): Promise<void> {
    await this.notificationService.notify({
      message: `File ${event.filePath} processed successfully`,
      timestamp: event.occurredAt,
    });
  }
}

// Wire up in server initialization
eventBus.subscribe("FileProcessed", (event) =>
  fileProcessedHandler.handle(event),
);
```

## Advanced State Management

### Stateful Server Pattern

```typescript
// infrastructure/state/server-state.ts
export class ServerState {
  private sessions: Map<string, SessionData> = new Map();
  private cache: Map<string, CacheEntry> = new Map();

  // Session management
  createSession(sessionId: string, data: SessionData): void {
    this.sessions.set(sessionId, {
      ...data,
      createdAt: new Date(),
      lastAccessed: new Date(),
    });
  }

  getSession(sessionId: string): SessionData | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastAccessed = new Date();
    }
    return session;
  }

  // Cache management
  setCache(key: string, value: any, ttl: number): void {
    this.cache.set(key, {
      value,
      expiresAt: new Date(Date.now() + ttl),
    });
  }

  getCache(key: string): any | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt < new Date()) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = new Date();

    // Cleanup sessions
    for (const [id, session] of this.sessions.entries()) {
      const inactiveFor = now.getTime() - session.lastAccessed.getTime();
      if (inactiveFor > 30 * 60 * 1000) {
        // 30 minutes
        this.sessions.delete(id);
      }
    }

    // Cleanup cache
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }
}
```

### Transactional Pattern

```typescript
// infrastructure/transaction/transaction-manager.ts
export interface Transaction {
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export class TransactionManager {
  private activeTransactions: Map<string, Transaction> = new Map();

  async executeInTransaction<T>(
    id: string,
    operation: (tx: Transaction) => Promise<T>,
  ): Promise<T> {
    const tx = await this.beginTransaction(id);

    try {
      const result = await operation(tx);
      await tx.commit();
      return result;
    } catch (error) {
      await tx.rollback();
      throw error;
    } finally {
      this.activeTransactions.delete(id);
    }
  }

  private async beginTransaction(id: string): Promise<Transaction> {
    // Implementation depends on your data layer
    const tx: Transaction = {
      commit: async () => {
        /* commit logic */
      },
      rollback: async () => {
        /* rollback logic */
      },
    };

    this.activeTransactions.set(id, tx);
    return tx;
  }
}

// Usage in tool
handler: async (args, { transactionManager }) => {
  return await transactionManager.executeInTransaction(
    "update-operation",
    async (tx) => {
      await service1.update(args.data1);
      await service2.update(args.data2);
      // All or nothing
      return { success: true };
    },
  );
};
```

## Performance Optimization

### Caching Strategy

```typescript
// infrastructure/caching/cache-decorator.ts
export function Cacheable(ttl: number = 60000) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const cache = new Map<string, CacheEntry>();

    descriptor.value = async function (...args: any[]) {
      const key = JSON.stringify(args);
      const cached = cache.get(key);

      if (cached && cached.expiresAt > new Date()) {
        return cached.value;
      }

      const result = await originalMethod.apply(this, args);

      cache.set(key, {
        value: result,
        expiresAt: new Date(Date.now() + ttl),
      });

      return result;
    };

    return descriptor;
  };
}

// Usage
export class DataService {
  @Cacheable(300000) // 5 minutes
  async fetchExpensiveData(query: string): Promise<any> {
    // Expensive operation
    return await expensiveApiCall(query);
  }
}
```

### Request Deduplication

```typescript
// infrastructure/deduplication/request-deduplicator.ts
export class RequestDeduplicator {
  private pending: Map<string, Promise<any>> = new Map();

  async deduplicate<T>(key: string, operation: () => Promise<T>): Promise<T> {
    const existing = this.pending.get(key);
    if (existing) {
      return existing;
    }

    const promise = operation().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }
}

// Usage in tool
handler: async (args, { deduplicator, dataService }) => {
  const key = `fetch-${args.id}`;
  return await deduplicator.deduplicate(key, () => dataService.fetch(args.id));
};
```

## Advanced Error Handling

### Retry Pattern with Exponential Backoff

```typescript
// infrastructure/resilience/retry-policy.ts
export interface RetryPolicy {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  policy: RetryPolicy,
  isRetryable: (error: any) => boolean = () => true,
): Promise<T> {
  let lastError: any;
  let delay = policy.initialDelay;

  for (let attempt = 0; attempt <= policy.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === policy.maxRetries || !isRetryable(error)) {
        throw error;
      }

      await sleep(delay);
      delay = Math.min(delay * policy.backoffMultiplier, policy.maxDelay);
    }
  }

  throw lastError;
}

// Usage
handler: async (args, { apiClient }) => {
  return await withRetry(
    () => apiClient.fetch(args.url),
    {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
    },
    (error) => error.code === "NETWORK_ERROR",
  );
};
```

### Circuit Breaker Pattern

```typescript
// infrastructure/resilience/circuit-breaker.ts
enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN,
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: Date | null = null;
  private successCount: number = 0;

  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 60000,
    private readonly halfOpenSuccessThreshold: number = 2,
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.halfOpenSuccessThreshold) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();
    this.successCount = 0;

    if (this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN;
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return true;
    return Date.now() - this.lastFailureTime.getTime() >= this.timeout;
  }
}
```

## Security Patterns

### Input Sanitization Pipeline

```typescript
// infrastructure/security/sanitization-pipeline.ts
export interface Sanitizer {
  sanitize(input: any): any;
}

export class SanitizationPipeline {
  private sanitizers: Sanitizer[] = [];

  use(sanitizer: Sanitizer): this {
    this.sanitizers.push(sanitizer);
    return this;
  }

  sanitize(input: any): any {
    return this.sanitizers.reduce(
      (acc, sanitizer) => sanitizer.sanitize(acc),
      input,
    );
  }
}

// Specific sanitizers
export class PathSanitizer implements Sanitizer {
  sanitize(path: string): string {
    return path
      .replace(/\\/g, "/")
      .replace(/\/+/g, "/")
      .replace(/\.\./g, "")
      .replace(/^\//, "");
  }
}

export class HtmlSanitizer implements Sanitizer {
  sanitize(html: string): string {
    return html
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  }
}

// Usage
const pipeline = new SanitizationPipeline()
  .use(new PathSanitizer())
  .use(new HtmlSanitizer());

const sanitized = pipeline.sanitize(userInput);
```

## Next Steps

- For production patterns → `Level4_expert.md`
- For state management details → `state-management.md`
- For testing strategies → `testing-patterns.md`
