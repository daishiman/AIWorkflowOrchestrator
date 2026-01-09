# LLM アダプター設計

## 文書情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| タスクID   | TASK-LLM-UI-IPC-ADAPTER-001           |
| Phase      | 2                                     |
| 作成日     | 2026-01-09                            |
| 使用スキル | api-client-patterns, factory-patterns |
| 配置先     | `apps/desktop/src/main/adapters/llm/` |

---

## 1. アダプターパターン概要

### 1.1 目的

各LLMプロバイダーの固有APIを共通インターフェースで抽象化し、プロバイダー変更の影響を局所化する（Anti-Corruption Layer）。

### 1.2 クラス図

```
                        ┌─────────────────────────┐
                        │     <<interface>>        │
                        │      ILLMAdapter         │
                        ├─────────────────────────┤
                        │ +providerId: LLMProviderId │
                        │ +sendChat()              │
                        │ +streamChat()            │
                        │ +checkHealth()           │
                        └───────────┬─────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           │                        │                        │
    ┌──────┴──────┐          ┌──────┴──────┐          ┌──────┴──────┐
    │ OpenAIAdapter │          │AnthropicAdapter│        │ GoogleAdapter │
    └─────────────┘          └─────────────┘          └─────────────┘
           │                        │                        │
    ┌──────┴──────┐
    │ xAIAdapter   │
    └─────────────┘

                        ┌─────────────────────────┐
                        │   LLMAdapterFactory      │
                        ├─────────────────────────┤
                        │ +getAdapter(providerId)  │
                        │ +register(id, factory)   │
                        └─────────────────────────┘
```

---

## 2. ILLMAdapter インターフェース

### 2.1 定義

```typescript
// apps/desktop/src/main/adapters/llm/types.ts
import type {
  LLMProviderId,
  LLMChatRequest,
  LLMChatResponse,
  HealthCheckResult,
} from "@repo/shared/types/llm/schemas";

export interface StreamChunk {
  /** チャンクID */
  id: string;
  /** 差分コンテンツ */
  delta: string;
  /** 完了フラグ */
  done: boolean;
  /** メタデータ */
  metadata?: {
    model?: string;
    finishReason?: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
    };
  };
}

export interface ILLMAdapter {
  /** プロバイダーID */
  readonly providerId: LLMProviderId;

  /**
   * チャットメッセージ送信（非ストリーミング）
   * @param request チャットリクエスト
   * @returns チャットレスポンス
   */
  sendChat(request: LLMChatRequest): Promise<LLMChatResponse>;

  /**
   * ストリーミングチャット
   * @param request チャットリクエスト
   * @yields ストリームチャンク
   */
  streamChat(request: LLMChatRequest): AsyncGenerator<StreamChunk>;

  /**
   * ヘルスチェック
   * @returns ヘルスチェック結果
   */
  checkHealth(): Promise<HealthCheckResult>;
}

export interface LLMAdapterConfig {
  /** APIキー */
  apiKey: string;
  /** ベースURL（オプション） */
  baseUrl?: string;
  /** タイムアウト（ミリ秒） */
  timeout?: number;
  /** 最大リトライ回数 */
  maxRetries?: number;
}
```

---

## 3. 共通基底クラス

### 3.1 BaseLLMAdapter

```typescript
// apps/desktop/src/main/adapters/llm/base.ts
import type {
  LLMProviderId,
  LLMChatRequest,
  LLMChatResponse,
  HealthCheckResult,
  LLMError,
} from "@repo/shared/types/llm/schemas";
import type { ILLMAdapter, StreamChunk, LLMAdapterConfig } from "./types";

export abstract class BaseLLMAdapter implements ILLMAdapter {
  abstract readonly providerId: LLMProviderId;

  protected readonly config: LLMAdapterConfig;

  constructor(config: LLMAdapterConfig) {
    this.config = {
      timeout: 30000,
      maxRetries: 3,
      ...config,
    };
  }

  abstract sendChat(request: LLMChatRequest): Promise<LLMChatResponse>;
  abstract streamChat(request: LLMChatRequest): AsyncGenerator<StreamChunk>;
  abstract checkHealth(): Promise<HealthCheckResult>;

  /**
   * HTTP リクエスト（リトライ付き）
   */
  protected async fetchWithRetry<T>(
    url: string,
    options: RequestInit,
    retries = this.config.maxRetries ?? 3,
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          this.config.timeout,
        );

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw await this.handleHttpError(response);
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error as Error;

        if (!this.isRetryable(error) || attempt === retries) {
          throw error;
        }

        // 指数バックオフ
        const delay = Math.min(1000 * 2 ** attempt, 30000);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * SSE ストリーム処理
   */
  protected async *fetchSSE(
    url: string,
    options: RequestInit,
  ): AsyncGenerator<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.timeout! * 2, // ストリームは長めに
    );

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw await this.handleHttpError(response);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data !== "[DONE]") {
              yield data;
            }
          }
        }
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * HTTPエラーをLLMErrorに変換
   */
  protected async handleHttpError(response: Response): Promise<LLMError> {
    const status = response.status;
    let body: unknown = {};

    try {
      body = await response.json();
    } catch {
      // JSON以外のレスポンス
    }

    const errorMessage =
      (body as { error?: { message?: string } })?.error?.message ??
      response.statusText;

    switch (status) {
      case 401:
      case 403:
        return {
          code: "API_KEY_INVALID",
          message: "APIキーが無効です",
          retryable: false,
        };
      case 404:
        return {
          code: "MODEL_NOT_FOUND",
          message: "モデルが見つかりません",
          retryable: false,
        };
      case 429:
        const retryAfter = response.headers.get("Retry-After");
        return {
          code: "RATE_LIMIT",
          message: "レート制限を超過しました",
          retryable: true,
          retryAfterMs: retryAfter ? parseInt(retryAfter) * 1000 : 60000,
        };
      case 500:
      case 502:
      case 503:
        return {
          code: "SERVICE_UNAVAILABLE",
          message: "サービスが一時的に利用できません",
          retryable: true,
        };
      default:
        return {
          code: "UNKNOWN",
          message: errorMessage,
          retryable: false,
        };
    }
  }

  /**
   * リトライ可能なエラーか判定
   */
  protected isRetryable(error: unknown): boolean {
    if (error instanceof DOMException && error.name === "AbortError") {
      return true; // タイムアウト
    }
    if (error instanceof TypeError) {
      return true; // ネットワークエラー
    }
    if (typeof error === "object" && error !== null && "retryable" in error) {
      return (error as { retryable: boolean }).retryable;
    }
    return false;
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## 4. プロバイダー別アダプター

### 4.1 OpenAIAdapter

```typescript
// apps/desktop/src/main/adapters/llm/openai.ts
import { BaseLLMAdapter } from "./base";
import type { StreamChunk, LLMAdapterConfig } from "./types";
import type {
  LLMChatRequest,
  LLMChatResponse,
  HealthCheckResult,
} from "@repo/shared/types/llm/schemas";

interface OpenAIChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export class OpenAIAdapter extends BaseLLMAdapter {
  readonly providerId = "openai" as const;

  private readonly baseUrl: string;

  constructor(config: LLMAdapterConfig) {
    super(config);
    this.baseUrl = config.baseUrl ?? "https://api.openai.com/v1";
  }

  async sendChat(request: LLMChatRequest): Promise<LLMChatResponse> {
    try {
      const response = await this.fetchWithRetry<OpenAIChatCompletionResponse>(
        `${this.baseUrl}/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            model: request.modelId,
            messages: this.formatMessages(request),
            temperature: request.temperature,
            max_tokens: request.maxTokens,
            stream: false,
          }),
        },
      );

      return {
        success: true,
        data: {
          content: response.choices[0]?.message.content ?? "",
          model: response.model,
          usage: {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
          },
          finishReason: response.choices[0]?.finish_reason,
        },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async *streamChat(request: LLMChatRequest): AsyncGenerator<StreamChunk> {
    const stream = this.fetchSSE(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: request.modelId,
        messages: this.formatMessages(request),
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        stream: true,
      }),
    });

    for await (const data of stream) {
      try {
        const chunk = JSON.parse(data) as OpenAIStreamChunk;
        const choice = chunk.choices[0];

        yield {
          id: chunk.id,
          delta: choice?.delta.content ?? "",
          done: choice?.finish_reason !== null,
          metadata: {
            model: chunk.model,
            finishReason: choice?.finish_reason ?? undefined,
          },
        };
      } catch {
        // パースエラーは無視
      }
    }
  }

  async checkHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      await this.fetchWithRetry<{ data: unknown[] }>(
        `${this.baseUrl}/models`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        },
        0, // リトライなし
      );

      return {
        status: "connected",
        providerId: this.providerId,
        latency: Date.now() - startTime,
        checkedAt: new Date(),
      };
    } catch (error) {
      return {
        status: "error",
        providerId: this.providerId,
        errorMessage:
          error instanceof Error ? error.message : "ヘルスチェック失敗",
        checkedAt: new Date(),
      };
    }
  }

  private formatMessages(request: LLMChatRequest) {
    const messages = [];

    if (request.systemPrompt) {
      messages.push({
        role: "system",
        content: request.systemPrompt,
      });
    }

    messages.push(
      ...request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    );

    return messages;
  }

  private handleError(error: unknown): LLMChatResponse {
    if (typeof error === "object" && error !== null && "code" in error) {
      return { success: false, error: error as LLMError };
    }

    return {
      success: false,
      error: {
        code: "UNKNOWN",
        message: error instanceof Error ? error.message : "不明なエラー",
        retryable: false,
      },
    };
  }
}
```

### 4.2 AnthropicAdapter

```typescript
// apps/desktop/src/main/adapters/llm/anthropic.ts
import { BaseLLMAdapter } from "./base";
import type { StreamChunk, LLMAdapterConfig } from "./types";
import type {
  LLMChatRequest,
  LLMChatResponse,
  HealthCheckResult,
} from "@repo/shared/types/llm/schemas";

interface AnthropicMessageResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class AnthropicAdapter extends BaseLLMAdapter {
  readonly providerId = "anthropic" as const;

  private readonly baseUrl: string;
  private readonly apiVersion = "2023-06-01";

  constructor(config: LLMAdapterConfig) {
    super(config);
    this.baseUrl = config.baseUrl ?? "https://api.anthropic.com/v1";
  }

  async sendChat(request: LLMChatRequest): Promise<LLMChatResponse> {
    try {
      const response = await this.fetchWithRetry<AnthropicMessageResponse>(
        `${this.baseUrl}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.config.apiKey,
            "anthropic-version": this.apiVersion,
          },
          body: JSON.stringify({
            model: request.modelId,
            system: request.systemPrompt,
            messages: request.messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            max_tokens: request.maxTokens ?? 4096,
            temperature: request.temperature,
          }),
        },
      );

      const textContent = response.content.find((c) => c.type === "text");

      return {
        success: true,
        data: {
          content: textContent?.text ?? "",
          model: response.model,
          usage: {
            promptTokens: response.usage.input_tokens,
            completionTokens: response.usage.output_tokens,
          },
          finishReason: response.stop_reason,
        },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async *streamChat(request: LLMChatRequest): AsyncGenerator<StreamChunk> {
    const stream = this.fetchSSE(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": this.apiVersion,
      },
      body: JSON.stringify({
        model: request.modelId,
        system: request.systemPrompt,
        messages: request.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: request.maxTokens ?? 4096,
        temperature: request.temperature,
        stream: true,
      }),
    });

    for await (const data of stream) {
      try {
        const event = JSON.parse(data);

        if (event.type === "content_block_delta") {
          yield {
            id: event.index?.toString() ?? "0",
            delta: event.delta?.text ?? "",
            done: false,
          };
        } else if (event.type === "message_stop") {
          yield {
            id: "end",
            delta: "",
            done: true,
          };
        }
      } catch {
        // パースエラーは無視
      }
    }
  }

  async checkHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Anthropicは専用のヘルスエンドポイントがないため、
      // 最小限のメッセージリクエストで確認
      await this.fetchWithRetry<AnthropicMessageResponse>(
        `${this.baseUrl}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": this.config.apiKey,
            "anthropic-version": this.apiVersion,
          },
          body: JSON.stringify({
            model: "claude-3-haiku-20240307", // 最安モデル
            messages: [{ role: "user", content: "Hi" }],
            max_tokens: 1,
          }),
        },
        0,
      );

      return {
        status: "connected",
        providerId: this.providerId,
        latency: Date.now() - startTime,
        checkedAt: new Date(),
      };
    } catch (error) {
      return {
        status: "error",
        providerId: this.providerId,
        errorMessage:
          error instanceof Error ? error.message : "ヘルスチェック失敗",
        checkedAt: new Date(),
      };
    }
  }

  private handleError(error: unknown): LLMChatResponse {
    if (typeof error === "object" && error !== null && "code" in error) {
      return { success: false, error: error as LLMError };
    }

    return {
      success: false,
      error: {
        code: "UNKNOWN",
        message: error instanceof Error ? error.message : "不明なエラー",
        retryable: false,
      },
    };
  }
}
```

### 4.3 GoogleAdapter

```typescript
// apps/desktop/src/main/adapters/llm/google.ts
import { BaseLLMAdapter } from "./base";
import type { StreamChunk, LLMAdapterConfig } from "./types";
import type {
  LLMChatRequest,
  LLMChatResponse,
  HealthCheckResult,
} from "@repo/shared/types/llm/schemas";

interface GeminiGenerateContentResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GoogleAdapter extends BaseLLMAdapter {
  readonly providerId = "google" as const;

  private readonly baseUrl: string;

  constructor(config: LLMAdapterConfig) {
    super(config);
    this.baseUrl =
      config.baseUrl ?? "https://generativelanguage.googleapis.com/v1";
  }

  async sendChat(request: LLMChatRequest): Promise<LLMChatResponse> {
    try {
      const response = await this.fetchWithRetry<GeminiGenerateContentResponse>(
        `${this.baseUrl}/models/${request.modelId}:generateContent?key=${this.config.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: this.formatContents(request),
            generationConfig: {
              temperature: request.temperature,
              maxOutputTokens: request.maxTokens,
            },
          }),
        },
      );

      const content = response.candidates[0]?.content.parts[0]?.text ?? "";

      return {
        success: true,
        data: {
          content,
          model: request.modelId,
          usage: {
            promptTokens: response.usageMetadata.promptTokenCount,
            completionTokens: response.usageMetadata.candidatesTokenCount,
          },
          finishReason: response.candidates[0]?.finishReason,
        },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async *streamChat(request: LLMChatRequest): AsyncGenerator<StreamChunk> {
    const stream = this.fetchSSE(
      `${this.baseUrl}/models/${request.modelId}:streamGenerateContent?key=${this.config.apiKey}&alt=sse`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: this.formatContents(request),
          generationConfig: {
            temperature: request.temperature,
            maxOutputTokens: request.maxTokens,
          },
        }),
      },
    );

    for await (const data of stream) {
      try {
        const chunk = JSON.parse(data) as GeminiGenerateContentResponse;
        const text = chunk.candidates[0]?.content.parts[0]?.text ?? "";

        yield {
          id: Date.now().toString(),
          delta: text,
          done: chunk.candidates[0]?.finishReason !== undefined,
          metadata: {
            model: request.modelId,
            finishReason: chunk.candidates[0]?.finishReason,
          },
        };
      } catch {
        // パースエラーは無視
      }
    }
  }

  async checkHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      await this.fetchWithRetry<{ models: unknown[] }>(
        `${this.baseUrl}/models?key=${this.config.apiKey}`,
        { method: "GET" },
        0,
      );

      return {
        status: "connected",
        providerId: this.providerId,
        latency: Date.now() - startTime,
        checkedAt: new Date(),
      };
    } catch (error) {
      return {
        status: "error",
        providerId: this.providerId,
        errorMessage:
          error instanceof Error ? error.message : "ヘルスチェック失敗",
        checkedAt: new Date(),
      };
    }
  }

  private formatContents(request: LLMChatRequest) {
    const contents = [];

    if (request.systemPrompt) {
      contents.push({
        role: "user",
        parts: [{ text: `System: ${request.systemPrompt}` }],
      });
    }

    contents.push(
      ...request.messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    );

    return contents;
  }

  private handleError(error: unknown): LLMChatResponse {
    if (typeof error === "object" && error !== null && "code" in error) {
      return { success: false, error: error as LLMError };
    }

    return {
      success: false,
      error: {
        code: "UNKNOWN",
        message: error instanceof Error ? error.message : "不明なエラー",
        retryable: false,
      },
    };
  }
}
```

### 4.4 xAIAdapter

```typescript
// apps/desktop/src/main/adapters/llm/xai.ts
import { BaseLLMAdapter } from "./base";
import type { StreamChunk, LLMAdapterConfig } from "./types";
import type {
  LLMChatRequest,
  LLMChatResponse,
  HealthCheckResult,
} from "@repo/shared/types/llm/schemas";

// xAIのAPIはOpenAI互換のため、同様の型定義を使用
interface XAIChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class XAIAdapter extends BaseLLMAdapter {
  readonly providerId = "xai" as const;

  private readonly baseUrl: string;

  constructor(config: LLMAdapterConfig) {
    super(config);
    this.baseUrl = config.baseUrl ?? "https://api.x.ai/v1";
  }

  async sendChat(request: LLMChatRequest): Promise<LLMChatResponse> {
    try {
      const response = await this.fetchWithRetry<XAIChatCompletionResponse>(
        `${this.baseUrl}/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            model: request.modelId,
            messages: this.formatMessages(request),
            temperature: request.temperature,
            max_tokens: request.maxTokens,
            stream: false,
          }),
        },
      );

      return {
        success: true,
        data: {
          content: response.choices[0]?.message.content ?? "",
          model: response.model,
          usage: {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
          },
          finishReason: response.choices[0]?.finish_reason,
        },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async *streamChat(request: LLMChatRequest): AsyncGenerator<StreamChunk> {
    const stream = this.fetchSSE(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: request.modelId,
        messages: this.formatMessages(request),
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        stream: true,
      }),
    });

    for await (const data of stream) {
      try {
        const chunk = JSON.parse(data);
        const choice = chunk.choices[0];

        yield {
          id: chunk.id,
          delta: choice?.delta?.content ?? "",
          done: choice?.finish_reason !== null,
          metadata: {
            model: chunk.model,
            finishReason: choice?.finish_reason ?? undefined,
          },
        };
      } catch {
        // パースエラーは無視
      }
    }
  }

  async checkHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      await this.fetchWithRetry<{ data: unknown[] }>(
        `${this.baseUrl}/models`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        },
        0,
      );

      return {
        status: "connected",
        providerId: this.providerId,
        latency: Date.now() - startTime,
        checkedAt: new Date(),
      };
    } catch (error) {
      return {
        status: "error",
        providerId: this.providerId,
        errorMessage:
          error instanceof Error ? error.message : "ヘルスチェック失敗",
        checkedAt: new Date(),
      };
    }
  }

  private formatMessages(request: LLMChatRequest) {
    const messages = [];

    if (request.systemPrompt) {
      messages.push({
        role: "system",
        content: request.systemPrompt,
      });
    }

    messages.push(
      ...request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    );

    return messages;
  }

  private handleError(error: unknown): LLMChatResponse {
    if (typeof error === "object" && error !== null && "code" in error) {
      return { success: false, error: error as LLMError };
    }

    return {
      success: false,
      error: {
        code: "UNKNOWN",
        message: error instanceof Error ? error.message : "不明なエラー",
        retryable: false,
      },
    };
  }
}
```

---

## 5. LLMAdapterFactory

### 5.1 実装

```typescript
// apps/desktop/src/main/adapters/llm/factory.ts
import type { LLMProviderId } from "@repo/shared/types/llm/schemas";
import type { ILLMAdapter, LLMAdapterConfig } from "./types";
import { OpenAIAdapter } from "./openai";
import { AnthropicAdapter } from "./anthropic";
import { GoogleAdapter } from "./google";
import { XAIAdapter } from "./xai";
import { SecureStorage } from "../../services/secure-storage";

type AdapterFactory = (config: LLMAdapterConfig) => ILLMAdapter;

class LLMAdapterFactoryImpl {
  private readonly factories = new Map<LLMProviderId, AdapterFactory>();
  private readonly instances = new Map<LLMProviderId, ILLMAdapter>();

  constructor() {
    // デフォルトアダプターを登録
    this.register("openai", (config) => new OpenAIAdapter(config));
    this.register("anthropic", (config) => new AnthropicAdapter(config));
    this.register("google", (config) => new GoogleAdapter(config));
    this.register("xai", (config) => new XAIAdapter(config));
  }

  /**
   * アダプターファクトリを登録
   */
  register(providerId: LLMProviderId, factory: AdapterFactory): void {
    this.factories.set(providerId, factory);
    // 既存インスタンスをクリア（再登録時用）
    this.instances.delete(providerId);
  }

  /**
   * アダプターインスタンスを取得
   * シングルトンパターン（APIキー変更時は clearInstance() を呼ぶ）
   */
  async getAdapter(providerId: LLMProviderId): Promise<ILLMAdapter> {
    // キャッシュ確認
    const cached = this.instances.get(providerId);
    if (cached) {
      return cached;
    }

    // ファクトリ取得
    const factory = this.factories.get(providerId);
    if (!factory) {
      throw new Error(`Unknown provider: ${providerId}`);
    }

    // APIキー取得
    const apiKey = await SecureStorage.get(`llm.${providerId}.apiKey`);
    if (!apiKey) {
      throw {
        code: "API_KEY_MISSING",
        message: `${providerId}のAPIキーが設定されていません`,
        retryable: false,
      };
    }

    // インスタンス生成
    const config: LLMAdapterConfig = {
      apiKey,
      timeout: 30000,
      maxRetries: 3,
    };

    const adapter = factory(config);
    this.instances.set(providerId, adapter);

    return adapter;
  }

  /**
   * キャッシュをクリア（APIキー変更時）
   */
  clearInstance(providerId: LLMProviderId): void {
    this.instances.delete(providerId);
  }

  /**
   * 全キャッシュをクリア
   */
  clearAllInstances(): void {
    this.instances.clear();
  }
}

export const LLMAdapterFactory = new LLMAdapterFactoryImpl();
```

---

## 6. テスト設計

### 6.1 アダプターテスト

```typescript
// apps/desktop/src/main/adapters/llm/__tests__/openai.test.ts
describe("OpenAIAdapter", () => {
  const mockConfig: LLMAdapterConfig = {
    apiKey: "test-api-key",
    timeout: 5000,
    maxRetries: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendChat", () => {
    it("正常なリクエストで成功レスポンスを返す", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "chatcmpl-123",
            choices: [
              { message: { content: "Hello!" }, finish_reason: "stop" },
            ],
            usage: { prompt_tokens: 10, completion_tokens: 5 },
            model: "gpt-4o",
          }),
      });

      const adapter = new OpenAIAdapter(mockConfig);
      const result = await adapter.sendChat({
        messages: [{ role: "user", content: "Hi" }],
        modelId: "gpt-4o",
      });

      expect(result.success).toBe(true);
      expect(result.data?.content).toBe("Hello!");
    });

    it("401エラーでAPI_KEY_INVALIDを返す", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: "Invalid API key" } }),
      });

      const adapter = new OpenAIAdapter(mockConfig);
      const result = await adapter.sendChat({
        messages: [{ role: "user", content: "Hi" }],
        modelId: "gpt-4o",
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("API_KEY_INVALID");
    });
  });

  describe("checkHealth", () => {
    it("正常接続時にconnectedステータスを返す", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      const adapter = new OpenAIAdapter(mockConfig);
      const result = await adapter.checkHealth();

      expect(result.status).toBe("connected");
      expect(result.latency).toBeGreaterThanOrEqual(0);
    });
  });
});
```

### 6.2 ファクトリテスト

```typescript
// apps/desktop/src/main/adapters/llm/__tests__/factory.test.ts
describe("LLMAdapterFactory", () => {
  beforeEach(() => {
    LLMAdapterFactory.clearAllInstances();
    vi.mocked(SecureStorage.get).mockReset();
  });

  it("OpenAIアダプターを取得できる", async () => {
    vi.mocked(SecureStorage.get).mockResolvedValue("test-api-key");

    const adapter = await LLMAdapterFactory.getAdapter("openai");

    expect(adapter.providerId).toBe("openai");
  });

  it("APIキー未設定でエラーをスロー", async () => {
    vi.mocked(SecureStorage.get).mockResolvedValue(null);

    await expect(LLMAdapterFactory.getAdapter("openai")).rejects.toMatchObject({
      code: "API_KEY_MISSING",
    });
  });

  it("未知のプロバイダーでエラーをスロー", async () => {
    await expect(
      LLMAdapterFactory.getAdapter("unknown" as LLMProviderId),
    ).rejects.toThrow("Unknown provider");
  });

  it("同じプロバイダーはキャッシュされる", async () => {
    vi.mocked(SecureStorage.get).mockResolvedValue("test-api-key");

    const adapter1 = await LLMAdapterFactory.getAdapter("openai");
    const adapter2 = await LLMAdapterFactory.getAdapter("openai");

    expect(adapter1).toBe(adapter2);
  });
});
```

---

## 7. ファイル構成

```
apps/desktop/src/main/adapters/llm/
├── index.ts              # エクスポート
├── types.ts              # 型定義（ILLMAdapter, StreamChunk等）
├── base.ts               # BaseLLMAdapter 基底クラス
├── factory.ts            # LLMAdapterFactory
├── openai.ts             # OpenAIAdapter
├── anthropic.ts          # AnthropicAdapter
├── google.ts             # GoogleAdapter
├── xai.ts                # xAIAdapter
└── __tests__/
    ├── openai.test.ts
    ├── anthropic.test.ts
    ├── google.test.ts
    ├── xai.test.ts
    └── factory.test.ts
```
