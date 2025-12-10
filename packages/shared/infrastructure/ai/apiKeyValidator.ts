/**
 * APIキー検証サービス
 *
 * 各AIプロバイダーのAPIキーを検証する
 *
 * TDD Phase: Green（完全実装）
 *
 * @see docs/30-workflows/api-key-management/architecture.md
 */

import type {
  AIProvider,
  ApiKeyValidationResult,
  ApiKeyValidationStatus,
} from "../../types/api-keys";

/**
 * APIキー検証タイムアウト（ミリ秒）
 *
 * Design Review M-2: 定数化
 */
export const API_KEY_VALIDATION_TIMEOUT_MS = 10000;

/**
 * HTTPステータスコード別の日本語エラーメッセージ
 */
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: "リクエストが無効です。APIキーの形式を確認してください",
  401: "認証に失敗しました。APIキーが正しいか確認してください",
  403: "アクセスが拒否されました。APIキーの権限を確認してください",
  429: "リクエスト制限に達しました（APIキーは有効です）",
  500: "サーバーで問題が発生しました。しばらく待ってから再試行してください",
  502: "サーバーが応答しません。しばらく待ってから再試行してください",
  503: "サービスが一時的に利用できません。しばらく待ってから再試行してください",
  504: "サーバーからの応答がありません。しばらく待ってから再試行してください",
};

/**
 * APIキー検証インターフェース
 */
export interface ApiKeyValidator {
  validate(
    provider: AIProvider,
    apiKey: string,
  ): Promise<ApiKeyValidationResult>;
}

/**
 * プロバイダー別検証エンドポイント設定
 */
const PROVIDER_CONFIG: Record<
  AIProvider,
  {
    endpoint: string;
    method: "GET" | "POST";
    getHeaders: (apiKey: string) => Record<string, string>;
    getBody?: () => string;
    appendKeyToUrl?: boolean;
  }
> = {
  openai: {
    endpoint: "https://api.openai.com/v1/models",
    method: "GET",
    getHeaders: (apiKey) => ({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
  },
  anthropic: {
    endpoint: "https://api.anthropic.com/v1/messages",
    method: "POST",
    getHeaders: (apiKey) => ({
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    }),
    getBody: () =>
      JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1,
        messages: [{ role: "user", content: "hi" }],
      }),
  },
  google: {
    endpoint: "https://generativelanguage.googleapis.com/v1/models",
    method: "GET",
    getHeaders: () => ({
      "Content-Type": "application/json",
    }),
    appendKeyToUrl: true,
  },
  xai: {
    endpoint: "https://api.x.ai/v1/models",
    method: "GET",
    getHeaders: (apiKey) => ({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
  },
};

/**
 * APIキーパターンを除去してエラーメッセージをサニタイズ
 */
function _sanitizeErrorMessage(message: string, apiKey?: string): string {
  let sanitized = message
    // OpenAI keys
    .replace(/sk-[A-Za-z0-9_-]+/g, "[REDACTED]")
    // Anthropic keys
    .replace(/sk-ant-[A-Za-z0-9_-]+/g, "[REDACTED]")
    // xAI keys
    .replace(/xai-[A-Za-z0-9_-]+/g, "[REDACTED]")
    // Google AI keys (AIza prefix)
    .replace(/AIza[A-Za-z0-9_-]+/g, "[REDACTED]");

  // 渡されたAPIキーを直接除去
  if (apiKey && apiKey.length > 0) {
    sanitized = sanitized.split(apiKey).join("[REDACTED]");
  }

  return sanitized;
}

/**
 * 現在のタイムスタンプを取得（ISO 8601形式）
 */
function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * HTTPステータスコードから検証ステータスを判定
 */
function getStatusFromHttpCode(
  status: number,
  _provider: AIProvider,
): ApiKeyValidationStatus {
  // 2xx: 成功 (valid)
  if (status >= 200 && status < 300) {
    return "valid";
  }

  // 429: Rate limit - キーは有効（レートリミットは認証成功後に発生）
  if (status === 429) {
    return "valid";
  }

  // 401: Unauthorized - APIキーが無効または期限切れ
  if (status === 401) {
    return "invalid";
  }

  // 403: Forbidden - APIキーに権限がない
  if (status === 403) {
    return "invalid";
  }

  // 400: Bad request - リクエスト形式エラー（通常はAPIキーとは無関係）
  // ただし、一部のAPIではAPIキー形式エラーで400を返すことがある
  if (status === 400) {
    return "invalid";
  }

  // 503: Service unavailable
  if (status === 503) {
    return "network_error";
  }

  // 502, 504: Gateway error
  if (status === 502 || status === 504) {
    return "network_error";
  }

  // 5xx: サーバーエラー (unknown_error)
  if (status >= 500) {
    return "unknown_error";
  }

  return "unknown_error";
}

/**
 * APIキーに禁止文字が含まれているかチェック
 */
function containsForbiddenCharacters(apiKey: string): boolean {
  const forbiddenPattern = /[<>'";&|]/;
  return forbiddenPattern.test(apiKey);
}

/**
 * APIキーを検証する
 *
 * @param provider - AIプロバイダー
 * @param apiKey - 検証するAPIキー
 * @returns 検証結果
 */
export async function validateApiKey(
  provider: AIProvider,
  apiKey: string,
): Promise<ApiKeyValidationResult> {
  const timestamp = getCurrentTimestamp();

  // 空のAPIキーをチェック
  if (!apiKey || apiKey.length === 0) {
    return {
      provider,
      status: "invalid",
      validatedAt: timestamp,
      errorMessage: "APIキーが入力されていません",
    };
  }

  // 禁止文字をチェック（XSS対策）
  if (containsForbiddenCharacters(apiKey)) {
    return {
      provider,
      status: "invalid",
      validatedAt: timestamp,
      errorMessage: "APIキーに無効な文字が含まれています",
    };
  }

  const config = PROVIDER_CONFIG[provider];
  if (!config) {
    return {
      provider,
      status: "unknown_error",
      validatedAt: timestamp,
      errorMessage: `不明なプロバイダーです: ${provider}`,
    };
  }

  // AbortControllerでタイムアウト制御
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, API_KEY_VALIDATION_TIMEOUT_MS);

  try {
    // URLを構築（Google AIの場合はクエリパラメータにキーを追加）
    let url = config.endpoint;
    if (config.appendKeyToUrl) {
      url = `${config.endpoint}?key=${apiKey}`;
    }

    const fetchOptions: RequestInit = {
      method: config.method,
      headers: config.getHeaders(apiKey),
      signal: controller.signal,
    };

    if (config.getBody && config.method === "POST") {
      fetchOptions.body = config.getBody();
    }

    // デバッグ: APIリクエスト送信をログ（APIキーは除去）
    console.log(
      `[API Key Validation] Sending ${config.method} request to ${config.endpoint} for provider: ${provider}`,
    );

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    // デバッグ: レスポンスステータスをログ
    console.log(
      `[API Key Validation] Response from ${provider}: HTTP ${response.status}`,
    );

    const status = getStatusFromHttpCode(response.status, provider);

    const result: ApiKeyValidationResult = {
      provider,
      status,
      validatedAt: timestamp,
      httpStatusCode: response.status,
    };

    if (status !== "valid") {
      // HTTPステータスコードに対応する日本語メッセージを使用
      result.errorMessage =
        HTTP_STATUS_MESSAGES[response.status] ||
        `検証に失敗しました（HTTPステータス: ${response.status}）`;
    }

    return result;
  } catch (error) {
    clearTimeout(timeoutId);

    // デバッグ: エラーをログ
    console.error(`[API Key Validation] Error for ${provider}:`, error);

    // AbortError = タイムアウト
    if (error instanceof Error && error.name === "AbortError") {
      return {
        provider,
        status: "timeout",
        validatedAt: timestamp,
        errorMessage: "リクエストがタイムアウトしました（10秒）",
      };
    }

    // TypeError = ネットワークエラー（fetch失敗）
    if (error instanceof Error && error.name === "TypeError") {
      return {
        provider,
        status: "network_error",
        validatedAt: timestamp,
        errorMessage:
          "ネットワークエラーが発生しました。インターネット接続を確認してください",
      };
    }

    // その他のエラー
    return {
      provider,
      status: "unknown_error",
      validatedAt: timestamp,
      errorMessage: "予期しないエラーが発生しました。もう一度お試しください",
    };
  }
}

/**
 * APIキー検証サービスを作成
 */
export function createApiKeyValidator(): ApiKeyValidator {
  return {
    validate: validateApiKey,
  };
}
