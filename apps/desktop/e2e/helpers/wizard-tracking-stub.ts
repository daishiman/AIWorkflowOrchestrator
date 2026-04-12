/**
 * @file wizard-tracking-stub.ts
 * @description E2E テスト用 trackEvent capture ヘルパー
 * @task UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001
 *
 * page.addInitScript で window.__trackEventCalls を初期化し、
 * テスト側から記録済みイベントを取得・クリアするためのヘルパー。
 */

import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import type { SkillWizardEvents } from "../../src/renderer/utils/trackEvent";

type OnboardingStoreOverrides = {
  hasCompleted?: boolean;
  userName?: string;
  selectedStarterTool?: string | null;
};

/**
 * E2E テスト用の captured event 型。
 * SkillWizardEvents の全イベント名・ペイロードと型整合を保つ（AC-8）。
 */
export type TrackEventEntry = {
  [K in keyof SkillWizardEvents]: {
    eventName: K;
    payload: SkillWizardEvents[K];
  };
}[keyof SkillWizardEvents];

/**
 * page.addInitScript を用いて window.__trackEventCalls を初期化する。
 * 必ず page.goto() より前に呼び出すこと。
 */
export async function initTrackingCapture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const runtimeWindow = window as typeof window & {
      __trackEventCalls?: Array<{
        eventName: string;
        payload: unknown;
      }>;
      __trackEventConsolePatched?: boolean;
    };

    runtimeWindow.__trackEventCalls = [];

    if (!runtimeWindow.__trackEventConsolePatched) {
      const originalInfo = console.info.bind(console);
      console.info = (...args: unknown[]) => {
        if (
          args.length >= 2 &&
          args[0] === "[trackEvent]" &&
          typeof args[1] === "string"
        ) {
          runtimeWindow.__trackEventCalls?.push({
            eventName: args[1],
            payload: args[2] ?? {},
          });
        }
        originalInfo(...args);
      };
      runtimeWindow.__trackEventConsolePatched = true;
    }
  });
}

/**
 * Onboarding の永続ストア読み出しを E2E 向けに上書きする。
 * 既存の window.electronAPI は保持し、store.get のみ必要キーを優先返却する。
 */
export async function injectOnboardingStoreMock(
  page: Page,
  overrides: OnboardingStoreOverrides = {},
): Promise<void> {
  await page.addInitScript((params: OnboardingStoreOverrides) => {
    const defaultValues = {
      hasCompleted: params.hasCompleted ?? true,
      userName: params.userName ?? "E2E User",
      selectedStarterTool: params.selectedStarterTool ?? "workspace",
    };

    const runtimeWindow = window as typeof window & {
      electronAPI?: {
        store?: {
          get?: (request: {
            key: string;
            defaultValue?: unknown;
          }) => Promise<{ success: boolean; data?: unknown }>;
          set?: (request: {
            key: string;
            value: unknown;
          }) => Promise<{ success: boolean; data?: unknown }>;
        };
        [key: string]: unknown;
      };
    };

    const existingElectronAPI = (runtimeWindow.electronAPI ?? {}) as {
      store?: {
        get?: (request: {
          key: string;
          defaultValue?: unknown;
        }) => Promise<{ success: boolean; data?: unknown }>;
        set?: (request: { key: string; value: unknown }) => Promise<{
          success: boolean;
          data?: unknown;
        }>;
      };
      [key: string]: unknown;
    };
    const existingStore = existingElectronAPI.store ?? {};
    const originalGet = existingStore.get?.bind(existingStore);
    const existingSkill = (existingElectronAPI.skill ?? {}) as Record<
      string,
      unknown
    >;

    existingElectronAPI.store = {
      ...existingStore,
      get: async (request) => {
        const key = request?.key;
        if (key === "onboarding.hasCompleted") {
          return { success: true, data: defaultValues.hasCompleted };
        }
        if (key === "onboarding.userName") {
          return { success: true, data: defaultValues.userName };
        }
        if (
          key === "onboarding.selectedStarterTool" ||
          key === "selectedStarterTool"
        ) {
          return { success: true, data: defaultValues.selectedStarterTool };
        }
        if (originalGet) {
          return originalGet(request);
        }
        return { success: true, data: request?.defaultValue };
      },
      set:
        existingStore.set ??
        (async () => ({
          success: true,
          data: {},
        })),
    };

    existingElectronAPI.skill = {
      ...existingSkill,
      list:
        typeof existingSkill.list === "function"
          ? existingSkill.list
          : async () => [],
      getImported:
        typeof existingSkill.getImported === "function"
          ? existingSkill.getImported
          : async () => [],
      rescan:
        typeof existingSkill.rescan === "function"
          ? existingSkill.rescan
          : async () => [],
      create:
        typeof existingSkill.create === "function"
          ? existingSkill.create
          : async () => ({
              path: "/tmp/e2e-generated-skill",
            }),
      import:
        typeof existingSkill.import === "function"
          ? existingSkill.import
          : async (skillName: string) => ({
              name: skillName,
              path: `/tmp/${skillName}`,
            }),
      remove:
        typeof existingSkill.remove === "function"
          ? existingSkill.remove
          : async () => undefined,
    };

    runtimeWindow.electronAPI = existingElectronAPI;
    window.localStorage.setItem(
      "onboarding.hasCompleted",
      String(defaultValues.hasCompleted),
    );
  }, overrides);
}

/**
 * 記録済みイベントを取得する。
 */
export async function getTrackedEvents(page: Page): Promise<TrackEventEntry[]> {
  return page.evaluate(
    () => (window.__trackEventCalls ?? []) as TrackEventEntry[],
  );
}

/**
 * 記録済みイベントをクリアする。
 */
export async function clearTrackedEvents(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__trackEventCalls = [];
  });
}

/**
 * 特定イベントが発火したかを確認する。
 */
export async function assertEventFired<K extends keyof SkillWizardEvents>(
  page: Page,
  eventName: K,
  payload?: Partial<SkillWizardEvents[K]>,
): Promise<void> {
  await expect
    .poll(
      async () => {
        const events = await getTrackedEvents(page);
        const matched = events.filter((e) => e.eventName === eventName);

        if (payload === undefined) {
          return matched.length > 0;
        }

        return matched.some((e) =>
          Object.entries(payload).every(
            ([key, val]) => (e.payload as Record<string, unknown>)[key] === val,
          ),
        );
      },
      {
        timeout: 5_000,
        message:
          payload === undefined
            ? `イベント "${eventName}" が発火されていません`
            : `イベント "${eventName}" のペイロードが一致しません。期待: ${JSON.stringify(payload)}`,
      },
    )
    .toBe(true);
}
