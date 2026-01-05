/**
 * 接続管理テンプレート
 *
 * 用途:
 *   ネットワーク接続状態の監視と自動再接続を管理
 *   ヘルスチェック、状態遷移、イベント通知を統合
 *
 * カスタマイズポイント:
 *   - {{HEALTH_CHECK_URL}}: ヘルスチェックURL (デフォルト: /api/health)
 *   - {{CHECK_INTERVAL}}: チェック間隔 (デフォルト: 30000ms)
 *   - {{CHECK_TIMEOUT}}: タイムアウト (デフォルト: 5000ms)
 */

import { EventEmitter } from "events";

// ========================================
// 型定義
// ========================================

export type ConnectionState = "online" | "offline" | "reconnecting";

export interface ConnectionConfig {
  healthCheckUrl: string;
  checkInterval: number;
  checkTimeout: number;
  backoff: {
    baseDelay: number;
    maxDelay: number;
    jitterFactor: number;
  };
}

export interface ConnectionStatus {
  state: ConnectionState;
  lastOnline?: Date;
  lastOffline?: Date;
  reconnectAttempt: number;
  nextReconnectAt?: Date;
}

export interface ConnectionEvents {
  online: { timestamp: Date };
  offline: { timestamp: Date; reason: string };
  reconnecting: { attempt: number; nextTryIn: number };
  error: { error: Error };
}

// ========================================
// デフォルト設定
// ========================================

const DEFAULT_CONFIG: ConnectionConfig = {
  healthCheckUrl: "/api/health",
  checkInterval: 30000, // 30秒
  checkTimeout: 5000, // 5秒
  backoff: {
    baseDelay: 1000, // 1秒
    maxDelay: 64000, // 64秒
    jitterFactor: 0.25, // ±25%
  },
};

// ========================================
// 接続管理クラス
// ========================================

export class ConnectionManager extends EventEmitter {
  private config: ConnectionConfig;
  private status: ConnectionStatus;
  private checkTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<ConnectionConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.status = {
      state: "offline",
      reconnectAttempt: 0,
    };
  }

  /**
   * 接続監視を開始する
   */
  start(): void {
    this.scheduleHealthCheck();
  }

  /**
   * 接続監視を停止する
   */
  stop(): void {
    if (this.checkTimer) {
      clearTimeout(this.checkTimer);
      this.checkTimer = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * 現在の接続状態を取得する
   */
  getStatus(): ConnectionStatus {
    return { ...this.status };
  }

  /**
   * オンラインかどうか
   */
  isOnline(): boolean {
    return this.status.state === "online";
  }

  /**
   * ヘルスチェックをスケジュールする
   */
  private scheduleHealthCheck(): void {
    this.checkTimer = setTimeout(async () => {
      await this.performHealthCheck();
      this.scheduleHealthCheck();
    }, this.config.checkInterval);
  }

  /**
   * ヘルスチェックを実行する
   */
  private async performHealthCheck(): Promise<void> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        this.config.checkTimeout,
      );

      const response = await fetch(this.config.healthCheckUrl, {
        method: "HEAD",
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (this.isHealthy(response)) {
        this.transitionToOnline();
      } else {
        this.transitionToOffline("ヘルスチェック失敗");
      }
    } catch (error) {
      this.transitionToOffline(
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }

  /**
   * レスポンスが健全かどうか判定する
   */
  private isHealthy(response: Response): boolean {
    return response.status >= 200 && response.status < 300;
  }

  /**
   * オンライン状態に遷移する
   */
  private transitionToOnline(): void {
    if (this.status.state === "online") return;

    const previousState = this.status.state;
    this.status = {
      state: "online",
      lastOnline: new Date(),
      reconnectAttempt: 0,
    };

    this.emit("online", { timestamp: new Date() });

    // オフライン→オンラインの場合、キュー処理を通知
    if (previousState === "offline" || previousState === "reconnecting") {
      this.emit("ready-to-sync", {});
    }
  }

  /**
   * オフライン状態に遷移する
   */
  private transitionToOffline(reason: string): void {
    if (this.status.state === "offline") {
      // 既にオフラインなら再接続を試行
      this.scheduleReconnect();
      return;
    }

    this.status = {
      ...this.status,
      state: "offline",
      lastOffline: new Date(),
    };

    this.emit("offline", { timestamp: new Date(), reason });
    this.scheduleReconnect();
  }

  /**
   * 再接続をスケジュールする
   */
  private scheduleReconnect(): void {
    this.status.reconnectAttempt++;
    this.status.state = "reconnecting";

    const delay = this.calculateBackoff(this.status.reconnectAttempt);
    this.status.nextReconnectAt = new Date(Date.now() + delay);

    this.emit("reconnecting", {
      attempt: this.status.reconnectAttempt,
      nextTryIn: delay,
    });

    this.reconnectTimer = setTimeout(() => {
      this.performHealthCheck();
    }, delay);
  }

  /**
   * バックオフ遅延を計算する
   */
  private calculateBackoff(attempt: number): number {
    const { baseDelay, maxDelay, jitterFactor } = this.config.backoff;

    const exponential = baseDelay * Math.pow(2, attempt - 1);
    const capped = Math.min(exponential, maxDelay);

    const jitterRange = capped * jitterFactor;
    const jitter = (Math.random() - 0.5) * 2 * jitterRange;

    return Math.floor(capped + jitter);
  }
}
