import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import type { AuthModeStatus } from "@repo/shared/types/auth-mode";
import type { ElectronAPI } from "../preload/types";
import { SettingsView } from "./views/SettingsView";
import { AuthView } from "./views/AuthView";
import { WorkspaceSearchPanel } from "./components/organisms/WorkspaceSearch";
import { useAppStore } from "./store";
import "./styles/globals.css";

const PERSIST_KEY = "knowledge-studio-store";
const WORKSPACE_PATH = "/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator";

type HarnessSurface = "settings" | "auth" | "workspace";
type HarnessTheme = "light" | "dark";
type HarnessAuthMode = "subscription" | "api-key";
type HarnessAuthStatus = "valid" | "invalid";
type HarnessWorkspaceScenario = "success" | "error";

function getParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

function getSurface(): HarnessSurface {
  const surface = getParams().get("surface");
  switch (surface) {
    case "auth":
    case "workspace":
    case "settings":
      return surface;
    default:
      return "settings";
  }
}

function getTheme(): HarnessTheme {
  return getParams().get("theme") === "dark" ? "dark" : "light";
}

function getAuthMode(): HarnessAuthMode {
  return getParams().get("authMode") === "subscription"
    ? "subscription"
    : "api-key";
}

function getAuthStatus(): HarnessAuthStatus {
  return getParams().get("authStatus") === "invalid" ? "invalid" : "valid";
}

function getWorkspaceScenario(): HarnessWorkspaceScenario {
  return getParams().get("workspaceScenario") === "error" ? "error" : "success";
}

function getAuthErrorEnabled(): boolean {
  return getParams().get("authError") === "1";
}

function nowIso(): string {
  return new Date("2026-03-12T12:00:00+09:00").toISOString();
}

function applyTheme(theme: HarnessTheme): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
}

function clearPersistedState(): void {
  window.localStorage.removeItem(PERSIST_KEY);
}

function createAuthModeStatus(
  mode: HarnessAuthMode,
  status: HarnessAuthStatus,
): AuthModeStatus {
  if (status === "invalid") {
    return {
      mode,
      isValid: false,
      hasCredentials: mode === "api-key",
      message:
        mode === "api-key"
          ? "APIキーは登録済みですが、再検証が必要です"
          : "Claude Code CLI の認証状態を確認してください",
      errorCode:
        mode === "api-key"
          ? "auth-mode/no-api-key"
          : "auth-mode/no-subscription-token",
      guidance:
        mode === "api-key"
          ? "キー検証を再実行してから利用してください"
          : "CLI で再ログイン後にステータスを更新してください",
      lastCheckedAt: Date.now(),
    };
  }

  return {
    mode,
    isValid: true,
    hasCredentials: true,
    message:
      mode === "api-key"
        ? "Anthropic APIキーを利用できます"
        : "Claude Code CLI の認証情報を利用できます",
    guidance:
      mode === "api-key"
        ? "保存済みキーが secure storage から読み込まれています"
        : "サブスクリプション認証が有効です",
    lastCheckedAt: Date.now(),
  };
}

function ensureMockElectronApi(
  authMode: HarnessAuthMode,
  workspaceScenario: HarnessWorkspaceScenario,
): void {
  const currentIso = nowIso();
  const targetWindow = window as typeof window & {
    electronAPI?: ElectronAPI;
  };

  targetWindow.electronAPI = {
    ...(targetWindow.electronAPI ?? {}),
    invoke: async <T,>(channel: string) => {
      let response: unknown;

      if (channel === "search:workspace:execute") {
        if (workspaceScenario === "error") {
          response = {
            success: false,
            error: "検索インデックスの取得に失敗しました",
          };
          return response as T;
        }

        response = {
          success: true,
          data: {
            matches: [
              {
                filePath: `${WORKSPACE_PATH}/apps/desktop/src/renderer/views/SettingsView/index.tsx`,
                line: 123,
                column: 24,
                length: 10,
                text: "authModeStatus.message",
              },
              {
                filePath: `${WORKSPACE_PATH}/apps/desktop/src/renderer/components/settings/AuthModeSelector/index.tsx`,
                line: 142,
                column: 13,
                length: 7,
                text: "APIキーを使用して認証します",
              },
            ],
            totalCount: 2,
            fileCount: 2,
          },
        };
        return response as T;
      }

      if (channel === "replace:workspace:all") {
        response = {
          success: true,
          data: {
            replacedCount: 2,
            fileCount: 2,
            updatedFiles: [],
          },
        };
        return response as T;
      }

      response = { success: true, data: {} };
      return response as T;
    },
    authKey: {
      exists: async () => ({
        exists: authMode === "api-key",
        source: authMode === "api-key" ? "saved" : "env-fallback",
      }),
      set: async () => ({ success: true }),
      validate: async () => ({ valid: true }),
      delete: async () => ({ success: true }),
    },
    apiKey: {
      list: async () => ({
        success: true,
        data: {
          providers: [
            {
              provider: "openai",
              displayName: "OpenAI",
              status: "registered",
              lastValidatedAt: currentIso,
            },
            {
              provider: "anthropic",
              displayName: "Anthropic",
              status: "registered",
              lastValidatedAt: currentIso,
            },
            {
              provider: "google",
              displayName: "Google AI",
              status: "not_registered",
              lastValidatedAt: null,
            },
            {
              provider: "xai",
              displayName: "xAI",
              status: "not_registered",
              lastValidatedAt: null,
            },
          ],
        },
      }),
      validate: async () => ({
        success: true,
        data: {
          provider: "anthropic",
          status: "valid",
          validatedAt: currentIso,
        },
      }),
      save: async () => ({
        success: true,
        data: {
          provider: "anthropic",
          savedAt: currentIso,
        },
      }),
      delete: async () => ({ success: true }),
    },
  } as ElectronAPI;
}

function bootstrapStore(
  surface: HarnessSurface,
  theme: HarnessTheme,
  authMode: HarnessAuthMode,
  authStatus: HarnessAuthStatus,
  authErrorEnabled: boolean,
): void {
  const currentIso = nowIso();

  const setAuthError = (error: string | null): void => {
    useAppStore.setState({ authError: error } as never);
  };

  const setThemeMode = async (
    nextMode: "kanagawa-dragon" | HarnessTheme | "system",
  ): Promise<void> => {
    const resolvedTheme = nextMode === "dark" ? "dark" : "light";
    applyTheme(resolvedTheme);
    useAppStore.setState({
      themeMode: nextMode,
      resolvedTheme,
    } as never);
  };

  const setAuthMode = async (nextMode: HarnessAuthMode): Promise<void> => {
    useAppStore.setState({
      mode: nextMode,
      status: createAuthModeStatus(nextMode, authStatus),
    } as never);
  };

  useAppStore.setState({
    currentView: surface === "settings" ? "settings" : "dashboard",
    autoSyncEnabled: true,
    setAutoSyncEnabled: (checked: boolean) =>
      useAppStore.setState({ autoSyncEnabled: checked } as never),
    themeMode: theme,
    resolvedTheme: theme,
    setThemeMode,
    setResolvedTheme: (resolvedTheme: HarnessTheme) =>
      applyTheme(resolvedTheme),
    initializeTheme: async () => undefined,
    userProfile: {
      name: "Phase 11 Reviewer",
      email: "phase11@example.com",
      avatar: "",
      plan: "pro",
    },
    setApiKey: () => undefined,
    setUserProfile: () => undefined,
    updateUserProfile: () => undefined,
    isAuthenticated: surface !== "auth",
    isLoading: false,
    authUser:
      surface === "auth"
        ? null
        : {
            id: "phase11-user",
            email: "phase11@example.com",
            displayName: "Phase 11 Reviewer",
            avatarUrl: null,
            provider: "google",
            createdAt: currentIso,
            lastSignInAt: currentIso,
          },
    sessionExpiresAt: Date.now() + 60 * 60 * 1000,
    isRefreshing: false,
    profile:
      surface === "auth"
        ? null
        : {
            id: "phase11-user",
            displayName: "Phase 11 Reviewer",
            email: "phase11@example.com",
            avatarUrl: null,
            plan: "pro",
            createdAt: currentIso,
            updatedAt: currentIso,
            notificationSettings: {
              email: true,
              desktop: true,
              sound: true,
              workflowComplete: true,
              workflowError: true,
            },
          },
    linkedProviders:
      surface === "auth"
        ? []
        : [
            {
              provider: "google",
              providerId: "google-phase11",
              email: "phase11@example.com",
              displayName: "Phase 11 Reviewer",
              avatarUrl: null,
              linkedAt: currentIso,
            },
            {
              provider: "github",
              providerId: "github-phase11",
              email: "phase11@example.com",
              displayName: "phase11-reviewer",
              avatarUrl: null,
              linkedAt: currentIso,
            },
          ],
    isOffline: false,
    authError: authErrorEnabled
      ? "認証に失敗しました。時間をおいて再試行してください。"
      : null,
    login: async () => undefined,
    logout: async () => undefined,
    initializeAuth: async () => undefined,
    refreshSession: async () => undefined,
    updateProfile: async () => undefined,
    fetchProfile: async () => undefined,
    fetchLinkedProviders: async () => undefined,
    linkProvider: async () => undefined,
    unlinkProvider: async () => undefined,
    uploadAvatar: async () => undefined,
    useProviderAvatar: async () => undefined,
    removeAvatar: async () => undefined,
    deleteAccount: async () => true,
    setAuthError,
    clearAuth: () => undefined,
    setDevModeAuth: () => undefined,
    mode: authMode,
    status: createAuthModeStatus(authMode, authStatus),
    error: null,
    pendingMode: null,
    isConfirmDialogOpen: false,
    fetchMode: async () => undefined,
    setMode: setAuthMode,
    fetchStatus: async () => undefined,
    validate: async () => createAuthModeStatus(authMode, authStatus),
    openConfirmDialog: () => undefined,
    closeConfirmDialog: () => undefined,
    confirmModeChange: async () => undefined,
    clearError: () => undefined,
    resetAuthMode: () => undefined,
    initializeAuthMode: async () => undefined,
  } as never);
}

function SurfaceShell({
  title,
  children,
  testId,
}: {
  title: string;
  children: React.ReactNode;
  testId: string;
}): JSX.Element {
  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]"
      data-testid={testId}
    >
      <main className="mx-auto min-h-screen max-w-[1440px] p-6">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
            Phase 11 Harness
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
            {title}
          </h1>
        </div>
        {children}
      </main>
    </div>
  );
}

function WorkspaceSearchAutoRunner({
  scenario,
}: {
  scenario: HarnessWorkspaceScenario;
}): JSX.Element {
  useEffect(() => {
    const seedSearch = (): void => {
      const input = document.querySelector(
        "[data-testid='search-input']",
      ) as HTMLInputElement | null;

      if (!input) {
        window.setTimeout(seedSearch, 50);
        return;
      }

      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;

      nativeSetter?.call(input, scenario === "error" ? "auth mode" : "APIキー");
      input.dispatchEvent(new Event("input", { bubbles: true }));

      window.setTimeout(() => {
        input.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Enter",
            code: "Enter",
            bubbles: true,
          }),
        );
      }, 80);
    };

    const timer = window.setTimeout(seedSearch, 120);
    return () => window.clearTimeout(timer);
  }, [scenario]);

  return (
    <div
      className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4 shadow-[var(--shadow-lg)]"
      data-testid="phase11-workspace-surface"
    >
      <WorkspaceSearchPanel
        workspacePath={WORKSPACE_PATH}
        className="min-h-[520px]"
      />
    </div>
  );
}

function HarnessApp(): JSX.Element {
  const surface = getSurface();
  const workspaceScenario = getWorkspaceScenario();

  if (surface === "auth") {
    return (
      <div data-testid="phase11-auth-surface">
        <AuthView />
      </div>
    );
  }

  if (surface === "workspace") {
    return (
      <SurfaceShell
        title={`Workspace Search ${workspaceScenario === "error" ? "Error" : "Results"}`}
        testId="phase11-workspace-shell"
      >
        <WorkspaceSearchAutoRunner scenario={workspaceScenario} />
      </SurfaceShell>
    );
  }

  return (
    <SurfaceShell
      title="Settings Light Theme Migration"
      testId="phase11-light-theme-settings"
    >
      <SettingsView />
    </SurfaceShell>
  );
}

clearPersistedState();

const theme = getTheme();
const surface = getSurface();
const authMode = getAuthMode();
const authStatus = getAuthStatus();
const workspaceScenario = getWorkspaceScenario();
const authErrorEnabled = getAuthErrorEnabled();

applyTheme(theme);
ensureMockElectronApi(authMode, workspaceScenario);
bootstrapStore(surface, theme, authMode, authStatus, authErrorEnabled);

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Phase 11 light theme harness root element was not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <HarnessApp />
  </React.StrictMode>,
);
