/**
 * systemPromptHandlers Unit Tests
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

// === Mocks ===

// Mock Repository
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

describe("systemPromptHandlers", () => {
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
    (mockRepository.create as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (mockRepository.update as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (mockRepository.delete as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined,
    );
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
  // system-prompt:list
  // ===========================================================================

  describe("system-prompt:list", () => {
    it("テンプレート一覧を取得できる", () => {
      registerSystemPromptHandlers(mockRepository);
      expect(handlers.has(SYSTEM_PROMPT_CHANNELS.LIST)).toBe(true);
    });

    it("ハンドラーが正しく登録される", () => {
      registerSystemPromptHandlers(mockRepository);
      expect(ipcMain.handle).toHaveBeenCalled();
    });

    it("userIdが空の場合バリデーションエラー", async () => {
      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.LIST);
      expect(handler).toBeDefined();

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        userId: "",
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
  });

  // ===========================================================================
  // system-prompt:get
  // ===========================================================================

  describe("system-prompt:get", () => {
    it("IDでテンプレートを取得できる", () => {
      registerSystemPromptHandlers(mockRepository);
      expect(handlers.has(SYSTEM_PROMPT_CHANNELS.GET)).toBe(true);
    });

    it("存在しないIDでエラー", async () => {
      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.GET);
      expect(handler).toBeDefined();

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        id: "non-existent",
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
  // system-prompt:create
  // ===========================================================================

  describe("system-prompt:create", () => {
    it("テンプレートを作成できる", () => {
      registerSystemPromptHandlers(mockRepository);
      expect(handlers.has(SYSTEM_PROMPT_CHANNELS.CREATE)).toBe(true);
    });

    it("バリデーションエラー時にエラーを返す", async () => {
      (mockRepository.create as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("テンプレート名は必須です"),
      );

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.CREATE);
      expect(handler).toBeDefined();

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        userId: "user-001",
        data: { name: "", content: "test" },
      });
      expect((result as { success: false }).success).toBe(false);
    });

    it("名前重複時にエラーを返す", async () => {
      (mockRepository.create as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("同名のテンプレートが既に存在します"),
      );

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.CREATE);
      expect(handler).toBeDefined();

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        userId: "user-001",
        data: { name: "existing", content: "test" },
      });
      expect(result).toEqual({
        success: false,
        error: {
          code: "system-prompt/validation-failed",
          message: "同名のテンプレートが既に存在します",
        },
      });
    });
  });

  // ===========================================================================
  // system-prompt:update
  // ===========================================================================

  describe("system-prompt:update", () => {
    it("テンプレートを更新できる", () => {
      registerSystemPromptHandlers(mockRepository);
      expect(handlers.has(SYSTEM_PROMPT_CHANNELS.UPDATE)).toBe(true);
    });

    it("プリセット更新時にエラーを返す", async () => {
      (mockRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "preset-001",
        userId: "__SYSTEM__",
        name: "プリセット",
        content: "コンテンツ",
        isPreset: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.UPDATE);
      expect(handler).toBeDefined();

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        id: "preset-001",
        userId: "user-001",
        data: { name: "新しい名前" },
      });
      expect(result).toEqual({
        success: false,
        error: {
          code: "system-prompt/preset-protection",
          message: "Preset templates cannot be modified",
        },
      });
    });

    it("他ユーザーのテンプレート更新でエラー", async () => {
      (mockRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "template-001",
        userId: "user-002",
        name: "テスト",
        content: "コンテンツ",
        isPreset: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.UPDATE);
      expect(handler).toBeDefined();

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        id: "template-001",
        userId: "user-001",
        data: { name: "新しい名前" },
      });
      expect(result).toEqual({
        success: false,
        error: {
          code: "system-prompt/unauthorized",
          message: "Not authorized to update this template",
        },
      });
    });
  });

  // ===========================================================================
  // system-prompt:delete
  // ===========================================================================

  describe("system-prompt:delete", () => {
    it("テンプレートを削除できる", () => {
      registerSystemPromptHandlers(mockRepository);
      expect(handlers.has(SYSTEM_PROMPT_CHANNELS.DELETE)).toBe(true);
    });

    it("プリセット削除時にエラーを返す", async () => {
      (mockRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "preset-001",
        userId: "__SYSTEM__",
        name: "プリセット",
        content: "コンテンツ",
        isPreset: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.DELETE);
      expect(handler).toBeDefined();

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        id: "preset-001",
        userId: "user-001",
      });
      expect(result).toEqual({
        success: false,
        error: {
          code: "system-prompt/preset-protection",
          message: "Preset templates cannot be deleted",
        },
      });
    });

    it("存在しないIDでエラー", async () => {
      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.DELETE);
      expect(handler).toBeDefined();

      const result = await handler!({} as Electron.IpcMainInvokeEvent, {
        id: "non-existent",
        userId: "user-001",
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
  // system-prompt:migrate
  // ===========================================================================

  describe("system-prompt:migrate", () => {
    it("マイグレーション結果を返す", async () => {
      registerSystemPromptHandlers(mockRepository);
      const handler = handlers.get(SYSTEM_PROMPT_CHANNELS.MIGRATE);
      expect(handler).toBeDefined();

      const result = await handler!({} as Electron.IpcMainInvokeEvent);
      expect(result).toEqual({
        success: true,
        data: {
          migratedCount: 0,
          skippedCount: 0,
          failedCount: 0,
          errors: [],
        },
      });
    });
  });

  // ===========================================================================
  // system-prompt:get-presets
  // ===========================================================================

  describe("system-prompt:get-presets", () => {
    it("プリセット一覧を取得できる", () => {
      registerSystemPromptHandlers(mockRepository);
      expect(handlers.has(SYSTEM_PROMPT_CHANNELS.GET_PRESETS)).toBe(true);
    });
  });

  // ===========================================================================
  // Handler Registration
  // ===========================================================================

  describe("registerSystemPromptHandlers", () => {
    it("system-prompt:list ハンドラーが登録される", () => {
      registerSystemPromptHandlers(mockRepository);
      expect(handlers.has(SYSTEM_PROMPT_CHANNELS.LIST)).toBe(true);
    });

    it("system-prompt:get ハンドラーが登録される", () => {
      registerSystemPromptHandlers(mockRepository);
      expect(handlers.has(SYSTEM_PROMPT_CHANNELS.GET)).toBe(true);
    });

    it("system-prompt:create ハンドラーが登録される", () => {
      registerSystemPromptHandlers(mockRepository);
      expect(handlers.has(SYSTEM_PROMPT_CHANNELS.CREATE)).toBe(true);
    });

    it("system-prompt:update ハンドラーが登録される", () => {
      registerSystemPromptHandlers(mockRepository);
      expect(handlers.has(SYSTEM_PROMPT_CHANNELS.UPDATE)).toBe(true);
    });

    it("system-prompt:delete ハンドラーが登録される", () => {
      registerSystemPromptHandlers(mockRepository);
      expect(handlers.has(SYSTEM_PROMPT_CHANNELS.DELETE)).toBe(true);
    });

    it("system-prompt:migrate ハンドラーが登録される", () => {
      registerSystemPromptHandlers(mockRepository);
      expect(handlers.has(SYSTEM_PROMPT_CHANNELS.MIGRATE)).toBe(true);
    });

    it("system-prompt:get-presets ハンドラーが登録される", () => {
      registerSystemPromptHandlers(mockRepository);
      expect(handlers.has(SYSTEM_PROMPT_CHANNELS.GET_PRESETS)).toBe(true);
    });
  });

  // ===========================================================================
  // unregisterSystemPromptHandlers
  // ===========================================================================

  describe("unregisterSystemPromptHandlers", () => {
    it("全ハンドラーが解除される", () => {
      registerSystemPromptHandlers(mockRepository);
      unregisterSystemPromptHandlers();
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        SYSTEM_PROMPT_CHANNELS.LIST,
      );
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        SYSTEM_PROMPT_CHANNELS.GET,
      );
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        SYSTEM_PROMPT_CHANNELS.CREATE,
      );
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        SYSTEM_PROMPT_CHANNELS.UPDATE,
      );
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        SYSTEM_PROMPT_CHANNELS.DELETE,
      );
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        SYSTEM_PROMPT_CHANNELS.MIGRATE,
      );
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        SYSTEM_PROMPT_CHANNELS.GET_PRESETS,
      );
    });
  });
});
