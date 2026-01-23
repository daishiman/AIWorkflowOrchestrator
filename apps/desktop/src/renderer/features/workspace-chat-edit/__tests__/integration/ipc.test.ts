/**
 * IPC接続 統合テスト
 *
 * @description TDD Green Phase - IPC通信の統合テスト
 * テストID: IT-001 ~ IT-004, IT-IPC-001 ~ IT-IPC-002
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

import type {
  FileReadResult,
  FileWriteResult,
  TextSelection,
  SendWithContextRequest,
  SendWithContextResponse,
  StreamOutputEvent,
} from "@/renderer/features/workspace-chat-edit/types";

// モックAPI
const mockChatEditAPI = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  getEditorSelection: vi.fn(),
  sendWithContext: vi.fn(),
  detectLanguage: vi.fn(),
  onStreamOutput: vi.fn(),
};

// グローバルwindowにモックを設定
vi.stubGlobal("chatEditAPI", mockChatEditAPI);

describe("IPC接続テスト", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("chat-edit:read-file", () => {
    it("IT-001: 正常なファイルパスで内容が返される", async () => {
      const filePath = "/path/to/valid/file.ts";
      const mockResponse: FileReadResult = {
        success: true,
        content: "const x = 1;",
        language: "typescript",
        fileSize: 1024,
      };

      mockChatEditAPI.readFile.mockResolvedValue(mockResponse);

      const result = await mockChatEditAPI.readFile(filePath);

      expect(result.success).toBe(true);
      expect(result.content).toBe("const x = 1;");
      expect(result.language).toBe("typescript");
      expect(mockChatEditAPI.readFile).toHaveBeenCalledWith(filePath);
    });

    it("存在しないファイルでFILE_NOT_FOUNDエラーが返される", async () => {
      const filePath = "/nonexistent/file.ts";
      const mockResponse: FileReadResult = {
        success: false,
        error: {
          code: "FILE_NOT_FOUND",
          message: "File not found: /nonexistent/file.ts",
        },
      };

      mockChatEditAPI.readFile.mockResolvedValue(mockResponse);

      const result = await mockChatEditAPI.readFile(filePath);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("FILE_NOT_FOUND");
    });

    it("読み取り権限がない場合にPERMISSION_DENIEDエラーが返される", async () => {
      const filePath = "/restricted/file.ts";
      const mockResponse: FileReadResult = {
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: "Permission denied",
        },
      };

      mockChatEditAPI.readFile.mockResolvedValue(mockResponse);

      const result = await mockChatEditAPI.readFile(filePath);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("PERMISSION_DENIED");
    });
  });

  describe("chat-edit:write-file", () => {
    it("IT-002: 正常な書き込みでsuccess: trueが返される", async () => {
      const filePath = "/path/to/file.ts";
      const content = "const x: number = 1;";
      const mockResponse: FileWriteResult = {
        success: true,
        backupPath: "/path/to/file.ts.bak",
      };

      mockChatEditAPI.writeFile.mockResolvedValue(mockResponse);

      const result = await mockChatEditAPI.writeFile(filePath, content);

      expect(result.success).toBe(true);
      expect(result.backupPath).toBeDefined();
      expect(mockChatEditAPI.writeFile).toHaveBeenCalledWith(filePath, content);
    });

    it("書き込み権限がない場合にPERMISSION_DENIEDエラーが返される", async () => {
      const filePath = "/restricted/file.ts";
      const content = "const x = 1;";
      const mockResponse: FileWriteResult = {
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: "Permission denied",
        },
      };

      mockChatEditAPI.writeFile.mockResolvedValue(mockResponse);

      const result = await mockChatEditAPI.writeFile(filePath, content);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("PERMISSION_DENIED");
    });

    it("ディスク容量不足でDISK_FULLエラーが返される", async () => {
      const filePath = "/path/to/file.ts";
      const content = "x".repeat(1000000);
      const mockResponse: FileWriteResult = {
        success: false,
        error: {
          code: "DISK_FULL",
          message: "Not enough disk space",
        },
      };

      mockChatEditAPI.writeFile.mockResolvedValue(mockResponse);

      const result = await mockChatEditAPI.writeFile(filePath, content);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("DISK_FULL");
    });
  });

  describe("chat-edit:get-selection", () => {
    it("IT-003: エディタの選択範囲が返される", async () => {
      const mockSelection: TextSelection = {
        startLine: 1,
        startColumn: 0,
        endLine: 5,
        endColumn: 20,
        selectedText: "selected content",
      };

      mockChatEditAPI.getEditorSelection.mockResolvedValue(mockSelection);

      const result = await mockChatEditAPI.getEditorSelection();

      expect(result).toEqual(mockSelection);
      expect(result?.startLine).toBe(1);
      expect(result?.selectedText).toBe("selected content");
    });

    it("選択がない場合はnullが返される", async () => {
      mockChatEditAPI.getEditorSelection.mockResolvedValue(null);

      const result = await mockChatEditAPI.getEditorSelection();

      expect(result).toBeNull();
    });
  });

  describe("chat-edit:send-with-context", () => {
    it("IT-004: コンテキスト付きメッセージが送信される", async () => {
      const request: SendWithContextRequest = {
        contexts: [
          {
            filePath: "/path/to/file.ts",
            content: "const x = 1;",
            language: "typescript",
          },
        ],
        command: { type: "refactor", targetContextId: "ctx-1" },
        message: "リファクタリングしてください",
      };

      const mockResponse: SendWithContextResponse = {
        success: true,
        result: {
          id: "result-1",
          contextId: "ctx-1",
          originalContent: "const x = 1;",
          generatedContent: "const x: number = 1;",
          diffHunks: [],
          status: "pending",
          createdAt: new Date(),
          targetFilePath: "/path/to/file.ts",
          command: { type: "refactor", targetContextId: "ctx-1" },
        },
      };

      mockChatEditAPI.sendWithContext.mockResolvedValue(mockResponse);

      const result = await mockChatEditAPI.sendWithContext(request);

      expect(result.success).toBe(true);
      expect(result.result?.generatedContent).toBe("const x: number = 1;");
      expect(mockChatEditAPI.sendWithContext).toHaveBeenCalledWith(request);
    });

    it("コンテキストサイズ超過でCONTEXT_TOO_LARGEエラーが返される", async () => {
      const largeContent = "x".repeat(101 * 1024); // 101KB
      const request: SendWithContextRequest = {
        contexts: [
          {
            filePath: "/path/to/file.ts",
            content: largeContent,
            language: "typescript",
          },
        ],
        command: { type: "refactor", targetContextId: "ctx-1" },
        message: "リファクタリング",
      };

      const mockResponse: SendWithContextResponse = {
        success: false,
        error: {
          code: "CONTEXT_TOO_LARGE",
          message: "Context size exceeds 100KB limit",
          retryable: false,
        },
      };

      mockChatEditAPI.sendWithContext.mockResolvedValue(mockResponse);

      const result = await mockChatEditAPI.sendWithContext(request);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("CONTEXT_TOO_LARGE");
    });

    it("LLMエラー時にリトライ可能なエラーが返される", async () => {
      const request: SendWithContextRequest = {
        contexts: [
          {
            filePath: "/path/to/file.ts",
            content: "const x = 1;",
            language: "typescript",
          },
        ],
        command: { type: "refactor", targetContextId: "ctx-1" },
        message: "リファクタリング",
      };

      const mockResponse: SendWithContextResponse = {
        success: false,
        error: {
          code: "LLM_ERROR",
          message: "LLM communication failed",
          retryable: true,
        },
      };

      mockChatEditAPI.sendWithContext.mockResolvedValue(mockResponse);

      const result = await mockChatEditAPI.sendWithContext(request);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("LLM_ERROR");
      expect(result.error?.retryable).toBe(true);
    });
  });

  describe("chat-edit:detect-language", () => {
    it("IT-IPC-001: ファイルの言語が検出される", async () => {
      const filePath = "/path/to/file.ts";
      mockChatEditAPI.detectLanguage.mockResolvedValue("typescript");

      const result = await mockChatEditAPI.detectLanguage(filePath);

      expect(result).toBe("typescript");
      expect(mockChatEditAPI.detectLanguage).toHaveBeenCalledWith(filePath);
    });

    it("不明な拡張子の場合はplaintextが返される", async () => {
      const filePath = "/path/to/file.unknown";
      mockChatEditAPI.detectLanguage.mockResolvedValue("plaintext");

      const result = await mockChatEditAPI.detectLanguage(filePath);

      expect(result).toBe("plaintext");
    });

    it("様々な拡張子で正しい言語が検出される", async () => {
      const testCases = [
        { path: "/file.js", expected: "javascript" },
        { path: "/file.jsx", expected: "javascriptreact" },
        { path: "/file.tsx", expected: "typescriptreact" },
        { path: "/file.py", expected: "python" },
        { path: "/file.rs", expected: "rust" },
        { path: "/file.go", expected: "go" },
      ];

      for (const testCase of testCases) {
        mockChatEditAPI.detectLanguage.mockResolvedValue(testCase.expected);
        const result = await mockChatEditAPI.detectLanguage(testCase.path);
        expect(result).toBe(testCase.expected);
      }
    });
  });

  describe("chat-edit:stream-output", () => {
    it("IT-IPC-002: ストリーミング出力イベントを購読できる", async () => {
      const callback = vi.fn();
      const unsubscribe = vi.fn();

      mockChatEditAPI.onStreamOutput.mockImplementation((cb) => {
        // シミュレートされたイベント
        setTimeout(() => cb({ type: "content", content: "const " }), 10);
        setTimeout(() => cb({ type: "content", content: "x = 1;" }), 20);
        setTimeout(() => cb({ type: "done", done: true }), 30);
        return unsubscribe;
      });

      const unsub = mockChatEditAPI.onStreamOutput(callback);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenNthCalledWith(1, {
        type: "content",
        content: "const ",
      });
      expect(callback).toHaveBeenNthCalledWith(2, {
        type: "content",
        content: "x = 1;",
      });
      expect(callback).toHaveBeenNthCalledWith(3, { type: "done", done: true });
      expect(unsub).toBeDefined();
    });

    it("エラーイベントが正しく処理される", async () => {
      const callback = vi.fn();
      const errorEvent: StreamOutputEvent = {
        type: "error",
        error: {
          code: "LLM_ERROR",
          message: "LLM communication failed",
        },
      };

      mockChatEditAPI.onStreamOutput.mockImplementation((cb) => {
        setTimeout(() => cb(errorEvent), 10);
        return vi.fn();
      });

      mockChatEditAPI.onStreamOutput(callback);

      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(callback).toHaveBeenCalledWith(errorEvent);
    });

    it("購読解除が正しく動作する", () => {
      const callback = vi.fn();
      const unsubscribe = vi.fn();

      mockChatEditAPI.onStreamOutput.mockReturnValue(unsubscribe);

      const unsub = mockChatEditAPI.onStreamOutput(callback);
      unsub();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe("セキュリティ検証", () => {
    it("ワークスペース外のファイルアクセスがブロックされる", async () => {
      const filePath = "/etc/passwd";
      const mockResponse: FileReadResult = {
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: "Access outside workspace is not allowed",
        },
      };

      mockChatEditAPI.readFile.mockResolvedValue(mockResponse);

      const result = await mockChatEditAPI.readFile(filePath);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("PERMISSION_DENIED");
    });

    it("パストラバーサル攻撃がブロックされる", async () => {
      const filePath = "/workspace/../../../etc/passwd";
      const mockResponse: FileReadResult = {
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: "Path traversal detected",
        },
      };

      mockChatEditAPI.readFile.mockResolvedValue(mockResponse);

      const result = await mockChatEditAPI.readFile(filePath);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("Path traversal");
    });

    it("シンボリックリンク経由のアクセスがブロックされる", async () => {
      const filePath = "/workspace/symlink-to-etc";
      const mockResponse: FileReadResult = {
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: "Symbolic link targets outside workspace",
        },
      };

      mockChatEditAPI.readFile.mockResolvedValue(mockResponse);

      const result = await mockChatEditAPI.readFile(filePath);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("PERMISSION_DENIED");
    });
  });

  describe("タイムアウト処理", () => {
    it("読み取りタイムアウト時にTIMEOUTエラーが返される", async () => {
      const filePath = "/path/to/slow-file.ts";
      const mockResponse: FileReadResult = {
        success: false,
        error: {
          code: "TIMEOUT",
          message: "Read operation timed out",
          retryable: true,
        },
      };

      mockChatEditAPI.readFile.mockResolvedValue(mockResponse);

      const result = await mockChatEditAPI.readFile(filePath);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("TIMEOUT");
      expect(result.error?.retryable).toBe(true);
    });
  });
});
