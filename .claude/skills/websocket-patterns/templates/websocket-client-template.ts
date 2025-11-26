/**
 * WebSocketクライアント テンプレート
 *
 * 堅牢なWebSocket接続を実現するためのクライアント実装。
 * 接続ライフサイクル、ハートビート、メッセージキューイングを含む。
 *
 * 使用方法:
 * 1. このテンプレートをプロジェクトにコピー
 * 2. 設定を調整
 * 3. メッセージハンドラを実装
 */

// ============================================================
// 型定義
// ============================================================

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

interface WebSocketConfig {
  url: string;
  protocols?: string[];
  // 再接続設定
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  connectionTimeout: number;
  autoReconnect: boolean;
  // ハートビート設定
  heartbeatInterval: number;
  heartbeatTimeout: number;
  maxMissedHeartbeats: number;
  // キュー設定
  queueMaxSize: number;
  queueMaxAge: number;
}

interface QueuedMessage {
  id: string;
  payload: unknown;
  priority: 'high' | 'normal' | 'low';
  createdAt: number;
  attempts: number;
  maxAttempts: number;
}

interface WebSocketEvents {
  connected: { timestamp: number };
  disconnected: { reason: string };
  reconnecting: { attempt: number; delay: number };
  message: unknown;
  error: { type: string; error: Error };
  heartbeat_timeout: void;
  max_retries_reached: void;
}

// ============================================================
// デフォルト設定
// ============================================================

const DEFAULT_CONFIG: WebSocketConfig = {
  url: '',
  protocols: [],
  maxRetries: 10,
  baseDelay: 1000,
  maxDelay: 30000,
  connectionTimeout: 10000,
  autoReconnect: true,
  heartbeatInterval: 30000,
  heartbeatTimeout: 10000,
  maxMissedHeartbeats: 3,
  queueMaxSize: 1000,
  queueMaxAge: 300000,
};

// ============================================================
// WebSocketクライアント
// ============================================================

class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private state: ConnectionState = 'disconnected';

  // 再接続
  private retryCount = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectionTimeoutTimer: ReturnType<typeof setTimeout> | null = null;

  // ハートビート
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private pendingPing = false;
  private missedHeartbeats = 0;

  // メッセージキュー
  private queue: QueuedMessage[] = [];

  // イベントリスナー
  private listeners = new Map<keyof WebSocketEvents, Set<Function>>();

  constructor(config: Partial<WebSocketConfig> & { url: string }) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ------------------------------------------------------------
  // 接続管理
  // ------------------------------------------------------------

  connect(): void {
    if (this.state === 'connected' || this.state === 'connecting') {
      return;
    }

    this.state = 'connecting';
    this.clearTimers();

    try {
      this.ws = new WebSocket(this.config.url, this.config.protocols);
      this.setupEventHandlers();
      this.startConnectionTimeout();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  disconnect(): void {
    this.clearTimers();

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000, 'Client disconnect');
    }

    this.state = 'disconnected';
    this.ws = null;
    this.retryCount = 0;
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.clearConnectionTimeout();
      this.state = 'connected';
      this.retryCount = 0;

      this.startHeartbeat();
      this.flushQueue();

      this.emit('connected', { timestamp: Date.now() });
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'pong') {
          this.handlePong();
          return;
        }

        this.emit('message', message);
      } catch (error) {
        this.emit('error', { type: 'parse_error', error: error as Error });
      }
    };

    this.ws.onclose = (event) => {
      this.stopHeartbeat();
      this.clearConnectionTimeout();

      if (event.wasClean) {
        this.state = 'disconnected';
        this.emit('disconnected', { reason: 'clean_close' });
      } else if (this.config.autoReconnect) {
        this.scheduleReconnect();
      } else {
        this.state = 'disconnected';
        this.emit('disconnected', { reason: 'connection_lost' });
      }
    };

    this.ws.onerror = (error) => {
      this.emit('error', { type: 'connection_error', error: error as unknown as Error });
    };
  }

  // ------------------------------------------------------------
  // 再接続ロジック
  // ------------------------------------------------------------

  private scheduleReconnect(): void {
    if (this.retryCount >= this.config.maxRetries) {
      this.state = 'disconnected';
      this.emit('max_retries_reached', undefined);
      return;
    }

    this.state = 'reconnecting';
    this.retryCount++;

    const delay = this.calculateDelay(this.retryCount);

    this.emit('reconnecting', {
      attempt: this.retryCount,
      delay,
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private calculateDelay(attempt: number): number {
    const exponential = this.config.baseDelay * Math.pow(2, attempt);
    const capped = Math.min(exponential, this.config.maxDelay);

    // ジッター追加（±25%）
    const jitterRange = capped * 0.25;
    const jitter = (Math.random() - 0.5) * 2 * jitterRange;

    return Math.floor(capped + jitter);
  }

  private startConnectionTimeout(): void {
    this.connectionTimeoutTimer = setTimeout(() => {
      if (this.state === 'connecting') {
        this.ws?.close();
        this.scheduleReconnect();
      }
    }, this.config.connectionTimeout);
  }

  private clearConnectionTimeout(): void {
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer);
      this.connectionTimeoutTimer = null;
    }
  }

  // ------------------------------------------------------------
  // ハートビート
  // ------------------------------------------------------------

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.sendPing();
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.pendingPing = false;
    this.missedHeartbeats = 0;
  }

  private sendPing(): void {
    if (this.pendingPing) {
      this.missedHeartbeats++;

      if (this.missedHeartbeats >= this.config.maxMissedHeartbeats) {
        this.emit('heartbeat_timeout', undefined);
        this.ws?.close();
        return;
      }
    }

    this.pendingPing = true;
    this.send({ type: 'ping', timestamp: Date.now() });

    setTimeout(() => {
      if (this.pendingPing) {
        this.missedHeartbeats++;
      }
    }, this.config.heartbeatTimeout);
  }

  private handlePong(): void {
    this.pendingPing = false;
    this.missedHeartbeats = 0;
  }

  // ------------------------------------------------------------
  // メッセージ送信
  // ------------------------------------------------------------

  send(payload: unknown, priority: 'high' | 'normal' | 'low' = 'normal'): string {
    const id = this.generateId();

    if (this.state === 'connected' && this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(payload));
        return id;
      } catch {
        // 送信失敗 → キューに追加
      }
    }

    // 接続断または送信失敗 → キューに追加
    this.enqueue(id, payload, priority);
    return id;
  }

  private enqueue(id: string, payload: unknown, priority: 'high' | 'normal' | 'low'): void {
    if (this.queue.length >= this.config.queueMaxSize) {
      this.removeOldestFromQueue();
    }

    this.queue.push({
      id,
      payload,
      priority,
      createdAt: Date.now(),
      attempts: 0,
      maxAttempts: 3,
    });

    this.sortQueueByPriority();
  }

  private async flushQueue(): Promise<void> {
    while (this.queue.length > 0 && this.state === 'connected') {
      const message = this.queue.shift();
      if (!message) break;

      try {
        this.ws?.send(JSON.stringify(message.payload));
      } catch {
        message.attempts++;
        if (message.attempts < message.maxAttempts) {
          this.queue.unshift(message);
        }
        break;
      }
    }
  }

  private sortQueueByPriority(): void {
    const order = { high: 0, normal: 1, low: 2 };
    this.queue.sort((a, b) => order[a.priority] - order[b.priority]);
  }

  private removeOldestFromQueue(): void {
    // 低優先度から削除
    const lowIdx = this.queue.findIndex((m) => m.priority === 'low');
    if (lowIdx !== -1) {
      this.queue.splice(lowIdx, 1);
      return;
    }

    // なければ最古を削除
    this.queue.shift();
  }

  // ------------------------------------------------------------
  // イベント管理
  // ------------------------------------------------------------

  on<K extends keyof WebSocketEvents>(
    event: K,
    callback: (data: WebSocketEvents[K]) => void
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private emit<K extends keyof WebSocketEvents>(event: K, data: WebSocketEvents[K]): void {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }

  private handleError(error: Error): void {
    this.emit('error', { type: 'connection_error', error });

    if (this.config.autoReconnect) {
      this.scheduleReconnect();
    }
  }

  // ------------------------------------------------------------
  // ユーティリティ
  // ------------------------------------------------------------

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();
    this.clearConnectionTimeout();
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ------------------------------------------------------------
  // 状態アクセサ
  // ------------------------------------------------------------

  getState(): ConnectionState {
    return this.state;
  }

  isConnected(): boolean {
    return this.state === 'connected';
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getRetryCount(): number {
    return this.retryCount;
  }
}

// ============================================================
// エクスポート
// ============================================================

export { WebSocketClient, WebSocketConfig, ConnectionState, QueuedMessage, WebSocketEvents };
export default WebSocketClient;
