/**
 * LLMDocQueryAdapter - LLM プロバイダへのドキュメント生成クエリを実行する (TASK-04)
 *
 * AuthKeyService と連携して API key の有効性を判定し、
 * LLM プロバイダへのリクエストを DocOperationResult<string> 形式で返す。
 */
import type { DocOperationResult } from "@repo/shared";

/** LLM プロバイダへの問い合わせを抽象化するアダプタインターフェース */
export interface ILLMDocQueryAdapter {
  query(prompt: string): Promise<DocOperationResult<string>>;
  isAvailable(): Promise<boolean>;
  getProviderName(): string;
}

type ApiKeyResolver = () => string | null | Promise<string | null>;

export class LLMDocQueryAdapter implements ILLMDocQueryAdapter {
  private readonly getApiKey: ApiKeyResolver;
  private readonly providerName: string;

  constructor(getApiKey: ApiKeyResolver, providerName: string = "stub") {
    this.getApiKey = getApiKey;
    this.providerName = providerName;
  }

  async isAvailable(): Promise<boolean> {
    const key = await this.resolveApiKey();
    return typeof key === "string" && key.trim() !== "";
  }

  getProviderName(): string {
    return this.providerName;
  }

  async query(prompt: string): Promise<DocOperationResult<string>> {
    // P42: 3段バリデーション
    if (typeof prompt !== "string" || prompt.trim() === "") {
      return {
        success: false,
        error: {
          code: 1001,
          category: "VALIDATION",
          message: "prompt must be a non-empty string",
          retryable: false,
        },
      };
    }

    // API key 未設定チェック
    if (!(await this.isAvailable())) {
      return {
        success: false,
        error: {
          code: 2001,
          category: "BUSINESS",
          message: "API key is not configured",
          retryable: false,
          guidance: {
            reason: "API key が設定されていません",
            action: "設定画面から API key を設定してください",
            handoffAvailable: true,
          },
        },
      };
    }

    try {
      // 本番実装では LLM SDK を呼び出す
      // 現時点では stub として prompt を echo する
      const content = `Generated content for: ${prompt.slice(0, 100)}`;
      return { success: true, data: content };
    } catch (error: unknown) {
      return this.mapError(error);
    }
  }

  private mapError(error: unknown): DocOperationResult<string> {
    if (error instanceof Error) {
      const message = error.message;

      // タイムアウト
      if (message.includes("timeout") || message.includes("ETIMEDOUT")) {
        return {
          success: false,
          error: {
            code: 3001,
            category: "EXTERNAL_SERVICE",
            message: "LLM query timed out",
            retryable: true,
            guidance: {
              reason: "タイムアウトしました",
              action: "しばらく待ってから再試行してください",
              handoffAvailable: true,
            },
          },
        };
      }

      // Rate limit
      if (message.includes("429") || message.includes("rate limit")) {
        return {
          success: false,
          error: {
            code: 3002,
            category: "EXTERNAL_SERVICE",
            message: "Rate limit exceeded",
            retryable: true,
            guidance: {
              reason: "レート制限に達しました",
              action: "しばらく待ってから再試行してください",
              handoffAvailable: true,
            },
          },
        };
      }

      // API key 無効
      if (
        message.includes("401") ||
        message.includes("403") ||
        message.includes("unauthorized")
      ) {
        return {
          success: false,
          error: {
            code: 2002,
            category: "BUSINESS",
            message: "API key is invalid",
            retryable: false,
            guidance: {
              reason: "API key が無効です",
              action: "設定画面から API key を再設定してください",
              handoffAvailable: true,
            },
          },
        };
      }

      // Server error
      if (
        message.includes("500") ||
        message.includes("502") ||
        message.includes("503")
      ) {
        return {
          success: false,
          error: {
            code: 3003,
            category: "EXTERNAL_SERVICE",
            message: "LLM server error",
            retryable: true,
            guidance: {
              reason: "サーバーエラーが発生しました",
              action: "しばらく待ってから再試行してください",
              handoffAvailable: true,
            },
          },
        };
      }
    }

    // 内部エラー（フォールバック）
    return {
      success: false,
      error: {
        code: 5001,
        category: "INTERNAL",
        message: "Internal error",
        retryable: false,
        guidance: {
          reason: "内部エラーが発生しました",
          action: "問題が続く場合はアプリを再起動してください",
          handoffAvailable: false,
        },
      },
    };
  }

  private async resolveApiKey(): Promise<string | null> {
    return this.getApiKey();
  }
}
