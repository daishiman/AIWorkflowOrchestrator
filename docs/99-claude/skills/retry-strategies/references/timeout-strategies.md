# Timeout Strategies（タイムアウト戦略）

## 概要

タイムアウトは、外部リソースへのリクエストが無期限にブロックすることを防ぐ重要なパターンです。
適切なタイムアウト設定により、リソース枯渇を防ぎ、システムの応答性を維持します。

## タイムアウトの種類

### 1. 接続タイムアウト（Connection Timeout）

TCP接続の確立を待つ最大時間。

```typescript
const connectionTimeout = 5000; // 5秒

// fetch API
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), connectionTimeout);

try {
  const response = await fetch(url, { signal: controller.signal });
} finally {
  clearTimeout(timeoutId);
}
```

### 2. 読み取りタイムアウト（Read/Socket Timeout）

接続後、データの受信を待つ最大時間。

```typescript
// Node.js http
const options = {
  timeout: 30000, // ソケットタイムアウト（30秒）
};

const req = http.request(options, (res) => {
  // レスポンス処理
});

req.on("timeout", () => {
  req.destroy();
  throw new TimeoutError("Socket timeout");
});
```

### 3. 全体タイムアウト（Request Timeout）

リクエスト開始から完了までの最大時間。

```typescript
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new TimeoutError(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}
```

### 4. アイドルタイムアウト（Idle Timeout）

データ受信がない状態を待つ最大時間（ストリーミング用）。

```typescript
class IdleTimeoutStream {
  private lastActivity = Date.now();
  private checkInterval: NodeJS.Timer;

  constructor(
    private readonly idleTimeout: number,
    private readonly onTimeout: () => void,
  ) {
    this.checkInterval = setInterval(() => {
      if (Date.now() - this.lastActivity > this.idleTimeout) {
        this.onTimeout();
      }
    }, 1000);
  }

  onData(): void {
    this.lastActivity = Date.now();
  }

  destroy(): void {
    clearInterval(this.checkInterval);
  }
}
```

## パラメータ設計

### 推奨値

| タイムアウト種別     | 推奨値   | 考慮事項                       |
| -------------------- | -------- | ------------------------------ |
| 接続タイムアウト     | 3-10秒   | ネットワーク遅延、サーバー距離 |
| 読み取りタイムアウト | 10-60秒  | データサイズ、サーバー処理時間 |
| 全体タイムアウト     | 30-120秒 | 操作の複雑さ、ユーザー期待     |
| アイドルタイムアウト | 30-60秒  | ストリームの特性               |

### 用途別設計

```typescript
// インタラクティブ操作（ユーザー待機）
const interactiveTimeout = {
  connection: 3000, // 3秒
  read: 10000, // 10秒
  total: 15000, // 15秒
};

// バックグラウンド処理
const backgroundTimeout = {
  connection: 10000, // 10秒
  read: 60000, // 60秒
  total: 120000, // 2分
};

// バッチ処理
const batchTimeout = {
  connection: 30000, // 30秒
  read: 300000, // 5分
  total: 600000, // 10分
};
```

## 実装パターン

### AbortController ベース（推奨）

```typescript
class TimeoutController {
  private readonly controller = new AbortController();
  private readonly timeouts: NodeJS.Timeout[] = [];

  constructor(private readonly config: TimeoutConfig) {
    // 全体タイムアウト
    this.timeouts.push(
      setTimeout(() => {
        this.controller.abort(new TimeoutError("Total timeout exceeded"));
      }, config.total),
    );
  }

  get signal(): AbortSignal {
    return this.controller.signal;
  }

  abort(reason?: Error): void {
    this.controller.abort(reason);
    this.cleanup();
  }

  cleanup(): void {
    this.timeouts.forEach(clearTimeout);
  }
}

// 使用例
async function fetchWithTimeout(url: string): Promise<Response> {
  const timeout = new TimeoutController({
    connection: 5000,
    read: 30000,
    total: 45000,
  });

  try {
    return await fetch(url, { signal: timeout.signal });
  } finally {
    timeout.cleanup();
  }
}
```

### Promise.race ベース

```typescript
async function executeWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  operationName = "Operation",
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(
        new TimeoutError(`${operationName} timed out after ${timeoutMs}ms`),
      );
    }, timeoutMs);
  });

  return Promise.race([operation(), timeoutPromise]);
}

// 使用例
const result = await executeWithTimeout(
  () => api.getUser(userId),
  10000,
  "GetUser",
);
```

### 階層的タイムアウト

```typescript
class HierarchicalTimeout {
  private readonly startTime = Date.now();

  constructor(private readonly totalTimeout: number) {}

  getRemainingTime(): number {
    const elapsed = Date.now() - this.startTime;
    return Math.max(0, this.totalTimeout - elapsed);
  }

  async executeStep<T>(
    stepName: string,
    operation: () => Promise<T>,
    stepTimeout?: number,
  ): Promise<T> {
    const remaining = this.getRemainingTime();

    if (remaining <= 0) {
      throw new TimeoutError("Total timeout exceeded before " + stepName);
    }

    const effectiveTimeout = stepTimeout
      ? Math.min(stepTimeout, remaining)
      : remaining;

    return executeWithTimeout(operation, effectiveTimeout, stepName);
  }
}

// 使用例
async function complexOperation(): Promise<Result> {
  const timeout = new HierarchicalTimeout(60000); // 全体60秒

  const user = await timeout.executeStep(
    "GetUser",
    () => api.getUser(id),
    10000,
  );
  const orders = await timeout.executeStep(
    "GetOrders",
    () => api.getOrders(id),
    20000,
  );
  const process = await timeout.executeStep("Process", () =>
    processData(user, orders),
  );

  return process;
}
```

## タイムアウトとリトライの組み合わせ

### 個別タイムアウト + リトライ

```typescript
async function retryWithTimeout<T>(
  operation: () => Promise<T>,
  config: {
    timeout: number;
    maxRetries: number;
    backoff: BackoffConfig;
  },
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      return await executeWithTimeout(operation, config.timeout);
    } catch (error) {
      lastError = error as Error;

      if (!isRetryableError(error)) {
        throw error;
      }

      if (attempt < config.maxRetries - 1) {
        await sleep(calculateBackoff(attempt, config.backoff));
      }
    }
  }

  throw lastError!;
}
```

### 全体タイムアウト + リトライ

```typescript
async function retryWithTotalTimeout<T>(
  operation: () => Promise<T>,
  totalTimeout: number,
  maxRetries: number,
): Promise<T> {
  const startTime = Date.now();
  let attempt = 0;

  while (attempt < maxRetries) {
    const elapsed = Date.now() - startTime;
    const remaining = totalTimeout - elapsed;

    if (remaining <= 0) {
      throw new TimeoutError("Total timeout exceeded");
    }

    try {
      return await executeWithTimeout(operation, remaining);
    } catch (error) {
      attempt++;

      if (!isRetryableError(error) || attempt >= maxRetries) {
        throw error;
      }
    }
  }

  throw new Error("Unexpected: max retries reached");
}
```

## エラーハンドリング

### タイムアウトエラーの分類

```typescript
class TimeoutError extends Error {
  constructor(
    message: string,
    public readonly type: "connection" | "read" | "total" | "idle",
    public readonly elapsedMs?: number,
  ) {
    super(message);
    this.name = "TimeoutError";
  }
}

// 使用例
function handleTimeoutError(error: TimeoutError): void {
  switch (error.type) {
    case "connection":
      // サーバーが到達不能の可能性
      console.log("Failed to connect to server");
      break;
    case "read":
      // サーバーが過負荷の可能性
      console.log("Server is slow to respond");
      break;
    case "total":
      // 操作全体が長すぎる
      console.log("Operation took too long");
      break;
  }
}
```

## チェックリスト

### 設計時

- [ ] 各タイムアウト種別が適切に設定されているか？
- [ ] ユーザー体験への影響が考慮されているか？
- [ ] バックエンド処理時間が考慮されているか？

### 実装時

- [ ] タイムアウト時にリソースがクリーンアップされるか？
- [ ] AbortSignal が正しく伝播されるか？
- [ ] タイムアウトエラーが適切に分類されるか？

### 運用時

- [ ] タイムアウト発生率がモニタリングされているか？
- [ ] タイムアウト値の調整が可能か？
- [ ] 適切なアラートが設定されているか？

## アンチパターン

### ❌ タイムアウトなし

```typescript
// NG: 永遠にブロックする可能性
const response = await fetch(url);
```

### ❌ 短すぎるタイムアウト

```typescript
// NG: 正常なリクエストもタイムアウト
const timeout = 100; // 100msは短すぎる
```

### ❌ クリーンアップなし

```typescript
// NG: タイマーがリークする
const timeoutId = setTimeout(() => abort(), 30000);
const response = await fetch(url);
// clearTimeout がない
```

## 参考

- **『Building Microservices』** Sam Newman著
- **『Release It!』** Michael T. Nygard著 - Chapter 5: Stability Patterns
