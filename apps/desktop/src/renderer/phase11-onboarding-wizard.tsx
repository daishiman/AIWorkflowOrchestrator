import React from "react";
import ReactDOM from "react-dom/client";
import type { ImportedSkill, SkillMetadata } from "@repo/shared";
import type { AuthMode, AuthModeStatus } from "@repo/shared/types/auth-mode";
import { DashboardView } from "./views/DashboardView";
import { SettingsView } from "./views/SettingsView";
import { useAppStore } from "./store";
import type { ThemeMode, ViewType } from "./store/types";
import {
  ONBOARDING_COMPLETED_KEY,
  OnboardingGate,
} from "./views/DashboardView/components/onboarding/OnboardingGate";
import "./styles/globals.css";

type HarnessSurface = "dashboard" | "settings";
type HarnessTheme = Exclude<ThemeMode, "system">;

type ElectronStoreResponse = {
  success: boolean;
  data?: unknown;
  error?: { message: string } | string;
};

const PERSIST_KEY = "knowledge-studio-store";

function toHarnessSkillName(value: string): SkillMetadata["name"] {
  return value as SkillMetadata["name"];
}

const CURATED_SKILLS: SkillMetadata[] = [
  {
    name: toHarnessSkillName("aiworkflow-requirements"),
    description: "仕様の正本を素早く参照し、実装との差分を確認します。",
    path: "/mock/aiworkflow-requirements",
    updatedAt: new Date("2026-03-12T12:00:00+09:00"),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  },
  {
    name: toHarnessSkillName("task-specification-creator"),
    description: "着手前にフェーズと責務を分解して設計を固めます。",
    path: "/mock/task-specification-creator",
    updatedAt: new Date("2026-03-12T12:05:00+09:00"),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  },
  {
    name: toHarnessSkillName("github-issue-manager"),
    description: "Issue とローカル仕様書の同期を取りながら実装を進めます。",
    path: "/mock/github-issue-manager",
    updatedAt: new Date("2026-03-12T12:10:00+09:00"),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  },
];

const API_KEY_LIST_RESULT = {
  success: true,
  data: {
    providers: [
      {
        provider: "openai",
        displayName: "OpenAI",
        status: "registered" as const,
        lastValidatedAt: "2026-03-12T11:00:00+09:00",
      },
      {
        provider: "anthropic",
        displayName: "Anthropic",
        status: "registered" as const,
        lastValidatedAt: "2026-03-12T11:02:00+09:00",
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
};

const DASHBOARD_STATS = {
  totalDocs: 28,
  ragIndexed: 21,
  pending: 3,
  storageUsed: 512,
  storageTotal: 1024,
};

const ACTIVITY_FEED = [
  {
    id: "phase11-activity-1",
    message: "オンボーディング導線の視認性をレビュー",
    time: "2026-03-12T10:15:00+09:00",
    type: "info" as const,
  },
  {
    id: "phase11-activity-2",
    message: "スキル追加フローのコピーを調整",
    time: "2026-03-12T09:40:00+09:00",
    type: "success" as const,
  },
  {
    id: "phase11-activity-3",
    message: "テーマ選択ステップを再確認",
    time: "2026-03-12T09:05:00+09:00",
    type: "warning" as const,
  },
];

function parseEnum<T extends string>(
  searchParams: URLSearchParams,
  key: string,
  allowed: readonly T[],
  fallback: T,
): T {
  const raw = searchParams.get(key);
  return raw && allowed.includes(raw as T) ? (raw as T) : fallback;
}

function readHarnessConfig() {
  const searchParams = new URLSearchParams(window.location.search);
  const surface = parseEnum(
    searchParams,
    "surface",
    ["dashboard", "settings"],
    "dashboard",
  );
  const theme = parseEnum(
    searchParams,
    "theme",
    ["light", "dark", "kanagawa-dragon"],
    "light",
  );
  const completed = searchParams.get("completed") === "true";

  return {
    surface,
    theme,
    completed,
  };
}

function applyTheme(theme: HarnessTheme): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme =
    theme === "light" ? "light" : "dark";
}

function createImportedSkill(skill: SkillMetadata): ImportedSkill {
  return {
    ...skill,
    importedAt: new Date("2026-03-12T12:20:00+09:00"),
    status: "active",
  };
}

function createAuthModeStatus(mode: AuthMode): AuthModeStatus {
  return {
    mode,
    isValid: true,
    hasCredentials: true,
    message:
      mode === "subscription"
        ? "サブスクリプション認証が有効です"
        : "APIキー認証が有効です",
    lastCheckedAt: Date.now(),
  };
}

function bootstrapStore(surface: HarnessSurface, theme: HarnessTheme): void {
  useAppStore.setState({
    currentView: surface,
    dashboardStats: DASHBOARD_STATS,
    activityFeed: ACTIVITY_FEED,
    themeMode: theme,
    resolvedTheme: theme,
    userProfile: {
      name: "ユーザー",
      email: "phase11@example.com",
      avatar: "",
      plan: "pro",
    },
    availableSkillsMetadata: CURATED_SKILLS,
    importedSkills: [],
    isLoadingSkills: false,
    skillError: null,
    profile: {
      id: "phase11-profile",
      displayName: "Phase 11 Reviewer",
      email: "phase11@example.com",
      avatarUrl: null,
      plan: "pro",
      createdAt: "2026-03-01T08:00:00+09:00",
      updatedAt: "2026-03-12T08:45:00+09:00",
    },
    authUser: {
      id: "phase11-user",
      email: "phase11@example.com",
      displayName: "Phase 11 Reviewer",
      avatarUrl: null,
      provider: "google",
      createdAt: "2026-03-01T08:00:00+09:00",
      lastSignInAt: "2026-03-12T08:45:00+09:00",
    },
    isAuthenticated: true,
    linkedProviders: [
      {
        provider: "google",
        providerId: "google-phase11",
        email: "phase11@example.com",
        displayName: "Phase 11 Reviewer",
        avatarUrl: null,
        linkedAt: "2026-03-01T08:10:00+09:00",
      },
    ],
    mode: "subscription",
    status: createAuthModeStatus("subscription"),
    error: null,
    isConfirmDialogOpen: false,
    pendingMode: null,
    fetchSkills: async () => {
      useAppStore.setState({
        availableSkillsMetadata: CURATED_SKILLS,
        isLoadingSkills: false,
        skillError: null,
      });
    },
    importSkill: async (skillName) => {
      const currentState = useAppStore.getState();
      const targetSkill = CURATED_SKILLS.find((skill) => skill.name === skillName);

      if (!targetSkill) {
        useAppStore.setState({
          skillError: "選択したツールが見つかりませんでした",
        });
        return;
      }

      const alreadyImported = currentState.importedSkills.some(
        (skill) => skill.name === skillName,
      );

      if (alreadyImported) {
        useAppStore.setState({ skillError: null });
        return;
      }

      useAppStore.setState({
        importedSkills: [
          ...currentState.importedSkills,
          createImportedSkill(targetSkill),
        ],
        skillError: null,
      });
    },
    selectSkillByName: () => undefined,
    updateUserProfile: (patch) => {
      const currentState = useAppStore.getState();
      useAppStore.setState({
        userProfile: {
          ...currentState.userProfile,
          ...patch,
        },
      });
    },
    setThemeMode: async (mode) => {
      const nextTheme = mode === "system" ? theme : mode;
      applyTheme(nextTheme);
      useAppStore.setState({
        themeMode: mode,
        resolvedTheme: nextTheme,
      });
    },
    setCurrentView: (nextView: ViewType) => {
      useAppStore.setState({ currentView: nextView });
    },
  });
}

function bootstrapElectronApi(theme: HarnessTheme, completed: boolean): void {
  const persisted = new Map<string, unknown>([
    [ONBOARDING_COMPLETED_KEY, completed],
  ]);

  const api = {
    store: {
      get: async ({
        key,
        defaultValue,
      }: {
        key: string;
        defaultValue?: unknown;
      }): Promise<ElectronStoreResponse> => ({
        success: true,
        data: persisted.has(key) ? persisted.get(key) : defaultValue,
      }),
      set: async ({
        key,
        value,
      }: {
        key: string;
        value: unknown;
      }): Promise<ElectronStoreResponse> => {
        persisted.set(key, value);
        return { success: true };
      },
    },
    apiKey: {
      list: async () => API_KEY_LIST_RESULT,
      save: async () => ({ success: true }),
      delete: async () => ({ success: true }),
      validate: async () => ({
        success: true,
        data: { status: "valid", errorMessage: null },
      }),
    },
    authMode: {
      get: async () => ({
        success: true,
        data: { mode: "subscription" as AuthMode },
      }),
      set: async ({ mode }: { mode: AuthMode }) => {
        useAppStore.setState({
          mode,
          status: createAuthModeStatus(mode),
        });
        return { success: true };
      },
      status: async () => ({
        success: true,
        data: createAuthModeStatus(useAppStore.getState().mode),
      }),
      validate: async ({ mode }: { mode?: AuthMode } = {}) => ({
        success: true,
        data: createAuthModeStatus(mode ?? useAppStore.getState().mode),
      }),
      onModeChanged: () => () => undefined,
    },
    theme: {
      get: async () => ({
        success: true,
        data: {
          mode: useAppStore.getState().themeMode,
          resolvedTheme: useAppStore.getState().resolvedTheme,
        },
      }),
      set: async ({ mode }: { mode: ThemeMode }) => {
        const nextTheme = mode === "system" ? theme : mode;
        applyTheme(nextTheme);
        useAppStore.setState({
          themeMode: mode,
          resolvedTheme: nextTheme,
        });
        return { success: true, data: {} };
      },
      getSystem: async () => ({
        success: true,
        data: { theme },
      }),
      onSystemChanged: () => () => undefined,
    },
  };

  Object.defineProperty(window, "electronAPI", {
    configurable: true,
    value: api,
  });
}

function bootstrapHarness(): ReturnType<typeof readHarnessConfig> {
  localStorage.removeItem(PERSIST_KEY);
  sessionStorage.clear();

  const config = readHarnessConfig();
  applyTheme(config.theme);
  bootstrapStore(config.surface, config.theme);
  bootstrapElectronApi(config.theme, config.completed);
  return config;
}

const harnessConfig = bootstrapHarness();

const SceneFrame: React.FC<{
  testId: string;
  children: React.ReactNode;
}> = ({ testId, children }) => (
  <div
    className="min-h-screen bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--status-primary)_16%,transparent),transparent_42%),linear-gradient(180deg,color-mix(in_srgb,var(--bg-tertiary)_88%,var(--bg-primary))_0%,var(--bg-primary)_56%,color-mix(in_srgb,var(--bg-secondary)_72%,var(--bg-primary))_100%)] text-[var(--text-primary)]"
    data-testid={testId}
  >
    <div className="mx-auto max-w-[1480px] px-4 py-4 sm:px-6 sm:py-6">
      <div className="mb-4 flex items-center justify-between rounded-full border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-secondary)_88%,transparent)] px-4 py-2 text-xs uppercase tracking-[0.22em] text-[var(--text-muted)] shadow-sm backdrop-blur">
        <span>Phase 11 Harness</span>
        <span data-testid="phase11-onboarding-status">
          view={useAppStore.getState().currentView} theme={harnessConfig.theme}
        </span>
      </div>
      {children}
    </div>
  </div>
);

function DashboardScene(): JSX.Element {
  return (
    <SceneFrame testId="phase11-onboarding-dashboard-shell">
      <div className="relative overflow-hidden rounded-[32px] border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-secondary)_82%,transparent)] shadow-[0_24px_90px_rgba(15,23,42,0.14)] backdrop-blur">
        <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--status-primary)_16%,transparent),transparent_68%)]" />
        <div className="relative p-2 sm:p-4">
          <DashboardView />
          <OnboardingGate />
        </div>
      </div>
    </SceneFrame>
  );
}

function SettingsScene(): JSX.Element {
  return (
    <SceneFrame testId="phase11-onboarding-settings-shell">
      <div className="mx-auto max-w-[1200px] overflow-hidden rounded-[32px] border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-secondary)_84%,transparent)] shadow-[0_24px_90px_rgba(15,23,42,0.14)] backdrop-blur">
        <SettingsView />
      </div>
    </SceneFrame>
  );
}

function HarnessRouter(): JSX.Element {
  const currentView = useAppStore((state) => state.currentView);

  return currentView === "settings" ? <SettingsScene /> : <DashboardScene />;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HarnessRouter />
  </React.StrictMode>,
);
