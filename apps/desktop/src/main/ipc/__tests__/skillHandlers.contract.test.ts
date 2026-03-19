/**
 * skillHandlers Contract Tests
 *
 * UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 Phase 4
 *
 * Tests that verify the IPC response contract consistency across all 15 skill: channels.
 * These tests are designed to detect contract drift:
 *
 * 1. Return shape (wrapper vs direct vs primitive)
 * 2. P42 3-step validation (type check → empty string → trimmed empty string)
 * 3. Error format consistency ({ code, message } on validation failure)
 * 4. validateIpcSender usage
 * 5. Error message sanitization
 *
 * TDD Red Phase: Some tests SHOULD FAIL against the current implementation
 * where contract inconsistencies exist (e.g., skill:optimize validation uses
 * return instead of throw).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";

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
  updateSkill: vi.fn(),
  getSkillByName: vi.fn(),
  executeSkill: vi.fn(),
  setSkillExecutor: vi.fn(),
  getSkillsDirectory: vi.fn().mockReturnValue("/mock/skills/dir"),
};

// Mock BrowserWindow
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

// Mock ipc-validator: validateIpcSender defaults to valid: true
const mockValidateIpcSender = vi.fn().mockReturnValue({ valid: true });
const mockToIPCValidationError = vi.fn().mockImplementation((result) => ({
  code: result.errorCode ?? "IPC_UNAUTHORIZED",
  message: result.errorMessage ?? "Unauthorized IPC call",
}));

vi.mock("../../infrastructure/security/ipc-validator.js", () => ({
  validateIpcSender: mockValidateIpcSender,
  toIPCValidationError: mockToIPCValidationError,
}));

// Import after mocks
import { ipcMain } from "electron";

// Channel constants (matching IPC_CHANNELS)
const CHANNELS = {
  LIST: "skill:list",
  SCAN: "skill:scan",
  GET_IMPORTED: "skill:getImported",
  IMPORT: "skill:import",
  REMOVE: "skill:remove",
  GET_DETAIL: "skill:get-detail",
  UPDATE: "skill:update",
  EXECUTE: "skill:execute",
  ABORT: "skill:abort",
  GET_STATUS: "skill:get-status",
  ANALYZE: "skill:analyze",
  IMPROVE: "skill:improve",
  OPTIMIZE: "skill:optimize",
  OPTIMIZE_VARIANTS: "skill:optimize:variants",
  OPTIMIZE_EVALUATE: "skill:optimize:evaluate",
} as const;

describe("skillHandlers Contract Tests (Phase 4 TDD Red)", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    // Re-establish default mock return values after clearAllMocks
    mockValidateIpcSender.mockReturnValue({ valid: true });
    mockToIPCValidationError.mockImplementation((result) => ({
      code: result.errorCode ?? "IPC_UNAUTHORIZED",
      message: result.errorMessage ?? "Unauthorized IPC call",
    }));

    // Capture registered handlers
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    // Default mock responses
    mockSkillService.scanAvailableSkills.mockResolvedValue({
      skills: [
        {
          id: "skill-1",
          name: "Test Skill",
          description: "desc",
          path: "/test",
          updatedAt: new Date(),
          agents: [],
          references: [],
          scripts: [],
          assets: [],
          schemas: [],
          indexes: [],
          otherFiles: [],
        },
      ],
      errors: [],
      scannedAt: new Date(),
    });
    mockSkillService.getImportedSkills.mockResolvedValue([
      {
        name: "imported-skill",
        description: "desc",
        path: "/test",
        updatedAt: new Date(),
        agents: [],
        references: [],
        scripts: [],
        assets: [],
        schemas: [],
        indexes: [],
        otherFiles: [],
        importedAt: new Date(),
        status: "active",
      },
    ]);
    mockSkillService.importSkills.mockResolvedValue({
      success: true,
      importedCount: 1,
      errors: [],
    });
    mockSkillService.getSkillByName.mockResolvedValue({
      name: "test-skill",
      description: "desc",
      path: "/test",
      updatedAt: new Date(),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
      importedAt: new Date(),
      status: "active",
    });
    mockSkillService.removeSkill.mockResolvedValue({
      success: true,
      removed: true,
    });
    mockSkillService.getSkillById.mockResolvedValue({
      id: "skill-1",
      name: "Test Skill",
      slug: "test-skill",
      description: "desc",
      path: "/test",
      triggers: [],
      anchors: [],
      lastModified: new Date(),
    });
    mockSkillService.updateSkill.mockResolvedValue(undefined);
    mockSkillService.executeSkill.mockResolvedValue({
      executionId: "exec-001",
      status: "success",
      output: "result",
      startedAt: new Date(),
      completedAt: new Date(),
    });

    // Register handlers
    const { registerSkillHandlers } = await import("../skillHandlers");
    registerSkillHandlers(mockMainWindow, mockSkillService as never);
  });

  afterEach(() => {
    vi.resetModules();
  });

  /**
   * Helper: Get handler by channel, throw if not registered
   */
  function getHandler(
    channel: string,
  ): (...args: unknown[]) => Promise<unknown> {
    const handler = handlers.get(channel);
    if (!handler) {
      throw new Error(`${channel} handler not registered`);
    }
    return handler;
  }

  // ===========================================================================
  // Section 1: Handler Registration (all 15 channels)
  // ===========================================================================

  describe("1. Handler Registration", () => {
    const allChannels = Object.values(CHANNELS);

    it.each(allChannels)(
      "MC-REG: %s handler is registered",
      (channel: string) => {
        expect(handlers.has(channel)).toBe(true);
      },
    );
  });

  // ===========================================================================
  // Section 2: Return Shape Contract (Profile verification)
  // ===========================================================================

  describe("2. Return Shape Contract", () => {
    // Profile A: Wrapper channels should return { success: true, data }
    describe("Profile A (Wrapper): should return { success: true, data }", () => {
      it("MC-N01: skill:list returns wrapper with data array", async () => {
        const handler = getHandler(CHANNELS.LIST);
        const result = (await handler({}, {})) as {
          success: boolean;
          data: unknown;
        };

        expect(result).toHaveProperty("success", true);
        expect(result).toHaveProperty("data");
        expect(Array.isArray(result.data)).toBe(true);
      });

      it("MC-N02: skill:scan returns wrapper with data array", async () => {
        const handler = getHandler(CHANNELS.SCAN);
        const result = (await handler({})) as {
          success: boolean;
          data: unknown;
        };

        expect(result).toHaveProperty("success", true);
        expect(result).toHaveProperty("data");
        expect(Array.isArray(result.data)).toBe(true);
      });

      it("MC-N03: skill:getImported returns wrapper with data array", async () => {
        const handler = getHandler(CHANNELS.GET_IMPORTED);
        const result = (await handler({})) as {
          success: boolean;
          data: unknown;
        };

        expect(result).toHaveProperty("success", true);
        expect(result).toHaveProperty("data");
        expect(Array.isArray(result.data)).toBe(true);
      });

      it("MC-N06: skill:get-detail returns wrapper with data object", async () => {
        const handler = getHandler(CHANNELS.GET_DETAIL);
        const result = (await handler({}, { skillId: "skill-1" })) as {
          success: boolean;
          data: unknown;
        };

        expect(result).toHaveProperty("success", true);
        expect(result).toHaveProperty("data");
        expect(typeof result.data).toBe("object");
      });

      it("MC-N06A: skill:update returns wrapper with undefined data", async () => {
        const handler = getHandler(CHANNELS.UPDATE);
        const result = (await handler(
          {},
          {
            skillName: "test-skill",
            updates: { description: "updated" },
          },
        )) as { success: boolean; data: unknown };

        expect(result).toHaveProperty("success", true);
        expect(result).toHaveProperty("data");
        expect(result.data).toBeUndefined();
      });

      it("MC-N07: skill:execute returns wrapper with data object", async () => {
        const handler = getHandler(CHANNELS.EXECUTE);
        const result = (await handler({}, { skillId: "skill-1" })) as {
          success: boolean;
          data: unknown;
        };

        expect(result).toHaveProperty("success", true);
        expect(result).toHaveProperty("data");
      });

      it("MC-N10: skill:analyze returns wrapper format", async () => {
        const handler = getHandler(CHANNELS.ANALYZE);
        // Will call getSkillByName, then analyzer (which may throw since it's not mocked deeply)
        // We just verify wrapper format is used
        const result = (await handler({}, { skillName: "test-skill" })) as {
          success: boolean;
        };

        // Should have success property (either true or false)
        expect(result).toHaveProperty("success");
      });

      it("MC-N11: skill:improve returns wrapper format", async () => {
        const handler = getHandler(CHANNELS.IMPROVE);
        const result = (await handler(
          {},
          { skillName: "test-skill", analysis: { score: 80, issues: [] } },
        )) as { success: boolean };

        expect(result).toHaveProperty("success");
      });

      it("MC-N12: skill:optimize returns wrapper format", async () => {
        const handler = getHandler(CHANNELS.OPTIMIZE);
        const result = (await handler({}, { prompt: "test prompt" })) as {
          success: boolean;
        };

        expect(result).toHaveProperty("success");
      });

      it("MC-N13: skill:optimize:variants returns wrapper format", async () => {
        const handler = getHandler(CHANNELS.OPTIMIZE_VARIANTS);
        const result = (await handler(
          {},
          { prompt: "test prompt", count: 3 },
        )) as { success: boolean };

        expect(result).toHaveProperty("success");
      });

      it("MC-N14: skill:optimize:evaluate returns wrapper format", async () => {
        const handler = getHandler(CHANNELS.OPTIMIZE_EVALUATE);
        const result = (await handler({}, { prompt: "test prompt" })) as {
          success: boolean;
        };

        expect(result).toHaveProperty("success");
      });
    });

    // Profile B: Direct return channels
    describe("Profile B (Direct): should return value directly", () => {
      it("MC-N04: skill:import returns ImportedSkill directly (not wrapped)", async () => {
        const handler = getHandler(CHANNELS.IMPORT);
        const result = (await handler({}, "test-skill")) as Record<
          string,
          unknown
        >;

        // Should NOT be wrapped in { success, data }
        expect(result).toHaveProperty("name");
        expect(result).toHaveProperty("status");
        // Direct return should not have wrapper success property as the primary key
        expect(result.name).toBe("test-skill");
      });

      it("MC-N05: skill:remove returns RemoveResult directly", async () => {
        const handler = getHandler(CHANNELS.REMOVE);
        const result = (await handler({}, "test-skill")) as Record<
          string,
          unknown
        >;

        // RemoveResult has { success, removed } but it's the service result, not IPC wrapper
        expect(result).toHaveProperty("success");
        expect(result).toHaveProperty("removed");
      });
    });

    // Profile C: Primitive channels
    describe("Profile C (Primitive): should return primitive values", () => {
      it("MC-N08: skill:abort returns boolean", async () => {
        const handler = getHandler(CHANNELS.ABORT);
        const result = await handler({}, "exec-001");

        // SkillExecutor is initialized by registerSkillHandlers, abort returns boolean
        expect(typeof result === "boolean" || result === false).toBe(true);
      });

      it("MC-N09: skill:get-status returns null when executor not found", async () => {
        const handler = getHandler(CHANNELS.GET_STATUS);
        const result = await handler({}, "exec-nonexistent");

        // When execution doesn't exist, should return null
        expect(result === null || typeof result === "object").toBe(true);
      });
    });
  });

  // ===========================================================================
  // Section 3: P42 3-Step Validation Contract
  // Each channel with string args must throw { code: "VALIDATION_ERROR" }
  // ===========================================================================

  describe("3. P42 3-Step Validation", () => {
    // Helper to test 3-step validation
    async function expectValidationThrow(
      handler: (...args: unknown[]) => Promise<unknown>,
      makeArgs: (val: unknown) => unknown,
      expectedMessage: string,
    ): Promise<void> {
      const testCases = [
        { label: "empty string", value: makeArgs("") },
        { label: "whitespace only", value: makeArgs("   ") },
        { label: "null", value: makeArgs(null) },
        { label: "undefined", value: makeArgs(undefined) },
        { label: "number", value: makeArgs(123) },
        { label: "tab only", value: makeArgs("\t") },
        { label: "newline only", value: makeArgs("\n") },
        { label: "mixed whitespace", value: makeArgs(" \t\n ") },
      ];

      for (const { label, value } of testCases) {
        try {
          await handler({}, value);
          // If we get here, the handler did NOT throw — this is a test failure
          expect.fail(
            `Expected VALIDATION_ERROR to be thrown for ${label}, but handler returned normally`,
          );
        } catch (error) {
          expect(
            (error as { code: string }).code,
            `${label}: error.code should be VALIDATION_ERROR`,
          ).toBe("VALIDATION_ERROR");
          expect(
            (error as { message: string }).message,
            `${label}: error.message should match expected`,
          ).toBe(expectedMessage);
        }
      }
    }

    describe("skill:import validation", () => {
      it("MC-V-IMP: throws VALIDATION_ERROR for invalid skillName", async () => {
        const handler = getHandler(CHANNELS.IMPORT);
        await expectValidationThrow(
          handler,
          (val) => val,
          "skillName must be a non-empty string",
        );
      });
    });

    describe("skill:remove validation", () => {
      it("MC-V-REM: throws VALIDATION_ERROR for invalid skillName", async () => {
        const handler = getHandler(CHANNELS.REMOVE);
        await expectValidationThrow(
          handler,
          (val) => val,
          "skillName must be a non-empty string",
        );
      });
    });

    describe("skill:get-detail validation", () => {
      it("MC-V-GD: throws VALIDATION_ERROR for invalid skillId", async () => {
        const handler = getHandler(CHANNELS.GET_DETAIL);
        await expectValidationThrow(
          handler,
          (val) => ({ skillId: val }),
          "skillId must be a non-empty string",
        );
      });
    });

    describe("skill:update validation", () => {
      it("MC-V-UPD: throws VALIDATION_ERROR for invalid skillName", async () => {
        const handler = getHandler(CHANNELS.UPDATE);
        await expectValidationThrow(
          handler,
          (val) => ({ skillName: val, updates: { description: "x" } }),
          "skillName must be a non-empty string",
        );
      });

      it("MC-V-UPD-U: throws VALIDATION_ERROR for invalid updates payload", async () => {
        const handler = getHandler(CHANNELS.UPDATE);

        await expect(
          handler({}, { skillName: "test-skill", updates: null }),
        ).rejects.toMatchObject({
          code: "VALIDATION_ERROR",
          message: "updates must be a non-null object",
        });
      });
    });

    describe("skill:execute validation", () => {
      it("MC-V-EXE: throws VALIDATION_ERROR for invalid skillId", async () => {
        const handler = getHandler(CHANNELS.EXECUTE);
        await expectValidationThrow(
          handler,
          (val) => ({ skillId: val }),
          "skillId must be a non-empty string",
        );
      });
    });

    describe("skill:abort validation", () => {
      it("MC-V-ABT: throws VALIDATION_ERROR for invalid executionId", async () => {
        const handler = getHandler(CHANNELS.ABORT);
        await expectValidationThrow(
          handler,
          (val) => val,
          "executionId must be a non-empty string",
        );
      });
    });

    describe("skill:get-status validation", () => {
      it("MC-V-GS: throws VALIDATION_ERROR for invalid executionId", async () => {
        const handler = getHandler(CHANNELS.GET_STATUS);
        await expectValidationThrow(
          handler,
          (val) => val,
          "executionId must be a non-empty string",
        );
      });
    });

    describe("skill:analyze validation", () => {
      it("MC-V-ANZ: throws VALIDATION_ERROR for invalid skillName", async () => {
        const handler = getHandler(CHANNELS.ANALYZE);
        await expectValidationThrow(
          handler,
          (val) => ({ skillName: val }),
          "skillName must be a non-empty string",
        );
      });
    });

    describe("skill:improve validation", () => {
      it("MC-V-IVE: throws VALIDATION_ERROR for invalid skillName", async () => {
        const handler = getHandler(CHANNELS.IMPROVE);
        await expectValidationThrow(
          handler,
          (val) => ({ skillName: val }),
          "skillName must be a non-empty string",
        );
      });
    });

    // RED TESTS: skill:optimize, skill:optimize:variants, skill:optimize:evaluate
    // These currently use `return { success: false }` instead of `throw` for validation
    describe("skill:optimize validation (RED - currently returns instead of throws)", () => {
      it("MC-V-OPT: throws VALIDATION_ERROR for invalid prompt", async () => {
        const handler = getHandler(CHANNELS.OPTIMIZE);
        await expectValidationThrow(
          handler,
          (val) => ({ prompt: val }),
          "prompt must be a non-empty string",
        );
      });
    });

    describe("skill:optimize:variants validation (RED - currently returns instead of throws)", () => {
      it("MC-V-OPT-V: throws VALIDATION_ERROR for invalid prompt", async () => {
        const handler = getHandler(CHANNELS.OPTIMIZE_VARIANTS);
        await expectValidationThrow(
          handler,
          (val) => ({ prompt: val }),
          "prompt must be a non-empty string",
        );
      });
    });

    describe("skill:optimize:evaluate validation (RED - currently returns instead of throws)", () => {
      it("MC-V-OPT-E: throws VALIDATION_ERROR for invalid prompt", async () => {
        const handler = getHandler(CHANNELS.OPTIMIZE_EVALUATE);
        await expectValidationThrow(
          handler,
          (val) => ({ prompt: val }),
          "prompt must be a non-empty string",
        );
      });
    });
  });

  // ===========================================================================
  // Section 4: validateIpcSender Contract
  // ===========================================================================

  describe("4. validateIpcSender Usage", () => {
    it("MC-SEC01: all handlers call validateIpcSender", async () => {
      // Reset call count but keep default return value
      mockValidateIpcSender.mockClear();
      mockValidateIpcSender.mockReturnValue({ valid: true });

      // Call each handler once to verify validateIpcSender is called
      const testCalls: Array<{ channel: string; args: unknown }> = [
        { channel: CHANNELS.LIST, args: {} },
        { channel: CHANNELS.SCAN, args: undefined },
        { channel: CHANNELS.GET_IMPORTED, args: undefined },
        { channel: CHANNELS.IMPORT, args: "test-skill" },
        { channel: CHANNELS.REMOVE, args: "test-skill" },
        { channel: CHANNELS.GET_DETAIL, args: { skillId: "skill-1" } },
        {
          channel: CHANNELS.UPDATE,
          args: { skillName: "test-skill", updates: { description: "x" } },
        },
        { channel: CHANNELS.EXECUTE, args: { skillId: "skill-1" } },
        { channel: CHANNELS.ABORT, args: "exec-001" },
        { channel: CHANNELS.GET_STATUS, args: "exec-001" },
        { channel: CHANNELS.ANALYZE, args: { skillName: "test-skill" } },
        {
          channel: CHANNELS.IMPROVE,
          args: {
            skillName: "test-skill",
            analysis: { score: 80, issues: [] },
          },
        },
        { channel: CHANNELS.OPTIMIZE, args: { prompt: "test" } },
        {
          channel: CHANNELS.OPTIMIZE_VARIANTS,
          args: { prompt: "test", count: 3 },
        },
        { channel: CHANNELS.OPTIMIZE_EVALUATE, args: { prompt: "test" } },
      ];

      for (const { channel, args } of testCalls) {
        const handler = getHandler(channel);
        try {
          await handler({}, args);
        } catch {
          // Some handlers may throw for various reasons, that's ok
        }
      }

      // Should have been called 15 times (once per handler)
      expect(mockValidateIpcSender).toHaveBeenCalledTimes(15);
    });

    it("MC-SEC02: handlers throw when validateIpcSender returns invalid", async () => {
      // Configure validateIpcSender to return invalid
      mockValidateIpcSender.mockReturnValue({
        valid: false,
        errorCode: "IPC_UNAUTHORIZED",
        errorMessage: "Unauthorized IPC call",
      });

      const handler = getHandler(CHANNELS.LIST);

      await expect(handler({}, {})).rejects.toMatchObject({
        code: "IPC_UNAUTHORIZED",
      });
    });
  });

  // ===========================================================================
  // Section 5: Error Handling Consistency
  // ===========================================================================

  describe("5. Error Handling Consistency", () => {
    describe("Profile A (Wrapper) error responses", () => {
      it("MC-E01-LIST: skill:list returns { success: false, error } on service error", async () => {
        mockSkillService.scanAvailableSkills.mockRejectedValue(
          new Error("scan failed"),
        );

        const handler = getHandler(CHANNELS.LIST);
        const result = (await handler({}, {})) as {
          success: boolean;
          error: string;
        };

        expect(result.success).toBe(false);
        expect(typeof result.error).toBe("string");
      });

      it("MC-E01-SCAN: skill:scan returns { success: false, error } on service error", async () => {
        mockSkillService.scanAvailableSkills.mockRejectedValue(
          new Error("scan failed"),
        );

        const handler = getHandler(CHANNELS.SCAN);
        const result = (await handler({})) as {
          success: boolean;
          error: string;
        };

        expect(result.success).toBe(false);
        expect(typeof result.error).toBe("string");
      });

      it("MC-E01-GI: skill:getImported returns { success: false, error } on service error", async () => {
        mockSkillService.getImportedSkills.mockRejectedValue(
          new Error("fetch failed"),
        );

        const handler = getHandler(CHANNELS.GET_IMPORTED);
        const result = (await handler({})) as {
          success: boolean;
          error: string;
        };

        expect(result.success).toBe(false);
        expect(typeof result.error).toBe("string");
      });

      it("MC-E01-GD: skill:get-detail returns { success: false, error } on service error", async () => {
        mockSkillService.getSkillById.mockRejectedValue(
          new Error("fetch failed"),
        );

        const handler = getHandler(CHANNELS.GET_DETAIL);
        const result = (await handler({}, { skillId: "skill-1" })) as {
          success: boolean;
          error: string;
        };

        expect(result.success).toBe(false);
        expect(typeof result.error).toBe("string");
      });

      it("MC-E01-UPD: skill:update returns { success: false, error } on service error", async () => {
        mockSkillService.updateSkill.mockRejectedValue(
          new Error("update failed"),
        );

        const handler = getHandler(CHANNELS.UPDATE);
        const result = (await handler(
          {},
          {
            skillName: "test-skill",
            updates: { description: "updated" },
          },
        )) as {
          success: boolean;
          error: string;
        };

        expect(result.success).toBe(false);
        expect(typeof result.error).toBe("string");
      });

      it("MC-E01-EXE: skill:execute returns { success: false, error } on service error", async () => {
        mockSkillService.executeSkill.mockRejectedValue(
          new Error("exec failed"),
        );

        const handler = getHandler(CHANNELS.EXECUTE);
        const result = (await handler({}, { skillId: "skill-1" })) as {
          success: boolean;
          error: string;
        };

        expect(result.success).toBe(false);
        expect(typeof result.error).toBe("string");
      });
    });

    describe("Profile B/C error handling", () => {
      it("MC-E03: skill:abort returns false when SkillExecutor is null", async () => {
        // SkillExecutor is set during registerSkillHandlers, but abort()
        // for a non-existent executionId should return false
        const handler = getHandler(CHANNELS.ABORT);
        const result = await handler({}, "nonexistent-exec");

        // The executor exists but abort for unknown execution returns false
        expect(result === false || typeof result === "boolean").toBe(true);
      });

      it("MC-E04: skill:get-status returns null for unknown execution", async () => {
        const handler = getHandler(CHANNELS.GET_STATUS);
        const result = await handler({}, "nonexistent-exec");

        expect(result).toBeNull();
      });
    });
  });

  // ===========================================================================
  // Section 6: Error Message Sanitization (RED tests)
  // Current implementation leaks raw error.message to Renderer
  // ===========================================================================

  describe("6. Error Message Sanitization (contract expectation)", () => {
    it("MC-SAN-LIST: skill:list should NOT leak internal error paths", async () => {
      mockSkillService.scanAvailableSkills.mockRejectedValue(
        new Error(
          "ENOENT: no such file or directory, scandir '/internal/path/skills'",
        ),
      );

      const handler = getHandler(CHANNELS.LIST);
      const result = (await handler({}, {})) as {
        success: boolean;
        error: string;
      };

      expect(result.success).toBe(false);
      // Contract expectation: error message should be sanitized
      // The raw error contains internal file paths which should not reach Renderer
      expect(result.error).not.toContain("/internal/path/");
    });

    it("MC-SAN-EXEC: skill:execute should NOT leak internal error details", async () => {
      mockSkillService.executeSkill.mockRejectedValue(
        new Error("Connection refused to internal service at 127.0.0.1:3456"),
      );

      const handler = getHandler(CHANNELS.EXECUTE);
      const result = (await handler({}, { skillId: "skill-1" })) as {
        success: boolean;
        error: string;
      };

      expect(result.success).toBe(false);
      // Contract expectation: internal connection details should be sanitized
      expect(result.error).not.toContain("127.0.0.1:3456");
    });

    it("MC-SAN-UPD: skill:update should NOT leak internal error paths", async () => {
      mockSkillService.updateSkill.mockRejectedValue(
        new Error("ENOENT: cannot open '/internal/path/skills/test-skill'"),
      );

      const handler = getHandler(CHANNELS.UPDATE);
      const result = (await handler(
        {},
        {
          skillName: "test-skill",
          updates: { description: "updated" },
        },
      )) as {
        success: boolean;
        error: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).not.toContain("/internal/path/");
    });

    it("MC-SAN-GI: skill:getImported should NOT leak internal error details", async () => {
      mockSkillService.getImportedSkills.mockRejectedValue(
        new Error("Cannot read properties of undefined (reading 'skills')"),
      );

      const handler = getHandler(CHANNELS.GET_IMPORTED);
      const result = (await handler({})) as {
        success: boolean;
        error: string;
      };

      expect(result.success).toBe(false);
      // Contract expectation: stack-like error messages should be sanitized
      expect(result.error).not.toContain("Cannot read properties");
    });

    it("MC-SAN-ANALYZE: skill:analyze should NOT leak internal error details", async () => {
      mockSkillService.getSkillByName.mockResolvedValue({
        name: "test",
        description: "d",
        path: "/t",
        updatedAt: new Date(),
        agents: [],
        references: [],
        scripts: [],
        assets: [],
        schemas: [],
        indexes: [],
        otherFiles: [],
        importedAt: new Date(),
        status: "active",
      });

      const handler = getHandler(CHANNELS.ANALYZE);
      // The SkillAnalyzer is real (not mocked), so it will throw when trying to analyze
      const result = (await handler({}, { skillName: "test" })) as {
        success: boolean;
        error?: string;
      };

      // If it's a failure, error should be sanitized
      if (!result.success && result.error) {
        expect(result.error).not.toMatch(/at\s+\w+\s+\(/); // No stack traces
      }
    });
  });

  // ===========================================================================
  // Section 7: Boundary Value Tests
  // ===========================================================================

  describe("7. Boundary Value Tests", () => {
    it("MC-BV05: long string passes validation", async () => {
      const longSkillName = "a".repeat(10000);
      mockSkillService.importSkills.mockResolvedValue({
        success: true,
        importedCount: 1,
        errors: [],
      });
      mockSkillService.getSkillByName.mockResolvedValue({
        name: longSkillName,
        description: "d",
        path: "/t",
        updatedAt: new Date(),
        agents: [],
        references: [],
        scripts: [],
        assets: [],
        schemas: [],
        indexes: [],
        otherFiles: [],
        importedAt: new Date(),
        status: "active",
      });

      const handler = getHandler(CHANNELS.IMPORT);
      // Should not throw validation error for long strings
      const result = await handler({}, longSkillName);
      expect(result).toBeDefined();
    });

    it("MC-BV07: Unicode string passes validation", async () => {
      const unicodeName = "スキル名テスト";
      mockSkillService.importSkills.mockResolvedValue({
        success: true,
        importedCount: 1,
        errors: [],
      });
      mockSkillService.getSkillByName.mockResolvedValue({
        name: unicodeName,
        description: "d",
        path: "/t",
        updatedAt: new Date(),
        agents: [],
        references: [],
        scripts: [],
        assets: [],
        schemas: [],
        indexes: [],
        otherFiles: [],
        importedAt: new Date(),
        status: "active",
      });

      const handler = getHandler(CHANNELS.IMPORT);
      const result = await handler({}, unicodeName);
      expect(result).toBeDefined();
    });
  });
});
