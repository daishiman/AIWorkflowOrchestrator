import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as cron from "node-cron";
import type { ScheduledSkill } from "@repo/shared/src/types/skill-schedule";
import { SkillScheduler } from "../SkillScheduler";

const { mockCronTask, mockCronSchedule, mockCronValidate } = vi.hoisted(() => {
  const task = {
    stop: vi.fn(),
    start: vi.fn(),
  };

  return {
    mockCronTask: task,
    mockCronSchedule: vi.fn(() => task),
    mockCronValidate: vi.fn(() => true),
  };
});

vi.mock("node-cron", () => ({
  schedule: mockCronSchedule,
  validate: mockCronValidate,
}));

const mockScheduleStore = {
  getAll: vi.fn(() => [] as ScheduledSkill[]),
  getById: vi.fn(),
  add: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  addRunResult: vi.fn(),
};

const mockSkillExecutor = {
  execute: vi.fn().mockResolvedValue({
    executionId: "exec-001",
    success: true,
  }),
};

function createBaseSchedule(
  overrides: Partial<ScheduledSkill> = {},
): ScheduledSkill {
  const now = new Date("2026-02-27T09:00:00.000Z").toISOString();
  return {
    id: overrides.id ?? "sched-001",
    skillName: overrides.skillName ?? "daily-report",
    prompt: overrides.prompt ?? "本日の進捗をまとめてください",
    schedule: overrides.schedule ?? {
      type: "cron",
      cronExpression: "0 9 * * *",
    },
    enabled: overrides.enabled ?? true,
    runHistory: overrides.runHistory ?? [],
    notification: overrides.notification ?? {
      onSuccess: false,
      onFailure: true,
      notificationType: "system",
    },
    lastRun: overrides.lastRun ?? null,
    nextRun: overrides.nextRun ?? null,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  };
}

describe("SkillScheduler", () => {
  let scheduler: SkillScheduler;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-27T09:00:00.000Z"));
    vi.clearAllMocks();

    mockScheduleStore.getAll.mockReturnValue([]);
    mockScheduleStore.getById.mockReturnValue(undefined);

    mockScheduleStore.add.mockImplementation(
      (input: Omit<ScheduledSkill, "id" | "runHistory">) =>
        createBaseSchedule({
          ...input,
          id: "sched-001",
          runHistory: [],
        }),
    );

    scheduler = new SkillScheduler(
      mockScheduleStore as never,
      mockSkillExecutor as never,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initialize() は enabled=true のスケジュールのみ有効化する", async () => {
    mockScheduleStore.getAll.mockReturnValue([
      createBaseSchedule({ id: "enabled", enabled: true }),
      createBaseSchedule({
        id: "disabled",
        enabled: false,
      }),
    ]);

    await scheduler.initialize();

    expect(cron.schedule).toHaveBeenCalledTimes(1);
    expect(cron.schedule).toHaveBeenCalledWith(
      "0 9 * * *",
      expect.any(Function),
    );
  });

  it("addSchedule() は有効スケジュールを保存しジョブ登録する", async () => {
    const result = await scheduler.addSchedule({
      skillName: "hourly-report",
      prompt: "report",
      schedule: {
        type: "cron",
        cronExpression: "0 * * * *",
      },
      enabled: true,
      notification: {
        onSuccess: true,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    expect(mockScheduleStore.add).toHaveBeenCalledTimes(1);
    expect(result.nextRun).toEqual(expect.any(String));
    expect(cron.schedule).toHaveBeenCalledTimes(1);
  });

  it("addSchedule() は無効な cron 式を拒否する", async () => {
    mockCronValidate.mockReturnValueOnce(false);

    await expect(
      scheduler.addSchedule({
        skillName: "invalid-cron",
        prompt: "test",
        schedule: {
          type: "cron",
          cronExpression: "invalid",
        },
        enabled: true,
        notification: {
          onSuccess: false,
          onFailure: true,
          notificationType: "system",
        },
        createdAt: "2026-02-27T09:00:00.000Z",
        updatedAt: "2026-02-27T09:00:00.000Z",
        nextRun: null,
        lastRun: null,
      }),
    ).rejects.toThrow("Invalid cron expression");
  });

  it("addSchedule() は enabled=false の場合ジョブ登録しない", async () => {
    await scheduler.addSchedule({
      skillName: "disabled",
      prompt: "test",
      schedule: {
        type: "cron",
        cronExpression: "0 * * * *",
      },
      enabled: false,
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    expect(cron.schedule).not.toHaveBeenCalled();
  });

  it("updateSchedule() は既存ジョブを停止して再有効化する", async () => {
    const added = await scheduler.addSchedule({
      skillName: "daily-report",
      prompt: "before",
      schedule: {
        type: "cron",
        cronExpression: "0 9 * * *",
      },
      enabled: true,
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    vi.clearAllMocks();
    mockScheduleStore.getById.mockReturnValue(
      createBaseSchedule({
        id: added.id,
        schedule: {
          type: "cron",
          cronExpression: "0 18 * * *",
        },
      }),
    );

    await scheduler.updateSchedule(added.id, {
      prompt: "after",
      schedule: {
        type: "cron",
        cronExpression: "0 18 * * *",
      },
    });

    expect(mockCronTask.stop).toHaveBeenCalledTimes(1);
    expect(mockScheduleStore.update).toHaveBeenCalledWith(added.id, {
      prompt: "after",
      schedule: {
        type: "cron",
        cronExpression: "0 18 * * *",
      },
    });
    expect(cron.schedule).toHaveBeenCalledWith(
      "0 18 * * *",
      expect.any(Function),
    );
  });

  it("deleteSchedule() はジョブ停止後に削除する", async () => {
    const added = await scheduler.addSchedule({
      skillName: "daily-report",
      prompt: "test",
      schedule: {
        type: "cron",
        cronExpression: "0 9 * * *",
      },
      enabled: true,
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    vi.clearAllMocks();
    await scheduler.deleteSchedule(added.id);

    expect(mockCronTask.stop).toHaveBeenCalledTimes(1);
    expect(mockScheduleStore.delete).toHaveBeenCalledWith(added.id);
  });

  it("enableSchedule() はストア更新後にジョブを有効化する", async () => {
    mockScheduleStore.getById.mockReturnValue(
      createBaseSchedule({
        id: "enable-id",
        enabled: true,
      }),
    );

    await scheduler.enableSchedule("enable-id");

    expect(mockScheduleStore.update).toHaveBeenCalledWith("enable-id", {
      enabled: true,
    });
    expect(cron.schedule).toHaveBeenCalledTimes(1);
  });

  it("disableSchedule() はジョブ停止後に enabled=false を保存する", async () => {
    const added = await scheduler.addSchedule({
      skillName: "daily-report",
      prompt: "test",
      schedule: {
        type: "cron",
        cronExpression: "0 9 * * *",
      },
      enabled: true,
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    vi.clearAllMocks();
    await scheduler.disableSchedule(added.id);

    expect(mockCronTask.stop).toHaveBeenCalledTimes(1);
    expect(mockScheduleStore.update).toHaveBeenCalledWith(added.id, {
      enabled: false,
    });
  });

  it("interval スケジュール実行時は runHistory が更新される", async () => {
    mockScheduleStore.add.mockImplementationOnce(
      (input: Omit<ScheduledSkill, "id" | "runHistory">) =>
        createBaseSchedule({
          id: "interval-id",
          ...input,
          runHistory: [],
        }),
    );

    await scheduler.addSchedule({
      skillName: "interval-skill",
      prompt: "run",
      schedule: {
        type: "interval",
        interval: 1000,
      },
      enabled: true,
      notification: {
        onSuccess: true,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    vi.advanceTimersByTime(1000);
    await Promise.resolve();
    await Promise.resolve();

    expect(mockSkillExecutor.execute).toHaveBeenCalledTimes(1);
    expect(mockScheduleStore.addRunResult).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        success: true,
      }),
    );
  });

  it("実行失敗時は runHistory に error を記録する", async () => {
    mockSkillExecutor.execute.mockRejectedValueOnce(new Error("boom"));

    await scheduler.addSchedule({
      skillName: "cron-fail",
      prompt: "run",
      schedule: {
        type: "cron",
        cronExpression: "* * * * *",
      },
      enabled: true,
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    const callback = mockCronSchedule.mock.calls[0][1] as () => Promise<void>;
    await callback();

    expect(mockScheduleStore.addRunResult).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        success: false,
        error: "boom",
      }),
    );
  });

  it("once スケジュール実行後は自動で無効化される", async () => {
    mockScheduleStore.add.mockImplementationOnce(
      (input: Omit<ScheduledSkill, "id" | "runHistory">) =>
        createBaseSchedule({
          id: "once-id",
          ...input,
          runHistory: [],
        }),
    );

    const runAt = new Date(Date.now() + 5000).toISOString();
    await scheduler.addSchedule({
      skillName: "once-skill",
      prompt: "run once",
      schedule: {
        type: "once",
        runAt,
      },
      enabled: true,
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    vi.advanceTimersByTime(5000);
    await Promise.resolve();
    await Promise.resolve();

    expect(mockScheduleStore.update).toHaveBeenCalledWith(expect.any(String), {
      enabled: false,
    });
  });

  it("過去日時の once は nextRun=null で保存する", async () => {
    const result = await scheduler.addSchedule({
      skillName: "past-once",
      prompt: "run",
      schedule: {
        type: "once",
        runAt: new Date(Date.now() - 1000).toISOString(),
      },
      enabled: true,
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    expect(result.nextRun).toBeNull();
  });

  it("event スケジュールは nextRun=null で保存する", async () => {
    const result = await scheduler.addSchedule({
      skillName: "event-skill",
      prompt: "run",
      schedule: {
        type: "event",
        event: "app_start",
      },
      enabled: true,
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    expect(result.nextRun).toBeNull();
  });

  // ===========================================================================
  // Phase 6: 境界値・エッジケーステスト拡充 (SB-01 ~ SB-12)
  // ===========================================================================

  // --- タイマー関連 (SB-01 ~ SB-04) ---

  // SB-01
  it("SB-01: interval スケジュールが指定間隔ごとに繰り返し実行される", async () => {
    mockScheduleStore.add.mockImplementationOnce(
      (input: Omit<ScheduledSkill, "id" | "runHistory">) =>
        createBaseSchedule({
          id: "interval-repeat",
          ...input,
          runHistory: [],
        }),
    );

    await scheduler.addSchedule({
      skillName: "interval-repeat-skill",
      prompt: "run",
      schedule: { type: "interval", interval: 5000 },
      enabled: true,
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    // 1回目
    vi.advanceTimersByTime(5000);
    await Promise.resolve();
    await Promise.resolve();
    expect(mockSkillExecutor.execute).toHaveBeenCalledTimes(1);

    // 2回目
    vi.advanceTimersByTime(5000);
    await Promise.resolve();
    await Promise.resolve();
    expect(mockSkillExecutor.execute).toHaveBeenCalledTimes(2);

    // 3回目
    vi.advanceTimersByTime(5000);
    await Promise.resolve();
    await Promise.resolve();
    expect(mockSkillExecutor.execute).toHaveBeenCalledTimes(3);
  });

  // SB-02
  it("SB-02: once スケジュールが実行後に再実行されない", async () => {
    mockScheduleStore.add.mockImplementationOnce(
      (input: Omit<ScheduledSkill, "id" | "runHistory">) =>
        createBaseSchedule({
          id: "once-no-repeat",
          ...input,
          runHistory: [],
        }),
    );

    const runAt = new Date(Date.now() + 3000).toISOString();
    await scheduler.addSchedule({
      skillName: "once-no-repeat-skill",
      prompt: "run once",
      schedule: { type: "once", runAt },
      enabled: true,
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    // 実行
    vi.advanceTimersByTime(3000);
    await Promise.resolve();
    await Promise.resolve();
    expect(mockSkillExecutor.execute).toHaveBeenCalledTimes(1);

    // 2倍の時間が経過しても再実行されない
    vi.advanceTimersByTime(3000);
    await Promise.resolve();
    await Promise.resolve();
    expect(mockSkillExecutor.execute).toHaveBeenCalledTimes(1);
  });

  // SB-03
  it("SB-03: disableSchedule 後に interval タイマーが実行されない", async () => {
    mockScheduleStore.add.mockImplementationOnce(
      (input: Omit<ScheduledSkill, "id" | "runHistory">) =>
        createBaseSchedule({
          id: "disable-interval",
          ...input,
          runHistory: [],
        }),
    );

    const added = await scheduler.addSchedule({
      skillName: "disable-interval-skill",
      prompt: "run",
      schedule: { type: "interval", interval: 2000 },
      enabled: true,
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    // disable してからタイマーが進行しても実行されない
    await scheduler.disableSchedule(added.id);

    vi.advanceTimersByTime(2000);
    await Promise.resolve();
    await Promise.resolve();
    expect(mockSkillExecutor.execute).not.toHaveBeenCalled();
  });

  // SB-04
  it("SB-04: deleteSchedule 後にタイマーが実行されない", async () => {
    mockScheduleStore.add.mockImplementationOnce(
      (input: Omit<ScheduledSkill, "id" | "runHistory">) =>
        createBaseSchedule({
          id: "delete-interval",
          ...input,
          runHistory: [],
        }),
    );

    const added = await scheduler.addSchedule({
      skillName: "delete-interval-skill",
      prompt: "run",
      schedule: { type: "interval", interval: 2000 },
      enabled: true,
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    await scheduler.deleteSchedule(added.id);

    vi.advanceTimersByTime(2000);
    await Promise.resolve();
    await Promise.resolve();
    expect(mockSkillExecutor.execute).not.toHaveBeenCalled();
  });

  // --- 並行実行 (SB-05 ~ SB-06) ---

  // SB-05
  it("SB-05: 同一スキルの複数スケジュールが独立して動作する", async () => {
    let addCount = 0;
    mockScheduleStore.add.mockImplementation(
      (input: Omit<ScheduledSkill, "id" | "runHistory">) => {
        addCount++;
        return createBaseSchedule({
          id: `concurrent-${addCount}`,
          ...input,
          runHistory: [],
        });
      },
    );

    await scheduler.addSchedule({
      skillName: "same-skill",
      prompt: "run-a",
      schedule: { type: "interval", interval: 3000 },
      enabled: true,
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    await scheduler.addSchedule({
      skillName: "same-skill",
      prompt: "run-b",
      schedule: { type: "interval", interval: 5000 },
      enabled: true,
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    // 3秒後: interval=3000 のみ実行
    vi.advanceTimersByTime(3000);
    await Promise.resolve();
    await Promise.resolve();
    expect(mockSkillExecutor.execute).toHaveBeenCalledTimes(1);

    // 5秒後（合計5秒）: interval=5000 も実行
    vi.advanceTimersByTime(2000);
    await Promise.resolve();
    await Promise.resolve();
    expect(mockSkillExecutor.execute).toHaveBeenCalledTimes(2);
  });

  // SB-06
  it("SB-06: スケジュール実行中に deleteSchedule しても実行中のタスクはクラッシュしない", async () => {
    let resolveExecution: (() => void) | undefined;
    mockSkillExecutor.execute.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveExecution = () =>
            resolve({ executionId: "exec-slow", success: true });
        }),
    );

    mockScheduleStore.add.mockImplementationOnce(
      (input: Omit<ScheduledSkill, "id" | "runHistory">) =>
        createBaseSchedule({
          id: "delete-during-exec",
          ...input,
          runHistory: [],
        }),
    );

    const added = await scheduler.addSchedule({
      skillName: "slow-skill",
      prompt: "run",
      schedule: { type: "interval", interval: 1000 },
      enabled: true,
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    // タイマー発火で実行開始
    vi.advanceTimersByTime(1000);
    await Promise.resolve();

    // 実行中にスケジュール削除
    await scheduler.deleteSchedule(added.id);

    // 実行を完了 - クラッシュしないことを検証
    resolveExecution!();
    await Promise.resolve();
    await Promise.resolve();

    // 次の実行は発生しない
    vi.advanceTimersByTime(1000);
    await Promise.resolve();
    await Promise.resolve();
    expect(mockSkillExecutor.execute).toHaveBeenCalledTimes(1);
  });

  // --- エラーリカバリ (SB-07 ~ SB-08) ---

  // SB-07
  it("SB-07: SkillExecutor.execute が例外をスローしてもスケジューラは停止しない", async () => {
    mockSkillExecutor.execute
      .mockRejectedValueOnce(new Error("temporary failure"))
      .mockResolvedValueOnce({ executionId: "exec-ok", success: true });

    mockScheduleStore.add.mockImplementationOnce(
      (input: Omit<ScheduledSkill, "id" | "runHistory">) =>
        createBaseSchedule({
          id: "error-recovery",
          ...input,
          runHistory: [],
        }),
    );

    await scheduler.addSchedule({
      skillName: "error-recovery-skill",
      prompt: "run",
      schedule: { type: "interval", interval: 2000 },
      enabled: true,
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    // 1回目: エラー
    vi.advanceTimersByTime(2000);
    await Promise.resolve();
    await Promise.resolve();

    expect(mockScheduleStore.addRunResult).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ success: false, error: "temporary failure" }),
    );

    // 2回目: 成功 - スケジューラが停止していないことを確認
    vi.advanceTimersByTime(2000);
    await Promise.resolve();
    await Promise.resolve();

    expect(mockSkillExecutor.execute).toHaveBeenCalledTimes(2);
    expect(mockScheduleStore.addRunResult).toHaveBeenCalledTimes(2);
  });

  // SB-08
  it("SB-08: SkillExecutor.execute の結果が success: false の場合も runHistory に記録される", async () => {
    mockSkillExecutor.execute.mockResolvedValueOnce({
      executionId: "exec-fail",
      success: false,
    });

    await scheduler.addSchedule({
      skillName: "fail-result-skill",
      prompt: "run",
      schedule: { type: "cron", cronExpression: "* * * * *" },
      enabled: true,
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    const callback = mockCronSchedule.mock.calls[0][1] as () => Promise<void>;
    await callback();

    expect(mockScheduleStore.addRunResult).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        success: false,
        error: "Execution failed",
      }),
    );
  });

  // --- イベントトリガー (SB-09 ~ SB-12) ---

  // SB-09
  it("SB-09: event: 'app_start' のスケジュールが initialize 時に実行される", async () => {
    mockScheduleStore.getAll.mockReturnValue([
      createBaseSchedule({
        id: "event-app-start",
        schedule: { type: "event", event: "app_start" },
        enabled: true,
      }),
    ]);

    await scheduler.initialize();

    // app_start はアクティベート時に即座に実行される
    await Promise.resolve();
    await Promise.resolve();

    expect(mockSkillExecutor.execute).toHaveBeenCalledTimes(1);
  });

  // SB-10
  it("SB-10: event: 'file_change' のスケジュールは登録されるが即座に実行されない（将来実装）", async () => {
    mockScheduleStore.add.mockImplementationOnce(
      (input: Omit<ScheduledSkill, "id" | "runHistory">) =>
        createBaseSchedule({
          id: "event-file-change",
          ...input,
          runHistory: [],
        }),
    );

    await scheduler.addSchedule({
      skillName: "file-change-skill",
      prompt: "run",
      schedule: { type: "event", event: "file_change" },
      enabled: true,
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    // file_change は将来実装のため即座には実行されない
    await Promise.resolve();
    await Promise.resolve();
    expect(mockSkillExecutor.execute).not.toHaveBeenCalled();
  });

  // SB-11
  it("SB-11: event: 'git_commit' のスケジュールは登録されるが即座に実行されない（将来実装）", async () => {
    mockScheduleStore.add.mockImplementationOnce(
      (input: Omit<ScheduledSkill, "id" | "runHistory">) =>
        createBaseSchedule({
          id: "event-git-commit",
          ...input,
          runHistory: [],
        }),
    );

    await scheduler.addSchedule({
      skillName: "git-commit-skill",
      prompt: "run",
      schedule: { type: "event", event: "git_commit" },
      enabled: true,
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    // git_commit は将来実装のため即座には実行されない
    await Promise.resolve();
    await Promise.resolve();
    expect(mockSkillExecutor.execute).not.toHaveBeenCalled();
  });

  // SB-12
  it("SB-12: 無効化されたイベントスケジュールは initialize 時に実行されない", async () => {
    mockScheduleStore.getAll.mockReturnValue([
      createBaseSchedule({
        id: "disabled-event",
        schedule: { type: "event", event: "app_start" },
        enabled: false,
      }),
    ]);

    await scheduler.initialize();

    await Promise.resolve();
    await Promise.resolve();

    expect(mockSkillExecutor.execute).not.toHaveBeenCalled();
  });

  // --- ユーティリティメソッド ---

  it("getActiveJobCount() はアクティブジョブ数を返す", async () => {
    expect(scheduler.getActiveJobCount()).toBe(0);

    await scheduler.addSchedule({
      skillName: "count-skill",
      prompt: "run",
      schedule: { type: "cron", cronExpression: "0 9 * * *" },
      enabled: true,
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    expect(scheduler.getActiveJobCount()).toBe(1);
  });

  it("hasActiveJob() はジョブの存在確認を返す", async () => {
    expect(scheduler.hasActiveJob("has-job-id")).toBe(false);

    mockScheduleStore.add.mockImplementationOnce(
      (input: Omit<ScheduledSkill, "id" | "runHistory">) =>
        createBaseSchedule({
          id: "has-job-id",
          ...input,
          runHistory: [],
        }),
    );

    const added = await scheduler.addSchedule({
      skillName: "has-job-skill",
      prompt: "run",
      schedule: { type: "cron", cronExpression: "0 9 * * *" },
      enabled: true,
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system",
      },
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
      nextRun: null,
      lastRun: null,
    });

    expect(scheduler.hasActiveJob(added.id)).toBe(true);
  });

  it("listSchedules() は store.getAll() を返す", () => {
    const schedules = [createBaseSchedule({ id: "list-1" })];
    mockScheduleStore.getAll.mockReturnValue(schedules);

    expect(scheduler.listSchedules()).toEqual(schedules);
  });
});
