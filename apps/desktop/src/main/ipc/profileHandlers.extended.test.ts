/**
 * プロフィール拡張機能 IPC ハンドラー テスト
 *
 * TDD Red状態: これらのテストは未実装の機能に対するテストです。
 * 実装前にテストを書き、Red状態（失敗）を確認してから実装を進めます。
 *
 * テスト対象:
 * - profile:update-timezone - タイムゾーン更新
 * - profile:update-locale - ロケール更新
 * - profile:update-notifications - 通知設定更新
 * - profile:export - プロフィールエクスポート
 * - profile:import - プロフィールインポート
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// === Mocks ===

// Mock Supabase client for profile operations
const mockSupabaseAuth = {
  getUser: vi.fn(),
  updateUser: vi.fn(),
};

const mockSupabaseFrom = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseUpdate = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseSingle = vi.fn();

const mockSupabase = {
  auth: mockSupabaseAuth,
  from: mockSupabaseFrom.mockReturnValue({
    select: mockSupabaseSelect.mockReturnThis(),
    update: mockSupabaseUpdate.mockReturnThis(),
    eq: mockSupabaseEq.mockReturnThis(),
    single: mockSupabaseSingle,
  }),
};

// Mock cache functions
const mockGetCachedProfile = vi.fn();
const mockUpdateCachedProfile = vi.fn();

// Mock BrowserWindow
const mockMainWindow = {
  id: 1,
  webContents: {
    id: 1,
    send: vi.fn(),
  },
};

// Mock electron modules
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
  BrowserWindow: {
    fromWebContents: vi.fn().mockReturnValue({ id: 1 }),
  },
  app: {
    getPath: vi.fn((name: string) => {
      const paths: Record<string, string> = {
        documents: "/Users/test/Documents",
        userData: "/Users/test/Library/Application Support",
        home: "/Users/test",
      };
      return paths[name] || "";
    }),
  },
  dialog: {
    showSaveDialog: vi.fn(),
    showOpenDialog: vi.fn(),
  },
}));

// Mock ipc-validator to pass validation
vi.mock("../infrastructure/security/ipc-validator.js", () => ({
  withValidation: vi.fn(
    (
      _channel: string,
      handler: (...args: unknown[]) => Promise<unknown>,
      _options: unknown,
    ) => handler,
  ),
}));

// Mock @repo/shared/schemas/auth
vi.mock("@repo/shared/schemas/auth", () => ({
  timezoneSchema: {
    safeParse: vi.fn((tz: string) => {
      // Simple IANA timezone validation
      try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return { success: true, data: tz };
      } catch {
        return {
          success: false,
          error: { issues: [{ message: "無効なタイムゾーンです" }] },
        };
      }
    }),
  },
  localeSchema: {
    safeParse: vi.fn((locale: string) => {
      const validLocales = ["ja", "en", "zh-CN", "zh-TW", "ko"];
      if (validLocales.includes(locale)) {
        return { success: true, data: locale };
      }
      return {
        success: false,
        error: { issues: [{ message: "サポートされていない言語です" }] },
      };
    }),
  },
  partialNotificationSettingsSchema: {
    safeParse: vi.fn((settings: Record<string, unknown>) => {
      // Validate that all values are booleans
      for (const [key, value] of Object.entries(settings)) {
        if (typeof value !== "boolean") {
          return {
            success: false,
            error: {
              issues: [{ message: `${key} は boolean である必要があります` }],
            },
          };
        }
      }
      return { success: true, data: settings };
    }),
  },
  profileExportDataSchema: {
    safeParse: vi.fn((data: unknown) => {
      const d = data as Record<string, unknown>;
      if (d?.version === "1.0" && d?.displayName && d?.timezone && d?.locale) {
        return { success: true, data: d };
      }
      return {
        success: false,
        error: { issues: [{ message: "無効なエクスポートデータです" }] },
      };
    }),
  },
}));

// Mock electron-store
vi.mock("electron-store", () => ({
  default: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

// Mock fs/promises for export/import
vi.mock("fs/promises", () => ({
  writeFile: vi.fn(),
  readFile: vi.fn(),
  stat: vi.fn().mockResolvedValue({ size: 1024 }), // Default small file size
}));

// Import after mocks
import { ipcMain, dialog } from "electron";
import { writeFile, readFile } from "fs/promises";

// === Type definitions for testing ===

interface NotificationSettings {
  email: boolean;
  desktop: boolean;
  sound: boolean;
  workflowComplete: boolean;
  workflowError: boolean;
}

interface ExtendedUserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  plan: "free" | "pro" | "enterprise";
  timezone: string;
  locale: string;
  notificationSettings: NotificationSettings;
  preferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface ProfileExportData {
  version: "1.0";
  exportedAt: string;
  displayName: string;
  timezone: string;
  locale: string;
  notificationSettings: NotificationSettings;
  preferences: Record<string, unknown>;
  linkedProviders?: Array<{ provider: string; linkedAt: string }>;
  accountCreatedAt?: string;
  plan?: string;
}

interface IPCResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// インポート制限定数
const IMPORT_LIMITS = {
  MAX_FILE_SIZE: 1024 * 1024, // 1MB
  MAX_PREFERENCES_KEYS: 100,
};

// === Test Data ===

const mockUser = {
  id: "user-123",
  email: "test@example.com",
  user_metadata: {
    display_name: "Test User",
    avatar_url: "https://example.com/avatar.png",
  },
  created_at: "2024-01-01T00:00:00Z",
  identities: [],
};

const mockExtendedProfileData = {
  id: "user-123",
  display_name: "Test User",
  email: "test@example.com",
  avatar_url: "https://example.com/avatar.png",
  plan: "free",
  timezone: "Asia/Tokyo",
  locale: "ja",
  notification_settings: {
    email: true,
    desktop: true,
    sound: true,
    workflowComplete: true,
    workflowError: true,
  },
  preferences: {},
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

// === Extended Profile Channels (to be added to channels.ts) ===

const EXTENDED_CHANNELS = {
  PROFILE_UPDATE_TIMEZONE: "profile:update-timezone",
  PROFILE_UPDATE_LOCALE: "profile:update-locale",
  PROFILE_UPDATE_NOTIFICATIONS: "profile:update-notifications",
  PROFILE_EXPORT: "profile:export",
  PROFILE_IMPORT: "profile:import",
} as const;

// === Tests ===

describe("profileHandlers - Extended Features (TDD Red)", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    // ipcMain.handle の実装をキャプチャ
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    // Default mock setup
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockSupabaseSingle.mockResolvedValue({
      data: mockExtendedProfileData,
      error: null,
    });

    mockGetCachedProfile.mockResolvedValue(null);
    mockUpdateCachedProfile.mockResolvedValue(undefined);

    // ハンドラー登録
    const { registerProfileHandlers } = await import("./profileHandlers");
    registerProfileHandlers(
      mockMainWindow as unknown as import("electron").BrowserWindow,
      mockSupabase as unknown as import("@supabase/supabase-js").SupabaseClient,
      {
        getCachedProfile: mockGetCachedProfile,
        updateCachedProfile: mockUpdateCachedProfile,
      },
    );
  });

  // =====================================================
  // profile:update-timezone テスト
  // =====================================================

  describe("PROFILE_UPDATE_TIMEZONE handler", () => {
    it("should update timezone with valid IANA timezone", async () => {
      const handler = handlers.get(EXTENDED_CHANNELS.PROFILE_UPDATE_TIMEZONE);

      // TDD Red: ハンドラーが未実装のため、この時点ではnull
      expect(handler).toBeDefined();

      if (!handler) {
        // Red状態: ハンドラーが登録されていない
        expect.fail(
          "Handler not registered - implement profile:update-timezone",
        );
        return;
      }

      mockSupabaseSingle.mockResolvedValueOnce({
        data: { ...mockExtendedProfileData, timezone: "America/New_York" },
        error: null,
      });

      const result = (await handler(
        {},
        { timezone: "America/New_York" },
      )) as IPCResponse<ExtendedUserProfile>;

      expect(result.success).toBe(true);
      expect(result.data?.timezone).toBe("America/New_York");
      expect(mockSupabaseFrom).toHaveBeenCalledWith("user_profiles");
      expect(mockSupabaseUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ timezone: "America/New_York" }),
      );
    });

    it("should reject invalid timezone", async () => {
      const handler = handlers.get(EXTENDED_CHANNELS.PROFILE_UPDATE_TIMEZONE);

      if (!handler) {
        expect.fail(
          "Handler not registered - implement profile:update-timezone",
        );
        return;
      }

      const result = (await handler(
        {},
        { timezone: "Invalid/Timezone" },
      )) as IPCResponse<ExtendedUserProfile>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("profile/validation-failed");
      expect(result.error?.message).toBeDefined(); // 日本語メッセージ「無効なタイムゾーンです」
    });

    it("should update cache after successful timezone change", async () => {
      const handler = handlers.get(EXTENDED_CHANNELS.PROFILE_UPDATE_TIMEZONE);

      if (!handler) {
        expect.fail(
          "Handler not registered - implement profile:update-timezone",
        );
        return;
      }

      mockSupabaseSingle.mockResolvedValueOnce({
        data: { ...mockExtendedProfileData, timezone: "Europe/London" },
        error: null,
      });

      await handler({}, { timezone: "Europe/London" });

      expect(mockUpdateCachedProfile).toHaveBeenCalledWith(
        expect.objectContaining({ timezone: "Europe/London" }),
      );
    });
  });

  // =====================================================
  // profile:update-locale テスト
  // =====================================================

  describe("PROFILE_UPDATE_LOCALE handler", () => {
    it("should update locale with supported language", async () => {
      const handler = handlers.get(EXTENDED_CHANNELS.PROFILE_UPDATE_LOCALE);

      if (!handler) {
        expect.fail("Handler not registered - implement profile:update-locale");
        return;
      }

      mockSupabaseSingle.mockResolvedValueOnce({
        data: { ...mockExtendedProfileData, locale: "en" },
        error: null,
      });

      const result = (await handler(
        {},
        { locale: "en" },
      )) as IPCResponse<ExtendedUserProfile>;

      expect(result.success).toBe(true);
      expect(result.data?.locale).toBe("en");
    });

    it("should reject unsupported locale", async () => {
      const handler = handlers.get(EXTENDED_CHANNELS.PROFILE_UPDATE_LOCALE);

      if (!handler) {
        expect.fail("Handler not registered - implement profile:update-locale");
        return;
      }

      const result = (await handler(
        {},
        { locale: "xx" },
      )) as IPCResponse<ExtendedUserProfile>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("profile/validation-failed");
    });

    it.each(["ja", "en", "zh-CN", "zh-TW", "ko"])(
      "should accept supported locale: %s",
      async (locale) => {
        const handler = handlers.get(EXTENDED_CHANNELS.PROFILE_UPDATE_LOCALE);

        if (!handler) {
          expect.fail(
            "Handler not registered - implement profile:update-locale",
          );
          return;
        }

        mockSupabaseSingle.mockResolvedValueOnce({
          data: { ...mockExtendedProfileData, locale },
          error: null,
        });

        const result = (await handler(
          {},
          { locale },
        )) as IPCResponse<ExtendedUserProfile>;

        expect(result.success).toBe(true);
        expect(result.data?.locale).toBe(locale);
      },
    );
  });

  // =====================================================
  // profile:update-notifications テスト
  // =====================================================

  describe("PROFILE_UPDATE_NOTIFICATIONS handler", () => {
    it("should update notification settings", async () => {
      const handler = handlers.get(
        EXTENDED_CHANNELS.PROFILE_UPDATE_NOTIFICATIONS,
      );

      if (!handler) {
        expect.fail(
          "Handler not registered - implement profile:update-notifications",
        );
        return;
      }

      const newSettings: Partial<NotificationSettings> = {
        email: false,
        sound: false,
      };

      // 現在の設定を取得するクエリ
      mockSupabaseSingle.mockResolvedValueOnce({
        data: {
          notification_settings: mockExtendedProfileData.notification_settings,
        },
        error: null,
      });

      // 更新後のデータを返すクエリ
      mockSupabaseSingle.mockResolvedValueOnce({
        data: {
          ...mockExtendedProfileData,
          notification_settings: {
            ...mockExtendedProfileData.notification_settings,
            ...newSettings,
          },
        },
        error: null,
      });

      const result = (await handler(
        {},
        { notificationSettings: newSettings },
      )) as IPCResponse<ExtendedUserProfile>;

      expect(result.success).toBe(true);
      expect(result.data?.notificationSettings.email).toBe(false);
      expect(result.data?.notificationSettings.sound).toBe(false);
      // 他の設定は維持
      expect(result.data?.notificationSettings.desktop).toBe(true);
    });

    it("should validate notification setting values are boolean", async () => {
      const handler = handlers.get(
        EXTENDED_CHANNELS.PROFILE_UPDATE_NOTIFICATIONS,
      );

      if (!handler) {
        expect.fail(
          "Handler not registered - implement profile:update-notifications",
        );
        return;
      }

      const result = (await handler(
        {},
        {
          notificationSettings: {
            email: "not-a-boolean" as unknown as boolean,
          },
        },
      )) as IPCResponse<ExtendedUserProfile>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("profile/validation-failed");
    });

    it("should merge partial notification settings with existing", async () => {
      const handler = handlers.get(
        EXTENDED_CHANNELS.PROFILE_UPDATE_NOTIFICATIONS,
      );

      if (!handler) {
        expect.fail(
          "Handler not registered - implement profile:update-notifications",
        );
        return;
      }

      // 一部だけ更新
      const partialUpdate = { email: false };

      // 現在の設定を取得するクエリ（Supabaseから取得）
      mockSupabaseSingle.mockResolvedValueOnce({
        data: {
          notification_settings: {
            email: true,
            desktop: true,
            sound: true,
            workflowComplete: true,
            workflowError: true,
          },
        },
        error: null,
      });

      // 更新後のデータを返すクエリ
      mockSupabaseSingle.mockResolvedValueOnce({
        data: {
          ...mockExtendedProfileData,
          notification_settings: {
            email: false,
            desktop: true,
            sound: true,
            workflowComplete: true,
            workflowError: true,
          },
        },
        error: null,
      });

      const result = (await handler(
        {},
        { notificationSettings: partialUpdate },
      )) as IPCResponse<ExtendedUserProfile>;

      expect(result.success).toBe(true);
      // 更新した設定
      expect(result.data?.notificationSettings.email).toBe(false);
      // 維持された設定
      expect(result.data?.notificationSettings.desktop).toBe(true);
      expect(result.data?.notificationSettings.workflowComplete).toBe(true);
    });
  });

  // =====================================================
  // profile:export テスト
  // =====================================================

  describe("PROFILE_EXPORT handler", () => {
    it("should export profile data to JSON file", async () => {
      const handler = handlers.get(EXTENDED_CHANNELS.PROFILE_EXPORT);

      if (!handler) {
        expect.fail("Handler not registered - implement profile:export");
        return;
      }

      const mockFilePath =
        "/Users/test/Documents/profile-export-2024-01-01.json";
      (dialog.showSaveDialog as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        {
          canceled: false,
          filePath: mockFilePath,
        },
      );

      const result = (await handler({})) as {
        success: boolean;
        filePath?: string;
        error?: string;
      };

      expect(result.success).toBe(true);
      expect(result.filePath).toBe(mockFilePath);
      expect(writeFile).toHaveBeenCalled();
    });

    it("should exclude sensitive data from export", async () => {
      const handler = handlers.get(EXTENDED_CHANNELS.PROFILE_EXPORT);

      if (!handler) {
        expect.fail("Handler not registered - implement profile:export");
        return;
      }

      const mockFilePath = "/Users/test/Documents/profile-export.json";
      (dialog.showSaveDialog as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        {
          canceled: false,
          filePath: mockFilePath,
        },
      );

      await handler({});

      // writeFile の呼び出し引数を検証
      const writeFileCall = (writeFile as ReturnType<typeof vi.fn>).mock
        .calls[0];
      const exportedData = JSON.parse(
        writeFileCall[1] as string,
      ) as ProfileExportData;

      // 含まれるべきデータ
      expect(exportedData.displayName).toBeDefined();
      expect(exportedData.timezone).toBeDefined();
      expect(exportedData.locale).toBeDefined();
      expect(exportedData.notificationSettings).toBeDefined();
      // planは含まれるべきデータ（ユーザー情報の一部）
      expect(exportedData.plan).toBeDefined();

      // 除外されるべきデータ（機密情報）
      expect(
        (exportedData as unknown as Record<string, unknown>).email,
      ).toBeUndefined();
      expect(
        (exportedData as unknown as Record<string, unknown>).avatarUrl,
      ).toBeUndefined();
      expect(
        (exportedData as unknown as Record<string, unknown>).id,
      ).toBeUndefined();
    });

    it("should include version and exportedAt in export", async () => {
      const handler = handlers.get(EXTENDED_CHANNELS.PROFILE_EXPORT);

      if (!handler) {
        expect.fail("Handler not registered - implement profile:export");
        return;
      }

      const mockFilePath = "/Users/test/Documents/profile-export.json";
      (dialog.showSaveDialog as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        {
          canceled: false,
          filePath: mockFilePath,
        },
      );

      await handler({});

      const writeFileCall = (writeFile as ReturnType<typeof vi.fn>).mock
        .calls[0];
      const exportedData = JSON.parse(
        writeFileCall[1] as string,
      ) as ProfileExportData;

      expect(exportedData.version).toBe("1.0");
      expect(exportedData.exportedAt).toBeDefined();
      // ISO 8601 形式の検証
      expect(() => new Date(exportedData.exportedAt)).not.toThrow();
    });

    it("should handle user cancellation", async () => {
      const handler = handlers.get(EXTENDED_CHANNELS.PROFILE_EXPORT);

      if (!handler) {
        expect.fail("Handler not registered - implement profile:export");
        return;
      }

      (dialog.showSaveDialog as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        {
          canceled: true,
          filePath: undefined,
        },
      );

      const result = (await handler({})) as {
        success: boolean;
        filePath?: string;
        error?: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined(); // キャンセルメッセージ
      expect(writeFile).not.toHaveBeenCalled();
    });
  });

  // =====================================================
  // profile:import テスト
  // =====================================================

  describe("PROFILE_IMPORT handler", () => {
    const validExportData: ProfileExportData = {
      version: "1.0",
      exportedAt: "2024-01-01T00:00:00Z",
      displayName: "Imported User",
      timezone: "America/Los_Angeles",
      locale: "en",
      notificationSettings: {
        email: false,
        desktop: true,
        sound: false,
        workflowComplete: true,
        workflowError: true,
      },
      preferences: { customSetting: "value" },
    };

    it("should import profile data from JSON file", async () => {
      const handler = handlers.get(EXTENDED_CHANNELS.PROFILE_IMPORT);

      if (!handler) {
        expect.fail("Handler not registered - implement profile:import");
        return;
      }

      const mockFilePath = "/Users/test/Documents/profile-export.json";

      (readFile as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        JSON.stringify(validExportData),
      );

      mockSupabaseSingle.mockResolvedValueOnce({
        data: {
          ...mockExtendedProfileData,
          display_name: validExportData.displayName,
          timezone: validExportData.timezone,
          locale: validExportData.locale,
          notification_settings: validExportData.notificationSettings,
          preferences: validExportData.preferences,
        },
        error: null,
      });

      // filePathを引数として渡す
      const result = (await handler({}, { filePath: mockFilePath })) as {
        success: boolean;
        profile?: Partial<ExtendedUserProfile>;
        error?: string;
      };

      expect(result.success).toBe(true);
      expect(result.profile?.displayName).toBe("Imported User");
      expect(result.profile?.timezone).toBe("America/Los_Angeles");
      expect(result.profile?.locale).toBe("en");
    });

    it("should validate import data with Zod schema", async () => {
      const handler = handlers.get(EXTENDED_CHANNELS.PROFILE_IMPORT);

      if (!handler) {
        expect.fail("Handler not registered - implement profile:import");
        return;
      }

      const mockFilePath = "/Users/test/Documents/invalid.json";

      // 不正なデータ
      const invalidData = {
        version: "2.0", // 未サポートバージョン
        displayName: "A", // 短すぎる
        timezone: "Invalid/TZ",
      };

      (readFile as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        JSON.stringify(invalidData),
      );

      const result = (await handler({}, { filePath: mockFilePath })) as {
        success: boolean;
        profile?: Partial<ExtendedUserProfile>;
        error?: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined(); // バリデーションエラーメッセージ
    });

    it("should reject file exceeding size limit", async () => {
      const handler = handlers.get(EXTENDED_CHANNELS.PROFILE_IMPORT);

      if (!handler) {
        expect.fail("Handler not registered - implement profile:import");
        return;
      }

      const mockFilePath = "/Users/test/Documents/large.json";

      // fs.stat をモックして大きなファイルサイズを返す
      const { stat } = await import("fs/promises");
      (stat as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        size: IMPORT_LIMITS.MAX_FILE_SIZE + 1,
      });

      const result = (await handler({}, { filePath: mockFilePath })) as {
        success: boolean;
        profile?: Partial<ExtendedUserProfile>;
        error?: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined(); // ファイルサイズエラーメッセージ
    });

    it("should handle incompatible version", async () => {
      const handler = handlers.get(EXTENDED_CHANNELS.PROFILE_IMPORT);

      if (!handler) {
        expect.fail("Handler not registered - implement profile:import");
        return;
      }

      const mockFilePath = "/Users/test/Documents/old-version.json";

      const incompatibleData = {
        ...validExportData,
        version: "0.1", // 古いバージョン
      };

      (readFile as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        JSON.stringify(incompatibleData),
      );

      const result = (await handler({}, { filePath: mockFilePath })) as {
        success: boolean;
        profile?: Partial<ExtendedUserProfile>;
        error?: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined(); // バージョン非互換エラー
    });

    it("should handle missing filePath argument", async () => {
      const handler = handlers.get(EXTENDED_CHANNELS.PROFILE_IMPORT);

      if (!handler) {
        expect.fail("Handler not registered - implement profile:import");
        return;
      }

      // filePathが指定されていない場合
      const result = (await handler({}, {} as { filePath: string })) as {
        success: boolean;
        profile?: Partial<ExtendedUserProfile>;
        error?: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  // =====================================================
  // エラーハンドリング テスト
  // =====================================================

  describe("Error handling", () => {
    it("should return generic error message to user (no internal details)", async () => {
      const handler = handlers.get(EXTENDED_CHANNELS.PROFILE_UPDATE_TIMEZONE);

      if (!handler) {
        expect.fail(
          "Handler not registered - implement profile:update-timezone",
        );
        return;
      }

      // 内部エラーをシミュレート
      mockSupabaseAuth.getUser.mockRejectedValueOnce(
        new Error(
          "Internal database connection failed at postgres://user:pass@host",
        ),
      );

      const result = (await handler(
        {},
        { timezone: "Asia/Tokyo" },
      )) as IPCResponse<ExtendedUserProfile>;

      expect(result.success).toBe(false);
      // 内部詳細が含まれていないことを確認
      expect(result.error?.message).not.toContain("postgres://");
      expect(result.error?.message).not.toContain("password");
      // 汎用メッセージが返されることを確認
      expect(result.error?.message).toMatch(
        /プロフィールの更新に失敗しました|タイムゾーンの更新に失敗しました|Failed to update/i,
      );
    });

    it("should handle network errors gracefully", async () => {
      const handler = handlers.get(EXTENDED_CHANNELS.PROFILE_UPDATE_LOCALE);

      if (!handler) {
        expect.fail("Handler not registered - implement profile:update-locale");
        return;
      }

      mockSupabaseAuth.getUser.mockRejectedValueOnce(
        new Error("Network request failed"),
      );

      const result = (await handler(
        {},
        { locale: "en" },
      )) as IPCResponse<ExtendedUserProfile>;

      expect(result.success).toBe(false);
      // エラーコードはupdate-failedを使用
      expect(result.error?.code).toBe("profile/update-failed");
    });

    it("should handle unauthenticated user", async () => {
      const handler = handlers.get(
        EXTENDED_CHANNELS.PROFILE_UPDATE_NOTIFICATIONS,
      );

      if (!handler) {
        expect.fail(
          "Handler not registered - implement profile:update-notifications",
        );
        return;
      }

      mockSupabaseAuth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      const result = (await handler(
        {},
        { notificationSettings: { email: false } },
      )) as IPCResponse<ExtendedUserProfile>;

      expect(result.success).toBe(false);
      // エラーコードはupdate-failedを使用
      expect(result.error?.code).toBe("profile/update-failed");
    });
  });

  // =====================================================
  // キャッシュ同期 テスト
  // =====================================================

  describe("Cache synchronization", () => {
    it("should update cache after timezone change", async () => {
      const handler = handlers.get(EXTENDED_CHANNELS.PROFILE_UPDATE_TIMEZONE);

      if (!handler) {
        expect.fail(
          "Handler not registered - implement profile:update-timezone",
        );
        return;
      }

      mockSupabaseSingle.mockResolvedValueOnce({
        data: { ...mockExtendedProfileData, timezone: "Pacific/Auckland" },
        error: null,
      });

      await handler({}, { timezone: "Pacific/Auckland" });

      expect(mockUpdateCachedProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          timezone: "Pacific/Auckland",
        }),
      );
    });

    it("should not update cache on failure", async () => {
      const handler = handlers.get(EXTENDED_CHANNELS.PROFILE_UPDATE_TIMEZONE);

      if (!handler) {
        expect.fail(
          "Handler not registered - implement profile:update-timezone",
        );
        return;
      }

      // キャッシュをクリアしてからエラーをモック
      mockUpdateCachedProfile.mockClear();
      mockSupabaseSingle.mockResolvedValueOnce({
        data: null,
        error: { message: "Database error", code: "DB001" },
      });

      await handler({}, { timezone: "Asia/Tokyo" });

      expect(mockUpdateCachedProfile).not.toHaveBeenCalled();
    });
  });
});
