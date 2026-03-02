import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import type {
  ScheduledSkill,
  ScheduledRunResult,
} from "@repo/shared/types/skill-schedule";

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

// --- IPC モック ---

const mockScheduleList = vi.fn<() => Promise<ScheduledSkill[]>>();
const mockScheduleAdd = vi.fn();
const mockScheduleUpdate = vi.fn();
const mockScheduleDelete = vi.fn();
const mockScheduleToggle = vi.fn();

const mockSkillAPI = {
  scheduleList: mockScheduleList,
  scheduleAdd: mockScheduleAdd,
  scheduleUpdate: mockScheduleUpdate,
  scheduleDelete: mockScheduleDelete,
  scheduleToggle: mockScheduleToggle,
};

// テスト対象
import { ScheduleManager } from "../index";

describe("ScheduleManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (
      window as unknown as {
        electronAPI: { skill: typeof mockSkillAPI };
      }
    ).electronAPI = {
      skill: mockSkillAPI,
    } as unknown as typeof window.electronAPI;
  });

  it("data-testid='schedule-manager-view'が表示される", async () => {
    mockScheduleList.mockResolvedValue([]);

    render(<ScheduleManager />);

    await waitFor(() => {
      expect(screen.getByTestId("schedule-manager-view")).toBeInTheDocument();
    });
  });

  it("ヘッダーに「スケジュール管理」が表示される", async () => {
    mockScheduleList.mockResolvedValue([]);

    render(<ScheduleManager />);

    await waitFor(() => {
      expect(screen.getByText("スケジュール管理")).toBeInTheDocument();
    });
  });

  it("ローディング中にスピナーが表示される", () => {
    // 解決されないPromiseでローディングを維持
    mockScheduleList.mockReturnValue(new Promise(() => {}));

    render(<ScheduleManager />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("エラー時にエラーメッセージが表示される", async () => {
    mockScheduleList.mockRejectedValue(new Error("接続エラー"));

    render(<ScheduleManager />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(screen.getByText(/接続エラー/)).toBeInTheDocument();
  });

  it("スケジュールが空の場合にEmptyStateが表示される", async () => {
    mockScheduleList.mockResolvedValue([]);

    render(<ScheduleManager />);

    await waitFor(() => {
      expect(screen.getByText("スケジュールがありません")).toBeInTheDocument();
    });
  });

  it("スケジュール一覧が表示される", async () => {
    const schedules = [
      createMockScheduledSkill({ id: "sched-1", skillName: "skill-alpha" }),
      createMockScheduledSkill({ id: "sched-2", skillName: "skill-beta" }),
    ];
    mockScheduleList.mockResolvedValue(schedules);

    render(<ScheduleManager />);

    await waitFor(() => {
      expect(screen.getByText("skill-alpha")).toBeInTheDocument();
    });

    expect(screen.getByText("skill-beta")).toBeInTheDocument();
  });

  it("「新規作成」ボタンでダイアログが表示される", async () => {
    mockScheduleList.mockResolvedValue([]);

    render(<ScheduleManager />);

    await waitFor(() => {
      expect(screen.getByText("スケジュールがありません")).toBeInTheDocument();
    });

    const addButton = screen.getByTestId("add-schedule-button");

    await act(async () => {
      fireEvent.click(addButton);
    });

    expect(screen.getByTestId("schedule-dialog")).toBeInTheDocument();
  });
});
