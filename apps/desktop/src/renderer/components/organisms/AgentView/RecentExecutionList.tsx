import React from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { ExecutionSummary } from "../../../store/slices/agentSlice";
import { interactiveStyles } from "./styles";

export interface RecentExecutionListProps {
  executions: ExecutionSummary[];
  onSelectExecution: (executionId: string) => void;
  maxItems?: number;
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return "たった今";
  if (diffMinutes < 60) return `${diffMinutes}分前`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}時間前`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}日前`;
}

const StatusIcon: React.FC<{ status: ExecutionSummary["status"] }> = ({
  status,
}) => {
  switch (status) {
    case "completed":
      return (
        <CheckCircle
          data-testid="status-icon-completed"
          className="w-4 h-4 text-[var(--status-success)]"
        />
      );
    case "failed":
    case "cancelled":
      return (
        <XCircle
          data-testid={`status-icon-${status}`}
          className="w-4 h-4 text-[var(--status-error)]"
        />
      );
    case "executing":
      return (
        <Loader2
          data-testid="status-icon-executing"
          className="w-4 h-4 text-[var(--status-primary)] animate-spin"
        />
      );
  }
};

export const RecentExecutionList: React.FC<RecentExecutionListProps> = ({
  executions,
  onSelectExecution,
  maxItems = 3,
}) => {
  const displayedExecutions = executions.slice(0, maxItems);

  if (executions.length === 0) {
    return (
      <div className="text-center py-6 text-[var(--text-secondary)] text-sm">
        まだ実行履歴がありません
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {displayedExecutions.map((execution) => (
        <div
          key={execution.executionId}
          data-testid={`execution-item-${execution.executionId}`}
          onClick={() => onSelectExecution(execution.executionId)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectExecution(execution.executionId);
            }
          }}
          role="button"
          tabIndex={0}
          className={`flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] ${interactiveStyles.cardHover}`}
        >
          <StatusIcon status={execution.status} />
          <span className="flex-1 text-sm text-[var(--text-primary)] truncate">
            {execution.skillDisplayName}
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            {formatRelativeTime(execution.startedAt)}
          </span>
        </div>
      ))}
    </div>
  );
};

RecentExecutionList.displayName = "RecentExecutionList";
