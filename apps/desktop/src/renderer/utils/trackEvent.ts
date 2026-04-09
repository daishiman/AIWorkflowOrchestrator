/**
 * @file trackEvent.ts
 * @description renderer-local の薄い計装抽象（W3-seq-04）
 *
 * SkillCreateWizard の 5 計装ポイントに対する型安全なイベント送信関数。
 * - dev 環境: console.info でログ出力
 * - prod 環境: no-op
 * - 将来: 内部の sink を analytics adapter に差し替え可能（呼び出し側は変えない）
 *
 * 生成完了イベントの category は skillCreator の Step 0 カテゴリを使う。
 * SkillAnalytics / AnalyticsStore は execution-centric のため、
 * この UI 計装とは直接接続しない。
 */

import type { SkillCategory as WizardSkillCategory } from "@repo/shared/types/skillCreator";

export type SkillWizardEvents = {
  skill_wizard_started: Record<string, never>;
  skill_wizard_step1_completed: {
    method: "complete" | "skip";
    skippedAtQuestion: number | null;
  };
  skill_wizard_generation_completed: {
    method: "complete" | "skip";
    category: WizardSkillCategory;
    hasExternalIntegration: boolean;
  };
  skill_skeleton_quality_feedback: {
    satisfied: boolean;
    generationMethod: "complete" | "skip";
  };
  skill_wizard_next_action: {
    action: "execute" | "open_editor" | "create_another";
  };
};

export function trackEvent<K extends keyof SkillWizardEvents>(
  eventName: K,
  payload: SkillWizardEvents[K],
): void {
  if (process.env.NODE_ENV !== "production") {
    console.info("[trackEvent]", eventName, payload);
  }
  // 将来: execution-centric 基盤とは独立した sink に差し替える
}
