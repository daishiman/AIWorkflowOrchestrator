import React, { useCallback, useMemo, useRef } from "react";
import clsx from "clsx";
import { Icon } from "../../atoms/Icon";
import type { ThemeSelectorProps, ThemeOption } from "./types";
import type { ThemeMode } from "../../../store/types";

const THEME_OPTIONS: ThemeOption[] = [
  {
    mode: "light",
    label: "ライト",
    icon: "sun",
    description: "常にライトテーマを使用",
  },
  {
    mode: "dark",
    label: "ダーク",
    icon: "moon",
    description: "常にダークテーマを使用",
  },
  {
    mode: "system",
    label: "システム",
    icon: "monitor",
    description: "OSの設定に従う",
  },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  value,
  onChange,
  size = "md",
  disabled = false,
  fullWidth = false,
  showLabels = true,
  className,
  "aria-labelledby": ariaLabelledby,
}) => {
  // Refs for keyboard navigation
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Size-based styles
  const sizeStyles = useMemo(
    () => ({
      sm: { button: "h-8 px-3 text-xs gap-1.5", icon: 14 },
      md: { button: "h-10 px-4 text-sm gap-2", icon: 16 },
      lg: { button: "h-12 px-6 text-base gap-2.5", icon: 18 },
    }),
    [],
  );

  const currentSizeStyle = sizeStyles[size];

  // Handle option click
  const handleClick = useCallback(
    (mode: ThemeMode) => {
      if (!disabled) {
        onChange(mode);
      }
    },
    [disabled, onChange],
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      if (disabled) return;

      let nextIndex: number | null = null;

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          nextIndex = (index + 1) % THEME_OPTIONS.length;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          nextIndex = (index - 1 + THEME_OPTIONS.length) % THEME_OPTIONS.length;
          break;
        case " ":
        case "Enter":
          event.preventDefault();
          onChange(THEME_OPTIONS[index].mode);
          return;
      }

      if (nextIndex !== null) {
        buttonRefs.current[nextIndex]?.focus();
      }
    },
    [disabled, onChange],
  );

  return (
    <div
      role="radiogroup"
      aria-labelledby={ariaLabelledby}
      className={clsx(
        "flex gap-1 p-1 rounded-lg",
        "bg-white/5 border border-white/10",
        fullWidth && "w-full",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {THEME_OPTIONS.map((option, index) => {
        const isSelected = value === option.mode;

        return (
          <button
            key={option.mode}
            ref={(el) => (buttonRefs.current[index] = el)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={option.label}
            aria-description={option.description}
            disabled={disabled}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => handleClick(option.mode)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={clsx(
              // Base styles
              "flex items-center justify-center rounded-md",
              "transition-all duration-200 ease-out",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "focus-visible:ring-[#0a84ff]",
              currentSizeStyle.button,
              fullWidth && "flex-1",

              // State styles
              isSelected
                ? // Selected state
                  "bg-[#0a84ff] text-white ring-2 ring-[#0a84ff]/30"
                : // Unselected state
                  clsx(
                    "bg-transparent text-white/60",
                    !disabled && "hover:bg-white/10 hover:text-white/80",
                  ),

              // Disabled state
              disabled && "cursor-not-allowed",
            )}
          >
            <Icon
              name={option.icon}
              size={currentSizeStyle.icon}
              data-testid={`theme-icon-${option.icon}`}
              aria-hidden="true"
            />
            {showLabels && <span>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
};

export type { ThemeSelectorProps, ThemeOption } from "./types";
