/**
 * systemPromptHandlers Edge Case Tests
 *
 * Phase 6: テスト拡充 - 成功パス、データ検証、エラー伝播のエッジケース
 *
 * @see docs/30-workflows/system-prompt-db/outputs/phase-2/ipc-handler-design.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock electron modules before imports
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  BrowserWindow: {
    fromWebContents: vi.fn().mockReturnValue({ id: 1 }),
  },
}));

import { ipcMain } from "electron";
import {
  registerSystemPromptHandlers,
  unregisterSystemPromptHandlers,
  SYSTEM_PROMPT_CHANNELS,
} from "../systemPromptHandlers.js";
import type { ISystemPromptRepository } from "@repo/shared/repositories";
import type { PromptTemplate } from "@repo/shared/repositories";

// === Mocks ===

const createMockTemplate = (
  overrides: Partial<PromptTemplate> = {},
): PromptTemplate => ({
  id: "template-001",
  userId: "user-001",
  name: "テストテンプレート",
  content: "テストコンテンツ",
  isPreset: false,
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
  ...overrides,
});

const createMockRepository = (): ISystemPromptRepository => ({
  findAllByUserId: vi.fn(),
  findById: vi.fn(),
  findAllPresets: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  isPreset: vi.fn(),
  existsByUserIdAndName: vi.fn(),
  exists: vi.fn(),
});

describe("systemPromptHandlers Edge Cases", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;
  let mockRepository: ReturnType<typeof createMockRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = new Map();
    mockRepository = createMockRepository();

    // Capture registered handlers
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    // Default mock responses
    (
      mockRepository.findAllByUserId as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);
    (mockRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
      null,
    );
    (
      mockRepository.findAllPresets as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);
    (mockRepository.isPreset as ReturnType<typeof vi.fn>).mockResolvedValue(
      false,
    );
    (
      mockRepository.existsByUserIdAndName as ReturnType<typeof vi.fn>
    ).mockResolvedValue(false);
    (mockRepository.exists as ReturnType<typeof vi.fn>).mockResolvedValue(true);
  });

  afterEach(() => {
    unregisterSystemPromptHandlers();
    vi.resetModules();
  });

  // ===========================================================================
  // Success Path Tests - system-prompt:list
  // ===========================================================================

  describe("system-prompt:list 成功パス", () => {
    it("テンプレート一覧を正常に取得できる", async () => {
      const templates = [
        createMockTemplate({ id: "template-001", name: "テンプレート1" }),
        createMockTemplate({ id: "template-002", name: "テンプレート2" }),
      ];
      (
        mockRepository.findAllByUserId as ReturnType<typeof vi.fn>
      ).mockResolvedValue(templates);

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.LIST);

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        userId: "user-001",
        options: {},
      });

      expect(result).toEqual({
        success: true,
        data: templates,
      });
    });

    it("オプション付きでフィルタリングできる", async () => {
      (
        mockRepository.findAllByUserId as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.LIST);

      await handler!({} as Electron.IpcMainInvokeEvent, {
        userId: "user-001",
        options: {
          includePresets: true,
          limit: 10,
          offset: 0,
        },
      });

      expect(mockRepository.findAllByUserId).toHaveBeenCalledWith(
        "user-001",
        expect.objectContaining({
          includePresets: true,
          limit: 10,
          offset: 0,
        }),
      );
    });
  });

  // ===========================================================================
  // Success Path Tests - system-prompt:get
  // ===========================================================================

  describe("system-prompt:get 成功パス", () => {
    it("存在するテンプレートを取得できる", async () => {
      const template = createMockTemplate();
      (mockRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
        template,
      );

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.GET);

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        id: "template-001",
      });

      expect(result).toEqual({
        success: true,
        data: template,
      });
    });

    it("プリセットテンプレートも取得できる", async () => {
      const preset = createMockTemplate({
        id: "preset-001",
        userId: "__SYSTEM__",
        isPreset: true,
      });
      (mockRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
        preset,
      );

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.GET);

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        id: "preset-001",
      });

      expect(result).toEqual({
        success: true,
        data: preset,
      });
    });
  });

  // ===========================================================================
  // Success Path Tests - system-prompt:create
  // ===========================================================================

  describe("system-prompt:create 成功パス", () => {
    it("テンプレートを正常に作成できる", async () => {
      const newTemplate = createMockTemplate();
      (mockRepository.create as ReturnType<typeof vi.fn>).mockResolvedValue(
        newTemplate,
      );

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.CREATE);

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        userId: "user-001",
        data: { name: "新規テンプレート", content: "コンテンツ" },
      });

      expect(result).toEqual({
        success: true,
        data: newTemplate,
      });
    });

    it("50文字の名前で作成できる", async () => {
      const longName = "あ".repeat(50);
      const template = createMockTemplate({ name: longName });
      (mockRepository.create as ReturnType<typeof vi.fn>).mockResolvedValue(
        template,
      );

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.CREATE);

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        userId: "user-001",
        data: { name: longName, content: "コンテンツ" },
      });

      expect((result as { success: true }).success).toBe(true);
    });
  });

  // ===========================================================================
  // Success Path Tests - system-prompt:update
  // ===========================================================================

  describe("system-prompt:update 成功パス", () => {
    it("テンプレートを正常に更新できる", async () => {
      const existingTemplate = createMockTemplate();
      const updatedTemplate = createMockTemplate({ name: "更新後の名前" });

      (mockRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
        existingTemplate,
      );
      (mockRepository.update as ReturnType<typeof vi.fn>).mockResolvedValue(
        updatedTemplate,
      );

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.UPDATE);

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        id: "template-001",
        userId: "user-001",
        data: { name: "更新後の名前" },
      });

      expect(result).toEqual({
        success: true,
        data: updatedTemplate,
      });
    });

    it("コンテンツのみ更新できる", async () => {
      const existingTemplate = createMockTemplate();
      const updatedTemplate = createMockTemplate({
        content: "新しいコンテンツ",
      });

      (mockRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
        existingTemplate,
      );
      (mockRepository.update as ReturnType<typeof vi.fn>).mockResolvedValue(
        updatedTemplate,
      );

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.UPDATE);

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        id: "template-001",
        userId: "user-001",
        data: { content: "新しいコンテンツ" },
      });

      expect(result).toEqual({
        success: true,
        data: updatedTemplate,
      });
    });
  });

  // ===========================================================================
  // Success Path Tests - system-prompt:delete
  // ===========================================================================

  describe("system-prompt:delete 成功パス", () => {
    it("テンプレートを正常に削除できる", async () => {
      const template = createMockTemplate();
      (mockRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
        template,
      );
      (mockRepository.delete as ReturnType<typeof vi.fn>).mockResolvedValue(
        undefined,
      );

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.DELETE);

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        id: "template-001",
        userId: "user-001",
      });

      expect(result).toEqual({
        success: true,
        data: undefined,
      });
      expect(mockRepository.delete).toHaveBeenCalledWith("template-001");
    });
  });

  // ===========================================================================
  // Success Path Tests - system-prompt:get-presets
  // ===========================================================================

  describe("system-prompt:get-presets 成功パス", () => {
    it("プリセット一覧を正常に取得できる", async () => {
      const presets = [
        createMockTemplate({
          id: "preset-001",
          name: "プリセット1",
          isPreset: true,
        }),
        createMockTemplate({
          id: "preset-002",
          name: "プリセット2",
          isPreset: true,
        }),
      ];
      (
        mockRepository.findAllPresets as ReturnType<typeof vi.fn>
      ).mockResolvedValue(presets);

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.GET_PRESETS);

      const result = await handler!({} as Electron.IpcMainInvokeEvent);

      expect(result).toEqual({
        success: true,
        data: presets,
      });
    });

    it("プリセットがない場合は空配列を返す", async () => {
      (
        mockRepository.findAllPresets as ReturnType<typeof vi.fn>
      ).mockResolvedValue([]);

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.GET_PRESETS);

      const result = await handler!({} as Electron.IpcMainInvokeEvent);

      expect(result).toEqual({
        success: true,
        data: [],
      });
    });
  });

  // ===========================================================================
  // Validation Edge Cases
  // ===========================================================================

  describe("バリデーションエッジケース", () => {
    it("userIdがundefinedの場合エラー", async () => {
      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.LIST);

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        userId: undefined,
        options: {},
      });

      expect(result).toEqual({
        success: false,
        error: {
          code: "system-prompt/validation-failed",
          message: "userId is required",
        },
      });
    });

    it("リクエストデータがundefinedの場合エラー", async () => {
      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.GET);

      // Handler throws when undefined is passed (destructuring fails)
      await expect(
        handler!({} as Electron.IpcMainInvokeEvent, undefined),
      ).rejects.toThrow();
    });

    it("idがnullの場合エラー", async () => {
      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.GET);

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        id: null,
      });

      expect((result as { success: false }).success).toBe(false);
    });
  });

  // ===========================================================================
  // Repository Error Propagation
  // ===========================================================================

  describe("Repositoryエラー伝播", () => {
    it("findAllByUserIdのエラーが伝播する", async () => {
      (
        mockRepository.findAllByUserId as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error("Database connection failed"));

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.LIST);

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        userId: "user-001",
        options: {},
      });

      expect(result).toEqual({
        success: false,
        error: {
          code: "system-prompt/list-failed",
          message: "Database connection failed",
        },
      });
    });

    it("updateのエラーが伝播する", async () => {
      const template = createMockTemplate();
      (mockRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
        template,
      );
      (mockRepository.update as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Constraint violation"),
      );

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.UPDATE);

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        id: "template-001",
        userId: "user-001",
        data: { name: "新しい名前" },
      });

      expect((result as { success: false }).success).toBe(false);
    });

    it("deleteのエラーが伝播する", async () => {
      const template = createMockTemplate();
      (mockRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
        template,
      );
      (mockRepository.delete as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Foreign key constraint"),
      );

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.DELETE);

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        id: "template-001",
        userId: "user-001",
      });

      expect((result as { success: false }).success).toBe(false);
    });
  });

  // ===========================================================================
  // Authorization Edge Cases
  // ===========================================================================

  describe("認可エッジケース", () => {
    it("削除時に他ユーザーのテンプレートを削除できない", async () => {
      const template = createMockTemplate({ userId: "user-002" });
      (mockRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
        template,
      );

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.DELETE);

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        id: "template-001",
        userId: "user-001",
      });

      expect(result).toEqual({
        success: false,
        error: {
          code: "system-prompt/unauthorized",
          message: "Not authorized to delete this template",
        },
      });
    });

    it("更新時に存在しないテンプレートでエラー", async () => {
      (mockRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.UPDATE);

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        id: "non-existent",
        userId: "user-001",
        data: { name: "新しい名前" },
      });

      expect(result).toEqual({
        success: false,
        error: {
          code: "system-prompt/not-found",
          message: "Template not found",
        },
      });
    });
  });

  // ===========================================================================
  // Data Type Edge Cases
  // ===========================================================================

  describe("データ型エッジケース", () => {
    it("Date型が正しくシリアライズされる", async () => {
      const template = createMockTemplate({
        createdAt: new Date("2024-01-15T10:30:00Z"),
        updatedAt: new Date("2024-01-16T15:45:00Z"),
      });
      (mockRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
        template,
      );

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.GET);

      const result = (await handler!({} as Electron.IpcMainInvokeEvent, {
        id: "template-001",
      })) as { success: true; data: PromptTemplate };

      expect(result.data.createdAt).toEqual(new Date("2024-01-15T10:30:00Z"));
      expect(result.data.updatedAt).toEqual(new Date("2024-01-16T15:45:00Z"));
    });

    it("booleanのisPresetが正しく処理される", async () => {
      const template = createMockTemplate({ isPreset: true });
      (mockRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
        template,
      );

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.GET);

      const result = (await handler!({} as Electron.IpcMainInvokeEvent, {
        id: "template-001",
      })) as { success: true; data: PromptTemplate };

      expect(result.data.isPreset).toBe(true);
      expect(typeof result.data.isPreset).toBe("boolean");
    });
  });

  // ===========================================================================
  // Concurrent Handler Registration
  // ===========================================================================

  describe("ハンドラー登録の安全性", () => {
    it("二重登録しても正常動作する", () => {
      registerSystemPromptHandlers(mockRepository);
      registerSystemPromptHandlers(mockRepository);

      expect(ipcMain.handle).toHaveBeenCalledTimes(14); // 7 channels x 2 registrations
    });

    it("登録解除後に再登録できる", () => {
      registerSystemPromptHandlers(mockRepository);
      unregisterSystemPromptHandlers();
      registerSystemPromptHandlers(mockRepository);

      expect(handlers.has(SYSTEM_PROMPT_CHANNELS.LIST)).toBe(true);
    });
  });
});
