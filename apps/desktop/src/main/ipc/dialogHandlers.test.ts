import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ipcMain, dialog, BrowserWindow } from "electron";
import { registerDialogHandlers } from "./dialogHandlers";
import { IPC_CHANNELS } from "../../preload/channels";

// Mock electron
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  dialog: {
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn(),
  },
  BrowserWindow: vi.fn(),
}));

describe("dialogHandlers", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;
  let mockWindow: BrowserWindow;

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = new Map();

    mockWindow = {} as BrowserWindow;

    // Capture registered handlers
    vi.mocked(ipcMain.handle).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
        return undefined;
      },
    );

    registerDialogHandlers(mockWindow);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("registerDialogHandlers", () => {
    it("DIALOG_SHOW_OPENとDIALOG_SHOW_SAVEのハンドラーを登録する", () => {
      expect(ipcMain.handle).toHaveBeenCalledTimes(2);
      expect(handlers.has(IPC_CHANNELS.DIALOG_SHOW_OPEN)).toBe(true);
      expect(handlers.has(IPC_CHANNELS.DIALOG_SHOW_SAVE)).toBe(true);
    });
  });

  describe("DIALOG_SHOW_OPEN handler", () => {
    it("ファイル選択ダイアログを表示し結果を返す", async () => {
      vi.mocked(dialog.showOpenDialog).mockResolvedValue({
        canceled: false,
        filePaths: ["/path/to/file.txt"],
      });

      const handler = handlers.get(IPC_CHANNELS.DIALOG_SHOW_OPEN);
      const result = await handler!({}, { title: "Select file" });

      expect(dialog.showOpenDialog).toHaveBeenCalledWith(mockWindow, {
        title: "Select file",
        filters: undefined,
        properties: undefined,
      });
      expect(result).toEqual({
        canceled: false,
        filePaths: ["/path/to/file.txt"],
      });
    });

    it("キャンセル時に空の結果を返す", async () => {
      vi.mocked(dialog.showOpenDialog).mockResolvedValue({
        canceled: true,
        filePaths: [],
      });

      const handler = handlers.get(IPC_CHANNELS.DIALOG_SHOW_OPEN);
      const result = await handler!({}, {});

      expect(result).toEqual({
        canceled: true,
        filePaths: [],
      });
    });

    it("エラー時にキャンセル状態を返す", async () => {
      vi.mocked(dialog.showOpenDialog).mockRejectedValue(
        new Error("Dialog error"),
      );

      const handler = handlers.get(IPC_CHANNELS.DIALOG_SHOW_OPEN);
      const result = await handler!({}, {});

      expect(result).toEqual({
        canceled: true,
        filePaths: [],
      });
    });

    it("フィルターとプロパティを渡す", async () => {
      vi.mocked(dialog.showOpenDialog).mockResolvedValue({
        canceled: false,
        filePaths: ["/path/to/folder"],
      });

      const handler = handlers.get(IPC_CHANNELS.DIALOG_SHOW_OPEN);
      await handler!(
        {},
        {
          title: "Select folder",
          filters: [{ name: "Text", extensions: ["txt"] }],
          properties: ["openDirectory"],
        },
      );

      expect(dialog.showOpenDialog).toHaveBeenCalledWith(mockWindow, {
        title: "Select folder",
        filters: [{ name: "Text", extensions: ["txt"] }],
        properties: ["openDirectory"],
      });
    });
  });

  describe("DIALOG_SHOW_SAVE handler", () => {
    it("ファイル保存ダイアログを表示し結果を返す", async () => {
      vi.mocked(dialog.showSaveDialog).mockResolvedValue({
        canceled: false,
        filePath: "/path/to/save.txt",
      });

      const handler = handlers.get(IPC_CHANNELS.DIALOG_SHOW_SAVE);
      const result = await handler!(
        {},
        {
          title: "Save file",
          defaultPath: "/default/path.txt",
        },
      );

      expect(dialog.showSaveDialog).toHaveBeenCalledWith(mockWindow, {
        title: "Save file",
        defaultPath: "/default/path.txt",
        filters: undefined,
      });
      expect(result).toEqual({
        canceled: false,
        filePath: "/path/to/save.txt",
      });
    });

    it("キャンセル時にundefinedのfilePathを返す", async () => {
      vi.mocked(dialog.showSaveDialog).mockResolvedValue({
        canceled: true,
        filePath: undefined,
      });

      const handler = handlers.get(IPC_CHANNELS.DIALOG_SHOW_SAVE);
      const result = await handler!({}, {});

      expect(result).toEqual({
        canceled: true,
        filePath: undefined,
      });
    });

    it("エラー時にキャンセル状態を返す", async () => {
      vi.mocked(dialog.showSaveDialog).mockRejectedValue(
        new Error("Save dialog error"),
      );

      const handler = handlers.get(IPC_CHANNELS.DIALOG_SHOW_SAVE);
      const result = await handler!({}, {});

      expect(result).toEqual({
        canceled: true,
        filePath: undefined,
      });
    });
  });
});
