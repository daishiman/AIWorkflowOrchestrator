# Phase 2 Task 3: バックオフアルゴリズム設計書

## calculateBackoffDelay() 関数設計

```typescript
/**
 * リトライ間隔を計算する（Exponential Backoff with Jitter）
 *
 * @param attempt - リトライ試行回数（0始まり）
 * @param config - リトライ設定
 * @param retryAfterMs - Retry-Afterヘッダーから算出した待機時間（オプション）
 * @returns 待機時間（ミリ秒）
 */
export function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig,
  retryAfterMs?: number,
): number;
```

## アルゴリズム

### Step 1: Retry-Afterヘッダー優先

Retry-Afterが指定されている場合:

```
return Math.max(retryAfterMs, config.baseDelayMs)
```

### Step 2: Exponential Backoff計算

```
exponentialDelay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt)
```

### Step 3: 最大待機時間でキャップ

```
cappedDelay = Math.min(config.maxDelayMs, exponentialDelay)
```

### Step 4: Jitter適用

```
jitter = cappedDelay * (Math.random() * 2 - 1) * config.jitterFactor
result = Math.max(0, cappedDelay + jitter)
```

## 計算例（デフォルト設定）

| attempt | exponentialDelay | cappedDelay | Jitter範囲 (±20%) | 結果範囲        |
| ------- | ---------------- | ----------- | ----------------- | --------------- |
| 0       | 1000ms           | 1000ms      | -200ms ~ +200ms   | 800ms ~ 1200ms  |
| 1       | 2000ms           | 2000ms      | -400ms ~ +400ms   | 1600ms ~ 2400ms |
| 2       | 4000ms           | 4000ms      | -800ms ~ +800ms   | 3200ms ~ 4800ms |
| 3       | 8000ms           | 8000ms      | -1600ms ~ +1600ms | 6400ms ~ 9600ms |

## 最悪ケースの総待機時間

3回リトライ（attempt 0, 1, 2）の最大待機時間合計:

- 1200ms + 2400ms + 4800ms = 8400ms ≒ 8.4秒

## sleep() ユーティリティ

```typescript
/**
 * AbortSignal対応のsleep関数
 *
 * @param ms - 待機時間（ミリ秒）
 * @param signal - AbortSignal（オプション）
 * @returns Promise<void>
 * @throws AbortError（signal.abort()時）
 */
function sleep(ms: number, signal?: AbortSignal): Promise<void>;
```

### 実装設計

1. signal が既に aborted なら即座に reject (AbortError)
2. setTimeout で ms 後に resolve
3. signal の abort イベントリスナーで clearTimeout → reject (AbortError)
4. { once: true } でメモリリーク防止
