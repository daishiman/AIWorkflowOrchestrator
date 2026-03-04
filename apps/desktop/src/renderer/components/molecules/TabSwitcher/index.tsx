import React, { useMemo, useRef } from "react";
import clsx from "clsx";
import { Icon, type IconName } from "../../atoms/Icon";

export interface TabSwitcherTab {
  id: string;
  label: string;
  icon?: IconName;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabSwitcherProps {
  tabs: TabSwitcherTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: "underline" | "pill";
  className?: string;
}

const getNextEnabledIndex = (
  tabs: TabSwitcherTab[],
  currentIndex: number,
  direction: 1 | -1,
) => {
  if (tabs.length === 0) {
    return -1;
  }

  for (let step = 1; step <= tabs.length; step += 1) {
    const nextIndex =
      (currentIndex + direction * step + tabs.length) % tabs.length;
    if (!tabs[nextIndex]?.disabled) {
      return nextIndex;
    }
  }

  return currentIndex;
};

export const TabSwitcher: React.FC<TabSwitcherProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = "underline",
  className,
}) => {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const enabledIndices = useMemo(
    () =>
      tabs
        .map((tab, index) => ({ tab, index }))
        .filter(({ tab }) => !tab.disabled)
        .map(({ index }) => index),
    [tabs],
  );

  const focusTab = (index: number) => {
    const target = tabRefs.current[index];
    if (target) {
      target.focus();
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    tab: TabSwitcherTab,
    index: number,
  ) => {
    if (tab.disabled || tabs.length === 0) {
      return;
    }

    switch (event.key) {
      case "ArrowRight": {
        event.preventDefault();
        const nextIndex = getNextEnabledIndex(tabs, index, 1);
        focusTab(nextIndex);
        return;
      }
      case "ArrowLeft": {
        event.preventDefault();
        const nextIndex = getNextEnabledIndex(tabs, index, -1);
        focusTab(nextIndex);
        return;
      }
      case "Home": {
        event.preventDefault();
        const firstEnabledIndex = enabledIndices[0];
        if (typeof firstEnabledIndex === "number") {
          focusTab(firstEnabledIndex);
        }
        return;
      }
      case "End": {
        event.preventDefault();
        const lastEnabledIndex = enabledIndices[enabledIndices.length - 1];
        if (typeof lastEnabledIndex === "number") {
          focusTab(lastEnabledIndex);
        }
        return;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        onTabChange(tab.id);
        return;
      }
      default:
        return;
    }
  };

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={clsx(
        "flex items-center gap-1 overflow-x-auto px-1",
        "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        variant === "pill"
          ? "rounded-full bg-[var(--bg-secondary)] py-1"
          : "border-b border-[var(--border-subtle)]",
        className,
      )}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            data-testid={`tab-${tab.id}`}
            role="tab"
            aria-selected={isActive}
            aria-disabled={tab.disabled || undefined}
            tabIndex={isActive && !tab.disabled ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => {
              if (!tab.disabled) {
                onTabChange(tab.id);
              }
            }}
            onKeyDown={(event) => handleKeyDown(event, tab, index)}
            className={clsx(
              "inline-flex min-w-max items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              "focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--status-primary)] focus-visible:outline-offset-2",
              tab.disabled && "cursor-not-allowed opacity-50",
              variant === "underline" &&
                clsx(
                  "border-b-2 border-transparent -mb-px",
                  isActive
                    ? "border-[var(--status-primary)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                ),
              variant === "pill" &&
                clsx(
                  "rounded-full",
                  isActive
                    ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                ),
            )}
          >
            {tab.icon && <Icon name={tab.icon} size={14} aria-hidden="true" />}
            <span>{tab.label}</span>
            {typeof tab.badge !== "undefined" && (
              <span
                className={clsx(
                  "rounded-full px-2 py-0.5 text-xs",
                  isActive
                    ? "bg-[var(--bg-primary)] text-[var(--text-primary)]"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

TabSwitcher.displayName = "TabSwitcher";
