/**
 * AnthropicProvider - Anthropic Claude API への直接呼び出しを担う (TASK-UT-9I-001)
 *
 * LLMClient から委譲され、@anthropic-ai/sdk を使用して messages.create() を実行する。
 * HTTP エラーコードを DocErrorCode に変換する責務を持つ。
 */
import Anthropic, { APIError } from "@anthropic-ai/sdk";
import log from "electron-log";
import type { DocErrorCode } from "../LLMClient";

export interface AnthropicProviderConfig {
  apiKey: string;
  model: string;
  timeoutMs: number;
}

export interface AnthropicProviderResult {
  success: true;
  content: string;
}

export interface AnthropicProviderError {
  success: false;
  errorCode: DocErrorCode;
  message: string;
}

export type AnthropicResult = AnthropicProviderResult | AnthropicProviderError;

const MAX_TOKENS = 4_096;

export class AnthropicProvider {
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(config: AnthropicProviderConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
      maxRetries: 0,
      timeout: config.timeoutMs,
    });
    this.model = config.model;
  }

  async call(prompt: string): Promise<AnthropicResult> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: MAX_TOKENS,
        messages: [{ role: "user", content: prompt }],
      });

      const textBlock = response.content.find((block) => block.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        return {
          success: false,
          errorCode: "INTERNAL_ERROR",
          message: "内部エラーが発生しました。",
        };
      }

      return { success: true, content: textBlock.text };
    } catch (error) {
      return this.mapError(error);
    }
  }

  private mapError(error: unknown): AnthropicProviderError {
    if (error instanceof APIError) {
      log.error(
        "[AnthropicProvider] API error:",
        error.status,
        sanitizeErrorMessage(error.message),
      );
      return this.mapApiError(error);
    }

    if (error instanceof Error) {
      if (isTimeoutError(error)) {
        log.error(
          "[AnthropicProvider] Timeout error:",
          sanitizeErrorMessage(error.message),
        );
        return {
          success: false,
          errorCode: "TIMEOUT",
          message: "タイムアウトしました。再試行してください。",
        };
      }

      if (isNetworkError(error)) {
        log.error(
          "[AnthropicProvider] Network error:",
          sanitizeErrorMessage(error.message),
        );
        return {
          success: false,
          errorCode: "NETWORK_ERROR",
          message: "ネットワークエラーが発生しました。接続を確認してください。",
        };
      }
    }

    log.error(
      "[AnthropicProvider] Unexpected error:",
      sanitizeErrorMessage(error),
    );
    return {
      success: false,
      errorCode: "INTERNAL_ERROR",
      message: "内部エラーが発生しました。",
    };
  }

  private mapApiError(error: APIError): AnthropicProviderError {
    switch (error.status) {
      case 401:
      case 403:
        return {
          success: false,
          errorCode: "API_KEY_INVALID",
          message: "APIキーが無効です。正しいAPIキーを設定してください。",
        };
      case 429:
        return {
          success: false,
          errorCode: "RATE_LIMIT",
          message:
            "リクエスト制限に達しました。しばらく待ってから再試行してください。",
        };
      case 500:
      case 502:
      case 503:
      case 529:
        return {
          success: false,
          errorCode: "SERVER_ERROR",
          message: "サーバーエラーが発生しました。再試行してください。",
        };
      default:
        return {
          success: false,
          errorCode: "INTERNAL_ERROR",
          message: "内部エラーが発生しました。",
        };
    }
  }
}

function isTimeoutError(error: Error): boolean {
  const name = error.name ?? "";
  const message = error.message ?? "";
  return (
    name === "APIConnectionTimeoutError" ||
    /timeout|timed out|ETIMEDOUT/i.test(message)
  );
}

function isNetworkError(error: Error): boolean {
  const name = error.name ?? "";
  const message = error.message ?? "";
  return (
    name === "APIConnectionError" ||
    /ECONNREFUSED|ENOTFOUND|ECONNRESET|ECONNABORTED|fetch failed|network/i.test(
      message,
    )
  );
}

function sanitizeErrorMessage(value: unknown): string {
  const message =
    typeof value === "string"
      ? value
      : value instanceof Error
        ? value.message
        : String(value ?? "");

  return message
    .replace(/\n\s+at\s+.*/g, "")
    .replace(/(Bearer\s+)[A-Za-z0-9._-]+/gi, "$1***")
    .replace(/(sk-ant-[A-Za-z0-9_-]{8,})/g, "sk-ant-***")
    .replace(/(api[_-]?key\s*[:=]\s*)[A-Za-z0-9._-]+/gi, "$1***")
    .trim();
}
