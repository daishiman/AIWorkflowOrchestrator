/**
 * SkillCreator IPC Integration Tests
 *
 * TASK-9B-H: SkillCreatorService IPC統合テスト
 *
 * テスト範囲:
 * - 5つのinvokeハンドラー登録
 * - 正常フロー（各ハンドラー）
 * - エラーハンドリング（各ハンドラー）
 * - sender検証（不正な送信元の拒否）
 * - 引数バリデーション（不正な引数の拒否）
 * - 進捗通知
 * - ハンドラー解除
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

// ハンドラーマップ
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

// SkillCreatorServiceモック
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
  sendSkillCreatorProgress,
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

describe("SkillCreator IPC Handlers", () => {
  let mockMainWindow: MockBrowserWindow;

  beforeEach(() => {
    vi.clearAllMocks();
    handlerMap.clear();

    mockMainWindow = createMockMainWindow();

    // BrowserWindow.fromWebContents がmockMainWindowを返すように設定
    (BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>).mockReturnValue(
      mockMainWindow,
    );

    // ハンドラーを登録
    registerSkillCreatorHandlers(
      mockMainWindow as unknown as BrowserWindowType,
      mockSkillCreatorService as unknown as SkillCreatorService,
    );
  });

  afterEach(() => {
    unregisterSkillCreatorHandlers();
  });

  // ============================================
  // ハンドラー登録テスト
  // ============================================

  describe("ハンドラー登録", () => {
    it("5つのinvokeハンドラーが登録されること", () => {
      expect(getHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE)).toBeDefined();
      expect(getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)).toBeDefined();
      expect(
        getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS),
      ).toBeDefined();
      expect(getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE)).toBeDefined();
      expect(
        getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA),
      ).toBeDefined();
    });

    it("unregisterSkillCreatorHandlersで全ハンドラーが解除されること", () => {
      unregisterSkillCreatorHandlers();

      expect(
        getHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE),
      ).toBeUndefined();
      expect(getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)).toBeUndefined();
      expect(
        getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS),
      ).toBeUndefined();
      expect(getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE)).toBeUndefined();
      expect(
        getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA),
      ).toBeUndefined();
    });
  });

  // ============================================
  // detect-mode ハンドラーテスト
  // ============================================

  describe("skill-creator:detect-mode", () => {
    it("正常なリクエストでモードを返すこと", async () => {
      mockSkillCreatorService.detectMode.mockResolvedValue("collaborative");

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE)!;
      const result = await handler(createMockEvent(), {
        request: "新しいスキルを作成したい",
      });

      expect(result).toEqual({ success: true, data: "collaborative" });
      expect(mockSkillCreatorService.detectMode).toHaveBeenCalledWith(
        "新しいスキルを作成したい",
      );
    });

    it("空文字列のリクエストでエラーを返すこと", async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE)!;
      const result = await handler(createMockEvent(), { request: "" });

      expect(result).toEqual({
        success: false,
        error: "リクエスト文字列が指定されていません",
      });
    });

    it("リクエストがundefinedのときエラーを返すこと", async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE)!;
      const result = await handler(createMockEvent(), undefined);

      expect(result).toEqual({
        success: false,
        error: "リクエスト文字列が指定されていません",
      });
    });

    it("サービスエラー時にエラーメッセージを返すこと", async () => {
      mockSkillCreatorService.detectMode.mockRejectedValue(
        new Error("検出失敗"),
      );

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE)!;
      const result = await handler(createMockEvent(), { request: "テスト" });

      expect(result).toEqual({ success: false, error: "検出失敗" });
    });

    it("非Errorオブジェクトのエラー時にデフォルトメッセージを返すこと", async () => {
      mockSkillCreatorService.detectMode.mockRejectedValue("unknown error");

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE)!;
      const result = await handler(createMockEvent(), { request: "テスト" });

      // UT-9B-H-003: sanitizeErrorMessage統一により共通デフォルトメッセージ
      expect(result).toEqual({
        success: false,
        error: "スキル作成処理でエラーが発生しました",
      });
    });
  });

  // ============================================
  // create ハンドラーテスト
  // ============================================

  describe("skill-creator:create", () => {
    const validCreateArgs = {
      name: "test-skill",
      description: "テスト用スキル",
      mode: "create" as const,
    };

    it("正常なリクエストでスキルディレクトリパスを返すこと", async () => {
      mockSkillCreatorService.createSkill.mockResolvedValue(
        "/skills/test-skill",
      );

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
      const result = await handler(createMockEvent(), validCreateArgs);

      expect(result).toEqual({ success: true, data: "/skills/test-skill" });
      expect(mockSkillCreatorService.createSkill).toHaveBeenCalledWith(
        validCreateArgs,
      );
    });

    it("nameが未指定のときエラーを返すこと", async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
      const result = await handler(createMockEvent(), {
        description: "テスト",
        mode: "create",
      });

      expect(result).toEqual({
        success: false,
        error: "スキル名、説明、モードが正しく指定されていません",
      });
    });

    it("descriptionが未指定のときエラーを返すこと", async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
      const result = await handler(createMockEvent(), {
        name: "test",
        mode: "create",
      });

      expect(result).toEqual({
        success: false,
        error: "スキル名、説明、モードが正しく指定されていません",
      });
    });

    it("modeが未指定のときエラーを返すこと", async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
      const result = await handler(createMockEvent(), {
        name: "test",
        description: "テスト",
      });

      expect(result).toEqual({
        success: false,
        error: "スキル名、説明、モードが正しく指定されていません",
      });
    });

    it("サービスエラー時にエラーメッセージを返すこと", async () => {
      mockSkillCreatorService.createSkill.mockRejectedValue(
        new Error("Skill validation failed"),
      );

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
      const result = await handler(createMockEvent(), validCreateArgs);

      expect(result).toEqual({
        success: false,
        error: "Skill validation failed",
      });
    });
  });

  // ============================================
  // execute-tasks ハンドラーテスト
  // ============================================

  describe("skill-creator:execute-tasks", () => {
    const validExecuteArgs = {
      tasksDir: "/path/to/tasks",
    };

    const mockReport = {
      mode: "execution" as const,
      results: [],
      summary: { total: 0, completed: 0, failed: 0, skipped: 0 },
    };

    it("正常なリクエストで実行レポートを返すこと", async () => {
      mockSkillCreatorService.executeTasks.mockResolvedValue(mockReport);

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!;
      const result = await handler(createMockEvent(), validExecuteArgs);

      expect(result).toEqual({ success: true, data: mockReport });
      expect(mockSkillCreatorService.executeTasks).toHaveBeenCalledWith(
        validExecuteArgs,
      );
    });

    it("tasksDirが空文字列のときエラーを返すこと", async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!;
      const result = await handler(createMockEvent(), { tasksDir: "" });

      expect(result).toEqual({
        success: false,
        error: "タスクディレクトリが指定されていません",
      });
    });

    it("tasksDirがスペースのみのときエラーを返すこと", async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!;
      const result = await handler(createMockEvent(), { tasksDir: "   " });

      expect(result).toEqual({
        success: false,
        error: "タスクディレクトリが指定されていません",
      });
    });

    it("サービスエラー時にエラーメッセージを返すこと", async () => {
      mockSkillCreatorService.executeTasks.mockRejectedValue(
        new Error("Circular dependency detected in tasks"),
      );

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!;
      const result = await handler(createMockEvent(), validExecuteArgs);

      expect(result).toEqual({
        success: false,
        error: "Circular dependency detected in tasks",
      });
    });
  });

  // ============================================
  // validate ハンドラーテスト
  // ============================================

  describe("skill-creator:validate", () => {
    it("正常なリクエストで検証結果を返すこと", async () => {
      mockSkillCreatorService.validateSkill.mockResolvedValue(true);

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE)!;
      const result = await handler(createMockEvent(), {
        skillDir: "/path/to/skill",
      });

      expect(result).toEqual({ success: true, data: true });
      expect(mockSkillCreatorService.validateSkill).toHaveBeenCalledWith(
        "/path/to/skill",
      );
    });

    it("検証失敗時にfalseを返すこと", async () => {
      mockSkillCreatorService.validateSkill.mockResolvedValue(false);

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE)!;
      const result = await handler(createMockEvent(), {
        skillDir: "/path/to/skill",
      });

      expect(result).toEqual({ success: true, data: false });
    });

    it("skillDirが空文字列のときエラーを返すこと", async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE)!;
      const result = await handler(createMockEvent(), { skillDir: "" });

      expect(result).toEqual({
        success: false,
        error: "スキルディレクトリが指定されていません",
      });
    });

    it("サービスエラー時にエラーメッセージを返すこと", async () => {
      mockSkillCreatorService.validateSkill.mockRejectedValue(
        new Error("Validation error"),
      );

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE)!;
      const result = await handler(createMockEvent(), {
        skillDir: "/path/to/skill",
      });

      expect(result).toEqual({ success: false, error: "Validation error" });
    });
  });

  // ============================================
  // validate-schema ハンドラーテスト
  // ============================================

  describe("skill-creator:validate-schema", () => {
    it("正常なリクエストで検証結果を返すこと", async () => {
      mockSkillCreatorService.validateWithSchema.mockResolvedValue(true);

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA)!;
      // UT-9B-H-003: ALLOWED_SCHEMA_NAMESに含まれるスキーマ名を使用
      const result = await handler(createMockEvent(), {
        schemaName: "skill-spec",
        data: { name: "test" },
      });

      expect(result).toEqual({ success: true, data: true });
      expect(mockSkillCreatorService.validateWithSchema).toHaveBeenCalledWith(
        "skill-spec",
        { name: "test" },
      );
    });

    it("schemaNameが空文字列のときエラーを返すこと", async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA)!;
      const result = await handler(createMockEvent(), {
        schemaName: "",
        data: {},
      });

      expect(result).toEqual({
        success: false,
        error: "スキーマ名とデータが正しく指定されていません",
      });
    });

    it("dataがundefinedのときエラーを返すこと", async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA)!;
      const result = await handler(createMockEvent(), {
        schemaName: "test-schema",
        data: undefined,
      });

      expect(result).toEqual({
        success: false,
        error: "スキーマ名とデータが正しく指定されていません",
      });
    });

    it("サービスエラー時にエラーメッセージを返すこと", async () => {
      mockSkillCreatorService.validateWithSchema.mockRejectedValue(
        new Error("Schema not found"),
      );

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA)!;
      // UT-9B-H-003: ALLOWED_SCHEMA_NAMESに含まれるスキーマ名を使用
      const result = await handler(createMockEvent(), {
        schemaName: "task-spec",
        data: {},
      });

      expect(result).toEqual({ success: false, error: "Schema not found" });
    });
  });

  // ============================================
  // Sender検証テスト
  // ============================================

  describe("Sender検証", () => {
    it("不正な送信元からのdetect-modeリクエストを拒否すること", async () => {
      (
        BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>
      ).mockReturnValue(null);

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE)!;

      await expect(
        handler(createMockEvent(999), { request: "テスト" }),
      ).rejects.toMatchObject({
        success: false,
        error: expect.objectContaining({
          code: expect.any(String),
          message: expect.any(String),
        }),
      });
    });

    it("不正な送信元からのcreateリクエストを拒否すること", async () => {
      (
        BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>
      ).mockReturnValue(null);

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;

      await expect(
        handler(createMockEvent(999), {
          name: "test",
          description: "test",
          mode: "create",
        }),
      ).rejects.toMatchObject({
        success: false,
      });
    });

    it("不正な送信元からのexecute-tasksリクエストを拒否すること", async () => {
      (
        BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>
      ).mockReturnValue(null);

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!;

      await expect(
        handler(createMockEvent(999), { tasksDir: "/path" }),
      ).rejects.toMatchObject({
        success: false,
      });
    });

    it("不正な送信元からのvalidateリクエストを拒否すること", async () => {
      (
        BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>
      ).mockReturnValue(null);

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE)!;

      await expect(
        handler(createMockEvent(999), { skillDir: "/path" }),
      ).rejects.toMatchObject({
        success: false,
      });
    });

    it("不正な送信元からのvalidate-schemaリクエストを拒否すること", async () => {
      (
        BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>
      ).mockReturnValue(null);

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA)!;

      await expect(
        handler(createMockEvent(999), { schemaName: "test", data: {} }),
      ).rejects.toMatchObject({
        success: false,
      });
    });
  });

  // ============================================
  // 進捗通知テスト
  // ============================================

  describe("進捗通知", () => {
    it("sendSkillCreatorProgressがwebContents.sendを呼び出すこと", () => {
      const progress = {
        phase: "creating",
        percentage: 50,
        message: "スキル作成中...",
      };

      sendSkillCreatorProgress(
        mockMainWindow as unknown as BrowserWindowType,
        progress,
      );

      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
        progress,
      );
    });

    it("ウィンドウが破棄されている場合はsendを呼び出さないこと", () => {
      const destroyedWindow = {
        ...mockMainWindow,
        isDestroyed: () => true,
      };

      sendSkillCreatorProgress(
        destroyedWindow as unknown as BrowserWindowType,
        { phase: "test", percentage: 0, message: "test" },
      );

      expect(destroyedWindow.webContents.send).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Phase 6: エッジケーステスト
  // ============================================

  describe("Phase 6: Edge Cases", () => {
    describe("SCIT-EDG: Concurrent and Boundary Tests", () => {
      // SCIT-EDG-01: 同時呼び出し（同一チャンネル）
      it("SCIT-EDG-01: should handle concurrent create requests", async () => {
        mockSkillCreatorService.createSkill
          .mockResolvedValueOnce("/path/skill1")
          .mockResolvedValueOnce("/path/skill2");

        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
        const validArgs = {
          name: "test-skill",
          description: "テスト",
          mode: "create",
        };

        const [r1, r2] = await Promise.all([
          handler(createMockEvent(), validArgs),
          handler(createMockEvent(), validArgs),
        ]);

        expect(r1).toEqual({ success: true, data: "/path/skill1" });
        expect(r2).toEqual({ success: true, data: "/path/skill2" });
        expect(mockSkillCreatorService.createSkill).toHaveBeenCalledTimes(2);
      });

      // SCIT-EDG-02: 異なるチャンネル同時呼び出し
      it("SCIT-EDG-02: should handle concurrent requests to different channels", async () => {
        mockSkillCreatorService.detectMode.mockResolvedValue("collaborative");
        mockSkillCreatorService.validateSkill.mockResolvedValue(true);

        const detectHandler = getHandler(
          IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE,
        )!;
        const validateHandler = getHandler(
          IPC_CHANNELS.SKILL_CREATOR_VALIDATE,
        )!;

        const [r1, r2] = await Promise.all([
          detectHandler(createMockEvent(), { request: "テスト" }),
          validateHandler(createMockEvent(), { skillDir: "/path/to/skill" }),
        ]);

        expect(r1).toEqual({ success: true, data: "collaborative" });
        expect(r2).toEqual({ success: true, data: true });
      });

      // SCIT-EDG-03: 5チャンネル同時呼び出し
      it("SCIT-EDG-03: should handle all 5 channels called simultaneously", async () => {
        mockSkillCreatorService.detectMode.mockResolvedValue("create");
        mockSkillCreatorService.createSkill.mockResolvedValue("/path/skill");
        mockSkillCreatorService.executeTasks.mockResolvedValue({
          mode: "execution",
          results: [],
          summary: { total: 0, completed: 0, failed: 0, skipped: 0 },
        });
        mockSkillCreatorService.validateSkill.mockResolvedValue(true);
        mockSkillCreatorService.validateWithSchema.mockResolvedValue(true);

        const results = await Promise.all([
          getHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE)!(
            createMockEvent(),
            { request: "テスト" },
          ),
          getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!(createMockEvent(), {
            name: "s",
            description: "d",
            mode: "create",
          }),
          getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!(
            createMockEvent(),
            { tasksDir: "/path" },
          ),
          getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE)!(createMockEvent(), {
            skillDir: "/path",
          }),
          // UT-9B-H-003: ALLOWED_SCHEMA_NAMESに含まれるスキーマ名を使用
          getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA)!(
            createMockEvent(),
            { schemaName: "skill-spec", data: {} },
          ),
        ]);

        results.forEach((r) => {
          expect((r as { success: boolean }).success).toBe(true);
        });
      });

      // SCIT-EDG-04: サービスが遅延レスポンスを返す場合
      it("SCIT-EDG-04: should handle delayed service response", async () => {
        mockSkillCreatorService.detectMode.mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve("collaborative"), 10),
            ),
        );

        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE)!;
        const result = await handler(createMockEvent(), { request: "テスト" });

        expect(result).toEqual({ success: true, data: "collaborative" });
      });

      // SCIT-EDG-05: サービスが即座にエラーを投げる場合
      it("SCIT-EDG-05: should handle immediate service rejection", async () => {
        mockSkillCreatorService.createSkill.mockRejectedValue(
          new Error("Immediate failure"),
        );

        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
        const result = await handler(createMockEvent(), {
          name: "test",
          description: "test",
          mode: "create",
        });

        expect(result).toEqual({
          success: false,
          error: "Immediate failure",
        });
      });

      // SCIT-EDG-06: 非常に長いスキル名を持つリクエスト
      it("SCIT-EDG-06: should handle very long skill name", async () => {
        const longName = "a".repeat(10000);
        mockSkillCreatorService.createSkill.mockResolvedValue("/path/skill");

        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
        const result = await handler(createMockEvent(), {
          name: longName,
          description: "test",
          mode: "create",
        });

        expect(result).toEqual({ success: true, data: "/path/skill" });
        expect(mockSkillCreatorService.createSkill).toHaveBeenCalledWith({
          name: longName,
          description: "test",
          mode: "create",
        });
      });

      // SCIT-EDG-07: 特殊文字を含むリクエスト
      it("SCIT-EDG-07: should handle special characters in request", async () => {
        const specialRequest =
          '<script>alert("xss")</script>\n\t\r\0日本語テスト🎉';
        mockSkillCreatorService.detectMode.mockResolvedValue("collaborative");

        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE)!;
        const result = await handler(createMockEvent(), {
          request: specialRequest,
        });

        expect(result).toEqual({ success: true, data: "collaborative" });
        expect(mockSkillCreatorService.detectMode).toHaveBeenCalledWith(
          specialRequest,
        );
      });

      // SCIT-EDG-08: 大量のスキーマデータ
      it("SCIT-EDG-08: should handle large schema data", async () => {
        const largeData = {
          fields: Array.from({ length: 1000 }, (_, i) => ({
            name: `field_${i}`,
            type: "string",
            required: i % 2 === 0,
          })),
        };
        mockSkillCreatorService.validateWithSchema.mockResolvedValue(true);

        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA)!;
        // UT-9B-H-003: ALLOWED_SCHEMA_NAMESに含まれるスキーマ名を使用
        const result = await handler(createMockEvent(), {
          schemaName: "task-spec",
          data: largeData,
        });

        expect(result).toEqual({ success: true, data: true });
      });

      // SCIT-EDG-09: 引数がnullの場合
      it("SCIT-EDG-09: should handle null args for detect-mode", async () => {
        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE)!;
        const result = await handler(createMockEvent(), null);

        expect(result).toEqual({
          success: false,
          error: "リクエスト文字列が指定されていません",
        });
      });

      // SCIT-EDG-10: 引数が数値の場合
      it("SCIT-EDG-10: should handle numeric args for create", async () => {
        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
        const result = await handler(createMockEvent(), {
          name: 12345,
          description: true,
          mode: [],
        });

        expect(result).toEqual({
          success: false,
          error: "スキル名、説明、モードが正しく指定されていません",
        });
      });

      // SCIT-EDG-11: 引数が空オブジェクトの場合
      it("SCIT-EDG-11: should handle empty object args for execute-tasks", async () => {
        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!;
        const result = await handler(createMockEvent(), {});

        expect(result).toEqual({
          success: false,
          error: "タスクディレクトリが指定されていません",
        });
      });

      // SCIT-EDG-12: validate-schemaのdataがnullの場合
      it("SCIT-EDG-12: should handle null data for validate-schema", async () => {
        const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA)!;
        // UT-9B-H-003: ALLOWED_SCHEMA_NAMESに含まれるスキーマ名を使用
        const _result = await handler(createMockEvent(), {
          schemaName: "mode",
          data: null,
        });

        // null はundefinedではないため、サービスに渡される
        mockSkillCreatorService.validateWithSchema.mockResolvedValue(false);
        const result2 = await handler(createMockEvent(), {
          schemaName: "mode",
          data: null,
        });
        expect(result2).toEqual({ success: true, data: false });
      });
    });
  });

  // ============================================
  // Phase 6: セキュリティテスト
  // ============================================

  describe("Phase 6: Security Tests", () => {
    // SCIT-SEC-05: パストラバーサル攻撃 - tasksDir
    // UT-9B-H-003: IPC層でパストラバーサルを拒否（サービス委任→IPC層防御に変更）
    it("SCIT-SEC-05: should reject path traversal in tasksDir at IPC layer", async () => {
      const traversalPath = "/path/to/tasks/../../../etc/passwd";

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!;
      const result = await handler(createMockEvent(), {
        tasksDir: traversalPath,
      });

      expect(result).toEqual({
        success: false,
        error: "無効なパスが指定されました: tasksDir",
      });
      expect(mockSkillCreatorService.executeTasks).not.toHaveBeenCalled();
    });

    // SCIT-SEC-06: パストラバーサル攻撃 - skillDir
    // UT-9B-H-003: IPC層でパストラバーサルを拒否
    it("SCIT-SEC-06: should reject path traversal in skillDir at IPC layer", async () => {
      const traversalPath = "../../etc/shadow";

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE)!;
      const result = await handler(createMockEvent(), {
        skillDir: traversalPath,
      });

      expect(result).toEqual({
        success: false,
        error: "無効なパスが指定されました: skillDir",
      });
      expect(mockSkillCreatorService.validateSkill).not.toHaveBeenCalled();
    });

    // SCIT-SEC-07: パストラバーサル攻撃 - NULLバイト
    // UT-9B-H-003: IPC層でNULLバイトを拒否
    it("SCIT-SEC-07: should reject null byte in path at IPC layer", async () => {
      const nullBytePath = "/path/to/skill\0/../../etc/passwd";

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE)!;
      const result = await handler(createMockEvent(), {
        skillDir: nullBytePath,
      });

      expect(result).toEqual({
        success: false,
        error: "無効なパスが指定されました: skillDir",
      });
      expect(mockSkillCreatorService.validateSkill).not.toHaveBeenCalled();
    });

    // SCIT-SEC-08: パストラバーサル攻撃 - Windows UNCパス
    // UT-9B-H-003: IPC層でUNCパスを拒否
    it("SCIT-SEC-08: should reject Windows UNC path at IPC layer", async () => {
      const uncPath = "\\\\server\\share\\path";

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!;
      const result = await handler(createMockEvent(), { tasksDir: uncPath });

      expect(result).toEqual({
        success: false,
        error: "無効なパスが指定されました: tasksDir",
      });
      expect(mockSkillCreatorService.executeTasks).not.toHaveBeenCalled();
    });

    // SCIT-SEC-09: コマンドインジェクション - スキル名
    it("SCIT-SEC-09: should handle command injection in skill name", async () => {
      const maliciousName = 'test; rm -rf / && echo "hacked"';
      mockSkillCreatorService.createSkill.mockResolvedValue("/path/skill");

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
      const result = await handler(createMockEvent(), {
        name: maliciousName,
        description: "test",
        mode: "create",
      });

      // ハンドラーはバリデーション通過後サービスに委譲する
      expect(result).toEqual({ success: true, data: "/path/skill" });
      expect(mockSkillCreatorService.createSkill).toHaveBeenCalledWith({
        name: maliciousName,
        description: "test",
        mode: "create",
      });
    });

    // SCIT-SEC-10: コマンドインジェクション - スキーマ名
    // UT-9B-H-003: ALLOWED_SCHEMA_NAMESホワイトリストで拒否
    it("SCIT-SEC-10: should reject command injection in schema name via whitelist", async () => {
      const maliciousSchema = "$(cat /etc/passwd)";

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA)!;
      const result = await handler(createMockEvent(), {
        schemaName: maliciousSchema,
        data: {},
      });

      expect(result).toEqual({
        success: false,
        error: `無効なスキーマ名が指定されました: ${maliciousSchema}`,
      });
      expect(mockSkillCreatorService.validateWithSchema).not.toHaveBeenCalled();
    });

    // SCIT-SEC-11: 未登録チャンネルへのアクセス試行
    it("SCIT-SEC-11: should not have handler for non-existent channel", () => {
      const fakeHandler = getHandler("skill-creator:non-existent");
      expect(fakeHandler).toBeUndefined();
    });

    // SCIT-SEC-12: ハンドラー解除後の再呼び出し
    it("SCIT-SEC-12: should not respond after unregister", () => {
      unregisterSkillCreatorHandlers();

      expect(
        getHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE),
      ).toBeUndefined();
      expect(getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)).toBeUndefined();
      expect(
        getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS),
      ).toBeUndefined();
      expect(getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE)).toBeUndefined();
      expect(
        getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA),
      ).toBeUndefined();
    });
  });

  // ============================================
  // Phase 6: 進捗通知テスト拡充
  // ============================================

  describe("Phase 6: Progress Notification Tests", () => {
    // SCIT-PRG-01: 0%進捗送信
    it("SCIT-PRG-01: should send 0% progress", () => {
      const progress = {
        phase: "initializing",
        percentage: 0,
        message: "初期化中...",
      };

      sendSkillCreatorProgress(
        mockMainWindow as unknown as BrowserWindowType,
        progress,
      );

      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
        progress,
      );
    });

    // SCIT-PRG-02: 100%進捗送信
    it("SCIT-PRG-02: should send 100% progress", () => {
      const progress = {
        phase: "completed",
        percentage: 100,
        message: "完了",
      };

      sendSkillCreatorProgress(
        mockMainWindow as unknown as BrowserWindowType,
        progress,
      );

      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
        progress,
      );
    });

    // SCIT-PRG-03: 複数回の進捗送信
    it("SCIT-PRG-03: should handle multiple progress updates", () => {
      const progresses = [
        { phase: "step1", percentage: 25, message: "ステップ1" },
        { phase: "step2", percentage: 50, message: "ステップ2" },
        { phase: "step3", percentage: 75, message: "ステップ3" },
        { phase: "step4", percentage: 100, message: "完了" },
      ];

      progresses.forEach((p) => {
        sendSkillCreatorProgress(
          mockMainWindow as unknown as BrowserWindowType,
          p,
        );
      });

      expect(mockMainWindow.webContents.send).toHaveBeenCalledTimes(4);
      progresses.forEach((p, i) => {
        expect(mockMainWindow.webContents.send).toHaveBeenNthCalledWith(
          i + 1,
          IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
          p,
        );
      });
    });

    // SCIT-PRG-04: 正しいチャンネルで送信されること
    it("SCIT-PRG-04: should use correct IPC channel constant", () => {
      sendSkillCreatorProgress(mockMainWindow as unknown as BrowserWindowType, {
        phase: "test",
        percentage: 0,
        message: "test",
      });

      const calledChannel = mockMainWindow.webContents.send.mock.calls[0][0];
      expect(calledChannel).toBe("skill-creator:progress");
      expect(calledChannel).toBe(IPC_CHANNELS.SKILL_CREATOR_PROGRESS);
    });

    // SCIT-PRG-05: 空文字列のphaseとmessage
    it("SCIT-PRG-05: should handle empty phase and message", () => {
      const progress = { phase: "", percentage: 0, message: "" };

      sendSkillCreatorProgress(
        mockMainWindow as unknown as BrowserWindowType,
        progress,
      );

      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
        progress,
      );
    });

    // SCIT-PRG-06: 負の割合値
    it("SCIT-PRG-06: should handle negative percentage", () => {
      const progress = { phase: "error", percentage: -1, message: "エラー" };

      sendSkillCreatorProgress(
        mockMainWindow as unknown as BrowserWindowType,
        progress,
      );

      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
        progress,
      );
    });

    // SCIT-PRG-07: 100%超の割合値
    it("SCIT-PRG-07: should handle percentage over 100", () => {
      const progress = {
        phase: "overflow",
        percentage: 150,
        message: "超過",
      };

      sendSkillCreatorProgress(
        mockMainWindow as unknown as BrowserWindowType,
        progress,
      );

      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
        progress,
      );
    });

    // SCIT-PRG-08: 日本語のメッセージ
    it("SCIT-PRG-08: should handle Japanese characters in message", () => {
      const progress = {
        phase: "作成中",
        percentage: 50,
        message: "スキルを作成しています。しばらくお待ちください。",
      };

      sendSkillCreatorProgress(
        mockMainWindow as unknown as BrowserWindowType,
        progress,
      );

      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
        progress,
      );
    });

    // SCIT-PRG-09: ウィンドウ破棄→再作成後の送信
    it("SCIT-PRG-09: should not send to destroyed window then send to new window", () => {
      const destroyedWindow = {
        ...mockMainWindow,
        isDestroyed: () => true,
        webContents: {
          ...mockMainWindow.webContents,
          send: vi.fn(),
        },
      };

      sendSkillCreatorProgress(
        destroyedWindow as unknown as BrowserWindowType,
        { phase: "test", percentage: 0, message: "test" },
      );
      expect(destroyedWindow.webContents.send).not.toHaveBeenCalled();

      // 新しいウィンドウで送信
      const newWindow = createMockMainWindow();
      sendSkillCreatorProgress(newWindow as unknown as BrowserWindowType, {
        phase: "test",
        percentage: 50,
        message: "test2",
      });
      expect(newWindow.webContents.send).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // Phase 6: 統合テスト拡充
  // ============================================

  describe("Phase 6: Integration Tests", () => {
    // SCIT-INT-01: 完全なスキル作成フロー
    it("SCIT-INT-01: should handle full skill creation flow", async () => {
      // Step 1: モード検出
      mockSkillCreatorService.detectMode.mockResolvedValue("create");
      const detectHandler = getHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE)!;
      const modeResult = await detectHandler(createMockEvent(), {
        request: "新しいスキルを作成したい",
      });
      expect(modeResult).toEqual({ success: true, data: "create" });

      // Step 2: スキル作成
      mockSkillCreatorService.createSkill.mockResolvedValue(
        "/skills/new-skill",
      );
      const createHandler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
      const createResult = await createHandler(createMockEvent(), {
        name: "new-skill",
        description: "新しいスキル",
        mode: "create",
      });
      expect(createResult).toEqual({
        success: true,
        data: "/skills/new-skill",
      });

      // Step 3: 検証
      mockSkillCreatorService.validateSkill.mockResolvedValue(true);
      const validateHandler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE)!;
      const validateResult = await validateHandler(createMockEvent(), {
        skillDir: "/skills/new-skill",
      });
      expect(validateResult).toEqual({ success: true, data: true });
    });

    // SCIT-INT-02: タスク実行と進捗通知の統合
    it("SCIT-INT-02: should handle task execution with progress", async () => {
      const mockReport = {
        mode: "execution" as const,
        results: [{ task: "task1", status: "completed" }],
        summary: { total: 1, completed: 1, failed: 0, skipped: 0 },
      };
      mockSkillCreatorService.executeTasks.mockResolvedValue(mockReport);

      // 進捗通知を送信
      sendSkillCreatorProgress(mockMainWindow as unknown as BrowserWindowType, {
        phase: "executing",
        percentage: 50,
        message: "タスク実行中...",
      });

      // タスク実行
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!;
      const result = await handler(createMockEvent(), {
        tasksDir: "/path/to/tasks",
      });

      expect(result).toEqual({ success: true, data: mockReport });
      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_CREATOR_PROGRESS,
        expect.objectContaining({ percentage: 50 }),
      );
    });

    // SCIT-INT-03: エラー後のリカバリフロー
    it("SCIT-INT-03: should recover from error and succeed on retry", async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;
      const args = {
        name: "test",
        description: "test",
        mode: "create",
      };

      // 1回目: エラー
      mockSkillCreatorService.createSkill.mockRejectedValueOnce(
        new Error("Temporary failure"),
      );
      const errorResult = await handler(createMockEvent(), args);
      expect(errorResult).toEqual({
        success: false,
        error: "Temporary failure",
      });

      // 2回目: 成功
      mockSkillCreatorService.createSkill.mockResolvedValueOnce("/path/skill");
      const successResult = await handler(createMockEvent(), args);
      expect(successResult).toEqual({ success: true, data: "/path/skill" });
    });

    // SCIT-INT-04: バリデーションエラーとサービスエラーの混合
    it("SCIT-INT-04: should distinguish validation errors from service errors", async () => {
      const createHandler = getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!;

      // バリデーションエラー（型不正: サービスは呼ばれない）
      const valResult = await createHandler(createMockEvent(), {
        name: 123,
        description: true,
        mode: [],
      });
      expect(valResult).toEqual({
        success: false,
        error: "スキル名、説明、モードが正しく指定されていません",
      });
      expect(mockSkillCreatorService.createSkill).not.toHaveBeenCalled();

      // サービスエラー（型は正しいがサービスが拒否）
      mockSkillCreatorService.createSkill.mockRejectedValueOnce(
        new Error("DB error"),
      );
      const svcResult = await createHandler(createMockEvent(), {
        name: "test",
        description: "test",
        mode: "create",
      });
      expect(svcResult).toEqual({ success: false, error: "DB error" });
      expect(mockSkillCreatorService.createSkill).toHaveBeenCalledTimes(1);
    });

    // SCIT-INT-05: sender検証失敗後の正常リクエスト
    it("SCIT-INT-05: should accept valid request after rejecting invalid sender", async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE)!;

      // 不正送信元
      (
        BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>
      ).mockReturnValueOnce(null);

      await expect(
        handler(createMockEvent(999), { request: "テスト" }),
      ).rejects.toMatchObject({ success: false });

      // 正常送信元（fromWebContentsが復帰）
      (
        BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>
      ).mockReturnValue(mockMainWindow);
      mockSkillCreatorService.detectMode.mockResolvedValue("collaborative");

      const result = await handler(createMockEvent(), { request: "テスト" });
      expect(result).toEqual({ success: true, data: "collaborative" });
    });

    // SCIT-INT-06: スキーマ検証のデータフロー確認
    it("SCIT-INT-06: should correctly pass schema data through IPC", async () => {
      const complexData = {
        nested: {
          array: [1, 2, 3],
          object: { key: "value" },
          nullValue: null,
          boolValue: true,
        },
      };
      mockSkillCreatorService.validateWithSchema.mockResolvedValue(true);

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA)!;
      // UT-9B-H-003: ALLOWED_SCHEMA_NAMESに含まれるスキーマ名を使用
      const result = await handler(createMockEvent(), {
        schemaName: "skill-spec",
        data: complexData,
      });

      expect(result).toEqual({ success: true, data: true });
      expect(mockSkillCreatorService.validateWithSchema).toHaveBeenCalledWith(
        "skill-spec",
        complexData,
      );
    });

    // SCIT-INT-07: 全チャンネルのエラーハンドリング一貫性
    // UT-9B-H-003: sanitizeErrorMessage統一 + schemaNameホワイトリスト
    it("SCIT-INT-07: should return consistent error format across all channels", async () => {
      const errorMsg = "Consistent error";
      mockSkillCreatorService.detectMode.mockRejectedValue(new Error(errorMsg));
      mockSkillCreatorService.createSkill.mockRejectedValue(
        new Error(errorMsg),
      );
      mockSkillCreatorService.executeTasks.mockRejectedValue(
        new Error(errorMsg),
      );
      mockSkillCreatorService.validateSkill.mockRejectedValue(
        new Error(errorMsg),
      );
      mockSkillCreatorService.validateWithSchema.mockRejectedValue(
        new Error(errorMsg),
      );

      const results = await Promise.all([
        getHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE)!(createMockEvent(), {
          request: "t",
        }),
        getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!(createMockEvent(), {
          name: "t",
          description: "t",
          mode: "create",
        }),
        getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!(
          createMockEvent(),
          { tasksDir: "/t" },
        ),
        getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE)!(createMockEvent(), {
          skillDir: "/t",
        }),
        // ALLOWED_SCHEMA_NAMESに含まれるスキーマ名を使用
        getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA)!(
          createMockEvent(),
          { schemaName: "task-spec", data: {} },
        ),
      ]);

      results.forEach((r) => {
        const result = r as { success: boolean; error: string };
        expect(result.success).toBe(false);
        expect(result.error).toBe(errorMsg);
      });
    });

    // SCIT-INT-08: 非Errorオブジェクトのエラーハンドリング一貫性
    // UT-9B-H-003: sanitizeErrorMessage統一により全ハンドラーで同一デフォルトメッセージ
    it("SCIT-INT-08: should return unified default error messages for non-Error throws", async () => {
      mockSkillCreatorService.detectMode.mockRejectedValue("string error");
      mockSkillCreatorService.createSkill.mockRejectedValue(42);
      mockSkillCreatorService.executeTasks.mockRejectedValue(undefined);
      mockSkillCreatorService.validateSkill.mockRejectedValue(null);
      mockSkillCreatorService.validateWithSchema.mockRejectedValue({
        custom: "error",
      });

      const results = await Promise.all([
        getHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE)!(createMockEvent(), {
          request: "t",
        }),
        getHandler(IPC_CHANNELS.SKILL_CREATOR_CREATE)!(createMockEvent(), {
          name: "t",
          description: "t",
          mode: "create",
        }),
        getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!(
          createMockEvent(),
          { tasksDir: "/t" },
        ),
        getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE)!(createMockEvent(), {
          skillDir: "/t",
        }),
        // ALLOWED_SCHEMA_NAMESに含まれるスキーマ名を使用
        getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA)!(
          createMockEvent(),
          { schemaName: "task-spec", data: {} },
        ),
      ]);

      // sanitizeErrorMessage統一により全ハンドラー共通のデフォルトメッセージ
      const unifiedDefault = "スキル作成処理でエラーが発生しました";

      results.forEach((r) => {
        const result = r as { success: boolean; error: string };
        expect(result.success).toBe(false);
        expect(result.error).toBe(unifiedDefault);
      });
    });

    // SCIT-INT-09: 登録→解除→再登録フロー
    it("SCIT-INT-09: should handle register-unregister-reregister cycle", async () => {
      // 初期状態で登録済み
      expect(getHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE)).toBeDefined();

      // 解除
      unregisterSkillCreatorHandlers();
      expect(
        getHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE),
      ).toBeUndefined();

      // 再登録
      registerSkillCreatorHandlers(
        mockMainWindow as unknown as BrowserWindowType,
        mockSkillCreatorService as unknown as SkillCreatorService,
      );
      expect(getHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE)).toBeDefined();

      // 再登録後に正常動作
      mockSkillCreatorService.detectMode.mockResolvedValue("create");
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE)!;
      const result = await handler(createMockEvent(), { request: "テスト" });
      expect(result).toEqual({ success: true, data: "create" });
    });

    // SCIT-INT-10: executeTasksのオプション全指定
    it("SCIT-INT-10: should pass all options to executeTasks service", async () => {
      const fullOptions = {
        tasksDir: "/path/to/tasks",
        parallel: true,
        maxConcurrency: 5,
        timeout: 30000,
      };
      const mockReport = {
        mode: "execution" as const,
        results: [],
        summary: { total: 3, completed: 3, failed: 0, skipped: 0 },
      };
      mockSkillCreatorService.executeTasks.mockResolvedValue(mockReport);

      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS)!;
      const result = await handler(createMockEvent(), fullOptions);

      expect(result).toEqual({ success: true, data: mockReport });
      expect(mockSkillCreatorService.executeTasks).toHaveBeenCalledWith(
        fullOptions,
      );
    });

    // SCIT-INT-11: 空白のみのvalidateリクエスト
    it("SCIT-INT-11: should reject whitespace-only validate skillDir", async () => {
      const handler = getHandler(IPC_CHANNELS.SKILL_CREATOR_VALIDATE)!;
      const result = await handler(createMockEvent(), {
        skillDir: "   \t\n  ",
      });

      expect(result).toEqual({
        success: false,
        error: "スキルディレクトリが指定されていません",
      });
    });
  });
});
