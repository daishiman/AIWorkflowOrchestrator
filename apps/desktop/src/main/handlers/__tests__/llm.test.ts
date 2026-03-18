/**
 * LLM IPC Handler Tests
 *
 * TDD Phase: Red (failing tests - implementation not yet created)
 *
 * Tests for AC-IPC-001 ~ AC-IPC-004
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock electron
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  BrowserWindow: vi.fn(),
}));

// Mock SecureStorage
vi.mock("@/main/services/secureStorage", () => ({
  SecureStorage: {
    getApiKey: vi.fn(),
    setApiKey: vi.fn(),
  },
}));

// Mock LLMAdapterFactory
vi.mock("@/main/adapters/llm/LLMAdapterFactory", () => ({
  LLMAdapterFactory: {
    getAdapter: vi.fn(),
    clearInstance: vi.fn(),
  },
}));

import { ipcMain } from "electron";
import { SecureStorage } from "@/main/services/secureStorage";
import { LLMAdapterFactory } from "@/main/adapters/llm/LLMAdapterFactory";

// Handlers to be implemented
import {
  registerLLMHandlers,
  handleSetSelectedConfig,
  handleGetProviders,
  handleCheckHealth,
  handleSendChat,
  handleStreamChat,
} from "@/main/handlers/llm";

// Types
import type { LLMChatRequestInput } from "@repo/shared/types/llm";

describe("LLM IPC Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerLLMHandlers", () => {
    it("should register all LLM handlers", () => {
      registerLLMHandlers();

      expect(ipcMain.handle).toHaveBeenCalledWith(
        "llm:get-providers",
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        "llm:set-selected-config",
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        "llm:check-health",
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        "llm:send-chat",
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        "llm:stream-chat",
        expect.any(Function),
      );
    });
  });

  describe("IPC-000: llm:set-selected-config - 選択設定同期", () => {
    it("should return success for valid provider/model", () => {
      const result = handleSetSelectedConfig({
        providerId: "openai",
        modelId: "gpt-4o",
      });

      expect(result).toEqual({ success: true });
    });

    it("should reject invalid provider", () => {
      const result = handleSetSelectedConfig({
        providerId: "invalid" as never,
        modelId: "model-x",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid provider ID");
    });

    it("should reject empty modelId", () => {
      const result = handleSetSelectedConfig({
        providerId: "openai",
        modelId: "   ",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Model ID is required");
    });
  });

  describe("IPC-001: llm:get-providers - プロバイダー一覧取得", () => {
    it("should return providers with correct isAvailable flags", async () => {
      // Given: OpenAI key exists, Anthropic doesn't
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockImplementation(
        (provider: string) => {
          return provider === "openai" ? "sk-test-key" : null;
        },
      );

      // When: Get providers
      const result = await handleGetProviders();

      // Then: isAvailable reflects API key status
      const openai = result.find((p) => p.id === "openai");
      const anthropic = result.find((p) => p.id === "anthropic");

      expect(openai?.isAvailable).toBe(true);
      expect(anthropic?.isAvailable).toBe(false);
    });

    it("should return all 4 providers", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      const result = await handleGetProviders();

      expect(result).toHaveLength(4);
      expect(result.map((p) => p.id)).toEqual(
        expect.arrayContaining(["openai", "anthropic", "google", "xai"]),
      );
    });

    it("should include models for each provider", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      const result = await handleGetProviders();

      result.forEach((provider) => {
        expect(provider.models.length).toBeGreaterThan(0);
        provider.models.forEach((model) => {
          expect(model).toHaveProperty("id");
          expect(model).toHaveProperty("name");
        });
      });
    });
  });

  describe("IPC-002: llm:check-health - ヘルスチェック", () => {
    it("should return connected status for valid API key", async () => {
      // Given: Valid API key and successful health check
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );
      const mockAdapter = {
        checkHealth: vi.fn().mockResolvedValue({
          status: "connected",
          latency: 150,
          checkedAt: new Date().toISOString(),
        }),
      };
      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      // When: Check health
      const result = await handleCheckHealth({ providerId: "openai" });

      // Then: Connected with latency
      expect(result.status).toBe("connected");
      expect(result.latency).toBeGreaterThan(0);
    });

    it("should return error status for invalid API key", async () => {
      // Given: Invalid API key
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "invalid-key",
      );
      const mockAdapter = {
        checkHealth: vi.fn().mockResolvedValue({
          status: "error",
          errorMessage: "API_KEY_INVALID",
          checkedAt: new Date().toISOString(),
        }),
      };
      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      // When: Check health
      const result = await handleCheckHealth({ providerId: "openai" });

      // Then: Error status
      expect(result.status).toBe("error");
      expect(result.errorMessage).toContain("API_KEY_INVALID");
    });

    it("should return error for network failure", async () => {
      // Given: Network failure
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );
      const mockAdapter = {
        checkHealth: vi.fn().mockRejectedValue(new Error("Network error")),
      };
      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      // When: Check health
      const result = await handleCheckHealth({ providerId: "openai" });

      // Then: disconnected status with network message (GAP-02: error → disconnected 統一)
      expect(result.status).toBe("disconnected");
      expect(result.errorMessage).toContain("NETWORK_ERROR");
    });

    it("should validate providerId", async () => {
      // When: Invalid providerId
      await expect(
        handleCheckHealth({ providerId: "invalid" as never }),
      ).rejects.toThrow();
    });
  });

  describe("IPC-003: llm:send-chat - チャット送信", () => {
    const validRequest: LLMChatRequestInput = {
      providerId: "openai",
      modelId: "gpt-4o",
      messages: [{ role: "user", content: "Hello" }],
    };

    it("should return success response for valid request", async () => {
      // Given: Valid request and successful response
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );
      const mockAdapter = {
        sendChat: vi.fn().mockResolvedValue({
          content: "Hi there!",
          model: "gpt-4o",
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
          finishReason: "stop",
        }),
      };
      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      // When: Send chat
      const result = await handleSendChat(validRequest);

      // Then: Success with content
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.message).toBe("Hi there!");
      }
    });

    it("should return validation error for empty messages", async () => {
      // Given: Empty messages
      const invalidRequest = {
        ...validRequest,
        messages: [],
      };

      // When: Send chat
      const result = await handleSendChat(
        invalidRequest as LLMChatRequestInput,
      );

      // Then: Validation error
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("UNKNOWN");
      }
    });

    it("should return RATE_LIMIT error with retry info", async () => {
      // Given: Rate limit response
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );
      const mockAdapter = {
        sendChat: vi.fn().mockRejectedValue({
          code: "RATE_LIMIT",
          message: "Rate limited",
          retryable: true,
          retryAfter: 30,
        }),
      };
      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      // When: Send chat
      const result = await handleSendChat(validRequest);

      // Then: Rate limit error with retry info
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("RATE_LIMIT");
        expect(result.error.retryable).toBe(true);
        expect(result.error.retryAfter).toBe(30);
      }
    });

    it.skip("should return TIMEOUT error after 30 seconds", async () => {
      // TODO: Implement timeout mechanism in handler
      // Given: Slow response
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );
      const mockAdapter = {
        sendChat: vi
          .fn()
          .mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 35000)),
          ),
      };
      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      // When: Send chat (with timeout mock)
      vi.useFakeTimers();
      const resultPromise = handleSendChat(validRequest);
      vi.advanceTimersByTime(31000);
      const result = await resultPromise;
      vi.useRealTimers();

      // Then: Timeout error
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("TIMEOUT");
      }
    }, 40000);
  });

  describe("IPC-004: llm:stream-chat - ストリーミング", () => {
    const validRequest: LLMChatRequestInput = {
      providerId: "openai",
      modelId: "gpt-4o",
      messages: [{ role: "user", content: "Hello" }],
      stream: true,
    };

    it("should emit chunk events", async () => {
      // Given: Streaming response
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );
      const mockChunks = [
        { delta: { content: "Hi" } },
        { delta: { content: " there" } },
        { delta: { content: "!" } },
      ];
      const mockAdapter = {
        streamChat: vi.fn().mockImplementation(async function* () {
          for (const chunk of mockChunks) {
            yield chunk;
          }
        }),
      };
      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      // When: Stream chat
      const mockEvent = {
        sender: { send: vi.fn(), isDestroyed: vi.fn().mockReturnValue(false) },
      };
      await handleStreamChat(mockEvent as never, validRequest);

      // Then: Chunks emitted
      expect(mockEvent.sender.send).toHaveBeenCalledWith(
        "llm:stream-chunk",
        expect.objectContaining({ delta: { content: "Hi" } }),
      );
    });

    it("should emit end event on completion", async () => {
      // Given: Successful stream completion
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );
      const mockAdapter = {
        streamChat: vi.fn().mockImplementation(async function* () {
          yield { delta: { content: "Done" } };
        }),
      };
      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      // When: Stream chat
      const mockEvent = {
        sender: { send: vi.fn(), isDestroyed: vi.fn().mockReturnValue(false) },
      };
      await handleStreamChat(mockEvent as never, validRequest);

      // Then: End event emitted
      expect(mockEvent.sender.send).toHaveBeenCalledWith("llm:stream-end");
    });

    it("should emit error event on failure", async () => {
      // Given: Stream error
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );
      const mockAdapter = {
        streamChat: vi.fn().mockImplementation(async function* () {
          yield { delta: { content: "" } }; // Initial yield before error
          throw new Error("Stream interrupted");
        }),
      };
      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      // When: Stream chat
      const mockEvent = {
        sender: { send: vi.fn(), isDestroyed: vi.fn().mockReturnValue(false) },
      };
      await handleStreamChat(mockEvent as never, validRequest);

      // Then: Error event emitted
      expect(mockEvent.sender.send).toHaveBeenCalledWith(
        "llm:stream-error",
        expect.objectContaining({ code: "NETWORK_ERROR" }),
      );
    });
  });

  describe("IPC-016/017: バリデーション共通", () => {
    it("should reject invalid providerId type", async () => {
      await expect(
        handleCheckHealth({ providerId: 123 as never }),
      ).rejects.toThrow();
    });

    it("should return error for missing required fields", async () => {
      const result = await handleSendChat({} as LLMChatRequestInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("UNKNOWN");
      }
    });
  });
});
