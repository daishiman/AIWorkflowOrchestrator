import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createAuthSlice, type AuthSlice } from "./authSlice";

// Mock window.electronAPI
const mockAuthLogin = vi.fn();
const mockAuthLogout = vi.fn();
const mockAuthGetSession = vi.fn();
const mockAuthRefresh = vi.fn();
const mockAuthCheckOnline = vi.fn();
const mockAuthOnAuthStateChanged = vi.fn();
const mockProfileGet = vi.fn();
const mockProfileUpdate = vi.fn();
const mockProfileGetProviders = vi.fn();
const mockProfileLinkProvider = vi.fn();

const mockElectronAPI = {
  auth: {
    login: mockAuthLogin,
    logout: mockAuthLogout,
    getSession: mockAuthGetSession,
    refresh: mockAuthRefresh,
    checkOnline: mockAuthCheckOnline,
    onAuthStateChanged: mockAuthOnAuthStateChanged,
  },
  profile: {
    get: mockProfileGet,
    update: mockProfileUpdate,
    getProviders: mockProfileGetProviders,
    linkProvider: mockProfileLinkProvider,
  },
};

// Mock user and session data
const mockAuthUser = {
  id: "user-123",
  email: "test@example.com",
  displayName: "Test User",
  avatarUrl: "https://example.com/avatar.png",
  provider: "google" as const,
  createdAt: "2024-01-01T00:00:00Z",
  lastSignInAt: "2024-12-01T00:00:00Z",
};

const mockSession = {
  user: mockAuthUser,
  accessToken: "access-token",
  refreshToken: "refresh-token",
  expiresAt: Date.now() / 1000 + 3600,
  isOffline: false,
};

const mockUserProfile = {
  id: "user-123",
  displayName: "Test User",
  email: "test@example.com",
  avatarUrl: "https://example.com/avatar.png",
  plan: "free" as const,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-12-01T00:00:00Z",
};

const mockLinkedProviders = [
  {
    provider: "google" as const,
    providerId: "google-id",
    email: "test@example.com",
    displayName: "Test User",
    avatarUrl: "https://google.com/avatar.png",
    linkedAt: "2024-01-01T00:00:00Z",
  },
];

describe("authSlice", () => {
  let store: AuthSlice;
  let mockSet: ReturnType<typeof vi.fn>;
  let mockGet: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup window.electronAPI mock
    Object.defineProperty(window, "electronAPI", {
      value: mockElectronAPI,
      writable: true,
    });

    // Setup default mock responses
    mockAuthCheckOnline.mockResolvedValue({
      success: true,
      data: { online: true },
    });

    mockAuthGetSession.mockResolvedValue({
      success: true,
      data: mockSession,
    });

    mockProfileGet.mockResolvedValue({
      success: true,
      data: mockUserProfile,
    });

    mockProfileGetProviders.mockResolvedValue({
      success: true,
      data: mockLinkedProviders,
    });

    // Create store
    mockSet = vi.fn((updater) => {
      if (typeof updater === "function") {
        const updates = updater(store);
        Object.assign(store, updates);
      } else {
        Object.assign(store, updater);
      }
    });

    mockGet = vi.fn(() => store);

    store = createAuthSlice(
      mockSet as unknown as Parameters<typeof createAuthSlice>[0],
      mockGet as unknown as Parameters<typeof createAuthSlice>[1],
      {} as Parameters<typeof createAuthSlice>[2],
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      expect(store.isAuthenticated).toBe(false);
      expect(store.isLoading).toBe(true);
      expect(store.authUser).toBeNull();
      expect(store.sessionExpiresAt).toBeNull(); // session -> sessionExpiresAt (状態最小化)
      expect(store.profile).toBeNull();
      expect(store.linkedProviders).toEqual([]);
      expect(store.isOffline).toBe(false);
      expect(store.authError).toBeNull();
    });
  });

  describe("login", () => {
    it("should call auth.login with provider", async () => {
      mockAuthLogin.mockResolvedValue({ success: true });

      await store.login("google");

      expect(mockAuthLogin).toHaveBeenCalledWith({ provider: "google" });
    });

    it("should set loading state during login", async () => {
      mockAuthLogin.mockResolvedValue({ success: true });

      const loginPromise = store.login("google");

      expect(mockSet).toHaveBeenCalledWith({
        isLoading: true,
        authError: null,
      });

      await loginPromise;
    });

    it("should handle login error", async () => {
      mockAuthLogin.mockResolvedValue({
        success: false,
        error: { code: "auth/login-failed", message: "ログインに失敗しました" },
      });

      await store.login("google");

      expect(mockSet).toHaveBeenCalledWith({
        isLoading: false,
        authError: "ログインに失敗しました",
      });
    });

    it("should handle missing electronAPI", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: undefined,
        writable: true,
      });

      await store.login("google");

      expect(mockAuthLogin).not.toHaveBeenCalled();
      expect(store.isLoading).toBe(false);
    });
  });

  describe("logout", () => {
    it("should call auth.logout", async () => {
      mockAuthLogout.mockResolvedValue({ success: true });

      await store.logout();

      expect(mockAuthLogout).toHaveBeenCalled();
    });

    it("should clear auth state after logout", async () => {
      mockAuthLogout.mockResolvedValue({ success: true });

      // Set authenticated state first
      store.isAuthenticated = true;
      store.authUser = mockAuthUser;

      await store.logout();

      expect(store.isAuthenticated).toBe(false);
      expect(store.authUser).toBeNull();
    });
  });

  describe("initializeAuth", () => {
    it("should check online status", async () => {
      await store.initializeAuth();

      expect(mockAuthCheckOnline).toHaveBeenCalled();
    });

    it("should get session", async () => {
      await store.initializeAuth();

      expect(mockAuthGetSession).toHaveBeenCalled();
    });

    it("should set authenticated state when session exists", async () => {
      await store.initializeAuth();

      expect(store.isAuthenticated).toBe(true);
      expect(store.authUser).toEqual(mockAuthUser);
      // 状態最小化: session -> sessionExpiresAt (トークンは保存しない)
      expect(store.sessionExpiresAt).toBe(mockSession.expiresAt);
    });

    it("should fetch profile after successful auth", async () => {
      await store.initializeAuth();

      expect(mockProfileGet).toHaveBeenCalled();
    });

    it("should fetch linked providers after successful auth", async () => {
      await store.initializeAuth();

      expect(mockProfileGetProviders).toHaveBeenCalled();
    });

    it("should handle no session", async () => {
      mockAuthGetSession.mockResolvedValue({
        success: true,
        data: null,
      });

      await store.initializeAuth();

      expect(store.isAuthenticated).toBe(false);
      expect(store.authUser).toBeNull();
    });

    it("should set offline state when offline", async () => {
      mockAuthCheckOnline.mockResolvedValue({
        success: true,
        data: { online: false },
      });

      await store.initializeAuth();

      // isOffline is set via mockSet, which we verify was called correctly
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({ isOffline: true }),
      );
    });

    it("should subscribe to auth state changes", async () => {
      await store.initializeAuth();

      expect(mockAuthOnAuthStateChanged).toHaveBeenCalled();
    });
  });

  describe("refreshSession", () => {
    it("should call auth.refresh", async () => {
      mockAuthRefresh.mockResolvedValue({
        success: true,
        data: mockSession,
      });

      await store.refreshSession();

      expect(mockAuthRefresh).toHaveBeenCalled();
    });

    it("should update session after refresh", async () => {
      const newExpiresAt = Date.now() / 1000 + 7200;
      const newSession = {
        ...mockSession,
        expiresAt: newExpiresAt,
      };
      mockAuthRefresh.mockResolvedValue({
        success: true,
        data: newSession,
      });

      await store.refreshSession();

      // 状態最小化: session -> sessionExpiresAt (トークンは保存しない)
      expect(store.sessionExpiresAt).toBe(newExpiresAt);
    });

    it("should clear auth on refresh failure", async () => {
      mockAuthRefresh.mockResolvedValue({
        success: false,
        error: { code: "auth/refresh-failed", message: "Refresh failed" },
      });

      store.isAuthenticated = true;
      store.authUser = mockAuthUser;

      await store.refreshSession();

      expect(store.isAuthenticated).toBe(false);
      expect(store.authUser).toBeNull();
    });
  });

  describe("fetchProfile", () => {
    it("should call profile.get", async () => {
      await store.fetchProfile();

      expect(mockProfileGet).toHaveBeenCalled();
    });

    it("should set profile on success", async () => {
      await store.fetchProfile();

      expect(store.profile).toEqual(mockUserProfile);
    });
  });

  describe("updateProfile", () => {
    it("should call profile.update with updates", async () => {
      mockProfileUpdate.mockResolvedValue({
        success: true,
        data: { ...mockUserProfile, displayName: "New Name" },
      });

      await store.updateProfile({ displayName: "New Name" });

      expect(mockProfileUpdate).toHaveBeenCalledWith({
        updates: { displayName: "New Name" },
      });
    });

    it("should update profile state on success", async () => {
      const updatedProfile = { ...mockUserProfile, displayName: "New Name" };
      mockProfileUpdate.mockResolvedValue({
        success: true,
        data: updatedProfile,
      });

      await store.updateProfile({ displayName: "New Name" });

      expect(store.profile).toEqual(updatedProfile);
    });

    it("should set error on update failure", async () => {
      mockProfileUpdate.mockResolvedValue({
        success: false,
        error: { code: "profile/update-failed", message: "更新に失敗しました" },
      });

      await store.updateProfile({ displayName: "New Name" });

      expect(store.authError).toBe("更新に失敗しました");
    });
  });

  describe("fetchLinkedProviders", () => {
    it("should call profile.getProviders", async () => {
      await store.fetchLinkedProviders();

      expect(mockProfileGetProviders).toHaveBeenCalled();
    });

    it("should set linkedProviders on success", async () => {
      await store.fetchLinkedProviders();

      expect(store.linkedProviders).toEqual(mockLinkedProviders);
    });
  });

  describe("linkProvider", () => {
    it("should call profile.linkProvider", async () => {
      mockProfileLinkProvider.mockResolvedValue({
        success: true,
        data: {
          provider: "github",
          providerId: "github-id",
          email: "test@github.com",
          displayName: "Test GitHub",
          avatarUrl: null,
          linkedAt: "2024-12-01T00:00:00Z",
        },
      });

      await store.linkProvider("github");

      expect(mockProfileLinkProvider).toHaveBeenCalledWith({
        provider: "github",
      });
    });

    it("should add new provider to linkedProviders", async () => {
      const newProvider = {
        provider: "github" as const,
        providerId: "github-id",
        email: "test@github.com",
        displayName: "Test GitHub",
        avatarUrl: null,
        linkedAt: "2024-12-01T00:00:00Z",
      };
      mockProfileLinkProvider.mockResolvedValue({
        success: true,
        data: newProvider,
      });

      store.linkedProviders = mockLinkedProviders;

      await store.linkProvider("github");

      expect(store.linkedProviders).toContainEqual(newProvider);
    });
  });

  describe("setAuthError", () => {
    it("should set error message", () => {
      store.setAuthError("Test error");

      expect(store.authError).toBe("Test error");
    });

    it("should clear error when null", () => {
      store.authError = "Previous error";

      store.setAuthError(null);

      expect(store.authError).toBeNull();
    });
  });

  describe("clearAuth", () => {
    it("should reset all auth state", () => {
      // Set authenticated state
      store.isAuthenticated = true;
      store.authUser = mockAuthUser;
      store.sessionExpiresAt = mockSession.expiresAt; // session -> sessionExpiresAt (状態最小化)
      store.profile = mockUserProfile;
      store.linkedProviders = mockLinkedProviders;

      store.clearAuth();

      expect(store.isAuthenticated).toBe(false);
      expect(store.isLoading).toBe(false);
      expect(store.authUser).toBeNull();
      expect(store.sessionExpiresAt).toBeNull(); // session -> sessionExpiresAt (状態最小化)
      expect(store.profile).toBeNull();
      expect(store.linkedProviders).toEqual([]);
      expect(store.authError).toBeNull();
    });
  });

  describe("login - edge cases", () => {
    it("should handle login exception", async () => {
      mockAuthLogin.mockRejectedValue(new Error("Network error"));

      await store.login("google");

      // handleAuthError converts "Network error" to Japanese message
      expect(store.authError).toBe("ネットワーク接続を確認してください");
      expect(store.isLoading).toBe(false);
    });

    it("should handle login failure without error message", async () => {
      mockAuthLogin.mockResolvedValue({
        success: false,
        error: { code: "unknown" },
      });

      await store.login("github");

      expect(store.authError).toBe("ログインに失敗しました");
    });
  });

  describe("logout - edge cases", () => {
    it("should handle missing electronAPI", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: undefined,
        writable: true,
      });

      store.isAuthenticated = true;
      store.authUser = mockAuthUser;

      await store.logout();

      expect(store.isAuthenticated).toBe(false);
      expect(store.authUser).toBeNull();
    });

    it("should handle logout failure", async () => {
      mockAuthLogout.mockResolvedValue({
        success: false,
        error: { code: "auth/logout-failed", message: "Logout failed" },
      });

      store.isAuthenticated = true;

      await store.logout();

      // Should still clear auth even on failure
      expect(store.isAuthenticated).toBe(false);
    });

    it("should handle logout exception", async () => {
      mockAuthLogout.mockRejectedValue(new Error("Network error"));

      store.isAuthenticated = true;

      await store.logout();

      // Should still clear auth on exception
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe("initializeAuth - edge cases", () => {
    it("should handle missing electronAPI", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: undefined,
        writable: true,
      });

      await store.initializeAuth();

      expect(store.isLoading).toBe(false);
    });

    it("should handle checkOnline exception", async () => {
      mockAuthCheckOnline.mockRejectedValue(new Error("Network error"));

      await store.initializeAuth();

      // Should continue without online check
      expect(mockAuthGetSession).toHaveBeenCalled();
    });

    it("should handle getSession exception", async () => {
      mockAuthGetSession.mockRejectedValue(new Error("IPC not implemented"));

      await store.initializeAuth();

      expect(store.isAuthenticated).toBe(false);
      expect(store.isLoading).toBe(false);
    });

    it("should handle initializeAuth general exception", async () => {
      mockAuthCheckOnline.mockResolvedValue({
        success: true,
        data: { online: true },
      });
      mockAuthGetSession.mockResolvedValue({
        success: true,
        data: mockSession,
      });
      // Simulate error by making onAuthStateChanged throw
      mockAuthOnAuthStateChanged.mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      await store.initializeAuth();

      // handleAuthError converts unknown errors to Japanese message
      expect(store.authError).toBe("予期しないエラーが発生しました");
    });

    it("should handle session response without data", async () => {
      mockAuthGetSession.mockResolvedValue({
        success: false,
      });

      await store.initializeAuth();

      expect(store.isAuthenticated).toBe(false);
      expect(store.isLoading).toBe(false);
    });

    it("should use session isOffline value", async () => {
      mockAuthGetSession.mockResolvedValue({
        success: true,
        data: { ...mockSession, isOffline: true },
      });

      await store.initializeAuth();

      expect(store.isOffline).toBe(true);
    });
  });

  describe("refreshSession - edge cases", () => {
    it("should handle missing electronAPI", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: undefined,
        writable: true,
      });

      await store.refreshSession();

      expect(mockAuthRefresh).not.toHaveBeenCalled();
    });

    it("should handle refresh exception", async () => {
      mockAuthRefresh.mockRejectedValue(new Error("Network error"));

      await store.refreshSession();

      // Should not throw
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe("fetchProfile - edge cases", () => {
    it("should handle missing electronAPI", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: undefined,
        writable: true,
      });

      await store.fetchProfile();

      expect(mockProfileGet).not.toHaveBeenCalled();
    });

    it("should handle profile fetch failure", async () => {
      mockProfileGet.mockResolvedValue({
        success: false,
        error: { code: "profile/not-found", message: "Profile not found" },
      });

      await store.fetchProfile();

      expect(store.profile).toBeNull();
    });

    it("should handle profile fetch exception", async () => {
      mockProfileGet.mockRejectedValue(new Error("Network error"));

      await store.fetchProfile();

      // Should not throw
      expect(store.profile).toBeNull();
    });
  });

  describe("updateProfile - edge cases", () => {
    it("should handle missing electronAPI", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: undefined,
        writable: true,
      });

      await store.updateProfile({ displayName: "New Name" });

      expect(mockProfileUpdate).not.toHaveBeenCalled();
      expect(store.isLoading).toBe(false);
    });

    it("should handle update exception", async () => {
      mockProfileUpdate.mockRejectedValue(new Error("Network error"));

      await store.updateProfile({ displayName: "New Name" });

      // handleAuthError converts "Network error" to Japanese message
      expect(store.authError).toBe("ネットワーク接続を確認してください");
      expect(store.isLoading).toBe(false);
    });

    it("should handle update failure without error message", async () => {
      mockProfileUpdate.mockResolvedValue({
        success: false,
        error: { code: "unknown" },
      });

      await store.updateProfile({ displayName: "New Name" });

      expect(store.authError).toBe("プロフィールの更新に失敗しました");
    });
  });

  describe("fetchLinkedProviders - edge cases", () => {
    it("should handle missing electronAPI", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: undefined,
        writable: true,
      });

      await store.fetchLinkedProviders();

      expect(mockProfileGetProviders).not.toHaveBeenCalled();
    });

    it("should handle fetch failure", async () => {
      mockProfileGetProviders.mockResolvedValue({
        success: false,
        error: { code: "profile/error", message: "Error" },
      });

      await store.fetchLinkedProviders();

      expect(store.linkedProviders).toEqual([]);
    });

    it("should handle fetch exception", async () => {
      mockProfileGetProviders.mockRejectedValue(new Error("Network error"));

      await store.fetchLinkedProviders();

      // Should not throw
      expect(store.linkedProviders).toEqual([]);
    });
  });

  describe("linkProvider - edge cases", () => {
    it("should handle missing electronAPI", async () => {
      Object.defineProperty(window, "electronAPI", {
        value: undefined,
        writable: true,
      });

      await store.linkProvider("github");

      expect(mockProfileLinkProvider).not.toHaveBeenCalled();
      expect(store.isLoading).toBe(false);
    });

    it("should handle link failure", async () => {
      mockProfileLinkProvider.mockResolvedValue({
        success: false,
        error: { code: "profile/link-failed", message: "連携に失敗しました" },
      });

      await store.linkProvider("github");

      expect(store.authError).toBe("連携に失敗しました");
      expect(store.isLoading).toBe(false);
    });

    it("should handle link failure without error message", async () => {
      mockProfileLinkProvider.mockResolvedValue({
        success: false,
        error: { code: "unknown" },
      });

      await store.linkProvider("github");

      expect(store.authError).toBe("アカウント連携に失敗しました");
    });

    it("should handle link exception", async () => {
      mockProfileLinkProvider.mockRejectedValue(new Error("Network error"));

      await store.linkProvider("github");

      // handleAuthError converts "Network error" to Japanese message
      expect(store.authError).toBe("ネットワーク接続を確認してください");
      expect(store.isLoading).toBe(false);
    });
  });

  describe("連携解除後のUI更新 - AUTH-UI-001", () => {
    it("AUTH_STATE_CHANGEDイベント時にfetchLinkedProvidersが呼ばれる", async () => {
      let authStateCallback: (state: {
        authenticated: boolean;
        user?: typeof mockAuthUser;
        isOffline?: boolean;
      }) => void = () => {};

      mockAuthOnAuthStateChanged.mockImplementation((callback) => {
        authStateCallback = callback;
        return () => {};
      });

      await store.initializeAuth();

      // fetchLinkedProvidersをリセット
      mockProfileGetProviders.mockClear();

      // 認証状態変更をシミュレート（連携解除後のイベント）
      authStateCallback({
        authenticated: true,
        user: mockAuthUser,
        isOffline: false,
      });

      // fetchLinkedProvidersが呼ばれることを確認
      expect(mockProfileGetProviders).toHaveBeenCalled();
    });

    it("onAuthStateChangedでuser状態が更新されたときfetchLinkedProvidersが再取得される", async () => {
      let authStateCallback: (state: {
        authenticated: boolean;
        user?: typeof mockAuthUser;
        isOffline?: boolean;
      }) => void = () => {};

      mockAuthOnAuthStateChanged.mockImplementation((callback) => {
        authStateCallback = callback;
        return () => {};
      });

      await store.initializeAuth();

      // 初期化後のコール回数を記録
      const initialCallCount = mockProfileGetProviders.mock.calls.length;

      // 認証状態変更をシミュレート
      authStateCallback({
        authenticated: true,
        user: { ...mockAuthUser, id: "updated-user" },
        isOffline: false,
      });

      // 追加でfetchLinkedProvidersが呼ばれることを確認
      expect(mockProfileGetProviders.mock.calls.length).toBeGreaterThan(
        initialCallCount,
      );
    });
  });

  describe("auth state change callback", () => {
    it("should handle authenticated state change", async () => {
      let authStateCallback: (state: {
        authenticated: boolean;
        user?: typeof mockAuthUser;
        isOffline?: boolean;
      }) => void = () => {};

      mockAuthOnAuthStateChanged.mockImplementation((callback) => {
        authStateCallback = callback;
        return () => {};
      });

      await store.initializeAuth();

      // Simulate auth state change to logged out
      authStateCallback({ authenticated: false });

      expect(store.isAuthenticated).toBe(false);
      expect(store.authUser).toBeNull();
    });

    it("should handle authenticated state change with user", async () => {
      let authStateCallback: (state: {
        authenticated: boolean;
        user?: typeof mockAuthUser;
        isOffline?: boolean;
      }) => void = () => {};

      mockAuthOnAuthStateChanged.mockImplementation((callback) => {
        authStateCallback = callback;
        return () => {};
      });

      await store.initializeAuth();

      // Simulate new user auth
      const newUser = { ...mockAuthUser, id: "new-user" };
      authStateCallback({
        authenticated: true,
        user: newUser,
        isOffline: false,
      });

      expect(store.isAuthenticated).toBe(true);
      expect(store.authUser?.id).toBe("new-user");
    });

    it("should handle OAuth callback with tokens", async () => {
      let authStateCallback: (state: {
        authenticated: boolean;
        user?: typeof mockAuthUser;
        tokens?: { accessToken: string; refreshToken: string };
        isOffline?: boolean;
      }) => Promise<void> = async () => {};

      mockAuthOnAuthStateChanged.mockImplementation((callback) => {
        authStateCallback = callback;
        return () => {};
      });

      await store.initializeAuth();

      // Reset session mock for callback flow
      mockAuthGetSession.mockResolvedValue({
        success: true,
        data: mockSession,
      });

      // Simulate OAuth callback with tokens
      await authStateCallback({
        authenticated: true,
        tokens: {
          accessToken: "new-access-token",
          refreshToken: "new-refresh-token",
        },
      });

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(mockAuthGetSession).toHaveBeenCalled();
      expect(store.isAuthenticated).toBe(true);
    });

    it("should handle OAuth callback with session fetch failure", async () => {
      let authStateCallback: (state: {
        authenticated: boolean;
        tokens?: { accessToken: string; refreshToken: string };
      }) => Promise<void> = async () => {};

      mockAuthOnAuthStateChanged.mockImplementation((callback) => {
        authStateCallback = callback;
        return () => {};
      });

      await store.initializeAuth();

      // Reset session mock to fail
      mockAuthGetSession.mockResolvedValue({
        success: false,
        error: { code: "auth/session-failed", message: "Session failed" },
      });

      // Simulate OAuth callback with tokens
      await authStateCallback({
        authenticated: true,
        tokens: {
          accessToken: "access-token",
          refreshToken: "refresh-token",
        },
      });

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(store.isLoading).toBe(false);
    });

    it("should handle OAuth callback with getSession exception", async () => {
      let authStateCallback: (state: {
        authenticated: boolean;
        tokens?: { accessToken: string; refreshToken: string };
      }) => Promise<void> = async () => {};

      mockAuthOnAuthStateChanged.mockImplementation((callback) => {
        authStateCallback = callback;
        return () => {};
      });

      await store.initializeAuth();

      // Reset session mock to throw
      mockAuthGetSession.mockRejectedValue(new Error("Network error"));

      // Simulate OAuth callback with tokens
      await authStateCallback({
        authenticated: true,
        tokens: {
          accessToken: "access-token",
          refreshToken: "refresh-token",
        },
      });

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(store.isLoading).toBe(false);
    });
  });

  /**
   * Phase 2 TDD Red Phase: 状態最小化テスト
   *
   * これらのテストはT-02-4タスクの一部として作成され、
   * 状態からトークン情報を排除する実装が完了するまで失敗する
   *
   * 要件: spec-state-minimization.md
   * 設計: design-auth-state.md
   */
  describe("状態最小化（TDD Red Phase）", () => {
    describe("状態構造 - トークン排除", () => {
      it("sessionプロパティが存在しない", () => {
        // 新しい状態構造では session プロパティは削除される
        // 代わりに sessionExpiresAt を使用
        expect("session" in store).toBe(false);
      });

      it("sessionExpiresAtプロパティが存在する", () => {
        expect("sessionExpiresAt" in store).toBe(true);
      });

      it("初期状態のsessionExpiresAtはnull", () => {
        const freshStore = createTestStore();
        expect(freshStore.sessionExpiresAt).toBeNull();
      });

      it("状態オブジェクトにaccessTokenが含まれない", () => {
        const stateKeys = Object.keys(store);
        expect(stateKeys).not.toContain("accessToken");
      });

      it("状態オブジェクトにrefreshTokenが含まれない", () => {
        const stateKeys = Object.keys(store);
        expect(stateKeys).not.toContain("refreshToken");
      });

      it("状態オブジェクトにtokensオブジェクトが含まれない", () => {
        const stateKeys = Object.keys(store);
        expect(stateKeys).not.toContain("tokens");
      });
    });

    describe("認証成功時の状態 - トークンなし", () => {
      it("getSessionレスポンスにトークンが含まれていても状態に保存されない", async () => {
        // レスポンスにトークンが含まれている（後方互換性）
        mockAuthGetSession.mockResolvedValue({
          success: true,
          data: {
            user: mockAuthUser,
            accessToken: "should-not-be-stored",
            refreshToken: "should-not-be-stored",
            expiresAt: Date.now() / 1000 + 3600,
            isOffline: false,
          },
        });

        await store.initializeAuth();

        // 状態にトークンが含まれないことを確認
        const stateSnapshot = JSON.stringify(store);
        expect(stateSnapshot).not.toContain("should-not-be-stored");
        expect(stateSnapshot).not.toContain("accessToken");
        expect(stateSnapshot).not.toContain("refreshToken");
      });

      it("認証成功後、sessionExpiresAtが正しく設定される", async () => {
        const expiresAt = Date.now() / 1000 + 7200;
        mockAuthGetSession.mockResolvedValue({
          success: true,
          data: {
            user: mockAuthUser,
            expiresAt,
            isOffline: false,
          },
        });

        await store.initializeAuth();

        expect(store.sessionExpiresAt).toBe(expiresAt);
      });

      it("認証成功後、authUserは設定されるがsessionは設定されない", async () => {
        mockAuthGetSession.mockResolvedValue({
          success: true,
          data: {
            user: mockAuthUser,
            expiresAt: Date.now() / 1000 + 3600,
            isOffline: false,
          },
        });

        await store.initializeAuth();

        expect(store.isAuthenticated).toBe(true);
        expect(store.authUser).toEqual(mockAuthUser);
        expect(
          (store as unknown as Record<string, unknown>).session,
        ).toBeUndefined();
      });
    });

    describe("AUTH_STATE_CHANGED イベント - トークンなし", () => {
      it("tokensを含むイベントでも状態にトークンが保存されない", async () => {
        let authStateCallback: (state: unknown) => void;
        mockAuthOnAuthStateChanged.mockImplementation((callback) => {
          authStateCallback = callback;
          return () => {};
        });

        await store.initializeAuth();

        // トークン付きのイベントをシミュレート
        await authStateCallback!({
          authenticated: true,
          user: mockAuthUser,
          tokens: {
            accessToken: "event-access-token",
            refreshToken: "event-refresh-token",
          },
          expiresAt: Date.now() / 1000 + 3600,
        });

        await new Promise((resolve) => setTimeout(resolve, 100));

        // 状態にトークンが含まれないことを確認
        const stateSnapshot = JSON.stringify(store);
        expect(stateSnapshot).not.toContain("event-access-token");
        expect(stateSnapshot).not.toContain("event-refresh-token");
      });

      it("expiresAtを含むイベントでsessionExpiresAtが更新される", async () => {
        let authStateCallback: (state: unknown) => void;
        mockAuthOnAuthStateChanged.mockImplementation((callback) => {
          authStateCallback = callback;
          return () => {};
        });

        await store.initializeAuth();

        const newExpiresAt = Date.now() / 1000 + 9999;

        await authStateCallback!({
          authenticated: true,
          user: mockAuthUser,
          expiresAt: newExpiresAt,
          isOffline: false,
        });

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(store.sessionExpiresAt).toBe(newExpiresAt);
      });
    });

    describe("refreshSession - トークンなし", () => {
      it("リフレッシュ後もトークンが状態に保存されない", async () => {
        mockAuthRefresh.mockResolvedValue({
          success: true,
          data: {
            user: mockAuthUser,
            accessToken: "new-access-token",
            refreshToken: "new-refresh-token",
            expiresAt: Date.now() / 1000 + 7200,
            isOffline: false,
          },
        });

        // 認証状態を設定
        mockAuthGetSession.mockResolvedValue({
          success: true,
          data: {
            user: mockAuthUser,
            expiresAt: Date.now() / 1000 + 100, // 期限切れ近い
            isOffline: false,
          },
        });

        await store.initializeAuth();
        await store.refreshSession();

        // 状態にトークンが含まれないことを確認
        const stateSnapshot = JSON.stringify(store);
        expect(stateSnapshot).not.toContain("new-access-token");
        expect(stateSnapshot).not.toContain("new-refresh-token");
      });

      it("リフレッシュ後にsessionExpiresAtが更新される", async () => {
        const newExpiresAt = Date.now() / 1000 + 7200;
        mockAuthRefresh.mockResolvedValue({
          success: true,
          data: {
            user: mockAuthUser,
            expiresAt: newExpiresAt,
            isOffline: false,
          },
        });

        mockAuthGetSession.mockResolvedValue({
          success: true,
          data: {
            user: mockAuthUser,
            expiresAt: Date.now() / 1000 + 100,
            isOffline: false,
          },
        });

        await store.initializeAuth();
        await store.refreshSession();

        expect(store.sessionExpiresAt).toBe(newExpiresAt);
      });
    });

    describe("clearAuth - 状態クリア", () => {
      it("clearAuth後、sessionExpiresAtがnullになる", async () => {
        mockAuthGetSession.mockResolvedValue({
          success: true,
          data: {
            user: mockAuthUser,
            expiresAt: Date.now() / 1000 + 3600,
            isOffline: false,
          },
        });

        await store.initializeAuth();
        expect(store.sessionExpiresAt).not.toBeNull();

        store.clearAuth();

        expect(store.sessionExpiresAt).toBeNull();
      });

      it("clearAuth後、トークン関連の状態が存在しない", async () => {
        await store.initializeAuth();
        store.clearAuth();

        const stateSnapshot = JSON.stringify(store);
        expect(stateSnapshot).not.toContain("accessToken");
        expect(stateSnapshot).not.toContain("refreshToken");
        expect(stateSnapshot).not.toContain("tokens");
      });
    });

    describe("logout - 状態クリア", () => {
      it("logout後、sessionExpiresAtがnullになる", async () => {
        mockAuthGetSession.mockResolvedValue({
          success: true,
          data: {
            user: mockAuthUser,
            expiresAt: Date.now() / 1000 + 3600,
            isOffline: false,
          },
        });

        await store.initializeAuth();

        mockAuthLogout.mockResolvedValue({ success: true });

        await store.logout();

        expect(store.sessionExpiresAt).toBeNull();
      });
    });

    describe("DevTools セキュリティ", () => {
      it("シリアライズされた状態にトークンが含まれない", async () => {
        // 認証後のフル状態をシミュレート
        mockAuthGetSession.mockResolvedValue({
          success: true,
          data: {
            user: mockAuthUser,
            accessToken: "serialized-access-token",
            refreshToken: "serialized-refresh-token",
            expiresAt: Date.now() / 1000 + 3600,
            isOffline: false,
          },
        });

        await store.initializeAuth();

        // DevToolsで表示される可能性のある形式でシリアライズ
        const serializedState = JSON.stringify(store, null, 2);

        expect(serializedState).not.toContain("serialized-access-token");
        expect(serializedState).not.toContain("serialized-refresh-token");
        expect(serializedState).not.toContain('"accessToken"');
        expect(serializedState).not.toContain('"refreshToken"');
      });

      it("Object.keysに機密キーが含まれない", async () => {
        await store.initializeAuth();

        const keys = Object.keys(store);
        const sensitiveKeys = [
          "accessToken",
          "refreshToken",
          "tokens",
          "session",
        ];

        sensitiveKeys.forEach((key) => {
          expect(keys).not.toContain(key);
        });
      });
    });

    describe("型安全性", () => {
      it("AuthSlice型にsessionプロパティが含まれない", () => {
        // TypeScriptコンパイル時にチェックされるが、
        // ランタイムでもチェックする
        const sliceKeys = Object.keys(store);
        expect(sliceKeys).not.toContain("session");
      });

      it("新しいRendererSession型にトークンが含まれない", () => {
        // getSessionのレスポンス型がRendererSession型であることを確認
        // 実際の実装では、この型チェックはコンパイル時に行われる
        // ここではランタイムで状態を検証
        expect("sessionExpiresAt" in store).toBe(true);
        expect("session" in store).toBe(false);
      });
    });
  });

  // ヘルパー関数
  function createTestStore(): AuthSlice {
    let internalState: Partial<AuthSlice> = {};
    const set = (newState: Partial<AuthSlice>) => {
      internalState = { ...internalState, ...newState };
    };
    const get = () => internalState as AuthSlice;

    return createAuthSlice(set as never, get as never, {} as never);
  }

  /**
   * Phase 2 TDD Red Phase: 未実装機能テスト
   *
   * これらのテストは設計レビュー(Phase 1.5)で指摘された未実装機能のテスト。
   * Phase 3実装完了まで失敗する（TDD Red状態）。
   *
   * 対象機能:
   * - unlinkProvider: OAuth連携解除
   * - uploadAvatar: アバター画像アップロード
   * - useProviderAvatar: プロバイダーアバター使用
   * - removeAvatar: アバター削除
   */
  describe("未実装機能（TDD Red Phase）", () => {
    // Mock追加
    const mockProfileUnlinkProvider = vi.fn();
    const mockAvatarUpload = vi.fn();
    const mockAvatarUseProvider = vi.fn();
    const mockAvatarRemove = vi.fn();

    beforeEach(() => {
      // 未実装機能のモックを追加
      (mockElectronAPI as unknown as Record<string, unknown>).profile = {
        ...mockElectronAPI.profile,
        unlinkProvider: mockProfileUnlinkProvider,
      };
      (mockElectronAPI as unknown as Record<string, unknown>).avatar = {
        upload: mockAvatarUpload,
        useProvider: mockAvatarUseProvider,
        remove: mockAvatarRemove,
      };
    });

    describe("unlinkProvider - OAuth連携解除", () => {
      it("unlinkProviderメソッドが存在する", () => {
        expect(typeof store.unlinkProvider).toBe("function");
      });

      it("profile.unlinkProviderを呼び出す", async () => {
        // 複数のプロバイダーを設定（最後のプロバイダー保護を回避）
        store.linkedProviders = [
          ...mockLinkedProviders,
          {
            provider: "github" as const,
            providerId: "github-id",
            email: "test@github.com",
            displayName: "Test GitHub",
            avatarUrl: null,
            linkedAt: "2024-12-01T00:00:00Z",
          },
        ];

        mockProfileUnlinkProvider.mockResolvedValue({
          success: true,
        });

        await store.unlinkProvider("github");

        expect(mockProfileUnlinkProvider).toHaveBeenCalledWith({
          provider: "github",
        });
      });

      it("連携解除成功時、linkedProvidersから該当プロバイダーを削除", async () => {
        const githubProvider = {
          provider: "github" as const,
          providerId: "github-id",
          email: "test@github.com",
          displayName: "Test GitHub",
          avatarUrl: null,
          linkedAt: "2024-12-01T00:00:00Z",
        };

        store.linkedProviders = [...mockLinkedProviders, githubProvider];

        mockProfileUnlinkProvider.mockResolvedValue({
          success: true,
        });

        await store.unlinkProvider("github");

        expect(store.linkedProviders).not.toContainEqual(
          expect.objectContaining({ provider: "github" }),
        );
        // 元のGoogleプロバイダーは残る
        expect(store.linkedProviders).toContainEqual(
          expect.objectContaining({ provider: "google" }),
        );
      });

      it("連携解除失敗時、authErrorを設定", async () => {
        // 複数のプロバイダーを設定（最後のプロバイダー保護を回避）
        store.linkedProviders = [
          ...mockLinkedProviders,
          {
            provider: "github" as const,
            providerId: "github-id",
            email: "test@github.com",
            displayName: "Test GitHub",
            avatarUrl: null,
            linkedAt: "2024-12-01T00:00:00Z",
          },
        ];

        mockProfileUnlinkProvider.mockResolvedValue({
          success: false,
          error: {
            code: "profile/unlink-failed",
            message: "連携解除に失敗しました",
          },
        });

        await store.unlinkProvider("github");

        expect(store.authError).toBe("連携解除に失敗しました");
      });

      it("最後のプロバイダーは連携解除できない", async () => {
        store.linkedProviders = [mockLinkedProviders[0]]; // Googleのみ

        await store.unlinkProvider("google");

        // エラーメッセージを確認
        expect(store.authError).toContain("最後の");
        expect(mockProfileUnlinkProvider).not.toHaveBeenCalled();
      });

      it("isLoadingを適切に制御する", async () => {
        mockProfileUnlinkProvider.mockResolvedValue({
          success: true,
        });

        store.linkedProviders = [
          ...mockLinkedProviders,
          {
            provider: "github" as const,
            providerId: "github-id",
            email: "test@github.com",
            displayName: null,
            avatarUrl: null,
            linkedAt: "2024-12-01T00:00:00Z",
          },
        ];

        const unlinkPromise = store.unlinkProvider("github");

        expect(mockSet).toHaveBeenCalledWith(
          expect.objectContaining({ isLoading: true }),
        );

        await unlinkPromise;

        expect(store.isLoading).toBe(false);
      });

      it("electronAPIが利用できない場合はisLoadingをfalseにして早期リターン", async () => {
        Object.defineProperty(window, "electronAPI", {
          value: undefined,
          writable: true,
        });

        await store.unlinkProvider("github");

        expect(mockProfileUnlinkProvider).not.toHaveBeenCalled();
        expect(store.isLoading).toBe(false);
      });

      it("例外発生時のエラーハンドリング", async () => {
        store.linkedProviders = [
          ...mockLinkedProviders,
          {
            provider: "github" as const,
            providerId: "github-id",
            email: "test@github.com",
            displayName: null,
            avatarUrl: null,
            linkedAt: "2024-12-01T00:00:00Z",
          },
        ];

        mockProfileUnlinkProvider.mockRejectedValue(new Error("Network error"));

        await store.unlinkProvider("github");

        expect(store.authError).toBe("ネットワーク接続を確認してください");
        expect(store.isLoading).toBe(false);
      });
    });

    describe("uploadAvatar - アバター画像アップロード", () => {
      it("uploadAvatarメソッドが存在する", () => {
        expect(typeof store.uploadAvatar).toBe("function");
      });

      it("avatar.uploadを呼び出す", async () => {
        mockAvatarUpload.mockResolvedValue({
          success: true,
          data: { avatarUrl: "https://storage.example.com/avatar.png" },
        });

        await store.uploadAvatar();

        expect(mockAvatarUpload).toHaveBeenCalled();
      });

      it("アップロード成功時、profileのavatarUrlを更新", async () => {
        const newAvatarUrl = "https://storage.example.com/new-avatar.png";
        mockAvatarUpload.mockResolvedValue({
          success: true,
          data: { avatarUrl: newAvatarUrl },
        });

        store.profile = mockUserProfile;

        await store.uploadAvatar();

        expect(store.profile?.avatarUrl).toBe(newAvatarUrl);
      });

      it("アップロード失敗時、authErrorを設定", async () => {
        mockAvatarUpload.mockResolvedValue({
          success: false,
          error: {
            code: "avatar/upload-failed",
            message: "アップロードに失敗しました",
          },
        });

        await store.uploadAvatar();

        expect(store.authError).toBe("アップロードに失敗しました");
      });

      it("isLoadingを適切に制御する", async () => {
        mockAvatarUpload.mockResolvedValue({
          success: true,
          data: { avatarUrl: "https://example.com/avatar.png" },
        });

        const uploadPromise = store.uploadAvatar();

        expect(mockSet).toHaveBeenCalledWith(
          expect.objectContaining({ isLoading: true }),
        );

        await uploadPromise;

        expect(store.isLoading).toBe(false);
      });
    });

    describe("useProviderAvatar - プロバイダーアバター使用", () => {
      it("useProviderAvatarメソッドが存在する", () => {
        expect(typeof store.useProviderAvatar).toBe("function");
      });

      it("avatar.useProviderを呼び出す", async () => {
        // linkedProvidersにgoogleを設定
        store.linkedProviders = mockLinkedProviders;

        mockAvatarUseProvider.mockResolvedValue({
          success: true,
          data: { avatarUrl: "https://google.com/avatar.png" },
        });

        await store.useProviderAvatar("google");

        expect(mockAvatarUseProvider).toHaveBeenCalledWith({
          provider: "google",
        });
      });

      it("成功時、profileのavatarUrlを更新", async () => {
        // linkedProvidersにgoogleを設定
        store.linkedProviders = mockLinkedProviders;

        const providerAvatarUrl = "https://google.com/avatar.png";
        mockAvatarUseProvider.mockResolvedValue({
          success: true,
          data: { avatarUrl: providerAvatarUrl },
        });

        store.profile = mockUserProfile;

        await store.useProviderAvatar("google");

        expect(store.profile?.avatarUrl).toBe(providerAvatarUrl);
      });

      it("連携していないプロバイダーは使用できない", async () => {
        store.linkedProviders = [mockLinkedProviders[0]]; // Googleのみ

        await store.useProviderAvatar("github"); // 連携していない

        expect(store.authError).toContain("連携されていません");
        expect(mockAvatarUseProvider).not.toHaveBeenCalled();
      });
    });

    describe("removeAvatar - アバター削除", () => {
      it("removeAvatarメソッドが存在する", () => {
        expect(typeof store.removeAvatar).toBe("function");
      });

      it("avatar.removeを呼び出す", async () => {
        mockAvatarRemove.mockResolvedValue({
          success: true,
        });

        await store.removeAvatar();

        expect(mockAvatarRemove).toHaveBeenCalled();
      });

      it("削除成功時、profileのavatarUrlをnullに設定", async () => {
        mockAvatarRemove.mockResolvedValue({
          success: true,
        });

        // fetchProfile呼び出し後に返すプロファイル（avatarUrl: null）
        mockProfileGet.mockResolvedValue({
          success: true,
          data: { ...mockUserProfile, avatarUrl: null },
        });

        store.profile = mockUserProfile;

        await store.removeAvatar();

        expect(store.profile?.avatarUrl).toBeNull();
      });

      it("削除失敗時、authErrorを設定", async () => {
        mockAvatarRemove.mockResolvedValue({
          success: false,
          error: {
            code: "avatar/remove-failed",
            message: "削除に失敗しました",
          },
        });

        await store.removeAvatar();

        expect(store.authError).toBe("削除に失敗しました");
      });

      it("isLoadingを適切に制御する", async () => {
        mockAvatarRemove.mockResolvedValue({
          success: true,
        });

        const removePromise = store.removeAvatar();

        expect(mockSet).toHaveBeenCalledWith(
          expect.objectContaining({ isLoading: true }),
        );

        await removePromise;

        expect(store.isLoading).toBe(false);
      });
    });
  });
});
