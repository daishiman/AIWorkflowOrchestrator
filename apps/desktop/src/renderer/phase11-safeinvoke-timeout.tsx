import React from "react";
import ReactDOM from "react-dom/client";
import { SettingsView } from "./views/SettingsView";
import { useAppStore } from "./store";
import "./styles/globals.css";
import type { ElectronAPI } from "../preload/types";

type Phase11SafeInvokeTimeoutHarnessConfig = {
  themeMode?: "light" | "dark" | "system";
  resolvedTheme?: "light" | "dark";
};

declare global {
  interface Window {
    __PHASE11_SAFEINVOKE_TIMEOUT__?: Phase11SafeInvokeTimeoutHarnessConfig;
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function applyTheme(resolvedTheme: "light" | "dark"): void {
  document.documentElement.setAttribute("data-theme", resolvedTheme);
  document.documentElement.style.colorScheme =
    resolvedTheme === "light" ? "light" : "dark";
}

function ensureMockElectronAPI(
  config: Phase11SafeInvokeTimeoutHarnessConfig,
): void {
  const targetWindow = window as typeof window & {
    electronAPI?: ElectronAPI;
  };

  const themeMode = config.themeMode ?? "light";
  const resolvedTheme = config.resolvedTheme ?? "light";
  const currentIso = nowIso();

  const mockUser = {
    id: "phase11-safeinvoke-user",
    email: "phase11-safeinvoke@example.com",
    displayName: "Phase 11 Reviewer",
    avatarUrl: null,
    provider: "google",
    createdAt: currentIso,
    lastSignInAt: currentIso,
  };

  const mockElectronAPI = {
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
      onAuthStateChanged: () => () => {},
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
        data: { mode: themeMode, resolvedTheme },
      }),
      set: async ({ mode }: { mode: "light" | "dark" | "system" }) => ({
        success: true,
        data: {
          mode,
          resolvedTheme: mode === "system" ? resolvedTheme : mode,
        },
      }),
      getSystem: async () => ({
        success: true,
        data: {
          isDark: resolvedTheme === "dark",
          resolvedTheme,
        },
      }),
      onSystemChanged: () => () => {},
    },
    authMode: {
      get: async () => ({ success: true, data: { mode: "subscription" } }),
      set: async ({ mode }: { mode: string }) => ({
        success: true,
        data: { mode },
      }),
      status: async () => ({
        success: true,
        data: {
          mode: "subscription",
          isValid: true,
          hasCredentials: true,
          message: "safeInvoke 経由の認証モード取得が正常に完了しました",
          lastCheckedAt: Date.now(),
        },
      }),
      validate: async () => ({
        success: true,
        data: {
          mode: "subscription",
          isValid: true,
          hasCredentials: true,
          message: "認証モードは有効です",
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
            providerId: "google-safeinvoke-phase11",
            email: mockUser.email,
            displayName: mockUser.displayName,
            avatarUrl: null,
            linkedAt: currentIso,
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
              lastValidatedAt: currentIso,
            },
            {
              provider: "openai",
              displayName: "OpenAI",
              status: "not_configured",
              maskedKey: null,
              lastValidatedAt: null,
            },
          ],
        },
      }),
      save: async () => ({ success: true }),
      delete: async () => ({ success: true }),
      validate: async () => ({
        success: true,
        data: { status: "valid", message: "APIキーは有効です" },
      }),
    },
    dialog: {
      showOpenDialog: async () => ({ canceled: true, filePaths: [] }),
      showSaveDialog: async () => ({ canceled: true, filePath: undefined }),
    },
    system: {
      getVersion: async () => ({
        success: true,
        data: { version: "phase11-safeinvoke-timeout" },
      }),
    },
  } as unknown as ElectronAPI;

  targetWindow.electronAPI = mockElectronAPI;
}

function bootstrapHarness(): void {
  const config = window.__PHASE11_SAFEINVOKE_TIMEOUT__ ?? {};
  const themeMode = config.themeMode ?? "light";
  const resolvedTheme = config.resolvedTheme ?? "light";

  applyTheme(resolvedTheme);
  ensureMockElectronAPI(config);

  useAppStore.setState({
    currentView: "settings",
    isAuthenticated: true,
    isLoading: false,
    authUser: {
      id: "phase11-safeinvoke-user",
      email: "phase11-safeinvoke@example.com",
      displayName: "Phase 11 Reviewer",
      avatarUrl: null,
      provider: "google",
      createdAt: nowIso(),
      lastSignInAt: nowIso(),
    },
    profile: {
      id: "phase11-safeinvoke-user",
      email: "phase11-safeinvoke@example.com",
      displayName: "Phase 11 Reviewer",
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
    linkedProviders: ["google"],
    autoSyncEnabled: true,
    themeMode,
    resolvedTheme,
  } as never);
}

bootstrapHarness();

const Harness = (): JSX.Element => (
  <div
    className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]"
    data-testid="phase11-safeinvoke-timeout-shell"
  >
    <main className="min-h-screen p-6">
      <SettingsView />
    </main>
  </div>
);

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Phase 11 harness root element was not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Harness />
  </React.StrictMode>,
);
