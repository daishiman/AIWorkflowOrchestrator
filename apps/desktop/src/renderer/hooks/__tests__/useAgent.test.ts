/**
 * useAgent Hook Tests
 * Phase 4: TDD Red - All tests should fail until implementation
 *
 * Tests for React Hook integration with Agent API
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAgent } from "../useAgent";
import type { SDKMessage, AgentStatus } from "@repo/shared/agent";

// Mock window.agentAPI
const mockAgentAPI = {
  query: vi.fn(),
  abort: vi.fn(),
  getStatus: vi.fn(),
  createSession: vi.fn(),
  resumeSession: vi.fn(),
  destroySession: vi.fn(),
  onMessage: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();

  // Setup default mock implementations
  mockAgentAPI.getStatus.mockResolvedValue({
    status: "initialized",
    timestamp: Date.now(),
  } as AgentStatus);

  mockAgentAPI.createSession.mockResolvedValue("test-session-id");
  mockAgentAPI.query.mockResolvedValue(undefined);

  let _messageCallback: ((message: SDKMessage) => void) | null = null;
  mockAgentAPI.onMessage.mockImplementation((callback) => {
    _messageCallback = callback;
    return () => {
      _messageCallback = null;
    };
  });

  // Mock window.agentAPI without replacing the entire window object
  Object.defineProperty(window, "agentAPI", {
    value: mockAgentAPI,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useAgent", () => {
  describe("initialization", () => {
    it("should fetch initial status on mount", async () => {
      renderHook(() => useAgent());

      await waitFor(() => {
        expect(mockAgentAPI.getStatus).toHaveBeenCalled();
      });
    });

    it("should create session when autoSession is true", async () => {
      renderHook(() => useAgent({ autoSession: true }));

      await waitFor(() => {
        expect(mockAgentAPI.createSession).toHaveBeenCalled();
      });
    });

    it("should not create session when autoSession is false", async () => {
      renderHook(() => useAgent({ autoSession: false }));

      await waitFor(() => {
        expect(mockAgentAPI.getStatus).toHaveBeenCalled();
      });

      expect(mockAgentAPI.createSession).not.toHaveBeenCalled();
    });

    it("should subscribe to messages on mount", () => {
      renderHook(() => useAgent());

      expect(mockAgentAPI.onMessage).toHaveBeenCalled();
    });

    it("should unsubscribe from messages on unmount", () => {
      const unsubscribe = vi.fn();
      mockAgentAPI.onMessage.mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useAgent());
      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe("status", () => {
    it("should return null status initially", () => {
      const { result } = renderHook(() => useAgent());
      expect(result.current.status).toBeNull();
    });

    it("should update status after fetch", async () => {
      const mockStatus: AgentStatus = {
        status: "initialized",
        timestamp: Date.now(),
      };
      mockAgentAPI.getStatus.mockResolvedValue(mockStatus);

      const { result } = renderHook(() => useAgent());

      await waitFor(() => {
        expect(result.current.status).toEqual(mockStatus);
      });
    });

    it("should set error status when getStatus fails", async () => {
      mockAgentAPI.getStatus.mockRejectedValue(
        new Error("Status fetch failed"),
      );

      const { result } = renderHook(() => useAgent());

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
    });
  });

  describe("query", () => {
    it("should call agentAPI.query with prompt", async () => {
      const { result } = renderHook(() => useAgent());

      await act(async () => {
        await result.current.query("Hello, Claude!");
      });

      expect(mockAgentAPI.query).toHaveBeenCalledWith("Hello, Claude!", {});
    });

    it("should call agentAPI.query with options", async () => {
      const { result } = renderHook(() => useAgent());

      await act(async () => {
        await result.current.query("Hello", { timeout: 60000 });
      });

      expect(mockAgentAPI.query).toHaveBeenCalledWith("Hello", {
        timeout: 60000,
      });
    });

    it("should use default timeout from options", async () => {
      const { result } = renderHook(() => useAgent({ defaultTimeout: 45000 }));

      await act(async () => {
        await result.current.query("Hello");
      });

      expect(mockAgentAPI.query).toHaveBeenCalledWith("Hello", {
        timeout: 45000,
      });
    });

    it("should include sessionId when available", async () => {
      mockAgentAPI.createSession.mockResolvedValue("auto-session-id");

      const { result } = renderHook(() => useAgent({ autoSession: true }));

      await waitFor(() => {
        expect(result.current.sessionId).toBe("auto-session-id");
      });

      await act(async () => {
        await result.current.query("Hello");
      });

      expect(mockAgentAPI.query).toHaveBeenCalledWith("Hello", {
        sessionId: "auto-session-id",
      });
    });

    it("should set isLoading to true during query", async () => {
      mockAgentAPI.query.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 1000);
          }),
      );

      const { result } = renderHook(() => useAgent());

      let queryPromise: Promise<void>;
      act(() => {
        queryPromise = result.current.query("Hello");
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await queryPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should set error on query failure", async () => {
      mockAgentAPI.query.mockRejectedValue(new Error("Query failed"));

      const { result } = renderHook(() => useAgent());

      await act(async () => {
        try {
          await result.current.query("Hello");
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("messages", () => {
    it("should accumulate messages from onMessage callback", async () => {
      let capturedCallback: ((message: SDKMessage) => void) | null = null;
      mockAgentAPI.onMessage.mockImplementation((callback) => {
        capturedCallback = callback;
        return () => {};
      });

      const { result } = renderHook(() => useAgent());

      const message: SDKMessage = {
        id: "msg-1",
        type: "text",
        content: "Hello!",
        timestamp: Date.now(),
        isComplete: false,
      };

      act(() => {
        capturedCallback?.(message);
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0]).toEqual(message);
    });

    it("should append multiple messages in order", async () => {
      let capturedCallback: ((message: SDKMessage) => void) | null = null;
      mockAgentAPI.onMessage.mockImplementation((callback) => {
        capturedCallback = callback;
        return () => {};
      });

      const { result } = renderHook(() => useAgent());

      const messages: SDKMessage[] = [
        {
          id: "msg-1",
          type: "text",
          content: "Hello",
          timestamp: 1000,
          isComplete: false,
        },
        {
          id: "msg-2",
          type: "text",
          content: " World",
          timestamp: 2000,
          isComplete: false,
        },
        {
          id: "msg-3",
          type: "complete",
          content: "",
          timestamp: 3000,
          isComplete: true,
        },
      ];

      act(() => {
        messages.forEach((msg) => capturedCallback?.(msg));
      });

      expect(result.current.messages).toHaveLength(3);
      expect(result.current.messages.map((m) => m.id)).toEqual([
        "msg-1",
        "msg-2",
        "msg-3",
      ]);
    });

    it("should set isLoading to false when complete message received", async () => {
      let capturedCallback: ((message: SDKMessage) => void) | null = null;
      mockAgentAPI.onMessage.mockImplementation((callback) => {
        capturedCallback = callback;
        return () => {};
      });

      mockAgentAPI.query.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useAgent());

      act(() => {
        result.current.query("Hello");
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        capturedCallback?.({
          id: "msg-1",
          type: "complete",
          content: "",
          timestamp: Date.now(),
          isComplete: true,
        });
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("abort", () => {
    it("should call agentAPI.abort", () => {
      const { result } = renderHook(() => useAgent());

      act(() => {
        result.current.abort();
      });

      expect(mockAgentAPI.abort).toHaveBeenCalled();
    });

    it("should set isLoading to false after abort", async () => {
      mockAgentAPI.query.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useAgent());

      act(() => {
        result.current.query("Hello");
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.abort();
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("clearMessages", () => {
    it("should clear all messages", async () => {
      let capturedCallback: ((message: SDKMessage) => void) | null = null;
      mockAgentAPI.onMessage.mockImplementation((callback) => {
        capturedCallback = callback;
        return () => {};
      });

      const { result } = renderHook(() => useAgent());

      act(() => {
        capturedCallback?.({
          id: "msg-1",
          type: "text",
          content: "Hello",
          timestamp: Date.now(),
          isComplete: false,
        });
      });

      expect(result.current.messages).toHaveLength(1);

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toHaveLength(0);
    });
  });

  describe("resetSession", () => {
    it("should destroy current session and create new one", async () => {
      mockAgentAPI.createSession
        .mockResolvedValueOnce("session-1")
        .mockResolvedValueOnce("session-2");

      const { result } = renderHook(() => useAgent({ autoSession: true }));

      await waitFor(() => {
        expect(result.current.sessionId).toBe("session-1");
      });

      await act(async () => {
        await result.current.resetSession();
      });

      expect(mockAgentAPI.destroySession).toHaveBeenCalledWith("session-1");
      expect(result.current.sessionId).toBe("session-2");
    });

    it("should clear messages on session reset", async () => {
      let capturedCallback: ((message: SDKMessage) => void) | null = null;
      mockAgentAPI.onMessage.mockImplementation((callback) => {
        capturedCallback = callback;
        return () => {};
      });

      const { result } = renderHook(() => useAgent({ autoSession: true }));

      await waitFor(() => {
        expect(result.current.sessionId).toBeDefined();
      });

      act(() => {
        capturedCallback?.({
          id: "msg-1",
          type: "text",
          content: "Hello",
          timestamp: Date.now(),
          isComplete: false,
        });
      });

      expect(result.current.messages).toHaveLength(1);

      await act(async () => {
        await result.current.resetSession();
      });

      expect(result.current.messages).toHaveLength(0);
    });
  });

  describe("error handling", () => {
    it("should set error when query fails", async () => {
      const error = new Error("Query failed");
      mockAgentAPI.query.mockRejectedValue(error);

      const { result } = renderHook(() => useAgent());

      await act(async () => {
        try {
          await result.current.query("Hello");
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBeDefined();
    });

    it("should clear error on successful query", async () => {
      mockAgentAPI.query
        .mockRejectedValueOnce(new Error("First failed"))
        .mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAgent());

      await act(async () => {
        try {
          await result.current.query("Hello");
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBeDefined();

      await act(async () => {
        await result.current.query("Hello again");
      });

      expect(result.current.error).toBeNull();
    });

    it("should set error from error message type", async () => {
      let capturedCallback: ((message: SDKMessage) => void) | null = null;
      mockAgentAPI.onMessage.mockImplementation((callback) => {
        capturedCallback = callback;
        return () => {};
      });

      const { result } = renderHook(() => useAgent());

      act(() => {
        capturedCallback?.({
          id: "error-msg",
          type: "error",
          content: "Something went wrong",
          timestamp: Date.now(),
          isComplete: true,
        });
      });

      expect(result.current.error).toBeDefined();
    });
  });
});
