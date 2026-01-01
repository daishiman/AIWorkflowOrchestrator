# Level 3: Advanced Graceful Shutdown

## 対象者

複雑なシステムでのシャットダウン実装を行う開発者

## 学習目標

- 分散システムでの調整シャットダウン
- カスケード障害の防止
- 状態永続化と復旧

---

## 1. 分散システムのシャットダウン調整

### 問題：同時シャットダウンによるサービス停止

複数インスタンスが同時にシャットダウンすると、サービス全体が停止する。

### 解決：Staggered Shutdown（段階的シャットダウン）

```typescript
import { createClient } from "redis";

const redis = createClient();
const SHUTDOWN_KEY = "shutdown:coordination";
const INSTANCE_ID = process.env.INSTANCE_ID || generateId();

async function coordinatedShutdown() {
  // 1. 他のインスタンスのシャットダウン状況を確認
  const shuttingDown = await redis.sMembers(SHUTDOWN_KEY);
  const totalInstances = await redis.get("instances:count");

  // 2. 過半数がシャットダウン中なら待機
  if (shuttingDown.length >= parseInt(totalInstances) / 2) {
    console.log("Too many instances shutting down, waiting...");
    await new Promise((resolve) => setTimeout(resolve, 30000));
  }

  // 3. シャットダウン開始を通知
  await redis.sAdd(SHUTDOWN_KEY, INSTANCE_ID);

  // 4. 通常のシャットダウンフロー
  await gracefulShutdown();

  // 5. 完了を通知
  await redis.sRem(SHUTDOWN_KEY, INSTANCE_ID);
}
```

---

## 2. カスケード障害の防止

### Circuit Breaker との統合

```typescript
import CircuitBreaker from "opossum";

const breaker = new CircuitBreaker(asyncFunction, {
  timeout: 3000,
  errorThresholdPercentage: 50,
});

async function gracefulShutdown() {
  // Circuit Breaker を開いて新規リクエストを即座に拒否
  breaker.open();

  // 既存リクエストの完了待機
  await drainRequests();

  // リソースクリーンアップ
  await cleanup();
}
```

### Bulkhead Pattern による隔離

```typescript
class ResourceManager {
  private pools = new Map<string, any>();

  async shutdownPool(poolName: string, timeout: number) {
    const pool = this.pools.get(poolName);
    if (!pool) return;

    try {
      await withTimeout(pool.close(), timeout, `Pool ${poolName}`);
      console.log(`${poolName} closed successfully`);
    } catch (error) {
      console.error(`${poolName} shutdown failed:`, error);
      // 他のプールに影響させない
    }
  }

  async shutdownAll() {
    // 並行してすべてのプールを停止（隔離）
    await Promise.allSettled([
      this.shutdownPool("db-primary", 5000),
      this.shutdownPool("db-replica", 5000),
      this.shutdownPool("redis", 3000),
      this.shutdownPool("elasticsearch", 5000),
    ]);
  }
}
```

---

## 3. 状態永続化と復旧

### 処理中データの保存

```typescript
interface ShutdownState {
  activeJobs: JobState[];
  pendingRequests: RequestState[];
  timestamp: number;
}

async function gracefulShutdown() {
  // 1. 現在の状態を収集
  const state: ShutdownState = {
    activeJobs: await collectActiveJobs(),
    pendingRequests: await collectPendingRequests(),
    timestamp: Date.now(),
  };

  // 2. 状態をストレージに保存
  await fs.writeFile("/var/lib/app/shutdown-state.json", JSON.stringify(state));

  // 3. 通常のクリーンアップ
  await cleanup();

  process.exit(0);
}

// 起動時に復旧
async function recoverState() {
  try {
    const data = await fs.readFile("/var/lib/app/shutdown-state.json", "utf-8");
    const state: ShutdownState = JSON.parse(data);

    // 5分以内の状態のみ復旧
    if (Date.now() - state.timestamp < 5 * 60 * 1000) {
      await reprocessJobs(state.activeJobs);
      await reprocessRequests(state.pendingRequests);
    }
  } catch (error) {
    console.log("No state to recover");
  }
}
```

---

## 4. リーダー選出システムとの連携

### etcd/ZooKeeper でのリーダーシップ放棄

```typescript
import { Etcd3 } from "etcd3";

const client = new Etcd3();
const lease = client.lease(10); // 10秒TTL

async function acquireLeadership() {
  await lease.put("leader").value(INSTANCE_ID).exec();
}

async function gracefulShutdown() {
  console.log("Releasing leadership...");

  // 1. リーダーシップを放棄
  await lease.revoke();

  // 2. 他のインスタンスがリーダーになるまで待機
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 3. 通常のシャットダウン
  await cleanup();
  process.exit(0);
}
```

---

## 5. WebSocket/長時間接続の管理

### 接続ごとの優雅な切断

```typescript
import WebSocket from "ws";

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Set<WebSocket>();

wss.on("connection", (ws) => {
  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
});

async function gracefulShutdown() {
  console.log(`Closing ${clients.size} WebSocket connections...`);

  // 1. クライアントに終了通知を送信
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "server_shutdown" }));
    }
  }

  // 2. クライアントが切断するまで待機（最大10秒）
  const start = Date.now();
  while (clients.size > 0 && Date.now() - start < 10000) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // 3. 残存接続を強制切断
  for (const client of clients) {
    client.terminate();
  }

  console.log("All WebSocket connections closed");
}
```

---

## 6. メトリクスとモニタリング

### Prometheus メトリクスの記録

```typescript
import { register, Counter, Histogram } from "prom-client";

const shutdownCounter = new Counter({
  name: "app_shutdown_total",
  help: "Total number of shutdown attempts",
  labelNames: ["result"],
});

const shutdownDuration = new Histogram({
  name: "app_shutdown_duration_seconds",
  help: "Time taken to shutdown",
  buckets: [1, 5, 10, 30, 60],
});

async function gracefulShutdown() {
  const end = shutdownDuration.startTimer();

  try {
    await cleanup();
    shutdownCounter.inc({ result: "success" });
    end();
    process.exit(0);
  } catch (error) {
    shutdownCounter.inc({ result: "failure" });
    end();
    process.exit(1);
  }
}
```

---

## 7. 実装チェックリスト（Level 3）

- [ ] 分散システムでの調整機構
- [ ] Circuit Breaker 統合
- [ ] 状態永続化と復旧処理
- [ ] リーダーシップ放棄
- [ ] WebSocket/長時間接続の優雅な切断
- [ ] シャットダウンメトリクス記録
- [ ] カスケード障害防止策

---

## 次のステップ

Level 3をマスターしたら、Level 4へ：

- 高可用性システムのゼロダウンタイムデプロイ
- マルチリージョン対応
- カオスエンジニアリング
