# 接続ドレインガイド

## 接続ドレインとは

接続ドレインは、既存の接続を優雅に終了させながら、新規接続を拒否するプロセスです。
これにより、処理中のリクエストを完了させつつ、安全にサービスを停止できます。

```
ドレイン前:
┌─────────────────────────────────────────┐
│ Server                                   │
│  ┌─ Request 1 (処理中) ───────────┐     │
│  ├─ Request 2 (処理中) ──────┐    │     │
│  ├─ Request 3 (新規) ───┐    │    │     │
│  └─ Request 4 (新規) ─┐ │    │    │     │
└──────────────────────────────────────────┘

ドレイン中:
┌─────────────────────────────────────────┐
│ Server (新規接続拒否)                    │
│  ┌─ Request 1 (処理中) ───────────┐     │
│  └─ Request 2 (処理中) ──────┐    │     │
│     Request 3 → 503 拒否          │     │
│     Request 4 → 503 拒否          │     │
└──────────────────────────────────────────┘

ドレイン後:
┌─────────────────────────────────────────┐
│ Server (すべて完了)                      │
│  Request 1 ✓ 完了                        │
│  Request 2 ✓ 完了                        │
└──────────────────────────────────────────┘
→ process.exit(0)
```

## HTTPサーバーのドレイン

### 基本実装

```javascript
class HttpDrain {
  constructor(server) {
    this.server = server;
    this.connections = new Set();
    this.isClosing = false;

    // 接続を追跡
    server.on("connection", (socket) => {
      this.connections.add(socket);
      socket.on("close", () => {
        this.connections.delete(socket);
      });
    });
  }

  async drain(timeoutMs = 30000) {
    this.isClosing = true;

    // 新規接続を停止
    return new Promise((resolve) => {
      this.server.close(() => {
        console.log("Server stopped accepting connections");
        resolve();
      });

      // 既存接続にタイムアウトを設定
      const timeout = setTimeout(() => {
        console.warn(`Force closing ${this.connections.size} connections`);
        for (const socket of this.connections) {
          socket.destroy();
        }
      }, timeoutMs);

      // すべての接続が閉じたらタイムアウトをクリア
      const checkInterval = setInterval(() => {
        if (this.connections.size === 0) {
          clearInterval(checkInterval);
          clearTimeout(timeout);
        }
      }, 100);
    });
  }

  getActiveConnections() {
    return this.connections.size;
  }
}
```

### Keep-Alive接続の処理

```javascript
// Keep-Alive接続が長時間維持される問題への対処
function configureServerForDrain(server) {
  // Keep-Aliveタイムアウトを設定
  server.keepAliveTimeout = 65000; // 65秒

  // ヘッダータイムアウト（keepAliveTimeoutより長く）
  server.headersTimeout = 66000;

  // ドレイン時にKeep-Aliveを無効化
  server.on("request", (req, res) => {
    if (isShuttingDown) {
      // Connection: close を設定して接続を終了させる
      res.setHeader("Connection", "close");
    }
  });

  return server;
}
```

## WebSocket接続のドレイン

### 優雅な切断

```javascript
class WebSocketDrain {
  constructor(wss) {
    this.wss = wss;
  }

  async drain(timeoutMs = 10000) {
    const disconnectPromises = [];

    // すべてのクライアントに切断を通知
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        disconnectPromises.push(
          new Promise((resolve) => {
            // 切断理由を通知
            client.close(1001, "Server shutting down");

            client.on("close", resolve);

            // タイムアウト後に強制切断
            setTimeout(() => {
              if (client.readyState !== WebSocket.CLOSED) {
                client.terminate();
              }
              resolve();
            }, timeoutMs);
          }),
        );
      }
    });

    await Promise.all(disconnectPromises);
    console.log("All WebSocket clients disconnected");
  }
}
```

### メッセージ送信後の切断

```javascript
async function gracefulWebSocketShutdown(wss) {
  // シャットダウン通知を送信
  const notifyPromises = [];

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      notifyPromises.push(
        new Promise((resolve) => {
          // シャットダウン通知メッセージ
          client.send(
            JSON.stringify({
              type: "server_shutdown",
              message: "Server is shutting down, please reconnect",
            }),
            (err) => {
              if (err) console.warn("Failed to send shutdown message");
              resolve();
            },
          );
        }),
      );
    }
  });

  // 通知送信完了を待機
  await Promise.all(notifyPromises);

  // 少し待機してから切断
  await sleep(1000);

  // 実際の切断処理
  await new WebSocketDrain(wss).drain();
}
```

## データベース接続のドレイン

### コネクションプールのドレイン

```javascript
class DatabaseDrain {
  constructor(pool) {
    this.pool = pool;
    this.activeQueries = 0;
  }

  // クエリをラップして追跡
  async query(sql, params) {
    this.activeQueries++;
    try {
      return await this.pool.query(sql, params);
    } finally {
      this.activeQueries--;
    }
  }

  async drain(timeoutMs = 30000) {
    console.log(
      `Draining database connections (active: ${this.activeQueries})`,
    );

    // 進行中のクエリを待機
    const start = Date.now();
    while (this.activeQueries > 0) {
      if (Date.now() - start > timeoutMs) {
        console.warn(`Timeout: ${this.activeQueries} queries still active`);
        break;
      }
      await sleep(100);
    }

    // プールを閉じる
    await this.pool.end();
    console.log("Database pool closed");
  }
}
```

### トランザクションの考慮

```javascript
class TransactionAwareDrain {
  constructor(pool) {
    this.pool = pool;
    this.activeTransactions = new Set();
  }

  async beginTransaction() {
    const client = await this.pool.connect();
    const txId = Date.now() + Math.random();

    this.activeTransactions.add(txId);

    await client.query("BEGIN");

    // トランザクション完了時にセットから削除
    const originalRelease = client.release.bind(client);
    client.release = () => {
      this.activeTransactions.delete(txId);
      originalRelease();
    };

    return client;
  }

  async drain(timeoutMs = 60000) {
    console.log(`Waiting for ${this.activeTransactions.size} transactions`);

    const start = Date.now();
    while (this.activeTransactions.size > 0) {
      if (Date.now() - start > timeoutMs) {
        console.error(
          `Transaction drain timeout: ${this.activeTransactions.size} active`,
        );
        // 警告: 強制終了するとデータ不整合の可能性
        break;
      }
      await sleep(500);
    }

    await this.pool.end();
  }
}
```

## メッセージキューのドレイン

### RabbitMQ

```javascript
async function drainRabbitMQ(channel, queue) {
  // 新しいメッセージの取得を停止
  await channel.cancel(consumerTag);

  // 処理中のメッセージを完了させる
  // (ACKされていないメッセージは再キューされる)

  // チャンネルを閉じる
  await channel.close();
}
```

### Bull Queue

```javascript
async function drainBullQueue(queue) {
  // 新規ジョブの受け入れを停止
  await queue.pause(true);

  // 処理中のジョブを完了させる
  console.log("Waiting for active jobs to complete...");

  // 完了待機（isIdleがtrueになるまで）
  const waitForIdle = () =>
    new Promise((resolve) => {
      const check = setInterval(async () => {
        const counts = await queue.getJobCounts();
        if (counts.active === 0) {
          clearInterval(check);
          resolve();
        }
      }, 1000);
    });

  await waitForIdle();

  // キューを閉じる
  await queue.close();
}
```

## ロードバランサーとの連携

### AWS ELB/ALB

```
ドレインプロセス:
1. ELBがヘルスチェック失敗を検出 (503応答)
2. ターゲットの登録解除開始
3. deregistration_delay期間、既存接続を維持
4. 新規接続は他のターゲットへ
5. deregistration_delay経過後、接続を閉じる
```

```javascript
// 推奨: ヘルスチェックで503を返す
app.get("/health", (req, res) => {
  if (isShuttingDown) {
    res.status(503).json({ status: "draining" });
    return;
  }
  res.json({ status: "healthy" });
});
```

### Nginx

```nginx
# upstream設定でドレインをサポート
upstream backend {
    server app1:3000 weight=5;
    server app2:3000 weight=5 backup;  # バックアップサーバー
}

# graceful shutdown時は
# 1. server app1:3000 down; に変更
# 2. nginx -s reload
```

## ドレイン状態の監視

```javascript
class DrainMonitor {
  constructor() {
    this.metrics = {
      httpConnections: 0,
      wsConnections: 0,
      dbQueries: 0,
      queueJobs: 0,
    };
  }

  update(key, value) {
    this.metrics[key] = value;
  }

  log() {
    console.log("Drain status:", JSON.stringify(this.metrics));
  }

  isFullyDrained() {
    return Object.values(this.metrics).every((v) => v === 0);
  }
}

const monitor = new DrainMonitor();

// 定期的にログ出力
const drainLogger = setInterval(() => {
  if (isShuttingDown) {
    monitor.log();
    if (monitor.isFullyDrained()) {
      clearInterval(drainLogger);
    }
  }
}, 1000);
```
