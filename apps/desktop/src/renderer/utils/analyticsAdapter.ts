/**
 * @file analyticsAdapter.ts
 * @description Analytics Adapter（UT-W3-ANALYTICS-ADAPTER-001）
 *
 * trackEvent.ts の sink を IPC 経由の analytics sink に差し替えるアダプター。
 * - オフライン時: in-memory キューに保持（上限 500 件、TTL 7 日）
 * - オプトアウト: `analyticsOptOut` を store から参照して送信を抑止
 * - 初期化失敗: no-op アダプターにフォールバック（エラーをスローしない）
 *
 * 呼び出しフロー:
 *   trackEvent.ts → analyticsAdapter.send() → window.analyticsAPI.send() [Preload]
 *                                               → IPC "analytics:send" → analyticsHandler.ts
 */

const QUEUE_MAX_SIZE = 500;
const QUEUE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7日

export interface AnalyticsSendRequest {
  eventName: string;
  payload: Record<string, unknown>;
  timestamp: number;
  optedOut?: boolean;
}

export interface AnalyticsSendResponse {
  success: boolean;
  skipped?: boolean;
  queued?: boolean;
  error?: string;
}

export interface AnalyticsAdapter {
  send(eventName: string, payload: Record<string, unknown>): void;
  flush(): Promise<void>;
  isOptedOut(): boolean;
  getQueueSize(): number;
}

interface QueuedEvent {
  eventName: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

interface CreateAnalyticsAdapterOptions {
  optedOut?: boolean;
}

interface StoreGetResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

interface AnalyticsStoreAPI {
  get: (request: {
    key: string;
    defaultValue?: boolean;
  }) => Promise<StoreGetResponse>;
}

interface AnalyticsWindow {
  analyticsAPI?: {
    send: (req: AnalyticsSendRequest) => Promise<AnalyticsSendResponse>;
  };
  electronAPI?: {
    store?: AnalyticsStoreAPI;
  };
}

function getAnalyticsWindow(): AnalyticsWindow {
  return window as unknown as AnalyticsWindow;
}

function getAnalyticsAPI():
  | { send: (req: AnalyticsSendRequest) => Promise<AnalyticsSendResponse> }
  | undefined {
  return getAnalyticsWindow().analyticsAPI;
}

function getStoreAPI(): AnalyticsStoreAPI | undefined {
  return getAnalyticsWindow().electronAPI?.store;
}

function createAdapter(
  options: CreateAnalyticsAdapterOptions = {},
): AnalyticsAdapter {
  const optOutOverride = options.optedOut;
  const queue: QueuedEvent[] = [];
  let lastKnownOptOut = optOutOverride ?? false;
  let optOutRequestInFlight: Promise<boolean> | null = null;
  let operationQueue: Promise<void> = Promise.resolve();

  function isOnline(): boolean {
    return navigator.onLine;
  }

  function pruneTTL(): void {
    const now = Date.now();
    const cutoff = now - QUEUE_TTL_MS;
    let index = 0;

    while (index < queue.length && queue[index].timestamp < cutoff) {
      index++;
    }

    if (index > 0) {
      queue.splice(0, index);
    }
  }

  async function resolveOptOut(): Promise<boolean> {
    if (typeof optOutOverride === "boolean") {
      lastKnownOptOut = optOutOverride;
      return optOutOverride;
    }

    if (!optOutRequestInFlight) {
      const storeAPI = getStoreAPI();

      if (!storeAPI) {
        lastKnownOptOut = true;
        return true;
      }

      optOutRequestInFlight = storeAPI
        .get({ key: "analyticsOptOut", defaultValue: false })
        .then((response) => {
          const optedOut = response.success ? response.data === true : true;
          lastKnownOptOut = optedOut;
          return optedOut;
        })
        .catch(() => {
          lastKnownOptOut = true;
          return true;
        })
        .finally(() => {
          optOutRequestInFlight = null;
        });
    }

    return optOutRequestInFlight;
  }

  async function sendEvent(event: QueuedEvent): Promise<void> {
    const api = getAnalyticsAPI();
    if (!api) return;

    try {
      await api.send({
        eventName: event.eventName,
        payload: event.payload,
        timestamp: event.timestamp,
      });
    } catch {
      // 送信失敗は呼び出し元へ伝播しない
    }
  }

  function schedule(task: () => Promise<void>): Promise<void> {
    operationQueue = operationQueue.then(task).catch(() => undefined);
    return operationQueue;
  }

  if (typeof optOutOverride !== "boolean") {
    void resolveOptOut();
  }

  return {
    send(eventName: string, payload: Record<string, unknown>): void {
      void schedule(async () => {
        const optedOut = await resolveOptOut();
        if (optedOut) return;

        const event: QueuedEvent = {
          eventName,
          payload,
          timestamp: Date.now(),
        };

        if (!isOnline()) {
          pruneTTL();
          if (queue.length >= QUEUE_MAX_SIZE) {
            queue.shift();
          }
          queue.push(event);
          return;
        }

        await sendEvent(event);
      });
    },

    flush(): Promise<void> {
      return schedule(async () => {
        const optedOut = await resolveOptOut();
        if (optedOut) {
          queue.length = 0;
          return;
        }

        pruneTTL();
        const events = queue.splice(0);

        for (const event of events) {
          await sendEvent(event);
        }
      });
    },

    isOptedOut(): boolean {
      return lastKnownOptOut;
    },

    getQueueSize(): number {
      return queue.length;
    },
  };
}

// ──────────────────────────────────────────────────────────────
// シングルトン管理
// ──────────────────────────────────────────────────────────────

let instance: AnalyticsAdapter | null = null;
let onlineHandler: (() => void) | null = null;

/**
 * AnalyticsAdapter を新規作成し、シングルトンとして登録する。
 * テストなど再初期化が必要な場合は resetAnalyticsAdapter() を先に呼ぶ。
 */
export function createAnalyticsAdapter(
  options: CreateAnalyticsAdapterOptions = {},
): AnalyticsAdapter {
  if (typeof window !== "undefined" && onlineHandler) {
    window.removeEventListener("online", onlineHandler);
    onlineHandler = null;
  }

  instance = createAdapter(options);

  if (typeof window !== "undefined") {
    onlineHandler = () => {
      instance?.flush().catch(() => {});
    };
    window.addEventListener("online", onlineHandler);
  }

  return instance;
}

/**
 * シングルトンの AnalyticsAdapter を返す。
 * 未作成の場合はデフォルト設定で初期化する。
 */
export function getAnalyticsAdapter(): AnalyticsAdapter {
  if (!instance) {
    return createAnalyticsAdapter();
  }
  return instance;
}

/**
 * テスト用: シングルトンをリセットする。
 * 本番コードでは使用しない。
 */
export function resetAnalyticsAdapter(): void {
  if (typeof window !== "undefined" && onlineHandler) {
    window.removeEventListener("online", onlineHandler);
    onlineHandler = null;
  }
  instance = null;
}
