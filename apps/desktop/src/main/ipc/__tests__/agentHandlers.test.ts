/**
 * Agent IPC Handlers Tests
 * Phase 4: TDD Red - All tests should fail until implementation
 *
 * Tests for IPC handler registration and invocation
 * @see docs/30-workflows/claude-code-integration/outputs/phase-2/architecture-design.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";

// Mock ExecutionManager
const mockStartExecution = vi.fn();
const mockStopExecution = vi.fn();
const mockStopAllExecutions = vi.fn();
const mockGetActiveExecutions = vi.fn();
const mockResolvePermission = vi.fn();

vi.mock("../../services/agent/ExecutionManager", () => ({
  ExecutionManager: vi.fn().mockImplementation(() => ({
    startExecution: mockStartExecution,
    stopExecution: mockStopExecution,
    stopAllExecutions: mockStopAllExecutions,
    getActiveExecutions: mockGetActiveExecutions,
    resolvePermission: mockResolvePermission,
  })),
}));

// Mock electron modules
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  BrowserWindow: {
    fromWebContents: vi.fn().mockReturnValue({ id: 1 }),
  },
}));

// Mock ipc-validator
vi.mock("../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
  toIPCValidationError: vi.fn().mockImplementation((result) => ({
    code: "IPC_VALIDATION_ERROR",
    message: result.reason || "Validation failed",
  })),
}));

// Import after mocks
import { ipcMain } from "electron";

// Mock BrowserWindow for validation
const mockMainWindow = {
  webContents: {
    send: vi.fn(),
  },
  isDestroyed: () => false,
  id: 1,
} as unknown as BrowserWindowType;

// Mock event with proper structure
const mockEvent = {
  sender: {
    id: 1,
  },
};

describe("agentHandlers", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    // Capture registered handlers
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    // Default mock responses
    mockStartExecution.mockResolvedValue("exec-id");
    mockStopExecution.mockReturnValue(true);
    mockStopAllExecutions.mockReturnValue(undefined);
    mockGetActiveExecutions.mockReturnValue(["exec-1", "exec-2"]);
    mockResolvePermission.mockReturnValue(true);

    // Register handlers
    const { registerAgentExecutionHandlers } = await import("../agentHandlers");
    const mockApprovalGate = {
      grantApproval: vi.fn(),
      rejectApproval: vi.fn(),
      checkApproval: vi.fn(),
      revokeAll: vi.fn(),
    };
    registerAgentExecutionHandlers(mockMainWindow, mockApprovalGate);
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe("registerAgentExecutionHandlers", () => {
    it("should register agent:start handler", () => {
      expect(handlers.has("agent:start")).toBe(true);
    });

    it("should register agent:stop handler", () => {
      expect(handlers.has("agent:stop")).toBe(true);
    });

    it("should register agent:stop-all handler", () => {
      expect(handlers.has("agent:stop-all")).toBe(true);
    });

    it("should register agent:get-active-executions handler", () => {
      expect(handlers.has("agent:get-active-executions")).toBe(true);
    });

    it("should register agent:permission:res handler", () => {
      expect(handlers.has("agent:permission:res")).toBe(true);
    });
  });

  describe("agent:start", () => {
    it("should start execution and return executionId", async () => {
      const handler = handlers.get("agent:start");
      expect(handler).toBeDefined();

      const request = {
        executionId: "test-id",
        skillId: "skill-1",
        skillPath: "/path",
        prompt: "Test prompt",
      };

      const result = await handler!(mockEvent, request);

      expect(mockStartExecution).toHaveBeenCalled();
      expect(result).toEqual({ success: true, executionId: "exec-id" });
    });

    it("should throw error if prompt is missing", async () => {
      const handler = handlers.get("agent:start");
      expect(handler).toBeDefined();

      const request = {
        skillId: "skill-1",
      };

      await expect(handler!(mockEvent, request)).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
    });
  });

  describe("agent:stop", () => {
    it("should stop execution and return success", async () => {
      const handler = handlers.get("agent:stop");
      expect(handler).toBeDefined();

      const result = await handler!(mockEvent, { executionId: "exec-1" });

      expect(mockStopExecution).toHaveBeenCalledWith("exec-1");
      expect(result).toEqual({ success: true });
    });

    it("should throw error if executionId is missing", async () => {
      const handler = handlers.get("agent:stop");
      expect(handler).toBeDefined();

      await expect(handler!(mockEvent, {})).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
    });
  });

  describe("agent:stop-all", () => {
    it("should stop all executions and return success", async () => {
      const handler = handlers.get("agent:stop-all");
      expect(handler).toBeDefined();

      const result = await handler!(mockEvent);

      expect(mockStopAllExecutions).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });

  describe("agent:get-active-executions", () => {
    it("should return list of active executions", async () => {
      const handler = handlers.get("agent:get-active-executions");
      expect(handler).toBeDefined();

      const result = await handler!(mockEvent);

      expect(mockGetActiveExecutions).toHaveBeenCalled();
      expect(result).toEqual({ executions: ["exec-1", "exec-2"] });
    });
  });

  describe("agent:permission:res", () => {
    it("should resolve permission and return success", async () => {
      const handler = handlers.get("agent:permission:res");
      expect(handler).toBeDefined();

      const response = {
        requestId: "req-1",
        approved: true,
      };

      const result = await handler!(mockEvent, response);

      expect(result).toEqual({ success: true });
    });

    it("should throw error if requestId is missing", async () => {
      const handler = handlers.get("agent:permission:res");
      expect(handler).toBeDefined();

      await expect(
        handler!(mockEvent, { approved: true }),
      ).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
    });

    it("should throw error if approved is missing", async () => {
      const handler = handlers.get("agent:permission:res");
      expect(handler).toBeDefined();

      await expect(
        handler!(mockEvent, { requestId: "req-1" }),
      ).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
    });
  });

  describe("unregisterAgentExecutionHandlers", () => {
    it("should stop all executions and remove handlers", async () => {
      const { unregisterAgentExecutionHandlers, getExecutionManager } =
        await import("../agentHandlers");

      // Verify manager exists before unregister
      expect(getExecutionManager()).not.toBeNull();

      // Unregister handlers
      unregisterAgentExecutionHandlers();

      // Verify stopAllExecutions was called
      expect(mockStopAllExecutions).toHaveBeenCalled();

      // Verify handlers are removed
      expect(ipcMain.removeHandler).toHaveBeenCalledWith("agent:start");
      expect(ipcMain.removeHandler).toHaveBeenCalledWith("agent:stop");
      expect(ipcMain.removeHandler).toHaveBeenCalledWith("agent:stop-all");
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        "agent:get-active-executions",
      );
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        "agent:permission:res",
      );

      // Verify manager is null after unregister
      expect(getExecutionManager()).toBeNull();
    });
  });

  describe("getExecutionManager", () => {
    it("should return the execution manager instance", async () => {
      const { getExecutionManager } = await import("../agentHandlers");

      const manager = getExecutionManager();

      expect(manager).not.toBeNull();
      expect(manager).toHaveProperty("startExecution");
      expect(manager).toHaveProperty("stopExecution");
    });
  });
});
