import React, { useEffect, useMemo, useState } from "react";
import { useAppStore } from "../store";
import { SettingsCard } from "../components/organisms/SettingsCard";
import { ThemeSelector } from "../components/molecules/ThemeSelector";
import { LocaleSelector } from "./SettingsView/ProfileSection/LocaleSelector";
import { TimezoneSelector } from "./SettingsView/ProfileSection/TimezoneSelector";
import { AccountSection } from "../components/organisms/AccountSection";
import { AuthView } from "./AuthView";
import { WorkspaceSearchPanel } from "../components/organisms/WorkspaceSearch/WorkspaceSearchPanel";
import { DashboardView } from "./DashboardView";
import type { ThemeMode } from "../store/types";
import type { Locale } from "@repo/shared/types/auth";

type ReviewSurface = "settings" | "auth" | "workspace-search" | "dashboard";

export interface LightThemeSharedColorMigrationReviewHarnessProps {
  surface: ReviewSurface;
  theme: ThemeMode;
}

function ensureWorkspaceSearchMock(): void {
  const existing = window.electronAPI as
    | { invoke?: <T>(channel: string, data?: unknown) => Promise<T> }
    | undefined;

  if (existing?.invoke) {
    return;
  }

  const matches = [
    {
      text: "theme: light",
      line: 3,
      column: 9,
      length: 5,
      filePath: "/workspace/src/config.json",
    },
    {
      text: "export const themeMode = 'light';",
      line: 12,
      column: 14,
      length: 5,
      filePath: "/workspace/src/theme.ts",
    },
  ];

  const invoke = async <T,>(channel: string): Promise<T> => {
    if (channel === "search:workspace:execute") {
      return {
        success: true,
        data: {
          matches,
          totalCount: matches.length,
          fileCount: 2,
        },
      } as T;
    }

    if (channel === "replace:workspace:all") {
      return {
        success: true,
        data: {
          replacedCount: matches.length,
          fileCount: 2,
        },
      } as T;
    }

    return {
      success: false,
      error: `Unsupported harness channel: ${channel}`,
    } as T;
  };

  (
    window as unknown as {
      electronAPI: { invoke: typeof invoke };
    }
  ).electronAPI = { invoke };
}

export const LightThemeSharedColorMigrationReviewHarness: React.FC<
  LightThemeSharedColorMigrationReviewHarnessProps
> = ({ surface, theme }) => {
  const [reviewTheme, setReviewTheme] = useState<ThemeMode>(theme);
  const [locale, setLocale] = useState<Locale>("ja");
  const [timezone, setTimezone] = useState("Asia/Tokyo");

  useEffect(() => {
    useAppStore.setState({
      isAuthenticated: true,
      isLoading: false,
      authError: null,
      isOffline: false,
      authUser: {
        id: "phase11-review-user",
        email: "daishimanju@gmail.com",
        displayName: "Daishi Manju",
        avatarUrl: null,
        provider: "google",
        createdAt: "2026-03-12T09:00:00+09:00",
        lastSignInAt: "2026-03-12T09:10:00+09:00",
      } as any,
      profile: {
        id: "phase11-review-profile",
        displayName: "Daishi Manju",
        email: "daishimanju@gmail.com",
        avatarUrl: null,
        plan: "pro",
        createdAt: "2026-03-10T09:00:00+09:00",
        updatedAt: "2026-03-12T09:30:00+09:00",
        locale: "ja",
        timezone: "Asia/Tokyo",
      } as any,
      linkedProviders: [
        {
          provider: "google",
          providerId: "google-phase11",
          email: "daishimanju@gmail.com",
          displayName: "Daishi Manju",
          avatarUrl: null,
          linkedAt: "2026-03-10T09:00:00+09:00",
        },
        {
          provider: "github",
          providerId: "github-phase11",
          email: "daishimanju@gmail.com",
          displayName: "Daishi Manju",
          avatarUrl: null,
          linkedAt: "2026-03-11T13:00:00+09:00",
        },
      ] as any,
      dashboardStats: {
        totalDocs: 182,
        ragIndexed: 148,
        pending: 2,
        storageUsed: 630,
        storageTotal: 1000,
      },
      activityFeed: [
        {
          id: "1",
          message: "Theme migration review",
          time: "2026-03-12T09:58:00+09:00",
          type: "info",
        },
        {
          id: "2",
          message: "Workspace contrast check",
          time: "2026-03-12T09:42:00+09:00",
          type: "success",
        },
      ] as any,
    } as any);

    ensureWorkspaceSearchMock();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", reviewTheme);
    document.documentElement.style.colorScheme =
      reviewTheme === "light" ? "light" : "dark";
  }, [reviewTheme]);

  const shellClassName = useMemo(
    () =>
      "min-h-screen bg-[linear-gradient(180deg,var(--bg-primary)_0%,color-mix(in_srgb,var(--bg-tertiary)_52%,var(--bg-primary))_100%)] text-[var(--text-primary)]",
    [],
  );

  if (surface === "auth") {
    return (
      <div data-testid="ltscm-auth-surface">
        <AuthView />
      </div>
    );
  }

  if (surface === "workspace-search") {
    return (
      <div
        className={shellClassName}
        data-testid="ltscm-workspace-search-surface"
      >
        <div className="mx-auto max-w-6xl px-6 py-8">
          <header className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Phase 11 Harness
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">
              Workspace Search Surface Review
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Light theme で panel / input / result list
              のコントラストを確認する。
            </p>
          </header>
          <div className="h-[760px] overflow-hidden rounded-[28px] border border-[var(--border-primary)] shadow-lg">
            <WorkspaceSearchPanel
              workspacePath="/workspace"
              initialShowReplace
            />
          </div>
        </div>
      </div>
    );
  }

  if (surface === "dashboard") {
    return (
      <div className={shellClassName} data-testid="ltscm-dashboard-surface">
        <DashboardView now={new Date("2026-03-12T10:15:00+09:00")} />
      </div>
    );
  }

  return (
    <div className={shellClassName} data-testid="ltscm-settings-surface">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            Phase 11 Harness
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--text-primary)]">
            Settings Shared Surface Review
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Theme selector / account / locale / timezone の light theme
            可読性をまとめて確認する。
          </p>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div className="space-y-6">
            <SettingsCard
              title="テーマ設定"
              description="glare を抑えた segmented control と token text の確認"
            >
              <ThemeSelector
                value={reviewTheme}
                onChange={setReviewTheme}
                fullWidth
              />
            </SettingsCard>

            <SettingsCard
              title="アカウント"
              description="profile summary / linked provider / destructive action の見え方確認"
            >
              <AccountSection />
            </SettingsCard>
          </div>

          <div className="space-y-6">
            <SettingsCard
              title="ローカライズ"
              description="label / helper / dropdown option の secondary text を確認"
            >
              <div className="space-y-5">
                <LocaleSelector value={locale} onChange={setLocale} />
                <TimezoneSelector value={timezone} onChange={setTimezone} />
              </div>
            </SettingsCard>
          </div>
        </div>
      </div>
    </div>
  );
};

LightThemeSharedColorMigrationReviewHarness.displayName =
  "LightThemeSharedColorMigrationReviewHarness";
