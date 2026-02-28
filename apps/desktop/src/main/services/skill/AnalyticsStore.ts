/**
 * AnalyticsStore - スキル利用分析データの永続化ストア
 *
 * TASK-9J: スキル利用分析・統計機能
 *
 * electron-store を使用してスキル利用イベントを永続化する。
 * P19対策: 復元時に Array.isArray() + filter() でバリデーションを行う。
 */

import ElectronStore from "electron-store";
import { randomUUID } from "crypto";
import type { SkillUsageEvent } from "@repo/shared";

/** ストアスキーマ */
interface AnalyticsStoreSchema {
  "skill-analytics-events": SkillUsageEvent[];
}

/**
 * スキル利用分析データの永続化ストア
 *
 * electron-store ベースの CRUD + フィルタリングを提供する。
 */
export class AnalyticsStore {
  private store: ElectronStore<AnalyticsStoreSchema>;
  private events: SkillUsageEvent[];

  constructor(store?: ElectronStore<AnalyticsStoreSchema>) {
    this.store =
      store ??
      new ElectronStore<AnalyticsStoreSchema>({
        name: "skill-analytics",
        defaults: {
          "skill-analytics-events": [],
        },
      });

    // P19対策: electron-store から復元時にバリデーション
    const raw: unknown = this.store.get("skill-analytics-events");
    this.events = Array.isArray(raw)
      ? raw.filter(
          (item): item is SkillUsageEvent =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as Record<string, unknown>).id === "string" &&
            typeof (item as Record<string, unknown>).skillName === "string" &&
            typeof (item as Record<string, unknown>).timestamp === "string",
        )
      : [];
  }

  /**
   * 全イベントを取得する
   */
  getAllEvents(): SkillUsageEvent[] {
    return [...this.events];
  }

  /**
   * イベントを追加する
   *
   * id が未設定の場合は UUID を自動生成する。
   *
   * @param event - 追加するイベントデータ
   * @returns 追加されたイベント（id付き）
   */
  addEvent(
    event: Omit<SkillUsageEvent, "id"> & { id?: string },
  ): SkillUsageEvent {
    const newEvent: SkillUsageEvent = {
      ...event,
      id: event.id || randomUUID(),
    };
    this.events.push(newEvent);
    this.persist();
    return newEvent;
  }

  /**
   * スキル名でイベントをフィルタする
   *
   * @param skillName - フィルタ対象のスキル名
   * @returns 該当スキルのイベント配列
   */
  getEventsBySkill(skillName: string): SkillUsageEvent[] {
    return this.events.filter((e) => e.skillName === skillName);
  }

  /**
   * 期間でイベントをフィルタする（inclusive: start <= timestamp <= end）
   *
   * @param start - 期間開始日時 (ISO 8601形式)
   * @param end - 期間終了日時 (ISO 8601形式)
   * @returns 期間内のイベント配列
   */
  getEventsByPeriod(start: string, end: string): SkillUsageEvent[] {
    return this.events.filter((e) => {
      return e.timestamp >= start && e.timestamp <= end;
    });
  }

  /**
   * 指定日時より前のイベントを削除する
   *
   * @param before - この日時より前のイベントを削除 (ISO 8601形式)
   */
  clearBefore(before: string): void {
    this.events = this.events.filter((e) => e.timestamp >= before);
    this.persist();
  }

  /**
   * 全イベントを削除する
   */
  clearAll(): void {
    this.events = [];
    this.persist();
  }

  /**
   * ストアに永続化する
   */
  private persist(): void {
    this.store.set("skill-analytics-events", this.events);
  }
}
