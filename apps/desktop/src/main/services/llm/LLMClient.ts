/**
 * LLMClient - LLM プロバイダへのクエリ Facade (TASK-UT-9I-001)
 *
 * AnthropicProvider をラップし、タイムアウト・指数バックオフリトライを提供する。
 * DI 可能なインターフェースとして ILLMClient を公開する。
 */
import log from "electron-log";
import {
  AnthropicProvider,
  type AnthropicProviderConfig,
} from "./providers/AnthropicProvider";

export type DocErrorCode =
  | "API_KEY_MISSING"
  | "API_KEY_INVALID"
  | "RATE_LIMIT"
  | "SERVER_ERROR"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "INTERNAL_ERROR";

export type LLMQueryResult =
  | { success: true; content: string }
  | {
      success: false;
      errorCode: DocErrorCode;
      message: string;
      retryable: boolean;
    };

export interface ILLMClient {
  query(prompt: string): Promise<LLMQueryResult>;
}

export interface LLMClientConfig {
  apiKey: string | null | undefined;
  model: string;
  timeoutMs: number;
  maxRetries: number;
}

const RETRYABLE_CODES: DocErrorCode[] = [
  "RATE_LIMIT",
  "SERVER_ERROR",
  "TIMEOUT",
  "NETWORK_ERROR",
];

const RETRY_BASE_DELAY_MS = 1_000;

export class LLMClient implements ILLMClient {
  private readonly config: LLMClientConfig;

  constructor(config: LLMClientConfig) {
    this.config = config;
  }

  async query(prompt: string): Promise<LLMQueryResult> {
    const { apiKey, model, timeoutMs, maxRetries } = this.config;

    if (!apiKey || apiKey.trim() === "") {
      return {
        success: false,
        errorCode: "API_KEY_MISSING",
        message:
          "APIキーが設定されていません。設定画面でAPIキーを入力してください。",
        retryable: false,
      };
    }

    const provider = new AnthropicProvider({
      apiKey,
      model,
      timeoutMs,
    } satisfies AnthropicProviderConfig);

    let lastResult: LLMQueryResult | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) {
        const delayMs = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
        log.info(
          `[LLMClient] Retry attempt ${attempt}/${maxRetries}, waiting ${delayMs}ms`,
        );
        await sleep(delayMs);
      }

      const result = await this.callWithTimeout(provider, prompt, timeoutMs);

      if (result.success) {
        return result;
      }

      lastResult = result;

      if (!RETRYABLE_CODES.includes(result.errorCode)) {
        return result;
      }

      if (attempt < maxRetries) {
        log.warn(
          `[LLMClient] Retryable error: ${result.errorCode}, attempt ${attempt + 1}/${maxRetries}`,
        );
      }
    }

    return lastResult!;
  }

  private async callWithTimeout(
    provider: AnthropicProvider,
    prompt: string,
    timeoutMs: number,
  ): Promise<LLMQueryResult> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const timeoutPromise = new Promise<LLMQueryResult>((resolve) => {
      timeoutId = setTimeout(() => {
        resolve({
          success: false,
          errorCode: "TIMEOUT",
          message: "タイムアウトしました。再試行してください。",
          retryable: true,
        });
      }, timeoutMs);
    });

    const callPromise = provider.call(prompt).then((result) => {
      if (result.success) {
        return result as LLMQueryResult;
      }
      return {
        success: false as const,
        errorCode: result.errorCode,
        message: result.message,
        retryable: RETRYABLE_CODES.includes(result.errorCode),
      };
    });

    try {
      return await Promise.race([callPromise, timeoutPromise]);
    } finally {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
