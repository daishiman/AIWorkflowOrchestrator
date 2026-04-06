/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- Phase 11 screenshot harness
import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import "./styles/globals.css";
import { SessionIndicator } from "./components/skill/SessionIndicator";
import { SessionResumePrompt } from "./components/skill/SessionResumePrompt";

type HarnessScenario =
  | "no-session"
  | "no-session-dark"
  | "session-list"
  | "after-skip"
  | "error-banner"
  | "session-indicator";

type HarnessTheme = "light" | "dark";

const FIXED_NOW = new Date("2026-04-06T09:00:00.000Z").getTime();
Date.now = () => FIXED_NOW;

function getScenario(): HarnessScenario {
  const scenario = new URLSearchParams(window.location.search).get("scenario");
  switch (scenario) {
    case "no-session-dark":
    case "session-list":
    case "after-skip":
    case "error-banner":
    case "session-indicator":
      return scenario;
    default:
      return "no-session";
  }
}

function getTheme(scenario: HarnessScenario): HarnessTheme {
  if (scenario === "no-session-dark") {
    return "dark";
  }
  return new URLSearchParams(window.location.search).get("theme") === "dark"
    ? "dark"
    : "light";
}

function applyTheme(theme: HarnessTheme): void {
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
}

const baseSessions = [
  {
    checkpointId: "cp-001-abc",
    sessionId: "session-001-abc",
    planId: "plan-abc-123",
    currentPhase: "review",
    checkpointType: "review-ready",
    startedAt: FIXED_NOW - 3_600_000,
    createdAt: FIXED_NOW - 3_600_000,
    updatedAt: FIXED_NOW - 1_800_000,
    compatibility: {
      status: "compatible",
      reasons: [],
      warnings: [],
    },
  },
  {
    checkpointId: "cp-002-def",
    sessionId: "session-002-def",
    planId: "plan-def-456",
    currentPhase: "verify",
    checkpointType: "execute-complete",
    startedAt: FIXED_NOW - 7_200_000,
    createdAt: FIXED_NOW - 7_200_000,
    updatedAt: FIXED_NOW - 3_600_000,
    compatibility: {
      status: "compatible_with_warning",
      reasons: [],
      warnings: ["スキルクリエイターのルートが変更されました"],
    },
  },
];

const SessionResumeHarness: React.FC = () => {
  const scenario = useMemo(getScenario, []);
  const theme = useMemo(() => getTheme(scenario), [scenario]);
  applyTheme(theme);

  const [startNewSelected, setStartNewSelected] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showPrompt =
    scenario === "session-list" ||
    scenario === "after-skip" ||
    scenario === "error-banner";
  const showIndicator = scenario === "session-indicator";

  const handleResume = () => {
    if (scenario === "error-banner") {
      setErrorMessage(
        "セッションの復元に失敗しました。もう一度お試しください。",
      );
    }
  };

  const handleSkip = () => {
    setStartNewSelected(true);
  };

  const handleStartNew = () => {
    setStartNewSelected(true);
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] px-6 py-8 text-[var(--text-primary)]">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5 rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-6 shadow-lg shadow-black/5">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
            Phase 11 Visual Evidence
          </p>
          <h1 className="text-2xl font-semibold">
            Session Resume Renderer Integration
          </h1>
          <p className="max-w-3xl text-sm text-[var(--text-secondary)]">
            SessionResumePrompt と SessionIndicator の主要状態を、実装済み
            コンポーネントそのものを使って再現するハーネスです。
          </p>
        </header>

        {showIndicator ? (
          <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-5">
            <div className="mb-3 text-sm text-[var(--text-secondary)]">
              アクティブセッション表示
            </div>
            <SessionIndicator
              planId="plan-abc-12345678"
              sessionId="session-abc-12345678"
              currentPhase="execute"
              startedAt={FIXED_NOW - 1_800_000}
              isActive
            />
          </div>
        ) : null}

        {showPrompt && !startNewSelected ? (
          <div className="space-y-4">
            {errorMessage ? (
              <div
                className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
                data-testid="session-error-banner"
                role="alert"
              >
                <div className="font-semibold">
                  セッションの復元に失敗しました
                </div>
                <div className="mt-1">{errorMessage}</div>
              </div>
            ) : null}

            <SessionResumePrompt
              sessions={baseSessions}
              isLoading={false}
              onResume={handleResume}
              onSkip={handleSkip}
              onDelete={() => undefined}
              onStartNew={handleStartNew}
            />
          </div>
        ) : null}

        {scenario === "no-session" || scenario === "no-session-dark" ? (
          <div
            className="rounded-2xl border border-dashed border-[var(--border-primary)] bg-[var(--bg-primary)] px-5 py-8 text-center"
            data-testid="session-empty-state"
          >
            <p className="text-sm font-medium">未完了セッションはありません</p>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              SessionResumePrompt は表示されません。
            </p>
          </div>
        ) : null}

        {startNewSelected ? (
          <div
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-8"
            data-testid="session-new-start-state"
          >
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              削除して新規開始を選択しました
            </p>
            <p className="mt-2 text-xs text-emerald-800/80 dark:text-emerald-200/80">
              セッションはクリアされ、新しい開始フローへ遷移できます。
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
};

const root = document.getElementById("root");
if (!root) {
  throw new Error("Phase 11 session resume harness のルートが見つかりません");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <SessionResumeHarness />
  </React.StrictMode>,
);
