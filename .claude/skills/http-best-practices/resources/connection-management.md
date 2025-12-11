# Connection Management（コネクション管理）

## 概要

HTTP接続の効率的な管理は、アプリケーションのパフォーマンスとリソース使用量に直接影響します。
Keep-Alive、コネクションプーリング、HTTP/2の活用など、最適化手法を解説します。

## HTTP/1.1 Keep-Alive

### 基本概念

```
Without Keep-Alive:
Request 1: [TCP Handshake] → Request → Response → [Close]
Request 2: [TCP Handshake] → Request → Response → [Close]
Request 3: [TCP Handshake] → Request → Response → [Close]

With Keep-Alive:
[TCP Handshake] → Request 1 → Response 1
               → Request 2 → Response 2
               → Request 3 → Response 3 → [Close]
```

### Node.js設定

```typescript
import http from "http";
import https from "https";

// HTTPエージェント設定
const httpAgent = new http.Agent({
  keepAlive: true, // コネクション再利用を有効化
  keepAliveMsecs: 30000, // Keep-Alive間隔（30秒）
  maxSockets: 50, // ホストあたり最大同時接続数
  maxFreeSockets: 10, // 待機コネクション数
  timeout: 60000, // ソケットタイムアウト
});

// HTTPSエージェント設定
const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
  // TLS設定
  rejectUnauthorized: true, // 証明書検証
  minVersion: "TLSv1.2",
});

// fetch使用時
const response = await fetch(url, {
  agent: url.startsWith("https") ? httpsAgent : httpAgent,
});
```

### axios設定

```typescript
import axios from "axios";
import http from "http";
import https from "https";

const client = axios.create({
  httpAgent: new http.Agent({
    keepAlive: true,
    maxSockets: 50,
  }),
  httpsAgent: new https.Agent({
    keepAlive: true,
    maxSockets: 50,
  }),
  timeout: 30000,
});
```

## コネクションプーリング

### プール設計

```typescript
interface PoolConfig {
  maxConnections: number; // 最大接続数
  minConnections: number; // 最小維持接続数
  maxIdleTime: number; // アイドルタイムアウト
  acquireTimeout: number; // 取得待ちタイムアウト
  createRetryInterval: number; // 作成リトライ間隔
}

const DEFAULT_POOL_CONFIG: PoolConfig = {
  maxConnections: 50,
  minConnections: 5,
  maxIdleTime: 30000,
  acquireTimeout: 10000,
  createRetryInterval: 200,
};
```

### 汎用コネクションプール

```typescript
class ConnectionPool<T> {
  private readonly available: T[] = [];
  private readonly inUse: Set<T> = new Set();
  private readonly waiting: Array<{
    resolve: (conn: T) => void;
    reject: (err: Error) => void;
    timer: NodeJS.Timeout;
  }> = [];

  constructor(
    private readonly config: PoolConfig,
    private readonly factory: () => Promise<T>,
    private readonly destroyer: (conn: T) => Promise<void>,
  ) {
    // 最小接続数を事前作成
    this.warmUp();
  }

  private async warmUp(): Promise<void> {
    for (let i = 0; i < this.config.minConnections; i++) {
      try {
        const conn = await this.factory();
        this.available.push(conn);
      } catch (error) {
        console.error("Failed to warm up connection:", error);
      }
    }
  }

  async acquire(): Promise<T> {
    // 利用可能な接続があれば即座に返す
    if (this.available.length > 0) {
      const conn = this.available.pop()!;
      this.inUse.add(conn);
      return conn;
    }

    // 最大接続数に達していなければ新規作成
    if (this.inUse.size < this.config.maxConnections) {
      const conn = await this.factory();
      this.inUse.add(conn);
      return conn;
    }

    // 待機キューに追加
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const index = this.waiting.findIndex((w) => w.resolve === resolve);
        if (index !== -1) {
          this.waiting.splice(index, 1);
          reject(new Error("Connection acquire timeout"));
        }
      }, this.config.acquireTimeout);

      this.waiting.push({ resolve, reject, timer });
    });
  }

  release(conn: T): void {
    this.inUse.delete(conn);

    // 待機中のリクエストがあれば割り当て
    if (this.waiting.length > 0) {
      const waiter = this.waiting.shift()!;
      clearTimeout(waiter.timer);
      this.inUse.add(conn);
      waiter.resolve(conn);
      return;
    }

    // プールに戻す
    this.available.push(conn);
  }

  async destroy(conn: T): Promise<void> {
    this.inUse.delete(conn);
    await this.destroyer(conn);
  }

  getStats(): {
    available: number;
    inUse: number;
    waiting: number;
  } {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      waiting: this.waiting.length,
    };
  }
}
```

## HTTP/2マルチプレキシング

### 概念

```
HTTP/1.1 (6 connections max per host):
Conn 1: [Request A] -----> [Response A]
Conn 2: [Request B] -----> [Response B]
Conn 3: [Request C] -----> [Response C]

HTTP/2 (single connection, multiplexed):
Single Connection:
  Stream 1: [Request A frames] → [Response A frames]
  Stream 2: [Request B frames] → [Response B frames]
  Stream 3: [Request C frames] → [Response C frames]
  (すべて同時に送受信可能)
```

### Node.js HTTP/2クライアント

```typescript
import http2 from "http2";

class Http2Client {
  private session: http2.ClientHttp2Session | null = null;
  private connecting = false;
  private readonly pendingRequests: Array<() => void> = [];

  constructor(
    private readonly authority: string,
    private readonly options: http2.SecureClientSessionOptions = {},
  ) {}

  private async connect(): Promise<http2.ClientHttp2Session> {
    if (this.session && !this.session.closed) {
      return this.session;
    }

    if (this.connecting) {
      return new Promise((resolve) => {
        this.pendingRequests.push(() => resolve(this.session!));
      });
    }

    this.connecting = true;

    return new Promise((resolve, reject) => {
      this.session = http2.connect(this.authority, this.options);

      this.session.on("connect", () => {
        this.connecting = false;
        this.pendingRequests.forEach((cb) => cb());
        this.pendingRequests.length = 0;
        resolve(this.session!);
      });

      this.session.on("error", (err) => {
        this.connecting = false;
        this.session = null;
        reject(err);
      });

      this.session.on("close", () => {
        this.session = null;
      });
    });
  }

  async request(
    path: string,
    options: {
      method?: string;
      headers?: http2.OutgoingHttpHeaders;
      body?: string | Buffer;
    } = {},
  ): Promise<{
    status: number;
    headers: http2.IncomingHttpHeaders;
    body: string;
  }> {
    const session = await this.connect();

    return new Promise((resolve, reject) => {
      const req = session.request({
        ":path": path,
        ":method": options.method || "GET",
        ...options.headers,
      });

      let status = 0;
      let headers: http2.IncomingHttpHeaders = {};
      const chunks: Buffer[] = [];

      req.on("response", (hdrs) => {
        status = hdrs[":status"] as number;
        headers = hdrs;
      });

      req.on("data", (chunk) => {
        chunks.push(chunk);
      });

      req.on("end", () => {
        resolve({
          status,
          headers,
          body: Buffer.concat(chunks).toString("utf8"),
        });
      });

      req.on("error", reject);

      if (options.body) {
        req.write(options.body);
      }
      req.end();
    });
  }

  close(): void {
    if (this.session) {
      this.session.close();
      this.session = null;
    }
  }
}

// 使用例
const client = new Http2Client("https://api.example.com");

// 並列リクエスト（単一コネクションで多重化）
const results = await Promise.all([
  client.request("/api/users"),
  client.request("/api/orders"),
  client.request("/api/products"),
]);
```

## タイムアウト設計

### タイムアウト階層

```typescript
interface TimeoutConfig {
  // 接続確立タイムアウト
  connect: number; // デフォルト: 5000ms

  // ソケットアイドルタイムアウト
  socket: number; // デフォルト: 30000ms

  // 全体タイムアウト
  request: number; // デフォルト: 60000ms

  // DNS解決タイムアウト
  lookup: number; // デフォルト: 5000ms
}

const DEFAULT_TIMEOUTS: TimeoutConfig = {
  connect: 5000,
  socket: 30000,
  request: 60000,
  lookup: 5000,
};
```

### タイムアウト付きfetch

```typescript
async function fetchWithTimeouts(
  url: string,
  options: RequestInit & { timeouts?: Partial<TimeoutConfig> } = {},
): Promise<Response> {
  const timeouts = { ...DEFAULT_TIMEOUTS, ...options.timeouts };

  const controller = new AbortController();

  // 全体タイムアウト
  const requestTimeout = setTimeout(() => {
    controller.abort(new Error(`Request timeout after ${timeouts.request}ms`));
  }, timeouts.request);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(requestTimeout);
  }
}
```

## コネクションヘルスチェック

### ヘルスチェック実装

```typescript
class ConnectionHealthChecker {
  private readonly checkInterval: NodeJS.Timer;

  constructor(
    private readonly pool: ConnectionPool<unknown>,
    private readonly healthCheck: (conn: unknown) => Promise<boolean>,
    private readonly intervalMs = 30000,
  ) {
    this.checkInterval = setInterval(() => this.check(), intervalMs);
  }

  private async check(): Promise<void> {
    const stats = this.pool.getStats();
    console.log("Connection pool stats:", stats);

    // 利用可能な接続のヘルスチェック
    // 実装は具体的なプールの内部構造に依存
  }

  stop(): void {
    clearInterval(this.checkInterval);
  }
}
```

## メトリクス収集

### 収集すべきメトリクス

```typescript
interface ConnectionMetrics {
  // プール状態
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;

  // パフォーマンス
  avgAcquireTimeMs: number;
  avgReleaseTimeMs: number;

  // エラー
  connectionErrors: number;
  timeoutErrors: number;

  // 履歴
  totalCreated: number;
  totalDestroyed: number;
}

class MetricsCollector {
  private metrics: ConnectionMetrics = {
    activeConnections: 0,
    idleConnections: 0,
    waitingRequests: 0,
    avgAcquireTimeMs: 0,
    avgReleaseTimeMs: 0,
    connectionErrors: 0,
    timeoutErrors: 0,
    totalCreated: 0,
    totalDestroyed: 0,
  };

  record(event: string, value: number): void {
    switch (event) {
      case "acquire_time":
        this.updateAverage("avgAcquireTimeMs", value);
        break;
      case "connection_error":
        this.metrics.connectionErrors++;
        break;
      case "timeout_error":
        this.metrics.timeoutErrors++;
        break;
    }
  }

  private updateAverage(key: keyof ConnectionMetrics, value: number): void {
    const current = this.metrics[key] as number;
    this.metrics[key] = (current * 0.9 + value * 0.1) as never;
  }

  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }
}
```

## チェックリスト

### 設計時

- [ ] 想定同時接続数を算出したか？
- [ ] HTTP/2対応を検討したか？
- [ ] タイムアウト値を決定したか？

### 実装時

- [ ] Keep-Aliveを有効化したか？
- [ ] コネクションプールを設定したか？
- [ ] グレースフルシャットダウンを実装したか？

### 運用時

- [ ] コネクション数をモニタリングしているか？
- [ ] コネクションリークを検出できるか？
- [ ] エラー率にアラートを設定しているか？

## アンチパターン

### ❌ コネクション使い捨て

```typescript
// NG: 毎回新規接続
async function fetchData() {
  const response = await fetch(url); // Keep-Aliveなし
  return response.json();
}
```

### ❌ 無制限のコネクション

```typescript
// NG: 上限なし
const agent = new http.Agent({
  maxSockets: Infinity, // 危険
});
```

### ❌ クリーンアップなし

```typescript
// NG: プロセス終了時にコネクションが残る
const pool = new ConnectionPool();
// process.on('SIGTERM', () => pool.close()) がない
```

## 参考

- **RFC 9110**: HTTP Semantics
- **RFC 9113**: HTTP/2
- **Node.js Docs**: http.Agent, http2
