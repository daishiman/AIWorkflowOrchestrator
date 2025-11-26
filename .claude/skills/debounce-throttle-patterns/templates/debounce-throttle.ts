/**
 * デバウンス・スロットリングユーティリティ
 *
 * ファイル監視やイベント処理での高頻度イベント最適化に使用
 */

// ============================================================
// 型定義
// ============================================================

export interface DebouncedFunction<T extends (...args: any[]) => void> {
  (...args: Parameters<T>): void;
  /** 保留中の実行をキャンセル */
  cancel: () => void;
  /** 保留中の実行を即座に実行 */
  flush: () => void;
  /** 保留中かどうか */
  pending: () => boolean;
}

export interface ThrottledFunction<T extends (...args: any[]) => void> {
  (...args: Parameters<T>): void;
  /** スロットリングをリセット */
  reset: () => void;
}

// ============================================================
// デバウンス実装
// ============================================================

/**
 * デバウンス関数（キャンセル・フラッシュ対応）
 *
 * @param fn 実行する関数
 * @param delay 待機時間（ms）
 * @returns デバウンスされた関数
 *
 * @example
 * const debouncedSave = debounce((data) => save(data), 300);
 * debouncedSave(data1);
 * debouncedSave(data2); // data2のみ保存される
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): DebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
      lastArgs = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  debounced.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      fn(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  debounced.pending = () => timeoutId !== null;

  return debounced;
}

/**
 * Leading edge デバウンス（最初のイベントで即座に実行）
 */
export function debounceLeading<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): DebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let canExecute = true;

  const debounced = (...args: Parameters<T>) => {
    if (canExecute) {
      fn(...args);
      canExecute = false;
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      canExecute = true;
      timeoutId = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    canExecute = true;
  };

  debounced.flush = () => {
    debounced.cancel();
  };

  debounced.pending = () => timeoutId !== null;

  return debounced;
}

/**
 * 最大待機時間付きデバウンス
 *
 * @param fn 実行する関数
 * @param delay デバウンス待機時間（ms）
 * @param maxWait 最大待機時間（ms）
 */
export function debounceWithMaxWait<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
  maxWait: number
): DebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let maxWaitTimeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastInvokeTime = 0;

  const invoke = () => {
    if (lastArgs) {
      fn(...lastArgs);
      lastArgs = null;
      lastInvokeTime = Date.now();
    }
    if (timeoutId) clearTimeout(timeoutId);
    if (maxWaitTimeoutId) clearTimeout(maxWaitTimeoutId);
    timeoutId = null;
    maxWaitTimeoutId = null;
  };

  const debounced = (...args: Parameters<T>) => {
    const now = Date.now();
    lastArgs = args;

    // 最大待機タイマーを開始（まだ開始していない場合）
    if (!maxWaitTimeoutId) {
      const timeSinceLastInvoke = now - lastInvokeTime;
      const remainingMaxWait = Math.max(0, maxWait - timeSinceLastInvoke);
      maxWaitTimeoutId = setTimeout(invoke, remainingMaxWait);
    }

    // 通常のデバウンスタイマー
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(invoke, delay);
  };

  debounced.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    if (maxWaitTimeoutId) clearTimeout(maxWaitTimeoutId);
    timeoutId = null;
    maxWaitTimeoutId = null;
    lastArgs = null;
  };

  debounced.flush = invoke;

  debounced.pending = () => timeoutId !== null || maxWaitTimeoutId !== null;

  return debounced;
}

// ============================================================
// スロットリング実装
// ============================================================

/**
 * スロットリング関数
 *
 * @param fn 実行する関数
 * @param interval 実行間隔（ms）
 * @returns スロットリングされた関数
 *
 * @example
 * const throttledLog = throttle((msg) => console.log(msg), 1000);
 * throttledLog('a'); // 即座に実行
 * throttledLog('b'); // スキップ
 * // 1秒後
 * throttledLog('c'); // 実行
 */
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  interval: number
): ThrottledFunction<T> {
  let lastExecutionTime = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;

  const throttled = (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecutionTime;
    lastArgs = args;

    if (timeSinceLastExecution >= interval) {
      fn(...args);
      lastExecutionTime = now;
      lastArgs = null;
    } else if (!timeoutId) {
      // Trailing edge: 最後のイベントを保証
      timeoutId = setTimeout(() => {
        if (lastArgs) {
          fn(...lastArgs);
          lastExecutionTime = Date.now();
          lastArgs = null;
        }
        timeoutId = null;
      }, interval - timeSinceLastExecution);
    }
  };

  throttled.reset = () => {
    lastExecutionTime = 0;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };

  return throttled;
}

/**
 * Leading edge のみのスロットリング（trailing なし）
 */
export function throttleLeading<T extends (...args: any[]) => void>(
  fn: T,
  interval: number
): ThrottledFunction<T> {
  let lastExecutionTime = 0;

  const throttled = (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastExecutionTime >= interval) {
      fn(...args);
      lastExecutionTime = now;
    }
  };

  throttled.reset = () => {
    lastExecutionTime = 0;
  };

  return throttled;
}

// ============================================================
// グループ化デバウンサー
// ============================================================

/**
 * キーごとに独立したデバウンスを管理
 * ファイルパスごとに個別のデバウンスが必要な場合に使用
 */
export class GroupedDebouncer<K, V> {
  private debouncers = new Map<K, DebouncedFunction<(value: V) => void>>();
  private lastAccessTime = new Map<K, number>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly fn: (key: K, value: V) => void,
    private readonly delay: number,
    private readonly cleanupAfter: number = 60000
  ) {
    this.startCleanup();
  }

  /**
   * キーに対してデバウンスされた呼び出しを行う
   */
  call(key: K, value: V): void {
    this.lastAccessTime.set(key, Date.now());

    if (!this.debouncers.has(key)) {
      this.debouncers.set(
        key,
        debounce((v: V) => this.fn(key, v), this.delay)
      );
    }

    this.debouncers.get(key)!(value);
  }

  /**
   * 特定のキーの保留中の実行をフラッシュ
   */
  flush(key: K): void {
    this.debouncers.get(key)?.flush();
  }

  /**
   * 全てのキーの保留中の実行をフラッシュ
   */
  flushAll(): void {
    this.debouncers.forEach((debouncer) => debouncer.flush());
  }

  /**
   * 特定のキーの保留中の実行をキャンセル
   */
  cancel(key: K): void {
    this.debouncers.get(key)?.cancel();
  }

  /**
   * 全てのキーの保留中の実行をキャンセル
   */
  cancelAll(): void {
    this.debouncers.forEach((debouncer) => debouncer.cancel());
  }

  /**
   * リソースを解放
   */
  destroy(): void {
    this.stopCleanup();
    this.cancelAll();
    this.debouncers.clear();
    this.lastAccessTime.clear();
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const keysToDelete: K[] = [];

      this.lastAccessTime.forEach((time, key) => {
        if (now - time > this.cleanupAfter) {
          const debouncer = this.debouncers.get(key);
          if (debouncer && !debouncer.pending()) {
            keysToDelete.push(key);
          }
        }
      });

      keysToDelete.forEach((key) => {
        this.debouncers.delete(key);
        this.lastAccessTime.delete(key);
      });
    }, this.cleanupAfter);
  }

  private stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// ============================================================
// 使用例
// ============================================================

/*
import { debounce, throttle, GroupedDebouncer } from './debounce-throttle';
import chokidar from 'chokidar';

// 基本的なデバウンス
const debouncedSave = debounce((path: string) => {
  console.log(`Saving: ${path}`);
}, 300);

// ファイルパス別デバウンス
const fileDebouncer = new GroupedDebouncer<string, void>(
  (path) => {
    console.log(`Processing: ${path}`);
  },
  300
);

// Chokidarとの統合
const watcher = chokidar.watch('./input', {
  persistent: true,
  ignoreInitial: true,
});

watcher.on('change', (path) => {
  fileDebouncer.call(path, undefined);
});

// graceful shutdown
process.on('SIGTERM', () => {
  fileDebouncer.flushAll();
  fileDebouncer.destroy();
  watcher.close();
});
*/
