/**
 * SummaryCard - サマリーカードコンポーネント（Molecule）
 *
 * 数値+ラベル+トレンドアイコンを表示する。
 *
 * @module SummaryCard
 */

import React, { memo } from "react";
import clsx from "clsx";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface SummaryCardProps {
  /** カードタイトル */
  title: string;
  /** 表示値 */
  value: string | number;
  /** アイコンReactNode */
  icon: React.ReactNode;
  /** トレンド方向（上昇/下降/なし） */
  trend?: "up" | "down" | "neutral";
  /** トレンドのラベル */
  trendLabel?: string;
  /** 追加のクラス名 */
  className?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = memo(
  ({ title, value, icon, trend, trendLabel, className }) => {
    return (
      <div
        className={clsx(
          "rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)]",
          "p-4 shadow-sm transition-shadow duration-[var(--duration-default)] hover:shadow-md",
          className,
        )}
        data-testid="summary-card"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="text-[var(--text-muted)]" aria-hidden="true">
            {icon}
          </div>
          {trend && trend !== "neutral" && (
            <div
              className={clsx(
                "flex items-center gap-1 text-xs font-medium",
                trend === "up"
                  ? "text-[var(--status-success)]"
                  : "text-[var(--status-error)]",
              )}
              data-testid={`trend-${trend}`}
            >
              {trend === "up" ? (
                <TrendingUp size={12} aria-hidden="true" />
              ) : (
                <TrendingDown size={12} aria-hidden="true" />
              )}
              {trendLabel && <span>{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
          {value}
        </div>
        <div className="text-xs text-[var(--text-muted)]">{title}</div>
      </div>
    );
  },
);

SummaryCard.displayName = "SummaryCard";
