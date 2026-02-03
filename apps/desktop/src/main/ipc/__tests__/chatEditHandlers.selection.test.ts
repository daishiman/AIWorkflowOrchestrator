/**
 * chatEditHandlers - handleGetSelection テスト
 *
 * Monaco Editor選択範囲取得機能の詳細テスト
 * TDD Red Phase: 実装前にテストを作成
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ipcMain, BrowserWindow, IpcMainInvokeEvent } from "electron";

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
type IpcHandler = (
  event: IpcMainInvokeEvent,
  ...args: unknown[]
) => Promise<unknown>;

// TextSelection型
interface TextSelection {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  selectedText: string;
}

describe("chatEditHandlers - handleGetSelection", () => {
  let mockMainWindow: {
    id: number;
    webContents: {
      id: number;
      executeJavaScript: ReturnType<typeof vi.fn>;
    };
  };
  let mockChatEditService: {
    sendWithContext: ReturnType<typeof vi.fn>;
  };
  let mockFileService: {
    readFile: ReturnType<typeof vi.fn>;
    writeFile: ReturnType<typeof vi.fn>;
  };
  let registeredHandlers: Map<string, IpcHandler>;

  beforeEach(() => {
    vi.clearAllMocks();
    registeredHandlers = new Map();

    // ipcMain.handleをモックしてハンドラを保存
    vi.mocked(ipcMain.handle).mockImplementation((channel, handler) => {
      registeredHandlers.set(channel, handler as IpcHandler);
      return undefined as unknown;
    });

    mockMainWindow = {
      id: 1,
      webContents: {
        id: 1,
        executeJavaScript: vi.fn(),
      },
    };

    mockChatEditService = {
      sendWithContext: vi.fn().mockResolvedValue({ success: true }),
    };

    mockFileService = {
      readFile: vi.fn().mockResolvedValue({ success: true }),
      writeFile: vi.fn().mockResolvedValue({ success: true }),
    };

    // デフォルトで検証を通す
    mockValidateIpcSender.mockReturnValue({ valid: true });
    mockToIPCValidationError.mockImplementation((v) => {
      const error = new Error(v.errorMessage || "IPC validation failed");
      return error;
    });

    // BrowserWindow.getFocusedWindowをモック
    vi.mocked(BrowserWindow.getFocusedWindow).mockReturnValue(
      mockMainWindow as unknown as BrowserWindow,
    );
  });

  afterEach(() => {
    unregisterChatEditHandlers();
  });

  describe("選択範囲取得", () => {
    it("選択範囲がある場合にTextSelectionを返す", async () => {
      const expectedSelection: TextSelection = {
        startLine: 5,
        startColumn: 10,
        endLine: 8,
        endColumn: 20,
        selectedText: "const foo = 'bar';",
      };

      // executeJavaScriptが選択範囲を返すようにモック
      mockMainWindow.webContents.executeJavaScript.mockResolvedValue(
        expectedSelection,
      );

      registerChatEditHandlers(
        mockMainWindow as unknown as BrowserWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:get-selection");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = (await handler!(mockEvent)) as {
        success: boolean;
        data: TextSelection | null;
      };

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedSelection);
    });

    it("選択がない場合にnullを返す", async () => {
      // executeJavaScriptがnullを返すようにモック
      mockMainWindow.webContents.executeJavaScript.mockResolvedValue(null);

      registerChatEditHandlers(
        mockMainWindow as unknown as BrowserWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:get-selection");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = (await handler!(mockEvent)) as {
        success: boolean;
        data: TextSelection | null;
      };

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it("BrowserWindowがない場合にnullを返す", async () => {
      // getFocusedWindowがnullを返すようにモック
      vi.mocked(BrowserWindow.getFocusedWindow).mockReturnValue(null);

      registerChatEditHandlers(
        mockMainWindow as unknown as BrowserWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:get-selection");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = (await handler!(mockEvent)) as {
        success: boolean;
        data: TextSelection | null;
      };

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it("executeJavaScriptがエラーをスローした場合にnullを返す", async () => {
      // executeJavaScriptがエラーをスローするようにモック
      mockMainWindow.webContents.executeJavaScript.mockRejectedValue(
        new Error("Script execution failed"),
      );

      registerChatEditHandlers(
        mockMainWindow as unknown as BrowserWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:get-selection");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = (await handler!(mockEvent)) as {
        success: boolean;
        data: TextSelection | null;
      };

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it("window.__editorSelectionを呼び出すスクリプトを実行する", async () => {
      mockMainWindow.webContents.executeJavaScript.mockResolvedValue(null);

      registerChatEditHandlers(
        mockMainWindow as unknown as BrowserWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:get-selection");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      await handler!(mockEvent);

      expect(mockMainWindow.webContents.executeJavaScript).toHaveBeenCalled();
      const calledScript = mockMainWindow.webContents.executeJavaScript.mock
        .calls[0][0] as string;
      expect(calledScript).toContain("__editorSelection");
      expect(calledScript).toContain("getEditorSelection");
    });

    it("validateIpcSenderで検証が行われる", async () => {
      registerChatEditHandlers(
        mockMainWindow as unknown as BrowserWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:get-selection");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      await handler!(mockEvent);

      expect(mockValidateIpcSender).toHaveBeenCalledWith(
        mockEvent,
        "chat-edit:get-selection",
        expect.any(Object),
      );
    });

    it("検証失敗時にエラーをスローする", async () => {
      mockValidateIpcSender.mockReturnValue({
        valid: false,
        errorCode: "IPC_FORBIDDEN",
        errorMessage: "Invalid sender",
      });
      mockToIPCValidationError.mockReturnValue(new Error("Invalid sender"));

      registerChatEditHandlers(
        mockMainWindow as unknown as BrowserWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:get-selection");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      await expect(handler!(mockEvent)).rejects.toThrow("Invalid sender");
    });
  });

  describe("複数行選択", () => {
    it("startLine < endLineの選択範囲を正しく返す", async () => {
      const multiLineSelection: TextSelection = {
        startLine: 10,
        startColumn: 1,
        endLine: 15,
        endColumn: 30,
        selectedText: "function foo() {\n  return 'bar';\n}",
      };

      mockMainWindow.webContents.executeJavaScript.mockResolvedValue(
        multiLineSelection,
      );

      registerChatEditHandlers(
        mockMainWindow as unknown as BrowserWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:get-selection");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = (await handler!(mockEvent)) as {
        success: boolean;
        data: TextSelection;
      };

      expect(result.data.startLine).toBeLessThan(result.data.endLine);
      expect(result.data.selectedText).toContain("\n");
    });
  });

  describe("単一行選択", () => {
    it("同一行でstartColumn < endColumnの選択範囲を正しく返す", async () => {
      const singleLineSelection: TextSelection = {
        startLine: 5,
        startColumn: 10,
        endLine: 5,
        endColumn: 25,
        selectedText: "const x = 42;",
      };

      mockMainWindow.webContents.executeJavaScript.mockResolvedValue(
        singleLineSelection,
      );

      registerChatEditHandlers(
        mockMainWindow as unknown as BrowserWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:get-selection");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = (await handler!(mockEvent)) as {
        success: boolean;
        data: TextSelection;
      };

      expect(result.data.startLine).toBe(result.data.endLine);
      expect(result.data.startColumn).toBeLessThan(result.data.endColumn);
    });
  });

  describe("境界値テスト", () => {
    it("1文字のみの選択を正しく返す", async () => {
      const oneCharSelection: TextSelection = {
        startLine: 1,
        startColumn: 1,
        endLine: 1,
        endColumn: 2,
        selectedText: "a",
      };

      mockMainWindow.webContents.executeJavaScript.mockResolvedValue(
        oneCharSelection,
      );

      registerChatEditHandlers(
        mockMainWindow as unknown as BrowserWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:get-selection");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = (await handler!(mockEvent)) as {
        success: boolean;
        data: TextSelection;
      };

      expect(result.data.selectedText).toBe("a");
      expect(result.data.selectedText.length).toBe(1);
    });

    it("日本語テキストの選択を正しく返す", async () => {
      const japaneseSelection: TextSelection = {
        startLine: 1,
        startColumn: 1,
        endLine: 1,
        endColumn: 12,
        selectedText: "これは日本語です",
      };

      mockMainWindow.webContents.executeJavaScript.mockResolvedValue(
        japaneseSelection,
      );

      registerChatEditHandlers(
        mockMainWindow as unknown as BrowserWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:get-selection");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = (await handler!(mockEvent)) as {
        success: boolean;
        data: TextSelection;
      };

      expect(result.data.selectedText).toBe("これは日本語です");
    });

    it("1行目からの選択を正しく返す", async () => {
      const firstLineSelection: TextSelection = {
        startLine: 1,
        startColumn: 1,
        endLine: 1,
        endColumn: 20,
        selectedText: "// First line comment",
      };

      mockMainWindow.webContents.executeJavaScript.mockResolvedValue(
        firstLineSelection,
      );

      registerChatEditHandlers(
        mockMainWindow as unknown as BrowserWindow,
        mockChatEditService,
        mockFileService,
      );

      const handler = registeredHandlers.get("chat-edit:get-selection");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = (await handler!(mockEvent)) as {
        success: boolean;
        data: TextSelection;
      };

      expect(result.data.startLine).toBe(1);
    });
  });
});
