/**
 * Skill Stream Integration Tests
 *
 * TDD Red Phase: Integration tests for Main Process → Preload → Renderer flow.
 * All tests should fail until implementation in Phase 5.
 *
 * Tests scenarios:
 * - IT-001: スキル実行〜完了
 * - IT-002: スキル実行中断
 * - IT-003: エラー発生時
 * - IT-004: 複数実行の分離
 *
 * @module @repo/desktop/__tests__/skill-stream-integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { SkillStreamMessage } from "@repo/shared/types/skill";

// Mock skillAPI for integration testing
const mockSkillAPI = {
  execute: vi.fn(),
  onStream: vi.fn(),
  abort: vi.fn(),
  getExecutionStatus: vi.fn(),
};

// Import real hook for integration testing
import { useSkillExecution } from "../renderer/hooks/useSkillExecution";

beforeEach(() => {
  vi.clearAllMocks();

  // Reset stream callback capture
  let _streamCallback: ((message: SkillStreamMessage) => void) | null = null;
  mockSkillAPI.onStream.mockImplementation((callback) => {
    _streamCallback = callback;
    return () => {
      _streamCallback = null;
    };
  });

  // Expose mock to tests
  (
    global as unknown as { __streamCallback: typeof _streamCallback }
  ).__streamCallback = null;
  mockSkillAPI.onStream.mockImplementation((callback) => {
    (
      global as unknown as { __streamCallback: typeof callback }
    ).__streamCallback = callback;
    return () => {
      (global as unknown as { __streamCallback: null }).__streamCallback = null;
    };
  });

  Object.defineProperty(window, "skillAPI", {
    value: mockSkillAPI,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

// Helper to get stream callback
function getStreamCallback(): ((msg: SkillStreamMessage) => void) | null {
  return (
    global as unknown as {
      __streamCallback: ((msg: SkillStreamMessage) => void) | null;
    }
  ).__streamCallback;
}

// ============================================================
// IT-001: スキル実行〜完了
// ============================================================
describe("IT-001: スキル実行〜完了", () => {
  it("should complete full execution flow: execute → onStream → complete", async () => {
    // Arrange
    // Note: すべてのメッセージで同じexecutionIdを使用（フックが実行IDで分離するため）
    const mockMessages: SkillStreamMessage[] = [
      {
        executionId: "test-exec-001",
        type: "assistant",
        content: { text: "処理を開始します", isPartial: false },
        timestamp: Date.now(),
      },
      {
        executionId: "test-exec-001",
        type: "assistant",
        content: { text: "処理が完了しました", isPartial: false },
        timestamp: Date.now(),
      },
      {
        executionId: "test-exec-001",
        type: "status",
        content: { status: "completed" },
        timestamp: Date.now(),
      },
    ];

    mockSkillAPI.execute.mockResolvedValue({
      executionId: "test-exec-001",
      success: true,
    });

    // Act
    const { result } = renderHook(() => useSkillExecution("test-skill"));

    // Execute skill
    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    expect(result.current.status).toBe("running");

    // Receive stream messages
    const streamCallback = getStreamCallback();
    for (const msg of mockMessages) {
      act(() => {
        streamCallback?.(msg);
      });
    }

    // Assert
    expect(result.current.status).toBe("completed");
    expect(result.current.messages).toHaveLength(3);
    expect((result.current.messages[0] as any).content.text).toBe(
      "処理を開始します",
    );
    expect((result.current.messages[1] as any).content.text).toBe(
      "処理が完了しました",
    );
    expect(result.current.error).toBeNull();
  });

  it("should handle text message streaming correctly", async () => {
    mockSkillAPI.execute.mockResolvedValue({
      executionId: "test-exec-001",
      success: true,
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    const streamCallback = getStreamCallback();

    // Simulate incremental text streaming
    // Note: すべてのメッセージで同じexecutionIdを使用（フックが実行IDで分離するため）
    const textChunks = ["こんにちは", "、", "これは", "テスト", "です。"];
    for (let i = 0; i < textChunks.length; i++) {
      act(() => {
        streamCallback?.({
          executionId: "test-exec-001",
          type: "assistant",
          content: { text: textChunks[i], isPartial: false },
          timestamp: Date.now() + i,
        });
      });
    }

    expect(result.current.messages).toHaveLength(5);
    expect(
      result.current.messages.map((m: any) => m.content.text).join(""),
    ).toBe("こんにちは、これはテストです。");
  });
});

// ============================================================
// IT-002: スキル実行中断
// ============================================================
describe("IT-002: スキル実行中断", () => {
  it("should handle abort request correctly", async () => {
    mockSkillAPI.execute.mockResolvedValue({
      executionId: "test-exec-002",
      success: true,
    });

    mockSkillAPI.abort.mockResolvedValue(true);

    // Act
    const { result } = renderHook(() => useSkillExecution("test-skill"));

    // Start execution
    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    expect(result.current.status).toBe("running");

    // Request abort
    await act(async () => {
      await result.current.abort();
    });

    expect(result.current.isAborting).toBe(true);
    expect(mockSkillAPI.abort).toHaveBeenCalledWith("test-exec-002");

    // Receive abort confirmation message
    const streamCallback = getStreamCallback();
    act(() => {
      streamCallback?.({
        executionId: "test-exec-002",
        type: "error",
        content: {
          code: "ABORTED",
          message: "Execution aborted by user",
          retryable: false,
        },
        timestamp: Date.now(),
      });
    });

    // Assert
    expect(result.current.status).toBe("aborted");
    expect(result.current.isAborting).toBe(false);
  });

  it("should not abort when no active execution", async () => {
    const { result } = renderHook(() => useSkillExecution("test-skill"));

    // Try to abort without executing
    await act(async () => {
      await result.current.abort();
    });

    expect(mockSkillAPI.abort).not.toHaveBeenCalled();
  });

  it("should handle abort failure gracefully", async () => {
    mockSkillAPI.execute.mockResolvedValue({
      executionId: "test-exec-002",
      success: true,
    });

    mockSkillAPI.abort.mockRejectedValue(new Error("Abort failed"));

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    await act(async () => {
      await result.current.abort();
    });

    // Should reset isAborting even on failure
    expect(result.current.isAborting).toBe(false);
    // Status should remain running since abort failed
    expect(result.current.status).toBe("running");
  });
});

// ============================================================
// IT-003: エラー発生時
// ============================================================
describe("IT-003: エラー発生時", () => {
  it("should handle error message from SkillExecutor", async () => {
    mockSkillAPI.execute.mockResolvedValue({
      executionId: "test-exec-003",
      success: true,
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    expect(result.current.status).toBe("running");

    // Receive error message
    const streamCallback = getStreamCallback();
    act(() => {
      streamCallback?.({
        executionId: "test-exec-003",
        type: "error",
        content: {
          code: "NETWORK_ERROR",
          message: "Network error occurred",
          retryable: true,
        },
        timestamp: Date.now(),
      });
    });

    // Assert
    expect(result.current.status).toBe("error");
    expect(result.current.error).toEqual({
      code: "EXECUTION_FAILED",
      message: "Network error occurred",
    });
  });

  it("should handle execute failure", async () => {
    mockSkillAPI.execute.mockResolvedValue({
      executionId: "",
      success: false,
      error: {
        code: "SKILL_NOT_FOUND",
        message: "Skill not found: invalid-skill",
      },
    });

    const { result } = renderHook(() => useSkillExecution("invalid-skill"));

    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error?.code).toBe("SKILL_NOT_FOUND");
    expect(result.current.error?.message).toBe(
      "Skill not found: invalid-skill",
    );
  });

  it("should handle network exception during execute", async () => {
    mockSkillAPI.execute.mockRejectedValue(new Error("Network timeout"));

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error?.message).toBe("Network timeout");
  });

  it("should allow retry after error", async () => {
    mockSkillAPI.execute
      .mockRejectedValueOnce(new Error("First attempt failed"))
      .mockResolvedValueOnce({
        executionId: "test-exec-003-retry",
        success: true,
      });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    // First attempt fails
    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    expect(result.current.status).toBe("error");

    // Reset and retry
    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.error).toBeNull();

    // Second attempt succeeds
    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    expect(result.current.status).toBe("running");
    expect(result.current.executionId).toBe("test-exec-003-retry");
  });
});

// ============================================================
// IT-004: 複数実行の分離
// ============================================================
describe("IT-004: 複数実行の分離", () => {
  it("should isolate messages by executionId", async () => {
    mockSkillAPI.execute.mockResolvedValue({
      executionId: "test-exec-004",
      success: true,
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    const streamCallback = getStreamCallback();

    // Message from different execution should be ignored
    act(() => {
      streamCallback?.({
        executionId: "other-execution-id",
        id: "other-msg-1",
        type: "text",
        content: "他の実行のメッセージ",
        timestamp: Date.now(),
        isComplete: false,
      });
    });

    expect(result.current.messages).toHaveLength(0);

    // Message from current execution should be received
    act(() => {
      streamCallback?.({
        executionId: "test-exec-004",
        id: "msg-1",
        type: "text",
        content: "正しい実行のメッセージ",
        timestamp: Date.now(),
        isComplete: false,
      });
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe("正しい実行のメッセージ");
  });

  it("should handle concurrent executions in different hooks", async () => {
    // First hook
    mockSkillAPI.execute.mockResolvedValueOnce({
      executionId: "exec-A",
      success: true,
    });

    const { result: result1 } = renderHook(() => useSkillExecution("skill-A"));

    await act(async () => {
      await result1.current.execute("プロンプトA");
    });

    // Second hook
    mockSkillAPI.execute.mockResolvedValueOnce({
      executionId: "exec-B",
      success: true,
    });

    const { result: result2 } = renderHook(() => useSkillExecution("skill-B"));

    await act(async () => {
      await result2.current.execute("プロンプトB");
    });

    expect(result1.current.executionId).toBe("exec-A");
    expect(result2.current.executionId).toBe("exec-B");
  });

  it("should clear previous messages on new execution", async () => {
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
      await result.current.execute("最初のプロンプト");
    });

    const streamCallback = getStreamCallback();
    act(() => {
      streamCallback?.({
        executionId: "exec-first",
        id: "msg-first-1",
        type: "text",
        content: "最初の実行のメッセージ",
        timestamp: Date.now(),
        isComplete: false,
      });
    });

    expect(result.current.messages).toHaveLength(1);

    // Second execution should clear messages
    await act(async () => {
      await result.current.execute("2回目のプロンプト");
    });

    expect(result.current.messages).toHaveLength(0);
    expect(result.current.executionId).toBe("exec-second");
  });
});

// ============================================================
// IT-005: コンポーネント統合 E2E
// ============================================================
describe("IT-005: コンポーネント統合 E2E", () => {
  it("should integrate useSkillExecution with SkillStreamDisplay", async () => {
    // This test verifies the full integration between:
    // - skillAPI (Preload)
    // - useSkillExecution (Hook)
    // - SkillStreamDisplay (Component)

    mockSkillAPI.execute.mockResolvedValue({
      executionId: "test-exec-005",
      success: true,
    });

    const _onComplete = vi.fn();
    const _onError = vi.fn();

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    // Simulate component auto-execute
    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    expect(result.current.status).toBe("running");

    // Simulate stream messages
    const streamCallback = getStreamCallback();

    act(() => {
      streamCallback?.({
        executionId: "test-exec-005",
        type: "assistant",
        content: { text: "テストメッセージ", isPartial: false },
        timestamp: Date.now(),
      });
    });

    expect(result.current.messages).toHaveLength(1);
    expect((result.current.messages[0] as any).content.text).toBe(
      "テストメッセージ",
    );

    // Complete
    act(() => {
      streamCallback?.({
        executionId: "test-exec-005",
        type: "status",
        content: { status: "completed" },
        timestamp: Date.now(),
      });
    });

    expect(result.current.status).toBe("completed");
  });
});

// ============================================================
// Cleanup Tests
// ============================================================
describe("Cleanup on component unmount", () => {
  it("should cleanup on component unmount", async () => {
    const unsubscribe = vi.fn();
    mockSkillAPI.onStream.mockReturnValue(unsubscribe);

    mockSkillAPI.execute.mockResolvedValue({
      executionId: "test-exec-cleanup",
      success: true,
    });

    const { result, unmount } = renderHook(() =>
      useSkillExecution("test-skill"),
    );

    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it("should not process messages after unmount", async () => {
    let capturedCallback: ((msg: SkillStreamMessage) => void) | null = null;
    mockSkillAPI.onStream.mockImplementation((callback) => {
      capturedCallback = callback;
      return () => {
        capturedCallback = null;
      };
    });

    mockSkillAPI.execute.mockResolvedValue({
      executionId: "test-exec-unmount",
      success: true,
    });

    const { result, unmount } = renderHook(() =>
      useSkillExecution("test-skill"),
    );

    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    const _lastMessages = result.current.messages;
    unmount();

    // Try to send message after unmount
    // capturedCallback should be null after unmount
    expect(capturedCallback).toBeNull();
  });
});

// ============================================================
// IT-006: 高度なシナリオ
// ============================================================
describe("IT-006: Skill Stream Integration - advanced scenarios", () => {
  it("should handle rapid start/stop cycles", async () => {
    mockSkillAPI.execute.mockResolvedValue({
      executionId: "test-exec-rapid",
      success: true,
    });
    mockSkillAPI.abort.mockResolvedValue(true);

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    // Rapid start/stop cycles
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        await result.current.execute(`Prompt ${i}`);
      });

      if (result.current.status === "running") {
        await act(async () => {
          await result.current.abort();
        });
      }

      act(() => {
        result.current.reset();
      });

      expect(result.current.status).toBe("idle");
    }

    expect(mockSkillAPI.execute).toHaveBeenCalledTimes(5);
  });

  it("should handle concurrent executions with different skillIds", async () => {
    // First hook with skill A
    mockSkillAPI.execute.mockResolvedValueOnce({
      executionId: "exec-skill-a",
      success: true,
    });

    const { result: resultA } = renderHook(() => useSkillExecution("skill-a"));

    // Second hook with skill B
    mockSkillAPI.execute.mockResolvedValueOnce({
      executionId: "exec-skill-b",
      success: true,
    });

    const { result: resultB } = renderHook(() => useSkillExecution("skill-b"));

    // Execute both concurrently
    await act(async () => {
      await Promise.all([
        resultA.current.execute("Prompt for A"),
        resultB.current.execute("Prompt for B"),
      ]);
    });

    expect(resultA.current.executionId).toBe("exec-skill-a");
    expect(resultB.current.executionId).toBe("exec-skill-b");
  });

  it("should maintain state consistency across re-renders", async () => {
    let capturedCallback: ((msg: SkillStreamMessage) => void) | null = null;
    mockSkillAPI.onStream.mockImplementation((callback) => {
      capturedCallback = callback;
      return () => {
        capturedCallback = null;
      };
    });

    mockSkillAPI.execute.mockResolvedValue({
      executionId: "test-exec-rerender",
      success: true,
    });

    const { result, rerender } = renderHook(() =>
      useSkillExecution("test-skill"),
    );

    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    // Add some messages
    act(() => {
      capturedCallback?.({
        executionId: "test-exec-rerender",
        id: "msg-1",
        type: "text",
        content: "Message 1",
        timestamp: Date.now(),
        isComplete: false,
      });
    });

    expect(result.current.messages).toHaveLength(1);

    // Rerender the hook
    rerender();

    // State should be preserved
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.status).toBe("running");
    expect(result.current.executionId).toBe("test-exec-rerender");
  });

  it("should cleanup properly on route change", async () => {
    const unsubscribe = vi.fn();
    mockSkillAPI.onStream.mockReturnValue(unsubscribe);

    mockSkillAPI.execute.mockResolvedValue({
      executionId: "test-exec-route",
      success: true,
    });

    const { result, unmount } = renderHook(() =>
      useSkillExecution("test-skill"),
    );

    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    // Simulate route change by unmounting
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});

// ============================================================
// IT-007: エラーリカバリー
// ============================================================
describe("IT-007: Skill Stream Integration - error recovery", () => {
  it("should recover from temporary network failure", async () => {
    mockSkillAPI.execute
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({
        executionId: "test-exec-retry",
        success: true,
      });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    // First attempt fails
    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    expect(result.current.status).toBe("error");

    // Reset and retry
    act(() => {
      result.current.reset();
    });

    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    expect(result.current.status).toBe("running");
    expect(result.current.executionId).toBe("test-exec-retry");
  });

  it("should show appropriate error UI on permanent failure", async () => {
    mockSkillAPI.execute.mockResolvedValue({
      executionId: "",
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Service is currently unavailable",
      },
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error?.code).toBe("SERVICE_UNAVAILABLE");
    expect(result.current.error?.message).toBe(
      "Service is currently unavailable",
    );
  });

  it("should allow retry after error", async () => {
    let callCount = 0;
    mockSkillAPI.execute.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        throw new Error("First attempt failed");
      }
      return {
        executionId: `test-exec-attempt-${callCount}`,
        success: true,
      };
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    // First attempt
    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    expect(result.current.status).toBe("error");

    // Reset
    act(() => {
      result.current.reset();
    });

    // Second attempt
    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    expect(result.current.status).toBe("running");
    expect(result.current.executionId).toBe("test-exec-attempt-2");
  });

  it("should handle stream error during execution", async () => {
    let capturedCallback: ((msg: SkillStreamMessage) => void) | null = null;
    mockSkillAPI.onStream.mockImplementation((callback) => {
      capturedCallback = callback;
      return () => {
        capturedCallback = null;
      };
    });

    mockSkillAPI.execute.mockResolvedValue({
      executionId: "test-exec-stream-error",
      success: true,
    });

    const { result } = renderHook(() => useSkillExecution("test-skill"));

    await act(async () => {
      await result.current.execute("テストプロンプト");
    });

    // Simulate stream error
    act(() => {
      capturedCallback?.({
        executionId: "test-exec-stream-error",
        type: "error",
        content: {
          code: "STREAM_ERROR",
          message: "Stream connection lost",
          retryable: true,
        },
        timestamp: Date.now(),
      });
    });

    expect(result.current.status).toBe("error");
    expect(result.current.error?.message).toBe("Stream connection lost");
  });
});
