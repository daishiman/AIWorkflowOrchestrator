import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { ApprovalRequestPanel } from "./components/skill/ApprovalRequestPanel";
import "./styles/globals.css";
import type { ApprovalRequestPayload } from "@repo/shared/types";

type HarnessScenario =
  | "pending-light"
  | "pending-dark"
  | "expired-light"
  | "expired-dark"
  | "approved-light"
  | "rejected-light";

type HarnessTheme = "light" | "dark";
type HarnessMode = "pending" | "expired" | "approved" | "rejected";

type HarnessController = {
  approve: () => Promise<void>;
  reject: () => Promise<void>;
  expire: () => void;
};

declare global {
  interface Window {
    __PHASE11_APPROVAL_REQUEST_SURFACE__?: HarnessController;
  }
}

const BASE_NOW = new Date("2026-04-06T09:00:00.000Z").getTime();
const APPROVAL_TTL_MS = 300 * 1000;
let timeOffsetMs = 0;

Date.now = () => BASE_NOW + timeOffsetMs;

const SAMPLE_REQUEST: ApprovalRequestPayload = {
  sessionId: "session-approval-request-demo",
  operationId: "operation-approval-request-demo",
  operationType: "file_write",
  description:
    "危険なファイル書き込みを実行しようとしています。内容を確認してください。",
  destination: "/etc/hosts",
};

function getScenario(): HarnessScenario {
  const rawScenario = new URLSearchParams(window.location.search).get(
    "scenario",
  );
  switch (rawScenario) {
    case "pending-dark":
    case "expired-light":
    case "expired-dark":
    case "approved-light":
    case "rejected-light":
      return rawScenario;
    default:
      return "pending-light";
  }
}

function getTheme(scenario: HarnessScenario): HarnessTheme {
  return scenario.endsWith("dark") ? "dark" : "light";
}

function getMode(scenario: HarnessScenario): HarnessMode {
  if (scenario.startsWith("expired")) return "expired";
  if (scenario.startsWith("approved")) return "approved";
  if (scenario.startsWith("rejected")) return "rejected";
  return "pending";
}

function ResultCard({
  decision,
}: {
  decision: "approved" | "rejected";
}): JSX.Element {
  const approved = decision === "approved";
  return (
    <div
      className={[
        "rounded-2xl border px-5 py-4",
        approved
          ? "border-emerald-500/30 bg-emerald-500/10"
          : "border-rose-500/30 bg-rose-500/10",
      ].join(" ")}
      data-testid="approval-result-banner"
    >
      <p
        className={[
          "text-xs font-semibold uppercase tracking-[0.2em]",
          approved ? "text-emerald-700" : "text-rose-700",
        ].join(" ")}
      >
        {approved ? "承認済み" : "拒否済み"}
      </p>
      <p
        className={[
          "mt-2 text-sm font-medium",
          approved ? "text-emerald-900" : "text-rose-900",
        ].join(" ")}
      >
        {approved
          ? "respondToApproval('approve') が送信されました。"
          : "respondToApproval('reject') が送信されました。"}
      </p>
      <p
        className={[
          "mt-1 text-xs",
          approved ? "text-emerald-800/80" : "text-rose-800/80",
        ].join(" ")}
      >
        ルート UI からは承認確認パネルが閉じ、次の操作へ進めます。
      </p>
    </div>
  );
}

function Harness(): JSX.Element {
  const scenario = useMemo(getScenario, []);
  const theme = useMemo(() => getTheme(scenario), [scenario]);
  const mode = useMemo(() => getMode(scenario), [scenario]);
  const [request, setRequest] = useState<ApprovalRequestPayload | null>(
    SAMPLE_REQUEST,
  );
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(
    null,
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    timeOffsetMs = 0;
    if (mode !== "expired") {
      return;
    }

    const timer = window.setTimeout(() => {
      timeOffsetMs = APPROVAL_TTL_MS + 1_000;
    }, 120);

    return () => {
      window.clearTimeout(timer);
    };
  }, [mode]);

  const completeDecision = async (nextDecision: "approved" | "rejected") => {
    setDecision(nextDecision);
    setRequest(null);
    await new Promise((resolve) => {
      window.setTimeout(resolve, 140);
    });
  };

  const handleApprove = async () => completeDecision("approved");
  const handleReject = async () => completeDecision("rejected");

  useEffect(() => {
    window.__PHASE11_APPROVAL_REQUEST_SURFACE__ = {
      approve: handleApprove,
      reject: handleReject,
      expire: () => {
        timeOffsetMs = APPROVAL_TTL_MS + 1_000;
      },
    };

    return () => {
      window.__PHASE11_APPROVAL_REQUEST_SURFACE__ = undefined;
    };
  }, [handleApprove, handleReject]);

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,var(--bg-primary)_0%,var(--bg-secondary)_100%)] px-6 py-8 text-[var(--text-primary)]">
      <section
        className="mx-auto flex w-full max-w-5xl flex-col gap-5 rounded-[28px] border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]"
        data-testid="approval-surface-shell"
      >
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
            Phase 11 Visual Evidence
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em]">
            Approval Request Surface
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            `approval:request` の受信から approve / reject / expired までを、
            実装済みコンポーネントでそのまま確認するハーネスです。
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Scenario
            </p>
            <p className="mt-2 text-sm font-semibold">{scenario}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Theme
            </p>
            <p className="mt-2 text-sm font-semibold">{theme}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Operation
            </p>
            <p className="mt-2 text-sm font-semibold">
              {SAMPLE_REQUEST.operationType}
            </p>
          </div>
        </div>

        {decision ? <ResultCard decision={decision} /> : null}

        {request ? (
          <ApprovalRequestPanel
            request={request}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ) : null}

        <div className="grid gap-3 rounded-2xl border border-dashed border-[var(--border-primary)] bg-[var(--bg-primary)] p-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Session
            </p>
            <p className="mt-2 text-sm font-medium">
              {SAMPLE_REQUEST.sessionId}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              Destination
            </p>
            <p className="mt-2 text-sm font-medium font-mono">
              {SAMPLE_REQUEST.destination}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

const root = document.getElementById("root");
if (!root) {
  throw new Error("Approval request harness のルートが見つかりません");
}

ReactDOM.createRoot(root).render(<Harness />);
