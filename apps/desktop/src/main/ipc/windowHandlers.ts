import { ipcMain, BrowserWindow, app } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import type {
  WindowGetStateResponse,
  AppGetVersionResponse,
} from "../../preload/types";

export function registerWindowHandlers(mainWindow: BrowserWindow): void {
  // Get window state
  ipcMain.handle(
    IPC_CHANNELS.WINDOW_GET_STATE,
    async (): Promise<WindowGetStateResponse> => {
      try {
        const bounds = mainWindow.getBounds();
        const isMaximized = mainWindow.isMaximized();
        const isFullScreen = mainWindow.isFullScreen();

        return {
          success: true,
          data: {
            width: bounds.width,
            height: bounds.height,
            x: bounds.x,
            y: bounds.y,
            isMaximized,
            isFullScreen,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // Get app version
  ipcMain.handle(
    IPC_CHANNELS.APP_GET_VERSION,
    async (): Promise<AppGetVersionResponse> => {
      try {
        return {
          success: true,
          data: {
            appVersion: app.getVersion(),
            electronVersion: process.versions.electron || "",
            nodeVersion: process.versions.node || "",
            platform: process.platform,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // Listen for window resize and send to renderer
  mainWindow.on("resize", () => {
    const [width, height] = mainWindow.getSize();
    mainWindow.webContents.send(IPC_CHANNELS.WINDOW_RESIZED, { width, height });
  });
}

// Send menu action to renderer
export function sendMenuAction(
  mainWindow: BrowserWindow,
  action: string,
): void {
  mainWindow.webContents.send(IPC_CHANNELS.APP_MENU_ACTION, { action });
}
