import React, { useState, useCallback } from "react";
import clsx from "clsx";
import type { ScheduledSkill } from "@repo/shared/types/skill-schedule";
import { Spinner } from "../../components/atoms/Spinner";
import { EmptyState } from "../../components/atoms/EmptyState";
import { ErrorDisplay } from "../../components/atoms/ErrorDisplay";
import { Button } from "../../components/atoms/Button";
import { useScheduleManager } from "./hooks/useScheduleManager";
import { ScheduleTable } from "./components/ScheduleTable";
import { ScheduleDialog } from "./components/ScheduleDialog";

/**
 * ScheduleManager - スケジュール管理メインビュー（Organism）
 *
 * スキルのスケジュール実行を管理するビュー。
 * スケジュール一覧の表示、作成、編集、削除、有効/無効切り替えを提供する。
 */
export const ScheduleManager: React.FC = () => {
  const {
    schedules,
    isLoading,
    error,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    toggleSchedule,
  } = useScheduleManager();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<
    ScheduledSkill | undefined
  >(undefined);

  /** 新規作成ダイアログを開く */
  const handleOpenCreate = useCallback(() => {
    setEditingSchedule(undefined);
    setIsDialogOpen(true);
  }, []);

  /** 編集ダイアログを開く */
  const handleEdit = useCallback((schedule: ScheduledSkill) => {
    setEditingSchedule(schedule);
    setIsDialogOpen(true);
  }, []);

  /** ダイアログを閉じる */
  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingSchedule(undefined);
  }, []);

  /** スケジュールを保存する（新規または更新） */
  const handleSave = useCallback(
    async (data: Omit<ScheduledSkill, "id" | "runHistory">) => {
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, data);
      } else {
        await addSchedule(data);
      }
    },
    [editingSchedule, addSchedule, updateSchedule],
  );

  /** トグル操作のラッパー */
  const handleToggle = useCallback(
    async (id: string) => {
      await toggleSchedule(id);
    },
    [toggleSchedule],
  );

  /** 削除操作のラッパー */
  const handleDelete = useCallback(
    async (id: string) => {
      await deleteSchedule(id);
    },
    [deleteSchedule],
  );

  return (
    <div data-testid="schedule-manager-view" className="h-full flex flex-col">
      {/* ヘッダー */}
      <div
        className={clsx(
          "flex items-center justify-between",
          "px-6 py-4 border-b border-[var(--border-primary)]",
        )}
      >
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            スケジュール管理
          </h1>
          {!isLoading && !error && schedules.length > 0 && (
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {schedules.length}件のスケジュール
            </p>
          )}
        </div>
        <Button
          data-testid="add-schedule-button"
          variant="primary"
          size="sm"
          leftIcon="plus"
          onClick={handleOpenCreate}
        >
          新規作成
        </Button>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-auto">
        {isLoading && (
          <div
            className="flex items-center justify-center h-full"
            role="status"
          >
            <Spinner size="lg" />
          </div>
        )}

        {!isLoading && error && <ErrorDisplay message={error} />}

        {!isLoading && !error && schedules.length === 0 && (
          <EmptyState
            title="スケジュールがありません"
            description="スキルの定期実行スケジュールを作成できます"
            icon="clock"
            action={{
              label: "スケジュールを作成",
              onClick: handleOpenCreate,
            }}
          />
        )}

        {!isLoading && !error && schedules.length > 0 && (
          <ScheduleTable
            schedules={schedules}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
      </div>

      {/* ダイアログ */}
      {isDialogOpen && (
        <ScheduleDialog
          schedule={editingSchedule}
          onClose={handleCloseDialog}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

ScheduleManager.displayName = "ScheduleManager";
