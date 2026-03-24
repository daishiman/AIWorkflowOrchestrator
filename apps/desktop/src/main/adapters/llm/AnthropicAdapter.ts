/**
 * @file AnthropicAdapter
 * @description Anthropic Claude API用アダプター実装
 * @feature chat-multi-llm-switching
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
 * Anthropic Messages APIレスポンス型
 */
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

/**
 * Anthropic Stream Event型
 */
interface AnthropicStreamEvent {
  type: string;
  index?: number;
  delta?: {
    type?: string;
    text?: string;
  };
  message?: {
    usage?: {
      input_tokens: number;
      output_tokens: number;
    };
  };
}

/**
 * Anthropic Claude APIアダプター
 */
export class AnthropicAdapter extends BaseLLMAdapter {
  readonly providerId = "anthropic" as const;

  private readonly baseUrl: string;
  private readonly apiVersion = "2023-06-01";

  constructor(
    apiKey: string,
    config?: Partial<Omit<LLMAdapterConfig, "apiKey">>,
  ) {
    super(apiKey, config);
    this.baseUrl = config?.baseUrl ?? "https://api.anthropic.com/v1";
  }

  /**
   * チャットメッセージ送信（非ストリーミング）
   */
  async sendChat(request: LLMChatRequestInput): Promise<AdapterChatResponse> {
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
      const totalTokens =
        response.usage.input_tokens + response.usage.output_tokens;

      return {
        content: textContent?.text ?? "",
        model: response.model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens,
        },
        finishReason: response.stop_reason,
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
          stream: true,
        }),
      },
      signal,
    );

    let chunkIndex = 0;

    for await (const data of stream) {
      try {
        const event = JSON.parse(data) as AnthropicStreamEvent;

        if (event.type === "content_block_delta" && event.delta?.text) {
          yield {
            id: `chunk-${chunkIndex++}`,
            delta: {
              content: event.delta.text,
            },
            done: false,
            metadata: {
              model: request.modelId,
            },
          };
        } else if (event.type === "message_stop") {
          yield {
            id: `chunk-${chunkIndex}`,
            delta: {},
            done: true,
            metadata: {
              model: request.modelId,
              finishReason: "stop",
            },
          };
        }
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
            model: "claude-haiku-4-5", // 最安・最速モデル
            messages: [{ role: "user", content: "Hi" }],
            max_tokens: 1,
          }),
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
}
