/**
 * chatEditHandlers Security Tests
 *
 * Phase 6: セキュリティテスト
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ipcMain, IpcMainInvokeEvent } from "electron";

// vi.hoistedを使用してモック関数をホイスティング前に定義
const { mockValidateIpcSender, mockToIPCValidationError } = vi.hoisted(() => ({
  mockValidateIpcSender: vi.fn(),
  mockToIPCValidationError: vi.fn(),
}));

// Electronをモック
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  BrowserWindow: {
    getFocusedWindow: vi.fn(),
  },
}));

// IPC Validatorをモック
vi.mock("../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: mockValidateIpcSender,
  toIPCValidationError: mockToIPCValidationError,
}));

// 実際のハンドラをインポート
import {
  registerChatEditHandlers,
  unregisterChatEditHandlers,
} from "../chatEditHandlers";

// IPC handler type
type IpcHandler = (event: IpcMainInvokeEvent, ...args: any[]) => Promise<any>;

describe("chatEditHandlers - セキュリティテスト", () => {
  let mockMainWindow: any;
  let mockChatEditService: any;
  let mockFileService: any;
  let registeredHandlers: Map<string, IpcHandler>;

  beforeEach(() => {
    vi.clearAllMocks();
    registeredHandlers = new Map();

    // ipcMain.handleをモックしてハンドラを保存
    vi.mocked(ipcMain.handle).mockImplementation((channel, handler) => {
      registeredHandlers.set(channel, handler as IpcHandler);
      return undefined as any;
    });

    mockMainWindow = { id: 1, webContents: { id: 1 } };
    mockChatEditService = {
      sendWithContext: vi.fn().mockResolvedValue({
        success: true,
        result: {
          id: "result-1",
          generatedContent: "generated code",
        },
      }),
    };
    mockFileService = {
      readFile: vi.fn().mockResolvedValue({
        success: true,
        content: "file content",
        language: "typescript",
      }),
      writeFile: vi.fn().mockResolvedValue({
        success: true,
      }),
    };

    // デフォルトで検証を通す
    mockValidateIpcSender.mockReturnValue({ valid: true });
    mockToIPCValidationError.mockImplementation((v) => ({
      success: false,
      error: {
        code: v.errorCode || "IPC_UNAUTHORIZED",
        message: v.errorMessage || "Unauthorized",
      },
    }));
  });

  afterEach(() => {
    unregisterChatEditHandlers();
  });

  describe("sender検証", () => {
    it("無効なsenderからのread-fileリクエストでエラーを投げる", async () => {
      mockValidateIpcSender.mockReturnValue({
        valid: false,
        errorCode: "IPC_FORBIDDEN",
        errorMessage: "Invalid sender",
      });
      mockToIPCValidationError.mockReturnValue({
        success: false,
        error: { code: "IPC_FORBIDDEN", message: "Invalid sender" },
      });

      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:read-file");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      await expect(
        handler!(mockEvent, { filePath: "/path" }),
      ).rejects.toBeDefined();
    });

    it("無効なsenderからのwrite-fileリクエストでエラーを投げる", async () => {
      mockValidateIpcSender.mockReturnValue({
        valid: false,
        errorCode: "IPC_FORBIDDEN",
        errorMessage: "Invalid sender",
      });

      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:write-file");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      await expect(
        handler!(mockEvent, { filePath: "/path", content: "test" }),
      ).rejects.toBeDefined();
    });

    it("無効なsenderからのget-selectionリクエストでエラーを投げる", async () => {
      mockValidateIpcSender.mockReturnValue({
        valid: false,
        errorCode: "IPC_FORBIDDEN",
        errorMessage: "Invalid sender",
      });

      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:get-selection");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      await expect(handler!(mockEvent)).rejects.toBeDefined();
    });

    it("無効なsenderからのsend-with-contextリクエストでエラーを投げる", async () => {
      mockValidateIpcSender.mockReturnValue({
        valid: false,
        errorCode: "IPC_FORBIDDEN",
        errorMessage: "Invalid sender",
      });

      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:send-with-context");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      await expect(
        handler!(mockEvent, {
          contexts: [],
          command: { type: "refactor", targetContextId: "ctx-1" },
          message: "",
        }),
      ).rejects.toBeDefined();
    });
  });

  describe("入力バリデーション", () => {
    it("chat-edit:read-file - filePathがundefinedでエラーを返す", async () => {
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:read-file");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = await handler!(mockEvent, {});

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    it("chat-edit:read-file - filePathが数値でエラーを返す", async () => {
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:read-file");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = await handler!(mockEvent, { filePath: 123 });

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    it("chat-edit:write-file - contentがundefinedでエラーを返す", async () => {
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:write-file");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = await handler!(mockEvent, { filePath: "/path" });

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    it("chat-edit:write-file - filePathがundefinedでエラーを返す", async () => {
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:write-file");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = await handler!(mockEvent, { content: "test" });

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    it("chat-edit:send-with-context - contextsがundefinedでエラーを返す", async () => {
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:send-with-context");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = await handler!(mockEvent, {});

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    it("chat-edit:send-with-context - contextsが配列でない場合エラーを返す", async () => {
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:send-with-context");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = await handler!(mockEvent, {
        contexts: "not an array",
        command: { type: "refactor", targetContextId: "ctx-1" },
        message: "",
      });

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    it("chat-edit:send-with-context - commandがundefinedでエラーを返す", async () => {
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:send-with-context");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = await handler!(mockEvent, {
        contexts: [],
        message: "",
      });

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("正常系", () => {
    it("有効なread-fileリクエストでFileServiceを呼び出す", async () => {
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:read-file");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = await handler!(mockEvent, {
        filePath: "/path/to/file.ts",
      });

      expect(result.success).toBe(true);
      expect(mockFileService.readFile).toHaveBeenCalledWith("/path/to/file.ts");
    });

    it("有効なwrite-fileリクエストでFileServiceを呼び出す", async () => {
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:write-file");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = await handler!(mockEvent, {
        filePath: "/path/to/file.ts",
        content: "new content",
        options: { createBackup: true },
      });

      expect(result.success).toBe(true);
      expect(mockFileService.writeFile).toHaveBeenCalledWith(
        "/path/to/file.ts",
        "new content",
        { createBackup: true },
      );
    });

    it("get-selectionでnullを含む成功レスポンスを返す", async () => {
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:get-selection");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = await handler!(mockEvent);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it("有効なsend-with-contextリクエストでChatEditServiceを呼び出す", async () => {
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:send-with-context");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;
      const request = {
        contexts: [
          {
            filePath: "/path/to/file.ts",
            content: "code",
            language: "typescript",
          },
        ],
        command: { type: "refactor", targetContextId: "ctx-1" },
        message: "",
      };

      const result = await handler!(mockEvent, request);

      expect(result.success).toBe(true);
      expect(mockChatEditService.sendWithContext).toHaveBeenCalledWith(request);
    });
  });
});
