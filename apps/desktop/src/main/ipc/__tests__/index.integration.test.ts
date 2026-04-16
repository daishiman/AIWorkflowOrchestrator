/**
 * registerAllIpcHandlers 統合テスト
 *
 * TASK-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001 Phase 4
 *
 * registerAllIpcHandlers() が 3 つの safety governance ハンドラ
 * （approval, disclosure, advancedConsole）を登録し、
 * DefaultApprovalGate と AdvancedConsole の DI が正しく注入されることを検証する。
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mock: electron ---
vi.mock("electron", () => ({
  BrowserWindow: {
    getAllWindows: vi.fn().mockReturnValue([]),
  },
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
    removeAllListeners: vi.fn(),
  },
  nativeTheme: {
    shouldUseDarkColors: false,
    on: vi.fn(),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn(),
  },
  net: {
    isOnline: vi.fn().mockReturnValue(true),
  },
}));

// --- Mock: 3 safety governance handler registration functions ---
vi.mock("../approvalHandlers", () => ({
  registerApprovalHandlers: vi.fn(),
}));

vi.mock("../disclosureHandlers", () => ({
  registerDisclosureHandlers: vi.fn(),
}));

vi.mock("../advancedConsoleHandlers", () => ({
  registerAdvancedConsoleHandlers: vi.fn(),
}));

// --- Mock: DefaultApprovalGate ---
const mockApprovalGateInstance = {
  grantApproval: vi.fn(),
  rejectApproval: vi.fn(),
  checkApproval: vi.fn(),
  revokeAll: vi.fn(),
};

vi.mock("../../services/runtime/ApprovalGate", () => ({
  DefaultApprovalGate: vi
    .fn()
    .mockImplementation(() => mockApprovalGateInstance),
}));

// --- Mock: すべての既存の依存関係（registerAllIpcHandlers の依存） ---
// これらは統合テストの焦点ではないため、最小限のスタブで済ませる。
vi.mock("../fileHandlers", () => ({
  registerFileHandlers: vi.fn(),
  registerFsHandlers: vi.fn(),
}));
vi.mock("../storeHandlers", () => ({
  registerStoreHandlers: vi.fn(),
  registerUserSettingsHandlers: vi.fn(),
}));
vi.mock("../dashboardHandlers", () => ({ registerDashboardHandlers: vi.fn() }));
vi.mock("../graphHandlers", () => ({ registerGraphHandlers: vi.fn() }));
vi.mock("../aiHandlers", () => ({ registerAIHandlers: vi.fn() }));
vi.mock("../windowHandlers", () => ({
  registerWindowHandlers: vi.fn(),
  sendMenuAction: vi.fn(),
}));
vi.mock("../themeHandlers", () => ({
  registerThemeHandlers: vi.fn(),
  setupThemeWatcher: vi.fn().mockReturnValue(vi.fn()),
}));
vi.mock("../authHandlers", () => ({ registerAuthHandlers: vi.fn() }));
vi.mock("../profileHandlers", () => ({ registerProfileHandlers: vi.fn() }));
vi.mock("../avatarHandlers", () => ({ registerAvatarHandlers: vi.fn() }));
vi.mock("../apiKeyHandlers", () => ({ registerApiKeyHandlers: vi.fn() }));
vi.mock("../dialogHandlers", () => ({ registerDialogHandlers: vi.fn() }));
vi.mock("../terminalHandlers", () => ({ registerTerminalHandlers: vi.fn() }));
vi.mock("../workspaceHandlers", () => ({
  registerWorkspaceHandlers: vi.fn(),
}));
vi.mock("../searchHandlers", () => ({ registerSearchHandlers: vi.fn() }));
vi.mock("../fileSelectionHandlers", () => ({
  registerFileSelectionHandlers: vi.fn(),
}));
vi.mock("../../handlers/llm", () => ({ registerLLMHandlers: vi.fn() }));
vi.mock("../historyHandlers", () => ({ registerHistoryHandlers: vi.fn() }));
vi.mock("../historySearchHandlers", () => ({
  createHistorySearchService: vi.fn().mockReturnValue({}),
  registerHistorySearchHandlers: vi.fn(),
}));
vi.mock("../notificationHandlers", () => ({
  createNotificationService: vi.fn().mockReturnValue({}),
  registerNotificationHandlers: vi.fn(),
}));
vi.mock("../../services/HistoryService", () => ({
  createHistoryServiceWithDI: vi.fn().mockReturnValue({}),
}));
vi.mock("../agentHandlers", () => ({
  registerAgentExecutionHandlers: vi.fn(),
  registerAgentSkillHandlers: vi.fn(),
}));
vi.mock("../communityHandlers", () => ({
  registerCommunityHandlers: vi.fn(),
}));
vi.mock("../skillHandlers", () => ({
  registerSkillHandlers: vi.fn(),
  registerSkillScheduleHandlers: vi.fn(),
  registerSkillDocsHandlers: vi.fn(),
  registerSkillChainHandlers: vi.fn(),
  getSkillExecutorInstance: vi.fn(),
}));
vi.mock("../skillAnalyticsHandlers", () => ({
  registerSkillAnalyticsHandlers: vi.fn(),
}));
vi.mock("../skillHandlers.share", () => ({
  registerSkillShareHandlers: vi.fn(),
}));
vi.mock("../skillDebugHandlers", () => ({
  registerSkillDebugHandlers: vi.fn(),
}));
vi.mock("../../claude-cli", () => ({
  registerClaudeCliHandlers: vi.fn(),
  getClaudeCliManager: vi.fn().mockReturnValue(null),
}));
vi.mock("../skillCreatorHandlers", () => ({
  registerSkillCreatorHandlers: vi.fn(),
}));
vi.mock("../skillFileHandlers", () => ({
  registerSkillFileHandlers: vi.fn(),
}));
vi.mock("../safetyGateHandlers", () => ({
  registerSafetyGateHandlers: vi.fn(),
}));
vi.mock("../../permissions/default-safety-gate", () => ({
  DefaultSafetyGate: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/skill/SkillCreatorService", () => ({
  SkillCreatorService: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/skill", () => ({
  SkillScanner: vi.fn().mockImplementation(() => ({})),
  SkillParser: vi.fn().mockImplementation(() => ({})),
  SkillImportManager: vi.fn().mockImplementation(() => ({})),
  SkillService: vi.fn().mockImplementation(() => ({
    executeSkill: vi.fn(),
    importManager: { importSkills: vi.fn() },
    scanAvailableSkills: vi.fn(),
    getSkillByName: vi.fn(),
  })),
  SkillValidator: vi.fn().mockImplementation(() => ({
    validateStructure: vi.fn(),
    validateSkillMd: vi.fn(),
  })),
  SkillShareManager: vi.fn().mockImplementation(() => ({})),
  PermissionStore: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/skill/SkillFileManager", () => ({
  SkillFileManager: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/skill/SkillChainStore", () => ({
  SkillChainStore: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/skill/SkillChainExecutor", () => ({
  SkillChainExecutor: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/skill/SkillDocGenerator", () => ({
  SkillDocGenerator: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/skill/LLMDocQueryAdapter", () => ({
  LLMDocQueryAdapter: vi.fn().mockImplementation(() => ({
    query: vi.fn(),
  })),
}));
vi.mock("../../services/skill/ScheduleStore", () => ({
  ScheduleStore: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/skill/SkillScheduler", () => ({
  SkillScheduler: vi.fn().mockImplementation(() => ({
    initialize: vi.fn(),
  })),
}));
vi.mock("../../services/skill/AnalyticsStore", () => ({
  AnalyticsStore: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/skill/SkillAnalytics", () => ({
  SkillAnalytics: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../permission-store-handlers", () => ({
  registerPermissionStoreHandlers: vi.fn(),
}));
vi.mock("../authModeHandlers", () => ({
  registerAuthModeHandlers: vi.fn(),
}));
vi.mock("../authKeyHandlers", () => ({
  registerAuthKeyHandlers: vi.fn(),
  unregisterAuthKeyHandlers: vi.fn(),
}));
vi.mock("../../services/auth", () => ({
  AuthKeyService: vi.fn().mockImplementation(() => ({
    getKey: vi.fn(),
  })),
  createAuthKeyStorage: vi.fn().mockReturnValue({}),
  createAuthModeService: vi.fn().mockReturnValue({}),
  StubSubscriptionAuthProvider: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../infrastructure", () => ({
  getSupabaseClient: vi.fn().mockReturnValue(null),
  createSecureStorage: vi.fn(),
  createProfileCache: vi.fn(),
  createApiKeyStorage: vi.fn().mockReturnValue({}),
  createStubSharedHistoryService: vi.fn().mockReturnValue({}),
  createStubLogRepository: vi.fn().mockReturnValue({}),
  createStubLogger: vi.fn().mockReturnValue({}),
}));
vi.mock("../chatEditHandlers", () => ({
  registerChatEditHandlers: vi.fn(),
}));
vi.mock("../../services/chat-edit", () => ({
  FileService: vi.fn().mockImplementation(() => ({})),
  ContextBuilder: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/chat-edit/RuntimeResolver", () => ({
  RuntimeResolver: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/runtime/RuntimePolicyResolver", () => ({
  RuntimePolicyResolver: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/runtime/RuntimeSkillCreatorFacade", () => ({
  RuntimeSkillCreatorFacade: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../beforeQuitGuard", () => ({
  registerBeforeQuitGuard: vi.fn().mockReturnValue(vi.fn()),
}));
vi.mock("../../services/runtime/SkillCreatorSourceResolver", () => ({
  SkillCreatorSourceResolver: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/runtime/PhaseResourcePlanner", () => ({
  PhaseResourcePlanner: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/runtime/ResolvedResourceReader", () => ({
  ResolvedResourceReader: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/skill/SkillFileWriter", () => ({
  SkillFileWriter: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/skill/ResourceLoader", () => ({
  ResourceLoader: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/skill/constants", () => ({
  DEFAULT_SKILL_CREATOR_PATH: "/tmp/test",
}));
vi.mock("../../adapters/llm/LLMAdapterFactory", () => ({
  LLMAdapterFactory: { getAdapter: vi.fn() },
}));
vi.mock("better-sqlite3", () => ({
  default: vi.fn(),
}));
vi.mock("../../slide/ipc-handlers", () => ({
  registerSlideIpcHandlers: vi.fn(),
  unregisterSlideIpcHandlers: vi.fn(),
}));
vi.mock("../conversationHandlers", () => ({
  registerConversationHandlers: vi.fn(),
  registerChatExportHandlers: vi.fn(),
}));
vi.mock("../../repositories/conversationRepository", () => ({
  ConversationRepository: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../database/conversationDatabase", () => ({
  initializeConversationDatabase: vi.fn().mockReturnValue({}),
}));
vi.mock("electron-store", () => ({
  default: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("fs/promises", () => ({
  default: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
    mkdir: vi.fn(),
    cp: vi.fn(),
    access: vi.fn(),
    realpath: vi.fn(),
  },
}));

// --- Import SUT & mocked modules ---
import { BrowserWindow } from "electron";
import { registerAllIpcHandlers } from "../index";
import { registerApprovalHandlers } from "../approvalHandlers";
import { registerDisclosureHandlers } from "../disclosureHandlers";
import { registerAdvancedConsoleHandlers } from "../advancedConsoleHandlers";
import { DefaultApprovalGate } from "../../services/runtime/ApprovalGate";
import { getClaudeCliManager } from "../../claude-cli";
import { getSkillExecutorInstance } from "../skillHandlers";
import { RuntimePolicyResolver } from "../../services/runtime/RuntimePolicyResolver";
import { RuntimeSkillCreatorFacade } from "../../services/runtime/RuntimeSkillCreatorFacade";
import type { HealthPolicy } from "@repo/shared/types";

describe("registerAllIpcHandlers - Safety Governance Integration", () => {
  let mockMainWindow: BrowserWindow;

  beforeEach(() => {
    vi.clearAllMocks();

    mockMainWindow = {
      webContents: { id: 1, isDestroyed: vi.fn().mockReturnValue(false) },
      isDestroyed: vi.fn().mockReturnValue(false),
    } as unknown as BrowserWindow;
  });

  it("registerApprovalHandlers が呼ばれること", () => {
    registerAllIpcHandlers(mockMainWindow);

    expect(registerApprovalHandlers).toHaveBeenCalledTimes(1);
  });

  it("registerDisclosureHandlers が呼ばれること", () => {
    registerAllIpcHandlers(mockMainWindow);

    expect(registerDisclosureHandlers).toHaveBeenCalledTimes(1);
  });

  it("registerAdvancedConsoleHandlers が呼ばれること", () => {
    registerAllIpcHandlers(mockMainWindow);

    expect(registerAdvancedConsoleHandlers).toHaveBeenCalledTimes(1);
  });

  it("DefaultApprovalGate がインスタンス化されること", () => {
    registerAllIpcHandlers(mockMainWindow);

    expect(DefaultApprovalGate).toHaveBeenCalledTimes(1);
  });

  it("registerApprovalHandlers に mainWindow と ApprovalGate インスタンスが渡されること", () => {
    registerAllIpcHandlers(mockMainWindow);

    expect(registerApprovalHandlers).toHaveBeenCalledWith(
      mockMainWindow,
      mockApprovalGateInstance,
    );
  });

  it("registerDisclosureHandlers に mainWindow を含む deps が渡されること", () => {
    registerAllIpcHandlers(mockMainWindow);

    const call = vi.mocked(registerDisclosureHandlers).mock.calls[0];
    expect(call).toBeDefined();
    // deps.mainWindow が渡されていることを検証
    const deps = call[0] as { mainWindow: BrowserWindow };
    expect(deps.mainWindow).toBe(mockMainWindow);
  });

  it("registerAdvancedConsoleHandlers に mainWindow を含む deps が渡されること", () => {
    registerAllIpcHandlers(mockMainWindow);

    const call = vi.mocked(registerAdvancedConsoleHandlers).mock.calls[0];
    expect(call).toBeDefined();
    const deps = call[0] as { mainWindow: BrowserWindow };
    expect(deps.mainWindow).toBe(mockMainWindow);
  });

  it("registerAdvancedConsoleHandlers の callback が manager 未初期化時に graceful fallback すること", async () => {
    registerAllIpcHandlers(mockMainWindow);

    const call = vi.mocked(registerAdvancedConsoleHandlers).mock.calls[0];
    expect(call).toBeDefined();
    const deps = call[0] as {
      getTerminalLog: (sessionId: string) => Promise<string[]>;
      getCopyCommand: (sessionId: string) => Promise<string | null>;
    };

    await expect(deps.getTerminalLog("session-1")).resolves.toEqual([]);
    await expect(deps.getCopyCommand("session-1")).resolves.toBeNull();
  });

  it("registerAdvancedConsoleHandlers の getCopyCommand が実際の launch command を返すこと", async () => {
    vi.mocked(getClaudeCliManager).mockReturnValue({
      getSession: vi.fn().mockResolvedValue({
        success: true,
        data: {
          scriptPath: "/path/to/skill.js",
          args: ["--flag", "value"],
        },
      }),
    } as never);

    registerAllIpcHandlers(mockMainWindow);

    const call = vi.mocked(registerAdvancedConsoleHandlers).mock.calls[0];
    expect(call).toBeDefined();
    const deps = call[0] as {
      getCopyCommand: (sessionId: string) => Promise<string | null>;
    };

    await expect(deps.getCopyCommand("session-1")).resolves.toBe(
      "node /path/to/skill.js --flag value",
    );
  });

  it("3 つの safety governance ハンドラの登録が result.successCount に含まれること", () => {
    const result = registerAllIpcHandlers(mockMainWindow);

    // 3 つのハンドラが成功としてカウントされるべき
    // 厳密な数は既存ハンドラ数によるが、failures に含まれないことを確認
    const failedNames = result.failures.map((f) => f.handlerName);
    expect(failedNames).not.toContain("registerApprovalHandlers");
    expect(failedNames).not.toContain("registerDisclosureHandlers");
    expect(failedNames).not.toContain("registerAdvancedConsoleHandlers");
  });

  it("healthPolicy 未指定時は既定 policy が RuntimePolicyResolver と RuntimeSkillCreatorFacade の両方に渡ること", () => {
    vi.mocked(getSkillExecutorInstance).mockReturnValueOnce({} as never);

    registerAllIpcHandlers(mockMainWindow);

    const resolverCall = vi.mocked(RuntimePolicyResolver).mock.calls[0];
    const facadeCall = vi.mocked(RuntimeSkillCreatorFacade).mock.calls[0];
    expect(resolverCall).toBeDefined();
    expect(facadeCall).toBeDefined();

    const injectedResolverPolicy = resolverCall?.[2];
    const injectedFacadeDeps = facadeCall?.[0] as {
      healthPolicy?: HealthPolicy;
    };

    expect(injectedResolverPolicy).toEqual(
      expect.objectContaining({
        isConnectionAvailable: false,
        isDegraded: false,
        isRateLimited: false,
        healthStatus: "unknown",
        lastCheckedAt: null,
      }),
    );
    expect(injectedFacadeDeps.healthPolicy).toBe(injectedResolverPolicy);
  });

  it("healthPolicy 指定時は明示 policy が RuntimePolicyResolver と RuntimeSkillCreatorFacade の両方に渡ること", () => {
    vi.mocked(getSkillExecutorInstance).mockReturnValueOnce({} as never);
    const customHealthPolicy: HealthPolicy = {
      isConnectionAvailable: true,
      isDegraded: true,
      isRateLimited: true,
      healthStatus: "degraded",
      lastCheckedAt: new Date("2026-04-14T09:00:00.000Z"),
      errorDetail: "custom policy",
    };

    registerAllIpcHandlers(mockMainWindow, undefined, {
      healthPolicy: customHealthPolicy,
    });

    const resolverCall = vi.mocked(RuntimePolicyResolver).mock.calls[0];
    const facadeCall = vi.mocked(RuntimeSkillCreatorFacade).mock.calls[0];
    expect(resolverCall).toBeDefined();
    expect(facadeCall).toBeDefined();

    const injectedResolverPolicy = resolverCall?.[2];
    const injectedFacadeDeps = facadeCall?.[0] as {
      healthPolicy?: HealthPolicy;
    };

    expect(injectedResolverPolicy).toBe(customHealthPolicy);
    expect(injectedFacadeDeps.healthPolicy).toBe(customHealthPolicy);
  });
});

describe("registerAllIpcHandlers - Phase 6: エッジケーステスト", () => {
  let mockMainWindow: BrowserWindow;

  beforeEach(() => {
    vi.clearAllMocks();

    mockMainWindow = {
      webContents: { id: 1, isDestroyed: vi.fn().mockReturnValue(false) },
      isDestroyed: vi.fn().mockReturnValue(false),
    } as unknown as BrowserWindow;
  });

  it("registerAllIpcHandlers を複数回呼んでも安全であること（二重登録なし）", () => {
    const result1 = registerAllIpcHandlers(mockMainWindow);
    const result2 = registerAllIpcHandlers(mockMainWindow);

    // 両方とも結果を返す（例外なし）
    expect(result1).toBeDefined();
    expect(result2).toBeDefined();

    // 各ハンドラが2回呼ばれている（冪等性は各ハンドラの責務）
    expect(registerApprovalHandlers).toHaveBeenCalledTimes(2);
    expect(registerDisclosureHandlers).toHaveBeenCalledTimes(2);
    expect(registerAdvancedConsoleHandlers).toHaveBeenCalledTimes(2);
  });

  it("DefaultApprovalGate が毎回新しいインスタンスで生成されること", () => {
    registerAllIpcHandlers(mockMainWindow);
    registerAllIpcHandlers(mockMainWindow);

    // 2回のインスタンス化
    expect(DefaultApprovalGate).toHaveBeenCalledTimes(2);
  });

  it("registerApprovalHandlers に渡される approvalGate が IApprovalGate を満たすこと", () => {
    registerAllIpcHandlers(mockMainWindow);

    const call = vi.mocked(registerApprovalHandlers).mock.calls[0];
    const gate = call[1] as unknown as Record<string, unknown>;

    expect(typeof gate.grantApproval).toBe("function");
    expect(typeof gate.rejectApproval).toBe("function");
    expect(typeof gate.checkApproval).toBe("function");
    expect(typeof gate.revokeAll).toBe("function");
  });
});
