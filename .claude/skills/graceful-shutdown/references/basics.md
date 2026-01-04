# Graceful Shutdown 基礎

> 18-skills.md §3.5 準拠
> **相対パス**: `references/basics.md`

---

## 概要

アプリケーションの安全な終了処理の基本概念。シグナル、ライフサイクル、リソース管理を解説。

---

## シグナルの種類

### POSIX シグナル

| シグナル | 番号 | デフォルト動作 | 用途                     |
| -------- | ---- | -------------- | ------------------------ |
| SIGTERM  | 15   | 終了           | 正常終了要求（推奨）     |
| SIGINT   | 2    | 終了           | Ctrl+C、割り込み         |
| SIGKILL  | 9    | 強制終了       | 即座終了（ハンドル不可） |
| SIGHUP   | 1    | 終了           | 設定再読み込み           |
| SIGUSR1  | 10   | 終了           | ユーザー定義             |
| SIGUSR2  | 12   | 終了           | ユーザー定義             |

### 環境別シグナル

| 環境       | 送信されるシグナル    |
| ---------- | --------------------- |
| Ctrl+C     | SIGINT                |
| kill       | SIGTERM（デフォルト） |
| Docker     | SIGTERM → SIGKILL     |
| Kubernetes | SIGTERM → SIGKILL     |
| Systemd    | SIGTERM → SIGKILL     |

---

## 終了処理のライフサイクル

### 基本フロー

```
シグナル受信
    ↓
新規リクエスト拒否
    ↓
実行中リクエスト完了待機
    ↓
リソースクリーンアップ
    ↓
プロセス終了
```

### 詳細シーケンス

```typescript
async function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}`);

  // 1. 新規リクエスト拒否
  isShuttingDown = true;

  // 2. 実行中リクエスト完了待機
  await waitForRequests(timeout);

  // 3. リソースクリーンアップ
  await closeConnections();
  await flushBuffers();
  await closeLogs();

  // 4. プロセス終了
  process.exit(0);
}
```

---

## Node.js 基本実装

### シグナルハンドラー登録

```typescript
// 複数シグナルをハンドル
["SIGTERM", "SIGINT"].forEach((signal) => {
  process.on(signal, () => gracefulShutdown(signal));
});
```

### 基本的なクリーンアップ

```typescript
async function gracefulShutdown(signal: string) {
  console.log(`\nReceived ${signal}, shutting down...`);

  // タイムアウト設定
  const timeout = setTimeout(() => {
    console.error("Timeout, forcing exit");
    process.exit(1);
  }, 30000);

  try {
    await cleanup();
    clearTimeout(timeout);
    process.exit(0);
  } catch (error) {
    console.error("Cleanup error:", error);
    clearTimeout(timeout);
    process.exit(1);
  }
}
```

### べき等性の確保

```typescript
let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
  if (isShuttingDown) {
    console.log("Already shutting down...");
    return;
  }
  isShuttingDown = true;

  // ... クリーンアップ処理
}
```

---

## リソースクリーンアップ

### 優先順位

1. **外部接続** - DB、Redis、外部API
2. **内部リソース** - ファイル、バッファ
3. **キャッシュ** - メモリキャッシュ
4. **ログ** - バッファフラッシュ

### 実装例

```typescript
async function cleanup() {
  // 1. 外部接続
  await database.close();
  await redis.quit();

  // 2. 内部リソース
  await fileHandles.closeAll();

  // 3. キャッシュ
  cache.clear();

  // 4. ログフラッシュ
  await logger.flush();
}
```

---

## タイムアウト処理

### 推奨設定

| 環境       | 推奨タイムアウト |
| ---------- | ---------------- |
| 開発       | 5秒              |
| 本番       | 30秒             |
| Kubernetes | 30-60秒          |
| Docker     | 10-30秒          |

### 実装パターン

```typescript
const SHUTDOWN_TIMEOUT = parseInt(process.env.SHUTDOWN_TIMEOUT || "30000");

async function withTimeout<T>(
  promise: Promise<T>,
  timeout: number,
): Promise<T> {
  let timer: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Timeout after ${timeout}ms`));
    }, timeout);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}
```

---

## 終了コード

| コード | 意味                 |
| ------ | -------------------- |
| 0      | 正常終了             |
| 1      | 一般エラー           |
| 2      | シェル組み込みエラー |
| 126    | 実行権限なし         |
| 127    | コマンド不明         |
| 128+n  | シグナルnで終了      |
| 130    | Ctrl+C (128+2)       |
| 143    | SIGTERM (128+15)     |

---

## よくある問題

### process.exit()直接呼び出し

```typescript
// 悪い例
process.on("SIGTERM", () => {
  process.exit(0); // クリーンアップが実行されない
});

// 良い例
process.on("SIGTERM", async () => {
  await cleanup();
  process.exit(0);
});
```

### 非同期処理の未完了

```typescript
// 悪い例
process.on("SIGTERM", () => {
  cleanup(); // awaitなし、完了前に終了
  process.exit(0);
});

// 良い例
process.on("SIGTERM", async () => {
  await cleanup();
  process.exit(0);
});
```

---

## 関連リソース

- **パターン集**: See [shutdown-patterns.md](shutdown-patterns.md)
- **環境別実装**: See [environment-specific.md](environment-specific.md)
- **テストガイド**: See [testing-guide.md](testing-guide.md)
