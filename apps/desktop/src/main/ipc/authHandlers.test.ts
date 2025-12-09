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
});
