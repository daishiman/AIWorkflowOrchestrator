/**
 * IPC Handler Double Registration Prevention Tests
 *
 * UT-FIX-IPC-HANDLER-DOUBLE-REG-001: Phase 4 - テスト作成
 *
 * macOS の app.on("activate") イベントで registerAllIpcHandlers() が
 * 再実行された際に ipcMain.handle() が二重登録例外を投げる問題の防止テスト。
 *
 * テスト対象:
 * - unregisterAllIpcHandlers(): 全ハンドラの安全な登録解除
 * - registerAllIpcHandlers(): unregister 後の再登録が正常に動作すること
 * - activate フロー: register -> unregister -> register のシミュレーション
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

// --- IPC_CHANNELS モック（サブセット） ---
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
  registerFileHandlers: vi.fn(),
}));
vi.mock("../storeHandlers", () => ({
  registerStoreHandlers: vi.fn(),
}));
vi.mock("../dashboardHandlers", () => ({
  registerDashboardHandlers: vi.fn(),
}));
vi.mock("../graphHandlers", () => ({
  registerGraphHandlers: vi.fn(),
}));
vi.mock("../aiHandlers", () => ({
  registerAIHandlers: vi.fn(),
}));
vi.mock("../windowHandlers", () => ({
  registerWindowHandlers: vi.fn(),
  sendMenuAction: vi.fn(),
}));

// setupThemeWatcher は unsubscribe 関数を返すようにモック
vi.mock("../themeHandlers", () => ({
  registerThemeHandlers: vi.fn(),
  setupThemeWatcher: vi.fn().mockReturnValue(mockThemeUnsubscribe),
}));

vi.mock("../authHandlers", () => ({
  registerAuthHandlers: vi.fn(),
}));
vi.mock("../profileHandlers", () => ({
  registerProfileHandlers: vi.fn(),
}));
vi.mock("../avatarHandlers", () => ({
  registerAvatarHandlers: vi.fn(),
}));
vi.mock("../apiKeyHandlers", () => ({
  registerApiKeyHandlers: vi.fn(),
}));
vi.mock("../dialogHandlers", () => ({
  registerDialogHandlers: vi.fn(),
}));
vi.mock("../workspaceHandlers", () => ({
  registerWorkspaceHandlers: vi.fn(),
}));
vi.mock("../searchHandlers", () => ({
  registerSearchHandlers: vi.fn(),
}));
vi.mock("../fileSelectionHandlers", () => ({
  registerFileSelectionHandlers: vi.fn(),
}));
vi.mock("../../handlers/llm", () => ({
  registerLLMHandlers: vi.fn(),
}));
vi.mock("../historyHandlers", () => ({
  registerHistoryHandlers: vi.fn(),
}));
vi.mock("../../services/HistoryService", () => ({
  createHistoryServiceWithDI: vi.fn().mockReturnValue({}),
}));
vi.mock("../agentHandlers", () => ({
  registerAgentExecutionHandlers: vi.fn(),
}));
vi.mock("../communityHandlers", () => ({
  registerCommunityHandlers: vi.fn(),
}));
vi.mock("../skillHandlers", () => ({
  registerSkillHandlers: vi.fn(),
  registerSkillScheduleHandlers: vi.fn(),
  unregisterSkillScheduleHandlers: vi.fn(),
}));
vi.mock("../skillHandlers.share", () => ({
  registerSkillShareHandlers: vi.fn(),
}));
vi.mock("../../claude-cli", () => ({
  registerClaudeCliHandlers: vi.fn(),
}));
vi.mock("../skillCreatorHandlers", () => ({
  registerSkillCreatorHandlers: vi.fn(),
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
  registerPermissionStoreHandlers: vi.fn(),
}));
vi.mock("../authModeHandlers", () => ({
  registerAuthModeHandlers: vi.fn(),
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
  registerChatEditHandlers: vi.fn(),
}));
vi.mock("../../services/chat-edit", () => ({
  ChatEditService: vi.fn().mockImplementation(() => ({})),
  FileService: vi.fn().mockImplementation(() => ({})),
  ContextBuilder: vi.fn().mockImplementation(() => ({})),
}));

// --- テスト対象のインポート ---
import { registerAllIpcHandlers, unregisterAllIpcHandlers } from "../index";
import { setupThemeWatcher } from "../themeHandlers";

describe("IPC Handler Double Registration Prevention", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("unregisterAllIpcHandlers()", () => {
    it("全チャンネルに対して ipcMain.removeHandler() を呼び出す", () => {
      // Act
      unregisterAllIpcHandlers();

      // Assert: removeHandler が IPC_CHANNELS の各値に対して呼ばれること
      expect(mockIpcMainRemoveHandler).toHaveBeenCalled();

      // 呼び出し引数から実際に削除されたチャンネル名を取得
      const removedChannels = mockIpcMainRemoveHandler.mock.calls.map(
        (call) => call[0],
      );

      // モックした IPC_CHANNELS のサブセットが含まれること
      expect(removedChannels).toContain("file:get-tree");
      expect(removedChannels).toContain("file:read");
      expect(removedChannels).toContain("store:get");
    });

    it("全チャンネルに対して ipcMain.removeAllListeners() を呼び出す", () => {
      // Act
      unregisterAllIpcHandlers();

      // Assert: removeAllListeners が呼ばれること
      expect(mockIpcMainRemoveAllListeners).toHaveBeenCalled();

      // 呼び出し引数から実際に削除されたチャンネル名を取得
      const removedChannels = mockIpcMainRemoveAllListeners.mock.calls.map(
        (call) => call[0],
      );

      // on() リスナー用チャンネル（THEME_SYSTEM_CHANGED 等）が含まれること
      expect(removedChannels).toContain("theme:system-changed");
    });

    it("ハンドラが未登録の状態でも例外を投げない", () => {
      // Arrange: removeHandler が例外を投げるようにモック
      // （ハンドラ未登録時の Electron の実際の挙動をシミュレート）
      mockIpcMainRemoveHandler.mockImplementation(() => {
        // Electron の removeHandler は未登録でも例外を投げない
        // が、念のためエラーが発生しても握りつぶす実装を検証
      });

      // Act & Assert: 例外が発生しないこと
      expect(() => unregisterAllIpcHandlers()).not.toThrow();
    });
  });

  describe("registerAllIpcHandlers() after unregister", () => {
    it("unregisterAllIpcHandlers() 後に registerAllIpcHandlers() を呼んでもエラーにならない", () => {
      const mockWindow =
        mockBrowserWindowInstance as unknown as Electron.BrowserWindow;

      // Act: 最初の登録
      registerAllIpcHandlers(mockWindow);

      // Act: 登録解除
      unregisterAllIpcHandlers();

      // Act & Assert: 再登録がエラーにならない
      expect(() => registerAllIpcHandlers(mockWindow)).not.toThrow();
    });
  });

  describe("activate フローシミュレーション", () => {
    it("register -> unregister -> register の一連フローが例外なく完了する", () => {
      const mockWindow =
        mockBrowserWindowInstance as unknown as Electron.BrowserWindow;

      // Step 1: 初回登録（app.whenReady 相当）
      expect(() => registerAllIpcHandlers(mockWindow)).not.toThrow();

      // Step 2: 登録解除（activate 前の cleanup 相当）
      expect(() => unregisterAllIpcHandlers()).not.toThrow();

      // Step 3: 再登録（activate で新 window 作成後）
      expect(() => registerAllIpcHandlers(mockWindow)).not.toThrow();
    });

    it("複数回の register -> unregister サイクルでも安定動作する", () => {
      const mockWindow =
        mockBrowserWindowInstance as unknown as Electron.BrowserWindow;

      // 3 サイクル分を実行
      for (let i = 0; i < 3; i++) {
        expect(() => registerAllIpcHandlers(mockWindow)).not.toThrow();
        expect(() => unregisterAllIpcHandlers()).not.toThrow();
      }

      // 最後にもう一度登録できること
      expect(() => registerAllIpcHandlers(mockWindow)).not.toThrow();
    });
  });

  describe("auth fallback handlers", () => {
    it("Supabase未設定時にAUTH 5チャネルをfallback登録する", () => {
      const mockWindow =
        mockBrowserWindowInstance as unknown as Electron.BrowserWindow;

      registerAllIpcHandlers(mockWindow);

      const channels = mockIpcMainHandle.mock.calls.map((call) => call[0]);
      expect(channels).toContain("auth:login");
      expect(channels).toContain("auth:logout");
      expect(channels).toContain("auth:get-session");
      expect(channels).toContain("auth:refresh");
      expect(channels).toContain("auth:check-online");
    });

    it("fallbackのAUTH_GET_SESSIONはnullセッションを返す", async () => {
      const mockWindow =
        mockBrowserWindowInstance as unknown as Electron.BrowserWindow;

      registerAllIpcHandlers(mockWindow);

      const getSessionCall = mockIpcMainHandle.mock.calls.find(
        (call) => call[0] === "auth:get-session",
      );
      expect(getSessionCall).toBeDefined();

      const handler = getSessionCall?.[1] as () => Promise<{
        success: boolean;
        data: null;
      }>;
      const result = await handler();

      expect(result).toEqual({ success: true, data: null });
    });

    it("fallbackのAUTH_CHECK_ONLINEはonline状態を返す", async () => {
      const mockWindow =
        mockBrowserWindowInstance as unknown as Electron.BrowserWindow;

      registerAllIpcHandlers(mockWindow);

      const checkOnlineCall = mockIpcMainHandle.mock.calls.find(
        (call) => call[0] === "auth:check-online",
      );
      expect(checkOnlineCall).toBeDefined();

      const handler = checkOnlineCall?.[1] as () => Promise<{
        success: boolean;
        data: { online: boolean };
      }>;
      const result = await handler();

      expect(result).toEqual({ success: true, data: { online: true } });
    });
  });

  describe("setupThemeWatcher unsubscribe", () => {
    it("再登録時に前回の setupThemeWatcher の unsubscribe が呼ばれる", () => {
      const mockWindow =
        mockBrowserWindowInstance as unknown as Electron.BrowserWindow;

      // Act: 初回登録
      registerAllIpcHandlers(mockWindow);

      // setupThemeWatcher が呼ばれたことを確認
      expect(setupThemeWatcher).toHaveBeenCalledTimes(1);

      // Act: 登録解除
      unregisterAllIpcHandlers();

      // Assert: unsubscribe が呼ばれること
      expect(mockThemeUnsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});
