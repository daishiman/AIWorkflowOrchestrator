import type { HistoryItem } from "@repo/shared/types";

export interface TimelineGroupData {
  id: string;
  label: string;
  items: HistoryItem[];
}
