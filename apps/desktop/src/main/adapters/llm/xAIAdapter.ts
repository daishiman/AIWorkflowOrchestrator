/**
 * @file xAIAdapter
 * @description xAI (Grok) API用アダプター実装
 * @feature chat-multi-llm-switching
 *
 * xAIのAPIはOpenAI互換のため、同様のリクエスト/レスポンス形式を使用
 */

import { BaseLLMAdapter } from "./BaseLLMAdapter";
import type {
  StreamChunk,
  LLMAdapterConfig,
  AdapterChatResponse,
} from "./types";
import type {
  LLMChatRequestInput,
  HealthCheckResult,
} from "@repo/shared/types/llm/schemas";

/**
 * xAI Chat Completion APIレスポンス型（OpenAI互換）
 */
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

/**
 * xAI Stream Chunk型（OpenAI互換）
 */
interface XAIStreamChunk {
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
 * xAI (Grok) APIアダプター
 */
export class xAIAdapter extends BaseLLMAdapter {
  readonly providerId = "xai" as const;

  private readonly baseUrl: string;

  constructor(
    apiKey: string,
    config?: Partial<Omit<LLMAdapterConfig, "apiKey">>,
  ) {
    super(apiKey, config);
    this.baseUrl = config?.baseUrl ?? "https://api.x.ai/v1";
  }

  /**
   * チャットメッセージ送信（非ストリーミング）
   */
  async sendChat(request: LLMChatRequestInput): Promise<AdapterChatResponse> {
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
        const chunk = JSON.parse(data) as XAIStreamChunk;
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
   * メッセージをxAI API形式に変換（OpenAI互換）
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
