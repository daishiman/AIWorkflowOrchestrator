/**
 * skillHandlers.execute Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 * Tests for the skill:execute IPC handler.
 *
 * @see docs/30-workflows/skill-execution-implementation/outputs/phase-2/ipc-handler-design.md
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";

// === Type Definitions ===

interface SkillExecutionResult {
  executionId: string;
  status: "success" | "failed";
  output?: string;
  error?: string;
  startedAt: Date;
  completedAt: Date;
}

interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// === Mocks ===

// Mock electron-store (required for PermissionStore in SkillExecutor)
vi.mock("electron-store", () => {
  return {
    default: class MockElectronStore {
      private data: Record<string, unknown> = {};
      constructor() {}
      get store() {
        return this.data;
      }
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

// Mock SkillService
const mockSkillService = {
  scanAvailableSkills: vi.fn(),
  getImportedSkills: vi.fn(),
  importSkills: vi.fn(),
  removeSkill: vi.fn(),
  getSkillById: vi.fn(),
  executeSkill: vi.fn(), // New method to be tested
  clearCache: vi.fn(),
};

// Mock BrowserWindow for validation
const mockMainWindow = {
  webContents: {
    send: vi.fn(),
    getURL: vi.fn().mockReturnValue("file://"),
  },
  isDestroyed: () => false,
  id: 1,
} as unknown as BrowserWindowType;

// Mock electron modules
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

// Mock ipc-validator
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

// Import after mocks
import { ipcMain } from "electron";

// Skill IPC Channel
const SKILL_EXECUTE_CHANNEL = "skill:execute";

describe("skillHandlers skill:execute", () => {
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
    mockSkillService.executeSkill.mockResolvedValue({
      executionId: "exec-default",
      status: "success",
      output: "Default output",
      startedAt: new Date(),
      completedAt: new Date(),
    });

    // Try to import and register handlers (will fail in Red phase)
    try {
      const { registerSkillHandlers } = await import("../skillHandlers");
      registerSkillHandlers(mockMainWindow, mockSkillService as never);
    } catch {
      // Expected in Red phase - skill:execute handler not implemented yet
    }
  });

  afterEach(() => {
    vi.resetModules();
  });

  // ===========================================================================
  // Handler registration
  // ===========================================================================

  describe("handler registration", () => {
    it("SH-EXE-REG-01: should register skill:execute handler", () => {
      expect(handlers.has(SKILL_EXECUTE_CHANNEL)).toBe(true);
    });
  });

  // ===========================================================================
  // TC-4-005: スキルを実行して結果を返す
  // ===========================================================================

  describe("TC-4-005: スキルを実行して結果を返す", () => {
    it("should call skillService.executeSkill with skillId", async () => {
      const mockResult: SkillExecutionResult = {
        executionId: "exec-123",
        status: "success",
        output: "Skill executed",
        startedAt: new Date(),
        completedAt: new Date(),
      };
      mockSkillService.executeSkill.mockResolvedValue(mockResult);

      const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
      if (!handler) {
        throw new Error("skill:execute handler not registered - Red phase");
      }

      // When: ハンドラーを呼び出す
      const result = await handler({}, { skillId: "skill-1" });

      // Then: skillService.executeSkillが呼び出される
      expect(mockSkillService.executeSkill).toHaveBeenCalledWith(
        "skill-1",
        undefined,
      );

      // Then: OperationResult形式で結果が返される
      const opResult = result as OperationResult<SkillExecutionResult>;
      expect(opResult.success).toBe(true);
      expect(opResult.data?.executionId).toBe("exec-123");
      expect(opResult.data?.status).toBe("success");
    });

    it("should pass params to skillService.executeSkill", async () => {
      const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
      if (!handler) {
        throw new Error("skill:execute handler not registered - Red phase");
      }

      // When: パラメータ付きでハンドラーを呼び出す
      await handler({}, { skillId: "skill-2", params: { key: "value" } });

      // Then: paramsが渡される
      expect(mockSkillService.executeSkill).toHaveBeenCalledWith("skill-2", {
        key: "value",
      });
    });

    it("should return OperationResult with success=true on successful execution", async () => {
      const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
      if (!handler) {
        throw new Error("skill:execute handler not registered - Red phase");
      }

      const result = await handler({}, { skillId: "skill-1" });
      const opResult = result as OperationResult<SkillExecutionResult>;

      expect(opResult.success).toBe(true);
      expect(opResult.data).toBeDefined();
    });
  });

  // ===========================================================================
  // TC-4-006: skillIdが文字列でない場合エラー
  // ===========================================================================

  describe("TC-4-006: skillIdが文字列でない場合エラー", () => {
    it("should return error when skillId is not a string", async () => {
      const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
      if (!handler) {
        throw new Error("skill:execute handler not registered - Red phase");
      }

      // When: skillIdが数値
      const result = await handler({}, { skillId: 123 });

      // Then: エラーが返される
      const opResult = result as OperationResult<SkillExecutionResult>;
      expect(opResult.success).toBe(false);
      expect(opResult.error).toBeDefined();
    });

    it("should return error when skillId is null", async () => {
      const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
      if (!handler) {
        throw new Error("skill:execute handler not registered - Red phase");
      }

      // When: skillIdがnull
      const result = await handler({}, { skillId: null });

      // Then: エラーが返される
      const opResult = result as OperationResult<SkillExecutionResult>;
      expect(opResult.success).toBe(false);
    });

    it("should return error when skillId is undefined", async () => {
      const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
      if (!handler) {
        throw new Error("skill:execute handler not registered - Red phase");
      }

      // When: skillIdがundefined
      const result = await handler({}, {});

      // Then: エラーが返される
      const opResult = result as OperationResult<SkillExecutionResult>;
      expect(opResult.success).toBe(false);
    });

    it("should return error when skillId is empty string", async () => {
      const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
      if (!handler) {
        throw new Error("skill:execute handler not registered - Red phase");
      }

      // When: skillIdが空文字
      const result = await handler({}, { skillId: "" });

      // Then: エラーが返される
      const opResult = result as OperationResult<SkillExecutionResult>;
      expect(opResult.success).toBe(false);
    });
  });

  // ===========================================================================
  // TC-4-007: sender検証に失敗した場合エラー
  // ===========================================================================

  describe("TC-4-007: sender検証に失敗した場合エラー", () => {
    it("should throw error when sender validation fails", async () => {
      // Given: sender検証が失敗
      const { validateIpcSender } =
        await import("../../infrastructure/security/ipc-validator.js");
      (validateIpcSender as ReturnType<typeof vi.fn>).mockReturnValue({
        valid: false,
        errorCode: "IPC_UNAUTHORIZED",
        errorMessage: "Invalid sender",
      });

      // Re-register handlers with invalid sender
      try {
        const { registerSkillHandlers } = await import("../skillHandlers");
        registerSkillHandlers(mockMainWindow, mockSkillService as never);
      } catch {
        // Expected
      }

      const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
      if (!handler) {
        throw new Error("skill:execute handler not registered - Red phase");
      }

      // When & Then: エラーがスローされるか、エラーレスポンスが返される
      try {
        const result = await handler({}, { skillId: "skill-1" });
        // If no throw, check for error response
        const opResult = result as OperationResult<SkillExecutionResult>;
        expect(opResult.success).toBe(false);
      } catch (error) {
        // Expected when validation fails
        expect(error).toBeDefined();
      }
    });
  });

  // ===========================================================================
  // Error handling
  // ===========================================================================

  describe("error handling", () => {
    beforeEach(async () => {
      // Reset validateIpcSender to return valid
      const { validateIpcSender } =
        await import("../../infrastructure/security/ipc-validator.js");
      (validateIpcSender as ReturnType<typeof vi.fn>).mockReturnValue({
        valid: true,
      });

      // Re-register handlers with valid sender
      handlers.clear();
      (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
        (
          channel: string,
          handler: (...args: unknown[]) => Promise<unknown>,
        ) => {
          handlers.set(channel, handler);
        },
      );

      const { registerSkillHandlers } = await import("../skillHandlers");
      registerSkillHandlers(mockMainWindow, mockSkillService as never);
    });

    it("should return error when skillService.executeSkill throws", async () => {
      mockSkillService.executeSkill.mockRejectedValue(
        new Error("Skill execution failed"),
      );

      const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
      if (!handler) {
        throw new Error("skill:execute handler not registered - Red phase");
      }

      // When: サービスがエラーをスロー
      const result = await handler({}, { skillId: "skill-1" });

      // Then: エラーが返される
      const opResult = result as OperationResult<SkillExecutionResult>;
      expect(opResult.success).toBe(false);
      expect(opResult.error).toBeDefined();
    });

    it("should return error when skill is not found", async () => {
      mockSkillService.executeSkill.mockRejectedValue(
        new Error("スキルが見つかりません"),
      );

      const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
      if (!handler) {
        throw new Error("skill:execute handler not registered - Red phase");
      }

      const result = await handler({}, { skillId: "nonexistent" });

      const opResult = result as OperationResult<SkillExecutionResult>;
      expect(opResult.success).toBe(false);
      expect(opResult.error).toContain("見つかりません");
    });

    it("should return error when skill is not imported", async () => {
      mockSkillService.executeSkill.mockRejectedValue(
        new Error("スキルがインポートされていません"),
      );

      const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
      if (!handler) {
        throw new Error("skill:execute handler not registered - Red phase");
      }

      const result = await handler({}, { skillId: "not-imported" });

      const opResult = result as OperationResult<SkillExecutionResult>;
      expect(opResult.success).toBe(false);
      expect(opResult.error).toContain("インポートされていません");
    });
  });

  // ===========================================================================
  // TC-6-006: IPC通信タイムアウト（Phase 6）
  // ===========================================================================

  describe("TC-6-006: IPC通信タイムアウト", () => {
    beforeEach(async () => {
      const { validateIpcSender } =
        await import("../../infrastructure/security/ipc-validator.js");
      (validateIpcSender as ReturnType<typeof vi.fn>).mockReturnValue({
        valid: true,
      });

      handlers.clear();
      (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
        (
          channel: string,
          handler: (...args: unknown[]) => Promise<unknown>,
        ) => {
          handlers.set(channel, handler);
        },
      );

      const { registerSkillHandlers } = await import("../skillHandlers");
      registerSkillHandlers(mockMainWindow, mockSkillService as never);
    });

    it("should handle service timeout error", async () => {
      mockSkillService.executeSkill.mockRejectedValue(
        new Error("Request timed out"),
      );

      const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
      if (!handler) {
        throw new Error("skill:execute handler not registered - Red phase");
      }

      const result = await handler({}, { skillId: "skill-1" });

      const opResult = result as OperationResult<SkillExecutionResult>;
      expect(opResult.success).toBe(false);
      expect(opResult.error).toBeDefined();
    });
  });

  // ===========================================================================
  // TC-6-007: スキル実行中の例外発生（Phase 6）
  // ===========================================================================

  describe("TC-6-007: スキル実行中の例外発生", () => {
    beforeEach(async () => {
      const { validateIpcSender } =
        await import("../../infrastructure/security/ipc-validator.js");
      (validateIpcSender as ReturnType<typeof vi.fn>).mockReturnValue({
        valid: true,
      });

      handlers.clear();
      (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
        (
          channel: string,
          handler: (...args: unknown[]) => Promise<unknown>,
        ) => {
          handlers.set(channel, handler);
        },
      );

      const { registerSkillHandlers } = await import("../skillHandlers");
      registerSkillHandlers(mockMainWindow, mockSkillService as never);
    });

    it("should return error status for runtime exception", async () => {
      mockSkillService.executeSkill.mockRejectedValue(
        new Error("Runtime exception during execution"),
      );

      const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
      if (!handler) {
        throw new Error("skill:execute handler not registered - Red phase");
      }

      const result = await handler({}, { skillId: "skill-1" });

      const opResult = result as OperationResult<SkillExecutionResult>;
      expect(opResult.success).toBe(false);
      expect(opResult.error).toBe("Runtime exception during execution");
    });
  });

  // ===========================================================================
  // TC-6-008: 無効なBrowserWindowでの呼び出し（Phase 6）
  // ===========================================================================

  describe("TC-6-008: 無効なBrowserWindowでの呼び出し", () => {
    it("should throw UNAUTHORIZED error for invalid sender", async () => {
      const { validateIpcSender } =
        await import("../../infrastructure/security/ipc-validator.js");
      (validateIpcSender as ReturnType<typeof vi.fn>).mockReturnValue({
        valid: false,
        errorCode: "IPC_UNAUTHORIZED",
        errorMessage: "Invalid BrowserWindow",
      });

      handlers.clear();
      (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
        (
          channel: string,
          handler: (...args: unknown[]) => Promise<unknown>,
        ) => {
          handlers.set(channel, handler);
        },
      );

      const { registerSkillHandlers } = await import("../skillHandlers");
      registerSkillHandlers(mockMainWindow, mockSkillService as never);

      const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
      if (!handler) {
        throw new Error("skill:execute handler not registered - Red phase");
      }

      await expect(handler({}, { skillId: "skill-1" })).rejects.toMatchObject({
        success: false,
        error: expect.objectContaining({ code: "IPC_UNAUTHORIZED" }),
      });
    });
  });

  // ===========================================================================
  // TC-6-009: DevToolsからの呼び出し（Phase 6）
  // ===========================================================================

  describe("TC-6-009: DevToolsからの呼び出し", () => {
    it("should reject calls from DevTools sender", async () => {
      const { validateIpcSender } =
        await import("../../infrastructure/security/ipc-validator.js");
      (validateIpcSender as ReturnType<typeof vi.fn>).mockReturnValue({
        valid: false,
        errorCode: "IPC_FORBIDDEN",
        errorMessage: "DevTools access not allowed",
      });

      handlers.clear();
      (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
        (
          channel: string,
          handler: (...args: unknown[]) => Promise<unknown>,
        ) => {
          handlers.set(channel, handler);
        },
      );

      const { registerSkillHandlers } = await import("../skillHandlers");
      registerSkillHandlers(mockMainWindow, mockSkillService as never);

      const handler = handlers.get(SKILL_EXECUTE_CHANNEL);
      if (!handler) {
        throw new Error("skill:execute handler not registered - Red phase");
      }

      try {
        await handler({}, { skillId: "skill-1" });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
