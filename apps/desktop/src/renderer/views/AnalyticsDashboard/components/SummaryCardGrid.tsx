/**
 * SummaryCardGrid - サマリーカードグリッド（Organism）
 *
 * サマリーデータからカードグリッドを構成する。
 *
 * @module SummaryCardGrid
 */

import React, { memo } from "react";
import clsx from "clsx";
import { BarChart3, CheckCircle, XCircle, Clock } from "lucide-react";
import type { AnalyticsSummary } from "@repo/shared/types/skill-analytics";
import { SummaryCard } from "./SummaryCard";

export interface SummaryCardGridProps {
  /** サマリーデータ */
  summary: AnalyticsSummary;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * 成功率をパーセント文字列に変換する
 * @param rate 0-1 の成功率
 * @returns パーセント文字列（例: "95.2%"）
 */
function formatSuccessRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export const SummaryCardGrid: React.FC<SummaryCardGridProps> = memo(
  ({ summary, className }) => {
    const failureRate = 1 - summary.overallSuccessRate;

    return (
      <div
        className={clsx(
          "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
          className,
        )}
        data-testid="summary-card-grid"
      >
        <SummaryCard
          title="総実行回数"
          value={summary.totalExecutions.toLocaleString()}
          icon={<BarChart3 size={20} />}
          trend={summary.totalExecutions > 0 ? "up" : "neutral"}
        />
        <SummaryCard
          title="利用スキル数"
          value={summary.totalSkills}
          icon={<Clock size={20} />}
        />
        <SummaryCard
          title="成功率"
          value={formatSuccessRate(summary.overallSuccessRate)}
          icon={<CheckCircle size={20} />}
          trend={
            summary.overallSuccessRate >= 0.9
              ? "up"
              : summary.overallSuccessRate < 0.7
                ? "down"
                : "neutral"
          }
          trendLabel={
            summary.overallSuccessRate >= 0.9
              ? "良好"
              : summary.overallSuccessRate < 0.7
                ? "要改善"
                : undefined
          }
        />
        <SummaryCard
          title="失敗率"
          value={formatSuccessRate(failureRate)}
          icon={<XCircle size={20} />}
          trend={
            failureRate > 0.3 ? "down" : failureRate > 0 ? "neutral" : "up"
          }
          trendLabel={failureRate > 0.3 ? "注意" : undefined}
        />
      </div>
    );
  },
);

SummaryCardGrid.displayName = "SummaryCardGrid";
