/**
 * @file VisualCronPicker.tsx
 * @description ビジュアルスケジュールピッカー（制御コンポーネント）
 *
 * 使用者は value（cron文字列）と onChange を渡すだけでよい。
 * 内部で VisualCronConfig を保持し、変換・バリデーションを行う。
 *
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
 */

import React, { memo, useState, useCallback, useEffect, useRef } from "react";
import clsx from "clsx";
import type {
  FrequencyType,
  VisualCronConfig,
  Weekday,
} from "../../types/visualCronConfig";
import {
  visualConfigToCron,
  InvalidConfigError,
} from "../../utils/cronConverter";
import { cronToVisualConfig } from "../../utils/cronParser";
import { FrequencySelector } from "./FrequencySelector";
import { WeekdaySelector } from "./WeekdaySelector";
import { TimePickerSection } from "./TimePickerSection";
import { DayOfMonthSelector } from "./DayOfMonthSelector";
import { CronPreview } from "./CronPreview";

interface VisualCronPickerProps {
  /** 既存 cron 式（編集時の初期値） */
  value?: string;
  onChange: (cron: string) => void;
  disabled?: boolean;
  showAdvancedToggle?: boolean;
  className?: string;
}

const DEFAULT_CONFIG: VisualCronConfig = {
  frequency: "daily",
  hour: 9,
  minute: 0,
  weekdays: [1],
  dayOfMonth: 1,
};

function createCustomConfig(expression: string): VisualCronConfig {
  return {
    ...DEFAULT_CONFIG,
    frequency: "custom",
    rawCronExpression: expression.trim(),
  };
}

function initConfig(value?: string): VisualCronConfig {
  const trimmed = value?.trim();
  if (!trimmed) return DEFAULT_CONFIG;
  const parsed = cronToVisualConfig(trimmed);
  if (!parsed) return createCustomConfig(trimmed);
  return parsed;
}

export const VisualCronPicker: React.FC<VisualCronPickerProps> = memo(
  ({
    value,
    onChange,
    disabled = false,
    showAdvancedToggle = true,
    className,
  }) => {
    const [config, setConfig] = useState<VisualCronConfig>(() =>
      initConfig(value),
    );
    const [isAdvancedMode, setIsAdvancedMode] = useState(() => {
      const trimmed = value?.trim();
      if (!trimmed) return false;
      const parsed = cronToVisualConfig(trimmed);
      return parsed === null || parsed.frequency === "custom";
    });
    const [directInput, setDirectInput] = useState(value ?? "");
    const lastEmittedValueRef = useRef(value ?? "");

    // config が変わるたびに cron 式を計算して onChange を呼ぶ
    useEffect(() => {
      if (disabled || isAdvancedMode) return;
      let cron: string;
      try {
        cron = visualConfigToCron(config);
      } catch (e) {
        if (e instanceof InvalidConfigError) return; // 不正設定中は emit しない
        throw e;
      }
      if (cron === lastEmittedValueRef.current) return;
      lastEmittedValueRef.current = cron;
      onChange(cron);
    }, [config, disabled, isAdvancedMode, onChange]);

    // 親から value が更新された場合のみ内部状態へ同期する。
    useEffect(() => {
      const nextValue = value ?? "";
      if (nextValue === lastEmittedValueRef.current) return;

      lastEmittedValueRef.current = nextValue;

      const trimmed = nextValue.trim();
      if (!trimmed) {
        setConfig(DEFAULT_CONFIG);
        setDirectInput("");
        setIsAdvancedMode(false);
        return;
      }

      const parsed = cronToVisualConfig(trimmed);
      if (parsed) {
        setConfig(parsed);
        setDirectInput(nextValue);
        setIsAdvancedMode(parsed.frequency === "custom");
        return;
      }

      setConfig(createCustomConfig(trimmed));
      setDirectInput(nextValue);
      setIsAdvancedMode(true);
    }, [value]);

    const updateConfig = useCallback((partial: Partial<VisualCronConfig>) => {
      setConfig((prev) => ({ ...prev, ...partial }));
    }, []);

    const handleFrequencyChange = useCallback(
      (frequency: FrequencyType) => {
        if (disabled) return;
        if (frequency === "custom") {
          const currentCron = visualConfigToCron(config);
          setConfig((prev) => ({
            ...prev,
            frequency: "custom",
            rawCronExpression: currentCron,
          }));
          setDirectInput(currentCron);
          setIsAdvancedMode(true);
          return;
        }

        updateConfig({ frequency, rawCronExpression: undefined });
      },
      [config, disabled, updateConfig],
    );

    const handleAdvancedToggle = useCallback(() => {
      if (disabled) return;
      setIsAdvancedMode((prev) => {
        if (!prev) {
          // ビジュアル → 直接入力モードへ切替時、現在の cron 式をセット
          setDirectInput(visualConfigToCron(config));
          return true;
        }

        const trimmed = directInput.trim();
        const parsed = cronToVisualConfig(trimmed);
        if (parsed && parsed.frequency !== "custom") {
          setConfig(parsed);
          setDirectInput(visualConfigToCron(parsed));
          return false;
        }
        setConfig(parsed ?? createCustomConfig(trimmed));
        setDirectInput(trimmed);
        return true;
      });
    }, [config, disabled, directInput]);

    const handleDirectInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const val = e.target.value;
        setDirectInput(val);
        lastEmittedValueRef.current = val;
        onChange(val);
      },
      [disabled, onChange],
    );

    let currentCron: string;
    if (isAdvancedMode) {
      currentCron = directInput;
    } else {
      try {
        currentCron = visualConfigToCron(config);
      } catch (e) {
        if (e instanceof InvalidConfigError) {
          currentCron = ""; // 不正設定中はプレビューを空にする
        } else {
          throw e;
        }
      }
    }
    const showDirectInput = isAdvancedMode;

    const weeklyError =
      !isAdvancedMode &&
      config.frequency === "weekly" &&
      config.weekdays.length === 0;

    const showTimePicker =
      !isAdvancedMode &&
      config.frequency !== "every-minute" &&
      config.frequency !== "custom";
    const showWeekday = !isAdvancedMode && config.frequency === "weekly";
    const showDayOfMonth = !isAdvancedMode && config.frequency === "monthly";

    return (
      <div className={clsx("space-y-3", className)}>
        {/* 頻度セレクター */}
        {!isAdvancedMode && (
          <div>
            <p className="text-sm text-[var(--text-secondary)] mb-1">頻度</p>
            <FrequencySelector
              value={config.frequency}
              onChange={handleFrequencyChange}
              disabled={disabled}
            />
          </div>
        )}

        {/* 曜日セレクター（weekly のみ） */}
        {showWeekday && (
          <div>
            <p className="text-sm text-[var(--text-secondary)] mb-1">曜日</p>
            <WeekdaySelector
              value={config.weekdays}
              onChange={(days) => updateConfig({ weekdays: days as Weekday[] })}
              disabled={disabled}
            />
            {weeklyError && (
              <p role="alert" className="text-xs text-red-500 mt-1">
                曜日を1つ以上選択してください
              </p>
            )}
          </div>
        )}

        {/* 時刻ピッカー */}
        {showTimePicker && (
          <TimePickerSection
            hour={config.hour}
            minute={config.minute}
            onHourChange={(h) => updateConfig({ hour: h })}
            onMinuteChange={(m) => updateConfig({ minute: m })}
            disabled={disabled}
            showHour={config.frequency !== "every-hour"}
          />
        )}

        {/* 日付グリッド（monthly のみ） */}
        {showDayOfMonth && (
          <DayOfMonthSelector
            value={config.dayOfMonth}
            onChange={(day) => updateConfig({ dayOfMonth: day })}
            disabled={disabled}
          />
        )}

        {/* 直接入力モード */}
        {showDirectInput && (
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
              cron式（直接入力）
            </label>
            <input
              type="text"
              value={directInput}
              onChange={handleDirectInputChange}
              disabled={disabled}
              placeholder="0 9 * * *"
              aria-label="カスタムcron式"
              className={clsx(
                "w-full px-3 py-2 rounded-lg text-sm",
                "bg-white/5 border border-white/10 text-white",
                "placeholder:text-gray-400",
                !disabled &&
                  "focus:outline-none focus:ring-2 focus:ring-blue-500",
                disabled && "opacity-50 cursor-not-allowed",
              )}
            />
          </div>
        )}

        {/* プレビュー */}
        <CronPreview cronExpression={currentCron} />

        {/* 高度な設定トグル */}
        <button
          type="button"
          onClick={handleAdvancedToggle}
          disabled={disabled || !showAdvancedToggle}
          aria-hidden={!showAdvancedToggle}
          className={clsx(
            "text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline",
            disabled && "opacity-50 cursor-not-allowed",
            !showAdvancedToggle && "hidden",
          )}
        >
          {isAdvancedMode ? "ビジュアル設定に戻る" : "高度な設定"}
        </button>
      </div>
    );
  },
);

VisualCronPicker.displayName = "VisualCronPicker";
