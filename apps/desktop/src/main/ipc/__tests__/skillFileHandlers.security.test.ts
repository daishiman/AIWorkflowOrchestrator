/**
 * Skill File IPC Handlers - Security Tests (TASK-9A-B Phase 4)
 *
 * 11 test cases covering:
 * - IPC送信元検証 (S-01 ~ S-03)
 * - パストラバーサル (S-04 ~ S-08)
 * - エラーサニタイズ (S-09 ~ S-11)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../../preload/channels";
import {
  SkillNotFoundError,
  PathTraversalError,
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

// Mock ipc-validator (controllable per test)
const mockValidateIpcSender = vi.fn().mockReturnValue({ valid: true });
const mockToIPCValidationError = vi.fn().mockImplementation((result) => ({
  success: false,
  error: {
    code: result.errorCode ?? "IPC_UNAUTHORIZED",
    message: result.errorMessage ?? "Unauthorized IPC call",
  },
}));

vi.mock("../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: (...args: unknown[]) => mockValidateIpcSender(...args),
  toIPCValidationError: (...args: unknown[]) =>
    mockToIPCValidationError(...args),
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

describe("skillFileHandlers - Security", () => {
  let mainWindow: ReturnType<typeof createMockMainWindow>;
  let mockEvent: IpcMainInvokeEvent;

  beforeEach(async () => {
    handlerMap.clear();
    vi.clearAllMocks();
    mockValidateIpcSender.mockReturnValue({ valid: true });
    mainWindow = createMockMainWindow();
    mockEvent = createMockEvent();

    const { registerSkillFileHandlers } = await import("../skillFileHandlers");
    registerSkillFileHandlers(
      mainWindow as never,
      mockSkillFileManager as never,
    );
  });

  afterEach(async () => {
    const { unregisterSkillFileHandlers } =
      await import("../skillFileHandlers");
    unregisterSkillFileHandlers();
    handlerMap.clear();
  });

  // =========================================================================
  // IPC送信元検証 (S-01 ~ S-03)
  // =========================================================================
  describe("IPC送信元検証", () => {
    // S-01
    it("validateIpcSender が { valid: false } を返す場合、toIPCValidationError の結果が throw される", async () => {
      const invalidResult = {
        valid: false,
        errorCode: "IPC_UNAUTHORIZED",
        errorMessage: "Unauthorized IPC call",
      };
      mockValidateIpcSender.mockReturnValue(invalidResult);

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
      await expect(
        handler!(mockEvent, {
          skillName: "test-skill",
          relativePath: "SKILL.md",
        }),
      ).rejects.toEqual({
        success: false,
        error: { code: "IPC_UNAUTHORIZED", message: "Unauthorized IPC call" },
      });
    });

    // S-02
    it("全6チャンネルで validateIpcSender が呼び出される", async () => {
      mockSkillFileManager.readFile.mockResolvedValue("content");
      mockSkillFileManager.writeFile.mockResolvedValue(undefined);
      mockSkillFileManager.createFile.mockResolvedValue(undefined);
      mockSkillFileManager.deleteFile.mockResolvedValue(undefined);
      mockSkillFileManager.listBackups.mockResolvedValue([]);
      mockSkillFileManager.restoreBackup.mockResolvedValue(undefined);

      const channels = [
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

      for (const { channel, args } of channels) {
        const handler = handlerMap.get(channel);
        await handler!(mockEvent, args);
      }

      expect(mockValidateIpcSender).toHaveBeenCalledTimes(6);
    });

    // S-03
    it("全6チャンネルで validateIpcSender に正しい引数が渡され getAllowedWindows が正しいウィンドウを返す", async () => {
      mockSkillFileManager.readFile.mockResolvedValue("content");
      mockSkillFileManager.writeFile.mockResolvedValue(undefined);
      mockSkillFileManager.createFile.mockResolvedValue(undefined);
      mockSkillFileManager.deleteFile.mockResolvedValue(undefined);
      mockSkillFileManager.listBackups.mockResolvedValue([]);
      mockSkillFileManager.restoreBackup.mockResolvedValue(undefined);

      const channels = [
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

      for (const { channel, args } of channels) {
        const handler = handlerMap.get(channel);
        await handler!(mockEvent, args);
      }

      // 全6チャンネルで getAllowedWindows が [mainWindow] を返すことを確認
      for (let i = 0; i < 6; i++) {
        const options = mockValidateIpcSender.mock.calls[i][2];
        expect(options.getAllowedWindows()).toEqual([mainWindow]);
      }
    });
  });

  // =========================================================================
  // パストラバーサル (S-04 ~ S-08)
  // =========================================================================
  describe("パストラバーサル", () => {
    // S-04
    it("skill:readFile - relativePath: '../etc/passwd' でパストラバーサルエラー", async () => {
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

    // S-05
    it("skill:writeFile - relativePath: '../../secret' でパストラバーサルエラー", async () => {
      mockSkillFileManager.writeFile.mockRejectedValue(
        new PathTraversalError("../../secret"),
      );
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_WRITE_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "../../secret",
        content: "malicious",
      });
      expect(result).toEqual({
        success: false,
        error: "Path traversal detected: ../../secret",
      });
    });

    // S-06
    it("skill:createFile - relativePath: '../../../tmp/x' でパストラバーサルエラー", async () => {
      mockSkillFileManager.createFile.mockRejectedValue(
        new PathTraversalError("../../../tmp/x"),
      );
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_CREATE_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "../../../tmp/x",
        content: "malicious",
      });
      expect(result).toEqual({
        success: false,
        error: "Path traversal detected: ../../../tmp/x",
      });
    });

    // S-07
    it("skill:deleteFile - relativePath: 'foo/../../../x' でパストラバーサルエラー", async () => {
      mockSkillFileManager.deleteFile.mockRejectedValue(
        new PathTraversalError("foo/../../../x"),
      );
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_DELETE_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "foo/../../../x",
      });
      expect(result).toEqual({
        success: false,
        error: "Path traversal detected: foo/../../../x",
      });
    });

    // S-08
    it("skill:restoreBackup - backupPath: '../../../etc/x' でパストラバーサルエラー", async () => {
      mockSkillFileManager.restoreBackup.mockRejectedValue(
        new PathTraversalError("../../../etc/x"),
      );
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_RESTORE_BACKUP);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        backupPath: "../../../etc/x",
      });
      expect(result).toEqual({
        success: false,
        error: "Path traversal detected: ../../../etc/x",
      });
    });
  });

  // =========================================================================
  // エラーサニタイズ (S-09 ~ S-11)
  // =========================================================================
  describe("エラーサニタイズ", () => {
    // S-09
    it("予期しない Error のスタックトレースが漏洩しない", async () => {
      const errorWithStack = new Error("Something went wrong");
      errorWithStack.stack =
        "Error: Something went wrong\n    at /home/user/app/src/service.ts:42:5";
      mockSkillFileManager.readFile.mockRejectedValue(errorWithStack);

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "SKILL.md",
      });

      expect(result.error).not.toContain("at /home");
      expect(result.error).not.toContain(".ts:");
      expect(result.error).toBe("Internal error");
    });

    // S-10
    it("予期しない Error のファイルパス情報が漏洩しない", async () => {
      mockSkillFileManager.readFile.mockRejectedValue(
        new Error("Failed to read /home/user/.aiworkflow/skills/secret/data"),
      );

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "SKILL.md",
      });

      expect(result.error).not.toContain("/home");
      expect(result.error).not.toContain("/user");
      expect(result.error).toBe("Internal error");
    });

    // S-11
    it("既知のエラー（SkillNotFoundError 等）はメッセージをそのまま返す", async () => {
      mockSkillFileManager.readFile.mockRejectedValue(
        new SkillNotFoundError("my-skill"),
      );

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
      const result = await handler!(mockEvent, {
        skillName: "my-skill",
        relativePath: "SKILL.md",
      });

      expect(result).toEqual({
        success: false,
        error: "Skill not found: my-skill",
      });
    });
  });

  // =========================================================================
  // セキュリティテスト拡充 (SE-01 ~ SE-03) — Phase 6
  // =========================================================================
  describe("セキュリティテスト拡充", () => {
    // SE-01
    it("skillName にパストラバーサル '../malicious-skill' を含む場合", async () => {
      mockSkillFileManager.readFile.mockRejectedValue(
        new SkillNotFoundError("../malicious-skill"),
      );
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_READ_FILE);
      const result = await handler!(mockEvent, {
        skillName: "../malicious-skill",
        relativePath: "SKILL.md",
      });
      expect(result).toEqual({
        success: false,
        error: "Skill not found: ../malicious-skill",
      });
    });

    // SE-02
    it("全6ハンドラーで validateIpcSender が失敗した場合に例外が送出される", async () => {
      const invalidResult = {
        valid: false,
        errorCode: "IPC_UNAUTHORIZED",
        errorMessage: "Window destroyed",
      };
      mockValidateIpcSender.mockReturnValue(invalidResult);

      const channels = [
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

      for (const { channel, args } of channels) {
        const handler = handlerMap.get(channel);
        await expect(handler!(mockEvent, args)).rejects.toEqual({
          success: false,
          error: {
            code: "IPC_UNAUTHORIZED",
            message: "Window destroyed",
          },
        });
      }
    });

    // SE-03
    it("content に <script> タグを含むファイル書き込みがそのまま保存される", async () => {
      const xssContent = '<script>alert("xss")</script>';
      mockSkillFileManager.writeFile.mockResolvedValue(undefined);
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_WRITE_FILE);
      const result = await handler!(mockEvent, {
        skillName: "test-skill",
        relativePath: "SKILL.md",
        content: xssContent,
      });
      expect(result).toEqual({ success: true });
      expect(mockSkillFileManager.writeFile).toHaveBeenCalledWith(
        "test-skill",
        "SKILL.md",
        xssContent,
      );
    });
  });
});
