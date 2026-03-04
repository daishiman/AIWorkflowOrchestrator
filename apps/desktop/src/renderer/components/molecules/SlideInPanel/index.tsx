import React, { useEffect, useId, useRef } from "react";
import clsx from "clsx";
import { X } from "lucide-react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface SlideInPanelProps {
  isOpen: boolean;
  onClose: () => void;
  side: "right" | "left";
  width?: string;
  title?: string;
  children: React.ReactNode;
  showOverlay?: boolean;
  className?: string;
}

export const SlideInPanel: React.FC<SlideInPanelProps> = ({
  isOpen,
  onClose,
  side,
  width = "400px",
  title,
  children,
  showOverlay = false,
  className,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusedElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
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
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {showOverlay && (
        <div
          data-testid="slide-in-panel-overlay"
          aria-hidden="true"
          className="fixed inset-0 z-[49] bg-black/30"
          onClick={onClose}
        />
      )}

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "サイドパネル"}
        className={clsx(
          "fixed inset-y-0 z-50 flex h-full flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-xl",
          side === "right"
            ? "right-0 border-l border-[var(--border-default)]"
            : "left-0 border-r border-[var(--border-default)]",
          className,
        )}
        style={{ width: `min(100vw, ${width})` }}
      >
        <div className="flex items-center justify-between border-b border-[var(--border-default)] px-4 py-3">
          {title ? (
            <h2 id={titleId} className="text-base font-semibold">
              {title}
            </h2>
          ) : (
            <span />
          )}

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className={clsx(
              "inline-flex h-8 w-8 items-center justify-center rounded-md",
              "text-[var(--text-secondary)] transition-colors",
              "hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]",
              "focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--status-primary)]",
            )}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">{children}</div>
      </div>
    </>
  );
};

SlideInPanel.displayName = "SlideInPanel";
