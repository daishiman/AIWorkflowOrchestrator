import React, { memo, useEffect } from "react";
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

const SlideInPanelComponent: React.FC<SlideInPanelProps> = ({
  isOpen,
  onClose,
  side,
  width = "400px",
  title,
  children,
  showOverlay = true,
}) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      {showOverlay && (
        <button
          type="button"
          aria-label="オーバーレイを閉じる"
          className="absolute inset-0 bg-black/30"
          onClick={onClose}
        />
      )}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "スライドパネル"}
        className={clsx(
          "absolute top-0 h-full bg-[var(--bg-secondary)]",
          "transition-transform duration-[250ms] ease-out",
          "border-[var(--border-default)]",
          "translate-x-0",
          side === "right" && "right-0 border-l",
          side === "left" && "left-0 border-r",
        )}
        style={{ width }}
      >
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
            <h2 className="text-sm font-medium text-[var(--text-primary)]">
              {title}
            </h2>
            <button
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
