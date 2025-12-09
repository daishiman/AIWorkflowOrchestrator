import { StateCreator } from "zustand";
import type {
  AuthUser,
  AuthSession,
  OAuthProvider,
  UserProfile,
  LinkedProvider,
} from "../../../preload/types";

/**
 * 認証状態管理スライス
 */
export interface AuthSlice {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  authUser: AuthUser | null;
  session: AuthSession | null;
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
  setAuthError: (error: string | null) => void;
  clearAuth: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (
  set,
  get,
) => ({
  // Initial state
  isAuthenticated: false,
  isLoading: true,
  authUser: null,
  session: null,
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
        authError:
          error instanceof Error ? error.message : "ログインに失敗しました",
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
          session: null,
          isLoading: false,
        });
        return;
      }

      if (response.success && response.data) {
        set({
          isAuthenticated: true,
          authUser: response.data.user,
          session: response.data,
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
          session: null,
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
                  set({
                    isAuthenticated: true,
                    authUser: response.data.user,
                    session: response.data,
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
              set({
                isAuthenticated: true,
                authUser: state.user,
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
      console.error("[AuthSlice] Initialize auth error:", error);
      set({
        isLoading: false,
        authError:
          error instanceof Error ? error.message : "認証の初期化に失敗しました",
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
        set({
          session: response.data,
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
      console.error("[AuthSlice] Update profile error:", error);
      set({
        isLoading: false,
        authError:
          error instanceof Error
            ? error.message
            : "プロフィールの更新に失敗しました",
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
      console.error("[AuthSlice] Link provider error:", error);
      set({
        isLoading: false,
        authError:
          error instanceof Error
            ? error.message
            : "アカウント連携に失敗しました",
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
      session: null,
      profile: null,
      linkedProviders: [],
      authError: null,
    });
  },
});
