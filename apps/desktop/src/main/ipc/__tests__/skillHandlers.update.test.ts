/**
 * SKILL_UPDATE ハンドラ テスト
 *
 * IPC_CHANNELS.SKILL_UPDATE ("skill:update") ハンドラの動作を検証する。
 *
 * 設計仕様:
 * - チャンネル: "skill:update"
 * - 引数: object payload { skillName: string; updates: Record<string, unknown> }
 * - P42準拠3段バリデーション（skillName + updates）
 * - validateIpcSender で sender 検証
 * - 成功時: { success: true, data: void }
 * - エラー時: { success: false, error: sanitizeErrorMessage(error) }
 *
 * @see docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-05-ipc-layer-integrity-fix/phase-2-design.md
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";
import type { SkillService } from "../../services/skill/SkillService";

// === Mocks ===

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

const mockSkillService = {
  scanAvailableSkills: vi.fn(),
  getImportedSkills: vi.fn(),
  importSkills: vi.fn(),
  removeSkill: vi.fn(),
  getSkillById: vi.fn(),
  getSkillByName: vi.fn(),
  setSkillExecutor: vi.fn(),
  getSkillsDirectory: vi.fn().mockReturnValue("/mock/skills/dir"),
  updateSkill: vi.fn(),
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

import { ipcMain } from "electron";

const SKILL_UPDATE_CHANNEL = "skill:update";

describe("skillHandlers - skill:update", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    mockSkillService.updateSkill.mockResolvedValue(undefined);

    const { registerSkillHandlers } = await import("../skillHandlers");
    registerSkillHandlers(
      mockMainWindow,
      mockSkillService as unknown as SkillService,
    );
  });

  afterEach(() => {
    vi.resetModules();
  });

  // ===========================================================================
  // ハンドラ登録
  // ===========================================================================

  describe("handler registration", () => {
    it("SH-UPD-REG-01: should register skill:update handler", () => {
      expect(handlers.has(SKILL_UPDATE_CHANNEL)).toBe(true);
    });
  });

  // ===========================================================================
  // 正常系
  // ===========================================================================

  describe("正常系", () => {
    it("SH-UPD-01: 有効な skillName と updates で更新成功", async () => {
      mockSkillService.updateSkill.mockResolvedValue(undefined);

      const handler = handlers.get(SKILL_UPDATE_CHANNEL);
      if (!handler) throw new Error("skill:update handler not registered");

      const result = await handler(
        {},
        { skillName: "test-skill", updates: { description: "Updated" } },
      );

      expect(mockSkillService.updateSkill).toHaveBeenCalledWith("test-skill", {
        description: "Updated",
      });
      const opResult = result as { success: boolean; data?: unknown };
      expect(opResult.success).toBe(true);
      expect(opResult.data).toBeUndefined();
    });

    it("SH-UPD-02: 空オブジェクト updates でも成功", async () => {
      mockSkillService.updateSkill.mockResolvedValue(undefined);

      const handler = handlers.get(SKILL_UPDATE_CHANNEL);
      if (!handler) throw new Error("skill:update handler not registered");

      const result = await handler(
        {},
        { skillName: "test-skill", updates: {} },
      );

      expect(mockSkillService.updateSkill).toHaveBeenCalledWith(
        "test-skill",
        {},
      );
      const opResult = result as { success: boolean; data?: unknown };
      expect(opResult.success).toBe(true);
      expect(opResult.data).toBeUndefined();
    });

    it("SH-UPD-03: 複数フィールドの updates で正しく渡される", async () => {
      mockSkillService.updateSkill.mockResolvedValue(undefined);

      const handler = handlers.get(SKILL_UPDATE_CHANNEL);
      if (!handler) throw new Error("skill:update handler not registered");

      const updates = {
        description: "New description",
        triggers: ["new-trigger"],
        category: "test",
      };

      await handler({}, { skillName: "my-skill", updates });

      expect(mockSkillService.updateSkill).toHaveBeenCalledWith(
        "my-skill",
        updates,
      );
    });
  });

  // ===========================================================================
  // P42: skillName バリデーション
  // ===========================================================================

  describe("P42: skillName バリデーション", () => {
    it("SH-UPD-04: skillName が非string の場合 VALIDATION_ERROR", async () => {
      const handler = handlers.get(SKILL_UPDATE_CHANNEL);
      if (!handler) throw new Error("skill:update handler not registered");

      try {
        await handler({}, { skillName: 123, updates: {} });
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-UPD-05: skillName が空文字列の場合 VALIDATION_ERROR", async () => {
      const handler = handlers.get(SKILL_UPDATE_CHANNEL);
      if (!handler) throw new Error("skill:update handler not registered");

      try {
        await handler({}, { skillName: "", updates: {} });
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-UPD-06: skillName がスペースのみの場合 VALIDATION_ERROR (P42 trim())", async () => {
      const handler = handlers.get(SKILL_UPDATE_CHANNEL);
      if (!handler) throw new Error("skill:update handler not registered");

      try {
        await handler({}, { skillName: "   ", updates: {} });
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
        expect((error as { message: string }).message).toBe(
          "skillName must be a non-empty string",
        );
      }
    });

    it("SH-UPD-07: skillName が null の場合 VALIDATION_ERROR", async () => {
      const handler = handlers.get(SKILL_UPDATE_CHANNEL);
      if (!handler) throw new Error("skill:update handler not registered");

      try {
        await handler({}, { skillName: null, updates: {} });
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      }
    });

    it("SH-UPD-08: skillName がタブ・改行のみの場合 VALIDATION_ERROR (P42)", async () => {
      const handler = handlers.get(SKILL_UPDATE_CHANNEL);
      if (!handler) throw new Error("skill:update handler not registered");

      try {
        await handler({}, { skillName: "\t\n", updates: {} });
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      }
    });
  });

  // ===========================================================================
  // updates バリデーション
  // ===========================================================================

  describe("updates バリデーション", () => {
    it("SH-UPD-09: updates が null の場合 VALIDATION_ERROR", async () => {
      const handler = handlers.get(SKILL_UPDATE_CHANNEL);
      if (!handler) throw new Error("skill:update handler not registered");

      try {
        await handler({}, { skillName: "test-skill", updates: null });
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      }
    });

    it("SH-UPD-10: updates が配列の場合 VALIDATION_ERROR", async () => {
      const handler = handlers.get(SKILL_UPDATE_CHANNEL);
      if (!handler) throw new Error("skill:update handler not registered");

      try {
        await handler({}, { skillName: "test-skill", updates: ["invalid"] });
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      }
    });

    it("SH-UPD-11: updates が string の場合 VALIDATION_ERROR", async () => {
      const handler = handlers.get(SKILL_UPDATE_CHANNEL);
      if (!handler) throw new Error("skill:update handler not registered");

      try {
        await handler({}, { skillName: "test-skill", updates: "invalid" });
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      }
    });
  });

  // ===========================================================================
  // payload レベルのバリデーション
  // ===========================================================================

  describe("payload バリデーション", () => {
    it("SH-UPD-12: payload 自体が null の場合 VALIDATION_ERROR", async () => {
      const handler = handlers.get(SKILL_UPDATE_CHANNEL);
      if (!handler) throw new Error("skill:update handler not registered");

      try {
        await handler({}, null);
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      }
    });

    it("SH-UPD-13: payload が非オブジェクト（string）の場合 VALIDATION_ERROR", async () => {
      const handler = handlers.get(SKILL_UPDATE_CHANNEL);
      if (!handler) throw new Error("skill:update handler not registered");

      try {
        await handler({}, "invalid-payload");
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      }
    });

    it("SH-UPD-14: payload に skillName がない場合 VALIDATION_ERROR", async () => {
      const handler = handlers.get(SKILL_UPDATE_CHANNEL);
      if (!handler) throw new Error("skill:update handler not registered");

      try {
        await handler({}, { updates: {} });
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      }
    });

    it("SH-UPD-15: payload に updates がない場合 VALIDATION_ERROR", async () => {
      const handler = handlers.get(SKILL_UPDATE_CHANNEL);
      if (!handler) throw new Error("skill:update handler not registered");

      try {
        await handler({}, { skillName: "test-skill" });
        throw new Error("Expected VALIDATION_ERROR");
      } catch (error) {
        expect((error as { code: string }).code).toBe("VALIDATION_ERROR");
      }
    });
  });

  // ===========================================================================
  // セキュリティ: sender 検証
  // ===========================================================================

  describe("セキュリティ: sender 検証", () => {
    it("SH-UPD-16: validateIpcSender が skill:update チャンネルで呼ばれる", async () => {
      const { validateIpcSender } =
        await import("../../infrastructure/security/ipc-validator.js");

      mockSkillService.updateSkill.mockResolvedValue(undefined);

      const handler = handlers.get(SKILL_UPDATE_CHANNEL);
      if (!handler) throw new Error("skill:update handler not registered");

      await handler({}, { skillName: "test-skill", updates: {} });

      expect(validateIpcSender).toHaveBeenCalledWith(
        {},
        SKILL_UPDATE_CHANNEL,
        expect.objectContaining({
          getAllowedWindows: expect.any(Function),
        }),
      );
    });

    it("SH-UPD-17: P41準拠: getAllowedWindows が mainWindow を含む", async () => {
      const { validateIpcSender } =
        await import("../../infrastructure/security/ipc-validator.js");

      mockSkillService.updateSkill.mockResolvedValue(undefined);

      const handler = handlers.get(SKILL_UPDATE_CHANNEL);
      if (!handler) throw new Error("skill:update handler not registered");

      await handler({}, { skillName: "test-skill", updates: {} });

      const callArgs = (
        validateIpcSender as ReturnType<typeof vi.fn>
      ).mock.calls.find((call: unknown[]) => call[1] === SKILL_UPDATE_CHANNEL);
      if (callArgs && callArgs[2]?.getAllowedWindows) {
        const windows = callArgs[2].getAllowedWindows();
        expect(windows).toContain(mockMainWindow);
      }
    });

    it("SH-UPD-18: validateIpcSender が invalid を返す場合はエラーをthrow", async () => {
      const { validateIpcSender, toIPCValidationError } =
        await import("../../infrastructure/security/ipc-validator.js");

      (validateIpcSender as ReturnType<typeof vi.fn>).mockReturnValueOnce({
        valid: false,
        errorCode: "IPC_UNAUTHORIZED",
        errorMessage: "Unauthorized sender",
      });

      const handler = handlers.get(SKILL_UPDATE_CHANNEL);
      if (!handler) throw new Error("skill:update handler not registered");

      try {
        await handler({}, { skillName: "test-skill", updates: {} });
        throw new Error("Expected security error");
      } catch {
        expect(toIPCValidationError).toHaveBeenCalledWith({
          valid: false,
          errorCode: "IPC_UNAUTHORIZED",
          errorMessage: "Unauthorized sender",
        });
      }
    });
  });

  // ===========================================================================
  // サービスエラー処理
  // ===========================================================================

  describe("サービスエラー処理", () => {
    it("SH-UPD-19: skillService.updateSkill がエラーをthrowした場合、エラーレスポンスを返す", async () => {
      mockSkillService.updateSkill.mockRejectedValue(
        new Error("Service failed"),
      );

      const handler = handlers.get(SKILL_UPDATE_CHANNEL);
      if (!handler) throw new Error("skill:update handler not registered");

      const result = await handler(
        {},
        { skillName: "test-skill", updates: {} },
      );

      const opResult = result as { success: boolean; error?: string };
      expect(opResult.success).toBe(false);
      expect(opResult.error).toBeDefined();
    });
  });

  // ===========================================================================
  // unregisterSkillHandlers
  // ===========================================================================

  describe("unregisterSkillHandlers", () => {
    it("SH-UPD-20: unregisterSkillHandlers で skill:update の removeHandler が呼ばれる", async () => {
      const { unregisterSkillHandlers } = await import("../skillHandlers");
      unregisterSkillHandlers();
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(SKILL_UPDATE_CHANNEL);
    });
  });
});
