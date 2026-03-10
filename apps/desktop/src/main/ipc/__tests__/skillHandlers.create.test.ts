/**
 * skillHandlers skill:create 契約テスト
 *
 * TASK-10A-G Phase 4-5: G1 サブエージェント
 *
 * skill:create ハンドラの入力バリデーション、正常系委譲、エラー系、セキュリティを検証する。
 *
 * テストケース 14件:
 * - G1-VAL: 入力バリデーション (6件)
 * - G1-DEL: 正常系委譲 (3件)
 * - G1-ERR: エラー系 (3件)
 * - G1-SEC: セキュリティ (2件)
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
  getSkillByName: vi.fn(),
  executeSkill: vi.fn(),
  setSkillExecutor: vi.fn(),
  getSkillsDirectory: vi.fn().mockReturnValue("/mock/skills/dir"),
  createSkillFromWizard: vi.fn(),
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

describe("skillHandlers skill:create 契約テスト (TASK-10A-G G1)", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    // clearAllMocks 後にデフォルトのモック戻り値を再設定
    mockValidateIpcSender.mockReturnValue({ valid: true });
    mockToIPCValidationError.mockImplementation((result) => ({
      code: result.errorCode ?? "IPC_UNAUTHORIZED",
      message: result.errorMessage ?? "Unauthorized IPC call",
    }));

    // ハンドラをキャプチャ
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    // デフォルトのモックレスポンス
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
    mockSkillService.getSkillByName.mockResolvedValue(null);
    mockSkillService.executeSkill.mockResolvedValue({
      executionId: "exec-default",
      status: "success",
      output: "Default output",
      startedAt: new Date(),
      completedAt: new Date(),
    });
    mockSkillService.createSkillFromWizard.mockResolvedValue({
      success: true,
      skillName: "new-skill",
      path: "/mock/skills/new-skill",
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

  const CHANNEL = "skill:create";
  const VALID_DESCRIPTION = "テスト用スキルの説明";
  const VALID_OPTIONS = {
    generateTasks: true,
    addAgents: false,
    addReferences: true,
  } as const;

  // Mock event object
  const mockEvent = {} as unknown;

  /**
   * ヘルパー: ハンドラ呼び出しが指定コードのエラーを throw することを検証する
   */
  async function expectHandlerError(
    args: unknown[],
    expectedCode: string,
    messageAssertion?: (message: string) => void,
  ): Promise<void> {
    const handler = getHandler(CHANNEL);
    try {
      await handler(mockEvent, ...args);
      throw new Error(`Expected ${expectedCode} to be thrown`);
    } catch (error) {
      expect((error as { code: string }).code).toBe(expectedCode);
      if (messageAssertion) {
        messageAssertion((error as { message: string }).message);
      }
    }
  }

  // ===========================================================================
  // G1-VAL: 入力バリデーション (6件)
  // ===========================================================================

  describe("G1-VAL: 入力バリデーション", () => {
    const DESCRIPTION_ERROR_MSG = "description must be a non-empty string";
    const OPTIONS_ERROR_MSG = "options must be an object";

    it("G1-VAL-1: description が undefined の場合 VALIDATION_ERROR", async () => {
      await expectHandlerError(
        [undefined, VALID_OPTIONS],
        "VALIDATION_ERROR",
        (msg) => expect(msg).toBe(DESCRIPTION_ERROR_MSG),
      );
    });

    it("G1-VAL-2: description が数値の場合 VALIDATION_ERROR", async () => {
      await expectHandlerError(
        [123, VALID_OPTIONS],
        "VALIDATION_ERROR",
        (msg) => expect(msg).toBe(DESCRIPTION_ERROR_MSG),
      );
    });

    it("G1-VAL-3: description が空文字列の場合 VALIDATION_ERROR", async () => {
      await expectHandlerError(["", VALID_OPTIONS], "VALIDATION_ERROR", (msg) =>
        expect(msg).toBe(DESCRIPTION_ERROR_MSG),
      );
    });

    it("G1-VAL-4: description がスペースのみの場合 VALIDATION_ERROR（P42準拠）", async () => {
      await expectHandlerError(
        ["   ", VALID_OPTIONS],
        "VALIDATION_ERROR",
        (msg) => expect(msg).toBe(DESCRIPTION_ERROR_MSG),
      );
    });

    it("G1-VAL-5: options が null の場合 VALIDATION_ERROR", async () => {
      await expectHandlerError(
        [VALID_DESCRIPTION, null],
        "VALIDATION_ERROR",
        (msg) => expect(msg).toBe(OPTIONS_ERROR_MSG),
      );
    });

    it("G1-VAL-6: options が文字列の場合 VALIDATION_ERROR", async () => {
      await expectHandlerError(
        [VALID_DESCRIPTION, "invalid-options"],
        "VALIDATION_ERROR",
        (msg) => expect(msg).toBe(OPTIONS_ERROR_MSG),
      );
    });
  });

  // ===========================================================================
  // G1-DEL: 正常系委譲 (3件)
  // ===========================================================================

  describe("G1-DEL: 正常系委譲", () => {
    it("G1-DEL-1: 有効な入力で createSkillFromWizard が呼ばれる", async () => {
      const handler = getHandler(CHANNEL);

      await handler(mockEvent, VALID_DESCRIPTION, VALID_OPTIONS);

      expect(mockSkillService.createSkillFromWizard).toHaveBeenCalledWith(
        VALID_DESCRIPTION,
        VALID_OPTIONS,
      );
    });

    it("G1-DEL-2: description の前後空白が trim される", async () => {
      const handler = getHandler(CHANNEL);

      await handler(mockEvent, "  スキル説明  ", VALID_OPTIONS);

      expect(mockSkillService.createSkillFromWizard).toHaveBeenCalledWith(
        "スキル説明",
        VALID_OPTIONS,
      );
    });

    it("G1-DEL-3: createSkillFromWizard の戻り値がそのまま返される", async () => {
      const expectedResult = {
        success: true,
        skillName: "created-skill",
        path: "/mock/skills/created-skill",
      };
      mockSkillService.createSkillFromWizard.mockResolvedValue(expectedResult);

      const handler = getHandler(CHANNEL);
      const result = await handler(mockEvent, VALID_DESCRIPTION, VALID_OPTIONS);

      expect(result).toEqual(expectedResult);
    });
  });

  // ===========================================================================
  // G1-ERR: エラー系 (3件)
  // ===========================================================================

  describe("G1-ERR: エラー系", () => {
    it("G1-ERR-1: createSkillFromWizard が例外を投げた場合 CREATE_ERROR を返す", async () => {
      mockSkillService.createSkillFromWizard.mockRejectedValue(
        new Error("Wizard creation failed"),
      );

      await expectHandlerError(
        [VALID_DESCRIPTION, VALID_OPTIONS],
        "CREATE_ERROR",
        (msg) => expect(msg).toBeDefined(),
      );
    });

    it("G1-ERR-2: エラーメッセージがサニタイズされる（パス情報が含まれない）", async () => {
      mockSkillService.createSkillFromWizard.mockRejectedValue(
        new Error(
          "ENOENT: no such file or directory, open '/internal/secret/path/skill.md'",
        ),
      );

      await expectHandlerError(
        [VALID_DESCRIPTION, VALID_OPTIONS],
        "CREATE_ERROR",
        (msg) => expect(msg).not.toContain("/internal/secret/path"),
      );
    });

    it("G1-ERR-3: 未知のエラー型でも CREATE_ERROR で返す", async () => {
      // Error インスタンスではない値を throw するケース
      mockSkillService.createSkillFromWizard.mockRejectedValue(
        "unexpected string error",
      );

      await expectHandlerError(
        [VALID_DESCRIPTION, VALID_OPTIONS],
        "CREATE_ERROR",
        (msg) => expect(typeof msg).toBe("string"),
      );
    });
  });

  // ===========================================================================
  // G1-SEC: セキュリティ (2件)
  // ===========================================================================

  describe("G1-SEC: セキュリティ", () => {
    it("G1-SEC-1: sender 検証失敗で toIPCValidationError が返される", async () => {
      mockValidateIpcSender.mockReturnValue({
        valid: false,
        errorCode: "IPC_UNAUTHORIZED",
        errorMessage: "Unauthorized IPC call",
      });

      await expectHandlerError(
        [VALID_DESCRIPTION, VALID_OPTIONS],
        "IPC_UNAUTHORIZED",
      );
    });

    it("G1-SEC-2: validateIpcSender に正しいチャンネル名が渡される", async () => {
      const handler = getHandler(CHANNEL);

      await handler(mockEvent, VALID_DESCRIPTION, VALID_OPTIONS);

      expect(mockValidateIpcSender).toHaveBeenCalledWith(
        mockEvent,
        "skill:create",
        expect.objectContaining({
          getAllowedWindows: expect.any(Function),
        }),
      );
    });
  });
});
