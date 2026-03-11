import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/globals.css";
import { DashboardView } from "./views/DashboardView";
import { useAppStore } from "./store";

type HarnessState = "normal" | "empty" | "loading";
type HarnessTheme = "light" | "dark" | "kanagawa-dragon";

function getSearchParam(
  name: string,
  allowed: readonly string[],
  fallback: string,
): string {
  const value = new URLSearchParams(window.location.search).get(name);
  if (value && allowed.includes(value)) {
    return value;
  }
  return fallback;
}

function applyTheme(theme: HarnessTheme): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme =
    theme === "light" ? "light" : "dark";
}

function bootstrapStore(state: HarnessState): void {
  const base = {
    dashboardStats: {
      totalDocs: 24,
      ragIndexed: 18,
      pending: 2,
      storageUsed: 420,
      storageTotal: 1000,
    },
    activityFeed: [
      {
        id: "activity-1",
        message: "最新の仕様同期を確認",
        time: "2026-03-11T09:58:00+09:00",
        type: "info" as const,
      },
      {
        id: "activity-2",
        message: "インデックス更新が完了",
        time: "2026-03-11T09:21:00+09:00",
        type: "success" as const,
      },
      {
        id: "activity-3",
        message: "履歴検索の導線を見直し",
        time: "2026-03-11T08:45:00+09:00",
        type: "warning" as const,
      },
    ],
    isLoading: false,
    profile: {
      name: "Phase11 Reviewer",
      email: "phase11@example.com",
      avatar: "",
      plan: "pro" as const,
      displayName: "Phase11 Reviewer",
    } as never,
    authUser: {
      displayName: "Phase11 Reviewer",
    } as never,
    setCurrentView: (() => undefined) as never,
  };

  switch (state) {
    case "empty":
      useAppStore.setState({
        ...base,
        dashboardStats: {
          ...base.dashboardStats,
          pending: 0,
        },
        activityFeed: [],
      });
      break;
    case "loading":
      useAppStore.setState({
        ...base,
        isLoading: true,
      });
      break;
    case "normal":
    default:
      useAppStore.setState(base);
      break;
  }
}

function Harness(): JSX.Element {
  const state = getSearchParam(
    "state",
    ["normal", "empty", "loading"],
    "normal",
  ) as HarnessState;
  const theme = getSearchParam(
    "theme",
    ["light", "dark", "kanagawa-dragon"],
    "light",
  ) as HarnessTheme;

  applyTheme(theme);
  bootstrapStore(state);

  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]"
      data-testid="phase11-dashboard-home"
    >
      <main className="mx-auto min-h-screen max-w-[1440px] p-4 sm:p-6">
        <DashboardView now={new Date("2026-03-11T10:15:00+09:00")} />
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Harness />
  </React.StrictMode>,
);
