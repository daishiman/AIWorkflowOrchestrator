# Level 1: Graceful Shutdown Basics

## 対象者

初めてシャットダウン処理を実装する開発者

## 学習目標

- プロセスシグナルの基本理解
- 最小限のシャットダウンハンドラー実装
- リソースリークの防止

---

## 1. なぜGraceful Shutdownが必要か

### 問題：Ungraceful Shutdown

```bash
# 強制終了（kill -9）の問題
kill -9 <pid>
```

**発生する問題**:

- データベース接続が残る（接続プール枯渇）
- ファイルが正しくクローズされない（破損リスク）
- 処理中のリクエストが失敗（ユーザーエラー）
- ログが書き込まれない（原因調査困難）

### 解決：Graceful Shutdown

```typescript
// シグナルをキャッチして安全に終了
process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await cleanup();
  process.exit(0);
});
```

---

## 2. プロセスシグナルの基本

### 主要シグナル

| シグナル | 送信元         | 意味               | 用途                     |
| -------- | -------------- | ------------------ | ------------------------ |
| SIGTERM  | OS/Container   | 終了要求           | k8s/Docker の正常終了    |
| SIGINT   | ユーザー       | 割り込み（Ctrl+C） | 開発時の手動停止         |
| SIGKILL  | OS             | 強制終了           | ハンドル不可（最終手段） |
| SIGHUP   | ターミナル切断 | 再起動要求         | 設定リロード             |

### Node.js での基本実装

```typescript
// SIGTERM: Kubernetes/Docker からの終了シグナル
process.on("SIGTERM", () => {
  console.log("Received SIGTERM");
  gracefulShutdown();
});

// SIGINT: Ctrl+C からの終了シグナル
process.on("SIGINT", () => {
  console.log("Received SIGINT (Ctrl+C)");
  gracefulShutdown();
});
```

---

## 3. 最小限のシャットダウンハンドラー

### パターン1: Webサーバー

```typescript
import { createServer } from "http";

const server = createServer((req, res) => {
  res.end("Hello");
});

server.listen(3000);

// シャットダウンハンドラー
let isShuttingDown = false;

async function gracefulShutdown() {
  if (isShuttingDown) return; // べき等性確保
  isShuttingDown = true;

  console.log("Shutting down...");

  // 新規接続を受け付けない
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });

  // タイムアウト（30秒で強制終了）
  setTimeout(() => {
    console.error("Shutdown timeout, forcing exit");
    process.exit(1);
  }, 30000);
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
```

### パターン2: データベース接続のクリーンアップ

```typescript
import { Pool } from "pg";

const pool = new Pool();

async function gracefulShutdown() {
  console.log("Closing database connections...");

  try {
    await pool.end(); // 接続プールを閉じる
    console.log("Database closed");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
```

---

## 4. べき等性の重要性

### 問題：シグナルの多重受信

```typescript
// ❌ 悪い例：何度も実行される
process.on("SIGTERM", async () => {
  await cleanup(); // 2回目の実行でエラー
  process.exit(0);
});

// ユーザーが Ctrl+C を連打
// → SIGINT が複数回発火
// → cleanup() が複数回実行されエラー
```

### 解決：フラグによる制御

```typescript
// ✅ 良い例：1回だけ実行
let isShuttingDown = false;

async function gracefulShutdown() {
  if (isShuttingDown) {
    console.log("Shutdown already in progress");
    return;
  }
  isShuttingDown = true;

  await cleanup();
  process.exit(0);
}
```

---

## 5. タイムアウトの設定

### なぜ必要か

クリーンアップが無限に待機すると、プロセスがゾンビ化する。

### 基本実装

```typescript
async function gracefulShutdown() {
  const timeout = setTimeout(() => {
    console.error("Shutdown timeout!");
    process.exit(1); // タイムアウト時は強制終了
  }, 30000); // 30秒

  try {
    await cleanup();
    clearTimeout(timeout);
    process.exit(0);
  } catch (error) {
    clearTimeout(timeout);
    console.error("Shutdown error:", error);
    process.exit(1);
  }
}
```

---

## 6. よくある間違い

### ❌ 間違い1: process.exit() の直接使用

```typescript
// シグナルハンドラーでクリーンアップせず即終了
process.on("SIGTERM", () => {
  process.exit(0); // リソースが解放されない！
});
```

### ❌ 間違い2: 同期的な無限待機

```typescript
process.on("SIGTERM", () => {
  while (hasActiveConnections()) {
    // 無限ループでプロセスが固まる
  }
});
```

### ❌ 間違い3: エラーの無視

```typescript
process.on("SIGTERM", async () => {
  await db.close(); // エラーが発生してもログなし
  process.exit(0);
});
```

### ✅ 正しい実装

```typescript
process.on("SIGTERM", async () => {
  try {
    await db.close();
    console.log("DB closed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error closing DB:", error);
    process.exit(1); // エラー終了
  }
});
```

---

## 7. 実装チェックリスト

- [ ] SIGTERM と SIGINT 両方をハンドル
- [ ] べき等性フラグ（isShuttingDown）を使用
- [ ] タイムアウト設定（推奨30秒）
- [ ] try-catch でエラーハンドリング
- [ ] 終了コード明示（成功0、失敗1）
- [ ] クリーンアップログの出力

---

## 次のステップ

Level 1をマスターしたら、Level 2へ進む：

- リクエストドレイニング（既存処理の完了待機）
- 複数リソースの順序制御
- ヘルスチェック連携
