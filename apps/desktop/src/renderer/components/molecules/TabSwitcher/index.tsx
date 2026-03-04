import React, { memo } from "react";
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
  return (
    <div
      role="tablist"
      aria-label="タブ切り替え"
      className="flex w-full gap-1 overflow-x-auto"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            disabled={tab.disabled}
            onClick={() => {
              if (!tab.disabled) {
                onTabChange(tab.id);
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
