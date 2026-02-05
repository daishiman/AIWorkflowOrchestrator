/**
 * Auth Slice Listener Tests
 * Phase 4: TDD Red - Tests for listener management improvements
 *
 * Problem 4: 認証状態リスナーの不安定性
 * - TC-008: 二重登録防止
 * - TC-009: 動的タイムアウト
 * - TC-010: エラー状態更新
 * @see docs/30-workflows/TASK-FIX-GOOGLE-LOGIN-001/outputs/phase-4/test-cases.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock electronAPI
const mockOnAuthStateChanged = vi.fn();
const mockGetSession = vi.fn();

const mockElectronAPI = {
  auth: {
    login: vi.fn(),
    logout: vi.fn(),
    getSession: mockGetSession,
    refresh: vi.fn(),
    checkOnline: vi.fn().mockResolvedValue({ data: { online: true } }),
    onAuthStateChanged: mockOnAuthStateChanged,
  },
  profile: {
    get: vi.fn(),
    getProviders: vi.fn(),
  },
};

// Set up global mock
beforeEach(() => {
  // @ts-expect-error - Mock window.electronAPI
  global.window = {
    electronAPI: mockElectronAPI,
  };
});

afterEach(() => {
  vi.clearAllMocks();
  // @ts-expect-error - Clean up
  delete global.window;
});

// =============================================================================
// TC-008: 二重登録防止テスト
// =============================================================================
describe("TC-008: Listener double-registration prevention", () => {
  /**
   * TC-008-1: initializeAuthを2回呼んでもリスナーは1回だけ登録
   */
  it("TC-008-1: should register onAuthStateChanged only once when initializeAuth called twice", async () => {
    // TDD Red: 現状の実装では二重登録防止がない
    // Phase 5で authListenerRegistered フラグを追加

    // Import authSlice after mock setup
    const { createAuthSlice } = await import("../authSlice");

    // Create a minimal store mock
    let state: ReturnType<typeof createAuthSlice> | null = null;
    const set = vi.fn((updater) => {
      if (typeof updater === "function" && state) {
        state = { ...state, ...updater(state) };
      } else if (typeof updater === "object") {
        state = { ...state!, ...updater };
      }
    });
    const get = vi.fn(() => state);

    // Initialize the slice
    // @ts-expect-error - Partial implementation for testing
    state = createAuthSlice(set, get, {});

    // Mock getSession to return success
    mockGetSession.mockResolvedValue({
      success: true,
      data: {
        user: {
          id: "test",
          email: "test@example.com",
          displayName: "Test",
          avatarUrl: null,
          provider: "google",
          createdAt: new Date().toISOString(),
          lastSignInAt: new Date().toISOString(),
        },
        expiresAt: Date.now() + 3600000,
        isOffline: false,
      },
    });

    // Call initializeAuth twice
    await state!.initializeAuth();
    await state!.initializeAuth();

    // 現状の実装では2回登録される
    // Phase 5修正後は1回のみ登録されるべき
    expect(mockOnAuthStateChanged).toHaveBeenCalledTimes(1);
  });

  /**
   * TC-008-2: clearAuth後のinitializeAuthでリスナーが再登録される
   */
  it("TC-008-2: should re-register listener after clearAuth", async () => {
    // TDD Red: リスナーの再登録機構がまだない

    const { createAuthSlice } = await import("../authSlice");

    let state: ReturnType<typeof createAuthSlice> | null = null;
    const set = vi.fn((updater) => {
      if (typeof updater === "function" && state) {
        state = { ...state, ...updater(state) };
      } else if (typeof updater === "object") {
        state = { ...state!, ...updater };
      }
    });
    const get = vi.fn(() => state);

    // @ts-expect-error - Partial implementation for testing
    state = createAuthSlice(set, get, {});

    mockGetSession.mockResolvedValue({ success: false });

    // First initialize
    await state!.initializeAuth();

    // Clear auth (should reset listener flag)
    state!.clearAuth();

    // Re-initialize (should register again)
    await state!.initializeAuth();

    // Phase 5修正後: clearAuth後にinitializeAuthを呼ぶとリスナーが再登録される
    // 現状の実装では clearAuth でリスナーフラグをリセットしないため、
    // 再登録されるかどうかは実装次第
    expect(mockOnAuthStateChanged).toHaveBeenCalledTimes(2);
  });
});

// =============================================================================
// TC-009: 動的タイムアウトテスト
// =============================================================================
describe("TC-009: Dynamic timeout for session wait", () => {
  /**
   * TC-009-1: getSessionが即座に成功を返す場合、500ms未満で完了
   */
  it("TC-009-1: should return session in less than 500ms when getSession succeeds immediately", async () => {
    // TDD Red: 現状は固定500ms待機
    // Phase 5で waitForSession ポーリングベース実装に変更

    // この関数はまだ存在しない
    const { waitForSession } = await import("../authSlice").catch(() => ({
      waitForSession: undefined,
    }));

    // 関数が存在する場合のみテスト実行
    if (waitForSession) {
      const startTime = Date.now();

      // Mock immediate success
      mockGetSession.mockResolvedValueOnce({
        success: true,
        data: {
          user: { id: "test", email: "test@example.com" },
          expiresAt: Date.now() + 3600000,
          isOffline: false,
        },
      });

      const result = await waitForSession(100, 5000);

      const elapsed = Date.now() - startTime;

      expect(result).toBeDefined();
      expect(elapsed).toBeLessThan(500);
    } else {
      // waitForSession がエクスポートされていない場合は失敗
      expect(waitForSession).toBeDefined();
    }
  });

  /**
   * TC-009-2: getSessionが5秒以上応答しない場合、タイムアウトでnullを返す
   */
  it("TC-009-2: should return null after timeout when getSession never responds", async () => {
    vi.useFakeTimers();

    const { waitForSession } = await import("../authSlice").catch(() => ({
      waitForSession: undefined,
    }));

    if (waitForSession) {
      // Mock that never resolves within timeout
      mockGetSession.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 10000)),
      );

      const resultPromise = waitForSession(100, 5000);

      // Advance time past timeout
      await vi.advanceTimersByTimeAsync(6000);

      const result = await resultPromise;

      expect(result).toBeNull();
    } else {
      expect(waitForSession).toBeDefined();
    }

    vi.useRealTimers();
  });
});

// =============================================================================
// TC-010: エラー状態更新テスト
// =============================================================================
describe("TC-010: Error state update from AUTH_STATE_CHANGED", () => {
  /**
   * TC-010-1: エラー付きAUTH_STATE_CHANGEDでauthErrorが設定される
   */
  it("TC-010-1: should set authError when AUTH_STATE_CHANGED contains error", async () => {
    const { createAuthSlice } = await import("../authSlice");

    let state: ReturnType<typeof createAuthSlice> | null = null;
    const set = vi.fn((updater) => {
      if (typeof updater === "function" && state) {
        state = { ...state, ...updater(state) };
      } else if (typeof updater === "object") {
        state = { ...state!, ...updater };
      }
    });
    const get = vi.fn(() => state);

    // @ts-expect-error - Partial implementation for testing
    state = createAuthSlice(set, get, {});

    // Capture the callback passed to onAuthStateChanged
    let authStateCallback: ((state: unknown) => void) | null = null;
    mockOnAuthStateChanged.mockImplementation((callback) => {
      authStateCallback = callback;
    });

    mockGetSession.mockResolvedValue({ success: false });

    // Initialize to register the listener
    await state!.initializeAuth();

    // Simulate error event from main process
    // TDD Red: 現状の実装ではerror/errorCodeを適切に処理しない
    if (authStateCallback) {
      authStateCallback({
        authenticated: false,
        error: "認証がキャンセルされました",
        errorCode: "auth/oauth-access-denied",
      });

      // Phase 5修正後: authErrorがエラーメッセージで更新される
      // 現状の実装では authenticated: false の場合 clearAuth() が呼ばれ
      // authError は null にリセットされる
      expect(state!.authError).toBe("認証がキャンセルされました");
    }
  });

  /**
   * TC-010-2: errorCodeがある場合、適切にマッピングされる
   */
  it("TC-010-2: should map errorCode to user-friendly message", async () => {
    const { createAuthSlice } = await import("../authSlice");

    let state: ReturnType<typeof createAuthSlice> | null = null;
    const set = vi.fn((updater) => {
      if (typeof updater === "function" && state) {
        state = { ...state, ...updater(state) };
      } else if (typeof updater === "object") {
        state = { ...state!, ...updater };
      }
    });
    const get = vi.fn(() => state);

    // @ts-expect-error - Partial implementation for testing
    state = createAuthSlice(set, get, {});

    let authStateCallback: ((state: unknown) => void) | null = null;
    mockOnAuthStateChanged.mockImplementation((callback) => {
      authStateCallback = callback;
    });

    mockGetSession.mockResolvedValue({ success: false });
    await state!.initializeAuth();

    if (authStateCallback) {
      authStateCallback({
        authenticated: false,
        errorCode: "auth/not-configured",
      });

      // Phase 5修正後: errorCodeからエラーメッセージが導出される
      expect(state!.authError).toBeDefined();
      expect(state!.authError).not.toBeNull();
    }
  });
});

// =============================================================================
// 統合テスト: 認証フロー全体のエラーハンドリング
// =============================================================================
describe("Integration: Auth flow error handling", () => {
  /**
   * TC-011-1: OAuth認証キャンセル時のエラーフロー
   */
  it("TC-011-1: should handle OAuth cancellation flow correctly", async () => {
    const { createAuthSlice } = await import("../authSlice");

    let state: ReturnType<typeof createAuthSlice> | null = null;
    const set = vi.fn((updater) => {
      if (typeof updater === "function" && state) {
        state = { ...state, ...updater(state) };
      } else if (typeof updater === "object") {
        state = { ...state!, ...updater };
      }
    });
    const get = vi.fn(() => state);

    // @ts-expect-error - Partial implementation for testing
    state = createAuthSlice(set, get, {});

    let authStateCallback: ((state: unknown) => void) | null = null;
    mockOnAuthStateChanged.mockImplementation((callback) => {
      authStateCallback = callback;
    });

    mockGetSession.mockResolvedValue({ success: false });
    await state!.initializeAuth();

    // ユーザーがOAuth認証をキャンセル
    if (authStateCallback) {
      authStateCallback({
        authenticated: false,
        error: "認証がキャンセルされました",
        errorCode: "auth/oauth-access-denied",
      });

      // 期待される状態:
      // - isAuthenticated: false
      // - authError: キャンセルメッセージ
      // - isLoading: false
      expect(state!.isAuthenticated).toBe(false);
      expect(state!.authError).toBeDefined();
      expect(state!.isLoading).toBe(false);
    }
  });

  /**
   * TC-012-1: Supabase未設定時のエラーフロー
   */
  it("TC-012-1: should handle Supabase not configured error", async () => {
    const { createAuthSlice } = await import("../authSlice");

    let state: ReturnType<typeof createAuthSlice> | null = null;
    const set = vi.fn((updater) => {
      if (typeof updater === "function" && state) {
        state = { ...state, ...updater(state) };
      } else if (typeof updater === "object") {
        state = { ...state!, ...updater };
      }
    });
    const get = vi.fn(() => state);

    // @ts-expect-error - Partial implementation for testing
    state = createAuthSlice(set, get, {});

    let authStateCallback: ((state: unknown) => void) | null = null;
    mockOnAuthStateChanged.mockImplementation((callback) => {
      authStateCallback = callback;
    });

    mockGetSession.mockResolvedValue({ success: false });
    await state!.initializeAuth();

    // Supabase未設定エラー
    if (authStateCallback) {
      authStateCallback({
        authenticated: false,
        error: "Supabaseが設定されていません",
        errorCode: "auth/not-configured",
      });

      expect(state!.isAuthenticated).toBe(false);
      expect(state!.authError).toContain("Supabase");
    }
  });
});
