/**
 * ファイル監視システムテンプレート
 *
 * Ryan Dahlのイベント駆動・非同期I/O思想に基づく設計
 * - Observer Patternによる疎結合な通知
 * - 非同期I/Oでイベントループをブロックしない
 * - graceful shutdownによるリソース管理
 */

import { EventEmitter } from 'events';
import chokidar, { FSWatcher } from 'chokidar';
import type { Stats } from 'fs';

// ============================================================
// 型定義
// ============================================================

export interface WatcherConfig {
  /** 監視対象パス */
  watchPath: string;

  /** 除外パターン（glob形式） */
  ignored: string[];

  /** 書き込み完了待機設定 */
  awaitWriteFinish: {
    stabilityThreshold: number;
    pollInterval: number;
  };

  /** Polling使用（NFS/Docker向け） */
  usePolling: boolean;

  /** 監視継続 */
  persistent: boolean;
}

export interface FileEvent {
  type: 'add' | 'change' | 'unlink';
  path: string;
  stats?: Stats;
  timestamp: string;
}

export interface WatcherError {
  code: string;
  message: string;
  path?: string;
  recoverable: boolean;
}

// イベント型定義
interface FileWatcherEvents {
  fileAdded: (event: FileEvent) => void;
  fileChanged: (event: FileEvent) => void;
  fileRemoved: (event: FileEvent) => void;
  error: (error: WatcherError) => void;
  ready: () => void;
}

// ============================================================
// FileWatcher クラス
// ============================================================

export class FileWatcher extends EventEmitter {
  private watcher: FSWatcher | null = null;
  private isReady = false;

  constructor(private config: WatcherConfig) {
    super();
    this.setMaxListeners(10); // メモリリーク防止

    // エラーハンドラーのデフォルト登録
    this.on('error', this.defaultErrorHandler.bind(this));
  }

  // ----------------------------------------------------------
  // 公開API
  // ----------------------------------------------------------

  /**
   * 監視を開始
   */
  async start(): Promise<void> {
    if (this.watcher) {
      throw new Error('Watcher is already running');
    }

    this.watcher = chokidar.watch(this.config.watchPath, {
      ignored: this.config.ignored,
      persistent: this.config.persistent,
      ignoreInitial: true,
      awaitWriteFinish: this.config.awaitWriteFinish,
      usePolling: this.config.usePolling,
      ignorePermissionErrors: true,
      followSymlinks: false,
    });

    this.setupEventHandlers();

    // ready イベントを待機
    await this.waitForReady();
  }

  /**
   * 監視を停止（graceful shutdown）
   */
  async stop(): Promise<void> {
    if (!this.watcher) {
      return;
    }

    await this.watcher.close();
    this.watcher = null;
    this.isReady = false;
    this.removeAllListeners();
  }

  /**
   * 監視状態を取得
   */
  get isWatching(): boolean {
    return this.watcher !== null && this.isReady;
  }

  // ----------------------------------------------------------
  // 型安全なイベントリスナー
  // ----------------------------------------------------------

  onFileAdded(handler: FileWatcherEvents['fileAdded']): this {
    return this.on('fileAdded', handler);
  }

  onFileChanged(handler: FileWatcherEvents['fileChanged']): this {
    return this.on('fileChanged', handler);
  }

  onFileRemoved(handler: FileWatcherEvents['fileRemoved']): this {
    return this.on('fileRemoved', handler);
  }

  onError(handler: FileWatcherEvents['error']): this {
    return this.on('error', handler);
  }

  onReady(handler: FileWatcherEvents['ready']): this {
    return this.on('ready', handler);
  }

  // ----------------------------------------------------------
  // 内部実装
  // ----------------------------------------------------------

  private setupEventHandlers(): void {
    if (!this.watcher) return;

    this.watcher
      .on('add', (path, stats) => this.handleFileEvent('add', path, stats))
      .on('change', (path, stats) => this.handleFileEvent('change', path, stats))
      .on('unlink', (path) => this.handleFileEvent('unlink', path))
      .on('error', (error) => this.handleError(error))
      .on('ready', () => this.handleReady());
  }

  private handleFileEvent(
    type: 'add' | 'change' | 'unlink',
    path: string,
    stats?: Stats
  ): void {
    const event: FileEvent = {
      type,
      path,
      stats,
      timestamp: new Date().toISOString(),
    };

    switch (type) {
      case 'add':
        this.emit('fileAdded', event);
        break;
      case 'change':
        this.emit('fileChanged', event);
        break;
      case 'unlink':
        this.emit('fileRemoved', event);
        break;
    }
  }

  private handleError(error: Error): void {
    const watcherError: WatcherError = this.normalizeError(error);
    this.emit('error', watcherError);
  }

  private handleReady(): void {
    this.isReady = true;
    this.emit('ready');
  }

  private normalizeError(error: Error & { code?: string }): WatcherError {
    const recoverableCodes = ['EACCES', 'ENOENT', 'EMFILE', 'EBUSY'];
    return {
      code: error.code || 'UNKNOWN',
      message: error.message,
      path: (error as any).path,
      recoverable: recoverableCodes.includes(error.code || ''),
    };
  }

  private defaultErrorHandler(error: WatcherError): void {
    // ユーザーハンドラーがない場合のフォールバック
    if (this.listenerCount('error') === 1) {
      console.error('[FileWatcher] Unhandled error:', error);
    }
  }

  private waitForReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Watcher initialization timeout'));
      }, 30000);

      this.once('ready', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.once('error', (error) => {
        if (!this.isReady) {
          clearTimeout(timeout);
          reject(new Error(`Watcher initialization failed: ${error.message}`));
        }
      });
    });
  }
}

// ============================================================
// ファクトリ関数
// ============================================================

/**
 * デフォルト設定でFileWatcherを作成
 */
export function createFileWatcher(
  watchPath: string,
  options?: Partial<WatcherConfig>
): FileWatcher {
  const defaultConfig: WatcherConfig = {
    watchPath,
    ignored: [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/*.tmp',
      '**/*.swp',
      '**/.DS_Store',
      '**/Thumbs.db',
    ],
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50,
    },
    usePolling: false,
    persistent: true,
  };

  return new FileWatcher({
    ...defaultConfig,
    ...options,
  });
}

// ============================================================
// graceful shutdown ヘルパー
// ============================================================

/**
 * シグナルハンドラーを登録
 */
export function setupGracefulShutdown(watcher: FileWatcher): void {
  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down...`);
    await watcher.stop();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// ============================================================
// 使用例
// ============================================================

/*
import { createFileWatcher, setupGracefulShutdown } from './watcher';

async function main() {
  const watcher = createFileWatcher('./input-box', {
    ignored: ['**\/*.tmp'],
    usePolling: process.env.USE_POLLING === 'true',
  });

  watcher.onFileAdded((event) => {
    console.log('File added:', event.path);
    // 同期処理をトリガー
  });

  watcher.onError((error) => {
    console.error('Watcher error:', error);
  });

  setupGracefulShutdown(watcher);

  await watcher.start();
  console.log('Watcher started');
}

main().catch(console.error);
*/
