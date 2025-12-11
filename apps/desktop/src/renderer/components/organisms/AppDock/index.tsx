import React from "react";
import clsx from "clsx";
import { Icon, type IconName } from "../../atoms/Icon";
import { NavIcon } from "../../molecules/NavIcon";

export type ViewType = "dashboard" | "editor" | "chat" | "graph" | "settings";

export interface AppDockProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  mode: "desktop" | "mobile";
}

interface NavItem {
  id: ViewType;
  icon: IconName;
  label: string;
  shortcut?: string;
}

const navItems: NavItem[] = [
  {
    id: "dashboard",
    icon: "layout-grid",
    label: "Dashboard",
    shortcut: "Cmd+1",
  },
  { id: "editor", icon: "folder-tree", label: "Editor", shortcut: "Cmd+2" },
  { id: "chat", icon: "message-circle", label: "Chat", shortcut: "Cmd+3" },
  { id: "graph", icon: "network", label: "Graph", shortcut: "Cmd+4" },
  { id: "settings", icon: "user", label: "Settings", shortcut: "Cmd+," },
];

export const AppDock: React.FC<AppDockProps> = ({
  currentView,
  onViewChange,
  mode,
}) => {
  const isDesktop = mode === "desktop";

  return (
    <nav
      className={clsx(
        "bg-[var(--bg-glass)] backdrop-blur-sm",
        isDesktop
          ? [
              "w-20 h-full",
              "flex flex-col",
              "border-r border-[var(--border-subtle)]",
            ]
          : [
              "h-[70px] w-full",
              "flex flex-row",
              "border-t border-[var(--border-subtle)]",
            ],
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {isDesktop && (
        <div className="flex items-center justify-center h-20 border-b border-white/10">
          <Icon
            name="aperture"
            size={32}
            className="text-white"
            aria-label="Knowledge Studio"
          />
        </div>
      )}

      <div
        className={clsx(
          "flex",
          isDesktop
            ? ["flex-col flex-1", "py-4 gap-2"]
            : ["flex-row flex-1", "px-4 gap-1", "items-center justify-around"],
        )}
      >
        {navItems.map((item) => (
          <NavIcon
            key={item.id}
            icon={item.icon}
            tooltip={item.label}
            shortcut={item.shortcut}
            active={currentView === item.id}
            onClick={() => onViewChange(item.id)}
          />
        ))}
      </div>
    </nav>
  );
};

AppDock.displayName = "AppDock";
