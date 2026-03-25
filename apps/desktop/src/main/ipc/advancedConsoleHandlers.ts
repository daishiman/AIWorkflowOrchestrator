/**
 * advancedConsoleHandlers - Advanced Console IPC handler
 *
 * TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001
 *
 * execution:get-terminal-log と execution:get-copy-command の handler。
 * API key 非含有を保証する（DENY-6 準拠）。
 */

import { ipcMain, BrowserWindow, type IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";

export interface AdvancedConsoleHandlerDependencies {
  mainWindow: BrowserWindow;
  getTerminalLog: (sessionId: string) => Promise<string[]>;
  getCopyCommand: (sessionId: string) => Promise<string | null>;
}

/** API key パターンを sanitize する */
function sanitizeForApiKeys(text: string): string {
  // sk-ant-xxx / sk-xxx パターンを除去
  return text
    .replace(/sk-ant-[a-zA-Z0-9_-]+/g, "[REDACTED]")
    .replace(/sk-[a-zA-Z0-9_-]{20,}/g, "[REDACTED]");
}

export function registerAdvancedConsoleHandlers(
  deps: AdvancedConsoleHandlerDependencies,
): void {
  const { mainWindow, getTerminalLog, getCopyCommand } = deps;

  ipcMain.handle(
    IPC_CHANNELS.EXECUTION_GET_TERMINAL_LOG,
    async (event: IpcMainInvokeEvent, sessionId: unknown) => {
      if (event.sender !== mainWindow.webContents) {
        return {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Unknown sender" },
        };
      }

      // P42 準拠 3段バリデーション
      if (
        typeof sessionId !== "string" ||
        sessionId === "" ||
        sessionId.trim() === ""
      ) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "sessionId must be a non-empty string",
          },
        };
      }

      try {
        const logs = await getTerminalLog(sessionId);
        // DENY-6: API key を sanitize
        const sanitized = logs.map(sanitizeForApiKeys);
        return { success: true, data: sanitized };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to get terminal log";
        return {
          success: false,
          error: { code: "TERMINAL_LOG_ERROR", message },
        };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.EXECUTION_GET_COPY_COMMAND,
    async (event: IpcMainInvokeEvent, sessionId: unknown) => {
      if (event.sender !== mainWindow.webContents) {
        return {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Unknown sender" },
        };
      }

      // P42 準拠 3段バリデーション
      if (
        typeof sessionId !== "string" ||
        sessionId === "" ||
        sessionId.trim() === ""
      ) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "sessionId must be a non-empty string",
          },
        };
      }

      try {
        const command = await getCopyCommand(sessionId);
        // DENY-6: API key を sanitize
        const sanitized = command ? sanitizeForApiKeys(command) : null;
        return { success: true, data: sanitized };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to get copy command";
        return {
          success: false,
          error: { code: "COPY_COMMAND_ERROR", message },
        };
      }
    },
  );
}
