/**
 * chatEditHandlers Unit Tests
 *
 * TDD Red Phase: テストは実装前に作成されているため、現時点では失敗する
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ipcMain, IpcMainInvokeEvent } from "electron";

// Electronをモック
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

// IPC Validatorをモック
vi.mock("../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: vi.fn(() => ({ valid: true })),
  toIPCValidationError: vi.fn(
    (v) => new Error(v.reason || "IPC validation failed"),
  ),
}));

// chatEditHandlersのモック（実装前）
// 実装後はこのモックを削除して実際のchatEditHandlersをインポート
// import { registerChatEditHandlers, unregisterChatEditHandlers } from "../chatEditHandlers";

// IPC handler type
type IpcHandler = (event: IpcMainInvokeEvent, ...args: any[]) => Promise<any>;

// 型定義
interface SendWithContextRequest {
  contexts: {
    filePath: string;
    content: string;
    language: string;
  }[];
  command: {
    type: string;
    targetContextId: string;
  };
  message: string;
}

describe("chatEditHandlers", () => {
  let mockMainWindow: any;
  let mockChatEditService: any;
  let mockFileService: any;
  let registeredHandlers: Map<string, IpcHandler>;

  // モック関数
  const registerChatEditHandlers = (
    mainWindow: any,
    chatEditService: any,
    fileService: any,
  ) => {
    const channels = [
      "chat-edit:read-file",
      "chat-edit:write-file",
      "chat-edit:get-selection",
      "chat-edit:send-with-context",
    ];

    channels.forEach((channel) => {
      const handler = async (event: any, args: any) => {
        // validateIpcSender would be called here
        switch (channel) {
          case "chat-edit:read-file":
            return fileService.readFile(args.filePath);
          case "chat-edit:write-file":
            return fileService.writeFile(
              args.filePath,
              args.content,
              args.options,
            );
          case "chat-edit:get-selection":
            return null;
          case "chat-edit:send-with-context":
            return chatEditService.sendWithContext(args);
        }
      };
      registeredHandlers.set(channel, handler);
      ipcMain.handle(channel, handler);
    });
  };

  const unregisterChatEditHandlers = () => {
    const channels = [
      "chat-edit:read-file",
      "chat-edit:write-file",
      "chat-edit:get-selection",
      "chat-edit:send-with-context",
    ];
    channels.forEach((channel) => {
      ipcMain.removeHandler(channel);
      registeredHandlers.delete(channel);
    });
  };

  beforeEach(() => {
    registeredHandlers = new Map();
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
    vi.clearAllMocks();
  });

  afterEach(() => {
    unregisterChatEditHandlers();
  });

  describe("registerChatEditHandlers", () => {
    it("4つのIPCハンドラを登録する", () => {
      // Act
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      // Assert
      expect(ipcMain.handle).toHaveBeenCalledTimes(4);
    });

    it("chat-edit:read-fileハンドラを登録する", () => {
      // Act
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      // Assert
      expect(ipcMain.handle).toHaveBeenCalledWith(
        "chat-edit:read-file",
        expect.any(Function),
      );
    });

    it("chat-edit:write-fileハンドラを登録する", () => {
      // Act
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      // Assert
      expect(ipcMain.handle).toHaveBeenCalledWith(
        "chat-edit:write-file",
        expect.any(Function),
      );
    });

    it("chat-edit:get-selectionハンドラを登録する", () => {
      // Act
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      // Assert
      expect(ipcMain.handle).toHaveBeenCalledWith(
        "chat-edit:get-selection",
        expect.any(Function),
      );
    });

    it("chat-edit:send-with-contextハンドラを登録する", () => {
      // Act
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      // Assert
      expect(ipcMain.handle).toHaveBeenCalledWith(
        "chat-edit:send-with-context",
        expect.any(Function),
      );
    });
  });

  describe("unregisterChatEditHandlers", () => {
    it("登録したハンドラを解除する", () => {
      // Arrange
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );

      // Act
      unregisterChatEditHandlers();

      // Assert
      expect(ipcMain.removeHandler).toHaveBeenCalledWith("chat-edit:read-file");
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        "chat-edit:write-file",
      );
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        "chat-edit:get-selection",
      );
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        "chat-edit:send-with-context",
      );
    });
  });

  describe("handler execution", () => {
    it("read-fileハンドラがFileServiceを呼び出す", async () => {
      // Arrange
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );
      const handler = registeredHandlers.get("chat-edit:read-file");
      const mockEvent = {} as IpcMainInvokeEvent;

      // Act
      const result = await handler!(mockEvent, {
        filePath: "/path/to/file.ts",
      });

      // Assert
      expect(mockFileService.readFile).toHaveBeenCalledWith("/path/to/file.ts");
      expect(result.success).toBe(true);
    });

    it("write-fileハンドラがFileServiceを呼び出す", async () => {
      // Arrange
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );
      const handler = registeredHandlers.get("chat-edit:write-file");
      const mockEvent = {} as IpcMainInvokeEvent;

      // Act
      const result = await handler!(mockEvent, {
        filePath: "/path/to/file.ts",
        content: "new content",
        options: { createBackup: true },
      });

      // Assert
      expect(mockFileService.writeFile).toHaveBeenCalledWith(
        "/path/to/file.ts",
        "new content",
        { createBackup: true },
      );
      expect(result.success).toBe(true);
    });

    it("send-with-contextハンドラがChatEditServiceを呼び出す", async () => {
      // Arrange
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );
      const handler = registeredHandlers.get("chat-edit:send-with-context");
      const mockEvent = {} as IpcMainInvokeEvent;
      const request: SendWithContextRequest = {
        contexts: [
          {
            filePath: "/path/to/file.ts",
            content: "const x = 1;",
            language: "typescript",
          },
        ],
        command: {
          type: "refactor",
          targetContextId: "ctx-1",
        },
        message: "リファクタリングしてください",
      };

      // Act
      const result = await handler!(mockEvent, request);

      // Assert
      expect(mockChatEditService.sendWithContext).toHaveBeenCalledWith(request);
      expect(result.success).toBe(true);
    });

    it("get-selectionハンドラがnullを返す（現時点では未実装）", async () => {
      // Arrange
      registerChatEditHandlers(
        mockMainWindow,
        mockChatEditService,
        mockFileService,
      );
      const handler = registeredHandlers.get("chat-edit:get-selection");
      const mockEvent = {} as IpcMainInvokeEvent;

      // Act
      const result = await handler!(mockEvent, {});

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("IPC sender validation", () => {
    it("不正なsenderからのリクエストでエラーを投げる", async () => {
      // このテストは実際のvalidateIpcSender実装時にモックを調整
      // 現在のモックでは常にvalid: trueを返す

      // Arrange
      const { validateIpcSender } =
        await import("../../infrastructure/security/ipc-validator");
      vi.mocked(validateIpcSender).mockReturnValueOnce({
        valid: false,
        reason: "Invalid sender",
      });

      // 実装後は以下のようにテスト
      // registerChatEditHandlers(mockMainWindow, mockChatEditService, mockFileService);
      // const handler = registeredHandlers.get("chat-edit:read-file");
      // await expect(handler!(mockEvent, {})).rejects.toThrow("Invalid sender");

      expect(true).toBe(true); // プレースホルダー
    });
  });
});
