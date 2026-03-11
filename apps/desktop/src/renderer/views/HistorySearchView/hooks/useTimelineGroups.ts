import { useMemo } from "react";
import type { HistoryItem } from "@repo/shared/types";
import type { TimelineGroupData } from "../types";

const MONTH_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  month: "numeric",
});

function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

function getTimelineLabel(now: Date, timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "日付不明";
  }

  const nowStart = startOfDay(now);
  const targetStart = startOfDay(date);
  const diffDays = Math.floor((nowStart - targetStart) / 86_400_000);

  if (diffDays <= 0) return "きょう";
  if (diffDays === 1) return "きのう";
  if (diffDays <= 7) return "今週";
  if (diffDays <= 14) return "先週";

  return `${MONTH_FORMATTER.format(date)}月`;
}

function compareItems(a: HistoryItem, b: HistoryItem): number {
  const aTime = new Date(a.timestamp).getTime();
  const bTime = new Date(b.timestamp).getTime();

  const aValid = Number.isFinite(aTime);
  const bValid = Number.isFinite(bTime);

  if (!aValid && !bValid) {
    return a.id.localeCompare(b.id);
  }

  if (!aValid) return 1;
  if (!bValid) return -1;
  if (aTime !== bTime) return bTime - aTime;

  return a.id.localeCompare(b.id);
}

export function useTimelineGroups(items: HistoryItem[]): TimelineGroupData[] {
  return useMemo(() => {
    const now = new Date();
    const grouped = new Map<string, HistoryItem[]>();

    [...items].sort(compareItems).forEach((item) => {
      const label = getTimelineLabel(now, item.timestamp);
      const existing = grouped.get(label) ?? [];
      existing.push(item);
      grouped.set(label, existing);
    });

    return Array.from(grouped.entries()).map(([label, groupItems]) => ({
      id: label,
      label,
      items: groupItems,
    }));
  }, [items]);
}
