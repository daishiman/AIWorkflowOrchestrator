import React, { memo } from "react";
import clsx from "clsx";
import type { ScheduledSkill } from "@repo/shared/types/skill-schedule";
import { Icon } from "../../../components/atoms/Icon";
import { Badge } from "../../../components/atoms/Badge";

export interface ScheduleRowProps {
  /** スケジュールデータ */
  schedule: ScheduledSkill;
  /** トグルコールバック */
  onToggle: (id: string) => void;
  /** 削除コールバック */
  onDelete: (id: string) => void;
  /** 編集コールバック */
  onEdit: (schedule: ScheduledSkill) => void;
  /** 履歴展開コールバック */
  onHistoryToggle: (id: string) => void;
  /** 履歴パネルが展開中かどうか */
  isHistoryOpen: boolean;
}

/**
 * スケジュールタイプの表示ラベルを取得する
 */
function getScheduleTypeLabel(schedule: ScheduledSkill): string {
  switch (schedule.schedule.type) {
    case "cron":
      return schedule.schedule.cronExpression ?? "未設定";
    case "interval": {
      const minutes = Math.round((schedule.schedule.interval ?? 0) / 60000);
      return `${minutes}分ごと`;
    }
    case "once":
      return schedule.schedule.runAt
        ? new Date(schedule.schedule.runAt).toLocaleString("ja-JP")
        : "未設定";
    case "event":
      return schedule.schedule.event ?? "未設定";
    default:
      return "不明";
  }
}

/**
 * スケジュールタイプのバッジvariantを取得する
 */
function getTypeBadgeVariant(
  type: string,
): "primary" | "success" | "warning" | "info" {
  switch (type) {
    case "cron":
      return "primary";
    case "interval":
      return "info";
    case "once":
      return "warning";
    case "event":
      return "success";
    default:
      return "primary";
  }
}

/**
 * ScheduleRow - スケジュールテーブル行コンポーネント
 *
 * 個々のスケジュール情報を表示し、操作ボタンを提供する。
 * React.memoでメモ化してリスト再レンダーを最適化する。
 */
export const ScheduleRow: React.FC<ScheduleRowProps> = memo(
  ({
    schedule,
    onToggle,
    onDelete,
    onEdit,
    onHistoryToggle,
    isHistoryOpen,
  }) => {
    return (
      <tr
        data-testid={`schedule-row-${schedule.id}`}
        className={clsx(
          "border-b border-[var(--border-primary)]",
          "hover:bg-white/5 transition-colors duration-[var(--duration-quick)]",
        )}
      >
        {/* スキル名 */}
        <td className="px-4 py-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {schedule.skillName}
            </span>
            <span className="text-xs text-[var(--text-muted)] truncate max-w-[200px]">
              {schedule.prompt}
            </span>
          </div>
        </td>

        {/* スケジュール */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Badge
              variant={getTypeBadgeVariant(schedule.schedule.type)}
              size="sm"
            >
              {schedule.schedule.type}
            </Badge>
            <span className="text-sm text-[var(--text-secondary)]">
              {getScheduleTypeLabel(schedule)}
            </span>
          </div>
        </td>

        {/* ステータス */}
        <td className="px-4 py-3">
          <Badge variant={schedule.enabled ? "success" : "default"} size="sm">
            {schedule.enabled ? "有効" : "無効"}
          </Badge>
        </td>

        {/* 操作 */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            {/* トグルボタン */}
            <button
              data-testid={`toggle-${schedule.id}`}
              onClick={() => onToggle(schedule.id)}
              className={clsx(
                "p-1.5 rounded-lg transition-colors duration-[var(--duration-quick)]",
                "hover:bg-white/10 text-[var(--text-secondary)]",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
              )}
              aria-label={
                schedule.enabled
                  ? "スケジュールを無効化"
                  : "スケジュールを有効化"
              }
            >
              <Icon name={schedule.enabled ? "pause" : "play"} size={16} />
            </button>

            {/* 編集ボタン */}
            <button
              data-testid={`edit-${schedule.id}`}
              onClick={() => onEdit(schedule)}
              className={clsx(
                "p-1.5 rounded-lg transition-colors duration-[var(--duration-quick)]",
                "hover:bg-white/10 text-[var(--text-secondary)]",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
              )}
              aria-label="スケジュールを編集"
            >
              <Icon name="pencil" size={16} />
            </button>

            {/* 履歴ボタン */}
            <button
              data-testid={`history-${schedule.id}`}
              onClick={() => onHistoryToggle(schedule.id)}
              className={clsx(
                "p-1.5 rounded-lg transition-colors duration-[var(--duration-quick)]",
                "hover:bg-white/10 text-[var(--text-secondary)]",
                isHistoryOpen && "bg-white/10",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
              )}
              aria-label="実行履歴を表示"
              aria-expanded={isHistoryOpen}
            >
              <Icon name="clock" size={16} />
            </button>

            {/* 削除ボタン */}
            <button
              data-testid={`delete-${schedule.id}`}
              onClick={() => onDelete(schedule.id)}
              className={clsx(
                "p-1.5 rounded-lg transition-colors duration-[var(--duration-quick)]",
                "hover:bg-red-500/20 text-[var(--text-secondary)]",
                "hover:text-[var(--status-error)]",
                "focus:outline-none focus:ring-2 focus:ring-red-500",
              )}
              aria-label="スケジュールを削除"
            >
              <Icon name="trash-2" size={16} />
            </button>
          </div>
        </td>
      </tr>
    );
  },
);

ScheduleRow.displayName = "ScheduleRow";
