/**
 * SkillScheduler - スキルスケジューラサービス
 *
 * TASK-9G: スキルスケジュール実行機能
 *
 * cron / interval / once / event の4方式でスキルのスケジュール実行を管理する。
 * ScheduleStore で永続化し、SkillExecutor で実際のスキル実行を委譲する。
 */

import * as cron from "node-cron";
import type { ScheduledTask } from "node-cron";
import { randomUUID } from "crypto";
import type {
  ScheduledSkill,
  SkillSchedule,
  ScheduledRunResult,
} from "@repo/shared";
import type { ScheduleStore } from "./ScheduleStore";

/**
 * SkillExecutor のうちスケジューラが必要とするインターフェース
 */
export interface SchedulerSkillExecutor {
  execute(
    request: { prompt: string; skillId: string },
    skill: {
      id: string;
      name: string;
      description: string;
      path: string;
      anchors: unknown[];
      allowedTools?: string[];
    },
  ): Promise<{ executionId: string; success: boolean; error?: unknown }>;
}

/** アクティブジョブの参照 */
interface ActiveJob {
  type: "cron" | "interval" | "timeout";
  ref: ScheduledTask | ReturnType<typeof setTimeout>;
}

/**
 * スキルスケジューラサービス
 */
export class SkillScheduler {
  private scheduleStore: ScheduleStore;
  private skillExecutor: SchedulerSkillExecutor;
  private activeJobs: Map<string, ActiveJob> = new Map();

  constructor(
    scheduleStore: ScheduleStore,
    skillExecutor: SchedulerSkillExecutor,
  ) {
    this.scheduleStore = scheduleStore;
    this.skillExecutor = skillExecutor;
  }

  /**
   * スケジューラを初期化する
   *
   * ストアから全スケジュールを取得し、enabled なものをアクティベートする。
   */
  async initialize(): Promise<void> {
    const schedules = this.scheduleStore.getAll();
    for (const schedule of schedules) {
      if (schedule.enabled) {
        this.activateSchedule(schedule);
      }
    }
  }

  /**
   * スケジュール一覧を取得する
   */
  listSchedules(): ScheduledSkill[] {
    return this.scheduleStore.getAll();
  }

  /**
   * スケジュールを追加する
   *
   * UUID を生成し、nextRun を計算してストアに保存する。
   * enabled の場合は自動でアクティベートする。
   *
   * @param input - ID と runHistory を除くスケジュールデータ
   * @returns 生成された ScheduledSkill
   * @throws Error cron 式が不正な場合
   */
  async addSchedule(
    input: Omit<ScheduledSkill, "id" | "runHistory">,
  ): Promise<ScheduledSkill> {
    // cron式バリデーション
    if (input.schedule.type === "cron" && input.schedule.cronExpression) {
      if (!cron.validate(input.schedule.cronExpression)) {
        throw new Error(
          `Invalid cron expression: ${input.schedule.cronExpression}`,
        );
      }
    }

    // nextRun を計算
    const nextRun = this.calculateNextRun(input.schedule);
    const now = new Date().toISOString();

    // 完全な ScheduledSkill を構築（as キャスト回避: Omit 型から明示的にスプレッド）
    const schedule: ScheduledSkill = {
      skillName: input.skillName,
      prompt: input.prompt,
      schedule: input.schedule,
      enabled: input.enabled,
      notification: input.notification,
      lastRun: input.lastRun,
      id: randomUUID(),
      runHistory: [],
      nextRun: nextRun ? nextRun.toISOString() : null,
      createdAt: now,
      updatedAt: now,
    };

    // ストアに保存（戻り値がある場合はそちらを使用）
    const saved = this.scheduleStore.add(schedule);
    const result = saved || schedule;

    // enabled の場合はアクティベート
    if (result.enabled) {
      this.activateSchedule(result);
    }

    return result;
  }

  /**
   * スケジュールを更新する
   *
   * 既存タイマーをデアクティベート後、更新をストアに保存し、
   * enabled なら更新内容をマージしてリアクティベートする。
   *
   * @param id - スケジュールID
   * @param updates - 更新内容
   * @throws Error スケジュールが見つからない場合
   */
  async updateSchedule(
    id: string,
    updates: Partial<ScheduledSkill>,
  ): Promise<void> {
    // まずデアクティベート
    this.deactivateSchedule(id);

    // ストア更新
    this.scheduleStore.update(id, updates);

    // 再アクティベート（enabled の場合のみ）
    const stored = this.scheduleStore.getById(id);
    if (stored) {
      // 更新内容をマージ（ストアが即時反映しない場合にも対応）
      const merged = { ...stored, ...updates } as ScheduledSkill;
      if (merged.enabled) {
        this.activateSchedule(merged);
      }
    }
  }

  /**
   * スケジュールを削除する
   *
   * @param id - スケジュールID
   * @throws Error スケジュールが見つからない場合
   */
  async deleteSchedule(id: string): Promise<void> {
    this.deactivateSchedule(id);
    this.scheduleStore.delete(id);
  }

  /**
   * スケジュールを有効化する
   *
   * @param id - スケジュールID
   * @throws Error スケジュールが見つからない場合
   */
  async enableSchedule(id: string): Promise<void> {
    this.scheduleStore.update(id, { enabled: true });
    const schedule = this.scheduleStore.getById(id);
    if (schedule) {
      this.activateSchedule(schedule);
    }
  }

  /**
   * スケジュールを無効化する
   *
   * @param id - スケジュールID
   * @throws Error スケジュールが見つからない場合
   */
  async disableSchedule(id: string): Promise<void> {
    this.deactivateSchedule(id);
    this.scheduleStore.update(id, { enabled: false });
  }

  /**
   * スケジュールをアクティベートする（タイマー/cron ジョブを開始）
   */
  private activateSchedule(schedule: ScheduledSkill): void {
    // 既存のジョブがあれば先にデアクティベート
    this.deactivateSchedule(schedule.id);

    const { type } = schedule.schedule;

    switch (type) {
      case "cron": {
        const cronExpression = schedule.schedule.cronExpression;
        if (!cronExpression) break;
        const task = cron.schedule(cronExpression, () => {
          void this.executeScheduledSkill(schedule);
        });
        this.activeJobs.set(schedule.id, { type: "cron", ref: task });
        break;
      }
      case "interval": {
        const interval = schedule.schedule.interval;
        if (!interval || interval <= 0) break;
        const ref = setInterval(() => {
          void this.executeScheduledSkill(schedule);
        }, interval);
        this.activeJobs.set(schedule.id, { type: "interval", ref });
        break;
      }
      case "once": {
        const runAt = schedule.schedule.runAt;
        if (!runAt) break;
        const delay = new Date(runAt).getTime() - Date.now();
        if (delay <= 0) break; // 過去の日時は実行しない
        const ref = setTimeout(() => {
          void this.executeScheduledSkill(schedule);
        }, delay);
        this.activeJobs.set(schedule.id, { type: "timeout", ref });
        break;
      }
      case "event": {
        this.registerEventListener(schedule);
        break;
      }
    }
  }

  /**
   * スケジュールをデアクティベートする（タイマー/cron ジョブを停止）
   */
  private deactivateSchedule(id: string): void {
    const job = this.activeJobs.get(id);
    if (!job) return;

    switch (job.type) {
      case "cron":
        (job.ref as ScheduledTask).stop();
        break;
      case "interval":
        clearInterval(job.ref as ReturnType<typeof setInterval>);
        break;
      case "timeout":
        clearTimeout(job.ref as ReturnType<typeof setTimeout>);
        break;
    }

    this.activeJobs.delete(id);
  }

  /**
   * スケジュールされたスキルを実行する
   */
  private async executeScheduledSkill(schedule: ScheduledSkill): Promise<void> {
    const startedAt = new Date().toISOString();
    const runId = randomUUID();

    let runResult: ScheduledRunResult;

    try {
      // スキル実行
      const result = await this.skillExecutor.execute(
        {
          prompt: schedule.prompt,
          skillId: schedule.skillName,
        },
        {
          id: schedule.skillName,
          name: schedule.skillName,
          description: "",
          path: "",
          anchors: [],
        },
      );

      runResult = this.buildRunResult(runId, startedAt, {
        success: result.success,
        output: result.success
          ? `Execution ${result.executionId} completed`
          : undefined,
        error: result.success ? undefined : "Execution failed",
      });
    } catch (error) {
      runResult = this.buildRunResult(runId, startedAt, {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    this.scheduleStore.addRunResult(schedule.id, runResult);

    // nextRun を再計算（cron/interval の場合）
    if (
      schedule.schedule.type === "cron" ||
      schedule.schedule.type === "interval"
    ) {
      const nextRun = this.calculateNextRun(schedule.schedule);
      this.scheduleStore.update(schedule.id, {
        nextRun: nextRun ? nextRun.toISOString() : null,
      });
    }

    // once タイプは実行後に自動無効化
    if (schedule.schedule.type === "once") {
      await this.disableSchedule(schedule.id);
    }
  }

  /**
   * 次回実行時刻を計算する
   */
  private calculateNextRun(schedule: SkillSchedule): Date | undefined {
    switch (schedule.type) {
      case "cron": {
        // node-cron は次回実行時刻を直接算出する API を持たない
        // 簡易実装: 現在時刻 + 1分を仮の次回とする
        // 実運用では cron-parser ライブラリを使用する
        if (!schedule.cronExpression) return undefined;
        // 簡易的な次回実行時刻: 現在時刻の次の分
        const now = new Date();
        return new Date(now.getTime() + 60000 - (now.getTime() % 60000));
      }
      case "interval": {
        if (!schedule.interval || schedule.interval <= 0) return undefined;
        return new Date(Date.now() + schedule.interval);
      }
      case "once": {
        if (!schedule.runAt) return undefined;
        const runAtDate = new Date(schedule.runAt);
        return runAtDate.getTime() > Date.now() ? runAtDate : undefined;
      }
      case "event": {
        // イベント駆動のため時刻不定
        return undefined;
      }
      default:
        return undefined;
    }
  }

  /**
   * イベントリスナーを登録する
   *
   * 現時点では app_start / file_change / git_commit のプレースホルダー実装。
   */
  private registerEventListener(schedule: ScheduledSkill): void {
    // イベント駆動スケジュールのプレースホルダー
    // 将来的に app イベント / ファイルウォッチャー / git hook と連携する
    const event = schedule.schedule.event;

    if (event === "app_start") {
      // app_start はアプリ起動時に即座に実行
      void this.executeScheduledSkill(schedule);
    }
    // file_change と git_commit は将来実装
  }

  /**
   * 実行結果オブジェクトを構築する
   *
   * @param runId - 実行の一意識別子
   * @param startedAt - 実行開始日時（ISO 8601）
   * @param outcome - 実行結果の詳細
   * @returns 構築された ScheduledRunResult
   */
  private buildRunResult(
    runId: string,
    startedAt: string,
    outcome: { success: boolean; output?: string; error?: string },
  ): ScheduledRunResult {
    return {
      runId,
      startedAt,
      success: outcome.success,
      completedAt: new Date().toISOString(),
      output: outcome.output,
      error: outcome.error,
    };
  }

  /**
   * アクティブなジョブの数を取得する（テスト用）
   */
  getActiveJobCount(): number {
    return this.activeJobs.size;
  }

  /**
   * アクティブなジョブの存在確認（テスト用）
   */
  hasActiveJob(id: string): boolean {
    return this.activeJobs.has(id);
  }
}
