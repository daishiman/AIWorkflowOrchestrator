/**
 * SkillExecutor - エラーハンドリング テスト
 *
 * TASK-3-1-B: categorizeError / isRetryable のユニットテスト
 *
 * TDD Green フェーズ: 実装に合わせたテスト
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BrowserWindow } from "electron";
import { SkillExecutor } from "../SkillExecutor";

// electron-store モック（PermissionStore用）
vi.mock("electron-store", () => {
  return {
    default: class MockElectronStore {
      private data: Record<string, unknown> = {
        version: 1,
        allowedTools: [],
        updatedAt: new Date().toISOString(),
      };
      constructor() {}
      get store() {
        return this.data;
      }
      get(_key: string, defaultValue?: unknown) {
        return defaultValue;
      }
      set(key: string | Record<string, unknown>, value?: unknown) {
        if (typeof key === "string") {
          this.data[key] = value;
        } else {
          Object.assign(this.data, key);
        }
      }
      clear() {
        this.data = {};
      }
    },
  };
});

// BrowserWindowモック作成ヘルパー
function createMockBrowserWindow(): BrowserWindow {
  return {
    isDestroyed: vi.fn().mockReturnValue(false),
    webContents: {
      send: vi.fn(),
    },
  } as unknown as BrowserWindow;
}

describe("SkillExecutor - Error handling", () => {
  let mockWindow: BrowserWindow;
  let executor: SkillExecutor;

  beforeEach(() => {
    vi.clearAllMocks();
    mockWindow = createMockBrowserWindow();
    executor = new SkillExecutor(mockWindow);
  });

  describe("categorizeError (FR-006)", () => {
    it("should categorize SDK errors (AC-010)", () => {
      // Arrange
      const error = new Error("SDK API call failed");

      // Act
      const category = executor.categorizeError(error);

      // Assert
      expect(category).toBe("sdk_error");
    });

    it("should categorize network errors (AC-011)", () => {
      // Arrange
      const error = new Error("network connection failed");

      // Act
      const category = executor.categorizeError(error);

      // Assert
      expect(category).toBe("network");
    });

    it("should categorize timeout errors (AbortError)", () => {
      // Arrange
      const error = new Error("Operation timed out");
      error.name = "AbortError";

      // Act
      const category = executor.categorizeError(error);

      // Assert
      expect(category).toBe("timeout");
    });

    it("should categorize permission errors", () => {
      // Arrange
      const error = new Error("permission denied");

      // Act
      const category = executor.categorizeError(error);

      // Assert
      expect(category).toBe("permission_denied");
    });

    it("should categorize unknown errors", () => {
      // Arrange
      const error = new Error("Something unexpected happened");

      // Act
      const category = executor.categorizeError(error);

      // Assert
      expect(category).toBe("unknown");
    });

    it("should categorize fetch errors as network", () => {
      // Arrange
      const error = new Error("fetch failed");

      // Act
      const category = executor.categorizeError(error);

      // Assert
      expect(category).toBe("network");
    });

    it("should categorize API errors as sdk_error", () => {
      // Arrange
      const error = new Error("API rate limit exceeded");

      // Act
      const category = executor.categorizeError(error);

      // Assert
      expect(category).toBe("sdk_error");
    });
  });

  describe("isRetryable (FR-007)", () => {
    it("should identify network errors as retryable (AC-012)", () => {
      // Arrange
      const error = new Error("network connection failed");

      // Act
      const result = executor.isRetryable(error);

      // Assert
      expect(result).toBe(true);
    });

    it("should identify permission errors as non-retryable (AC-013)", () => {
      // Arrange
      const error = new Error("permission denied");

      // Act
      const result = executor.isRetryable(error);

      // Assert
      expect(result).toBe(false);
    });

    it("should identify timeout errors as retryable", () => {
      // Arrange
      const error = new Error("Request timeout");

      // Act
      const result = executor.isRetryable(error);

      // Assert
      expect(result).toBe(true);
    });

    it("should identify ECONNRESET as retryable", () => {
      // Arrange
      const error = new Error("ECONNRESET");

      // Act
      const result = executor.isRetryable(error);

      // Assert
      expect(result).toBe(true);
    });

    it("should identify unknown errors as non-retryable", () => {
      // Arrange
      const error = new Error("Unknown error occurred");

      // Act
      const result = executor.isRetryable(error);

      // Assert
      expect(result).toBe(false);
    });

    it("should identify SDK errors as non-retryable", () => {
      // Arrange
      const error = new Error("SDK configuration error");

      // Act
      const result = executor.isRetryable(error);

      // Assert
      expect(result).toBe(false);
    });
  });

  // =================================================================
  // Phase 6: テスト拡充 - エッジケース
  // =================================================================

  describe("categorizeError - Edge cases", () => {
    it("should handle string error", () => {
      // Arrange
      const error = "Something went wrong";

      // Act
      const category = executor.categorizeError(error);

      // Assert
      expect(category).toBe("unknown");
    });

    it("should handle null error", () => {
      // Arrange
      const error = null;

      // Act
      const category = executor.categorizeError(error);

      // Assert
      expect(category).toBe("unknown");
    });

    it("should handle undefined error", () => {
      // Arrange
      const error = undefined;

      // Act
      const category = executor.categorizeError(error);

      // Assert
      expect(category).toBe("unknown");
    });

    it("should handle error with multiple keywords (timeout takes priority)", () => {
      // Arrange
      const error = new Error("SDK network permission error");
      error.name = "AbortError";

      // Act
      const category = executor.categorizeError(error);

      // Assert - AbortErrorは最優先で timeout として判定される
      expect(category).toBe("timeout");
    });

    it("should handle error with permission keyword first", () => {
      // Arrange
      const error = new Error("permission denied by SDK");

      // Act
      const category = executor.categorizeError(error);

      // Assert - permission が先にマッチする
      expect(category).toBe("permission_denied");
    });

    it("should handle Error subclass", () => {
      // Arrange
      class CustomError extends Error {
        override name = "CustomError";
      }
      const error = new CustomError("Custom error message");

      // Act
      const category = executor.categorizeError(error);

      // Assert
      expect(category).toBe("unknown");
    });

    it("should handle object error without message", () => {
      // Arrange
      const error = { code: 500, status: "error" };

      // Act
      const category = executor.categorizeError(error);

      // Assert
      expect(category).toBe("unknown");
    });

    it("should handle error with empty message", () => {
      // Arrange
      const error = new Error("");

      // Act
      const category = executor.categorizeError(error);

      // Assert
      expect(category).toBe("unknown");
    });
  });

  describe("isRetryable - Edge cases", () => {
    it("should handle string error", () => {
      // Arrange
      const error = "network error";

      // Act
      const result = executor.isRetryable(error);

      // Assert - 文字列はErrorインスタンスではないためfalse
      expect(result).toBe(false);
    });

    it("should handle null error", () => {
      // Arrange
      const error = null;

      // Act
      const result = executor.isRetryable(error);

      // Assert
      expect(result).toBe(false);
    });

    it("should handle undefined error", () => {
      // Arrange
      const error = undefined;

      // Act
      const result = executor.isRetryable(error);

      // Assert
      expect(result).toBe(false);
    });

    it("should handle error with partial keyword match (networking)", () => {
      // Arrange
      const error = new Error("networking issue");

      // Act
      const result = executor.isRetryable(error);

      // Assert - "network" を含むのでリトライ可能
      expect(result).toBe(true);
    });

    it("should handle mixed case keywords", () => {
      // Arrange
      const error = new Error("NETWORK connection failed");

      // Act
      const result = executor.isRetryable(error);

      // Assert - 小文字変換後にマッチ
      expect(result).toBe(true);
    });

    it("should handle Error subclass with retryable message", () => {
      // Arrange
      class NetworkError extends Error {
        override name = "NetworkError";
      }
      const error = new NetworkError("network timeout occurred");

      // Act
      const result = executor.isRetryable(error);

      // Assert
      expect(result).toBe(true);
    });

    it("should handle object error", () => {
      // Arrange
      const error = { message: "network error" };

      // Act
      const result = executor.isRetryable(error);

      // Assert - Errorインスタンスではないためfalse
      expect(result).toBe(false);
    });
  });
});
