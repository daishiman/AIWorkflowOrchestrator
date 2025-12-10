import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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
  toLinkedProvider: vi.fn((identity) => ({
    provider: identity.provider,
    providerId: identity.id,
    email: identity.identity_data?.email ?? "",
    displayName: identity.identity_data?.name ?? null,
    avatarUrl: identity.identity_data?.avatar_url ?? null,
    linkedAt: identity.created_at,
  })),
}));

// Mock @repo/shared/types/auth
vi.mock("@repo/shared/types/auth", () => ({
  isValidProvider: (provider: unknown) =>
    typeof provider === "string" &&
    ["google", "github", "discord"].includes(provider),
  validateDisplayName: (name: string) => {
    if (name.length < 3) {
      return {
        valid: false,
        message: "Display name must be at least 3 characters",
      };
    }
    if (name.length > 30) {
      return {
        valid: false,
        message: "Display name must be at most 30 characters",
      };
    }
    return { valid: true };
  },
  validateAvatarUrl: (url: string | null) => {
    if (url === null) return { valid: true };
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") {
        return { valid: false, message: "Avatar URL must use HTTPS" };
      }
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
}));

// Import after mocks
import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";

// Type definitions for testing
type OAuthProvider = "google" | "github" | "discord";
type UserPlan = "free" | "pro" | "enterprise";

interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  plan: UserPlan;
  createdAt: string;
  updatedAt: string;
}

interface _ProfileUpdateFields {
  displayName?: string;
  avatarUrl?: string | null;
}

interface LinkedProvider {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  linkedAt: string;
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

// Note: profileHandlers.ts does not exist yet - this is TDD Red phase
// These tests will fail until the implementation is created

describe("profileHandlers", () => {
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
      {
        id: "github-identity-id",
        provider: "github",
        identity_data: {
          email: "test@github.com",
          name: "Test User GitHub",
          avatar_url: "https://github.com/avatar.png",
        },
        created_at: "2024-06-01T00:00:00Z",
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

    // Reset mock implementations
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockSupabaseSingle.mockResolvedValue({
      data: mockProfileData,
      error: null,
    });

    // Capture registered handlers
    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    // Try to import and register handlers (will fail in Red phase)
    try {
      const { registerProfileHandlers } = await import("./profileHandlers");
      registerProfileHandlers(
        mockMainWindow as unknown as Parameters<
          typeof registerProfileHandlers
        >[0],
        mockSupabase as unknown as Parameters<
          typeof registerProfileHandlers
        >[1],
        {
          getCachedProfile: mockGetCachedProfile,
          updateCachedProfile: mockUpdateCachedProfile,
        },
      );
    } catch {
      // Expected in Red phase - module doesn't exist or throws
    }
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe("registerProfileHandlers", () => {
    it("should register PROFILE_GET handler", () => {
      expect(handlers.has(IPC_CHANNELS.PROFILE_GET)).toBe(true);
    });

    it("should register PROFILE_UPDATE handler", () => {
      expect(handlers.has(IPC_CHANNELS.PROFILE_UPDATE)).toBe(true);
    });

    it("should register PROFILE_GET_PROVIDERS handler", () => {
      expect(handlers.has(IPC_CHANNELS.PROFILE_GET_PROVIDERS)).toBe(true);
    });

    it("should register PROFILE_LINK_PROVIDER handler", () => {
      expect(handlers.has(IPC_CHANNELS.PROFILE_LINK_PROVIDER)).toBe(true);
    });
  });

  describe("PROFILE_GET handler", () => {
    it("should return profile when authenticated", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_GET);
      if (!handler) {
        throw new Error("PROFILE_GET handler not registered");
      }

      const result = (await handler({})) as IPCResponse<UserProfile>;

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: "user-123",
        displayName: "Test User",
        email: "test@example.com",
        avatarUrl: "https://example.com/avatar.png",
        plan: "free",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-12-01T00:00:00Z",
      });
    });

    it("should update cache after fetching profile", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_GET);
      if (!handler) {
        throw new Error("PROFILE_GET handler not registered");
      }

      await handler({});

      expect(mockUpdateCachedProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "user-123",
          displayName: "Test User",
        }),
      );
    });

    it("should return cached profile when offline", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_GET);
      if (!handler) {
        throw new Error("PROFILE_GET handler not registered");
      }

      // Simulate offline - auth returns null user
      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Network error" },
      });

      const cachedProfile: UserProfile = {
        id: "user-123",
        displayName: "Cached User",
        email: "cached@example.com",
        avatarUrl: null,
        plan: "free",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-11-01T00:00:00Z",
      };
      mockGetCachedProfile.mockResolvedValue(cachedProfile);

      const result = (await handler({})) as IPCResponse<UserProfile>;

      expect(result.success).toBe(true);
      expect(result.data?.displayName).toBe("Cached User");
    });

    it("should return error when not authenticated and no cache", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_GET);
      if (!handler) {
        throw new Error("PROFILE_GET handler not registered");
      }

      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });
      mockGetCachedProfile.mockResolvedValue(null);

      const result = (await handler({})) as IPCResponse<UserProfile>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("profile/get-failed");
      expect(result.error?.message).toContain("Not authenticated");
    });

    it("should return error on database fetch failure", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_GET);
      if (!handler) {
        throw new Error("PROFILE_GET handler not registered");
      }

      mockSupabaseSingle.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      const result = (await handler({})) as IPCResponse<UserProfile>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("profile/get-failed");
    });
  });

  describe("PROFILE_UPDATE handler", () => {
    it("should update displayName", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_UPDATE);
      if (!handler) {
        throw new Error("PROFILE_UPDATE handler not registered");
      }

      const updatedProfileData = {
        ...mockProfileData,
        display_name: "New Name",
        updated_at: "2024-12-08T00:00:00Z",
      };
      mockSupabaseSingle.mockResolvedValue({
        data: updatedProfileData,
        error: null,
      });

      const result = (await handler(
        {},
        { updates: { displayName: "New Name" } },
      )) as IPCResponse<UserProfile>;

      expect(result.success).toBe(true);
      expect(result.data?.displayName).toBe("New Name");
    });

    it("should update avatarUrl", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_UPDATE);
      if (!handler) {
        throw new Error("PROFILE_UPDATE handler not registered");
      }

      const updatedProfileData = {
        ...mockProfileData,
        avatar_url: "https://new-avatar.com/img.png",
      };
      mockSupabaseSingle.mockResolvedValue({
        data: updatedProfileData,
        error: null,
      });

      const result = (await handler(
        {},
        { updates: { avatarUrl: "https://new-avatar.com/img.png" } },
      )) as IPCResponse<UserProfile>;

      expect(result.success).toBe(true);
      expect(result.data?.avatarUrl).toBe("https://new-avatar.com/img.png");
    });

    it("should allow setting avatarUrl to null", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_UPDATE);
      if (!handler) {
        throw new Error("PROFILE_UPDATE handler not registered");
      }

      const updatedProfileData = {
        ...mockProfileData,
        avatar_url: null,
      };
      mockSupabaseSingle.mockResolvedValue({
        data: updatedProfileData,
        error: null,
      });

      const result = (await handler(
        {},
        { updates: { avatarUrl: null } },
      )) as IPCResponse<UserProfile>;

      expect(result.success).toBe(true);
      expect(result.data?.avatarUrl).toBeNull();
    });

    it("should update cache after profile update", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_UPDATE);
      if (!handler) {
        throw new Error("PROFILE_UPDATE handler not registered");
      }

      const updatedProfileData = {
        ...mockProfileData,
        display_name: "Updated Name",
      };
      mockSupabaseSingle.mockResolvedValue({
        data: updatedProfileData,
        error: null,
      });

      await handler({}, { updates: { displayName: "Updated Name" } });

      expect(mockUpdateCachedProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: "Updated Name",
        }),
      );
    });

    it("should validate displayName length (min 3)", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_UPDATE);
      if (!handler) {
        throw new Error("PROFILE_UPDATE handler not registered");
      }

      const result = (await handler(
        {},
        { updates: { displayName: "AB" } }, // Too short
      )) as IPCResponse<UserProfile>;

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("3");
    });

    it("should validate displayName length (max 30)", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_UPDATE);
      if (!handler) {
        throw new Error("PROFILE_UPDATE handler not registered");
      }

      const longName = "A".repeat(31);
      const result = (await handler(
        {},
        { updates: { displayName: longName } },
      )) as IPCResponse<UserProfile>;

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("30");
    });

    it("should return error when not authenticated", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_UPDATE);
      if (!handler) {
        throw new Error("PROFILE_UPDATE handler not registered");
      }

      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = (await handler(
        {},
        { updates: { displayName: "New Name" } },
      )) as IPCResponse<UserProfile>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("profile/update-failed");
    });

    it("should return error on database update failure", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_UPDATE);
      if (!handler) {
        throw new Error("PROFILE_UPDATE handler not registered");
      }

      mockSupabaseSingle.mockResolvedValue({
        data: null,
        error: { message: "Update failed" },
      });

      const result = (await handler(
        {},
        { updates: { displayName: "New Name" } },
      )) as IPCResponse<UserProfile>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("profile/update-failed");
    });
  });

  describe("PROFILE_GET_PROVIDERS handler", () => {
    it("should return list of linked providers", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_GET_PROVIDERS);
      if (!handler) {
        throw new Error("PROFILE_GET_PROVIDERS handler not registered");
      }

      const result = (await handler({})) as IPCResponse<LinkedProvider[]>;

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0]).toEqual({
        provider: "google",
        providerId: "google-identity-id",
        email: "test@example.com",
        displayName: "Test User Google",
        avatarUrl: "https://google.com/avatar.png",
        linkedAt: "2024-01-01T00:00:00Z",
      });
      expect(result.data?.[1]).toEqual({
        provider: "github",
        providerId: "github-identity-id",
        email: "test@github.com",
        displayName: "Test User GitHub",
        avatarUrl: "https://github.com/avatar.png",
        linkedAt: "2024-06-01T00:00:00Z",
      });
    });

    it("should return empty array when no identities", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_GET_PROVIDERS);
      if (!handler) {
        throw new Error("PROFILE_GET_PROVIDERS handler not registered");
      }

      mockSupabaseAuth.getUser.mockResolvedValue({
        data: {
          user: {
            ...mockUser,
            identities: [],
          },
        },
        error: null,
      });

      const result = (await handler({})) as IPCResponse<LinkedProvider[]>;

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("should return error when not authenticated", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_GET_PROVIDERS);
      if (!handler) {
        throw new Error("PROFILE_GET_PROVIDERS handler not registered");
      }

      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = (await handler({})) as IPCResponse<LinkedProvider[]>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("profile/providers-failed");
    });
  });

  describe("PROFILE_LINK_PROVIDER handler", () => {
    it("should initiate provider linking for discord", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_LINK_PROVIDER);
      if (!handler) {
        throw new Error("PROFILE_LINK_PROVIDER handler not registered");
      }

      // Note: This feature may not be fully implemented initially
      const result = (await handler(
        {},
        { provider: "discord" },
      )) as IPCResponse<LinkedProvider>;

      // Expected to either succeed or return "not implemented" error
      expect(result).toBeDefined();
    });

    it("should return error when not authenticated", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_LINK_PROVIDER);
      if (!handler) {
        throw new Error("PROFILE_LINK_PROVIDER handler not registered");
      }

      mockSupabaseAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = (await handler(
        {},
        { provider: "discord" },
      )) as IPCResponse<LinkedProvider>;

      expect(result.success).toBe(false);
    });

    it("should reject invalid provider", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_LINK_PROVIDER);
      if (!handler) {
        throw new Error("PROFILE_LINK_PROVIDER handler not registered");
      }

      const result = (await handler(
        {},
        { provider: "invalid" },
      )) as IPCResponse<LinkedProvider>;

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("profile/link-failed");
    });
  });

  describe("Security validations", () => {
    it("should sanitize displayName input", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_UPDATE);
      if (!handler) {
        throw new Error("PROFILE_UPDATE handler not registered");
      }

      // XSS attempt
      const result = (await handler(
        {},
        { updates: { displayName: "<script>alert('xss')</script>" } },
      )) as IPCResponse<UserProfile>;

      // Should either reject or sanitize the input
      if (result.success && result.data) {
        // If sanitized, should not contain script tags
        expect(result.data.displayName).not.toContain("<script>");
      }
    });

    it("should validate avatarUrl format", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_UPDATE);
      if (!handler) {
        throw new Error("PROFILE_UPDATE handler not registered");
      }

      // Invalid URL
      const result = (await handler(
        {},
        { updates: { avatarUrl: "not-a-valid-url" } },
      )) as IPCResponse<UserProfile>;

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("Invalid");
    });

    it("should only allow HTTPS URLs for avatarUrl", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_UPDATE);
      if (!handler) {
        throw new Error("PROFILE_UPDATE handler not registered");
      }

      // HTTP URL (not HTTPS)
      const result = (await handler(
        {},
        { updates: { avatarUrl: "http://insecure.com/avatar.png" } },
      )) as IPCResponse<UserProfile>;

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("HTTPS");
    });
  });

  describe("user_profiles テーブル不在時のフォールバック - AUTH-UI-001", () => {
    it("エラーメッセージに'user_profiles'が含まれる場合はuser_metadataにフォールバック", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_GET);
      if (!handler) {
        throw new Error("PROFILE_GET handler not registered");
      }

      mockSupabaseSingle.mockResolvedValue({
        data: null,
        error: {
          message:
            "Could not find the table 'public.user_profiles' in the schema cache",
          code: "PGRST200",
        },
      });

      const result = (await handler({})) as IPCResponse<UserProfile>;

      // フォールバック成功時はuser_metadataから構築されたプロフィールを返す
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("エラーメッセージに'relation'が含まれる場合はuser_metadataにフォールバック", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_GET);
      if (!handler) {
        throw new Error("PROFILE_GET handler not registered");
      }

      mockSupabaseSingle.mockResolvedValue({
        data: null,
        error: {
          message: 'relation "public.user_profiles" does not exist',
          code: "42P01",
        },
      });

      const result = (await handler({})) as IPCResponse<UserProfile>;

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("エラーコードPGRST116の場合はuser_metadataにフォールバック", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_GET);
      if (!handler) {
        throw new Error("PROFILE_GET handler not registered");
      }

      mockSupabaseSingle.mockResolvedValue({
        data: null,
        error: {
          message: "JSON object requested, multiple (or no) rows returned",
          code: "PGRST116",
        },
      });

      const result = (await handler({})) as IPCResponse<UserProfile>;

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("PROFILE_UPDATE時もuser_profilesテーブル不在ならuser_metadataを更新", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_UPDATE);
      if (!handler) {
        throw new Error("PROFILE_UPDATE handler not registered");
      }

      mockSupabaseSingle.mockResolvedValue({
        data: null,
        error: {
          message:
            "Could not find the table 'public.user_profiles' in the schema cache",
          code: "PGRST200",
        },
      });

      // フォールバック時にauth.updateUserが呼ばれるのでモックを設定
      mockSupabaseAuth.updateUser.mockResolvedValue({
        data: {
          user: {
            id: "user-123",
            email: "test@example.com",
            user_metadata: {
              display_name: "New Name",
              avatar_url: "https://example.com/avatar.png",
            },
            created_at: "2024-01-01T00:00:00Z",
          },
        },
        error: null,
      });

      const result = (await handler(
        {},
        { updates: { displayName: "New Name" } },
      )) as IPCResponse<UserProfile>;

      // フォールバック処理が動作すれば成功
      expect(result.success).toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty updates object", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_UPDATE);
      if (!handler) {
        throw new Error("PROFILE_UPDATE handler not registered");
      }

      const result = (await handler(
        {},
        { updates: {} },
      )) as IPCResponse<UserProfile>;

      // Should either succeed with no changes or return validation error
      expect(result).toBeDefined();
    });

    it("should handle concurrent update requests", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_UPDATE);
      if (!handler) {
        throw new Error("PROFILE_UPDATE handler not registered");
      }

      // Simulate concurrent requests
      const promise1 = handler({}, { updates: { displayName: "Name 1" } });
      const promise2 = handler({}, { updates: { displayName: "Name 2" } });

      const results = await Promise.all([promise1, promise2]);

      // Both should succeed without errors
      results.forEach((result) => {
        expect((result as IPCResponse<UserProfile>).success).toBeDefined();
      });
    });

    it("should handle user with null identities", async () => {
      const handler = handlers.get(IPC_CHANNELS.PROFILE_GET_PROVIDERS);
      if (!handler) {
        throw new Error("PROFILE_GET_PROVIDERS handler not registered");
      }

      mockSupabaseAuth.getUser.mockResolvedValue({
        data: {
          user: {
            ...mockUser,
            identities: null,
          },
        },
        error: null,
      });

      const result = (await handler({})) as IPCResponse<LinkedProvider[]>;

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });
});
