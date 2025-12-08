import { BrowserWindow } from "electron";
import { registerFileHandlers } from "./fileHandlers";
import { registerStoreHandlers } from "./storeHandlers";
import { registerDashboardHandlers } from "./dashboardHandlers";
import { registerGraphHandlers } from "./graphHandlers";
import { registerAIHandlers } from "./aiHandlers";
import { registerWindowHandlers, sendMenuAction } from "./windowHandlers";

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

  // Register handlers that need window reference
  registerWindowHandlers(mainWindow);
}

// Re-export for menu actions
export { sendMenuAction };
