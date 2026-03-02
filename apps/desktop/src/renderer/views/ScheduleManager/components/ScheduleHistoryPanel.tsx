import React, { memo } from "react";
import clsx from "clsx";
import type { ScheduledRunResult } from "@repo/shared/types/skill-schedule";
import { Icon } from "../../../components/atoms/Icon";

export interface ScheduleHistoryPanelProps {
  /** 実行履歴配列（最新が先頭） */
  runHistory: ScheduledRunResult[];
  /** スケジュールID（テスト用testid生成に使用） */
  scheduleId: string;
}

/**
 * 日時文字列を読みやすい形式にフォーマットする
 */
function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return isoString;
  }
}

/**
 * 実行時間を計算して読みやすい形式で返す
 */
function formatDuration(
  startedAt: string,
  completedAt?: string | null,
): string {
  if (!completedAt) return "実行中";
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  const durationMs = end - start;

  if (durationMs < 1000) return `${durationMs}ms`;
  if (durationMs < 60000) return `${Math.round(durationMs / 1000)}秒`;
  return `${Math.round(durationMs / 60000)}分`;
}

/**
 * ScheduleHistoryPanel - 実行履歴パネルコンポーネント
 *
 * スケジュール実行の履歴をタイムライン形式で表示する。
 * 成功/失敗のステータス、実行時間、エラーメッセージを含む。
 */
export const ScheduleHistoryPanel: React.FC<ScheduleHistoryPanelProps> = memo(
  ({ runHistory, scheduleId }) => {
    if (runHistory.length === 0) {
      return (
        <div
          data-testid={`history-panel-${scheduleId}`}
          className="px-4 py-3 text-sm text-[var(--text-muted)]"
        >
          実行履歴はありません
        </div>
      );
    }

    return (
      <div
        data-testid={`history-panel-${scheduleId}`}
        className="px-4 py-3 space-y-2"
      >
        <h4 className="text-xs font-medium text-[var(--text-secondary)] mb-2">
          実行履歴（最新{Math.min(runHistory.length, 10)}件）
        </h4>
        <div className="space-y-1">
          {runHistory.slice(0, 10).map((run) => (
            <div
              key={run.runId}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm",
                "bg-[var(--bg-secondary)]",
              )}
            >
              <Icon
                name={run.success ? "check-circle" : "x-circle"}
                size={16}
                className={clsx(
                  run.success
                    ? "text-[var(--status-success)]"
                    : "text-[var(--status-error)]",
                )}
              />
              <span className="text-[var(--text-secondary)] flex-shrink-0">
                {formatDateTime(run.startedAt)}
              </span>
              <span className="text-[var(--text-muted)] text-xs">
                {formatDuration(run.startedAt, run.completedAt)}
              </span>
              {run.error && (
                <span className="text-[var(--status-error)] text-xs truncate ml-auto">
                  {run.error}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  },
);

ScheduleHistoryPanel.displayName = "ScheduleHistoryPanel";
