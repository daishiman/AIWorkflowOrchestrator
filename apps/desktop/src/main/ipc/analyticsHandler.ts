/**
 * @file analyticsHandler.ts
 * @description Analytics IPC ハンドラー（UT-W3-ANALYTICS-ADAPTER-001）
 *
 * Renderer から IPC 経由で受け取ったイベントを処理する Main プロセス側ハンドラー。
 * チャネル名: analytics:send
 *
 * - オプトアウト確認後、イベントをログ記録（将来: HTTP送信）
 * - 不正リクエストは success: false を返す
 * - エラーをスローしない（呼び出し元を壊さない設計）
 */

import { ipcMain } from "electron";
import Store from "electron-store";
import { IPC_CHANNELS } from "../../preload/channels";

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

interface AnalyticsStoreSchema {
  analyticsOptOut?: boolean;
  [key: string]: unknown;
}

const analyticsStore = new Store<AnalyticsStoreSchema>({
  name: "knowledge-studio",
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

      // イベント記録（将来: HTTP送信 → 外部分析基盤）
      if (process.env.NODE_ENV !== "production") {
        console.info("[analyticsHandler] received:", {
          eventName,
          payload,
          timestamp: new Date(timestamp).toISOString(),
        });
      }

      // TODO: 本番環境での HTTP 送信実装（外部分析基盤への接続）
      // await sendToAnalyticsProvider({ eventName, payload, timestamp });

      return { success: true };
    },
  );
}
