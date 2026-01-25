/**
 * Chat Edit IPC Handlers
 *
 * ワークスペースファイル編集機能のIPCハンドラ
 */
import { ipcMain, IpcMainInvokeEvent, BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { ChatEditService } from "../services/chat-edit/ChatEditService";
import { FileService } from "../services/chat-edit/FileService";
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator";
import {
  SendWithContextRequest,
  FileWriteOptions,
} from "../services/chat-edit/types";

/**
 * Chat Edit IPCハンドラを登録する
 */
export function registerChatEditHandlers(
  mainWindow: BrowserWindow,
  chatEditService: ChatEditService,
  fileService: FileService,
): void {
  // chat-edit:read-file
  ipcMain.handle(
    IPC_CHANNELS.CHAT_EDIT_READ_FILE,
    async (event: IpcMainInvokeEvent, args: { filePath: string }) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.CHAT_EDIT_READ_FILE,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      if (typeof args?.filePath !== "string") {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "filePath must be a string",
          },
        };
      }

      return fileService.readFile(args.filePath);
    },
  );

  // chat-edit:write-file
  ipcMain.handle(
    IPC_CHANNELS.CHAT_EDIT_WRITE_FILE,
    async (
      event: IpcMainInvokeEvent,
      args: { filePath: string; content: string; options?: FileWriteOptions },
    ) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.CHAT_EDIT_WRITE_FILE,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      if (typeof args?.filePath !== "string") {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "filePath must be a string",
          },
        };
      }
      if (typeof args?.content !== "string") {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "content must be a string",
          },
        };
      }

      return fileService.writeFile(args.filePath, args.content, args.options);
    },
  );

  // chat-edit:get-selection
  ipcMain.handle(
    IPC_CHANNELS.CHAT_EDIT_GET_SELECTION,
    async (event: IpcMainInvokeEvent) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.CHAT_EDIT_GET_SELECTION,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      // 現時点ではエディタ選択範囲取得は未実装
      // 将来的にエディタ統合時に実装
      return { success: true, data: null };
    },
  );

  // chat-edit:send-with-context
  ipcMain.handle(
    IPC_CHANNELS.CHAT_EDIT_SEND_WITH_CONTEXT,
    async (event: IpcMainInvokeEvent, args: SendWithContextRequest) => {
      const validation = validateIpcSender(
        event,
        IPC_CHANNELS.CHAT_EDIT_SEND_WITH_CONTEXT,
        { getAllowedWindows: () => [mainWindow] },
      );
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      if (!args?.contexts || !Array.isArray(args.contexts)) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "contexts must be an array",
          },
        };
      }
      if (!args?.command) {
        return {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "command is required" },
        };
      }

      return chatEditService.sendWithContext(args);
    },
  );
}

/**
 * Chat Edit IPCハンドラを解除する
 */
export function unregisterChatEditHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.CHAT_EDIT_READ_FILE);
  ipcMain.removeHandler(IPC_CHANNELS.CHAT_EDIT_WRITE_FILE);
  ipcMain.removeHandler(IPC_CHANNELS.CHAT_EDIT_GET_SELECTION);
  ipcMain.removeHandler(IPC_CHANNELS.CHAT_EDIT_SEND_WITH_CONTEXT);
}
