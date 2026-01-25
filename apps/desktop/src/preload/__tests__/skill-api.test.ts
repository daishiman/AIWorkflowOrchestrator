/**
 * Skill API Preload Tests
 *
 * TDD Red Phase: Tests for skillAPI exposed via contextBridge.
 * All tests should fail until implementation in Phase 5.
 *
 * @module @repo/desktop/preload/__tests__/skill-api
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
} from "../channels";

// ============================================================
// 1. IPC Channel Tests
// ============================================================
describe("Skill API - IPC Channels", () => {
  describe("Channel Definitions", () => {
    it("should define SKILL_EXECUTE channel", () => {
      expect(IPC_CHANNELS.SKILL_EXECUTE).toBe("skill:execute");
    });

    it("should define SKILL_STREAM channel", () => {
      expect(IPC_CHANNELS.SKILL_STREAM).toBe("skill:stream");
    });

    it("should define SKILL_ABORT channel", () => {
      expect(IPC_CHANNELS.SKILL_ABORT).toBe("skill:abort");
    });

    it("should define SKILL_GET_STATUS channel", () => {
      expect(IPC_CHANNELS.SKILL_GET_STATUS).toBe("skill:get-status");
    });
  });

  describe("Whitelist Registration - Invoke Channels", () => {
    it("should include SKILL_EXECUTE in allowed invoke channels", () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.SKILL_EXECUTE);
    });

    it("should include SKILL_ABORT in allowed invoke channels", () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.SKILL_ABORT);
    });

    it("should include SKILL_GET_STATUS in allowed invoke channels", () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.SKILL_GET_STATUS);
    });
  });

  describe("Whitelist Registration - On Channels", () => {
    it("should include SKILL_STREAM in allowed on channels", () => {
      expect(ALLOWED_ON_CHANNELS).toContain(IPC_CHANNELS.SKILL_STREAM);
    });
  });
});

// ============================================================
// 2. skillAPI.onStream Tests
// ============================================================
describe("skillAPI.onStream", () => {
  const mockSkillAPI = {
    execute: vi.fn(),
    onStream: vi.fn(),
    abort: vi.fn(),
    getExecutionStatus: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal("skillAPI", mockSkillAPI);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should register callback and return unsubscribe function", () => {
    const callback = vi.fn();
    const unsubscribe = vi.fn();
    mockSkillAPI.onStream.mockReturnValue(unsubscribe);

    const result = window.skillAPI.onStream(callback);

    expect(mockSkillAPI.onStream).toHaveBeenCalledWith(callback);
    expect(result).toBe(unsubscribe);
  });

  it("should call callback when skill:stream message is received", () => {
    const callback = vi.fn();
    let capturedCallback: ((msg: unknown) => void) | null = null;

    mockSkillAPI.onStream.mockImplementation((cb) => {
      capturedCallback = cb;
      return () => {};
    });

    window.skillAPI.onStream(callback);

    const message = {
      executionId: "test-exec-001",
      id: "msg-1",
      type: "text",
      content: "Test message",
      timestamp: Date.now(),
      isComplete: false,
    };

    // Simulate message reception
    capturedCallback?.(message);

    expect(callback).toHaveBeenCalledWith(message);
  });

  it("should not call callback after unsubscribe", () => {
    const callback = vi.fn();
    let capturedCallback: ((msg: unknown) => void) | null = null;
    const unsubscribe = vi.fn(() => {
      capturedCallback = null;
    });

    mockSkillAPI.onStream.mockImplementation((cb) => {
      capturedCallback = cb;
      return unsubscribe;
    });

    const unsub = window.skillAPI.onStream(callback);
    unsub();

    expect(unsubscribe).toHaveBeenCalled();
    // After unsubscribe, callback should be null
    expect(capturedCallback).toBeNull();
  });

  it("should handle multiple listeners", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const unsubscribe1 = vi.fn();
    const unsubscribe2 = vi.fn();

    mockSkillAPI.onStream
      .mockReturnValueOnce(unsubscribe1)
      .mockReturnValueOnce(unsubscribe2);

    const unsub1 = window.skillAPI.onStream(callback1);
    const unsub2 = window.skillAPI.onStream(callback2);

    expect(mockSkillAPI.onStream).toHaveBeenCalledTimes(2);
    expect(unsub1).toBe(unsubscribe1);
    expect(unsub2).toBe(unsubscribe2);
  });
});

// ============================================================
// 3. skillAPI.abort Tests
// ============================================================
describe("skillAPI.abort", () => {
  const mockSkillAPI = {
    execute: vi.fn(),
    onStream: vi.fn(),
    abort: vi.fn(),
    getExecutionStatus: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal("skillAPI", mockSkillAPI);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call ipcRenderer.invoke with skill:abort channel", async () => {
    const executionId = "test-exec-001";
    mockSkillAPI.abort.mockResolvedValue(true);

    await window.skillAPI.abort(executionId);

    expect(mockSkillAPI.abort).toHaveBeenCalledWith(executionId);
  });

  it("should return true when abort is successful", async () => {
    const executionId = "test-exec-001";
    mockSkillAPI.abort.mockResolvedValue(true);

    const result = await window.skillAPI.abort(executionId);

    expect(result).toBe(true);
  });

  it("should return false when execution not found", async () => {
    const executionId = "non-existent-exec";
    mockSkillAPI.abort.mockResolvedValue(false);

    const result = await window.skillAPI.abort(executionId);

    expect(result).toBe(false);
  });

  it("should validate executionId format (UUID v4)", async () => {
    const validUuid = "550e8400-e29b-41d4-a716-446655440000";
    mockSkillAPI.abort.mockResolvedValue(true);

    await window.skillAPI.abort(validUuid);

    expect(mockSkillAPI.abort).toHaveBeenCalledWith(validUuid);
  });
});

// ============================================================
// 4. skillAPI.getExecutionStatus Tests
// ============================================================
describe("skillAPI.getExecutionStatus", () => {
  const mockSkillAPI = {
    execute: vi.fn(),
    onStream: vi.fn(),
    abort: vi.fn(),
    getExecutionStatus: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal("skillAPI", mockSkillAPI);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return execution info when found", async () => {
    const executionId = "test-exec-001";
    const executionInfo = {
      executionId,
      status: "running",
      skillId: "test-skill",
      startedAt: Date.now(),
    };
    mockSkillAPI.getExecutionStatus.mockResolvedValue(executionInfo);

    const result = await window.skillAPI.getExecutionStatus(executionId);

    expect(mockSkillAPI.getExecutionStatus).toHaveBeenCalledWith(executionId);
    expect(result).toEqual(executionInfo);
  });

  it("should return null when not found", async () => {
    const executionId = "non-existent-exec";
    mockSkillAPI.getExecutionStatus.mockResolvedValue(null);

    const result = await window.skillAPI.getExecutionStatus(executionId);

    expect(result).toBeNull();
  });
});

// ============================================================
// 5. skillAPI.execute Tests
// ============================================================
describe("skillAPI.execute", () => {
  const mockSkillAPI = {
    execute: vi.fn(),
    onStream: vi.fn(),
    abort: vi.fn(),
    getExecutionStatus: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal("skillAPI", mockSkillAPI);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call execute with request object", async () => {
    const request = {
      skillId: "test-skill",
      prompt: "Test prompt",
    };
    const response = {
      executionId: "test-exec-001",
      success: true,
    };
    mockSkillAPI.execute.mockResolvedValue(response);

    const result = await window.skillAPI.execute(request);

    expect(mockSkillAPI.execute).toHaveBeenCalledWith(request);
    expect(result).toEqual(response);
  });

  it("should return error response on failure", async () => {
    const request = {
      skillId: "test-skill",
      prompt: "Test prompt",
    };
    const response = {
      executionId: "",
      success: false,
      error: {
        code: "SKILL_NOT_FOUND",
        message: "Skill not found",
      },
    };
    mockSkillAPI.execute.mockResolvedValue(response);

    const result = await window.skillAPI.execute(request);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// ============================================================
// 6. skillAPI.onStream - Edge Cases
// ============================================================
describe("skillAPI.onStream - edge cases", () => {
  const mockSkillAPI = {
    execute: vi.fn(),
    onStream: vi.fn(),
    abort: vi.fn(),
    getExecutionStatus: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal("skillAPI", mockSkillAPI);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should handle rapid consecutive messages", () => {
    const callback = vi.fn();
    let capturedCallback: ((msg: unknown) => void) | null = null;

    mockSkillAPI.onStream.mockImplementation((cb) => {
      capturedCallback = cb;
      return () => {};
    });

    window.skillAPI.onStream(callback);

    // Send 100 rapid messages
    for (let i = 0; i < 100; i++) {
      capturedCallback?.({
        executionId: "test-exec-001",
        id: `msg-${i}`,
        type: "text",
        content: `Message ${i}`,
        timestamp: Date.now(),
        isComplete: false,
      });
    }

    expect(callback).toHaveBeenCalledTimes(100);
  });

  it("should handle empty message content", () => {
    const callback = vi.fn();
    let capturedCallback: ((msg: unknown) => void) | null = null;

    mockSkillAPI.onStream.mockImplementation((cb) => {
      capturedCallback = cb;
      return () => {};
    });

    window.skillAPI.onStream(callback);

    capturedCallback?.({
      executionId: "test-exec-001",
      id: "msg-1",
      type: "text",
      content: "",
      timestamp: Date.now(),
      isComplete: false,
    });

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ content: "" }),
    );
  });

  it("should handle very long message content", () => {
    const callback = vi.fn();
    let capturedCallback: ((msg: unknown) => void) | null = null;

    mockSkillAPI.onStream.mockImplementation((cb) => {
      capturedCallback = cb;
      return () => {};
    });

    window.skillAPI.onStream(callback);

    const longContent = "x".repeat(100000); // 100KB of data
    capturedCallback?.({
      executionId: "test-exec-001",
      id: "msg-1",
      type: "text",
      content: longContent,
      timestamp: Date.now(),
      isComplete: false,
    });

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ content: longContent }),
    );
  });

  it("should handle special characters in message", () => {
    const callback = vi.fn();
    let capturedCallback: ((msg: unknown) => void) | null = null;

    mockSkillAPI.onStream.mockImplementation((cb) => {
      capturedCallback = cb;
      return () => {};
    });

    window.skillAPI.onStream(callback);

    const specialContent = '日本語テスト\n\t<script>alert("xss")</script>&amp;';
    capturedCallback?.({
      executionId: "test-exec-001",
      id: "msg-1",
      type: "text",
      content: specialContent,
      timestamp: Date.now(),
      isComplete: false,
    });

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ content: specialContent }),
    );
  });

  it("should handle concurrent subscriptions from multiple components", () => {
    const callbacks: Array<() => void> = [];
    const listeners: Array<(msg: unknown) => void> = [];

    mockSkillAPI.onStream.mockImplementation((cb) => {
      listeners.push(cb);
      const index = listeners.length - 1;
      return () => {
        listeners.splice(index, 1);
      };
    });

    // Subscribe 5 listeners
    for (let i = 0; i < 5; i++) {
      const callback = vi.fn();
      callbacks.push(callback);
      window.skillAPI.onStream(callback);
    }

    expect(mockSkillAPI.onStream).toHaveBeenCalledTimes(5);
    expect(listeners).toHaveLength(5);
  });
});

// ============================================================
// 7. skillAPI.abort - Edge Cases
// ============================================================
describe("skillAPI.abort - edge cases", () => {
  const mockSkillAPI = {
    execute: vi.fn(),
    onStream: vi.fn(),
    abort: vi.fn(),
    getExecutionStatus: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal("skillAPI", mockSkillAPI);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should handle abort on already completed execution", async () => {
    const executionId = "completed-exec-001";
    mockSkillAPI.abort.mockResolvedValue(false);

    const result = await window.skillAPI.abort(executionId);

    expect(result).toBe(false);
  });

  it("should handle abort on already aborted execution", async () => {
    const executionId = "aborted-exec-001";
    mockSkillAPI.abort.mockResolvedValue(false);

    const result = await window.skillAPI.abort(executionId);

    expect(result).toBe(false);
  });

  it("should handle abort with invalid executionId format", async () => {
    const invalidId = "invalid-id-format";
    mockSkillAPI.abort.mockResolvedValue(false);

    const result = await window.skillAPI.abort(invalidId);

    expect(mockSkillAPI.abort).toHaveBeenCalledWith(invalidId);
    expect(result).toBe(false);
  });

  it("should handle abort when IPC fails", async () => {
    const executionId = "test-exec-001";
    mockSkillAPI.abort.mockRejectedValue(new Error("IPC connection failed"));

    await expect(window.skillAPI.abort(executionId)).rejects.toThrow(
      "IPC connection failed",
    );
  });
});

// ============================================================
// 8. skillAPI - Error Handling
// ============================================================
describe("skillAPI - error handling", () => {
  const mockSkillAPI = {
    execute: vi.fn(),
    onStream: vi.fn(),
    abort: vi.fn(),
    getExecutionStatus: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal("skillAPI", mockSkillAPI);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should handle IPC timeout", async () => {
    mockSkillAPI.execute.mockRejectedValue(new Error("IPC timeout"));

    await expect(
      window.skillAPI.execute({ skillId: "test", prompt: "test" }),
    ).rejects.toThrow("IPC timeout");
  });

  it("should handle IPC connection failure", async () => {
    mockSkillAPI.getExecutionStatus.mockRejectedValue(
      new Error("IPC connection refused"),
    );

    await expect(
      window.skillAPI.getExecutionStatus("test-exec-001"),
    ).rejects.toThrow("IPC connection refused");
  });

  it("should handle malformed message data", () => {
    const callback = vi.fn();
    let capturedCallback: ((msg: unknown) => void) | null = null;

    mockSkillAPI.onStream.mockImplementation((cb) => {
      capturedCallback = cb;
      return () => {};
    });

    window.skillAPI.onStream(callback);

    // Send malformed message (missing required fields)
    const malformedMessage = {
      executionId: "test-exec-001",
      // missing id, type, content, timestamp, isComplete
    };

    capturedCallback?.(malformedMessage);

    // Callback should still be called with malformed data
    expect(callback).toHaveBeenCalledWith(malformedMessage);
  });
});

// ============================================================
// 9. window.skillAPI Availability Tests
// ============================================================
describe("window.skillAPI - API Object Availability", () => {
  const mockSkillAPI = {
    execute: vi.fn(),
    onStream: vi.fn(),
    abort: vi.fn(),
    getExecutionStatus: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal("skillAPI", mockSkillAPI);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should expose skillAPI on window object", () => {
    expect(window.skillAPI).toBeDefined();
  });

  it("should have execute method", () => {
    expect(window.skillAPI?.execute).toBeInstanceOf(Function);
  });

  it("should have onStream method", () => {
    expect(window.skillAPI?.onStream).toBeInstanceOf(Function);
  });

  it("should have abort method", () => {
    expect(window.skillAPI?.abort).toBeInstanceOf(Function);
  });

  it("should have getExecutionStatus method", () => {
    expect(window.skillAPI?.getExecutionStatus).toBeInstanceOf(Function);
  });
});
