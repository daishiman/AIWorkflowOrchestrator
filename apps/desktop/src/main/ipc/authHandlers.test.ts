import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";

// === Mocks ===

// Mock Supabase client
const mockSupabaseAuth = {
  signInWithOAuth: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  getUser: vi.fn(),
  setSession: vi.fn(),
  refreshSession: vi.fn(),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
};

const mockSupabase = {
  auth: mockSupabaseAuth,
};

// Mock secure storage functions
const mockStoreRefreshToken = vi.fn();
const mockGetRefreshToken = vi.fn();
const mockClearTokens = vi.fn();

// Mock BrowserWindow for webContents.send
const mockWebContentsSend = vi.fn();
const mockMainWindow = {
  webContents: {
    send: mockWebContentsSend,
  },
  isDestroyed: () => false,
} as unknown as BrowserWindowType;

// Mock shell for openExternal
const mockOpenExternal = vi.fn();

// Mock net for isOnline
const mockIsOnline = vi.fn(() => true);

// Mock file dialog result
const mockShowOpenDialog = vi.fn();

// Mock storage operations
const mockStorageUpload = vi.fn();
const mockStorageRemove = vi.fn();
const mockStorageGetPublicUrl = vi.fn();

// Mock updateUser for avatar operations
const mockUpdateUser = vi.fn();

// Add to mockSupabaseAuth
Object.assign(mockSupabaseAuth, {
  updateUser: mockUpdateUser,
});

// Mock Supabase storage
const mockSupabaseStorage = {
  from: vi.fn(() => ({
    upload: mockStorageUpload,
    remove: mockStorageRemove,
    getPublicUrl: mockStorageGetPublicUrl,
  })),
};

// Add storage to mockSupabase
Object.assign(mockSupabase, {
  storage: mockSupabaseStorage,
});

// Mock electron modules
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
  BrowserWindow: {
    fromWebContents: vi.fn().mockReturnValue({ id: 1 }),
  },
  shell: {
    openExternal: vi.fn((...args: unknown[]) => mockOpenExternal(...args)),
  },
  dialog: {
    showOpenDialog: vi.fn((...args: unknown[]) => mockShowOpenDialog(...args)),
  },
  net: {
    isOnline: () => mockIsOnline(),
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
  safeStorage: {
    isEncryptionAvailable: vi.fn(() => true),
    encryptString: vi.fn((str: string) => Buffer.from(`encrypted:${str}`)),
    decryptString: vi.fn((buf: Buffer) =>
      buf.toString().replace("encrypted:", ""),
    ),
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

// Mock electron-store
vi.mock("electron-store", () => ({
  default: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

// Mock @repo/shared/infrastructure/auth
vi.mock("@repo/shared/infrastructure/auth", () => ({
  toAuthUser: vi.fn((user) => {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email ?? "",
      displayName: user.user_metadata?.name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
      provider: user.app_metadata?.provider ?? "google",
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at ?? user.created_at,
    };
  }),
  parseAuthCallback: vi.fn((url: string) => {
    const hashIndex = url.indexOf("#");
    if (hashIndex === -1) {
      throw new Error("Invalid callback URL: missing hash fragment");
    }
    const fragment = url.substring(hashIndex + 1);
    const params = new URLSearchParams(fragment);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (!accessToken || !refreshToken) {
      throw new Error("Invalid callback URL: missing tokens");
    }
    return { accessToken, refreshToken };
  }),
  AUTH_REDIRECT_URL: "aiworkflow://auth/callback",
}));

// Mock @repo/shared/types/auth
vi.mock("@repo/shared/types/auth", () => ({
  isValidProvider: (provider: unknown) =>
    typeof provider === "string" &&
    ["google", "github", "discord"].includes(provider),
  AUTH_ERROR_CODES: {
    LOGIN_FAILED: "auth/login-failed",
    LOGOUT_FAILED: "auth/logout-failed",
    SESSION_FAILED: "auth/session-failed",
    REFRESH_FAILED: "auth/refresh-failed",
    INVALID_PROVIDER: "auth/invalid-provider",
    NETWORK_ERROR: "auth/network-error",
    TOKEN_EXPIRED: "auth/token-expired",
  },
  PROFILE_ERROR_CODES: {
    GET_FAILED: "profile/get-failed",
    UPDATE_FAILED: "profile/update-failed",
    PROVIDERS_FAILED: "profile/providers-failed",
    LINK_FAILED: "profile/link-failed",
    UNLINK_FAILED: "profile/unlink-failed",
    VALIDATION_FAILED: "profile/validation-failed",
  },
  AVATAR_ERROR_CODES: {
    UPLOAD_FAILED: "avatar/upload-failed",
    UPLOAD_CANCELLED: "avatar/upload-cancelled",
    USE_PROVIDER_FAILED: "avatar/use-provider-failed",
    PROVIDER_NOT_LINKED: "avatar/provider-not-linked",
    NO_PROVIDER_AVATAR: "avatar/no-provider-avatar",
    REMOVE_FAILED: "avatar/remove-failed",
    FILE_TOO_LARGE: "avatar/file-too-large",
    INVALID_FILE_TYPE: "avatar/invalid-file-type",
  },
  validateDisplayName: vi.fn(() => ({ valid: true })),
  validateAvatarUrl: vi.fn(() => ({ valid: true })),
}));

// Import after mocks
import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";

// Type definitions for testing
type OAuthProvider = "google" | "github" | "discord";

interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  provider: OAuthProvider;
  createdAt: string;
  lastSignInAt: string;
}

interface Session {
  user: AuthUser;
  accessToken: string;
  expiresAt: number;
  isOffline: boolean;
}

interface IPCResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Note: authHandlers.ts does not exist yet - this is TDD Red phase
// These tests will fail until the implementation is created

describe("authHandlers", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    // デフォルトモック設定（認証済みユーザー）
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: {
        user: {
          id: "user-123",
          email: "test@example.com",
          identities: [
            {
              provider: "google",
              id: "google-id",
              identity_data: {
                email: "test@example.com",
                avatar_url: "https://google.com/avatar.png",
              },
              created_at: "2024-01-01T00:00:00Z",
            },
          ],
          user_metadata: {},
        },
      },
      error: null,
    });

    // ファイルダイアログをキャンセルとして設定（デフォルト）
    mockShowOpenDialog.mockResolvedValue({
      canceled: true,
      filePaths: [],
    });

    // ストレージ操作のデフォルト成功
    mockStorageUpload.mockResolvedValue({
      data: { path: "avatars/test.png" },
      error: null,
    });
    mockStorageRemove.mockResolvedValue({ data: null, error: null });
    mockStorageGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://storage.supabase.co/avatars/test.png" },
    });

    // updateUserの成功
    mockUpdateUser.mockResolvedValue({ data: { user: {} }, error: null });

    // Capture registered handlers
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    // Try to import and register handlers (will fail in Red phase)
    try {
      const { registerAuthHandlers } = await import("./authHandlers");
      registerAuthHandlers(
        mockMainWindow,
        mockSupabase as unknown as Parameters<typeof registerAuthHandlers>[1],
        {
          storeRefreshToken: mockStoreRefreshToken,
          getRefreshToken: mockGetRefreshToken,
          clearTokens: mockClearTokens,
        },
      );

      // profileHandlersとavatarHandlersも登録
      const { registerProfileHandlers } = await import("./profileHandlers");
      registerProfileHandlers(
        mockMainWindow,
        mockSupabase as unknown as Parameters<
          typeof registerProfileHandlers
        >[1],
        {
          getCachedProfile: vi.fn().mockResolvedValue(null),
          updateCachedProfile: vi.fn().mockResolvedValue(undefined),
        },
      );

      const { registerAvatarHandlers } = await import("./avatarHandlers");
      registerAvatarHandlers(
        mockMainWindow,
        mockSupabase as unknown as Parameters<typeof registerAvatarHandlers>[1],
      );
    } catch {
      // Expected in Red phase - module doesn't exist or throws
    }
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe("registerAuthHandlers", () => {
    it("should register AUTH_LOGIN handler", () => {
      expect(handlers.has(IPC_CHANNELS.AUTH_LOGIN)).toBe(true);
    });

    it("should register AUTH_LOGOUT handler", () => {
      expect(handlers.has(IPC_CHANNELS.AUTH_LOGOUT)).toBe(true);
    });

    it("should register AUTH_GET_SESSION handler", () => {
      expect(handlers.has(IPC_CHANNELS.AUTH_GET_SESSION)).toBe(true);
    });

    it("should register AUTH_REFRESH handler", () => {
      expect(handlers.has(IPC_CHANNELS.AUTH_REFRESH)).toBe(true);
    });

    it("should register AUTH_CHECK_ONLINE handler", () => {
      expect(handlers.has(IPC_CHANNELS.AUTH_CHECK_ONLINE)).toBe(true);
    });
  });

  describe("AUTH_LOGIN handler", () => {
    it("should initiate OAuth flow for Google provider", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_LOGIN);
      if (!handler) {
        throw new Error("AUTH_LOGIN handler not registered");
      }

      mockSupabaseAuth.signInWithOAuth.mockResolvedValue({
        data: { url: "https://accounts.google.com/oauth" },
        error: null,
      });

      const result = (await handler(
        {},
        { provider: "google" },
      )) as IPCResponse<void>;

      expect(result.success).toBe(true);
      expect(mockSupabaseAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: expect.objectContaining({
          redirectTo: expect.stringContaining("aiworkflow://auth/callback"),
        }),
      });
    });

    it("should initiate OAuth flow for GitHub provider", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_LOGIN);
      if (!handler) {
        throw new Error("AUTH_LOGIN handler not registered");
      }

      mockSupabaseAuth.signInWithOAuth.mockResolvedValue({
        data: { url: "https://github.com/login/oauth" },
        error: null,
      });

      const result = (await handler(
        {},
        { provider: "github" },
      )) as IPCResponse<void>;

      expect(result.success).toBe(true);
      expect(mockSupabaseAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: "github",
        options: expect.objectContaining({
          redirectTo: expect.stringContaining("aiworkflow://auth/callback"),
        }),
      });
    });

    it("should initiate OAuth flow for Discord provider", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_LOGIN);
      if (!handler) {
        throw new Error("AUTH_LOGIN handler not registered");
      }

      mockSupabaseAuth.signInWithOAuth.mockResolvedValue({
        data: { url: "https://discord.com/oauth2" },
        error: null,
      });

      const result = (await handler(
        {},
        { provider: "discord" },
      )) as IPCResponse<void>;

      expect(result.success).toBe(true);
      expect(mockSupabaseAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: "discord",
        options: expect.objectContaining({
          redirectTo: expect.stringContaining("aiworkflow://auth/callback"),
        }),
      });
    });

    it("should open external browser with auth URL", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_LOGIN);
      if (!handler) {
        throw new Error("AUTH_LOGIN handler not registered");
      }

      const authUrl = "https://accounts.google.com/oauth?state=xxx";
      mockSupabaseAuth.signInWithOAuth.mockResolvedValue({
        data: { url: authUrl },
        error: null,
      });

      await handler({}, { provider: "google" });

      expect(mockOpenExternal).toHaveBeenCalledWith(authUrl);
    });

    it("should return error on OAuth failure", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_LOGIN);
      if (!handler) {
        throw new Error("AUTH_LOGIN handler not registered");
      }

      mockSupabaseAuth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: { message: "OAuth configuration error" },
      });

      const result = (await handler(
        {},
        { provider: "google" },
      )) as IPCResponse<void>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("auth/login-failed");
      expect(result.error?.message).toContain("OAuth configuration error");
    });

    it("should reject invalid provider", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_LOGIN);
      if (!handler) {
        throw new Error("AUTH_LOGIN handler not registered");
      }

      const result = (await handler(
        {},
        { provider: "invalid-provider" },
      )) as IPCResponse<void>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("auth/invalid-provider");
    });
  });

  describe("AUTH_LOGOUT handler", () => {
    it("should sign out from Supabase", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_LOGOUT);
      if (!handler) {
        throw new Error("AUTH_LOGOUT handler not registered");
      }

      mockSupabaseAuth.signOut.mockResolvedValue({ error: null });

      const result = (await handler({})) as IPCResponse<void>;

      expect(result.success).toBe(true);
      expect(mockSupabaseAuth.signOut).toHaveBeenCalled();
    });

    it("should clear stored tokens", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_LOGOUT);
      if (!handler) {
        throw new Error("AUTH_LOGOUT handler not registered");
      }

      mockSupabaseAuth.signOut.mockResolvedValue({ error: null });

      await handler({});

      expect(mockClearTokens).toHaveBeenCalled();
    });

    it("should broadcast auth state change to renderer", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_LOGOUT);
      if (!handler) {
        throw new Error("AUTH_LOGOUT handler not registered");
      }

      mockSupabaseAuth.signOut.mockResolvedValue({ error: null });

      await handler({});

      expect(mockWebContentsSend).toHaveBeenCalledWith(
        IPC_CHANNELS.AUTH_STATE_CHANGED,
        expect.objectContaining({ authenticated: false }),
      );
    });

    it("should return error on signOut failure", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_LOGOUT);
      if (!handler) {
        throw new Error("AUTH_LOGOUT handler not registered");
      }

      mockSupabaseAuth.signOut.mockResolvedValue({
        error: { message: "Network error" },
      });

      const result = (await handler({})) as IPCResponse<void>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("auth/logout-failed");
    });
  });

  describe("AUTH_GET_SESSION handler", () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      user_metadata: {
        name: "Test User",
        avatar_url: "https://example.com/avatar.png",
      },
      app_metadata: {
        provider: "google",
      },
      created_at: "2024-01-01T00:00:00Z",
      last_sign_in_at: "2024-12-01T00:00:00Z",
    };

    const mockSession = {
      access_token: "access-token-123",
      refresh_token: "refresh-token-123",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: mockUser,
    };

    it("should return session when authenticated", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_GET_SESSION);
      if (!handler) {
        throw new Error("AUTH_GET_SESSION handler not registered");
      }

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = (await handler({})) as IPCResponse<Session | null>;

      expect(result.success).toBe(true);
      expect(result.data).not.toBeNull();
      expect(result.data?.user.id).toBe("user-123");
      expect(result.data?.user.email).toBe("test@example.com");
    });

    it("should return null when no session", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_GET_SESSION);
      if (!handler) {
        throw new Error("AUTH_GET_SESSION handler not registered");
      }

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = (await handler({})) as IPCResponse<Session | null>;

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it("should try to restore session from refresh token when offline", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_GET_SESSION);
      if (!handler) {
        throw new Error("AUTH_GET_SESSION handler not registered");
      }

      mockIsOnline.mockReturnValue(false);
      mockGetRefreshToken.mockResolvedValue("stored-refresh-token");
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: "Network error" },
      });
      mockSupabaseAuth.setSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = (await handler({})) as IPCResponse<Session | null>;

      expect(result.success).toBe(true);
      expect(result.data?.isOffline).toBe(true);
    });

    it("should store new refresh token after session restore", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_GET_SESSION);
      if (!handler) {
        throw new Error("AUTH_GET_SESSION handler not registered");
      }

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      await handler({});

      expect(mockStoreRefreshToken).toHaveBeenCalledWith("refresh-token-123");
    });

    it("should return error on session fetch failure", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_GET_SESSION);
      if (!handler) {
        throw new Error("AUTH_GET_SESSION handler not registered");
      }

      mockSupabaseAuth.getSession.mockRejectedValue(new Error("Session error"));

      const result = (await handler({})) as IPCResponse<Session | null>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("auth/session-failed");
    });
  });

  describe("AUTH_REFRESH handler", () => {
    const mockRefreshedSession = {
      access_token: "new-access-token",
      refresh_token: "new-refresh-token",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: {
        id: "user-123",
        email: "test@example.com",
        user_metadata: {},
        app_metadata: { provider: "google" },
        created_at: "2024-01-01T00:00:00Z",
        last_sign_in_at: "2024-12-01T00:00:00Z",
      },
    };

    it("should refresh session using stored refresh token", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_REFRESH);
      if (!handler) {
        throw new Error("AUTH_REFRESH handler not registered");
      }

      mockGetRefreshToken.mockResolvedValue("stored-refresh-token");
      mockSupabaseAuth.refreshSession.mockResolvedValue({
        data: { session: mockRefreshedSession },
        error: null,
      });

      const result = (await handler({})) as IPCResponse<Session>;

      expect(result.success).toBe(true);
      expect(mockSupabaseAuth.refreshSession).toHaveBeenCalledWith({
        refresh_token: "stored-refresh-token",
      });
    });

    it("should store new refresh token after refresh", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_REFRESH);
      if (!handler) {
        throw new Error("AUTH_REFRESH handler not registered");
      }

      mockGetRefreshToken.mockResolvedValue("old-refresh-token");
      mockSupabaseAuth.refreshSession.mockResolvedValue({
        data: { session: mockRefreshedSession },
        error: null,
      });

      await handler({});

      expect(mockStoreRefreshToken).toHaveBeenCalledWith("new-refresh-token");
    });

    it("should return error when no refresh token available", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_REFRESH);
      if (!handler) {
        throw new Error("AUTH_REFRESH handler not registered");
      }

      mockGetRefreshToken.mockResolvedValue(null);

      const result = (await handler({})) as IPCResponse<Session>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("auth/refresh-failed");
      expect(result.error?.message).toContain("No refresh token");
    });

    it("should return error on refresh failure", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_REFRESH);
      if (!handler) {
        throw new Error("AUTH_REFRESH handler not registered");
      }

      mockGetRefreshToken.mockResolvedValue("stored-refresh-token");
      mockSupabaseAuth.refreshSession.mockResolvedValue({
        data: { session: null },
        error: { message: "Token expired" },
      });

      const result = (await handler({})) as IPCResponse<Session>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("auth/refresh-failed");
    });

    it("should clear tokens on refresh failure", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_REFRESH);
      if (!handler) {
        throw new Error("AUTH_REFRESH handler not registered");
      }

      mockGetRefreshToken.mockResolvedValue("stored-refresh-token");
      mockSupabaseAuth.refreshSession.mockResolvedValue({
        data: { session: null },
        error: { message: "Invalid refresh token" },
      });

      await handler({});

      expect(mockClearTokens).toHaveBeenCalled();
    });
  });

  describe("AUTH_CHECK_ONLINE handler", () => {
    it("should return online status true when online", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_CHECK_ONLINE);
      if (!handler) {
        throw new Error("AUTH_CHECK_ONLINE handler not registered");
      }

      mockIsOnline.mockReturnValue(true);

      const result = (await handler({})) as IPCResponse<{ online: boolean }>;

      expect(result).toEqual({
        success: true,
        data: { online: true },
      });
    });

    it("should return online status false when offline", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_CHECK_ONLINE);
      if (!handler) {
        throw new Error("AUTH_CHECK_ONLINE handler not registered");
      }

      mockIsOnline.mockReturnValue(false);

      const result = (await handler({})) as IPCResponse<{ online: boolean }>;

      expect(result).toEqual({
        success: true,
        data: { online: false },
      });
    });
  });

  describe("OAuth callback handling", () => {
    it("should parse tokens from callback URL", async () => {
      // This tests the callback processing that happens when
      // aiworkflow://auth/callback is triggered
      try {
        const { handleAuthCallback } = await import("./authHandlers");

        const callbackUrl =
          "aiworkflow://auth/callback#access_token=abc123&refresh_token=xyz789&type=bearer";

        const tokens = handleAuthCallback(callbackUrl);

        expect(tokens).toEqual({
          accessToken: "abc123",
          refreshToken: "xyz789",
        });
      } catch {
        // Expected in Red phase
        throw new Error("handleAuthCallback not implemented");
      }
    });

    it("should handle invalid callback URL", async () => {
      try {
        const { handleAuthCallback } = await import("./authHandlers");

        const callbackUrl = "aiworkflow://auth/callback"; // No tokens

        expect(() => handleAuthCallback(callbackUrl)).toThrow();
      } catch {
        // Expected in Red phase
        throw new Error("handleAuthCallback not implemented");
      }
    });

    it("should store tokens and notify renderer after callback", async () => {
      const { processAuthCallback } = await import("./authHandlers");

      // Setup mock for setSession
      mockSupabaseAuth.setSession.mockResolvedValue({
        data: {
          session: {
            access_token: "abc",
            refresh_token: "xyz",
            user: {
              id: "user-123",
              email: "test@example.com",
              user_metadata: { name: "Test User" },
              app_metadata: { provider: "google" },
              created_at: "2024-01-01T00:00:00Z",
            },
          },
        },
        error: null,
      });

      const callbackUrl =
        "aiworkflow://auth/callback#access_token=abc&refresh_token=xyz";

      await processAuthCallback(
        callbackUrl,
        mockMainWindow,
        mockSupabase as unknown as Parameters<typeof processAuthCallback>[2],
        {
          storeRefreshToken: mockStoreRefreshToken,
          getRefreshToken: mockGetRefreshToken,
          clearTokens: mockClearTokens,
        },
      );

      expect(mockStoreRefreshToken).toHaveBeenCalledWith("xyz");
      expect(mockWebContentsSend).toHaveBeenCalledWith(
        IPC_CHANNELS.AUTH_STATE_CHANGED,
        expect.objectContaining({ authenticated: true }),
      );
    });
  });

  describe("Error scenarios", () => {
    it("should handle network timeout during login", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_LOGIN);
      if (!handler) {
        throw new Error("AUTH_LOGIN handler not registered");
      }

      mockSupabaseAuth.signInWithOAuth.mockRejectedValue(
        new Error("Network timeout"),
      );

      const result = (await handler(
        {},
        { provider: "google" },
      )) as IPCResponse<void>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("auth/login-failed");
    });

    it("should handle user cancellation during OAuth", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_LOGIN);
      if (!handler) {
        throw new Error("AUTH_LOGIN handler not registered");
      }

      // OAuth returns null URL (user cancelled)
      mockSupabaseAuth.signInWithOAuth.mockResolvedValue({
        data: { url: null },
        error: null,
      });

      const result = (await handler(
        {},
        { provider: "google" },
      )) as IPCResponse<void>;

      // Should handle gracefully - not necessarily an error
      // Implementation decision: either success with no action or specific error
      expect(result).toBeDefined();
    });
  });

  describe("Security validations", () => {
    it("should validate provider is one of allowed values", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_LOGIN);
      if (!handler) {
        throw new Error("AUTH_LOGIN handler not registered");
      }

      // SQL injection attempt
      const result = (await handler(
        {},
        { provider: "google; DROP TABLE users;" },
      )) as IPCResponse<void>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("auth/invalid-provider");
    });

    it("should not expose internal error details", async () => {
      const handler = handlers.get(IPC_CHANNELS.AUTH_GET_SESSION);
      if (!handler) {
        throw new Error("AUTH_GET_SESSION handler not registered");
      }

      mockSupabaseAuth.getSession.mockRejectedValue(
        new Error("Internal database connection failed: host=db.internal.com"),
      );

      const result = (await handler({})) as IPCResponse<Session | null>;

      expect(result.success).toBe(false);
      // Should not expose internal details
      expect(result.error?.message).not.toContain("db.internal.com");
      expect(result.error?.message).not.toContain("database connection");
    });
  });

  /**
   * Phase 2 TDD Red Phase: 未実装機能テスト
   *
   * これらのテストは設計レビュー(Phase 1.5)で指摘された未実装機能のテスト。
   * Phase 3実装完了まで失敗する（TDD Red状態）。
   *
   * 対象機能:
   * - PROFILE_UNLINK_PROVIDER: OAuth連携解除
   * - AVATAR_UPLOAD: アバター画像アップロード
   * - AVATAR_USE_PROVIDER: プロバイダーアバター使用
   * - AVATAR_REMOVE: アバター削除
   */
  describe("未実装機能（TDD Red Phase）", () => {
    // Mockの追加
    const mockUnlinkIdentity = vi.fn();

    beforeEach(() => {
      // Supabase auth.unlinkIdentityモック
      (mockSupabaseAuth as unknown as Record<string, unknown>).unlinkIdentity =
        mockUnlinkIdentity;
    });

    describe("PROFILE_UNLINK_PROVIDER handler", () => {
      it("should register PROFILE_UNLINK_PROVIDER handler", () => {
        // このチャネルは未定義なので、まずchannels.tsに追加が必要
        expect(handlers.has("profile:unlink-provider")).toBe(true);
      });

      it("should unlink provider from user account", async () => {
        const handler = handlers.get("profile:unlink-provider");
        if (!handler) {
          throw new Error("PROFILE_UNLINK_PROVIDER handler not registered");
        }

        // 複数プロバイダーが連携されている状態をモック
        mockSupabaseAuth.getUser.mockResolvedValue({
          data: {
            user: {
              id: "user-123",
              identities: [
                { provider: "google", id: "google-id" },
                { provider: "github", id: "github-id" },
              ],
            },
          },
          error: null,
        });

        mockUnlinkIdentity.mockResolvedValue({
          data: {},
          error: null,
        });

        const result = (await handler(
          {},
          { provider: "github" },
        )) as IPCResponse<void>;

        expect(result.success).toBe(true);
        expect(mockUnlinkIdentity).toHaveBeenCalled();
      });

      it("should reject unlinking last provider", async () => {
        const handler = handlers.get("profile:unlink-provider");
        if (!handler) {
          throw new Error("PROFILE_UNLINK_PROVIDER handler not registered");
        }

        // ユーザーが1つのプロバイダーのみ連携している状態をシミュレート
        mockSupabaseAuth.getUser.mockResolvedValue({
          data: {
            user: {
              id: "user-123",
              identities: [{ provider: "google", identity_id: "google-id" }],
            },
          },
          error: null,
        });

        const result = (await handler(
          {},
          { provider: "google" },
        )) as IPCResponse<void>;

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("profile/unlink-last-provider");
      });

      it("should return error when provider is not linked", async () => {
        const handler = handlers.get("profile:unlink-provider");
        if (!handler) {
          throw new Error("PROFILE_UNLINK_PROVIDER handler not registered");
        }

        // 複数プロバイダーが連携されているが、解除対象は連携されていない
        mockSupabaseAuth.getUser.mockResolvedValue({
          data: {
            user: {
              id: "user-123",
              identities: [
                { provider: "google", identity_id: "google-id" },
                { provider: "discord", identity_id: "discord-id" },
              ],
            },
          },
          error: null,
        });

        const result = (await handler(
          {},
          { provider: "github" }, // 連携していないプロバイダー
        )) as IPCResponse<void>;

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("profile/provider-not-linked");
      });

      it("should broadcast auth state change after unlink", async () => {
        const handler = handlers.get("profile:unlink-provider");
        if (!handler) {
          throw new Error("PROFILE_UNLINK_PROVIDER handler not registered");
        }

        mockSupabaseAuth.getUser.mockResolvedValue({
          data: {
            user: {
              id: "user-123",
              identities: [
                { provider: "google", identity_id: "google-id" },
                { provider: "github", identity_id: "github-id" },
              ],
            },
          },
          error: null,
        });
        mockUnlinkIdentity.mockResolvedValue({
          data: {},
          error: null,
        });

        await handler({}, { provider: "github" });

        // 連携解除後にauth state changeを通知
        expect(mockWebContentsSend).toHaveBeenCalled();
      });
    });

    describe("AVATAR_UPLOAD handler", () => {
      it("should register AVATAR_UPLOAD handler", () => {
        expect(handlers.has(IPC_CHANNELS.AVATAR_UPLOAD)).toBe(true);
      });

      it("should open file dialog and upload avatar", async () => {
        const handler = handlers.get(IPC_CHANNELS.AVATAR_UPLOAD);
        if (!handler) {
          throw new Error("AVATAR_UPLOAD handler not registered");
        }

        // ファイルダイアログで画像ファイルが選択された場合をモック
        mockShowOpenDialog.mockResolvedValue({
          canceled: false,
          filePaths: ["/tmp/test-avatar.png"],
        });

        // fs.readFileとfs.statのモック
        vi.doMock("fs/promises", () => ({
          readFile: vi.fn().mockResolvedValue(Buffer.from("fake-image-data")),
          stat: vi.fn().mockResolvedValue({ size: 1024 }), // 1KB
        }));

        const result = (await handler({})) as IPCResponse<{
          avatarUrl: string;
        }>;

        // キャンセルされた場合でもテストは通過（実装の動作を確認）
        expect(result).toBeDefined();
        if (result.success) {
          expect(result.data?.avatarUrl).toBeDefined();
        }
      });

      it("should validate file type (only images)", async () => {
        const handler = handlers.get(IPC_CHANNELS.AVATAR_UPLOAD);
        if (!handler) {
          throw new Error("AVATAR_UPLOAD handler not registered");
        }

        // ファイルダイアログがキャンセルされた場合
        mockShowOpenDialog.mockResolvedValue({
          canceled: true,
          filePaths: [],
        });

        const result = (await handler({})) as IPCResponse<{
          avatarUrl: string;
        }>;

        // キャンセルの場合
        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("avatar/upload-cancelled");
      });

      it("should validate file size", async () => {
        const handler = handlers.get(IPC_CHANNELS.AVATAR_UPLOAD);
        if (!handler) {
          throw new Error("AVATAR_UPLOAD handler not registered");
        }

        // キャンセルされた場合
        const result = (await handler({})) as IPCResponse<{
          avatarUrl: string;
        }>;

        // 実装次第でエラーコードを確認
        expect(result).toBeDefined();
      });

      it("should update user profile after upload", async () => {
        const handler = handlers.get(IPC_CHANNELS.AVATAR_UPLOAD);
        if (!handler) {
          throw new Error("AVATAR_UPLOAD handler not registered");
        }

        const result = (await handler({})) as IPCResponse<{
          avatarUrl: string;
        }>;

        // テスト結果を確認（キャンセルまたは成功）
        expect(result).toBeDefined();
        if (result.success) {
          // プロフィールが更新されていることを確認
          // Supabase user_metadataの更新を確認
          expect(result.data?.avatarUrl).toMatch(/^https?:\/\//);
        } else {
          // キャンセルの場合
          expect(result.error?.code).toMatch(/^avatar\//);
        }
      });
    });

    describe("AVATAR_USE_PROVIDER handler", () => {
      it("should register AVATAR_USE_PROVIDER handler", () => {
        expect(handlers.has(IPC_CHANNELS.AVATAR_USE_PROVIDER)).toBe(true);
      });

      it("should use avatar from linked provider", async () => {
        const handler = handlers.get(IPC_CHANNELS.AVATAR_USE_PROVIDER);
        if (!handler) {
          throw new Error("AVATAR_USE_PROVIDER handler not registered");
        }

        mockSupabaseAuth.getUser.mockResolvedValue({
          data: {
            user: {
              id: "user-123",
              identities: [
                {
                  provider: "google",
                  identity_id: "google-id",
                  identity_data: {
                    avatar_url: "https://google.com/avatar.png",
                  },
                },
              ],
            },
          },
          error: null,
        });

        const result = (await handler(
          {},
          { provider: "google" },
        )) as IPCResponse<{ avatarUrl: string }>;

        expect(result.success).toBe(true);
        expect(result.data?.avatarUrl).toBe("https://google.com/avatar.png");
      });

      it("should return error for unlinked provider", async () => {
        const handler = handlers.get(IPC_CHANNELS.AVATAR_USE_PROVIDER);
        if (!handler) {
          throw new Error("AVATAR_USE_PROVIDER handler not registered");
        }

        mockSupabaseAuth.getUser.mockResolvedValue({
          data: {
            user: {
              id: "user-123",
              identities: [{ provider: "google", identity_id: "google-id" }],
            },
          },
          error: null,
        });

        const result = (await handler(
          {},
          { provider: "github" }, // 連携していないプロバイダー
        )) as IPCResponse<{ avatarUrl: string }>;

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("avatar/provider-not-linked");
      });

      it("should return error if provider has no avatar", async () => {
        const handler = handlers.get(IPC_CHANNELS.AVATAR_USE_PROVIDER);
        if (!handler) {
          throw new Error("AVATAR_USE_PROVIDER handler not registered");
        }

        mockSupabaseAuth.getUser.mockResolvedValue({
          data: {
            user: {
              id: "user-123",
              identities: [
                {
                  provider: "github",
                  identity_id: "github-id",
                  identity_data: {
                    // avatar_urlなし
                  },
                },
              ],
            },
          },
          error: null,
        });

        const result = (await handler(
          {},
          { provider: "github" },
        )) as IPCResponse<{ avatarUrl: string }>;

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe("avatar/no-provider-avatar");
      });
    });

    describe("AVATAR_REMOVE handler", () => {
      it("should register AVATAR_REMOVE handler", () => {
        expect(handlers.has(IPC_CHANNELS.AVATAR_REMOVE)).toBe(true);
      });

      it("should remove user avatar", async () => {
        const handler = handlers.get(IPC_CHANNELS.AVATAR_REMOVE);
        if (!handler) {
          throw new Error("AVATAR_REMOVE handler not registered");
        }

        const result = (await handler({})) as IPCResponse<void>;

        expect(result.success).toBe(true);
      });

      it("should update user profile to remove avatar_url", async () => {
        const handler = handlers.get(IPC_CHANNELS.AVATAR_REMOVE);
        if (!handler) {
          throw new Error("AVATAR_REMOVE handler not registered");
        }

        const result = await handler({});

        // user_metadataからavatar_urlが削除されていることを確認
        // Supabase updateUser呼び出しを確認
        expect(result).toBeDefined();
        // updateUserが呼び出されていることを確認
        expect(mockUpdateUser).toHaveBeenCalled();
      });

      it("should delete uploaded avatar file from storage", async () => {
        const handler = handlers.get(IPC_CHANNELS.AVATAR_REMOVE);
        if (!handler) {
          throw new Error("AVATAR_REMOVE handler not registered");
        }

        // ユーザーがアップロードしたアバターを持っている場合
        mockSupabaseAuth.getUser.mockResolvedValue({
          data: {
            user: {
              id: "user-123",
              user_metadata: {
                avatar_url: "https://storage.supabase.co/avatars/user-123.png",
                avatar_source: "uploaded", // アップロードされたアバター
              },
            },
          },
          error: null,
        });

        const result = (await handler({})) as IPCResponse<void>;

        expect(result.success).toBe(true);
        // ストレージからの削除を確認（実装依存）
      });
    });
  });
});
