/**
 * SettingsView 統合テスト用ハーネス
 *
 * 目的: store mock + electronAPI mock を一本化し、
 * SettingsView の統合テストで real composition（vi.mock不使用）を実現する。
 *
 * AC-06: store mock + electronAPI mock の harness 一本化
 * M-01: AccountSection の store mock に全18セレクタのデフォルト値を含める
 *
 * @see phase-2-design.md
 */
import { vi } from "vitest";
import type { AuthMode, AuthModeStatus } from "@repo/shared/types/auth-mode";

// ============================================================
// 型定義
// ============================================================

/**
 * AccountSection が使用する store セレクタ 17個 + SettingsView 自身が使用するセレクタ
 * M-01 対応: 全18セレクタにデフォルト値を設定
 */
export interface MockStoreState {
  // --- SettingsView 自身が使用 (settingsSlice) ---
  apiKey: string;
  autoSyncEnabled: boolean;
  themeMode: "kanagawa-dragon" | "light" | "dark" | "system";
  resolvedTheme: string;
  userProfile: {
    name: string;
    email: string;
    avatar: string;
    plan: "free" | "pro" | "enterprise";
  };
  setApiKey: ReturnType<typeof vi.fn>;
  setAutoSyncEnabled: ReturnType<typeof vi.fn>;
  setThemeMode: ReturnType<typeof vi.fn>;
  setUserProfile: ReturnType<typeof vi.fn>;
  updateUserProfile: ReturnType<typeof vi.fn>;
  setResolvedTheme: ReturnType<typeof vi.fn>;
  initializeTheme: ReturnType<typeof vi.fn>;

  // --- AccountSection が使用 (authSlice) - 17セレクタ ---
  isAuthenticated: boolean;
  isLoading: boolean;
  authUser: {
    id: string;
    displayName: string;
    email: string;
    avatarUrl: string | null;
    createdAt: string;
    lastSignInAt: string;
  } | null;
  sessionExpiresAt: number | null;
  isRefreshing: boolean;
  profile: {
    displayName: string;
    email: string;
    avatarUrl: string | null;
    plan: "free" | "pro" | "enterprise";
  } | null;
  linkedProviders: Array<{
    provider: string;
    email?: string;
    avatarUrl?: string;
  }>;
  isOffline: boolean;
  authError: string | null;
  login: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
  initializeAuth: ReturnType<typeof vi.fn>;
  refreshSession: ReturnType<typeof vi.fn>;
  updateProfile: ReturnType<typeof vi.fn>;
  fetchProfile: ReturnType<typeof vi.fn>;
  fetchLinkedProviders: ReturnType<typeof vi.fn>;
  linkProvider: ReturnType<typeof vi.fn>;
  unlinkProvider: ReturnType<typeof vi.fn>;
  uploadAvatar: ReturnType<typeof vi.fn>;
  useProviderAvatar: ReturnType<typeof vi.fn>;
  removeAvatar: ReturnType<typeof vi.fn>;
  deleteAccount: ReturnType<typeof vi.fn>;
  setAuthError: ReturnType<typeof vi.fn>;
  clearAuth: ReturnType<typeof vi.fn>;
  setDevModeAuth: ReturnType<typeof vi.fn>;

  // --- AuthModeSlice (SettingsView が個別セレクタ経由で使用) ---
  mode: AuthMode;
  status: AuthModeStatus | null;
  error: string | null;
  isConfirmDialogOpen: boolean;
  pendingMode: AuthMode | null;
  fetchMode: ReturnType<typeof vi.fn>;
  setMode: ReturnType<typeof vi.fn>;
  fetchStatus: ReturnType<typeof vi.fn>;
  validate: ReturnType<typeof vi.fn>;
  openConfirmDialog: ReturnType<typeof vi.fn>;
  closeConfirmDialog: ReturnType<typeof vi.fn>;
  confirmModeChange: ReturnType<typeof vi.fn>;
  clearError: ReturnType<typeof vi.fn>;
  resetAuthMode: ReturnType<typeof vi.fn>;
  initializeAuthMode: ReturnType<typeof vi.fn>;
}

/**
 * AuthMode 個別セレクタのデフォルト値
 */
export interface MockAuthModeSelectors {
  mode: AuthMode;
  status: AuthModeStatus | null;
  isLoading: boolean;
  setMode: ReturnType<typeof vi.fn>;
  initializeAuthMode: ReturnType<typeof vi.fn>;
}

/**
 * electronAPI.apiKey のモック
 */
export interface MockElectronApiKey {
  list: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  validate: ReturnType<typeof vi.fn>;
}

/**
 * harness のオプション
 */
export interface HarnessOptions {
  /** store state の上書き */
  storeOverrides?: Partial<MockStoreState>;
  /** AuthMode 個別セレクタの上書き */
  authModeOverrides?: Partial<MockAuthModeSelectors>;
  /** electronAPI.apiKey.list の戻り値 */
  apiKeyListResult?: unknown;
  /** electronAPI.apiKey 全体の上書き */
  apiKeyOverrides?: Partial<MockElectronApiKey>;
}

// ============================================================
// デフォルト値
// ============================================================

/**
 * store state のデフォルト値を生成
 * AccountSection が使用する全18セレクタを含む
 */
export const createDefaultStoreState = (
  overrides: Partial<MockStoreState> = {},
): MockStoreState => ({
  // --- SettingsView / SettingsSlice ---
  apiKey: "",
  autoSyncEnabled: true,
  themeMode: "system",
  resolvedTheme: "system",
  userProfile: {
    name: "テストユーザー",
    email: "test@example.com",
    avatar: "",
    plan: "free",
  },
  setApiKey: vi.fn(),
  setAutoSyncEnabled: vi.fn(),
  setThemeMode: vi.fn().mockResolvedValue(undefined),
  setUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
  setResolvedTheme: vi.fn(),
  initializeTheme: vi.fn().mockResolvedValue(undefined),

  // --- AccountSection / AuthSlice - 17セレクタ ---
  isAuthenticated: false,
  isLoading: false,
  authUser: null,
  sessionExpiresAt: null,
  isRefreshing: false,
  profile: null,
  linkedProviders: [],
  isOffline: false,
  authError: null,
  login: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  initializeAuth: vi.fn().mockResolvedValue(undefined),
  refreshSession: vi.fn().mockResolvedValue(undefined),
  updateProfile: vi.fn().mockResolvedValue(undefined),
  fetchProfile: vi.fn().mockResolvedValue(undefined),
  fetchLinkedProviders: vi.fn().mockResolvedValue(undefined),
  linkProvider: vi.fn().mockResolvedValue(undefined),
  unlinkProvider: vi.fn().mockResolvedValue(undefined),
  uploadAvatar: vi.fn().mockResolvedValue(undefined),
  useProviderAvatar: vi.fn().mockResolvedValue(undefined),
  removeAvatar: vi.fn().mockResolvedValue(undefined),
  deleteAccount: vi.fn().mockResolvedValue(true),
  setAuthError: vi.fn(),
  clearAuth: vi.fn(),
  setDevModeAuth: vi.fn(),

  // --- AuthModeSlice ---
  mode: "subscription",
  status: null,
  error: null,
  isConfirmDialogOpen: false,
  pendingMode: null,
  fetchMode: vi.fn().mockResolvedValue(undefined),
  setMode: vi.fn().mockResolvedValue(undefined),
  fetchStatus: vi.fn().mockResolvedValue(undefined),
  validate: vi.fn().mockResolvedValue({
    mode: "subscription",
    isValid: true,
    hasCredentials: true,
    message: "OK",
    lastCheckedAt: Date.now(),
  }),
  openConfirmDialog: vi.fn(),
  closeConfirmDialog: vi.fn(),
  confirmModeChange: vi.fn().mockResolvedValue(undefined),
  clearError: vi.fn(),
  resetAuthMode: vi.fn(),
  initializeAuthMode: vi.fn().mockResolvedValue(undefined),

  ...overrides,
});

/**
 * AuthMode 個別セレクタのデフォルト値を生成
 */
export const createDefaultAuthModeSelectors = (
  overrides: Partial<MockAuthModeSelectors> = {},
): MockAuthModeSelectors => ({
  mode: "subscription",
  status: null,
  isLoading: false,
  setMode: vi.fn().mockResolvedValue(undefined),
  initializeAuthMode: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

/**
 * 正常な apiKey.list() レスポンス（4プロバイダー）
 */
export const createDefaultApiKeyListResult = () => ({
  success: true,
  data: {
    providers: [
      {
        provider: "openai",
        displayName: "OpenAI",
        status: "registered" as const,
        lastValidatedAt: "2026-03-01T00:00:00Z",
      },
      {
        provider: "anthropic",
        displayName: "Anthropic",
        status: "not_registered" as const,
        lastValidatedAt: null,
      },
      {
        provider: "google",
        displayName: "Google AI",
        status: "not_registered" as const,
        lastValidatedAt: null,
      },
      {
        provider: "xai",
        displayName: "xAI",
        status: "not_registered" as const,
        lastValidatedAt: null,
      },
    ],
  },
});

/**
 * electronAPI mock のデフォルト値を生成
 */
export const createDefaultElectronApiKey = (
  overrides: Partial<MockElectronApiKey> = {},
  listResult?: unknown,
): MockElectronApiKey => ({
  list: vi
    .fn()
    .mockResolvedValue(listResult ?? createDefaultApiKeyListResult()),
  save: vi.fn().mockResolvedValue({ success: true }),
  delete: vi.fn().mockResolvedValue({ success: true }),
  validate: vi.fn().mockResolvedValue({
    success: true,
    data: { status: "valid", errorMessage: null },
  }),
  ...overrides,
});

// ============================================================
// ハーネス本体
// ============================================================

/**
 * SettingsView 統合テスト用ハーネスを構築
 *
 * 使用方法:
 * 1. テストファイル冒頭で vi.mock("../../../store", ...) をハーネスの戻り値で設定
 * 2. electronAPI を window にセット
 * 3. renderSettingsView() で SettingsView をレンダー
 *
 * @returns store mock の設定に必要なオブジェクト群
 */
export function createSettingsHarness(options: HarnessOptions = {}) {
  const storeState = createDefaultStoreState(options.storeOverrides);
  const authModeSelectors = createDefaultAuthModeSelectors(
    options.authModeOverrides,
  );
  const electronApiKey = createDefaultElectronApiKey(
    options.apiKeyOverrides,
    options.apiKeyListResult,
  );

  return {
    storeState,
    authModeSelectors,
    electronApiKey,

    /**
     * vi.mock("../../../store", ...) に渡す factory 関数を生成
     */
    createStoreMockFactory: () => ({
      useAppStore: vi.fn((selector: (state: MockStoreState) => unknown) =>
        selector(storeState),
      ),
      // 個別セレクタ（P31対策）
      useAuthMode: vi.fn(() => authModeSelectors.mode),
      useAuthModeStatus: vi.fn(() => authModeSelectors.status),
      useAuthModeLoading: vi.fn(() => authModeSelectors.isLoading),
      useSetAuthMode: vi.fn(() => authModeSelectors.setMode),
      useInitializeAuthMode: vi.fn(() => authModeSelectors.initializeAuthMode),
      // 非推奨合成Hook（後方互換性）
      useAuthModeStore: vi.fn(() => ({
        mode: authModeSelectors.mode,
        status: authModeSelectors.status,
        isLoading: authModeSelectors.isLoading,
        setMode: authModeSelectors.setMode,
        initializeAuthMode: authModeSelectors.initializeAuthMode,
      })),
    }),

    /**
     * window.electronAPI を設定する
     * 既存の electronAPI プロパティを維持しつつ apiKey を上書き
     */
    setupElectronApi: () => {
      const existingApi =
        (window as unknown as { electronAPI?: Record<string, unknown> })
          .electronAPI || {};
      Object.defineProperty(window, "electronAPI", {
        value: {
          ...existingApi,
          apiKey: electronApiKey,
        },
        writable: true,
        configurable: true,
      });
    },

    /**
     * store state を更新する（テスト中の動的変更用）
     */
    updateStoreState: (updates: Partial<MockStoreState>) => {
      Object.assign(storeState, updates);
    },

    /**
     * AuthMode セレクタを更新する（テスト中の動的変更用）
     */
    updateAuthModeSelectors: (updates: Partial<MockAuthModeSelectors>) => {
      Object.assign(authModeSelectors, updates);
    },
  };
}
