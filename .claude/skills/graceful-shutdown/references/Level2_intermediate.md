# Level 2: Intermediate Graceful Shutdown

## 対象者

基本実装済み、リクエストドレイニングと複数リソース管理を学びたい開発者

## 学習目標

- 既存リクエストの完了待機（ドレイニング）
- 複数リソースの順序制御
- ヘルスチェックとの連携

---

## 1. リクエストドレイニング

### 概念

新規リクエストを拒否しつつ、既存リクエストの完了を待つ。

### Express.js での実装

```typescript
import express from "express";
import { Server } from "http";

const app = express();
let server: Server;
let isShuttingDown = false;

// ミドルウェア: シャットダウン中は503を返す
app.use((req, res, next) => {
  if (isShuttingDown) {
    res.status(503).send("Server is shutting down");
    return;
  }
  next();
});

server = app.listen(3000);

// アクティブな接続を追跡
const activeConnections = new Set<any>();

server.on("connection", (conn) => {
  activeConnections.add(conn);
  conn.on("close", () => activeConnections.delete(conn));
});

async function gracefulShutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log("Starting graceful shutdown...");

  // Step 1: 新規接続を拒否
  server.close(() => {
    console.log("Server stopped accepting connections");
  });

  // Step 2: 既存接続の完了を待つ（最大15秒）
  const maxWait = 15000;
  const start = Date.now();

  while (activeConnections.size > 0) {
    if (Date.now() - start > maxWait) {
      console.warn(
        `Timeout: ${activeConnections.size} connections still active`,
      );
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("All connections closed");
  process.exit(0);
}
```

---

## 2. 複数リソースの順序制御

### 依存関係を考慮した解放順序

```typescript
async function gracefulShutdown() {
  const timeout = setTimeout(() => process.exit(1), 30000);

  try {
    // Step 1: 新規リクエスト拒否
    await stopAcceptingRequests();

    // Step 2: 既存リクエスト完了待機
    await drainActiveRequests(15000);

    // Step 3: バックグラウンドジョブ停止
    await stopBackgroundJobs(5000);

    // Step 4: キャッシュ/Redis接続解放
    await cache.quit();

    // Step 5: データベース接続解放（最後）
    await db.end();

    // Step 6: ログフラッシュ
    await logger.flush();

    clearTimeout(timeout);
    process.exit(0);
  } catch (error) {
    console.error("Shutdown error:", error);
    clearTimeout(timeout);
    process.exit(1);
  }
}
```

### Promise.allSettled による並行クリーンアップ

```typescript
// 依存関係のないリソースは並行処理
const results = await Promise.allSettled([
  cache.quit(),
  messageQueue.close(),
  metrics.flush(),
]);

// 失敗したリソースをログ
results.forEach((result, index) => {
  if (result.status === "rejected") {
    console.error(`Resource ${index} failed:`, result.reason);
  }
});
```

---

## 3. ヘルスチェックとの連携

### k8s readinessProbe との統合

```typescript
let isHealthy = true;

app.get("/health/liveness", (req, res) => {
  // プロセスが生きているか（常にtrue）
  res.status(200).send("OK");
});

app.get("/health/readiness", (req, res) => {
  // トラフィックを受け入れられるか
  if (isHealthy && !isShuttingDown) {
    res.status(200).send("Ready");
  } else {
    res.status(503).send("Not ready");
  }
});

async function gracefulShutdown() {
  // Step 1: Readiness を false に（新規トラフィック停止）
  isHealthy = false;
  console.log("Marked as not ready");

  // Step 2: k8s がトラフィックを止めるまで待機（5秒程度）
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Step 3: 以降は通常のシャットダウンフロー
  await drainConnections();
  await cleanup();
  process.exit(0);
}
```

---

## 4. タイムアウト戦略の高度化

### ステップ別タイムアウト

```typescript
async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  name: string,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${name} timeout`)), ms),
    ),
  ]);
}

async function gracefulShutdown() {
  try {
    await withTimeout(drainRequests(), 15000, "Drain requests");
    await withTimeout(cache.quit(), 5000, "Cache cleanup");
    await withTimeout(db.end(), 5000, "DB cleanup");
  } catch (error) {
    console.error("Shutdown step failed:", error);
    // 失敗しても次のステップへ継続
  }
}
```

---

## 5. Worker/Queue システムの終了

### Bull Queue の安全な停止

```typescript
import Queue from "bull";

const queue = new Queue("tasks", "redis://localhost:6379");

queue.process(async (job) => {
  // ジョブ処理
});

async function gracefulShutdown() {
  console.log("Stopping queue...");

  // 新規ジョブの受付停止
  await queue.pause();

  // 実行中ジョブの完了待機（最大30秒）
  await queue.close(30000);

  console.log("Queue closed");
  process.exit(0);
}
```

---

## 6. 実装チェックリスト（Level 2）

- [ ] 新規リクエスト拒否機構（503返却）
- [ ] 既存リクエストの完了待機（タイムアウト付き）
- [ ] リソース解放の順序定義（依存関係考慮）
- [ ] ヘルスチェック連携（readiness false化）
- [ ] ステップ別タイムアウト
- [ ] エラー発生時も次ステップへ継続
- [ ] アクティブ接続の監視とログ

---

## 次のステップ

Level 2をマスターしたら、Level 3へ：

- 分散システムでのシャットダウン調整
- リーダー選出との連携
- カスケード障害の防止
