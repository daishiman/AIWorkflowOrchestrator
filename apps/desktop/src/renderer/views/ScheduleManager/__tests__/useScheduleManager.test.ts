import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useScheduleManager } from "../hooks/useScheduleManager";
import type {
  ScheduledSkill,
  ScheduledRunResult,
} from "@repo/shared/types/skill-schedule";

// --- IPC モック ---

const mockScheduleList = vi.fn<() => Promise<ScheduledSkill[]>>();
const mockScheduleAdd =
  vi.fn<
    (
      input: Omit<ScheduledSkill, "id" | "runHistory">,
    ) => Promise<ScheduledSkill>
  >();
const mockScheduleUpdate =
  vi.fn<(id: string, updates: Partial<ScheduledSkill>) => Promise<void>>();
const mockScheduleDelete = vi.fn<(id: string) => Promise<void>>();
const mockScheduleToggle =
  vi.fn<(id: string) => Promise<ScheduledSkill | undefined>>();

const mockSkillAPI = {
  scheduleList: mockScheduleList,
  scheduleAdd: mockScheduleAdd,
  scheduleUpdate: mockScheduleUpdate,
  scheduleDelete: mockScheduleDelete,
  scheduleToggle: mockScheduleToggle,
};

// --- テストデータファクトリ ---

const createMockRunResult = (
  overrides: Partial<ScheduledRunResult> = {},
): ScheduledRunResult => ({
  runId: "run-1",
  startedAt: "2026-03-01T10:00:00.000Z",
  success: true,
  completedAt: "2026-03-01T10:01:00.000Z",
  ...overrides,
});

const createMockScheduledSkill = (
  overrides: Partial<ScheduledSkill> = {},
): ScheduledSkill => ({
  id: "sched-1",
  skillName: "test-skill",
  prompt: "テスト実行",
  schedule: {
    type: "cron",
    cronExpression: "0 9 * * *",
  },
  enabled: true,
  runHistory: [createMockRunResult()],
  notification: {
    onSuccess: false,
    onFailure: true,
    notificationType: "system",
  },
  lastRun: "2026-03-01T10:00:00.000Z",
  nextRun: "2026-03-02T09:00:00.000Z",
  createdAt: "2026-02-01T00:00:00.000Z",
  updatedAt: "2026-03-01T10:00:00.000Z",
  ...overrides,
});

describe("useScheduleManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // window.electronAPI.skill モックのセットアップ
    (
      window as unknown as {
        electronAPI: { skill: typeof mockSkillAPI };
      }
    ).electronAPI = {
      skill: mockSkillAPI,
    } as unknown as typeof window.electronAPI;
  });

  it("初期状態でスケジュール一覧を取得する", async () => {
    const schedules = [
      createMockScheduledSkill({ id: "sched-1" }),
      createMockScheduledSkill({ id: "sched-2", skillName: "another-skill" }),
    ];
    mockScheduleList.mockResolvedValue(schedules);

    const { result } = renderHook(() => useScheduleManager());

    // 初期状態はローディング
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.schedules).toHaveLength(2);
    expect(result.current.error).toBeNull();
    expect(mockScheduleList).toHaveBeenCalledTimes(1);
  });

  it("取得エラー時にエラーメッセージを設定する", async () => {
    mockScheduleList.mockRejectedValue(new Error("取得失敗"));

    const { result } = renderHook(() => useScheduleManager());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("取得失敗");
    expect(result.current.schedules).toHaveLength(0);
  });

  it("スケジュールを追加できる", async () => {
    mockScheduleList.mockResolvedValue([]);
    const newSchedule = createMockScheduledSkill({ id: "sched-new" });
    mockScheduleAdd.mockResolvedValue(newSchedule);

    const { result } = renderHook(() => useScheduleManager());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.addSchedule({
        skillName: "test-skill",
        prompt: "テスト実行",
        schedule: { type: "cron", cronExpression: "0 9 * * *" },
        enabled: true,
        notification: {
          onSuccess: false,
          onFailure: true,
          notificationType: "system",
        },
        lastRun: null,
        nextRun: null,
        createdAt: "2026-02-01T00:00:00.000Z",
        updatedAt: "2026-03-01T00:00:00.000Z",
      });
    });

    expect(mockScheduleAdd).toHaveBeenCalledTimes(1);
    expect(result.current.schedules).toHaveLength(1);
    expect(result.current.schedules[0].id).toBe("sched-new");
  });

  it("スケジュールを削除できる", async () => {
    const schedules = [
      createMockScheduledSkill({ id: "sched-1" }),
      createMockScheduledSkill({ id: "sched-2" }),
    ];
    mockScheduleList.mockResolvedValue(schedules);
    mockScheduleDelete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useScheduleManager());

    await waitFor(() => {
      expect(result.current.schedules).toHaveLength(2);
    });

    await act(async () => {
      await result.current.deleteSchedule("sched-1");
    });

    expect(mockScheduleDelete).toHaveBeenCalledWith("sched-1");
    expect(result.current.schedules).toHaveLength(1);
    expect(result.current.schedules[0].id).toBe("sched-2");
  });

  it("スケジュールの有効/無効をトグルできる", async () => {
    const schedule = createMockScheduledSkill({
      id: "sched-1",
      enabled: true,
    });
    mockScheduleList.mockResolvedValue([schedule]);
    const toggled = { ...schedule, enabled: false };
    mockScheduleToggle.mockResolvedValue(toggled);

    const { result } = renderHook(() => useScheduleManager());

    await waitFor(() => {
      expect(result.current.schedules).toHaveLength(1);
    });

    await act(async () => {
      await result.current.toggleSchedule("sched-1");
    });

    expect(mockScheduleToggle).toHaveBeenCalledWith("sched-1");
    expect(result.current.schedules[0].enabled).toBe(false);
  });

  it("スケジュールを更新できる", async () => {
    const schedule = createMockScheduledSkill({ id: "sched-1" });
    mockScheduleList.mockResolvedValue([schedule]);
    mockScheduleUpdate.mockResolvedValue(undefined);

    const { result } = renderHook(() => useScheduleManager());

    await waitFor(() => {
      expect(result.current.schedules).toHaveLength(1);
    });

    await act(async () => {
      await result.current.updateSchedule("sched-1", {
        prompt: "更新されたプロンプト",
      });
    });

    expect(mockScheduleUpdate).toHaveBeenCalledWith("sched-1", {
      prompt: "更新されたプロンプト",
    });
    // ローカル状態で更新を反映
    expect(result.current.schedules[0].prompt).toBe("更新されたプロンプト");
  });
});
