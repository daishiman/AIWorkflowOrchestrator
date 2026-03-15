/**
 * Agent SDK Integration Tests
 * Phase 6: Integration testing for IPC communication and SDK flow
 *
 * Tests the full execution flow: Renderer → Main → SDK → Main → Renderer
 * @see docs/30-workflows/claude-code-integration/outputs/phase-4/integration-test-design.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";

// Mock ExecutionManager
const mockStartExecution = vi.fn();
const mockStopExecution = vi.fn();
const mockStopAllExecutions = vi.fn();
const mockGetActiveExecutions = vi.fn();
const mockResolvePermission = vi.fn();

vi.mock("../ExecutionManager", () => ({
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
vi.mock("../../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
  toIPCValidationError: vi.fn().mockImplementation((result) => ({
    code: "IPC_VALIDATION_ERROR",
    message: result.reason || "Validation failed",
  })),
}));

import { ipcMain } from "electron";

// Mock BrowserWindow
const mockMainWindow = {
  webContents: {
    send: vi.fn(),
  },
  isDestroyed: () => false,
  id: 1,
} as unknown as BrowserWindowType;

// Mock event
const mockEvent = {
  sender: {
    id: 1,
  },
};

describe("Agent SDK Integration", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    mockStartExecution.mockResolvedValue("exec-id");
    mockStopExecution.mockReturnValue(true);
    mockStopAllExecutions.mockReturnValue(undefined);
    mockGetActiveExecutions.mockReturnValue(["exec-1"]);
    mockResolvePermission.mockReturnValue(true);

    const { registerAgentExecutionHandlers } =
      await import("../../../ipc/agentHandlers");
    registerAgentExecutionHandlers(mockMainWindow);
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe("IPC Communication", () => {
    it("should handle full execution flow", async () => {
      const startHandler = handlers.get("agent:start");
      expect(startHandler).toBeDefined();

      // Step 1: Start execution
      const startResult = await startHandler!(mockEvent, {
        prompt: "Test execution",
        executionId: "flow-test",
      });

      expect(startResult).toEqual({ success: true, executionId: "exec-id" });
      expect(mockStartExecution).toHaveBeenCalledWith(
        expect.objectContaining({ prompt: "Test execution" }),
        mockMainWindow,
        undefined,
      );

      // Step 2: Get active executions
      const getActiveHandler = handlers.get("agent:get-active-executions");
      const activeResult = await getActiveHandler!(mockEvent);

      expect(activeResult).toEqual({ executions: ["exec-1"] });

      // Step 3: Stop execution
      const stopHandler = handlers.get("agent:stop");
      const stopResult = await stopHandler!(mockEvent, {
        executionId: "exec-1",
      });

      expect(stopResult).toEqual({ success: true });
    });

    it("should handle permission request flow", async () => {
      const permissionHandler = handlers.get("agent:permission:res");
      expect(permissionHandler).toBeDefined();

      // Simulate permission response
      const permResult = await permissionHandler!(mockEvent, {
        requestId: "req-1",
        approved: true,
        rememberChoice: false,
      });

      expect(permResult).toEqual({ success: true });
    });

    it("should handle cancellation flow", async () => {
      const startHandler = handlers.get("agent:start");
      const stopAllHandler = handlers.get("agent:stop-all");

      // Start execution
      await startHandler!(mockEvent, {
        prompt: "To be cancelled",
      });

      // Stop all executions
      const stopAllResult = await stopAllHandler!(mockEvent);

      expect(stopAllResult).toEqual({ success: true });
      expect(mockStopAllExecutions).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should propagate SDK errors to Renderer", async () => {
      mockStartExecution.mockRejectedValue(new Error("SDK connection failed"));

      const startHandler = handlers.get("agent:start");
      expect(startHandler).toBeDefined();

      await expect(
        startHandler!(mockEvent, { prompt: "Error test" }),
      ).rejects.toThrow("SDK connection failed");
    });

    it("should handle IPC validation failure", async () => {
      const { validateIpcSender } =
        await import("../../../infrastructure/security/ipc-validator");
      (validateIpcSender as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        valid: false,
        reason: "Invalid sender",
      });

      const startHandler = handlers.get("agent:start");
      expect(startHandler).toBeDefined();

      await expect(
        startHandler!(mockEvent, { prompt: "Invalid sender test" }),
      ).rejects.toMatchObject({
        code: "IPC_VALIDATION_ERROR",
      });
    });

    it("should handle missing required fields", async () => {
      const startHandler = handlers.get("agent:start");
      expect(startHandler).toBeDefined();

      // Missing prompt
      await expect(startHandler!(mockEvent, {})).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
    });
  });

  describe("Concurrent Executions", () => {
    it("should handle multiple simultaneous executions", async () => {
      const startHandler = handlers.get("agent:start");
      expect(startHandler).toBeDefined();

      // Start multiple executions concurrently
      const [result1, result2, result3] = await Promise.all([
        startHandler!(mockEvent, { prompt: "Concurrent 1" }),
        startHandler!(mockEvent, { prompt: "Concurrent 2" }),
        startHandler!(mockEvent, { prompt: "Concurrent 3" }),
      ]);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result3).toBeDefined();
      expect(mockStartExecution).toHaveBeenCalledTimes(3);
    });

    it("should isolate execution contexts", async () => {
      mockStartExecution.mockResolvedValueOnce("exec-1");
      mockStartExecution.mockResolvedValueOnce("exec-2");

      const startHandler = handlers.get("agent:start");

      const result1 = await startHandler!(mockEvent, {
        prompt: "Context 1",
        executionId: "exec-1",
      });
      const result2 = await startHandler!(mockEvent, {
        prompt: "Context 2",
        executionId: "exec-2",
      });

      expect(result1).toEqual({ success: true, executionId: "exec-1" });
      expect(result2).toEqual({ success: true, executionId: "exec-2" });
    });
  });
});
