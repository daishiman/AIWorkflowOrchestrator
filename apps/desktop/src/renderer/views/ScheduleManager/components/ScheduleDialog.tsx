import React, { memo, useState, useCallback, useEffect } from "react";
import clsx from "clsx";
import type {
  ScheduledSkill,
  SkillSchedule,
  NotificationSettings,
} from "@repo/shared/types/skill-schedule";
import { Button } from "../../../components/atoms/Button";
import { Icon } from "../../../components/atoms/Icon";
import { CronInput } from "./CronInput";

export interface ScheduleDialogProps {
  /** 編集対象のスケジュール（新規作成時はundefined） */
  schedule?: ScheduledSkill;
  /** ダイアログを閉じるコールバック */
  onClose: () => void;
  /** 保存コールバック */
  onSave: (data: Omit<ScheduledSkill, "id" | "runHistory">) => Promise<void>;
}

type ScheduleType = SkillSchedule["type"];

/**
 * ScheduleDialog - スケジュール作成/編集ダイアログ
 *
 * スケジュールの各設定項目を入力するフォームダイアログ。
 * 新規作成と編集の両方に対応する。
 */
export const ScheduleDialog: React.FC<ScheduleDialogProps> = memo(
  ({ schedule, onClose, onSave }) => {
    const isEditing = !!schedule;

    const [skillName, setSkillName] = useState(schedule?.skillName ?? "");
    const [prompt, setPrompt] = useState(schedule?.prompt ?? "");
    const [scheduleType, setScheduleType] = useState<ScheduleType>(
      schedule?.schedule.type ?? "cron",
    );
    const [cronExpression, setCronExpression] = useState(
      schedule?.schedule.cronExpression ?? "0 9 * * *",
    );
    const [intervalMinutes, setIntervalMinutes] = useState(
      schedule?.schedule.interval
        ? Math.round(schedule.schedule.interval / 60000)
        : 60,
    );
    const [runAt, setRunAt] = useState(schedule?.schedule.runAt ?? "");
    const [eventType, setEventType] = useState<
      "app_start" | "file_change" | "git_commit"
    >(
      (schedule?.schedule.event as
        | "app_start"
        | "file_change"
        | "git_commit") ?? "app_start",
    );
    const [enabled, setEnabled] = useState(schedule?.enabled ?? true);
    const [isSaving, setIsSaving] = useState(false);

    // ESCキーでダイアログを閉じる
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const handleSave = useCallback(async () => {
      if (!skillName.trim()) return;

      setIsSaving(true);
      try {
        const scheduleConfig: SkillSchedule = {
          type: scheduleType,
          ...(scheduleType === "cron" && { cronExpression }),
          ...(scheduleType === "interval" && {
            interval: intervalMinutes * 60000,
          }),
          ...(scheduleType === "once" && { runAt: runAt || null }),
          ...(scheduleType === "event" && { event: eventType }),
        };

        const notification: NotificationSettings = {
          onSuccess: false,
          onFailure: true,
          notificationType: "system",
        };

        const now = new Date().toISOString();

        await onSave({
          skillName: skillName.trim(),
          prompt: prompt.trim(),
          schedule: scheduleConfig,
          enabled,
          notification,
          lastRun: schedule?.lastRun ?? null,
          nextRun: schedule?.nextRun ?? null,
          createdAt: schedule?.createdAt ?? now,
          updatedAt: now,
        });

        onClose();
      } finally {
        setIsSaving(false);
      }
    }, [
      skillName,
      prompt,
      scheduleType,
      cronExpression,
      intervalMinutes,
      runAt,
      eventType,
      enabled,
      onSave,
      onClose,
      schedule,
    ]);

    return (
      <div
        data-testid="schedule-dialog"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? "スケジュール編集" : "スケジュール新規作成"}
      >
        <div
          className={clsx(
            "w-full max-w-lg rounded-xl shadow-xl",
            "bg-[var(--bg-primary)] border border-[var(--border-primary)]",
            "p-6 space-y-4",
          )}
        >
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {isEditing ? "スケジュール編集" : "新規スケジュール作成"}
            </h2>
            <button
              onClick={onClose}
              className={clsx(
                "p-1.5 rounded-lg transition-colors duration-[var(--duration-quick)]",
                "hover:bg-white/10 text-[var(--text-secondary)]",
              )}
              aria-label="閉じる"
            >
              <Icon name="x" size={20} />
            </button>
          </div>

          {/* スキル名 */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
              スキル名
            </label>
            <input
              data-testid="dialog-skill-name"
              type="text"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="スキル名を入力"
              className={clsx(
                "w-full px-3 py-2 rounded-lg text-sm",
                "bg-white/5 border border-white/10 text-white",
                "placeholder:text-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
              )}
            />
          </div>

          {/* プロンプト */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
              実行プロンプト
            </label>
            <textarea
              data-testid="dialog-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="実行時のプロンプトを入力"
              rows={3}
              className={clsx(
                "w-full px-3 py-2 rounded-lg text-sm resize-none",
                "bg-white/5 border border-white/10 text-white",
                "placeholder:text-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
              )}
            />
          </div>

          {/* スケジュールタイプ */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
              スケジュールタイプ
            </label>
            <select
              data-testid="dialog-schedule-type"
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value as ScheduleType)}
              className={clsx(
                "w-full px-3 py-2 rounded-lg text-sm",
                "bg-white/5 border border-white/10 text-white",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
              )}
            >
              <option value="cron">Cron（定期実行）</option>
              <option value="interval">インターバル（間隔実行）</option>
              <option value="once">一回のみ</option>
              <option value="event">イベントトリガー</option>
            </select>
          </div>

          {/* タイプ別の設定 */}
          {scheduleType === "cron" && (
            <CronInput value={cronExpression} onChange={setCronExpression} />
          )}

          {scheduleType === "interval" && (
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                実行間隔（分）
              </label>
              <input
                data-testid="dialog-interval"
                type="number"
                min={1}
                value={intervalMinutes}
                onChange={(e) =>
                  setIntervalMinutes(
                    Math.max(1, parseInt(e.target.value, 10) || 1),
                  )
                }
                className={clsx(
                  "w-full px-3 py-2 rounded-lg text-sm",
                  "bg-white/5 border border-white/10 text-white",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500",
                )}
              />
            </div>
          )}

          {scheduleType === "once" && (
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                実行日時
              </label>
              <input
                data-testid="dialog-run-at"
                type="datetime-local"
                value={runAt}
                onChange={(e) => setRunAt(e.target.value)}
                className={clsx(
                  "w-full px-3 py-2 rounded-lg text-sm",
                  "bg-white/5 border border-white/10 text-white",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500",
                )}
              />
            </div>
          )}

          {scheduleType === "event" && (
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-1">
                トリガーイベント
              </label>
              <select
                data-testid="dialog-event-type"
                value={eventType}
                onChange={(e) =>
                  setEventType(
                    e.target.value as
                      | "app_start"
                      | "file_change"
                      | "git_commit",
                  )
                }
                className={clsx(
                  "w-full px-3 py-2 rounded-lg text-sm",
                  "bg-white/5 border border-white/10 text-white",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500",
                )}
              >
                <option value="app_start">アプリ起動時</option>
                <option value="file_change">ファイル変更時</option>
                <option value="git_commit">Gitコミット時</option>
              </select>
            </div>
          )}

          {/* 有効/無効 */}
          <div className="flex items-center gap-2">
            <input
              data-testid="dialog-enabled"
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              id="schedule-enabled"
              className="rounded border-white/20 bg-white/5"
            />
            <label
              htmlFor="schedule-enabled"
              className="text-sm text-[var(--text-secondary)]"
            >
              作成後すぐに有効にする
            </label>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>
              キャンセル
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={isSaving}
              disabled={!skillName.trim()}
            >
              {isEditing ? "更新" : "作成"}
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

ScheduleDialog.displayName = "ScheduleDialog";
