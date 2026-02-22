import React, { memo } from "react";
import clsx from "clsx";
import { Icon, type IconName } from "../Icon";

export interface FilterChipProps {
  label: string;
  isSelected: boolean;
  count?: number;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
}

const FilterChipComponent: React.FC<FilterChipProps> = ({
  label,
  isSelected,
  count,
  icon,
  onClick,
  disabled = false,
}) => {
  const handleClick = (): void => {
    if (!disabled) {
      onClick();
    }
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isSelected}
      aria-disabled={disabled || undefined}
      onClick={handleClick}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5",
        "min-h-[36px] min-w-[36px]",
        "transition-all duration-[var(--duration-fast)]",
        "text-sm font-medium",
        isSelected
          ? "bg-[var(--status-primary)] text-[var(--text-inverse)]"
          : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      {icon && <Icon name={icon as IconName} size={14} />}
      <span>{label}</span>
      {count !== undefined && <span>({count})</span>}
    </button>
  );
};

export const FilterChip = memo(FilterChipComponent);
FilterChip.displayName = "FilterChip";
