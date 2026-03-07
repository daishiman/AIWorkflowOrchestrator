import React from "react";
import clsx from "clsx";
import { Icon } from "../../../atoms";

export interface NavCollapseToggleProps {
  expanded: boolean;
  onToggle: () => void;
}

export const NavCollapseToggle: React.FC<NavCollapseToggleProps> = ({
  expanded,
  onToggle,
}) => {
  return (
    <button
      type="button"
      className={clsx(
        "flex h-10 w-full items-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200",
        "hover:text-[var(--text-primary)]",
        expanded ? "justify-between" : "justify-center px-0",
      )}
      aria-label={
        expanded ? "ナビゲーションを折りたたむ" : "ナビゲーションを展開する"
      }
      onClick={onToggle}
    >
      {expanded ? (
        <>
          <span>折りたたむ</span>
          <Icon name="chevron-left" size={16} />
        </>
      ) : (
        <Icon name="chevron-right" size={16} />
      )}
    </button>
  );
};

NavCollapseToggle.displayName = "NavCollapseToggle";
