import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Badge, Icon } from "../../../atoms";
import { NAV_DIMENSIONS } from "../../GlobalNavStrip/constants";
import type { DockViewType } from "../../../../navigation/navContract";
import type { NavItemConfig } from "../../GlobalNavStrip/types";

export interface MoreMenuProps {
  id?: string;
  items: readonly NavItemConfig[];
  currentView: DockViewType;
  isOpen: boolean;
  triggerRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
  onSelect: (view: DockViewType) => void;
}

export const MoreMenu: React.FC<MoreMenuProps> = ({
  id = "mobile-more-menu",
  items,
  currentView,
  isOpen,
  triggerRef,
  onClose,
  onSelect,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleMouseDown = (event: MouseEvent): void => {
      const target = event.target as Node;
      const isInsideMenu = menuRef.current?.contains(target);
      const isInsideTrigger = triggerRef.current?.contains(target);

      if (!isInsideMenu && !isInsideTrigger) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    requestAnimationFrame(() => {
      const firstItem =
        menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
      firstItem?.focus();
    });
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-40 bg-black/25"
        aria-hidden="true"
        onMouseDown={onClose}
      />
      <div
        className="fixed inset-x-0 z-50 px-3 pb-3"
        style={{ bottom: NAV_DIMENSIONS.mobileHeight }}
      >
        <div
          ref={menuRef}
          id={id}
          role="menu"
          aria-label="その他のナビゲーション"
          className="mx-auto flex w-full max-w-md flex-col gap-1 rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2 shadow-2xl"
        >
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className={clsx(
                "flex h-12 items-center justify-between rounded-2xl px-4 text-left transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]",
                currentView === item.id
                  ? "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]",
              )}
              aria-current={currentView === item.id ? "page" : undefined}
              onClick={() => {
                onSelect(item.id);
                onClose();
              }}
            >
              <span className="flex min-w-0 items-center gap-3">
                <Icon name={item.icon} size={18} />
                <span className="truncate text-sm font-medium">
                  {item.label}
                </span>
              </span>
              {item.shortcut ? (
                <Badge
                  size="sm"
                  className="border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-[10px] font-medium text-[var(--text-secondary)]"
                >
                  {item.shortcut.replace("Cmd", "⌘")}
                </Badge>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </>,
    document.body,
  );
};

MoreMenu.displayName = "MoreMenu";
