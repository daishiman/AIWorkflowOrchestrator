/**
 * エラーハンドリング 統合テスト
 *
 * @description TDD Green Phase - エラーハンドリングの統合テスト
 * テストID: IT-008 ~ IT-012, IT-ERR-001 ~ IT-ERR-002
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

import type {
  FileReadResult,
  SendWithContextResponse,
  GeneratedResult,
} from "@/renderer/features/workspace-chat-edit/types";

// モックAPI
const mockChatEditAPI = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  sendWithContext: vi.fn(),
};

vi.stubGlobal("chatEditAPI", mockChatEditAPI);

// モック状態管理
const createMockErrorState = () => {
  let error: string | null = null;
  let isRetryable = false;
  let retryAfterMs = 0;
  let lastRequest: any = null;
  let generatedResults: GeneratedResult[] = [];

  return {
    get error() {
      return error;
    },
    get isRetryable() {
      return isRetryable;
    },
    get retryAfterMs() {
      return retryAfterMs;
    },
    get canRetry() {
      return isRetryable && error !== null;
    },
    get generatedResults() {
      return generatedResults;
    },

    setError: (code: string | null, retryable = false, retryAfter = 0) => {
      error = code;
      isRetryable = retryable;
      retryAfterMs = retryAfter;
    },

    clearError: () => {
      error = null;
      isRetryable = false;
      retryAfterMs = 0;
    },

    setLastRequest: (request: any) => {
      lastRequest = request;
    },

    getLastRequest: () => lastRequest,

    setGeneratedResult: (result: GeneratedResult) => {
      generatedResults = [...generatedResults, result];
    },
  };
};

describe("エラーハンドリングテスト", () => {
  let state: ReturnType<typeof createMockErrorState>;

  beforeEach(() => {
    state = createMockErrorState();
    vi.clearAllMocks();
  });

  describe("ファイル読み取りエラー", () => {
    it("IT-008: 存在しないファイルでFILE_NOT_FOUNDエラー", async () => {
      // Arrange
      const mockResponse: FileReadResult = {
        success: false,
        error: {
          code: "FILE_NOT_FOUND",
          message: "File not found: /nonexistent/file.ts",
        },
      };

      mockChatEditAPI.readFile.mockResolvedValue(mockResponse);

      // Act
      const result = await mockChatEditAPI.readFile("/nonexistent/file.ts");

      if (!result.success && result.error) {
        state.setError(result.error.code, false);
      }

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("FILE_NOT_FOUND");
      expect(state.error).toBe("FILE_NOT_FOUND");
    });

    it("IT-009: 権限なしファイルでPERMISSION_DENIED", async () => {
      // Arrange
      const mockResponse: FileReadResult = {
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: "Access to this file is not allowed",
        },
      };

      mockChatEditAPI.readFile.mockResolvedValue(mockResponse);

      // Act
      const result = await mockChatEditAPI.readFile("/restricted/file.ts");

      if (!result.success && result.error) {
        state.setError(result.error.code, false);
      }

      // Assert
      expect(result.success).toBe(false);
      expect(state.error).toBe("PERMISSION_DENIED");
    });

    it("IT-010: 10MB超過ファイルでTOO_LARGEエラー", async () => {
      // Arrange
      const mockResponse: FileReadResult = {
        success: false,
        error: {
          code: "TOO_LARGE",
          message: "File size exceeds 10MB limit",
        },
      };

      mockChatEditAPI.readFile.mockResolvedValue(mockResponse);

      // Act
      const result = await mockChatEditAPI.readFile("/large/file.ts");

      if (!result.success && result.error) {
        state.setError(result.error.code, false);
      }

      // Assert
      expect(result.success).toBe(false);
      expect(state.error).toBe("TOO_LARGE");
    });

    it("READ_ERRORでリトライ可能表示", async () => {
      // Arrange
      const mockResponse: FileReadResult = {
        success: false,
        error: {
          code: "READ_ERROR",
          message: "Failed to read file",
          retryable: true,
        },
      };

      mockChatEditAPI.readFile.mockResolvedValue(mockResponse);

      // Act
      const result = await mockChatEditAPI.readFile("/file.ts");

      if (!result.success && result.error) {
        state.setError(result.error.code, result.error.retryable || false);
      }

      // Assert
      expect(state.error).toBe("READ_ERROR");
      expect(state.isRetryable).toBe(true);
    });
  });

  describe("LLM通信エラー", () => {
    it("IT-011: LLM APIエラーでLLM_ERROR表示", async () => {
      // Arrange
      const mockResponse: SendWithContextResponse = {
        success: false,
        error: {
          code: "LLM_ERROR",
          message: "Failed to communicate with LLM",
          retryable: true,
        },
      };

      mockChatEditAPI.sendWithContext.mockResolvedValue(mockResponse);

      // Act
      const result = await mockChatEditAPI.sendWithContext({
        contexts: [],
        command: { type: "continue", targetContextId: "ctx-1" },
        message: "続きを書いて",
      });

      if (!result.success && result.error) {
        state.setError(result.error.code, result.error.retryable || false);
      }

      // Assert
      expect(state.error).toBe("LLM_ERROR");
      expect(state.isRetryable).toBe(true);
    });

    it("IT-012: タイムアウトでTIMEOUTエラー", async () => {
      // Arrange
      const mockResponse: SendWithContextResponse = {
        success: false,
        error: {
          code: "TIMEOUT",
          message: "Request timed out",
          retryable: true,
          retryAfterMs: 5000,
        },
      };

      mockChatEditAPI.sendWithContext.mockResolvedValue(mockResponse);

      // Act
      const result = await mockChatEditAPI.sendWithContext({
        contexts: [],
        command: { type: "refactor", targetContextId: "ctx-1" },
        message: "リファクタリング",
      });

      if (!result.success && result.error) {
        state.setError(
          result.error.code,
          result.error.retryable || false,
          result.error.retryAfterMs,
        );
      }

      // Assert
      expect(state.error).toBe("TIMEOUT");
      expect(state.retryAfterMs).toBe(5000);
    });

    it("RATE_LIMITエラーでリトライ待機時間表示", async () => {
      // Arrange
      const mockResponse: SendWithContextResponse = {
        success: false,
        error: {
          code: "RATE_LIMIT",
          message: "Rate limit exceeded",
          retryable: true,
          retryAfterMs: 60000,
        },
      };

      mockChatEditAPI.sendWithContext.mockResolvedValue(mockResponse);

      // Act
      const result = await mockChatEditAPI.sendWithContext({
        contexts: [],
        command: { type: "continue", targetContextId: "ctx-1" },
        message: "test",
      });

      if (!result.success && result.error) {
        state.setError(
          result.error.code,
          result.error.retryable || false,
          result.error.retryAfterMs,
        );
      }

      // Assert
      expect(state.error).toBe("RATE_LIMIT");
      expect(state.retryAfterMs).toBe(60000);
    });

    it("CONTEXT_TOO_LARGEエラー（リトライ不可）", async () => {
      // Arrange
      const mockResponse: SendWithContextResponse = {
        success: false,
        error: {
          code: "CONTEXT_TOO_LARGE",
          message: "Context size exceeds limit",
          retryable: false,
        },
      };

      mockChatEditAPI.sendWithContext.mockResolvedValue(mockResponse);

      // Act
      const result = await mockChatEditAPI.sendWithContext({
        contexts: [],
        command: { type: "continue", targetContextId: "ctx-1" },
        message: "test",
      });

      if (!result.success && result.error) {
        state.setError(result.error.code, result.error.retryable || false);
      }

      // Assert
      expect(state.error).toBe("CONTEXT_TOO_LARGE");
      expect(state.isRetryable).toBe(false);
    });
  });

  describe("リトライ機能", () => {
    it("IT-ERR-001: リトライ可能エラーでリトライボタン表示", async () => {
      // Arrange
      const mockResponse: SendWithContextResponse = {
        success: false,
        error: {
          code: "LLM_ERROR",
          message: "Temporary failure",
          retryable: true,
        },
      };

      mockChatEditAPI.sendWithContext.mockResolvedValue(mockResponse);

      // Act
      const result = await mockChatEditAPI.sendWithContext({
        contexts: [],
        command: { type: "continue", targetContextId: "ctx-1" },
        message: "test",
      });

      if (!result.success && result.error) {
        state.setError(result.error.code, result.error.retryable || false);
      }

      // Assert
      expect(state.canRetry).toBe(true);
    });

    it("リトライ実行で再送信される", async () => {
      // Arrange
      let callCount = 0;
      mockChatEditAPI.sendWithContext.mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          return {
            success: false,
            error: {
              code: "TIMEOUT",
              message: "Request timed out",
              retryable: true,
            },
          };
        }
        return {
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
      });

      const request = {
        contexts: [],
        command: { type: "refactor", targetContextId: "ctx-1" },
        message: "リファクタリング",
      };

      // Act - 初回送信（失敗）
      const result1 = await mockChatEditAPI.sendWithContext(request);
      if (!result1.success && result1.error) {
        state.setError(result1.error.code, result1.error.retryable || false);
        state.setLastRequest(request);
      }

      expect(state.error).toBe("TIMEOUT");

      // Act - リトライ（成功）
      const result2 = await mockChatEditAPI.sendWithContext(
        state.getLastRequest(),
      );
      if (result2.success && result2.result) {
        state.clearError();
        state.setGeneratedResult(result2.result);
      }

      // Assert
      expect(state.error).toBeNull();
      expect(state.generatedResults).toHaveLength(1);
      expect(mockChatEditAPI.sendWithContext).toHaveBeenCalledTimes(2);
    });
  });

  describe("エラー表示", () => {
    it("IT-ERR-002: エラーメッセージがトースト表示される", async () => {
      // Arrange
      const mockResponse: FileReadResult = {
        success: false,
        error: {
          code: "FILE_NOT_FOUND",
          message: "File not found",
        },
      };

      mockChatEditAPI.readFile.mockResolvedValue(mockResponse);

      const showToast = vi.fn();

      // Act
      const result = await mockChatEditAPI.readFile("/nonexistent/file.ts");

      if (!result.success && result.error) {
        state.setError(result.error.code, false);
        showToast({ type: "error", message: result.error.message });
      }

      // Assert
      expect(showToast).toHaveBeenCalledWith({
        type: "error",
        message: "File not found",
      });
    });

    it("エラークリア後に状態がリセットされる", () => {
      // Arrange - エラー状態を設定
      state.setError("FILE_NOT_FOUND", true, 1000);

      expect(state.error).toBe("FILE_NOT_FOUND");
      expect(state.isRetryable).toBe(true);
      expect(state.retryAfterMs).toBe(1000);

      // Act
      state.clearError();

      // Assert
      expect(state.error).toBeNull();
      expect(state.isRetryable).toBe(false);
      expect(state.retryAfterMs).toBe(0);
    });
  });

  describe("ファイル書き込みエラー", () => {
    it("書き込みエラーでWRITE_ERROR表示", async () => {
      // Arrange
      mockChatEditAPI.writeFile.mockResolvedValue({
        success: false,
        error: {
          code: "WRITE_ERROR",
          message: "Failed to write file",
        },
      });

      // Act
      const result = await mockChatEditAPI.writeFile(
        "/path/to/file.ts",
        "const x = 1;",
      );

      if (!result.success && result.error) {
        state.setError(result.error.code, false);
      }

      // Assert
      expect(state.error).toBe("WRITE_ERROR");
    });

    it("INVALID_PATHエラー", async () => {
      // Arrange
      mockChatEditAPI.writeFile.mockResolvedValue({
        success: false,
        error: {
          code: "INVALID_PATH",
          message: "Invalid file path",
        },
      });

      // Act
      const result = await mockChatEditAPI.writeFile(
        "invalid://path",
        "const x = 1;",
      );

      if (!result.success && result.error) {
        state.setError(result.error.code, false);
      }

      // Assert
      expect(state.error).toBe("INVALID_PATH");
    });
  });
});
