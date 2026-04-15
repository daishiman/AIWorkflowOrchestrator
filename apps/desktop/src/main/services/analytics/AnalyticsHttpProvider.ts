/**
 * @file AnalyticsHttpProvider.ts
 * @description HTTP POST による analytics イベント送信プロバイダー（UT-W3-ANALYTICS-HTTP-PROVIDER-001）
 *
 * - 環境変数 ANALYTICS_ENDPOINT_URL が設定されている場合のみ HTTP 送信を行う
 * - 未設定時は no-op（skipped: true）で正常終了する
 * - 指数バックオフで最大 3 回リトライ（NFR-03）
 * - AbortController による 5 秒タイムアウト（NFR-01）
 * - fetch を DI 可能にしてテスト容易性を確保（NFR-02）
 * - 例外を外部にスローしない設計（FR-08）
 */

/** HTTP 送信に必要なイベントペイロード */
export interface AnalyticsEvent {
  eventName: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

/** HTTP 送信結果 */
export interface AnalyticsSendResult {
  success: boolean;
  skipped?: boolean;
  error?: string;
  retryCount?: number;
}

/** Store の最小インターフェース（DI 用） */
export interface AnalyticsStore {
  get(key: string, defaultValue: number): number;
  set(key: string, value: number): void;
}

/** AnalyticsHttpProvider の設定オプション */
export interface AnalyticsHttpProviderOptions {
  /** fetch 関数（DI 用: テスト時にモックに差し替える） */
  fetchFn?: typeof fetch;
  /** タイムアウト（ミリ秒）。デフォルト 5000ms */
  timeoutMs?: number;
  /** 最大リトライ回数。デフォルト 3 */
  maxRetries?: number;
  /** 初回リトライ待機時間（ミリ秒）。デフォルト 1000ms */
  baseRetryDelayMs?: number;
  /** electron-store インスタンス（DI 用: テスト時にモックに差し替える） */
  store?: AnalyticsStore;
}

/** AnalyticsHttpProvider 公開インターフェース */
export interface IAnalyticsHttpProvider {
  send(event: AnalyticsEvent): Promise<AnalyticsSendResult>;
}

interface AnalyticsSendError extends Error {
  retryable: boolean;
}

function createAnalyticsSendError(
  message: string,
  retryable: boolean,
): AnalyticsSendError {
  const error = new Error(message) as AnalyticsSendError;
  error.retryable = retryable;
  return error;
}

function isAnalyticsSendError(error: unknown): error is AnalyticsSendError {
  return (
    typeof error === "object" &&
    error !== null &&
    "retryable" in error &&
    typeof (error as { retryable?: unknown }).retryable === "boolean"
  );
}

export class AnalyticsHttpProvider implements IAnalyticsHttpProvider {
  private readonly fetchFn: typeof fetch;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly baseRetryDelayMs: number;
  private readonly store: AnalyticsStore | null;

  constructor(options: AnalyticsHttpProviderOptions = {}) {
    this.fetchFn = options.fetchFn ?? globalThis.fetch;
    this.timeoutMs = options.timeoutMs ?? 5000;
    this.maxRetries = options.maxRetries ?? 3;
    this.baseRetryDelayMs = options.baseRetryDelayMs ?? 1000;
    this.store = options.store ?? null;
  }

  async send(event: AnalyticsEvent): Promise<AnalyticsSendResult> {
    const endpoint = process.env.ANALYTICS_ENDPOINT_URL;
    if (!endpoint) {
      return { success: true, skipped: true };
    }

    let lastError: unknown;
    let lastAttempt = 0;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      lastAttempt = attempt;
      try {
        await this.attemptSend(endpoint, event);
        this.incrementCount("sentCount");
        return { success: true, retryCount: attempt };
      } catch (err) {
        lastError = err;
        if (!this.shouldRetry(err)) {
          break;
        }

        if (attempt < this.maxRetries) {
          await this.delay(this.baseRetryDelayMs * Math.pow(2, attempt));
        }
      }
    }

    this.incrementCount("failedCount");
    const errorMessage =
      lastError instanceof Error ? lastError.message : String(lastError);
    return {
      success: false,
      error: errorMessage,
      retryCount: lastAttempt,
    };
  }

  private async attemptSend(
    endpoint: string,
    event: AnalyticsEvent,
  ): Promise<void> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      let body: string;
      try {
        body = JSON.stringify(event);
      } catch (error) {
        throw createAnalyticsSendError(
          error instanceof Error
            ? error.message
            : "Failed to serialize analytics event",
          false,
        );
      }

      const response = await this.fetchFn(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw createAnalyticsSendError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status >= 500,
        );
      }
    } finally {
      clearTimeout(timer);
    }
  }

  private shouldRetry(error: unknown): boolean {
    if (isAnalyticsSendError(error)) {
      return error.retryable;
    }

    if (error instanceof DOMException) {
      return error.name === "AbortError";
    }

    if (error instanceof Error) {
      return true;
    }

    return false;
  }

  private incrementCount(key: "sentCount" | "failedCount"): void {
    if (!this.store) return;
    try {
      const current = this.store.get(key, 0);
      this.store.set(key, current + 1);
    } catch {
      // ストア書き込みエラーは握り潰す（カウンター失敗は致命的でない）
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
