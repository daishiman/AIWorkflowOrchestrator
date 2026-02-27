/**
 * ScheduleStore - スキルスケジュール永続化ストア
 *
 * TASK-9G: スキルスケジュール実行機能
 *
 * electron-store を使用してスケジュールデータを永続化する。
 * P19対策: 復元時に Array.isArray() + filter() でバリデーションを行う。
 */

import ElectronStore from "electron-store";
import type { ScheduledSkill, ScheduledRunResult } from "@repo/shared";

/** runHistory の最大保持件数 */
const MAX_RUN_HISTORY = 100;

/** ストアスキーマ */
interface ScheduleStoreSchema {
  scheduledSkills: ScheduledSkill[];
}

/**
 * スケジュール永続化ストア
 *
 * electron-store ベースの CRUD + 実行履歴管理を提供する。
 */
export class ScheduleStore {
  private store: ElectronStore<ScheduleStoreSchema>;
  private schedules: ScheduledSkill[];

  constructor(store?: ElectronStore<ScheduleStoreSchema>) {
    this.store =
      store ??
      new ElectronStore<ScheduleStoreSchema>({
        name: "skill-schedules",
        defaults: {
          scheduledSkills: [],
        },
      });

    // P19対策: electron-store から復元時にバリデーション
    const raw: unknown = this.store.get("scheduledSkills");
    this.schedules = Array.isArray(raw)
      ? raw.filter(
          (item): item is ScheduledSkill =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as Record<string, unknown>).id === "string",
        )
      : [];
  }

  /**
   * 全スケジュールを取得する
   */
  getAll(): ScheduledSkill[] {
    return [...this.schedules];
  }

  /**
   * IDでスケジュールを取得する
   */
  getById(id: string): ScheduledSkill | undefined {
    return this.schedules.find((s) => s.id === id);
  }

  /**
   * スケジュールを追加する
   *
   * 呼び出し元が生成した ID をそのまま保存する。
   * createdAt / updatedAt が未設定の場合は現在時刻をデフォルトにする。
   *
   * @param schedule - 保存するスケジュールデータ
   * @returns 保存された ScheduledSkill
   */
  add(schedule: ScheduledSkill): ScheduledSkill {
    const now = new Date().toISOString();
    const newSchedule: ScheduledSkill = {
      ...schedule,
      runHistory: schedule.runHistory ?? [],
      createdAt: schedule.createdAt || now,
      updatedAt: schedule.updatedAt || now,
    };
    this.schedules.push(newSchedule);
    this.persist();
    return newSchedule;
  }

  /**
   * スケジュールを更新する
   *
   * @param id - 更新対象のスケジュールID
   * @param updates - 更新内容
   * @throws Error スケジュールが見つからない場合
   */
  update(id: string, updates: Partial<ScheduledSkill>): void {
    const index = this.findIndexOrThrow(id);
    this.schedules[index] = {
      ...this.schedules[index],
      ...updates,
      id, // IDは上書きさせない
      updatedAt: new Date().toISOString(),
    };
    this.persist();
  }

  /**
   * スケジュールを削除する
   *
   * @param id - 削除対象のスケジュールID
   * @throws Error スケジュールが見つからない場合
   */
  delete(id: string): void {
    const index = this.findIndexOrThrow(id);
    this.schedules.splice(index, 1);
    this.persist();
  }

  /**
   * 実行結果を追加する
   *
   * runHistory の先頭に追加し、最大 MAX_RUN_HISTORY 件を維持する。
   * lastRun を更新する。
   *
   * @param id - スケジュールID
   * @param result - 実行結果
   * @throws Error スケジュールが見つからない場合
   */
  addRunResult(id: string, result: ScheduledRunResult): void {
    const index = this.findIndexOrThrow(id);
    const schedule = this.schedules[index];
    // 先頭に追加し、最大件数を維持
    schedule.runHistory = [
      result,
      ...schedule.runHistory.slice(0, MAX_RUN_HISTORY - 1),
    ];
    schedule.lastRun = result.startedAt;
    schedule.updatedAt = new Date().toISOString();
    this.persist();
  }

  /**
   * IDでスケジュールのインデックスを検索する
   *
   * @param id - 検索対象のスケジュールID
   * @returns スケジュールのインデックス
   * @throws Error スケジュールが見つからない場合
   */
  private findIndexOrThrow(id: string): number {
    const index = this.schedules.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error(`Schedule not found: ${id}`);
    }
    return index;
  }

  /**
   * ストアに永続化する
   */
  private persist(): void {
    this.store.set("scheduledSkills", this.schedules);
  }
}
