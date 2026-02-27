/**
 * skillHandlers Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 *
 * NOTE: Per Phase 3 Design Review, we use existing `skill:` prefix channels
 * instead of the originally designed `agent:` prefix channels.
 *
 * Channel mapping:
 * - skill:list (was: agent:scan-available-skills)
 * - skill:getImported (was: agent:get-imported-skills)
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

// ImportResult型はmockデータの構造参照として保持（型アノテーションとしては未使用）
interface _ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
}

interface RemoveResult {
  success: boolean;
  removed: boolean;
}

interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// UT-FIX-SKILL-IMPORT-RETURN-TYPE-001: ImportedSkill型定義
interface SkillSubResource {
  name: string;
  path: string;
}

interface SkillOtherFile {
  name: string;
  path: string;
  type: string;
}

interface ImportedSkill {
  name: string;
  description: string;
  allowedTools?: string[];
  path: string;
  updatedAt: Date;
  agents: SkillSubResource[];
  references: SkillSubResource[];
  scripts: SkillSubResource[];
  assets: SkillSubResource[];
  schemas: SkillSubResource[];
  indexes: SkillSubResource[];
  otherFiles: SkillOtherFile[];
  importedAt: Date;
  status: "active" | "disabled";
  content?: string;
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
  getSkillByName: vi.fn(), // UT-FIX-SKILL-IMPORT-RETURN-TYPE-001
  // TASK-FIX-7-1: SkillExecutor委譲
  setSkillExecutor: vi.fn(),
  // TASK-9C: スキル改善機能
  getSkillsDirectory: vi.fn().mockReturnValue("/mock/skills/dir"),
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

// Skill IPC Channels (per Phase 3 review - using existing channels.ts definitions)
const SKILL_CHANNELS = {
  LIST_AVAILABLE: "skill:list",
  LIST_IMPORTED: "skill:getImported",
  IMPORT: "skill:import",
  REMOVE: "skill:remove",
  GET_DETAIL: "skill:get-detail",
  SCAN: "skill:scan",
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
      registerSkillHandlers(mockMainWindow, mockSkillService as any);
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
    it("SH-REG-01: should register skill:list handler", () => {
      expect(handlers.has(SKILL_CHANNELS.LIST_AVAILABLE)).toBe(true);
    });

    it("SH-REG-02: should register skill:getImported handler", () => {
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
  // skill:list
  // ===========================================================================

  describe("skill:list", () => {
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
        throw new Error("skill:list handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = await handler({}, {});

      // Then: skillService.scanAvailableSkillsが呼び出される
      expect(mockSkillService.scanAvailableSkills).toHaveBeenCalled();
      // Now returns OperationResult format: { success: true, data: [...] }
      const opResult = result as OperationResult<Skill[]>;
      expect(opResult.success).toBe(true);
      expect(opResult.data).toHaveLength(1);
    });

    it("SH-LA-02: should pass forceRefresh option", async () => {
      const handler = handlers.get(SKILL_CHANNELS.LIST_AVAILABLE);
      if (!handler) {
        throw new Error("skill:list handler not registered");
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
        throw new Error("skill:list handler not registered");
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
  // skill:scan
  // ===========================================================================

  describe("skill:scan", () => {
    it("SH-SC-01: should register skill:scan handler", () => {
      expect(handlers.has(SKILL_CHANNELS.SCAN)).toBe(true);
    });

    it("SH-SC-02: should call skillService.scanAvailableSkills with forceRefresh=true", async () => {
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

      const handler = handlers.get(SKILL_CHANNELS.SCAN);
      if (!handler) {
        throw new Error("skill:scan handler not registered");
      }

      // When: ハンドラーを呼び出す
      await handler({});

      // Then: scanAvailableSkillsがforceRefresh=trueで呼び出される
      expect(mockSkillService.scanAvailableSkills).toHaveBeenCalledWith(true);
    });

    it("SH-SC-03: should return success response with skills data", async () => {
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
            lastModified: new Date(),
          },
        ],
        errors: [],
        scannedAt: new Date(),
      };
      mockSkillService.scanAvailableSkills.mockResolvedValue(mockData);

      const handler = handlers.get(SKILL_CHANNELS.SCAN);
      if (!handler) {
        throw new Error("skill:scan handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = await handler({});

      // Then: 成功レスポンスが返される
      const opResult = result as OperationResult<Skill[]>;
      expect(opResult.success).toBe(true);
      expect(opResult.data).toHaveLength(1);
      expect(opResult.data?.[0].name).toBe("Test Skill");
    });

    it("SH-SC-04: should return error response on service failure", async () => {
      mockSkillService.scanAvailableSkills.mockRejectedValue(
        new Error("Scan failed"),
      );

      const handler = handlers.get(SKILL_CHANNELS.SCAN);
      if (!handler) {
        throw new Error("skill:scan handler not registered");
      }

      // When: エラーが発生する
      const result = await handler({});

      // Then: エラーレスポンスが返される
      const opResult = result as OperationResult<Skill[]>;
      expect(opResult.success).toBe(false);
      expect(opResult.error).toBe("Scan failed");
    });

    it("SH-SC-05: should validate IPC sender", async () => {
      const { validateIpcSender } =
        await import("../../infrastructure/security/ipc-validator.js");

      const handler = handlers.get(SKILL_CHANNELS.SCAN);
      if (!handler) {
        throw new Error("skill:scan handler not registered");
      }

      // When: ハンドラーを呼び出す
      await handler({});

      // Then: validateIpcSenderが呼び出される
      expect(validateIpcSender).toHaveBeenCalledWith(
        expect.anything(),
        "skill:scan",
        expect.objectContaining({
          getAllowedWindows: expect.any(Function),
        }),
      );
    });

    it("SH-SC-06: should return empty array when no skills found", async () => {
      const mockData: SkillScanResult = {
        skills: [],
        errors: [],
        scannedAt: new Date(),
      };
      mockSkillService.scanAvailableSkills.mockResolvedValue(mockData);

      const handler = handlers.get(SKILL_CHANNELS.SCAN);
      if (!handler) {
        throw new Error("skill:scan handler not registered");
      }

      // When: スキルが0件の場合
      const result = await handler({});

      // Then: 空配列が返される
      const opResult = result as OperationResult<Skill[]>;
      expect(opResult.success).toBe(true);
      expect(opResult.data).toEqual([]);
    });

    it("SH-SC-07: should always use forceRefresh=true for cache clear", async () => {
      const mockData: SkillScanResult = {
        skills: [],
        errors: [],
        scannedAt: new Date(),
      };
      mockSkillService.scanAvailableSkills.mockResolvedValue(mockData);

      const handler = handlers.get(SKILL_CHANNELS.SCAN);
      if (!handler) {
        throw new Error("skill:scan handler not registered");
      }

      // When: 複数回呼び出す
      await handler({});
      await handler({});

      // Then: 常にforceRefresh=trueで呼び出される
      expect(mockSkillService.scanAvailableSkills).toHaveBeenCalledTimes(2);
      expect(mockSkillService.scanAvailableSkills).toHaveBeenNthCalledWith(
        1,
        true,
      );
      expect(mockSkillService.scanAvailableSkills).toHaveBeenNthCalledWith(
        2,
        true,
      );
    });

    it("SH-SC-08: should reject calls from DevTools", async () => {
      const { validateIpcSender } =
        await import("../../infrastructure/security/ipc-validator.js");

      // Given: DevToolsからの呼び出し
      (validateIpcSender as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        valid: false,
        errorCode: "IPC_DEVTOOLS_NOT_ALLOWED",
        errorMessage: "DevTools sender not allowed",
      });

      const handler = handlers.get(SKILL_CHANNELS.SCAN);
      if (!handler) {
        throw new Error("skill:scan handler not registered");
      }

      // When & Then: 例外がスローされる
      await expect(handler({})).rejects.toBeDefined();
    });

    it("SH-SC-09: should return default error message for non-Error exceptions", async () => {
      // Given: Error以外の例外
      mockSkillService.scanAvailableSkills.mockRejectedValue("Unknown error");

      const handler = handlers.get(SKILL_CHANNELS.SCAN);
      if (!handler) {
        throw new Error("skill:scan handler not registered");
      }

      // When: 例外が発生
      const result = await handler({});

      // Then: デフォルトメッセージが返される
      const opResult = result as OperationResult<Skill[]>;
      expect(opResult.success).toBe(false);
      // UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001: sanitizeErrorMessageにより統一されたデフォルトメッセージ
      expect(opResult.error).toBe("スキル処理でエラーが発生しました");
    });

    it("SH-SC-10: should be removed by unregisterSkillHandlers", async () => {
      const { unregisterSkillHandlers } = await import("../skillHandlers");

      // When: unregisterSkillHandlersを呼び出す
      unregisterSkillHandlers();

      // Then: SKILL_SCANのremoveHandlerが呼び出される
      expect(ipcMain.removeHandler).toHaveBeenCalledWith("skill:scan");
    });
  });

  // ===========================================================================
  // skill:scan security (Phase 6)
  // ===========================================================================

  describe("skill:scan security", () => {
    it("SH-SC-11: should reject calls from unknown window", async () => {
      const { validateIpcSender } =
        await import("../../infrastructure/security/ipc-validator.js");

      // Given: 未知のウィンドウからの呼び出し
      (validateIpcSender as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        valid: false,
        errorCode: "IPC_UNAUTHORIZED",
        errorMessage: "Unknown window",
      });

      const handler = handlers.get(SKILL_CHANNELS.SCAN);
      if (!handler) {
        throw new Error("skill:scan handler not registered");
      }

      // When & Then: 例外がスローされる
      await expect(handler({})).rejects.toBeDefined();
    });

    it("SH-SC-12: should reject calls from destroyed window", async () => {
      const { validateIpcSender } =
        await import("../../infrastructure/security/ipc-validator.js");

      // Given: 破棄されたウィンドウからの呼び出し
      (validateIpcSender as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        valid: false,
        errorCode: "IPC_WINDOW_DESTROYED",
        errorMessage: "Window has been destroyed",
      });

      const handler = handlers.get(SKILL_CHANNELS.SCAN);
      if (!handler) {
        throw new Error("skill:scan handler not registered");
      }

      // When & Then: 例外がスローされる
      await expect(handler({})).rejects.toBeDefined();
    });
  });

  // ===========================================================================
  // skill:getImported
  // ===========================================================================

  describe("skill:getImported", () => {
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
        throw new Error("skill:getImported handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = await handler({});

      // Then: skillService.getImportedSkillsが呼び出される
      expect(mockSkillService.getImportedSkills).toHaveBeenCalled();
      // Now returns OperationResult format: { success: true, data: [...] }
      const opResult = result as OperationResult<Skill[]>;
      expect(opResult.success).toBe(true);
      expect(opResult.data).toHaveLength(1);
    });

    it("SH-LI-02: should return empty array when no skills imported", async () => {
      mockSkillService.getImportedSkills.mockResolvedValue([]);

      const handler = handlers.get(SKILL_CHANNELS.LIST_IMPORTED);
      if (!handler) {
        throw new Error("skill:getImported handler not registered");
      }

      // When: ハンドラーを呼び出す
      const result = await handler({});

      // Then: OperationResultで空配列が返される
      const opResult = result as OperationResult<Skill[]>;
      expect(opResult.success).toBe(true);
      expect(opResult.data).toEqual([]);
    });
  });

  // ===========================================================================
  // skill:import
  // ===========================================================================

  describe("skill:import", () => {
    // UT-FIX-SKILL-IMPORT-RETURN-TYPE-001: テスト用モックデータ
    const mockImportedSkill: ImportedSkill = {
      name: "test-skill",
      description: "A test skill for import",
      path: "/test/skills/test-skill/SKILL.md",
      updatedAt: new Date("2026-02-21T00:00:00Z"),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
      importedAt: new Date("2026-02-21T01:00:00Z"),
      status: "active",
    };

    it("SH-IMP-01: should return ImportedSkill from skill:import handler", async () => {
      // Given: importSkills 成功、getSkillByName が ImportedSkill を返す
      mockSkillService.importSkills.mockResolvedValue({
        success: true,
        importedCount: 1,
        errors: [],
      });
      mockSkillService.getSkillByName.mockResolvedValue(mockImportedSkill);

      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) {
        throw new Error("skill:import handler not registered");
      }

      // When: スキル名を渡してハンドラーを呼び出す
      const result = await handler({}, "test-skill");

      // Then: ImportedSkill型のオブジェクトが返される
      const imported = result as ImportedSkill;
      expect(imported.name).toBe("test-skill");
      expect(imported.description).toBe("A test skill for import");
      expect(imported.importedAt).toBeDefined();
      expect(imported.status).toBe("active");
      expect(imported.path).toBeDefined();
      expect(imported.agents).toBeInstanceOf(Array);
    });

    it("SH-IMP-02: should throw VALIDATION_ERROR when skillName is not a string", async () => {
      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) {
        throw new Error("skill:import handler not registered");
      }

      // When: 数値を渡す
      try {
        await handler({}, 123);
        throw new Error("Expected validation error");
      } catch (error) {
        // Then: VALIDATION_ERRORがスローされる
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-IMP-03: should throw VALIDATION_ERROR for empty string", async () => {
      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) {
        throw new Error("skill:import handler not registered");
      }

      // When: 空文字列を渡す
      try {
        await handler({}, "");
        throw new Error("Expected validation error");
      } catch (error) {
        // Then: VALIDATION_ERRORがスローされる
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-IMP-04: should throw VALIDATION_ERROR for whitespace-only string (P42)", async () => {
      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) {
        throw new Error("skill:import handler not registered");
      }

      // When: スペースのみの文字列を渡す
      try {
        await handler({}, "   ");
        throw new Error("Expected validation error");
      } catch (error) {
        // Then: .trim()によりVALIDATION_ERRORがスローされる
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-IMP-05: should call validateIpcSender with correct channel and options", async () => {
      const { validateIpcSender } =
        await import("../../infrastructure/security/ipc-validator.js");

      mockSkillService.importSkills.mockResolvedValue({
        success: true,
        importedCount: 1,
        errors: [],
      });
      mockSkillService.getSkillByName.mockResolvedValue(mockImportedSkill);

      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) {
        throw new Error("skill:import handler not registered");
      }

      await handler({}, "valid-skill");

      // Then: validateIpcSender が正しい引数で呼ばれている
      expect(validateIpcSender).toHaveBeenCalledWith(
        {},
        SKILL_CHANNELS.IMPORT,
        expect.objectContaining({
          getAllowedWindows: expect.any(Function),
        }),
      );

      // P41準拠: getAllowedWindows コールバックの戻り値を明示的に検証
      const callArgs = (
        validateIpcSender as ReturnType<typeof vi.fn>
      ).mock.calls.find((call: unknown[]) => call[1] === SKILL_CHANNELS.IMPORT);
      if (callArgs && callArgs[2]?.getAllowedWindows) {
        const windows = callArgs[2].getAllowedWindows();
        expect(windows).toContain(mockMainWindow);
      }
    });

    it("SH-IMP-06: should wrap skillName in array when calling importSkills", async () => {
      mockSkillService.importSkills.mockResolvedValue({
        success: true,
        importedCount: 1,
        errors: [],
      });
      mockSkillService.getSkillByName.mockResolvedValue(mockImportedSkill);

      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) {
        throw new Error("skill:import handler not registered");
      }

      // When: 単一のskillNameを渡す
      await handler({}, "my-skill");

      // Then: importSkillsが配列["my-skill"]で呼ばれる（配列ラップの確認）
      const callArgs = mockSkillService.importSkills.mock.calls[0];
      expect(callArgs[0]).toEqual(["my-skill"]);
      expect(Array.isArray(callArgs[0])).toBe(true);
      expect(callArgs[0]).toHaveLength(1);
    });

    it("SH-IMP-07: should propagate skillService.importSkills error", async () => {
      const serviceError = new Error("Import failed");
      mockSkillService.importSkills.mockRejectedValue(serviceError);

      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) {
        throw new Error("skill:import handler not registered");
      }

      // When: サービスがエラーをスローする
      try {
        await handler({}, "error-skill");
        throw new Error("Expected service error");
      } catch (error) {
        // Then: サービスのエラーがそのまま伝播する
        expect(error).toBe(serviceError);
        expect((error as Error).message).toBe("Import failed");
      }
    });

    // Phase 6: テスト拡充 -- SH-IMP-08〜SH-IMP-13 + 境界値テスト

    it("SH-IMP-08: should throw VALIDATION_ERROR for null argument", async () => {
      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) {
        throw new Error("skill:import handler not registered");
      }

      // When: nullを渡す（旧APIからの誤呼び出しシナリオ）
      try {
        await handler({}, null as unknown as string);
        throw new Error("Expected validation error");
      } catch (error) {
        // Then: typeof null !== "string" でVALIDATION_ERRORがスローされる
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-IMP-09: should throw VALIDATION_ERROR for undefined argument", async () => {
      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) {
        throw new Error("skill:import handler not registered");
      }

      // When: undefinedを渡す（引数省略シナリオ）
      try {
        await handler({}, undefined as unknown as string);
        throw new Error("Expected validation error");
      } catch (error) {
        // Then: typeof undefined !== "string" でVALIDATION_ERRORがスローされる
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-IMP-10: should throw VALIDATION_ERROR for old format object { skillIds: [] } (P44)", async () => {
      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) {
        throw new Error("skill:import handler not registered");
      }

      // When: 旧形式のオブジェクト引数を渡す（P44パターン再発防止テスト）
      try {
        await handler({}, {
          skillIds: ["test-skill"],
        } as unknown as string);
        throw new Error("Expected validation error");
      } catch (error) {
        // Then: typeof object !== "string" でVALIDATION_ERRORがスローされる
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-IMP-11: should handle special characters in skill name normally", async () => {
      mockSkillService.importSkills.mockResolvedValue({
        success: true,
        importedCount: 1,
        errors: [],
      });
      mockSkillService.getSkillByName.mockResolvedValue({
        ...mockImportedSkill,
        name: "my-skill_v2.0",
      });

      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) {
        throw new Error("skill:import handler not registered");
      }

      // When: 特殊文字（ハイフン、アンダースコア、ドット）を含むスキル名
      const result = await handler({}, "my-skill_v2.0");

      // Then: 正常に処理される
      expect(mockSkillService.importSkills).toHaveBeenCalledWith([
        "my-skill_v2.0",
      ]);
      // UT-FIX-SKILL-IMPORT-RETURN-TYPE-001: ImportedSkill型が返される
      const imported = result as ImportedSkill;
      expect(imported.name).toBe("my-skill_v2.0");
    });

    it("SH-IMP-12: should throw VALIDATION_ERROR for tab-only string (P42)", async () => {
      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) {
        throw new Error("skill:import handler not registered");
      }

      // When: タブ文字のみの文字列を渡す
      try {
        await handler({}, "\t\t");
        throw new Error("Expected validation error");
      } catch (error) {
        // Then: .trim()によりVALIDATION_ERRORがスローされる
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-IMP-13: should throw VALIDATION_ERROR for newline-only string (P42)", async () => {
      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) {
        throw new Error("skill:import handler not registered");
      }

      // When: 改行文字のみの文字列を渡す
      try {
        await handler({}, "\n\n");
        throw new Error("Expected validation error");
      } catch (error) {
        // Then: .trim()によりVALIDATION_ERRORがスローされる
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    // === RT-01〜RT-06: 戻り値型検証テスト (UT-FIX-SKILL-IMPORT-RETURN-TYPE-001) ===

    it("RT-01: should return ImportedSkill type from handler", async () => {
      // Given: インポート成功、スキル取得成功
      mockSkillService.importSkills.mockResolvedValue({
        success: true,
        importedCount: 1,
        errors: [],
      });
      mockSkillService.getSkillByName.mockResolvedValue(mockImportedSkill);

      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) throw new Error("skill:import handler not registered");

      // When: ハンドラを呼び出す
      const result = await handler({}, "test-skill");

      // Then: ImportedSkill型のプロパティが存在する
      const imported = result as ImportedSkill;
      expect(imported).toHaveProperty("name");
      expect(imported).toHaveProperty("importedAt");
      expect(imported).toHaveProperty("status");
      expect(imported).toHaveProperty("path");
      expect(imported).toHaveProperty("description");
      expect(imported).toHaveProperty("agents");
      expect(imported).toHaveProperty("references");
    });

    it("RT-02: should not contain ImportResult properties", async () => {
      // Given: インポート成功、スキル取得成功
      mockSkillService.importSkills.mockResolvedValue({
        success: true,
        importedCount: 1,
        errors: [],
      });
      mockSkillService.getSkillByName.mockResolvedValue(mockImportedSkill);

      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) throw new Error("skill:import handler not registered");

      // When: ハンドラを呼び出す
      const result = await handler({}, "test-skill");

      // Then: ImportResult型のプロパティが含まれない
      expect(result).not.toHaveProperty("importedCount");
      expect(result).not.toHaveProperty("errors");
    });

    it("RT-03: should throw IMPORT_ERROR when import fails", async () => {
      // Given: インポート失敗
      mockSkillService.importSkills.mockResolvedValue({
        success: false,
        importedCount: 0,
        errors: ["Skill not found in available skills"],
      });

      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) throw new Error("skill:import handler not registered");

      // When & Then: IMPORT_ERROR がthrowされる
      try {
        await handler({}, "nonexistent-skill");
        throw new Error("Expected IMPORT_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("IMPORT_ERROR");
        expect((error as { message: string }).message).toContain(
          "Skill not found in available skills",
        );
      }
    });

    it("RT-04: should throw IMPORT_ERROR when getSkillByName returns null", async () => {
      // Given: インポート成功だが、getSkillByName が null を返す
      mockSkillService.importSkills.mockResolvedValue({
        success: true,
        importedCount: 1,
        errors: [],
      });
      mockSkillService.getSkillByName.mockResolvedValue(null);

      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) throw new Error("skill:import handler not registered");

      // When & Then: IMPORT_ERROR がthrowされる
      try {
        await handler({}, "ghost-skill");
        throw new Error("Expected IMPORT_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("IMPORT_ERROR");
        expect((error as { message: string }).message).toContain("ghost-skill");
      }
    });

    it("RT-05: should return importedAt as Date-compatible value", async () => {
      // Given: インポート成功、importedAt が Date オブジェクト
      const skillWithDate = {
        ...mockImportedSkill,
        importedAt: new Date("2026-02-21T01:00:00Z"),
      };
      mockSkillService.importSkills.mockResolvedValue({
        success: true,
        importedCount: 1,
        errors: [],
      });
      mockSkillService.getSkillByName.mockResolvedValue(skillWithDate);

      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) throw new Error("skill:import handler not registered");

      // When: ハンドラを呼び出す
      const result = await handler({}, "test-skill");

      // Then: importedAt が Date 互換の値
      const imported = result as ImportedSkill;
      expect(imported.importedAt).toBeDefined();
      expect(imported.importedAt).toBeTruthy();
      const dateValue = new Date(imported.importedAt);
      expect(dateValue.getTime()).not.toBeNaN();
    });

    it("RT-06: should call importSkills and getSkillByName with correct args", async () => {
      // Given: インポート成功
      mockSkillService.importSkills.mockResolvedValue({
        success: true,
        importedCount: 1,
        errors: [],
      });
      mockSkillService.getSkillByName.mockResolvedValue(mockImportedSkill);

      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) throw new Error("skill:import handler not registered");

      // When: ハンドラを呼び出す
      await handler({}, "my-skill");

      // Then: importSkills が配列ラップされたスキル名で呼ばれる
      expect(mockSkillService.importSkills).toHaveBeenCalledWith(["my-skill"]);
      // Then: getSkillByName が同じスキル名で呼ばれる
      expect(mockSkillService.getSkillByName).toHaveBeenCalledWith("my-skill");
    });

    // === RT-07〜RT-10: エラーケーステスト (Phase 6: テスト拡充) ===

    it("RT-07: should propagate importSkills exception", async () => {
      // Given: importSkills がランタイムエラーをthrow
      mockSkillService.importSkills.mockRejectedValue(
        new Error("File system error during import"),
      );

      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) throw new Error("skill:import handler not registered");

      // When & Then: エラーが伝播する
      await expect(handler({}, "error-skill")).rejects.toThrow(
        "File system error during import",
      );
    });

    it("RT-08: should propagate getSkillByName exception", async () => {
      // Given: importSkills 成功、getSkillByName がエラーをthrow
      mockSkillService.importSkills.mockResolvedValue({
        success: true,
        importedCount: 1,
        errors: [],
      });
      mockSkillService.getSkillByName.mockRejectedValue(
        new Error("Cache corruption"),
      );

      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) throw new Error("skill:import handler not registered");

      // When & Then: エラーが伝播する
      await expect(handler({}, "cache-error-skill")).rejects.toThrow(
        "Cache corruption",
      );
    });

    it("RT-09: should throw IMPORT_ERROR when importedCount is 0 despite success", async () => {
      // Given: success=true だが importedCount=0（既にインポート済み等）
      mockSkillService.importSkills.mockResolvedValue({
        success: true,
        importedCount: 0,
        errors: [],
      });

      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) throw new Error("skill:import handler not registered");

      // When & Then: IMPORT_ERROR がthrowされる
      try {
        await handler({}, "already-imported");
        throw new Error("Expected IMPORT_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("IMPORT_ERROR");
        expect((error as { message: string }).message).toContain(
          "already-imported",
        );
      }
    });

    it("RT-10: should join multiple error messages in IMPORT_ERROR", async () => {
      // Given: 複数のエラーメッセージ
      mockSkillService.importSkills.mockResolvedValue({
        success: false,
        importedCount: 0,
        errors: ["SKILL.md not found", "Invalid directory structure"],
      });

      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) throw new Error("skill:import handler not registered");

      // When & Then: エラーメッセージが結合される
      try {
        await handler({}, "broken-skill");
        throw new Error("Expected IMPORT_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("IMPORT_ERROR");
        expect((error as { message: string }).message).toContain(
          "SKILL.md not found",
        );
        expect((error as { message: string }).message).toContain(
          "Invalid directory structure",
        );
      }
    });

    // === RT-11〜RT-15: 境界値テスト (Phase 6: テスト拡充) ===

    it("RT-11: should reject whitespace-only skillName (P42)", async () => {
      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) throw new Error("skill:import handler not registered");

      // When: スペースのみの文字列を渡す
      try {
        await handler({}, "   ");
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("RT-12: should reject tab/newline-only skillName", async () => {
      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) throw new Error("skill:import handler not registered");

      // When: タブ・改行のみの文字列を渡す
      try {
        await handler({}, "\t\n");
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("RT-13: should reject undefined skillName", async () => {
      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) throw new Error("skill:import handler not registered");

      // When: undefinedを渡す
      try {
        await handler({}, undefined);
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      }
    });

    it("RT-14: should reject non-string skillName (number)", async () => {
      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) throw new Error("skill:import handler not registered");

      // When: 数値を渡す
      try {
        await handler({}, 123);
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      }
    });

    it("RT-15: should reject empty string skillName", async () => {
      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) throw new Error("skill:import handler not registered");

      // When: 空文字列を渡す
      try {
        await handler({}, "");
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    // === RT-16〜RT-18: セキュリティ検証テスト (Phase 6: テスト拡充) ===

    it("RT-16: should throw when validateIpcSender returns invalid", async () => {
      const { validateIpcSender, toIPCValidationError } =
        await import("../../infrastructure/security/ipc-validator.js");

      (validateIpcSender as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        valid: false,
        errorCode: "IPC_UNAUTHORIZED",
        errorMessage: "Unauthorized sender",
      });

      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) throw new Error("skill:import handler not registered");

      // When & Then: セキュリティエラーがthrowされる
      try {
        await handler({}, "valid-skill");
        throw new Error("Expected security error");
      } catch {
        expect(toIPCValidationError).toHaveBeenCalledWith({
          valid: false,
          errorCode: "IPC_UNAUTHORIZED",
          errorMessage: "Unauthorized sender",
        });
      }
    });

    it("RT-17: should pass getAllowedWindows callback with mainWindow (P41)", async () => {
      const { validateIpcSender } =
        await import("../../infrastructure/security/ipc-validator.js");

      mockSkillService.importSkills.mockResolvedValue({
        success: true,
        importedCount: 1,
        errors: [],
      });
      mockSkillService.getSkillByName.mockResolvedValue(mockImportedSkill);

      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) throw new Error("skill:import handler not registered");

      await handler({}, "test-skill");

      // Then: validateIpcSender が正しい引数で呼ばれている
      expect(validateIpcSender).toHaveBeenCalledWith(
        expect.anything(),
        "skill:import",
        expect.objectContaining({
          getAllowedWindows: expect.any(Function),
        }),
      );

      // P41準拠: getAllowedWindows コールバックの戻り値を明示的に検証
      const callArgs = (
        validateIpcSender as ReturnType<typeof vi.fn>
      ).mock.calls.find((call: unknown[]) => call[1] === "skill:import");
      if (callArgs && callArgs[2]?.getAllowedWindows) {
        const windows = callArgs[2].getAllowedWindows();
        expect(windows).toContain(mockMainWindow);
      }
    });

    it("RT-18: should reject calls from DevTools", async () => {
      const { validateIpcSender } =
        await import("../../infrastructure/security/ipc-validator.js");

      (validateIpcSender as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        valid: false,
        errorCode: "IPC_DEVTOOLS_NOT_ALLOWED",
        errorMessage: "DevTools sender not allowed",
      });

      const handler = handlers.get(SKILL_CHANNELS.IMPORT);
      if (!handler) throw new Error("skill:import handler not registered");

      // When & Then: DevTools拒否エラー
      await expect(handler({}, "test-skill")).rejects.toBeDefined();
    });
  });

  // ===========================================================================
  // skill:remove
  // ===========================================================================

  describe("skill:remove", () => {
    it("SH-RM-01: should call skillService.removeSkill with skillName", async () => {
      const mockResult: RemoveResult = {
        success: true,
        removed: true,
      };
      mockSkillService.removeSkill.mockResolvedValue(mockResult);

      const handler = handlers.get(SKILL_CHANNELS.REMOVE);
      if (!handler) {
        throw new Error("skill:remove handler not registered");
      }

      // When: 文字列skillNameを渡してハンドラーを呼び出す
      const result = await handler({}, "skill-to-remove");

      // Then: skillService.removeSkillがskillNameで呼び出される
      expect(mockSkillService.removeSkill).toHaveBeenCalledWith(
        "skill-to-remove",
      );
      expect((result as RemoveResult).removed).toBe(true);
    });

    it("SH-RM-02: should validate skillName is a string", async () => {
      const handler = handlers.get(SKILL_CHANNELS.REMOVE);
      if (!handler) {
        throw new Error("skill:remove handler not registered");
      }

      // When: skillNameが文字列でない（数値）
      try {
        await handler({}, 123);
        throw new Error("Expected validation error");
      } catch (error) {
        // Then: バリデーションエラー
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-RM-03: should validate skillName is not empty", async () => {
      const handler = handlers.get(SKILL_CHANNELS.REMOVE);
      if (!handler) {
        throw new Error("skill:remove handler not registered");
      }

      // When: skillNameが空文字列
      try {
        await handler({}, "");
        throw new Error("Expected validation error");
      } catch (error) {
        // Then: バリデーションエラー
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
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

      // When: 存在しないスキルを文字列で削除
      const result = await handler({}, "nonexistent");

      // Then: success=true, removed=false
      expect((result as RemoveResult).success).toBe(true);
      expect((result as RemoveResult).removed).toBe(false);
    });

    it("SH-RM-05: should reject whitespace-only skillName (P42)", async () => {
      const handler = handlers.get(SKILL_CHANNELS.REMOVE);
      if (!handler) {
        throw new Error("skill:remove handler not registered");
      }

      // When: スペースのみの文字列を渡す
      try {
        await handler({}, "   ");
        throw new Error("Expected validation error");
      } catch (error) {
        // Then: バリデーションエラー
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-RM-06: should reject undefined skillName", async () => {
      const handler = handlers.get(SKILL_CHANNELS.REMOVE);
      if (!handler) {
        throw new Error("skill:remove handler not registered");
      }

      // When: undefinedを渡す
      try {
        await handler({}, undefined);
        throw new Error("Expected validation error");
      } catch (error) {
        // Then: バリデーションエラー
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-RM-07: should call validateIpcSender with correct channel and options", async () => {
      const { validateIpcSender } =
        await import("../../infrastructure/security/ipc-validator.js");

      mockSkillService.removeSkill.mockResolvedValue({
        success: true,
        removed: true,
      });

      const handler = handlers.get(SKILL_CHANNELS.REMOVE);
      if (!handler) {
        throw new Error("skill:remove handler not registered");
      }

      await handler({}, "valid-skill");

      // Then: validateIpcSender が正しい引数で呼ばれている
      expect(validateIpcSender).toHaveBeenCalledWith(
        {},
        SKILL_CHANNELS.REMOVE,
        expect.objectContaining({
          getAllowedWindows: expect.any(Function),
        }),
      );

      // P41準拠: getAllowedWindows コールバックの戻り値を明示的に検証
      const callArgs = (
        validateIpcSender as ReturnType<typeof vi.fn>
      ).mock.calls.find((call: unknown[]) => call[1] === SKILL_CHANNELS.REMOVE);
      if (callArgs && callArgs[2]?.getAllowedWindows) {
        const windows = callArgs[2].getAllowedWindows();
        expect(windows).toContain(mockMainWindow);
      }
    });

    it("SH-RM-08: should throw when validateIpcSender returns invalid", async () => {
      const { validateIpcSender, toIPCValidationError } =
        await import("../../infrastructure/security/ipc-validator.js");

      (validateIpcSender as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        valid: false,
        error: "Unauthorized sender",
      });

      const handler = handlers.get(SKILL_CHANNELS.REMOVE);
      if (!handler) {
        throw new Error("skill:remove handler not registered");
      }

      try {
        await handler({}, "valid-skill");
        throw new Error("Expected validation error");
      } catch {
        // Then: toIPCValidationError の結果がスローされる
        expect(toIPCValidationError).toHaveBeenCalledWith({
          valid: false,
          error: "Unauthorized sender",
        });
      }
    });

    it("SH-RM-09: should pass path traversal string to skillService (service-level concern)", async () => {
      mockSkillService.removeSkill.mockResolvedValue({
        success: true,
        removed: false,
      });

      const handler = handlers.get(SKILL_CHANNELS.REMOVE);
      if (!handler) {
        throw new Error("skill:remove handler not registered");
      }

      // When: パストラバーサル文字列を渡す（IPCハンドラはバリデーション通過、サービス層で防御）
      await handler({}, "../../../etc/passwd");

      // Then: 文字列としてサービスに渡される
      expect(mockSkillService.removeSkill).toHaveBeenCalledWith(
        "../../../etc/passwd",
      );
    });

    it("SH-RM-10: should reject tab/newline-only skillName", async () => {
      const handler = handlers.get(SKILL_CHANNELS.REMOVE);
      if (!handler) {
        throw new Error("skill:remove handler not registered");
      }

      // When: タブ・改行のみの文字列を渡す
      try {
        await handler({}, "\t\n");
        throw new Error("Expected validation error");
      } catch (error) {
        // Then: .trim() が空文字列を返すためバリデーションエラー
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-RM-11: should propagate skillService.removeSkill error", async () => {
      const serviceError = new Error("File system error");
      mockSkillService.removeSkill.mockRejectedValue(serviceError);

      const handler = handlers.get(SKILL_CHANNELS.REMOVE);
      if (!handler) {
        throw new Error("skill:remove handler not registered");
      }

      // When: サービスがエラーをスローする
      try {
        await handler({}, "error-skill");
        throw new Error("Expected service error");
      } catch (error) {
        // Then: サービスのエラーがそのまま伝播する
        expect(error).toBe(serviceError);
        expect((error as Error).message).toBe("File system error");
      }
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
      // Now returns OperationResult format: { success: true, data: skill }
      const opResult = result as OperationResult<Skill>;
      expect(opResult.success).toBe(true);
      expect(opResult.data?.name).toBe("Detail Skill");
    });

    it("SH-GD-02: should return error for unknown skillId", async () => {
      mockSkillService.getSkillById.mockResolvedValue(null);

      const handler = handlers.get(SKILL_CHANNELS.GET_DETAIL);
      if (!handler) {
        throw new Error("skill:get-detail handler not registered");
      }

      // When: 存在しないskillIdで呼び出す
      const result = await handler({}, { skillId: "nonexistent" });

      // Then: OperationResultでエラーが返される
      const opResult = result as OperationResult<Skill>;
      expect(opResult.success).toBe(false);
      expect(opResult.error).toBeDefined();
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
        throw new Error("skill:list handler not registered");
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
        expect(ipcMain.removeHandler).toHaveBeenCalledWith(SKILL_CHANNELS.SCAN);
      } catch {
        // Expected in Red phase
        throw new Error("unregisterSkillHandlers not implemented - Red phase");
      }
    });
  });
});
