/**
 * Token Refresh Scheduler
 *
 * セッション自動リフレッシュのスケジューリングを管理する。
 * Main Process で動作し、setTimeout ベースで有効期限前にリフレッシュを実行。
 * 失敗時は指数バックオフでリトライする。
 *
 * @module @repo/desktop/main/services/tokenRefreshScheduler
 */

// =============================================================================
// 型定義
// =============================================================================

/**
 * スケジューラー設定
 */
export interface TokenRefreshSchedulerConfig {
  /** リフレッシュ開始オフセット（ミリ秒）。デフォルト: 300000（5分） */
  refreshBeforeExpiryMs: number;
  /** リトライ最大回数。デフォルト: 3 */
  maxRetries: number;
  /** リトライ初期間隔（ミリ秒）。デフォルト: 1000（1秒）。指数バックオフで増加 */
  retryBaseIntervalMs: number;
}

/**
 * リフレッシュコールバック
 */
export interface TokenRefreshCallbacks {
  /** リフレッシュ実行コールバック。成功時に新しい expiresAt（ミリ秒）を返す。失敗時は null または例外 */
  onRefresh: () => Promise<number | null>;
  /** リフレッシュ失敗コールバック（リトライ全失敗後） */
  onFailure: (error: Error) => void;
  /** リフレッシュ成功コールバック（オプション） */
  onSuccess?: (newExpiresAt: number) => void;
}

// =============================================================================
// デフォルト設定
// =============================================================================

export const DEFAULT_CONFIG: TokenRefreshSchedulerConfig = {
  refreshBeforeExpiryMs: 300_000, // 5分
  maxRetries: 3,
  retryBaseIntervalMs: 1_000, // 1秒
};

// =============================================================================
// TokenRefreshScheduler
// =============================================================================

/**
 * セッション自動リフレッシュスケジューラー
 *
 * - setTimeout ベース（setInterval ではない）
 * - 各リフレッシュ成功後に reset() で新タイマーを設定
 * - 失敗時は指数バックオフ（1s→2s→4s + ジッター）でリトライ
 * - _isRefreshing フラグによる排他制御
 */
export class TokenRefreshScheduler {
  private readonly config: TokenRefreshSchedulerConfig;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private _isRefreshing = false;
  private _isDisposed = false;
  private _callbacks: TokenRefreshCallbacks | null = null;
  private _currentExpiresAt: number | null = null;

  constructor(config?: Partial<TokenRefreshSchedulerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * スケジューラー開始
   * @param expiresAt セッション有効期限（Unixタイムスタンプ、ミリ秒）
   * @param callbacks リフレッシュコールバック
   */
  start(expiresAt: number, callbacks: TokenRefreshCallbacks): void {
    if (this._isDisposed) {
      return;
    }

    // 既存タイマーをクリア（二重start対応）
    this.clearTimers();

    this._callbacks = callbacks;
    this._currentExpiresAt = expiresAt;

    this.scheduleRefresh(expiresAt);
  }

  /**
   * スケジューラー停止
   */
  stop(): void {
    this.clearTimers();
    this._callbacks = null;
    this._currentExpiresAt = null;
  }

  /**
   * 新しい expiresAt でスケジューラーをリセット
   * @param newExpiresAt 新しいセッション有効期限（ミリ秒）
   */
  reset(newExpiresAt: number): void {
    if (!this._callbacks || this._isDisposed) {
      return;
    }

    this.clearTimers();
    this._currentExpiresAt = newExpiresAt;
    this.scheduleRefresh(newExpiresAt);
  }

  /**
   * スケジューラーの稼働状態を取得
   */
  isRunning(): boolean {
    return this.timer !== null || this.retryTimer !== null;
  }

  /**
   * リフレッシュ処理中かどうか（排他制御）
   */
  isRefreshing(): boolean {
    return this._isRefreshing;
  }

  /**
   * クリーンアップ（アプリ終了時）
   */
  dispose(): void {
    this.stop();
    this._isDisposed = true;
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  /**
   * リフレッシュをスケジュール
   */
  private scheduleRefresh(expiresAt: number): void {
    const delay = Math.max(
      0,
      expiresAt - Date.now() - this.config.refreshBeforeExpiryMs,
    );

    this.timer = setTimeout(() => {
      this.executeRefresh(0);
    }, delay);
  }

  /**
   * リフレッシュを実行（リトライ付き）
   */
  private executeRefresh(retryCount: number): void {
    if (!this._callbacks || this._isDisposed) {
      return;
    }

    this._isRefreshing = true;
    const callbacks = this._callbacks;

    callbacks
      .onRefresh()
      .then((newExpiresAt) => {
        if (newExpiresAt === null) {
          // null 返却はリトライ対象
          throw new Error("Refresh returned null");
        }

        this._isRefreshing = false;

        // 成功コールバック
        callbacks.onSuccess?.(newExpiresAt);

        // 新しい有効期限でタイマーをリセット
        if (!this._isDisposed && this._callbacks) {
          this._currentExpiresAt = newExpiresAt;
          this.clearTimers();
          this.scheduleRefresh(newExpiresAt);
        }
      })
      .catch((error: Error) => {
        this._isRefreshing = false;

        if (retryCount < this.config.maxRetries) {
          // 指数バックオフ + ジッター でリトライ
          const baseDelay =
            this.config.retryBaseIntervalMs * Math.pow(2, retryCount);
          const jitter = Math.random() * this.config.retryBaseIntervalMs * 0.1;
          const delay = baseDelay + jitter;

          this.retryTimer = setTimeout(() => {
            this.retryTimer = null;
            this.executeRefresh(retryCount + 1);
          }, delay);
        } else {
          // 全リトライ失敗
          callbacks.onFailure(error);
        }
      });
  }

  /**
   * 全タイマーをクリア
   */
  private clearTimers(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.retryTimer !== null) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }
}
