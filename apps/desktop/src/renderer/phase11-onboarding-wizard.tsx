import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/globals.css";
import { DashboardView } from "./views/DashboardView";
import { useAppStore } from "./store";
import { OnboardingWizard } from "./components/organisms/OnboardingWizard";
import type { ThemeMode } from "./store/types";

type HarnessTheme = "light" | "dark" | "kanagawa-dragon";

function getTheme(): HarnessTheme {
  const theme = new URLSearchParams(window.location.search).get("theme");
  if (theme === "light" || theme === "dark" || theme === "kanagawa-dragon") {
    return theme;
  }
  return "light";
}

function applyTheme(theme: HarnessTheme): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme =
    theme === "light" ? "light" : "dark";
}

function bootstrapStore(theme: HarnessTheme): void {
  useAppStore.setState({
    dashboardStats: {
      totalDocs: 18,
      ragIndexed: 12,
      pending: 2,
      storageUsed: 360,
      storageTotal: 1000,
    },
    activityFeed: [
      {
        id: "activity-1",
        message: "仕様レビューを開始",
        time: "2026-03-13T10:00:00+09:00",
        type: "info" as const,
      },
      {
        id: "activity-2",
        message: "スクリーンショット証跡を準備",
        time: "2026-03-13T09:40:00+09:00",
        type: "success" as const,
      },
    ],
    isLoading: false,
    userProfile: {
      name: "Phase11 Reviewer",
      email: "phase11@example.com",
      avatar: "",
      plan: "pro" as const,
    },
    profile: {
      displayName: "Phase11 Reviewer",
      email: "phase11@example.com",
      avatarUrl: "",
      plan: "pro" as const,
    } as never,
    authUser: {
      displayName: "Phase11 Reviewer",
    } as never,
    themeMode: theme as ThemeMode,
    setCurrentView: (() => undefined) as never,
  });
}

function Harness(): JSX.Element {
  const theme = getTheme();

  applyTheme(theme);
  bootstrapStore(theme);

  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]"
      data-testid="phase11-onboarding-wizard"
    >
      <main className="mx-auto min-h-screen max-w-[1440px] p-4 sm:p-6">
        <DashboardView now={new Date("2026-03-13T10:15:00+09:00")} />
      </main>

      <OnboardingWizard
        isOpen
        initialName="Phase11 Reviewer"
        initialThemeMode={theme}
        onClose={() => undefined}
        onComplete={async () => undefined}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Harness />
  </React.StrictMode>,
);
