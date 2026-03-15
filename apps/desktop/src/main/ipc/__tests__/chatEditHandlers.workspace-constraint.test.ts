/**
 * chatEditHandlers - workspacePath 制約テスト
 *
 * TC-WS-01〜06: workspacePath セキュリティ検証ロジック（L159-173）の単体テスト
 * テスト対象: ipc/chatEditHandlers.ts（P58: 正本は IPC 版）
 */
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ipcMain, IpcMainInvokeEvent } from "electron";
import * as PathValidatorModule from "../../services/chat-edit/utils/PathValidator";

// vi.hoisted でモック関数をホイスティング前に定義（既存セキュリティテストと同一パターン）
const { mockValidateIpcSender, mockToIPCValidationError } = vi.hoisted(() => ({
  mockValidateIpcSender: vi.fn(),
  mockToIPCValidationError: vi.fn(),
}));

// Electron モック
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  BrowserWindow: {
    getFocusedWindow: vi.fn(),
  },
}));

// IPC Validator モック
vi.mock("../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: mockValidateIpcSender,
  toIPCValidationError: mockToIPCValidationError,
}));

// TerminalHandoffBuilder モック
vi.mock("../../services/chat-edit/TerminalHandoffBuilder", () => ({
  TerminalHandoffBuilder: vi.fn().mockImplementation(() => ({
    build: vi.fn().mockReturnValue({
      terminalCommand: "claude --chat-edit",
      description: "test handoff",
    }),
  })),
}));

import {
  registerChatEditHandlers,
  unregisterChatEditHandlers,
} from "../chatEditHandlers";

type IpcHandler = (event: IpcMainInvokeEvent, ...args: any[]) => Promise<any>;

describe("chatEditHandlers - workspacePath 制約テスト", () => {
  let mockMainWindow: any;
  let mockContextBuilder: any;
  let mockFileService: any;
  let mockRuntimeResolver: any;
  let registeredHandlers: Map<string, IpcHandler>;
  let isAllowedPathSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    registeredHandlers = new Map();

    // ipcMain.handle をモックしてハンドラを保存（既存パターン踏襲）
    vi.mocked(ipcMain.handle).mockImplementation((channel, handler) => {
      registeredHandlers.set(channel, handler as IpcHandler);
      return undefined as any;
    });

    // isAllowedPath の実装を保持しつつ呼び出しを検証（TC-WS-04 で path.resolve が必要）
    isAllowedPathSpy = vi.spyOn(PathValidatorModule, "isAllowedPath");

    mockMainWindow = { id: 1, webContents: { id: 1 } };
    mockContextBuilder = {
      build: vi.fn().mockReturnValue("context"),
    };
    mockFileService = {
      readFile: vi.fn().mockResolvedValue({
        success: true,
        content: "file content",
        language: "typescript",
      }),
      writeFile: vi.fn().mockResolvedValue({ success: true }),
    };
    mockRuntimeResolver = {
      resolve: vi.fn().mockResolvedValue({
        type: "handoff",
        reason: "test handoff",
      }),
    };

    // workspace 制約テストに集中するため sender 検証は常に valid
    mockValidateIpcSender.mockReturnValue({ valid: true });

    registerChatEditHandlers(
      mockMainWindow,
      mockContextBuilder,
      mockFileService,
      mockRuntimeResolver,
    );
  });

  afterEach(() => {
    unregisterChatEditHandlers();
    isAllowedPathSpy.mockRestore();
  });

  // TC-WS-01: workspace 内ファイルコンテキストの正常処理
  describe("TC-WS-01: workspace 内ファイルの正常処理", () => {
    it("workspace 内のファイルパスを持つコンテキストは正常に処理される", async () => {
      const handler = registeredHandlers.get("chat-edit:send-with-context");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = await handler!(mockEvent, {
        workspacePath: "/home/user/project",
        contexts: [
          {
            filePath: "/home/user/project/src/index.ts",
            content: "code",
            language: "typescript",
          },
        ],
        command: { type: "refactor", targetContextId: "ctx-1" },
        message: "",
      });

      expect(result.success).toBe(true);
      expect(isAllowedPathSpy).toHaveBeenCalledWith(
        "/home/user/project/src/index.ts",
        ["/home/user/project"],
      );
      expect(mockRuntimeResolver.resolve).toHaveBeenCalledTimes(1);
    });
  });

  // TC-WS-02: workspace 外ファイルコンテキストの拒否
  describe("TC-WS-02: workspace 外ファイルの拒否", () => {
    it("workspace 外のファイルパスは PERMISSION_DENIED を返す", async () => {
      const handler = registeredHandlers.get("chat-edit:send-with-context");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = await handler!(mockEvent, {
        workspacePath: "/home/user/project",
        contexts: [
          {
            filePath: "/etc/passwd",
            content: "",
            language: "text",
          },
        ],
        command: { type: "refactor", targetContextId: "ctx-1" },
        message: "",
      });

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("PERMISSION_DENIED");
      expect(result.error.retryable).toBe(false);
      expect(mockRuntimeResolver.resolve).not.toHaveBeenCalled();
    });
  });

  // TC-WS-03: workspacePath 未指定時の検証スキップ
  describe("TC-WS-03: workspacePath 未指定時の検証スキップ", () => {
    it("workspacePath が undefined の場合、isAllowedPath が呼ばれずに処理が続行する", async () => {
      const handler = registeredHandlers.get("chat-edit:send-with-context");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = await handler!(mockEvent, {
        contexts: [
          {
            filePath: "/etc/passwd",
            content: "",
            language: "text",
          },
        ],
        command: { type: "refactor", targetContextId: "ctx-1" },
        message: "",
      });

      expect(result.success).toBe(true);
      expect(isAllowedPathSpy).not.toHaveBeenCalled();
      expect(mockRuntimeResolver.resolve).toHaveBeenCalledTimes(1);
    });
  });

  // TC-WS-04: パストラバーサル攻撃パターンのガード
  describe("TC-WS-04: パストラバーサル攻撃のガード", () => {
    it("../../ を含むパスは path.resolve で正規化され PERMISSION_DENIED を返す", async () => {
      const handler = registeredHandlers.get("chat-edit:send-with-context");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = await handler!(mockEvent, {
        workspacePath: "/home/user/project",
        contexts: [
          {
            filePath: "/home/user/project/../../etc/passwd",
            content: "",
            language: "text",
          },
        ],
        command: { type: "refactor", targetContextId: "ctx-1" },
        message: "",
      });

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("PERMISSION_DENIED");
      expect(mockRuntimeResolver.resolve).not.toHaveBeenCalled();
    });
  });

  // TC-WS-05: 複数コンテキストのうち 1 つが workspace 外
  describe("TC-WS-05: 複数コンテキストの部分拒否", () => {
    it("複数コンテキストのうち 1 つが workspace 外なら全体が PERMISSION_DENIED を返す", async () => {
      const handler = registeredHandlers.get("chat-edit:send-with-context");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = await handler!(mockEvent, {
        workspacePath: "/home/user/project",
        contexts: [
          {
            filePath: "/home/user/project/src/index.ts",
            content: "code",
            language: "typescript",
          },
          {
            filePath: "/etc/passwd",
            content: "",
            language: "text",
          },
        ],
        command: { type: "refactor", targetContextId: "ctx-1" },
        message: "",
      });

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("PERMISSION_DENIED");
      expect(isAllowedPathSpy).toHaveBeenCalledTimes(2);
      expect(mockRuntimeResolver.resolve).not.toHaveBeenCalled();
    });
  });

  // TC-WS-06: 空コンテキスト配列の正常処理
  describe("TC-WS-06: 空コンテキスト配列の正常処理", () => {
    it("空のコンテキスト配列で isAllowedPath が呼ばれずに正常処理される", async () => {
      const handler = registeredHandlers.get("chat-edit:send-with-context");
      const mockEvent = { sender: {} } as IpcMainInvokeEvent;

      const result = await handler!(mockEvent, {
        workspacePath: "/home/user/project",
        contexts: [],
        command: { type: "refactor", targetContextId: "ctx-1" },
        message: "",
      });

      expect(result.success).toBe(true);
      expect(isAllowedPathSpy).not.toHaveBeenCalled();
      expect(mockRuntimeResolver.resolve).toHaveBeenCalledTimes(1);
    });
  });
});
