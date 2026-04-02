/**
 * agentHandlers Runtime Integration Tests
 *
 * RuntimePolicyResolver による agent:start の integrated/handoff 分岐の検証
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";
import type { IAuthModeService } from "../../services/auth/types";

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

// RuntimePolicyResolver mock
const mockResolveWithService = vi.fn();
vi.mock("../../services/runtime/RuntimePolicyResolver", () => ({
  RuntimePolicyResolver: vi.fn().mockImplementation(() => ({
    resolveWithService: mockResolveWithService,
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
import { RuntimePolicyResolver } from "../../services/runtime/RuntimePolicyResolver";

const AGENT_START_CHANNEL = "agent:start";
const mockRuntimePolicyResolver = new RuntimePolicyResolver();
const mockAuthModeService: IAuthModeService = {
  getMode: vi.fn().mockReturnValue("subscription"),
  setMode: vi.fn(),
  getStatus: vi.fn(),
  getCredential: vi.fn(),
  onModeChange: vi.fn(),
  validateMode: vi.fn(),
};

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

  it("RuntimePolicyResolver が integrated_api を返す → 既存の start フローが続行", async () => {
    mockResolveWithService.mockResolvedValue({
      type: "integrated_api",
      apiKey: "sk-test",
      permissionMode: "default",
    });

    const { registerAgentExecutionHandlers } = await import("../agentHandlers");
    const mockApprovalGate = {
      grantApproval: vi.fn(),
      rejectApproval: vi.fn(),
      checkApproval: vi.fn(),
      revokeAll: vi.fn(),
    };
    registerAgentExecutionHandlers(
      mockMainWindow,
      mockApprovalGate,
      undefined,
      mockRuntimePolicyResolver,
      mockAuthModeService,
    );

    const handler = handlers.get(AGENT_START_CHANNEL);
    expect(handler).toBeDefined();

    const result = await handler!({}, { prompt: "Hello", options: {} });
    const opResult = result as { success: boolean; executionId: string };

    expect(opResult.success).toBe(true);
    expect(opResult.executionId).toBe("exec-001");
    expect(mockExecutionManager.startExecution).toHaveBeenCalled();
  });

  it("RuntimePolicyResolver が terminal_handoff を返す → HandoffGuidance 応答が返される", async () => {
    mockResolveWithService.mockResolvedValue({
      type: "terminal_handoff",
      bundle: {
        launcher: "claude",
        promptBundle: "",
        cwd: "/tmp/runtime",
        suggestedCommand: 'claude -p "Hello"',
        manualRetryRule: "APIキーが設定されていません。",
      },
    });

    const { registerAgentExecutionHandlers } = await import("../agentHandlers");
    const mockApprovalGate2 = {
      grantApproval: vi.fn(),
      rejectApproval: vi.fn(),
      checkApproval: vi.fn(),
      revokeAll: vi.fn(),
    };
    registerAgentExecutionHandlers(
      mockMainWindow,
      mockApprovalGate2,
      undefined,
      mockRuntimePolicyResolver,
      mockAuthModeService,
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
    expect(opResult.error).toContain("APIキーが設定されていません");
    expect(opResult.guidance?.terminalCommand).toContain("claude");
    expect(mockExecutionManager.startExecution).not.toHaveBeenCalled();
  });
});
