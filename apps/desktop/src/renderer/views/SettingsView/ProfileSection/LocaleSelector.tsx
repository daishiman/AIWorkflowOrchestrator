/**
 * LocaleSelector コンポーネント
 *
 * ロケール（言語）選択UIコンポーネント
 */

import React, { useCallback, useState } from "react";
import clsx from "clsx";
import { Icon } from "../../../components/atoms/Icon";
import type { Locale } from "@repo/shared/types/auth";

// サポートするロケール
const SUPPORTED_LOCALES: {
  value: Locale;
  label: string;
  nativeLabel: string;
}[] = [
  { value: "ja", label: "日本語", nativeLabel: "日本語" },
  { value: "en", label: "English", nativeLabel: "English" },
  { value: "zh-CN", label: "简体中文", nativeLabel: "简体中文" },
  { value: "zh-TW", label: "繁體中文", nativeLabel: "繁體中文" },
  { value: "ko", label: "한국어", nativeLabel: "한국어" },
];

export interface LocaleSelectorProps {
  value: Locale;
  onChange: (locale: Locale) => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const LocaleSelector: React.FC<LocaleSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  isLoading = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // 現在のロケールのラベルを取得
  const currentLocale = SUPPORTED_LOCALES.find((l) => l.value === value);

  const handleSelect = useCallback(
    (locale: Locale) => {
      onChange(locale);
      setIsOpen(false);
    },
    [onChange],
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  }, []);

  const isDisabled = disabled || isLoading;

  return (
    <div
      className={clsx("relative", className)}
      data-testid="locale-selector"
      onKeyDown={handleKeyDown}
    >
      <label className="block text-sm font-medium text-white/80 mb-2">
        言語
      </label>

      {/* Current selection button */}
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="言語"
        disabled={isDisabled}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full flex items-center justify-between",
          "px-4 py-3 rounded-lg",
          "bg-white/5 border border-white/10",
          "text-white text-left",
          "transition-all duration-200",
          isDisabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-white/10 hover:border-white/20",
          isOpen && "ring-2 ring-[var(--status-primary)]",
        )}
      >
        <span lang={value}>{currentLocale?.label ?? value}</span>
        <Icon
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={16}
          className="text-white/50"
        />
      </button>

      {/* Dropdown */}
      {isOpen && !isDisabled && (
        <div
          role="listbox"
          className={clsx(
            "absolute z-[100] w-full mt-1",
            "bg-[var(--bg-secondary)] border border-white/10 rounded-lg",
            "shadow-xl overflow-hidden",
          )}
        >
          {SUPPORTED_LOCALES.map((locale) => (
            <button
              key={locale.value}
              role="option"
              aria-selected={value === locale.value}
              lang={locale.value}
              onClick={() => handleSelect(locale.value)}
              className={clsx(
                "w-full px-4 py-3 text-left",
                "transition-colors duration-150",
                "flex items-center justify-between",
                value === locale.value
                  ? "bg-[var(--status-primary)] text-white"
                  : "text-white/80 hover:bg-white/10",
              )}
            >
              <span>{locale.label}</span>
              {value === locale.value && <Icon name="check" size={16} />}
            </button>
          ))}
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
            className="animate-spin text-white/50"
          />
        </div>
      )}
    </div>
  );
};

LocaleSelector.displayName = "LocaleSelector";
