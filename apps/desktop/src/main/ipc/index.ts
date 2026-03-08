import { BrowserWindow, nativeTheme, ipcMain, net } from "electron";
import fs from "fs/promises";
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
import {
  createHistorySearchService,
  registerHistorySearchHandlers,
} from "./historySearchHandlers";
import {
  createNotificationService,
  registerNotificationHandlers,
} from "./notificationHandlers";
import { createHistoryServiceWithDI } from "../services/HistoryService";
import { registerAgentExecutionHandlers } from "./agentHandlers";
import { registerCommunityHandlers } from "./communityHandlers";
import {
  registerSkillHandlers,
  registerSkillScheduleHandlers,
  registerSkillDocsHandlers,
  registerSkillChainHandlers,
} from "./skillHandlers";
import { registerSkillAnalyticsHandlers } from "./skillAnalyticsHandlers";
import { registerSkillShareHandlers } from "./skillHandlers.share";
import { registerSkillDebugHandlers } from "./skillDebugHandlers";
import { registerClaudeCliHandlers } from "../claude-cli";
import { registerSkillCreatorHandlers } from "./skillCreatorHandlers";
import { registerSkillFileHandlers } from "./skillFileHandlers";
import { SkillCreatorService } from "../services/skill/SkillCreatorService";
import {
  SkillScanner,
  SkillParser,
  SkillImportManager,
  SkillService,
  SkillValidator,
  SkillShareManager,
  PermissionStore,
} from "../services/skill";
import { SkillFileManager } from "../services/skill/SkillFileManager";
import { SkillChainStore } from "../services/skill/SkillChainStore";
import { SkillChainExecutor } from "../services/skill/SkillChainExecutor";
import { SkillDocGenerator as SkillDocGeneratorCls } from "../services/skill/SkillDocGenerator";
import { ScheduleStore } from "../services/skill/ScheduleStore";
import { SkillScheduler } from "../services/skill/SkillScheduler";
import { AnalyticsStore } from "../services/skill/AnalyticsStore";
import { SkillAnalytics } from "../services/skill/SkillAnalytics";
import { registerPermissionStoreHandlers } from "./permission-store-handlers";
import { registerAuthModeHandlers } from "./authModeHandlers";
import {
  registerAuthKeyHandlers,
  unregisterAuthKeyHandlers,
} from "./authKeyHandlers";
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
import {
  AUTH_ERROR_CODES,
  PROFILE_ERROR_CODES,
  AVATAR_ERROR_CODES,
} from "@repo/shared/types/auth";
import type { ShareError, ShareResult } from "@repo/shared";

// setupThemeWatcher の unsubscribe 関数をモジュールスコープで保持
let themeWatcherUnsubscribe: (() => void) | null = null;

type ShareCategory = ShareError["category"];
type GitHubClientAdapter = ConstructorParameters<typeof SkillShareManager>[0];
type FallbackHandler = readonly [
  channel: string,
  handler: () => Promise<unknown>,
];

interface RepoContentEntry {
  type?: string;
  name?: string;
  path?: string;
  content?: string;
  encoding?: string;
  download_url?: string | null;
}

function createShareError(
  code: number,
  message: string,
  category: ShareCategory,
  isRetryable: boolean,
): ShareError {
  return { code, message, category, isRetryable };
}

function shareSuccess<T>(data: T): ShareResult<T> {
  return { success: true, data };
}

function shareFailure<T>(error: ShareError): ShareResult<T> {
  return { success: false, error };
}

function buildGitHubHeaders(includeAuth: boolean): HeadersInit {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "AIWorkflowOrchestrator",
  };
  if (includeAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function normalizeRepoPath(repoPath: string): string {
  if (repoPath === "/" || repoPath === "") {
    return "";
  }
  return repoPath.replace(/^\/+/, "").replace(/\/+$/, "");
}

function toRelativeRepoPath(entryPath: string, basePath: string): string {
  const normalizedEntry = entryPath.replace(/^\/+/, "");
  const normalizedBase = normalizeRepoPath(basePath);
  if (normalizedBase && normalizedEntry.startsWith(`${normalizedBase}/`)) {
    return normalizedEntry.slice(normalizedBase.length + 1);
  }
  return normalizedEntry;
}

async function readRepoFileContent(
  entry: RepoContentEntry,
): Promise<ShareResult<string>> {
  if (typeof entry.content === "string") {
    if (entry.encoding === "base64") {
      try {
        return shareSuccess(
          Buffer.from(entry.content.replace(/\n/g, ""), "base64").toString(
            "utf-8",
          ),
        );
      } catch {
        return shareFailure(
          createShareError(
            3001,
            "Failed to decode repository content",
            "external",
            false,
          ),
        );
      }
    }
    return shareSuccess(entry.content);
  }

  if (typeof entry.download_url === "string" && entry.download_url !== "") {
    try {
      const response = await fetch(entry.download_url, {
        headers: buildGitHubHeaders(false),
      });
      if (!response.ok) {
        return shareFailure(
          createShareError(
            3001,
            `Failed to download file: HTTP ${response.status}`,
            "external",
            false,
          ),
        );
      }
      return shareSuccess(await response.text());
    } catch (error) {
      return shareFailure(
        createShareError(
          3002,
          error instanceof Error ? error.message : "Network error",
          "external",
          true,
        ),
      );
    }
  }

  return shareFailure(
    createShareError(3001, "File content is not available", "external", false),
  );
}

function createGitHubClient(): GitHubClientAdapter {
  const fetchRepoContents = async (
    repo: string,
    repoPath: string,
    branch: string,
    basePath: string,
  ): Promise<ShareResult<{ name: string; content: string }[]>> => {
    const normalizedPath = normalizeRepoPath(repoPath);
    const endpointPath =
      normalizedPath === "" ? "contents" : `contents/${normalizedPath}`;
    const url = `https://api.github.com/repos/${repo}/${endpointPath}?ref=${encodeURIComponent(branch)}`;

    let payload: unknown;
    try {
      const response = await fetch(url, {
        headers: buildGitHubHeaders(true),
      });
      if (!response.ok) {
        return shareFailure(
          createShareError(
            3001,
            `GitHub API error: HTTP ${response.status}`,
            "external",
            false,
          ),
        );
      }
      payload = await response.json();
    } catch (error) {
      return shareFailure(
        createShareError(
          3002,
          error instanceof Error ? error.message : "Network error",
          "external",
          true,
        ),
      );
    }

    const entries: RepoContentEntry[] = Array.isArray(payload)
      ? (payload as RepoContentEntry[])
      : [payload as RepoContentEntry];

    const files: { name: string; content: string }[] = [];

    for (const entry of entries) {
      if (!entry || typeof entry !== "object") {
        continue;
      }

      if (entry.type === "dir" && typeof entry.path === "string") {
        const nested = await fetchRepoContents(
          repo,
          entry.path,
          branch,
          basePath,
        );
        if (!nested.success) {
          return nested;
        }
        files.push(...(nested.data ?? []));
        continue;
      }

      if (entry.type !== "file") {
        continue;
      }

      const contentResult = await readRepoFileContent(entry);
      if (!contentResult.success) {
        return shareFailure(contentResult.error!);
      }

      const fullPath =
        typeof entry.path === "string" ? entry.path : (entry.name ?? "unknown");
      files.push({
        name: toRelativeRepoPath(fullPath, basePath),
        content: contentResult.data!,
      });
    }

    return shareSuccess(files);
  };

  return {
    async getRepoContents(
      repo: string,
      repoPath: string,
      branch: string,
    ): Promise<ShareResult<{ name: string; content: string }[]>> {
      return fetchRepoContents(repo, repoPath, branch, repoPath);
    },

    async getGist(
      gistId: string,
    ): Promise<ShareResult<{ files: Record<string, { content: string }> }>> {
      try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
          headers: buildGitHubHeaders(true),
        });
        if (!response.ok) {
          return shareFailure(
            createShareError(
              3001,
              `Gist API error: HTTP ${response.status}`,
              "external",
              false,
            ),
          );
        }
        const payload = (await response.json()) as {
          files?: Record<string, { content?: string }>;
        };

        const files: Record<string, { content: string }> = {};
        for (const [fileName, fileData] of Object.entries(
          payload.files ?? {},
        )) {
          files[fileName] = { content: fileData.content ?? "" };
        }

        return shareSuccess({ files });
      } catch (error) {
        return shareFailure(
          createShareError(
            3002,
            error instanceof Error ? error.message : "Network error",
            "external",
            true,
          ),
        );
      }
    },

    async createGist(
      files: Record<string, { content: string }>,
      description: string,
    ): Promise<ShareResult<{ url: string }>> {
      const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
      if (!token) {
        return shareFailure(
          createShareError(
            2005,
            "GITHUB_TOKEN is required for gist export",
            "business",
            false,
          ),
        );
      }

      try {
        const response = await fetch("https://api.github.com/gists", {
          method: "POST",
          headers: {
            ...buildGitHubHeaders(true),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description,
            public: false,
            files,
          }),
        });

        if (!response.ok) {
          return shareFailure(
            createShareError(
              3001,
              `Gist create failed: HTTP ${response.status}`,
              "external",
              false,
            ),
          );
        }

        const payload = (await response.json()) as { html_url?: string };
        return shareSuccess({ url: payload.html_url ?? "" });
      } catch (error) {
        return shareFailure(
          createShareError(
            3002,
            error instanceof Error ? error.message : "Network error",
            "external",
            true,
          ),
        );
      }
    },
  };
}

/**
 * 全 IPC ハンドラを解除する
 * activate イベントで registerAllIpcHandlers() を再実行する前に呼び出す
 *
 * IPC_CHANNELS 定数から全チャンネル名を取得して removeHandler() と
 * removeAllListeners() を実行する。ipcMain.removeHandler() は
 * 未登録チャンネルでもエラーを出さないため安全に全チャンネルを走査できる。
 */
export function unregisterAllIpcHandlers(): void {
  // auth-key handlers は内部登録状態を持つため、先に専用解除を実行する
  unregisterAuthKeyHandlers();

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
    registerProfileFallbackHandlers();
    registerAvatarFallbackHandlers();
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
  registerHistorySearchHandlers(createHistorySearchService(), { mainWindow });
  registerNotificationHandlers(createNotificationService(), { mainWindow });

  // Register Agent Execution handlers (AGENT-005)
  registerAgentExecutionHandlers(mainWindow);

  // Initialize Auth Key service once and share across handlers
  const authKeyStorage = createAuthKeyStorage();
  const authKeyService = new AuthKeyService(authKeyStorage);

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
  registerSkillHandlers(mainWindow, skillService, authKeyService);

  // Register Skill File handlers (TASK-9A-B)
  const skillFileManager = new SkillFileManager();
  registerSkillFileHandlers(mainWindow, skillFileManager, skillService);

  // Register Skill Share handlers (TASK-9F)
  const skillValidator = new SkillValidator();
  const skillShareManager = new SkillShareManager(
    createGitHubClient(),
    {
      readFile: (targetPath: string) => fs.readFile(targetPath, "utf-8"),
      writeFile: async (targetPath: string, content: string) => {
        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        await fs.writeFile(targetPath, content, "utf-8");
      },
      readdir: (targetPath: string) => fs.readdir(targetPath),
      stat: (targetPath: string) => fs.stat(targetPath),
      mkdir: async (targetPath: string) => {
        await fs.mkdir(targetPath, { recursive: true });
      },
      cp: (src: string, dest: string) => fs.cp(src, dest, { recursive: true }),
      exists: async (targetPath: string) => {
        try {
          await fs.access(targetPath);
          return true;
        } catch {
          return false;
        }
      },
      resolveRealPath: (targetPath: string) => fs.realpath(targetPath),
    },
    {
      validateStructure: async (targetPath: string) => {
        const isValid = await skillValidator.validateStructure(targetPath);
        return {
          isValid,
          errors: isValid ? [] : ["SKILL.md not found"],
        };
      },
      validateSkillMd: (content: string) =>
        skillValidator.validateSkillMd(content),
    },
    {
      scanAvailableSkills: () => skillService.scanAvailableSkills(),
      getSkillByName: async (name: string) => {
        const skill = await skillService.getSkillByName(name as never);
        if (!skill) {
          return shareFailure(
            createShareError(
              2003,
              `Skill not found: ${name}`,
              "business",
              false,
            ),
          );
        }
        return shareSuccess({
          name: skill.name,
          path: path.dirname(skill.path),
        });
      },
      importManager: {
        importSkills: (names: string[]) =>
          skillService.importManager.importSkills(names as never),
      },
    },
  );
  registerSkillShareHandlers(mainWindow, skillShareManager);
  registerSkillDebugHandlers(mainWindow);

  // Register Skill Schedule handlers (TASK-9G)
  const scheduleStore = new ScheduleStore();
  const schedulerExecutorAdapter = {
    async execute(
      request: { prompt: string; skillId: string },
      _skill: {
        id: string;
        name: string;
        description: string;
        path: string;
        anchors: unknown[];
        allowedTools?: string[];
      },
    ) {
      const result = await skillService.executeSkill(request.skillId, {
        prompt: request.prompt,
      });
      return {
        executionId: result.executionId,
        success: result.success,
        error: result.error,
      };
    },
  };
  const skillScheduler = new SkillScheduler(
    scheduleStore,
    schedulerExecutorAdapter,
  );
  // initialize は非同期だが、起動時にブロックしない
  void skillScheduler.initialize();
  registerSkillScheduleHandlers(mainWindow, skillScheduler, scheduleStore);

  // Register Skill Docs handlers (TASK-9I)
  const stubQueryFn = async (prompt: string) => ({
    content: `Generated content for: ${prompt.slice(0, 50)}`,
  });
  const skillDocGenerator = new SkillDocGeneratorCls(
    stubQueryFn,
    skillFileManager,
  );
  registerSkillDocsHandlers(mainWindow, skillDocGenerator);

  // Register Skill Analytics handlers (TASK-9J)
  const analyticsStore = new AnalyticsStore();
  const skillAnalytics = new SkillAnalytics(analyticsStore);
  registerSkillAnalyticsHandlers(mainWindow, skillAnalytics);

  // Register Skill Chain handlers (TASK-9D / TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001)
  const chainStoragePath = path.join(homeDir, ".claude", "skill-chains.json");
  const chainStore = new SkillChainStore(chainStoragePath);
  const chainExecutor = new SkillChainExecutor(
    async (skillName: string, input: unknown) => {
      const result = await skillService.executeSkill(skillName, {
        prompt: typeof input === "string" ? input : JSON.stringify(input),
      });
      return result;
    },
  );
  registerSkillChainHandlers(mainWindow, chainStore, chainExecutor);

  // Register Permission Store handlers (TASK-3-1-E)
  const permissionStore = new PermissionStore();
  registerPermissionStoreHandlers(permissionStore);

  // Register Auth Mode handlers (TASK-AUTH-MODE-SELECTION-001)
  registerAuthKeyHandlers(mainWindow, authKeyService);
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
 * Shared error envelope for Supabase未設定時の fallback 応答を生成する
 */
function createNotConfiguredResponse(code: string, message: string) {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}

function registerFallbackHandlers(
  handlers: ReadonlyArray<FallbackHandler>,
): void {
  for (const [channel, handler] of handlers) {
    ipcMain.handle(channel, handler);
  }
}

/**
 * Register fallback auth handlers when Supabase is not configured
 * These handlers return appropriate "not configured" responses
 */
function registerAuthFallbackHandlers(): void {
  const notConfiguredResponse = createNotConfiguredResponse(
    AUTH_ERROR_CODES.AUTH_NOT_CONFIGURED,
    "Authentication is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.",
  );
  const fallbackAuthHandlers: ReadonlyArray<FallbackHandler> = [
    // auth:login - Return not configured error
    [IPC_CHANNELS.AUTH_LOGIN, async () => notConfiguredResponse],
    // auth:logout - Return not configured error
    [IPC_CHANNELS.AUTH_LOGOUT, async () => notConfiguredResponse],
    // auth:get-session - Return null session (not authenticated)
    [
      IPC_CHANNELS.AUTH_GET_SESSION,
      async () => ({
        success: true,
        data: null,
      }),
    ],
    // auth:refresh - Return not configured error
    [IPC_CHANNELS.AUTH_REFRESH, async () => notConfiguredResponse],
    // auth:check-online - Return online status (this doesn't need Supabase)
    [
      IPC_CHANNELS.AUTH_CHECK_ONLINE,
      async () => ({
        success: true,
        data: { online: net.isOnline() },
      }),
    ],
  ];

  registerFallbackHandlers(fallbackAuthHandlers);
}

/**
 * Register fallback profile handlers when Supabase is not configured
 * These handlers return appropriate "not configured" responses
 */
function registerProfileFallbackHandlers(): void {
  const notConfiguredResponse = createNotConfiguredResponse(
    PROFILE_ERROR_CODES.NOT_CONFIGURED,
    "Profile service is not configured. Supabase environment variables are required.",
  );
  const fallbackProfileHandlers: ReadonlyArray<FallbackHandler> = [
    [IPC_CHANNELS.PROFILE_GET, async () => notConfiguredResponse],
    [IPC_CHANNELS.PROFILE_UPDATE, async () => notConfiguredResponse],
    [IPC_CHANNELS.PROFILE_DELETE, async () => notConfiguredResponse],
    [IPC_CHANNELS.PROFILE_GET_PROVIDERS, async () => notConfiguredResponse],
    [IPC_CHANNELS.PROFILE_LINK_PROVIDER, async () => notConfiguredResponse],
    [IPC_CHANNELS.PROFILE_UNLINK_PROVIDER, async () => notConfiguredResponse],
    [IPC_CHANNELS.PROFILE_UPDATE_TIMEZONE, async () => notConfiguredResponse],
    [IPC_CHANNELS.PROFILE_UPDATE_LOCALE, async () => notConfiguredResponse],
    [
      IPC_CHANNELS.PROFILE_UPDATE_NOTIFICATIONS,
      async () => notConfiguredResponse,
    ],
    [IPC_CHANNELS.PROFILE_EXPORT, async () => notConfiguredResponse],
    [IPC_CHANNELS.PROFILE_IMPORT, async () => notConfiguredResponse],
  ];

  registerFallbackHandlers(fallbackProfileHandlers);
}

/**
 * Register fallback avatar handlers when Supabase is not configured
 * These handlers return appropriate "not configured" responses
 */
function registerAvatarFallbackHandlers(): void {
  const notConfiguredResponse = createNotConfiguredResponse(
    AVATAR_ERROR_CODES.NOT_CONFIGURED,
    "Avatar service is not configured. Supabase environment variables are required.",
  );
  const fallbackAvatarHandlers: ReadonlyArray<FallbackHandler> = [
    [IPC_CHANNELS.AVATAR_UPLOAD, async () => notConfiguredResponse],
    [IPC_CHANNELS.AVATAR_USE_PROVIDER, async () => notConfiguredResponse],
    [IPC_CHANNELS.AVATAR_REMOVE, async () => notConfiguredResponse],
  ];

  registerFallbackHandlers(fallbackAvatarHandlers);
}

// Re-export for menu actions
export { sendMenuAction };
