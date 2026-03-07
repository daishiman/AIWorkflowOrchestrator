import React from "react";
import { Zap } from "lucide-react";
import { transitions } from "./animations";

export interface SkillChipProps {
  skillName: string;
  displayName: string;
  icon?: string;
  isSelected: boolean;
  onSelect: () => void;
  isDisabled?: boolean;
}

export const SkillChip: React.FC<SkillChipProps> = ({
  displayName,
  icon,
  isSelected,
  onSelect,
  isDisabled = false,
}) => {
  const handleClick = () => {
    if (!isDisabled) {
      onSelect();
    }
  };

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      aria-label={displayName}
      aria-disabled={isDisabled}
      tabIndex={isDisabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`flex flex-col items-center gap-2 cursor-pointer ${transitions.all} ${
        isDisabled ? "opacity-50 cursor-not-allowed" : ""
      } ${isSelected ? "ring-2 ring-[var(--status-primary)]" : ""} rounded-xl p-3`}
    >
      <div
        data-testid="skill-chip-icon"
        className={`w-[80px] h-[80px] rounded-full flex items-center justify-center bg-[var(--bg-tertiary)] ${
          isSelected
            ? "border-2 border-[var(--status-primary)]"
            : "border border-[var(--border-primary)]"
        }`}
      >
        {icon ? (
          <span className="text-2xl">{icon}</span>
        ) : (
          <Zap className="w-8 h-8 text-[var(--text-secondary)]" />
        )}
      </div>
      <span className="text-sm text-[var(--text-primary)] text-center leading-tight max-w-[80px] truncate">
        {displayName}
      </span>
    </div>
  );
};

SkillChip.displayName = "SkillChip";
