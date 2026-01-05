/**
 * Retry Policy Template
 * 指数バックオフとジッターを含むリトライポリシー
 */

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterPercent: number;
}

export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitterPercent: 20,
};

export function calculateDelay(
  attempt: number,
  config: RetryConfig = defaultRetryConfig
): number {
  const baseDelay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt);
  const cappedDelay = Math.min(baseDelay, config.maxDelayMs);
  
  // ジッターを適用
  const jitter = cappedDelay * (config.jitterPercent / 100);
  const randomJitter = Math.random() * jitter * 2 - jitter;
  
  return Math.floor(cappedDelay + randomJitter);
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = defaultRetryConfig,
  shouldRetry: (error: unknown) => boolean = () => true
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === config.maxRetries || !shouldRetry(error)) {
        throw error;
      }
      
      const delay = calculateDelay(attempt, config);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// 使用例
// const result = await withRetry(
//   () => fetchExternalAPI(),
//   { ...defaultRetryConfig, maxRetries: 5 },
//   (error) => error instanceof ExternalServiceError && error.isRetryable()
// );
