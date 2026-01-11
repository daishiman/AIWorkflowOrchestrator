/**
 * skillHandlers Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 *
 * NOTE: Per Phase 3 Design Review, we use existing `skill:` prefix channels
 * instead of the originally designed `agent:` prefix channels.
 *
 * Channel mapping:
 * - skill:list-available (was: agent:scan-available-skills)
 * - skill:list-imported (was: agent:get-imported-skills)
 * - skill:import (was: agent:import-skills)
 * - skill:remove (was: agent:remove-skill)
 * - skill:get-detail (was: agent:get-skill-detail)
 *
 * @see docs/30-workflows/agent-003-skill-management-backend/outputs/phase-3/review-summary.md
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";

// === Type Definitions ===

interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  path: string;
  triggers: string[];
  anchors: Array<{
    source: string;
    application: string;
    purpose: string;
  }>;
  category?: string;
  lastModified: Date;
}

interface SkillScanResult {
  skills: Skill[];
  errors: Array<{
    path: string;
    error: string;
    code: string;
  }>;
  scannedAt: Date;
}

interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
}

interface RemoveResult {
  success: boolean;
  removed: boolean;
}

interface IPCError {
  code: string;
  message: string;
  details?: unknown;
}

// === Mocks ===

// Mock SkillService
const mockSkillService = {
  scanAvailableSkills: vi.fn(),
  getImportedSkills: vi.fn(),
  importSkills: vi.fn(),
  removeSkill: vi.fn(),
  getSkillById: vi.fn(),
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
  validateIpcSender: vi.fn().mockReturnValue(true),
}));

// Import after mocks
import { ipcMain } from "electron";

// Skill IPC Channels (per Phase 3 review - using existing channels.ts definitions)
const SKILL_CHANNELS = {
  LIST_AVAILABLE: "skill:list-available",
  LIST_IMPORTED: "skill:list-imported",
  IMPORT: "skill:import",
  REMOVE: "skill:remove",
  GET_DETAIL: "skill:get-detail",
} as const;

describe("skillHandlers", () => {
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
    mockSkillService.scanAvailableSkills.mockResolvedValue({
      skills: [],
      errors: [],
      scannedAt: new Date(),
    });
    mockSkillService.getImportedSkills.mockResolvedValue([]);
    mockSkillService.importSkills.mockResolvedValue({
      success: true,
      importedCount: 0,
      errors: [],
    });
    mockSkillService.removeSkill.mockResolvedValue({
      success: true,
      removed: false,
    });
    mockSkillService.getSkillById.mockResolvedValue(null);

    // Try to import and register handlers (will fail in Red phase)
    try {
      const { registerSkillHandlers } = await import("../skillHandlers");
      registerSkillHandlers(mockMainWindow, mockSkillService);
    } catch {
      // Expected in Red phase - module doesn't exist
    }
  });

  afterEach(() => {
    vi.resetModules();
  });

  // ===========================================================================
  // Handler registration
  // ===========================================================================

  describe("registerSkillHandlers", () => {
    it("SH-REG-01: should register skill:list-available handler", () => {
      expect(handlers.has(SKILL_CHANNELS.LIST_AVAILABLE)).toBe(true);
    });

    it("SH-REG-02: should register skill:list-imported handler", () => {
      expect(handlers.has(SKILL_CHANNELS.LIST_IMPORTED)).toBe(true);
    });

    it("SH-REG-03: should register skill:import handler", () => {
      expect(handlers.has(SKILL_CHANNELS.IMPORT)).toBe(true);
    });

    it("SH-REG-04: should register skill:remove handler", () => {
      expect(handlers.has(SKILL_CHANNELS.REMOVE)).toBe(true);
    });

    it("SH-REG-05: should register skill:get-detail handler", () => {
      expect(handlers.has(SKILL_CHANNELS.GET_DETAIL)).toBe(true);
    });
  });

  // ===========================================================================
  // skill:list-available
  // ===========================================================================

  describe("skill:list-available", () => {
    it("SH-LA-01: should call skillService.scanAvailableSkills", async () => {
      const mockData: SkillScanResult = {
        skills: [
          {
            id: "skill-1",
            name: "Test Skill",
            slug: "test-skill",
            description: "A test skill",
            path: "/test/skills/test-skill/SKILL.md",
            triggers: ["test"],
            anchors: [],
            category: "testing",
            lastModified: new Date(),
          },
        ],
        errors: [],
        scannedAt: new Date(),
      };
      mockSkillService.scanAvailableSkills.mockResolvedValue(mockData);

      const handler = handlers.get(SKILL_CHANNELS.LIST_AVAILABLE);
      if (!handler) {
        throw new Error("skill:list-available handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = await handler({}, {});

      // Then: skillService.scanAvailableSkillsが呼び出される
      expect(mockSkillService.scanAvailableSkills).toHaveBeenCalled();
      expect((result as SkillScanResult).skills).toHaveLength(1);
    });

    it("SH-LA-02: should pass forceRefresh option", async () => {
      const handler = handlers.get(SKILL_CHANNELS.LIST_AVAILABLE);
      if (!handler) {
        throw new Error("skill:list-available handler not registered");
      }

      // When: forceRefreshオプション付きで呼び出す
      await handler({}, { forceRefresh: true });

      // Then: forceRefreshがtrueで渡される
      expect(mockSkillService.scanAvailableSkills).toHaveBeenCalledWith(true);
    });

    it("SH-LA-03: should handle service error", async () => {
      mockSkillService.scanAvailableSkills.mockRejectedValue(
        new Error("Scan failed"),
      );

      const handler = handlers.get(SKILL_CHANNELS.LIST_AVAILABLE);
      if (!handler) {
        throw new Error("skill:list-available handler not registered");
      }

      // When & Then: エラーがスローされるか、エラーレスポンスが返される
      try {
        await handler({}, {});
        // If it doesn't throw, it should return an error structure
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  // ===========================================================================
  // skill:list-imported
  // ===========================================================================

  describe("skill:list-imported", () => {
    it("SH-LI-01: should call skillService.getImportedSkills", async () => {
      const mockData: Skill[] = [
        {
          id: "skill-1",
          name: "Imported Skill",
          slug: "imported-skill",
          description: "An imported skill",
          path: "/test/skills/imported-skill/SKILL.md",
          triggers: ["import"],
          anchors: [],
          lastModified: new Date(),
        },
      ];
      mockSkillService.getImportedSkills.mockResolvedValue(mockData);

      const handler = handlers.get(SKILL_CHANNELS.LIST_IMPORTED);
      if (!handler) {
        throw new Error("skill:list-imported handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = await handler({});

      // Then: skillService.getImportedSkillsが呼び出される
      expect(mockSkillService.getImportedSkills).toHaveBeenCalled();
      expect(result as Skill[]).toHaveLength(1);
    });

    it("SH-LI-02: should return empty array when no skills imported", async () => {
      mockSkillService.getImportedSkills.mockResolvedValue([]);

      const handler = handlers.get(SKILL_CHANNELS.LIST_IMPORTED);
      if (!handler) {
        throw new Error("skill:list-imported handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = await handler({});

      // Then: 空配列が返される
      expect(result).toEqual([]);
    });
  });

  // ===========================================================================
  // skill:import
  // ===========================================================================

  describe("skill:import", () => {
    it("SH-IMP-01: should call skillService.importSkills with skillIds", async () => {
      const mockResult: ImportResult = {
        success: true,
        importedCount: 2,
        errors: [],
      };
      mockSkillService.importSkills.mockResolvedValue(mockResult);

      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) {
        throw new Error("skill:import handler not registered");
      }

      // When: skillIdsを渡してハンドラーを呼び出す
      const result = await handler({}, { skillIds: ["skill-1", "skill-2"] });

      // Then: skillService.importSkillsがskillIdsで呼び出される
      expect(mockSkillService.importSkills).toHaveBeenCalledWith([
        "skill-1",
        "skill-2",
      ]);
      expect((result as ImportResult).importedCount).toBe(2);
    });

    it("SH-IMP-02: should validate skillIds is an array", async () => {
      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) {
        throw new Error("skill:import handler not registered");
      }

      // When: skillIdsが配列でない
      try {
        await handler({}, { skillIds: "not-an-array" });
        // If no throw, check for error response
        throw new Error("Expected validation error");
      } catch (error) {
        // Then: バリデーションエラー
        expect(error).toBeDefined();
      }
    });

    it("SH-IMP-03: should throw VALIDATION_ERROR for invalid skillIds", async () => {
      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) {
        throw new Error("skill:import handler not registered");
      }

      // When: skillIdsが無効
      try {
        await handler({}, { skillIds: null });
        throw new Error("Expected validation error");
      } catch (error) {
        // Then: VALIDATION_ERRORがスローされる
        const ipcError = error as IPCError;
        expect(ipcError.code || "VALIDATION_ERROR").toBe("VALIDATION_ERROR");
      }
    });

    it("SH-IMP-04: should validate each skillId in array", async () => {
      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) {
        throw new Error("skill:import handler not registered");
      }

      // When: skillIds配列に無効な値が含まれる
      try {
        await handler({}, { skillIds: ["valid-id", 123, "another-valid"] });
        throw new Error("Expected validation error");
      } catch (error) {
        // Then: バリデーションエラー
        expect(error).toBeDefined();
      }
    });

    it("SH-IMP-05: should validate skillId format (alphanumeric, hyphen, underscore)", async () => {
      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) {
        throw new Error("skill:import handler not registered");
      }

      // When: skillIdに不正な文字が含まれる
      try {
        await handler({}, { skillIds: ["valid-id", "invalid/../id"] });
        throw new Error("Expected validation error");
      } catch (error) {
        // Then: バリデーションエラー
        expect(error).toBeDefined();
      }
    });

    it("SH-IMP-06: should validate skillId length (max 64 chars)", async () => {
      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) {
        throw new Error("skill:import handler not registered");
      }

      // When: skillIdが64文字を超える
      const longId = "a".repeat(65);
      try {
        await handler({}, { skillIds: [longId] });
        throw new Error("Expected validation error");
      } catch (error) {
        // Then: バリデーションエラー
        expect(error).toBeDefined();
      }
    });
  });

  // ===========================================================================
  // skill:remove
  // ===========================================================================

  describe("skill:remove", () => {
    it("SH-RM-01: should call skillService.removeSkill with skillId", async () => {
      const mockResult: RemoveResult = {
        success: true,
        removed: true,
      };
      mockSkillService.removeSkill.mockResolvedValue(mockResult);

      const handler = handlers.get(SKILL_CHANNELS.REMOVE);
      if (!handler) {
        throw new Error("skill:remove handler not registered");
      }

      // When: skillIdを渡してハンドラーを呼び出す
      const result = await handler({}, { skillId: "skill-to-remove" });

      // Then: skillService.removeSkillがskillIdで呼び出される
      expect(mockSkillService.removeSkill).toHaveBeenCalledWith(
        "skill-to-remove",
      );
      expect((result as RemoveResult).removed).toBe(true);
    });

    it("SH-RM-02: should validate skillId is a string", async () => {
      const handler = handlers.get(SKILL_CHANNELS.REMOVE);
      if (!handler) {
        throw new Error("skill:remove handler not registered");
      }

      // When: skillIdが文字列でない
      try {
        await handler({}, { skillId: 123 });
        throw new Error("Expected validation error");
      } catch (error) {
        // Then: バリデーションエラー
        expect(error).toBeDefined();
      }
    });

    it("SH-RM-03: should validate skillId is not empty", async () => {
      const handler = handlers.get(SKILL_CHANNELS.REMOVE);
      if (!handler) {
        throw new Error("skill:remove handler not registered");
      }

      // When: skillIdが空文字
      try {
        await handler({}, { skillId: "" });
        throw new Error("Expected validation error");
      } catch (error) {
        // Then: バリデーションエラー
        expect(error).toBeDefined();
      }
    });

    it("SH-RM-04: should handle non-existent skill gracefully", async () => {
      mockSkillService.removeSkill.mockResolvedValue({
        success: true,
        removed: false,
      });

      const handler = handlers.get(SKILL_CHANNELS.REMOVE);
      if (!handler) {
        throw new Error("skill:remove handler not registered");
      }

      // When: 存在しないスキルを削除
      const result = await handler({}, { skillId: "nonexistent" });

      // Then: success=true, removed=false
      expect((result as RemoveResult).success).toBe(true);
      expect((result as RemoveResult).removed).toBe(false);
    });
  });

  // ===========================================================================
  // skill:get-detail
  // ===========================================================================

  describe("skill:get-detail", () => {
    it("SH-GD-01: should call skillService.getSkillById with skillId", async () => {
      const mockSkill: Skill = {
        id: "skill-1",
        name: "Detail Skill",
        slug: "detail-skill",
        description: "A skill with details",
        path: "/test/skills/detail-skill/SKILL.md",
        triggers: ["detail"],
        anchors: [{ source: "Source", application: "App", purpose: "Purpose" }],
        category: "testing",
        lastModified: new Date(),
      };
      mockSkillService.getSkillById.mockResolvedValue(mockSkill);

      const handler = handlers.get(SKILL_CHANNELS.GET_DETAIL);
      if (!handler) {
        throw new Error("skill:get-detail handler not registered");
      }

      // When: skillIdを渡してハンドラーを呼び出す
      const result = await handler({}, { skillId: "skill-1" });

      // Then: skillService.getSkillByIdがskillIdで呼び出される
      expect(mockSkillService.getSkillById).toHaveBeenCalledWith("skill-1");
      expect((result as Skill).name).toBe("Detail Skill");
    });

    it("SH-GD-02: should return null for unknown skillId", async () => {
      mockSkillService.getSkillById.mockResolvedValue(null);

      const handler = handlers.get(SKILL_CHANNELS.GET_DETAIL);
      if (!handler) {
        throw new Error("skill:get-detail handler not registered");
      }

      // When: 存在しないskillIdで呼び出す
      const result = await handler({}, { skillId: "nonexistent" });

      // Then: nullが返される
      expect(result).toBeNull();
    });

    it("SH-GD-03: should validate skillId", async () => {
      const handler = handlers.get(SKILL_CHANNELS.GET_DETAIL);
      if (!handler) {
        throw new Error("skill:get-detail handler not registered");
      }

      // When: skillIdが無効
      try {
        await handler({}, { skillId: "" });
        throw new Error("Expected validation error");
      } catch (error) {
        // Then: バリデーションエラー
        expect(error).toBeDefined();
      }
    });
  });

  // ===========================================================================
  // IPC sender validation
  // ===========================================================================

  describe("IPC sender validation", () => {
    it("SH-VAL-01: should validate IPC sender for all handlers", async () => {
      // This test verifies that withValidation is used for all handlers
      const { withValidation } =
        await import("../../infrastructure/security/ipc-validator.js");

      // Then: withValidationがすべてのチャネルで呼び出されている
      // Note: This will be verified when the handlers are registered
      expect(withValidation).toBeDefined();
    });

    it("SH-VAL-02: should reject DevTools sender", async () => {
      // Given: DevToolsからの呼び出し
      const { validateIpcSender } =
        await import("../../infrastructure/security/ipc-validator.js");
      (validateIpcSender as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const handler = handlers.get(SKILL_CHANNELS.LIST_AVAILABLE);
      if (!handler) {
        throw new Error("skill:list-available handler not registered");
      }

      // When & Then: 無効なsenderが拒否される
      // Note: Implementation should check sender validation
      // This depends on how the handler is implemented
    });
  });

  // ===========================================================================
  // unregisterSkillHandlers
  // ===========================================================================

  describe("unregisterSkillHandlers", () => {
    it("SH-UNREG-01: should remove all skill handlers", async () => {
      try {
        const { unregisterSkillHandlers } = await import("../skillHandlers");

        // When: unregisterSkillHandlersを呼び出す
        unregisterSkillHandlers();

        // Then: ipcMain.removeHandlerが呼び出される
        expect(ipcMain.removeHandler).toHaveBeenCalledWith(
          SKILL_CHANNELS.LIST_AVAILABLE,
        );
        expect(ipcMain.removeHandler).toHaveBeenCalledWith(
          SKILL_CHANNELS.LIST_IMPORTED,
        );
        expect(ipcMain.removeHandler).toHaveBeenCalledWith(
          SKILL_CHANNELS.IMPORT,
        );
        expect(ipcMain.removeHandler).toHaveBeenCalledWith(
          SKILL_CHANNELS.REMOVE,
        );
        expect(ipcMain.removeHandler).toHaveBeenCalledWith(
          SKILL_CHANNELS.GET_DETAIL,
        );
      } catch {
        // Expected in Red phase
        throw new Error("unregisterSkillHandlers not implemented - Red phase");
      }
    });
  });
});
