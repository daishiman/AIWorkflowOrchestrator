import { StateCreator } from "zustand";
import type {
  AuthUser,
  OAuthProvider,
  UserProfile,
  LinkedProvider,
} from "../../../preload/types";
import { hasExpiresAt } from "../../components/AuthGuard/types";
import type { AuthErrorCode } from "../../components/AuthGuard/types";

// ============================================================
// エラーハンドリングユーティリティ
// ============================================================

/**
 * エラーコードから日本語メッセージへのマッピング
 */
const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  NETWORK_ERROR: "ネットワーク接続を確認してください",
  AUTH_FAILED: "認証に失敗しました。再度ログインしてください",
  TIMEOUT: "接続がタイムアウトしました。再試行してください",
  SESSION_EXPIRED: "セッションの有効期限が切れました。再度ログインしてください",
  PROVIDER_ERROR: "認証プロバイダーとの接続に失敗しました",
  PROFILE_UPDATE_FAILED: "プロフィールの更新に失敗しました",
  LINK_PROVIDER_FAILED: "アカウント連携に失敗しました",
  DATABASE_ERROR:
    "データベースエラーが発生しました。しばらく時間をおいて再試行してください",
  UNKNOWN: "予期しないエラーが発生しました",
};

/**
 * エラーメッセージからエラーコードを判定する
 *
 * @param message - エラーメッセージ
 * @returns 判定されたAuthErrorCode
 */
const detectErrorCode = (message: string): AuthErrorCode => {
  const lowerMessage = message.toLowerCase();

  // データベース/スキーマエラーの検出
  if (
    lowerMessage.includes("database") ||
    lowerMessage.includes("schema") ||
    lowerMessage.includes("table") ||
    lowerMessage.includes("relation") ||
    lowerMessage.includes("column") ||
    lowerMessage.includes("constraint") ||
    lowerMessage.includes("sql")
  ) {
    return "DATABASE_ERROR";
  }

  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("fetch") ||
    lowerMessage.includes("connection") ||
    lowerMessage.includes("offline")
  ) {
    return "NETWORK_ERROR";
  }

  if (
    lowerMessage.includes("unauthorized") ||
    lowerMessage.includes("401") ||
    lowerMessage.includes("authentication") ||
    lowerMessage.includes("invalid")
  ) {
    return "AUTH_FAILED";
  }

  if (lowerMessage.includes("timeout") || lowerMessage.includes("etimedout")) {
    return "TIMEOUT";
  }

  if (lowerMessage.includes("expired") || lowerMessage.includes("session")) {
    return "SESSION_EXPIRED";
  }

  if (lowerMessage.includes("provider") || lowerMessage.includes("oauth")) {
    return "PROVIDER_ERROR";
  }

  return "UNKNOWN";
};

/**
 * 認証エラーを日本語メッセージに変換する
 *
 * @param error - キャッチされたエラー（unknown型）
 * @param fallbackCode - Errorインスタンスでない場合のフォールバックコード
 * @returns ユーザー向け日本語エラーメッセージ
 */
const handleAuthError = (
  error: unknown,
  fallbackCode: AuthErrorCode = "UNKNOWN",
): string => {
  if (!(error instanceof Error)) {
    console.warn("[AuthError] Non-Error object caught:", error);
    return AUTH_ERROR_MESSAGES[fallbackCode];
  }

  const errorCode = detectErrorCode(error.message);
  console.error(`[AuthError] ${errorCode}:`, error.message);

  return AUTH_ERROR_MESSAGES[errorCode];
};

// ============================================================
// AuthSlice定義
// ============================================================

/**
 * 認証状態管理スライス
 *
 * セキュリティ対策として、トークン情報は状態に保存しない。
 * トークンはMain Processのみで管理し、Rendererには最小限の状態のみを渡す。
 *
 * @see docs/30-workflows/login-only-auth/design-auth-state.md
 */
export interface AuthSlice {
  // State (トークンなし - セキュリティ対策)
  isAuthenticated: boolean;
  isLoading: boolean;
  authUser: AuthUser | null;
  /** セッション有効期限 (Unix timestamp) - トークンは含まない */
  sessionExpiresAt: number | null;
  profile: UserProfile | null;
  linkedProviders: LinkedProvider[];
  isOffline: boolean;
  authError: string | null;

  // Actions
  login: (provider: OAuthProvider) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (updates: {
    displayName?: string;
    avatarUrl?: string | null;
  }) => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchLinkedProviders: () => Promise<void>;
  linkProvider: (provider: OAuthProvider) => Promise<void>;
  unlinkProvider: (provider: OAuthProvider) => Promise<void>;
  uploadAvatar: () => Promise<void>;
  useProviderAvatar: (provider: OAuthProvider) => Promise<void>;
  removeAvatar: () => Promise<void>;
  setAuthError: (error: string | null) => void;
  clearAuth: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (
  set,
  get,
) => ({
  // Initial state (トークンなし - セキュリティ対策)
  isAuthenticated: false,
  isLoading: true,
  authUser: null,
  sessionExpiresAt: null, // トークンは含まない、有効期限のみ
  profile: null,
  linkedProviders: [],
  isOffline: false,
  authError: null,

  // Actions
  login: async (provider: OAuthProvider) => {
    set({ isLoading: true, authError: null });

    try {
      // Guard: Skip IPC if electronAPI is not available
      if (!window.electronAPI?.auth?.login) {
        console.warn("[AuthSlice] auth.login not available");
        set({ isLoading: false });
        return;
      }

      const response = await window.electronAPI.auth.login({ provider });

      if (!response.success) {
        set({
          isLoading: false,
          authError: response.error?.message ?? "ログインに失敗しました",
        });
        return;
      }

      // Login initiated - wait for callback via onAuthStateChanged
      // The actual auth state will be updated via the listener
    } catch (error) {
      console.error("[AuthSlice] Login error:", error);
      set({
        isLoading: false,
        authError: handleAuthError(error),
      });
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      if (!window.electronAPI?.auth?.logout) {
        console.warn("[AuthSlice] auth.logout not available");
        get().clearAuth();
        return;
      }

      const response = await window.electronAPI.auth.logout();

      if (!response.success) {
        console.error("[AuthSlice] Logout failed:", response.error);
      }

      // Clear local state regardless of IPC result
      get().clearAuth();
    } catch (error) {
      console.error("[AuthSlice] Logout error:", error);
      set({ authError: handleAuthError(error) });
      get().clearAuth();
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true });

    try {
      // Guard: Skip IPC if electronAPI is not available
      if (!window.electronAPI?.auth?.getSession) {
        console.warn("[AuthSlice] auth.getSession not available");
        set({ isLoading: false });
        return;
      }

      // Check online status
      let isOffline = false;
      try {
        const onlineResponse = await window.electronAPI.auth.checkOnline();
        isOffline = !(onlineResponse.data?.online ?? true);
        set({ isOffline });
      } catch {
        // IPC not implemented yet - continue without online check
        console.warn("[AuthSlice] checkOnline not implemented");
      }

      // Get session
      let response;
      try {
        response = await window.electronAPI.auth.getSession();
      } catch {
        // IPC not implemented yet - treat as not authenticated
        console.warn("[AuthSlice] getSession not implemented");
        set({
          isAuthenticated: false,
          authUser: null,
          sessionExpiresAt: null,
          isLoading: false,
        });
        return;
      }

      if (response.success && response.data) {
        // トークンは保存しない - 有効期限のみ
        set({
          isAuthenticated: true,
          authUser: response.data.user,
          sessionExpiresAt: response.data.expiresAt ?? null,
          isOffline: response.data.isOffline,
          isLoading: false,
        });

        // Fetch profile in background
        get().fetchProfile();
        get().fetchLinkedProviders();
      } else {
        set({
          isAuthenticated: false,
          authUser: null,
          sessionExpiresAt: null,
          isLoading: false,
        });
      }

      // Subscribe to auth state changes
      if (window.electronAPI.auth.onAuthStateChanged) {
        window.electronAPI.auth.onAuthStateChanged(async (state) => {
          console.log("[AuthSlice] Auth state changed:", state);

          if (state.authenticated) {
            // If tokens are provided (from OAuth callback), refresh session
            if (state.tokens) {
              console.log("[AuthSlice] Tokens received, refreshing session...");
              set({ isLoading: true });

              // Wait a moment for main process to process tokens
              await new Promise((resolve) => setTimeout(resolve, 500));

              // Fetch the session which will now include user data
              try {
                const response = await window.electronAPI.auth.getSession();
                if (response.success && response.data) {
                  // トークンは保存しない - 有効期限のみ
                  set({
                    isAuthenticated: true,
                    authUser: response.data.user,
                    sessionExpiresAt: response.data.expiresAt ?? null,
                    isOffline: response.data.isOffline,
                    isLoading: false,
                  });
                  // Fetch profile after successful auth
                  get().fetchProfile();
                  get().fetchLinkedProviders();
                  console.log(
                    "[AuthSlice] Session restored after OAuth callback",
                  );
                } else {
                  console.error(
                    "[AuthSlice] Failed to get session after callback",
                  );
                  set({ isLoading: false });
                }
              } catch (error) {
                console.error("[AuthSlice] Error getting session:", error);
                set({ isLoading: false });
              }
            } else if (state.user) {
              // Direct user update (from existing session)
              // トークンは保存しない - 有効期限はイベントに含まれていればそれを使用、なければ既存値を維持
              const eventExpiresAt = hasExpiresAt(state)
                ? state.expiresAt
                : undefined;
              set({
                isAuthenticated: true,
                authUser: state.user,
                // イベントにexpiresAtがあれば更新、なければ既存値を維持
                sessionExpiresAt: eventExpiresAt ?? get().sessionExpiresAt,
                isOffline: state.isOffline ?? false,
                isLoading: false,
              });
              // Refresh profile after auth state change
              get().fetchProfile();
            }
          } else {
            get().clearAuth();
          }
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        authError: handleAuthError(error),
      });
    }
  },

  refreshSession: async () => {
    try {
      if (!window.electronAPI?.auth?.refresh) {
        return;
      }

      const response = await window.electronAPI.auth.refresh();

      if (response.success && response.data) {
        // トークンは保存しない - 有効期限のみ
        set({
          sessionExpiresAt: response.data.expiresAt ?? null,
          authUser: response.data.user,
          isOffline: response.data.isOffline,
        });
      } else {
        // Refresh failed - logout
        get().clearAuth();
      }
    } catch (error) {
      console.error("[AuthSlice] Refresh session error:", error);
    }
  },

  fetchProfile: async () => {
    try {
      if (!window.electronAPI?.profile?.get) {
        return;
      }

      const response = await window.electronAPI.profile.get();

      if (response.success && response.data) {
        set({ profile: response.data });
      }
    } catch (error) {
      console.error("[AuthSlice] Fetch profile error:", error);
    }
  },

  updateProfile: async (updates) => {
    set({ isLoading: true });

    try {
      if (!window.electronAPI?.profile?.update) {
        set({ isLoading: false });
        return;
      }

      const response = await window.electronAPI.profile.update({ updates });

      if (response.success && response.data) {
        set({
          profile: response.data,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          authError:
            response.error?.message ?? "プロフィールの更新に失敗しました",
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        authError: handleAuthError(error, "PROFILE_UPDATE_FAILED"),
      });
    }
  },

  fetchLinkedProviders: async () => {
    try {
      if (!window.electronAPI?.profile?.getProviders) {
        return;
      }

      const response = await window.electronAPI.profile.getProviders();

      if (response.success && response.data) {
        set({ linkedProviders: response.data });
      }
    } catch (error) {
      console.error("[AuthSlice] Fetch linked providers error:", error);
    }
  },

  linkProvider: async (provider: OAuthProvider) => {
    set({ isLoading: true, authError: null });

    try {
      if (!window.electronAPI?.profile?.linkProvider) {
        set({ isLoading: false });
        return;
      }

      const response = await window.electronAPI.profile.linkProvider({
        provider,
      });

      if (response.success && response.data) {
        set((state) => ({
          linkedProviders: [...state.linkedProviders, response.data!],
          isLoading: false,
        }));
      } else {
        set({
          isLoading: false,
          authError: response.error?.message ?? "アカウント連携に失敗しました",
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        authError: handleAuthError(error, "LINK_PROVIDER_FAILED"),
      });
    }
  },

  unlinkProvider: async (provider: OAuthProvider) => {
    const { linkedProviders } = get();

    // 最後のプロバイダーは連携解除できない
    if (linkedProviders.length <= 1) {
      set({
        authError: "最後の認証プロバイダーは解除できません",
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true, authError: null });

    try {
      if (!window.electronAPI?.profile?.unlinkProvider) {
        set({ isLoading: false });
        return;
      }

      const response = await window.electronAPI.profile.unlinkProvider({
        provider,
      });

      if (response.success) {
        set((state) => ({
          linkedProviders: state.linkedProviders.filter(
            (p) => p.provider !== provider,
          ),
          isLoading: false,
        }));
        // 成功後に最新のプロバイダー情報を再取得してUIを確実に更新
        get().fetchLinkedProviders();
      } else {
        set({
          isLoading: false,
          authError: response.error?.message ?? "連携解除に失敗しました",
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        authError: handleAuthError(error, "LINK_PROVIDER_FAILED"),
      });
    }
  },

  uploadAvatar: async () => {
    set({ isLoading: true, authError: null });

    try {
      if (!window.electronAPI?.avatar?.upload) {
        set({ isLoading: false });
        return;
      }

      const response = await window.electronAPI.avatar.upload();

      if (response.success && response.data) {
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, avatarUrl: response.data!.avatarUrl }
            : null,
          isLoading: false,
        }));
      } else {
        set({
          isLoading: false,
          authError:
            response.error?.message ?? "アバターのアップロードに失敗しました",
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        authError: handleAuthError(error, "PROFILE_UPDATE_FAILED"),
      });
    }
  },

  useProviderAvatar: async (provider: OAuthProvider) => {
    const { linkedProviders } = get();

    // 連携していないプロバイダーは使用できない
    const linkedProvider = linkedProviders.find((p) => p.provider === provider);
    if (!linkedProvider) {
      set({
        authError: `${provider}は連携されていません`,
      });
      return;
    }

    set({ isLoading: true, authError: null });

    try {
      if (!window.electronAPI?.avatar?.useProvider) {
        set({ isLoading: false });
        return;
      }

      const response = await window.electronAPI.avatar.useProvider({
        provider,
      });

      if (response.success && response.data) {
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, avatarUrl: response.data!.avatarUrl }
            : null,
          isLoading: false,
        }));
      } else {
        set({
          isLoading: false,
          authError:
            response.error?.message ??
            "プロバイダーアバターの設定に失敗しました",
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        authError: handleAuthError(error, "PROFILE_UPDATE_FAILED"),
      });
    }
  },

  removeAvatar: async () => {
    set({ isLoading: true, authError: null });

    try {
      if (!window.electronAPI?.avatar?.remove) {
        set({ isLoading: false });
        return;
      }

      const response = await window.electronAPI.avatar.remove();

      if (response.success) {
        set((state) => ({
          profile: state.profile ? { ...state.profile, avatarUrl: null } : null,
          isLoading: false,
        }));
      } else {
        set({
          isLoading: false,
          authError: response.error?.message ?? "アバターの削除に失敗しました",
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        authError: handleAuthError(error, "PROFILE_UPDATE_FAILED"),
      });
    }
  },

  setAuthError: (error: string | null) => {
    set({ authError: error });
  },

  clearAuth: () => {
    set({
      isAuthenticated: false,
      isLoading: false,
      authUser: null,
      sessionExpiresAt: null, // トークンは含まない
      profile: null,
      linkedProviders: [],
      authError: null,
    });
  },
});
