/**
 * SkillCreator IPC Security Tests
 *
 * UT-9B-H-003: SkillCreator IPCセキュリティ強化
 *
 * テスト範囲:
 * - パストラバーサル攻撃防止（validatePath）
 * - エラーメッセージサニタイズ（sanitizeErrorMessage）
 * - schemaNameホワイトリスト（ALLOWED_SCHEMA_NAMES）
 * - 正常系回帰テスト
 * - 境界値・組合せテスト
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type {
  IpcMainInvokeEvent,
  BrowserWindow as BrowserWindowType,
} from "electron";

// === Mock Types ===

interface MockWebContents {
  id: number;
  getType: () => string;
  isDevToolsOpened: () => boolean;
  send: ReturnType<typeof vi.fn>;
}

interface MockBrowserWindow {
  id: number;
  webContents: MockWebContents;
  isDestroyed: () => boolean;
}

// === Mocks ===

const handlerMap = new Map<string, (...args: unknown[]) => unknown>();

vi.mock("electron", () => {
  const mockBrowserWindow = {
    fromWebContents: vi.fn(),
    getAllWindows: vi.fn(() => []),
  };

  return {
    ipcMain: {
      handle: vi.fn(
        (channel: string, handler: (...args: unknown[]) => unknown) => {
          handlerMap.set(channel, handler);
        },
      ),
      removeHandler: vi.fn((channel: string) => {
        handlerMap.delete(channel);
      }),
    },
    BrowserWindow: mockBrowserWindow,
  };
});

const mockSkillCreatorService = {
  detectMode: vi.fn(),
  createSkill: vi.fn(),
  executeTasks: vi.fn(),
  validateSkill: vi.fn(),
  validateWithSchema: vi.fn(),
};

vi.mock("../../services/skill/SkillCreatorService", () => ({
  SkillCreatorService: vi.fn(() => mockSkillCreatorService),
}));

// Import after mocking
import { BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../../preload/channels";
import {
  registerSkillCreatorHandlers,
  unregisterSkillCreatorHandlers,
} from "../skillCreatorHandlers";
import type { SkillCreatorService } from "../../services/skill/SkillCreatorService";

// === Helper Functions ===

function createMockMainWindow(): MockBrowserWindow {
  return {
    id: 1,
    webContents: {
      id: 1,
      getType: () => "window",
      isDevToolsOpened: () => false,
      send: vi.fn(),
    },
    isDestroyed: () => false,
  };
}

function createMockEvent(webContentsId: number = 1): IpcMainInvokeEvent {
  return {
    sender: {
      id: webContentsId,
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
  } as unknown as IpcMainInvokeEvent;
}

function getHandler(
  channel: string,
): ((...args: unknown[]) => unknown) | undefined {
  return handlerMap.get(channel);
}

// === Tests ===

describe("SkillCreator IPC Security Tests (UT-9B-H-003)", () => {
  let mockMainWindow: MockBrowserWindow;

  beforeEach(() => {
    vi.clearAllMocks();
    handlerMap.clear();

    mockMainWindow = createMockMainWindow();

    (BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>).mockReturnValue(
      mockMainWindow,
    );

    registerSkillCreatorHandlers(
      mockMainWindow as unknown as BrowserWindowType,
      mockSkillCreatorService as unknown as SkillCreatorService,
    );

    // デフォルトのサービスモック
    mockSkillCreatorService.createSkill.mockResolvedValue("/valid/skill");
    mockSkillCreatorService.executeTasks.mockResolvedValue({
      mode: "execution",
      results: [],
      summary: { total: 0, completed: 0, failed: 0, skipped: 0 },
    });
    mockSkillCreatorService.validateSkill.mockResolvedValue(true);
    mockSkillCreatorService.validateWithSchema.mockResolvedValue(true);
    mockSkillCreatorService.detectMode.mockResolvedValue("collaborative");
  });

  afterEach(() => {
    unregisterSkillCreatorHandlers();
  });

  // ============================================
  // カテゴリ1: パストラバーサル攻撃テスト
  // ============================================

  describe("パストラバーサル攻撃テスト", () => {
    describe("skill-creator:create ハンドラー", () => {
      const validCreateBase = {
        name: "test-skill",
        description: "テスト用スキル",
        mode: "create" as const,
      };

      it("SEC-01a: tasksDir に ../ を含むパスを指定すると拒否される (AC-01)", async () => {
        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
        const result = await handler(createMockEvent(), {
          ...validCreateBase,
          tasksDir: "../../etc/passwd",
          skillDir: "/valid/path",
        });

        expect(result).toEqual({
          success: false,
          error: expect.stringContaining("無効なパス"),
        });
        expect(mockSkillCreatorService.createSkill).not.toHaveBeenCalled();
      });

      it("SEC-01b: skillDir に ../ を含むパスを指定すると拒否される (AC-01)", async () => {
        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
        const result = await handler(createMockEvent(), {
          ...validCreateBase,
          tasksDir: "/valid/path",
          skillDir: "../../../tmp/evil",
        });

        expect(result).toEqual({
          success: false,
          error: expect.stringContaining("無効なパス"),
        });
        expect(mockSkillCreatorService.createSkill).not.toHaveBeenCalled();
      });

      it("SEC-02a: tasksDir に ..\\ を含むパスを指定すると拒否される (AC-02)", async () => {
        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
        const result = await handler(createMockEvent(), {
          ...validCreateBase,
          tasksDir: "..\\windows\\system32",
          skillDir: "/valid/path",
        });

        expect(result).toEqual({
          success: false,
          error: expect.stringContaining("無効なパス"),
        });
        expect(mockSkillCreatorService.createSkill).not.toHaveBeenCalled();
      });

      it("SEC-03a: NULLバイトを含むパスを指定すると拒否される (AC-03)", async () => {
        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
        const result = await handler(createMockEvent(), {
          ...validCreateBase,
          tasksDir: "path\x00evil",
          skillDir: "/valid/path",
        });

        expect(result).toEqual({
          success: false,
          error: expect.stringContaining("無効なパス"),
        });
        expect(mockSkillCreatorService.createSkill).not.toHaveBeenCalled();
      });

      it("SEC-03c: UNCパスを指定すると拒否される (AC-04)", async () => {
        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
        const result = await handler(createMockEvent(), {
          ...validCreateBase,
          tasksDir: "\\\\server\\share",
          skillDir: "/valid/path",
        });

        expect(result).toEqual({
          success: false,
          error: expect.stringContaining("無効なパス"),
        });
        expect(mockSkillCreatorService.createSkill).not.toHaveBeenCalled();
      });
    });

    describe("skill-creator:execute-tasks ハンドラー", () => {
      it("SEC-01a: tasksDir に ../ を含むパスを指定すると拒否される (AC-01)", async () => {
        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!;
        const result = await handler(createMockEvent(), {
          tasksDir: "../../etc/passwd",
        });

        expect(result).toEqual({
          success: false,
          error: expect.stringContaining("無効なパス"),
        });
        expect(mockSkillCreatorService.executeTasks).not.toHaveBeenCalled();
      });

      it("SEC-02b: tasksDir に ..\\ を含むパスを指定すると拒否される (AC-02)", async () => {
        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!;
        const result = await handler(createMockEvent(), {
          tasksDir: "..\\..\\evil",
        });

        expect(result).toEqual({
          success: false,
          error: expect.stringContaining("無効なパス"),
        });
        expect(mockSkillCreatorService.executeTasks).not.toHaveBeenCalled();
      });

      it("SEC-03b: NULLバイトを含むパスを指定すると拒否される (AC-03)", async () => {
        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!;
        const result = await handler(createMockEvent(), {
          tasksDir: "valid\x00path",
        });

        expect(result).toEqual({
          success: false,
          error: expect.stringContaining("無効なパス"),
        });
        expect(mockSkillCreatorService.executeTasks).not.toHaveBeenCalled();
      });

      it("SEC-03c: UNCパスを指定すると拒否される (AC-04)", async () => {
        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!;
        const result = await handler(createMockEvent(), {
          tasksDir: "\\\\server\\share",
        });

        expect(result).toEqual({
          success: false,
          error: expect.stringContaining("無効なパス"),
        });
        expect(mockSkillCreatorService.executeTasks).not.toHaveBeenCalled();
      });
    });

    describe("skill-creator:validate ハンドラー", () => {
      it("SEC-01a: skillDir に ../ を含むパスを指定すると拒否される (AC-01)", async () => {
        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE)!;
        const result = await handler(createMockEvent(), {
          skillDir: "../../etc/passwd",
        });

        expect(result).toEqual({
          success: false,
          error: expect.stringContaining("無効なパス"),
        });
        expect(mockSkillCreatorService.validateSkill).not.toHaveBeenCalled();
      });

      it("SEC-02a: skillDir に ..\\ を含むパスを指定すると拒否される (AC-02)", async () => {
        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE)!;
        const result = await handler(createMockEvent(), {
          skillDir: "..\\windows\\system32",
        });

        expect(result).toEqual({
          success: false,
          error: expect.stringContaining("無効なパス"),
        });
        expect(mockSkillCreatorService.validateSkill).not.toHaveBeenCalled();
      });

      it("SEC-03a: NULLバイトを含むパスを指定すると拒否される (AC-03)", async () => {
        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE)!;
        const result = await handler(createMockEvent(), {
          skillDir: "path\x00evil",
        });

        expect(result).toEqual({
          success: false,
          error: expect.stringContaining("無効なパス"),
        });
        expect(mockSkillCreatorService.validateSkill).not.toHaveBeenCalled();
      });

      it("SEC-03c: UNCパスを指定すると拒否される (AC-04)", async () => {
        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE)!;
        const result = await handler(createMockEvent(), {
          skillDir: "\\\\server\\share",
        });

        expect(result).toEqual({
          success: false,
          error: expect.stringContaining("無効なパス"),
        });
        expect(mockSkillCreatorService.validateSkill).not.toHaveBeenCalled();
      });
    });
  });

  // ============================================
  // カテゴリ2: エラーサニタイズテスト
  // ============================================

  describe("エラーサニタイズテスト", () => {
    it("SEC-05a: ファイルパスを含むエラーからパスが除去される (AC-05)", async () => {
      mockSkillCreatorService.createSkill.mockRejectedValue(
        new Error("Failed to read /Users/user/project/skills/task-spec.json"),
      );

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
      const result = (await handler(createMockEvent(), {
        name: "test",
        description: "test",
        mode: "create",
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(result.error).not.toContain("/Users/");
      expect(result.error).not.toContain("/project/");
    });

    it("SEC-05b: スタックトレースを含むエラーからスタックが除去される (AC-06)", async () => {
      const errorWithStack = new Error("Something failed");
      errorWithStack.message =
        "Something failed\n    at Function.run (/app/src/main.ts:42:10)";
      mockSkillCreatorService.createSkill.mockRejectedValue(errorWithStack);

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
      const result = (await handler(createMockEvent(), {
        name: "test",
        description: "test",
        mode: "create",
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(result.error).not.toContain("at Function");
      expect(result.error).not.toContain("/app/src/");
    });

    it("SEC-05c: Errorインスタンス以外のthrowで汎用メッセージが返される (AC-05/06)", async () => {
      mockSkillCreatorService.createSkill.mockRejectedValue(
        "string error thrown",
      );

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
      const result = (await handler(createMockEvent(), {
        name: "test",
        description: "test",
        mode: "create",
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(result.error).toBe("スキル作成処理でエラーが発生しました");
    });

    it("SEC-05d: Windowsパスを含むエラーからパスが除去される (AC-05)", async () => {
      mockSkillCreatorService.createSkill.mockRejectedValue(
        new Error("Failed at C:\\Users\\user\\project\\file.ts"),
      );

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
      const result = (await handler(createMockEvent(), {
        name: "test",
        description: "test",
        mode: "create",
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(result.error).not.toContain("C:\\Users");
      expect(result.error).not.toContain("\\project\\");
    });

    it("SEC-05e: APIキーを含むエラーからキーが除去される (AC-05/06)", async () => {
      mockSkillCreatorService.createSkill.mockRejectedValue(
        new Error("Request failed: api_key=sk-1234abcdef5678"),
      );

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
      const result = (await handler(createMockEvent(), {
        name: "test",
        description: "test",
        mode: "create",
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(result.error).not.toContain("sk-1234");
      expect(result.error).not.toContain("api_key=sk");
    });

    it("SEC-05f: 全ハンドラーでエラーがサニタイズされること", async () => {
      const sensitiveError = new Error(
        "Error at /Users/admin/secret/file.ts: token=abc123xyz",
      );

      mockSkillCreatorService.detectMode.mockRejectedValue(sensitiveError);
      mockSkillCreatorService.executeTasks.mockRejectedValue(sensitiveError);
      mockSkillCreatorService.validateSkill.mockRejectedValue(sensitiveError);
      mockSkillCreatorService.validateWithSchema.mockRejectedValue(
        sensitiveError,
      );

      const results = await Promise.all([
        getHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE)!(createMockEvent(), {
          request: "test",
        }),
        getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!(
          createMockEvent(),
          { tasksDir: "/valid/path" },
        ),
        getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE)!(createMockEvent(), {
          skillDir: "/valid/path",
        }),
        getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA)!(
          createMockEvent(),
          { schemaName: "task-spec", data: {} },
        ),
      ]);

      for (const r of results) {
        const result = r as { success: boolean; error: string };
        expect(result.success).toBe(false);
        expect(result.error).not.toContain("/Users/admin");
        expect(result.error).not.toContain("token=abc123xyz");
      }
    });
  });

  // ============================================
  // カテゴリ3: schemaNameホワイトリストテスト
  // ============================================

  describe("schemaNameホワイトリストテスト", () => {
    describe("許可されたスキーマ名", () => {
      it.each([["task-spec"], ["skill-spec"], ["mode"]])(
        'SEC-04a/b/c: スキーマ名 "%s" は正常に処理される (AC-09)',
        async (schemaName) => {
          const handler = getHandler(
            IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA,
          )!;
          const result = await handler(createMockEvent(), {
            schemaName,
            data: {},
          });

          expect((result as { success: boolean }).success).toBe(true);
          expect(mockSkillCreatorService.validateWithSchema).toHaveBeenCalled();
        },
      );
    });

    describe("拒否されるスキーマ名", () => {
      it.each([
        ["unknown-schema", "未定義のスキーマ名"],
        ["../../malicious", "パスを含むスキーマ名"],
        ["schema; rm -rf /", "特殊文字を含むスキーマ名"],
      ])('SEC-04d/f/g: "%s"（%s）は拒否される (AC-07)', async (schemaName) => {
        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA)!;
        const result = await handler(createMockEvent(), {
          schemaName,
          data: {},
        });

        expect(result).toEqual({
          success: false,
          error: expect.stringContaining("無効なスキーマ名"),
        });
        expect(
          mockSkillCreatorService.validateWithSchema,
        ).not.toHaveBeenCalled();
      });

      it("SEC-04e: 空文字列のスキーマ名は拒否される (AC-08)", async () => {
        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA)!;
        const result = await handler(createMockEvent(), {
          schemaName: "",
          data: {},
        });

        // 既存の型バリデーションまたはschemaNameバリデーションで拒否
        expect((result as { success: boolean }).success).toBe(false);
        expect(
          mockSkillCreatorService.validateWithSchema,
        ).not.toHaveBeenCalled();
      });
    });
  });

  // ============================================
  // カテゴリ4: 正常系回帰テスト
  // ============================================

  describe("正常系回帰テスト", () => {
    it("SEC-REG-01: 正常なパスでcreateが成功する (AC-10)", async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
      const result = await handler(createMockEvent(), {
        name: "test-skill",
        description: "テスト用",
        mode: "create",
        tasksDir: "/Users/user/valid/tasks",
        skillDir: "/Users/user/valid/skills",
      });

      expect((result as { success: boolean }).success).toBe(true);
      expect(mockSkillCreatorService.createSkill).toHaveBeenCalled();
    });

    it("SEC-REG-02: 正常なパスでexecute-tasksが成功する (AC-10)", async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!;
      const result = await handler(createMockEvent(), {
        tasksDir: "/Users/user/valid/tasks",
      });

      expect((result as { success: boolean }).success).toBe(true);
      expect(mockSkillCreatorService.executeTasks).toHaveBeenCalled();
    });

    it("SEC-REG-03: 正常なパスでvalidateが成功する (AC-10)", async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE)!;
      const result = await handler(createMockEvent(), {
        skillDir: "/Users/user/valid/skill",
      });

      expect((result as { success: boolean }).success).toBe(true);
      expect(mockSkillCreatorService.validateSkill).toHaveBeenCalled();
    });
  });

  // ============================================
  // カテゴリ5: 境界値テスト（Phase 6 拡充分）
  // ============================================

  describe("validatePath - 境界値テスト", () => {
    it("空文字列パス → 拒否", async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!;
      const result = await handler(createMockEvent(), {
        tasksDir: "",
      });

      expect((result as { success: boolean }).success).toBe(false);
      expect(mockSkillCreatorService.executeTasks).not.toHaveBeenCalled();
    });

    it("相対パス ./valid → 許可ディレクトリ内なら検証通過", async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!;
      const result = await handler(createMockEvent(), {
        tasksDir: "./valid/tasks",
      });

      expect((result as { success: boolean }).success).toBe(true);
      expect(mockSkillCreatorService.executeTasks).toHaveBeenCalled();
    });

    it("二重エンコードパス %2e%2e%2f → 拒否されない（実際の../ではない）", async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!;
      const result = await handler(createMockEvent(), {
        tasksDir: "%2e%2e%2fvalid",
      });

      // URLエンコードされた文字列はそのままpath.resolveに渡される
      // ../ではないため通過する
      expect((result as { success: boolean }).success).toBe(true);
    });
  });

  describe("sanitizeErrorMessage - 境界値テスト", () => {
    it("非常に長いエラーメッセージ（10000文字）→ 確実に処理", async () => {
      const longMessage = "Error: " + "a".repeat(10000);
      mockSkillCreatorService.createSkill.mockRejectedValue(
        new Error(longMessage),
      );

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
      const result = (await handler(createMockEvent(), {
        name: "test",
        description: "test",
        mode: "create",
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(typeof result.error).toBe("string");
    });

    it("エラーメッセージが空文字列 → デフォルトメッセージ", async () => {
      mockSkillCreatorService.createSkill.mockRejectedValue(new Error(""));

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
      const result = (await handler(createMockEvent(), {
        name: "test",
        description: "test",
        mode: "create",
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(result.error).toBe("スキル作成処理でエラーが発生しました");
    });

    it("null を渡した場合 → デフォルトメッセージ", async () => {
      mockSkillCreatorService.createSkill.mockRejectedValue(null);

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
      const result = (await handler(createMockEvent(), {
        name: "test",
        description: "test",
        mode: "create",
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(result.error).toBe("スキル作成処理でエラーが発生しました");
    });

    it("undefined を渡した場合 → デフォルトメッセージ", async () => {
      mockSkillCreatorService.createSkill.mockRejectedValue(undefined);

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
      const result = (await handler(createMockEvent(), {
        name: "test",
        description: "test",
        mode: "create",
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(result.error).toBe("スキル作成処理でエラーが発生しました");
    });

    it("複数のパスパターンを含むメッセージ → 全て除去", async () => {
      mockSkillCreatorService.createSkill.mockRejectedValue(
        new Error(
          "File /usr/local/bin/app not found, tried C:\\Users\\admin\\file",
        ),
      );

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
      const result = (await handler(createMockEvent(), {
        name: "test",
        description: "test",
        mode: "create",
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(result.error).not.toContain("/usr/local");
      expect(result.error).not.toContain("C:\\Users");
    });

    it("複数のトークン/キーを含むメッセージ → 全てマスキング", async () => {
      mockSkillCreatorService.createSkill.mockRejectedValue(
        new Error("token=abc123 key=def456 password=ghi789"),
      );

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
      const result = (await handler(createMockEvent(), {
        name: "test",
        description: "test",
        mode: "create",
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(result.error).not.toContain("abc123");
      expect(result.error).not.toContain("def456");
      expect(result.error).not.toContain("ghi789");
    });
  });

  // ============================================
  // カテゴリ6: schemaName 境界値テスト（Phase 6 拡充分）
  // ============================================

  describe("ALLOWED_SCHEMA_NAMES - 境界値テスト", () => {
    it('大文字小文字: "Task-Spec" → 拒否（大文字小文字区別）', async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA)!;
      const result = await handler(createMockEvent(), {
        schemaName: "Task-Spec",
        data: {},
      });

      expect(result).toEqual({
        success: false,
        error: expect.stringContaining("無効なスキーマ名"),
      });
    });

    it('先頭/末尾に空白: " task-spec " → 拒否', async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA)!;
      const result = await handler(createMockEvent(), {
        schemaName: " task-spec ",
        data: {},
      });

      expect(result).toEqual({
        success: false,
        error: expect.stringContaining("無効なスキーマ名"),
      });
    });

    it('Unicode不可視文字を含む: "task-spec\\u200B" → 拒否', async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA)!;
      const result = await handler(createMockEvent(), {
        schemaName: "task-spec\u200B",
        data: {},
      });

      expect(result).toEqual({
        success: false,
        error: expect.stringContaining("無効なスキーマ名"),
      });
    });

    it('SQLインジェクション風: "\'; DROP TABLE" → 拒否', async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA)!;
      const result = await handler(createMockEvent(), {
        schemaName: "'; DROP TABLE",
        data: {},
      });

      expect(result).toEqual({
        success: false,
        error: expect.stringContaining("無効なスキーマ名"),
      });
    });
  });

  // ============================================
  // カテゴリ7: セキュリティ検証の優先順序テスト
  // ============================================

  describe("セキュリティ検証の優先順序テスト", () => {
    it("パストラバーサル拒否時にサービス層に到達しないこと", async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!;
      await handler(createMockEvent(), {
        tasksDir: "../../../etc/shadow",
      });

      expect(mockSkillCreatorService.executeTasks).not.toHaveBeenCalled();
    });

    it("schemaName拒否時にサービス層に到達しないこと", async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA)!;
      await handler(createMockEvent(), {
        schemaName: "evil-schema",
        data: {},
      });

      expect(mockSkillCreatorService.validateWithSchema).not.toHaveBeenCalled();
    });

    it("全検証 PASS → サービス層に到達すること", async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!;
      await handler(createMockEvent(), {
        tasksDir: "/valid/tasks/path",
      });

      expect(mockSkillCreatorService.executeTasks).toHaveBeenCalled();
    });
  });
});
