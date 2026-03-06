import type React from "react";
import type {
  DockViewType,
  NavSectionId,
} from "../../../navigation/navContract";
import type { IconName } from "../../atoms/Icon";

export type { DockViewType, NavSectionId };

export interface NavItemConfig {
  id: DockViewType;
  icon: IconName;
  label: string;
  mobileLabel?: string;
  shortcut?: string;
  isMobilePrimary?: boolean;
}

export interface NavSectionConfig {
  id: NavSectionId;
  label: string;
  items: readonly NavItemConfig[];
}

export interface GlobalNavStripProps {
  currentView: DockViewType;
  onViewChange: (view: DockViewType) => void;
  mode: "desktop" | "mobile";
}

export interface NavItemProps {
  item: NavItemConfig;
  active: boolean;
  expanded: boolean;
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}
