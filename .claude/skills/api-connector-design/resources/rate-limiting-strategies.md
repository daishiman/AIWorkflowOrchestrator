# Rate Limiting 戦略ガイド

## 1. Rate Limit の理解

### 一般的な制限タイプ

| タイプ        | 説明                        | 例             |
| ------------- | --------------------------- | -------------- |
| リクエスト/秒 | 1秒あたりの最大リクエスト数 | 10 req/sec     |
| リクエスト/分 | 1分あたりの最大リクエスト数 | 60 req/min     |
| リクエスト/日 | 1日あたりの最大リクエスト数 | 10,000 req/day |
| 同時接続数    | 同時接続の最大数            | 5 connections  |
| バースト制限  | 短時間の高負荷制限          | 100 req/10sec  |

### レスポンスヘッダーの読み取り

```javascript
function parseRateLimitHeaders(response) {
  return {
    // 制限値
    limit: parseInt(response.headers["x-ratelimit-limit"], 10),
    // 残りリクエスト数
    remaining: parseInt(response.headers["x-ratelimit-remaining"], 10),
    // リセット時刻（UNIX timestamp）
    reset: parseInt(response.headers["x-ratelimit-reset"], 10),
    // リトライまでの待機秒数
    retryAfter: parseInt(response.headers["retry-after"], 10),
  };
}
```

## 2. リトライ戦略

### 指数バックオフ

```javascript
class ExponentialBackoff {
  constructor(options = {}) {
    this.initialDelay = options.initialDelay || 1000;
    this.maxDelay = options.maxDelay || 60000;
    this.backoffFactor = options.backoffFactor || 2;
    this.maxRetries = options.maxRetries || 5;
    this.jitterFactor = options.jitterFactor || 0.2;
  }

  getDelay(attempt) {
    // 基本遅延を計算
    let delay = this.initialDelay * Math.pow(this.backoffFactor, attempt);

    // 最大遅延を超えないように制限
    delay = Math.min(delay, this.maxDelay);

    // ジッターを追加（同時リトライ回避）
    const jitter = delay * this.jitterFactor * (Math.random() * 2 - 1);
    return Math.round(delay + jitter);
  }

  shouldRetry(attempt, error) {
    if (attempt >= this.maxRetries) return false;

    // リトライ可能なエラーかチェック
    const retryableStatusCodes = [429, 500, 502, 503, 504];
    return retryableStatusCodes.includes(error.statusCode);
  }
}
```

### 固定間隔リトライ

```javascript
class FixedIntervalRetry {
  constructor(delay = 5000, maxRetries = 3) {
    this.delay = delay;
    this.maxRetries = maxRetries;
  }

  async execute(fn) {
    let lastError;
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt < this.maxRetries - 1) {
          await this.sleep(this.delay);
        }
      }
    }
    throw lastError;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

### 適応型リトライ

```javascript
class AdaptiveRetry {
  constructor() {
    this.successHistory = [];
    this.failureHistory = [];
    this.windowSize = 10;
  }

  getDelay() {
    const recentFailureRate = this.calculateFailureRate();

    // 失敗率に基づいて遅延を調整
    if (recentFailureRate > 0.8) {
      return 30000; // 80%超失敗時は30秒待機
    } else if (recentFailureRate > 0.5) {
      return 10000; // 50%超失敗時は10秒待機
    } else if (recentFailureRate > 0.2) {
      return 3000; // 20%超失敗時は3秒待機
    }
    return 1000; // 通常時は1秒待機
  }

  calculateFailureRate() {
    const recent = [...this.failureHistory, ...this.successHistory].slice(
      -this.windowSize,
    );
    if (recent.length === 0) return 0;
    const failures = this.failureHistory.slice(-this.windowSize).length;
    return failures / recent.length;
  }

  recordSuccess() {
    this.successHistory.push(Date.now());
    this.cleanup();
  }

  recordFailure() {
    this.failureHistory.push(Date.now());
    this.cleanup();
  }

  cleanup() {
    // 古い履歴を削除
    const cutoff = Date.now() - 60000;
    this.successHistory = this.successHistory.filter((t) => t > cutoff);
    this.failureHistory = this.failureHistory.filter((t) => t > cutoff);
  }
}
```

## 3. サーキットブレーカー

```javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.lastFailure = null;
  }

  async execute(fn) {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailure > this.resetTimeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit is OPEN");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failures = 0;
    this.state = "CLOSED";
  }

  onFailure() {
    this.failures++;
    this.lastFailure = Date.now();
    if (this.failures >= this.failureThreshold) {
      this.state = "OPEN";
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailure: this.lastFailure,
    };
  }
}
```

## 4. リクエストキューイング

```javascript
class RequestQueue {
  constructor(options = {}) {
    this.maxConcurrent = options.maxConcurrent || 5;
    this.requestsPerSecond = options.requestsPerSecond || 10;
    this.queue = [];
    this.running = 0;
    this.lastRequestTime = 0;
  }

  async add(fn, priority = 0) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, priority, resolve, reject });
      this.queue.sort((a, b) => b.priority - a.priority);
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const now = Date.now();
    const minInterval = 1000 / this.requestsPerSecond;
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < minInterval) {
      setTimeout(() => this.processQueue(), minInterval - timeSinceLastRequest);
      return;
    }

    const { fn, resolve, reject } = this.queue.shift();
    this.running++;
    this.lastRequestTime = Date.now();

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.processQueue();
    }
  }
}
```

## 5. プロバイダー別制限

### 主要APIの制限

| プロバイダー | 制限                | 備考             |
| ------------ | ------------------- | ---------------- |
| GitHub       | 5,000 req/hour      | 認証済み         |
| Slack        | 1 req/sec (Web API) | メソッドによる   |
| Google Drive | 12,000 req/min      | プロジェクト単位 |
| Twitter      | 900 req/15min       | エンドポイント別 |
| OpenAI       | 3 req/min (無料)    | プラン依存       |

### プロバイダー別設定例

```javascript
const providerConfigs = {
  github: {
    maxRetries: 3,
    initialDelay: 1000,
    backoffFactor: 2,
    maxConcurrent: 10,
  },
  slack: {
    maxRetries: 5,
    initialDelay: 1100, // 1 req/secに準拠
    backoffFactor: 1.5,
    maxConcurrent: 1,
  },
  openai: {
    maxRetries: 3,
    initialDelay: 20000, // 3 req/minに準拠
    backoffFactor: 2,
    maxConcurrent: 1,
  },
};
```

## 6. モニタリングとアラート

```javascript
class RateLimitMonitor {
  constructor(threshold = 0.2) {
    this.threshold = threshold;
    this.metrics = {
      totalRequests: 0,
      rateLimitHits: 0,
      lastReset: Date.now(),
    };
  }

  recordRequest(wasRateLimited) {
    this.metrics.totalRequests++;
    if (wasRateLimited) {
      this.metrics.rateLimitHits++;
    }

    if (this.getHitRate() > this.threshold) {
      this.alert();
    }
  }

  getHitRate() {
    if (this.metrics.totalRequests === 0) return 0;
    return this.metrics.rateLimitHits / this.metrics.totalRequests;
  }

  alert() {
    console.warn(
      `[RateLimitMonitor] Hit rate ${(this.getHitRate() * 100).toFixed(1)}% exceeds threshold ${this.threshold * 100}%`,
    );
  }

  reset() {
    this.metrics = {
      totalRequests: 0,
      rateLimitHits: 0,
      lastReset: Date.now(),
    };
  }
}
```
