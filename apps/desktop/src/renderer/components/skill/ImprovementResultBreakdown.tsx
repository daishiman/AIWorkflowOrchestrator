/**
 * @file ImprovementResultBreakdown.tsx
 * @description 改善実行結果の内訳表示コンポーネント
 *
 * ImprovementResult の applied / skipped / errors を一覧表示する。
 * 改善実行直後の再分析前にユーザーが結果内訳を確認できるようにする。
 */

import React, { memo } from "react";
import clsx from "clsx";
import type {
  AppliedImprovement,
  ImprovementResult,
} from "@repo/shared/types/skill-improver";

export interface ImprovementResultBreakdownProps {
  result: ImprovementResult;
}

type AppliedResultVariant = AppliedImprovement["result"];

const resultLabelMap: Record<AppliedResultVariant, string> = {
  success: "成功",
  partial: "一部成功",
  failed: "失敗",
};

const resultBadgeStyleMap: Record<AppliedResultVariant, string> = {
  success: "bg-[var(--status-success)]/12 text-[var(--status-success)]",
  partial: "bg-[var(--status-warning)]/12 text-[var(--status-warning)]",
  failed: "bg-[var(--status-error)]/12 text-[var(--status-error)]",
};

const formatExecutedAt = (value: Date | string): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "実行時刻不明";
  }
  return date.toLocaleString("ja-JP", {
    hour12: false,
  });
};

const SummaryChip = ({
  label,
  count,
  className,
}: {
  label: string;
  count: number;
  className: string;
}) => {
  return (
    <div
      className={clsx(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
        className,
      )}
    >
      <span>{label}</span>
      <span className="rounded-full bg-[var(--bg-primary)] px-2 py-0.5 text-[var(--text-primary)]">
        {count}
      </span>
    </div>
  );
};

export const ImprovementResultBreakdown: React.FC<ImprovementResultBreakdownProps> =
  memo(({ result }) => {
    const hasApplied = result.applied.length > 0;
    const hasSkipped = result.skipped.length > 0;
    const hasErrors = result.errors.length > 0;

    return (
      <section
        data-testid="improvement-result-breakdown"
        role="status"
        aria-live="polite"
        className="flex flex-col gap-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              改善実行結果
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              {formatExecutedAt(result.executedAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <SummaryChip
              label="成功"
              count={
                result.applied.filter((item) => item.result === "success")
                  .length
              }
              className="bg-[var(--status-success)]/8 text-[var(--status-success)]"
            />
            <SummaryChip
              label="スキップ"
              count={result.skipped.length}
              className="bg-[var(--status-warning)]/10 text-[var(--status-warning)]"
            />
            <SummaryChip
              label="失敗"
              count={result.errors.length}
              className="bg-[var(--status-error)]/10 text-[var(--status-error)]"
            />
          </div>
        </div>

        {!hasApplied && !hasSkipped && !hasErrors && (
          <p className="rounded-lg bg-[var(--bg-secondary)] p-3 text-sm text-[var(--text-secondary)]">
            変更対象はありませんでした。
          </p>
        )}

        {hasApplied && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              適用済み
            </h3>
            <ul className="space-y-2" role="list" aria-label="適用済み提案一覧">
              {result.applied.map((item, index) => (
                <li
                  key={`${item.suggestion.description}-${index}`}
                  className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2"
                >
                  <p className="min-w-0 flex-1 text-sm text-[var(--text-primary)]">
                    {item.suggestion.description}
                  </p>
                  <span
                    className={clsx(
                      "inline-flex shrink-0 rounded-full px-2 py-1 text-xs font-semibold",
                      resultBadgeStyleMap[item.result],
                    )}
                  >
                    {resultLabelMap[item.result]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasSkipped && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              スキップ
            </h3>
            <ul className="space-y-2" role="list" aria-label="スキップ提案一覧">
              {result.skipped.map((suggestion, index) => (
                <li
                  key={`${suggestion.description}-${index}`}
                  className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)]"
                >
                  {suggestion.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasErrors && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--status-error)]">
              失敗
            </h3>
            <ul className="space-y-2" role="list" aria-label="失敗提案一覧">
              {result.errors.map((entry, index) => (
                <li
                  key={`${entry.suggestion.description}-${index}`}
                  className="rounded-lg border border-[var(--status-error)]/30 bg-[var(--status-error)]/5 px-3 py-2"
                >
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {entry.suggestion.description}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--status-error)]">
                    {entry.error}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    );
  });

ImprovementResultBreakdown.displayName = "ImprovementResultBreakdown";
