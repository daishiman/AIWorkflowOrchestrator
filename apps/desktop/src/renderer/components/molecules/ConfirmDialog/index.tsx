import React, { useEffect, useId, useRef } from "react";
import clsx from "clsx";
import { AlertTriangle, Loader2 } from "lucide-react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  className?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "確認",
  cancelLabel = "キャンセル",
  isDestructive = false,
  isLoading = false,
  className,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusedElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!isLoading) {
          event.preventDefault();
          onClose();
        }
        return;
      }

      if (event.key === "Enter") {
        if (isLoading) {
          return;
        }
        event.preventDefault();
        if (document.activeElement === cancelButtonRef.current) {
          onClose();
        } else {
          onConfirm();
        }
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const previousElement = previousFocusedElementRef.current;
      if (previousElement && document.contains(previousElement)) {
        previousElement.focus();
      }
    };
  }, [isOpen, isLoading, onClose, onConfirm]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        data-testid="confirm-dialog-overlay"
        aria-hidden="true"
        className="fixed inset-0 z-[59] bg-black/40"
        onClick={() => {
          if (!isLoading) {
            onClose();
          }
        }}
      />

      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className={clsx(
            "w-[min(90vw,400px)] rounded-[var(--radius-lg)] bg-[var(--bg-primary)] p-6 shadow-lg",
            className,
          )}
        >
          <div className="mb-3 flex items-start gap-2">
            {isDestructive && (
              <AlertTriangle
                data-testid="confirm-destructive-icon"
                size={18}
                aria-hidden="true"
                className="mt-0.5 text-[var(--status-warning)]"
              />
            )}
            <h2
              id={titleId}
              className="text-lg font-semibold text-[var(--text-primary)]"
            >
              {title}
            </h2>
          </div>

          <p
            id={descriptionId}
            className="text-sm leading-relaxed text-[var(--text-secondary)]"
          >
            {description}
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={clsx(
                "rounded-md bg-[var(--bg-tertiary)] px-4 py-2 text-sm text-[var(--text-primary)]",
                "transition-colors hover:opacity-90",
                "focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--status-primary)]",
                "disabled:cursor-not-allowed disabled:opacity-50",
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
                "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm text-white",
                "transition-colors hover:opacity-90",
                "focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--status-primary)]",
                "disabled:cursor-not-allowed disabled:opacity-50",
                isDestructive
                  ? "bg-[var(--status-error)]"
                  : "bg-[var(--status-primary)]",
              )}
            >
              {isLoading && (
                <Loader2
                  data-testid="confirm-loading-icon"
                  size={16}
                  aria-hidden="true"
                  className="animate-spin"
                />
              )}
              <span>{confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

ConfirmDialog.displayName = "ConfirmDialog";
