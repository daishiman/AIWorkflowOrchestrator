/**
 * @file trackEvent.e2e-stub.ts
 * @description E2E テスト用 trackEvent スタブ（renderer の差し替え）
 * @task UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001
 *
 * vite.e2e.config.ts の resolve.alias で
 * `src/renderer/utils/trackEvent.ts` をこのファイルに差し替える。
 *
 * 発火した trackEvent を window.__trackEventCalls に記録し、
 * テスト側から page.evaluate で取得可能にする。
 */

import type { SkillWizardEvents } from "../../src/renderer/utils/trackEvent";

export type TrackedEvent = {
  [K in keyof SkillWizardEvents]: {
    eventName: K;
    payload: SkillWizardEvents[K];
  };
}[keyof SkillWizardEvents];

declare global {
  interface Window {
    __trackEventCalls?: TrackedEvent[];
  }
}

export function trackEvent<K extends keyof SkillWizardEvents>(
  eventName: K,
  payload: SkillWizardEvents[K],
): void {
  (window.__trackEventCalls ??= []).push({
    eventName,
    payload,
  } as TrackedEvent);
}
