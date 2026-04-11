/**
 * @file WeekdaySelector.tsx
 * @description 曜日トグルボタン群（月〜日の7ボタン、表示順は月→日）
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
 */

import React, { memo } from "react";
import clsx from "clsx";
import type { Weekday } from "../../types/visualCronConfig";

interface WeekdaySelectorProps {
  value: Weekday[];
  onChange: (weekdays: Weekday[]) => void;
  disabled?: boolean;
}

const WEEKDAY_ITEMS: Array<{
  day: Weekday;
  label: string;
  ariaLabel: string;
}> = [
  { day: 1, label: "月", ariaLabel: "月曜日" },
  { day: 2, label: "火", ariaLabel: "火曜日" },
  { day: 3, label: "水", ariaLabel: "水曜日" },
  { day: 4, label: "木", ariaLabel: "木曜日" },
  { day: 5, label: "金", ariaLabel: "金曜日" },
  { day: 6, label: "土", ariaLabel: "土曜日" },
  { day: 0, label: "日", ariaLabel: "日曜日" },
];

export const WeekdaySelector: React.FC<WeekdaySelectorProps> = memo(
  ({ value, onChange, disabled = false }) => {
    const toggle = (day: Weekday) => {
      if (disabled) return;
      if (value.includes(day)) {
        onChange(value.filter((d) => d !== day));
      } else {
        onChange([...value, day]);
      }
    };

    return (
      <div className="flex flex-wrap gap-1" role="group" aria-label="曜日選択">
        {WEEKDAY_ITEMS.map(({ day, label, ariaLabel }) => {
          const isSelected = value.includes(day);
          return (
            <button
              key={day}
              type="button"
              aria-pressed={isSelected}
              aria-label={ariaLabel}
              disabled={disabled}
              onClick={() => toggle(day)}
              className={clsx(
                "w-9 h-9 rounded-full text-sm border transition-colors",
                isSelected
                  ? "bg-[var(--status-primary)] text-[var(--text-inverse)] border-[var(--status-primary)]"
                  : "border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]",
                disabled && "opacity-50 cursor-not-allowed pointer-events-none",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  },
);

WeekdaySelector.displayName = "WeekdaySelector";
