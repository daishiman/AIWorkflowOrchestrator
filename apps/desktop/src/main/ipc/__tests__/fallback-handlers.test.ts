/**
 * Profile/Avatar フォールバックハンドラ テスト
 *
 * TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001: Phase 4 - テスト作成
 *
 * Supabase 未設定環境で Profile(11ch) / Avatar(3ch) の IPC フォールバックハンドラが
 * 正しく登録され、安全なエラーレスポンスを返すことを検証する。
 *
 * テストケース: T-P1〜T-P5, T-A1〜T-A4, T-I1〜T-I2
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  PROFILE_ERROR_CODES,
  AVATAR_ERROR_CODES,
} from "@repo/shared/types/auth";

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
  mockGetSupabaseClient,
  mockNetIsOnline,
} = vi.hoisted(() => {
  const mockWebContentsSend = vi.fn();
  const mockIsDestroyed = vi.fn().mockReturnValue(false);
  const inst = {
    webContents: { send: mockWebContentsSend },
    isDestroyed: mockIsDestroyed,
  };
  return {
    mockIpcMainHandle: vi.fn(),
    mockIpcMainRemoveHandler: vi.fn(),
    mockIpcMainOn: vi.fn(),
    mockIpcMainRemoveAllListeners: vi.fn(),
    mockBrowserWindowInstance: inst,
    mockGetAllWindows: vi.fn().mockReturnValue([inst]),
    mockNativeThemeOn: vi.fn(),
    mockNativeThemeRemoveListener: vi.fn(),
    mockThemeUnsubscribe: vi.fn(),
    mockGetSupabaseClient: vi.fn().mockReturnValue(null),
    mockNetIsOnline: vi.fn().mockReturnValue(true),
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
    isOnline: mockNetIsOnline,
  },
}));

// --- IPC_CHANNELS: 実際の定数をインポート ---
// channels.ts はモックせず、実際の定数を使用する（P27 対策）

// --- electron-store モック ---
vi.mock("electron-store", () => ({
  default: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockReturnValue([]),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

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
}));
vi.mock("../communityHandlers", () => ({
  registerCommunityHandlers: vi.fn(),
}));
vi.mock("../skillHandlers", () => ({
  registerSkillHandlers: vi.fn(),
  registerSkillScheduleHandlers: vi.fn(),
  registerSkillDocsHandlers: vi.fn(),
  unregisterSkillScheduleHandlers: vi.fn(),
  registerSkillChainHandlers: vi.fn(),
  getSkillExecutorInstance: vi.fn().mockReturnValue(null),
}));
vi.mock("../skillHandlers.share", () => ({
  registerSkillShareHandlers: vi.fn(),
}));
vi.mock("../skillAnalyticsHandlers", () => ({
  registerSkillAnalyticsHandlers: vi.fn(),
}));
vi.mock("../skillDebugHandlers", () => ({
  registerSkillDebugHandlers: vi.fn(),
}));
vi.mock("../../claude-cli", () => ({
  registerClaudeCliHandlers: vi.fn(),
}));
vi.mock("../skillCreatorHandlers", () => ({
  registerSkillCreatorHandlers: vi.fn(),
}));
vi.mock("../skillFileHandlers", () => ({
  registerSkillFileHandlers: vi.fn(),
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
vi.mock("../../services/skill/SkillFileManager", () => ({
  SkillFileManager: vi.fn().mockImplementation(() => ({})),
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
  AuthKeyService: vi.fn().mockImplementation(() => ({})),
  createAuthKeyStorage: vi.fn().mockReturnValue({}),
  createAuthModeService: vi.fn().mockReturnValue({}),
}));
vi.mock("../../infrastructure", () => ({
  getSupabaseClient: mockGetSupabaseClient,
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
vi.mock("../../services/skill/SkillDocGenerator", () => ({
  SkillDocGenerator: vi.fn().mockImplementation(() => ({})),
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

// --- テスト対象のインポート ---
import { registerAllIpcHandlers } from "../index";
import { IPC_CHANNELS } from "../../../preload/channels";

// --- 期待するフォールバックチャンネル定義 ---
const PROFILE_FALLBACK_CHANNELS = [
  IPC_CHANNELS.PROFILE_GET,
  IPC_CHANNELS.PROFILE_UPDATE,
  IPC_CHANNELS.PROFILE_DELETE,
  IPC_CHANNELS.PROFILE_GET_PROVIDERS,
  IPC_CHANNELS.PROFILE_LINK_PROVIDER,
  IPC_CHANNELS.PROFILE_UNLINK_PROVIDER,
  IPC_CHANNELS.PROFILE_UPDATE_TIMEZONE,
  IPC_CHANNELS.PROFILE_UPDATE_LOCALE,
  IPC_CHANNELS.PROFILE_UPDATE_NOTIFICATIONS,
  IPC_CHANNELS.PROFILE_EXPORT,
  IPC_CHANNELS.PROFILE_IMPORT,
] as const;

const AVATAR_FALLBACK_CHANNELS = [
  IPC_CHANNELS.AVATAR_UPLOAD,
  IPC_CHANNELS.AVATAR_USE_PROVIDER,
  IPC_CHANNELS.AVATAR_REMOVE,
] as const;

const AUTH_FALLBACK_CHANNELS = [
  IPC_CHANNELS.AUTH_LOGIN,
  IPC_CHANNELS.AUTH_LOGOUT,
  IPC_CHANNELS.AUTH_GET_SESSION,
  IPC_CHANNELS.AUTH_REFRESH,
  IPC_CHANNELS.AUTH_CHECK_ONLINE,
] as const;

// --- ヘルパー: 登録されたハンドラからチャンネル名一覧を取得 ---
function getRegisteredChannels(): string[] {
  return mockIpcMainHandle.mock.calls.map(
    (call: [string, ...unknown[]]) => call[0],
  );
}

// --- ヘルパー: 指定チャンネルのハンドラ関数を取得 ---
function getHandlerForChannel(
  channel: string,
): ((...args: unknown[]) => Promise<unknown>) | undefined {
  const call = mockIpcMainHandle.mock.calls.find(
    (c: [string, ...unknown[]]) => c[0] === channel,
  );
  return call?.[1] as ((...args: unknown[]) => Promise<unknown>) | undefined;
}

describe("registerProfileFallbackHandlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Supabase 未設定状態（fallback 経路）
    mockGetSupabaseClient.mockReturnValue(null);
  });

  // T-P1: registerProfileFallbackHandlers() により ipcMain.handle が 11 回呼ばれる
  it("T-P1: Profile フォールバックハンドラが 11 チャンネル分登録される", () => {
    const mockWindow =
      mockBrowserWindowInstance as unknown as Electron.BrowserWindow;
    registerAllIpcHandlers(mockWindow);

    const channels = getRegisteredChannels();
    const profileChannels = channels.filter((ch) => ch.startsWith("profile:"));

    expect(profileChannels).toHaveLength(11);
  });

  // T-P2: 登録チャンネル名が IPC_CHANNELS 定数と一致する
  it("T-P2: 登録チャンネル名が IPC_CHANNELS の Profile 定数と一致する", () => {
    const mockWindow =
      mockBrowserWindowInstance as unknown as Electron.BrowserWindow;
    registerAllIpcHandlers(mockWindow);

    const channels = getRegisteredChannels();

    for (const expected of PROFILE_FALLBACK_CHANNELS) {
      expect(channels).toContain(expected);
    }
  });

  // T-P3: profile:get のフォールバックが PROFILE_ERROR_CODES.NOT_CONFIGURED を返す
  it("T-P3: profile:get フォールバックが { success: false, error: { code: 'profile/not-configured' } } を返す", async () => {
    const mockWindow =
      mockBrowserWindowInstance as unknown as Electron.BrowserWindow;
    registerAllIpcHandlers(mockWindow);

    const handler = getHandlerForChannel(IPC_CHANNELS.PROFILE_GET);
    expect(handler).toBeDefined();

    const result = await handler!();
    expect(result).toEqual({
      success: false,
      error: {
        code: PROFILE_ERROR_CODES.NOT_CONFIGURED,
        message:
          "Profile service is not configured. Supabase environment variables are required.",
      },
    });
  });

  // T-P4: 全 11 チャンネルが同一構造のエラーレスポンスを返す
  it("T-P4: 全 11 チャンネルのフォールバックが同一構造のエラーレスポンスを返す", async () => {
    const mockWindow =
      mockBrowserWindowInstance as unknown as Electron.BrowserWindow;
    registerAllIpcHandlers(mockWindow);

    const expectedResponse = {
      success: false,
      error: {
        code: PROFILE_ERROR_CODES.NOT_CONFIGURED,
        message:
          "Profile service is not configured. Supabase environment variables are required.",
      },
    };

    for (const channel of PROFILE_FALLBACK_CHANNELS) {
      const handler = getHandlerForChannel(channel);
      expect(handler, `Handler for ${channel} should be defined`).toBeDefined();

      const result = await handler!();
      expect(result).toEqual(expectedResponse);
    }
  });

  // T-P5: エラーメッセージに内部パス・スタックトレースが含まれない
  it("T-P5: エラーメッセージに内部パス・スタックトレースが含まれない", async () => {
    const mockWindow =
      mockBrowserWindowInstance as unknown as Electron.BrowserWindow;
    registerAllIpcHandlers(mockWindow);

    for (const channel of PROFILE_FALLBACK_CHANNELS) {
      const handler = getHandlerForChannel(channel);
      const result = (await handler!()) as {
        error?: { message?: string; code?: string };
      };

      const message = result.error?.message ?? "";
      const code = result.error?.code ?? "";

      // 内部パスが含まれない
      expect(message).not.toMatch(/\/(src|apps|node_modules)\//);
      expect(message).not.toMatch(/\.ts:/);
      // スタックトレースが含まれない
      expect(message).not.toMatch(/at\s+\w+/);
      expect(message).not.toMatch(/Error:/);
      // コードにファイルパスパターンが含まれない（domain/error-name 形式は許容）
      expect(code).not.toMatch(/\/(src|apps|node_modules)\//);
      expect(code).not.toMatch(/\.ts/);
    }
  });
});

describe("registerAvatarFallbackHandlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSupabaseClient.mockReturnValue(null);
  });

  // T-A1: registerAvatarFallbackHandlers() により ipcMain.handle が 3 回呼ばれる
  it("T-A1: Avatar フォールバックハンドラが 3 チャンネル分登録される", () => {
    const mockWindow =
      mockBrowserWindowInstance as unknown as Electron.BrowserWindow;
    registerAllIpcHandlers(mockWindow);

    const channels = getRegisteredChannels();
    const avatarChannels = channels.filter((ch) => ch.startsWith("avatar:"));

    expect(avatarChannels).toHaveLength(3);
  });

  // T-A2: 登録チャンネル名が IPC_CHANNELS の Avatar 定数と一致する
  it("T-A2: 登録チャンネル名が IPC_CHANNELS の Avatar 定数と一致する", () => {
    const mockWindow =
      mockBrowserWindowInstance as unknown as Electron.BrowserWindow;
    registerAllIpcHandlers(mockWindow);

    const channels = getRegisteredChannels();

    for (const expected of AVATAR_FALLBACK_CHANNELS) {
      expect(channels).toContain(expected);
    }
  });

  // T-A3: avatar:upload のフォールバックが AVATAR_ERROR_CODES.NOT_CONFIGURED を返す
  it("T-A3: avatar:upload フォールバックが { success: false, error: { code: 'avatar/not-configured' } } を返す", async () => {
    const mockWindow =
      mockBrowserWindowInstance as unknown as Electron.BrowserWindow;
    registerAllIpcHandlers(mockWindow);

    const handler = getHandlerForChannel(IPC_CHANNELS.AVATAR_UPLOAD);
    expect(handler).toBeDefined();

    const result = await handler!();
    expect(result).toEqual({
      success: false,
      error: {
        code: AVATAR_ERROR_CODES.NOT_CONFIGURED,
        message:
          "Avatar service is not configured. Supabase environment variables are required.",
      },
    });
  });

  // T-A4: 全 3 チャンネルが同一構造のエラーレスポンスを返す
  it("T-A4: 全 3 チャンネルのフォールバックが同一構造のエラーレスポンスを返す", async () => {
    const mockWindow =
      mockBrowserWindowInstance as unknown as Electron.BrowserWindow;
    registerAllIpcHandlers(mockWindow);

    const expectedResponse = {
      success: false,
      error: {
        code: AVATAR_ERROR_CODES.NOT_CONFIGURED,
        message:
          "Avatar service is not configured. Supabase environment variables are required.",
      },
    };

    for (const channel of AVATAR_FALLBACK_CHANNELS) {
      const handler = getHandlerForChannel(channel);
      expect(handler, `Handler for ${channel} should be defined`).toBeDefined();

      const result = await handler!();
      expect(result).toEqual(expectedResponse);
    }
  });
});

describe("Fallback handlers integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // T-I1: Supabase 未設定時に Auth + Profile + Avatar 全フォールバックが登録される（19 チャンネル）
  it("T-I1: Supabase 未設定時に Auth(5) + Profile(11) + Avatar(3) = 19 チャンネルのフォールバックが登録される", () => {
    mockGetSupabaseClient.mockReturnValue(null);
    const mockWindow =
      mockBrowserWindowInstance as unknown as Electron.BrowserWindow;
    registerAllIpcHandlers(mockWindow);

    const channels = getRegisteredChannels();

    // Auth フォールバック 5 チャンネル
    for (const ch of AUTH_FALLBACK_CHANNELS) {
      expect(channels).toContain(ch);
    }
    // Profile フォールバック 11 チャンネル
    for (const ch of PROFILE_FALLBACK_CHANNELS) {
      expect(channels).toContain(ch);
    }
    // Avatar フォールバック 3 チャンネル
    for (const ch of AVATAR_FALLBACK_CHANNELS) {
      expect(channels).toContain(ch);
    }

    // フォールバック合計 19 チャンネルが全て含まれる
    const allFallbackChannels = [
      ...AUTH_FALLBACK_CHANNELS,
      ...PROFILE_FALLBACK_CHANNELS,
      ...AVATAR_FALLBACK_CHANNELS,
    ];
    const registeredFallbackChannels = channels.filter((ch) =>
      allFallbackChannels.includes(ch),
    );
    expect(registeredFallbackChannels).toHaveLength(19);
  });

  // T-I2: Supabase 設定済み時にフォールバックハンドラが登録されない
  it("T-I2: Supabase 設定済み時にフォールバックハンドラが登録されない", () => {
    // Supabase クライアントが有効な値を返す
    mockGetSupabaseClient.mockReturnValue({ auth: {} });
    const mockWindow =
      mockBrowserWindowInstance as unknown as Electron.BrowserWindow;
    registerAllIpcHandlers(mockWindow);

    const channels = getRegisteredChannels();

    // フォールバック用チャンネルが ipcMain.handle に直接登録されていない
    // （Supabase 設定済み時は registerProfileHandlers/registerAvatarHandlers がモックで呼ばれるだけ）
    const fallbackProfileChannels = channels.filter((ch) =>
      ch.startsWith("profile:"),
    );
    const fallbackAvatarChannels = channels.filter((ch) =>
      ch.startsWith("avatar:"),
    );

    // フォールバック経路では ipcMain.handle を直接呼ぶが、
    // 通常経路ではモックされた registerProfileHandlers/registerAvatarHandlers が呼ばれるだけ
    // → ipcMain.handle に profile:/avatar: が含まれてはならない
    expect(fallbackProfileChannels).toHaveLength(0);
    expect(fallbackAvatarChannels).toHaveLength(0);
  });
});

// ============================================================
// Phase 6: テスト拡充
// TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001
// ============================================================
describe("Test expansion (Phase 6)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSupabaseClient.mockReturnValue(null);
  });

  // --- T-E1: Profile フォールバックのチャンネル数が channels.ts の Profile 定数数と一致 ---
  it("T-E1: Profile フォールバックのチャンネル数が channels.ts の PROFILE_ 定数数（11）と一致する", () => {
    // IPC_CHANNELS から PROFILE_ プレフィックスのキーを抽出
    const profileKeys = Object.keys(IPC_CHANNELS).filter((key) =>
      key.startsWith("PROFILE_"),
    );
    expect(profileKeys).toHaveLength(11);
    expect(PROFILE_FALLBACK_CHANNELS).toHaveLength(profileKeys.length);
  });

  // --- T-E2: Avatar フォールバックのチャンネル数が channels.ts の Avatar 定数数と一致 ---
  it("T-E2: Avatar フォールバックのチャンネル数が channels.ts の AVATAR_ 定数数（3）と一致する", () => {
    const avatarKeys = Object.keys(IPC_CHANNELS).filter((key) =>
      key.startsWith("AVATAR_"),
    );
    expect(avatarKeys).toHaveLength(3);
    expect(AVATAR_FALLBACK_CHANNELS).toHaveLength(avatarKeys.length);
  });

  // --- T-E3: Profile レスポンスの error.code が 'profile/not-configured' 固定 ---
  it("T-E3: 全 Profile フォールバックの error.code が 'profile/not-configured' 固定である", async () => {
    const mockWindow =
      mockBrowserWindowInstance as unknown as Electron.BrowserWindow;
    registerAllIpcHandlers(mockWindow);

    for (const channel of PROFILE_FALLBACK_CHANNELS) {
      const handler = getHandlerForChannel(channel);
      expect(handler, `Handler for ${channel} should be defined`).toBeDefined();

      const result = (await handler!()) as {
        error?: { code?: string };
      };
      expect(result.error?.code).toBe("profile/not-configured");
    }
  });

  // --- T-E4: Avatar レスポンスの error.code が 'avatar/not-configured' 固定 ---
  it("T-E4: 全 Avatar フォールバックの error.code が 'avatar/not-configured' 固定である", async () => {
    const mockWindow =
      mockBrowserWindowInstance as unknown as Electron.BrowserWindow;
    registerAllIpcHandlers(mockWindow);

    for (const channel of AVATAR_FALLBACK_CHANNELS) {
      const handler = getHandlerForChannel(channel);
      expect(handler, `Handler for ${channel} should be defined`).toBeDefined();

      const result = (await handler!()) as {
        error?: { code?: string };
      };
      expect(result.error?.code).toBe("avatar/not-configured");
    }
  });

  // --- T-E5: フォールバックレスポンスの success が false 固定 ---
  it("T-E5: 全フォールバックレスポンスの success が false 固定である", async () => {
    const mockWindow =
      mockBrowserWindowInstance as unknown as Electron.BrowserWindow;
    registerAllIpcHandlers(mockWindow);

    const allFallbackChannels = [
      ...PROFILE_FALLBACK_CHANNELS,
      ...AVATAR_FALLBACK_CHANNELS,
    ];

    for (const channel of allFallbackChannels) {
      const handler = getHandlerForChannel(channel);
      expect(handler, `Handler for ${channel} should be defined`).toBeDefined();

      const result = (await handler!()) as { success?: boolean };
      expect(result.success).toBe(false);
    }
  });

  // --- T-E6: フォールバックレスポンスに data プロパティが存在しない ---
  it("T-E6: 全フォールバックレスポンスに data プロパティが存在しない", async () => {
    const mockWindow =
      mockBrowserWindowInstance as unknown as Electron.BrowserWindow;
    registerAllIpcHandlers(mockWindow);

    const allFallbackChannels = [
      ...PROFILE_FALLBACK_CHANNELS,
      ...AVATAR_FALLBACK_CHANNELS,
    ];

    for (const channel of allFallbackChannels) {
      const handler = getHandlerForChannel(channel);
      expect(handler, `Handler for ${channel} should be defined`).toBeDefined();

      const result = (await handler!()) as Record<string, unknown>;
      expect(result).not.toHaveProperty("data");
    }
  });

  // --- 回帰テスト: チャンネル数同期検証 ---
  it("should cover all PROFILE channels defined in IPC_CHANNELS", () => {
    // IPC_CHANNELS から PROFILE_ プレフィックスのチャンネル値を抽出
    const profileChannelValues = Object.entries(IPC_CHANNELS)
      .filter(([key]) => key.startsWith("PROFILE_"))
      .map(([, value]) => value);

    const mockWindow =
      mockBrowserWindowInstance as unknown as Electron.BrowserWindow;
    registerAllIpcHandlers(mockWindow);

    const registeredChannels = getRegisteredChannels();

    // channels.ts で定義された全 PROFILE チャンネルがフォールバックとして登録されている
    for (const expectedChannel of profileChannelValues) {
      expect(
        registeredChannels,
        `Channel ${expectedChannel} should be registered as fallback`,
      ).toContain(expectedChannel);
    }

    // 登録された profile: チャンネルの数が定数数と一致
    const registeredProfileChannels = registeredChannels.filter((ch) =>
      ch.startsWith("profile:"),
    );
    expect(registeredProfileChannels).toHaveLength(profileChannelValues.length);
  });

  it("should cover all AVATAR channels defined in IPC_CHANNELS", () => {
    // IPC_CHANNELS から AVATAR_ プレフィックスのチャンネル値を抽出
    const avatarChannelValues = Object.entries(IPC_CHANNELS)
      .filter(([key]) => key.startsWith("AVATAR_"))
      .map(([, value]) => value);

    const mockWindow =
      mockBrowserWindowInstance as unknown as Electron.BrowserWindow;
    registerAllIpcHandlers(mockWindow);

    const registeredChannels = getRegisteredChannels();

    // channels.ts で定義された全 AVATAR チャンネルがフォールバックとして登録されている
    for (const expectedChannel of avatarChannelValues) {
      expect(
        registeredChannels,
        `Channel ${expectedChannel} should be registered as fallback`,
      ).toContain(expectedChannel);
    }

    // 登録された avatar: チャンネルの数が定数数と一致
    const registeredAvatarChannels = registeredChannels.filter((ch) =>
      ch.startsWith("avatar:"),
    );
    expect(registeredAvatarChannels).toHaveLength(avatarChannelValues.length);
  });
});
