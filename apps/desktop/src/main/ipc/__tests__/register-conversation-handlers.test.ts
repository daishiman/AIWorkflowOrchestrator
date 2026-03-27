/**
 * Conversation IPC Handler Registration Tests
 *
 * TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION: Phase 4 - テスト作成
 *
 * registerAllIpcHandlers() 内での conversation ハンドラ登録を検証する。
 * - DB 初期化成功時: registerConversationHandlers が呼ばれる
 * - DB 初期化失敗時: フォールバック7チャンネルが登録される
 * - unregister 後: conversation チャンネルが解除される
 *
 * ipc-graceful-degradation.test.ts の vi.hoisted + vi.mock パターンを踏襲。
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// --- vi.hoisted でモック変数を定義（ホイスティング対応） ---
const {
  mockIpcMainHandle,
  mockIpcMainRemoveHandler,
  mockIpcMainOn,
  mockIpcMainRemoveAllListeners,
  mockBrowserWindowInstance,
  mockGetAllWindows,
  mockNativeThemeOn,
  mockNativeThemeRemoveListener,
  mockThemeUnsubscribe,
  mockRegisterFileHandlers,
  mockRegisterStoreHandlers,
  mockRegisterDashboardHandlers,
  mockRegisterGraphHandlers,
  mockRegisterAIHandlers,
  mockRegisterThemeHandlers,
  mockRegisterWorkspaceHandlers,
  mockRegisterSearchHandlers,
  mockRegisterFileSelectionHandlers,
  mockRegisterLLMHandlers,
  mockRegisterCommunityHandlers,
  mockRegisterWindowHandlers,
  mockRegisterDialogHandlers,
  mockSetupThemeWatcher,
  mockRegisterAuthHandlers,
  mockRegisterProfileHandlers,
  mockRegisterAvatarHandlers,
  mockRegisterApiKeyHandlers,
  mockRegisterHistoryHandlers,
  mockRegisterHistorySearchHandlers,
  mockRegisterNotificationHandlers,
  mockRegisterAgentExecutionHandlers,
  mockRegisterSkillHandlers,
  mockRegisterSkillFileHandlers,
  mockRegisterSkillShareHandlers,
  mockRegisterSkillDebugHandlers,
  mockRegisterSkillScheduleHandlers,
  mockRegisterSkillDocsHandlers,
  mockRegisterSkillAnalyticsHandlers,
  mockRegisterSkillChainHandlers,
  mockRegisterPermissionStoreHandlers,
  mockRegisterAuthKeyHandlers,
  mockRegisterAuthModeHandlers,
  mockRegisterSkillCreatorHandlers,
  mockRegisterClaudeCliHandlers,
  mockRegisterChatEditHandlers,
  // Conversation-specific mocks
  mockDatabaseInstance,
  mockDatabaseConstructor,
  mockRegisterConversationHandlers,
  mockConversationRepositoryConstructor,
} = vi.hoisted(() => {
  const mockWebContentsSend = vi.fn();
  const mockIsDestroyed = vi.fn().mockReturnValue(false);
  const mockBrowserWindowInstance = {
    webContents: { send: mockWebContentsSend },
    isDestroyed: mockIsDestroyed,
  };
  const mockDatabaseInstance = {
    pragma: vi.fn(),
    exec: vi.fn(),
    close: vi.fn(),
  };
  return {
    mockIpcMainHandle: vi.fn(),
    mockIpcMainRemoveHandler: vi.fn(),
    mockIpcMainOn: vi.fn(),
    mockIpcMainRemoveAllListeners: vi.fn(),
    mockWebContentsSend,
    mockIsDestroyed,
    mockBrowserWindowInstance,
    mockGetAllWindows: vi.fn().mockReturnValue([mockBrowserWindowInstance]),
    mockNativeThemeOn: vi.fn(),
    mockNativeThemeRemoveListener: vi.fn(),
    mockThemeUnsubscribe: vi.fn(),
    mockRegisterFileHandlers: vi.fn(),
    mockRegisterStoreHandlers: vi.fn(),
    mockRegisterDashboardHandlers: vi.fn(),
    mockRegisterGraphHandlers: vi.fn(),
    mockRegisterAIHandlers: vi.fn(),
    mockRegisterThemeHandlers: vi.fn(),
    mockRegisterWorkspaceHandlers: vi.fn(),
    mockRegisterSearchHandlers: vi.fn(),
    mockRegisterFileSelectionHandlers: vi.fn(),
    mockRegisterLLMHandlers: vi.fn(),
    mockRegisterCommunityHandlers: vi.fn(),
    mockRegisterWindowHandlers: vi.fn(),
    mockRegisterDialogHandlers: vi.fn(),
    mockSetupThemeWatcher: vi.fn(),
    mockRegisterAuthHandlers: vi.fn(),
    mockRegisterProfileHandlers: vi.fn(),
    mockRegisterAvatarHandlers: vi.fn(),
    mockRegisterApiKeyHandlers: vi.fn(),
    mockRegisterHistoryHandlers: vi.fn(),
    mockRegisterHistorySearchHandlers: vi.fn(),
    mockRegisterNotificationHandlers: vi.fn(),
    mockRegisterAgentExecutionHandlers: vi.fn(),
    mockRegisterSkillHandlers: vi.fn(),
    mockRegisterSkillFileHandlers: vi.fn(),
    mockRegisterSkillShareHandlers: vi.fn(),
    mockRegisterSkillDebugHandlers: vi.fn(),
    mockRegisterSkillScheduleHandlers: vi.fn(),
    mockRegisterSkillDocsHandlers: vi.fn(),
    mockRegisterSkillAnalyticsHandlers: vi.fn(),
    mockRegisterSkillChainHandlers: vi.fn(),
    mockRegisterPermissionStoreHandlers: vi.fn(),
    mockRegisterAuthKeyHandlers: vi.fn(),
    mockRegisterAuthModeHandlers: vi.fn(),
    mockRegisterSkillCreatorHandlers: vi.fn(),
    mockRegisterClaudeCliHandlers: vi.fn(),
    mockRegisterChatEditHandlers: vi.fn(),
    // Conversation-specific
    mockDatabaseInstance,
    mockDatabaseConstructor: vi.fn().mockReturnValue(mockDatabaseInstance),
    mockRegisterConversationHandlers: vi.fn(),
    mockConversationRepositoryConstructor: vi
      .fn()
      .mockImplementation(() => ({})),
  };
});

// --- Electron モック ---
vi.mock("electron", () => ({
  ipcMain: {
    handle: mockIpcMainHandle,
    removeHandler: mockIpcMainRemoveHandler,
    on: mockIpcMainOn,
    removeAllListeners: mockIpcMainRemoveAllListeners,
  },
  BrowserWindow: Object.assign(
    vi.fn(() => mockBrowserWindowInstance),
    { getAllWindows: mockGetAllWindows },
  ),
  nativeTheme: {
    shouldUseDarkColors: false,
    on: mockNativeThemeOn,
    removeListener: mockNativeThemeRemoveListener,
  },
  app: {
    getPath: vi.fn().mockReturnValue("/tmp/test"),
    getName: vi.fn().mockReturnValue("test-app"),
    getVersion: vi.fn().mockReturnValue("1.0.0"),
    on: vi.fn(),
    isReady: vi.fn().mockReturnValue(true),
  },
  net: {
    isOnline: vi.fn().mockReturnValue(true),
  },
}));

// --- IPC_CHANNELS モック ---
vi.mock("../../../preload/channels", () => ({
  IPC_CHANNELS: {
    FILE_GET_TREE: "file:get-tree",
    FILE_READ: "file:read",
    STORE_GET: "store:get",
    THEME_GET: "theme:get",
    THEME_SET: "theme:set",
    THEME_GET_SYSTEM: "theme:get-system",
    THEME_SYSTEM_CHANGED: "theme:system-changed",
    AUTH_LOGIN: "auth:login",
    AUTH_LOGOUT: "auth:logout",
    AUTH_GET_SESSION: "auth:get-session",
    AUTH_REFRESH: "auth:refresh",
    AUTH_CHECK_ONLINE: "auth:check-online",
    CONVERSATION_LIST: "conversation:list",
    CONVERSATION_GET: "conversation:get",
    CONVERSATION_CREATE: "conversation:create",
    CONVERSATION_UPDATE: "conversation:update",
    CONVERSATION_DELETE: "conversation:delete",
    CONVERSATION_ADD_MESSAGE: "conversation:addMessage",
    CONVERSATION_SEARCH: "conversation:search",
  },
}));

// --- electron-store モック ---
vi.mock("electron-store", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      get: vi.fn().mockReturnValue([]),
      set: vi.fn(),
      delete: vi.fn(),
    })),
  };
});

// --- better-sqlite3 モック ---
vi.mock("better-sqlite3", () => ({
  default: mockDatabaseConstructor,
}));

// --- conversationHandlers モック ---
vi.mock("../conversationHandlers", () => ({
  registerConversationHandlers: mockRegisterConversationHandlers,
}));

// --- ConversationRepository モック ---
vi.mock("../../repositories/conversationRepository", () => ({
  ConversationRepository: mockConversationRepositoryConstructor,
}));

// --- 全ハンドラ登録関数のモック ---
vi.mock("../fileHandlers", () => ({
  registerFileHandlers: mockRegisterFileHandlers,
}));
vi.mock("../storeHandlers", () => ({
  registerStoreHandlers: mockRegisterStoreHandlers,
}));
vi.mock("../dashboardHandlers", () => ({
  registerDashboardHandlers: mockRegisterDashboardHandlers,
}));
vi.mock("../graphHandlers", () => ({
  registerGraphHandlers: mockRegisterGraphHandlers,
}));
vi.mock("../aiHandlers", () => ({
  registerAIHandlers: mockRegisterAIHandlers,
}));
vi.mock("../windowHandlers", () => ({
  registerWindowHandlers: mockRegisterWindowHandlers,
  sendMenuAction: vi.fn(),
}));
vi.mock("../themeHandlers", () => ({
  registerThemeHandlers: mockRegisterThemeHandlers,
  setupThemeWatcher:
    mockSetupThemeWatcher.mockReturnValue(mockThemeUnsubscribe),
}));
vi.mock("../authHandlers", () => ({
  registerAuthHandlers: mockRegisterAuthHandlers,
}));
vi.mock("../profileHandlers", () => ({
  registerProfileHandlers: mockRegisterProfileHandlers,
}));
vi.mock("../avatarHandlers", () => ({
  registerAvatarHandlers: mockRegisterAvatarHandlers,
}));
vi.mock("../apiKeyHandlers", () => ({
  registerApiKeyHandlers: mockRegisterApiKeyHandlers,
}));
vi.mock("../dialogHandlers", () => ({
  registerDialogHandlers: mockRegisterDialogHandlers,
}));
vi.mock("../workspaceHandlers", () => ({
  registerWorkspaceHandlers: mockRegisterWorkspaceHandlers,
}));
vi.mock("../searchHandlers", () => ({
  registerSearchHandlers: mockRegisterSearchHandlers,
}));
vi.mock("../fileSelectionHandlers", () => ({
  registerFileSelectionHandlers: mockRegisterFileSelectionHandlers,
}));
vi.mock("../../handlers/llm", () => ({
  registerLLMHandlers: mockRegisterLLMHandlers,
}));
vi.mock("../historyHandlers", () => ({
  registerHistoryHandlers: mockRegisterHistoryHandlers,
}));
vi.mock("../../services/HistoryService", () => ({
  createHistoryServiceWithDI: vi.fn().mockReturnValue({}),
}));
vi.mock("../agentHandlers", () => ({
  registerAgentExecutionHandlers: mockRegisterAgentExecutionHandlers,
}));
vi.mock("../communityHandlers", () => ({
  registerCommunityHandlers: mockRegisterCommunityHandlers,
}));
vi.mock("../skillHandlers", () => ({
  registerSkillHandlers: mockRegisterSkillHandlers,
  registerSkillScheduleHandlers: mockRegisterSkillScheduleHandlers,
  registerSkillDocsHandlers: mockRegisterSkillDocsHandlers,
  unregisterSkillScheduleHandlers: vi.fn(),
  registerSkillChainHandlers: mockRegisterSkillChainHandlers,
  getSkillExecutorInstance: vi.fn().mockReturnValue(null),
}));
vi.mock("../skillHandlers.share", () => ({
  registerSkillShareHandlers: mockRegisterSkillShareHandlers,
}));
vi.mock("../../claude-cli", () => ({
  registerClaudeCliHandlers: mockRegisterClaudeCliHandlers,
}));
vi.mock("../skillCreatorHandlers", () => ({
  registerSkillCreatorHandlers: mockRegisterSkillCreatorHandlers,
}));
vi.mock("../../services/skill/SkillCreatorService", () => ({
  SkillCreatorService: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/skill", () => ({
  SkillScanner: vi.fn().mockImplementation(() => ({})),
  SkillParser: vi.fn().mockImplementation(() => ({})),
  SkillImportManager: vi.fn().mockImplementation(() => ({})),
  SkillService: vi.fn().mockImplementation(() => ({})),
  SkillValidator: vi.fn().mockImplementation(() => ({
    validateStructure: vi.fn().mockResolvedValue(true),
    validateSkillMd: vi.fn().mockReturnValue({ isValid: true, errors: [] }),
  })),
  SkillShareManager: vi.fn().mockImplementation(() => ({})),
  PermissionStore: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../permission-store-handlers", () => ({
  registerPermissionStoreHandlers: mockRegisterPermissionStoreHandlers,
}));
vi.mock("../authModeHandlers", () => ({
  registerAuthModeHandlers: mockRegisterAuthModeHandlers,
}));
vi.mock("../authKeyHandlers", () => ({
  registerAuthKeyHandlers: mockRegisterAuthKeyHandlers,
  unregisterAuthKeyHandlers: vi.fn(),
}));
vi.mock("../../services/auth", () => ({
  AuthKeyService: vi.fn().mockImplementation(() => ({})),
  StubSubscriptionAuthProvider: vi.fn().mockImplementation(() => ({})),
  createAuthKeyStorage: vi.fn().mockReturnValue({}),
  createAuthModeService: vi.fn().mockReturnValue({ getMode: vi.fn() }),
}));
vi.mock("../../infrastructure", () => ({
  getSupabaseClient: vi.fn().mockReturnValue(null),
  createSecureStorage: vi.fn().mockReturnValue({}),
  createProfileCache: vi.fn().mockReturnValue({}),
  createApiKeyStorage: vi.fn().mockReturnValue({}),
  createStubSharedHistoryService: vi.fn().mockReturnValue({}),
  createStubLogRepository: vi.fn().mockReturnValue({}),
  createStubLogger: vi.fn().mockReturnValue({}),
}));
vi.mock("../chatEditHandlers", () => ({
  registerChatEditHandlers: mockRegisterChatEditHandlers,
}));
vi.mock("../../services/chat-edit", () => ({
  ChatEditService: vi.fn().mockImplementation(() => ({})),
  FileService: vi.fn().mockImplementation(() => ({})),
  ContextBuilder: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/skill/SkillChainStore", () => ({
  SkillChainStore: vi.fn().mockImplementation(() => ({
    list: vi.fn().mockResolvedValue([]),
    get: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue(false),
  })),
}));
vi.mock("../../services/skill/SkillChainExecutor", () => ({
  SkillChainExecutor: vi.fn().mockImplementation(() => ({
    executeChain: vi.fn().mockResolvedValue({}),
  })),
}));
vi.mock("../skillAnalyticsHandlers", () => ({
  registerSkillAnalyticsHandlers: mockRegisterSkillAnalyticsHandlers,
}));
vi.mock("../skillDebugHandlers", () => ({
  registerSkillDebugHandlers: mockRegisterSkillDebugHandlers,
}));
vi.mock("../skillFileHandlers", () => ({
  registerSkillFileHandlers: mockRegisterSkillFileHandlers,
}));
vi.mock("../historySearchHandlers", () => ({
  createHistorySearchService: vi.fn().mockReturnValue({}),
  registerHistorySearchHandlers: mockRegisterHistorySearchHandlers,
}));
vi.mock("../notificationHandlers", () => ({
  createNotificationService: vi.fn().mockReturnValue({}),
  registerNotificationHandlers: mockRegisterNotificationHandlers,
}));
vi.mock("../../services/skill/SkillFileManager", () => ({
  SkillFileManager: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/skill/ScheduleStore", () => ({
  ScheduleStore: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/skill/SkillScheduler", () => ({
  SkillScheduler: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
  })),
}));
vi.mock("../../services/skill/AnalyticsStore", () => ({
  AnalyticsStore: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/skill/SkillAnalytics", () => ({
  SkillAnalytics: vi.fn().mockImplementation(() => ({})),
}));
vi.mock("../../services/skill/SkillDocGenerator", () => ({
  SkillDocGenerator: vi.fn().mockImplementation(() => ({})),
}));

// --- テスト対象のインポート ---
import { registerAllIpcHandlers, unregisterAllIpcHandlers } from "../index";
import type { IpcHandlerRegistrationResult } from "../index";
import { _resetForTesting } from "../../database/conversationDatabase";

describe("Conversation IPC Handler Registration", () => {
  let mockWindow: Electron.BrowserWindow;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIpcMainHandle.mockReset();
    mockSetupThemeWatcher.mockReset();
    mockSetupThemeWatcher.mockReturnValue(mockThemeUnsubscribe);
    // DB モックのデフォルト戻り値を再設定
    mockDatabaseConstructor.mockReturnValue(mockDatabaseInstance);
    mockDatabaseInstance.pragma.mockReset();
    mockDatabaseInstance.exec.mockReset();
    mockDatabaseInstance.close.mockReset();
    mockWindow = mockBrowserWindowInstance as unknown as Electron.BrowserWindow;
    // P9: テスト間のシングルトン状態をリセット
    _resetForTesting();
  });

  describe("T-01: DB初期化成功時、registerConversationHandlersが呼ばれること", () => {
    it("Database + ConversationRepository 生成後に registerConversationHandlers が呼ばれる", () => {
      const result: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      expect(mockRegisterConversationHandlers).toHaveBeenCalledTimes(1);
      expect(result.failureCount).toBe(0);
    });
  });

  describe("T-02: DB初期化成功時、successCountが増加すること", () => {
    it("conversation ハンドラ登録分の successCount が含まれる", () => {
      const result: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      // conversation ハンドラが成功としてカウントされている
      expect(result.successCount).toBeGreaterThan(0);
      expect(result.failureCount).toBe(0);
      // フォールバックハンドラは登録されていない
      const conversationFallbackCalls = mockIpcMainHandle.mock.calls.filter(
        (call: unknown[]) =>
          typeof call[0] === "string" &&
          (call[0] as string).startsWith("conversation:"),
      );
      expect(conversationFallbackCalls).toHaveLength(0);
    });
  });

  describe("T-03: DB初期化失敗時、フォールバック7チャンネルが登録されること", () => {
    it("Database コンストラクタが例外を投げた場合、7つのフォールバックチャンネルが登録される", () => {
      // Arrange: Database コンストラクタを失敗させる
      mockDatabaseConstructor.mockImplementationOnce(() => {
        throw new Error("SQLITE_CANTOPEN: unable to open database file");
      });

      // Act
      const result: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      // Assert: フォールバックハンドラ7つが ipcMain.handle で登録されている
      const conversationFallbackCalls = mockIpcMainHandle.mock.calls.filter(
        (call: unknown[]) =>
          typeof call[0] === "string" &&
          (call[0] as string).startsWith("conversation:"),
      );
      expect(conversationFallbackCalls).toHaveLength(7);

      // 全7チャンネルが登録されていること
      const registeredChannels = conversationFallbackCalls.map(
        (call: unknown[]) => call[0],
      );
      expect(registeredChannels).toContain("conversation:list");
      expect(registeredChannels).toContain("conversation:get");
      expect(registeredChannels).toContain("conversation:create");
      expect(registeredChannels).toContain("conversation:update");
      expect(registeredChannels).toContain("conversation:delete");
      expect(registeredChannels).toContain("conversation:addMessage");
      expect(registeredChannels).toContain("conversation:search");

      // registerConversationHandlers は呼ばれていない
      expect(mockRegisterConversationHandlers).not.toHaveBeenCalled();

      // failures に記録されている
      expect(
        result.failures.find(
          (f) => f.handlerName === "registerConversationHandlers",
        ),
      ).toBeDefined();
    });
  });

  describe("T-04: DB初期化失敗時、failuresに記録されること", () => {
    it("失敗情報にハンドラ名・エラーメッセージ・エラーコードが含まれる", () => {
      // Arrange
      mockDatabaseConstructor.mockImplementationOnce(() => {
        throw new Error("DB init failed");
      });

      // Act
      const result: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      // Assert
      const conversationFailure = result.failures.find(
        (f) => f.handlerName === "registerConversationHandlers",
      );
      expect(conversationFailure).toBeDefined();
      expect(conversationFailure!.errorMessage).toBe("DB init failed");
      expect(conversationFailure!.errorCode).toBe(4001);
    });
  });

  describe("T-05: unregister後、conversationチャンネルが解除されること", () => {
    it("unregisterAllIpcHandlers で conversation チャンネルも removeHandler される", () => {
      // Arrange: 登録
      registerAllIpcHandlers(mockWindow);
      vi.clearAllMocks();

      // Act: 解除
      unregisterAllIpcHandlers();

      // Assert: removeHandler が conversation チャンネルを含んで呼ばれている
      const removedChannels = mockIpcMainRemoveHandler.mock.calls.map(
        (call: unknown[]) => call[0],
      );
      expect(removedChannels).toContain("conversation:list");
      expect(removedChannels).toContain("conversation:get");
      expect(removedChannels).toContain("conversation:create");
      expect(removedChannels).toContain("conversation:update");
      expect(removedChannels).toContain("conversation:delete");
      expect(removedChannels).toContain("conversation:addMessage");
      expect(removedChannels).toContain("conversation:search");
    });
  });

  describe("T-06: WALモードpragmaが呼ばれること", () => {
    it("DB 初期化時に journal_mode = WAL の pragma が実行される", () => {
      registerAllIpcHandlers(mockWindow);

      expect(mockDatabaseInstance.pragma).toHaveBeenCalledWith(
        "journal_mode = WAL",
      );
    });
  });

  describe("T-07: DDL execが呼ばれること", () => {
    it("DB 初期化時にスキーマ作成の exec が実行される", () => {
      registerAllIpcHandlers(mockWindow);

      expect(mockDatabaseInstance.exec).toHaveBeenCalledTimes(1);
      // exec に渡された SQL に CREATE TABLE IF NOT EXISTS が含まれる
      const execArg = mockDatabaseInstance.exec.mock.calls[0][0] as string;
      expect(execArg).toContain("CREATE TABLE IF NOT EXISTS chat_sessions");
      expect(execArg).toContain("CREATE TABLE IF NOT EXISTS chat_messages");
      expect(execArg).toContain(
        "CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id",
      );
    });
  });

  describe("T-08: フォールバックレスポンスの形式検証", () => {
    it("DB初期化失敗時のフォールバックハンドラが DB_NOT_AVAILABLE レスポンスを返す", async () => {
      // Arrange
      mockDatabaseConstructor.mockImplementationOnce(() => {
        throw new Error("DB unavailable");
      });

      // Act
      registerAllIpcHandlers(mockWindow);

      // Assert: フォールバックハンドラの1つを取得して実行
      const listCall = mockIpcMainHandle.mock.calls.find(
        (call: unknown[]) => call[0] === "conversation:list",
      );
      expect(listCall).toBeDefined();

      const handler = listCall![1] as () => Promise<unknown>;
      const response = await handler();

      expect(response).toEqual({
        success: false,
        error: {
          code: "DB_NOT_AVAILABLE",
          message: "Conversation database is not available",
        },
      });
    });
  });

  describe("T-09: DB初期化失敗時も他のハンドラは正常に登録されること", () => {
    it("conversation ハンドラ失敗が他のハンドラ登録に影響しない", () => {
      // Arrange
      mockDatabaseConstructor.mockImplementationOnce(() => {
        throw new Error("DB crash");
      });

      // Act
      const result: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      // Assert: 他のハンドラは全て正常に呼ばれている
      expect(mockRegisterFileHandlers).toHaveBeenCalledTimes(1);
      expect(mockRegisterStoreHandlers).toHaveBeenCalledTimes(1);
      expect(mockRegisterAuthKeyHandlers).toHaveBeenCalledTimes(1);
      expect(mockRegisterChatEditHandlers).toHaveBeenCalledTimes(1);

      // conversation の失敗のみ
      const conversationFailures = result.failures.filter(
        (f) => f.handlerName === "registerConversationHandlers",
      );
      expect(conversationFailures).toHaveLength(1);
    });
  });

  // --- Phase 6: 異常系テスト拡充 ---

  describe("T-E01: DB権限エラー（EACCES）時にフォールバックが登録される", () => {
    it("EACCES エラーでフォールバック7チャンネルが登録される", () => {
      mockDatabaseConstructor.mockImplementationOnce(() => {
        throw new Error(
          "EACCES: permission denied, open '/home/.claude/conversations.db'",
        );
      });

      const result: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      const conversationFallbackCalls = mockIpcMainHandle.mock.calls.filter(
        (call: unknown[]) =>
          typeof call[0] === "string" &&
          (call[0] as string).startsWith("conversation:"),
      );
      expect(conversationFallbackCalls).toHaveLength(7);
      expect(mockRegisterConversationHandlers).not.toHaveBeenCalled();
      expect(
        result.failures.find(
          (f) => f.handlerName === "registerConversationHandlers",
        ),
      ).toBeDefined();
    });
  });

  describe("T-E02: db.pragma() エラー時にフォールバックが登録される", () => {
    it("pragma 失敗でフォールバック7チャンネルが登録される", () => {
      mockDatabaseInstance.pragma.mockImplementationOnce(() => {
        throw new Error("SQLite error: unable to set WAL mode");
      });

      const result: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      const conversationFallbackCalls = mockIpcMainHandle.mock.calls.filter(
        (call: unknown[]) =>
          typeof call[0] === "string" &&
          (call[0] as string).startsWith("conversation:"),
      );
      expect(conversationFallbackCalls).toHaveLength(7);
      expect(mockRegisterConversationHandlers).not.toHaveBeenCalled();
      expect(result.failures).toContainEqual(
        expect.objectContaining({
          handlerName: "registerConversationHandlers",
          errorMessage: expect.stringContaining("WAL"),
        }),
      );
    });
  });

  describe("T-E03: db.exec() エラー（DB破損/ディスクフル）時にフォールバックが登録される", () => {
    it("SQLITE_IOERR でフォールバック7チャンネルが登録される", () => {
      mockDatabaseInstance.exec.mockImplementationOnce(() => {
        throw new Error("SQLITE_IOERR: disk I/O error");
      });

      const result: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      const conversationFallbackCalls = mockIpcMainHandle.mock.calls.filter(
        (call: unknown[]) =>
          typeof call[0] === "string" &&
          (call[0] as string).startsWith("conversation:"),
      );
      expect(conversationFallbackCalls).toHaveLength(7);
      expect(mockRegisterConversationHandlers).not.toHaveBeenCalled();
      expect(
        result.failures.find(
          (f) => f.handlerName === "registerConversationHandlers",
        )?.errorMessage,
      ).toContain("SQLITE_IOERR");
    });
  });

  describe("T-E04: registerConversationHandlers がエラーを投げた場合にフォールバックが登録される", () => {
    it("ハンドラ登録関数の例外でフォールバック7チャンネルが登録される", () => {
      mockRegisterConversationHandlers.mockImplementationOnce(() => {
        throw new Error("Handler registration internal error");
      });

      const result: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      const conversationFallbackCalls = mockIpcMainHandle.mock.calls.filter(
        (call: unknown[]) =>
          typeof call[0] === "string" &&
          (call[0] as string).startsWith("conversation:"),
      );
      expect(conversationFallbackCalls).toHaveLength(7);
      expect(
        result.failures.find(
          (f) => f.handlerName === "registerConversationHandlers",
        ),
      ).toBeDefined();
    });
  });

  describe("T-E05: ConversationRepository コンストラクタがエラーを投げた場合", () => {
    it("Repository 生成失敗でフォールバック7チャンネルが登録される", () => {
      mockConversationRepositoryConstructor.mockImplementationOnce(() => {
        throw new Error("Repository initialization failed");
      });

      registerAllIpcHandlers(mockWindow);

      const conversationFallbackCalls = mockIpcMainHandle.mock.calls.filter(
        (call: unknown[]) =>
          typeof call[0] === "string" &&
          (call[0] as string).startsWith("conversation:"),
      );
      expect(conversationFallbackCalls).toHaveLength(7);
      expect(mockRegisterConversationHandlers).not.toHaveBeenCalled();
    });
  });

  describe("T-E06: 全7フォールバックチャンネルが DB_NOT_AVAILABLE レスポンスを返す（P41対応）", () => {
    const conversationChannels = [
      "conversation:list",
      "conversation:get",
      "conversation:create",
      "conversation:update",
      "conversation:delete",
      "conversation:addMessage",
      "conversation:search",
    ];

    it.each(conversationChannels)(
      "%s フォールバックが DB_NOT_AVAILABLE を返す",
      async (channel) => {
        mockDatabaseConstructor.mockImplementationOnce(() => {
          throw new Error("DB unavailable");
        });

        registerAllIpcHandlers(mockWindow);

        const handleCall = mockIpcMainHandle.mock.calls.find(
          (call: unknown[]) => call[0] === channel,
        );
        expect(handleCall).toBeDefined();

        const handler = handleCall![1] as () => Promise<unknown>;
        const response = await handler();

        expect(response).toEqual({
          success: false,
          error: {
            code: "DB_NOT_AVAILABLE",
            message: "Conversation database is not available",
          },
        });
      },
    );
  });

  describe("T-E07: DB初期化失敗時のエラーコードが正しく記録される", () => {
    it("failures のエラーコードが 4001（Infrastructure Error）である", () => {
      mockDatabaseConstructor.mockImplementationOnce(() => {
        throw new Error("SQLITE_CANTOPEN");
      });

      const result: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      const failure = result.failures.find(
        (f) => f.handlerName === "registerConversationHandlers",
      );
      expect(failure).toBeDefined();
      expect(failure!.errorCode).toBe(4001);
      expect(failure!.errorMessage).toContain("SQLITE_CANTOPEN");
    });
  });
});
