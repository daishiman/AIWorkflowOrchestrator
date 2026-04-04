/**
 * slackHandlers - Slack IPCハンドラー
 *
 * Renderer Process からの Slack 操作リクエストを処理する。
 * - Slack メッセージ送信
 * - Webhook URL 接続テスト
 * - Webhook 設定の CRUD
 */

import { ipcMain, type IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import type {
  SlackConfig,
  SlackMessage,
} from "../services/slack/ISlackService";
import type { SlackConfigStore } from "../services/slack/SlackConfigStore";
import type { SlackWebhookService } from "../services/slack/SlackWebhookService";
import { sanitizeErrorMessage } from "./sanitizeErrorMessage";

// ─── 型定義 ────────────────────────────────────────────────────

interface IpcError {
  code: string;
  message: string;
}

interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: IpcError;
}

// ─── ユーティリティ ────────────────────────────────────────────

function success<T>(data: T): IpcResult<T> {
  return { success: true, data };
}

function failure(code: string, message: string): IpcResult<never> {
  return { success: false, error: { code, message } };
}

function isValidWebhookUrl(url: unknown): url is string {
  if (typeof url !== "string" || url.trim() === "") return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" && parsed.hostname === "hooks.slack.com"
    );
  } catch {
    return false;
  }
}

function isValidSlackConfig(config: unknown): config is SlackConfig {
  if (typeof config !== "object" || config === null) return false;
  const c = config as Record<string, unknown>;
  if (!isValidWebhookUrl(c.webhookUrl)) return false;
  if (c.label !== undefined && typeof c.label !== "string") return false;
  return true;
}

function isValidSlackMessage(msg: unknown): msg is SlackMessage {
  if (typeof msg !== "object" || msg === null) return false;
  const m = msg as Record<string, unknown>;
  if (m.type !== "text" && m.type !== "blocks") return false;
  if (typeof m.text !== "string" || m.text.trim() === "") return false;
  if (m.type === "blocks" && !Array.isArray(m.blocks)) return false;
  return true;
}

// ─── 依存関係の型定義 ──────────────────────────────────────────

export interface SlackHandlerDeps {
  slackService: SlackWebhookService;
  configStore: SlackConfigStore;
}

// ─── ハンドラー登録 ────────────────────────────────────────────

export function registerSlackHandlers(deps: SlackHandlerDeps): void {
  const { slackService, configStore } = deps;

  /**
   * Slackにメッセージを送信する
   * Request: { message: SlackMessage; webhookUrl?: string }
   */
  ipcMain.handle(
    IPC_CHANNELS.SLACK_SEND,
    async (
      _event: IpcMainInvokeEvent,
      request: { message?: unknown; webhookUrl?: unknown } = {},
    ): Promise<IpcResult<{ sent: boolean }>> => {
      const { message, webhookUrl } = request;

      if (!isValidSlackMessage(message)) {
        return failure(
          "VALIDATION_ERROR",
          "messageが無効です。type, text（blocks の場合は blocks[]）が必要です",
        );
      }

      // Webhook URL の決定（引数 > デフォルト設定）
      let resolvedUrl: string | undefined;
      if (typeof webhookUrl === "string" && webhookUrl.trim() !== "") {
        resolvedUrl = webhookUrl;
      } else {
        const defaultConfig = configStore.getDefault();
        resolvedUrl = defaultConfig?.webhookUrl;
      }

      if (!resolvedUrl) {
        return failure(
          "CONFIG_NOT_FOUND",
          "Webhook URLが設定されていません。先にSlack設定を追加してください",
        );
      }

      try {
        const result = await slackService.send(message, resolvedUrl);
        if (!result.success) {
          return failure("SLACK_ERROR", result.error ?? "送信に失敗しました");
        }
        return success({ sent: true });
      } catch (err) {
        return failure(
          "UNKNOWN_ERROR",
          sanitizeErrorMessage(
            err,
            "Slack送信中に予期しないエラーが発生しました",
          ),
        );
      }
    },
  );

  /**
   * Webhook URL の接続テスト
   * Request: { webhookUrl: string }
   */
  ipcMain.handle(
    IPC_CHANNELS.SLACK_TEST,
    async (
      _event: IpcMainInvokeEvent,
      request: { webhookUrl?: unknown } = {},
    ): Promise<IpcResult<{ latencyMs?: number }>> => {
      const { webhookUrl } = request;

      if (!isValidWebhookUrl(webhookUrl)) {
        return failure(
          "VALIDATION_ERROR",
          "有効なSlack Webhook URL（https://hooks.slack.com/...）を指定してください",
        );
      }

      try {
        const result = await slackService.test(webhookUrl);
        if (!result.success) {
          return failure(
            "SLACK_ERROR",
            result.error ?? "接続テストに失敗しました",
          );
        }
        return success({ latencyMs: result.latencyMs });
      } catch (err) {
        return failure(
          "UNKNOWN_ERROR",
          sanitizeErrorMessage(
            err,
            "接続テスト中に予期しないエラーが発生しました",
          ),
        );
      }
    },
  );

  /**
   * 全Slack設定を取得する
   */
  ipcMain.handle(
    IPC_CHANNELS.SLACK_CONFIG_GET_ALL,
    async (
      _event: IpcMainInvokeEvent,
    ): Promise<IpcResult<{ configs: SlackConfig[] }>> => {
      try {
        const configs = configStore.getAll();
        // セキュリティ: Webhook URLの末尾をマスク
        const masked = configs.map((c) => ({
          ...c,
          webhookUrl: maskWebhookUrl(c.webhookUrl),
        }));
        return success({ configs: masked });
      } catch (err) {
        return failure(
          "UNKNOWN_ERROR",
          sanitizeErrorMessage(err, "設定の取得に失敗しました"),
        );
      }
    },
  );

  /**
   * デフォルトSlack設定を取得する
   */
  ipcMain.handle(
    IPC_CHANNELS.SLACK_CONFIG_GET_DEFAULT,
    async (
      _event: IpcMainInvokeEvent,
    ): Promise<IpcResult<{ config: SlackConfig | null }>> => {
      try {
        const config = configStore.getDefault();
        const masked = config
          ? { ...config, webhookUrl: maskWebhookUrl(config.webhookUrl) }
          : null;
        return success({ config: masked });
      } catch (err) {
        return failure(
          "UNKNOWN_ERROR",
          sanitizeErrorMessage(err, "デフォルト設定の取得に失敗しました"),
        );
      }
    },
  );

  /**
   * Slack設定を追加する
   * Request: { config: SlackConfig }
   */
  ipcMain.handle(
    IPC_CHANNELS.SLACK_CONFIG_ADD,
    async (
      _event: IpcMainInvokeEvent,
      request: { config?: unknown } = {},
    ): Promise<IpcResult<{ index: number }>> => {
      const { config } = request;

      if (!isValidSlackConfig(config)) {
        return failure(
          "VALIDATION_ERROR",
          "有効なSlack設定（webhookUrl必須）を指定してください",
        );
      }

      try {
        const index = configStore.add(config);
        return success({ index });
      } catch (err) {
        return failure(
          "UNKNOWN_ERROR",
          sanitizeErrorMessage(err, "設定の追加に失敗しました"),
        );
      }
    },
  );

  /**
   * Slack設定を更新する
   * Request: { index: number; config: SlackConfig }
   */
  ipcMain.handle(
    IPC_CHANNELS.SLACK_CONFIG_UPDATE,
    async (
      _event: IpcMainInvokeEvent,
      request: { index?: unknown; config?: unknown } = {},
    ): Promise<IpcResult<{ updated: boolean }>> => {
      const { index, config } = request;

      if (typeof index !== "number" || !Number.isInteger(index) || index < 0) {
        return failure(
          "VALIDATION_ERROR",
          "indexは0以上の整数である必要があります",
        );
      }

      if (!isValidSlackConfig(config)) {
        return failure(
          "VALIDATION_ERROR",
          "有効なSlack設定（webhookUrl必須）を指定してください",
        );
      }

      try {
        const updated = configStore.update(index, config);
        return success({ updated });
      } catch (err) {
        return failure(
          "UNKNOWN_ERROR",
          sanitizeErrorMessage(err, "設定の更新に失敗しました"),
        );
      }
    },
  );

  /**
   * Slack設定を削除する
   * Request: { index: number }
   */
  ipcMain.handle(
    IPC_CHANNELS.SLACK_CONFIG_REMOVE,
    async (
      _event: IpcMainInvokeEvent,
      request: { index?: unknown } = {},
    ): Promise<IpcResult<{ removed: boolean }>> => {
      const { index } = request;

      if (typeof index !== "number" || !Number.isInteger(index) || index < 0) {
        return failure(
          "VALIDATION_ERROR",
          "indexは0以上の整数である必要があります",
        );
      }

      try {
        const removed = configStore.remove(index);
        return success({ removed });
      } catch (err) {
        return failure(
          "UNKNOWN_ERROR",
          sanitizeErrorMessage(err, "設定の削除に失敗しました"),
        );
      }
    },
  );

  /**
   * デフォルトSlack設定を変更する
   * Request: { index: number }
   */
  ipcMain.handle(
    IPC_CHANNELS.SLACK_CONFIG_SET_DEFAULT,
    async (
      _event: IpcMainInvokeEvent,
      request: { index?: unknown } = {},
    ): Promise<IpcResult<{ updated: boolean }>> => {
      const { index } = request;

      if (typeof index !== "number" || !Number.isInteger(index) || index < 0) {
        return failure(
          "VALIDATION_ERROR",
          "indexは0以上の整数である必要があります",
        );
      }

      try {
        const updated = configStore.setDefault(index);
        return success({ updated });
      } catch (err) {
        return failure(
          "UNKNOWN_ERROR",
          sanitizeErrorMessage(err, "デフォルト設定の変更に失敗しました"),
        );
      }
    },
  );

  /**
   * 全Slack設定をクリアする
   */
  ipcMain.handle(
    IPC_CHANNELS.SLACK_CONFIG_CLEAR,
    async (
      _event: IpcMainInvokeEvent,
    ): Promise<IpcResult<{ cleared: boolean }>> => {
      try {
        configStore.clear();
        return success({ cleared: true });
      } catch (err) {
        return failure(
          "UNKNOWN_ERROR",
          sanitizeErrorMessage(err, "設定のクリアに失敗しました"),
        );
      }
    },
  );
}

/**
 * Webhook URLの末尾をマスクする（セキュリティ対策）
 * 例: https://hooks.slack.com/services/T.../B.../xxxxxxxxxxx
 *  -> https://hooks.slack.com/services/T.../B.../****
 */
function maskWebhookUrl(url: string): string {
  const lastSlash = url.lastIndexOf("/");
  if (lastSlash === -1 || lastSlash === url.length - 1) return url;
  return url.slice(0, lastSlash + 1) + "****";
}
