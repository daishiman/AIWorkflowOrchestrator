import React, { memo, useState, useCallback } from "react";
import type { ScheduledSkill } from "@repo/shared/types/skill-schedule";
import { ScheduleRow } from "./ScheduleRow";
import { ScheduleHistoryPanel } from "./ScheduleHistoryPanel";

export interface ScheduleTableProps {
  /** スケジュール一覧 */
  schedules: ScheduledSkill[];
  /** トグルコールバック */
  onToggle: (id: string) => Promise<void>;
  /** 削除コールバック */
  onDelete: (id: string) => Promise<void>;
  /** 編集コールバック */
  onEdit: (schedule: ScheduledSkill) => void;
}

/**
 * ScheduleTable - スケジュールテーブルコンポーネント
 *
 * スケジュール一覧をテーブル形式で表示する。
 * 各行に操作ボタン（トグル、編集、削除、履歴表示）を提供する。
 */
export const ScheduleTable: React.FC<ScheduleTableProps> = memo(
  ({ schedules, onToggle, onDelete, onEdit }) => {
    const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(
      null,
    );

    const handleHistoryToggle = useCallback((id: string) => {
      setExpandedHistoryId((prev) => (prev === id ? null : id));
    }, []);

    return (
      <div data-testid="schedule-table" className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-primary)] text-left">
              <th className="px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                スキル名
              </th>
              <th className="px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                スケジュール
              </th>
              <th className="px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <React.Fragment key={schedule.id}>
                <ScheduleRow
                  schedule={schedule}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onHistoryToggle={handleHistoryToggle}
                  isHistoryOpen={expandedHistoryId === schedule.id}
                />
                {expandedHistoryId === schedule.id && (
                  <tr>
                    <td colSpan={4} className="bg-[var(--bg-secondary)]">
                      <ScheduleHistoryPanel
                        runHistory={schedule.runHistory}
                        scheduleId={schedule.id}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
);

ScheduleTable.displayName = "ScheduleTable";
