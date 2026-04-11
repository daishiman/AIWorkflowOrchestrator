/**
 * @file DayOfMonthSelector.tsx
 * @description 月次スケジュールの日付選択（1〜31グリッド）
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
 */

import React, { memo } from "react";
import clsx from "clsx";

interface DayOfMonthSelectorProps {
  value: number;
  onChange: (day: number) => void;
  disabled?: boolean;
}

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export const DayOfMonthSelector: React.FC<DayOfMonthSelectorProps> = memo(
  ({ value, onChange, disabled = false }) => {
    return (
      <div>
        <p className="text-sm text-[var(--text-secondary)] mb-1">日付</p>
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((day) => (
            <button
              key={day}
              type="button"
              aria-pressed={value === day}
              disabled={disabled}
              onClick={() => onChange(day)}
              className={clsx(
                "w-8 h-8 rounded text-xs border transition-colors",
                value === day
                  ? "bg-[var(--status-primary)] text-[var(--text-inverse)] border-[var(--status-primary)]"
                  : "border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]",
                disabled && "opacity-50 cursor-not-allowed pointer-events-none",
              )}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    );
  },
);

DayOfMonthSelector.displayName = "DayOfMonthSelector";
