/**
 * Graceful Shutdown Template
 *
 * Node.jsアプリケーションのGraceful Shutdown実装テンプレート。
 * Twelve-Factor Appの「廃棄容易性」原則に基づく設計。
 *
 * 使用方法:
 *   1. このファイルをプロジェクトにコピー
 *   2. クリーンアップ関数を登録
 *   3. シャットダウンマネージャーを初期化
 *
 * @example
 * const shutdown = new GracefulShutdown({ timeout: 30000 });
 * shutdown.register('database', () => db.close(), 60);
 * shutdown.register('redis', () => redis.quit(), 50);
 * shutdown.initialize();
 */

// ============================================================
// 型定義
// ============================================================

interface ShutdownOptions {
  /** 全体タイムアウト（ms） */
  timeout?: number;
  /** ログ関数 */
  logger?: Logger;
  /** PM2モードを有効化 */
  pm2Mode?: boolean;
  /** ヘルスチェックポート */
  healthCheckPort?: number;
}

interface Logger {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string, error?: Error) => void;
}

interface CleanupTask {
  name: string;
  fn: () => Promise<void> | void;
  priority: number;
  timeout?: number;
}

interface CleanupResult {
  name: string;
  status: "success" | "error" | "timeout";
  duration: number;
  error?: string;
}

type ShutdownState = "running" | "shutting_down" | "terminated";

// ============================================================
// デフォルトロガー
// ============================================================

const defaultLogger: Logger = {
  info: (msg) => console.log(`[GracefulShutdown] ${msg}`),
  warn: (msg) => console.warn(`[GracefulShutdown] ${msg}`),
  error: (msg, err) => console.error(`[GracefulShutdown] ${msg}`, err || ""),
};

// ============================================================
// GracefulShutdownクラス
// ============================================================

export class GracefulShutdown {
  private state: ShutdownState = "running";
  private tasks: CleanupTask[] = [];
  private timeout: number;
  private logger: Logger;
  private pm2Mode: boolean;
  private shutdownPromise: Promise<void> | null = null;

  constructor(options: ShutdownOptions = {}) {
    this.timeout = options.timeout ?? 30000;
    this.logger = options.logger ?? defaultLogger;
    this.pm2Mode = options.pm2Mode ?? this.detectPM2();
  }

  // ============================================================
  // パブリックAPI
  // ============================================================

  /**
   * クリーンアップタスクを登録
   *
   * @param name タスク名
   * @param fn クリーンアップ関数
   * @param priority 優先度（数値が小さいほど先に実行）
   * @param timeout 個別タイムアウト（ms）
   */
  register(
    name: string,
    fn: () => Promise<void> | void,
    priority: number = 50,
    timeout?: number,
  ): this {
    this.tasks.push({ name, fn, priority, timeout });
    this.tasks.sort((a, b) => a.priority - b.priority);
    this.logger.info(
      `Registered cleanup task: ${name} (priority: ${priority})`,
    );
    return this;
  }

  /**
   * シャットダウンマネージャーを初期化
   * シグナルハンドラーを設定
   */
  initialize(): this {
    // 二重初期化防止
    if (this.state !== "running") {
      this.logger.warn("Already initialized or shutting down");
      return this;
    }

    // シグナルハンドラー設定
    process.on("SIGTERM", () => this.handleSignal("SIGTERM"));
    process.on("SIGINT", () => this.handleSignal("SIGINT"));

    // PM2モードの場合、メッセージハンドラーも設定
    if (this.pm2Mode) {
      process.on("message", (msg) => {
        if (msg === "shutdown") {
          this.handleSignal("PM2_SHUTDOWN");
        }
      });
    }

    this.logger.info("Graceful shutdown initialized");
    return this;
  }

  /**
   * 現在のシャットダウン状態を取得
   */
  getState(): ShutdownState {
    return this.state;
  }

  /**
   * シャットダウン中かどうか
   */
  isShuttingDown(): boolean {
    return this.state === "shutting_down";
  }

  /**
   * 手動でシャットダウンを開始
   */
  async shutdown(): Promise<void> {
    return this.executeShutdown("MANUAL");
  }

  /**
   * ヘルスチェック用のステータスを取得
   */
  getHealthStatus(): { status: string; uptime: number } {
    return {
      status: this.state === "running" ? "healthy" : "shutting_down",
      uptime: process.uptime(),
    };
  }

  // ============================================================
  // プライベートメソッド
  // ============================================================

  private detectPM2(): boolean {
    return (
      typeof process.env.PM2_HOME !== "undefined" ||
      typeof process.env.pm_id !== "undefined"
    );
  }

  private handleSignal(signal: string): void {
    this.logger.info(`Received ${signal}`);
    this.executeShutdown(signal);
  }

  private async executeShutdown(trigger: string): Promise<void> {
    // べき等性: 既にシャットダウン中なら既存のPromiseを返す
    if (this.shutdownPromise) {
      this.logger.warn("Shutdown already in progress");
      return this.shutdownPromise;
    }

    this.state = "shutting_down";
    this.logger.info(`Starting graceful shutdown (triggered by: ${trigger})`);

    this.shutdownPromise = this.runShutdown();
    return this.shutdownPromise;
  }

  private async runShutdown(): Promise<void> {
    const startTime = Date.now();
    const results: CleanupResult[] = [];

    // 全体タイムアウト設定
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error("Global shutdown timeout"));
      }, this.timeout);
    });

    try {
      // クリーンアップタスクを順次実行
      await Promise.race([this.runCleanupTasks(results), timeoutPromise]);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Global shutdown timeout"
      ) {
        this.logger.error("Global shutdown timeout exceeded, forcing exit");
      } else {
        this.logger.error("Unexpected error during shutdown", error as Error);
      }
    }

    // 結果サマリー
    this.logResults(results, Date.now() - startTime);

    // プロセス終了
    this.state = "terminated";
    const hasErrors = results.some((r) => r.status === "error");
    const exitCode = hasErrors ? 1 : 0;

    this.logger.info(`Exiting with code ${exitCode}`);
    process.exit(exitCode);
  }

  private async runCleanupTasks(results: CleanupResult[]): Promise<void> {
    for (const task of this.tasks) {
      const result = await this.runSingleTask(task);
      results.push(result);
    }
  }

  private async runSingleTask(task: CleanupTask): Promise<CleanupResult> {
    const startTime = Date.now();
    const taskTimeout = task.timeout ?? 10000;

    this.logger.info(`Running cleanup: ${task.name}`);

    try {
      await Promise.race([
        Promise.resolve(task.fn()),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Task timeout")), taskTimeout);
        }),
      ]);

      const duration = Date.now() - startTime;
      this.logger.info(`Cleanup completed: ${task.name} (${duration}ms)`);

      return {
        name: task.name,
        status: "success",
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const isTimeout =
        error instanceof Error && error.message === "Task timeout";

      if (isTimeout) {
        this.logger.warn(`Cleanup timeout: ${task.name} (>${taskTimeout}ms)`);
      } else {
        this.logger.error(`Cleanup failed: ${task.name}`, error as Error);
      }

      return {
        name: task.name,
        status: isTimeout ? "timeout" : "error",
        duration,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private logResults(results: CleanupResult[], totalDuration: number): void {
    const succeeded = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "error").length;
    const timedOut = results.filter((r) => r.status === "timeout").length;

    this.logger.info(
      `Shutdown complete: ${succeeded} succeeded, ${failed} failed, ${timedOut} timed out (${totalDuration}ms)`,
    );

    if (failed > 0 || timedOut > 0) {
      this.logger.warn("Failed/timed out tasks:");
      results
        .filter((r) => r.status !== "success")
        .forEach((r) => {
          this.logger.warn(
            `  - ${r.name}: ${r.status} (${r.error || "no details"})`,
          );
        });
    }
  }
}

// ============================================================
// ヘルスチェックミドルウェア（Express用）
// ============================================================

/**
 * Expressヘルスチェックミドルウェアを作成
 *
 * @example
 * const shutdown = new GracefulShutdown();
 * app.get('/health', createHealthCheckMiddleware(shutdown));
 */
export function createHealthCheckMiddleware(shutdown: GracefulShutdown) {
  return (
    _req: unknown,
    res: { status: (code: number) => { json: (data: unknown) => void } },
  ) => {
    const health = shutdown.getHealthStatus();

    if (shutdown.isShuttingDown()) {
      res.status(503).json({
        ...health,
        message: "Service is shutting down",
      });
      return;
    }

    res.status(200).json(health);
  };
}

// ============================================================
// リクエストトラッカー
// ============================================================

/**
 * アクティブリクエストを追跡するクラス
 *
 * @example
 * const tracker = new RequestTracker();
 * app.use(tracker.middleware());
 * shutdown.register('requests', () => tracker.waitForCompletion(), 20);
 */
export class RequestTracker {
  private activeRequests = 0;
  private waiters: Array<() => void> = [];

  /**
   * Expressミドルウェアを返す
   */
  middleware() {
    return (
      _req: unknown,
      res: { on: (event: string, handler: () => void) => void },
      next: () => void,
    ) => {
      this.activeRequests++;

      const onFinish = () => {
        this.activeRequests--;
        this.notifyWaiters();
      };

      res.on("finish", onFinish);
      res.on("close", onFinish);

      next();
    };
  }

  /**
   * アクティブリクエスト数を取得
   */
  getActiveCount(): number {
    return this.activeRequests;
  }

  /**
   * すべてのリクエストが完了するまで待機
   */
  async waitForCompletion(timeoutMs: number = 30000): Promise<void> {
    if (this.activeRequests === 0) {
      return;
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn(
          `Request drain timeout: ${this.activeRequests} requests still active`,
        );
        resolve();
      }, timeoutMs);

      this.waiters.push(() => {
        if (this.activeRequests === 0) {
          clearTimeout(timeout);
          resolve();
        }
      });
    });
  }

  private notifyWaiters(): void {
    this.waiters.forEach((fn) => fn());
  }
}

// ============================================================
// 使用例
// ============================================================

/*
import express from 'express';
import { GracefulShutdown, createHealthCheckMiddleware, RequestTracker } from './graceful-shutdown';

const app = express();
const shutdown = new GracefulShutdown({ timeout: 30000, pm2Mode: true });
const requestTracker = new RequestTracker();

// ミドルウェア設定
app.use(requestTracker.middleware());
app.get('/health', createHealthCheckMiddleware(shutdown));

// クリーンアップタスク登録（優先度順）
shutdown
  .register('http-server', () => {
    return new Promise((resolve) => {
      server.close(() => {
        console.log('HTTP server closed');
        resolve();
      });
    });
  }, 10)
  .register('request-drain', () => requestTracker.waitForCompletion(15000), 20)
  .register('redis', () => redis.quit(), 50)
  .register('database', () => db.end(), 60);

// サーバー起動
const server = app.listen(3000, () => {
  console.log('Server started on port 3000');

  // PM2にready通知
  if (process.send) {
    process.send('ready');
  }
});

// シャットダウンマネージャー初期化
shutdown.initialize();
*/
