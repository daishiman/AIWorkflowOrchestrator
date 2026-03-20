/**
 * skillHandlers P42準拠バリデーションテスト
 *
 * UT-FIX-SKILL-VALIDATION-CONSISTENCY-001
 * 6ハンドラのP42準拠3段バリデーション（型チェック→空文字列→トリム空文字列）と
 * throw形式エラーレスポンスを検証する。
 *
 * TDD Red Phase: 修正前の実装に対して全テストが FAIL することを確認する。
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

// Mock ipc-validator: validateIpcSender は常に valid: true を返す
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

// チャンネル名定数
const CHANNELS = {
  GET_DETAIL: "skill:get-detail",
  UPDATE: "skill:update",
  EXECUTE: "skill:execute",
  ABORT: "skill:abort",
  GET_STATUS: "skill:get-status",
  ANALYZE: "skill:analyze",
  IMPROVE: "skill:improve",
} as const;

describe("skillHandlers P42準拠バリデーション", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    // ハンドラをキャプチャ
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    // デフォルトのモックレスポンス
    mockSkillService.scanAvailableSkills.mockResolvedValue({
      skills: [{ id: "skill-1", name: "Test Skill" }],
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
    mockSkillService.updateSkill.mockResolvedValue(undefined);
    mockSkillService.getSkillByName.mockResolvedValue(null);
    mockSkillService.executeSkill.mockResolvedValue({
      executionId: "exec-default",
      status: "success",
      output: "Default output",
      startedAt: new Date(),
      completedAt: new Date(),
    });

    // ハンドラ登録
    const { registerSkillHandlers } = await import("../skillHandlers");
    registerSkillHandlers(mockMainWindow, mockSkillService as never);
  });

  afterEach(() => {
    vi.resetModules();
  });

  /**
   * ヘルパー: ハンドラを取得し、未登録の場合はテスト失敗とする
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
  // skill:get-detail バリデーション
  // ===========================================================================

  describe("skill:get-detail バリデーション", () => {
    it("SH-GD-V01: 正常な文字列skillIdで正常処理されること", async () => {
      // Given: getSkillByIdが正常にスキルを返す
      mockSkillService.getSkillById.mockResolvedValue({
        id: "skill-1",
        name: "Test Skill",
        slug: "test-skill",
        description: "A test skill",
        path: "/test/skills/test-skill/SKILL.md",
        triggers: ["test"],
        anchors: [],
        lastModified: new Date(),
      });

      const handler = getHandler(CHANNELS.GET_DETAIL);

      // When: 正常なskillIdを渡す
      const result = await handler({}, { skillId: "skill-1" });

      // Then: skillServiceが呼び出され、正常レスポンスが返る
      expect(mockSkillService.getSkillById).toHaveBeenCalledWith("skill-1");
      expect((result as { success: boolean }).success).toBe(true);
    });

    it("SH-GD-V02: 空文字列skillIdでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.GET_DETAIL);

      // When: 空文字列を渡す
      // Then: VALIDATION_ERRORがthrowされる
      try {
        await handler({}, { skillId: "" });
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillId must be a non-empty string",
        );
      }
    });

    it("SH-GD-V03: スペースのみのskillIdでVALIDATION_ERRORがthrowされること（P42）", async () => {
      const handler = getHandler(CHANNELS.GET_DETAIL);

      // When: スペースのみの文字列を渡す
      // Then: .trim()により空文字列と判定され、VALIDATION_ERRORがthrowされる
      try {
        await handler({}, { skillId: "   " });
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillId must be a non-empty string",
        );
      }
    });

    it("SH-GD-V04: null skillIdでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.GET_DETAIL);

      // When: nullを渡す
      // Then: typeof null !== "string" でVALIDATION_ERRORがthrowされる
      try {
        await handler({}, { skillId: null });
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillId must be a non-empty string",
        );
      }
    });

    it("SH-GD-V05: undefined（argsなし）でVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.GET_DETAIL);

      // When: argsを省略（undefinedが渡される）
      // Then: args?.skillIdがundefinedとなり、typeof !== "string"でVALIDATION_ERROR
      try {
        await handler({}, undefined);
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillId must be a non-empty string",
        );
      }
    });

    it("SH-GD-V06: 数値型skillIdでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.GET_DETAIL);

      // When: 数値型を渡す
      // Then: typeof 123 !== "string" でVALIDATION_ERRORがthrowされる
      try {
        await handler({}, { skillId: 123 });
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillId must be a non-empty string",
        );
      }
    });
  });

  // ===========================================================================
  // skill:update バリデーション
  // ===========================================================================

  describe("skill:update バリデーション", () => {
    it("SH-UP-V01: 正常な skillName / updates で正常処理されること", async () => {
      const handler = getHandler(CHANNELS.UPDATE);

      const result = await handler(
        {},
        {
          skillName: "test-skill",
          updates: { description: "updated" },
        },
      );

      expect(mockSkillService.updateSkill).toHaveBeenCalledWith("test-skill", {
        description: "updated",
      });
      expect((result as { success: boolean }).success).toBe(true);
    });

    it("SH-UP-V02: 空文字列 skillName で VALIDATION_ERROR が throw されること", async () => {
      const handler = getHandler(CHANNELS.UPDATE);

      try {
        await handler({}, { skillName: "", updates: { description: "x" } });
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-UP-V03: スペースのみの skillName で VALIDATION_ERROR が throw されること（P42）", async () => {
      const handler = getHandler(CHANNELS.UPDATE);

      try {
        await handler({}, { skillName: "   ", updates: { description: "x" } });
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-UP-V04: updates が null で VALIDATION_ERROR が throw されること", async () => {
      const handler = getHandler(CHANNELS.UPDATE);

      try {
        await handler({}, { skillName: "test-skill", updates: null });
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "updates must be a non-null object",
        );
      }
    });

    it("SH-UP-V05: updates が配列で VALIDATION_ERROR が throw されること", async () => {
      const handler = getHandler(CHANNELS.UPDATE);

      try {
        await handler({}, { skillName: "test-skill", updates: [] });
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "updates must be a non-null object",
        );
      }
    });
  });

  // ===========================================================================
  // skill:execute バリデーション
  // ===========================================================================

  describe("skill:execute バリデーション", () => {
    it("SH-EXE-V00: skillName契約（preload互換）で正常処理されること", async () => {
      const handler = getHandler(CHANNELS.EXECUTE);
      mockSkillService.scanAvailableSkills.mockResolvedValueOnce({
        skills: [{ id: "skill-1", name: "Test Skill" }],
        errors: [],
        scannedAt: new Date(),
      });

      const result = await handler({}, { skillName: "Test Skill", prompt: "" });

      expect(mockSkillService.executeSkill).toHaveBeenCalledWith("skill-1", {
        prompt: "",
      });
      expect((result as { success: boolean }).success).toBe(true);
    });

    it("SH-EXE-V00-2: 空文字列skillNameでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.EXECUTE);

      try {
        await handler({}, { skillName: "", prompt: "" });
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-EXE-V01: 正常な文字列skillIdで正常処理されること", async () => {
      const handler = getHandler(CHANNELS.EXECUTE);

      // When: 正常なskillIdを渡す
      const result = await handler({}, { skillId: "skill-1" });

      // Then: skillServiceが呼び出され、正常レスポンスが返る
      expect(mockSkillService.executeSkill).toHaveBeenCalledWith(
        "skill-1",
        undefined,
      );
      expect((result as { success: boolean }).success).toBe(true);
    });

    it("SH-EXE-V02: 空文字列skillIdでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.EXECUTE);

      try {
        await handler({}, { skillId: "" });
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillId must be a non-empty string",
        );
      }
    });

    it("SH-EXE-V03: スペースのみのskillIdでVALIDATION_ERRORがthrowされること（P42）", async () => {
      const handler = getHandler(CHANNELS.EXECUTE);

      try {
        await handler({}, { skillId: "   " });
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillId must be a non-empty string",
        );
      }
    });

    it("SH-EXE-V04: null skillIdでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.EXECUTE);

      try {
        await handler({}, { skillId: null });
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillId must be a non-empty string",
        );
      }
    });

    it("SH-EXE-V05: undefined（argsなし）でVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.EXECUTE);

      try {
        await handler({}, undefined);
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillId must be a non-empty string",
        );
      }
    });

    it("SH-EXE-V06: 数値型skillIdでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.EXECUTE);

      try {
        await handler({}, { skillId: 123 });
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillId must be a non-empty string",
        );
      }
    });
  });

  // ===========================================================================
  // skill:abort バリデーション
  // ===========================================================================

  describe("skill:abort バリデーション", () => {
    it("SH-ABT-V01: 正常な文字列executionIdで正常処理されること", async () => {
      const handler = getHandler(CHANNELS.ABORT);

      // When: 正常なexecutionIdを渡す
      // Then: throwされずに処理が完了する（_skillExecutorInstanceがnullのためfalseが返る可能性あり）
      const result = await handler({}, "exec-123");
      // SkillExecutor未設定時はfalseが返るが、バリデーションは通過している
      expect(result).toBeDefined();
    });

    it("SH-ABT-V02: 空文字列executionIdでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.ABORT);

      try {
        await handler({}, "");
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "executionId must be a non-empty string",
        );
      }
    });

    it("SH-ABT-V03: スペースのみのexecutionIdでVALIDATION_ERRORがthrowされること（P42）", async () => {
      const handler = getHandler(CHANNELS.ABORT);

      try {
        await handler({}, "   ");
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "executionId must be a non-empty string",
        );
      }
    });

    it("SH-ABT-V04: null executionIdでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.ABORT);

      try {
        await handler({}, null);
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "executionId must be a non-empty string",
        );
      }
    });

    it("SH-ABT-V05: undefined executionIdでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.ABORT);

      try {
        await handler({}, undefined);
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "executionId must be a non-empty string",
        );
      }
    });

    it("SH-ABT-V06: 数値型executionIdでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.ABORT);

      try {
        await handler({}, 123);
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "executionId must be a non-empty string",
        );
      }
    });
  });

  // ===========================================================================
  // skill:get-status バリデーション
  // ===========================================================================

  describe("skill:get-status バリデーション", () => {
    it("SH-GS-V01: 正常な文字列executionIdで正常処理されること", async () => {
      const handler = getHandler(CHANNELS.GET_STATUS);

      // When: 正常なexecutionIdを渡す
      // Then: throwされずに処理が完了する（_skillExecutorInstanceがnullのためnullが返る可能性あり）
      const result = await handler({}, "exec-123");
      expect(result).toBeDefined();
    });

    it("SH-GS-V02: 空文字列executionIdでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.GET_STATUS);

      try {
        await handler({}, "");
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "executionId must be a non-empty string",
        );
      }
    });

    it("SH-GS-V03: スペースのみのexecutionIdでVALIDATION_ERRORがthrowされること（P42）", async () => {
      const handler = getHandler(CHANNELS.GET_STATUS);

      try {
        await handler({}, "   ");
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "executionId must be a non-empty string",
        );
      }
    });

    it("SH-GS-V04: null executionIdでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.GET_STATUS);

      try {
        await handler({}, null);
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "executionId must be a non-empty string",
        );
      }
    });

    it("SH-GS-V05: undefined executionIdでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.GET_STATUS);

      try {
        await handler({}, undefined);
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "executionId must be a non-empty string",
        );
      }
    });

    it("SH-GS-V06: 数値型executionIdでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.GET_STATUS);

      try {
        await handler({}, 123);
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "executionId must be a non-empty string",
        );
      }
    });
  });

  // ===========================================================================
  // skill:analyze バリデーション
  // ===========================================================================

  describe("skill:analyze バリデーション", () => {
    it("SH-ANZ-V01: 正常な文字列skillNameで正常処理されること", async () => {
      // Given: getSkillByNameが正常にスキルを返す
      mockSkillService.getSkillByName.mockResolvedValue({
        name: "test-skill",
        description: "A test skill",
        path: "/mock/skills/test-skill",
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

      // When: 正常なskillNameを渡す
      await handler({}, { skillName: "test-skill" });

      // Then: skillServiceが呼び出される（analyzerのモック次第で結果は変わる）
      expect(mockSkillService.getSkillByName).toHaveBeenCalledWith(
        "test-skill",
      );
    });

    it("SH-ANZ-V02: 空文字列skillNameでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.ANALYZE);

      try {
        await handler({}, { skillName: "" });
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-ANZ-V03: スペースのみのskillNameでVALIDATION_ERRORがthrowされること（P42）", async () => {
      const handler = getHandler(CHANNELS.ANALYZE);

      try {
        await handler({}, { skillName: "   " });
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-ANZ-V04: null skillNameでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.ANALYZE);

      try {
        await handler({}, { skillName: null });
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-ANZ-V05: undefined（argsなし）でVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.ANALYZE);

      try {
        await handler({}, undefined);
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-ANZ-V06: 数値型skillNameでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.ANALYZE);

      try {
        await handler({}, { skillName: 123 });
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });
  });

  // ===========================================================================
  // skill:improve バリデーション
  // ===========================================================================

  describe("skill:improve バリデーション", () => {
    it("SH-IVE-V01: 正常な文字列skillNameで正常処理されること", async () => {
      const handler = getHandler(CHANNELS.IMPROVE);

      // When: 正常なskillNameとanalysisを渡す
      // Then: throw されずに処理が進む（analysisバリデーション後にサービス呼び出し）
      // 注意: analysisがないとanalysisバリデーションで弾かれるため、ダミーを渡す
      const result = await handler(
        {},
        {
          skillName: "test-skill",
          analysis: { score: 80, issues: [] },
        },
      );

      // バリデーションを通過したことを確認（サービス層のレスポンスに依存）
      expect(result).toBeDefined();
    });

    it("SH-IVE-V02: 空文字列skillNameでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.IMPROVE);

      try {
        await handler(
          {},
          { skillName: "", analysis: { score: 80, issues: [] } },
        );
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-IVE-V03: スペースのみのskillNameでVALIDATION_ERRORがthrowされること（P42）", async () => {
      const handler = getHandler(CHANNELS.IMPROVE);

      try {
        await handler(
          {},
          { skillName: "   ", analysis: { score: 80, issues: [] } },
        );
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-IVE-V04: null skillNameでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.IMPROVE);

      try {
        await handler(
          {},
          { skillName: null, analysis: { score: 80, issues: [] } },
        );
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-IVE-V05: undefined（argsなし）でVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.IMPROVE);

      try {
        await handler({}, undefined);
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-IVE-V06: 数値型skillNameでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.IMPROVE);

      try {
        await handler(
          {},
          { skillName: 123, analysis: { score: 80, issues: [] } },
        );
        throw new Error("Expected VALIDATION_ERROR to be thrown");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });
  });

  // ===========================================================================
  // エッジケーステスト（P42境界値: タブ・改行・混合空白）
  // ===========================================================================

  describe("P42境界値テスト — タブ・改行・混合空白", () => {
    // skill:get-detail
    it("SH-BV-01: タブのみのskillIdでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.GET_DETAIL);
      try {
        await handler({}, { skillId: "\t" });
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillId must be a non-empty string",
        );
      }
    });

    it("SH-BV-02: 改行のみのskillIdでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.GET_DETAIL);
      try {
        await handler({}, { skillId: "\n" });
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillId must be a non-empty string",
        );
      }
    });

    it("SH-BV-03: 混合空白のskillIdでVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.GET_DETAIL);
      try {
        await handler({}, { skillId: "\t \n" });
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillId must be a non-empty string",
        );
      }
    });

    // skill:execute
    it("SH-BV-04: タブのみのskillId(execute)でVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.EXECUTE);
      try {
        await handler({}, { skillId: "\t" });
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillId must be a non-empty string",
        );
      }
    });

    it("SH-BV-05: CR+LFのskillId(execute)でVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.EXECUTE);
      try {
        await handler({}, { skillId: "\n\r" });
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillId must be a non-empty string",
        );
      }
    });

    // skill:abort
    it("SH-BV-06: タブのみのexecutionId(abort)でVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.ABORT);
      try {
        await handler({}, "\t");
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "executionId must be a non-empty string",
        );
      }
    });

    it("SH-BV-07: 混合空白のexecutionId(abort)でVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.ABORT);
      try {
        await handler({}, " \t\n ");
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "executionId must be a non-empty string",
        );
      }
    });

    // skill:get-status
    it("SH-BV-08: タブのみのexecutionId(get-status)でVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.GET_STATUS);
      try {
        await handler({}, "\t");
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "executionId must be a non-empty string",
        );
      }
    });

    it("SH-BV-09: 混合空白のexecutionId(get-status)でVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.GET_STATUS);
      try {
        await handler({}, " \t\n ");
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "executionId must be a non-empty string",
        );
      }
    });

    // skill:analyze
    it("SH-BV-10: タブ+改行のskillName(analyze)でVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.ANALYZE);
      try {
        await handler({}, { skillName: "\t\n" });
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    // skill:improve
    it("SH-BV-11: タブ+改行のskillName(improve)でVALIDATION_ERRORがthrowされること", async () => {
      const handler = getHandler(CHANNELS.IMPROVE);
      try {
        await handler(
          {},
          { skillName: "\t\n", analysis: { score: 80, issues: [] } },
        );
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });
  });

  // ===========================================================================
  // throw形式エラー伝播 — code / message プロパティ検証
  // ===========================================================================

  describe("throw形式エラー伝播 — code / message プロパティ検証", () => {
    const handlerConfigs = [
      {
        name: "skill:get-detail",
        channel: CHANNELS.GET_DETAIL,
        makeArgs: (val: unknown) => ({ skillId: val }),
        expectedMessage: "skillId must be a non-empty string",
      },
      {
        name: "skill:update",
        channel: CHANNELS.UPDATE,
        makeArgs: (val: unknown) => ({
          skillName: val,
          updates: { description: "x" },
        }),
        expectedMessage: "skillName must be a non-empty string",
      },
      {
        name: "skill:execute",
        channel: CHANNELS.EXECUTE,
        makeArgs: (val: unknown) => ({ skillId: val }),
        expectedMessage: "skillId must be a non-empty string",
      },
      {
        name: "skill:abort",
        channel: CHANNELS.ABORT,
        makeArgs: (val: unknown) => val,
        expectedMessage: "executionId must be a non-empty string",
      },
      {
        name: "skill:get-status",
        channel: CHANNELS.GET_STATUS,
        makeArgs: (val: unknown) => val,
        expectedMessage: "executionId must be a non-empty string",
      },
      {
        name: "skill:analyze",
        channel: CHANNELS.ANALYZE,
        makeArgs: (val: unknown) => ({ skillName: val }),
        expectedMessage: "skillName must be a non-empty string",
      },
      {
        name: "skill:improve",
        channel: CHANNELS.IMPROVE,
        makeArgs: (val: unknown) => ({ skillName: val }),
        expectedMessage: "skillName must be a non-empty string",
      },
    ];

    for (const config of handlerConfigs) {
      describe(config.name, () => {
        it(`${config.name}: throwエラーのcodeがVALIDATION_ERRORであること`, async () => {
          const handler = getHandler(config.channel);
          try {
            await handler({}, config.makeArgs(""));
            throw new Error("Expected VALIDATION_ERROR");
          } catch (error) {
            expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
          }
        });

        it(`${config.name}: throwエラーのmessageがパラメータ名を正確に含むこと`, async () => {
          const handler = getHandler(config.channel);
          try {
            await handler({}, config.makeArgs("   "));
            throw new Error("Expected VALIDATION_ERROR");
          } catch (error) {
            expect((error as { message: string }).message).toBe(
              config.expectedMessage,
            );
          }
        });
      });
    }
  });
});
