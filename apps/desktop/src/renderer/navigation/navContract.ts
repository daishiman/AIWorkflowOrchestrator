import type { IconName } from "../components/atoms/Icon";
import type { ViewType } from "../store/types";

export type NavSectionId = "main" | "sub" | "footer";

export type DockViewType = Extract<
  ViewType,
  | "dashboard"
  | "workspace"
  | "chat"
  | "agent"
  | "skillCenter"
  | "historySearch"
  | "graph"
  | "editor"
  | "settings"
>;

export interface NavItemContract {
  id: DockViewType;
  icon: IconName;
  label: string;
  shortcut: string;
}

export interface NavSectionContract {
  id: NavSectionId;
  label: string;
  items: readonly NavItemContract[];
}

export const NAV_SECTIONS = [
  {
    id: "main",
    label: "Main",
    items: [
      {
        id: "dashboard",
        icon: "layout-grid",
        label: "Dashboard",
        shortcut: "Cmd+1",
      },
      {
        id: "workspace",
        icon: "folder-tree",
        label: "Workspace",
        shortcut: "Cmd+2",
      },
      {
        id: "chat",
        icon: "message-circle",
        label: "Chat",
        shortcut: "Cmd+3",
      },
      {
        id: "agent",
        icon: "bot",
        label: "Agent",
        shortcut: "Cmd+4",
      },
      {
        id: "skillCenter",
        icon: "sparkles",
        label: "Skills",
        shortcut: "Cmd+5",
      },
      {
        id: "historySearch",
        icon: "search",
        label: "History",
        shortcut: "Cmd+6",
      },
    ],
  },
  {
    id: "sub",
    label: "Sub",
    items: [
      {
        id: "graph",
        icon: "network",
        label: "Graph",
        shortcut: "Cmd+7",
      },
      {
        id: "editor",
        icon: "file-text",
        label: "Editor",
        shortcut: "Cmd+8",
      },
    ],
  },
  {
    id: "footer",
    label: "Footer",
    items: [
      {
        id: "settings",
        icon: "settings",
        label: "Settings",
        shortcut: "Cmd+,",
      },
    ],
  },
] as const satisfies readonly NavSectionContract[];

export const APP_DOCK_NAV_ITEMS: readonly NavItemContract[] = [
  ...NAV_SECTIONS[0].items,
  ...NAV_SECTIONS[1].items,
  ...NAV_SECTIONS[2].items,
];

export const NAV_SHORTCUT_TO_VIEW: Readonly<Record<string, DockViewType>> = {
  "1": "dashboard",
  "2": "workspace",
  "3": "chat",
  "4": "agent",
  "5": "skillCenter",
  "6": "historySearch",
  "7": "graph",
  "8": "editor",
  ",": "settings",
};

interface NavigationShortcutEvent {
  key: string;
  code?: string;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  target: EventTarget | null;
}

export function isEditableEventTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return true;
  }

  if (target.isContentEditable) {
    return true;
  }

  return target.closest("[contenteditable='true']") !== null;
}

export function getViewFromNavigationShortcut(
  event: NavigationShortcutEvent,
): DockViewType | null {
  if (!(event.metaKey || event.ctrlKey)) {
    return null;
  }

  if (event.altKey || event.shiftKey) {
    return null;
  }

  if (isEditableEventTarget(event.target)) {
    return null;
  }

  if (event.code === "Comma") {
    return "settings";
  }

  const normalizedKey = event.key.toLowerCase();
  return NAV_SHORTCUT_TO_VIEW[normalizedKey] ?? null;
}
