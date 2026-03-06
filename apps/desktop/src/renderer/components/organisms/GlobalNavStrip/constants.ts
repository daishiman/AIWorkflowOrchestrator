import {
  APP_DOCK_NAV_ITEMS,
  MOBILE_PRIMARY_NAV_ITEMS,
  MOBILE_SECONDARY_NAV_ITEMS,
  NAV_SECTIONS,
  type DockViewType,
} from "../../../navigation/navContract";
import type { NavSectionConfig } from "./types";

export const GLOBAL_NAV_SECTIONS =
  NAV_SECTIONS satisfies readonly NavSectionConfig[];

export const MOBILE_PRIMARY_ITEMS = MOBILE_PRIMARY_NAV_ITEMS;
export const MOBILE_SECONDARY_ITEMS = MOBILE_SECONDARY_NAV_ITEMS;

export const NAV_DIMENSIONS = {
  collapsedWidth: 56,
  expandedWidth: 200,
  mobileHeight: 56,
  mobileBreakpoint: 768,
  tabletBreakpoint: 1024,
} as const;

export const MOBILE_PRIMARY_ITEM_LIMIT = 5;

export const SHORTCUT_MAP = APP_DOCK_NAV_ITEMS.reduce<
  Record<string, DockViewType>
>((accumulator, item) => {
  accumulator[item.shortcut] = item.id;
  return accumulator;
}, {});
