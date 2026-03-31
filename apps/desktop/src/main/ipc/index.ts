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
import { registerTerminalHandlers } from "./terminalHandlers";
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
  getSkillExecutorInstance,
} from "./skillHandlers";
import { registerSkillAnalyticsHandlers } from "./skillAnalyticsHandlers";
import { registerSkillShareHandlers } from "./skillHandlers.share";
import { registerSkillDebugHandlers } from "./skillDebugHandlers";
import { registerClaudeCliHandlers } from "../claude-cli";
import { registerSkillCreatorHandlers } from "./skillCreatorHandlers";
import { registerSkillFileHandlers } from "./skillFileHandlers";
import { registerSafetyGateHandlers } from "./safetyGateHandlers";
import { registerApprovalHandlers } from "./approvalHandlers";
import { registerDisclosureHandlers } from "./disclosureHandlers";
import { registerAdvancedConsoleHandlers } from "./advancedConsoleHandlers";
import { DefaultApprovalGate } from "../services/runtime/ApprovalGate";
import { DefaultSafetyGate } from "../permissions/default-safety-gate";
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
import { LLMDocQueryAdapter } from "../services/skill/LLMDocQueryAdapter";
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
  StubSubscriptionAuthProvider,
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
import { FileService, ContextBuilder } from "../services/chat-edit";
import { RuntimeResolver as ChatEditRuntimeResolver } from "../services/chat-edit/RuntimeResolver";
import { RuntimePolicyResolver } from "../services/runtime/RuntimePolicyResolver";
import { RuntimeSkillCreatorFacade } from "../services/runtime/RuntimeSkillCreatorFacade";
import { SkillCreatorSourceResolver } from "../services/runtime/SkillCreatorSourceResolver";
import { PhaseResourcePlanner } from "../services/runtime/PhaseResourcePlanner";
import { ResolvedResourceReader } from "../services/runtime/ResolvedResourceReader";
import { SkillFileWriter } from "../services/skill/SkillFileWriter";
import { ResourceLoader } from "../services/skill/ResourceLoader";
import { DEFAULT_SKILL_CREATOR_PATH } from "../services/skill/constants";
import { LLMAdapterFactory } from "../adapters/llm/LLMAdapterFactory";
import Database from "better-sqlite3";
import {
  registerSlideIpcHandlers,
  unregisterSlideIpcHandlers,
} from "../slide/ipc-handlers";
import { registerConversationHandlers } from "./conversationHandlers";
import { ConversationRepository } from "../repositories/conversationRepository";
import { initializeConversationDatabase } from "../database/conversationDatabase";
import {
  AUTH_ERROR_CODES,
  PROFILE_ERROR_CODES,
  AVATAR_ERROR_CODES,
} from "@repo/shared/types/auth";
import type { ShareError, ShareResult } from "@repo/shared";

// setupThemeWatcher の unsubscribe 関数をモジュールスコープで保持
let themeWatcherUnsubscribe: (() => void) | null = null;

/** ハンドラ登録失敗情報 */
export interface HandlerRegistrationFailure {
  handlerName: string;
  errorMessage: string;
  errorCode: number;
}

/** registerAllIpcHandlers の戻り値 */
export interface IpcHandlerRegistrationResult {
  successCount: number;
  failureCount: number;
  failures: HandlerRegistrationFailure[];
}

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

  // slide handlers は内部状態 (watcher/executor/syncManager) を持つため専用解除
  unregisterSlideIpcHandlers();

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
 * 個別ハンドラ登録を try-catch で囲み、失敗時にログ出力と記録を行う
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeRegistrationErrorMessage(message: string): string {
  if (message.length === 0) {
    return message;
  }

  let sanitized = message;
  const homeDir = process.env.HOME || process.env.USERPROFILE || "";
  const normalizedHomeDir = homeDir.replace(/\\/g, "/");
  const homeRoots = new Set<string>();

  if (homeDir) {
    homeRoots.add(homeDir);
  }
  if (normalizedHomeDir) {
    homeRoots.add(normalizedHomeDir);
  }

  const inferredHomeRoot = normalizedHomeDir.match(
    /^(?:[A-Za-z]:\/Users\/[^/]+|\/Users\/[^/]+|\/home\/[^/]+)/,
  );
  if (inferredHomeRoot?.[0]) {
    homeRoots.add(inferredHomeRoot[0]);
  }

  for (const homeRoot of [...homeRoots].sort(
    (left, right) => right.length - left.length,
  )) {
    sanitized = sanitized.replace(new RegExp(escapeRegExp(homeRoot), "g"), "~");
  }

  return sanitized.replace(
    /(?:[A-Za-z]:\\Users\\[^\\/\s]+|[A-Za-z]:\/Users\/[^/\s]+|\/Users\/[^/\s]+|\/home\/[^/\s]+)/g,
    "~",
  );
}

function safeRegister(
  handlerName: string,
  registerFn: () => void,
  failures: HandlerRegistrationFailure[],
): boolean {
  try {
    registerFn();
    return true;
  } catch (error: unknown) {
    const errorMessage = sanitizeRegistrationErrorMessage(
      error instanceof Error ? error.message : "Unknown error",
    );
    console.error(`[IPC] Failed to register ${handlerName}: ${errorMessage}`);
    failures.push({
      handlerName,
      errorMessage,
      errorCode: 4001,
    });
    return false;
  }
}

/**
 * Register all IPC handlers
 * Call this after the main window is created
 *
 * @param mainWindow - The main BrowserWindow instance
 * @param conversationDb - Optional pre-initialized SQLite database for conversations.
 *   - If a Database instance is provided, it will be used directly (DI path).
 *   - If undefined or null, the internal initialization path is used (backward-compatible).
 */
export function registerAllIpcHandlers(
  mainWindow: BrowserWindow,
  conversationDb?: Database.Database | null,
): IpcHandlerRegistrationResult {
  const failures: HandlerRegistrationFailure[] = [];
  let successCount = 0;

  const track = (name: string, fn: () => void): void => {
    if (safeRegister(name, fn, failures)) {
      successCount++;
    }
  };

  // --- 1. 依存なしハンドラ ---
  const independentHandlers: ReadonlyArray<readonly [string, () => void]> = [
    ["registerFileHandlers", () => registerFileHandlers()],
    ["registerStoreHandlers", () => registerStoreHandlers()],
    ["registerDashboardHandlers", () => registerDashboardHandlers()],
    ["registerGraphHandlers", () => registerGraphHandlers()],
    ["registerAIHandlers", () => registerAIHandlers()],
    ["registerTerminalHandlers", () => registerTerminalHandlers()],
    ["registerThemeHandlers", () => registerThemeHandlers()],
    ["registerWorkspaceHandlers", () => registerWorkspaceHandlers()],
    ["registerSearchHandlers", () => registerSearchHandlers()],
    ["registerFileSelectionHandlers", () => registerFileSelectionHandlers()],
    ["registerLLMHandlers", () => registerLLMHandlers()],
    ["registerCommunityHandlers", () => registerCommunityHandlers()],
  ];
  for (const [name, fn] of independentHandlers) {
    track(name, fn);
  }

  // --- 2. mainWindow 依存ハンドラ ---
  track("registerWindowHandlers", () => registerWindowHandlers(mainWindow));
  track("registerDialogHandlers", () => registerDialogHandlers(mainWindow));

  // --- 2.5. Slide IPC handlers (D1 fix) ---
  track("registerSlideIpcHandlers", () => registerSlideIpcHandlers(mainWindow));

  // --- 3. Theme watcher ---
  // setupThemeWatcher は unsubscribe 関数を返すため個別に扱う
  try {
    themeWatcherUnsubscribe = setupThemeWatcher(nativeTheme, () =>
      BrowserWindow.getAllWindows(),
    );
    successCount++;
  } catch (error: unknown) {
    const errorMessage = sanitizeRegistrationErrorMessage(
      error instanceof Error ? error.message : "Unknown error",
    );
    console.error(
      `[IPC] Failed to register setupThemeWatcher: ${errorMessage}`,
    );
    failures.push({
      handlerName: "setupThemeWatcher",
      errorMessage,
      errorCode: 4001,
    });
  }

  // --- 4. Supabase 条件分岐 ---
  const supabase = getSupabaseClient();
  if (supabase) {
    const secureStorage = createSecureStorage();
    const profileCache = createProfileCache();

    track("registerAuthHandlers", () =>
      registerAuthHandlers(mainWindow, supabase, secureStorage),
    );
    track("registerProfileHandlers", () =>
      registerProfileHandlers(mainWindow, supabase, profileCache),
    );
    track("registerAvatarHandlers", () =>
      registerAvatarHandlers(mainWindow, supabase),
    );
  } else {
    console.warn(
      "[IPC] Auth, profile, and avatar handlers not registered - Supabase not configured",
    );
    // Register fallback handlers when Supabase is not configured
    track("registerAuthFallbackHandlers", () => registerAuthFallbackHandlers());
    track("registerProfileFallbackHandlers", () =>
      registerProfileFallbackHandlers(),
    );
    track("registerAvatarFallbackHandlers", () =>
      registerAvatarFallbackHandlers(),
    );
  }

  // --- 5. API Key handlers ---
  const apiKeyStorage = createApiKeyStorage();
  track("registerApiKeyHandlers", () =>
    registerApiKeyHandlers(mainWindow, apiKeyStorage),
  );

  // --- 6. History handlers ---
  track("registerHistoryHandlers", () => {
    const sharedHistoryService = createStubSharedHistoryService();
    const logRepository = createStubLogRepository();
    const historyLogger = createStubLogger();
    const historyService = createHistoryServiceWithDI(
      sharedHistoryService,
      logRepository,
      historyLogger,
    );
    registerHistoryHandlers(mainWindow, historyService);
  });
  track("registerHistorySearchHandlers", () =>
    registerHistorySearchHandlers(createHistorySearchService(), { mainWindow }),
  );
  track("registerNotificationHandlers", () =>
    registerNotificationHandlers(createNotificationService(), { mainWindow }),
  );

  // --- 7. Agent Execution handlers (runtime policy injected below after auth setup) ---

  // --- 8. Auth Key service + RuntimePolicyResolver + Skill 系ハンドラ ---
  const authKeyStorage = createAuthKeyStorage();
  const authKeyService = new AuthKeyService(authKeyStorage);

  // 共通 RuntimePolicyResolver（1回だけ生成 — central policy の authority）
  const subscriptionAuthProvider = new StubSubscriptionAuthProvider();
  const authModeServiceForRuntime = createAuthModeService(
    authKeyService,
    subscriptionAuthProvider,
  );
  const runtimePolicyResolver = new RuntimePolicyResolver(
    authKeyService,
    subscriptionAuthProvider,
  );

  // Agent Execution handlers (RuntimePolicyResolver 注入)
  track("registerAgentExecutionHandlers", () =>
    registerAgentExecutionHandlers(
      mainWindow,
      undefined,
      runtimePolicyResolver,
      authModeServiceForRuntime,
    ),
  );

  // Skill Management handlers (SKILL-IPC-001)
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

  track("registerSkillHandlers", () =>
    registerSkillHandlers(
      mainWindow,
      skillService,
      authKeyService,
      runtimePolicyResolver,
      authModeServiceForRuntime,
    ),
  );

  // Skill File handlers (TASK-9A-B)
  const skillFileManager = new SkillFileManager();
  track("registerSkillFileHandlers", () =>
    registerSkillFileHandlers(mainWindow, skillFileManager, skillService),
  );

  // Skill Share handlers (TASK-9F)
  track("registerSkillShareHandlers", () => {
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
        cp: (src: string, dest: string) =>
          fs.cp(src, dest, { recursive: true }),
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
  });

  track("registerSkillDebugHandlers", () =>
    registerSkillDebugHandlers(mainWindow),
  );

  // Skill Schedule handlers (TASK-9G)
  track("registerSkillScheduleHandlers", () => {
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
  });

  // Skill Docs handlers (TASK-9I)
  track("registerSkillDocsHandlers", () => {
    const adapter = new LLMDocQueryAdapter(
      () => authKeyService.getKey(),
      "anthropic",
    );
    const queryFn = async (prompt: string) => {
      const result = await adapter.query(prompt);
      if (result.success && result.data !== undefined) {
        return { content: result.data };
      }
      throw new Error(result.error?.message ?? "LLM query failed");
    };
    const skillDocGenerator = new SkillDocGeneratorCls(
      queryFn,
      skillFileManager,
    );
    registerSkillDocsHandlers(mainWindow, skillDocGenerator);
  });

  // Skill Analytics handlers (TASK-9J)
  track("registerSkillAnalyticsHandlers", () => {
    const analyticsStore = new AnalyticsStore();
    const skillAnalytics = new SkillAnalytics(analyticsStore);
    registerSkillAnalyticsHandlers(mainWindow, skillAnalytics);
  });

  // Skill Chain handlers (TASK-9D / TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001)
  track("registerSkillChainHandlers", () => {
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
  });

  // Permission Store handlers (TASK-3-1-E)
  const permissionStore = new PermissionStore();
  track("registerPermissionStoreHandlers", () => {
    registerPermissionStoreHandlers(mainWindow, permissionStore);
  });

  // Safety Gate handlers (TASK-SAFETY-GATE)
  track("registerSafetyGateHandlers", () => {
    const safetyGate = new DefaultSafetyGate({
      permissionStore,
      metadataProvider: {
        getRequiredTools: async () => [],
        getAccessPaths: async () => [],
      },
      protectedPaths: [
        "/etc",
        "/usr",
        "/var",
        "/sys",
        "/proc",
        "/boot",
        "/root",
      ],
    });
    registerSafetyGateHandlers(mainWindow, safetyGate);
  });

  // Safety Governance handlers (UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001)
  const approvalGate = new DefaultApprovalGate();
  track("registerApprovalHandlers", () =>
    registerApprovalHandlers(mainWindow, approvalGate),
  );
  // TODO(DI): Replace getDisclosureInfo with actual service when available.
  //   Current placeholder returns static metadata.
  //   Production implementation should read from LLM provider config.
  track("registerDisclosureHandlers", () =>
    registerDisclosureHandlers({
      mainWindow,
      getDisclosureInfo: async () => ({
        aiServiceName: "anthropic",
        modelName: "claude-sonnet",
        externalDestinations: [],
      }),
    }),
  );
  // TODO(DI): Replace getTerminalLog / getCopyCommand with actual session log service when available.
  //   Current placeholders return empty data.
  //   Production implementation should read from ClaudeCliManager session logs.
  track("registerAdvancedConsoleHandlers", () =>
    registerAdvancedConsoleHandlers({
      mainWindow,
      getTerminalLog: async (_sessionId: string) => [],
      getCopyCommand: async (_sessionId: string) => null,
    }),
  );

  // --- 9. Auth Mode handlers ---
  track("registerAuthKeyHandlers", () =>
    registerAuthKeyHandlers(mainWindow, authKeyService),
  );
  track("registerAuthModeHandlers", () => {
    const authModeService = createAuthModeService(authKeyService);
    registerAuthModeHandlers(mainWindow, authModeService);
  });

  // --- 10. Skill Creator handlers ---
  track("registerSkillCreatorHandlers", () => {
    const skillCreatorService = new SkillCreatorService();
    const skillExecutor = getSkillExecutorInstance();
    if (!skillExecutor) {
      console.warn(
        "[IPC] SkillExecutor not available, runtime skill creator handlers will stay degraded",
      );
    }
    const skillFileWriter = new SkillFileWriter(skillBasePath);
    const resourceLoader = new ResourceLoader(DEFAULT_SKILL_CREATOR_PATH);
    const sourceResolver = new SkillCreatorSourceResolver();
    const resourcePlanner = new PhaseResourcePlanner();
    const resolvedResourceReader = new ResolvedResourceReader(resourceLoader);
    const runtimeSkillCreatorService = skillExecutor
      ? new RuntimeSkillCreatorFacade({
          skillExecutor,
          authKeyService,
          skillFileWriter,
          resourceLoader,
          sourceResolver,
          resourcePlanner,
          resolvedResourceReader,
          skillFileManager, // improve() / applyImprovement() で SKILL.md 読み書きに使用
        })
      : undefined;

    // LLMAdapter を非同期で取得し Setter Injection（fire-and-forget — P34 準拠）
    if (runtimeSkillCreatorService) {
      void (async () => {
        try {
          const adapter = await LLMAdapterFactory.getAdapter("anthropic");
          runtimeSkillCreatorService.setLLMAdapter(adapter);
        } catch (error: unknown) {
          const reason = error instanceof Error ? error.message : String(error);
          console.warn("[IPC] LLMAdapter initialization failed:", reason);
          runtimeSkillCreatorService.setLLMAdapterFailed(reason);
        }
      })();
    }

    registerSkillCreatorHandlers(
      mainWindow,
      skillCreatorService,
      runtimeSkillCreatorService,
    );
  });

  // --- 11. Claude CLI handlers ---
  track("registerClaudeCliHandlers", () =>
    registerClaudeCliHandlers(mainWindow, {
      onSessionDestroyed: (sessionId: string) => {
        approvalGate.revokeAll(sessionId);
      },
    }),
  );

  // --- 12. Chat Edit handlers ---
  track("registerChatEditHandlers", () => {
    const fileService = new FileService();
    const contextBuilder = new ContextBuilder();
    const chatEditResolver = new ChatEditRuntimeResolver(
      authKeyService,
      authModeServiceForRuntime,
    );
    registerChatEditHandlers(
      mainWindow,
      contextBuilder,
      fileService,
      chatEditResolver,
    );
  });

  // --- 13. Conversation handlers ---
  let conversationRegistered: boolean;
  if (conversationDb != null) {
    // DI path: 外部から注入された DB インスタンスを使用
    conversationRegistered = safeRegister(
      "registerConversationHandlers",
      () => {
        const conversationRepository = new ConversationRepository(
          conversationDb,
        );
        registerConversationHandlers(conversationRepository);
      },
      failures,
    );
  } else {
    // 後方互換パス: undefined/null の場合は initializeConversationDatabase() で初期化
    conversationRegistered = safeRegister(
      "registerConversationHandlers",
      () => {
        const db = initializeConversationDatabase();
        const conversationRepository = new ConversationRepository(db);
        registerConversationHandlers(conversationRepository);
      },
      failures,
    );
  }
  if (conversationRegistered) {
    successCount++;
  } else {
    track("registerConversationFallbackHandlers", () =>
      registerConversationFallbackHandlers(),
    );
  }

  // --- サマリーログ ---
  if (failures.length > 0) {
    console.error(
      `[IPC] Handler registration completed with ${failures.length} failure(s): ${failures.map((f) => f.handlerName).join(", ")}`,
    );
  }

  return {
    successCount,
    failureCount: failures.length,
    failures,
  };
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

/**
 * Register fallback conversation handlers when database initialization fails
 * These handlers return appropriate "database not available" responses
 */
function registerConversationFallbackHandlers(): void {
  const dbNotAvailableResponse = {
    success: false as const,
    error: {
      code: "DB_NOT_AVAILABLE",
      message: "Conversation database is not available",
    },
  };
  const fallbackConversationHandlers: ReadonlyArray<FallbackHandler> = [
    [IPC_CHANNELS.CONVERSATION_LIST, async () => dbNotAvailableResponse],
    [IPC_CHANNELS.CONVERSATION_GET, async () => dbNotAvailableResponse],
    [IPC_CHANNELS.CONVERSATION_CREATE, async () => dbNotAvailableResponse],
    [IPC_CHANNELS.CONVERSATION_UPDATE, async () => dbNotAvailableResponse],
    [IPC_CHANNELS.CONVERSATION_DELETE, async () => dbNotAvailableResponse],
    [IPC_CHANNELS.CONVERSATION_ADD_MESSAGE, async () => dbNotAvailableResponse],
    [IPC_CHANNELS.CONVERSATION_SEARCH, async () => dbNotAvailableResponse],
  ];
  registerFallbackHandlers(fallbackConversationHandlers);
}

// Re-export for menu actions
export { sendMenuAction };
