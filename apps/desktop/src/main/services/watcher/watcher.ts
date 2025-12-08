import chokidar, { type FSWatcher } from "chokidar";
import { EventEmitter } from "events";

export type FileEventType = "add" | "change" | "unlink";

export interface FileEvent {
  type: FileEventType;
  path: string;
  timestamp: Date;
}

export interface WatcherConfig {
  path: string;
  ignored?: string[];
  persistent?: boolean;
  ignoreInitial?: boolean;
}

const DEFAULT_IGNORED = [
  "**/node_modules/**",
  "**/.git/**",
  "**/dist/**",
  "**/out/**",
  "**/*.log",
  "**/.DS_Store",
];

/**
 * ファイル監視サービス
 */
export class FileWatcher extends EventEmitter {
  private watcher: FSWatcher | null = null;
  private isRunning = false;
  private config: WatcherConfig;

  constructor(config: WatcherConfig) {
    super();
    this.config = {
      ...config,
      ignored: [...DEFAULT_IGNORED, ...(config.ignored ?? [])],
      persistent: config.persistent ?? true,
      ignoreInitial: config.ignoreInitial ?? true,
    };
  }

  /**
   * 監視を開始
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.watcher = chokidar.watch(this.config.path, {
      ignored: this.config.ignored,
      persistent: this.config.persistent,
      ignoreInitial: this.config.ignoreInitial,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100,
      },
    });

    this.watcher
      .on("add", (path) => this.handleEvent("add", path))
      .on("change", (path) => this.handleEvent("change", path))
      .on("unlink", (path) => this.handleEvent("unlink", path))
      .on("error", (error) => this.emit("error", error))
      .on("ready", () => {
        this.isRunning = true;
        this.emit("ready");
      });
  }

  /**
   * 監視を停止
   */
  async stop(): Promise<void> {
    if (!this.watcher) {
      return;
    }

    await this.watcher.close();
    this.watcher = null;
    this.isRunning = false;
    this.emit("stopped");
  }

  /**
   * 監視中かどうか
   */
  get running(): boolean {
    return this.isRunning;
  }

  /**
   * 監視パスを取得
   */
  get watchPath(): string {
    return this.config.path;
  }

  private handleEvent(type: FileEventType, path: string): void {
    const event: FileEvent = {
      type,
      path,
      timestamp: new Date(),
    };
    this.emit("file", event);
    this.emit(type, event);
  }
}
