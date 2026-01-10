# 接続エラーハンドリング

## よくある接続エラー

### 1. 認証エラー

```
Error: UNAUTHORIZED: Invalid authentication token
Error: JWT token expired
Error: Authentication failed
```

**原因**:

- TURSO_AUTH_TOKENが無効または期限切れ
- 環境変数が正しく設定されていない
- トークンの権限が不足

**対処**:

```typescript
import { createClient } from "@libsql/client";

// トークンの検証
function validateAuth() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url || !token) {
    throw new Error("Missing TURSO credentials");
  }

  // URLフォーマットの確認
  if (!url.startsWith("libsql://") && !url.startsWith("file://")) {
    throw new Error("Invalid TURSO_DATABASE_URL format");
  }

  return { url, token };
}

// 安全なクライアント作成
const { url, token } = validateAuth();
const client = createClient({
  url,
  authToken: token,
});
```

### 2. ネットワークエラー

```
Error: Network request failed
Error: Failed to fetch
Error: ECONNREFUSED
```

**原因**:

- インターネット接続の問題
- Tursoサービスのダウンタイム
- ファイアウォール設定

**対処**:

```typescript
import { createClient } from "@libsql/client";

// タイムアウト付きクライアント
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
  // libSQLクライアントは内部でタイムアウトを管理
});

// リトライ付き実行
async function executeWithRetry(query: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await client.execute(query);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000); // 指数バックオフ
    }
  }
}
```

### 3. 同期エラー（組み込みレプリカ使用時）

```
Error: Sync failed
Error: Unable to sync local replica
Error: Replica out of sync
```

**原因**:

- ネットワーク不安定
- リモートDBへの接続問題
- ローカルストレージ不足

**対処**:

```typescript
const client = createClient({
  url: "file:///tmp/local.db",
  syncUrl: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
  syncInterval: 60,
});

// 手動同期とエラーハンドリング
async function syncWithErrorHandling() {
  try {
    await client.sync();
    console.log("Sync successful");
  } catch (error) {
    console.error("Sync failed:", error);
    // フォールバック: リモートDBを直接使用
    return createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });
  }
}
```

### 4. クエリエラー

```
Error: SQLITE_ERROR: SQL error or missing database
Error: SQLITE_CONSTRAINT: constraint failed
Error: SQLITE_BUSY: database is locked
```

**原因**:

- SQLシンタックスエラー
- 制約違反
- トランザクション競合

**対処**:

```typescript
async function safeExecute(query: string) {
  try {
    return await client.execute(query);
  } catch (error: any) {
    // エラータイプに応じた処理
    if (error.message.includes("SQLITE_CONSTRAINT")) {
      console.error("Constraint violation:", error);
      // 制約違反の処理
    } else if (error.message.includes("SQLITE_BUSY")) {
      console.error("Database locked, retrying...");
      // リトライ
      await sleep(100);
      return safeExecute(query);
    } else {
      throw error;
    }
  }
}
```

## リトライ戦略

### 指数バックオフ

```typescript
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  factor: number;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  factor: 2,
};

async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = defaultRetryConfig,
): Promise<T> {
  let lastError: Error | undefined;
  let delay = config.initialDelayMs;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt < config.maxRetries && isRetryable(error)) {
        console.log(
          `Retry attempt ${attempt + 1}/${config.maxRetries}, waiting ${delay}ms`,
        );
        await sleep(delay);
        delay = Math.min(delay * config.factor, config.maxDelayMs);
      }
    }
  }

  throw lastError;
}

function isRetryable(error: unknown): boolean {
  if (error instanceof Error) {
    const retryableMessages = [
      "connection refused",
      "timeout",
      "network",
      "fetch failed",
      "econnrefused",
      "sync failed",
    ];
    return retryableMessages.some((msg) =>
      error.message.toLowerCase().includes(msg),
    );
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

### 使用例

```typescript
const result = await withRetry(async () => {
  return await db.select().from(users).limit(10);
});
```

## サーキットブレーカー

### 実装

```typescript
enum CircuitState {
  CLOSED = "CLOSED", // 正常
  OPEN = "OPEN", // 遮断
  HALF_OPEN = "HALF_OPEN", // 回復確認中
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime: number | null = null;

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly recoveryTimeMs: number = 30000,
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

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return false;
    return Date.now() - this.lastFailureTime >= this.recoveryTimeMs;
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      console.error(
        `Circuit breaker OPENED after ${this.failureCount} failures`,
      );
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}
```

### 使用例

```typescript
const circuitBreaker = new CircuitBreaker(5, 30000);

async function queryWithCircuitBreaker() {
  try {
    return await circuitBreaker.execute(async () => {
      return await db.select().from(users);
    });
  } catch (error) {
    if (error.message === "Circuit breaker is OPEN") {
      // フォールバック処理
      return getCachedUsers();
    }
    throw error;
  }
}
```

## エラー監視とアラート

### エラー分類

```typescript
enum ErrorCategory {
  CONNECTION = "CONNECTION",
  AUTHENTICATION = "AUTHENTICATION",
  TIMEOUT = "TIMEOUT",
  QUERY = "QUERY",
  UNKNOWN = "UNKNOWN",
}

function categorizeError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();

  if (message.includes("connection") || message.includes("refused")) {
    return ErrorCategory.CONNECTION;
  }
  if (message.includes("authentication") || message.includes("password")) {
    return ErrorCategory.AUTHENTICATION;
  }
  if (message.includes("timeout")) {
    return ErrorCategory.TIMEOUT;
  }
  if (message.includes("syntax") || message.includes("query")) {
    return ErrorCategory.QUERY;
  }
  return ErrorCategory.UNKNOWN;
}
```

### エラーログ

```typescript
interface ErrorLog {
  timestamp: Date;
  category: ErrorCategory;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
}

function logDatabaseError(
  error: Error,
  context?: Record<string, unknown>,
): void {
  const log: ErrorLog = {
    timestamp: new Date(),
    category: categorizeError(error),
    message: error.message,
    stack: error.stack,
    context,
  };

  // 構造化ログ
  console.error(JSON.stringify(log));

  // 重大なエラーはアラート
  if (
    log.category === ErrorCategory.CONNECTION ||
    log.category === ErrorCategory.AUTHENTICATION
  ) {
    sendAlert(log);
  }
}
```

## ヘルスチェック

### 実装

```typescript
interface HealthCheckResult {
  status: "healthy" | "unhealthy";
  latencyMs: number;
  error?: string;
  timestamp: Date;
}

async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const start = Date.now();

  try {
    await client.execute("SELECT 1");

    return {
      status: "healthy",
      latencyMs: Date.now() - start,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      status: "unhealthy",
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
    };
  }
}

// 定期ヘルスチェック
setInterval(async () => {
  const health = await checkDatabaseHealth();
  if (health.status === "unhealthy") {
    console.error("Database health check failed:", health);
  }
}, 30000); // 30秒ごと
```

### APIエンドポイント

```typescript
// /api/health
export async function GET() {
  const dbHealth = await checkDatabaseHealth();

  return new Response(
    JSON.stringify({
      database: dbHealth,
      timestamp: new Date().toISOString(),
    }),
    {
      status: dbHealth.status === "healthy" ? 200 : 503,
      headers: { "Content-Type": "application/json" },
    },
  );
}
```

## チェックリスト

### エラーハンドリング実装時

- [ ] リトライ戦略を実装したか？
- [ ] 指数バックオフを使用しているか？
- [ ] リトライ可能なエラーを定義したか？
- [ ] タイムアウトを設定したか？

### 監視設定時

- [ ] エラーログが構造化されているか？
- [ ] エラーカテゴリが分類されているか？
- [ ] アラートが設定されているか？
- [ ] ヘルスチェックがあるか？

### 障害対応時

- [ ] サーキットブレーカーが機能するか？
- [ ] フォールバック処理があるか？
- [ ] 障害の影響範囲を限定できるか？
