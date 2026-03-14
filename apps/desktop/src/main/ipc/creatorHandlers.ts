/**
 * Creator IPC ハンドラ
 *
 * TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001
 *
 * SkillCreatorService の Planner / Executor / Improver role を IPC チャンネルとして公開する。
 * 重要: internal role 名は IPC レスポンスに含めない（P44 準拠）。
 */

import { ipcMain } from "electron";
import type { RuntimeSkillCreatorFacade as SkillCreatorService } from "../services/runtime/RuntimeSkillCreatorFacade";
import type { AuthMode } from "@repo/shared/types/auth-mode";

// IPC チャンネル定数（既存の channels.ts に追加することも可能だが、新規ファイルで管理）
export const CREATOR_CHANNELS = {
  CREATOR_PLAN: "creator:plan",
  CREATOR_EXECUTE: "creator:execute",
  CREATOR_IMPROVE: "creator:improve",
} as const;

/**
 * Creator IPC ハンドラを登録する
 */
export function registerCreatorHandlers(
  creatorService: SkillCreatorService,
): void {
  // creator:plan - Planner role（外部名: plan_result）
  ipcMain.handle(
    CREATOR_CHANNELS.CREATOR_PLAN,
    async (
      _event,
      args: { prompt: string; authMode?: AuthMode; apiKey?: string | null },
    ) => {
      // P42 3段バリデーション
      if (
        typeof args?.prompt !== "string" ||
        args.prompt === "" ||
        args.prompt.trim() === ""
      ) {
        return {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "prompt は必須です" },
        };
      }

      const authMode: AuthMode = args.authMode ?? "api-key";
      const apiKey = args.apiKey ?? null;

      try {
        const result = await creatorService.plan(
          args.prompt.trim(),
          authMode,
          apiKey,
        );
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "EXECUTION_FAILED",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        };
      }
    },
  );

  // creator:execute - Executor role（外部名: execute_result）
  ipcMain.handle(
    CREATOR_CHANNELS.CREATOR_EXECUTE,
    async (
      _event,
      args: {
        planId: string;
        skillSpec: string;
        authMode?: AuthMode;
        apiKey?: string | null;
      },
    ) => {
      // P42 3段バリデーション
      if (
        typeof args?.planId !== "string" ||
        args.planId === "" ||
        args.planId.trim() === ""
      ) {
        return {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "planId は必須です" },
        };
      }

      const authMode: AuthMode = args.authMode ?? "api-key";
      const apiKey = args.apiKey ?? null;

      try {
        const planResult = {
          planId: args.planId.trim(),
          skillSpec: args.skillSpec ?? "",
          estimatedSteps: 3,
        };
        const result = await creatorService.execute(
          planResult,
          authMode,
          apiKey,
        );
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "EXECUTION_FAILED",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        };
      }
    },
  );

  // creator:improve - Improver role（外部名: improve_result）
  ipcMain.handle(
    CREATOR_CHANNELS.CREATOR_IMPROVE,
    async (
      _event,
      args: {
        skillName: string;
        feedback: string;
        authMode?: AuthMode;
        apiKey?: string | null;
      },
    ) => {
      // P42 3段バリデーション
      if (
        typeof args?.skillName !== "string" ||
        args.skillName === "" ||
        args.skillName.trim() === ""
      ) {
        return {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "skillName は必須です" },
        };
      }
      if (
        typeof args?.feedback !== "string" ||
        args.feedback === "" ||
        args.feedback.trim() === ""
      ) {
        return {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "feedback は必須です" },
        };
      }

      const authMode: AuthMode = args.authMode ?? "api-key";
      const apiKey = args.apiKey ?? null;

      try {
        const result = await creatorService.improve(
          args.skillName.trim(),
          args.feedback.trim(),
          authMode,
          apiKey,
        );
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: {
            code: "EXECUTION_FAILED",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        };
      }
    },
  );
}

/**
 * Creator IPC ハンドラを解除する
 */
export function unregisterCreatorHandlers(): void {
  ipcMain.removeHandler(CREATOR_CHANNELS.CREATOR_PLAN);
  ipcMain.removeHandler(CREATOR_CHANNELS.CREATOR_EXECUTE);
  ipcMain.removeHandler(CREATOR_CHANNELS.CREATOR_IMPROVE);
}
