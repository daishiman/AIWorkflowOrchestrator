# API エラーハンドリングパターン

## 1. エラー分類体系

### HTTPステータスコードマッピング

| 範囲 | カテゴリ | リトライ | 対応 |
|-----|---------|--------|------|
| 2xx | 成功 | - | 正常処理 |
| 4xx | クライアントエラー | 基本的に不可 | リクエスト修正 |
| 5xx | サーバーエラー | 可能 | リトライ/エスカレーション |

### 詳細エラーコード

| コード | 意味 | リトライ | 対応 |
|-------|------|--------|------|
| 400 | Bad Request | ❌ | リクエスト検証 |
| 401 | Unauthorized | △ | 再認証 |
| 403 | Forbidden | ❌ | 権限確認 |
| 404 | Not Found | ❌ | リソース確認 |
| 409 | Conflict | △ | 状態確認後リトライ |
| 422 | Unprocessable Entity | ❌ | バリデーション確認 |
| 429 | Too Many Requests | ✅ | バックオフ後リトライ |
| 500 | Internal Server Error | ✅ | リトライ |
| 502 | Bad Gateway | ✅ | リトライ |
| 503 | Service Unavailable | ✅ | リトライ |
| 504 | Gateway Timeout | ✅ | リトライ |

## 2. エラークラス設計

### カスタムエラー階層

```typescript
// 基底APIエラー
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isRetryable(): boolean {
    return [429, 500, 502, 503, 504].includes(this.statusCode);
  }
}

// 認証エラー
class AuthenticationError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 401, 'AUTHENTICATION_ERROR', details);
    this.name = 'AuthenticationError';
  }
}

// 認可エラー
class AuthorizationError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 403, 'AUTHORIZATION_ERROR', details);
    this.name = 'AuthorizationError';
  }
}

// Rate Limitエラー
class RateLimitError extends ApiError {
  constructor(
    message: string,
    public retryAfter: number,
    details?: Record<string, unknown>
  ) {
    super(message, 429, 'RATE_LIMIT_ERROR', details);
    this.name = 'RateLimitError';
  }

  get isRetryable(): boolean {
    return true;
  }
}

// バリデーションエラー
class ValidationError extends ApiError {
  constructor(
    message: string,
    public validationErrors: Array<{ field: string; message: string }>,
    details?: Record<string, unknown>
  ) {
    super(message, 422, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

// ネットワークエラー
class NetworkError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 0, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }

  get isRetryable(): boolean {
    return true;
  }
}
```

## 3. エラーハンドリングパターン

### Try-Catch ラッパー

```typescript
async function safeApiCall<T>(
  fn: () => Promise<T>,
  context: string
): Promise<{ data?: T; error?: ApiError }> {
  try {
    const data = await fn();
    return { data };
  } catch (error) {
    const apiError = normalizeError(error, context);
    return { error: apiError };
  }
}

function normalizeError(error: unknown, context: string): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    // ネットワークエラー
    if (error.message.includes('ECONNREFUSED') ||
        error.message.includes('ETIMEDOUT')) {
      return new NetworkError(`${context}: ${error.message}`);
    }
  }

  // 不明なエラー
  return new ApiError(
    `${context}: Unknown error`,
    500,
    'UNKNOWN_ERROR',
    { originalError: String(error) }
  );
}
```

### 結果型パターン（Result Type）

```typescript
type Result<T, E = ApiError> =
  | { success: true; data: T }
  | { success: false; error: E };

async function fetchWithResult<T>(
  url: string,
  options?: RequestInit
): Promise<Result<T>> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await parseErrorResponse(response);
      return { success: false, error };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: new NetworkError(String(error))
    };
  }
}

// 使用例
const result = await fetchWithResult<User>('/api/users/123');
if (result.success) {
  console.log(result.data.name);
} else {
  console.error(result.error.message);
}
```

### エラー復旧パターン

```typescript
class ErrorRecovery {
  private recoveryStrategies: Map<string, () => Promise<void>> = new Map();

  registerStrategy(errorCode: string, strategy: () => Promise<void>) {
    this.recoveryStrategies.set(errorCode, strategy);
  }

  async handle(error: ApiError): Promise<boolean> {
    const strategy = this.recoveryStrategies.get(error.code);
    if (!strategy) {
      return false;
    }

    try {
      await strategy();
      return true;
    } catch {
      return false;
    }
  }
}

// 使用例
const recovery = new ErrorRecovery();

// 認証エラー時は再ログイン
recovery.registerStrategy('AUTHENTICATION_ERROR', async () => {
  await refreshToken();
});

// Rate Limit時は待機
recovery.registerStrategy('RATE_LIMIT_ERROR', async () => {
  await sleep(60000);
});
```

## 4. フォールバック戦略

### 多層フォールバック

```typescript
class FallbackChain<T> {
  private strategies: Array<() => Promise<T>> = [];

  add(strategy: () => Promise<T>): this {
    this.strategies.push(strategy);
    return this;
  }

  async execute(): Promise<T> {
    let lastError: Error | undefined;

    for (const strategy of this.strategies) {
      try {
        return await strategy();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }

    throw lastError || new Error('All fallback strategies failed');
  }
}

// 使用例
const result = await new FallbackChain<UserData>()
  .add(() => fetchFromPrimaryApi())
  .add(() => fetchFromBackupApi())
  .add(() => fetchFromCache())
  .add(() => getDefaultData())
  .execute();
```

### キャッシュフォールバック

```typescript
class CacheFallback<T> {
  private cache: Map<string, { data: T; timestamp: number }> = new Map();
  private ttl: number;

  constructor(ttlMs: number = 300000) {
    this.ttl = ttlMs;
  }

  async fetchWithCache(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    try {
      const data = await fetchFn();
      this.cache.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < this.ttl) {
        console.warn('Using cached data due to fetch error');
        return cached.data;
      }
      throw error;
    }
  }
}
```

## 5. エラーログとモニタリング

### 構造化エラーログ

```typescript
interface ErrorLog {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  error: {
    name: string;
    code: string;
    statusCode: number;
    message: string;
  };
  context: {
    requestId?: string;
    userId?: string;
    endpoint?: string;
    method?: string;
  };
  metadata?: Record<string, unknown>;
}

function logError(error: ApiError, context: Record<string, string>): void {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    level: error.isRetryable ? 'warn' : 'error',
    error: {
      name: error.name,
      code: error.code,
      statusCode: error.statusCode,
      message: error.message
    },
    context,
    metadata: error.details
  };

  console.log(JSON.stringify(errorLog));
}
```

### エラーメトリクス

```typescript
class ErrorMetrics {
  private errors: Map<string, number> = new Map();
  private windowStart: number = Date.now();
  private windowSize: number = 60000; // 1分

  record(errorCode: string): void {
    this.cleanup();
    const current = this.errors.get(errorCode) || 0;
    this.errors.set(errorCode, current + 1);
  }

  getStats(): Record<string, number> {
    this.cleanup();
    return Object.fromEntries(this.errors);
  }

  private cleanup(): void {
    if (Date.now() - this.windowStart > this.windowSize) {
      this.errors.clear();
      this.windowStart = Date.now();
    }
  }
}
```

## 6. ユーザー向けエラーメッセージ

```typescript
const userFriendlyMessages: Record<string, string> = {
  'AUTHENTICATION_ERROR': 'セッションが期限切れです。再度ログインしてください。',
  'AUTHORIZATION_ERROR': 'この操作を行う権限がありません。',
  'RATE_LIMIT_ERROR': '一時的にリクエストが制限されています。しばらくお待ちください。',
  'VALIDATION_ERROR': '入力内容に問題があります。',
  'NETWORK_ERROR': 'ネットワーク接続を確認してください。',
  'UNKNOWN_ERROR': '予期せぬエラーが発生しました。時間をおいて再度お試しください。'
};

function getUserMessage(error: ApiError): string {
  return userFriendlyMessages[error.code] || userFriendlyMessages['UNKNOWN_ERROR'];
}
```
