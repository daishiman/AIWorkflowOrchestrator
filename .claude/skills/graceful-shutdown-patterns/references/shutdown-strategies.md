# シャットダウン戦略ガイド

## 戦略の選択

### 即時シャットダウン vs グレースフルシャットダウン

| 観点           | 即時シャットダウン | グレースフルシャットダウン |
| -------------- | ------------------ | -------------------------- |
| 終了時間       | 即座               | 数秒〜数十秒               |
| データ整合性   | リスクあり         | 保証される                 |
| リソースリーク | 可能性あり         | 防止される                 |
| 使用場面       | 開発時、緊急時     | 本番環境                   |

---

## シャットダウンフェーズ

### Phase 1: 新規リクエストの拒否

```typescript
class RequestGate {
  private accepting = true;

  isAccepting(): boolean {
    return this.accepting;
  }

  close(): void {
    this.accepting = false;
    console.log("No longer accepting new requests");
  }
}

// ミドルウェアでの使用
function gatekeeperMiddleware(gate: RequestGate) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!gate.isAccepting()) {
      res.status(503).json({ error: "Service shutting down" });
      return;
    }
    next();
  };
}
```

### Phase 2: 進行中処理の完了待機

```typescript
class OperationTracker {
  private operations = new Set<Promise<unknown>>();

  track<T>(operation: Promise<T>): Promise<T> {
    this.operations.add(operation);

    return operation.finally(() => {
      this.operations.delete(operation);
    });
  }

  get pendingCount(): number {
    return this.operations.size;
  }

  async waitForAll(timeoutMs: number = 30000): Promise<void> {
    if (this.operations.size === 0) {
      return;
    }

    console.log(`Waiting for ${this.operations.size} operations...`);

    const timeout = new Promise<void>((_, reject) => {
      setTimeout(() => reject(new Error("Timeout")), timeoutMs);
    });

    const allOperations = Promise.allSettled([...this.operations]);

    try {
      await Promise.race([allOperations, timeout]);
      console.log("All operations completed");
    } catch {
      console.warn(`Timeout: ${this.operations.size} operations still pending`);
    }
  }
}
```

### Phase 3: リソースのクローズ

```typescript
interface CloseableResource {
  name: string;
  priority: number;
  close(): Promise<void>;
}

class ResourceCloser {
  private resources: CloseableResource[] = [];

  register(resource: CloseableResource): void {
    this.resources.push(resource);
  }

  async closeAll(): Promise<{ success: string[]; failed: string[] }> {
    // 優先度順にソート（低い値が先）
    const sorted = [...this.resources].sort((a, b) => a.priority - b.priority);

    const success: string[] = [];
    const failed: string[] = [];

    for (const resource of sorted) {
      try {
        console.log(`Closing ${resource.name}...`);
        await resource.close();
        success.push(resource.name);
        console.log(`${resource.name} closed`);
      } catch (error) {
        failed.push(resource.name);
        console.error(`Failed to close ${resource.name}:`, error);
      }
    }

    return { success, failed };
  }
}

// 使用例
const closer = new ResourceCloser();

closer.register({
  name: "HTTP Server",
  priority: 1,
  close: () => new Promise((resolve) => server.close(resolve)),
});

closer.register({
  name: "File Watcher",
  priority: 2,
  close: () => watcher.close(),
});

closer.register({
  name: "Database Pool",
  priority: 3,
  close: () => pool.end(),
});
```

---

## タイムアウト戦略

### 段階的タイムアウト

```typescript
interface ShutdownConfig {
  drainTimeoutMs: number; // 新規リクエスト停止後の待機
  operationTimeoutMs: number; // 進行中処理の完了待機
  cleanupTimeoutMs: number; // リソースクリーンアップ
  forceExitMs: number; // 強制終了までの総時間
}

const defaultConfig: ShutdownConfig = {
  drainTimeoutMs: 5000,
  operationTimeoutMs: 15000,
  cleanupTimeoutMs: 10000,
  forceExitMs: 30000,
};

async function tieredShutdown(
  config: ShutdownConfig = defaultConfig,
): Promise<void> {
  const forceExitTimer = setTimeout(() => {
    console.error("Force exit triggered");
    process.exit(1);
  }, config.forceExitMs);

  try {
    // Phase 1: ドレイン
    console.log("Phase 1: Draining...");
    gate.close();
    await delay(config.drainTimeoutMs);

    // Phase 2: 処理完了待機
    console.log("Phase 2: Waiting for operations...");
    await tracker.waitForAll(config.operationTimeoutMs);

    // Phase 3: クリーンアップ
    console.log("Phase 3: Cleanup...");
    await withTimeout(closer.closeAll(), config.cleanupTimeoutMs);

    clearTimeout(forceExitTimer);
    console.log("Shutdown complete");
  } catch (error) {
    console.error("Shutdown error:", error);
    clearTimeout(forceExitTimer);
    throw error;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms),
    ),
  ]);
}
```

---

## エラーハンドリング戦略

### 継続的クリーンアップ

```typescript
async function resilientCleanup(handlers: (() => Promise<void>)[]): Promise<{
  succeeded: number;
  failed: number;
  errors: Error[];
}> {
  const errors: Error[] = [];
  let succeeded = 0;
  let failed = 0;

  for (const handler of handlers) {
    try {
      await handler();
      succeeded++;
    } catch (error) {
      failed++;
      errors.push(error as Error);
      // エラーがあっても続行
    }
  }

  return { succeeded, failed, errors };
}
```

### リトライ付きクリーンアップ

```typescript
async function retryableClose(
  close: () => Promise<void>,
  options: { maxRetries?: number; delayMs?: number } = {},
): Promise<void> {
  const { maxRetries = 3, delayMs = 1000 } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await close();
      return;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.warn(`Close attempt ${attempt} failed, retrying...`);
      await delay(delayMs);
    }
  }
}
```

---

## シグナル処理の詳細

### 複数シグナルの処理

```typescript
class SignalHandler {
  private handlers: Map<string, () => Promise<void>> = new Map();
  private isHandling = false;

  on(signal: NodeJS.Signals, handler: () => Promise<void>): void {
    this.handlers.set(signal, handler);

    process.on(signal, async () => {
      if (this.isHandling) {
        console.log(`Already handling shutdown, ignoring ${signal}`);
        return;
      }
      this.isHandling = true;

      console.log(`Received ${signal}`);

      try {
        const specificHandler = this.handlers.get(signal);
        if (specificHandler) {
          await specificHandler();
        }
      } catch (error) {
        console.error(`Error handling ${signal}:`, error);
        process.exit(1);
      }
    });
  }
}

// 使用例
const signals = new SignalHandler();

signals.on("SIGTERM", async () => {
  // 本番環境での標準的なシャットダウン
  await gracefulShutdown();
  process.exit(0);
});

signals.on("SIGINT", async () => {
  // 開発時のCtrl+C
  console.log("\nInterrupt received");
  await gracefulShutdown();
  process.exit(0);
});

signals.on("SIGHUP", async () => {
  // 設定リロード
  console.log("Reloading configuration...");
  await reloadConfig();
  // 終了しない
});
```

### Windows互換性

```typescript
// Windowsでは一部のシグナルが利用不可
function setupCrossplatformSignals(shutdown: () => Promise<void>): void {
  const isWindows = process.platform === "win32";

  if (isWindows) {
    // Windowsでは SIGTERM がサポートされない場合がある
    // readline を使用して Ctrl+C をキャプチャ
    const readline = require("readline");

    if (process.stdin.isTTY) {
      readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      readline.on("SIGINT", async () => {
        console.log("\nReceived SIGINT (Windows)");
        await shutdown();
        process.exit(0);
      });
    }
  } else {
    // Unix系
    process.on("SIGTERM", async () => {
      console.log("Received SIGTERM");
      await shutdown();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      console.log("\nReceived SIGINT");
      await shutdown();
      process.exit(0);
    });
  }
}
```

---

## ロギング戦略

### 構造化シャットダウンログ

```typescript
interface ShutdownLog {
  timestamp: string;
  phase: string;
  status: "started" | "completed" | "failed" | "timeout";
  duration?: number;
  details?: Record<string, unknown>;
}

class ShutdownLogger {
  private logs: ShutdownLog[] = [];
  private phaseStartTime: number | null = null;

  startPhase(phase: string): void {
    this.phaseStartTime = Date.now();
    this.log({ phase, status: "started" });
  }

  completePhase(phase: string, details?: Record<string, unknown>): void {
    const duration = this.phaseStartTime
      ? Date.now() - this.phaseStartTime
      : undefined;
    this.log({ phase, status: "completed", duration, details });
    this.phaseStartTime = null;
  }

  failPhase(phase: string, error: Error): void {
    const duration = this.phaseStartTime
      ? Date.now() - this.phaseStartTime
      : undefined;
    this.log({
      phase,
      status: "failed",
      duration,
      details: { error: error.message },
    });
    this.phaseStartTime = null;
  }

  private log(entry: Omit<ShutdownLog, "timestamp">): void {
    const log: ShutdownLog = {
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.logs.push(log);
    console.log(JSON.stringify(log));
  }

  getSummary(): ShutdownLog[] {
    return this.logs;
  }
}
```

---

## 本番環境のベストプラクティス

### 1. Kubernetes環境

```yaml
# Pod spec
spec:
  terminationGracePeriodSeconds: 60
  containers:
    - name: app
      lifecycle:
        preStop:
          exec:
            command: ["/bin/sh", "-c", "sleep 5"]
```

```typescript
// アプリケーション側
const SHUTDOWN_TIMEOUT = 55000; // K8s grace period - 5秒マージン

process.on("SIGTERM", async () => {
  await shutdownWithTimeout(cleanup, SHUTDOWN_TIMEOUT);
  process.exit(0);
});
```

### 2. Docker環境

```dockerfile
# 正しい: exec形式（シグナルが直接プロセスに届く）
CMD ["node", "app.js"]

# 間違い: shell形式（シグナルがshに届く）
CMD node app.js
```

### 3. PM2環境

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "app",
      script: "./app.js",
      kill_timeout: 30000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};
```

```typescript
// アプリケーション側
process.on("SIGINT", async () => {
  await cleanup();
  process.send?.("ready"); // PM2に終了準備完了を通知
  process.exit(0);
});
```
