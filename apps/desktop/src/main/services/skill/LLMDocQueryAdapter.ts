/**
 * LLMDocQueryAdapter - LLM プロバイダへのドキュメント生成クエリを実行する
 *
 * AuthKeyService などから API key を取得し、LLMClient を呼び出して
 * skill docs 生成向けの DocOperationResult<string> に正規化して返す。
 */
import log from "electron-log";
import type { DocError, DocOperationResult } from "@repo/shared";
import {
  LLMClient,
  type LLMClientConfig,
  type LLMQueryResult,
} from "../llm/LLMClient";

/** LLM プロバイダへの問い合わせを抽象化するアダプタインターフェース */
export interface ILLMDocQueryAdapter {
  query(prompt: string): Promise<DocOperationResult<string>>;
  isAvailable(): Promise<boolean>;
  getProviderName(): string;
}

type ApiKeyResolver = () => string | null | Promise<string | null>;

const DEFAULT_PROVIDER_NAME = "anthropic";
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RETRIES = 3;

export class LLMDocQueryAdapter implements ILLMDocQueryAdapter {
  private readonly getApiKey: ApiKeyResolver;
  private readonly providerName: string;

  constructor(
    getApiKey: ApiKeyResolver,
    providerName: string = DEFAULT_PROVIDER_NAME,
  ) {
    this.getApiKey = getApiKey;
    this.providerName = providerName;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const key = await this.resolveApiKey();
      return typeof key === "string" && key.trim() !== "";
    } catch (error) {
      log.warn(
        "[LLMDocQueryAdapter] API key resolution failed during availability check:",
        sanitizeErrorMessage(error),
      );
      return false;
    }
  }

  getProviderName(): string {
    return this.providerName;
  }

  async query(prompt: string): Promise<DocOperationResult<string>> {
    if (typeof prompt !== "string" || prompt.trim() === "") {
      return this.createValidationError();
    }

    let apiKey: string | null;
    try {
      apiKey = await this.resolveApiKey();
    } catch {
      return this.createInternalError();
    }

    if (!this.hasApiKey(apiKey)) {
      return this.createMissingApiKeyError();
    }

    try {
      const client = this.createClient(apiKey);
      const result = await client.query(prompt);

      if (result.success) {
        return { success: true, data: result.content };
      }

      return this.mapError(result);
    } catch (error) {
      return this.mapError(error);
    }
  }

  private createClient(apiKey: string): LLMClient {
    const config: LLMClientConfig = {
      apiKey,
      model: DEFAULT_MODEL,
      timeoutMs: DEFAULT_TIMEOUT_MS,
      maxRetries: DEFAULT_MAX_RETRIES,
    };

    return new LLMClient(config);
  }

  private async resolveApiKey(): Promise<string | null> {
    return this.getApiKey();
  }

  private hasApiKey(apiKey: string | null): apiKey is string {
    return typeof apiKey === "string" && apiKey.trim() !== "";
  }

  private mapError(error: unknown): DocOperationResult<string> {
    if (this.isClientFailure(error)) {
      return { success: false, error: this.toDocError(error) };
    }

    if (error instanceof Error) {
      const normalizedMessage = sanitizeErrorMessage(error);
      log.error(
        "[LLMDocQueryAdapter] Unexpected error while generating docs:",
        normalizedMessage,
      );
      return this.createInternalError();
    }

    log.error(
      "[LLMDocQueryAdapter] Unexpected non-error while generating docs:",
      sanitizeErrorMessage(error),
    );
    return this.createInternalError();
  }

  private isClientFailure(
    value: unknown,
  ): value is Extract<LLMQueryResult, { success: false }> {
    return (
      typeof value === "object" &&
      value !== null &&
      "success" in value &&
      (value as { success?: unknown }).success === false &&
      "errorCode" in value &&
      typeof (value as { errorCode?: unknown }).errorCode === "string"
    );
  }

  private toDocError(
    result: Extract<LLMQueryResult, { success: false }>,
  ): DocError {
    switch (result.errorCode) {
      case "API_KEY_MISSING":
        return this.createDocError({
          code: 2001,
          category: "BUSINESS",
          message: result.message,
          retryable: false,
          guidance: {
            reason: "API key が設定されていません",
            action: "設定画面から API key を設定してください",
            handoffAvailable: true,
          },
        });
      case "API_KEY_INVALID":
        return this.createDocError({
          code: 2002,
          category: "BUSINESS",
          message: result.message,
          retryable: false,
          guidance: {
            reason: "API key が無効です",
            action: "設定画面から API key を再設定してください",
            handoffAvailable: true,
          },
        });
      case "RATE_LIMIT":
        return this.createDocError({
          code: 3002,
          category: "EXTERNAL_SERVICE",
          message: result.message,
          retryable: true,
          guidance: {
            reason: "レート制限に達しました",
            action: "しばらく待ってから再試行してください",
            handoffAvailable: true,
          },
        });
      case "SERVER_ERROR":
        return this.createDocError({
          code: 3003,
          category: "EXTERNAL_SERVICE",
          message: result.message,
          retryable: true,
          guidance: {
            reason: "サーバーエラーが発生しました",
            action: "しばらく待ってから再試行してください",
            handoffAvailable: true,
          },
        });
      case "TIMEOUT":
        return this.createDocError({
          code: 3001,
          category: "EXTERNAL_SERVICE",
          message: result.message,
          retryable: true,
          guidance: {
            reason: "タイムアウトしました",
            action: "しばらく待ってから再試行してください",
            handoffAvailable: true,
          },
        });
      case "NETWORK_ERROR":
        return this.createDocError({
          code: 3004,
          category: "EXTERNAL_SERVICE",
          message: result.message,
          retryable: true,
          guidance: {
            reason: "ネットワークエラーが発生しました",
            action: "接続状態を確認して再試行してください",
            handoffAvailable: true,
          },
        });
      case "INTERNAL_ERROR":
      default:
        return this.createDocError({
          code: 5001,
          category: "INTERNAL",
          message: result.message,
          retryable: false,
          guidance: {
            reason: "内部エラーが発生しました",
            action: "問題が続く場合はアプリを再起動してください",
            handoffAvailable: false,
          },
        });
    }
  }

  private createMissingApiKeyError(): DocOperationResult<string> {
    return {
      success: false,
      error: this.createDocError({
        code: 2001,
        category: "BUSINESS",
        message:
          "APIキーが設定されていません。設定画面でAPIキーを入力してください。",
        retryable: false,
        guidance: {
          reason: "API key が設定されていません",
          action: "設定画面から API key を設定してください",
          handoffAvailable: true,
        },
      }),
    };
  }

  private createValidationError(): DocOperationResult<string> {
    return {
      success: false,
      error: this.createDocError({
        code: 1001,
        category: "VALIDATION",
        message: "prompt must be a non-empty string",
        retryable: false,
      }),
    };
  }

  private createInternalError(): DocOperationResult<string> {
    return {
      success: false,
      error: this.createDocError({
        code: 5001,
        category: "INTERNAL",
        message: "Internal error",
        retryable: false,
        guidance: {
          reason: "内部エラーが発生しました",
          action: "問題が続く場合はアプリを再起動してください",
          handoffAvailable: false,
        },
      }),
    };
  }

  private createDocError(error: DocError): DocError {
    return error;
  }
}

function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
      .replace(/\n\s+at\s+.*/g, "")
      .replace(/(Bearer\s+)[A-Za-z0-9._-]+/gi, "$1***")
      .replace(/(sk-ant-[A-Za-z0-9_-]{8,})/g, "sk-ant-***")
      .replace(/(api[_-]?key\s*[:=]\s*)[A-Za-z0-9._-]+/gi, "$1***")
      .trim();
  }

  if (typeof error === "string") {
    return error.trim();
  }

  return "unknown error";
}
