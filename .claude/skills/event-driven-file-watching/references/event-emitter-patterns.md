# EventEmitter実装パターン

## 基本パターン

### 1. 継承パターン

```typescript
import { EventEmitter } from "events";
import type { Stats } from "fs";

interface FileWatcherEvents {
  fileAdded: (event: { path: string; stats?: Stats }) => void;
  fileChanged: (event: { path: string; stats?: Stats }) => void;
  fileRemoved: (event: { path: string }) => void;
  error: (error: Error) => void;
  ready: () => void;
}

class FileWatcher extends EventEmitter {
  constructor() {
    super();
    // メモリリーク防止
    this.setMaxListeners(10);
  }

  // 型安全なemit
  protected emitFileAdded(path: string, stats?: Stats): boolean {
    return this.emit("fileAdded", {
      path,
      stats,
      timestamp: new Date().toISOString(),
    });
  }

  // 型安全なon
  onFileAdded(handler: FileWatcherEvents["fileAdded"]): this {
    return this.on("fileAdded", handler);
  }
}
```

### 2. コンポジションパターン

```typescript
import { EventEmitter } from "events";

class FileWatcher {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(10);
  }

  on(event: string, listener: (...args: any[]) => void): this {
    this.emitter.on(event, listener);
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    return this.emitter.emit(event, ...args);
  }

  removeAllListeners(event?: string): this {
    this.emitter.removeAllListeners(event);
    return this;
  }
}
```

---

## エラーハンドリングパターン

### 1. 必須エラーリスナー

```typescript
class FileWatcher extends EventEmitter {
  constructor() {
    super();

    // エラーリスナーがない場合のフォールバック
    this.on("error", (error) => {
      if (this.listenerCount("error") === 1) {
        // デフォルトハンドラーのみ = ユーザーハンドラーなし
        console.error("[FileWatcher] Unhandled error:", error);
        // プロセスをクラッシュさせない
      }
    });
  }
}
```

### 2. エラーラッピング

```typescript
class WatcherError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly path?: string,
    public readonly recoverable: boolean = true,
  ) {
    super(message);
    this.name = "WatcherError";
  }

  static fromNodeError(
    err: NodeJS.ErrnoException,
    path?: string,
  ): WatcherError {
    const recoverable = ["EACCES", "ENOENT", "EMFILE"].includes(err.code || "");
    return new WatcherError(
      err.message,
      err.code || "UNKNOWN",
      path || err.path,
      recoverable,
    );
  }
}
```

---

## リスナー管理パターン

### 1. 自動クリーンアップ

```typescript
class FileWatcher extends EventEmitter {
  private cleanupHandlers: (() => void)[] = [];

  onWithCleanup<E extends keyof FileWatcherEvents>(
    event: E,
    handler: FileWatcherEvents[E],
  ): () => void {
    this.on(event, handler as (...args: any[]) => void);

    const cleanup = () => {
      this.off(event, handler as (...args: any[]) => void);
    };

    this.cleanupHandlers.push(cleanup);
    return cleanup;
  }

  cleanup(): void {
    this.cleanupHandlers.forEach((fn) => fn());
    this.cleanupHandlers = [];
    this.removeAllListeners();
  }
}
```

### 2. once vs on の使い分け

```typescript
// 一度だけ実行
watcher.once("ready", () => {
  console.log("Watcher is ready");
});

// 継続的に実行
watcher.on("fileAdded", (event) => {
  processFile(event.path);
});

// プロミス化（一度だけ）
async function waitForReady(watcher: FileWatcher): Promise<void> {
  return new Promise((resolve, reject) => {
    watcher.once("ready", resolve);
    watcher.once("error", reject);
  });
}
```

---

## 非同期イベントパターン

### 1. キューイング

```typescript
class AsyncEventEmitter extends EventEmitter {
  private queue: Array<{ event: string; args: any[] }> = [];
  private processing = false;

  async emitAsync(event: string, ...args: any[]): Promise<void> {
    this.queue.push({ event, args });

    if (!this.processing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      const listeners = this.listeners(item.event);

      for (const listener of listeners) {
        try {
          await listener(...item.args);
        } catch (error) {
          this.emit("error", error);
        }
      }
    }

    this.processing = false;
  }
}
```

### 2. バックプレッシャー対応

```typescript
class BackpressureEventEmitter extends EventEmitter {
  private maxQueueSize = 1000;
  private eventQueue: any[] = [];
  private paused = false;

  emitWithBackpressure(event: string, ...args: any[]): boolean {
    if (this.eventQueue.length >= this.maxQueueSize) {
      if (!this.paused) {
        this.paused = true;
        this.emit("pause");
      }
      return false;
    }

    this.eventQueue.push({ event, args });
    setImmediate(() => this.drainQueue());
    return true;
  }

  private drainQueue(): void {
    while (this.eventQueue.length > 0) {
      const item = this.eventQueue.shift()!;
      this.emit(item.event, ...item.args);
    }

    if (this.paused && this.eventQueue.length < this.maxQueueSize / 2) {
      this.paused = false;
      this.emit("resume");
    }
  }
}
```

---

## TypedEventEmitter パターン

```typescript
import { EventEmitter } from "events";

// 厳密な型定義
interface TypedEventEmitter<
  T extends Record<string, (...args: any[]) => void>,
> {
  on<K extends keyof T>(event: K, listener: T[K]): this;
  once<K extends keyof T>(event: K, listener: T[K]): this;
  off<K extends keyof T>(event: K, listener: T[K]): this;
  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): boolean;
}

// 使用例
interface WatcherEvents {
  fileAdded: (path: string, stats?: Stats) => void;
  error: (error: Error) => void;
  ready: () => void;
}

class TypedFileWatcher
  extends EventEmitter
  implements TypedEventEmitter<WatcherEvents> {
  // 型安全なイベント操作
}
```

---

## アンチパターン

### ❌ 避けるべきパターン

```typescript
// 1. エラーリスナーなし（プロセスクラッシュの原因）
watcher.emit("error", new Error("Something went wrong"));

// 2. リスナー上限超過
for (let i = 0; i < 100; i++) {
  watcher.on("fileAdded", handler); // メモリリーク
}

// 3. 同期的な重い処理
watcher.on("fileAdded", (path) => {
  const data = fs.readFileSync(path); // ブロッキング
  processSync(data);
});
```

### ✅ 推奨パターン

```typescript
// 1. エラーリスナー必須
watcher.on("error", (error) => {
  logger.error("Watcher error:", error);
});

// 2. リスナー数制限
watcher.setMaxListeners(10);

// 3. 非同期処理
watcher.on("fileAdded", async (path) => {
  const data = await fs.promises.readFile(path);
  await processAsync(data);
});
```
