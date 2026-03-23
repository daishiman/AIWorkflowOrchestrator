/**
 * Runtime Skill Creator IPC handlers
 *
 * RuntimeSkillCreatorFacade を public `skill-creator:*` surface に接続する。
 */

import { ipcMain, type BrowserWindow, type IpcMainInvokeEvent } from "electron";
import type {
  RuntimeSkillCreatorExecuteResponse,
  RuntimeSkillCreatorImproveResponse,
  RuntimeSkillCreatorPlanResponse,
} from "@repo/shared/types";
import type { AuthMode } from "@repo/shared/types/auth-mode";
import { IPC_CHANNELS } from "../../preload/channels";
import type { RuntimeSkillCreatorFacade } from "../services/runtime/RuntimeSkillCreatorFacade";
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator";
import { sanitizeErrorMessage } from "./sanitizeErrorMessage";

interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const RUNTIME_SKILL_CREATOR_UNAVAILABLE =
  "Runtime Skill Creator は現在利用できません";

function validationError(message: string): IpcResult<never> {
  return { success: false, error: message };
}

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value === "" || value.trim() === "";
}

function validateSender(
  event: IpcMainInvokeEvent,
  channel: string,
  mainWindow: BrowserWindow,
): void {
  const validation = validateIpcSender(event, channel, {
    getAllowedWindows: () => [mainWindow],
  });
  if (!validation.valid) {
    throw toIPCValidationError(validation);
  }
}

export function registerRuntimeSkillCreatorHandlers(
  mainWindow: BrowserWindow,
  runtimeSkillCreatorService?: RuntimeSkillCreatorFacade,
): void {
  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_PLAN,
    async (
      event: IpcMainInvokeEvent,
      args: { prompt: string; authMode?: AuthMode; apiKey?: string | null },
    ): Promise<IpcResult<RuntimeSkillCreatorPlanResponse>> => {
      validateSender(event, IPC_CHANNELS.SKILL_CREATOR_PLAN, mainWindow);

      if (isBlank(args?.prompt)) {
        return validationError("プロンプトが指定されていません");
      }
      if (!runtimeSkillCreatorService) {
        return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
      }

      try {
        const result = await runtimeSkillCreatorService.plan(
          args.prompt.trim(),
          args.authMode ?? "api-key",
          args.apiKey ?? null,
        );
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: sanitizeErrorMessage(
            error,
            "Runtime plan の実行に失敗しました",
          ),
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN,
    async (
      event: IpcMainInvokeEvent,
      args: {
        planId: string;
        skillSpec: string;
        authMode?: AuthMode;
        apiKey?: string | null;
      },
    ): Promise<IpcResult<RuntimeSkillCreatorExecuteResponse>> => {
      validateSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN,
        mainWindow,
      );

      if (isBlank(args?.planId)) {
        return validationError("planId が指定されていません");
      }
      if (isBlank(args?.skillSpec)) {
        return validationError("skillSpec が指定されていません");
      }
      if (!runtimeSkillCreatorService) {
        return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
      }

      try {
        const result = await runtimeSkillCreatorService.execute(
          {
            planId: args.planId.trim(),
            skillSpec: args.skillSpec.trim(),
            estimatedSteps: 3,
          },
          args.authMode ?? "api-key",
          args.apiKey ?? null,
        );
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: sanitizeErrorMessage(
            error,
            "Runtime execute の実行に失敗しました",
          ),
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL,
    async (
      event: IpcMainInvokeEvent,
      args: {
        skillName: string;
        feedback: string;
        authMode?: AuthMode;
        apiKey?: string | null;
      },
    ): Promise<IpcResult<RuntimeSkillCreatorImproveResponse>> => {
      validateSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL,
        mainWindow,
      );

      if (isBlank(args?.skillName)) {
        return validationError("skillName が指定されていません");
      }
      if (isBlank(args?.feedback)) {
        return validationError("feedback が指定されていません");
      }
      if (!runtimeSkillCreatorService) {
        return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
      }

      try {
        const result = await runtimeSkillCreatorService.improve(
          args.skillName.trim(),
          args.feedback.trim(),
          args.authMode ?? "api-key",
          args.apiKey ?? null,
        );
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: sanitizeErrorMessage(
            error,
            "Runtime improve の実行に失敗しました",
          ),
        };
      }
    },
  );
}

export function unregisterRuntimeSkillCreatorHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_PLAN);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL);
}
