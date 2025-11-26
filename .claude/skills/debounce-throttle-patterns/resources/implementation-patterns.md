# 実装パターン詳細

## 高度なデバウンスパターン

### 1. 非同期デバウンス

```typescript
/**
 * 非同期関数対応のデバウンス
 * - 前回の実行が完了するまで新しい実行を待機
 * - 結果をPromiseで返却
 */
function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout | null = null;
  let pendingPromise: Promise<any> | null = null;
  let resolve: ((value: any) => void) | null = null;
  let reject: ((reason: any) => void) | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (!pendingPromise) {
      pendingPromise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
    }

    timeoutId = setTimeout(async () => {
      try {
        const result = await fn(...args);
        resolve!(result);
      } catch (error) {
        reject!(error);
      } finally {
        pendingPromise = null;
        resolve = null;
        reject = null;
        timeoutId = null;
      }
    }, delay);

    return pendingPromise;
  };
}

// 使用例
const debouncedUpload = debounceAsync(async (file: string) => {
  await uploadFile(file);
  return 'uploaded';
}, 500);

// 複数回呼び出しても、最後の1回だけ実行
await debouncedUpload('file1.txt');
await debouncedUpload('file2.txt'); // これだけ実行される
```

### 2. 最大待機時間付きデバウンス

```typescript
/**
 * 最大待機時間を超えたら強制実行
 * - 継続的なイベントでも定期的に処理を保証
 */
function debounceWithMaxWait<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
  maxWait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let maxWaitTimeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  let firstCallTime: number | null = null;

  const invokeFunc = () => {
    if (lastArgs) {
      fn(...lastArgs);
      lastArgs = null;
      firstCallTime = null;
    }
    if (timeoutId) clearTimeout(timeoutId);
    if (maxWaitTimeoutId) clearTimeout(maxWaitTimeoutId);
    timeoutId = null;
    maxWaitTimeoutId = null;
  };

  return (...args: Parameters<T>) => {
    const now = Date.now();
    lastArgs = args;

    // 最初の呼び出し時刻を記録
    if (firstCallTime === null) {
      firstCallTime = now;

      // 最大待機時間のタイマーを設定
      maxWaitTimeoutId = setTimeout(invokeFunc, maxWait);
    }

    // 通常のデバウンスタイマー
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(invokeFunc, delay);
  };
}

// 使用例: 300msデバウンス、最大2秒待機
const handler = debounceWithMaxWait((data) => {
  console.log('Processing:', data);
}, 300, 2000);
```

### 3. グループ化デバウンス

```typescript
/**
 * キーごとにグループ化してデバウンス
 * - 複数のファイルパスを独立して処理
 */
class GroupedDebouncer<K, V> {
  private debouncers = new Map<K, ReturnType<typeof debounceWithCancel>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    private fn: (key: K, value: V) => void,
    private delay: number,
    private cleanupAfter: number = 60000
  ) {
    // 使われなくなったデバウンサーを定期的にクリーンアップ
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, cleanupAfter);
  }

  call(key: K, value: V): void {
    if (!this.debouncers.has(key)) {
      this.debouncers.set(
        key,
        debounceWithCancel((v: V) => this.fn(key, v), this.delay)
      );
    }
    this.debouncers.get(key)!(value);
  }

  flushAll(): void {
    this.debouncers.forEach((debouncer) => debouncer.flush());
  }

  cancelAll(): void {
    this.debouncers.forEach((debouncer) => debouncer.cancel());
  }

  private cleanup(): void {
    // アイドル状態のデバウンサーを削除
    // 実装は用途に応じて調整
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cancelAll();
    this.debouncers.clear();
  }
}

// 使用例
const fileDebouncer = new GroupedDebouncer<string, void>(
  (path) => processFile(path),
  300
);

watcher.on('change', (path) => fileDebouncer.call(path, undefined));
```

---

## 高度なスロットリングパターン

### 1. アダプティブスロットリング

```typescript
/**
 * 負荷に応じて間隔を動的に調整
 */
class AdaptiveThrottler<T extends (...args: any[]) => void> {
  private lastExecutionTime = 0;
  private currentInterval: number;
  private consecutiveThrottles = 0;

  constructor(
    private fn: T,
    private minInterval: number,
    private maxInterval: number,
    private escalationFactor: number = 1.5
  ) {
    this.currentInterval = minInterval;
  }

  call(...args: Parameters<T>): void {
    const now = Date.now();
    const elapsed = now - this.lastExecutionTime;

    if (elapsed >= this.currentInterval) {
      this.fn(...args);
      this.lastExecutionTime = now;
      this.consecutiveThrottles = 0;
      // 成功時は間隔を最小値に戻す
      this.currentInterval = this.minInterval;
    } else {
      this.consecutiveThrottles++;
      // 連続スロットル時は間隔を増加
      if (this.consecutiveThrottles > 3) {
        this.currentInterval = Math.min(
          this.currentInterval * this.escalationFactor,
          this.maxInterval
        );
      }
    }
  }

  reset(): void {
    this.currentInterval = this.minInterval;
    this.consecutiveThrottles = 0;
  }
}
```

### 2. バケットスロットリング

```typescript
/**
 * Token Bucket アルゴリズム
 * - バースト対応可能
 * - 平均レートを維持
 */
class TokenBucketThrottler<T extends (...args: any[]) => void> {
  private tokens: number;
  private lastRefillTime: number;

  constructor(
    private fn: T,
    private bucketSize: number,    // 最大トークン数
    private refillRate: number,    // トークン/秒
  ) {
    this.tokens = bucketSize;
    this.lastRefillTime = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefillTime) / 1000;
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(this.bucketSize, this.tokens + tokensToAdd);
    this.lastRefillTime = now;
  }

  call(...args: Parameters<T>): boolean {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      this.fn(...args);
      return true;
    }

    return false; // スロットリングされた
  }

  get availableTokens(): number {
    this.refill();
    return this.tokens;
  }
}

// 使用例: 最大10リクエスト、5リクエスト/秒でリフィル
const apiThrottler = new TokenBucketThrottler(
  (data) => sendToApi(data),
  10,
  5
);
```

### 3. 優先度付きスロットリング

```typescript
/**
 * 優先度に応じて処理順序を決定
 */
interface PriorityItem<T> {
  priority: number;
  args: T;
  timestamp: number;
}

class PriorityThrottler<T extends (...args: any[]) => void> {
  private queue: PriorityItem<Parameters<T>>[] = [];
  private processing = false;

  constructor(
    private fn: T,
    private interval: number
  ) {}

  call(priority: number, ...args: Parameters<T>): void {
    this.queue.push({
      priority,
      args,
      timestamp: Date.now(),
    });

    // 優先度でソート（高い順）
    this.queue.sort((a, b) => b.priority - a.priority);

    if (!this.processing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      this.fn(...item.args);
      await this.wait(this.interval);
    }

    this.processing = false;
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## ハイブリッドパターン

### デバウンス + スロットリング

```typescript
/**
 * 最初は即座に実行、その後はデバウンス
 * - 即時フィードバック + 最終状態保証
 */
function throttleDebounce<T extends (...args: any[]) => void>(
  fn: T,
  throttleInterval: number,
  debounceDelay: number
): (...args: Parameters<T>) => void {
  const throttled = throttle(fn, throttleInterval);
  const debounced = debounce(fn, debounceDelay);

  return (...args: Parameters<T>) => {
    throttled(...args);  // 即座に実行（レート制限付き）
    debounced(...args);  // 最後の状態を保証
  };
}

// 使用例
const handler = throttleDebounce(
  (text) => updatePreview(text),
  200,   // 200msごとに更新
  500    // 入力完了後に最終更新
);
```

---

## クリーンアップパターン

```typescript
/**
 * 適切なリソース管理
 */
class ManagedDebouncer<T extends (...args: any[]) => void> {
  private debounced: DebouncedFunction<T>;

  constructor(fn: T, delay: number) {
    this.debounced = debounceWithCancel(fn, delay);
  }

  call(...args: Parameters<T>): void {
    this.debounced(...args);
  }

  // graceful shutdown
  async shutdown(): Promise<void> {
    this.debounced.flush(); // 保留中の処理を実行
  }

  // 強制終了
  abort(): void {
    this.debounced.cancel(); // 保留中の処理を破棄
  }
}

// シャットダウンハンドラー
const debouncer = new ManagedDebouncer(saveFile, 300);

process.on('SIGTERM', async () => {
  await debouncer.shutdown();
  process.exit(0);
});
```
