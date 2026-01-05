/**
 * 非同期ユーティリティ
 *
 * @description 非同期処理に関するユーティリティ関数を提供
 */

/**
 * 指定時間スリープ
 *
 * @param ms - スリープ時間（ミリ秒）
 * @returns Promise
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * タイムアウト付きPromise実行
 *
 * @param promise - 実行するPromise
 * @param timeoutMs - タイムアウト時間（ミリ秒）
 * @param timeoutError - タイムアウト時のエラー
 * @returns Promise結果
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError: Error = new Error(`Operation timed out after ${timeoutMs}ms`),
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(timeoutError), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}
