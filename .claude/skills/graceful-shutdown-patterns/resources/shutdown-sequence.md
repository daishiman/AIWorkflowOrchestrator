# シャットダウンシーケンスガイド

## 完全なシャットダウンフロー

```
シグナル受信 (SIGTERM/SIGINT)
        │
        ▼
┌───────────────────┐
│ 1. シャットダウン │
│    フラグ設定     │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ 2. ヘルスチェック │
│    503応答開始    │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ 3. 新規接続拒否   │
│    server.close() │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ 4. 既存リクエスト │
│    完了待機       │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ 5. 外部接続切断   │
│    (API, Queue)   │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ 6. キャッシュ切断 │
│    (Redis, etc)   │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ 7. DB接続切断     │
│                   │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ 8. ログフラッシュ │
│                   │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ 9. process.exit() │
│    終了コード設定 │
└───────────────────┘
```

## 各ステップの詳細

### Step 1: シャットダウンフラグ設定

```javascript
let isShuttingDown = false;

function initiateShutdown(signal) {
  if (isShuttingDown) {
    console.log('Shutdown already in progress, ignoring');
    return;
  }

  isShuttingDown = true;
  console.log(`[${timestamp()}] Shutdown initiated by ${signal}`);

  gracefulShutdown();
}

process.on('SIGTERM', () => initiateShutdown('SIGTERM'));
process.on('SIGINT', () => initiateShutdown('SIGINT'));
```

### Step 2: ヘルスチェック更新

```javascript
// Express middleware
app.get('/health', (req, res) => {
  if (isShuttingDown) {
    // ロードバランサーにシャットダウン中を通知
    res.status(503).json({
      status: 'shutting_down',
      message: 'Service is shutting down'
    });
    return;
  }

  res.json({
    status: 'healthy',
    uptime: process.uptime()
  });
});

// Kubernetes readiness probe
app.get('/ready', (req, res) => {
  if (isShuttingDown) {
    res.status(503).send('NOT READY');
    return;
  }
  res.status(200).send('OK');
});
```

### Step 3: 新規接続拒否

```javascript
async function closeServer() {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        console.error('Error closing server:', err);
        reject(err);
        return;
      }
      console.log('HTTP server closed');
      resolve();
    });

    // 既存接続を追跡
    server.getConnections((err, count) => {
      console.log(`Active connections: ${count}`);
    });
  });
}
```

### Step 4: 既存リクエスト完了待機

```javascript
class RequestTracker {
  constructor() {
    this.activeRequests = 0;
    this.waiters = [];
  }

  middleware() {
    return (req, res, next) => {
      this.activeRequests++;

      res.on('finish', () => {
        this.activeRequests--;
        this.notifyWaiters();
      });

      res.on('close', () => {
        this.activeRequests--;
        this.notifyWaiters();
      });

      next();
    };
  }

  async waitForCompletion(timeoutMs = 30000) {
    if (this.activeRequests === 0) return;

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn(`Timeout: ${this.activeRequests} requests still active`);
        resolve();
      }, timeoutMs);

      this.waiters.push(() => {
        if (this.activeRequests === 0) {
          clearTimeout(timeout);
          resolve();
        }
      });
    });
  }

  notifyWaiters() {
    this.waiters.forEach(fn => fn());
  }
}

const tracker = new RequestTracker();
app.use(tracker.middleware());
```

### Step 5-7: 外部接続・キャッシュ・DB切断

```javascript
class GracefulShutdown {
  constructor() {
    this.cleanupFunctions = [];
  }

  register(name, fn, priority = 50) {
    this.cleanupFunctions.push({ name, fn, priority });
    // 優先度でソート（数値が小さいほど先に実行）
    this.cleanupFunctions.sort((a, b) => a.priority - b.priority);
  }

  async execute() {
    const results = [];

    for (const { name, fn } of this.cleanupFunctions) {
      console.log(`Cleaning up: ${name}`);
      const start = Date.now();

      try {
        await fn();
        results.push({
          name,
          status: 'success',
          duration: Date.now() - start
        });
      } catch (error) {
        results.push({
          name,
          status: 'error',
          error: error.message,
          duration: Date.now() - start
        });
      }
    }

    return results;
  }
}

const shutdown = new GracefulShutdown();

// 優先度: 10 (最初) - HTTPサーバー
shutdown.register('http-server', () => closeServer(), 10);

// 優先度: 20 - リクエスト完了待機
shutdown.register('request-drain', () => tracker.waitForCompletion(), 20);

// 優先度: 30 - 外部API接続
shutdown.register('external-apis', () => apiClient.close(), 30);

// 優先度: 40 - キュー接続
shutdown.register('queue', () => queue.close(), 40);

// 優先度: 50 - キャッシュ
shutdown.register('redis', () => redis.quit(), 50);

// 優先度: 60 - データベース
shutdown.register('database', () => db.close(), 60);
```

### Step 8: ログフラッシュ

```javascript
shutdown.register('logger', async () => {
  // Winston等のロガーをフラッシュ
  if (logger.end) {
    await new Promise(resolve => logger.end(resolve));
  }

  // console.logはstdoutに即座に書き込まれるため
  // 特別な処理は不要だが、念のため少し待機
  await sleep(100);
}, 70);
```

### Step 9: プロセス終了

```javascript
async function gracefulShutdown() {
  console.log('Starting graceful shutdown...');

  // タイムアウト設定
  const timeout = setTimeout(() => {
    console.error('Shutdown timeout, forcing exit');
    process.exit(1);
  }, 30000);

  try {
    const results = await shutdown.execute();

    // 結果サマリー
    const succeeded = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'error').length;
    console.log(`Cleanup complete: ${succeeded} succeeded, ${failed} failed`);

    clearTimeout(timeout);
    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Fatal shutdown error:', error);
    clearTimeout(timeout);
    process.exit(1);
  }
}
```

## タイムアウト戦略

### 段階的タイムアウト

```javascript
const TIMEOUTS = {
  requestDrain: 15000,    // リクエスト完了待機
  externalAPIs: 5000,     // 外部API切断
  cache: 3000,            // キャッシュ切断
  database: 10000,        // DB切断
  total: 30000            // 全体タイムアウト
};

async function gracefulShutdownWithTimeouts() {
  const totalTimeout = setTimeout(() => {
    process.exit(1);
  }, TIMEOUTS.total);

  // 各ステップにタイムアウトを適用
  await withTimeout(
    tracker.waitForCompletion(),
    TIMEOUTS.requestDrain,
    'request drain'
  );

  await withTimeout(
    apiClient.close(),
    TIMEOUTS.externalAPIs,
    'external APIs'
  );

  // ...

  clearTimeout(totalTimeout);
  process.exit(0);
}

function withTimeout(promise, ms, name) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${name} timeout`)), ms)
    )
  ]).catch(err => console.warn(`Warning: ${err.message}`));
}
```

## ロードバランサー連携

### AWS ALB

```
1. ヘルスチェック失敗 (503応答)
2. ターゲットグループからの登録解除 (deregistration_delay)
3. 新規リクエストが来なくなる
4. 既存リクエスト完了
5. プロセス終了
```

### Kubernetes

```yaml
spec:
  containers:
  - name: app
    lifecycle:
      preStop:
        exec:
          command: ["sh", "-c", "sleep 5"]
    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
      periodSeconds: 5
```
