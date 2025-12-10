/**
 * APIキー関連ユーティリティ
 *
 * APIキー管理で共通に使用されるヘルパー関数
 */

// ============================================================
// API Key Pattern Constants
// ============================================================

/**
 * APIキーパターンの正規表現（機密情報除去用）
 */
export const API_KEY_PATTERNS = {
  /** OpenAI APIキー */
  openai: /sk-[A-Za-z0-9_-]+/g,
  /** Anthropic APIキー */
  anthropic: /sk-ant-[A-Za-z0-9_-]+/g,
  /** xAI APIキー */
  xai: /xai-[A-Za-z0-9_-]+/g,
  /** Google AI APIキー */
  google: /AIza[A-Za-z0-9_-]+/g,
} as const;

// ============================================================
// Sanitization Functions
// ============================================================

/**
 * エラーメッセージからAPIキーを除去（セキュリティ対策）
 *
 * @param error - エラーオブジェクトまたはメッセージ文字列
 * @param apiKey - 追加で除去するAPIキー値（オプション）
 * @returns サニタイズされたメッセージ
 *
 * @example
 * ```ts
 * sanitizeApiKeyError(new Error("Invalid key: sk-test123"))
 * // => "Invalid key: [REDACTED]"
 * ```
 */
export function sanitizeApiKeyError(error: unknown, apiKey?: string): string {
  // エラーからメッセージを抽出
  let message: string;
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else {
    return "An unknown error occurred";
  }

  // 既知のAPIキーパターンを除去
  let sanitized = message
    .replace(API_KEY_PATTERNS.openai, "[REDACTED]")
    .replace(API_KEY_PATTERNS.anthropic, "[REDACTED]")
    .replace(API_KEY_PATTERNS.xai, "[REDACTED]")
    .replace(API_KEY_PATTERNS.google, "[REDACTED]");

  // 渡されたAPIキーを直接除去
  if (apiKey && apiKey.length > 0) {
    sanitized = sanitized.split(apiKey).join("[REDACTED]");
  }

  // 内部エラーの汎用化
  if (
    sanitized.includes("database connection") ||
    sanitized.includes("internal") ||
    sanitized.includes("db.internal")
  ) {
    return "An internal error occurred";
  }

  return sanitized;
}

// ============================================================
// Timestamp Functions
// ============================================================

/**
 * 現在のISO 8601タイムスタンプを取得
 *
 * @returns ISO 8601形式のタイムスタンプ (例: "2025-12-10T12:00:00.000Z")
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
