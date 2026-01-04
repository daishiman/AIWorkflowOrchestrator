/**
 * API Client Template
 *
 * 外部APIクライアントの実装テンプレート
 * 使用方法: このテンプレートをコピーし、プレースホルダーを実装してください
 *
 * 含まれる機能:
 * - 腐敗防止層（Anti-Corruption Layer）
 * - 型安全なデータ変換
 * - エラーハンドリング
 * - 基本的なリトライサポート（retry-strategiesスキルと連携）
 */

import { z } from "zod";

// ============================================
// 1. 外部型定義（External Types）
// ============================================

/**
 * 外部APIのレスポンス型
 * APIドキュメントに基づいて定義
 */
const External{{EntityName}}Schema = z.object({
  // 外部APIのフィールド名（snake_case等）
  {{external_id_field}}: z.string(),
  {{external_field_1}}: z.string(),
  {{external_field_2}}: z.string().nullable(),
  {{external_timestamp_field}}: z.number(), // Unix timestamp
});

type External{{EntityName}} = z.infer<typeof External{{EntityName}}Schema>;

/**
 * 外部APIのエラーレスポンス型
 */
const ExternalErrorSchema = z.object({
  error_code: z.string(),
  error_message: z.string(),
  details: z.record(z.unknown()).optional(),
});

type ExternalError = z.infer<typeof ExternalErrorSchema>;

// ============================================
// 2. 内部型定義（Internal Types）
// ============================================

/**
 * 内部ドメインモデル
 * 内部のビジネスロジックに適した型
 */
export interface {{EntityName}} {
  id: string;
  {{internalField1}}: string;
  {{internalField2}}: string | undefined;
  createdAt: Date;
}

/**
 * 内部エラー型
 */
export class {{EntityName}}NotFoundError extends Error {
  constructor(id: string) {
    super(`{{EntityName}} not found: ${id}`);
    this.name = "{{EntityName}}NotFoundError";
  }
}

export class ExternalServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = "ExternalServiceError";
  }
}

// ============================================
// 3. 変換関数（Transformers）
// ============================================

/**
 * 外部型 → 内部型 の変換
 */
function transformTo{{EntityName}}(external: External{{EntityName}}): {{EntityName}} {
  return {
    id: external.{{external_id_field}},
    {{internalField1}}: external.{{external_field_1}},
    {{internalField2}}: external.{{external_field_2}} ?? undefined,
    createdAt: new Date(external.{{external_timestamp_field}} * 1000),
  };
}

/**
 * 内部型 → 外部型 の変換（更新リクエスト用）
 */
function transformToExternal(entity: {{EntityName}}): Partial<External{{EntityName}}> {
  return {
    {{external_field_1}}: entity.{{internalField1}},
    {{external_field_2}}: entity.{{internalField2}} ?? null,
  };
}

/**
 * 外部エラー → 内部エラー の変換
 */
function transformError(error: ExternalError): Error {
  switch (error.error_code) {
    case "NOT_FOUND":
      return new {{EntityName}}NotFoundError(error.error_message);
    case "UNAUTHORIZED":
      return new ExternalServiceError("Authentication failed", error.error_code);
    case "RATE_LIMITED":
      return new ExternalServiceError("Rate limit exceeded", error.error_code);
    default:
      return new ExternalServiceError(error.error_message, error.error_code);
  }
}

// ============================================
// 4. APIクライアント設定
// ============================================

interface {{EntityName}}ClientConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
}

// ============================================
// 5. APIクライアント実装
// ============================================

/**
 * {{EntityName}} API Client
 *
 * 外部APIとの通信を担当し、内部ドメイン型を返す
 */
export class {{EntityName}}Client {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeout: number;

  constructor(config: {{EntityName}}ClientConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.timeout = config.timeout ?? 30000;
  }

  /**
   * IDで{{EntityName}}を取得
   */
  async findById(id: string): Promise<{{EntityName}}> {
    const response = await this.request(`/{{endpoint}}/${id}`, "GET");
    const validated = External{{EntityName}}Schema.parse(response);
    return transformTo{{EntityName}}(validated);
  }

  /**
   * 条件で{{EntityName}}を検索
   */
  async findMany(params: { limit?: number; offset?: number }): Promise<{{EntityName}}[]> {
    const query = new URLSearchParams();
    if (params.limit) query.set("limit", String(params.limit));
    if (params.offset) query.set("offset", String(params.offset));

    const response = await this.request(`/{{endpoint}}?${query}`, "GET");
    const items = z.array(External{{EntityName}}Schema).parse(response.data);
    return items.map(transformTo{{EntityName}});
  }

  /**
   * {{EntityName}}を作成
   */
  async create(entity: Omit<{{EntityName}}, "id" | "createdAt">): Promise<{{EntityName}}> {
    const body = {
      {{external_field_1}}: entity.{{internalField1}},
      {{external_field_2}}: entity.{{internalField2}} ?? null,
    };

    const response = await this.request("/{{endpoint}}", "POST", body);
    const validated = External{{EntityName}}Schema.parse(response);
    return transformTo{{EntityName}}(validated);
  }

  /**
   * {{EntityName}}を更新
   */
  async update(id: string, entity: Partial<{{EntityName}}>): Promise<{{EntityName}}> {
    const body = transformToExternal(entity as {{EntityName}});
    const response = await this.request(`/{{endpoint}}/${id}`, "PATCH", body);
    const validated = External{{EntityName}}Schema.parse(response);
    return transformTo{{EntityName}}(validated);
  }

  /**
   * {{EntityName}}を削除
   */
  async delete(id: string): Promise<void> {
    await this.request(`/{{endpoint}}/${id}`, "DELETE");
  }

  // ============================================
  // プライベートメソッド
  // ============================================

  /**
   * HTTPリクエストの実行
   */
  private async request(
    path: string,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    body?: unknown
  ): Promise<unknown> {
    const url = `${this.baseUrl}${path}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const externalError = ExternalErrorSchema.safeParse(errorBody);

        if (externalError.success) {
          throw transformError(externalError.data);
        }

        throw new ExternalServiceError(
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        throw new ExternalServiceError("Request timeout");
      }

      throw error;
    }
  }
}

// ============================================
// 6. ファクトリー関数（オプション）
// ============================================

/**
 * 環境変数からクライアントを作成
 */
export function create{{EntityName}}Client(): {{EntityName}}Client {
  const baseUrl = process.env.{{ENTITY_NAME}}_API_URL;
  const apiKey = process.env.{{ENTITY_NAME}}_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("Missing required environment variables for {{EntityName}}Client");
  }

  return new {{EntityName}}Client({ baseUrl, apiKey });
}
