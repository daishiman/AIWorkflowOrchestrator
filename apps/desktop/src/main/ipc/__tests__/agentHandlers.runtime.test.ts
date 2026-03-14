/**
 * agentHandlers Runtime Integration Tests
 *
 * RuntimeResolver による agent:start の integrated/handoff 分岐の検証
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";

// === Mocks ===

const mockExecutionManager = {
  startExecution: vi.fn().mockResolvedValue("exec-001"),
  stopExecution: vi.fn(),
  stopAllExecutions: vi.fn(),
  getActiveExecutions: vi.fn().mockReturnValue([]),
  resolvePermission: vi.fn(),
};

vi.mock("../../services/agent", () => ({
  ExecutionManager: vi.fn().mockImplementation(() => mockExecutionManager),
}));

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  BrowserWindow: {
    fromWebContents: vi
      .fn()
      .mockReturnValue({ id: 1, isDestroyed: () => false }),
  },
}));

vi.mock("../../infrastructure/security/ipc-validator.js", () => ({
  validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
  toIPCValidationError: vi.fn().mockImplementation((result) => ({
    success: false,
    error: {
      code: result.errorCode ?? "IPC_UNAUTHORIZED",
      message: result.errorMessage ?? "Unauthorized IPC call",
    },
  })),
}));

// RuntimeResolver mock
const mockResolve = vi.fn();
vi.mock("../../services/runtime/RuntimeResolver", () => ({
  RuntimeResolver: vi.fn().mockImplementation(() => ({
    resolve: mockResolve,
  })),
}));

const mockMainWindow = {
  webContents: {
    send: vi.fn(),
    getURL: vi.fn().mockReturnValue("file://"),
  },
  isDestroyed: () => false,
  id: 1,
} as unknown as BrowserWindowType;

import { ipcMain } from "electron";
import { RuntimeResolver } from "../../services/runtime/RuntimeResolver";

const AGENT_START_CHANNEL = "agent:start";
const mockRuntimeResolver = new RuntimeResolver({} as never, {} as never);

describe("agentHandlers runtime integration", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("RuntimeResolver が integrated を返す → 既存の start フローが続行", async () => {
    mockResolve.mockResolvedValue({ type: "integrated" });

    const { registerAgentExecutionHandlers } = await import("../agentHandlers");
    registerAgentExecutionHandlers(
      mockMainWindow,
      undefined,
      mockRuntimeResolver,
    );

    const handler = handlers.get(AGENT_START_CHANNEL);
    expect(handler).toBeDefined();

    const result = await handler!({}, { prompt: "Hello", options: {} });
    const opResult = result as { success: boolean; executionId: string };

    expect(opResult.success).toBe(true);
    expect(opResult.executionId).toBe("exec-001");
    expect(mockExecutionManager.startExecution).toHaveBeenCalled();
  });

  it("RuntimeResolver が handoff を返す → HandoffGuidance 応答が返される", async () => {
    mockResolve.mockResolvedValue({
      type: "handoff",
      reason: "API key not configured",
    });

    const { registerAgentExecutionHandlers } = await import("../agentHandlers");
    registerAgentExecutionHandlers(
      mockMainWindow,
      undefined,
      mockRuntimeResolver,
    );

    const handler = handlers.get(AGENT_START_CHANNEL);
    expect(handler).toBeDefined();

    const result = await handler!({}, { prompt: "Hello", options: {} });
    const opResult = result as {
      success: boolean;
      handoff: boolean;
      error: string;
      guidance?: { terminalCommand: string; reason: string };
    };

    expect(opResult.success).toBe(false);
    expect(opResult.handoff).toBe(true);
    expect(opResult.error).toContain("API key not configured");
    expect(opResult.guidance?.terminalCommand).toContain("claude");
    expect(mockExecutionManager.startExecution).not.toHaveBeenCalled();
  });
});
