/**
 * SlideSettingsHandlers Error Tests
 *
 * IPC通信の異常系・エラーパスのテスト
 *
 * @module @repo/desktop/main/ipc/__tests__/slideSettingsHandlers.error.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";
import type { IpcMainInvokeEvent } from "electron";

// === Type Definitions ===

interface SlideSettings {
  outputDirectory: string;
  autoCreateDirectory: boolean;
  defaultTheme: "kanagawa";
  schemaVersion: number;
}

// === Mocks ===

const {
  mockDialog,
  mockSlideSettingsStore,
  mockValidateDirectoryForSettings,
  mockExpandHomePath,
  mockValidateIpcSender,
  mockToIPCValidationError,
} = vi.hoisted(() => ({
  mockDialog: {
    showOpenDialog: vi.fn(),
  },
  mockSlideSettingsStore: {
    store: {
      outputDirectory: "~/Documents/Slides",
      autoCreateDirectory: true,
      defaultTheme: "kanagawa" as const,
      schemaVersion: 1,
    } as SlideSettings,
    getDirectory: vi.fn(),
    setDirectory: vi.fn(),
    validateDirectory: vi.fn(),
    getAutoCreateDirectory: vi.fn(),
    getSettings: vi.fn(),
    reset: vi.fn(),
  },
  mockValidateDirectoryForSettings: vi.fn(),
  mockExpandHomePath: vi.fn((p: string) => p),
  mockValidateIpcSender: vi.fn(),
  mockToIPCValidationError: vi.fn(),
}));

// Mock modules
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  dialog: mockDialog,
  BrowserWindow: vi.fn(),
}));

vi.mock("../../settings/slideSettingsStore", () => ({
  SlideSettingsStore: vi.fn().mockImplementation(() => mockSlideSettingsStore),
  getSlideSettingsStore: vi.fn(() => mockSlideSettingsStore),
  validateDirectoryForSettings: mockValidateDirectoryForSettings,
  expandHomePath: mockExpandHomePath,
}));

vi.mock("../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: mockValidateIpcSender,
  toIPCValidationError: mockToIPCValidationError,
}));

vi.mock("fs", () => ({
  existsSync: vi.fn(() => true),
  mkdirSync: vi.fn(),
}));

import { ipcMain } from "electron";
import {
  registerSlideSettingsHandlers,
  unregisterSlideSettingsHandlers,
} from "../slideSettingsHandlers";
import { IPC_CHANNELS } from "../../../preload/channels";

describe("SlideSettingsHandlers - 異常系", () => {
  let mockMainWindow: BrowserWindowType;
  const registeredHandlers: Map<
    string,
    (event: IpcMainInvokeEvent, ...args: unknown[]) => Promise<unknown>
  > = new Map();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window
    mockMainWindow = {
      id: 1,
      webContents: {
        id: 1,
        getURL: vi.fn(() => "file:///app/index.html"),
      },
    } as unknown as BrowserWindowType;

    // Capture handlers
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: () => Promise<unknown>) => {
        registeredHandlers.set(channel, handler);
      },
    );

    // Default: valid sender
    mockValidateIpcSender.mockReturnValue({ valid: true });

    // Default: valid directory validation
    mockSlideSettingsStore.validateDirectory.mockReturnValue({
      valid: true,
      exists: true,
      writable: true,
    });

    // Default: valid settings
    mockSlideSettingsStore.getSettings.mockReturnValue({
      outputDirectory: "~/Documents/Slides",
      autoCreateDirectory: true,
      defaultTheme: "kanagawa",
      schemaVersion: 1,
    });

    mockSlideSettingsStore.getDirectory.mockReturnValue("~/Documents/Slides");
    mockSlideSettingsStore.getAutoCreateDirectory.mockReturnValue(true);

    // Register handlers
    registerSlideSettingsHandlers(mockMainWindow, mockSlideSettingsStore);
  });

  afterEach(() => {
    registeredHandlers.clear();
    unregisterSlideSettingsHandlers();
  });

  function createMockEvent(senderWebContentsId = 1): IpcMainInvokeEvent {
    return {
      sender: {
        id: senderWebContentsId,
        getURL: vi.fn(() => "file:///app/index.html"),
      },
      senderFrame: {
        url: "file:///app/index.html",
      },
    } as unknown as IpcMainInvokeEvent;
  }

  describe("sender検証", () => {
    it("SSH-ERR-01: DevToolsからの呼び出しを拒否", async () => {
      // Setup: sender validation fails
      mockValidateIpcSender.mockReturnValue({
        valid: false,
        error: "Sender is DevTools",
      });
      mockToIPCValidationError.mockReturnValue({
        error: { message: "IPC call from DevTools is not allowed" },
      });

      const handler = registeredHandlers.get(
        IPC_CHANNELS.SLIDE_SETTINGS_GET_DIRECTORY,
      );
      expect(handler).toBeDefined();

      const result = (await handler!(createMockEvent())) as ErrorResult;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("SSH-ERR-02: 存在しないwindowからの呼び出しを拒否", async () => {
      mockValidateIpcSender.mockReturnValue({
        valid: false,
        error: "Window not found",
      });
      mockToIPCValidationError.mockReturnValue({
        error: { message: "Window not found" },
      });

      const handler = registeredHandlers.get(
        IPC_CHANNELS.SLIDE_SETTINGS_GET_ALL,
      );
      expect(handler).toBeDefined();

      const result = (await handler!(createMockEvent(999))) as ErrorResult;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("SSH-ERR-03: 不正なwebContentsからの呼び出しを拒否", async () => {
      mockValidateIpcSender.mockReturnValue({
        valid: false,
        error: "Invalid webContents",
      });
      mockToIPCValidationError.mockReturnValue({
        error: { message: "Invalid webContents" },
      });

      const handler = registeredHandlers.get(
        IPC_CHANNELS.SLIDE_SETTINGS_SET_DIRECTORY,
      );
      expect(handler).toBeDefined();

      const result = (await handler!(
        createMockEvent(-1),
        "/valid/path",
      )) as ErrorResult;

      expect(result.success).toBe(false);
    });
  });

  describe("入力バリデーション", () => {
    it("SSH-ERR-04: undefined引数でエラーを返す", async () => {
      mockSlideSettingsStore.validateDirectory.mockReturnValue({
        valid: false,
        exists: false,
        writable: false,
        error: "Directory path cannot be empty",
      });

      const handler = registeredHandlers.get(
        IPC_CHANNELS.SLIDE_SETTINGS_SET_DIRECTORY,
      );
      expect(handler).toBeDefined();

      const result = (await handler!(
        createMockEvent(),
        undefined,
      )) as ErrorResult;

      expect(result.success).toBe(false);
    });

    it("SSH-ERR-05: 空文字引数でエラーを返す", async () => {
      mockSlideSettingsStore.validateDirectory.mockReturnValue({
        valid: false,
        exists: false,
        writable: false,
        error: "Directory path cannot be empty",
      });

      const handler = registeredHandlers.get(
        IPC_CHANNELS.SLIDE_SETTINGS_SET_DIRECTORY,
      );
      expect(handler).toBeDefined();

      const result = (await handler!(createMockEvent(), "")) as ErrorResult;

      expect(result.success).toBe(false);
    });

    it("SSH-ERR-06: パストラバーサルを含む引数でエラーを返す", async () => {
      mockSlideSettingsStore.validateDirectory.mockReturnValue({
        valid: false,
        exists: false,
        writable: false,
        error: "Path traversal not allowed",
      });

      const handler = registeredHandlers.get(
        IPC_CHANNELS.SLIDE_SETTINGS_SET_DIRECTORY,
      );
      expect(handler).toBeDefined();

      const result = (await handler!(
        createMockEvent(),
        "../../../etc/passwd",
      )) as ErrorResult;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("ダイアログエラー", () => {
    it("SSH-ERR-07: ダイアログがキャンセルされた場合nullを返す", async () => {
      mockDialog.showOpenDialog.mockResolvedValue({
        canceled: true,
        filePaths: [],
      });

      const handler = registeredHandlers.get(
        IPC_CHANNELS.SLIDE_SETTINGS_SELECT_DIRECTORY,
      );
      expect(handler).toBeDefined();

      const result = (await handler!(createMockEvent())) as SuccessResult<
        string | null
      >;

      expect(result.success).toBe(true);
      expect(result.data).toBe(null);
    });

    it("SSH-ERR-08: ダイアログがエラーで閉じた場合エラーを返す", async () => {
      mockDialog.showOpenDialog.mockRejectedValue(new Error("Dialog error"));

      const handler = registeredHandlers.get(
        IPC_CHANNELS.SLIDE_SETTINGS_SELECT_DIRECTORY,
      );
      expect(handler).toBeDefined();

      const result = (await handler!(createMockEvent())) as ErrorResult;

      expect(result.success).toBe(false);
      expect(result.error).toContain("Dialog error");
    });

    it("SSH-ERR-09: ダイアログの結果が空の場合nullを返す", async () => {
      mockDialog.showOpenDialog.mockResolvedValue({
        canceled: false,
        filePaths: [],
      });

      const handler = registeredHandlers.get(
        IPC_CHANNELS.SLIDE_SETTINGS_SELECT_DIRECTORY,
      );
      expect(handler).toBeDefined();

      const result = (await handler!(createMockEvent())) as SuccessResult<
        string | null
      >;

      expect(result.success).toBe(true);
      expect(result.data).toBe(null);
    });
  });

  describe("ストアエラー", () => {
    it("SSH-ERR-10: ストアの読み込みエラーを適切にハンドル", async () => {
      mockSlideSettingsStore.getSettings.mockImplementation(() => {
        throw new Error("Store read error");
      });

      const handler = registeredHandlers.get(
        IPC_CHANNELS.SLIDE_SETTINGS_GET_ALL,
      );
      expect(handler).toBeDefined();

      const result = (await handler!(createMockEvent())) as ErrorResult;

      expect(result.success).toBe(false);
      expect(result.error).toContain("Store read error");
    });

    it("SSH-ERR-11: ストアの書き込みエラーを適切にハンドル", async () => {
      mockSlideSettingsStore.setDirectory.mockImplementation(() => {
        throw new Error("Store write error");
      });

      const handler = registeredHandlers.get(
        IPC_CHANNELS.SLIDE_SETTINGS_SET_DIRECTORY,
      );
      expect(handler).toBeDefined();

      const result = (await handler!(
        createMockEvent(),
        "/valid/path",
      )) as ErrorResult;

      expect(result.success).toBe(false);
      expect(result.error).toContain("Store write error");
    });

    it("SSH-ERR-12: getDirectoryのエラーを適切にハンドル", async () => {
      mockSlideSettingsStore.getDirectory.mockImplementation(() => {
        throw new Error("Get directory error");
      });

      const handler = registeredHandlers.get(
        IPC_CHANNELS.SLIDE_SETTINGS_GET_DIRECTORY,
      );
      expect(handler).toBeDefined();

      const result = (await handler!(createMockEvent())) as ErrorResult;

      expect(result.success).toBe(false);
      expect(result.error).toContain("Get directory error");
    });

    it("SSH-ERR-13: validateDirectoryのエラーを適切にハンドル", async () => {
      mockValidateDirectoryForSettings.mockRejectedValue(
        new Error("Validation error"),
      );

      const handler = registeredHandlers.get(
        IPC_CHANNELS.SLIDE_SETTINGS_VALIDATE_DIRECTORY,
      );
      expect(handler).toBeDefined();

      const result = (await handler!(
        createMockEvent(),
        "/some/path",
      )) as ErrorResult;

      expect(result.success).toBe(false);
      expect(result.error).toContain("Validation error");
    });
  });

  describe("ディレクトリ作成エラー", () => {
    it("SSH-ERR-14: ディレクトリ作成失敗時にエラーを返す", async () => {
      // Reset setDirectory mock from previous test
      mockSlideSettingsStore.setDirectory.mockImplementation(() => {
        // Do nothing - success
      });

      // Setup: directory doesn't exist but can be created
      mockSlideSettingsStore.validateDirectory.mockReturnValue({
        valid: true,
        exists: false,
        writable: true,
        warning: "Directory does not exist but can be created",
      });
      mockSlideSettingsStore.getAutoCreateDirectory.mockReturnValue(true);

      // Make mkdirSync throw
      const fs = await import("fs");
      (fs.existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false);
      (fs.mkdirSync as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error("Permission denied");
      });

      const handler = registeredHandlers.get(
        IPC_CHANNELS.SLIDE_SETTINGS_SET_DIRECTORY,
      );
      expect(handler).toBeDefined();

      const result = (await handler!(
        createMockEvent(),
        "/nonexistent/path",
      )) as ErrorResult;

      expect(result.success).toBe(false);
      expect(result.error).toContain("Permission denied");
    });
  });
});
