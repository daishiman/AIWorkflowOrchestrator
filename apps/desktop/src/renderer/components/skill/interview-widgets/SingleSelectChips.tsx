import { useCallback, useRef, useEffect } from "react";
import type { SkillCreatorUserInputOption } from "@repo/shared/types/skillCreator";

export interface SingleSelectChipsProps {
  options: SkillCreatorUserInputOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function SingleSelectChips({
  options,
  selectedId,
  onSelect,
  disabled,
}: SingleSelectChipsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const first = containerRef.current?.querySelector("button");
    if (first && !selectedId) {
      first.focus();
    }
  }, [selectedId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, optionId: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(optionId);
      }
    },
    [onSelect],
  );

  return (
    <div
      ref={containerRef}
      className="mt-3 flex flex-wrap gap-2"
      role="radiogroup"
      data-testid="single-select-chips"
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={selectedId === option.id}
          disabled={disabled}
          onClick={() => onSelect(option.id)}
          onKeyDown={(e) => handleKeyDown(e, option.id)}
          className={`rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-primary)] focus-visible:ring-offset-2 ${
            selectedId === option.id
              ? "border-[var(--status-primary)] bg-[var(--status-primary)]/10 text-[var(--status-primary)] font-medium"
              : "border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:border-[var(--status-primary)]/50"
          } disabled:cursor-not-allowed disabled:opacity-50`}
          data-testid={`chip-${option.id}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
