import { BrowserWindow, nativeTheme, ipcMain, net } from "electron";
import path from "path";
import Store from "electron-store";
import { IPC_CHANNELS } from "../../preload/channels";
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
import { registerSkillHandlers } from "./skillHandlers";
import { registerClaudeCliHandlers } from "../claude-cli";
import { registerSkillCreatorHandlers } from "./skillCreatorHandlers";
import { registerSkillFileHandlers } from "./skillFileHandlers";
import { SkillCreatorService } from "../services/skill/SkillCreatorService";
import {
  SkillScanner,
  SkillParser,
  SkillImportManager,
  SkillService,
  PermissionStore,
} from "../services/skill";
import { SkillFileManager } from "../services/skill/SkillFileManager";
import { registerPermissionStoreHandlers } from "./permission-store-handlers";
import { registerAuthModeHandlers } from "./authModeHandlers";
import {
  AuthKeyService,
  createAuthKeyStorage,
  createAuthModeService,
} from "../services/auth";
import {
  getSupabaseClient,
  createSecureStorage,
  createProfileCache,
  createApiKeyStorage,
  createStubSharedHistoryService,
  createStubLogRepository,
  createStubLogger,
} from "../infrastructure";
import { registerChatEditHandlers } from "./chatEditHandlers";
import {
  ChatEditService,
  FileService,
  ContextBuilder,
} from "../services/chat-edit";

// setupThemeWatcher の unsubscribe 関数をモジュールスコープで保持
let themeWatcherUnsubscribe: (() => void) | null = null;

/**
 * 全 IPC ハンドラを解除する
 * activate イベントで registerAllIpcHandlers() を再実行する前に呼び出す
 *
 * IPC_CHANNELS 定数から全チャンネル名を取得して removeHandler() と
 * removeAllListeners() を実行する。ipcMain.removeHandler() は
 * 未登録チャンネルでもエラーを出さないため安全に全チャンネルを走査できる。
 */
export function unregisterAllIpcHandlers(): void {
  const allChannels = Object.values(IPC_CHANNELS);
  for (const channel of allChannels) {
    ipcMain.removeHandler(channel);
    ipcMain.removeAllListeners(channel);
  }

  // setupThemeWatcher のリスナーも解除
  if (themeWatcherUnsubscribe) {
    themeWatcherUnsubscribe();
    themeWatcherUnsubscribe = null;
  }
}

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
  // 再登録時は既存のリスナーを解除してから再設定する
  themeWatcherUnsubscribe = setupThemeWatcher(nativeTheme, () =>
    BrowserWindow.getAllWindows(),
  );

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
    // Register fallback handlers when Supabase is not configured
    registerAuthFallbackHandlers();
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

  // Register Skill Management handlers (SKILL-IPC-001)
  // Use home directory for skills (where Claude CLI stores them)
  const homeDir = process.env.HOME || process.env.USERPROFILE || "";
  const skillBasePath = path.join(homeDir, ".claude", "skills");
  interface SkillStoreSchema {
    importedSkillIds: string[];
  }
  const skillStore = new Store<SkillStoreSchema>({
    name: "skills",
    defaults: {
      importedSkillIds: [],
    },
  });
  const skillScanner = new SkillScanner(skillBasePath);
  const skillParser = new SkillParser();
  const skillImportManager = new SkillImportManager(skillStore);
  const skillService = new SkillService(
    skillScanner,
    skillParser,
    skillImportManager,
  );
  registerSkillHandlers(mainWindow, skillService);

  // Register Skill File handlers (TASK-9A-B)
  const skillFileManager = new SkillFileManager();
  registerSkillFileHandlers(mainWindow, skillFileManager, skillService);

  // Register Permission Store handlers (TASK-3-1-E)
  const permissionStore = new PermissionStore();
  registerPermissionStoreHandlers(permissionStore);

  // Register Auth Mode handlers (TASK-AUTH-MODE-SELECTION-001)
  const authKeyStorage = createAuthKeyStorage();
  const authKeyService = new AuthKeyService(authKeyStorage);
  const authModeService = createAuthModeService(authKeyService);
  registerAuthModeHandlers(mainWindow, authModeService);

  // Register Skill Creator handlers (TASK-9B-H)
  const skillCreatorService = new SkillCreatorService();
  registerSkillCreatorHandlers(mainWindow, skillCreatorService);

  // Register Claude CLI handlers (for skill discovery via Claude CLI)
  registerClaudeCliHandlers(mainWindow);

  // Register Chat Edit handlers (TASK-WCE-MONACO-001)
  // Note: ChatEditService requires an LLM adapter, using stub for now
  // as the primary use case is get-selection which doesn't need LLM
  const fileService = new FileService();
  const contextBuilder = new ContextBuilder();
  const stubLLMAdapter = {
    sendMessage: async () => ({
      success: false,
      error: { message: "LLM adapter not configured for chat-edit" },
    }),
  };
  const chatEditService = new ChatEditService(stubLLMAdapter, contextBuilder);
  registerChatEditHandlers(mainWindow, chatEditService, fileService);
}

/**
 * Register fallback auth handlers when Supabase is not configured
 * These handlers return appropriate "not configured" responses
 */
function registerAuthFallbackHandlers(): void {
  const notConfiguredResponse = {
    success: false,
    error: {
      code: "AUTH_NOT_CONFIGURED",
      message:
        "Authentication is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.",
    },
  };

  // auth:login - Return not configured error
  ipcMain.handle(IPC_CHANNELS.AUTH_LOGIN, async () => notConfiguredResponse);

  // auth:logout - Return not configured error
  ipcMain.handle(IPC_CHANNELS.AUTH_LOGOUT, async () => notConfiguredResponse);

  // auth:get-session - Return null session (not authenticated)
  ipcMain.handle(IPC_CHANNELS.AUTH_GET_SESSION, async () => ({
    success: true,
    data: null,
  }));

  // auth:refresh - Return not configured error
  ipcMain.handle(IPC_CHANNELS.AUTH_REFRESH, async () => notConfiguredResponse);

  // auth:check-online - Return online status (this doesn't need Supabase)
  ipcMain.handle(IPC_CHANNELS.AUTH_CHECK_ONLINE, async () => ({
    success: true,
    data: { online: net.isOnline() },
  }));
}

// Re-export for menu actions
export { sendMenuAction };
