/**
 * @file GoogleAdapter
 * @description Google Gemini API用アダプター実装
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
 * Gemini GenerateContent APIレスポンス型
 */
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

/**
 * Google Gemini APIアダプター
 */
export class GoogleAdapter extends BaseLLMAdapter {
  readonly providerId = "google" as const;

  private readonly baseUrl: string;

  constructor(
    apiKey: string,
    config?: Partial<Omit<LLMAdapterConfig, "apiKey">>,
  ) {
    super(apiKey, config);
    this.baseUrl =
      config?.baseUrl ?? "https://generativelanguage.googleapis.com/v1";
  }

  /**
   * チャットメッセージ送信（非ストリーミング）
   */
  async sendChat(request: LLMChatRequestInput): Promise<AdapterChatResponse> {
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
        content,
        model: request.modelId,
        usage: {
          promptTokens: response.usageMetadata.promptTokenCount,
          completionTokens: response.usageMetadata.candidatesTokenCount,
          totalTokens: response.usageMetadata.totalTokenCount,
        },
        finishReason: response.candidates[0]?.finishReason,
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
   */
  async *streamChat(request: LLMChatRequestInput): AsyncGenerator<StreamChunk> {
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

    let chunkIndex = 0;

    for await (const data of stream) {
      try {
        const chunk = JSON.parse(data) as GeminiGenerateContentResponse;
        const text = chunk.candidates[0]?.content.parts[0]?.text ?? "";
        const finishReason = chunk.candidates[0]?.finishReason;

        yield {
          id: `chunk-${chunkIndex++}`,
          delta: {
            content: text,
          },
          done: finishReason !== undefined && finishReason !== null,
          metadata: {
            model: request.modelId,
            finishReason: finishReason ?? undefined,
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
      await this.fetchWithRetry<{ models: unknown[] }>(
        `${this.baseUrl}/models?key=${this.config.apiKey}`,
        { method: "GET" },
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
   * メッセージをGemini API形式に変換
   */
  private formatContents(request: LLMChatRequestInput) {
    const contents: Array<{
      role: string;
      parts: Array<{ text: string }>;
    }> = [];

    // Geminiはsystem roleを直接サポートしないため、
    // userロールでシステムプロンプトを追加
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
}
