# 同期統合パターン詳細ガイド

## 1. Request-Response パターン

### 基本構造

```
クライアント                MCP サーバー               外部API
    │                           │                        │
    │  ツール呼び出し           │                        │
    │ ─────────────────────────►│                        │
    │                           │  APIリクエスト          │
    │                           │ ──────────────────────►│
    │                           │                        │
    │                           │  APIレスポンス          │
    │                           │◄────────────────────── │
    │  結果返却                 │                        │
    │◄───────────────────────── │                        │
```

### 実装パターン

```typescript
// 基本的なRequest-Response実装
async function callExternalApi(endpoint: string, params: any): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}
```

### タイムアウト戦略

```yaml
タイムアウト設定ガイドライン:

接続タイムアウト:
  - 目的: 接続確立までの待機時間
  - 推奨値: 5-10秒
  - 考慮事項: ネットワーク遅延、DNS解決

読み取りタイムアウト:
  - 目的: レスポンス受信までの待機時間
  - 推奨値: 30-60秒（処理内容による）
  - 考慮事項: 外部APIの処理時間

全体タイムアウト:
  - 目的: 操作全体の最大時間
  - 推奨値: 60-120秒
  - 考慮事項: ユーザー体験、リソース解放
```

### エラーハンドリング

```typescript
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public body: string,
  ) {
    super(`API Error: ${statusCode}`);
  }
}

async function callWithErrorHandling(
  endpoint: string,
  params: any,
): Promise<any> {
  try {
    return await callExternalApi(endpoint, params);
  } catch (error) {
    if (error instanceof ApiError) {
      switch (error.statusCode) {
        case 400:
          throw new ValidationError("Invalid request parameters");
        case 401:
        case 403:
          throw new AuthenticationError("Authentication failed");
        case 404:
          throw new NotFoundError("Resource not found");
        case 429:
          throw new RateLimitError("Rate limit exceeded");
        case 500:
        case 502:
        case 503:
          throw new ServiceError("External service unavailable");
        default:
          throw new UnknownError(`Unexpected error: ${error.statusCode}`);
      }
    }

    if (error.name === "AbortError") {
      throw new TimeoutError("Request timed out");
    }

    throw error;
  }
}
```

## 2. Aggregator パターン

### 並列集約

```typescript
interface AggregationSource {
  name: string;
  fetch: () => Promise<any>;
  required: boolean;
  timeout?: number;
}

async function aggregateData(
  sources: AggregationSource[],
): Promise<Record<string, any>> {
  const results: Record<string, any> = {};
  const errors: Record<string, Error> = {};

  const promises = sources.map(async (source) => {
    try {
      const controller = new AbortController();
      const timeoutId = source.timeout
        ? setTimeout(() => controller.abort(), source.timeout)
        : null;

      const data = await source.fetch();
      if (timeoutId) clearTimeout(timeoutId);

      results[source.name] = data;
    } catch (error) {
      errors[source.name] = error as Error;

      if (source.required) {
        throw error;
      }
    }
  });

  await Promise.allSettled(promises);

  // 必須ソースのエラーチェック
  for (const source of sources) {
    if (source.required && errors[source.name]) {
      throw errors[source.name];
    }
  }

  return {
    data: results,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}

// 使用例
const result = await aggregateData([
  {
    name: "users",
    fetch: () => fetchUsers(),
    required: true,
    timeout: 5000,
  },
  {
    name: "analytics",
    fetch: () => fetchAnalytics(),
    required: false, // オプショナル
    timeout: 3000,
  },
  {
    name: "notifications",
    fetch: () => fetchNotifications(),
    required: false,
    timeout: 2000,
  },
]);
```

### 依存関係のある集約

```typescript
interface DependentSource {
  name: string;
  fetch: (context: Record<string, any>) => Promise<any>;
  dependsOn: string[];
}

async function aggregateWithDependencies(
  sources: DependentSource[],
): Promise<Record<string, any>> {
  const results: Record<string, any> = {};
  const completed = new Set<string>();
  const pending = [...sources];

  while (pending.length > 0) {
    // 依存関係が満たされたソースを見つける
    const ready = pending.filter((source) =>
      source.dependsOn.every((dep) => completed.has(dep)),
    );

    if (ready.length === 0 && pending.length > 0) {
      throw new Error("Circular dependency detected");
    }

    // 並列実行
    await Promise.all(
      ready.map(async (source) => {
        const data = await source.fetch(results);
        results[source.name] = data;
        completed.add(source.name);
        pending.splice(pending.indexOf(source), 1);
      }),
    );
  }

  return results;
}
```

## 3. Gateway パターン

### ルーティングゲートウェイ

```typescript
interface RouteConfig {
  pattern: RegExp;
  handler: (request: any) => Promise<any>;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  transform?: {
    request?: (req: any) => any;
    response?: (res: any) => any;
  };
}

class ApiGateway {
  private routes: RouteConfig[] = [];

  addRoute(config: RouteConfig): void {
    this.routes.push(config);
  }

  async handle(path: string, request: any): Promise<any> {
    // マッチするルートを検索
    const route = this.routes.find((r) => r.pattern.test(path));

    if (!route) {
      throw new NotFoundError(`No route for path: ${path}`);
    }

    // Rate Limit チェック
    if (route.rateLimit) {
      await this.checkRateLimit(path, route.rateLimit);
    }

    // リクエスト変換
    let transformedRequest = request;
    if (route.transform?.request) {
      transformedRequest = route.transform.request(request);
    }

    // ハンドラー実行
    let response = await route.handler(transformedRequest);

    // レスポンス変換
    if (route.transform?.response) {
      response = route.transform.response(response);
    }

    return response;
  }

  private async checkRateLimit(
    path: string,
    config: { maxRequests: number; windowMs: number },
  ): Promise<void> {
    // Rate Limit ロジック
  }
}
```

### プロトコル変換

```typescript
// REST → GraphQL 変換例
class RestToGraphqlAdapter {
  async convert(restRequest: RestRequest): Promise<GraphqlQuery> {
    const { method, path, body } = restRequest;

    // パスからリソースを抽出
    const [, resource, id] = path.match(/^\/(\w+)(?:\/(\w+))?$/) || [];

    if (!resource) {
      throw new Error("Invalid path");
    }

    switch (method) {
      case "GET":
        if (id) {
          return {
            query: `query { ${resource}(id: "${id}") { id ...fields } }`,
          };
        }
        return {
          query: `query { ${resource}List { items { id ...fields } } }`,
        };

      case "POST":
        return {
          query: `mutation { create${capitalize(resource)}(input: $input) { id } }`,
          variables: { input: body },
        };

      case "PUT":
        return {
          query: `mutation { update${capitalize(resource)}(id: "${id}", input: $input) { id } }`,
          variables: { input: body },
        };

      case "DELETE":
        return {
          query: `mutation { delete${capitalize(resource)}(id: "${id}") { success } }`,
        };

      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }
}
```

## 4. サーキットブレーカー

### 実装

```typescript
enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  resetTimeout: number;
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime?: number;

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - (this.lastFailureTime || 0) > this.config.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
        this.successes = 0;
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await this.withTimeout(operation);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private async withTimeout<T>(operation: () => Promise<T>): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), this.config.timeout),
      ),
    ]);
  }

  private onSuccess(): void {
    this.failures = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}
```

### 使用例

```typescript
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5, // 5回失敗でOPEN
  successThreshold: 3, // 3回成功でCLOSED
  timeout: 10000, // 10秒タイムアウト
  resetTimeout: 30000, // 30秒後にHALF_OPEN
});

async function callExternalService(data: any): Promise<any> {
  return circuitBreaker.execute(async () => {
    const response = await fetch("https://api.example.com/endpoint", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  });
}
```

## 5. リトライ戦略

### Exponential Backoff

```typescript
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  multiplier: number;
  jitter: boolean;
  retryableErrors: (error: Error) => boolean;
}

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: RetryConfig,
): Promise<T> {
  let lastError: Error;
  let delay = config.initialDelayMs;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (!config.retryableErrors(lastError)) {
        throw lastError;
      }

      if (attempt === config.maxRetries) {
        break;
      }

      // ジッター追加（オプション）
      let actualDelay = delay;
      if (config.jitter) {
        actualDelay = delay * (0.5 + Math.random());
      }

      await sleep(Math.min(actualDelay, config.maxDelayMs));
      delay *= config.multiplier;
    }
  }

  throw lastError!;
}

// 使用例
const result = await retryWithBackoff(() => callExternalApi(endpoint, params), {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  multiplier: 2,
  jitter: true,
  retryableErrors: (error) => {
    return (
      error instanceof ServiceError ||
      error instanceof TimeoutError ||
      error instanceof RateLimitError
    );
  },
});
```

## 6. チェックリスト

### 同期統合実装チェック

- [ ] タイムアウトは全てのレベルで設定？
- [ ] エラーハンドリングは網羅的？
- [ ] サーキットブレーカーは導入？
- [ ] リトライロジックは適切？
- [ ] ログ/監視は実装？
- [ ] テストは十分？
