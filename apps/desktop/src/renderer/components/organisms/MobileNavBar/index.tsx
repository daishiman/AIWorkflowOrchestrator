import React, { useEffect, useRef } from "react";
import clsx from "clsx";
import { Icon } from "../../atoms";
import {
  useCloseMobileMore,
  useIsMobileMoreOpen,
  useToggleMobileMore,
} from "../../../store";
import {
  MOBILE_PRIMARY_ITEMS,
  MOBILE_SECONDARY_ITEMS,
} from "../GlobalNavStrip/constants";
import { MoreMenu } from "./components/MoreMenu";
import type { DockViewType } from "../../../navigation/navContract";

export interface MobileNavBarProps {
  currentView: DockViewType;
  onViewChange: (view: DockViewType) => void;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  currentView,
  onViewChange,
}) => {
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const isMobileMoreOpen = useIsMobileMoreOpen();
  const toggleMobileMore = useToggleMobileMore();
  const closeMobileMore = useCloseMobileMore();
  const isMoreActive = MOBILE_SECONDARY_ITEMS.some(
    (item) => item.id === currentView,
  );

  useEffect(() => {
    closeMobileMore();
  }, [currentView, closeMobileMore]);

  const handlePrimarySelect = (view: DockViewType): void => {
    closeMobileMore();
    onViewChange(view);
  };

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main navigation"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border-subtle)] bg-[var(--bg-glass)]/95 backdrop-blur-xl"
      >
        <div className="grid h-14 grid-cols-6 gap-1 px-2">
          {MOBILE_PRIMARY_ITEMS.map((item) => {
            const active = currentView === item.id;
            const mobileLabel = item.mobileLabel ?? item.label;

            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex items-center justify-center rounded-2xl transition-colors duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]",
                  active
                    ? "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]",
                )}
                onClick={() => handlePrimarySelect(item.id)}
              >
                <span className="flex flex-col items-center gap-1">
                  <Icon name={item.icon} size={18} />
                  <span className="max-w-[52px] truncate text-[10px] font-medium">
                    {mobileLabel}
                  </span>
                </span>
              </button>
            );
          })}

          <button
            ref={moreButtonRef}
            type="button"
            aria-label="その他"
            aria-controls="mobile-more-menu"
            aria-expanded={isMobileMoreOpen}
            aria-current={isMoreActive ? "page" : undefined}
            className={clsx(
              "flex items-center justify-center rounded-2xl transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]",
              isMoreActive || isMobileMoreOpen
                ? "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]",
            )}
            onClick={toggleMobileMore}
          >
            <span className="flex flex-col items-center gap-1">
              <Icon name="menu" size={18} />
              <span className="text-[10px] font-medium">More</span>
            </span>
          </button>
        </div>
      </nav>

      <MoreMenu
        items={MOBILE_SECONDARY_ITEMS}
        currentView={currentView}
        isOpen={isMobileMoreOpen}
        triggerRef={moreButtonRef}
        onClose={closeMobileMore}
        onSelect={onViewChange}
      />
    </>
  );
};

MobileNavBar.displayName = "MobileNavBar";
