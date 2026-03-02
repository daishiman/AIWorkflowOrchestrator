/**
 * PeriodSelector - 期間選択コンポーネント（Molecule）
 *
 * トレンドデータの期間プリセットを選択するボタングループ。
 *
 * @module PeriodSelector
 */

import React, { memo } from "react";
import clsx from "clsx";
import type { PeriodPreset } from "../hooks/useAnalyticsTrend";

export interface PeriodSelectorProps {
  /** 現在選択中の期間 */
  selectedPeriod: PeriodPreset;
  /** 期間変更ハンドラ */
  onPeriodChange: (period: PeriodPreset) => void;
  /** 追加のクラス名 */
  className?: string;
}

/** 期間プリセットのラベル定義 */
export const periodLabels: Record<PeriodPreset, string> = {
  "7d": "7日",
  "30d": "30日",
  "90d": "90日",
  "1y": "1年",
  all: "全期間",
};

/** プリセット一覧 */
const presets: PeriodPreset[] = ["7d", "30d", "90d", "1y", "all"];

export const PeriodSelector: React.FC<PeriodSelectorProps> = memo(
  ({ selectedPeriod, onPeriodChange, className }) => {
    return (
      <div
        className={clsx(
          "flex gap-1 rounded-lg bg-[var(--bg-secondary)] p-1",
          className,
        )}
        role="group"
        aria-label="期間選択"
        data-testid="period-selector"
      >
        {presets.map((preset) => {
          const isSelected = preset === selectedPeriod;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onPeriodChange(preset)}
              className={clsx(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-[var(--duration-default)]",
                isSelected
                  ? "bg-[var(--status-primary)] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]",
              )}
              aria-pressed={isSelected}
              data-testid={`period-${preset}`}
            >
              {periodLabels[preset]}
            </button>
          );
        })}
      </div>
    );
  },
);

PeriodSelector.displayName = "PeriodSelector";
