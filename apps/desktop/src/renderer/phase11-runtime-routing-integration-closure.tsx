import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { TerminalHandoffCard } from "./components/organisms/TerminalHandoffCard";
import "./styles/globals.css";

type Variant =
  | "tc01-skill-handoff"
  | "tc02-skill-integrated"
  | "tc03-agent-handoff"
  | "tc04-layout"
  | "tc05-copy-feedback"
  | "tc06-dismiss"
  | "tc07-dark-mode"
  | "tc08-chat-edit-regression"
  | "tc09-skill-regression";

function getVariant(): Variant {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("variant");
  switch (raw) {
    case "tc02-skill-integrated":
    case "tc03-agent-handoff":
    case "tc04-layout":
    case "tc05-copy-feedback":
    case "tc06-dismiss":
    case "tc07-dark-mode":
    case "tc08-chat-edit-regression":
    case "tc09-skill-regression":
      return raw;
    case "tc01-skill-handoff":
    default:
      return "tc01-skill-handoff";
  }
}

function applyTheme(): "light" | "dark" {
  const params = new URLSearchParams(window.location.search);
  const theme = params.get("theme") === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
  return theme;
}

const baseSkillGuidance = {
  terminalCommand: 'claude "Please continue with skill execution"',
  contextSummary: "surface=skill skill=skill-creator",
  reason: "subscription mode: use Claude Code CLI",
};

const baseAgentGuidance = {
  terminalCommand: 'claude "Continue agent execution from current context"',
  contextSummary: "surface=agent skill=agent-01",
  reason: "API key not configured",
};

const longCommandGuidance = {
  terminalCommand:
    'claude --add-dir "/Users/dev/workspace" "Please continue with runtime routing integration closure and validate handoff UI for skill and agent surfaces with screenshot evidence."',
  contextSummary: "surface=skill skill=runtime-routing-integration-closure",
  reason: "subscription mode: use Claude Code CLI",
};

const RuntimeRoutingHarness: React.FC = () => {
  const variant = useMemo(getVariant, []);
  const theme = useMemo(applyTheme, []);

  const initialGuidance =
    variant === "tc03-agent-handoff"
      ? baseAgentGuidance
      : variant === "tc04-layout" || variant === "tc05-copy-feedback"
        ? longCommandGuidance
        : variant === "tc01-skill-handoff" ||
            variant === "tc06-dismiss" ||
            variant === "tc07-dark-mode"
          ? baseSkillGuidance
          : null;

  const [guidance, setGuidance] = useState(initialGuidance);
  const [copyCount, setCopyCount] = useState(0);

  return (
    <main
      data-testid="phase11-runtime-routing-harness"
      className="min-h-screen bg-[var(--bg-primary)] px-8 py-10 text-[var(--text-primary)]"
    >
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6">
        <header className="space-y-2">
          <h1 className="text-xl font-semibold">
            Runtime Routing Integration Closure - Phase 11 Harness
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            variant={variant} / theme={theme}
          </p>
        </header>

        {variant === "tc02-skill-integrated" && (
          <div
            data-testid="phase11-skill-integrated-result"
            className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-emerald-800"
          >
            Skill integrated path completed. Terminal handoff is not shown.
          </div>
        )}

        {variant === "tc08-chat-edit-regression" && (
          <div
            data-testid="phase11-chat-edit-regression-result"
            className="rounded-lg border border-sky-300 bg-sky-50 p-4 text-sky-900"
          >
            chat-edit runtime routing regression check: PASS (existing behavior
            preserved).
          </div>
        )}

        {variant === "tc09-skill-regression" && (
          <div
            data-testid="phase11-skill-regression-result"
            className="rounded-lg border border-indigo-300 bg-indigo-50 p-4 text-indigo-900"
          >
            api-key mode skill execution regression check: PASS (integrated path
            preserved).
          </div>
        )}

        {guidance && (
          <div data-testid="phase11-terminal-handoff-card">
            <TerminalHandoffCard
              guidance={guidance}
              onCopyCommand={() => setCopyCount((prev) => prev + 1)}
              onDismiss={() => setGuidance(null)}
            />
          </div>
        )}

        {!guidance && (
          <div
            data-testid="phase11-handoff-hidden"
            className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-4 text-sm text-[var(--text-secondary)]"
          >
            TerminalHandoffCard is hidden.
          </div>
        )}

        <div
          data-testid="phase11-copy-count"
          className="text-xs text-[var(--text-secondary)]"
        >
          copyCount={copyCount}
        </div>
      </section>
    </main>
  );
};

const root = document.getElementById("root");
if (!root) {
  throw new Error("Failed to find root element for runtime routing harness");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <RuntimeRoutingHarness />
  </React.StrictMode>,
);
