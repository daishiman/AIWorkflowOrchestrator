/**
 * @file OpenAIAdapter
 * @description OpenAI API用アダプター実装
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
 * OpenAI Chat Completion APIレスポンス型
 */
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

/**
 * OpenAI Stream Chunk型
 */
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

/**
 * OpenAI APIアダプター
 */
export class OpenAIAdapter extends BaseLLMAdapter {
  readonly providerId = "openai" as const;

  private readonly baseUrl: string;

  constructor(
    apiKey: string,
    config?: Partial<Omit<LLMAdapterConfig, "apiKey">>,
  ) {
    super(apiKey, config);
    this.baseUrl = config?.baseUrl ?? "https://api.openai.com/v1";
  }

  /**
   * チャットメッセージ送信（非ストリーミング）
   */
  async sendChat(request: LLMChatRequestInput): Promise<AdapterChatResponse> {
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
      // LLMErrorをそのままスロー
      if (this.isLLMError(error)) {
        throw error;
      }
      // ネットワークエラーをLLMErrorに変換してスロー
      throw this.handleNetworkError(error);
    }
  }

  /**
   * ストリーミングチャット
   */
  async *streamChat(request: LLMChatRequestInput): AsyncGenerator<StreamChunk> {
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
          delta: {
            content: choice?.delta.content ?? undefined,
            role: choice?.delta.role ?? undefined,
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
   * メッセージをOpenAI API形式に変換
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
