/**
 * Graceful Shutdown Handler Template
 *
 * Node.js/TypeScript用のシャットダウンハンドラーテンプレート
 *
 * 使用方法:
 * 1. このファイルをプロジェクトにコピー
 * 2. リソースクリーンアップ処理を実装
 * 3. アプリケーション起動時にregisterShutdownHandlers()を呼び出し
 */

// ============================================
// 設定
// ============================================

const SHUTDOWN_TIMEOUT = parseInt(process.env.SHUTDOWN_TIMEOUT || "30000", 10);

// ============================================
// 状態管理
// ============================================

let isShuttingDown = false;

// ============================================
// リソースクリーンアップ（プロジェクトに合わせて実装）
// ============================================

interface CleanupResource {
  name: string;
  cleanup: () => Promise<void>;
  timeout?: number;
}

const resources: CleanupResource[] = [
  // 例: HTTPサーバー
  // {
  //   name: 'HTTP Server',
  //   cleanup: async () => {
  //     await new Promise<void>((resolve) => server.close(resolve));
  //   },
  //   timeout: 5000
  // },
  // 例: データベース接続
  // {
  //   name: 'Database',
  //   cleanup: async () => {
  //     await db.end();
  //   },
  //   timeout: 10000
  // },
  // 例: Redis接続
  // {
  //   name: 'Redis',
  //   cleanup: async () => {
  //     await redis.quit();
  //   },
  //   timeout: 5000
  // },
];

// ============================================
// ユーティリティ
// ============================================

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  name: string,
): Promise<T> {
  let timer: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${name} timed out after ${ms}ms`));
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

// ============================================
// シャットダウン処理
// ============================================

async function gracefulShutdown(signal: string): Promise<void> {
  // べき等性: 複数回呼ばれても1回だけ実行
  if (isShuttingDown) {
    console.log("[Shutdown] Already shutting down...");
    return;
  }
  isShuttingDown = true;

  console.log(`\n[Shutdown] Received ${signal}, starting graceful shutdown...`);

  // 全体タイムアウト
  const forceExitTimer = setTimeout(() => {
    console.error("[Shutdown] Timeout exceeded, forcing exit");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT);

  try {
    // リソースを順番にクリーンアップ
    for (const resource of resources) {
      const timeout = resource.timeout || 10000;
      console.log(`[Shutdown] Cleaning up ${resource.name}...`);

      try {
        await withTimeout(resource.cleanup(), timeout, resource.name);
        console.log(`[Shutdown] ${resource.name} cleaned up successfully`);
      } catch (error) {
        console.error(`[Shutdown] Error cleaning up ${resource.name}:`, error);
        // エラーでも続行（他のリソースもクリーンアップ）
      }
    }

    clearTimeout(forceExitTimer);
    console.log("[Shutdown] Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    clearTimeout(forceExitTimer);
    console.error("[Shutdown] Unexpected error during shutdown:", error);
    process.exit(1);
  }
}

// ============================================
// シグナルハンドラー登録
// ============================================

export function registerShutdownHandlers(): void {
  // SIGTERM: Kubernetes、Docker、kill コマンド
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

  // SIGINT: Ctrl+C
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  // 未処理のPromise rejection
  process.on("unhandledRejection", (reason, promise) => {
    console.error("[Error] Unhandled Rejection:", reason);
    // 必要に応じてシャットダウン
    // gracefulShutdown('unhandledRejection');
  });

  // 未処理の例外
  process.on("uncaughtException", (error) => {
    console.error("[Error] Uncaught Exception:", error);
    gracefulShutdown("uncaughtException");
  });

  console.log("[Shutdown] Handlers registered");
}

// ============================================
// リソース追加用ヘルパー
// ============================================

export function addCleanupResource(resource: CleanupResource): void {
  resources.push(resource);
}

export function isShuttingDownState(): boolean {
  return isShuttingDown;
}

// ============================================
// 使用例
// ============================================

/*
import { registerShutdownHandlers, addCleanupResource } from './shutdown-handler';

// サーバー起動時
registerShutdownHandlers();

// HTTPサーバー
const server = app.listen(3000, () => {
  console.log('Server started');

  // リソースを登録
  addCleanupResource({
    name: 'HTTP Server',
    cleanup: async () => {
      await new Promise<void>((resolve) => server.close(resolve));
    },
    timeout: 5000
  });
});

// データベース接続
const db = await createDbConnection();
addCleanupResource({
  name: 'Database',
  cleanup: async () => await db.end(),
  timeout: 10000
});
*/
