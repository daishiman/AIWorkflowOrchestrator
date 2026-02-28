/**
 * Skill Debug IPC Handlers (TASK-9H)
 *
 * デバッグセッション管理のIPCハンドラー。
 * P42準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）を適用。
 */
import { ipcMain, type IpcMainInvokeEvent, type BrowserWindow } from "electron";
import log from "electron-log";
import { IPC_CHANNELS } from "../../preload/channels";
import { SkillDebugger } from "../services/skill/SkillDebugger";
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator";
import type {
  DebugStartRequest,
  DebugCommandRequest,
  DebugCommand,
  DebugBreakpointAddRequest,
  DebugBreakpointRemoveRequest,
  DebugInspectRequest,
  DebugEvaluateRequest,
} from "@repo/shared";

/** Valid debug commands for validation */
const VALID_DEBUG_COMMANDS: readonly string[] = [
  "continue",
  "stepOver",
  "stepInto",
  "stepOut",
  "pause",
  "stop",
];

/**
 * Register skill debug IPC handlers
 */
export function registerSkillDebugHandlers(
  mainWindow: BrowserWindow,
): SkillDebugger {
  const debugger_ = new SkillDebugger(mainWindow);

  // skill:debug:start
  ipcMain.handle(
    IPC_CHANNELS.SKILL_DEBUG_START,
    async (event: IpcMainInvokeEvent, request: DebugStartRequest) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_DEBUG_START,
        {
          getAllowedWindows: () => [mainWindow],
        },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      // P42: 3-step validation
      if (
        typeof request?.skillName !== "string" ||
        request.skillName.trim() === ""
      ) {
        return {
          success: false,
          error: "skillName must be a non-empty string",
        };
      }
      if (typeof request?.prompt !== "string" || request.prompt.trim() === "") {
        return { success: false, error: "prompt must be a non-empty string" };
      }
      if (!Array.isArray(request?.breakpoints)) {
        return { success: false, error: "breakpoints must be an array" };
      }

      try {
        const session = debugger_.startSession(
          request.skillName.trim(),
          request.prompt.trim(),
          request.breakpoints,
        );
        return { success: true, data: session };
      } catch (error) {
        log.error("[SkillDebugHandler] startSession error:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to start debug session",
        };
      }
    },
  );

  // skill:debug:command
  ipcMain.handle(
    IPC_CHANNELS.SKILL_DEBUG_COMMAND,
    async (event: IpcMainInvokeEvent, request: DebugCommandRequest) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_DEBUG_COMMAND,
        {
          getAllowedWindows: () => [mainWindow],
        },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      if (
        typeof request?.sessionId !== "string" ||
        request.sessionId.trim() === ""
      ) {
        return {
          success: false,
          error: "sessionId must be a non-empty string",
        };
      }
      if (
        typeof request?.command !== "string" ||
        !VALID_DEBUG_COMMANDS.includes(request.command)
      ) {
        return {
          success: false,
          error: `command must be one of: ${VALID_DEBUG_COMMANDS.join(", ")}`,
        };
      }

      try {
        debugger_.executeCommand(
          request.sessionId.trim(),
          request.command as DebugCommand,
        );
        return { success: true };
      } catch (error) {
        log.error("[SkillDebugHandler] executeCommand error:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to execute command",
        };
      }
    },
  );

  // skill:debug:breakpoint:add
  ipcMain.handle(
    IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_ADD,
    async (event: IpcMainInvokeEvent, request: DebugBreakpointAddRequest) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_ADD,
        {
          getAllowedWindows: () => [mainWindow],
        },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      if (
        typeof request?.sessionId !== "string" ||
        request.sessionId.trim() === ""
      ) {
        return {
          success: false,
          error: "sessionId must be a non-empty string",
        };
      }
      if (!request?.breakpoint || typeof request.breakpoint !== "object") {
        return { success: false, error: "breakpoint must be an object" };
      }

      try {
        const bp = debugger_.addBreakpoint(
          request.sessionId.trim(),
          request.breakpoint,
        );
        return { success: true, data: bp };
      } catch (error) {
        log.error("[SkillDebugHandler] addBreakpoint error:", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to add breakpoint",
        };
      }
    },
  );

  // skill:debug:breakpoint:remove
  ipcMain.handle(
    IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_REMOVE,
    async (
      event: IpcMainInvokeEvent,
      request: DebugBreakpointRemoveRequest,
    ) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_REMOVE,
        {
          getAllowedWindows: () => [mainWindow],
        },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      if (
        typeof request?.sessionId !== "string" ||
        request.sessionId.trim() === ""
      ) {
        return {
          success: false,
          error: "sessionId must be a non-empty string",
        };
      }
      if (
        typeof request?.breakpointId !== "string" ||
        request.breakpointId.trim() === ""
      ) {
        return {
          success: false,
          error: "breakpointId must be a non-empty string",
        };
      }

      try {
        debugger_.removeBreakpoint(
          request.sessionId.trim(),
          request.breakpointId.trim(),
        );
        return { success: true };
      } catch (error) {
        log.error("[SkillDebugHandler] removeBreakpoint error:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to remove breakpoint",
        };
      }
    },
  );

  // skill:debug:inspect
  ipcMain.handle(
    IPC_CHANNELS.SKILL_DEBUG_INSPECT,
    async (event: IpcMainInvokeEvent, request: DebugInspectRequest) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_DEBUG_INSPECT,
        {
          getAllowedWindows: () => [mainWindow],
        },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      if (
        typeof request?.sessionId !== "string" ||
        request.sessionId.trim() === ""
      ) {
        return {
          success: false,
          error: "sessionId must be a non-empty string",
        };
      }
      if (typeof request?.path !== "string" || request.path.trim() === "") {
        return { success: false, error: "path must be a non-empty string" };
      }

      try {
        const value = debugger_.inspectVariable(
          request.sessionId.trim(),
          request.path.trim(),
        );
        return { success: true, data: value };
      } catch (error) {
        log.error("[SkillDebugHandler] inspectVariable error:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to inspect variable",
        };
      }
    },
  );

  // skill:debug:evaluate
  ipcMain.handle(
    IPC_CHANNELS.SKILL_DEBUG_EVALUATE,
    async (event: IpcMainInvokeEvent, request: DebugEvaluateRequest) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.SKILL_DEBUG_EVALUATE,
        {
          getAllowedWindows: () => [mainWindow],
        },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      if (
        typeof request?.sessionId !== "string" ||
        request.sessionId.trim() === ""
      ) {
        return {
          success: false,
          error: "sessionId must be a non-empty string",
        };
      }
      if (
        typeof request?.expression !== "string" ||
        request.expression.trim() === ""
      ) {
        return {
          success: false,
          error: "expression must be a non-empty string",
        };
      }

      try {
        const result = debugger_.evaluateExpression(
          request.sessionId.trim(),
          request.expression.trim(),
        );
        return { success: true, data: result };
      } catch (error) {
        log.error("[SkillDebugHandler] evaluateExpression error:", error);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to evaluate expression",
        };
      }
    },
  );

  return debugger_;
}

/**
 * Unregister all skill debug IPC handlers
 */
export function unregisterSkillDebugHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DEBUG_START);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DEBUG_COMMAND);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_ADD);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DEBUG_BREAKPOINT_REMOVE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DEBUG_INSPECT);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DEBUG_EVALUATE);
}
