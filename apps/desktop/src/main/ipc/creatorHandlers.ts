/**
 * Runtime Skill Creator IPC handlers
 *
 * RuntimeSkillCreatorFacade を public `skill-creator:*` surface に接続する。
 */

import { ipcMain, type BrowserWindow, type IpcMainInvokeEvent } from "electron";
import type {
  RuntimeSkillCreatorExecuteResponse,
  RuntimeSkillCreatorImproveResponse,
  RuntimeSkillCreatorImproveSuggestion,
  RuntimeSkillCreatorPlanResponse,
  SkillCreatorUserInputSubmission,
  SkillCreatorWorkflowUiSnapshot,
  ApplyImprovementResult,
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

function isSuggestion(
  value: unknown,
): value is RuntimeSkillCreatorImproveSuggestion {
  return (
    value != null &&
    typeof value === "object" &&
    "section" in value &&
    typeof value.section === "string" &&
    "before" in value &&
    typeof value.before === "string" &&
    "after" in value &&
    typeof value.after === "string" &&
    "reason" in value &&
    typeof value.reason === "string"
  );
}

function validateSuggestions(suggestions: unknown): IpcResult<never> | null {
  if (!Array.isArray(suggestions)) {
    return validationError("suggestions が配列ではありません");
  }
  if (suggestions.length === 0) {
    return validationError("suggestions が空です");
  }
  if (suggestions.length > 100) {
    return validationError("suggestions が上限（100件）を超えています");
  }
  for (let i = 0; i < suggestions.length; i++) {
    if (!isSuggestion(suggestions[i])) {
      return validationError(
        `suggestions[${i}] の構造が不正です（section/before/after/reason は全て string 必須）`,
      );
    }
  }
  return null;
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

function emitWorkflowStateChanged(
  mainWindow: BrowserWindow,
  snapshot: SkillCreatorWorkflowUiSnapshot,
): void {
  if (mainWindow.isDestroyed()) {
    return;
  }
  mainWindow.webContents.send(
    IPC_CHANNELS.SKILL_CREATOR_WORKFLOW_STATE_CHANGED,
    snapshot,
  );
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
        if ("planId" in result) {
          const snapshot = runtimeSkillCreatorService.getWorkflowStateSnapshot(
            result.planId,
          );
          if (snapshot) {
            emitWorkflowStateChanged(mainWindow, snapshot);
          }
        }
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
            skillName: "",
            description: "",
            agents: [],
            scripts: [],
            triggers: [],
            anchors: [],
          },
          args.authMode ?? "api-key",
          args.apiKey ?? null,
        );
        const snapshot = runtimeSkillCreatorService.getWorkflowStateSnapshot(
          args.planId.trim(),
        );
        if (snapshot) {
          emitWorkflowStateChanged(mainWindow, snapshot);
        }
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
    IPC_CHANNELS.SKILL_CREATOR_GET_WORKFLOW_STATE,
    async (
      event: IpcMainInvokeEvent,
      args: { planId: string },
    ): Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>> => {
      validateSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_GET_WORKFLOW_STATE,
        mainWindow,
      );

      if (isBlank(args?.planId)) {
        return validationError("planId が指定されていません");
      }
      if (!runtimeSkillCreatorService) {
        return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
      }

      const snapshot = runtimeSkillCreatorService.getWorkflowStateSnapshot(
        args.planId.trim(),
      );
      if (!snapshot) {
        return validationError("workflow state が見つかりません");
      }

      return { success: true, data: snapshot };
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_SUBMIT_USER_INPUT,
    async (
      event: IpcMainInvokeEvent,
      args: SkillCreatorUserInputSubmission,
    ): Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>> => {
      validateSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_SUBMIT_USER_INPUT,
        mainWindow,
      );

      if (isBlank(args?.planId)) {
        return validationError("planId が指定されていません");
      }
      if (isBlank(args?.requestId)) {
        return validationError("requestId が指定されていません");
      }
      if (!runtimeSkillCreatorService) {
        return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
      }

      try {
        const snapshot = runtimeSkillCreatorService.submitUserInput(
          args.planId.trim(),
          args,
        );
        emitWorkflowStateChanged(mainWindow, snapshot);
        return { success: true, data: snapshot };
      } catch (error) {
        return {
          success: false,
          error: sanitizeErrorMessage(
            error,
            "workflow user input の送信に失敗しました",
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

  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT,
    async (
      event: IpcMainInvokeEvent,
      args: {
        skillName: string;
        suggestions: RuntimeSkillCreatorImproveSuggestion[];
      },
    ): Promise<IpcResult<ApplyImprovementResult>> => {
      validateSender(
        event,
        IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT,
        mainWindow,
      );

      if (isBlank(args?.skillName)) {
        return validationError("skillName が指定されていません");
      }

      const suggestionsError = validateSuggestions(args?.suggestions);
      if (suggestionsError) {
        return suggestionsError;
      }

      if (!runtimeSkillCreatorService) {
        return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
      }

      try {
        const result = await runtimeSkillCreatorService.applyImprovement(
          args.skillName.trim(),
          args.suggestions,
        );
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: sanitizeErrorMessage(error, "改善提案の適用に失敗しました"),
        };
      }
    },
  );
}

export function unregisterRuntimeSkillCreatorHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_PLAN);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_GET_WORKFLOW_STATE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_SUBMIT_USER_INPUT);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_IMPROVE_SKILL);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT);
}
