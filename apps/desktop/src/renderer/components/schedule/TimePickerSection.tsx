/**
 * @file TimePickerSection.tsx
 * @description 時・分ドロップダウン
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
 */

import React, { memo } from "react";
import clsx from "clsx";

interface TimePickerSectionProps {
  hour: number;
  minute: number;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  disabled?: boolean;
  showHour?: boolean;
  showMinute?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const selectClass = clsx(
  "px-2 py-1.5 rounded-lg text-sm",
  "bg-white/5 border border-white/10 text-white",
  "focus:outline-none focus:ring-2 focus:ring-blue-500",
);

export const TimePickerSection: React.FC<TimePickerSectionProps> = memo(
  ({
    hour,
    minute,
    onHourChange,
    onMinuteChange,
    disabled = false,
    showHour = true,
    showMinute = true,
  }) => {
    return (
      <div className="flex items-center gap-2">
        <label className="text-sm text-[var(--text-secondary)]">時刻</label>
        {showHour && (
          <select
            aria-label="時"
            value={hour}
            disabled={disabled}
            onChange={(e) => onHourChange(Number(e.target.value))}
            className={clsx(
              selectClass,
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, "0")}
              </option>
            ))}
          </select>
        )}
        {showHour && showMinute && (
          <span className="text-[var(--text-secondary)]">:</span>
        )}
        {showMinute && (
          <select
            aria-label="分"
            value={minute}
            disabled={disabled}
            onChange={(e) => onMinuteChange(Number(e.target.value))}
            className={clsx(
              selectClass,
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
            {MINUTES.map((m) => (
              <option key={m} value={m}>
                {String(m).padStart(2, "0")}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  },
);

TimePickerSection.displayName = "TimePickerSection";
