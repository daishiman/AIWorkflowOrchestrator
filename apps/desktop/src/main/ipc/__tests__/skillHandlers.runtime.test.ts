/**
 * skillHandlers Runtime Integration Tests
 *
 * RuntimeResolver による integrated/handoff 分岐の検証
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";

// === Mocks ===

vi.mock("electron-store", () => {
  return {
    default: class MockElectronStore {
      private data: Record<string, unknown> = {};
      get(key: string) {
        return this.data[key];
      }
      set(key: string | Record<string, unknown>, value?: unknown) {
        if (typeof key === "object") {
          Object.assign(this.data, key);
        } else {
          this.data[key] = value;
        }
      }
      clear() {
        this.data = {};
      }
    },
  };
});

const mockSkillService = {
  scanAvailableSkills: vi.fn(),
  getImportedSkills: vi.fn(),
  importSkills: vi.fn(),
  removeSkill: vi.fn(),
  getSkillById: vi.fn(),
  getSkillByName: vi.fn(),
  executeSkill: vi.fn(),
  clearCache: vi.fn(),
  setSkillExecutor: vi.fn(),
  getSkillsDirectory: vi.fn().mockReturnValue("/mock/skills/dir"),
};

const mockMainWindow = {
  webContents: {
    send: vi.fn(),
    getURL: vi.fn().mockReturnValue("file://"),
  },
  isDestroyed: () => false,
  id: 1,
} as unknown as BrowserWindowType;

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
  withValidation: vi.fn(
    (
      _channel: string,
      handler: (...args: unknown[]) => Promise<unknown>,
      _options: unknown,
    ) => handler,
  ),
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

import { ipcMain } from "electron";
import { RuntimeResolver } from "../../services/runtime/RuntimeResolver";

const SKILL_EXECUTE_CHANNEL = "skill:execute";
const mockRuntimeResolver = new RuntimeResolver({} as never, {} as never);

describe("skillHandlers runtime integration", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    mockSkillService.executeSkill.mockResolvedValue({
      executionId: "exec-1",
      status: "success",
      output: "OK",
      startedAt: new Date(),
      completedAt: new Date(),
    });
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("RuntimeResolver が integrated を返す → 既存の execute フローが続行", async () => {
    mockResolve.mockResolvedValue({ type: "integrated" });

    const { registerSkillHandlers } = await import("../skillHandlers");
    registerSkillHandlers(
      mockMainWindow,
      mockSkillService as never,
      undefined,
      mockRuntimeResolver,
    );

    const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
    expect(handler).toBeDefined();

    const result = await handler!({}, { skillId: "skill-1" });
    const opResult = result as {
      success: boolean;
      data?: { executionId: string };
    };

    expect(opResult.success).toBe(true);
    expect(opResult.data?.executionId).toBe("exec-1");
  });

  it("RuntimeResolver が handoff を返す → HandoffGuidance 応答が返される", async () => {
    mockResolve.mockResolvedValue({
      type: "handoff",
      reason:
        "サブスクリプションモードのため、Claude Code CLI で続行してください。",
    });

    const { registerSkillHandlers } = await import("../skillHandlers");
    registerSkillHandlers(
      mockMainWindow,
      mockSkillService as never,
      undefined,
      mockRuntimeResolver,
    );

    const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
    expect(handler).toBeDefined();

    const result = await handler!({}, { skillId: "skill-1" });
    const opResult = result as {
      success: boolean;
      data?: {
        success: boolean;
        handoff?: boolean;
        error?: string;
        guidance?: { terminalCommand: string; reason: string };
      };
    };

    expect(opResult.success).toBe(true);
    expect(opResult.data?.handoff).toBe(true);
    expect(opResult.data?.success).toBe(false);
    expect(opResult.data?.error).toContain("サブスクリプションモード");
    expect(opResult.data?.guidance?.terminalCommand).toContain("claude");
  });

  it("RuntimeResolver が注入されない → 既存の execute フロー（後方互換）", async () => {
    // RuntimeResolver を注入しないケース
    const { registerSkillHandlers } = await import("../skillHandlers");
    registerSkillHandlers(mockMainWindow, mockSkillService as never);

    const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
    expect(handler).toBeDefined();

    // RuntimeResolver が resolve を返さなくても executeSkill が呼ばれる
    const result = await handler!({}, { skillId: "skill-1" });
    const opResult = result as {
      success: boolean;
      data?: { executionId: string };
    };

    expect(opResult.success).toBe(true);
    expect(mockSkillService.executeSkill).toHaveBeenCalled();
  });
});
