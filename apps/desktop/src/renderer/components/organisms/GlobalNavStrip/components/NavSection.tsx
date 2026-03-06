import React from "react";
import clsx from "clsx";
import type { DockViewType } from "../../../../navigation/navContract";
import { NavItem } from "./NavItem";
import type { NavSectionConfig } from "../types";

export interface NavSectionProps {
  section: NavSectionConfig;
  currentView: DockViewType;
  expanded: boolean;
  onViewChange: (view: DockViewType) => void;
  onItemKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}

export const NavSection: React.FC<NavSectionProps> = ({
  section,
  currentView,
  expanded,
  onViewChange,
  onItemKeyDown,
}) => {
  return (
    <section
      className="flex flex-col gap-1"
      role="group"
      aria-label={section.label}
    >
      <p
        className={clsx(
          "px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]",
          !expanded && "sr-only",
        )}
      >
        {section.label}
      </p>
      <div className="flex flex-col gap-1">
        {section.items.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            active={currentView === item.id}
            expanded={expanded}
            onClick={() => onViewChange(item.id)}
            onKeyDown={onItemKeyDown}
          />
        ))}
      </div>
    </section>
  );
};

NavSection.displayName = "NavSection";
