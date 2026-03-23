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

    it("should return all 5 providers", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      const result = await handleGetProviders();

      expect(result).toHaveLength(5);
      expect(result.map((p) => p.id)).toEqual(
        expect.arrayContaining([
          "openai",
          "anthropic",
          "google",
          "xai",
          "openrouter",
        ]),
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

describe("PROVIDER_CONFIGS - モデル定義更新検証（TASK-LLM-MOD-01）", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(SecureStorage.getApiKey).mockResolvedValue("test-api-key");
  });

  describe("T-01: OpenAI モデル定義", () => {
    it("should include gpt-5.4 as default model", async () => {
      const providers = await handleGetProviders();
      const openai = providers.find((p) => p.id === "openai");
      expect(openai).toBeDefined();
      const defaultModel = openai?.models.find((m) => m.isDefault);
      expect(defaultModel).toBeDefined();
      expect(defaultModel?.id).toBe("gpt-5.4");
    });

    it("should include all 6 new OpenAI models", async () => {
      const providers = await handleGetProviders();
      const openai = providers.find((p) => p.id === "openai");
      expect(openai).toBeDefined();
      const modelIds = openai?.models.map((m) => m.id);
      expect(modelIds).toContain("gpt-5.4");
      expect(modelIds).toContain("gpt-5.4-mini");
      expect(modelIds).toContain("gpt-5.4-nano");
      expect(modelIds).toContain("gpt-5.4-pro");
      expect(modelIds).toContain("o3");
      expect(modelIds).toContain("o4-mini");
    });

    it("should not include legacy OpenAI models", async () => {
      const providers = await handleGetProviders();
      const openai = providers.find((p) => p.id === "openai");
      expect(openai).toBeDefined();
      const modelIds = openai?.models.map((m) => m.id);
      expect(modelIds).not.toContain("gpt-4o");
      expect(modelIds).not.toContain("gpt-4o-mini");
      expect(modelIds).not.toContain("gpt-4-turbo");
    });

    it("should set gpt-5.4 contextWindow to 1050000", async () => {
      const providers = await handleGetProviders();
      const openai = providers.find((p) => p.id === "openai");
      expect(openai).toBeDefined();
      const model = openai?.models.find((m) => m.id === "gpt-5.4");
      expect(model).toBeDefined();
      expect(model?.contextWindow).toBe(1050000);
    });

    it("should set o3 contextWindow to 200000", async () => {
      const providers = await handleGetProviders();
      const openai = providers.find((p) => p.id === "openai");
      expect(openai).toBeDefined();
      const model = openai?.models.find((m) => m.id === "o3");
      expect(model).toBeDefined();
      expect(model?.contextWindow).toBe(200000);
    });

    it("should set o4-mini contextWindow to 200000", async () => {
      const providers = await handleGetProviders();
      const openai = providers.find((p) => p.id === "openai");
      expect(openai).toBeDefined();
      const model = openai?.models.find((m) => m.id === "o4-mini");
      expect(model).toBeDefined();
      expect(model?.contextWindow).toBe(200000);
    });
  });

  describe("T-02: Anthropic モデル定義", () => {
    it("should include claude-sonnet-4-6 as default model", async () => {
      const providers = await handleGetProviders();
      const anthropic = providers.find((p) => p.id === "anthropic");
      expect(anthropic).toBeDefined();
      const defaultModel = anthropic?.models.find((m) => m.isDefault);
      expect(defaultModel).toBeDefined();
      expect(defaultModel?.id).toBe("claude-sonnet-4-6");
    });

    it("should include all 3 new Anthropic models", async () => {
      const providers = await handleGetProviders();
      const anthropic = providers.find((p) => p.id === "anthropic");
      expect(anthropic).toBeDefined();
      const modelIds = anthropic?.models.map((m) => m.id);
      expect(modelIds).toContain("claude-sonnet-4-6");
      expect(modelIds).toContain("claude-opus-4-6");
      expect(modelIds).toContain("claude-haiku-4-5");
    });

    it("should not include legacy Anthropic models", async () => {
      const providers = await handleGetProviders();
      const anthropic = providers.find((p) => p.id === "anthropic");
      expect(anthropic).toBeDefined();
      const modelIds = anthropic?.models.map((m) => m.id);
      expect(modelIds).not.toContain("claude-3-5-sonnet-20241022");
      expect(modelIds).not.toContain("claude-3-opus-20240229");
      expect(modelIds).not.toContain("claude-3-haiku-20240307");
    });
  });

  describe("T-03: Google モデル定義", () => {
    it("should include gemini-3-flash-preview as default model", async () => {
      const providers = await handleGetProviders();
      const google = providers.find((p) => p.id === "google");
      expect(google).toBeDefined();
      const defaultModel = google?.models.find((m) => m.isDefault);
      expect(defaultModel).toBeDefined();
      expect(defaultModel?.id).toBe("gemini-3-flash-preview");
    });

    it("should include all 3 new Google models", async () => {
      const providers = await handleGetProviders();
      const google = providers.find((p) => p.id === "google");
      expect(google).toBeDefined();
      const modelIds = google?.models.map((m) => m.id);
      expect(modelIds).toContain("gemini-3-flash-preview");
      expect(modelIds).toContain("gemini-3.1-pro-preview");
      expect(modelIds).toContain("gemini-3.1-flash-lite-preview");
    });

    it("should not include legacy Google models", async () => {
      const providers = await handleGetProviders();
      const google = providers.find((p) => p.id === "google");
      expect(google).toBeDefined();
      const modelIds = google?.models.map((m) => m.id);
      expect(modelIds).not.toContain("gemini-1.5-pro");
      expect(modelIds).not.toContain("gemini-1.5-flash");
    });
  });

  describe("T-04: xAI モデル定義", () => {
    it("should include grok-4-1-fast-non-reasoning as default model", async () => {
      const providers = await handleGetProviders();
      const xai = providers.find((p) => p.id === "xai");
      expect(xai).toBeDefined();
      const defaultModel = xai?.models.find((m) => m.isDefault);
      expect(defaultModel).toBeDefined();
      expect(defaultModel?.id).toBe("grok-4-1-fast-non-reasoning");
    });

    it("should include all 3 new xAI models", async () => {
      const providers = await handleGetProviders();
      const xai = providers.find((p) => p.id === "xai");
      expect(xai).toBeDefined();
      const modelIds = xai?.models.map((m) => m.id);
      expect(modelIds).toContain("grok-4-1-fast-non-reasoning");
      expect(modelIds).toContain("grok-3-mini");
      expect(modelIds).toContain("grok-4-1-fast-reasoning");
    });

    it("should not include legacy xAI models", async () => {
      const providers = await handleGetProviders();
      const xai = providers.find((p) => p.id === "xai");
      expect(xai).toBeDefined();
      const modelIds = xai?.models.map((m) => m.id);
      expect(modelIds).not.toContain("grok-beta");
    });
  });

  describe("T-05: description フィールド", () => {
    it("should have non-empty description for all new models in all providers", async () => {
      const providers = await handleGetProviders();
      const targetProviders = ["openai", "anthropic", "google", "xai"];
      for (const providerId of targetProviders) {
        const provider = providers.find((p) => p.id === providerId);
        expect(provider).toBeDefined();
        for (const model of provider?.models ?? []) {
          expect(
            "description" in model && typeof model.description === "string",
            `provider ${providerId}, model ${model.id} の description が undefined`,
          ).toBe(true);
          expect(
            "description" in model
              ? (model.description as string).trim().length
              : 0,
            `provider ${providerId}, model ${model.id} の description が空文字列`,
          ).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("T-06: isDefault 一意性", () => {
    it("should have exactly one default model per provider", async () => {
      const providers = await handleGetProviders();
      for (const provider of providers) {
        const defaultModels = provider.models.filter((m) => m.isDefault);
        expect(
          defaultModels.length,
          `provider ${provider.id} の isDefault: true が ${defaultModels.length} 個`,
        ).toBe(1);
      }
    });
  });
});

describe("inferProviderId - 新パターン検証（TASK-LLM-MOD-01）", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("T-07: o3/o4 プレフィックスの OpenAI 解決", () => {
    it("should resolve o3 model to openai provider via handleSendChat", async () => {
      vi.mocked(SecureStorage.getApiKey).mockResolvedValue("test-api-key");
      const mockAdapter = {
        sendChat: vi.fn().mockResolvedValue({
          content: "test",
          model: "o3",
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
          finishReason: "stop",
        }),
        checkHealth: vi.fn(),
        streamChat: vi.fn(),
      };
      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(
        mockAdapter as never,
      );

      const result = await handleSendChat({
        messages: [{ role: "user", content: "test" }],
        modelId: "o3",
      });

      expect(result.success).toBe(true);
      expect(LLMAdapterFactory.getAdapter).toHaveBeenCalledWith("openai");
    });

    it("should resolve o4-mini model to openai provider via handleSendChat", async () => {
      vi.mocked(SecureStorage.getApiKey).mockResolvedValue("test-api-key");
      const mockAdapter = {
        sendChat: vi.fn().mockResolvedValue({
          content: "test",
          model: "o4-mini",
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
          finishReason: "stop",
        }),
        checkHealth: vi.fn(),
        streamChat: vi.fn(),
      };
      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(
        mockAdapter as never,
      );

      const result = await handleSendChat({
        messages: [{ role: "user", content: "test" }],
        modelId: "o4-mini",
      });

      expect(result.success).toBe(true);
      expect(LLMAdapterFactory.getAdapter).toHaveBeenCalledWith("openai");
    });
  });

  describe("T-08: 既存パターンの継続動作確認", () => {
    it("should still resolve claude- prefix to anthropic", async () => {
      vi.mocked(SecureStorage.getApiKey).mockResolvedValue("test-api-key");
      const mockAdapter = {
        sendChat: vi.fn().mockResolvedValue({
          content: "test",
          model: "claude-sonnet-4-6",
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
          finishReason: "stop",
        }),
        checkHealth: vi.fn(),
        streamChat: vi.fn(),
      };
      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(
        mockAdapter as never,
      );

      await handleSendChat({
        messages: [{ role: "user", content: "test" }],
        modelId: "claude-sonnet-4-6",
      });

      expect(LLMAdapterFactory.getAdapter).toHaveBeenCalledWith("anthropic");
    });

    it("should still resolve gemini- prefix to google", async () => {
      vi.mocked(SecureStorage.getApiKey).mockResolvedValue("test-api-key");
      const mockAdapter = {
        sendChat: vi.fn().mockResolvedValue({
          content: "test",
          model: "gemini-3-flash-preview",
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
          finishReason: "stop",
        }),
        checkHealth: vi.fn(),
        streamChat: vi.fn(),
      };
      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(
        mockAdapter as never,
      );

      await handleSendChat({
        messages: [{ role: "user", content: "test" }],
        modelId: "gemini-3-flash-preview",
      });

      expect(LLMAdapterFactory.getAdapter).toHaveBeenCalledWith("google");
    });
  });
});

describe("PROVIDER_CONFIGS - 拡充テスト（TASK-LLM-MOD-01）", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(SecureStorage.getApiKey).mockResolvedValue("test-api-key");
  });

  describe("T-09: OpenRouter 維持確認", () => {
    it("should keep OpenRouter models unchanged", async () => {
      const providers = await handleGetProviders();
      const openrouter = providers.find((p) => p.id === "openrouter");
      expect(openrouter).toBeDefined();
      const modelIds = openrouter?.models.map((m) => m.id);
      expect(modelIds).toContain("openai/gpt-4o");
      expect(modelIds).toContain("anthropic/claude-3.5-sonnet");
      expect(modelIds).toContain("google/gemini-pro-1.5");
      expect(modelIds).toContain("meta-llama/llama-3.1-405b-instruct");
      expect(openrouter?.models).toHaveLength(4);
    });

    it("should keep OpenRouter default model unchanged", async () => {
      const providers = await handleGetProviders();
      const openrouter = providers.find((p) => p.id === "openrouter");
      expect(openrouter).toBeDefined();
      const defaultModel = openrouter?.models.find((m) => m.isDefault);
      expect(defaultModel).toBeDefined();
      expect(defaultModel?.id).toBe("openai/gpt-4o");
    });
  });

  describe("T-10: contextWindow 精度確認", () => {
    it("should set gpt-5.4-mini contextWindow to 1050000", async () => {
      const providers = await handleGetProviders();
      const openai = providers.find((p) => p.id === "openai");
      expect(openai).toBeDefined();
      const model = openai?.models.find((m) => m.id === "gpt-5.4-mini");
      expect(model).toBeDefined();
      expect(model?.contextWindow).toBe(1050000);
    });

    it("should set gpt-5.4-nano contextWindow to 1050000", async () => {
      const providers = await handleGetProviders();
      const openai = providers.find((p) => p.id === "openai");
      expect(openai).toBeDefined();
      const model = openai?.models.find((m) => m.id === "gpt-5.4-nano");
      expect(model).toBeDefined();
      expect(model?.contextWindow).toBe(1050000);
    });

    it("should set claude-opus-4-6 contextWindow to 200000", async () => {
      const providers = await handleGetProviders();
      const anthropic = providers.find((p) => p.id === "anthropic");
      expect(anthropic).toBeDefined();
      const model = anthropic?.models.find((m) => m.id === "claude-opus-4-6");
      expect(model).toBeDefined();
      expect(model?.contextWindow).toBe(200000);
    });

    it("should set claude-haiku-4-5 contextWindow to 200000", async () => {
      const providers = await handleGetProviders();
      const anthropic = providers.find((p) => p.id === "anthropic");
      expect(anthropic).toBeDefined();
      const model = anthropic?.models.find((m) => m.id === "claude-haiku-4-5");
      expect(model).toBeDefined();
      expect(model?.contextWindow).toBe(200000);
    });

    it("should set gemini-3.1-pro-preview contextWindow to 1048576", async () => {
      const providers = await handleGetProviders();
      const google = providers.find((p) => p.id === "google");
      expect(google).toBeDefined();
      const model = google?.models.find(
        (m) => m.id === "gemini-3.1-pro-preview",
      );
      expect(model).toBeDefined();
      expect(model?.contextWindow).toBe(1048576);
    });

    it("should set gemini-3.1-flash-lite-preview contextWindow to 1048576", async () => {
      const providers = await handleGetProviders();
      const google = providers.find((p) => p.id === "google");
      expect(google).toBeDefined();
      const model = google?.models.find(
        (m) => m.id === "gemini-3.1-flash-lite-preview",
      );
      expect(model).toBeDefined();
      expect(model?.contextWindow).toBe(1048576);
    });

    it("should set grok-3-mini contextWindow to 131072", async () => {
      const providers = await handleGetProviders();
      const xai = providers.find((p) => p.id === "xai");
      expect(xai).toBeDefined();
      const model = xai?.models.find((m) => m.id === "grok-3-mini");
      expect(model).toBeDefined();
      expect(model?.contextWindow).toBe(131072);
    });
  });

  describe("T-11: プロバイダー総数確認", () => {
    it("should return 5 providers", async () => {
      const providers = await handleGetProviders();
      expect(providers).toHaveLength(5);
    });

    it("should return providers in correct order", async () => {
      const providers = await handleGetProviders();
      const ids = providers.map((p) => p.id);
      expect(ids).toEqual([
        "openai",
        "anthropic",
        "google",
        "xai",
        "openrouter",
      ]);
    });
  });

  describe("T-12: モデル数確認", () => {
    it("should return 6 models for OpenAI", async () => {
      const providers = await handleGetProviders();
      const openai = providers.find((p) => p.id === "openai");
      expect(openai).toBeDefined();
      expect(openai?.models).toHaveLength(6);
    });

    it("should return 3 models for Anthropic", async () => {
      const providers = await handleGetProviders();
      const anthropic = providers.find((p) => p.id === "anthropic");
      expect(anthropic).toBeDefined();
      expect(anthropic?.models).toHaveLength(3);
    });

    it("should return 3 models for Google", async () => {
      const providers = await handleGetProviders();
      const google = providers.find((p) => p.id === "google");
      expect(google).toBeDefined();
      expect(google?.models).toHaveLength(3);
    });

    it("should return 3 models for xAI", async () => {
      const providers = await handleGetProviders();
      const xai = providers.find((p) => p.id === "xai");
      expect(xai).toBeDefined();
      expect(xai?.models).toHaveLength(3);
    });
  });

  describe("T-13: handleSendChat での新モデル使用確認", () => {
    it("should accept gpt-5.4 as modelId in handleSendChat", async () => {
      vi.mocked(SecureStorage.getApiKey).mockResolvedValue("test-api-key");
      const mockAdapter = {
        sendChat: vi.fn().mockResolvedValue({
          content: "response",
          model: "gpt-5.4",
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
          finishReason: "stop",
        }),
        checkHealth: vi.fn(),
        streamChat: vi.fn(),
      };
      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(
        mockAdapter as never,
      );

      const result = await handleSendChat({
        messages: [{ role: "user", content: "hello" }],
        modelId: "gpt-5.4",
      });

      expect(result.success).toBe(true);
      expect(LLMAdapterFactory.getAdapter).toHaveBeenCalledWith("openai");
    });

    it("should accept claude-sonnet-4-6 as modelId in handleSendChat", async () => {
      vi.mocked(SecureStorage.getApiKey).mockResolvedValue("test-api-key");
      const mockAdapter = {
        sendChat: vi.fn().mockResolvedValue({
          content: "response",
          model: "claude-sonnet-4-6",
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
          finishReason: "stop",
        }),
        checkHealth: vi.fn(),
        streamChat: vi.fn(),
      };
      vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(
        mockAdapter as never,
      );

      const result = await handleSendChat({
        messages: [{ role: "user", content: "hello" }],
        modelId: "claude-sonnet-4-6",
      });

      expect(result.success).toBe(true);
      expect(LLMAdapterFactory.getAdapter).toHaveBeenCalledWith("anthropic");
    });
  });
});
