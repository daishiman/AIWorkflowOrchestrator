# Client-Side Rate Limit Handling（クライアント側のレート制限対応）

## 概要

外部APIのレート制限に適切に対応することで、
安定したAPI通信を実現し、サービス品質を維持します。

## レート制限レスポンスの理解

### 標準ヘッダー

```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100          # 期間内の最大リクエスト数
X-RateLimit-Remaining: 0        # 残りリクエスト数
X-RateLimit-Reset: 1705312800   # リセット時刻（Unix時間）
Retry-After: 60                 # リトライまでの秒数

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retryAfter": 60
  }
}
```

### 主要APIのヘッダー形式

| API | Limit | Remaining | Reset | Retry-After |
|-----|-------|-----------|-------|-------------|
| GitHub | X-RateLimit-Limit | X-RateLimit-Remaining | X-RateLimit-Reset | ✓ |
| Twitter | x-rate-limit-limit | x-rate-limit-remaining | x-rate-limit-reset | ✓ |
| Stripe | - | - | - | Retry-After |
| OpenAI | x-ratelimit-limit-* | x-ratelimit-remaining-* | x-ratelimit-reset-* | ✓ |

## 基本的な429処理

### シンプルな実装

```typescript
async function fetchWithRateLimitHandling(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const response = await fetch(url, options);

  if (response.status === 429) {
    const retryAfter = parseRetryAfter(response);
    console.log(`Rate limited. Waiting ${retryAfter}ms...`);
    await sleep(retryAfter);
    return fetchWithRateLimitHandling(url, options);
  }

  return response;
}

function parseRetryAfter(response: Response): number {
  // Retry-After ヘッダーを確認
  const retryAfter = response.headers.get('Retry-After');

  if (retryAfter) {
    // 秒数の場合
    const seconds = parseInt(retryAfter, 10);
    if (!isNaN(seconds)) {
      return seconds * 1000;
    }

    // HTTP日付の場合
    const date = new Date(retryAfter);
    if (!isNaN(date.getTime())) {
      return Math.max(0, date.getTime() - Date.now());
    }
  }

  // X-RateLimit-Reset を確認
  const reset = response.headers.get('X-RateLimit-Reset');
  if (reset) {
    const resetTime = parseInt(reset, 10) * 1000;
    return Math.max(0, resetTime - Date.now());
  }

  // デフォルト: 60秒
  return 60000;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

## 高度な実装パターン

### レート制限追跡クライアント

```typescript
interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: number;
}

class RateLimitedClient {
  private rateLimits: Map<string, RateLimitInfo> = new Map();
  private pendingRequests: Map<string, Promise<Response>> = new Map();

  constructor(
    private readonly baseUrl: string,
    private readonly defaultWaitMs: number = 60000
  ) {}

  async request(
    path: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const endpoint = this.getEndpointKey(path);

    // 事前チェック: レート制限に近い場合は待機
    await this.waitIfNeeded(endpoint);

    // 重複リクエストの抑制
    const pendingKey = `${options.method || 'GET'}:${path}`;
    const pending = this.pendingRequests.get(pendingKey);
    if (pending) {
      return pending;
    }

    const requestPromise = this.executeRequest(path, options, endpoint);
    this.pendingRequests.set(pendingKey, requestPromise);

    try {
      return await requestPromise;
    } finally {
      this.pendingRequests.delete(pendingKey);
    }
  }

  private async executeRequest(
    path: string,
    options: RequestInit,
    endpoint: string
  ): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, options);

    // レート制限情報を更新
    this.updateRateLimitInfo(endpoint, response);

    // 429の場合はリトライ
    if (response.status === 429) {
      const waitTime = this.calculateWaitTime(response);
      console.warn(`Rate limited on ${endpoint}. Waiting ${waitTime}ms...`);
      await sleep(waitTime);
      return this.executeRequest(path, options, endpoint);
    }

    return response;
  }

  private async waitIfNeeded(endpoint: string): Promise<void> {
    const info = this.rateLimits.get(endpoint);

    if (!info) return;

    // 残り少ない場合は待機
    if (info.remaining <= 0 && info.resetAt > Date.now()) {
      const waitTime = info.resetAt - Date.now();
      console.log(`Preemptive wait for ${endpoint}: ${waitTime}ms`);
      await sleep(waitTime);
    }
  }

  private updateRateLimitInfo(endpoint: string, response: Response): void {
    const limit = response.headers.get('X-RateLimit-Limit');
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');

    if (limit && remaining && reset) {
      this.rateLimits.set(endpoint, {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        resetAt: parseInt(reset, 10) * 1000,
      });
    }
  }

  private calculateWaitTime(response: Response): number {
    return parseRetryAfter(response) || this.defaultWaitMs;
  }

  private getEndpointKey(path: string): string {
    // パスからエンドポイントキーを生成
    // 例: /users/123 → /users/:id
    return path.replace(/\/\d+/g, '/:id');
  }

  getRateLimitInfo(path: string): RateLimitInfo | undefined {
    return this.rateLimits.get(this.getEndpointKey(path));
  }
}
```

### リクエストキュー

```typescript
interface QueuedRequest {
  execute: () => Promise<Response>;
  resolve: (response: Response) => void;
  reject: (error: Error) => void;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private rateLimitedUntil = 0;

  constructor(
    private readonly requestsPerSecond: number = 10,
    private readonly burstSize: number = 20
  ) {}

  async enqueue(execute: () => Promise<Response>): Promise<Response> {
    return new Promise((resolve, reject) => {
      this.queue.push({ execute, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      // レート制限解除を待機
      const now = Date.now();
      if (this.rateLimitedUntil > now) {
        await sleep(this.rateLimitedUntil - now);
      }

      const request = this.queue.shift()!;

      try {
        const response = await request.execute();

        if (response.status === 429) {
          // 429の場合はキューに戻す
          this.queue.unshift(request);
          this.rateLimitedUntil = Date.now() + parseRetryAfter(response);
          continue;
        }

        request.resolve(response);
      } catch (error) {
        request.reject(error as Error);
      }

      // スロットリング
      await sleep(1000 / this.requestsPerSecond);
    }

    this.processing = false;
  }
}

// 使用例
const queue = new RequestQueue(10, 20);

const responses = await Promise.all([
  queue.enqueue(() => fetch('/api/users/1')),
  queue.enqueue(() => fetch('/api/users/2')),
  queue.enqueue(() => fetch('/api/users/3')),
]);
```

## バックオフ戦略

### 指数バックオフ + ジッター

```typescript
async function fetchWithExponentialBackoff(
  url: string,
  options: RequestInit = {},
  config: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    jitter?: number;
  } = {}
): Promise<Response> {
  const {
    maxRetries = 5,
    baseDelay = 1000,
    maxDelay = 60000,
    jitter = 0.3,
  } = config;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.status === 429) {
        const retryAfter = parseRetryAfter(response);

        // Retry-Afterがある場合はそれを使用
        if (retryAfter > 0) {
          await sleep(retryAfter);
          continue;
        }

        // なければ指数バックオフ
        const delay = calculateBackoff(attempt, baseDelay, maxDelay, jitter);
        await sleep(delay);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const delay = calculateBackoff(attempt, baseDelay, maxDelay, jitter);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

function calculateBackoff(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  jitter: number
): number {
  const exponential = baseDelay * Math.pow(2, attempt);
  const capped = Math.min(exponential, maxDelay);
  const jitterAmount = capped * jitter * Math.random();
  return capped + jitterAmount;
}
```

## 予防的レート制限

### クライアント側スロットリング

```typescript
class ClientRateLimiter {
  private readonly bucket: TokenBucket;

  constructor(
    requestsPerMinute: number,
    burstSize?: number
  ) {
    const ratePerSecond = requestsPerMinute / 60;
    this.bucket = new TokenBucket(
      burstSize || requestsPerMinute,
      ratePerSecond
    );
  }

  async throttle(): Promise<void> {
    while (!this.bucket.consume()) {
      const waitTime = this.bucket.getWaitTime();
      await sleep(waitTime);
    }
  }
}

// 使用例
const limiter = new ClientRateLimiter(100); // 100リクエスト/分

async function makeRequest(url: string): Promise<Response> {
  await limiter.throttle(); // レート制限を待機
  return fetch(url);
}
```

## エラーハンドリング

### レート制限エラークラス

```typescript
class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfter: number,
    public readonly limit?: number,
    public readonly remaining?: number,
    public readonly resetAt?: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }

  static fromResponse(response: Response): RateLimitError {
    return new RateLimitError(
      'Rate limit exceeded',
      parseRetryAfter(response),
      parseInt(response.headers.get('X-RateLimit-Limit') || '0', 10) || undefined,
      parseInt(response.headers.get('X-RateLimit-Remaining') || '0', 10) || undefined,
      parseInt(response.headers.get('X-RateLimit-Reset') || '0', 10) * 1000 || undefined
    );
  }
}

// 使用例
try {
  const response = await rateLimitedClient.request('/api/data');
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter}ms`);
    console.log(`Limit: ${error.limit}, Remaining: ${error.remaining}`);
  }
}
```

## チェックリスト

### 実装時
- [ ] Retry-Afterヘッダーを正しく解析しているか？
- [ ] バックオフにジッターを追加しているか？
- [ ] 最大リトライ回数を設定しているか？

### 運用時
- [ ] レート制限エラーをモニタリングしているか？
- [ ] APIのクォータ使用量を追跡しているか？
- [ ] 予防的スロットリングを検討したか？

## 参考

- **RFC 6585**: Additional HTTP Status Codes
- **IETF Draft**: RateLimit Header Fields
