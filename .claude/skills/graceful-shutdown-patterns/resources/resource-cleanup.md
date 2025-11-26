# リソースクリーンアップガイド

## クリーンアップ対象一覧

| カテゴリ | リソース | クリーンアップ方法 |
|---------|---------|-------------------|
| ネットワーク | HTTPサーバー | server.close() |
| ネットワーク | WebSocket | ws.close() |
| ネットワーク | TCP接続 | socket.destroy() |
| データ | DBコネクション | pool.end() |
| データ | Redisクライアント | client.quit() |
| データ | ファイルハンドル | fs.close() |
| 非同期 | タイマー | clearTimeout/Interval |
| 非同期 | イベントリスナー | removeAllListeners |
| プロセス | 子プロセス | child.kill() |

## データベース接続のクリーンアップ

### PostgreSQL (pg)

```javascript
const { Pool } = require('pg');
const pool = new Pool(config);

async function cleanupDatabase() {
  // 進行中のクエリを待機
  await pool.end();
  console.log('PostgreSQL pool closed');
}
```

### MySQL (mysql2)

```javascript
const mysql = require('mysql2/promise');
const pool = mysql.createPool(config);

async function cleanupDatabase() {
  await pool.end();
  console.log('MySQL pool closed');
}
```

### MongoDB

```javascript
const { MongoClient } = require('mongodb');
const client = new MongoClient(uri);

async function cleanupDatabase() {
  await client.close();
  console.log('MongoDB connection closed');
}
```

### Drizzle ORM

```javascript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool(config);
const db = drizzle(pool);

async function cleanupDatabase() {
  await pool.end();
  console.log('Drizzle/PostgreSQL pool closed');
}
```

## キャッシュ接続のクリーンアップ

### Redis (ioredis)

```javascript
const Redis = require('ioredis');
const redis = new Redis(config);

async function cleanupRedis() {
  // 保留中のコマンドを完了
  await redis.quit();
  console.log('Redis connection closed gracefully');
}

// 強制切断が必要な場合
function forceCloseRedis() {
  redis.disconnect();
}
```

### Redis Cluster

```javascript
const cluster = new Redis.Cluster(nodes, options);

async function cleanupRedisCluster() {
  await cluster.quit();
  console.log('Redis Cluster connections closed');
}
```

## メッセージキューのクリーンアップ

### RabbitMQ (amqplib)

```javascript
const amqp = require('amqplib');

let connection;
let channel;

async function cleanupRabbitMQ() {
  // チャンネルを先に閉じる
  if (channel) {
    await channel.close();
    console.log('RabbitMQ channel closed');
  }

  // 接続を閉じる
  if (connection) {
    await connection.close();
    console.log('RabbitMQ connection closed');
  }
}
```

### Bull Queue

```javascript
const Queue = require('bull');
const queue = new Queue('my-queue');

async function cleanupBullQueue() {
  // 処理中のジョブを待機
  await queue.close();
  console.log('Bull queue closed');
}
```

## HTTPサーバーのクリーンアップ

### Express

```javascript
const express = require('express');
const app = express();
let server;

// サーバー起動
function startServer() {
  server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });

  // キープアライブ接続のタイムアウト設定
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  return server;
}

// クリーンアップ
async function cleanupServer() {
  if (!server) return;

  return new Promise((resolve, reject) => {
    // 新規接続を停止
    server.close((err) => {
      if (err) {
        console.error('Server close error:', err);
        reject(err);
        return;
      }
      console.log('HTTP server closed');
      resolve();
    });

    // 既存接続を追跡してタイムアウト短縮
    server.setTimeout(5000);
  });
}
```

### HTTP/2

```javascript
const http2 = require('http2');
const server = http2.createSecureServer(options);

async function cleanupHttp2Server() {
  return new Promise((resolve) => {
    server.close(() => {
      console.log('HTTP/2 server closed');
      resolve();
    });
  });
}
```

## WebSocketのクリーンアップ

### ws

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

async function cleanupWebSocket() {
  // すべてのクライアントに切断を通知
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.close(1001, 'Server shutting down');
    }
  });

  // サーバーを閉じる
  return new Promise((resolve) => {
    wss.close(() => {
      console.log('WebSocket server closed');
      resolve();
    });
  });
}
```

### Socket.IO

```javascript
const { Server } = require('socket.io');
const io = new Server(httpServer);

async function cleanupSocketIO() {
  // すべてのクライアントを切断
  io.disconnectSockets(true);

  // サーバーを閉じる
  await io.close();
  console.log('Socket.IO server closed');
}
```

## タイマーとインターバルのクリーンアップ

### タイマー管理クラス

```javascript
class TimerRegistry {
  constructor() {
    this.timeouts = new Set();
    this.intervals = new Set();
  }

  setTimeout(callback, delay, ...args) {
    const id = setTimeout(() => {
      this.timeouts.delete(id);
      callback(...args);
    }, delay);
    this.timeouts.add(id);
    return id;
  }

  setInterval(callback, delay, ...args) {
    const id = setInterval(callback, delay, ...args);
    this.intervals.add(id);
    return id;
  }

  clearTimeout(id) {
    clearTimeout(id);
    this.timeouts.delete(id);
  }

  clearInterval(id) {
    clearInterval(id);
    this.intervals.delete(id);
  }

  clearAll() {
    this.timeouts.forEach(id => clearTimeout(id));
    this.intervals.forEach(id => clearInterval(id));
    this.timeouts.clear();
    this.intervals.clear();
    console.log('All timers cleared');
  }
}

const timers = new TimerRegistry();
```

## ファイルハンドルのクリーンアップ

```javascript
const fs = require('fs').promises;
const openFiles = new Set();

async function openFile(path, flags) {
  const handle = await fs.open(path, flags);
  openFiles.add(handle);
  return handle;
}

async function cleanupFiles() {
  const promises = [];

  for (const handle of openFiles) {
    promises.push(
      handle.close()
        .then(() => openFiles.delete(handle))
        .catch(err => console.error('File close error:', err))
    );
  }

  await Promise.all(promises);
  console.log('All file handles closed');
}
```

## 子プロセスのクリーンアップ

```javascript
const { spawn } = require('child_process');
const children = new Set();

function spawnChild(command, args) {
  const child = spawn(command, args);
  children.add(child);

  child.on('exit', () => {
    children.delete(child);
  });

  return child;
}

async function cleanupChildren() {
  const promises = [];

  for (const child of children) {
    promises.push(new Promise((resolve) => {
      child.on('exit', resolve);
      child.kill('SIGTERM');

      // タイムアウト後に強制終了
      setTimeout(() => {
        if (!child.killed) {
          child.kill('SIGKILL');
        }
      }, 5000);
    }));
  }

  await Promise.all(promises);
  console.log('All child processes terminated');
}
```

## クリーンアップの順序

```
1. 新規接続の停止
   └─ server.close(), wss.close()

2. 進行中リクエストの完了待機
   └─ activeRequests === 0 を待つ

3. メッセージキュー
   └─ queue.close() - 未処理メッセージを処理

4. キャッシュ
   └─ redis.quit() - ファイナライズを待つ

5. データベース
   └─ pool.end() - コネクションを閉じる

6. タイマー
   └─ clearTimeout/Interval

7. ファイルハンドル
   └─ fs.close()

8. 子プロセス
   └─ child.kill()
```
