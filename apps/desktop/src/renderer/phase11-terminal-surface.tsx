import React from "react";
import ReactDOM from "react-dom/client";
import { ExecutionEnvironment } from "./components/organisms/ExecutionEnvironment";
import "./styles/globals.css";

type HarnessScenario = "terminal" | "none" | "code";

function resolveScenario(raw: string | null): HarnessScenario {
  if (raw === "none" || raw === "code" || raw === "terminal") {
    return raw;
  }
  return "terminal";
}

function scenarioTitle(scenario: HarnessScenario): string {
  switch (scenario) {
    case "none":
      return "No Preview";
    case "code":
      return "Code Placeholder";
    case "terminal":
    default:
      return "Terminal Placeholder";
  }
}

const searchParams = new URLSearchParams(window.location.search);
const scenario = resolveScenario(searchParams.get("scenario"));
const auditLabel = searchParams.get("label") ?? "";

const environmentType =
  scenario === "none" ? "none" : scenario === "code" ? "code" : "terminal";

document.documentElement.setAttribute("data-theme", "light");
document.documentElement.style.colorScheme = "light";

function App(): JSX.Element {
  return (
    <div
      className="min-h-screen bg-[var(--bg-primary)] p-6 text-[var(--text-primary)]"
      data-testid="phase11-terminal-surface-harness"
    >
      <div className="mx-auto flex h-[calc(100vh-48px)] max-w-[1440px] flex-col gap-4">
        <header className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-3">
          <p className="text-xs font-semibold tracking-wide text-[var(--text-tertiary)]">
            TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001 / Phase 11 Re-audit
            Harness
          </p>
          <h1 className="text-lg font-semibold">{scenarioTitle(scenario)}</h1>
          <p
            className="text-sm text-[var(--text-secondary)]"
            data-testid="phase11-terminal-audit-label"
          >
            {auditLabel}
          </p>
        </header>

        <main className="min-h-0 flex-1 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
          <ExecutionEnvironment
            environmentType={environmentType}
            content={null}
          />
        </main>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
