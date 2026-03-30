import { useCallback, useEffect } from "react";

export interface ConfirmButtonsProps {
  onConfirm: (value: boolean) => void;
  selected: boolean | null;
  disabled?: boolean;
}

export function ConfirmButtons({
  onConfirm,
  selected,
  disabled,
}: ConfirmButtonsProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "y" || e.key === "Y") {
        e.preventDefault();
        onConfirm(true);
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        onConfirm(false);
      }
    },
    [disabled, onConfirm],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="mt-3 flex gap-3" data-testid="confirm-buttons">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onConfirm(true)}
        className={`rounded-xl px-6 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-primary)] focus-visible:ring-offset-2 ${
          selected === true
            ? "bg-[var(--status-primary)] text-[var(--text-inverse)]"
            : "border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--status-primary)]/10"
        } disabled:cursor-not-allowed disabled:opacity-50`}
        data-testid="confirm-yes"
      >
        はい
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onConfirm(false)}
        className={`rounded-xl px-6 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-primary)] focus-visible:ring-offset-2 ${
          selected === false
            ? "bg-[var(--status-error)] text-[var(--text-inverse)]"
            : "border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--status-error)]/10"
        } disabled:cursor-not-allowed disabled:opacity-50`}
        data-testid="confirm-no"
      >
        いいえ
      </button>
    </div>
  );
}
