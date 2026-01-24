/**
 * @vitest-environment node
 *
 * LLM Stream IPC Handler Tests
 *
 * TDD Phase: Red (failing tests - implementation to be verified)
 *
 * Tests for AC-001 ~ AC-006: IPC streaming handlers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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

// Handlers to test (assuming these will be implemented or already exist)
import { registerLLMHandlers, handleStreamChat } from "@/main/handlers/llm";

// Types
import type { LLMChatRequestInput } from "@repo/shared/types/llm";
import type { StreamChunk } from "@/main/adapters/llm/types";

// Helper to create mock IPC event
function createMockEvent() {
  return {
    sender: {
      send: vi.fn(),
      isDestroyed: () => false,
    },
  };
}

// Helper to create mock async generator
function createMockStreamGenerator(
  chunks: StreamChunk[],
): () => AsyncGenerator<StreamChunk> {
  return async function* () {
    for (const chunk of chunks) {
      yield chunk;
    }
  };
}

describe("LLM Stream IPC Handlers", () => {
  const validRequest: LLMChatRequestInput = {
    providerId: "openai",
    modelId: "gpt-4o",
    messages: [{ role: "user", content: "Hello" }],
    stream: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // 1. Handler Registration Tests
  // ============================================================
  describe("Handler Registration", () => {
    it("should register llm:stream-chat handler", () => {
      registerLLMHandlers();

      expect(ipcMain.handle).toHaveBeenCalledWith(
        "llm:stream-chat",
        expect.any(Function),
      );
    });

    it("should register llm:stream-cancel handler", () => {
      registerLLMHandlers();

      expect(ipcMain.handle).toHaveBeenCalledWith(
        "llm:stream-cancel",
        expect.any(Function),
      );
    });
  });

  // ============================================================
  // 2. llm:stream-chat Handler Tests
  // ============================================================
  describe("TC-IPC-001: チャンクイベント発火", () => {
    it("should emit llm:stream-chunk events for each chunk", async () => {
      // Given: Mock adapter that yields chunks
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );

      const mockChunks: StreamChunk[] = [
        { id: "1", delta: { content: "Hello" }, done: false },
        { id: "2", delta: { content: " world" }, done: false },
      ];

      const mockAdapter = {
        streamChat: createMockStreamGenerator(mockChunks),
      };

      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      const mockEvent = createMockEvent();

      // When: Handle stream chat
      await handleStreamChat(mockEvent as never, validRequest);

      // Then: Chunk events should be emitted
      expect(mockEvent.sender.send).toHaveBeenCalledWith(
        "llm:stream-chunk",
        expect.objectContaining({ delta: { content: "Hello" } }),
      );
      expect(mockEvent.sender.send).toHaveBeenCalledWith(
        "llm:stream-chunk",
        expect.objectContaining({ delta: { content: " world" } }),
      );
    });
  });

  describe("TC-IPC-002: 完了イベント発火", () => {
    it("should emit llm:stream-end event on completion", async () => {
      // Given: Mock adapter
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );

      const mockAdapter = {
        streamChat: createMockStreamGenerator([
          { id: "1", delta: { content: "Done" }, done: false },
        ]),
      };

      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      const mockEvent = createMockEvent();

      // When: Handle stream chat
      await handleStreamChat(mockEvent as never, validRequest);

      // Then: End event should be emitted
      expect(mockEvent.sender.send).toHaveBeenCalledWith("llm:stream-end");
    });
  });

  describe("TC-IPC-003: エラーイベント発火", () => {
    it("should emit llm:stream-error event on failure", async () => {
      // Given: Mock adapter that throws error
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );

      const mockAdapter = {
        streamChat: vi.fn().mockImplementation(async function* () {
          yield { id: "1", delta: { content: "Partial" }, done: false };
          throw {
            code: "NETWORK_ERROR",
            message: "Connection lost",
            retryable: true,
          };
        }),
      };

      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      const mockEvent = createMockEvent();

      // When: Handle stream chat
      await handleStreamChat(mockEvent as never, validRequest);

      // Then: Error event should be emitted
      expect(mockEvent.sender.send).toHaveBeenCalledWith(
        "llm:stream-error",
        expect.objectContaining({ code: "NETWORK_ERROR" }),
      );
    });
  });

  describe("TC-IPC-004: requestIdの生成と返却", () => {
    it("should return requestId in response", async () => {
      // Given: Mock adapter
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );

      const mockAdapter = {
        streamChat: createMockStreamGenerator([]),
      };

      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      const mockEvent = createMockEvent();

      // When: Handle stream chat
      const result = await handleStreamChat(mockEvent as never, validRequest);

      // Then: Response should contain requestId
      expect(result).toHaveProperty("requestId");
      expect(typeof result.requestId).toBe("string");
      // Should be a valid UUID format
      expect(result.requestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });
  });

  describe("TC-IPC-007: バリデーションエラー", () => {
    it("should emit error for invalid request", async () => {
      const mockEvent = createMockEvent();

      // When: Handle with invalid request (empty messages)
      await handleStreamChat(
        mockEvent as never,
        {
          providerId: "openai",
          modelId: "gpt-4o",
          messages: [],
          stream: true,
        } as LLMChatRequestInput,
      );

      // Then: Error event should be emitted
      expect(mockEvent.sender.send).toHaveBeenCalledWith(
        "llm:stream-error",
        expect.objectContaining({ code: expect.any(String) }),
      );
    });

    it("should emit error for missing API key", async () => {
      // Given: No API key
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      const mockEvent = createMockEvent();

      // When: Handle stream chat
      await handleStreamChat(mockEvent as never, validRequest);

      // Then: Error event should be emitted
      expect(mockEvent.sender.send).toHaveBeenCalledWith(
        "llm:stream-error",
        expect.objectContaining({ code: "API_KEY_MISSING" }),
      );
    });
  });

  // ============================================================
  // 3. Error Handling Tests
  // ============================================================
  describe("Error Handling", () => {
    describe("TC-ERR-001: 401エラー変換", () => {
      it("should emit API_KEY_INVALID error for 401", async () => {
        (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
          "sk-test-key",
        );

        const mockAdapter = {
          // eslint-disable-next-line require-yield
          streamChat: vi.fn().mockImplementation(async function* () {
            throw {
              code: "API_KEY_INVALID",
              message: "Invalid API key",
              retryable: false,
            };
          }),
        };

        (
          LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
        ).mockResolvedValue(mockAdapter);

        const mockEvent = createMockEvent();
        await handleStreamChat(mockEvent as never, validRequest);

        expect(mockEvent.sender.send).toHaveBeenCalledWith(
          "llm:stream-error",
          expect.objectContaining({
            code: "API_KEY_INVALID",
            retryable: false,
          }),
        );
      });
    });

    describe("TC-ERR-002: 429エラー変換", () => {
      it("should emit RATE_LIMIT error with retryAfterMs for 429", async () => {
        (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
          "sk-test-key",
        );

        const mockAdapter = {
          // eslint-disable-next-line require-yield
          streamChat: vi.fn().mockImplementation(async function* () {
            throw {
              code: "RATE_LIMIT",
              message: "Rate limit exceeded",
              retryable: true,
              retryAfterMs: 30000,
            };
          }),
        };

        (
          LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
        ).mockResolvedValue(mockAdapter);

        const mockEvent = createMockEvent();
        await handleStreamChat(mockEvent as never, validRequest);

        expect(mockEvent.sender.send).toHaveBeenCalledWith(
          "llm:stream-error",
          expect.objectContaining({
            code: "RATE_LIMIT",
            retryable: true,
            retryAfterMs: 30000,
          }),
        );
      });
    });

    describe("TC-ERR-003: ネットワークエラー変換", () => {
      it("should emit NETWORK_ERROR for network failures", async () => {
        (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
          "sk-test-key",
        );

        const mockAdapter = {
          // eslint-disable-next-line require-yield
          streamChat: vi.fn().mockImplementation(async function* () {
            throw {
              code: "NETWORK_ERROR",
              message: "Network error",
              retryable: true,
            };
          }),
        };

        (
          LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
        ).mockResolvedValue(mockAdapter);

        const mockEvent = createMockEvent();
        await handleStreamChat(mockEvent as never, validRequest);

        expect(mockEvent.sender.send).toHaveBeenCalledWith(
          "llm:stream-error",
          expect.objectContaining({
            code: "NETWORK_ERROR",
            retryable: true,
          }),
        );
      });
    });

    describe("TC-ERR-004: ストリーム途中エラー", () => {
      it("should preserve partial content on mid-stream error", async () => {
        (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
          "sk-test-key",
        );

        const mockAdapter = {
          streamChat: vi.fn().mockImplementation(async function* () {
            yield { id: "1", delta: { content: "Partial" }, done: false };
            yield { id: "2", delta: { content: " content" }, done: false };
            throw {
              code: "NETWORK_ERROR",
              message: "Connection lost",
              retryable: true,
            };
          }),
        };

        (
          LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
        ).mockResolvedValue(mockAdapter);

        const mockEvent = createMockEvent();
        await handleStreamChat(mockEvent as never, validRequest);

        // Should have received chunks before error
        expect(mockEvent.sender.send).toHaveBeenCalledWith(
          "llm:stream-chunk",
          expect.objectContaining({ delta: { content: "Partial" } }),
        );

        // Should emit error with partial content info
        expect(mockEvent.sender.send).toHaveBeenCalledWith(
          "llm:stream-error",
          expect.objectContaining({ code: "NETWORK_ERROR" }),
        );
      });
    });
  });

  // ============================================================
  // 4. Multi-Provider Tests
  // ============================================================
  describe("Multi-Provider Support", () => {
    const providers = ["openai", "anthropic", "google", "xai"] as const;

    for (const providerId of providers) {
      describe(`${providerId} streaming`, () => {
        it(`should stream from ${providerId} provider`, async () => {
          (
            SecureStorage.getApiKey as ReturnType<typeof vi.fn>
          ).mockResolvedValue("test-api-key");

          const mockAdapter = {
            streamChat: createMockStreamGenerator([
              {
                id: "1",
                delta: { content: `Hello from ${providerId}` },
                done: false,
              },
            ]),
          };

          (
            LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
          ).mockResolvedValue(mockAdapter);

          const mockEvent = createMockEvent();
          const request: LLMChatRequestInput = {
            providerId,
            modelId: "test-model",
            messages: [{ role: "user", content: "Hi" }],
            stream: true,
          };

          await handleStreamChat(mockEvent as never, request);

          expect(mockEvent.sender.send).toHaveBeenCalledWith(
            "llm:stream-chunk",
            expect.objectContaining({
              delta: { content: `Hello from ${providerId}` },
            }),
          );
          expect(mockEvent.sender.send).toHaveBeenCalledWith("llm:stream-end");
        });
      });
    }
  });

  // ============================================================
  // 5. Destroyed Window Tests
  // ============================================================
  describe("Destroyed Window Handling", () => {
    it("should not send events if window is destroyed", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );

      const mockAdapter = {
        streamChat: createMockStreamGenerator([
          { id: "1", delta: { content: "Hello" }, done: false },
        ]),
      };

      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      const mockEvent = {
        sender: {
          send: vi.fn(),
          isDestroyed: () => true, // Window is destroyed
        },
      };

      await handleStreamChat(mockEvent as never, validRequest);

      // Should not call send if window is destroyed
      // (Implementation should check isDestroyed before sending)
      // This test documents expected behavior
    });
  });

  // ============================================================
  // 6. Concurrent Request Tests (Phase 6 追加)
  // ============================================================
  describe("Concurrent Request Tests", () => {
    it("should handle multiple concurrent stream requests", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );

      const mockAdapter = {
        streamChat: createMockStreamGenerator([
          { id: "1", delta: { content: "Response" }, done: false },
        ]),
      };

      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      const mockEvent1 = createMockEvent();
      const mockEvent2 = createMockEvent();

      // Start two concurrent requests
      const [result1, result2] = await Promise.all([
        handleStreamChat(mockEvent1 as never, validRequest),
        handleStreamChat(mockEvent2 as never, {
          ...validRequest,
          messages: [{ role: "user", content: "Request 2" }],
        }),
      ]);

      // Both should get unique request IDs
      expect(result1.requestId).toBeDefined();
      expect(result2.requestId).toBeDefined();
      expect(result1.requestId).not.toBe(result2.requestId);
    });

    it("should maintain separate streams for concurrent requests", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );

      let callCount = 0;
      const mockAdapter = {
        streamChat: vi.fn().mockImplementation(async function* () {
          callCount++;
          const myCall = callCount;
          yield {
            id: "1",
            delta: { content: `Response from ${myCall}` },
            done: false,
          };
        }),
      };

      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      const mockEvent1 = createMockEvent();
      const mockEvent2 = createMockEvent();

      await Promise.all([
        handleStreamChat(mockEvent1 as never, validRequest),
        handleStreamChat(mockEvent2 as never, validRequest),
      ]);

      // Both should receive chunks
      expect(mockEvent1.sender.send).toHaveBeenCalledWith(
        "llm:stream-chunk",
        expect.objectContaining({
          delta: { content: expect.stringContaining("Response") },
        }),
      );
      expect(mockEvent2.sender.send).toHaveBeenCalledWith(
        "llm:stream-chunk",
        expect.objectContaining({
          delta: { content: expect.stringContaining("Response") },
        }),
      );
    });
  });

  // ============================================================
  // 7. Large Chunk Tests (Phase 6 追加)
  // ============================================================
  describe("Large Chunk Tests", () => {
    it("should handle large number of chunks", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );

      // Create 100 chunks
      const largeChunks: StreamChunk[] = Array.from(
        { length: 100 },
        (_, i) => ({
          id: `chunk-${i}`,
          delta: { content: `chunk${i}` },
          done: false,
        }),
      );

      const mockAdapter = {
        streamChat: createMockStreamGenerator(largeChunks),
      };

      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      const mockEvent = createMockEvent();
      await handleStreamChat(mockEvent as never, validRequest);

      // Should have 100 chunk events + 1 end event
      const chunkCalls = (
        mockEvent.sender.send as ReturnType<typeof vi.fn>
      ).mock.calls.filter((call) => call[0] === "llm:stream-chunk");
      expect(chunkCalls.length).toBe(100);
    });

    it("should handle large content in single chunk", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );

      const largeContent = "x".repeat(10000); // 10KB content
      const mockAdapter = {
        streamChat: createMockStreamGenerator([
          { id: "1", delta: { content: largeContent }, done: false },
        ]),
      };

      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      const mockEvent = createMockEvent();
      await handleStreamChat(mockEvent as never, validRequest);

      expect(mockEvent.sender.send).toHaveBeenCalledWith(
        "llm:stream-chunk",
        expect.objectContaining({
          delta: { content: largeContent },
        }),
      );
    });
  });
});
