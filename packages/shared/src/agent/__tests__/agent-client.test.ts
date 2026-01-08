/**
 * Agent Client Tests
 * Phase 4: TDD Red - All tests should fail until implementation
 *
 * Tests for AgentClient SDK integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AgentClient } from "../agent-client";
import {
  AgentInitializationError,
  AgentQueryError,
  AgentTimeoutError,
  AgentAbortedError,
} from "../errors";
import type { SDKMessage, AgentClientConfig } from "../types";

// Mock the Claude Agent SDK
vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    query: vi.fn(),
    abort: vi.fn(),
  })),
}));

describe("AgentClient", () => {
  let client: AgentClient;
  const mockConfig: AgentClientConfig = {
    apiKey: "test-api-key",
    defaultTimeout: 30000,
    maxRetries: 3,
    initialRetryDelay: 1000,
    maxRetryDelay: 4000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("constructor", () => {
    it("should initialize with valid config", () => {
      expect(() => new AgentClient(mockConfig)).not.toThrow();
    });

    it("should throw AgentInitializationError for missing API key", () => {
      expect(() => new AgentClient({ ...mockConfig, apiKey: "" })).toThrowError(
        AgentInitializationError,
      );
    });

    it("should use default values for optional config", () => {
      const client = new AgentClient({ apiKey: "test-key" });
      expect(client.getConfig().defaultTimeout).toBe(30000);
      expect(client.getConfig().maxRetries).toBe(3);
    });
  });

  describe("getStatus", () => {
    it("should return not_initialized before initialization", () => {
      client = new AgentClient(mockConfig);
      const status = client.getStatus();
      expect(status.status).toBe("not_initialized");
    });

    it("should return initialized after successful init", async () => {
      client = new AgentClient(mockConfig);
      await client.initialize();
      const status = client.getStatus();
      expect(status.status).toBe("initialized");
    });

    it("should return error status on initialization failure", async () => {
      // Mock SDK to throw on initialization
      const SDK = await import("@anthropic-ai/claude-agent-sdk");
      vi.mocked(SDK.default).mockImplementationOnce(() => {
        throw new Error("SDK init failed");
      });

      client = new AgentClient(mockConfig);
      try {
        await client.initialize();
      } catch {
        // Expected
      }

      const status = client.getStatus();
      expect(status.status).toBe("error");
      expect(status.error).toBeDefined();
    });

    it("should include timestamp in status", () => {
      client = new AgentClient(mockConfig);
      const status = client.getStatus();
      expect(status.timestamp).toBeDefined();
      expect(typeof status.timestamp).toBe("number");
    });
  });

  describe("initialize", () => {
    it("should initialize SDK successfully", async () => {
      client = new AgentClient(mockConfig);
      await expect(client.initialize()).resolves.not.toThrow();
    });

    it("should throw AgentInitializationError on SDK failure", async () => {
      const SDK = await import("@anthropic-ai/claude-agent-sdk");
      vi.mocked(SDK.default).mockImplementationOnce(() => {
        throw new Error("Invalid API key");
      });

      client = new AgentClient(mockConfig);
      await expect(client.initialize()).rejects.toThrowError(
        AgentInitializationError,
      );
    });

    it("should only initialize once", async () => {
      const SDK = await import("@anthropic-ai/claude-agent-sdk");
      client = new AgentClient(mockConfig);

      await client.initialize();
      await client.initialize();

      expect(SDK.default).toHaveBeenCalledTimes(1);
    });
  });

  describe("query", () => {
    let mockOnMessage: (message: SDKMessage) => void;

    beforeEach(async () => {
      mockOnMessage = vi.fn();
      client = new AgentClient(mockConfig);
      await client.initialize();
    });

    it("should throw AgentInitializationError when SDK not initialized", async () => {
      const uninitializedClient = new AgentClient(mockConfig);
      // Don't call initialize()

      await expect(
        uninitializedClient.query("Hello", vi.fn()),
      ).rejects.toThrowError(AgentInitializationError);
    });

    it("should execute query successfully", async () => {
      const SDK = await import("@anthropic-ai/claude-agent-sdk");
      const mockQuery = vi.fn().mockResolvedValue({
        id: "response-id",
        messages: [
          {
            id: "msg-1",
            type: "text",
            content: "Hello!",
            timestamp: Date.now(),
            isComplete: false,
          },
          {
            id: "msg-2",
            type: "complete",
            content: "",
            timestamp: Date.now(),
            isComplete: true,
          },
        ],
      });

      vi.mocked(SDK.default).mockImplementation(() => ({
        query: mockQuery,
        abort: vi.fn(),
      }));

      // Re-initialize with new mock
      client = new AgentClient(mockConfig);
      await client.initialize();

      await client.query("Hello", mockOnMessage);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: "Hello",
        }),
        expect.any(Function),
      );
    });

    it("should call onMessage callback for each message", async () => {
      const SDK = await import("@anthropic-ai/claude-agent-sdk");
      const messages: SDKMessage[] = [
        {
          id: "msg-1",
          type: "text",
          content: "Hello",
          timestamp: Date.now(),
          isComplete: false,
        },
        {
          id: "msg-2",
          type: "complete",
          content: "",
          timestamp: Date.now(),
          isComplete: true,
        },
      ];

      vi.mocked(SDK.default).mockImplementation(() => ({
        query: vi.fn().mockImplementation(async (_options, callback) => {
          for (const msg of messages) {
            callback?.(msg);
          }
          return { id: "response-id", messages };
        }),
        abort: vi.fn(),
      }));

      client = new AgentClient(mockConfig);
      await client.initialize();

      await client.query("Hello", mockOnMessage);

      expect(mockOnMessage).toHaveBeenCalledTimes(2);
    });

    it("should throw AgentQueryError on SDK query failure", async () => {
      const SDK = await import("@anthropic-ai/claude-agent-sdk");
      vi.mocked(SDK.default).mockImplementation(() => ({
        query: vi.fn().mockRejectedValue(new Error("Query failed")),
        abort: vi.fn(),
      }));

      client = new AgentClient(mockConfig);
      await client.initialize();

      const queryPromise = client.query("Hello", mockOnMessage);

      // Advance through all retries (maxRetries = 3)
      // Retry 1: 1000ms, Retry 2: 2000ms, Retry 3: 4000ms
      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(2000);
      await vi.advanceTimersByTimeAsync(4000);

      await expect(queryPromise).rejects.toThrowError(AgentQueryError);
    });

    it("should throw AgentTimeoutError when query exceeds timeout", async () => {
      const SDK = await import("@anthropic-ai/claude-agent-sdk");
      vi.mocked(SDK.default).mockImplementation(() => ({
        query: vi.fn().mockImplementation(
          () =>
            new Promise((resolve) => {
              setTimeout(resolve, 60000);
            }),
        ),
        abort: vi.fn(),
      }));

      client = new AgentClient(mockConfig);
      await client.initialize();

      const queryPromise = client.query("Hello", mockOnMessage, {
        timeout: 1000,
      });

      vi.advanceTimersByTime(1001);

      await expect(queryPromise).rejects.toThrowError(AgentTimeoutError);
    });

    it("should use sessionId when provided", async () => {
      const SDK = await import("@anthropic-ai/claude-agent-sdk");
      const mockQuery = vi.fn().mockResolvedValue({ id: "response-id" });
      vi.mocked(SDK.default).mockImplementation(() => ({
        query: mockQuery,
        abort: vi.fn(),
      }));

      client = new AgentClient(mockConfig);
      await client.initialize();

      await client.query("Hello", mockOnMessage, {
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: "550e8400-e29b-41d4-a716-446655440000",
        }),
        expect.any(Function),
      );
    });

    it("should use systemPrompt when provided", async () => {
      const SDK = await import("@anthropic-ai/claude-agent-sdk");
      const mockQuery = vi.fn().mockResolvedValue({ id: "response-id" });
      vi.mocked(SDK.default).mockImplementation(() => ({
        query: mockQuery,
        abort: vi.fn(),
      }));

      client = new AgentClient(mockConfig);
      await client.initialize();

      await client.query("Hello", mockOnMessage, {
        systemPrompt: "You are a helpful assistant.",
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          systemPrompt: "You are a helpful assistant.",
        }),
        expect.any(Function),
      );
    });
  });

  describe("abort", () => {
    it("should call SDK abort method", async () => {
      const SDK = await import("@anthropic-ai/claude-agent-sdk");
      const mockAbort = vi.fn();
      vi.mocked(SDK.default).mockImplementation(() => ({
        query: vi.fn(),
        abort: mockAbort,
      }));

      client = new AgentClient(mockConfig);
      await client.initialize();

      client.abort();

      expect(mockAbort).toHaveBeenCalled();
    });

    it("should cause running query to throw AgentAbortedError", async () => {
      const SDK = await import("@anthropic-ai/claude-agent-sdk");
      let rejectFn: (reason?: Error) => void;

      vi.mocked(SDK.default).mockImplementation(() => ({
        query: vi.fn().mockImplementation(
          () =>
            new Promise((_resolve, reject) => {
              rejectFn = reject;
            }),
        ),
        abort: vi.fn().mockImplementation(() => {
          rejectFn(new Error("Aborted"));
        }),
      }));

      client = new AgentClient(mockConfig);
      await client.initialize();

      const queryPromise = client.query("Hello", vi.fn());
      client.abort();

      await expect(queryPromise).rejects.toThrowError(AgentAbortedError);
    });

    it("should not throw if no query is running", async () => {
      client = new AgentClient(mockConfig);
      await client.initialize();

      expect(() => client.abort()).not.toThrow();
    });
  });

  describe("retry behavior", () => {
    it("should retry on transient errors", async () => {
      const SDK = await import("@anthropic-ai/claude-agent-sdk");
      const mockQuery = vi
        .fn()
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({ id: "response-id" });

      vi.mocked(SDK.default).mockImplementation(() => ({
        query: mockQuery,
        abort: vi.fn(),
      }));

      client = new AgentClient(mockConfig);
      await client.initialize();

      const queryPromise = client.query("Hello", vi.fn());

      // First retry after initialRetryDelay (1000ms)
      await vi.advanceTimersByTimeAsync(1000);
      // Second retry after 2000ms (exponential backoff)
      await vi.advanceTimersByTimeAsync(2000);

      await queryPromise;

      expect(mockQuery).toHaveBeenCalledTimes(3);
    });

    it("should use exponential backoff between retries", async () => {
      const SDK = await import("@anthropic-ai/claude-agent-sdk");
      const mockQuery = vi
        .fn()
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({ id: "response-id" });

      vi.mocked(SDK.default).mockImplementation(() => ({
        query: mockQuery,
        abort: vi.fn(),
      }));

      client = new AgentClient({
        ...mockConfig,
        initialRetryDelay: 1000,
        maxRetryDelay: 4000,
      });
      await client.initialize();

      const queryPromise = client.query("Hello", vi.fn());

      // First retry after 1000ms
      await vi.advanceTimersByTimeAsync(1000);
      expect(mockQuery).toHaveBeenCalledTimes(2);

      // Second retry after 2000ms
      await vi.advanceTimersByTimeAsync(2000);
      expect(mockQuery).toHaveBeenCalledTimes(3);

      await queryPromise;
    });

    it("should throw after max retries exceeded", async () => {
      const SDK = await import("@anthropic-ai/claude-agent-sdk");
      vi.mocked(SDK.default).mockImplementation(() => ({
        query: vi.fn().mockRejectedValue(new Error("Persistent error")),
        abort: vi.fn(),
      }));

      client = new AgentClient({ ...mockConfig, maxRetries: 2 });
      await client.initialize();

      const queryPromise = client.query("Hello", vi.fn());

      // Advance through all retries
      await vi.advanceTimersByTimeAsync(10000);

      await expect(queryPromise).rejects.toThrowError(AgentQueryError);
    });
  });

  describe("isQueryRunning", () => {
    it("should return false when no query is running", async () => {
      client = new AgentClient(mockConfig);
      await client.initialize();
      expect(client.isQueryRunning()).toBe(false);
    });

    it("should return true when query is running", async () => {
      const SDK = await import("@anthropic-ai/claude-agent-sdk");
      vi.mocked(SDK.default).mockImplementation(() => ({
        query: vi.fn().mockImplementation(() => new Promise(() => {})),
        abort: vi.fn(),
      }));

      client = new AgentClient(mockConfig);
      await client.initialize();

      client.query("Hello", vi.fn());

      expect(client.isQueryRunning()).toBe(true);
    });
  });
});
