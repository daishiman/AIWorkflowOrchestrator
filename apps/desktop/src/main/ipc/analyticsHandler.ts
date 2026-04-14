/**
 * @file analyticsHandler.ts
 * @description Analytics IPC ハンドラー（UT-W3-ANALYTICS-ADAPTER-001, UT-W3-ANALYTICS-HTTP-PROVIDER-001）
 *
 * Renderer から IPC 経由で受け取ったイベントを処理する Main プロセス側ハンドラー。
 * チャネル名: analytics:send, analytics:get-stats
 *
 * - オプトアウト確認後、AnalyticsHttpProvider 経由で HTTP 送信する
 * - 送信成功/失敗を analyticsStore の sentCount/failedCount に記録する
 * - 不正リクエストは success: false を返す
 * - エラーをスローしない（呼び出し元を壊さない設計）
 */

import { ipcMain } from "electron";
import Store from "electron-store";
import { IPC_CHANNELS } from "../../preload/channels";
import { AnalyticsHttpProvider } from "../services/analytics/AnalyticsHttpProvider";

interface AnalyticsSendRequest {
  eventName: string;
  payload: Record<string, unknown>;
  timestamp: number;
  optedOut?: boolean;
}

interface AnalyticsSendResponse {
  success: boolean;
  skipped?: boolean;
  error?: string;
}

interface AnalyticsStatsResponse {
  sentCount: number;
  failedCount: number;
  analyticsOptOut: boolean;
}

interface AnalyticsStoreSchema {
  analyticsOptOut?: boolean;
  sentCount?: number;
  failedCount?: number;
  [key: string]: unknown;
}

const analyticsStore = new Store<AnalyticsStoreSchema>({
  name: "knowledge-studio",
});

// AnalyticsHttpProvider をシングルトンとして生成し、store を DI する
const analyticsProvider = new AnalyticsHttpProvider({
  store: {
    get: (key: string, defaultValue: number) =>
      (analyticsStore.get(key, defaultValue) as number | undefined) ??
      defaultValue,
    set: (key: string, value: number) =>
      analyticsStore.set(key as keyof AnalyticsStoreSchema, value),
  },
});

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateRequest(
  body: unknown,
):
  | { valid: true; data: AnalyticsSendRequest }
  | { valid: false; error: string } {
  if (!isPlainObject(body)) {
    return { valid: false, error: "Request must be a non-null object" };
  }

  const { eventName, payload } = body;

  if (typeof eventName !== "string" || eventName.trim() === "") {
    return { valid: false, error: "eventName must be a non-empty string" };
  }

  if (!isPlainObject(payload)) {
    return { valid: false, error: "payload must be a plain object" };
  }

  return {
    valid: true,
    data: {
      eventName,
      payload,
      timestamp:
        typeof body.timestamp === "number" ? body.timestamp : Date.now(),
      optedOut: body.optedOut === true,
    },
  };
}

export function registerAnalyticsHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.ANALYTICS_SEND,
    async (_event, body: unknown): Promise<AnalyticsSendResponse> => {
      const validated = validateRequest(body);
      if (!validated.valid) {
        return { success: false, error: validated.error };
      }

      const { eventName, payload, timestamp, optedOut } = validated.data;

      let storeOptedOut = false;
      try {
        storeOptedOut = analyticsStore.get("analyticsOptOut", false) === true;
      } catch {
        storeOptedOut = true;
      }

      // オプトアウト確認（AC-4） - Main 側の最終防衛線
      if (optedOut || storeOptedOut) {
        return { success: true, skipped: true };
      }

      // イベント記録（開発環境のみ）
      if (process.env.NODE_ENV !== "production") {
        console.info("[analyticsHandler] received:", {
          eventName,
          payload,
          timestamp: new Date(timestamp).toISOString(),
        });
      }

      // AnalyticsHttpProvider 経由で HTTP 送信（TODO 解消）
      const result = await analyticsProvider.send({
        eventName,
        payload,
        timestamp,
      });

      return result;
    },
  );

  // analytics:get-stats ハンドラー（AC-8）
  ipcMain.handle(
    IPC_CHANNELS.ANALYTICS_GET_STATS,
    async (): Promise<AnalyticsStatsResponse> => {
      try {
        return {
          sentCount: (analyticsStore.get("sentCount", 0) as number) ?? 0,
          failedCount: (analyticsStore.get("failedCount", 0) as number) ?? 0,
          analyticsOptOut:
            analyticsStore.get("analyticsOptOut", false) === true,
        };
      } catch {
        // ストア読み取りエラー時はデフォルト値を返す
        return { sentCount: 0, failedCount: 0, analyticsOptOut: true };
      }
    },
  );
}
