import React, { memo, useEffect, useId, useRef } from "react";
import clsx from "clsx";
import { AlertTriangle, Loader2 } from "lucide-react";

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
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    cancelButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent): void => {
      if (!dialogRef.current) {
        return;
      }

      if (event.key === "Escape") {
        if (isLoading) {
          return;
        }
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Enter") {
        if (isLoading) {
          return;
        }

        const active = document.activeElement;
        if (active === cancelButtonRef.current) {
          event.preventDefault();
          onClose();
          return;
        }

        if (active === confirmButtonRef.current) {
          event.preventDefault();
          onConfirm();
          return;
        }

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

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onClose, onConfirm, isLoading]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        data-testid="confirm-dialog-overlay"
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          if (!isLoading) {
            onClose();
          }
        }}
      />
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={clsx(
          "relative w-full max-w-[400px] rounded-[var(--radius-lg)] border border-[var(--border-subtle)]",
          "bg-[var(--bg-secondary)] p-5 shadow-[var(--shadow-lg)]",
        )}
      >
        <div className="mb-3 flex items-start gap-2">
          {isDestructive && (
            <AlertTriangle
              data-testid="confirm-destructive-icon"
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
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={clsx(
              "inline-flex h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium",
              "transition-colors duration-[var(--duration-fast)]",
              "bg-[var(--bg-tertiary)] text-[var(--text-primary)]",
              "hover:bg-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={clsx(
              "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium",
              "transition-colors duration-[var(--duration-fast)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              isDestructive
                ? "bg-[var(--status-error)] text-white hover:opacity-90"
                : "bg-[var(--status-primary)] text-white hover:opacity-90",
            )}
          >
            {isLoading && (
              <Loader2
                data-testid="confirm-loading-icon"
                size={14}
                className="animate-spin"
                aria-hidden="true"
              />
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ConfirmDialog = memo(ConfirmDialogComponent);
ConfirmDialog.displayName = "ConfirmDialog";
