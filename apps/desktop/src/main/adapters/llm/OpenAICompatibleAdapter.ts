/**
 * @file OpenAICompatibleAdapter
 * @description OpenAI互換API用の汎用アダプター実装
 * @feature chat-multi-llm-switching
 *
 * OpenAI Chat Completions API互換のプロバイダー（OpenAI, xAI, OpenRouter等）を
 * 設定駆動で統一的にサポートする。個別のアダプタークラスは不要。
 */

import { BaseLLMAdapter } from "./BaseLLMAdapter";
import type {
  StreamChunk,
  LLMAdapterConfig,
  AdapterChatResponse,
} from "./types";
import type {
  LLMProviderId,
  LLMChatRequestInput,
  HealthCheckResult,
} from "@repo/shared/types/llm/schemas";

/**
 * OpenAI互換プロバイダーの設定
 */
export interface OpenAICompatibleProviderConfig {
  /** プロバイダーID */
  providerId: LLMProviderId;
  /** デフォルトのベースURL */
  defaultBaseUrl: string;
  /** 追加HTTPヘッダー（OpenRouterのHTTP-Referer等） */
  extraHeaders?: Record<string, string>;
}

/**
 * OpenAI Chat Completion APIレスポンス型
 */
interface ChatCompletionResponse {
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

/**
 * OpenAI互換 Stream Chunk型
 */
interface StreamChunkResponse {
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

/**
 * OpenAI互換APIアダプター
 *
 * OpenAI, xAI, OpenRouter等のOpenAI Chat Completions API互換プロバイダーを
 * 設定のみで差し替え可能にする統一アダプター。
 */
export class OpenAICompatibleAdapter extends BaseLLMAdapter {
  readonly providerId: LLMProviderId;

  private readonly baseUrl: string;
  private readonly extraHeaders: Record<string, string>;

  constructor(
    providerConfig: OpenAICompatibleProviderConfig,
    apiKey: string,
    config?: Partial<Omit<LLMAdapterConfig, "apiKey">>,
  ) {
    super(apiKey, config);
    this.providerId = providerConfig.providerId;
    this.baseUrl = config?.baseUrl ?? providerConfig.defaultBaseUrl;
    this.extraHeaders = providerConfig.extraHeaders ?? {};
  }

  /**
   * チャットメッセージ送信（非ストリーミング）
   */
  async sendChat(request: LLMChatRequestInput): Promise<AdapterChatResponse> {
    try {
      const response = await this.fetchWithRetry<ChatCompletionResponse>(
        `${this.baseUrl}/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.apiKey}`,
            ...this.extraHeaders,
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
        content: response.choices[0]?.message.content ?? "",
        model: response.model,
        usage: {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        },
        finishReason: response.choices[0]?.finish_reason,
      };
    } catch (error) {
      if (this.isLLMError(error)) {
        throw error;
      }
      throw this.handleNetworkError(error);
    }
  }

  /**
   * ストリーミングチャット
   * @param request チャットリクエスト
   * @param signal オプションのAbortSignal（キャンセル用）
   */
  async *streamChat(
    request: LLMChatRequestInput,
    signal?: AbortSignal,
  ): AsyncGenerator<StreamChunk> {
    const stream = this.fetchSSE(
      `${this.baseUrl}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
          ...this.extraHeaders,
        },
        body: JSON.stringify({
          model: request.modelId,
          messages: this.formatMessages(request),
          temperature: request.temperature,
          max_tokens: request.maxTokens,
          stream: true,
        }),
      },
      signal,
    );

    for await (const data of stream) {
      try {
        const chunk = JSON.parse(data) as StreamChunkResponse;
        const choice = chunk.choices[0];

        yield {
          id: chunk.id,
          delta: {
            content: choice?.delta?.content ?? undefined,
            role: choice?.delta?.role ?? undefined,
          },
          done: choice?.finish_reason !== null,
          metadata: {
            model: chunk.model,
            finishReason: choice?.finish_reason ?? undefined,
          },
        };
      } catch {
        // JSONパースエラーは無視
      }
    }
  }

  /**
   * ヘルスチェック
   */
  async checkHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      await this.fetchWithRetry<{ data: unknown[] }>(
        `${this.baseUrl}/models`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            ...this.extraHeaders,
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

  /**
   * メッセージをOpenAI互換API形式に変換
   */
  private formatMessages(request: LLMChatRequestInput) {
    const messages: Array<{ role: string; content: string }> = [];

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
}
