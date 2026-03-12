import React from "react";
import ReactDOM from "react-dom/client";
import { WorkspaceSearchPanel } from "./components/organisms/WorkspaceSearch/WorkspaceSearchPanel";
import { useAppStore } from "./store";
import { DashboardView } from "./views/DashboardView";
import { AuthView } from "./views/AuthView";
import { SettingsView } from "./views/SettingsView";
import "./styles/globals.css";

type Surface = "settings" | "dashboard" | "auth" | "workspace-search";
type HarnessTheme = "light" | "dark";

type HarnessPayload = {
  surface?: Surface;
  theme?: HarnessTheme;
  dashboardNow?: string;
  storeState?: Partial<ReturnType<typeof useAppStore.getState>>;
  workspacePath?: string;
  initialShowReplace?: boolean;
};

declare global {
  interface Window {
    __PHASE11_LIGHT_THEME_CONTRAST_GUARD__?: HarnessPayload;
  }
}

const DEFAULT_THEME: HarnessTheme = "light";
const DEFAULT_SURFACE: Surface = "dashboard";
const DEFAULT_DASHBOARD_NOW = "2026-03-11T10:15:00+09:00";

function getQueryParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

function resolveTheme(payload?: HarnessPayload): HarnessTheme {
  if (payload?.theme === "light" || payload?.theme === "dark") {
    return payload.theme;
  }

  const queryTheme = getQueryParam("theme");
  return queryTheme === "dark" ? "dark" : DEFAULT_THEME;
}

function resolveSurface(payload?: HarnessPayload): Surface {
  if (
    payload?.surface === "settings" ||
    payload?.surface === "dashboard" ||
    payload?.surface === "auth" ||
    payload?.surface === "workspace-search"
  ) {
    return payload.surface;
  }

  const querySurface = getQueryParam("surface");
  switch (querySurface) {
    case "settings":
    case "dashboard":
    case "auth":
    case "workspace-search":
      return querySurface;
    default:
      return DEFAULT_SURFACE;
  }
}

function applyTheme(theme: HarnessTheme): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
}

function createBaseStoreState(
  theme: HarnessTheme,
): Partial<ReturnType<typeof useAppStore.getState>> {
  return {
    currentView: "dashboard",
    themeMode: theme,
    resolvedTheme: theme,
    autoSyncEnabled: true,
    dashboardStats: {
      totalDocs: 150,
      ragIndexed: 120,
      pending: 2,
      storageUsed: 650,
      storageTotal: 1000,
    },
    activityFeed: [
      {
        id: "1",
        message: "ライトテーマ監査のスクリーンショット導線を確認",
        time: "2026-03-11T09:58:00+09:00",
        type: "info",
      },
      {
        id: "2",
        message: "hardcoded color audit を実行",
        time: "2026-03-11T09:15:00+09:00",
        type: "success",
      },
    ],
    isLoading: false,
    authError: null,
    isAuthenticated: false,
    authUser: {
      displayName: "Phase11 User",
    } as never,
    profile: {
      name: "Phase11 User",
      email: "phase11@example.com",
      avatar: "",
      plan: "free",
      displayName: "Phase11 User",
    } as never,
    linkedProviders: [],
    mode: "subscription",
    status: {
      mode: "subscription",
      isValid: true,
      hasCredentials: true,
      message: "サブスクリプション認証は有効です",
      lastCheckedAt: Date.now(),
    },
  };
}

const payload = window.__PHASE11_LIGHT_THEME_CONTRAST_GUARD__;
const surface = resolveSurface(payload);
const theme = resolveTheme(payload);
const workspacePath = payload?.workspacePath ?? "/workspace/project";
const initialShowReplace = payload?.initialShowReplace ?? true;
const dashboardNow = new Date(payload?.dashboardNow ?? DEFAULT_DASHBOARD_NOW);

applyTheme(theme);
useAppStore.setState({
  ...createBaseStoreState(theme),
  ...payload?.storeState,
} as never);

function HarnessShell({
  children,
  shellTestId,
}: {
  children: React.ReactNode;
  shellTestId: string;
}): JSX.Element {
  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]"
      data-testid={shellTestId}
    >
      {children}
    </div>
  );
}

function WorkspaceSearchSurface(): JSX.Element {
  return (
    <HarnessShell shellTestId="phase11-light-theme-workspace-search-shell">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-6">
        <div className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-[var(--shadow-lg)]">
          <WorkspaceSearchPanel
            workspacePath={workspacePath}
            initialShowReplace={initialShowReplace}
          />
        </div>
      </main>
    </HarnessShell>
  );
}

function SettingsSurface(): JSX.Element {
  return (
    <HarnessShell shellTestId="phase11-light-theme-settings-shell">
      <main className="min-h-screen p-6">
        <SettingsView />
      </main>
    </HarnessShell>
  );
}

function DashboardSurface(): JSX.Element {
  return (
    <HarnessShell shellTestId="phase11-light-theme-dashboard-shell">
      <main className="min-h-screen">
        <DashboardView now={dashboardNow} />
      </main>
    </HarnessShell>
  );
}

function AuthSurface(): JSX.Element {
  return (
    <HarnessShell shellTestId="phase11-light-theme-auth-shell">
      <AuthView />
    </HarnessShell>
  );
}

function Phase11LightThemeContrastGuardHarness(): JSX.Element {
  switch (surface) {
    case "settings":
      return <SettingsSurface />;
    case "auth":
      return <AuthSurface />;
    case "workspace-search":
      return <WorkspaceSearchSurface />;
    case "dashboard":
    default:
      return <DashboardSurface />;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Phase11LightThemeContrastGuardHarness />,
);
