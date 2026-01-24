/**
 * @file LLMアダプター基底クラス
 * @description 共通機能を持つ抽象基底クラス
 * @feature chat-multi-llm-switching
 */

import type {
  LLMProviderId,
  LLMChatRequestInput,
  HealthCheckResult,
  LLMError,
  LLMErrorCode,
} from "@repo/shared/types/llm/schemas";
import type {
  ILLMAdapter,
  StreamChunk,
  LLMAdapterConfig,
  AdapterChatResponse,
} from "./types";

/**
 * LLMアダプター基底クラス
 * 共通機能（リトライ、SSE処理、エラーハンドリング）を提供
 */
export abstract class BaseLLMAdapter implements ILLMAdapter {
  abstract readonly providerId: LLMProviderId;

  protected readonly config: Required<LLMAdapterConfig>;

  constructor(
    apiKey: string,
    config?: Partial<Omit<LLMAdapterConfig, "apiKey">>,
  ) {
    this.config = {
      apiKey,
      baseUrl: config?.baseUrl ?? "",
      timeout: config?.timeout ?? 30000,
      maxRetries: config?.maxRetries ?? 3,
    };
  }

  abstract sendChat(request: LLMChatRequestInput): Promise<AdapterChatResponse>;
  abstract streamChat(
    request: LLMChatRequestInput,
    signal?: AbortSignal,
  ): AsyncGenerator<StreamChunk>;
  abstract checkHealth(): Promise<HealthCheckResult>;

  /**
   * HTTPリクエスト（リトライ付き）
   */
  protected async fetchWithRetry<T>(
    url: string,
    options: RequestInit,
    retries = this.config.maxRetries,
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

        // LLMErrorの場合はリトライ可能性をチェック
        if (this.isLLMError(error) && !error.retryable) {
          throw error;
        }

        // 最後のリトライでなければ待機
        if (attempt < retries && this.isRetryable(error)) {
          // 指数バックオフ
          const delay = Math.min(1000 * 2 ** attempt, 30000);
          await this.sleep(delay);
        } else if (attempt === retries) {
          throw error;
        }
      }
    }

    throw lastError;
  }

  /**
   * SSEストリーム処理
   * @param url - リクエストURL
   * @param options - fetch オプション
   * @param externalSignal - 外部からのAbortSignal（キャンセル用）
   */
  protected async *fetchSSE(
    url: string,
    options: RequestInit,
    externalSignal?: AbortSignal,
  ): AsyncGenerator<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.timeout * 2, // ストリームは長めに
    );

    // 外部シグナルとの連携（キャンセル伝播）
    const abortHandler = () => controller.abort();
    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort();
      } else {
        externalSignal.addEventListener("abort", abortHandler);
      }
    }

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
        throw this.createLLMError("UNKNOWN", "Response body is not readable");
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
            const data = line.slice(6).trim();
            if (data && data !== "[DONE]") {
              yield data;
            }
          }
        }
      }
    } finally {
      clearTimeout(timeoutId);
      // 外部シグナルのリスナーをクリーンアップ
      if (externalSignal) {
        externalSignal.removeEventListener("abort", abortHandler);
      }
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

    const retryAfterHeader = response.headers.get("Retry-After");
    const retryAfterMs = retryAfterHeader
      ? parseInt(retryAfterHeader, 10) * 1000
      : undefined;

    switch (status) {
      case 401:
      case 403:
        return this.createLLMError(
          "API_KEY_INVALID",
          `APIキーが無効です: ${errorMessage}`,
          false,
        );
      case 404:
        return this.createLLMError(
          "MODEL_NOT_FOUND",
          `モデルが見つかりません: ${errorMessage}`,
          false,
        );
      case 429:
        return this.createLLMError(
          "RATE_LIMIT",
          `レート制限を超過しました: ${errorMessage}`,
          true,
          retryAfterMs,
        );
      case 500:
      case 502:
      case 503:
        return this.createLLMError(
          "SERVICE_UNAVAILABLE",
          `サービスが一時的に利用できません: ${errorMessage}`,
          true,
        );
      default:
        return this.createLLMError(
          "UNKNOWN",
          errorMessage || "不明なエラー",
          false,
        );
    }
  }

  /**
   * ネットワークエラーをLLMErrorに変換
   */
  protected handleNetworkError(error: unknown): LLMError {
    if (error instanceof DOMException && error.name === "AbortError") {
      return this.createLLMError(
        "TIMEOUT",
        "リクエストがタイムアウトしました",
        true,
      );
    }
    if (error instanceof TypeError) {
      return this.createLLMError(
        "NETWORK_ERROR",
        `ネットワークエラー: ${error.message}`,
        true,
      );
    }
    if (this.isLLMError(error)) {
      return error;
    }
    return this.createLLMError(
      "UNKNOWN",
      error instanceof Error ? error.message : "不明なエラー",
      false,
    );
  }

  /**
   * LLMErrorを作成
   */
  protected createLLMError(
    code: LLMErrorCode,
    message: string,
    retryable = false,
    retryAfterMs?: number,
  ): LLMError {
    return {
      code,
      message,
      retryable,
      ...(retryAfterMs !== undefined && { retryAfterMs }),
    };
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
    if (this.isLLMError(error)) {
      return error.retryable;
    }
    return false;
  }

  /**
   * LLMErrorか判定
   */
  protected isLLMError(error: unknown): error is LLMError {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      "message" in error &&
      "retryable" in error
    );
  }

  /**
   * 指定時間待機
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
