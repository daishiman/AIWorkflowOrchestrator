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
  | "executionConsole"
  | "settings"
>;

export interface NavItemContract {
  id: DockViewType;
  icon: IconName;
  label: string;
  mobileLabel?: string;
  shortcut: string;
  isMobilePrimary?: boolean;
}

export interface NavSectionContract {
  id: NavSectionId;
  label: string;
  items: readonly NavItemContract[];
}

export const NAV_SECTIONS = [
  {
    id: "main",
    label: "主要機能",
    items: [
      {
        id: "dashboard",
        icon: "layout-grid",
        label: "ダッシュボード",
        mobileLabel: "ダッシュ",
        shortcut: "Cmd+1",
        isMobilePrimary: true,
      },
      {
        id: "workspace",
        icon: "folder-tree",
        label: "ワークスペース",
        mobileLabel: "ワーク",
        shortcut: "Cmd+2",
        isMobilePrimary: true,
      },
      {
        id: "chat",
        icon: "message-circle",
        label: "チャット",
        mobileLabel: "チャット",
        shortcut: "Cmd+3",
        isMobilePrimary: true,
      },
      {
        id: "agent",
        icon: "bot",
        label: "エージェント",
        mobileLabel: "実行",
        shortcut: "Cmd+4",
        isMobilePrimary: true,
      },
      {
        id: "skillCenter",
        icon: "puzzle",
        label: "スキルセンター",
        mobileLabel: "スキル",
        shortcut: "Cmd+5",
        isMobilePrimary: true,
      },
      {
        id: "historySearch",
        icon: "search",
        label: "履歴検索",
        mobileLabel: "履歴",
        shortcut: "Cmd+6",
      },
    ],
  },
  {
    id: "sub",
    label: "補助機能",
    items: [
      {
        id: "graph",
        icon: "network",
        label: "グラフ",
        mobileLabel: "グラフ",
        shortcut: "Cmd+7",
      },
      {
        id: "editor",
        icon: "file-code",
        label: "エディタ",
        mobileLabel: "編集",
        shortcut: "Cmd+8",
      },
      {
        id: "executionConsole",
        icon: "play-circle",
        label: "実行コンソール",
        mobileLabel: "実行",
        shortcut: "Cmd+9",
      },
    ],
  },
  {
    id: "footer",
    label: "システム",
    items: [
      {
        id: "settings",
        icon: "settings",
        label: "設定",
        mobileLabel: "設定",
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

export const MOBILE_PRIMARY_NAV_ITEMS = APP_DOCK_NAV_ITEMS.filter(
  (item) => item.isMobilePrimary,
);

export const MOBILE_SECONDARY_NAV_ITEMS = APP_DOCK_NAV_ITEMS.filter(
  (item) => !item.isMobilePrimary,
);

export const NAV_SHORTCUT_TO_VIEW: Readonly<Record<string, DockViewType>> = {
  "1": "dashboard",
  "2": "workspace",
  "3": "chat",
  "4": "agent",
  "5": "skillCenter",
  "6": "historySearch",
  "7": "graph",
  "8": "editor",
  "9": "executionConsole",
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

function hasNavigationModifier(event: NavigationShortcutEvent): boolean {
  return event.metaKey || event.ctrlKey;
}

function hasDisallowedModifier(event: NavigationShortcutEvent): boolean {
  return event.altKey || event.shiftKey;
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
  if (!hasNavigationModifier(event)) {
    return null;
  }

  if (hasDisallowedModifier(event)) {
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

export function isGoBackNavigationShortcut(
  event: NavigationShortcutEvent,
): boolean {
  if (!hasNavigationModifier(event)) {
    return false;
  }

  if (hasDisallowedModifier(event)) {
    return false;
  }

  if (isEditableEventTarget(event.target)) {
    return false;
  }

  return event.code === "BracketLeft" || event.key === "[";
}
