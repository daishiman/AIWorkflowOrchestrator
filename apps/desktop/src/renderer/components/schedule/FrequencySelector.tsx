/**
 * @file FrequencySelector.tsx
 * @description 頻度選択セグメントコントロール（毎分/毎時/毎日/毎週/毎月/カスタム）
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
 */

import React, { memo } from "react";
import clsx from "clsx";
import type { FrequencyType } from "../../types/visualCronConfig";

interface FrequencySelectorProps {
  value: FrequencyType;
  onChange: (value: FrequencyType) => void;
  disabled?: boolean;
}

const FREQUENCY_OPTIONS: { value: FrequencyType; label: string }[] = [
  { value: "every-minute", label: "毎分" },
  { value: "every-hour", label: "毎時" },
  { value: "daily", label: "毎日" },
  { value: "weekly", label: "毎週" },
  { value: "monthly", label: "毎月" },
  { value: "custom", label: "カスタム" },
];

export const FrequencySelector: React.FC<FrequencySelectorProps> = memo(
  ({ value, onChange, disabled = false }) => {
    return (
      <div className="flex flex-wrap gap-1" role="group" aria-label="実行頻度">
        {FREQUENCY_OPTIONS.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => {
                if (!disabled) onChange(opt.value);
              }}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-sm border transition-colors",
                isSelected
                  ? "bg-[var(--status-primary)] text-[var(--text-inverse)] border-[var(--status-primary)]"
                  : "border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]",
                disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  },
);

FrequencySelector.displayName = "FrequencySelector";
