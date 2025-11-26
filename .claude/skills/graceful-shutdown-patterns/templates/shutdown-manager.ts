/**
 * グレースフルシャットダウンマネージャー
 *
 * Node.jsアプリケーションの安全な終了処理を管理するユーティリティ
 */

import { EventEmitter } from 'events';

// ============================================================
// 型定義
// ============================================================

export interface ShutdownConfig {
  /** シャットダウン全体のタイムアウト（ミリ秒） */
  timeout: number;
  /** シグナルハンドリングを有効にするか */
  handleSignals: boolean;
  /** 未処理エラーでシャットダウンするか */
  handleUncaughtErrors: boolean;
  /** ログ出力関数 */
  logger: (message: string, level: 'info' | 'warn' | 'error') => void;
}

export interface CleanupHandler {
  /** ハンドラーの名前 */
  name: string;
  /** 優先度（小さいほど先に実行） */
  priority: number;
  /** クリーンアップ処理 */
  handler: () => Promise<void>;
}

export interface ShutdownResult {
  /** シャットダウンが成功したか */
  success: boolean;
  /** 総実行時間（ミリ秒） */
  duration: number;
  /** 成功したハンドラー */
  completed: string[];
  /** 失敗したハンドラー */
  failed: string[];
  /** 発生したエラー */
  errors: Error[];
}

export type ShutdownEvent = 'shutdown' | 'timeout' | 'error' | 'complete';

// ============================================================
// デフォルト設定
// ============================================================

const DEFAULT_CONFIG: ShutdownConfig = {
  timeout: 30000,
  handleSignals: true,
  handleUncaughtErrors: true,
  logger: (message, level) => {
    const prefix = `[Shutdown] [${level.toUpperCase()}]`;
    if (level === 'error') {
      console.error(`${prefix} ${message}`);
    } else if (level === 'warn') {
      console.warn(`${prefix} ${message}`);
    } else {
      console.log(`${prefix} ${message}`);
    }
  },
};

// ============================================================
// ShutdownManager クラス
// ============================================================

export class ShutdownManager extends EventEmitter {
  private config: ShutdownConfig;
  private handlers: CleanupHandler[] = [];
  private isShuttingDown = false;
  private shutdownPromise: Promise<ShutdownResult> | null = null;

  constructor(config: Partial<ShutdownConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };

    if (this.config.handleSignals) {
      this.setupSignalHandlers();
    }

    if (this.config.handleUncaughtErrors) {
      this.setupErrorHandlers();
    }
  }

  // ----------------------------------------------------------
  // シグナル・エラーハンドラーのセットアップ
  // ----------------------------------------------------------

  private setupSignalHandlers(): void {
    const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];

    for (const signal of signals) {
      process.on(signal, async () => {
        this.config.logger(`Received ${signal}`, 'info');
        const result = await this.shutdown();
        process.exit(result.success ? 0 : 1);
      });
    }
  }

  private setupErrorHandlers(): void {
    process.on('uncaughtException', async (error) => {
      this.config.logger(`Uncaught exception: ${error.message}`, 'error');
      const result = await this.shutdown();
      process.exit(result.success ? 1 : 1);
    });

    process.on('unhandledRejection', async (reason) => {
      this.config.logger(`Unhandled rejection: ${reason}`, 'error');
      const result = await this.shutdown();
      process.exit(result.success ? 1 : 1);
    });
  }

  // ----------------------------------------------------------
  // ハンドラー登録
  // ----------------------------------------------------------

  /**
   * クリーンアップハンドラーを登録
   */
  register(handler: CleanupHandler): this;
  register(name: string, handler: () => Promise<void>, priority?: number): this;
  register(
    nameOrHandler: string | CleanupHandler,
    handler?: () => Promise<void>,
    priority: number = 10
  ): this {
    if (typeof nameOrHandler === 'string') {
      this.handlers.push({
        name: nameOrHandler,
        priority,
        handler: handler!,
      });
    } else {
      this.handlers.push(nameOrHandler);
    }

    // 優先度順にソート
    this.handlers.sort((a, b) => a.priority - b.priority);

    return this;
  }

  /**
   * ハンドラーを解除
   */
  unregister(name: string): boolean {
    const index = this.handlers.findIndex((h) => h.name === name);
    if (index !== -1) {
      this.handlers.splice(index, 1);
      return true;
    }
    return false;
  }

  // ----------------------------------------------------------
  // シャットダウン実行
  // ----------------------------------------------------------

  /**
   * シャットダウンを開始
   */
  async shutdown(): Promise<ShutdownResult> {
    // 二重実行防止
    if (this.shutdownPromise) {
      this.config.logger('Shutdown already in progress', 'warn');
      return this.shutdownPromise;
    }

    this.isShuttingDown = true;
    this.shutdownPromise = this.executeShutdown();
    return this.shutdownPromise;
  }

  /**
   * シャットダウン中かどうか
   */
  get shuttingDown(): boolean {
    return this.isShuttingDown;
  }

  private async executeShutdown(): Promise<ShutdownResult> {
    const startTime = Date.now();
    const completed: string[] = [];
    const failed: string[] = [];
    const errors: Error[] = [];

    this.emit('shutdown');
    this.config.logger('Starting graceful shutdown...', 'info');

    // タイムアウト設定
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Shutdown timeout after ${this.config.timeout}ms`));
      }, this.config.timeout);
    });

    try {
      await Promise.race([
        this.runHandlers(completed, failed, errors),
        timeoutPromise,
      ]);
    } catch (error) {
      if ((error as Error).message.includes('timeout')) {
        this.emit('timeout');
        this.config.logger('Shutdown timed out', 'error');
        errors.push(error as Error);
      }
    }

    const duration = Date.now() - startTime;
    const success = failed.length === 0 && errors.length === 0;

    const result: ShutdownResult = {
      success,
      duration,
      completed,
      failed,
      errors,
    };

    if (success) {
      this.config.logger(`Shutdown complete in ${duration}ms`, 'info');
    } else {
      this.config.logger(
        `Shutdown completed with errors: ${failed.length} failed, ${errors.length} errors`,
        'warn'
      );
    }

    this.emit('complete', result);
    return result;
  }

  private async runHandlers(
    completed: string[],
    failed: string[],
    errors: Error[]
  ): Promise<void> {
    for (const { name, handler } of this.handlers) {
      try {
        this.config.logger(`Executing: ${name}`, 'info');
        await handler();
        completed.push(name);
        this.config.logger(`Completed: ${name}`, 'info');
      } catch (error) {
        failed.push(name);
        errors.push(error as Error);
        this.emit('error', { name, error });
        this.config.logger(
          `Failed: ${name} - ${(error as Error).message}`,
          'error'
        );
      }
    }
  }
}

// ============================================================
// ファイル監視用シャットダウンヘルパー
// ============================================================

export interface FileWatcherShutdownOptions {
  /** 進行中操作の完了待機タイムアウト */
  operationTimeout: number;
  /** ウォッチャーのクローズタイムアウト */
  closeTimeout: number;
}

/**
 * ファイル監視システム向けシャットダウンヘルパー
 */
export class FileWatcherShutdown {
  private pendingOperations = new Set<Promise<unknown>>();
  private isAccepting = true;

  constructor(
    private options: FileWatcherShutdownOptions = {
      operationTimeout: 10000,
      closeTimeout: 5000,
    }
  ) {}

  /**
   * 操作を追跡
   */
  trackOperation<T>(operation: Promise<T>): Promise<T> {
    if (!this.isAccepting) {
      return Promise.reject(new Error('Not accepting new operations'));
    }

    this.pendingOperations.add(operation);

    return operation.finally(() => {
      this.pendingOperations.delete(operation);
    });
  }

  /**
   * 新規操作の受付を停止
   */
  stopAccepting(): void {
    this.isAccepting = false;
  }

  /**
   * 進行中の操作数
   */
  get pendingCount(): number {
    return this.pendingOperations.size;
  }

  /**
   * すべての操作が完了するまで待機
   */
  async waitForOperations(): Promise<void> {
    if (this.pendingOperations.size === 0) {
      return;
    }

    console.log(`Waiting for ${this.pendingOperations.size} pending operations...`);

    const timeout = new Promise<void>((_, reject) => {
      setTimeout(
        () => reject(new Error('Operation timeout')),
        this.options.operationTimeout
      );
    });

    try {
      await Promise.race([
        Promise.allSettled([...this.pendingOperations]),
        timeout,
      ]);
    } catch {
      console.warn(`Timeout: ${this.pendingOperations.size} operations still pending`);
    }
  }

  /**
   * ShutdownManagerに登録するためのハンドラーを作成
   */
  createHandler(closeWatcher: () => Promise<void>): CleanupHandler {
    return {
      name: 'FileWatcher',
      priority: 5,
      handler: async () => {
        // 1. 新規操作の受付を停止
        this.stopAccepting();

        // 2. 進行中の操作を待機
        await this.waitForOperations();

        // 3. ウォッチャーをクローズ
        const closeTimeout = new Promise<void>((_, reject) => {
          setTimeout(
            () => reject(new Error('Close timeout')),
            this.options.closeTimeout
          );
        });

        await Promise.race([closeWatcher(), closeTimeout]);
      },
    };
  }
}

// ============================================================
// シングルトンインスタンス
// ============================================================

let defaultManager: ShutdownManager | null = null;

/**
 * デフォルトのShutdownManagerを取得
 */
export function getShutdownManager(config?: Partial<ShutdownConfig>): ShutdownManager {
  if (!defaultManager) {
    defaultManager = new ShutdownManager(config);
  }
  return defaultManager;
}

/**
 * シャットダウンハンドラーを登録（シングルトン使用）
 */
export function onShutdown(
  name: string,
  handler: () => Promise<void>,
  priority: number = 10
): void {
  getShutdownManager().register(name, handler, priority);
}

// ============================================================
// 使用例
// ============================================================

/*
import {
  ShutdownManager,
  FileWatcherShutdown,
  onShutdown,
} from './shutdown-manager';
import chokidar from 'chokidar';

// ============================================================
// 方法1: ShutdownManager を直接使用
// ============================================================

const shutdownManager = new ShutdownManager({
  timeout: 30000,
  handleSignals: true,
});

const watcher = chokidar.watch('./src');
const watcherShutdown = new FileWatcherShutdown();

// ファイル変更時の処理を追跡
watcher.on('change', (path) => {
  const operation = processFile(path);
  watcherShutdown.trackOperation(operation);
});

// シャットダウンハンドラーを登録
shutdownManager.register(
  watcherShutdown.createHandler(() => watcher.close())
);

shutdownManager.register({
  name: 'Database',
  priority: 10,
  handler: async () => {
    await db.close();
  },
});

// イベントリスナー
shutdownManager.on('shutdown', () => {
  console.log('Shutdown started');
});

shutdownManager.on('complete', (result) => {
  console.log(`Shutdown completed in ${result.duration}ms`);
});

// ============================================================
// 方法2: シングルトン関数を使用
// ============================================================

onShutdown('FileWatcher', async () => {
  await watcher.close();
}, 5);

onShutdown('Database', async () => {
  await db.close();
}, 10);

// シグナル（SIGTERM, SIGINT）は自動的にハンドルされる
*/
