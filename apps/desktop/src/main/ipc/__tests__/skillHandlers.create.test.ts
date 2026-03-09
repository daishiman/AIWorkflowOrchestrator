/**
 * skillHandlers skill:create IPC ハンドラテスト
 *
 * TASK-10A-G: スキル作成ウィザードの IPC 契約テスト
 * P42準拠3段バリデーション（型チェック→空文字列→トリム空文字列）と
 * validateIpcSender 送信元検証、sanitizeErrorMessage を検証する。
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";

// === Mocks ===

// Mock electron-store (required for PermissionStore in SkillExecutor)
vi.mock("electron-store", () => {
  return {
    default: class MockElectronStore {
      private data: Record<string, unknown> = {};
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
const mockCreateSkillFromWizard = vi.fn();
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
  createSkillFromWizard: mockCreateSkillFromWizard,
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

// Mock validateIpcSender
const mockValidateIpcSender = vi.fn().mockReturnValue({ valid: true });
vi.mock("../../infrastructure/security/ipc-validator.js", () => ({
  validateIpcSender: mockValidateIpcSender,
  toIPCValidationError: vi.fn().mockImplementation((result) => ({
    code: result.errorCode ?? "IPC_UNAUTHORIZED",
    message: result.errorMessage ?? "Unauthorized IPC call",
  })),
}));

// Mock electron-log
vi.mock("electron-log", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock SkillForker
vi.mock("../../services/skill/SkillForker.js", () => ({
  SkillForker: vi.fn().mockImplementation(() => ({
    fork: vi.fn(),
  })),
}));

// Mock SkillAnalyzer
vi.mock("../../services/skill/SkillAnalyzer.js", () => ({
  SkillAnalyzer: vi.fn().mockImplementation(() => ({
    analyze: vi.fn(),
  })),
}));

// Mock SkillImprover
vi.mock("../../services/skill/SkillImprover.js", () => ({
  SkillImprover: vi.fn().mockImplementation(() => ({
    applyImprovements: vi.fn(),
  })),
}));

// Mock PromptOptimizer
vi.mock("../../services/skill/PromptOptimizer.js", () => ({
  PromptOptimizer: vi.fn().mockImplementation(() => ({
    optimize: vi.fn(),
    generateVariants: vi.fn(),
    evaluate: vi.fn(),
  })),
}));

// Mock SkillExecutor
vi.mock("../../services/skill/SkillExecutor.js", () => ({
  SkillExecutor: vi.fn().mockImplementation(() => ({
    execute: vi.fn(),
    abort: vi.fn(),
    getExecutionStatus: vi.fn(),
  })),
}));

// Import after mocks
import { ipcMain } from "electron";

// === 定数 ===
const CHANNEL = "skill:create";
const VALID_DESCRIPTION = "新しいスキルの説明文";
const VALID_OPTIONS = {
  generateTasks: true,
  addAgents: false,
  addReferences: true,
};
const ERROR_CODE_VALIDATION = "VALIDATION_ERROR";
const ERROR_CODE_CREATE = "CREATE_ERROR";
const ERROR_MSG_DESCRIPTION = "description must be a non-empty string";
const ERROR_MSG_OPTIONS = "options must be an object";
const DEFAULT_SKILL_NAME = "created-skill";
const DEFAULT_SKILL_PATH = "/mock/skills/dir/created-skill";
const DEFAULT_ERROR_MESSAGE = "スキル処理でエラーが発生しました";

describe("skillHandlers skill:create IPC ハンドラ", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;
  const mockEvent = {} as unknown;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    // ハンドラをキャプチャ
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    // createSkillFromWizard のデフォルトレスポンス
    mockCreateSkillFromWizard.mockResolvedValue({
      success: true,
      skillName: DEFAULT_SKILL_NAME,
      skillPath: DEFAULT_SKILL_PATH,
    });

    // ハンドラ登録
    const { registerSkillHandlers } = await import("../skillHandlers");
    registerSkillHandlers(mockMainWindow, mockSkillService as never);
  });

  afterEach(() => {
    vi.resetModules();
  });

  function getHandler(): (...args: unknown[]) => Promise<unknown> {
    const handler = handlers.get(CHANNEL);
    if (!handler) {
      throw new Error(`${CHANNEL} handler not registered`);
    }
    return handler;
  }

  /**
   * ハンドラ呼び出しで期待するエラーをキャッチして返すヘルパー。
   * try-catch パターンの重複を排除する。
   */
  async function callAndCatchError(
    ...args: unknown[]
  ): Promise<{ code: string; message: string }> {
    const handler = getHandler();
    try {
      await handler(mockEvent, ...args);
      expect.unreachable("Should have thrown");
    } catch (error: unknown) {
      return error as { code: string; message: string };
    }
    // TypeScript 用（到達しない）
    throw new Error("unreachable");
  }

  // ===========================================================================
  // Sender検証
  // ===========================================================================

  it("TC-G01-001: 正当なsenderからの呼び出しが成功する", async () => {
    const handler = getHandler();
    const result = await handler(mockEvent, VALID_DESCRIPTION, VALID_OPTIONS);

    expect(mockValidateIpcSender).toHaveBeenCalledWith(
      mockEvent,
      CHANNEL,
      expect.objectContaining({
        getAllowedWindows: expect.any(Function),
      }),
    );
    expect(result).toBeDefined();

    // P41対策: getAllowedWindowsコールバックの戻り値を明示的に検証
    const options = mockValidateIpcSender.mock.calls[0][2];
    const allowedWindows = options.getAllowedWindows();
    expect(allowedWindows).toEqual([mockMainWindow]);
  });

  it("TC-G01-002: 不正なsenderからの呼び出しがVALIDATION_ERRORで拒否される", async () => {
    mockValidateIpcSender.mockReturnValueOnce({
      valid: false,
      errorCode: "IPC_UNAUTHORIZED",
      errorMessage: "Unauthorized IPC call",
    });

    const handler = getHandler();
    await expect(
      handler(mockEvent, VALID_DESCRIPTION, VALID_OPTIONS),
    ).rejects.toMatchObject({
      code: "IPC_UNAUTHORIZED",
      message: "Unauthorized IPC call",
    });
  });

  // ===========================================================================
  // 入力バリデーション (P42準拠3段)
  // ===========================================================================

  it("TC-G01-003: description未指定(undefined)でVALIDATION_ERROR", async () => {
    const handler = getHandler();
    await expect(
      handler(mockEvent, undefined, VALID_OPTIONS),
    ).rejects.toMatchObject({
      code: ERROR_CODE_VALIDATION,
      message: ERROR_MSG_DESCRIPTION,
    });
  });

  it("TC-G01-004: description空文字列('')でVALIDATION_ERROR", async () => {
    const handler = getHandler();
    await expect(handler(mockEvent, "", VALID_OPTIONS)).rejects.toMatchObject({
      code: ERROR_CODE_VALIDATION,
      message: ERROR_MSG_DESCRIPTION,
    });
  });

  it("TC-G01-005: descriptionスペースのみ('   ')でVALIDATION_ERROR", async () => {
    const handler = getHandler();
    await expect(
      handler(mockEvent, "   ", VALID_OPTIONS),
    ).rejects.toMatchObject({
      code: ERROR_CODE_VALIDATION,
      message: ERROR_MSG_DESCRIPTION,
    });
  });

  it("TC-G01-006: description数値型(12345)でVALIDATION_ERROR", async () => {
    const handler = getHandler();
    await expect(
      handler(mockEvent, 12345, VALID_OPTIONS),
    ).rejects.toMatchObject({
      code: ERROR_CODE_VALIDATION,
      message: ERROR_MSG_DESCRIPTION,
    });
  });

  it("TC-G01-007: options未指定(null)でVALIDATION_ERROR", async () => {
    const handler = getHandler();
    await expect(
      handler(mockEvent, VALID_DESCRIPTION, null),
    ).rejects.toMatchObject({
      code: ERROR_CODE_VALIDATION,
      message: ERROR_MSG_OPTIONS,
    });
  });

  it("TC-G01-008: options文字列型('invalid')でVALIDATION_ERROR", async () => {
    const handler = getHandler();
    await expect(
      handler(mockEvent, VALID_DESCRIPTION, "invalid"),
    ).rejects.toMatchObject({
      code: ERROR_CODE_VALIDATION,
      message: ERROR_MSG_OPTIONS,
    });
  });

  // ===========================================================================
  // 正常系
  // ===========================================================================

  it("TC-G01-009: 有効な引数でcreateSkillFromWizardに委譲する", async () => {
    const handler = getHandler();
    const result = await handler(mockEvent, VALID_DESCRIPTION, VALID_OPTIONS);

    expect(mockCreateSkillFromWizard).toHaveBeenCalledWith(
      VALID_DESCRIPTION,
      VALID_OPTIONS,
    );
    expect(result).toEqual({
      success: true,
      skillName: DEFAULT_SKILL_NAME,
      skillPath: DEFAULT_SKILL_PATH,
    });
  });

  it("TC-G01-010: descriptionがtrim()されてサービスに渡される", async () => {
    const handler = getHandler();
    await handler(mockEvent, "  trimmed description  ", VALID_OPTIONS);

    expect(mockCreateSkillFromWizard).toHaveBeenCalledWith(
      "trimmed description",
      VALID_OPTIONS,
    );
  });

  // ===========================================================================
  // エラー系
  // ===========================================================================

  it("TC-G01-011: サービス例外をCREATE_ERRORでラップする", async () => {
    mockCreateSkillFromWizard.mockRejectedValueOnce(
      new Error("Service failure"),
    );

    const handler = getHandler();
    await expect(
      handler(mockEvent, VALID_DESCRIPTION, VALID_OPTIONS),
    ).rejects.toMatchObject({
      code: ERROR_CODE_CREATE,
    });
  });

  it("TC-G01-012: エラーメッセージからファイルパスが除去される（UNIX + Windows）", async () => {
    mockCreateSkillFromWizard.mockRejectedValueOnce(
      new Error(
        "File not found at /usr/local/skills/test and C:\\Users\\test\\skills",
      ),
    );

    const err = await callAndCatchError(VALID_DESCRIPTION, VALID_OPTIONS);
    expect(err.code).toBe(ERROR_CODE_CREATE);
    expect(err.message).not.toMatch(/\/usr\/local/);
    expect(err.message).not.toMatch(/C:\\Users/);
    expect(err.message).toContain("[path]");
  });

  it("TC-G01-013: エラーメッセージからトークン情報が除去される", async () => {
    mockCreateSkillFromWizard.mockRejectedValueOnce(
      new Error("Auth failed: token=abc123secret key=myPrivateKey"),
    );

    const err = await callAndCatchError(VALID_DESCRIPTION, VALID_OPTIONS);
    expect(err.code).toBe(ERROR_CODE_CREATE);
    expect(err.message).not.toContain("abc123secret");
    expect(err.message).not.toContain("myPrivateKey");
    expect(err.message).toContain("token=***");
    expect(err.message).toContain("key=***");
  });

  it("TC-G01-014: 非Errorオブジェクトでデフォルトメッセージを返す", async () => {
    mockCreateSkillFromWizard.mockRejectedValueOnce("string error");

    const err = await callAndCatchError(VALID_DESCRIPTION, VALID_OPTIONS);
    expect(err.code).toBe(ERROR_CODE_CREATE);
    expect(err.message).toBe(DEFAULT_ERROR_MESSAGE);
  });

  // ===========================================================================
  // Phase 6: description境界値テスト
  // ===========================================================================

  it("TC-G01-015: descriptionが1文字('a')で成功する", async () => {
    const handler = getHandler();
    const result = await handler(mockEvent, "a", VALID_OPTIONS);

    expect(mockCreateSkillFromWizard).toHaveBeenCalledWith("a", VALID_OPTIONS);
    expect(result).toBeDefined();
  });

  it("TC-G01-016: descriptionが超長文('a'.repeat(10000))で成功する", async () => {
    const longDescription = "a".repeat(10000);
    const handler = getHandler();
    const result = await handler(mockEvent, longDescription, VALID_OPTIONS);

    expect(mockCreateSkillFromWizard).toHaveBeenCalledWith(
      longDescription,
      VALID_OPTIONS,
    );
    expect(result).toBeDefined();
  });

  it("TC-G01-017: descriptionに日本語('スキル作成テスト')で成功する", async () => {
    const handler = getHandler();
    const result = await handler(mockEvent, "スキル作成テスト", VALID_OPTIONS);

    expect(mockCreateSkillFromWizard).toHaveBeenCalledWith(
      "スキル作成テスト",
      VALID_OPTIONS,
    );
    expect(result).toBeDefined();
  });

  it("TC-G01-018: descriptionに改行('line1\\nline2')で成功する", async () => {
    const handler = getHandler();
    const result = await handler(mockEvent, "line1\nline2", VALID_OPTIONS);

    expect(mockCreateSkillFromWizard).toHaveBeenCalledWith(
      "line1\nline2",
      VALID_OPTIONS,
    );
    expect(result).toBeDefined();
  });

  // ===========================================================================
  // Phase 6: options境界値テスト
  // ===========================================================================

  it("TC-G01-019: optionsが空オブジェクト({})で成功する", async () => {
    const handler = getHandler();
    const result = await handler(mockEvent, VALID_DESCRIPTION, {});

    expect(mockCreateSkillFromWizard).toHaveBeenCalledWith(
      VALID_DESCRIPTION.trim(),
      {},
    );
    expect(result).toBeDefined();
  });

  it("TC-G01-020: optionsに未知プロパティ({ unknown: true })で成功する", async () => {
    const handler = getHandler();
    const result = await handler(mockEvent, VALID_DESCRIPTION, {
      unknown: true,
    });

    expect(mockCreateSkillFromWizard).toHaveBeenCalledWith(
      VALID_DESCRIPTION.trim(),
      { unknown: true },
    );
    expect(result).toBeDefined();
  });

  // ===========================================================================
  // Phase 6: 非同期エラーテスト
  // ===========================================================================

  it("TC-G01-021: サービスが非同期で拒否される場合にCREATE_ERRORを返す", async () => {
    mockCreateSkillFromWizard.mockImplementationOnce(
      () =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Async rejection")), 0),
        ),
    );

    const handler = getHandler();
    await expect(
      handler(mockEvent, VALID_DESCRIPTION, VALID_OPTIONS),
    ).rejects.toMatchObject({
      code: "CREATE_ERROR",
    });
  });

  it("TC-G01-022: サービスが長時間かかる場合でも正常に完了する", async () => {
    mockCreateSkillFromWizard.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                skillName: "slow-skill",
                skillPath: "/mock/skills/dir/slow-skill",
              }),
            0,
          ),
        ),
    );

    const handler = getHandler();
    const result = await handler(mockEvent, VALID_DESCRIPTION, VALID_OPTIONS);

    expect(result).toEqual({
      success: true,
      skillName: "slow-skill",
      skillPath: "/mock/skills/dir/slow-skill",
    });
  });

  // ===========================================================================
  // Phase 6: エラーサニタイズ追加テスト
  // ===========================================================================

  it("TC-G01-023: Windowsパス('Error at C:\\\\Users\\\\user\\\\file.ts')が除去される", async () => {
    mockCreateSkillFromWizard.mockRejectedValueOnce(
      new Error("Error at C:\\Users\\user\\file.ts"),
    );

    const err = await callAndCatchError(VALID_DESCRIPTION, VALID_OPTIONS);
    expect(err.code).toBe(ERROR_CODE_CREATE);
    expect(err.message).not.toMatch(/C:\\Users/);
    expect(err.message).toContain("[path]");
  });

  it("TC-G01-024: 複数パス('/path/a error /path/b')が同時に除去される", async () => {
    mockCreateSkillFromWizard.mockRejectedValueOnce(
      new Error("Error in /path/a and /path/b"),
    );

    const err = await callAndCatchError(VALID_DESCRIPTION, VALID_OPTIONS);
    expect(err.code).toBe(ERROR_CODE_CREATE);
    expect(err.message).not.toContain("/path/a");
    expect(err.message).not.toContain("/path/b");
    // 両方のパスが [path] に置換される
    const pathMatches = err.message.match(/\[path\]/g);
    expect(pathMatches).not.toBeNull();
    expect(pathMatches!.length).toBeGreaterThanOrEqual(2);
  });

  it("TC-G01-025: スタックトレース('Error\\n    at Function (/app/index.js:1:1)')が除去される", async () => {
    mockCreateSkillFromWizard.mockRejectedValueOnce(
      new Error(
        "Something failed\n    at Function (/app/index.js:1:1)\n    at Module._compile (internal/modules.js:10:10)",
      ),
    );

    const err = await callAndCatchError(VALID_DESCRIPTION, VALID_OPTIONS);
    expect(err.code).toBe(ERROR_CODE_CREATE);
    expect(err.message).not.toContain("at Function");
    expect(err.message).not.toContain("at Module._compile");
    expect(err.message).not.toContain("internal/modules.js");
  });
});
