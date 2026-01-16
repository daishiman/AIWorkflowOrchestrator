import { BrowserWindow, nativeTheme } from "electron";
import { registerFileHandlers } from "./fileHandlers";
import { registerStoreHandlers } from "./storeHandlers";
import { registerDashboardHandlers } from "./dashboardHandlers";
import { registerGraphHandlers } from "./graphHandlers";
import { registerAIHandlers } from "./aiHandlers";
import { registerWindowHandlers, sendMenuAction } from "./windowHandlers";
import { registerThemeHandlers, setupThemeWatcher } from "./themeHandlers";
import { registerAuthHandlers } from "./authHandlers";
import { registerProfileHandlers } from "./profileHandlers";
import { registerAvatarHandlers } from "./avatarHandlers";
import { registerApiKeyHandlers } from "./apiKeyHandlers";
import { registerDialogHandlers } from "./dialogHandlers";
import { registerWorkspaceHandlers } from "./workspaceHandlers";
import { registerSearchHandlers } from "./searchHandlers";
import { registerFileSelectionHandlers } from "./fileSelectionHandlers";
import { registerLLMHandlers } from "../handlers/llm";
import { registerHistoryHandlers } from "./historyHandlers";
import { createHistoryServiceWithDI } from "../services/HistoryService";
import { registerAgentExecutionHandlers } from "./agentHandlers";
import { registerCommunityHandlers } from "./communityHandlers";
import {
  getSupabaseClient,
  createSecureStorage,
  createProfileCache,
  createApiKeyStorage,
  createStubSharedHistoryService,
  createStubLogRepository,
  createStubLogger,
} from "../infrastructure";

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
  registerWorkspaceHandlers();
  registerSearchHandlers();
  registerFileSelectionHandlers();
  registerLLMHandlers();
  registerCommunityHandlers();

  // Register handlers that need window reference
  registerWindowHandlers(mainWindow);
  registerDialogHandlers(mainWindow);

  // Setup theme watcher to broadcast system theme changes
  setupThemeWatcher(nativeTheme, () => BrowserWindow.getAllWindows());

  // Register auth, profile, and avatar handlers (only if Supabase is configured)
  const supabase = getSupabaseClient();
  if (supabase) {
    const secureStorage = createSecureStorage();
    const profileCache = createProfileCache();

    registerAuthHandlers(mainWindow, supabase, secureStorage);
    registerProfileHandlers(mainWindow, supabase, profileCache);
    registerAvatarHandlers(mainWindow, supabase);
  } else {
    console.warn(
      "[IPC] Auth, profile, and avatar handlers not registered - Supabase not configured",
    );
  }

  // Register API Key handlers (always available - local storage only)
  const apiKeyStorage = createApiKeyStorage();
  registerApiKeyHandlers(mainWindow, apiKeyStorage);

  // Register History handlers (using stubs until full DB integration)
  const sharedHistoryService = createStubSharedHistoryService();
  const logRepository = createStubLogRepository();
  const historyLogger = createStubLogger();
  const historyService = createHistoryServiceWithDI(
    sharedHistoryService,
    logRepository,
    historyLogger,
  );
  registerHistoryHandlers(mainWindow, historyService);

  // Register Agent Execution handlers (AGENT-005)
  registerAgentExecutionHandlers(mainWindow);
}

// Re-export for menu actions
export { sendMenuAction };
