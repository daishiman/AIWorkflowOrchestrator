import React from "react";
import clsx from "clsx";
import { Icon } from "../../../atoms";

export interface NavLogoProps {
  expanded: boolean;
  onClick: () => void;
}

export const NavLogo: React.FC<NavLogoProps> = ({ expanded, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="ダッシュボードへ移動"
      className={clsx(
        "flex w-full items-center rounded-[20px] border border-transparent transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]",
        "hover:border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)]",
        expanded ? "gap-3 px-3 py-3" : "justify-center py-3",
      )}
    >
      <span className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-2 text-[var(--status-primary)]">
        <Icon name="aperture" size={20} />
      </span>
      {expanded ? (
        <span className="min-w-0 text-left">
          <span className="block text-sm font-semibold text-[var(--text-primary)]">
            AI Workflow
          </span>
          <span className="block text-xs text-[var(--text-secondary)]">
            Navigation
          </span>
        </span>
      ) : null}
    </button>
  );
};

NavLogo.displayName = "NavLogo";
