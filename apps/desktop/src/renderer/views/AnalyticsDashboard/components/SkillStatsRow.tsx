/**
 * SkillStatsRow - 統計テーブル行コンポーネント（Molecule）
 *
 * 1つのスキルの統計情報を表示するテーブル行。
 *
 * @module SkillStatsRow
 */

import React, { memo } from "react";
import clsx from "clsx";
import type { SkillStatistics } from "@repo/shared/types/skill-analytics";

export interface SkillStatsRowProps {
  /** スキル統計データ */
  stat: SkillStatistics;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * 実行時間を読みやすい形式にフォーマットする
 * @param ms ミリ秒
 * @returns フォーマット済み文字列（例: "1.2s", "500ms"）
 */
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * 成功率をパーセント文字列に変換する
 * @param rate 0-1 の成功率
 * @returns パーセント文字列
 */
function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export const SkillStatsRow: React.FC<SkillStatsRowProps> = memo(
  ({ stat, className }) => {
    const isHighSuccess = stat.successRate >= 0.9;
    const isLowSuccess = stat.successRate < 0.7;

    return (
      <tr
        className={clsx(
          "border-b border-[var(--border-primary)] last:border-b-0",
          "hover:bg-[var(--bg-secondary)] transition-colors duration-[var(--duration-quick)]",
          className,
        )}
        data-testid="skill-stats-row"
      >
        <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
          {stat.skillName}
        </td>
        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] text-right">
          {stat.totalExecutions.toLocaleString()}
        </td>
        <td className="px-4 py-3 text-sm text-right">
          <span
            className={clsx(
              "font-medium",
              isHighSuccess && "text-[var(--status-success)]",
              isLowSuccess && "text-[var(--status-error)]",
              !isHighSuccess && !isLowSuccess && "text-[var(--text-secondary)]",
            )}
          >
            {formatRate(stat.successRate)}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] text-right">
          {formatDuration(stat.averageDuration)}
        </td>
        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] text-right">
          {stat.totalTokens.toLocaleString()}
        </td>
      </tr>
    );
  },
);

SkillStatsRow.displayName = "SkillStatsRow";
