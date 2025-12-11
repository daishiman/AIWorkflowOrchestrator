import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ipcMain, BrowserWindow, app } from "electron";
import { registerWindowHandlers, sendMenuAction } from "./windowHandlers";
import { IPC_CHANNELS } from "../../preload/channels";

// Mock electron
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  app: {
    getVersion: vi.fn(() => "1.0.0"),
  },
  BrowserWindow: vi.fn(),
}));

describe("windowHandlers", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  let mockWindow: any;

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = new Map();

    mockWindow = {
      getBounds: vi.fn(() => ({ width: 1200, height: 800, x: 100, y: 50 })),
      isMaximized: vi.fn(() => false),
      isFullScreen: vi.fn(() => false),
      getSize: vi.fn(() => [1200, 800]),
      on: vi.fn(),
      webContents: {
        send: vi.fn(),
      },
    };

    // Capture registered handlers
    vi.mocked(ipcMain.handle).mockImplementation(
      (channel: string, handler: any) => {
        handlers.set(channel, handler);
        return undefined as unknown as void;
      },
    );

    registerWindowHandlers(mockWindow as unknown as BrowserWindow);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("registerWindowHandlers", () => {
    it("WINDOW_GET_STATEとAPP_GET_VERSIONのハンドラーを登録する", () => {
      expect(ipcMain.handle).toHaveBeenCalledTimes(2);
      expect(handlers.has(IPC_CHANNELS.WINDOW_GET_STATE)).toBe(true);
      expect(handlers.has(IPC_CHANNELS.APP_GET_VERSION)).toBe(true);
    });

    it("resizeイベントリスナーを登録する", () => {
      expect(mockWindow.on).toHaveBeenCalledWith(
        "resize",
        expect.any(Function),
      );
    });
  });

  describe("WINDOW_GET_STATE handler", () => {
    it("ウィンドウ状態を正常に返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.WINDOW_GET_STATE);
      const result = await handler!();

      expect(result).toEqual({
        success: true,
        data: {
          width: 1200,
          height: 800,
          x: 100,
          y: 50,
          isMaximized: false,
          isFullScreen: false,
        },
      });
    });

    it("最大化状態を返す", async () => {
      mockWindow.isMaximized.mockReturnValue(true);

      const handler = handlers.get(IPC_CHANNELS.WINDOW_GET_STATE);
      const result = (await handler!()) as {
        success: boolean;
        data: { isMaximized: boolean };
      };

      expect(result.data.isMaximized).toBe(true);
    });

    it("フルスクリーン状態を返す", async () => {
      mockWindow.isFullScreen.mockReturnValue(true);

      const handler = handlers.get(IPC_CHANNELS.WINDOW_GET_STATE);
      const result = (await handler!()) as {
        success: boolean;
        data: { isFullScreen: boolean };
      };

      expect(result.data.isFullScreen).toBe(true);
    });

    it("エラー時にエラーレスポンスを返す", async () => {
      mockWindow.getBounds.mockImplementation(() => {
        throw new Error("Window error");
      });

      const handler = handlers.get(IPC_CHANNELS.WINDOW_GET_STATE);
      const result = await handler!();

      expect(result).toEqual({
        success: false,
        error: "Window error",
      });
    });
  });

  describe("APP_GET_VERSION handler", () => {
    it("アプリバージョン情報を返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.APP_GET_VERSION);
      const result = await handler!();

      expect(result).toEqual({
        success: true,
        data: {
          appVersion: "1.0.0",
          electronVersion: expect.any(String),
          nodeVersion: expect.any(String),
          platform: expect.any(String),
        },
      });
    });

    it("エラー時にエラーレスポンスを返す", async () => {
      vi.mocked(app.getVersion).mockImplementation(() => {
        throw new Error("Version error");
      });

      const handler = handlers.get(IPC_CHANNELS.APP_GET_VERSION);
      const result = await handler!();

      expect(result).toEqual({
        success: false,
        error: "Version error",
      });
    });
  });

  describe("resize event", () => {
    it("リサイズ時にrendererに通知を送る", () => {
      // Get the resize callback
      const resizeCallback = mockWindow.on.mock.calls.find(
        (call: any) => call[0] === "resize",
      )?.[1] as () => void;

      expect(resizeCallback).toBeDefined();

      // Trigger resize
      resizeCallback();

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.WINDOW_RESIZED,
        { width: 1200, height: 800 },
      );
    });
  });

  describe("sendMenuAction", () => {
    it("メニューアクションをrendererに送信する", () => {
      sendMenuAction(mockWindow as unknown as BrowserWindow, "save");

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        IPC_CHANNELS.APP_MENU_ACTION,
        { action: "save" },
      );
    });
  });
});
