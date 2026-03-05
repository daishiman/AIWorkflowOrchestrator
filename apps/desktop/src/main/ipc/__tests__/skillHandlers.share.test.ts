/**
 * Skill Share IPC Handlers テスト
 *
 * TDD Red Phase: 全テストは実装コードが存在しないため失敗状態で作成。
 * Phase 5（実装）完了後に全件 Green となることを検証する。
 *
 * テスト対象チャネル:
 * - skill:importFromSource (= IPC_CHANNELS.SKILL_IMPORT_FROM_SOURCE)
 * - skill:export (= IPC_CHANNELS.SKILL_EXPORT)
 * - skill:validateSource (= IPC_CHANNELS.SKILL_VALIDATE_SOURCE)
 *
 * @see docs/30-workflows/skill-share/phase-4-test-creation.md
 * @see docs/30-workflows/skill-share/outputs/phase-2/api-specification.md
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";

// === Mock Setup ===

// Mock electron-store (required for PermissionStore in SkillExecutor)
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

// Mock SkillShareManager
const mockSkillShareManager = {
  importFromSource: vi.fn(),
  exportSkill: vi.fn(),
  validateSource: vi.fn(),
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
    on: vi.fn(),
    removeAllListeners: vi.fn(),
  },
  BrowserWindow: {
    fromWebContents: vi
      .fn()
      .mockReturnValue({ id: 1, isDestroyed: () => false }),
  },
}));

// Mock ipc-validator
const mockValidateIpcSender = vi.fn().mockReturnValue({ valid: true });
const mockToIPCValidationError = vi
  .fn()
  .mockImplementation(
    (result: { errorCode?: string; errorMessage?: string }) => ({
      success: false,
      error: {
        code: result.errorCode ?? "IPC_UNAUTHORIZED",
        message: result.errorMessage ?? "Unauthorized IPC call",
      },
    }),
  );

vi.mock("../../infrastructure/security/ipc-validator.js", () => ({
  validateIpcSender: mockValidateIpcSender,
  toIPCValidationError: mockToIPCValidationError,
}));

// Import after mocks
import { ipcMain } from "electron";

// Skill Share IPC Channels (per Phase 2 design)
const SKILL_SHARE_CHANNELS = {
  IMPORT_FROM_SOURCE: "skill:importFromSource",
  EXPORT: "skill:export",
  VALIDATE_SOURCE: "skill:validateSource",
} as const;

/**
 * Mock IPC event factory
 * @param valid - true: 正当な送信元、false: 不正な送信元
 */
const createMockEvent = (valid: boolean = true) =>
  ({
    sender: {
      id: valid ? 1 : 999,
      getURL: () => (valid ? "file://" : "https://malicious.com"),
    },
    senderFrame: { routingId: 0 },
  }) as unknown as Electron.IpcMainInvokeEvent;

// =============================================================================
// Test Suite
// =============================================================================

describe("skillHandlers.share", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    // Capture registered handlers via ipcMain.handle mock
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    // Default mock responses
    mockSkillShareManager.importFromSource.mockResolvedValue({
      success: true,
      data: {
        success: true,
        skillName: "imported-skill",
        skillPath: "/skills/imported-skill",
        source: { type: "github", repo: "owner/repo" },
        importedAt: new Date().toISOString(),
      },
    });
    mockSkillShareManager.exportSkill.mockResolvedValue({
      success: true,
      data: {
        success: true,
        destination: { type: "gist", gistId: "abc123" },
        exportedFiles: ["SKILL.md"],
        shareUrl: "https://gist.github.com/abc123",
      },
    });
    mockSkillShareManager.validateSource.mockResolvedValue({
      success: true,
      data: {
        isReachable: true,
        hasSkillMd: true,
        errors: [],
      },
    });

    // Try to import and register share handlers (will fail in Red phase)
    try {
      const { registerSkillShareHandlers } =
        await import("../skillHandlers.share");
      registerSkillShareHandlers(
        mockMainWindow,
        mockSkillShareManager as never,
      );
    } catch {
      // Expected in Red phase - module doesn't exist yet
    }
  });

  afterEach(() => {
    vi.resetModules();
  });

  // Helper: get handler by channel name, throw if not found
  const getHandler = (channel: string) => {
    const handler = handlers.get(channel);
    if (!handler) throw new Error(`Handler not found: ${channel}`);
    return handler;
  };

  // ===========================================================================
  // Handler registration
  // ===========================================================================

  describe("registerSkillShareHandlers", () => {
    it("SSH-REG-01: skill:importFromSource ハンドラが登録される", () => {
      expect(handlers.has(SKILL_SHARE_CHANNELS.IMPORT_FROM_SOURCE)).toBe(true);
    });

    it("SSH-REG-02: skill:export ハンドラが登録される", () => {
      expect(handlers.has(SKILL_SHARE_CHANNELS.EXPORT)).toBe(true);
    });

    it("SSH-REG-03: skill:validateSource ハンドラが登録される", () => {
      expect(handlers.has(SKILL_SHARE_CHANNELS.VALIDATE_SOURCE)).toBe(true);
    });
  });

  // ===========================================================================
  // skill:importFromSource
  // ===========================================================================

  describe("skill:importFromSource ハンドラ", () => {
    // -------------------------------------------------------------------------
    // バリデーション（P42準拠3段）
    // -------------------------------------------------------------------------

    describe("バリデーション（P42準拠3段）", () => {
      it("SSH-IMP-V01: source が undefined の場合 VALIDATION_ERROR を返す", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.IMPORT_FROM_SOURCE);
        const event = createMockEvent();

        const result = (await handler(event, undefined)) as {
          success: boolean;
          error?: { code: string };
          errorCode?: string;
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("VALIDATION_ERROR");
        expect(result.errorCode).toBe("ERR_1001");
      });

      it("SSH-IMP-V02: source.type が string でない場合 VALIDATION_ERROR を返す", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.IMPORT_FROM_SOURCE);
        const event = createMockEvent();

        const result = (await handler(event, { type: 42 })) as {
          success: boolean;
          error?: { code: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("VALIDATION_ERROR");
      });

      it("SSH-IMP-V03: source.type が空文字列の場合 VALIDATION_ERROR を返す", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.IMPORT_FROM_SOURCE);
        const event = createMockEvent();

        const result = (await handler(event, { type: "" })) as {
          success: boolean;
          error?: { code: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("VALIDATION_ERROR");
      });

      it("SSH-IMP-V04: source.type がスペースのみの場合 VALIDATION_ERROR を返す（P42対策）", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.IMPORT_FROM_SOURCE);
        const event = createMockEvent();

        const result = (await handler(event, { type: "   " })) as {
          success: boolean;
          error?: { code: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("VALIDATION_ERROR");
      });

      it("SSH-IMP-V05: source.type が許可値以外の場合 VALIDATION_ERROR を返す", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.IMPORT_FROM_SOURCE);
        const event = createMockEvent();

        const result = (await handler(event, { type: "ftp" })) as {
          success: boolean;
          error?: { code: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("VALIDATION_ERROR");
      });
    });

    // -------------------------------------------------------------------------
    // Sender検証
    // -------------------------------------------------------------------------

    describe("Sender検証", () => {
      it("SSH-IMP-S01: 不正な送信元ウィンドウからのリクエストを拒否する", async () => {
        // Sender検証を失敗に設定
        mockValidateIpcSender.mockReturnValueOnce({
          valid: false,
          errorCode: "IPC_UNAUTHORIZED",
          errorMessage: "Unauthorized IPC call from unknown window",
        });

        const handler = getHandler(SKILL_SHARE_CHANNELS.IMPORT_FROM_SOURCE);
        const event = createMockEvent(false);

        // ハンドラが throw するか、エラー結果を返すかは実装依存
        // 既存 skillHandlers.ts パターンでは throw する
        let thrownError: unknown = null;
        let result: unknown = null;
        try {
          result = await handler(event, {
            type: "github",
            repo: "owner/repo",
          });
        } catch (error) {
          thrownError = error;
        }

        // throwパターンの場合
        if (thrownError !== null) {
          const err = thrownError as {
            success: boolean;
            error: { code: string };
            errorCode?: string;
          };
          expect(err.success).toBe(false);
          expect(err.error.code).toBe("IPC_UNAUTHORIZED");
          expect(err.errorCode).toBe("ERR_2004");
        } else {
          const res = result as {
            success: boolean;
            error?: { code: string };
            errorCode?: string;
          };
          expect(res.success).toBe(false);
          expect(res.error?.code).toBe("IPC_UNAUTHORIZED");
          expect(res.errorCode).toBe("ERR_2004");
        }

        // SkillShareManager が呼ばれていないことを確認
        expect(mockSkillShareManager.importFromSource).not.toHaveBeenCalled();
      });
    });

    // -------------------------------------------------------------------------
    // 正常系
    // -------------------------------------------------------------------------

    describe("正常系", () => {
      it("SSH-IMP-N01: 有効な github ShareTarget を渡すと SkillShareManager.importFromSource() を呼び出す", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.IMPORT_FROM_SOURCE);
        const event = createMockEvent();
        const source = { type: "github", repo: "owner/repo", branch: "main" };

        const result = (await handler(event, source)) as {
          success: boolean;
          data?: {
            skillName: string;
            skillPath: string;
          };
        };

        expect(mockSkillShareManager.importFromSource).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "github",
            repo: "owner/repo",
          }),
        );
        expect(result.success).toBe(true);
        expect(result.data?.skillName).toBe("imported-skill");
      });

      it("SSH-IMP-N02: 有効な gist ShareTarget を渡すと SkillShareManager.importFromSource() を呼び出す", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.IMPORT_FROM_SOURCE);
        const event = createMockEvent();
        const source = { type: "gist", gistId: "abc123def456" };

        await handler(event, source);

        expect(mockSkillShareManager.importFromSource).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "gist",
            gistId: "abc123def456",
          }),
        );
      });

      it("SSH-IMP-E01: SkillShareManager 例外を INTERNAL_ERROR + ERR_5001 に正規化する", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.IMPORT_FROM_SOURCE);
        const event = createMockEvent();
        mockSkillShareManager.importFromSource.mockRejectedValueOnce(
          new Error("failed at /Users/dev/private token=abc"),
        );

        const result = (await handler(event, {
          type: "github",
          repo: "owner/repo",
        })) as {
          success: boolean;
          error?: { code: string; message: string };
          errorCode?: string;
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("INTERNAL_ERROR");
        expect(result.error?.message).toBe("Internal error");
        expect(result.errorCode).toBe("ERR_5001");
      });
    });
  });

  // ===========================================================================
  // skill:export
  // ===========================================================================

  describe("skill:export ハンドラ", () => {
    // -------------------------------------------------------------------------
    // バリデーション（P42準拠3段）
    // -------------------------------------------------------------------------

    describe("バリデーション（P42準拠3段）", () => {
      it("SSH-EXP-V01: skillName が undefined の場合 VALIDATION_ERROR を返す", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.EXPORT);
        const event = createMockEvent();

        const result = (await handler(event, {
          destination: { type: "gist", gistId: "abc123" },
        })) as {
          success: boolean;
          error?: { code: string };
          errorCode?: string;
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("VALIDATION_ERROR");
        expect(result.errorCode).toBe("ERR_1001");
      });

      it("SSH-EXP-V02: skillName が空文字列の場合 VALIDATION_ERROR を返す", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.EXPORT);
        const event = createMockEvent();

        const result = (await handler(event, {
          skillName: "",
          destination: { type: "gist", gistId: "abc123" },
        })) as {
          success: boolean;
          error?: { code: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("VALIDATION_ERROR");
      });

      it("SSH-EXP-V03: skillName がスペースのみの場合 VALIDATION_ERROR を返す（P42対策）", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.EXPORT);
        const event = createMockEvent();

        const result = (await handler(event, {
          skillName: "   ",
          destination: { type: "gist", gistId: "abc123" },
        })) as {
          success: boolean;
          error?: { code: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("VALIDATION_ERROR");
      });

      it("SSH-EXP-V04: destination が undefined の場合 VALIDATION_ERROR を返す", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.EXPORT);
        const event = createMockEvent();

        const result = (await handler(event, {
          skillName: "my-skill",
        })) as {
          success: boolean;
          error?: { code: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("VALIDATION_ERROR");
      });

      it("SSH-EXP-V05: destination.type が許可値（gist/local）以外の場合 VALIDATION_ERROR を返す", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.EXPORT);
        const event = createMockEvent();

        const result = (await handler(event, {
          skillName: "my-skill",
          destination: { type: "ftp" },
        })) as {
          success: boolean;
          error?: { code: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("VALIDATION_ERROR");
      });
    });

    // -------------------------------------------------------------------------
    // Sender検証
    // -------------------------------------------------------------------------

    describe("Sender検証", () => {
      it("SSH-EXP-S01: 不正な送信元ウィンドウからのリクエストを拒否する", async () => {
        mockValidateIpcSender.mockReturnValueOnce({
          valid: false,
          errorCode: "IPC_UNAUTHORIZED",
          errorMessage: "Unauthorized IPC call from unknown window",
        });

        const handler = getHandler(SKILL_SHARE_CHANNELS.EXPORT);
        const event = createMockEvent(false);

        let thrownError: unknown = null;
        let result: unknown = null;
        try {
          result = await handler(event, {
            skillName: "my-skill",
            destination: { type: "gist", gistId: "abc123" },
          });
        } catch (error) {
          thrownError = error;
        }

        if (thrownError !== null) {
          const err = thrownError as {
            success: boolean;
            error: { code: string };
            errorCode?: string;
          };
          expect(err.success).toBe(false);
          expect(err.error.code).toBe("IPC_UNAUTHORIZED");
          expect(err.errorCode).toBe("ERR_2004");
        } else {
          const res = result as {
            success: boolean;
            error?: { code: string };
            errorCode?: string;
          };
          expect(res.success).toBe(false);
          expect(res.error?.code).toBe("IPC_UNAUTHORIZED");
          expect(res.errorCode).toBe("ERR_2004");
        }

        expect(mockSkillShareManager.exportSkill).not.toHaveBeenCalled();
      });
    });

    // -------------------------------------------------------------------------
    // 正常系
    // -------------------------------------------------------------------------

    describe("正常系", () => {
      it("SSH-EXP-N01: 有効な引数を渡すと SkillShareManager.exportSkill() を呼び出す", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.EXPORT);
        const event = createMockEvent();
        const args = {
          skillName: "my-skill",
          destination: { type: "gist", gistId: "abc123" },
        };

        const result = (await handler(event, args)) as {
          success: boolean;
          data?: {
            shareUrl: string;
            exportedFiles: string[];
          };
        };

        expect(mockSkillShareManager.exportSkill).toHaveBeenCalledWith(
          "my-skill",
          expect.objectContaining({
            type: "gist",
            gistId: "abc123",
          }),
        );
        expect(result.success).toBe(true);
        expect(result.data?.shareUrl).toBe("https://gist.github.com/abc123");
      });
    });
  });

  // ===========================================================================
  // skill:validateSource
  // ===========================================================================

  describe("skill:validateSource ハンドラ", () => {
    // -------------------------------------------------------------------------
    // バリデーション（P42準拠3段）
    // -------------------------------------------------------------------------

    describe("バリデーション（P42準拠3段）", () => {
      it("SSH-VAL-V01: source が undefined の場合 VALIDATION_ERROR を返す", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.VALIDATE_SOURCE);
        const event = createMockEvent();

        const result = (await handler(event, undefined)) as {
          success: boolean;
          error?: { code: string };
          errorCode?: string;
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("VALIDATION_ERROR");
        expect(result.errorCode).toBe("ERR_1001");
      });

      it("SSH-VAL-V02: source.type が string でない場合 VALIDATION_ERROR を返す", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.VALIDATE_SOURCE);
        const event = createMockEvent();

        const result = (await handler(event, { type: 123 })) as {
          success: boolean;
          error?: { code: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("VALIDATION_ERROR");
      });

      it("SSH-VAL-V03: source.type がスペースのみの場合 VALIDATION_ERROR を返す（P42対策）", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.VALIDATE_SOURCE);
        const event = createMockEvent();

        const result = (await handler(event, { type: "   " })) as {
          success: boolean;
          error?: { code: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("VALIDATION_ERROR");
      });
    });

    // -------------------------------------------------------------------------
    // 正常系
    // -------------------------------------------------------------------------

    describe("正常系", () => {
      it("SSH-VAL-N01: 有効な ShareTarget を渡すと検証結果を返す", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.VALIDATE_SOURCE);
        const event = createMockEvent();
        const source = { type: "github", repo: "owner/repo" };

        const result = (await handler(event, source)) as {
          success: boolean;
          data?: {
            isReachable: boolean;
            hasSkillMd: boolean;
            errors: string[];
          };
        };

        expect(mockSkillShareManager.validateSource).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "github",
            repo: "owner/repo",
          }),
        );
        expect(result.success).toBe(true);
        expect(result.data?.isReachable).toBe(true);
        expect(result.data?.hasSkillMd).toBe(true);
      });
    });
  });

  // ===========================================================================
  // 境界値・異常系テスト
  // ===========================================================================

  describe("境界値・異常系テスト", () => {
    describe("skill:importFromSource 境界値", () => {
      it("SSH-EDGE-01: source に null を渡した場合 VALIDATION_ERROR を返す", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.IMPORT_FROM_SOURCE);
        const event = createMockEvent();

        const result = (await handler(event, null)) as {
          success: boolean;
          error?: { code: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("VALIDATION_ERROR");
      });

      it("SSH-EDGE-02: source に数値（42）を渡した場合 VALIDATION_ERROR を返す", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.IMPORT_FROM_SOURCE);
        const event = createMockEvent();

        const result = (await handler(event, 42)) as {
          success: boolean;
          error?: { code: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("VALIDATION_ERROR");
      });

      it("SSH-EDGE-03: source.repo に10000文字の文字列を渡した場合 VALIDATION_ERROR を返す", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.IMPORT_FROM_SOURCE);
        const event = createMockEvent();
        const longString = "a".repeat(10000);

        const result = (await handler(event, {
          type: "github",
          repo: longString,
        })) as {
          success: boolean;
          error?: { code: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("VALIDATION_ERROR");
      });

      it("SSH-EDGE-04: source が空オブジェクト {} の場合 VALIDATION_ERROR を返す", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.IMPORT_FROM_SOURCE);
        const event = createMockEvent();

        const result = (await handler(event, {})) as {
          success: boolean;
          error?: { code: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("VALIDATION_ERROR");
      });
    });

    describe("skill:export 境界値", () => {
      it("SSH-EDGE-05: args が undefined の場合 VALIDATION_ERROR を返す", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.EXPORT);
        const event = createMockEvent();

        const result = (await handler(event, undefined)) as {
          success: boolean;
          error?: { code: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("VALIDATION_ERROR");
      });

      it("SSH-EDGE-06: args が null の場合 VALIDATION_ERROR を返す", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.EXPORT);
        const event = createMockEvent();

        const result = (await handler(event, null)) as {
          success: boolean;
          error?: { code: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("VALIDATION_ERROR");
      });
    });

    describe("skill:validateSource 境界値", () => {
      it("SSH-EDGE-07: source に配列を渡した場合 VALIDATION_ERROR を返す", async () => {
        const handler = getHandler(SKILL_SHARE_CHANNELS.VALIDATE_SOURCE);
        const event = createMockEvent();

        const result = (await handler(event, [1, 2, 3])) as {
          success: boolean;
          error?: { code: string };
        };

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("VALIDATION_ERROR");
      });
    });
  });

  // ===========================================================================
  // unregisterSkillShareHandlers
  // ===========================================================================

  describe("unregisterSkillShareHandlers", () => {
    it("SSH-UNREG-01: 全チャネルの removeHandler が呼び出される", async () => {
      const { unregisterSkillShareHandlers } =
        await import("../skillHandlers.share");

      unregisterSkillShareHandlers();

      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        SKILL_SHARE_CHANNELS.IMPORT_FROM_SOURCE,
      );
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        SKILL_SHARE_CHANNELS.EXPORT,
      );
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        SKILL_SHARE_CHANNELS.VALIDATE_SOURCE,
      );
      expect(ipcMain.removeHandler).toHaveBeenCalledTimes(3);
    });
  });

  // ===========================================================================
  // P41 対策: validateIpcSender コールバック呼び出し検証
  // ===========================================================================

  describe("validateIpcSender コールバック検証（P41 対策）", () => {
    it("SSH-CB-01: importFromSource ハンドラの getAllowedWindows コールバックが mainWindow を返す", async () => {
      const handler = getHandler(SKILL_SHARE_CHANNELS.IMPORT_FROM_SOURCE);
      const event = createMockEvent();

      await handler(event, { type: "github", repo: "owner/repo" });

      // validateIpcSender の第3引数（options）の getAllowedWindows を呼び出して検証
      expect(mockValidateIpcSender).toHaveBeenCalled();
      const options = mockValidateIpcSender.mock.calls[0][2] as {
        getAllowedWindows: () => unknown[];
      };
      const windows = options.getAllowedWindows();
      expect(windows).toHaveLength(1);
      expect(windows[0]).toBe(mockMainWindow);
    });

    it("SSH-CB-02: export ハンドラの getAllowedWindows コールバックが mainWindow を返す", async () => {
      const handler = getHandler(SKILL_SHARE_CHANNELS.EXPORT);
      const event = createMockEvent();

      await handler(event, {
        skillName: "test",
        destination: { type: "gist" },
      });

      const options = mockValidateIpcSender.mock.calls[0][2] as {
        getAllowedWindows: () => unknown[];
      };
      const windows = options.getAllowedWindows();
      expect(windows).toHaveLength(1);
      expect(windows[0]).toBe(mockMainWindow);
    });

    it("SSH-CB-03: validateSource ハンドラの getAllowedWindows コールバックが mainWindow を返す", async () => {
      const handler = getHandler(SKILL_SHARE_CHANNELS.VALIDATE_SOURCE);
      const event = createMockEvent();

      await handler(event, { type: "local" });

      const options = mockValidateIpcSender.mock.calls[0][2] as {
        getAllowedWindows: () => unknown[];
      };
      const windows = options.getAllowedWindows();
      expect(windows).toHaveLength(1);
      expect(windows[0]).toBe(mockMainWindow);
    });
  });
});
