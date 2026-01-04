# ネットワーク耐性 - 実装パターン

## 概要

ネットワーク耐性を実現するための実装パターン。
接続管理、オフラインキュー、状態同期、サーキットブレーカーを網羅する。

## 接続管理パターン

### 接続マネージャー

```typescript
class ConnectionManager extends EventEmitter {
  private state: ConnectionState = "online";
  private reconnectTimer: NodeJS.Timer | null = null;
  private reconnectAttempt = 0;

  constructor(private config: ConnectionConfig) {
    super();
    this.setupListeners();
  }

  private setupListeners(): void {
    window.addEventListener("online", () => this.handleOnline());
    window.addEventListener("offline", () => this.handleOffline());
  }

  private handleOffline(): void {
    this.state = "offline";
    this.emit("stateChange", this.state);
    this.startReconnection();
  }

  private handleOnline(): void {
    this.stopReconnection();
    this.verifyConnection();
  }

  private async verifyConnection(): Promise<void> {
    if (await this.healthCheck()) {
      this.state = "online";
      this.reconnectAttempt = 0;
      this.emit("stateChange", this.state);
      this.emit("reconnected");
    } else {
      this.state = "reconnecting";
      this.scheduleReconnect();
    }
  }

  private async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.config.healthEndpoint, {
        method: "HEAD",
        cache: "no-cache",
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
```

### 状態購読パターン

```typescript
interface ConnectionSubscriber {
  onOnline(): void;
  onOffline(): void;
  onReconnecting(): void;
}

class ConnectionObserver {
  private subscribers: Set<ConnectionSubscriber> = new Set();

  subscribe(subscriber: ConnectionSubscriber): () => void {
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  }

  notify(state: ConnectionState): void {
    for (const subscriber of this.subscribers) {
      switch (state) {
        case "online":
          subscriber.onOnline();
          break;
        case "offline":
          subscriber.onOffline();
          break;
        case "reconnecting":
          subscriber.onReconnecting();
          break;
      }
    }
  }
}
```

## オフラインキューパターン

### IndexedDBキュー

```typescript
class IndexedDBQueue implements OfflineQueue {
  private dbName = "offline_queue";
  private storeName = "operations";

  async enqueue(operation: QueuedOperation): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(this.storeName, "readwrite");
    await tx.store.add(operation);
  }

  async dequeue(): Promise<QueuedOperation | null> {
    const db = await this.openDB();
    const tx = db.transaction(this.storeName, "readwrite");
    const cursor = await tx.store.openCursor();

    if (!cursor) return null;

    const operation = cursor.value;
    await cursor.delete();
    return operation;
  }

  async flush(): Promise<void> {
    while (true) {
      const operation = await this.dequeue();
      if (!operation) break;

      try {
        await this.processOperation(operation);
      } catch (error) {
        if (operation.retryCount < 3) {
          await this.enqueue({
            ...operation,
            retryCount: operation.retryCount + 1,
          });
        } else {
          this.emit("operationFailed", operation);
        }
      }
    }
  }
}
```

### JSONLファイルキュー（Node.js）

```typescript
class JSONLQueue implements OfflineQueue {
  constructor(private filePath: string) {}

  async enqueue(operation: QueuedOperation): Promise<void> {
    const line = JSON.stringify(operation) + "\n";
    await fs.appendFile(this.filePath, line);
  }

  async dequeue(): Promise<QueuedOperation | null> {
    const content = await fs.readFile(this.filePath, "utf-8");
    const lines = content.split("\n").filter(Boolean);

    if (lines.length === 0) return null;

    const [first, ...rest] = lines;
    await fs.writeFile(
      this.filePath,
      rest.join("\n") + (rest.length ? "\n" : ""),
    );

    return JSON.parse(first);
  }
}
```

## 状態同期パターン

### 差分同期

```typescript
interface SyncState {
  localVersion: number;
  remoteVersion: number;
  lastSyncAt: Date;
}

class DiffSync {
  async sync(): Promise<void> {
    const localChanges = await this.getLocalChanges();
    const remoteChanges = await this.fetchRemoteChanges();

    const conflicts = this.detectConflicts(localChanges, remoteChanges);

    if (conflicts.length > 0) {
      await this.resolveConflicts(conflicts);
    }

    await this.applyChanges(localChanges, remoteChanges);
    await this.updateSyncState();
  }

  private detectConflicts(local: Change[], remote: Change[]): Conflict[] {
    const conflicts: Conflict[] = [];

    for (const localChange of local) {
      const remoteChange = remote.find(
        (r) => r.entityId === localChange.entityId,
      );

      if (
        remoteChange &&
        remoteChange.timestamp !== localChange.baseTimestamp
      ) {
        conflicts.push({
          entityId: localChange.entityId,
          local: localChange,
          remote: remoteChange,
        });
      }
    }

    return conflicts;
  }
}
```

### CRDTパターン

```typescript
// G-Counter（成長のみカウンター）
class GCounter {
  private counters: Map<string, number> = new Map();

  constructor(private nodeId: string) {}

  increment(): void {
    const current = this.counters.get(this.nodeId) || 0;
    this.counters.set(this.nodeId, current + 1);
  }

  value(): number {
    let sum = 0;
    for (const count of this.counters.values()) {
      sum += count;
    }
    return sum;
  }

  merge(other: GCounter): void {
    for (const [nodeId, count] of other.counters) {
      const current = this.counters.get(nodeId) || 0;
      this.counters.set(nodeId, Math.max(current, count));
    }
  }
}
```

## サーキットブレーカーパターン

### 実装

```typescript
enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;

  constructor(
    private readonly threshold: number = 5,
    private readonly resetTimeoutMs: number = 30000,
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new CircuitOpenError();
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN;
    }
  }
}
```

## リトライパターン

### デコレータパターン

```typescript
function withRetry<T>(
  options: RetryOptions = {},
): (fn: () => Promise<T>) => Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 30000,
    shouldRetry = () => true,
  } = options;

  return async (fn: () => Promise<T>): Promise<T> => {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries || !shouldRetry(error)) {
          throw error;
        }

        const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
        await sleep(delay + Math.random() * 1000);
      }
    }

    throw lastError!;
  };
}
```

## React Hook パターン

### useNetworkStatus

```typescript
function useNetworkStatus(): {
  isOnline: boolean;
  isReconnecting: boolean;
} {
  const [state, setState] = useState<ConnectionState>("online");

  useEffect(() => {
    const handleOnline = () => setState("online");
    const handleOffline = () => setState("offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return {
    isOnline: state === "online",
    isReconnecting: state === "reconnecting",
  };
}
```

## アンチパターン

| パターン         | 問題           | 解決策                 |
| ---------------- | -------------- | ---------------------- |
| 無限リトライ     | リソース枯渇   | 最大リトライ数設定     |
| 同期リトライ     | ブロッキング   | 非同期リトライ         |
| メモリキュー     | リロードで消失 | 永続化（IndexedDB）    |
| 競合無視         | データ不整合   | 競合解決戦略定義       |
| タイムアウトなし | 無限待機       | 適切なタイムアウト設定 |

## チェックリスト

### 設計時

- [ ] オフライン要件を明確にしたか
- [ ] 競合解決戦略を定義したか
- [ ] リトライ戦略を設計したか
- [ ] べき等性を考慮したか

### 実装時

- [ ] 接続状態の監視を実装したか
- [ ] オフラインキューを永続化したか
- [ ] サーキットブレーカーを実装したか
- [ ] エラーハンドリングを実装したか

### テスト時

- [ ] オフライン状態をテストしたか
- [ ] 再接続をテストしたか
- [ ] 競合解決をテストしたか
