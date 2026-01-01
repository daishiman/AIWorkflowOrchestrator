/**
 * API Client Template
 *
 * 外部API統合のための汎用クライアントテンプレート。
 * 認証、リトライ、エラーハンドリングを含む。
 *
 * 使用方法:
 * 1. このテンプレートをコピー
 * 2. 変数を実際の値に置換
 * 3. 必要に応じてカスタマイズ
 */

// ============================================================
// 設定セクション - 環境変数から取得
// ============================================================

const CONFIG = {
  baseUrl: process.env.{{API_NAME}}_BASE_URL || 'https://api.example.com/v1',
  apiKey: process.env.{{API_NAME}}_API_KEY,
  timeout: parseInt(process.env.{{API_NAME}}_TIMEOUT || '30000', 10),
  maxRetries: parseInt(process.env.{{API_NAME}}_MAX_RETRIES || '3', 10),
};

// ============================================================
// 型定義
// ============================================================

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: unknown;
}

// ============================================================
// エラークラス
// ============================================================

class {{API_NAME}}Error extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = '{{API_NAME}}Error';
  }

  get isRetryable(): boolean {
    return [429, 500, 502, 503, 504].includes(this.statusCode);
  }
}

// ============================================================
// ユーティリティ関数
// ============================================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildQueryString(params: Record<string, string | number | boolean>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    searchParams.append(key, String(value));
  }
  return searchParams.toString();
}

function calculateBackoff(attempt: number, initialDelay = 1000, maxDelay = 30000): number {
  const delay = initialDelay * Math.pow(2, attempt);
  const jitter = delay * 0.2 * (Math.random() * 2 - 1);
  return Math.min(delay + jitter, maxDelay);
}

// ============================================================
// メインクライアントクラス
// ============================================================

export class {{API_NAME}}Client {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;
  private maxRetries: number;

  constructor(config?: Partial<typeof CONFIG>) {
    this.baseUrl = config?.baseUrl || CONFIG.baseUrl;
    this.apiKey = config?.apiKey || CONFIG.apiKey || '';
    this.timeout = config?.timeout || CONFIG.timeout;
    this.maxRetries = config?.maxRetries || CONFIG.maxRetries;

    if (!this.apiKey) {
      throw new Error('API Key is required');
    }
  }

  // 認証ヘッダーを生成
  private getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      // または 'X-API-Key': this.apiKey,
    };
  }

  // デフォルトヘッダー
  private getDefaultHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...this.getAuthHeaders(),
    };
  }

  // HTTPリクエストを実行（リトライロジック付き）
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      timeout = this.timeout,
    } = options;

    // URLを構築
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      url += `?${buildQueryString(params)}`;
    }

    // リクエストオプションを構築
    const fetchOptions: RequestInit = {
      method,
      headers: {
        ...this.getDefaultHeaders(),
        ...headers,
      },
    };

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    // リトライループ
    let lastError: {{API_NAME}}Error | undefined;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        // タイムアウト付きfetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // レスポンスヘッダーを取得
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        // エラーレスポンスの処理
        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new {{API_NAME}}Error(
            errorBody.message || `HTTP ${response.status}`,
            response.status,
            errorBody.code || 'API_ERROR',
            errorBody
          );
        }

        // 成功レスポンス
        const data = await response.json();
        return {
          data,
          status: response.status,
          headers: responseHeaders,
        };
      } catch (error) {
        if (error instanceof {{API_NAME}}Error) {
          lastError = error;

          // リトライ可能かチェック
          if (error.isRetryable && attempt < this.maxRetries) {
            const delay = calculateBackoff(attempt);
            console.warn(`Retrying after ${delay}ms (attempt ${attempt + 1}/${this.maxRetries})`);
            await sleep(delay);
            continue;
          }
        } else if (error instanceof Error) {
          lastError = new {{API_NAME}}Error(
            error.message,
            0,
            'NETWORK_ERROR',
            { originalError: error.name }
          );

          // ネットワークエラーもリトライ
          if (attempt < this.maxRetries) {
            const delay = calculateBackoff(attempt);
            await sleep(delay);
            continue;
          }
        }

        throw lastError || error;
      }
    }

    throw lastError || new Error('Request failed');
  }

  // ============================================================
  // パブリックAPIメソッド
  // ============================================================

  // リソース一覧取得
  async list{{RESOURCE_NAME}}s(params?: {
    page?: number;
    limit?: number;
  }): Promise<{{RESOURCE_TYPE}}[]> {
    const response = await this.request<{ items: {{RESOURCE_TYPE}}[] }>(
      '/{{RESOURCE_PATH}}',
      { params }
    );
    return response.data.items;
  }

  // 個別リソース取得
  async get{{RESOURCE_NAME}}(id: string): Promise<{{RESOURCE_TYPE}}> {
    const response = await this.request<{{RESOURCE_TYPE}}>(
      `/{{RESOURCE_PATH}}/${id}`
    );
    return response.data;
  }

  // リソース作成
  async create{{RESOURCE_NAME}}(data: Create{{RESOURCE_NAME}}Input): Promise<{{RESOURCE_TYPE}}> {
    const response = await this.request<{{RESOURCE_TYPE}}>(
      '/{{RESOURCE_PATH}}',
      {
        method: 'POST',
        body: data,
      }
    );
    return response.data;
  }

  // リソース更新
  async update{{RESOURCE_NAME}}(
    id: string,
    data: Update{{RESOURCE_NAME}}Input
  ): Promise<{{RESOURCE_TYPE}}> {
    const response = await this.request<{{RESOURCE_TYPE}}>(
      `/{{RESOURCE_PATH}}/${id}`,
      {
        method: 'PATCH',
        body: data,
      }
    );
    return response.data;
  }

  // リソース削除
  async delete{{RESOURCE_NAME}}(id: string): Promise<void> {
    await this.request<void>(
      `/{{RESOURCE_PATH}}/${id}`,
      { method: 'DELETE' }
    );
  }
}

// ============================================================
// 型定義（プレースホルダー）
// ============================================================

interface {{RESOURCE_TYPE}} {
  id: string;
  // 他のプロパティを追加
}

interface Create{{RESOURCE_NAME}}Input {
  // 作成時の必須フィールド
}

interface Update{{RESOURCE_NAME}}Input {
  // 更新時のオプショナルフィールド
}

// ============================================================
// 使用例
// ============================================================

/*
const client = new {{API_NAME}}Client();

// リスト取得
const items = await client.list{{RESOURCE_NAME}}s({ page: 1, limit: 10 });

// 個別取得
const item = await client.get{{RESOURCE_NAME}}('item-id');

// 作成
const newItem = await client.create{{RESOURCE_NAME}}({ ... });

// 更新
const updatedItem = await client.update{{RESOURCE_NAME}}('item-id', { ... });

// 削除
await client.delete{{RESOURCE_NAME}}('item-id');
*/
