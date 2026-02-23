import React, { memo } from "react";
import clsx from "clsx";
import { Icon, type IconName } from "../Icon";

export interface SuggestionBubbleProps {
  label: string;
  icon?: string;
  onClick: () => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

const sizeStyles: Record<NonNullable<SuggestionBubbleProps["size"]>, string> = {
  sm: "h-9 text-sm px-4",
  md: "h-11 text-sm px-5",
  lg: "h-14 text-base px-6",
};

const iconSizes: Record<NonNullable<SuggestionBubbleProps["size"]>, number> = {
  sm: 16,
  md: 16,
  lg: 20,
};

const SuggestionBubbleComponent: React.FC<SuggestionBubbleProps> = ({
  label,
  icon,
  onClick,
  size = "md",
  disabled = false,
}) => {
  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      if (e.key === " ") {
        e.preventDefault();
      }
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      className={clsx(
        "inline-flex items-center gap-2",
        "rounded-full",
        "bg-[var(--bg-tertiary)]",
        "border border-[var(--border-subtle)]",
        "text-[var(--text-primary)]",
        "transition-all duration-200",
        sizeStyles[size],
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:scale-[1.02] hover:bg-[var(--bg-elevated)] hover:shadow-sm active:scale-[0.98]",
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {icon && (
        <Icon
          name={icon as IconName}
          size={iconSizes[size]}
          className="text-[var(--text-secondary)]"
        />
      )}
      <span>{label}</span>
    </div>
  );
};

export const SuggestionBubble = memo(SuggestionBubbleComponent);
SuggestionBubble.displayName = "SuggestionBubble";
