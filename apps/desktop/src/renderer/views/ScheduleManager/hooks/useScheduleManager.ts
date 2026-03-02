import { useState, useEffect, useCallback } from "react";
import type { ScheduledSkill } from "@repo/shared/types/skill-schedule";

/**
 * スケジュール管理のState型
 */
interface ScheduleManagerState {
  /** スケジュール一覧 */
  schedules: ScheduledSkill[];
  /** ローディング中フラグ */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;
}

/**
 * スケジュール管理のアクション型
 */
interface ScheduleManagerActions {
  /** スケジュールを追加する */
  addSchedule: (
    input: Omit<ScheduledSkill, "id" | "runHistory">,
  ) => Promise<void>;
  /** スケジュールを更新する */
  updateSchedule: (
    id: string,
    updates: Partial<ScheduledSkill>,
  ) => Promise<void>;
  /** スケジュールを削除する */
  deleteSchedule: (id: string) => Promise<void>;
  /** スケジュールの有効/無効をトグルする */
  toggleSchedule: (id: string) => Promise<void>;
  /** スケジュール一覧を再取得する */
  refresh: () => Promise<void>;
}

/**
 * useScheduleManager - スケジュール管理カスタムフック
 *
 * IPC経由でMain Processと通信し、スケジュールのCRUD操作を提供する。
 * ローカルのuseStateでスケジュール一覧・ローディング・エラーを管理し、
 * 操作完了時にローカル状態を楽観的に更新する。
 */
export function useScheduleManager(): ScheduleManagerState &
  ScheduleManagerActions {
  const [schedules, setSchedules] = useState<ScheduledSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** スケジュール一覧を取得する */
  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.skill.scheduleList();
      setSchedules(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "スケジュールの取得に失敗しました";
      setError(message);
      setSchedules([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初回マウント時にスケジュール一覧を取得
  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  /** スケジュールを追加する */
  const addSchedule = useCallback(
    async (input: Omit<ScheduledSkill, "id" | "runHistory">) => {
      const result = await window.electronAPI.skill.scheduleAdd(input);
      setSchedules((prev) => [...prev, result]);
    },
    [],
  );

  /** スケジュールを更新する */
  const updateSchedule = useCallback(
    async (id: string, updates: Partial<ScheduledSkill>) => {
      await window.electronAPI.skill.scheduleUpdate(id, updates);
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      );
    },
    [],
  );

  /** スケジュールを削除する */
  const deleteSchedule = useCallback(async (id: string) => {
    await window.electronAPI.skill.scheduleDelete(id);
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }, []);

  /** スケジュールの有効/無効をトグルする */
  const toggleSchedule = useCallback(async (id: string) => {
    const result = await window.electronAPI.skill.scheduleToggle(id);
    if (result) {
      setSchedules((prev) => prev.map((s) => (s.id === id ? result : s)));
    }
  }, []);

  return {
    schedules,
    isLoading,
    error,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    toggleSchedule,
    refresh: fetchSchedules,
  };
}
