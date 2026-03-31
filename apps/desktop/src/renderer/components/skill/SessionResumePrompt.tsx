/**
 * @file SessionResumePrompt.tsx
 * @description 未完了セッション検出時の復元プロンプト（インラインバナー）
 * TASK-P0-08: session-resume-renderer-integration
 */

import { memo, useCallback } from "react";
import type { SkillCreatorSessionListItem } from "@repo/shared/types";
import type {
  SkillCreatorCheckpointType,
  SkillCreatorWorkflowPhase,
  ResumeCompatibilityStatus,
} from "@repo/shared/types";

export type SessionListItem = SkillCreatorSessionListItem;

export interface SessionResumePromptProps {
  sessions: SessionListItem[];
  isLoading: boolean;
  onResume: (checkpointId: string) => void;
  onSkip: () => void;
  onDelete: (checkpointId: string) => void;
}

const phaseLabels: Record<SkillCreatorWorkflowPhase, string> = {
  plan: "計画",
  review: "レビュー",
  execute: "実行",
  verify: "検証",
  improve: "改善",
  handoff: "引き渡し",
};

const checkpointTypeLabels: Record<SkillCreatorCheckpointType, string> = {
  "review-ready": "レビュー準備完了",
  "execute-complete": "実行完了",
  "verify-fail": "検証失敗",
  "handoff-ready": "引き渡し準備完了",
};

function formatElapsedTime(timestampMs: number): string {
  const elapsed = Date.now() - timestampMs;
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  return `${days}日前`;
}

function compatibilityBadge(status: ResumeCompatibilityStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case "compatible":
      return {
        label: "復元可能",
        className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      };
    case "compatible_with_warning":
      return {
        label: "警告あり",
        className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      };
    case "incompatible":
      return {
        label: "非互換",
        className: "bg-[var(--status-error)]/10 text-[var(--status-error)]",
      };
    case "conflict":
      return {
        label: "競合",
        className: "bg-[var(--status-error)]/10 text-[var(--status-error)]",
      };
  }
}

export const SessionResumePrompt = memo<SessionResumePromptProps>(
  ({ sessions, isLoading, onResume, onSkip, onDelete }) => {
    const handleResume = useCallback(
      (checkpointId: string) => () => onResume(checkpointId),
      [onResume],
    );

    const handleDelete = useCallback(
      (checkpointId: string) => (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(checkpointId);
      },
      [onDelete],
    );

    if (isLoading) {
      return (
        <div
          className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-3"
          data-testid="session-resume-loading"
        >
          <p className="text-sm text-[var(--text-secondary)]">
            セッションを確認中...
          </p>
        </div>
      );
    }

    if (sessions.length === 0) {
      return null;
    }

    return (
      <div
        className="space-y-3 rounded-xl border border-[var(--status-primary)]/30 bg-[var(--status-primary)]/5 px-4 py-3"
        data-testid="session-resume-prompt"
        role="region"
        aria-label="セッション復元"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[var(--text-primary)]">
            前回のセッションを復元しますか？
          </h3>
          <button
            type="button"
            onClick={onSkip}
            className="rounded-md px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
            data-testid="session-resume-skip"
          >
            スキップ
          </button>
        </div>

        <ul className="space-y-2" role="list">
          {sessions.map((session) => {
            const badge = compatibilityBadge(session.compatibility.status);
            const canResume =
              session.compatibility.status === "compatible" ||
              session.compatibility.status === "compatible_with_warning";

            return (
              <li
                key={session.checkpointId}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2"
                data-testid={`session-item-${session.checkpointId}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-[var(--text-primary)]">
                      {phaseLabels[session.currentPhase]} —{" "}
                      {checkpointTypeLabels[session.checkpointType]}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                    {formatElapsedTime(session.updatedAt)} ·{" "}
                    <span className="font-mono">
                      {session.planId.slice(0, 8)}
                    </span>
                  </p>
                  {session.compatibility.warnings.length > 0 && (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      {session.compatibility.warnings[0]}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {canResume && (
                    <button
                      type="button"
                      onClick={handleResume(session.checkpointId)}
                      className="rounded-md bg-[var(--status-primary)] px-3 py-1.5 text-xs font-medium text-[var(--text-inverse)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      data-testid={`session-resume-btn-${session.checkpointId}`}
                    >
                      復元
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleDelete(session.checkpointId)}
                    className="rounded-md border border-[var(--border-primary)] px-2 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                    aria-label={`セッション ${session.checkpointId.slice(0, 8)} を削除`}
                    data-testid={`session-delete-btn-${session.checkpointId}`}
                  >
                    削除
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  },
);

SessionResumePrompt.displayName = "SessionResumePrompt";
