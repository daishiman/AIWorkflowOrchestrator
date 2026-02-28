/**
 * Skill Analytics IPC Handlers
 *
 * スキル利用分析（記録・統計取得・サマリー・トレンド・エクスポート）の IPC ハンドラ。
 * チャネル名: skill:analytics:record, skill:analytics:statistics,
 *            skill:analytics:summary, skill:analytics:trend, skill:analytics:export
 *
 * TASK-9J: スキル利用分析・統計機能
 */
import { ipcMain } from "electron";
import type { BrowserWindow } from "electron";
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator";
import { IPC_CHANNELS } from "../../preload/channels";
import type { SkillAnalytics } from "../services/skill/SkillAnalytics";

/** 許可された eventType 値 */
const ALLOWED_EVENT_TYPES = ["execution", "error", "cancellation"] as const;

/** 許可された granularity 値 */
const ALLOWED_GRANULARITIES = ["hour", "day", "week", "month"] as const;

/** 許可された export format 値 */
const ALLOWED_FORMATS = ["json", "csv"] as const;

/**
 * P42準拠 3段バリデーション: 文字列引数を検証する
 *
 * @param value - 検証対象の値
 * @param argName - 引数名（エラーメッセージ用）
 * @returns 検証成功時は null、失敗時はエラーレスポンスオブジェクト
 */
function validateStringArg(
  value: unknown,
  argName: string,
): { success: false; error: string } | null {
  if (typeof value !== "string" || value.trim() === "") {
    return {
      success: false,
      error: `${argName} must be a non-empty string`,
    };
  }
  return null;
}

/**
 * 値がオブジェクト（非 null、非配列）かどうかを判定する
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * IPC エラーレスポンスを構築する
 */
function toIpcErrorResponse(_error: unknown): {
  success: false;
  error: string;
} {
  return {
    success: false,
    error: "Internal error",
  };
}

/**
 * スキル分析IPCハンドラーを登録する
 *
 * @param mainWindow メインウィンドウ
 * @param skillAnalytics スキル分析サービス
 */
export function registerSkillAnalyticsHandlers(
  mainWindow: BrowserWindow,
  skillAnalytics: SkillAnalytics,
): void {
  // skill:analytics:record - イベントを記録する
  ipcMain.handle(
    IPC_CHANNELS.SKILL_ANALYTICS_RECORD,
    async (event, args: unknown) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_ANALYTICS_RECORD,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      // args がオブジェクトであることを検証
      if (!isPlainObject(args)) {
        return {
          success: false,
          error: "args must be a non-null object",
        };
      }

      // skillName の P42準拠 3段バリデーション
      const skillNameError = validateStringArg(args.skillName, "skillName");
      if (skillNameError) return skillNameError;

      // eventType のバリデーション
      const eventTypeError = validateStringArg(args.eventType, "eventType");
      if (eventTypeError) return eventTypeError;

      const eventType = (args.eventType as string).trim();
      if (
        !ALLOWED_EVENT_TYPES.includes(
          eventType as (typeof ALLOWED_EVENT_TYPES)[number],
        )
      ) {
        return {
          success: false,
          error: `eventType must be one of: ${ALLOWED_EVENT_TYPES.join(", ")}`,
        };
      }

      try {
        const recorded = skillAnalytics.recordEvent({
          skillName: (args.skillName as string).trim(),
          eventType: eventType as "execution" | "error" | "cancellation",
          success: Boolean(args.success),
          toolsUsed: Array.isArray(args.toolsUsed) ? args.toolsUsed : [],
          duration:
            typeof args.duration === "number" ? args.duration : undefined,
          errorMessage:
            typeof args.errorMessage === "string"
              ? args.errorMessage
              : undefined,
          tokenCount:
            typeof args.tokenCount === "number" ? args.tokenCount : undefined,
          timestamp:
            typeof args.timestamp === "string" ? args.timestamp : undefined,
        });
        return { success: true, data: recorded };
      } catch (error) {
        return toIpcErrorResponse(error);
      }
    },
  );

  // skill:analytics:statistics - スキル統計を取得する
  ipcMain.handle(
    IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS,
    async (event, args: unknown) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      if (!isPlainObject(args)) {
        return {
          success: false,
          error: "args must be a non-null object",
        };
      }

      // skillName の P42準拠 3段バリデーション
      const skillNameError = validateStringArg(args.skillName, "skillName");
      if (skillNameError) return skillNameError;

      try {
        const period =
          isPlainObject(args.period) &&
          typeof args.period.start === "string" &&
          typeof args.period.end === "string"
            ? { start: args.period.start, end: args.period.end }
            : undefined;

        const statistics = skillAnalytics.getStatistics(
          (args.skillName as string).trim(),
          period,
        );
        return { success: true, data: statistics };
      } catch (error) {
        return toIpcErrorResponse(error);
      }
    },
  );

  // skill:analytics:summary - 全体サマリーを取得する
  ipcMain.handle(
    IPC_CHANNELS.SKILL_ANALYTICS_SUMMARY,
    async (event, _args?: unknown) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_ANALYTICS_SUMMARY,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      try {
        const summary = skillAnalytics.getSummary();
        return { success: true, data: summary };
      } catch (error) {
        return toIpcErrorResponse(error);
      }
    },
  );

  // skill:analytics:trend - 利用トレンドを取得する
  ipcMain.handle(
    IPC_CHANNELS.SKILL_ANALYTICS_TREND,
    async (event, args: unknown) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_ANALYTICS_TREND,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      if (!isPlainObject(args)) {
        return {
          success: false,
          error: "args must be a non-null object",
        };
      }

      // period のバリデーション
      if (!isPlainObject(args.period)) {
        return {
          success: false,
          error: "period must be a non-null object",
        };
      }

      const startError = validateStringArg(args.period.start, "period.start");
      if (startError) return startError;

      const endError = validateStringArg(args.period.end, "period.end");
      if (endError) return endError;

      // granularity のバリデーション
      const granularityError = validateStringArg(
        args.period.granularity,
        "period.granularity",
      );
      if (granularityError) return granularityError;

      const granularity = (args.period.granularity as string).trim();
      if (
        !ALLOWED_GRANULARITIES.includes(
          granularity as (typeof ALLOWED_GRANULARITIES)[number],
        )
      ) {
        return {
          success: false,
          error: `period.granularity must be one of: ${ALLOWED_GRANULARITIES.join(", ")}`,
        };
      }

      try {
        const period = {
          start: (args.period.start as string).trim(),
          end: (args.period.end as string).trim(),
          granularity: granularity as "hour" | "day" | "week" | "month",
        };

        const skillName =
          typeof args.skillName === "string" && args.skillName.trim() !== ""
            ? args.skillName.trim()
            : undefined;

        const trend = skillAnalytics.getUsageTrend(period, skillName);
        return { success: true, data: trend };
      } catch (error) {
        return toIpcErrorResponse(error);
      }
    },
  );

  // skill:analytics:export - データをエクスポートする
  ipcMain.handle(
    IPC_CHANNELS.SKILL_ANALYTICS_EXPORT,
    async (event, args: unknown) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_ANALYTICS_EXPORT,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      if (!isPlainObject(args)) {
        return {
          success: false,
          error: "args must be a non-null object",
        };
      }

      // format のバリデーション
      const formatError = validateStringArg(args.format, "format");
      if (formatError) return formatError;

      const format = (args.format as string).trim();
      if (
        !ALLOWED_FORMATS.includes(format as (typeof ALLOWED_FORMATS)[number])
      ) {
        return {
          success: false,
          error: `format must be one of: ${ALLOWED_FORMATS.join(", ")}`,
        };
      }

      try {
        const period =
          isPlainObject(args.period) &&
          typeof args.period.start === "string" &&
          typeof args.period.end === "string"
            ? { start: args.period.start, end: args.period.end }
            : undefined;

        const data = skillAnalytics.exportData(
          format as "json" | "csv",
          period,
        );
        return { success: true, data };
      } catch (error) {
        return toIpcErrorResponse(error);
      }
    },
  );
}

/**
 * スキル分析IPCハンドラーを解除する
 */
export function unregisterSkillAnalyticsHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_ANALYTICS_RECORD);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_ANALYTICS_SUMMARY);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_ANALYTICS_TREND);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_ANALYTICS_EXPORT);
}
