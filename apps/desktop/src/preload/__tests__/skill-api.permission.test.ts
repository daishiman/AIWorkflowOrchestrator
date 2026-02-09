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

// Mock electron module - vi.hoisted()でホイスティング対応
const { mockInvoke, mockOn, mockRemoveListener } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
  mockOn: vi.fn(),
  mockRemoveListener: vi.fn(),
}));

vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: mockInvoke,
    on: mockOn,
    removeListener: mockRemoveListener,
  },
}));

// Import after mocking - skillAPI uses ipcRenderer internally
import { skillAPI } from "../skill-api";

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should register a permission request listener", () => {
    const callback = vi.fn();

    const unsubscribe = skillAPI.onPermissionRequest(callback);

    expect(mockOn).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
      expect.any(Function),
    );
    expect(typeof unsubscribe).toBe("function");
  });

  it("should call the callback when permission request is received", () => {
    const callback = vi.fn();
    let capturedHandler: ((_event: unknown, data: unknown) => void) | null =
      null;

    mockOn.mockImplementation((_channel, handler) => {
      capturedHandler = handler;
    });

    skillAPI.onPermissionRequest(callback);

    const mockRequest = {
      executionId: "exec-test-001",
      requestId: "req-test-001",
      toolName: "Bash",
      args: { command: "echo test" },
      reason: "Execute command: echo test",
    };

    capturedHandler?.({}, mockRequest);

    expect(callback).toHaveBeenCalledWith(mockRequest);
  });

  it("should return a cleanup function", () => {
    const callback = vi.fn();

    const unsubscribe = skillAPI.onPermissionRequest(callback);

    expect(typeof unsubscribe).toBe("function");

    unsubscribe();
    expect(mockRemoveListener).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
      expect.any(Function),
    );
  });

  it("should not call callback after unsubscribe", () => {
    const callback = vi.fn();
    let _capturedHandler: ((_event: unknown, data: unknown) => void) | null =
      null;
    let isUnsubscribed = false;

    mockOn.mockImplementation((_channel, handler) => {
      _capturedHandler = handler;
    });

    mockRemoveListener.mockImplementation(() => {
      isUnsubscribed = true;
    });

    const unsub = skillAPI.onPermissionRequest(callback);
    unsub();

    expect(mockRemoveListener).toHaveBeenCalled();
    expect(isUnsubscribed).toBe(true);
  });

  it("should handle multiple permission listeners", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const unsub1 = skillAPI.onPermissionRequest(callback1);
    const unsub2 = skillAPI.onPermissionRequest(callback2);

    expect(mockOn).toHaveBeenCalledTimes(2);
    expect(typeof unsub1).toBe("function");
    expect(typeof unsub2).toBe("function");
  });
});

// ============================================================
// 3. skillAPI.sendPermissionResponse Tests
// ============================================================
describe("skillAPI.sendPermissionResponse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should send permission response with approved=true", async () => {
    mockInvoke.mockResolvedValue(true);

    const response = {
      requestId: "req-test-001",
      approved: true,
    };

    await skillAPI.sendPermissionResponse(response);

    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
      response,
    );
  });

  it("should send permission response with approved=false", async () => {
    mockInvoke.mockResolvedValue(true);

    const response = {
      requestId: "req-test-001",
      approved: false,
    };

    await skillAPI.sendPermissionResponse(response);

    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
      response,
    );
  });

  it("should include rememberChoice when provided", async () => {
    mockInvoke.mockResolvedValue(true);

    const response = {
      requestId: "req-test-001",
      approved: true,
      rememberChoice: true,
    };

    await skillAPI.sendPermissionResponse(response);

    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
      expect.objectContaining({
        rememberChoice: true,
      }),
    );
  });

  it("should include rejectReason when provided", async () => {
    mockInvoke.mockResolvedValue(true);

    const response = {
      requestId: "req-test-001",
      approved: false,
      rejectReason: "User declined the request",
    };

    await skillAPI.sendPermissionResponse(response);

    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
      expect.objectContaining({
        rejectReason: "User declined the request",
      }),
    );
  });

  it("should return true on successful response", async () => {
    mockInvoke.mockResolvedValue(true);

    const result = await skillAPI.sendPermissionResponse({
      requestId: "req-test-001",
      approved: true,
    });

    expect(result).toBe(true);
  });

  it("should handle IPC error gracefully", async () => {
    mockInvoke.mockRejectedValue(new Error("IPC connection failed"));

    await expect(
      skillAPI.sendPermissionResponse({
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should receive permission request with all required fields", () => {
    const callback = vi.fn();
    let capturedHandler: ((_event: unknown, data: unknown) => void) | null =
      null;

    mockOn.mockImplementation((_channel, handler) => {
      capturedHandler = handler;
    });

    skillAPI.onPermissionRequest(callback);

    const validRequest = {
      executionId: "exec-123",
      requestId: "req-456",
      toolName: "Bash",
      args: { command: "ls -la" },
      reason: "List directory contents",
    };

    capturedHandler?.({}, validRequest);

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
    let capturedHandler: ((_event: unknown, data: unknown) => void) | null =
      null;

    mockOn.mockImplementation((_channel, handler) => {
      capturedHandler = handler;
    });

    skillAPI.onPermissionRequest(callback);

    const requestWithTimestamp = {
      executionId: "exec-123",
      requestId: "req-456",
      toolName: "Bash",
      args: { command: "ls -la" },
      reason: "List directory contents",
      timestamp: Date.now(),
    };

    capturedHandler?.({}, requestWithTimestamp);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        timestamp: expect.any(Number),
      }),
    );
  });

  it("should handle args with various data types", () => {
    const callback = vi.fn();
    let capturedHandler: ((_event: unknown, data: unknown) => void) | null =
      null;

    mockOn.mockImplementation((_channel, handler) => {
      capturedHandler = handler;
    });

    skillAPI.onPermissionRequest(callback);

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

    capturedHandler?.({}, request);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        args: complexArgs,
      }),
    );
  });

  it("should handle sanitized args with [REDACTED] values", () => {
    const callback = vi.fn();
    let capturedHandler: ((_event: unknown, data: unknown) => void) | null =
      null;

    mockOn.mockImplementation((_channel, handler) => {
      capturedHandler = handler;
    });

    skillAPI.onPermissionRequest(callback);

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

    capturedHandler?.({}, request);

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
// 5. skillAPI Permission Method Availability Tests
// ============================================================
describe("skillAPI - Permission Methods Availability", () => {
  it("should have onPermissionRequest method", () => {
    expect(skillAPI.onPermissionRequest).toBeInstanceOf(Function);
  });

  it("should have sendPermissionResponse method", () => {
    expect(skillAPI.sendPermissionResponse).toBeInstanceOf(Function);
  });
});

// ============================================================
// 6. IPC Integration Simulation Tests
// ============================================================
describe("skillAPI permission - IPC integration simulation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should handle complete permission flow: request -> dialog -> approve", async () => {
    let capturedHandler: ((_event: unknown, data: unknown) => void) | null =
      null;
    mockOn.mockImplementation((_channel, handler) => {
      capturedHandler = handler;
    });
    mockInvoke.mockResolvedValue(true);

    // Step 1: Register listener
    const dialogHandler = vi.fn();
    skillAPI.onPermissionRequest(dialogHandler);

    // Step 2: Simulate Main Process sending permission request
    const permissionRequest = {
      executionId: "exec-flow-001",
      requestId: "req-flow-001",
      toolName: "Write",
      args: { path: "/tmp/test.txt", content: "Hello" },
      reason: "Write file: /tmp/test.txt",
    };
    capturedHandler?.({}, permissionRequest);

    // Step 3: Verify dialog handler received the request
    expect(dialogHandler).toHaveBeenCalledWith(permissionRequest);

    // Step 4: Simulate user approval
    await skillAPI.sendPermissionResponse({
      requestId: "req-flow-001",
      approved: true,
      rememberChoice: false,
    });

    // Step 5: Verify response was sent
    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
      {
        requestId: "req-flow-001",
        approved: true,
        rememberChoice: false,
      },
    );
  });

  it("should handle complete permission flow: request -> dialog -> deny", async () => {
    let capturedHandler: ((_event: unknown, data: unknown) => void) | null =
      null;
    mockOn.mockImplementation((_channel, handler) => {
      capturedHandler = handler;
    });
    mockInvoke.mockResolvedValue(true);

    // Register listener
    const dialogHandler = vi.fn();
    skillAPI.onPermissionRequest(dialogHandler);

    // Simulate permission request
    const permissionRequest = {
      executionId: "exec-deny-001",
      requestId: "req-deny-001",
      toolName: "Bash",
      args: { command: "rm -rf /" },
      reason: "Execute dangerous command",
    };
    capturedHandler?.({}, permissionRequest);

    expect(dialogHandler).toHaveBeenCalledWith(permissionRequest);

    // Simulate user denial
    await skillAPI.sendPermissionResponse({
      requestId: "req-deny-001",
      approved: false,
      rememberChoice: true,
    });

    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
      {
        requestId: "req-deny-001",
        approved: false,
        rememberChoice: true,
      },
    );
  });

  it("should handle multiple concurrent permission requests", async () => {
    let capturedHandler: ((_event: unknown, data: unknown) => void) | null =
      null;
    mockOn.mockImplementation((_channel, handler) => {
      capturedHandler = handler;
    });
    mockInvoke.mockResolvedValue(true);

    const dialogHandler = vi.fn();
    skillAPI.onPermissionRequest(dialogHandler);

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

    capturedHandler?.({}, request1);
    capturedHandler?.({}, request2);

    expect(dialogHandler).toHaveBeenCalledTimes(2);
    expect(dialogHandler).toHaveBeenNthCalledWith(1, request1);
    expect(dialogHandler).toHaveBeenNthCalledWith(2, request2);

    // Respond to requests (out of order)
    await skillAPI.sendPermissionResponse({
      requestId: "req-2",
      approved: true,
    });
    await skillAPI.sendPermissionResponse({
      requestId: "req-1",
      approved: false,
    });

    expect(mockInvoke).toHaveBeenCalledTimes(2);
  });
});

// ============================================================
// 7. Edge Case Tests
// ============================================================
describe("skillAPI permission - edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should handle empty args object", () => {
    const callback = vi.fn();
    let capturedHandler: ((_event: unknown, data: unknown) => void) | null =
      null;

    mockOn.mockImplementation((_channel, handler) => {
      capturedHandler = handler;
    });

    skillAPI.onPermissionRequest(callback);

    const requestWithEmptyArgs = {
      executionId: "exec-empty-args",
      requestId: "req-empty-args",
      toolName: "Glob",
      args: {},
      reason: "Search for files",
    };

    capturedHandler?.({}, requestWithEmptyArgs);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        args: {},
      }),
    );
  });

  it("should handle undefined reason", () => {
    const callback = vi.fn();
    let capturedHandler: ((_event: unknown, data: unknown) => void) | null =
      null;

    mockOn.mockImplementation((_channel, handler) => {
      capturedHandler = handler;
    });

    skillAPI.onPermissionRequest(callback);

    const requestWithoutReason = {
      executionId: "exec-no-reason",
      requestId: "req-no-reason",
      toolName: "Read",
      args: { path: "/tmp/file.txt" },
      // reason is undefined
    };

    capturedHandler?.({}, requestWithoutReason);

    expect(callback).toHaveBeenCalledWith(
      expect.not.objectContaining({
        reason: expect.anything(),
      }),
    );
  });

  it("should handle rapid consecutive permission requests", () => {
    const callback = vi.fn();
    let capturedHandler: ((_event: unknown, data: unknown) => void) | null =
      null;

    mockOn.mockImplementation((_channel, handler) => {
      capturedHandler = handler;
    });

    skillAPI.onPermissionRequest(callback);

    // Fire 10 requests in rapid succession
    for (let i = 0; i < 10; i++) {
      capturedHandler?.(
        {},
        {
          executionId: `exec-rapid-${i}`,
          requestId: `req-rapid-${i}`,
          toolName: "Bash",
          args: { command: `echo ${i}` },
          reason: `Rapid request ${i}`,
        },
      );
    }

    expect(callback).toHaveBeenCalledTimes(10);
  });

  it("should handle sendPermissionResponse without optional fields", async () => {
    mockInvoke.mockResolvedValue(true);

    // Minimal response without rememberChoice or rejectReason
    await skillAPI.sendPermissionResponse({
      requestId: "req-minimal",
      approved: true,
    });

    expect(mockInvoke).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
      {
        requestId: "req-minimal",
        approved: true,
      },
    );
  });

  it("should handle very long reason strings", () => {
    const callback = vi.fn();
    let capturedHandler: ((_event: unknown, data: unknown) => void) | null =
      null;

    mockOn.mockImplementation((_channel, handler) => {
      capturedHandler = handler;
    });

    skillAPI.onPermissionRequest(callback);

    const longReason = "A".repeat(10000);
    const requestWithLongReason = {
      executionId: "exec-long",
      requestId: "req-long",
      toolName: "Write",
      args: { path: "/tmp/test.txt" },
      reason: longReason,
    };

    capturedHandler?.({}, requestWithLongReason);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: longReason,
      }),
    );
  });

  it("should handle special characters in args", () => {
    const callback = vi.fn();
    let capturedHandler: ((_event: unknown, data: unknown) => void) | null =
      null;

    mockOn.mockImplementation((_channel, handler) => {
      capturedHandler = handler;
    });

    skillAPI.onPermissionRequest(callback);

    const specialArgs = {
      command: 'echo "Hello, World!" && rm -rf / || true',
      path: "/tmp/test/file.txt",
      content: "Japanese content with emoji",
    };

    const requestWithSpecialChars = {
      executionId: "exec-special",
      requestId: "req-special",
      toolName: "Bash",
      args: specialArgs,
      reason: "Execute command with special chars",
    };

    capturedHandler?.({}, requestWithSpecialChars);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        args: specialArgs,
      }),
    );
  });
});
