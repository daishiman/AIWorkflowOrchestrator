/**
 * Skill API Permission Tests
 *
 * TDD Red Phase: Tests for skillAPI permission methods.
 * Tests should fail until implementation in Phase 5.
 *
 * @module @repo/desktop/preload/__tests__/skill-api.permission
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
} from "../channels";

// ============================================================
// 1. IPC Channel Definition Tests (Permission)
// ============================================================
describe("Skill API Permission - IPC Channels", () => {
  describe("Channel Definitions", () => {
    it("should define SKILL_PERMISSION_REQUEST channel", () => {
      expect(IPC_CHANNELS.SKILL_PERMISSION_REQUEST).toBe(
        "skill:permission:request",
      );
    });

    it("should define SKILL_PERMISSION_RESPONSE channel", () => {
      expect(IPC_CHANNELS.SKILL_PERMISSION_RESPONSE).toBe(
        "skill:permission:response",
      );
    });
  });

  describe("Whitelist Registration", () => {
    it("should include SKILL_PERMISSION_REQUEST in allowed on channels", () => {
      expect(ALLOWED_ON_CHANNELS).toContain(
        IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
      );
    });

    it("should include SKILL_PERMISSION_RESPONSE in allowed invoke channels", () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
      );
    });
  });
});

// ============================================================
// 2. skillAPI.onPermissionRequest Tests
// ============================================================
describe("skillAPI.onPermissionRequest", () => {
  const mockSkillAPI = {
    execute: vi.fn(),
    onStream: vi.fn(),
    abort: vi.fn(),
    getExecutionStatus: vi.fn(),
    onPermissionRequest: vi.fn(),
    sendPermissionResponse: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal("skillAPI", mockSkillAPI);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should register a permission request listener", () => {
    const callback = vi.fn();
    const unsubscribe = vi.fn();
    mockSkillAPI.onPermissionRequest.mockReturnValue(unsubscribe);

    const result = window.skillAPI.onPermissionRequest(callback);

    expect(mockSkillAPI.onPermissionRequest).toHaveBeenCalledWith(callback);
    expect(result).toBe(unsubscribe);
  });

  it("should call the callback when permission request is received", () => {
    const callback = vi.fn();
    let capturedCallback: ((request: unknown) => void) | null = null;

    mockSkillAPI.onPermissionRequest.mockImplementation((cb) => {
      capturedCallback = cb;
      return () => {};
    });

    window.skillAPI.onPermissionRequest(callback);

    const mockRequest = {
      executionId: "exec-test-001",
      requestId: "req-test-001",
      toolName: "Bash",
      args: { command: "echo test" },
      reason: "コマンドを実行: echo test",
    };

    capturedCallback?.(mockRequest);

    expect(callback).toHaveBeenCalledWith(mockRequest);
  });

  it("should return a cleanup function", () => {
    const callback = vi.fn();
    const unsubscribe = vi.fn();
    mockSkillAPI.onPermissionRequest.mockReturnValue(unsubscribe);

    const result = window.skillAPI.onPermissionRequest(callback);

    expect(typeof result).toBe("function");

    result();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("should not call callback after unsubscribe", () => {
    const callback = vi.fn();
    let capturedCallback: ((request: unknown) => void) | null = null;
    const unsubscribe = vi.fn(() => {
      capturedCallback = null;
    });

    mockSkillAPI.onPermissionRequest.mockImplementation((cb) => {
      capturedCallback = cb;
      return unsubscribe;
    });

    const unsub = window.skillAPI.onPermissionRequest(callback);
    unsub();

    expect(unsubscribe).toHaveBeenCalled();
    expect(capturedCallback).toBeNull();
  });

  it("should handle multiple permission listeners", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const unsubscribe1 = vi.fn();
    const unsubscribe2 = vi.fn();

    mockSkillAPI.onPermissionRequest
      .mockReturnValueOnce(unsubscribe1)
      .mockReturnValueOnce(unsubscribe2);

    const unsub1 = window.skillAPI.onPermissionRequest(callback1);
    const unsub2 = window.skillAPI.onPermissionRequest(callback2);

    expect(mockSkillAPI.onPermissionRequest).toHaveBeenCalledTimes(2);
    expect(unsub1).toBe(unsubscribe1);
    expect(unsub2).toBe(unsubscribe2);
  });
});

// ============================================================
// 3. skillAPI.sendPermissionResponse Tests
// ============================================================
describe("skillAPI.sendPermissionResponse", () => {
  const mockSkillAPI = {
    execute: vi.fn(),
    onStream: vi.fn(),
    abort: vi.fn(),
    getExecutionStatus: vi.fn(),
    onPermissionRequest: vi.fn(),
    sendPermissionResponse: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal("skillAPI", mockSkillAPI);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should send permission response with approved=true", async () => {
    mockSkillAPI.sendPermissionResponse.mockResolvedValue(true);

    const response = {
      requestId: "req-test-001",
      approved: true,
    };

    await window.skillAPI.sendPermissionResponse(response);

    expect(mockSkillAPI.sendPermissionResponse).toHaveBeenCalledWith(response);
  });

  it("should send permission response with approved=false", async () => {
    mockSkillAPI.sendPermissionResponse.mockResolvedValue(true);

    const response = {
      requestId: "req-test-001",
      approved: false,
    };

    await window.skillAPI.sendPermissionResponse(response);

    expect(mockSkillAPI.sendPermissionResponse).toHaveBeenCalledWith(response);
  });

  it("should include rememberChoice when provided", async () => {
    mockSkillAPI.sendPermissionResponse.mockResolvedValue(true);

    const response = {
      requestId: "req-test-001",
      approved: true,
      rememberChoice: true,
    };

    await window.skillAPI.sendPermissionResponse(response);

    expect(mockSkillAPI.sendPermissionResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        rememberChoice: true,
      }),
    );
  });

  it("should include rejectReason when provided", async () => {
    mockSkillAPI.sendPermissionResponse.mockResolvedValue(true);

    const response = {
      requestId: "req-test-001",
      approved: false,
      rejectReason: "User declined the request",
    };

    await window.skillAPI.sendPermissionResponse(response);

    expect(mockSkillAPI.sendPermissionResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        rejectReason: "User declined the request",
      }),
    );
  });

  it("should return true on successful response", async () => {
    mockSkillAPI.sendPermissionResponse.mockResolvedValue(true);

    const result = await window.skillAPI.sendPermissionResponse({
      requestId: "req-test-001",
      approved: true,
    });

    expect(result).toBe(true);
  });

  it("should handle IPC error gracefully", async () => {
    mockSkillAPI.sendPermissionResponse.mockRejectedValue(
      new Error("IPC connection failed"),
    );

    await expect(
      window.skillAPI.sendPermissionResponse({
        requestId: "req-test-001",
        approved: true,
      }),
    ).rejects.toThrow("IPC connection failed");
  });
});

// ============================================================
// 4. Permission Request Data Type Tests
// ============================================================
describe("skillAPI permission - data types", () => {
  const mockSkillAPI = {
    execute: vi.fn(),
    onStream: vi.fn(),
    abort: vi.fn(),
    getExecutionStatus: vi.fn(),
    onPermissionRequest: vi.fn(),
    sendPermissionResponse: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal("skillAPI", mockSkillAPI);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should receive permission request with all required fields", () => {
    const callback = vi.fn();
    let capturedCallback: ((request: unknown) => void) | null = null;

    mockSkillAPI.onPermissionRequest.mockImplementation((cb) => {
      capturedCallback = cb;
      return () => {};
    });

    window.skillAPI.onPermissionRequest(callback);

    const validRequest = {
      executionId: "exec-123",
      requestId: "req-456",
      toolName: "Bash",
      args: { command: "ls -la" },
      reason: "List directory contents",
    };

    capturedCallback?.(validRequest);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        executionId: expect.any(String),
        requestId: expect.any(String),
        toolName: expect.any(String),
        args: expect.any(Object),
        reason: expect.any(String),
      }),
    );
  });

  it("should receive permission request with optional timestamp", () => {
    const callback = vi.fn();
    let capturedCallback: ((request: unknown) => void) | null = null;

    mockSkillAPI.onPermissionRequest.mockImplementation((cb) => {
      capturedCallback = cb;
      return () => {};
    });

    window.skillAPI.onPermissionRequest(callback);

    const requestWithTimestamp = {
      executionId: "exec-123",
      requestId: "req-456",
      toolName: "Bash",
      args: { command: "ls -la" },
      reason: "List directory contents",
      timestamp: Date.now(),
    };

    capturedCallback?.(requestWithTimestamp);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        timestamp: expect.any(Number),
      }),
    );
  });

  it("should handle args with various data types", () => {
    const callback = vi.fn();
    let capturedCallback: ((request: unknown) => void) | null = null;

    mockSkillAPI.onPermissionRequest.mockImplementation((cb) => {
      capturedCallback = cb;
      return () => {};
    });

    window.skillAPI.onPermissionRequest(callback);

    const complexArgs = {
      command: "npm install",
      flags: ["--save-dev", "--legacy-peer-deps"],
      timeout: 30000,
      env: { NODE_ENV: "production" },
    };

    const request = {
      executionId: "exec-123",
      requestId: "req-456",
      toolName: "Bash",
      args: complexArgs,
      reason: "Install dependencies",
    };

    capturedCallback?.(request);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        args: complexArgs,
      }),
    );
  });

  it("should handle sanitized args with [REDACTED] values", () => {
    const callback = vi.fn();
    let capturedCallback: ((request: unknown) => void) | null = null;

    mockSkillAPI.onPermissionRequest.mockImplementation((cb) => {
      capturedCallback = cb;
      return () => {};
    });

    window.skillAPI.onPermissionRequest(callback);

    const sanitizedArgs = {
      command: "curl -H",
      apiKey: "[REDACTED]",
      password: "[REDACTED]",
    };

    const request = {
      executionId: "exec-123",
      requestId: "req-456",
      toolName: "Bash",
      args: sanitizedArgs,
      reason: "API call with credentials",
    };

    capturedCallback?.(request);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        args: expect.objectContaining({
          apiKey: "[REDACTED]",
          password: "[REDACTED]",
        }),
      }),
    );
  });
});

// ============================================================
// 5. window.skillAPI Permission Method Availability Tests
// ============================================================
describe("window.skillAPI - Permission Methods Availability", () => {
  const mockSkillAPI = {
    execute: vi.fn(),
    onStream: vi.fn(),
    abort: vi.fn(),
    getExecutionStatus: vi.fn(),
    onPermissionRequest: vi.fn(),
    sendPermissionResponse: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal("skillAPI", mockSkillAPI);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should have onPermissionRequest method", () => {
    expect(window.skillAPI?.onPermissionRequest).toBeInstanceOf(Function);
  });

  it("should have sendPermissionResponse method", () => {
    expect(window.skillAPI?.sendPermissionResponse).toBeInstanceOf(Function);
  });
});

// ============================================================
// 6. IPC Integration Simulation Tests
// ============================================================
describe("skillAPI permission - IPC integration simulation", () => {
  const mockSkillAPI = {
    execute: vi.fn(),
    onStream: vi.fn(),
    abort: vi.fn(),
    getExecutionStatus: vi.fn(),
    onPermissionRequest: vi.fn(),
    sendPermissionResponse: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal("skillAPI", mockSkillAPI);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should handle complete permission flow: request -> dialog -> approve", async () => {
    let capturedCallback: ((request: unknown) => void) | null = null;
    mockSkillAPI.onPermissionRequest.mockImplementation((cb) => {
      capturedCallback = cb;
      return () => {};
    });
    mockSkillAPI.sendPermissionResponse.mockResolvedValue(true);

    // Step 1: Register listener
    const dialogHandler = vi.fn();
    window.skillAPI.onPermissionRequest(dialogHandler);

    // Step 2: Simulate Main Process sending permission request
    const permissionRequest = {
      executionId: "exec-flow-001",
      requestId: "req-flow-001",
      toolName: "Write",
      args: { path: "/tmp/test.txt", content: "Hello" },
      reason: "Write file: /tmp/test.txt",
    };
    capturedCallback?.(permissionRequest);

    // Step 3: Verify dialog handler received the request
    expect(dialogHandler).toHaveBeenCalledWith(permissionRequest);

    // Step 4: Simulate user approval
    await window.skillAPI.sendPermissionResponse({
      requestId: "req-flow-001",
      approved: true,
      rememberChoice: false,
    });

    // Step 5: Verify response was sent
    expect(mockSkillAPI.sendPermissionResponse).toHaveBeenCalledWith({
      requestId: "req-flow-001",
      approved: true,
      rememberChoice: false,
    });
  });

  it("should handle complete permission flow: request -> dialog -> deny", async () => {
    let capturedCallback: ((request: unknown) => void) | null = null;
    mockSkillAPI.onPermissionRequest.mockImplementation((cb) => {
      capturedCallback = cb;
      return () => {};
    });
    mockSkillAPI.sendPermissionResponse.mockResolvedValue(true);

    // Register listener
    const dialogHandler = vi.fn();
    window.skillAPI.onPermissionRequest(dialogHandler);

    // Simulate permission request
    const permissionRequest = {
      executionId: "exec-deny-001",
      requestId: "req-deny-001",
      toolName: "Bash",
      args: { command: "rm -rf /" },
      reason: "Execute dangerous command",
    };
    capturedCallback?.(permissionRequest);

    expect(dialogHandler).toHaveBeenCalledWith(permissionRequest);

    // Simulate user denial
    await window.skillAPI.sendPermissionResponse({
      requestId: "req-deny-001",
      approved: false,
      rememberChoice: true,
    });

    expect(mockSkillAPI.sendPermissionResponse).toHaveBeenCalledWith({
      requestId: "req-deny-001",
      approved: false,
      rememberChoice: true,
    });
  });

  it("should handle multiple concurrent permission requests", async () => {
    let capturedCallback: ((request: unknown) => void) | null = null;
    mockSkillAPI.onPermissionRequest.mockImplementation((cb) => {
      capturedCallback = cb;
      return () => {};
    });
    mockSkillAPI.sendPermissionResponse.mockResolvedValue(true);

    const dialogHandler = vi.fn();
    window.skillAPI.onPermissionRequest(dialogHandler);

    // Simulate two concurrent requests
    const request1 = {
      executionId: "exec-1",
      requestId: "req-1",
      toolName: "Read",
      args: { path: "/file1.txt" },
      reason: "Read file1",
    };

    const request2 = {
      executionId: "exec-2",
      requestId: "req-2",
      toolName: "Write",
      args: { path: "/file2.txt" },
      reason: "Write file2",
    };

    capturedCallback?.(request1);
    capturedCallback?.(request2);

    expect(dialogHandler).toHaveBeenCalledTimes(2);
    expect(dialogHandler).toHaveBeenNthCalledWith(1, request1);
    expect(dialogHandler).toHaveBeenNthCalledWith(2, request2);

    // Respond to requests (out of order)
    await window.skillAPI.sendPermissionResponse({
      requestId: "req-2",
      approved: true,
    });
    await window.skillAPI.sendPermissionResponse({
      requestId: "req-1",
      approved: false,
    });

    expect(mockSkillAPI.sendPermissionResponse).toHaveBeenCalledTimes(2);
  });
});

// ============================================================
// 7. Edge Case Tests
// ============================================================
describe("skillAPI permission - edge cases", () => {
  const mockSkillAPI = {
    execute: vi.fn(),
    onStream: vi.fn(),
    abort: vi.fn(),
    getExecutionStatus: vi.fn(),
    onPermissionRequest: vi.fn(),
    sendPermissionResponse: vi.fn(),
  };

  beforeEach(() => {
    vi.stubGlobal("skillAPI", mockSkillAPI);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should handle empty args object", () => {
    const callback = vi.fn();
    let capturedCallback: ((request: unknown) => void) | null = null;

    mockSkillAPI.onPermissionRequest.mockImplementation((cb) => {
      capturedCallback = cb;
      return () => {};
    });

    window.skillAPI.onPermissionRequest(callback);

    const requestWithEmptyArgs = {
      executionId: "exec-empty-args",
      requestId: "req-empty-args",
      toolName: "Glob",
      args: {},
      reason: "Search for files",
    };

    capturedCallback?.(requestWithEmptyArgs);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        args: {},
      }),
    );
  });

  it("should handle undefined reason", () => {
    const callback = vi.fn();
    let capturedCallback: ((request: unknown) => void) | null = null;

    mockSkillAPI.onPermissionRequest.mockImplementation((cb) => {
      capturedCallback = cb;
      return () => {};
    });

    window.skillAPI.onPermissionRequest(callback);

    const requestWithoutReason = {
      executionId: "exec-no-reason",
      requestId: "req-no-reason",
      toolName: "Read",
      args: { path: "/tmp/file.txt" },
      // reason is undefined
    };

    capturedCallback?.(requestWithoutReason);

    expect(callback).toHaveBeenCalledWith(
      expect.not.objectContaining({
        reason: expect.anything(),
      }),
    );
  });

  it("should handle rapid consecutive permission requests", () => {
    const callback = vi.fn();
    let capturedCallback: ((request: unknown) => void) | null = null;

    mockSkillAPI.onPermissionRequest.mockImplementation((cb) => {
      capturedCallback = cb;
      return () => {};
    });

    window.skillAPI.onPermissionRequest(callback);

    // Fire 10 requests in rapid succession
    for (let i = 0; i < 10; i++) {
      capturedCallback?.({
        executionId: `exec-rapid-${i}`,
        requestId: `req-rapid-${i}`,
        toolName: "Bash",
        args: { command: `echo ${i}` },
        reason: `Rapid request ${i}`,
      });
    }

    expect(callback).toHaveBeenCalledTimes(10);
  });

  it("should handle sendPermissionResponse without optional fields", async () => {
    mockSkillAPI.sendPermissionResponse.mockResolvedValue(true);

    // Minimal response without rememberChoice or rejectReason
    await window.skillAPI.sendPermissionResponse({
      requestId: "req-minimal",
      approved: true,
    });

    expect(mockSkillAPI.sendPermissionResponse).toHaveBeenCalledWith({
      requestId: "req-minimal",
      approved: true,
    });
  });

  it("should handle very long reason strings", () => {
    const callback = vi.fn();
    let capturedCallback: ((request: unknown) => void) | null = null;

    mockSkillAPI.onPermissionRequest.mockImplementation((cb) => {
      capturedCallback = cb;
      return () => {};
    });

    window.skillAPI.onPermissionRequest(callback);

    const longReason = "A".repeat(10000);
    const requestWithLongReason = {
      executionId: "exec-long",
      requestId: "req-long",
      toolName: "Write",
      args: { path: "/tmp/test.txt" },
      reason: longReason,
    };

    capturedCallback?.(requestWithLongReason);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: longReason,
      }),
    );
  });

  it("should handle special characters in args", () => {
    const callback = vi.fn();
    let capturedCallback: ((request: unknown) => void) | null = null;

    mockSkillAPI.onPermissionRequest.mockImplementation((cb) => {
      capturedCallback = cb;
      return () => {};
    });

    window.skillAPI.onPermissionRequest(callback);

    const specialArgs = {
      command: 'echo "Hello, World!" && rm -rf / || true',
      path: "/tmp/テスト/file.txt",
      content: "日本語コンテンツ with emoji 🎉",
    };

    const requestWithSpecialChars = {
      executionId: "exec-special",
      requestId: "req-special",
      toolName: "Bash",
      args: specialArgs,
      reason: "Execute command with special chars",
    };

    capturedCallback?.(requestWithSpecialChars);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        args: specialArgs,
      }),
    );
  });
});
