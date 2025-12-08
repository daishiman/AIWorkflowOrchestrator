import { BrowserWindow, nativeTheme } from "electron";
import { registerFileHandlers } from "./fileHandlers";
import { registerStoreHandlers } from "./storeHandlers";
import { registerDashboardHandlers } from "./dashboardHandlers";
import { registerGraphHandlers } from "./graphHandlers";
import { registerAIHandlers } from "./aiHandlers";
import { registerWindowHandlers, sendMenuAction } from "./windowHandlers";
import { registerThemeHandlers, setupThemeWatcher } from "./themeHandlers";

/**
 * Register all IPC handlers
 * Call this after the main window is created
 */
export function registerAllIpcHandlers(mainWindow: BrowserWindow): void {
  // Register handlers that don't need window reference
  registerFileHandlers();
  registerStoreHandlers();
  registerDashboardHandlers();
  registerGraphHandlers();
  registerAIHandlers();
  registerThemeHandlers();

  // Register handlers that need window reference
  registerWindowHandlers(mainWindow);

  // Setup theme watcher to broadcast system theme changes
  setupThemeWatcher(nativeTheme, () => BrowserWindow.getAllWindows());
}

// Re-export for menu actions
export { sendMenuAction };
