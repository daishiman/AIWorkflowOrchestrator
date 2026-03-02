import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ScheduleTable } from "../components/ScheduleTable";
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

describe("ScheduleTable", () => {
  const mockOnToggle = vi.fn<(id: string) => Promise<void>>();
  const mockOnDelete = vi.fn<(id: string) => Promise<void>>();
  const mockOnEdit = vi.fn<(schedule: ScheduledSkill) => void>();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("スケジュール行が表示される", () => {
    const schedules = [
      createMockScheduledSkill({ id: "sched-1", skillName: "skill-alpha" }),
      createMockScheduledSkill({ id: "sched-2", skillName: "skill-beta" }),
    ];

    render(
      <ScheduleTable
        schedules={schedules}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    );

    expect(screen.getByText("skill-alpha")).toBeInTheDocument();
    expect(screen.getByText("skill-beta")).toBeInTheDocument();
  });

  it("テーブルヘッダーが表示される", () => {
    render(
      <ScheduleTable
        schedules={[]}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    );

    expect(screen.getByText("スキル名")).toBeInTheDocument();
    expect(screen.getByText("スケジュール")).toBeInTheDocument();
    expect(screen.getByText("ステータス")).toBeInTheDocument();
    expect(screen.getByText("操作")).toBeInTheDocument();
  });

  it("トグルボタンでスケジュールの有効/無効を切り替える", async () => {
    const schedule = createMockScheduledSkill({
      id: "sched-1",
      enabled: true,
    });
    mockOnToggle.mockResolvedValue(undefined);

    render(
      <ScheduleTable
        schedules={[schedule]}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    );

    const toggleButton = screen.getByTestId("toggle-sched-1");

    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(mockOnToggle).toHaveBeenCalledWith("sched-1");
  });

  it("削除ボタンでスケジュールを削除する", async () => {
    const schedule = createMockScheduledSkill({ id: "sched-1" });
    mockOnDelete.mockResolvedValue(undefined);

    render(
      <ScheduleTable
        schedules={[schedule]}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    );

    const deleteButton = screen.getByTestId("delete-sched-1");

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    expect(mockOnDelete).toHaveBeenCalledWith("sched-1");
  });

  it("編集ボタンでonEditコールバックが呼ばれる", () => {
    const schedule = createMockScheduledSkill({ id: "sched-1" });

    render(
      <ScheduleTable
        schedules={[schedule]}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    );

    const editButton = screen.getByTestId("edit-sched-1");
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(schedule);
  });

  it("実行履歴パネルを展開できる", () => {
    const schedule = createMockScheduledSkill({
      id: "sched-1",
      runHistory: [
        createMockRunResult({ runId: "run-1", success: true }),
        createMockRunResult({ runId: "run-2", success: false, error: "失敗" }),
      ],
    });

    render(
      <ScheduleTable
        schedules={[schedule]}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    );

    const historyButton = screen.getByTestId("history-sched-1");
    fireEvent.click(historyButton);

    // 実行履歴パネルが展開される
    expect(screen.getByTestId("history-panel-sched-1")).toBeInTheDocument();
  });

  it("スケジュールタイプに応じたラベルを表示する", () => {
    const schedules = [
      createMockScheduledSkill({
        id: "sched-cron",
        skillName: "cron-skill",
        schedule: { type: "cron", cronExpression: "0 9 * * *" },
      }),
      createMockScheduledSkill({
        id: "sched-interval",
        skillName: "interval-skill",
        schedule: { type: "interval", interval: 3600000 },
      }),
    ];

    render(
      <ScheduleTable
        schedules={schedules}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />,
    );

    expect(screen.getByText("0 9 * * *")).toBeInTheDocument();
    // interval は時間表示
    expect(screen.getByText(/60分/)).toBeInTheDocument();
  });
});
