/**
 * HTTP Client Template
 *
 * HTTPベストプラクティスに準拠したクライアント実装テンプレート
 * 使用方法: このテンプレートをコピーし、プレースホルダーを実装してください
 *
 * 含まれる機能:
 * - 適切なヘッダー設定
 * - タイムアウト管理
 * - エラーハンドリング
 * - リクエストID伝播
 * - キャッシュ制御
 */

// ============================================
// 1. 型定義
// ============================================

export interface HttpClientConfig {
  /** ベースURL */
  baseUrl: string;

  /** デフォルトタイムアウト（ミリ秒） */
  timeout: number;

  /** デフォルトヘッダー */
  defaultHeaders?: Record<string, string>;

  /** リクエストID生成関数 */
  generateRequestId?: () => string;

  /** リトライ設定 */
  retry?: {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
  };
}

export interface RequestOptions {
  /** HTTPメソッド */
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

  /** リクエストヘッダー */
  headers?: Record<string, string>;

  /** リクエストボディ */
  body?: unknown;

  /** タイムアウト（ミリ秒） */
  timeout?: number;

  /** キャッシュ制御 */
  cache?: RequestCache;

  /** クエリパラメータ */
  params?: Record<string, string | number | boolean>;

  /** 冪等キー */
  idempotencyKey?: string;
}

export interface HttpResponse<T> {
  /** ステータスコード */
  status: number;

  /** ステータステキスト */
  statusText: string;

  /** レスポンスヘッダー */
  headers: Headers;

  /** レスポンスボディ */
  data: T;

  /** リクエストID */
  requestId: string;
}

// ============================================
// 2. エラー型定義
// ============================================

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly statusText: string,
    public readonly requestId: string,
    public readonly response?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isRetryable(): boolean {
    return (
      this.status === 408 ||
      this.status === 429 ||
      this.status === 502 ||
      this.status === 503 ||
      this.status === 504
    );
  }
}

export class TimeoutError extends Error {
  constructor(
    message: string,
    public readonly requestId: string,
  ) {
    super(message);
    this.name = "TimeoutError";
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly requestId: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "NetworkError";
  }
}

// ============================================
// 3. デフォルト設定
// ============================================

const DEFAULT_CONFIG: Required<HttpClientConfig> = {
  baseUrl: "",
  timeout: 30000,
  defaultHeaders: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  generateRequestId: () => crypto.randomUUID(),
  retry: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
  },
};

// ============================================
// 4. ユーティリティ関数
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, string | number | boolean>,
): string {
  const url = new URL(path, baseUrl);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

function calculateBackoff(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
): number {
  const delay = baseDelay * Math.pow(2, attempt);
  const jitter = delay * 0.3 * Math.random();
  return Math.min(delay + jitter, maxDelay);
}

// ============================================
// 5. HTTPクライアント実装
// ============================================

export class HttpClient {
  private readonly config: Required<HttpClientConfig>;

  constructor(config: HttpClientConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      defaultHeaders: {
        ...DEFAULT_CONFIG.defaultHeaders,
        ...config.defaultHeaders,
      },
      retry: {
        ...DEFAULT_CONFIG.retry,
        ...config.retry,
      },
    };
  }

  /**
   * GETリクエスト
   */
  async get<T>(
    path: string,
    options?: Omit<RequestOptions, "method" | "body">,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  /**
   * POSTリクエスト
   */
  async post<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method">,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  /**
   * PUTリクエスト
   */
  async put<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method">,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  /**
   * PATCHリクエスト
   */
  async patch<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method">,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  /**
   * DELETEリクエスト
   */
  async delete<T>(
    path: string,
    options?: Omit<RequestOptions, "method" | "body">,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }

  /**
   * 汎用リクエスト
   */
  async request<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<HttpResponse<T>> {
    const requestId = this.config.generateRequestId();
    const method = options.method || "GET";
    const timeout = options.timeout || this.config.timeout;

    // URLビルド
    const url = buildUrl(this.config.baseUrl, path, options.params);

    // ヘッダー構築
    const headers = new Headers({
      ...this.config.defaultHeaders,
      ...options.headers,
      "X-Request-ID": requestId,
    });

    // 冪等キー
    if (options.idempotencyKey) {
      headers.set("Idempotency-Key", options.idempotencyKey);
    }

    // ボディ準備
    let body: string | undefined;
    if (options.body !== undefined) {
      body = JSON.stringify(options.body);
    }

    // リトライループ
    let lastError: Error | undefined;
    const maxAttempts = this.config.retry.maxRetries + 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await this.executeRequest(url, {
          method,
          headers,
          body,
          timeout,
          cache: options.cache,
          requestId,
        });

        return response as HttpResponse<T>;
      } catch (error) {
        lastError = error as Error;

        // リトライ可能かチェック
        const isRetryable =
          error instanceof TimeoutError ||
          error instanceof NetworkError ||
          (error instanceof HttpError && error.isRetryable);

        if (!isRetryable || attempt === maxAttempts - 1) {
          throw error;
        }

        // バックオフ待機
        const delay = calculateBackoff(
          attempt,
          this.config.retry.baseDelay,
          this.config.retry.maxDelay,
        );

        console.log({
          event: "http_retry",
          requestId,
          attempt: attempt + 1,
          maxAttempts,
          delayMs: delay,
          error: lastError.message,
        });

        await sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * 単一リクエスト実行
   */
  private async executeRequest(
    url: string,
    options: {
      method: string;
      headers: Headers;
      body?: string;
      timeout: number;
      cache?: RequestCache;
      requestId: string;
    },
  ): Promise<HttpResponse<unknown>> {
    const { method, headers, body, timeout, cache, requestId } = options;

    // AbortController でタイムアウト制御
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const startTime = Date.now();

      const response = await fetch(url, {
        method,
        headers,
        body,
        cache,
        signal: controller.signal,
      });

      const duration = Date.now() - startTime;

      // レスポンスボディ取得
      const contentType = response.headers.get("Content-Type") || "";
      let data: unknown;

      if (contentType.includes("application/json")) {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      } else {
        data = await response.text();
      }

      // ログ出力
      console.log({
        event: "http_response",
        requestId,
        method,
        url,
        status: response.status,
        durationMs: duration,
      });

      // エラーレスポンスチェック
      if (!response.ok) {
        throw new HttpError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response.statusText,
          requestId,
          data,
        );
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data,
        requestId,
      };
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new TimeoutError(
            `Request timed out after ${timeout}ms`,
            requestId,
          );
        }

        throw new NetworkError(
          `Network error: ${error.message}`,
          requestId,
          error,
        );
      }

      throw new NetworkError("Unknown network error", requestId);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// ============================================
// 6. ファクトリー関数
// ============================================

/**
 * HTTPクライアントを作成
 */
export function createHttpClient(config: HttpClientConfig): HttpClient {
  return new HttpClient(config);
}

// ============================================
// 7. 使用例
// ============================================

/*
// クライアント作成
const client = createHttpClient({
  baseUrl: 'https://api.example.com',
  timeout: 10000,
  defaultHeaders: {
    'Authorization': `Bearer ${token}`,
  },
});

// GETリクエスト
const users = await client.get<User[]>('/users', {
  params: { page: 1, limit: 10 },
});
console.log(users.data);

// POSTリクエスト（冪等キー付き）
const order = await client.post<Order>('/orders', {
  productId: 'prod-123',
  quantity: 1,
}, {
  idempotencyKey: crypto.randomUUID(),
});

// PUTリクエスト
const updated = await client.put<User>('/users/123', {
  name: 'Updated Name',
});

// DELETEリクエスト
await client.delete('/users/123');

// エラーハンドリング
try {
  await client.get('/protected');
} catch (error) {
  if (error instanceof HttpError) {
    if (error.status === 401) {
      // 認証エラー
    } else if (error.status === 404) {
      // リソース未存在
    }
  } else if (error instanceof TimeoutError) {
    // タイムアウト
  } else if (error instanceof NetworkError) {
    // ネットワークエラー
  }
}
*/
