# プロセス状態管理ガイド

## プロセスのライフサイクル

```
┌─────────────┐
│   Created   │ ← プロセス生成
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Starting  │ ← 初期化フェーズ
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Running   │ ← 通常動作
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Stopping   │ ← シャットダウン
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Stopped   │ ← 終了
└─────────────┘
```

## 各状態の詳細

### 1. Created（生成）

**発生タイミング**:

- `pm2 start` コマンド実行
- システム起動時の自動起動
- クラッシュ後の再起動

**この状態での動作**:

- プロセスIDの割り当て
- 環境変数の継承
- 作業ディレクトリの設定

### 2. Starting（起動中）

**起動シーケンス**:

```javascript
// 1. 環境変数の検証
function validateEnvironment() {
  const required = ["NODE_ENV", "PORT"];
  const missing = required.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.error(`Missing env vars: ${missing.join(", ")}`);
    process.exit(2);
  }
}

// 2. 設定の読み込み
function loadConfig() {
  try {
    return require("./config");
  } catch (error) {
    console.error("Config load failed:", error.message);
    process.exit(2);
  }
}

// 3. サービス初期化
async function initializeServices() {
  await connectDatabase();
  await connectCache();
  await initializeQueues();
}

// 4. サーバー起動
async function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    // PM2にready通知
    process.send && process.send("ready");
  });
  return server;
}
```

**起動タイムアウト設定**:

```javascript
// ecosystem.config.js
{
  listen_timeout: 10000,  // 10秒
  wait_ready: true
}
```

### 3. Running（実行中）

**ヘルスモニタリング**:

```javascript
// メトリクス収集
const getMetrics = () => ({
  timestamp: Date.now(),
  pid: process.pid,
  uptime: process.uptime(),
  memory: {
    heapUsed: process.memoryUsage().heapUsed,
    heapTotal: process.memoryUsage().heapTotal,
    rss: process.memoryUsage().rss,
    external: process.memoryUsage().external,
  },
  cpu: process.cpuUsage(),
  eventLoopLag: measureEventLoopLag(),
});

// イベントループ遅延測定
function measureEventLoopLag() {
  const start = process.hrtime.bigint();
  setImmediate(() => {
    const delta = process.hrtime.bigint() - start;
    return Number(delta) / 1e6; // ミリ秒
  });
}
```

**定期ヘルスチェック**:

```javascript
setInterval(() => {
  const metrics = getMetrics();

  // メモリ使用量チェック
  if (metrics.memory.heapUsed > MEMORY_THRESHOLD) {
    console.warn("High memory usage detected");
  }

  // イベントループ遅延チェック
  if (metrics.eventLoopLag > 100) {
    console.warn("Event loop lag detected");
  }
}, 30000); // 30秒間隔
```

### 4. Stopping（停止中）

**シャットダウンシーケンス**:

```javascript
async function gracefulShutdown(signal) {
  console.log(`${signal} received, starting graceful shutdown...`);

  // 1. 新規接続の拒否
  server.close(() => {
    console.log("HTTP server closed");
  });

  // 2. タイムアウト設定
  const shutdownTimeout = setTimeout(() => {
    console.error("Shutdown timeout, forcing exit");
    process.exit(1);
  }, 30000);

  try {
    // 3. 進行中リクエストの完了待機
    await waitForPendingRequests();

    // 4. データベース接続クローズ
    await closeDatabase();

    // 5. キャッシュ接続クローズ
    await closeCache();

    // 6. キュー接続クローズ
    await closeQueues();

    clearTimeout(shutdownTimeout);
    console.log("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("Shutdown error:", error);
    process.exit(1);
  }
}
```

### 5. Stopped（停止）

**終了コード**:
| コード | 意味 | 原因 |
|-------|------|------|
| 0 | 正常終了 | Graceful shutdown成功 |
| 1 | 一般エラー | 予期しないエラー |
| 2 | 設定エラー | 環境変数・設定不備 |
| 130 | SIGINT | Ctrl+C |
| 137 | SIGKILL | OOMKiller, kill -9 |
| 143 | SIGTERM | kill, PM2 stop |

## PM2のプロセス状態

### PM2状態遷移

```
                    ┌──────────────────┐
                    │     online       │
    pm2 start       │                  │     crash/max_restarts
   ────────────────►│  ◄────────────►  │────────────────────┐
                    │    autorestart   │                    │
                    └────────┬─────────┘                    │
                             │                              │
                    pm2 stop │ pm2 restart                  │
                             │                              │
                             ▼                              ▼
                    ┌──────────────────┐          ┌────────────────┐
                    │     stopped      │          │    errored     │
                    └──────────────────┘          └────────────────┘
```

### PM2状態一覧

| 状態              | 説明       | pm2 listの表示 |
| ----------------- | ---------- | -------------- |
| online            | 正常稼働中 | 🟢 online      |
| stopping          | 停止処理中 | 🟡 stopping    |
| stopped           | 停止済み   | ⚫ stopped     |
| launching         | 起動処理中 | 🟡 launching   |
| errored           | エラー状態 | 🔴 errored     |
| one-launch-status | 一度起動   | -              |

### 状態確認コマンド

```bash
# 一覧表示
pm2 list

# 詳細表示
pm2 describe <app-name>

# リアルタイム監視
pm2 monit
```

## トラブルシューティング

### 起動に失敗する場合

1. **ログ確認**:

   ```bash
   pm2 logs <app-name> --lines 100
   ```

2. **環境変数確認**:

   ```bash
   pm2 env <app-name>
   ```

3. **dry-run実行**:
   ```bash
   pm2 start ecosystem.config.js --dry-run
   ```

### 頻繁に再起動する場合

1. **再起動回数確認**:

   ```bash
   pm2 describe <app-name> | grep restart
   ```

2. **min_uptime調整**:

   ```javascript
   {
     min_uptime: "30s";
   } // 起動成功判定時間を延長
   ```

3. **エラーログ分析**:
   ```bash
   pm2 logs <app-name> --err --lines 200
   ```
