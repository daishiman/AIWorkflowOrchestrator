/**
 * Skill File IPC Handlers - Unit Tests (TASK-9A-B Phase 4)
 *
 * 26 test cases covering:
 * - 正常系 (U-01 ~ U-07)
 * - バリデーションエラー (U-08 ~ U-15)
 * - SkillFileManager エラー (U-16 ~ U-23)
 * - 登録・解除 (U-24 ~ U-26)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../../preload/channels";
import {
  SkillNotFoundError,
  ReadonlySkillError,
  PathTraversalError,
  FileExistsError,
  FileNotFoundError,
} from "../../services/skill/errors";

// Handler map for testing
type IpcHandler = (...args: unknown[]) => unknown;
const handlerMap = new Map<string, IpcHandler>();

// Mock electron
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn((channel: string, handler: IpcHandler) => {
      handlerMap.set(channel, handler);
    }),
    removeHandler: vi.fn((channel: string) => {
      handlerMap.delete(channel);
    }),
  },
  BrowserWindow: {
    fromWebContents: vi.fn(),
  },
}));

// Mock ipc-validator
vi.mock("../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
  toIPCValidationError: vi.fn().mockImplementation((result) => ({
    success: false,
    error: {
      code: result.errorCode ?? "IPC_UNAUTHORIZED",
      message: result.errorMessage ?? "Unauthorized IPC call",
    },
  })),
}));

// Mock SkillFileManager
const mockSkillFileManager = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  createFile: vi.fn(),
  deleteFile: vi.fn(),
  listBackups: vi.fn(),
  restoreBackup: vi.fn(),
  isReadonly: vi.fn(),
};

// Mock SkillService
const mockSkillService = {
  scanAvailableSkills: vi.fn(),
};

// Factory functions
function createMockMainWindow() {
  return {
    id: 1,
    webContents: {
      id: 1,
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
    isDestroyed: () => false,
  };
}

function createMockEvent(webContentsId = 1) {
  return {
    sender: {
      id: webContentsId,
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
  } as unknown as IpcMainInvokeEvent;
}

describe("skillFileHandlers", () => {
  let mainWindow: ReturnType<typeof createMockMainWindow>;
  let mockEvent: IpcMainInvokeEvent;

  beforeEach(async () => {
    handlerMap.clear();
    vi.clearAllMocks();
    mainWindow = createMockMainWindow();
    mockEvent = createMockEvent();

    const { registerSkillFileHandlers } = await import("../skillFileHandlers");
    registerSkillFileHandlers(
      mainWindow as never,
      mockSkillFileManager as never,
      mockSkillService as never,
    );
  });

  afterEach(async () => {
    const { unregisterSkillFileHandlers } =
      await import("../skillFileHandlers");
    unregisterSkillFileHandlers();
    handlerMap.clear();
  });

  // =========================================================================
  // 正常系 (U-01 ~ U-07)
  // =========================================================================
  describe("正常系", () => {
    // U-01
    it("skill:readFile - 存在するスキルファイルを読み込む", async () => {
      mockSkillFileManager.readFile.mockResolvedValue("file content");
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "SKILL.md",
      });
      expect(result).toEqual({ success: true, data: "file content" });
      expect(mockSkillFileManager.readFile).toHaveBeenCalledWith(
        "test-skill",
        "SKILL.md",
      );
    });

    // U-02
    it("skill:writeFile - スキルファイルに内容を書き込む", async () => {
      mockSkillFileManager.writeFile.mockResolvedValue(undefined);
      mockSkillService.scanAvailableSkills.mockResolvedValue({ skills: [] });
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_WRITE_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "SKILL.md",
        content: "new content",
      });
      expect(result).toEqual({ success: true });
    });

    // U-03
    it("skill:writeFile - 書き込み後に scanAvailableSkills が呼ばれる", async () => {
      mockSkillFileManager.writeFile.mockResolvedValue(undefined);
      mockSkillService.scanAvailableSkills.mockResolvedValue({ skills: [] });
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_WRITE_FILE);
      await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "SKILL.md",
        content: "new content",
      });
      expect(mockSkillService.scanAvailableSkills).toHaveBeenCalledTimes(1);
    });

    // U-04
    it("skill:createFile - 新規ファイルを作成する", async () => {
      mockSkillFileManager.createFile.mockResolvedValue(undefined);
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATE_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "new-file.md",
        content: "content",
      });
      expect(result).toEqual({ success: true });
    });

    // U-05
    it("skill:deleteFile - ファイルを削除する", async () => {
      mockSkillFileManager.deleteFile.mockResolvedValue(undefined);
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DELETE_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "target.md",
      });
      expect(result).toEqual({ success: true });
    });

    // U-06
    it("skill:listBackups - バックアップ一覧を取得する", async () => {
      const backups = [
        {
          filename: "SKILL.md.backup.1700000000000",
          relativePath: "SKILL.md.backup.1700000000000",
          originalPath: "SKILL.md",
          type: "backup" as const,
          timestamp: 1700000000000,
          createdAt: new Date(1700000000000),
        },
      ];
      mockSkillFileManager.listBackups.mockResolvedValue(backups);
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_LIST_BACKUPS);
      const result = await handler!(mockEvent, { skillName: "test-skill" });
      expect(result).toEqual({ success: true, data: backups });
    });

    // U-07
    it("skill:restoreBackup - バックアップからファイルを復元する", async () => {
      mockSkillFileManager.restoreBackup.mockResolvedValue(undefined);
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_RESTORE_BACKUP);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        backupPath: "SKILL.md.backup.1700000000000",
      });
      expect(result).toEqual({ success: true });
    });
  });

  // =========================================================================
  // バリデーションエラー (U-08 ~ U-15)
  // =========================================================================
  describe("バリデーションエラー", () => {
    // U-08
    it("skill:readFile - skillName が空文字列", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
      const result = await handler!(mockEvent, {
        skillName: "",
        relativePath: "SKILL.md",
      });
      expect(result).toEqual({
        success: false,
        error: "skillName must be a non-empty string",
      });
    });

    // U-09
    it("skill:readFile - relativePath が空文字列", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "",
      });
      expect(result).toEqual({
        success: false,
        error: "relativePath must be a non-empty string",
      });
    });

    // U-10
    it("skill:readFile - skillName が文字列以外（数値）", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
      const result = await handler!(mockEvent, {
        skillName: 123,
        relativePath: "SKILL.md",
      });
      expect(result).toEqual({
        success: false,
        error: "skillName must be a non-empty string",
      });
    });

    // U-11
    it("skill:writeFile - content が文字列以外（undefined）", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_WRITE_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "SKILL.md",
      });
      expect(result).toEqual({
        success: false,
        error: "content must be a string",
      });
    });

    // U-12
    it("skill:createFile - skillName・relativePath・content 全て未指定", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATE_FILE);
      const result = await handler!(mockEvent, {});
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    // U-13
    it("skill:deleteFile - relativePath が未指定", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DELETE_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
      });
      expect(result).toEqual({
        success: false,
        error: "relativePath must be a non-empty string",
      });
    });

    // U-14
    it("skill:listBackups - skillName が未指定", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_LIST_BACKUPS);
      const result = await handler!(mockEvent, {});
      expect(result).toEqual({
        success: false,
        error: "skillName must be a non-empty string",
      });
    });

    // U-15
    it("skill:restoreBackup - backupPath が空文字列", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_RESTORE_BACKUP);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        backupPath: "",
      });
      expect(result).toEqual({
        success: false,
        error: "backupPath must be a non-empty string",
      });
    });
  });

  // =========================================================================
  // SkillFileManager エラー (U-16 ~ U-23)
  // =========================================================================
  describe("SkillFileManager エラー", () => {
    // U-16
    it("skill:readFile - SkillNotFoundError", async () => {
      mockSkillFileManager.readFile.mockRejectedValue(
        new SkillNotFoundError("test-skill"),
      );
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "SKILL.md",
      });
      expect(result).toEqual({
        success: false,
        error: "Skill not found: test-skill",
      });
    });

    // U-17
    it("skill:readFile - FileNotFoundError", async () => {
      mockSkillFileManager.readFile.mockRejectedValue(
        new FileNotFoundError("SKILL.md"),
      );
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "SKILL.md",
      });
      expect(result).toEqual({
        success: false,
        error: "File not found: SKILL.md",
      });
    });

    // U-18
    it("skill:readFile - PathTraversalError", async () => {
      mockSkillFileManager.readFile.mockRejectedValue(
        new PathTraversalError("../etc/passwd"),
      );
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "../etc/passwd",
      });
      expect(result).toEqual({
        success: false,
        error: "Path traversal detected: ../etc/passwd",
      });
    });

    // U-19
    it("skill:writeFile - ReadonlySkillError", async () => {
      mockSkillFileManager.writeFile.mockRejectedValue(
        new ReadonlySkillError("readonly-skill"),
      );
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_WRITE_FILE);
      const result = await handler!(mockEvent, {
        skillName: "readonly-skill",
        relativePath: "SKILL.md",
        content: "new content",
      });
      expect(result).toEqual({
        success: false,
        error: "Cannot modify readonly skill: readonly-skill",
      });
    });

    // U-20
    it("skill:createFile - FileExistsError", async () => {
      mockSkillFileManager.createFile.mockRejectedValue(
        new FileExistsError("SKILL.md"),
      );
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATE_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "SKILL.md",
        content: "content",
      });
      expect(result).toEqual({
        success: false,
        error: "File already exists: SKILL.md",
      });
    });

    // U-21
    it("skill:deleteFile - FileNotFoundError", async () => {
      mockSkillFileManager.deleteFile.mockRejectedValue(
        new FileNotFoundError("target.md"),
      );
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DELETE_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "target.md",
      });
      expect(result).toEqual({
        success: false,
        error: "File not found: target.md",
      });
    });

    // U-22
    it("skill:restoreBackup - FileNotFoundError", async () => {
      mockSkillFileManager.restoreBackup.mockRejectedValue(
        new FileNotFoundError("backup.md.backup.1700000"),
      );
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_RESTORE_BACKUP);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        backupPath: "backup.md.backup.1700000",
      });
      expect(result).toEqual({
        success: false,
        error: "File not found: backup.md.backup.1700000",
      });
    });

    // U-23
    it("予期しない Error は Internal error を返す", async () => {
      mockSkillFileManager.readFile.mockRejectedValue(
        new Error("Unexpected internal error with /path/to/file"),
      );
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "SKILL.md",
      });
      expect(result).toEqual({
        success: false,
        error: "Internal error",
      });
    });
  });

  // =========================================================================
  // 登録・解除 (U-24 ~ U-26)
  // =========================================================================
  describe("登録・解除", () => {
    // U-24
    it("registerSkillFileHandlers で6チャンネル全てが登録される", () => {
      expect(handlerMap.size).toBe(6);
    });

    // U-25
    it("unregisterSkillFileHandlers で6チャンネル全てが解除される", async () => {
      const { unregisterSkillFileHandlers } =
        await import("../skillFileHandlers");
      unregisterSkillFileHandlers();
      expect(handlerMap.size).toBe(0);
    });

    // U-26
    it("登録されるチャンネル名が全て IPC_CHANNELS 定数を使用", () => {
      const expectedChannels = [
        IPC_CHANNELS.SKILL_READ_FILE,
        IPC_CHANNELS.SKILL_WRITE_FILE,
        IPC_CHANNELS.SKILL_CREATE_FILE,
        IPC_CHANNELS.SKILL_DELETE_FILE,
        IPC_CHANNELS.SKILL_LIST_BACKUPS,
        IPC_CHANNELS.SKILL_RESTORE_BACKUP,
      ];
      for (const channel of expectedChannels) {
        expect(handlerMap.has(channel)).toBe(true);
      }
    });
  });

  // =========================================================================
  // 境界値テスト (B-01 ~ B-07) — Phase 6
  // =========================================================================
  describe("境界値テスト", () => {
    // B-01
    it("skill:readFile - skillName がスペースのみ", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
      const result = await handler!(mockEvent, {
        skillName: "   ",
        relativePath: "SKILL.md",
      });
      expect(result).toEqual({
        success: false,
        error: "skillName must be a non-empty string",
      });
    });

    // B-02
    it("skill:readFile - relativePath がスペースのみ", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "  ",
      });
      expect(result).toEqual({
        success: false,
        error: "relativePath must be a non-empty string",
      });
    });

    // B-03
    it("skill:writeFile - content が空文字列（有効な入力）", async () => {
      mockSkillFileManager.writeFile.mockResolvedValue(undefined);
      mockSkillService.scanAvailableSkills.mockResolvedValue({ skills: [] });
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_WRITE_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "SKILL.md",
        content: "",
      });
      expect(result).toEqual({ success: true });
    });

    // B-04
    it("skill:createFile - relativePath に深いネスト", async () => {
      mockSkillFileManager.createFile.mockResolvedValue(undefined);
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATE_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "a/b/c/d/e/f/g/file.md",
        content: "deep nested content",
      });
      expect(result).toEqual({ success: true });
    });

    // B-05
    it("skill:listBackups - バックアップが0件のスキル", async () => {
      mockSkillFileManager.listBackups.mockResolvedValue([]);
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_LIST_BACKUPS);
      const result = await handler!(mockEvent, { skillName: "empty-skill" });
      expect(result).toEqual({ success: true, data: [] });
    });

    // B-06
    it("skill:readFile - relativePath に日本語パス", async () => {
      mockSkillFileManager.readFile.mockResolvedValue("日本語コンテンツ");
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "参照/ファイル.md",
      });
      expect(result).toEqual({ success: true, data: "日本語コンテンツ" });
    });

    // B-07
    it("skill:writeFile - skillName にハイフン・アンダースコア", async () => {
      mockSkillFileManager.writeFile.mockResolvedValue(undefined);
      mockSkillService.scanAvailableSkills.mockResolvedValue({ skills: [] });
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_WRITE_FILE);
      const result = await handler!(mockEvent, {
        skillName: "my-skill_v2",
        relativePath: "SKILL.md",
        content: "content",
      });
      expect(result).toEqual({ success: true });
    });
  });

  // =========================================================================
  // エッジケーステスト (E-01 ~ E-05) — Phase 6
  // =========================================================================
  describe("エッジケーステスト", () => {
    // E-01
    it("skill:writeFile - 大容量コンテンツ（1MB以上）", async () => {
      mockSkillFileManager.writeFile.mockResolvedValue(undefined);
      mockSkillService.scanAvailableSkills.mockResolvedValue({ skills: [] });
      const largeContent = "x".repeat(1024 * 1024 + 1); // 1MB + 1 byte
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_WRITE_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "SKILL.md",
        content: largeContent,
      });
      expect(result).toEqual({ success: true });
    });

    // E-02
    it("skill:readFile - 引数が null", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
      const result = await handler!(mockEvent, null);
      expect(result).toEqual({
        success: false,
        error: "skillName must be a non-empty string",
      });
    });

    // E-03
    it("skill:writeFile - 引数オブジェクトが undefined", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_WRITE_FILE);
      const result = await handler!(mockEvent, undefined);
      expect(result).toEqual({
        success: false,
        error: "skillName must be a non-empty string",
      });
    });

    // E-04
    it("skill:restoreBackup - backupPath に .backup. 接尾辞を含む正常パス", async () => {
      mockSkillFileManager.restoreBackup.mockResolvedValue(undefined);
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_RESTORE_BACKUP);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        backupPath: "SKILL.md.backup.1700000000000",
      });
      expect(result).toEqual({ success: true });
    });

    // E-05
    it("全チャンネル - SkillFileManager メソッドが reject する Promise", async () => {
      const rejectError = new Error("Unexpected disk error");
      mockSkillFileManager.readFile.mockRejectedValue(rejectError);
      mockSkillFileManager.writeFile.mockRejectedValue(rejectError);
      mockSkillFileManager.createFile.mockRejectedValue(rejectError);
      mockSkillFileManager.deleteFile.mockRejectedValue(rejectError);
      mockSkillFileManager.listBackups.mockRejectedValue(rejectError);
      mockSkillFileManager.restoreBackup.mockRejectedValue(rejectError);

      const testCases = [
        {
          channel: IPC_CHANNELS.SKILL_READ_FILE,
          args: { skillName: "s", relativePath: "p" },
        },
        {
          channel: IPC_CHANNELS.SKILL_WRITE_FILE,
          args: { skillName: "s", relativePath: "p", content: "c" },
        },
        {
          channel: IPC_CHANNELS.SKILL_CREATE_FILE,
          args: { skillName: "s", relativePath: "p", content: "c" },
        },
        {
          channel: IPC_CHANNELS.SKILL_DELETE_FILE,
          args: { skillName: "s", relativePath: "p" },
        },
        {
          channel: IPC_CHANNELS.SKILL_LIST_BACKUPS,
          args: { skillName: "s" },
        },
        {
          channel: IPC_CHANNELS.SKILL_RESTORE_BACKUP,
          args: { skillName: "s", backupPath: "b" },
        },
      ];

      for (const { channel, args } of testCases) {
        const handler = handlerMap.get(channel);
        const result = await handler!(mockEvent, args);
        expect(result).toEqual({ success: false, error: "Internal error" });
      }
    });
  });
});
