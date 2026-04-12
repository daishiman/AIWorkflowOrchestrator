/**
 * @file trackEvent.ts
 * @description renderer-local の薄い計装抽象（W3-seq-04）
 *
 * SkillCreateWizard の 5 計装ポイントに対する型安全なイベント送信関数。
 * - dev 環境: console.info でログ出力
 * - prod 環境: analytics adapter 経由で IPC 送信（UT-W3-ANALYTICS-ADAPTER-001）
 * - 公開 API シグネチャ不変（呼び出し側の変更不要）
 *
 * 生成完了イベントの category は skillCreator の Step 0 カテゴリを使う。
 * SkillAnalytics / AnalyticsStore は execution-centric のため、
 * この UI 計装とは直接接続しない。
 */

import type { SkillCategory as WizardSkillCategory } from "@repo/shared/types/skillCreator";
import { getAnalyticsAdapter } from "./analyticsAdapter";

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
    action: "edit" | "execute" | "close";
  };
  skill_wizard_open: {
    source: "lifecycle_panel" | "direct";
  };
  skill_wizard_step_complete: {
    step: number;
    stepName: string;
  };
  skill_wizard_abandon: {
    lastStep: number;
  };
};

export function trackEvent<K extends keyof SkillWizardEvents>(
  eventName: K,
  payload: SkillWizardEvents[K],
): void {
  if (process.env.NODE_ENV !== "production") {
    console.info("[trackEvent]", eventName, payload);
    return;
  }

  // production だけ analytics adapter 経由で sink に送信（IPC → Main プロセス）
  getAnalyticsAdapter().send(eventName, payload as Record<string, unknown>);
}
