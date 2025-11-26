---
name: graceful-shutdown-patterns
description: |
  Node.jsアプリケーションのグレースフルシャットダウン実装パターン。
  シグナルハンドリング、リソースクリーンアップ、タイムアウト管理、
  ファイル監視システムの安全な終了処理を提供。

  使用タイミング:
  - ファイル監視サービスを実装する時
  - 長時間実行プロセスを管理する時
  - リソースリークを防止したい時
  - 本番環境でのデプロイメントを準備する時
  - Kubernetes/Docker環境での終了処理を実装する時
version: 1.0.0
---

# Graceful Shutdown Patterns

## 概要

このスキルは、Node.jsアプリケーションの安全な終了処理パターンを提供します。ファイル監視システム、HTTPサーバー、データベース接続などのリソースを適切にクリーンアップし、データ損失やリソースリークを防ぎます。

---

## 核心概念

### なぜグレースフルシャットダウンが必要か

```
❌ 即時終了の問題:
- 書き込み中のファイルが破損
- 進行中の処理が中断
- 開いているコネクションがリーク
- 一時ファイルが残存

✅ グレースフルシャットダウンの効果:
- 進行中の処理を完了
- リソースを適切に解放
- データ整合性を維持
- クリーンな状態で終了
```

### シグナルの種類

| シグナル | トリガー | 推奨動作 |
|---------|----------|----------|
| **SIGTERM** | kill, Docker stop | グレースフル終了 |
| **SIGINT** | Ctrl+C | グレースフル終了 |
| **SIGQUIT** | Ctrl+\ | コアダンプ付き終了 |
| **SIGHUP** | ターミナル切断 | 設定リロードまたは終了 |
| **SIGKILL** | kill -9 | ハンドル不可（即時終了） |

---

## 基本パターン

### シンプルなシャットダウンハンドラー

```typescript
import { EventEmitter } from 'events';

class ShutdownManager extends EventEmitter {
  private isShuttingDown = false;
  private cleanupHandlers: (() => Promise<void>)[] = [];

  constructor() {
    super();
    this.setupSignalHandlers();
  }

  private setupSignalHandlers(): void {
    const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];

    for (const signal of signals) {
      process.on(signal, async () => {
        console.log(`\nReceived ${signal}`);
        await this.shutdown();
      });
    }

    // 未処理エラーでもクリーンアップ
    process.on('uncaughtException', async (error) => {
      console.error('Uncaught exception:', error);
      await this.shutdown(1);
    });

    process.on('unhandledRejection', async (reason) => {
      console.error('Unhandled rejection:', reason);
      await this.shutdown(1);
    });
  }

  register(handler: () => Promise<void>): void {
    this.cleanupHandlers.push(handler);
  }

  async shutdown(exitCode = 0): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }
    this.isShuttingDown = true;

    console.log('Starting graceful shutdown...');
    this.emit('shutdown');

    // 登録順の逆順でクリーンアップ（LIFO）
    for (const handler of [...this.cleanupHandlers].reverse()) {
      try {
        await handler();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }

    console.log('Shutdown complete');
    process.exit(exitCode);
  }
}

// 使用
const shutdownManager = new ShutdownManager();

shutdownManager.register(async () => {
  console.log('Closing file watcher...');
  await watcher.close();
});

shutdownManager.register(async () => {
  console.log('Closing database connection...');
  await db.close();
});
```

### タイムアウト付きシャットダウン

```typescript
async function shutdownWithTimeout(
  cleanup: () => Promise<void>,
  timeoutMs: number = 10000
): Promise<void> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Shutdown timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    await Promise.race([cleanup(), timeoutPromise]);
  } catch (error) {
    console.error('Forced shutdown:', error);
    process.exit(1);
  }
}

// 使用
process.on('SIGTERM', async () => {
  await shutdownWithTimeout(async () => {
    await watcher.close();
    await db.close();
  }, 30000); // 30秒タイムアウト

  process.exit(0);
});
```

---

## ファイル監視システムのシャットダウン

### Chokidarウォッチャーのクリーンアップ

```typescript
import chokidar, { FSWatcher } from 'chokidar';

class FileWatcherService {
  private watcher: FSWatcher | null = null;
  private pendingOperations = new Set<Promise<void>>();
  private isShuttingDown = false;

  async start(paths: string[]): Promise<void> {
    this.watcher = chokidar.watch(paths, {
      persistent: true,
      ignoreInitial: true,
    });

    this.watcher.on('change', (path) => {
      this.handleFileChange(path);
    });

    this.watcher.on('ready', () => {
      console.log('Watcher ready');
    });
  }

  private handleFileChange(path: string): void {
    if (this.isShuttingDown) {
      return; // シャットダウン中は新しい処理を開始しない
    }

    const operation = this.processFile(path);
    this.pendingOperations.add(operation);

    operation.finally(() => {
      this.pendingOperations.delete(operation);
    });
  }

  private async processFile(path: string): Promise<void> {
    // ファイル処理ロジック
    console.log(`Processing: ${path}`);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  async close(): Promise<void> {
    this.isShuttingDown = true;

    // 1. 新しいイベントの監視を停止
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }

    // 2. 進行中の処理を待機
    if (this.pendingOperations.size > 0) {
      console.log(`Waiting for ${this.pendingOperations.size} pending operations...`);
      await Promise.allSettled([...this.pendingOperations]);
    }

    console.log('File watcher closed');
  }
}
```

---

## リソース管理パターン

### リソースレジストリ

```typescript
interface Closable {
  close(): Promise<void>;
}

class ResourceRegistry {
  private resources: Map<string, Closable> = new Map();

  register(name: string, resource: Closable): void {
    this.resources.set(name, resource);
  }

  unregister(name: string): void {
    this.resources.delete(name);
  }

  async closeAll(): Promise<void> {
    const errors: Error[] = [];

    // 並列でクローズ
    await Promise.allSettled(
      Array.from(this.resources.entries()).map(async ([name, resource]) => {
        try {
          console.log(`Closing ${name}...`);
          await resource.close();
          console.log(`${name} closed`);
        } catch (error) {
          errors.push(error as Error);
          console.error(`Failed to close ${name}:`, error);
        }
      })
    );

    if (errors.length > 0) {
      throw new AggregateError(errors, 'Some resources failed to close');
    }
  }
}

// 使用
const registry = new ResourceRegistry();
registry.register('watcher', fileWatcher);
registry.register('database', dbConnection);
registry.register('cache', cacheClient);

process.on('SIGTERM', async () => {
  await registry.closeAll();
  process.exit(0);
});
```

### 順序付きシャットダウン

```typescript
interface ShutdownPhase {
  name: string;
  priority: number; // 小さいほど先に実行
  handler: () => Promise<void>;
}

class OrderedShutdown {
  private phases: ShutdownPhase[] = [];

  addPhase(phase: ShutdownPhase): void {
    this.phases.push(phase);
    this.phases.sort((a, b) => a.priority - b.priority);
  }

  async execute(): Promise<void> {
    for (const phase of this.phases) {
      console.log(`Phase: ${phase.name}`);
      try {
        await phase.handler();
      } catch (error) {
        console.error(`Phase ${phase.name} failed:`, error);
        // 続行するか中断するかは要件次第
      }
    }
  }
}

// 使用
const shutdown = new OrderedShutdown();

shutdown.addPhase({
  name: 'Stop accepting new work',
  priority: 1,
  handler: async () => {
    isAcceptingWork = false;
  },
});

shutdown.addPhase({
  name: 'Complete pending operations',
  priority: 2,
  handler: async () => {
    await Promise.allSettled(pendingOperations);
  },
});

shutdown.addPhase({
  name: 'Close file watchers',
  priority: 3,
  handler: async () => {
    await watcher.close();
  },
});

shutdown.addPhase({
  name: 'Close database connections',
  priority: 4,
  handler: async () => {
    await db.close();
  },
});
```

---

## Docker/Kubernetes環境

### シグナル伝播

```typescript
// Dockerでのシグナル処理
// Dockerfile: CMD ["node", "app.js"] (exec形式を使用)

class ContainerShutdown {
  private shutdownTimeout: number;

  constructor(options: { shutdownTimeout?: number } = {}) {
    // Kubernetes: terminationGracePeriodSeconds のデフォルトは30秒
    this.shutdownTimeout = options.shutdownTimeout ?? 25000;
    this.setupHandlers();
  }

  private setupHandlers(): void {
    let isShuttingDown = false;

    const shutdown = async (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      console.log(`Received ${signal}, starting graceful shutdown...`);

      const forceExit = setTimeout(() => {
        console.error('Forced exit due to timeout');
        process.exit(1);
      }, this.shutdownTimeout);

      try {
        await this.cleanup();
        clearTimeout(forceExit);
        console.log('Graceful shutdown complete');
        process.exit(0);
      } catch (error) {
        console.error('Shutdown error:', error);
        clearTimeout(forceExit);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  private async cleanup(): Promise<void> {
    // アプリケーション固有のクリーンアップ
  }
}
```

### ヘルスチェック統合

```typescript
import http from 'http';

class HealthAwareShutdown {
  private isHealthy = true;
  private isShuttingDown = false;
  private healthServer: http.Server;

  constructor(port: number = 8080) {
    this.healthServer = http.createServer((req, res) => {
      if (req.url === '/health' || req.url === '/readiness') {
        if (this.isHealthy && !this.isShuttingDown) {
          res.writeHead(200);
          res.end('OK');
        } else {
          res.writeHead(503);
          res.end('Service Unavailable');
        }
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    this.healthServer.listen(port);
  }

  async shutdown(): Promise<void> {
    // 1. ヘルスチェックを失敗させる（新しいトラフィックを停止）
    this.isShuttingDown = true;

    // 2. ロードバランサーがトラフィックを停止するまで待機
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 3. クリーンアップを実行
    await this.cleanup();

    // 4. ヘルスサーバーを停止
    await new Promise<void>((resolve) => {
      this.healthServer.close(() => resolve());
    });
  }

  private async cleanup(): Promise<void> {
    // アプリケーション固有のクリーンアップ
  }
}
```

---

## 判断基準チェックリスト

### 設計時

- [ ] すべてのシグナル（SIGTERM, SIGINT）をハンドルしているか？
- [ ] タイムアウトを設定しているか？
- [ ] リソースのクローズ順序を考慮しているか？
- [ ] 未処理エラーでもクリーンアップが実行されるか？

### 実装時

- [ ] 進行中の処理を完了させているか？
- [ ] 新しい処理の受付を停止しているか？
- [ ] すべてのリソースを解放しているか？
- [ ] エラーが発生してもクリーンアップを継続するか？

### テスト時

- [ ] SIGTERM送信後に正常終了するか？
- [ ] タイムアウト時に強制終了するか？
- [ ] リソースリークがないか？
- [ ] 進行中の処理が完了するか？

---

## アンチパターン

### ❌ 避けるべきパターン

```typescript
// 1. シグナルハンドリングなし
// プロセスが即時終了し、リソースがリークする

// 2. 同期的なクリーンアップのみ
process.on('SIGTERM', () => {
  watcher.close(); // Promiseを待機していない
  process.exit(0);
});

// 3. タイムアウトなし
process.on('SIGTERM', async () => {
  await infiniteOperation(); // 永遠に終了しない可能性
  process.exit(0);
});

// 4. 二重シャットダウン
process.on('SIGTERM', async () => {
  await cleanup(); // 2回目の SIGTERM で再度実行される
});
```

### ✅ 推奨パターン

```typescript
// 1. 適切なシグナルハンドリング
const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
signals.forEach((signal) => process.on(signal, shutdown));

// 2. 非同期クリーンアップを待機
process.on('SIGTERM', async () => {
  await watcher.close();
  process.exit(0);
});

// 3. タイムアウト付き
await Promise.race([cleanup(), timeout(30000)]);

// 4. フラグで二重実行を防止
if (isShuttingDown) return;
isShuttingDown = true;
```

---

## 関連スキル

- `.claude/skills/event-driven-file-watching/SKILL.md` - ファイル監視
- `.claude/skills/nodejs-stream-processing/SKILL.md` - ストリーム処理
- `.claude/skills/context-optimization/SKILL.md` - パフォーマンス最適化

---

## リソース参照

```bash
# シャットダウンパターン詳細
cat .claude/skills/graceful-shutdown-patterns/resources/shutdown-strategies.md

# 完全なシャットダウンマネージャーテンプレート
cat .claude/skills/graceful-shutdown-patterns/templates/shutdown-manager.ts
```
