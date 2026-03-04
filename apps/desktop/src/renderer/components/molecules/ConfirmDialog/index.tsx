import React, { memo, useEffect, useId, useRef } from "react";
import clsx from "clsx";
import { AlertTriangle } from "lucide-react";
import { Button } from "../../atoms/Button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    "button:not([disabled])",
    "[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");
  return Array.from(container.querySelectorAll<HTMLElement>(selectors));
}

const ConfirmDialogComponent: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "確認",
  cancelLabel = "キャンセル",
  isDestructive = false,
  isLoading = false,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const focusables = dialogRef.current
      ? getFocusableElements(dialogRef.current)
      : [];
    focusables[0]?.focus();

    const onKeyDown = (event: KeyboardEvent): void => {
      if (!dialogRef.current) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Enter" && !isLoading) {
        event.preventDefault();
        onConfirm();
        return;
      }

      if (event.key === "Tab") {
        const elements = getFocusableElements(dialogRef.current);
        if (elements.length === 0) {
          event.preventDefault();
          return;
        }

        const first = elements[0];
        const last = elements[elements.length - 1];
        const active = document.activeElement;

        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onClose, onConfirm, isLoading]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={clsx(
          "w-full max-w-[400px] rounded-[var(--radius-lg)] border border-[var(--border-subtle)]",
          "bg-[var(--bg-secondary)] p-5 shadow-[var(--shadow-lg)]",
        )}
      >
        <div className="mb-3 flex items-start gap-2">
          {isDestructive && (
            <AlertTriangle
              size={18}
              className="mt-0.5 text-[var(--status-warning)]"
              aria-hidden="true"
            />
          )}
          <div>
            <h2
              id={titleId}
              className="text-base font-semibold text-[var(--text-primary)]"
            >
              {title}
            </h2>
            <p
              id={descriptionId}
              className="mt-1 text-sm text-[var(--text-secondary)]"
            >
              {description}
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? "danger" : "primary"}
            onClick={onConfirm}
            loading={isLoading}
            className={isDestructive ? "bg-[var(--status-error)]" : undefined}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ConfirmDialog = memo(ConfirmDialogComponent);
ConfirmDialog.displayName = "ConfirmDialog";
