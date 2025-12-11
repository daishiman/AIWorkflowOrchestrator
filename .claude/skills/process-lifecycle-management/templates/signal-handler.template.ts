/**
 * Signal Handler Template
 *
 * Node.jsアプリケーション用のシグナルハンドラーテンプレート。
 * PM2との連携、Graceful Shutdown、リソースクリーンアップを実装。
 *
 * 使用方法:
 *   1. このファイルをプロジェクトにコピー
 *   2. クリーンアップ関数を登録
 *   3. setup()を呼び出し
 *
 * 例:
 *   const handler = new SignalHandler();
 *   handler.registerCleanup(() => server.close());
 *   handler.registerCleanup(() => db.disconnect());
 *   handler.setup();
 */

interface CleanupFunction {
  (): Promise<void> | void;
}

interface SignalHandlerOptions {
  /** シャットダウンタイムアウト (ミリ秒) */
  shutdownTimeout?: number;
  /** ログ関数 */
  logger?: typeof console;
  /** PM2メッセージを監視するか */
  watchPM2Messages?: boolean;
}

export class SignalHandler {
  private isShuttingDown = false;
  private cleanupFunctions: Array<{ name: string; fn: CleanupFunction }> = [];
  private options: Required<SignalHandlerOptions>;

  constructor(options: SignalHandlerOptions = {}) {
    this.options = {
      shutdownTimeout: options.shutdownTimeout ?? 30000,
      logger: options.logger ?? console,
      watchPM2Messages: options.watchPM2Messages ?? true,
    };
  }

  /**
   * クリーンアップ関数を登録
   * @param name クリーンアップの識別名（ログ用）
   * @param fn クリーンアップ関数
   */
  registerCleanup(name: string, fn: CleanupFunction): void {
    this.cleanupFunctions.push({ name, fn });
  }

  /**
   * シグナルハンドラーをセットアップ
   */
  setup(): void {
    const { logger, watchPM2Messages } = this.options;

    // 終了シグナル
    const shutdownSignals: NodeJS.Signals[] = ["SIGTERM", "SIGINT"];
    shutdownSignals.forEach((signal) => {
      process.on(signal, () => {
        logger.info(`[SignalHandler] ${signal} received`);
        this.shutdown(signal);
      });
    });

    // PM2メッセージ監視
    if (watchPM2Messages) {
      process.on("message", (msg) => {
        if (msg === "shutdown") {
          logger.info("[SignalHandler] PM2 shutdown message received");
          this.shutdown("PM2_SHUTDOWN");
        }
      });
    }

    // 未捕捉例外
    process.on("uncaughtException", (error) => {
      logger.error("[SignalHandler] Uncaught Exception:", error);
      this.shutdown("uncaughtException");
    });

    // 未処理のPromise拒否
    process.on("unhandledRejection", (reason, promise) => {
      logger.error(
        "[SignalHandler] Unhandled Rejection at:",
        promise,
        "reason:",
        reason,
      );
      // 通常は終了しないが、必要に応じてコメントを外す
      // this.shutdown('unhandledRejection');
    });

    logger.info("[SignalHandler] Signal handlers registered");
  }

  /**
   * シャットダウン処理を実行
   */
  private async shutdown(reason: string): Promise<void> {
    const { logger, shutdownTimeout } = this.options;

    // 二重実行防止
    if (this.isShuttingDown) {
      logger.info("[SignalHandler] Shutdown already in progress");
      return;
    }
    this.isShuttingDown = true;

    logger.info(
      `[SignalHandler] Starting graceful shutdown (reason: ${reason})`,
    );

    // タイムアウト設定
    const timeout = setTimeout(() => {
      logger.error(
        `[SignalHandler] Shutdown timeout (${shutdownTimeout}ms), forcing exit`,
      );
      process.exit(1);
    }, shutdownTimeout);

    try {
      // 登録されたクリーンアップを逆順で実行（後入れ先出し）
      const reversed = [...this.cleanupFunctions].reverse();

      for (const { name, fn } of reversed) {
        logger.info(`[SignalHandler] Running cleanup: ${name}`);
        try {
          await fn();
          logger.info(`[SignalHandler] Cleanup completed: ${name}`);
        } catch (error) {
          logger.error(`[SignalHandler] Cleanup failed: ${name}`, error);
        }
      }

      clearTimeout(timeout);
      logger.info("[SignalHandler] Graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      logger.error("[SignalHandler] Shutdown error:", error);
      clearTimeout(timeout);
      process.exit(1);
    }
  }

  /**
   * シャットダウン中かどうか
   */
  isInShutdown(): boolean {
    return this.isShuttingDown;
  }
}

// ========================================
// 使用例
// ========================================

/*
import { createServer } from 'http';
import { SignalHandler } from './signal-handler';

const server = createServer((req, res) => {
  res.end('OK');
});

const db = {
  async disconnect() {
    console.log('Disconnecting from database...');
    // 実際のDB切断処理
  }
};

// SignalHandler インスタンス作成
const signalHandler = new SignalHandler({
  shutdownTimeout: 30000,
});

// クリーンアップ関数を登録（逆順で実行される）
signalHandler.registerCleanup('database', async () => {
  await db.disconnect();
});

signalHandler.registerCleanup('http-server', () => {
  return new Promise<void>((resolve) => {
    server.close(() => {
      console.log('HTTP server closed');
      resolve();
    });
  });
});

// ハンドラーをセットアップ
signalHandler.setup();

// サーバー起動
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  // PM2にready通知
  if (typeof process.send === 'function') {
    process.send('ready');
  }
});
*/

export default SignalHandler;
