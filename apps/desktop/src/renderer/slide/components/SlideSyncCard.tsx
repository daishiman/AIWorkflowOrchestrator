/**
 * SlideSyncCard コンポーネント
 * スライドプロジェクトの同期状態を表示するカード
 * @module renderer/slide/components/SlideSyncCard
 */

import type { SlideUIStatus } from "../types";

export interface SlideSyncCardProps {
  projectPath: string;
  uiStatus: SlideUIStatus;
  lastSyncedAt: Date | null;
  degradedReason?: string;
}

export const variantStyles: Record<
  SlideUIStatus,
  { badge: string; label: string }
> = {
  synced: {
    badge: "bg-[#34C759] dark:bg-[#30D158] text-[#000000] dark:text-[#000000]",
    label: "同期済み",
  },
  running: { badge: "bg-[#007AFF] dark:bg-[#0A84FF]", label: "同期中..." },
  degraded: { badge: "bg-[#FF9500] dark:bg-[#FF9F0A]", label: "同期失敗" },
  guidance: {
    badge: "bg-[#007AFF] dark:bg-[#0A84FF]",
    label: "設定が必要です",
  },
};

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return "たった今";
  }
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}分前`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}時間前`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}日前`;
}

export function SlideSyncCard({
  projectPath,
  uiStatus,
  lastSyncedAt,
  degradedReason,
}: SlideSyncCardProps) {
  const { badge, label } = variantStyles[uiStatus];

  return (
    <div
      className="rounded-lg bg-white dark:bg-[#1C1C1E] border border-[#C6C6C8] dark:border-[#38383A] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      aria-label={`同期状態: ${label}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className="text-sm text-[#000000] dark:text-[#FFFFFF] truncate flex-1 min-w-0 font-system"
          title={projectPath}
        >
          {projectPath}
        </p>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white whitespace-nowrap shrink-0 ${badge}`}
          role="status"
        >
          {label}
        </span>
      </div>

      {lastSyncedAt !== null && (
        <p className="mt-2 text-xs text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)]">
          最終同期: {formatRelativeTime(lastSyncedAt)}
        </p>
      )}

      {uiStatus === "degraded" && degradedReason !== undefined && (
        <p className="mt-2 text-xs text-[#FF3B30] dark:text-[#FF453A]">
          {degradedReason}
        </p>
      )}
    </div>
  );
}

SlideSyncCard.displayName = "SlideSyncCard";
