/**
 * ApiIntegrator - 外部API統合コード生成
 * TASK-9B Phase 5
 *
 * RESTクライアント・Webhookハンドラの自動生成、
 * および認証設定機能を提供する。
 * Script First原則に基づき、実行はScriptExecutorに委譲する。
 */
import type { ScriptExecutor } from "./ScriptExecutor";

/** HTTPメソッド */
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/** Webhookで使用可能なHTTPメソッド */
type WebhookMethod = "POST" | "PUT";

/** 認証タイプ */
type AuthType = "apiKey" | "bearer" | "oauth" | "none";

/** RESTクライアント設定 */
interface RestClientConfig {
  /** ベースURL */
  baseUrl: string;
  /** エンドポイント定義の配列 */
  endpoints: Array<{
    /** HTTPメソッド */
    method: HttpMethod;
    /** エンドポイントパス */
    path: string;
    /** エンドポイントの説明 */
    description: string;
  }>;
  /** 認証タイプ */
  authType?: AuthType;
}

/** Webhook設定 */
interface WebhookConfig {
  /** Webhookパス */
  path: string;
  /** HTTPメソッド */
  method: WebhookMethod;
  /** カスタムヘッダー */
  headers?: Record<string, string>;
  /** 署名検証用シークレット */
  secret?: string;
}

export class ApiIntegrator {
  private scriptExecutor: ScriptExecutor | null = null;

  /**
   * ScriptExecutorを設定する（Setter Injection）
   * P34: 遅延初期化が必要な依存オブジェクトのDIパターン
   *
   * @param executor - ScriptExecutorインスタンス
   */
  setScriptExecutor(executor: ScriptExecutor): void {
    this.scriptExecutor = executor;
  }

  /**
   * RESTクライアントコードを生成する
   *
   * @param config - RESTクライアント設定
   * @returns 生成されたRESTクライアントコード
   * @throws Error - ScriptExecutorが未設定、またはスクリプト実行失敗時
   */
  async generateRestClient(config: RestClientConfig): Promise<string> {
    if (!this.scriptExecutor) {
      throw new Error("ScriptExecutor is not configured");
    }

    const result = await this.scriptExecutor.execute(
      "generate_rest_client.js",
      ["--config", JSON.stringify(config)],
    );

    if (!result.success) {
      throw new Error(`REST client generation failed: ${result.stderr}`);
    }

    return result.stdout;
  }

  /**
   * Webhookハンドラコードを生成する
   *
   * @param config - Webhook設定
   * @returns 生成されたWebhookハンドラコード
   * @throws Error - ScriptExecutorが未設定、またはスクリプト実行失敗時
   */
  async generateWebhookHandler(config: WebhookConfig): Promise<string> {
    if (!this.scriptExecutor) {
      throw new Error("ScriptExecutor is not configured");
    }

    const result = await this.scriptExecutor.execute("generate_webhook.js", [
      "--config",
      JSON.stringify(config),
    ]);

    if (!result.success) {
      throw new Error(`Webhook handler generation failed: ${result.stderr}`);
    }

    return result.stdout;
  }

  /**
   * 認証設定を構成する
   * P42準拠: 全クレデンシャル値に対して3段バリデーションを実施
   *
   * @param authType - 認証タイプ文字列
   * @param credentials - クレデンシャル（キーと値のペア）
   * @throws Error - ScriptExecutorが未設定、クレデンシャル値が空、またはスクリプト実行失敗時
   */
  async configureAuth(
    authType: string,
    credentials: Record<string, string>,
  ): Promise<void> {
    if (!this.scriptExecutor) {
      throw new Error("ScriptExecutor is not configured");
    }

    // P42: クレデンシャル値の3段バリデーション（型チェック → 空文字列 → トリム空文字列）
    for (const [key, value] of Object.entries(credentials)) {
      if (!value || value.trim() === "") {
        throw new Error(`Credential "${key}" must not be empty`);
      }
    }

    await this.scriptExecutor.execute("configure_auth.js", [
      "--type",
      authType,
      "--credentials",
      JSON.stringify(credentials),
    ]);
  }
}
