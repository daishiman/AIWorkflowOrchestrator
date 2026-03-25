/**
 * disclosureHandlers - Disclosure IPC handler
 *
 * TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001
 *
 * execution:get-disclosure-info の受信と AI 利用情報の返却を行う。
 * API key / token は Renderer に送信しない（DENY-5 準拠）。
 */

import { ipcMain, BrowserWindow, type IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";

export interface DisclosureInfo {
  aiServiceName: string;
  modelName: string;
  externalDestinations: string[];
}

export interface DisclosureHandlerDependencies {
  mainWindow: BrowserWindow;
  getDisclosureInfo: () => Promise<DisclosureInfo>;
}

export function registerDisclosureHandlers(
  deps: DisclosureHandlerDependencies,
): void {
  const { mainWindow, getDisclosureInfo } = deps;

  ipcMain.handle(
    IPC_CHANNELS.EXECUTION_GET_DISCLOSURE_INFO,
    async (event: IpcMainInvokeEvent) => {
      // 送信元検証
      if (event.sender !== mainWindow.webContents) {
        return {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Unknown sender" },
        };
      }

      try {
        const info = await getDisclosureInfo();
        // DENY-5: API key / token を含めない。provider名、model名、送信先種別のみ返す
        return {
          success: true,
          data: {
            aiServiceName: info.aiServiceName,
            modelName: info.modelName,
            externalDestinations: info.externalDestinations,
          },
        };
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get disclosure info";
        return {
          success: false,
          error: { code: "DISCLOSURE_ERROR", message },
        };
      }
    },
  );
}
