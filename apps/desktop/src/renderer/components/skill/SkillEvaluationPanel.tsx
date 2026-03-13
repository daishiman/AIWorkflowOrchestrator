import React from "react";
import type {
  GateStatus,
  LifecycleEvaluationSnapshot,
  LifecycleGateDecision,
} from "@repo/shared/types";
import { getLifecycleGateLabel } from "../../store/skillEvaluation";

const gateStatusStyles: Record<GateStatus, string> = {
  revise_required:
    "border-[var(--status-error)]/20 bg-[var(--status-error)]/10 text-[var(--status-error)]",
  save_with_warning:
    "border-[var(--status-warning)]/20 bg-[var(--status-warning)]/10 text-[var(--status-warning)]",
  use_with_warning:
    "border-[var(--status-warning)]/20 bg-[var(--status-warning)]/10 text-[var(--status-warning)]",
  use_ready:
    "border-[var(--status-success)]/20 bg-[var(--status-success)]/10 text-[var(--status-success)]",
  recommended:
    "border-[var(--status-primary)]/20 bg-[var(--status-primary)]/10 text-[var(--status-primary)]",
};

export interface SkillEvaluationPanelProps {
  decision: LifecycleGateDecision | null;
  snapshot: LifecycleEvaluationSnapshot | null;
  error?: string | null;
  isEvaluating?: boolean;
  onReevaluate?: () => void;
  title?: string;
}

export function SkillEvaluationPanel({
  decision,
  snapshot,
  error = null,
  isEvaluating = false,
  onReevaluate,
  title = "品質ゲート",
}: SkillEvaluationPanelProps) {
  if (!decision && !error) {
    return null;
  }

  return (
    <section
      className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4"
      data-testid="skill-evaluation-panel"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            {title}
          </h3>
          {decision ? (
            <p
              className="mt-2 text-sm leading-6 text-[var(--text-secondary)]"
              data-testid="skill-evaluation-summary"
            >
              {decision.summary}
            </p>
          ) : null}
          {error ? (
            <p
              className="mt-2 text-sm text-[var(--status-error)]"
              data-testid="skill-evaluation-error"
            >
              {error}
            </p>
          ) : null}
        </div>
        {decision ? (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${gateStatusStyles[decision.status]}`}
              data-testid="skill-evaluation-status"
            >
              {getLifecycleGateLabel(decision.status)}
            </span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {decision.totalScore}
            </span>
          </div>
        ) : null}
      </div>

      {snapshot ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--border-primary)] px-3 py-3">
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              Stage
            </p>
            <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
              {snapshot.stage}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border-primary)] px-3 py-3">
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              Next Surface
            </p>
            <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
              {decision?.nextSurface ?? "-"}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border-primary)] px-3 py-3">
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              Delta
            </p>
            <p
              className="mt-2 text-sm font-medium text-[var(--text-primary)]"
              data-testid="skill-evaluation-delta"
            >
              {typeof snapshot.deltaFromPrevious === "number"
                ? `${snapshot.deltaFromPrevious > 0 ? "+" : ""}${snapshot.deltaFromPrevious}`
                : "n/a"}
            </p>
          </div>
        </div>
      ) : null}

      {decision?.blockingIssues.length ? (
        <ul className="mt-4 space-y-2 text-sm text-[var(--status-error)]">
          {decision.blockingIssues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      ) : null}

      {onReevaluate ? (
        <div className="mt-4">
          <button
            type="button"
            className="rounded-md border border-[var(--border-primary)] px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onReevaluate}
            disabled={isEvaluating}
            data-testid="skill-evaluation-reevaluate"
          >
            {isEvaluating ? "再評価中..." : "再評価する"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
