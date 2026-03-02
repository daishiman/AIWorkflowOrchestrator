/**
 * ScheduleManager 境界値・エラー・a11y テスト
 *
 * Phase 6 テスト拡充: 境界値テスト、IPCエラー、a11yテスト
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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

import { ScheduleManager } from "../index";

describe("ScheduleManager - 境界値テスト", () => {
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

  it("空配列のスケジュールでEmptyStateが表示される", async () => {
    mockScheduleList.mockResolvedValue([]);

    render(<ScheduleManager />);

    await waitFor(() => {
      expect(screen.getByText("スケジュールがありません")).toBeInTheDocument();
    });
  });

  it("100件以上のスケジュールが正常に表示される", async () => {
    const schedules = Array.from({ length: 120 }, (_, i) =>
      createMockScheduledSkill({
        id: `sched-${i}`,
        skillName: `skill-${i}`,
      }),
    );
    mockScheduleList.mockResolvedValue(schedules);

    render(<ScheduleManager />);

    await waitFor(() => {
      expect(screen.getByText("skill-0")).toBeInTheDocument();
    });

    // 件数表示が正しい
    expect(screen.getByText("120件のスケジュール")).toBeInTheDocument();
  });

  it("長いスキル名のスケジュールが正常に表示される", async () => {
    const longName = "a".repeat(200);
    mockScheduleList.mockResolvedValue([
      createMockScheduledSkill({ id: "long", skillName: longName }),
    ]);

    render(<ScheduleManager />);

    await waitFor(() => {
      expect(screen.getByText(longName)).toBeInTheDocument();
    });
  });
});

describe("ScheduleManager - エラー系テスト", () => {
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

  it("IPC呼び出し失敗時にエラーメッセージが表示される", async () => {
    mockScheduleList.mockRejectedValue(new Error("IPC呼び出し失敗"));

    render(<ScheduleManager />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(screen.getByText(/IPC呼び出し失敗/)).toBeInTheDocument();
  });

  it("ネットワークタイムアウトエラーが表示される", async () => {
    mockScheduleList.mockRejectedValue(
      new Error("ネットワークタイムアウト: 30秒"),
    );

    render(<ScheduleManager />);

    await waitFor(() => {
      expect(screen.getByText(/ネットワークタイムアウト/)).toBeInTheDocument();
    });
  });

  it("非Errorオブジェクトのエラーでもメッセージが表示される", async () => {
    mockScheduleList.mockRejectedValue("文字列エラー");

    render(<ScheduleManager />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});

describe("ScheduleManager - a11y テスト", () => {
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

  it("メインコンテナのdata-testidが設定されている", async () => {
    mockScheduleList.mockResolvedValue([]);

    render(<ScheduleManager />);

    await waitFor(() => {
      expect(screen.getByTestId("schedule-manager-view")).toBeInTheDocument();
    });
  });

  it("ローディング中にrole='status'が設定されている", () => {
    mockScheduleList.mockReturnValue(new Promise(() => {}));

    render(<ScheduleManager />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("エラー時にrole='alert'が設定されている", async () => {
    mockScheduleList.mockRejectedValue(new Error("エラー"));

    render(<ScheduleManager />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("新規作成ボタンにdata-testidが設定されている", async () => {
    mockScheduleList.mockResolvedValue([]);

    render(<ScheduleManager />);

    await waitFor(() => {
      expect(screen.getByTestId("add-schedule-button")).toBeInTheDocument();
    });
  });
});
