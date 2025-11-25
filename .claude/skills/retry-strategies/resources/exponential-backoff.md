# Exponential Backoff（指数バックオフ）

## 概要

指数バックオフは、リトライ間隔を指数的に増加させることで、サーバー負荷を軽減しながら
一時的障害からの復旧を試みるリトライ戦略です。

## 基本原則

### なぜ指数バックオフが必要か

**問題**: 固定間隔リトライの課題
```
時刻0: 1000クライアントが同時にリクエスト
時刻1: サーバー障害、全クライアント失敗
時刻2: 1000クライアントが同時にリトライ ← 負荷集中！
時刻3: また全失敗
時刻4: また同時リトライ ← 無限ループ
```

**解決**: 指数バックオフ + ジッター
```
時刻0: 1000クライアントが同時にリクエスト
時刻1: サーバー障害、全クライアント失敗
時刻2-4: クライアントがランダムな間隔でリトライ（分散）
        → サーバー負荷が軽減
        → 一部のリクエストが成功開始
```

## 計算式

### 基本式

```
delay = min(baseDelay * 2^attempt, maxDelay)
```

### ジッター付き（推奨）

```
delay = min(baseDelay * 2^attempt, maxDelay) + random(0, jitterRange)
```

### Full Jitter（AWS推奨）

```
delay = random(0, min(baseDelay * 2^attempt, maxDelay))
```

### Decorrelated Jitter

```
delay = min(maxDelay, random(baseDelay, previousDelay * 3))
```

## パラメータ設計

### 基本パラメータ

| パラメータ | 推奨値 | 説明 |
|-----------|--------|------|
| baseDelay | 100-1000ms | 初回リトライの待機時間 |
| maxDelay | 30-60s | 最大待機時間 |
| maxRetries | 3-5回 | 最大リトライ回数 |
| jitterFactor | 0-0.5 | ジッターの割合 |

### 用途別推奨値

#### 高速復旧（インタラクティブ操作）
```typescript
const config = {
  baseDelay: 100,    // 100ms
  maxDelay: 3000,    // 3秒
  maxRetries: 3,
  jitterFactor: 0.2,
};
// 総最大待機時間: 約4.5秒
```

#### 標準（バックグラウンド処理）
```typescript
const config = {
  baseDelay: 1000,   // 1秒
  maxDelay: 30000,   // 30秒
  maxRetries: 5,
  jitterFactor: 0.3,
};
// 総最大待機時間: 約1分30秒
```

#### 長期復旧（バッチ処理）
```typescript
const config = {
  baseDelay: 5000,   // 5秒
  maxDelay: 300000,  // 5分
  maxRetries: 10,
  jitterFactor: 0.5,
};
// 総最大待機時間: 約30分
```

## 実装パターン

### 基本実装

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // 最後の試行なら即座にエラー
      if (attempt === config.maxRetries - 1) {
        throw lastError;
      }

      // リトライ対象かチェック
      if (!isRetryableError(error)) {
        throw error;
      }

      // 待機時間計算
      const delay = calculateDelay(attempt, config);
      await sleep(delay);
    }
  }

  throw lastError!;
}

function calculateDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = config.baseDelay * Math.pow(2, attempt);
  const cappedDelay = Math.min(exponentialDelay, config.maxDelay);
  const jitter = cappedDelay * config.jitterFactor * Math.random();
  return cappedDelay + jitter;
}
```

### Promiseチェーン版

```typescript
function retryPromise<T>(
  fn: () => Promise<T>,
  retriesLeft: number,
  delay: number,
  config: RetryConfig
): Promise<T> {
  return fn().catch((error) => {
    if (retriesLeft === 0 || !isRetryableError(error)) {
      return Promise.reject(error);
    }

    const nextDelay = Math.min(delay * 2, config.maxDelay);
    const jitter = nextDelay * config.jitterFactor * Math.random();

    return new Promise((resolve) =>
      setTimeout(resolve, nextDelay + jitter)
    ).then(() =>
      retryPromise(fn, retriesLeft - 1, nextDelay, config)
    );
  });
}
```

## リトライ対象の判定

### HTTPステータスコード別

```typescript
function isRetryableError(error: unknown): boolean {
  if (error instanceof HttpError) {
    const status = error.status;

    // リトライ対象
    if (status >= 500 && status <= 599) return true; // 5xx
    if (status === 408) return true; // Request Timeout
    if (status === 429) return true; // Too Many Requests

    // リトライ対象外
    if (status >= 400 && status <= 499) return false; // 4xx
  }

  // ネットワークエラー
  if (error instanceof NetworkError) return true;
  if (error instanceof TimeoutError) return true;

  return false;
}
```

### エラーメッセージ別

```typescript
const RETRYABLE_ERROR_MESSAGES = [
  'ECONNRESET',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'ENETUNREACH',
  'socket hang up',
];

function isRetryableByMessage(error: Error): boolean {
  return RETRYABLE_ERROR_MESSAGES.some(
    (msg) => error.message.includes(msg)
  );
}
```

## 待機時間の計算例

### attempt = 0 から 5 の場合

```
baseDelay = 1000ms, maxDelay = 30000ms, jitterFactor = 0.3

attempt 0: 1000ms  + jitter(0-300ms)  = 1000-1300ms
attempt 1: 2000ms  + jitter(0-600ms)  = 2000-2600ms
attempt 2: 4000ms  + jitter(0-1200ms) = 4000-5200ms
attempt 3: 8000ms  + jitter(0-2400ms) = 8000-10400ms
attempt 4: 16000ms + jitter(0-4800ms) = 16000-20800ms
attempt 5: 30000ms + jitter(0-9000ms) = 30000-39000ms (capped)

総最大待機時間: 約80秒
```

## ログ記録

### 推奨ログ形式

```typescript
function logRetry(
  attempt: number,
  maxRetries: number,
  delay: number,
  error: Error
): void {
  console.log({
    event: 'retry_attempt',
    attempt: attempt + 1,
    maxRetries,
    delayMs: delay,
    errorType: error.name,
    errorMessage: error.message,
    timestamp: new Date().toISOString(),
  });
}
```

## チェックリスト

### 設計時
- [ ] リトライ対象のエラーが明確に定義されているか？
- [ ] 総最大待機時間がユースケースに適切か？
- [ ] ジッターが追加されているか？

### 実装時
- [ ] 最大リトライ回数が設定されているか？
- [ ] 最大待機時間が設定されているか？
- [ ] 各リトライがログに記録されているか？

### テスト時
- [ ] リトライ回数が正しいか？
- [ ] 待機時間が指数的に増加しているか？
- [ ] 永続的エラーではリトライしないか？

## アンチパターン

### ❌ 無限リトライ

```typescript
// NG: 最大回数なし
while (true) {
  try {
    return await fn();
  } catch {
    await sleep(1000);
  }
}
```

### ❌ 固定間隔

```typescript
// NG: 常に同じ間隔
for (let i = 0; i < maxRetries; i++) {
  try {
    return await fn();
  } catch {
    await sleep(1000); // 常に1秒
  }
}
```

### ❌ ジッターなし

```typescript
// NG: 同時リトライの可能性
const delay = baseDelay * Math.pow(2, attempt);
// ジッターがない → 複数クライアントが同時にリトライ
```

## 参考

- **AWS Architecture Blog**: Exponential Backoff And Jitter
- **Google Cloud**: Truncated Exponential Backoff
