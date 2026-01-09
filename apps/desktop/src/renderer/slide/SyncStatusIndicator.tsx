/**
 * 同期状態インジケーター
 * @module renderer/slide/SyncStatusIndicator
 */

import React from "react";
import type { SyncStatus } from "@repo/shared";

interface Props {
  /** 同期状態 */
  status: SyncStatus;
  /** カスタムクラス名 */
  className?: string;
}

/** 各状態の設定 */
const STATUS_CONFIG: Record<SyncStatus, { label: string; colorClass: string }> =
  {
    synced: { label: "同期済み", colorClass: "bg-green-500" },
    "out-of-sync": { label: "非同期", colorClass: "bg-yellow-500" },
    syncing: { label: "同期中", colorClass: "bg-blue-500" },
    error: { label: "エラー", colorClass: "bg-red-500" },
  };

/**
 * 同期状態をアイコンとラベルで表示するコンポーネント
 */
export const SyncStatusIndicator: React.FC<Props> = ({
  status,
  className = "",
}) => {
  const config = STATUS_CONFIG[status];

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      role="status"
      aria-label={`同期状態: ${config.label}`}
    >
      <div
        className={`w-3 h-3 rounded-full ${config.colorClass} ${
          status === "syncing" ? "animate-pulse" : ""
        }`}
      />
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {config.label}
      </span>
    </div>
  );
};
