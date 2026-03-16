import { ipcMain, BrowserWindow, IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import type { SafetyGatePort } from "@repo/shared";

export function registerSafetyGateHandlers(
  mainWindow: BrowserWindow,
  safetyGate: SafetyGatePort,
): void {
  ipcMain.handle(
    IPC_CHANNELS.SKILL_EVALUATE_SAFETY,
    async (event: IpcMainInvokeEvent, skillName: unknown) => {
      // Step 1: 送信元検証
      if (event.sender !== mainWindow.webContents) {
        console.warn(
          "[SafetyGate] IPC request from unknown sender, ignoring...",
        );
        return {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Unknown sender" },
        };
      }

      // Step 2: P42 準拠 3段バリデーション
      if (
        typeof skillName !== "string" ||
        skillName === "" ||
        skillName.trim() === ""
      ) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "skillName must be a non-empty string",
          },
        };
      }

      // Step 3: SafetyGate 実行
      try {
        const result = await safetyGate.evaluate(skillName);
        return { success: true, data: result };
      } catch (error: unknown) {
        const hasCode =
          error != null &&
          typeof error === "object" &&
          "code" in error &&
          typeof error.code === "string";
        const hasMessage =
          hasCode && "message" in error && typeof error.message === "string";
        return {
          success: false,
          error: {
            code: hasCode ? error.code : "INTERNAL_ERROR",
            message: hasMessage ? error.message : "Safety evaluation failed",
          },
        };
      }
    },
  );
}
