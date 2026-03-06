import React, { useRef } from "react";
import clsx from "clsx";
import {
  useIsNavExpanded,
  useResponsiveMode,
  useToggleNavExpanded,
} from "../../../store";
import { NAV_DIMENSIONS, GLOBAL_NAV_SECTIONS } from "./constants";
import { NavCollapseToggle } from "./components/NavCollapseToggle";
import { NavLogo } from "./components/NavLogo";
import { NavSection } from "./components/NavSection";
import { MobileNavBar } from "../MobileNavBar";
import type { GlobalNavStripProps } from "./types";

export type { GlobalNavStripProps } from "./types";

export const GlobalNavStrip: React.FC<GlobalNavStripProps> = ({
  currentView,
  onViewChange,
  mode,
}) => {
  const navRef = useRef<HTMLElement>(null);
  const responsiveMode = useResponsiveMode();
  const isNavExpanded = useIsNavExpanded();
  const toggleNavExpanded = useToggleNavExpanded();

  if (mode === "mobile" || responsiveMode === "mobile") {
    return (
      <MobileNavBar currentView={currentView} onViewChange={onViewChange} />
    );
  }

  const expanded = responsiveMode === "desktop" && isNavExpanded;

  const handleItemKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ): void => {
    const navItems = Array.from(
      navRef.current?.querySelectorAll<HTMLButtonElement>(
        '[data-nav-item="true"]',
      ) ?? [],
    );
    const currentIndex = navItems.indexOf(event.currentTarget);

    if (currentIndex < 0) {
      return;
    }

    let targetIndex = currentIndex;
    if (event.key === "ArrowDown") {
      targetIndex = Math.min(currentIndex + 1, navItems.length - 1);
    } else if (event.key === "ArrowUp") {
      targetIndex = Math.max(currentIndex - 1, 0);
    } else if (event.key === "Home") {
      targetIndex = 0;
    } else if (event.key === "End") {
      targetIndex = navItems.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    navItems[targetIndex]?.focus();
  };

  const mainSections = GLOBAL_NAV_SECTIONS.filter(
    (section) => section.id !== "footer",
  );
  const footerSection = GLOBAL_NAV_SECTIONS.find(
    (section) => section.id === "footer",
  );

  return (
    <nav
      ref={navRef}
      role="navigation"
      aria-label="Main navigation"
      className={clsx(
        "flex h-full shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-glass)]/95 backdrop-blur-xl",
        expanded ? "w-[200px]" : "w-14",
      )}
      style={{
        width: expanded
          ? NAV_DIMENSIONS.expandedWidth
          : NAV_DIMENSIONS.collapsedWidth,
      }}
    >
      <div className="border-b border-[var(--border-subtle)] p-2">
        <NavLogo
          expanded={expanded}
          onClick={() => onViewChange("dashboard")}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-2">
        <div className="flex flex-col gap-3">
          {mainSections.map((section, index) => (
            <React.Fragment key={section.id}>
              <NavSection
                section={section}
                currentView={currentView}
                expanded={expanded}
                onViewChange={onViewChange}
                onItemKeyDown={handleItemKeyDown}
              />
              {index < mainSections.length - 1 ? (
                <hr className="border-[var(--border-subtle)]" />
              ) : null}
            </React.Fragment>
          ))}
        </div>

        {footerSection ? (
          <div className="mt-auto border-t border-[var(--border-subtle)] pt-3">
            <NavSection
              section={footerSection}
              currentView={currentView}
              expanded={expanded}
              onViewChange={onViewChange}
              onItemKeyDown={handleItemKeyDown}
            />
          </div>
        ) : null}
      </div>

      {responsiveMode === "desktop" ? (
        <div className="border-t border-[var(--border-subtle)] p-2">
          <NavCollapseToggle expanded={expanded} onToggle={toggleNavExpanded} />
        </div>
      ) : null}
    </nav>
  );
};

GlobalNavStrip.displayName = "GlobalNavStrip";
