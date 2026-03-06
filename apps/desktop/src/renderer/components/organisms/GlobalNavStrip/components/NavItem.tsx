import React from "react";
import clsx from "clsx";
import { Badge, Icon } from "../../../atoms";
import { Tooltip } from "../../../molecules";
import type { NavItemProps } from "../types";

export const NavItem: React.FC<NavItemProps> = ({
  item,
  active,
  expanded,
  onClick,
  onKeyDown,
}) => {
  const tooltipContent = item.shortcut
    ? `${item.label} (${item.shortcut})`
    : item.label;

  const button = (
    <button
      type="button"
      data-nav-item="true"
      data-view-id={item.id}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "group flex h-11 w-full items-center rounded-2xl border transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]",
        expanded ? "justify-start gap-3 px-3" : "justify-center px-0",
        active
          ? "border-[var(--status-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm"
          : "border-transparent text-[var(--text-secondary)] hover:border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]",
      )}
    >
      <Icon name={item.icon} size={20} />
      {expanded ? (
        <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">{item.label}</span>
          {item.shortcut ? (
            <Badge
              size="sm"
              className="border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-[10px] font-medium text-[var(--text-secondary)]"
            >
              {item.shortcut.replace("Cmd", "⌘")}
            </Badge>
          ) : null}
        </span>
      ) : null}
    </button>
  );

  return <Tooltip content={tooltipContent}>{button}</Tooltip>;
};

NavItem.displayName = "NavItem";
