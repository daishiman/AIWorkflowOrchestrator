import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/globals.css";
import { Phase11AppDebugLocalstorageClearHarness } from "./Phase11AppDebugLocalstorageClearHarness";
import { useAppStore } from "./store";

const PERSIST_KEY = "knowledge-studio-store";

function nowIso(): string {
  return new Date().toISOString();
}

function buildDefaultPersistedState() {
  return {
    state: {
      currentView: "settings",
      selectedFile: null,
      expandedFolders: [],
      userProfile: null,
      autoSyncEnabled: false,
      windowSize: { width: 1440, height: 1600 },
      isNavExpanded: true,
      permissionHistory: [],
      notifications: [],
    },
    version: 0,
  };
}

function ensurePersistedSettingsState(): void {
  const fallback = buildDefaultPersistedState();
  const raw = window.localStorage.getItem(PERSIST_KEY);

  if (!raw) {
    window.localStorage.setItem(PERSIST_KEY, JSON.stringify(fallback));
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    const nextState = {
      ...parsed,
      state: {
        ...fallback.state,
        ...(parsed?.state ?? {}),
        currentView: "settings",
      },
    };
    window.localStorage.setItem(PERSIST_KEY, JSON.stringify(nextState));
  } catch {
    window.localStorage.setItem(PERSIST_KEY, JSON.stringify(fallback));
  }
}

function ensureMockElectronAPI(): void {
  const mockUser = {
    id: "phase11-user",
    email: "phase11@example.com",
    displayName: "Phase 11 Reviewer",
    avatarUrl: null,
    provider: "google",
    createdAt: nowIso(),
    lastSignInAt: nowIso(),
  };

  const targetWindow = window as typeof window & {
    electronAPI?: any;
  };

  const mockElectronAPI: any = {
    ...(targetWindow.electronAPI ?? {}),
    invoke: async () => ({ success: true }),
    auth: {
      checkOnline: async () => ({ success: true, data: { online: true } }),
      getSession: async () => ({
        success: true,
        data: {
          user: mockUser,
          expiresAt: Date.now() + 60 * 60 * 1000,
          isOffline: false,
        },
      }),
      onAuthStateChanged: (callback: any) => {
        setTimeout(() => {
          callback({ authenticated: true, user: mockUser, isOffline: false });
        }, 10);
        return () => {};
      },
      login: async () => ({ success: true }),
      logout: async () => ({ success: true }),
      refresh: async () => ({
        success: true,
        data: {
          user: mockUser,
          expiresAt: Date.now() + 60 * 60 * 1000,
          isOffline: false,
        },
      }),
    },
    theme: {
      get: async () => ({
        success: true,
        data: { mode: "dark", resolvedTheme: "dark" },
      }),
      set: async ({ mode }: { mode: string }) => ({
        success: true,
        data: {
          mode,
          resolvedTheme: mode === "system" ? "dark" : mode,
        },
      }),
      getSystem: async () => ({
        success: true,
        data: { isDark: true, resolvedTheme: "dark" },
      }),
      onSystemChanged: () => () => {},
    },
    authMode: {
      get: async () => ({ success: true, data: { mode: "subscription" } }),
      set: async () => ({ success: true }),
      status: async () => ({
        success: true,
        data: {
          mode: "subscription",
          isValid: true,
          hasCredentials: true,
          message: "Claude Code CLI の認証情報を使用できます",
          lastCheckedAt: Date.now(),
        },
      }),
      validate: async () => ({
        success: true,
        data: {
          mode: "subscription",
          isValid: true,
          hasCredentials: true,
          message: "Claude Code CLI の認証情報を使用できます",
          lastCheckedAt: Date.now(),
        },
      }),
      onModeChanged: () => () => {},
    },
    profile: {
      get: async () => ({
        success: true,
        data: {
          id: mockUser.id,
          email: mockUser.email,
          displayName: mockUser.displayName,
          avatarUrl: null,
          linkedProviders: ["google"],
          notificationSettings: {
            email: true,
            desktop: true,
            sound: true,
            workflowComplete: true,
            workflowError: true,
          },
        },
      }),
      getProviders: async () => ({
        success: true,
        data: [
          {
            provider: "google",
            providerId: "google-phase11",
            email: mockUser.email,
            displayName: mockUser.displayName,
            avatarUrl: null,
            linkedAt: nowIso(),
          },
        ],
      }),
      update: async ({ updates }: { updates?: { displayName?: string } }) => ({
        success: true,
        data: {
          id: mockUser.id,
          email: mockUser.email,
          displayName: updates?.displayName ?? mockUser.displayName,
          avatarUrl: null,
          linkedProviders: ["google"],
          notificationSettings: {
            email: true,
            desktop: true,
            sound: true,
            workflowComplete: true,
            workflowError: true,
          },
        },
      }),
      linkProvider: async () => ({ success: true }),
      unlinkProvider: async () => ({ success: true }),
      delete: async () => ({ success: true }),
    },
    apiKey: {
      list: async () => ({
        success: true,
        data: {
          providers: [
            {
              provider: "anthropic",
              displayName: "Anthropic",
              status: "registered",
              maskedKey: "sk-ant-***",
              lastValidatedAt: nowIso(),
            },
          ],
        },
      }),
      validate: async () => ({
        success: true,
        data: { status: "valid", message: "APIキーは有効です" },
      }),
      save: async () => ({ success: true }),
      delete: async () => ({ success: true }),
    },
    dialog: {
      showOpenDialog: async () => ({ canceled: true, filePaths: [] }),
      showSaveDialog: async () => ({ canceled: true, filePath: undefined }),
    },
    system: {
      getVersion: async () => ({
        success: true,
        data: { version: "phase11-harness" },
      }),
    },
  };

  targetWindow.electronAPI = mockElectronAPI;
}

function bootstrapHarness(): void {
  ensurePersistedSettingsState();
  ensureMockElectronAPI();

  useAppStore.setState({
    currentView: "settings",
    isAuthenticated: true,
    isLoading: false,
  } as any);
}

bootstrapHarness();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Phase11AppDebugLocalstorageClearHarness />
  </React.StrictMode>,
);
