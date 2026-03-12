/**
 * TimezoneSelector コンポーネント
 *
 * タイムゾーン選択UIコンポーネント
 */

import React, { useCallback, useMemo, useState } from "react";
import clsx from "clsx";
import { Icon } from "../../../components/atoms/Icon";

// よく使うタイムゾーン
const COMMON_TIMEZONES = [
  { value: "Asia/Tokyo", label: "日本標準時 (JST)", offset: "+09:00" },
  { value: "America/New_York", label: "米国東部時間 (EST)", offset: "-05:00" },
  {
    value: "America/Los_Angeles",
    label: "米国太平洋時間 (PST)",
    offset: "-08:00",
  },
  { value: "Europe/London", label: "英国時間 (GMT)", offset: "+00:00" },
  {
    value: "Europe/Paris",
    label: "中央ヨーロッパ時間 (CET)",
    offset: "+01:00",
  },
  { value: "Asia/Shanghai", label: "中国標準時 (CST)", offset: "+08:00" },
  { value: "Asia/Seoul", label: "韓国標準時 (KST)", offset: "+09:00" },
  {
    value: "Australia/Sydney",
    label: "オーストラリア東部時間 (AEST)",
    offset: "+10:00",
  },
];

export interface TimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  isLoading = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 現在のタイムゾーンのラベルを取得
  const currentLabel = useMemo(() => {
    const found = COMMON_TIMEZONES.find((tz) => tz.value === value);
    return found?.label ?? value;
  }, [value]);

  // 検索結果をフィルタリング
  const filteredTimezones = useMemo(() => {
    if (!searchQuery) return COMMON_TIMEZONES;
    const query = searchQuery.toLowerCase();
    return COMMON_TIMEZONES.filter(
      (tz) =>
        tz.value.toLowerCase().includes(query) ||
        tz.label.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  // 現在時刻のプレビュー
  const currentTimePreview = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("ja-JP", {
        timeZone: value,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date());
    } catch {
      return "--:--";
    }
  }, [value]);

  const handleSelect = useCallback(
    (timezone: string) => {
      onChange(timezone);
      setIsOpen(false);
      setSearchQuery("");
    },
    [onChange],
  );

  const handleDetectTimezone = useCallback(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    onChange(detected);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchQuery("");
    }
  }, []);

  const isDisabled = disabled || isLoading;

  return (
    <div
      className={clsx("relative", className)}
      data-testid="timezone-selector"
      onKeyDown={handleKeyDown}
    >
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
        タイムゾーン
      </label>

      {/* Current selection button */}
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="タイムゾーン"
        disabled={isDisabled}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full flex items-center justify-between",
          "px-4 py-3 rounded-lg",
          "bg-[color-mix(in_srgb,var(--bg-tertiary)_80%,var(--bg-primary))]",
          "border border-[var(--border-primary)]",
          "text-[var(--text-primary)] text-left",
          "transition-all duration-200",
          isDisabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-[var(--bg-hover)] hover:border-[var(--border-emphasis)]",
          isOpen && "ring-2 ring-[var(--status-primary)]",
        )}
      >
        <div className="flex-1">
          <span className="block">{currentLabel}</span>
          <span className="text-xs text-[var(--text-muted)]">
            現在の時刻: {currentTimePreview}
          </span>
        </div>
        <Icon
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={16}
          className="text-[var(--text-muted)]"
        />
      </button>

      {/* Detect timezone button */}
      <button
        type="button"
        onClick={handleDetectTimezone}
        disabled={isDisabled}
        aria-label="現在地"
        className={clsx(
          "mt-2 px-3 py-1.5 rounded-md text-sm",
          "bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-secondary)]",
          "transition-all duration-200",
          isDisabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
        )}
      >
        <Icon name="map-pin" size={14} className="inline mr-1" />
        現在地のタイムゾーンを使用
      </button>

      {/* Dropdown */}
      {isOpen && !isDisabled && (
        <div
          role="listbox"
          className={clsx(
            "absolute z-[100] w-full mt-1",
            "bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg",
            "shadow-xl max-h-64 overflow-auto",
          )}
        >
          {/* Search input */}
          <div className="sticky top-0 p-2 bg-[var(--bg-primary)] border-b border-[var(--border-primary)]">
            <input
              type="text"
              placeholder="検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={clsx(
                "w-full px-3 py-2 rounded-md",
                "bg-[var(--bg-tertiary)] border border-[var(--border-primary)]",
                "text-[var(--text-primary)] placeholder-[var(--text-muted)]",
                "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)]",
              )}
              autoFocus
            />
          </div>

          {/* Options */}
          {filteredTimezones.map((tz) => (
            <button
              key={tz.value}
              role="option"
              aria-selected={value === tz.value}
              onClick={() => handleSelect(tz.value)}
              className={clsx(
                "w-full px-4 py-3 text-left",
                "transition-colors duration-150",
                value === tz.value
                  ? "bg-[var(--status-primary)] text-[var(--text-inverse)]"
                  : "text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
              )}
            >
              <span className="block">{tz.label}</span>
              <span className="text-xs opacity-60">
                {tz.value} ({tz.offset})
              </span>
            </button>
          ))}

          {filteredTimezones.length === 0 && (
            <div className="px-4 py-3 text-[var(--text-muted)] text-center">
              該当するタイムゾーンがありません
            </div>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div
          role="status"
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          <Icon
            name="loader-2"
            size={16}
            className="animate-spin text-[var(--text-muted)]"
          />
        </div>
      )}
    </div>
  );
};

TimezoneSelector.displayName = "TimezoneSelector";
