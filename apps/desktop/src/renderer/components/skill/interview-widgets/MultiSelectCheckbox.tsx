import { useCallback } from "react";
import type { SkillCreatorUserInputOption } from "@repo/shared/types/skillCreator";

export interface MultiSelectCheckboxProps {
  options: SkillCreatorUserInputOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  disabled?: boolean;
}

export function MultiSelectCheckbox({
  options,
  selectedIds,
  onToggle,
  disabled,
}: MultiSelectCheckboxProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, optionId: string) => {
      if (e.key === " ") {
        e.preventDefault();
        onToggle(optionId);
      }
    },
    [onToggle],
  );

  return (
    <div
      className="mt-3 space-y-2"
      role="group"
      data-testid="multi-select-checkbox"
    >
      {options.map((option) => (
        <label
          key={option.id}
          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
            selectedIds.includes(option.id)
              ? "border-[var(--status-primary)] bg-[var(--status-primary)]/5"
              : "border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-[var(--status-primary)]/50"
          } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          data-testid={`checkbox-${option.id}`}
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(option.id)}
            onChange={() => onToggle(option.id)}
            onKeyDown={(e) => handleKeyDown(e, option.id)}
            disabled={disabled}
            className="h-4 w-4 rounded border-[var(--border-primary)] text-[var(--status-primary)] focus:ring-[var(--status-primary)]"
          />
          <span className="text-sm text-[var(--text-primary)]">
            {option.label}
          </span>
          {option.description ? (
            <span className="text-xs text-[var(--text-secondary)]">
              {option.description}
            </span>
          ) : null}
        </label>
      ))}
    </div>
  );
}
