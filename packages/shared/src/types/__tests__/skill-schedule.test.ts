/**
 * Skill Schedule Types - Type Definition Tests
 *
 * TASK-9G Phase 4: TDD Red Phase
 * 5 test cases (T-01 to T-05)
 *
 * Tests that type definitions compile correctly.
 * All tests should be in Red state (import will fail until Phase 5 creates the module).
 */
import { describe, it, expect } from "vitest";

import type {
  ScheduledSkill,
  SkillSchedule,
  NotificationSettings,
  ScheduledRunResult,
} from "../skill-schedule";

// =============================================================================
// Task 1: 型定義テスト (T-01 ~ T-05)
// =============================================================================
describe("Skill Schedule Types", () => {
  // T-01: ScheduledSkill 型が必須フィールドを持つ
  it("T-01: ScheduledSkill 型が必須フィールド（id, skillName, prompt, schedule, enabled, runHistory, notification）を持つ", () => {
    const scheduledSkill: ScheduledSkill = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      skillName: "daily-report",
      prompt: "本日の進捗をまとめてください",
      schedule: {
        type: "cron",
        cronExpression: "0 18 * * 1-5",
      },
      enabled: true,
      runHistory: [],
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system",
      },
    };

    expect(scheduledSkill.id).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(scheduledSkill.skillName).toBe("daily-report");
    expect(scheduledSkill.prompt).toBe("本日の進捗をまとめてください");
    expect(scheduledSkill.schedule.type).toBe("cron");
    expect(scheduledSkill.enabled).toBe(true);
    expect(scheduledSkill.runHistory).toEqual([]);
    expect(scheduledSkill.notification.onFailure).toBe(true);
  });

  // T-02: SkillSchedule の type が4種類を受け入れる
  it('T-02: SkillSchedule の type が "cron" | "interval" | "once" | "event" の4種類を受け入れる', () => {
    const cronSchedule: SkillSchedule = {
      type: "cron",
      cronExpression: "0 9 * * 1-5",
    };

    const intervalSchedule: SkillSchedule = {
      type: "interval",
      interval: 60000,
    };

    const onceSchedule: SkillSchedule = {
      type: "once",
      runAt: "2026-12-31T23:59:59.000Z",
    };

    const eventSchedule: SkillSchedule = {
      type: "event",
      event: "app_start",
    };

    expect(cronSchedule.type).toBe("cron");
    expect(intervalSchedule.type).toBe("interval");
    expect(onceSchedule.type).toBe("once");
    expect(eventSchedule.type).toBe("event");
  });

  // T-03: NotificationSettings の notificationType が3種類を受け入れる
  it('T-03: NotificationSettings の notificationType が "system" | "inApp" | "both" の3種類を受け入れる', () => {
    const systemNotif: NotificationSettings = {
      onSuccess: true,
      onFailure: true,
      notificationType: "system",
    };

    const inAppNotif: NotificationSettings = {
      onSuccess: false,
      onFailure: true,
      notificationType: "inApp",
    };

    const bothNotif: NotificationSettings = {
      onSuccess: true,
      onFailure: false,
      notificationType: "both",
    };

    expect(systemNotif.notificationType).toBe("system");
    expect(inAppNotif.notificationType).toBe("inApp");
    expect(bothNotif.notificationType).toBe("both");
  });

  // T-04: ScheduledRunResult 型が必須フィールドを持つ
  it("T-04: ScheduledRunResult 型が必須フィールド（runId, startedAt, success）を持つ", () => {
    const runResult: ScheduledRunResult = {
      runId: "run-001",
      startedAt: "2026-02-27T09:00:00.000Z",
      success: true,
    };

    expect(runResult.runId).toBe("run-001");
    expect(runResult.startedAt).toBe("2026-02-27T09:00:00.000Z");
    expect(runResult.success).toBe(true);

    // オプショナルフィールドの確認
    const runResultWithOptionals: ScheduledRunResult = {
      runId: "run-002",
      startedAt: "2026-02-27T10:00:00.000Z",
      success: false,
      completedAt: "2026-02-27T10:01:00.000Z",
      output: "Error occurred",
      error: "Skill execution timeout",
    };

    expect(runResultWithOptionals.completedAt).toBe("2026-02-27T10:01:00.000Z");
    expect(runResultWithOptionals.error).toBe("Skill execution timeout");
  });

  // T-05: ScheduledSkill.lastRun / nextRun がオプショナル
  it("T-05: ScheduledSkill.lastRun / nextRun がオプショナル（string | null | undefined）である", () => {
    const baseSchedule = {
      id: "test-id",
      skillName: "test-skill",
      prompt: "test prompt",
      schedule: { type: "cron" as const, cronExpression: "0 9 * * *" },
      enabled: true,
      runHistory: [],
      notification: {
        onSuccess: false,
        onFailure: true,
        notificationType: "system" as const,
      },
    };

    // lastRun / nextRun が undefined（プロパティ未指定）
    const withUndefined: ScheduledSkill = {
      ...baseSchedule,
    };
    expect(withUndefined.lastRun).toBeUndefined();
    expect(withUndefined.nextRun).toBeUndefined();

    // lastRun / nextRun が null
    const withNull: ScheduledSkill = {
      ...baseSchedule,
      lastRun: null,
      nextRun: null,
    };
    expect(withNull.lastRun).toBeNull();
    expect(withNull.nextRun).toBeNull();

    // lastRun / nextRun が string
    const withString: ScheduledSkill = {
      ...baseSchedule,
      lastRun: "2026-02-27T09:00:00.000Z",
      nextRun: "2026-02-27T18:00:00.000Z",
    };
    expect(withString.lastRun).toBe("2026-02-27T09:00:00.000Z");
    expect(withString.nextRun).toBe("2026-02-27T18:00:00.000Z");
  });
});
