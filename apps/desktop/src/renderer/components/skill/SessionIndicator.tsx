/**
 * @file SessionIndicator.tsx
 * @description アクティブセッションの ID・経過時間を表示するインジケーター
 * TASK-P0-08: session-resume-renderer-integration
 */

import { memo, useEffect, useState } from "react";
import type { SkillCreatorWorkflowPhase } from "@repo/shared/types";

export interface SessionIndicatorProps {
  planId: string;
  currentPhase: SkillCreatorWorkflowPhase;
  startedAt: number;
}

const phaseLabels: Record<SkillCreatorWorkflowPhase, string> = {
  plan: "計画",
  review: "レビュー",
  execute: "実行",
  verify: "検証",
  improve: "改善",
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
  ({ planId, currentPhase, startedAt }) => {
    const [now, setNow] = useState(Date.now);

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
        <span
          className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500"
          aria-hidden="true"
        />
        <span className="text-xs text-[var(--text-secondary)]">
          <span className="font-mono">{planId.slice(0, 8)}</span>
          {" · "}
          {phaseLabels[currentPhase]}
          {" · "}
          {formatDuration(startedAt, now)}
        </span>
      </div>
    );
  },
);

SessionIndicator.displayName = "SessionIndicator";
