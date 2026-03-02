import React, { memo, useState, useCallback } from "react";
import clsx from "clsx";

export interface CronInputProps {
  /** 現在のcron式 */
  value: string;
  /** cron式が変更されたときのコールバック */
  onChange: (value: string) => void;
  /** 無効化フラグ */
  disabled?: boolean;
}

/** Cronプリセット定義 */
interface CronPreset {
  label: string;
  expression: string;
  description: string;
}

/** よく使われるcronプリセット */
const CRON_PRESETS: CronPreset[] = [
  { label: "毎分", expression: "* * * * *", description: "1分ごとに実行" },
  {
    label: "毎時",
    expression: "0 * * * *",
    description: "毎時0分に実行",
  },
  {
    label: "毎日9時",
    expression: "0 9 * * *",
    description: "毎日朝9時に実行",
  },
  {
    label: "毎日18時",
    expression: "0 18 * * *",
    description: "毎日夕方18時に実行",
  },
  {
    label: "平日9時",
    expression: "0 9 * * 1-5",
    description: "月〜金の朝9時に実行",
  },
  {
    label: "毎週月曜",
    expression: "0 9 * * 1",
    description: "毎週月曜の朝9時に実行",
  },
  {
    label: "毎月1日",
    expression: "0 0 1 * *",
    description: "毎月1日の0時に実行",
  },
];

/**
 * CronInput - Cron式入力支援コンポーネント
 *
 * プリセットドロップダウンとカスタム入力を組み合わせて、
 * cron式を人間が読みやすい形式で入力できるようにする。
 */
export const CronInput: React.FC<CronInputProps> = memo(
  ({ value, onChange, disabled = false }) => {
    const [isCustom, setIsCustom] = useState(
      !CRON_PRESETS.some((p) => p.expression === value),
    );

    const handlePresetChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        if (selected === "custom") {
          setIsCustom(true);
        } else {
          setIsCustom(false);
          onChange(selected);
        }
      },
      [onChange],
    );

    const handleCustomChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
      },
      [onChange],
    );

    const currentPreset = CRON_PRESETS.find((p) => p.expression === value);

    return (
      <div data-testid="cron-input" className="space-y-2">
        <label className="block text-sm text-[var(--text-secondary)]">
          Cron式
        </label>
        <select
          data-testid="cron-preset-select"
          value={isCustom ? "custom" : value}
          onChange={handlePresetChange}
          disabled={disabled}
          className={clsx(
            "w-full px-3 py-2 rounded-lg text-sm",
            "bg-white/5 border border-white/10 text-white",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          {CRON_PRESETS.map((preset) => (
            <option key={preset.expression} value={preset.expression}>
              {preset.label} ({preset.expression})
            </option>
          ))}
          <option value="custom">カスタム</option>
        </select>

        {isCustom && (
          <input
            data-testid="cron-custom-input"
            type="text"
            value={value}
            onChange={handleCustomChange}
            placeholder="0 9 * * *"
            disabled={disabled}
            aria-label="カスタムCron式"
            className={clsx(
              "w-full px-3 py-2 rounded-lg text-sm",
              "bg-white/5 border border-white/10 text-white",
              "placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          />
        )}

        {currentPreset && !isCustom && (
          <p className="text-xs text-[var(--text-muted)]">
            {currentPreset.description}
          </p>
        )}
      </div>
    );
  },
);

CronInput.displayName = "CronInput";
