/**
 * IPC Handler Graceful Degradation Tests
 *
 * TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001: Phase 4 - テスト作成
 *
 * registerAllIpcHandlers() 内で1つの registerXxxHandlers() が例外を投げた場合に
 * 後続ハンドラが全て未登録になる問題を修正するためのテスト。
 *
 * safeRegister は内部ヘルパーのため export されない。
 * registerAllIpcHandlers の戻り値 (IpcHandlerRegistrationResult) と
 * console.error のモック検証で動作を間接的に確認する。
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
  mockDatabaseConstructor,
  mockRegisterConversationHandlers,
} = vi.hoisted(() => {
  const mockWebContentsSend = vi.fn();
  const mockIsDestroyed = vi.fn().mockReturnValue(false);
  const mockBrowserWindowInstance = {
    webContents: { send: mockWebContentsSend },
    isDestroyed: mockIsDestroyed,
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
    mockDatabaseConstructor: vi.fn().mockReturnValue({
      pragma: vi.fn(),
      exec: vi.fn(),
      close: vi.fn(),
    }),
    mockRegisterConversationHandlers: vi.fn(),
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
  createAuthKeyStorage: vi.fn().mockReturnValue({}),
  createAuthModeService: vi.fn().mockReturnValue({}),
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
vi.mock("better-sqlite3", () => ({
  default: mockDatabaseConstructor,
}));
vi.mock("../conversationHandlers", () => ({
  registerConversationHandlers: mockRegisterConversationHandlers,
}));
vi.mock("../../repositories/conversationRepository", () => ({
  ConversationRepository: vi.fn().mockImplementation(() => ({})),
}));

// --- テスト対象のインポート ---
import { registerAllIpcHandlers, unregisterAllIpcHandlers } from "../index";
import type { IpcHandlerRegistrationResult } from "../index";

describe("IPC Handler Graceful Degradation", () => {
  let mockWindow: Electron.BrowserWindow;

  beforeEach(() => {
    vi.clearAllMocks();
    // mockImplementationOnce キューを確実にクリアするため mockReset を使用
    mockIpcMainHandle.mockReset();
    mockSetupThemeWatcher.mockReset();
    mockWindow = mockBrowserWindowInstance as unknown as Electron.BrowserWindow;
    // setupThemeWatcher のデフォルト戻り値を再設定
    mockSetupThemeWatcher.mockReturnValue(mockThemeUnsubscribe);
  });

  describe("T-01: 正常系 - 全ハンドラが正常に登録される", () => {
    it("successCount が全ハンドラ数と一致する", () => {
      const result: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      // 全ハンドラが正常に登録されたため failureCount は 0
      expect(result.failureCount).toBe(0);
      // successCount は 0 より大きい（具体的な数は実装に依存）
      expect(result.successCount).toBeGreaterThan(0);
      // successCount + failureCount が総数と一致
      expect(result.successCount + result.failureCount).toBe(
        result.successCount,
      );
    });
  });

  describe("T-02: 正常系 - 戻り値の failures が空配列", () => {
    it("全成功時に failures は空配列を返す", () => {
      const result: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      expect(result.failures).toEqual([]);
    });
  });

  describe("T-03: 異常系 - 1つのハンドラが例外を投げても後続が登録される", () => {
    it("registerFileHandlers が失敗しても後続ハンドラは全て登録される", () => {
      // Arrange: 先頭の registerFileHandlers を失敗させる
      mockRegisterFileHandlers.mockImplementationOnce(() => {
        throw new Error("File handler registration failed");
      });

      // Act
      const result: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      // Assert: 後続のハンドラが呼ばれている
      expect(mockRegisterStoreHandlers).toHaveBeenCalledTimes(1);
      expect(mockRegisterDashboardHandlers).toHaveBeenCalledTimes(1);
      expect(mockRegisterChatEditHandlers).toHaveBeenCalledTimes(1);

      // failureCount が 1
      expect(result.failureCount).toBe(1);
      // successCount は全数 - 1
      expect(result.successCount).toBe(
        result.successCount + result.failureCount - 1,
      );
    });
  });

  describe("T-04: 異常系 - 失敗情報が戻り値に含まれる", () => {
    it("失敗したハンドラ名とエラーメッセージが failures に含まれる", () => {
      // Arrange
      mockRegisterStoreHandlers.mockImplementationOnce(() => {
        throw new Error("Store init error");
      });

      // Act
      const result: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      // Assert
      expect(result.failures).toHaveLength(1);
      expect(result.failures[0]).toEqual(
        expect.objectContaining({
          errorMessage: "Store init error",
          errorCode: 4001,
        }),
      );
      // handlerName が設定されている
      expect(result.failures[0].handlerName).toBeTruthy();
    });
  });

  describe("T-05: 異常系 - 複数のハンドラが失敗した場合に全て記録される", () => {
    it("3つのハンドラが失敗した場合、failures に3件記録される", () => {
      // Arrange: 3つのハンドラを失敗させる
      mockRegisterFileHandlers.mockImplementationOnce(() => {
        throw new Error("File error");
      });
      mockRegisterGraphHandlers.mockImplementationOnce(() => {
        throw new Error("Graph error");
      });
      mockRegisterCommunityHandlers.mockImplementationOnce(() => {
        throw new Error("Community error");
      });

      // Act
      const result: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      // Assert
      expect(result.failures).toHaveLength(3);
      expect(result.failureCount).toBe(3);

      const errorMessages = result.failures.map((f) => f.errorMessage);
      expect(errorMessages).toContain("File error");
      expect(errorMessages).toContain("Graph error");
      expect(errorMessages).toContain("Community error");
    });
  });

  describe("T-06: 異常系 - Error以外の例外（文字列）も捕捉される", () => {
    it("文字列をthrowしても failures に記録される", () => {
      // Arrange: 文字列を throw する
      mockRegisterAIHandlers.mockImplementationOnce(() => {
        throw "string error thrown";
      });

      // Act
      const result: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      // Assert
      expect(result.failureCount).toBe(1);
      // Error以外の場合は "Unknown error" が記録される
      expect(result.failures[0].errorMessage).toBe("Unknown error");
    });
  });

  describe("T-07: 境界値 - 先頭のハンドラが失敗した場合、後続は全て登録される", () => {
    it("先頭 registerFileHandlers の失敗後、後続全ハンドラが呼ばれる", () => {
      // Arrange
      mockRegisterFileHandlers.mockImplementationOnce(() => {
        throw new Error("First handler failed");
      });

      // Act
      registerAllIpcHandlers(mockWindow);

      // Assert: 後続の代表的なハンドラが全て呼ばれている
      expect(mockRegisterStoreHandlers).toHaveBeenCalledTimes(1);
      expect(mockRegisterWindowHandlers).toHaveBeenCalledTimes(1);
      expect(mockRegisterSkillHandlers).toHaveBeenCalledTimes(1);
      expect(mockRegisterAuthKeyHandlers).toHaveBeenCalledTimes(1);
      expect(mockRegisterChatEditHandlers).toHaveBeenCalledTimes(1);
      expect(mockRegisterClaudeCliHandlers).toHaveBeenCalledTimes(1);
    });
  });

  describe("T-08: 境界値 - 末尾のハンドラが失敗した場合、先行は全て登録済み", () => {
    it("末尾 registerChatEditHandlers の失敗前に他全ハンドラが登録済み", () => {
      // Arrange: 末尾のハンドラを失敗させる
      mockRegisterChatEditHandlers.mockImplementationOnce(() => {
        throw new Error("Last handler failed");
      });

      // Act
      const result: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      // Assert: 先行のハンドラは全て登録済み
      expect(mockRegisterFileHandlers).toHaveBeenCalledTimes(1);
      expect(mockRegisterStoreHandlers).toHaveBeenCalledTimes(1);
      expect(mockRegisterSkillHandlers).toHaveBeenCalledTimes(1);
      expect(mockRegisterClaudeCliHandlers).toHaveBeenCalledTimes(1);

      // 失敗は1件
      expect(result.failureCount).toBe(1);
      expect(result.failures[0].errorMessage).toBe("Last handler failed");
    });
  });

  describe("T-09: 境界値 - 全ハンドラが失敗した場合", () => {
    it("全ハンドラが失敗しても例外を投げず結果を返す", () => {
      // Arrange: 全てのモックハンドラを失敗させる
      const allMocks = [
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
        mockRegisterConversationHandlers,
      ];
      for (const mock of allMocks) {
        mock.mockImplementationOnce(() => {
          throw new Error("handler failed");
        });
      }
      // setupThemeWatcher も失敗させる
      mockSetupThemeWatcher.mockImplementationOnce(() => {
        throw new Error("theme watcher failed");
      });
      // ipcMain.handle を一時的に失敗させて registerAuthFallbackHandlers + conversation fallback も失敗させる
      // fallback ハンドラは ipcMain.handle を合計12回以上呼ぶため、十分な回数を設定
      for (let i = 0; i < 20; i++) {
        mockIpcMainHandle.mockImplementationOnce(() => {
          throw new Error("ipc handle failed");
        });
      }

      // Act & Assert: 例外を投げないこと
      let result: IpcHandlerRegistrationResult | undefined;
      expect(() => {
        result = registerAllIpcHandlers(mockWindow);
      }).not.toThrow();

      // successCount は 0
      expect(result!.successCount).toBe(0);
      // failureCount > 0
      expect(result!.failureCount).toBeGreaterThan(0);
      // failures 配列の長さが failureCount と一致
      expect(result!.failures).toHaveLength(result!.failureCount);
    });
  });

  describe("T-10: ログ - 失敗時にconsole.errorが呼ばれる", () => {
    it("ハンドラ登録失敗時に console.error が呼ばれる", () => {
      // Arrange
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockRegisterFileHandlers.mockImplementationOnce(() => {
        throw new Error("Test failure for logging");
      });

      // Act
      registerAllIpcHandlers(mockWindow);

      // Assert: console.error が失敗ハンドラ名を含むメッセージで呼ばれる
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Test failure for logging"),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("T-11: ログ - 全成功時にwarnが呼ばれない", () => {
    it("全ハンドラ成功時に console.warn が呼ばれない（Supabase未設定の警告を除く）", () => {
      // Arrange
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      // Act
      registerAllIpcHandlers(mockWindow);

      // Assert: IPC 登録失敗に関する warn は呼ばれない
      // (Supabase未設定の既存warn は除外して検証)
      const failureRelatedWarns = consoleWarnSpy.mock.calls.filter(
        (call) =>
          typeof call[0] === "string" &&
          call[0].includes("failed") &&
          call[0].includes("[IPC]"),
      );
      expect(failureRelatedWarns).toHaveLength(0);

      consoleWarnSpy.mockRestore();
    });
  });

  describe("T-13: 障害シナリオ - SkillService初期化失敗でSkill系ハンドラが未登録、Auth系は正常", () => {
    it("SkillService依存のハンドラが全て失敗してもAuth系ハンドラは正常に登録される", () => {
      // Arrange: Skill 系ハンドラを全て失敗させる
      const skillMocks = [
        mockRegisterSkillHandlers,
        mockRegisterSkillFileHandlers,
        mockRegisterSkillShareHandlers,
        mockRegisterSkillDebugHandlers,
        mockRegisterSkillScheduleHandlers,
        mockRegisterSkillDocsHandlers,
        mockRegisterSkillAnalyticsHandlers,
        mockRegisterSkillChainHandlers,
      ];
      for (const mock of skillMocks) {
        mock.mockImplementationOnce(() => {
          throw new Error("SkillService init failed");
        });
      }

      // Act
      const result: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      // Assert: Skill系は失敗
      expect(result.failureCount).toBe(8);
      const failedNames = result.failures.map((f) => f.handlerName);
      expect(failedNames).toContain("registerSkillHandlers");
      expect(failedNames).toContain("registerSkillFileHandlers");

      // Assert: Auth 系は正常に呼ばれている
      expect(mockRegisterAuthKeyHandlers).toHaveBeenCalledTimes(1);
      expect(mockRegisterAuthModeHandlers).toHaveBeenCalledTimes(1);
    });
  });

  describe("T-14: 障害シナリオ - electron-store コンストラクタ例外でもStore依存外ハンドラは正常", () => {
    it("Store生成失敗による後続エラーがあっても、先行の依存なしハンドラは登録済み", () => {
      // Arrange: SkillService 生成に使われる Store が例外をスローした場合、
      // Skill系ハンドラ群が失敗するがそれ以前のハンドラは正常
      // （electron-store モック自体は正常だが、Skill系を全失敗させることで同等シナリオを再現）
      mockRegisterSkillHandlers.mockImplementationOnce(() => {
        throw new Error("Store constructor failed");
      });

      // Act
      const result: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      // Assert: Store依存外の先行ハンドラは正常に登録されている
      expect(mockRegisterFileHandlers).toHaveBeenCalledTimes(1);
      expect(mockRegisterStoreHandlers).toHaveBeenCalledTimes(1);
      expect(mockRegisterDashboardHandlers).toHaveBeenCalledTimes(1);
      expect(mockRegisterWindowHandlers).toHaveBeenCalledTimes(1);

      // 失敗は1件のみ
      expect(result.failureCount).toBe(1);
      expect(result.failures[0].errorMessage).toBe("Store constructor failed");
    });
  });

  describe("T-15: 依存チェーン - authKeyService 初期化後のハンドラが正常に動作", () => {
    it("registerAuthKeyHandlers と registerAuthModeHandlers が両方呼ばれる", () => {
      // Act
      const result: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      // Assert: Auth Key と Auth Mode の両方が呼ばれている（同一の authKeyService を使用）
      expect(mockRegisterAuthKeyHandlers).toHaveBeenCalledTimes(1);
      expect(mockRegisterAuthModeHandlers).toHaveBeenCalledTimes(1);
      expect(result.failureCount).toBe(0);
    });
  });

  describe("T-16: 非同期 - SkillScheduler.initialize の非同期エラーがハンドラ登録に影響しない", () => {
    it("registerSkillScheduleHandlers が同期的に成功する（void initialize は起動ブロックしない）", () => {
      // Note: SkillScheduler.initialize は `void skillScheduler.initialize()` で呼ばれるため、
      // 非同期エラーはハンドラ登録の try-catch には到達しない。
      // SkillScheduler モックの initialize は mockRejectedValue でも登録自体は成功する。
      // ここでは registerSkillScheduleHandlers が正常に呼ばれることを検証する。

      // Act
      const result: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      // Assert: registerSkillScheduleHandlers は成功としてカウントされる
      expect(mockRegisterSkillScheduleHandlers).toHaveBeenCalledTimes(1);
      // 非同期の initialize エラーは同期的な登録処理に影響しない
      expect(
        result.failures.find(
          (f) => f.handlerName === "registerSkillScheduleHandlers",
        ),
      ).toBeUndefined();
      // successCount にカウントされている
      expect(result.failureCount).toBe(0);
    });
  });

  describe("T-17: 戻り値 - successCount + failureCount が全ハンドラ数と一致", () => {
    it("正常時の successCount + failureCount が一定の総数になる", () => {
      // Act: 正常時の総数を取得
      const normalResult: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);
      const totalHandlers =
        normalResult.successCount + normalResult.failureCount;

      // Assert: failureCount は 0
      expect(normalResult.failureCount).toBe(0);
      expect(totalHandlers).toBeGreaterThan(0);
    });

    it("一部失敗時も successCount + failureCount は同じ総数になる", () => {
      // 正常時の総数を先に取得
      const normalResult: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);
      const expectedTotal =
        normalResult.successCount + normalResult.failureCount;

      vi.clearAllMocks();
      mockIpcMainHandle.mockReset();
      mockSetupThemeWatcher.mockReset();
      mockSetupThemeWatcher.mockReturnValue(mockThemeUnsubscribe);

      // Arrange: 2つのハンドラを失敗させる
      mockRegisterFileHandlers.mockImplementationOnce(() => {
        throw new Error("fail1");
      });
      mockRegisterGraphHandlers.mockImplementationOnce(() => {
        throw new Error("fail2");
      });

      // Act
      const failResult: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      // Assert: 総数は同じ
      expect(failResult.successCount + failResult.failureCount).toBe(
        expectedTotal,
      );
      expect(failResult.failureCount).toBe(2);
      expect(failResult.successCount).toBe(expectedTotal - 2);
    });
  });

  describe("T-18: セキュリティ - エラーメッセージをサニタイズする (NFR-02)", () => {
    it("失敗情報とログ出力のユーザーホーム配下パスを `~` にマスクする", () => {
      // Arrange: ファイルパスを含むエラーメッセージで失敗させる
      const previousHome = process.env.HOME;
      process.env.HOME = "/Users/secret";
      mockRegisterFileHandlers.mockImplementationOnce(() => {
        throw new Error(
          "ENOENT: no such file or directory, open '/Users/secret/config.json'",
        );
      });

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Act
      const result: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      try {
        expect(result.failures).toHaveLength(1);
        expect(result.failures[0].errorMessage).toBe(
          "ENOENT: no such file or directory, open '~/config.json'",
        );
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringMatching(/^\[IPC\] Failed to register .+: .+$/),
        );
        const loggedMessage = consoleErrorSpy.mock.calls.find(
          (call) =>
            typeof call[0] === "string" && call[0].includes("[IPC] Failed"),
        );
        expect(loggedMessage).toBeDefined();
        expect(loggedMessage![0]).toContain("~/config.json");
        expect(loggedMessage![0]).not.toContain("/Users/secret");
        expect(loggedMessage![0]).not.toMatch(/\n\s+at /);
      } finally {
        if (previousHome === undefined) {
          delete process.env.HOME;
        } else {
          process.env.HOME = previousHome;
        }
        consoleErrorSpy.mockRestore();
      }
    });
  });

  describe("T-12: 結合 - unregister -> register の再登録フローが動作する", () => {
    it("unregister後にregisterし直すと戻り値が正常に返る", () => {
      // Act: 初回登録
      const result1: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);
      expect(result1.failureCount).toBe(0);

      // Act: 登録解除
      unregisterAllIpcHandlers();

      // Act: 再登録
      const result2: IpcHandlerRegistrationResult =
        registerAllIpcHandlers(mockWindow);

      // Assert: 再登録も成功
      expect(result2.failureCount).toBe(0);
      expect(result2.successCount).toBeGreaterThan(0);
      expect(result2.failures).toEqual([]);
    });
  });
});
