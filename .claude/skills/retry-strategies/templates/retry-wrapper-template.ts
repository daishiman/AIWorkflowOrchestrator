/**
 * Retry Wrapper Template
 *
 * 外部API呼び出しにリトライ機能を追加するラッパーテンプレート
 * 使用方法: このテンプレートをコピーし、プレースホルダーを実装してください
 *
 * 含まれる機能:
 * - Exponential Backoff
 * - ジッター
 * - リトライ対象エラーの判定
 * - ログ記録
 */

// ============================================
// 1. 設定型定義
// ============================================

export interface RetryConfig {
  /** 最大リトライ回数 */
  maxRetries: number;

  /** 初期待機時間（ミリ秒） */
  baseDelay: number;

  /** 最大待機時間（ミリ秒） */
  maxDelay: number;

  /** ジッター係数（0-1） */
  jitterFactor: number;

  /** リトライ対象エラーの判定関数（オプション） */
  isRetryable?: (error: unknown) => boolean;

  /** リトライ時のコールバック（オプション） */
  onRetry?: (error: Error, attempt: number, delay: number) => void;
}

// ============================================
// 2. デフォルト設定
// ============================================

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  jitterFactor: 0.3,
};

// ============================================
// 3. エラー型定義
// ============================================

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly attempts: number,
    public readonly lastError: Error
  ) {
    super(message);
    this.name = "RetryError";
  }
}

// ============================================
// 4. ユーティリティ関数
// ============================================

/**
 * 指定時間待機
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * バックオフ待機時間を計算
 */
function calculateDelay(
  attempt: number,
  config: RetryConfig
): number {
  // 指数バックオフ
  const exponentialDelay = config.baseDelay * Math.pow(2, attempt);

  // 最大値でキャップ
  const cappedDelay = Math.min(exponentialDelay, config.maxDelay);

  // ジッターを追加
  const jitter = cappedDelay * config.jitterFactor * Math.random();

  return Math.floor(cappedDelay + jitter);
}

/**
 * デフォルトのリトライ対象判定
 */
function defaultIsRetryable(error: unknown): boolean {
  // HTTPエラーの場合
  if (error instanceof Error && "status" in error) {
    const status = (error as { status: number }).status;

    // 5xx サーバーエラー
    if (status >= 500 && status <= 599) return true;

    // 408 Request Timeout
    if (status === 408) return true;

    // 429 Too Many Requests
    if (status === 429) return true;

    // 4xx クライアントエラーはリトライしない
    if (status >= 400 && status <= 499) return false;
  }

  // ネットワークエラー
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("econnreset") ||
      message.includes("etimedout") ||
      message.includes("econnrefused") ||
      message.includes("enetunreach") ||
      message.includes("socket hang up") ||
      message.includes("network") ||
      message.includes("timeout")
    ) {
      return true;
    }
  }

  // 不明なエラーはリトライしない
  return false;
}

// ============================================
// 5. リトライラッパー実装
// ============================================

/**
 * リトライ機能付き関数実行
 *
 * @param fn 実行する非同期関数
 * @param config リトライ設定
 * @returns 関数の戻り値
 * @throws {RetryError} 最大リトライ後も失敗した場合
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const mergedConfig: RetryConfig = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  const isRetryable = mergedConfig.isRetryable || defaultIsRetryable;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= mergedConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // 最後の試行の場合
      if (attempt === mergedConfig.maxRetries) {
        throw new RetryError(
          `All ${mergedConfig.maxRetries + 1} attempts failed`,
          attempt + 1,
          lastError
        );
      }

      // リトライ対象でない場合
      if (!isRetryable(error)) {
        throw error;
      }

      // 待機時間を計算
      const delay = calculateDelay(attempt, mergedConfig);

      // コールバックを呼び出し
      if (mergedConfig.onRetry) {
        mergedConfig.onRetry(lastError, attempt + 1, delay);
      }

      // ログ出力
      console.log({
        event: "retry_attempt",
        attempt: attempt + 1,
        maxRetries: mergedConfig.maxRetries,
        delayMs: delay,
        errorType: lastError.name,
        errorMessage: lastError.message,
        timestamp: new Date().toISOString(),
      });

      // 待機
      await sleep(delay);
    }
  }

  // ここには到達しないはず
  throw new RetryError(
    "Unexpected: retry loop exited without result",
    mergedConfig.maxRetries + 1,
    lastError!
  );
}

// ============================================
// 6. デコレーター版（クラスメソッド用）
// ============================================

/**
 * リトライデコレーター
 * クラスメソッドにリトライ機能を追加
 */
export function Retry(config: Partial<RetryConfig> = {}) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      return withRetry(() => originalMethod.apply(this, args), config);
    };

    return descriptor;
  };
}

// ============================================
// 7. 高レベルラッパー
// ============================================

/**
 * リトライ可能な関数を作成するファクトリー
 */
export function createRetryable<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  config: Partial<RetryConfig> = {}
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs) => withRetry(() => fn(...args), config);
}

// ============================================
// 8. 使用例
// ============================================

/*
// 基本的な使用
const result = await withRetry(() => api.fetchData(id), {
  maxRetries: 5,
  baseDelay: 500,
});

// デコレーター使用
class ApiClient {
  @Retry({ maxRetries: 3 })
  async fetchUser(id: string): Promise<User> {
    return fetch(`/api/users/${id}`).then(r => r.json());
  }
}

// ファクトリー使用
const retryableFetch = createRetryable(
  (url: string) => fetch(url).then(r => r.json()),
  { maxRetries: 3 }
);
const data = await retryableFetch('/api/data');

// カスタムリトライ判定
const result = await withRetry(
  () => api.fetchData(id),
  {
    isRetryable: (error) => {
      // カスタムロジック
      return error instanceof NetworkError;
    },
    onRetry: (error, attempt, delay) => {
      console.log(`Retry ${attempt} after ${delay}ms: ${error.message}`);
    },
  }
);
*/
