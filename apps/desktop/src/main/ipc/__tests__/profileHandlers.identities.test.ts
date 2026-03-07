/**
 * profileHandlers - identities 防御テスト
 *
 * Phase 6: テスト拡充
 * GAP-TEST-09: identities の Array.isArray ガード検証
 *
 * profileHandlers.ts で identities を Array.isArray() で防御している
 * 3箇所（GET_PROVIDERS, UNLINK_PROVIDER, EXPORT）の動作を検証する。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// === Mocks ===

const mockSupabaseAuth = {
  getUser: vi.fn(),
  updateUser: vi.fn(),
  unlinkIdentity: vi.fn(),
  signOut: vi.fn(),
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

const mockGetCachedProfile = vi.fn();
const mockUpdateCachedProfile = vi.fn();

const mockMainWindow = {
  id: 1,
  webContents: {
    id: 1,
    send: vi.fn(),
  },
};

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

vi.mock("../../infrastructure/security/ipc-validator.js", () => ({
  withValidation: vi.fn(
    (
      _channel: string,
      handler: (...args: unknown[]) => Promise<unknown>,
      _options: unknown,
    ) => handler,
  ),
}));

vi.mock("electron-store", () => ({
  default: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

vi.mock("@repo/shared/infrastructure/auth", () => ({
  toAuthUser: vi.fn((user) => {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email ?? "",
      displayName: user.user_metadata?.name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
      provider: user.app_metadata?.provider ?? "google",
      createdAt: user.created_at ?? "2024-01-01T00:00:00Z",
      lastSignInAt:
        user.last_sign_in_at ?? user.created_at ?? "2024-01-01T00:00:00Z",
    };
  }),
  toLinkedProvider: vi.fn((identity) => ({
    provider: identity.provider,
    providerId: identity.id,
    email: identity.identity_data?.email ?? "",
    displayName: identity.identity_data?.name ?? null,
    avatarUrl: identity.identity_data?.avatar_url ?? null,
    linkedAt: identity.created_at,
  })),
}));

vi.mock("@repo/shared/types/auth", () => ({
  isValidProvider: (provider: unknown) =>
    typeof provider === "string" &&
    ["google", "github", "discord"].includes(provider),
  validateDisplayName: (name: string) => {
    if (name.length < 3) return { valid: false, message: "Too short" };
    if (name.length > 30) return { valid: false, message: "Too long" };
    return { valid: true };
  },
  validateAvatarUrl: (url: string | null) => {
    if (url === null) return { valid: true };
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:")
        return { valid: false, message: "Avatar URL must use HTTPS" };
      return { valid: true };
    } catch {
      return { valid: false, message: "Invalid URL format" };
    }
  },
  PROFILE_ERROR_CODES: {
    GET_FAILED: "profile/get-failed",
    UPDATE_FAILED: "profile/update-failed",
    PROVIDERS_FAILED: "profile/providers-failed",
    LINK_FAILED: "profile/link-failed",
    VALIDATION_FAILED: "profile/validation-failed",
  },
  DEFAULT_NOTIFICATION_SETTINGS: {
    emailNotifications: true,
    pushNotifications: false,
    inAppNotifications: true,
  },
  IMPORT_LIMITS: {
    MAX_FILE_SIZE: 10 * 1024 * 1024,
    CURRENT_VERSION: "1.0",
  },
}));

vi.mock("@repo/shared/schemas/auth", () => ({
  timezoneSchema: { safeParse: vi.fn().mockReturnValue({ success: true }) },
  localeSchema: { safeParse: vi.fn().mockReturnValue({ success: true }) },
  partialNotificationSettingsSchema: {
    safeParse: vi.fn().mockReturnValue({ success: true }),
  },
  profileExportDataSchema: {
    safeParse: vi.fn().mockReturnValue({ success: true }),
  },
}));

vi.mock("../../infrastructure/profileSync.js", () => ({
  syncProfileToMetadata: vi.fn().mockResolvedValue({ success: true }),
  syncMetadataToProfile: vi.fn().mockResolvedValue({ success: true }),
  ensureProfileConsistency: vi.fn().mockResolvedValue({ success: true }),
  SYNC_ERROR_CODES: {
    AUTH_UPDATE_FAILED: "sync/auth-update-failed",
    DB_UPDATE_FAILED: "sync/db-update-failed",
    CONSISTENCY_CHECK_FAILED: "sync/consistency-check-failed",
  },
}));

import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../../preload/channels";

// === Type ===

interface IPCResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// === Tests ===

describe("profileHandlers - GAP-06 identities Array.isArray guard", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    user_metadata: {
      name: "Test User",
      avatar_url: "https://example.com/avatar.png",
    },
    identities: [
      {
        id: "google-identity-id",
        provider: "google",
        identity_data: {
          email: "test@example.com",
          name: "Test User Google",
          avatar_url: "https://google.com/avatar.png",
        },
        created_at: "2024-01-01T00:00:00Z",
      },
    ],
  };

  const mockProfileData = {
    id: "user-123",
    display_name: "Test User",
    email: "test@example.com",
    avatar_url: "https://example.com/avatar.png",
    plan: "free",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-12-01T00:00:00Z",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockSupabaseSingle.mockResolvedValue({
      data: mockProfileData,
      error: null,
    });

    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    const { registerProfileHandlers } = await import("../profileHandlers");
    registerProfileHandlers(
      mockMainWindow as unknown as import("electron").BrowserWindow,
      mockSupabase as unknown as import("@supabase/supabase-js").SupabaseClient,
      {
        getCachedProfile: mockGetCachedProfile,
        updateCachedProfile: mockUpdateCachedProfile,
      },
    );
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe("PROFILE_GET_PROVIDERS - identities guard", () => {
    it("identities が null の場合、空配列を返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_GET_PROVIDERS);
      if (!handler) throw new Error("Handler not registered");

      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: { ...mockUser, identities: null } },
        error: null,
      });

      const result = (await handler({})) as IPCResponse<unknown[]>;

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("identities が undefined の場合、空配列を返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_GET_PROVIDERS);
      if (!handler) throw new Error("Handler not registered");

      const userWithoutIdentities = { ...mockUser };
      delete (userWithoutIdentities as Record<string, unknown>).identities;

      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: userWithoutIdentities },
        error: null,
      });

      const result = (await handler({})) as IPCResponse<unknown[]>;

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("identities が非配列（オブジェクト）の場合、空配列を返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_GET_PROVIDERS);
      if (!handler) throw new Error("Handler not registered");

      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: { ...mockUser, identities: { broken: true } } },
        error: null,
      });

      const result = (await handler({})) as IPCResponse<unknown[]>;

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("identities が正常な配列の場合、プロバイダー一覧を返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_GET_PROVIDERS);
      if (!handler) throw new Error("Handler not registered");

      const result = (await handler({})) as IPCResponse<unknown[]>;

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe("PROFILE_UNLINK_PROVIDER - identities guard", () => {
    it("identities が null の場合、解除に失敗しエラーを返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_UNLINK_PROVIDER);
      if (!handler) throw new Error("Handler not registered");

      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: { ...mockUser, identities: null } },
        error: null,
      });

      const result = (await handler(
        {},
        { provider: "google" },
      )) as IPCResponse<void>;

      expect(result.success).toBe(false);
    });

    it("identities が undefined の場合、解除に失敗しエラーを返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_UNLINK_PROVIDER);
      if (!handler) throw new Error("Handler not registered");

      const userWithoutIdentities = { ...mockUser };
      delete (userWithoutIdentities as Record<string, unknown>).identities;

      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: userWithoutIdentities },
        error: null,
      });

      const result = (await handler(
        {},
        { provider: "google" },
      )) as IPCResponse<void>;

      expect(result.success).toBe(false);
    });
  });
});
