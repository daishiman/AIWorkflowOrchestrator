# 接続エラーハンドリング

## よくある接続エラー

### 1. 接続枯渇

```
Error: too many connections for role "xxx"
Error: remaining connection slots are reserved for replication
Error: sorry, too many clients already
```

**原因**:
- プールサイズ超過
- 接続リーク
- 急激な負荷増加

**対処**:
```typescript
// 接続タイムアウトとリトライを設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

// 待機中の接続を監視
pool.on('connect', () => console.log('New connection'));
pool.on('remove', () => console.log('Connection removed'));
```

### 2. 接続タイムアウト

```
Error: Connection terminated due to connection timeout
Error: Connection terminated unexpectedly
Error: timeout expired
```

**原因**:
- ネットワーク遅延
- サーバー過負荷
- ファイアウォール設定

**対処**:
```typescript
const pool = new Pool({
  connectionTimeoutMillis: 10000,  // 接続タイムアウト
  query_timeout: 30000,            // クエリタイムアウト
  statement_timeout: 30000,        // ステートメントタイムアウト
});
```

### 3. 認証エラー

```
Error: password authentication failed for user "xxx"
Error: no pg_hba.conf entry for host "xxx"
Error: FATAL: database "xxx" does not exist
```

**原因**:
- 接続情報の誤り
- 権限設定の問題
- データベースが存在しない

**対処**:
```typescript
// 接続前に環境変数を検証
function validateDatabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === 'postgresql:' &&
      parsed.hostname &&
      parsed.pathname.length > 1
    );
  } catch {
    return false;
  }
}
```

### 4. SSL/TLS エラー

```
Error: The server does not support SSL connections
Error: SSL connection is required
Error: self signed certificate
```

**対処**:
```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: process.env.NODE_ENV === 'production',
    // 開発環境では自己署名証明書を許可
  },
});
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
  config: RetryConfig = defaultRetryConfig
): Promise<T> {
  let lastError: Error | undefined;
  let delay = config.initialDelayMs;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt < config.maxRetries && isRetryable(error)) {
        console.log(`Retry attempt ${attempt + 1}/${config.maxRetries}, waiting ${delay}ms`);
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
      'connection refused',
      'timeout',
      'too many connections',
      'connection terminated',
      'network',
    ];
    return retryableMessages.some(msg =>
      error.message.toLowerCase().includes(msg)
    );
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  CLOSED = 'CLOSED',     // 正常
  OPEN = 'OPEN',         // 遮断
  HALF_OPEN = 'HALF_OPEN', // 回復確認中
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
        throw new Error('Circuit breaker is OPEN');
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
      console.error(`Circuit breaker OPENED after ${this.failureCount} failures`);
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
    if (error.message === 'Circuit breaker is OPEN') {
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
  CONNECTION = 'CONNECTION',
  AUTHENTICATION = 'AUTHENTICATION',
  TIMEOUT = 'TIMEOUT',
  QUERY = 'QUERY',
  UNKNOWN = 'UNKNOWN',
}

function categorizeError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();

  if (message.includes('connection') || message.includes('refused')) {
    return ErrorCategory.CONNECTION;
  }
  if (message.includes('authentication') || message.includes('password')) {
    return ErrorCategory.AUTHENTICATION;
  }
  if (message.includes('timeout')) {
    return ErrorCategory.TIMEOUT;
  }
  if (message.includes('syntax') || message.includes('query')) {
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

function logDatabaseError(error: Error, context?: Record<string, unknown>): void {
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
  if (log.category === ErrorCategory.CONNECTION ||
      log.category === ErrorCategory.AUTHENTICATION) {
    sendAlert(log);
  }
}
```

## ヘルスチェック

### 実装

```typescript
interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  latencyMs: number;
  error?: string;
  timestamp: Date;
}

async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const start = Date.now();

  try {
    await db.execute(sql`SELECT 1`);

    return {
      status: 'healthy',
      latencyMs: Date.now() - start,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    };
  }
}

// 定期ヘルスチェック
setInterval(async () => {
  const health = await checkDatabaseHealth();
  if (health.status === 'unhealthy') {
    console.error('Database health check failed:', health);
  }
}, 30000); // 30秒ごと
```

### APIエンドポイント

```typescript
// /api/health
export async function GET() {
  const dbHealth = await checkDatabaseHealth();

  return new Response(JSON.stringify({
    database: dbHealth,
    timestamp: new Date().toISOString(),
  }), {
    status: dbHealth.status === 'healthy' ? 200 : 503,
    headers: { 'Content-Type': 'application/json' },
  });
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
