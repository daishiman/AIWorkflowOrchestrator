/**
 * skillHandlers skill:fork IPC ハンドラテスト
 *
 * TASK-9E: スキルフォーク・派生機能
 * P42準拠3段バリデーション（型チェック→空文字列→トリム空文字列）と
 * validateIpcSender 送信元検証を検証する。
 *
 * @see docs/30-workflows/TASK-9E-skill-fork/phase-4-test-creation.md
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
    success: false,
    error: {
      code: result.errorCode ?? "IPC_UNAUTHORIZED",
      message: result.errorMessage ?? "Unauthorized IPC call",
    },
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
const mockFork = vi.fn();
vi.mock("../../services/skill/SkillForker.js", () => ({
  SkillForker: vi.fn().mockImplementation(() => ({
    fork: mockFork,
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

const CHANNEL = "skill:fork";

describe("skillHandlers skill:fork IPC ハンドラ", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;
  const mockEvent = {} as unknown;

  const validArgs = {
    sourceSkill: "source-skill",
    newName: "forked-skill",
    copyAgents: true,
    copyReferences: true,
    copyScripts: true,
    copyAssets: true,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    // ハンドラをキャプチャ
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    // SkillForker.fork のデフォルトレスポンス
    mockFork.mockResolvedValue({
      success: true,
      newSkillPath: "/mock/skills/dir/forked-skill",
      copiedFiles: ["SKILL.md", "fork-metadata.json"],
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

  // ===========================================================================
  // ハンドラ登録テスト
  // ===========================================================================

  it("SF-IPC-01: skill:fork ハンドラが登録される", () => {
    expect(handlers.has(CHANNEL)).toBe(true);
  });

  // ===========================================================================
  // 正常系テスト
  // ===========================================================================

  it("SF-IPC-02: 正常なオプションで成功レスポンスを返す", async () => {
    const handler = getHandler();
    const result = (await handler(mockEvent, validArgs)) as {
      success: boolean;
      data: unknown;
    };

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(mockFork).toHaveBeenCalledWith(validArgs);
  });

  it("SF-IPC-03: description 付きオプションで成功する", async () => {
    const handler = getHandler();
    const argsWithDesc = {
      ...validArgs,
      description: "Forked description",
    };

    const result = (await handler(mockEvent, argsWithDesc)) as {
      success: boolean;
    };
    expect(result.success).toBe(true);
    expect(mockFork).toHaveBeenCalledWith(argsWithDesc);
  });

  it("SF-IPC-04: modifyAllowedTools 付きオプションで成功する", async () => {
    const handler = getHandler();
    const argsWithTools = {
      ...validArgs,
      modifyAllowedTools: ["Read", "Glob"],
    };

    const result = (await handler(mockEvent, argsWithTools)) as {
      success: boolean;
    };
    expect(result.success).toBe(true);
    expect(mockFork).toHaveBeenCalledWith(argsWithTools);
  });

  // ===========================================================================
  // P42準拠: args オブジェクト検証
  // ===========================================================================

  it("SF-IPC-05: args が null の場合に VALIDATION_ERROR を throw する", async () => {
    const handler = getHandler();
    await expect(handler(mockEvent, null)).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "args must be a non-null object",
    });
  });

  it("SF-IPC-06: args が undefined の場合に VALIDATION_ERROR を throw する", async () => {
    const handler = getHandler();
    await expect(handler(mockEvent, undefined)).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "args must be a non-null object",
    });
  });

  // ===========================================================================
  // P42準拠: sourceSkill 3段バリデーション
  // ===========================================================================

  it("SF-IPC-07: sourceSkill が非文字列の場合に VALIDATION_ERROR を throw する", async () => {
    const handler = getHandler();
    await expect(
      handler(mockEvent, { ...validArgs, sourceSkill: 123 }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "sourceSkill must be a non-empty string",
    });
  });

  it("SF-IPC-08: sourceSkill が空文字列の場合に VALIDATION_ERROR を throw する", async () => {
    const handler = getHandler();
    await expect(
      handler(mockEvent, { ...validArgs, sourceSkill: "" }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "sourceSkill must be a non-empty string",
    });
  });

  it("SF-IPC-09: sourceSkill がスペースのみの場合に VALIDATION_ERROR を throw する", async () => {
    const handler = getHandler();
    await expect(
      handler(mockEvent, { ...validArgs, sourceSkill: "   " }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "sourceSkill must be a non-empty string",
    });
  });

  // ===========================================================================
  // P42準拠: newName 3段バリデーション
  // ===========================================================================

  it("SF-IPC-10: newName が非文字列の場合に VALIDATION_ERROR を throw する", async () => {
    const handler = getHandler();
    await expect(
      handler(mockEvent, { ...validArgs, newName: 42 }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "newName must be a non-empty string",
    });
  });

  it("SF-IPC-11: newName が空文字列の場合に VALIDATION_ERROR を throw する", async () => {
    const handler = getHandler();
    await expect(
      handler(mockEvent, { ...validArgs, newName: "" }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "newName must be a non-empty string",
    });
  });

  it("SF-IPC-12: newName がスペースのみの場合に VALIDATION_ERROR を throw する", async () => {
    const handler = getHandler();
    await expect(
      handler(mockEvent, { ...validArgs, newName: "   " }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "newName must be a non-empty string",
    });
  });

  // ===========================================================================
  // description バリデーション（省略可能 + 指定時は非空）
  // ===========================================================================

  it("SF-IPC-13: description が空文字列の場合に VALIDATION_ERROR を throw する", async () => {
    const handler = getHandler();
    await expect(
      handler(mockEvent, { ...validArgs, description: "" }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "description must be a non-empty string when provided",
    });
  });

  it("SF-IPC-14: description がスペースのみの場合に VALIDATION_ERROR を throw する", async () => {
    const handler = getHandler();
    await expect(
      handler(mockEvent, { ...validArgs, description: "   " }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "description must be a non-empty string when provided",
    });
  });

  // ===========================================================================
  // boolean フラグバリデーション
  // ===========================================================================

  it("SF-IPC-15: copyAgents が非 boolean の場合に VALIDATION_ERROR を throw する", async () => {
    const handler = getHandler();
    await expect(
      handler(mockEvent, { ...validArgs, copyAgents: "true" }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "copyAgents must be a boolean",
    });
  });

  it("SF-IPC-16: copyReferences が非 boolean の場合に VALIDATION_ERROR を throw する", async () => {
    const handler = getHandler();
    await expect(
      handler(mockEvent, { ...validArgs, copyReferences: 1 }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "copyReferences must be a boolean",
    });
  });

  it("SF-IPC-17: copyScripts が非 boolean の場合に VALIDATION_ERROR を throw する", async () => {
    const handler = getHandler();
    await expect(
      handler(mockEvent, { ...validArgs, copyScripts: null }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "copyScripts must be a boolean",
    });
  });

  it("SF-IPC-18: copyAssets が非 boolean の場合に VALIDATION_ERROR を throw する", async () => {
    const handler = getHandler();
    await expect(
      handler(mockEvent, { ...validArgs, copyAssets: undefined }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "copyAssets must be a boolean",
    });
  });

  // ===========================================================================
  // modifyAllowedTools バリデーション
  // ===========================================================================

  it("SF-IPC-19: modifyAllowedTools が配列でない場合に VALIDATION_ERROR を throw する", async () => {
    const handler = getHandler();
    await expect(
      handler(mockEvent, { ...validArgs, modifyAllowedTools: "Read" }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "modifyAllowedTools must be an array of non-empty strings",
    });
  });

  it("SF-IPC-20: modifyAllowedTools に空文字列要素がある場合に VALIDATION_ERROR を throw する", async () => {
    const handler = getHandler();
    await expect(
      handler(mockEvent, {
        ...validArgs,
        modifyAllowedTools: ["Read", ""],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "modifyAllowedTools must be an array of non-empty strings",
    });
  });

  it("SF-IPC-21: modifyAllowedTools にスペースのみの要素がある場合に VALIDATION_ERROR を throw する", async () => {
    const handler = getHandler();
    await expect(
      handler(mockEvent, {
        ...validArgs,
        modifyAllowedTools: ["Read", "   "],
      }),
    ).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "modifyAllowedTools must be an array of non-empty strings",
    });
  });

  // ===========================================================================
  // 送信元検証テスト
  // ===========================================================================

  it("SF-IPC-22: validateIpcSender が呼び出される", async () => {
    const handler = getHandler();
    await handler(mockEvent, validArgs);

    expect(mockValidateIpcSender).toHaveBeenCalledWith(
      mockEvent,
      CHANNEL,
      expect.objectContaining({
        getAllowedWindows: expect.any(Function),
      }),
    );
  });

  it("SF-IPC-23: validateIpcSender が invalid の場合にエラーを throw する", async () => {
    mockValidateIpcSender.mockReturnValueOnce({
      valid: false,
      errorCode: "IPC_UNAUTHORIZED",
      errorMessage: "Unauthorized",
    });

    const handler = getHandler();
    await expect(handler(mockEvent, validArgs)).rejects.toBeDefined();
  });

  // ===========================================================================
  // エラーハンドリングテスト
  // ===========================================================================

  it("SF-IPC-24: SkillForker.fork がエラーを throw した場合にエラーレスポンスを返す", async () => {
    mockFork.mockRejectedValue(new Error("Disk full"));

    const handler = getHandler();
    const result = (await handler(mockEvent, validArgs)) as {
      success: boolean;
      error: string;
    };

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  // ===========================================================================
  // unregister テスト
  // ===========================================================================

  it("SF-IPC-25: unregisterSkillHandlers で skill:fork が解除される", async () => {
    const { unregisterSkillHandlers } = await import("../skillHandlers");
    unregisterSkillHandlers();

    expect(ipcMain.removeHandler).toHaveBeenCalledWith(CHANNEL);
  });
});
