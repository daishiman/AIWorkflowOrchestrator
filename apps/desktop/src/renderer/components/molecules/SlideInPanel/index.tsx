import React, { memo, useEffect, useRef } from "react";
import clsx from "clsx";
import { X } from "lucide-react";

export interface SlideInPanelProps {
  isOpen: boolean;
  onClose: () => void;
  side: "right" | "left";
  width?: string;
  title?: string;
  children: React.ReactNode;
  showOverlay?: boolean;
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

const SlideInPanelComponent: React.FC<SlideInPanelProps> = ({
  isOpen,
  onClose,
  side,
  width = "400px",
  title,
  children,
  showOverlay = true,
}) => {
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent): void => {
      if (!panelRef.current) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const focusables = getFocusableElements(panelRef.current);
        if (focusables.length === 0) {
          event.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
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
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      {showOverlay && (
        <div
          data-testid="slide-in-panel-overlay"
          className="absolute inset-0 bg-black/30"
          onClick={onClose}
        />
      )}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "サイドパネル"}
        className={clsx(
          "absolute top-0 h-full bg-[var(--bg-secondary)]",
          "transition-transform duration-[250ms] ease-out",
          "border-[var(--border-default)]",
          "translate-x-0",
          side === "right" && "right-0 border-l",
          side === "left" && "left-0 border-r",
        )}
        style={{ width: `min(100vw, ${width})` }}
      >
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
            <h2 className="text-sm font-medium text-[var(--text-primary)]">
              {title ?? ""}
            </h2>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="閉じる"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-auto p-4">{children}</div>
        </div>
      </aside>
    </div>
  );
};

export const SlideInPanel = memo(SlideInPanelComponent);
SlideInPanel.displayName = "SlideInPanel";
