/**
 * @file SessionIndicator.tsx
 * @description アクティブセッションの ID・経過時間を表示するインジケーター
 * TASK-P0-08: session-resume-renderer-integration
 */

import { memo, useEffect, useState } from "react";
import type { SkillCreatorWorkflowPhase } from "@repo/shared/types";

export interface SessionIndicatorProps {
  planId: string;
  sessionId?: string;
  currentPhase: SkillCreatorWorkflowPhase;
  startedAt: number;
  isActive?: boolean;
}

const phaseLabels: Record<SkillCreatorWorkflowPhase, string> = {
  plan: "計画",
  review: "レビュー",
  execute: "実行",
  verify: "検証",
  improve: "改善",
  reverify: "再検証",
  handoff: "引き渡し",
};

function formatDuration(startMs: number, nowMs: number): string {
  const elapsed = Math.max(0, nowMs - startMs);
  const totalSeconds = Math.floor(elapsed / 1_000);
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);

  if (hours > 0) {
    return `${hours}時間${minutes}分`;
  }
  return `${minutes}分`;
}

export const SessionIndicator = memo<SessionIndicatorProps>(
  ({ planId, sessionId, currentPhase, startedAt, isActive = true }) => {
    const [now, setNow] = useState(Date.now);
    const displayId = (sessionId ?? planId).slice(0, 8);

    useEffect(() => {
      const timer = setInterval(() => setNow(Date.now()), 60_000);
      return () => clearInterval(timer);
    }, []);

    return (
      <div
        className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-1.5"
        data-testid="session-indicator"
        role="status"
        aria-label="アクティブセッション"
      >
        {isActive ? (
          <span
            className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500"
            aria-hidden="true"
            data-testid="session-indicator-pulse"
          />
        ) : null}
        <span className="text-xs text-[var(--text-secondary)]">
          <span className="font-mono" data-testid="session-id-display">
            {displayId}
          </span>
          {" · "}
          {phaseLabels[currentPhase]}
          {" · "}
          <span data-testid="session-elapsed-time">
            {formatDuration(startedAt, now)}
          </span>
        </span>
      </div>
    );
  },
);

SessionIndicator.displayName = "SessionIndicator";
