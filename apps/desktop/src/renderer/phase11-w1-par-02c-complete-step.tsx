import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { CompleteStep } from "./components/skill/wizard/CompleteStep";
import "./styles/globals.css";

function LightThemeBootstrap(): null {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.style.colorScheme = "light";
  }, []);

  return null;
}

function ScenarioCard({
  testId,
  title,
  children,
}: {
  testId: string;
  title: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <article
      data-testid={testId}
      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 shadow-[var(--shadow-lg)]"
    >
      <h2 className="text-base font-semibold text-[var(--text-primary)]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </article>
  );
}

function Phase11CompleteStepHarness(): JSX.Element {
  return (
    <main
      data-testid="phase11-complete-step-harness"
      className="min-h-screen bg-[var(--bg-primary)] px-6 py-8 text-[var(--text-primary)]"
    >
      <LightThemeBootstrap />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-6 py-5 shadow-[var(--shadow-lg)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--status-primary)]">
            Phase 11 Visual Evidence
          </p>
          <h1 className="mt-2 text-2xl font-semibold">
            W1-par-02c CompleteStep
          </h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            外部連携チェックリスト表示（hasExternalIntegration=true）を実画面で確認する。
          </p>
        </header>

        <ScenarioCard
          testId="phase11-complete-step-external-card"
          title="TC-09 CompleteStep 外部連携チェックリスト"
        >
          <CompleteStep
            generatedSkill={{
              path: "/mock/skills/slack-notifier",
              name: "slack-notifier",
            }}
            hasExternalIntegration
            externalToolName="Slack"
            onQualityFeedback={() => undefined}
            onExecuteNow={() => undefined}
            onOpenInEditor={() => undefined}
            onCreateAnother={() => undefined}
            onRetry={() => undefined}
          />
        </ScenarioCard>
      </div>
    </main>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to mount phase11 complete step harness");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Phase11CompleteStepHarness />
  </React.StrictMode>,
);
