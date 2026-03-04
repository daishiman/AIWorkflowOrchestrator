import React, { memo, useMemo, useRef } from "react";
import clsx from "clsx";
import { Badge } from "../../atoms/Badge";
import { Icon, type IconName } from "../../atoms/Icon";

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabSwitcherProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: "underline" | "pill";
}

const TabSwitcherComponent: React.FC<TabSwitcherProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = "underline",
}) => {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const enabledTabs = useMemo(
    () => tabs.filter((tab) => !tab.disabled),
    [tabs],
  );

  const focusTab = (tabId: string): void => {
    tabRefs.current[tabId]?.focus();
  };

  const moveFocus = (currentTabId: string, direction: 1 | -1): void => {
    if (enabledTabs.length === 0) {
      return;
    }

    const currentIndex = enabledTabs.findIndex(
      (tab) => tab.id === currentTabId,
    );
    if (currentIndex === -1) {
      return;
    }

    const nextIndex =
      (currentIndex + direction + enabledTabs.length) % enabledTabs.length;
    focusTab(enabledTabs[nextIndex].id);
  };

  return (
    <div
      role="tablist"
      aria-label="タブ切り替え"
      className={clsx(
        "flex w-full gap-1 overflow-x-auto",
        variant === "pill" && "rounded-full bg-[var(--bg-secondary)] p-1",
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            ref={(element) => {
              tabRefs.current[tab.id] = element;
            }}
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            data-testid={`tab-${tab.id}`}
            disabled={tab.disabled}
            onClick={() => {
              if (!tab.disabled) {
                onTabChange(tab.id);
              }
            }}
            onKeyDown={(event) => {
              switch (event.key) {
                case "ArrowRight": {
                  event.preventDefault();
                  moveFocus(tab.id, 1);
                  break;
                }
                case "ArrowLeft": {
                  event.preventDefault();
                  moveFocus(tab.id, -1);
                  break;
                }
                case "Home": {
                  event.preventDefault();
                  if (enabledTabs[0]) {
                    focusTab(enabledTabs[0].id);
                  }
                  break;
                }
                case "End": {
                  event.preventDefault();
                  if (enabledTabs[enabledTabs.length - 1]) {
                    focusTab(enabledTabs[enabledTabs.length - 1].id);
                  }
                  break;
                }
                case "Enter":
                case " ": {
                  if (!tab.disabled) {
                    event.preventDefault();
                    onTabChange(tab.id);
                  }
                  break;
                }
                default:
                  break;
              }
            }}
            className={clsx(
              "inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-sm",
              "transition-all duration-[var(--duration-default)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-primary)]",
              tab.disabled && "cursor-not-allowed opacity-50",
              variant === "underline" &&
                clsx(
                  "border-b-2 border-transparent text-[var(--text-secondary)]",
                  isActive &&
                    "border-[var(--status-primary)] text-[var(--text-primary)]",
                ),
              variant === "pill" &&
                clsx(
                  "rounded-full text-[var(--text-secondary)]",
                  isActive &&
                    "bg-[var(--bg-tertiary)] text-[var(--text-primary)]",
                ),
            )}
          >
            {tab.icon && <Icon name={tab.icon as IconName} size={14} />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && <Badge size="sm" content={tab.badge} />}
          </button>
        );
      })}
    </div>
  );
};

export const TabSwitcher = memo(TabSwitcherComponent);
TabSwitcher.displayName = "TabSwitcher";
export type TabSwitcherTab = Tab;
