/**
 * useSkillExecution Hook Tests
 *
 * TDD Red Phase: Tests for React Hook integration with Skill API.
 * All tests should fail until implementation in Phase 5.
 *
 * @module @repo/desktop/renderer/hooks/__tests__/useSkillExecution
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSkillExecution } from "../useSkillExecution";
import type { SkillStreamMessage } from "@repo/shared/types/skill";

// Mock window.skillAPI
const mockSkillAPI = {
  execute: vi.fn(),
  onStream: vi.fn(),
  abort: vi.fn(),
  getExecutionStatus: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();

  // Setup default mock implementations
  mockSkillAPI.execute.mockResolvedValue({
    executionId: "test-exec-001",
    success: true,
  });

  let _streamCallback: ((message: SkillStreamMessage) => void) | null = null;
  mockSkillAPI.onStream.mockImplementation((callback) => {
    _streamCallback = callback;
    return () => {
      _streamCallback = null;
    };
  });

  mockSkillAPI.abort.mockResolvedValue(true);

  // Mock window.skillAPI
  Object.defineProperty(window, "skillAPI", {
    value: mockSkillAPI,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

// ============================================================
// 1. Initial State Tests
// ============================================================
describe("useSkillExecution - initial state", () => {
  it("should return idle status initially", () => {
    const { result } = renderHook(() => useSkillExecution("test-skill"));

    expect(result.current.status).toBe("idle");
  });

  it("should return empty messages array initially", () => {
    const { result } = renderHook(() => useSkillExecution("test-skill"));

    expect(result.current.messages).toEqual([]);
  });

  it("should return null error initially", () => {
    const { result } = renderHook(() => useSkillExecution("test-skill"));

    expect(result.current.error).toBeNull();
  });

  it("should return null executionId initially", () => {
    const { result } = renderHook(() => useSkillExecution("test-skill"));

    expect(result.current.executionId).toBeNull();
  });

  it("should return false isAborting initially", () => {
    const { result } = renderHook(() => useSkillExecution("test-skill"));

    expect(result.current.isAborting).toBe(false);
  });

  it("should subscribe to stream on mount", () => {
    renderHook(() => useSkillExecution("test-skill"));

    expect(mockSkillAPI.onStream).toHaveBeenCalled();
  });
});

// ============================================================
// 2. Execute Function Tests
// ============================================================
describe("useSkillExecution - execute", () => {
  it("should set status to running when execute is called", async () => {
    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      result.current.execute("Test prompt");
    });

    expect(result.current.status).toBe("running");
  });

  it("should clear previous messages when execute is called", async () => {
    let capturedCallback: ((message: SkillStreamMessage) => void) | null = null;
    mockSkillAPI.onStream.mockImplementation((callback) => {
      capturedCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    // First execution with messages
    await act(async () => {
      await result.current.execute("First prompt");
    });

    act(() => {
      capturedCallback?.({
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "First message",
        timestamp: Date.now(),
        isComplete: false,
      });
    });

    expect(result.current.messages).toHaveLength(1);

    // Second execution should clear messages
    mockSkillAPI.execute.mockResolvedValue({
      executionId: "test-exec-002",
      success: true,
    });

    await act(async () => {
      await result.current.execute("Second prompt");
    });

    expect(result.current.messages).toEqual([]);
  });

  it("should store executionId from response", async () => {
    mockSkillAPI.execute.mockResolvedValue({
      executionId: "test-exec-001",
      success: true,
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    expect(result.current.executionId).toBe("test-exec-001");
  });

  it("should call skillAPI.execute with correct request", async () => {
    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    expect(mockSkillAPI.execute).toHaveBeenCalledWith({
      prompt: "Test prompt",
      skillId: "test-skill",
    });
  });

  it("should set error status when execute fails", async () => {
    mockSkillAPI.execute.mockResolvedValue({
      executionId: "",
      success: false,
      error: {
        code: "EXECUTION_FAILED",
        message: "Skill not found",
      },
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBeDefined();
  });

  it("should handle execute exception", async () => {
    mockSkillAPI.execute.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error?.message).toBe("Network error");
  });
});

// ============================================================
// 3. Stream Handling Tests
// ============================================================
describe("useSkillExecution - stream handling", () => {
  it("should add message to messages array when received", async () => {
    let capturedCallback: ((message: SkillStreamMessage) => void) | null = null;
    mockSkillAPI.onStream.mockImplementation((callback) => {
      capturedCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    const message: SkillStreamMessage = {
      executionId: "test-exec-001",
      id: "msg-1",
      type: "text",
      content: "Hello world",
      timestamp: Date.now(),
      isComplete: false,
    };

    act(() => {
      capturedCallback?.(message);
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe("Hello world");
  });

  it("should set status to completed when complete message received", async () => {
    let capturedCallback: ((message: SkillStreamMessage) => void) | null = null;
    mockSkillAPI.onStream.mockImplementation((callback) => {
      capturedCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    act(() => {
      capturedCallback?.({
        executionId: "test-exec-001",
        id: "msg-complete",
        type: "complete",
        content: "",
        timestamp: Date.now(),
        isComplete: true,
      });
    });

    expect(result.current.status).toBe("completed");
  });

  it("should set status to error when error message received", async () => {
    let capturedCallback: ((message: SkillStreamMessage) => void) | null = null;
    mockSkillAPI.onStream.mockImplementation((callback) => {
      capturedCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    act(() => {
      capturedCallback?.({
        executionId: "test-exec-001",
        id: "msg-error",
        type: "error",
        content: "Something went wrong",
        timestamp: Date.now(),
        isComplete: true,
      });
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error?.message).toBe("Something went wrong");
  });

  it("should ignore messages with different executionId", async () => {
    let capturedCallback: ((message: SkillStreamMessage) => void) | null = null;
    mockSkillAPI.onStream.mockImplementation((callback) => {
      capturedCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    // Message with different executionId
    act(() => {
      capturedCallback?.({
        executionId: "other-exec-id",
        id: "msg-1",
        type: "text",
        content: "Other execution message",
        timestamp: Date.now(),
        isComplete: false,
      });
    });

    expect(result.current.messages).toHaveLength(0);

    // Message with correct executionId
    act(() => {
      capturedCallback?.({
        executionId: "test-exec-001",
        id: "msg-2",
        type: "text",
        content: "Correct execution message",
        timestamp: Date.now(),
        isComplete: false,
      });
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe(
      "Correct execution message",
    );
  });

  it("should append multiple messages in order", async () => {
    let capturedCallback: ((message: SkillStreamMessage) => void) | null = null;
    mockSkillAPI.onStream.mockImplementation((callback) => {
      capturedCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    const messages: SkillStreamMessage[] = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "First",
        timestamp: 1000,
        isComplete: false,
      },
      {
        executionId: "test-exec-001",
        id: "msg-2",
        type: "text",
        content: "Second",
        timestamp: 2000,
        isComplete: false,
      },
      {
        executionId: "test-exec-001",
        id: "msg-3",
        type: "text",
        content: "Third",
        timestamp: 3000,
        isComplete: false,
      },
    ];

    act(() => {
      messages.forEach((msg) => capturedCallback?.(msg));
    });

    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages.map((m) => m.content)).toEqual([
      "First",
      "Second",
      "Third",
    ]);
  });
});

// ============================================================
// 4. Abort Function Tests
// ============================================================
describe("useSkillExecution - abort", () => {
  it("should call skillAPI.abort with executionId", async () => {
    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    await act(async () => {
      await result.current.abort();
    });

    expect(mockSkillAPI.abort).toHaveBeenCalledWith("test-exec-001");
  });

  it("should not call abort when no active execution", async () => {
    const { result } = renderHook(() => useSkillExecution("test-skill"));

    // Don't execute, try to abort
    await act(async () => {
      await result.current.abort();
    });

    expect(mockSkillAPI.abort).not.toHaveBeenCalled();
  });

  it("should set isAborting to true during abort", async () => {
    mockSkillAPI.abort.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(true), 100)),
    );

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    let abortPromise: Promise<void>;
    act(() => {
      abortPromise = result.current.abort();
    });

    expect(result.current.isAborting).toBe(true);

    await act(async () => {
      await abortPromise;
    });
  });

  it("should set status to aborted when abort message received", async () => {
    let capturedCallback: ((message: SkillStreamMessage) => void) | null = null;
    mockSkillAPI.onStream.mockImplementation((callback) => {
      capturedCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    await act(async () => {
      await result.current.abort();
    });

    // Simulate abort message from SkillExecutor
    act(() => {
      capturedCallback?.({
        executionId: "test-exec-001",
        id: "msg-abort",
        type: "error",
        content: "Execution aborted by user",
        timestamp: Date.now(),
        isComplete: true,
      });
    });

    expect(result.current.status).toBe("aborted");
  });
});

// ============================================================
// 5. Reset Function Tests
// ============================================================
describe("useSkillExecution - reset", () => {
  it("should reset to initial state", async () => {
    let capturedCallback: ((message: SkillStreamMessage) => void) | null = null;
    mockSkillAPI.onStream.mockImplementation((callback) => {
      capturedCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    act(() => {
      capturedCallback?.({
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Message",
        timestamp: Date.now(),
        isComplete: false,
      });
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.status).toBe("running");

    act(() => {
      result.current.reset();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.status).toBe("idle");
    expect(result.current.executionId).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isAborting).toBe(false);
  });
});

// ============================================================
// 6. Cleanup Tests
// ============================================================
describe("useSkillExecution - cleanup", () => {
  it("should unsubscribe from stream on unmount", () => {
    const unsubscribe = vi.fn();
    mockSkillAPI.onStream.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useSkillExecution("test-skill"));
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it("should not cause memory leaks", async () => {
    const unsubscribe = vi.fn();
    mockSkillAPI.onStream.mockReturnValue(unsubscribe);

    const { result, unmount } = renderHook(() =>
      useSkillExecution("test-skill"),
    );

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it("should handle multiple mount/unmount cycles", () => {
    const unsubscribes: vi.Mock[] = [];

    mockSkillAPI.onStream.mockImplementation(() => {
      const unsub = vi.fn();
      unsubscribes.push(unsub);
      return unsub;
    });

    // First mount/unmount
    const { unmount: unmount1 } = renderHook(() =>
      useSkillExecution("test-skill"),
    );
    unmount1();

    // Second mount/unmount
    const { unmount: unmount2 } = renderHook(() =>
      useSkillExecution("test-skill"),
    );
    unmount2();

    expect(unsubscribes).toHaveLength(2);
    expect(unsubscribes[0]).toHaveBeenCalled();
    expect(unsubscribes[1]).toHaveBeenCalled();
  });
});

// ============================================================
// 7. Message Limit Tests
// ============================================================
describe("useSkillExecution - message limit", () => {
  it("should limit messages to MAX_MESSAGES", async () => {
    let capturedCallback: ((message: SkillStreamMessage) => void) | null = null;
    mockSkillAPI.onStream.mockImplementation((callback) => {
      capturedCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    // Add 1001 messages (MAX_MESSAGES is 1000)
    act(() => {
      for (let i = 0; i < 1001; i++) {
        capturedCallback?.({
          executionId: "test-exec-001",
          id: `msg-${i}`,
          type: "text",
          content: `Message ${i}`,
          timestamp: i,
          isComplete: false,
        });
      }
    });

    expect(result.current.messages.length).toBeLessThanOrEqual(1000);
    // First message should be removed
    expect(result.current.messages[0].content).toBe("Message 1");
  });
});

// ============================================================
// 8. Edge Cases - Execution
// ============================================================
describe("useSkillExecution - edge cases (execution)", () => {
  it("should handle execute called while already running", async () => {
    mockSkillAPI.execute
      .mockResolvedValueOnce({
        executionId: "exec-first",
        success: true,
      })
      .mockResolvedValueOnce({
        executionId: "exec-second",
        success: true,
      });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    // First execution
    await act(async () => {
      await result.current.execute("First prompt");
    });

    expect(result.current.executionId).toBe("exec-first");

    // Second execution while first is still "running"
    await act(async () => {
      await result.current.execute("Second prompt");
    });

    // Should switch to second execution
    expect(result.current.executionId).toBe("exec-second");
    expect(result.current.messages).toEqual([]);
  });

  it("should handle rapid execute calls", async () => {
    let callCount = 0;
    mockSkillAPI.execute.mockImplementation(async () => {
      callCount++;
      return {
        executionId: `exec-${callCount}`,
        success: true,
      };
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    // Rapid fire execute calls
    await act(async () => {
      await Promise.all([
        result.current.execute("Prompt 1"),
        result.current.execute("Prompt 2"),
        result.current.execute("Prompt 3"),
      ]);
    });

    expect(mockSkillAPI.execute).toHaveBeenCalledTimes(3);
  });

  it("should handle abort called with no active execution", async () => {
    const { result } = renderHook(() => useSkillExecution("test-skill"));

    // Try to abort without starting execution
    await act(async () => {
      await result.current.abort();
    });

    expect(mockSkillAPI.abort).not.toHaveBeenCalled();
    expect(result.current.isAborting).toBe(false);
  });

  it("should handle reset called while running", async () => {
    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    expect(result.current.status).toBe("running");

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.executionId).toBeNull();
    expect(result.current.messages).toEqual([]);
  });

  it("should handle component unmount during execution", async () => {
    const unsubscribe = vi.fn();
    mockSkillAPI.onStream.mockReturnValue(unsubscribe);

    const { result, unmount } = renderHook(() =>
      useSkillExecution("test-skill"),
    );

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    expect(result.current.status).toBe("running");

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});

// ============================================================
// 9. Edge Cases - Message Handling
// ============================================================
describe("useSkillExecution - edge cases (message handling)", () => {
  it("should handle out-of-order messages", async () => {
    let capturedCallback: ((message: SkillStreamMessage) => void) | null = null;
    mockSkillAPI.onStream.mockImplementation((callback) => {
      capturedCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    // Send messages out of timestamp order
    act(() => {
      capturedCallback?.({
        executionId: "test-exec-001",
        id: "msg-3",
        type: "text",
        content: "Third",
        timestamp: 3000,
        isComplete: false,
      });
      capturedCallback?.({
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "First",
        timestamp: 1000,
        isComplete: false,
      });
      capturedCallback?.({
        executionId: "test-exec-001",
        id: "msg-2",
        type: "text",
        content: "Second",
        timestamp: 2000,
        isComplete: false,
      });
    });

    // Messages should be in received order
    expect(result.current.messages.map((m) => m.content)).toEqual([
      "Third",
      "First",
      "Second",
    ]);
  });

  it("should handle duplicate messages", async () => {
    let capturedCallback: ((message: SkillStreamMessage) => void) | null = null;
    mockSkillAPI.onStream.mockImplementation((callback) => {
      capturedCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    const message: SkillStreamMessage = {
      executionId: "test-exec-001",
      id: "msg-1",
      type: "text",
      content: "Duplicate message",
      timestamp: Date.now(),
      isComplete: false,
    };

    act(() => {
      capturedCallback?.(message);
      capturedCallback?.(message);
      capturedCallback?.(message);
    });

    // All duplicates should be added (no deduplication)
    expect(result.current.messages).toHaveLength(3);
  });

  it("should handle messages after completion", async () => {
    let capturedCallback: ((message: SkillStreamMessage) => void) | null = null;
    mockSkillAPI.onStream.mockImplementation((callback) => {
      capturedCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    // Complete the execution
    act(() => {
      capturedCallback?.({
        executionId: "test-exec-001",
        id: "msg-complete",
        type: "complete",
        content: "",
        timestamp: Date.now(),
        isComplete: true,
      });
    });

    expect(result.current.status).toBe("completed");

    // Try to send another message
    act(() => {
      capturedCallback?.({
        executionId: "test-exec-001",
        id: "msg-late",
        type: "text",
        content: "Late message",
        timestamp: Date.now(),
        isComplete: false,
      });
    });

    // Message should still be added (execution ID still matches)
    expect(result.current.messages).toHaveLength(2);
  });

  it("should preserve message order in state", async () => {
    let capturedCallback: ((message: SkillStreamMessage) => void) | null = null;
    mockSkillAPI.onStream.mockImplementation((callback) => {
      capturedCallback = callback;
      return () => {};
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    // Add messages one by one
    for (let i = 1; i <= 5; i++) {
      act(() => {
        capturedCallback?.({
          executionId: "test-exec-001",
          id: `msg-${i}`,
          type: "text",
          content: `Message ${i}`,
          timestamp: i * 1000,
          isComplete: false,
        });
      });
    }

    expect(result.current.messages.map((m) => m.content)).toEqual([
      "Message 1",
      "Message 2",
      "Message 3",
      "Message 4",
      "Message 5",
    ]);
  });
});

// ============================================================
// 10. Edge Cases - Error Scenarios
// ============================================================
describe("useSkillExecution - edge cases (error scenarios)", () => {
  it("should handle execute failure with detailed error", async () => {
    mockSkillAPI.execute.mockResolvedValue({
      executionId: "",
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests",
      },
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error?.code).toBe("RATE_LIMITED");
    expect(result.current.error?.message).toBe("Too many requests");
  });

  it("should handle network timeout", async () => {
    mockSkillAPI.execute.mockRejectedValue(new Error("Network timeout"));

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("Test prompt");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error?.message).toBe("Network timeout");
  });

  it("should recover from error state", async () => {
    mockSkillAPI.execute
      .mockRejectedValueOnce(new Error("First attempt failed"))
      .mockResolvedValueOnce({
        executionId: "test-exec-retry",
        success: true,
      });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    // First attempt fails
    await act(async () => {
      await result.current.execute("Test prompt");
    });

    expect(result.current.status).toBe("error");

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe("idle");

    // Retry succeeds
    await act(async () => {
      await result.current.execute("Test prompt");
    });

    expect(result.current.status).toBe("running");
    expect(result.current.executionId).toBe("test-exec-retry");
  });
});
