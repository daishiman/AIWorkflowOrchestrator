import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test, expect } from "@playwright/test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOT_DIR = path.resolve(
  __dirname,
  "../../../docs/30-workflows/skill-advanced-views/outputs/phase-11/screenshots",
);

const scenarios = [
  {
    path: "/advanced/chain-builder",
    selector: '[data-testid="skill-chain-builder-view"]',
    file: "TC-04-chain-builder.png",
  },
  {
    path: "/advanced/schedule-manager",
    selector: '[data-testid="schedule-manager-view"]',
    file: "TC-05-schedule-manager.png",
  },
  {
    path: "/advanced/debug-panel",
    selector: '[data-testid="debug-panel"]',
    file: "TC-06-debug-panel.png",
  },
  {
    path: "/advanced/analytics-dashboard",
    selector: '[data-testid="analytics-dashboard"]',
    file: "TC-07-analytics-dashboard.png",
  },
] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const now = new Date().toISOString();

    const mockUser = {
      id: "e2e-user",
      email: "e2e@example.com",
      displayName: "E2E User",
      avatarUrl: "",
      provider: "google",
      createdAt: now,
      lastSignInAt: now,
    };

    (window as any).electronAPI = {
      auth: {
        checkOnline: async () => ({ success: true, data: { online: true } }),
        getSession: async () => ({
          success: true,
          data: {
            user: mockUser,
            expiresAt: Date.now() + 60 * 60 * 1000,
            isOffline: false,
          },
        }),

        onAuthStateChanged: (callback: any) => {
          setTimeout(() => {
            callback({ authenticated: true, user: mockUser, isOffline: false });
          }, 10);
          return () => {};
        },
        login: async () => ({ success: true }),
        logout: async () => ({ success: true, data: {} }),
        refresh: async () => ({ success: true, data: {} }),
      },
      theme: {
        get: async () => ({
          success: true,
          data: { mode: "dark", resolvedTheme: "dark" },
        }),
        set: async () => ({ success: true, data: {} }),
        getSystem: async () => ({ success: true, data: { theme: "dark" } }),
        onSystemChanged: () => () => {},
      },
      skill: {
        chainList: async () => [
          {
            id: "chain-1",
            name: "レビュー自動化",
            description: "コードレビューを自動実行するチェーン",
            steps: [],
            variables: {},
            errorHandling: "stop",
            createdAt: now,
            updatedAt: now,
          },
        ],
        chainGet: async () => ({
          id: "chain-1",
          name: "レビュー自動化",
          description: "コードレビューを自動実行するチェーン",
          steps: [],
          variables: {},
          errorHandling: "stop",
          createdAt: now,
          updatedAt: now,
        }),

        chainSave: async (chain: any) => chain,
        chainDelete: async () => undefined,
        chainExecute: async () => ({
          chainId: "chain-1",
          success: true,
          results: [],
          finalVariables: {},
          totalDuration: 1200,
        }),

        scheduleList: async () => [
          {
            id: "sch-1",
            skillName: "review-skill",
            prompt: "最新コミットをレビュー",
            schedule: { type: "cron", cronExpression: "0 9 * * *" },
            enabled: true,
            runHistory: [],
            notification: { onSuccess: true, onFailure: true },
            createdAt: now,
            updatedAt: now,
          },
        ],

        scheduleAdd: async (input: any) => ({
          id: "sch-new",
          runHistory: [],
          ...input,
          createdAt: now,
          updatedAt: now,
        }),
        scheduleUpdate: async () => undefined,
        scheduleDelete: async () => undefined,
        scheduleToggle: async () => ({
          id: "sch-1",
          skillName: "review-skill",
          prompt: "最新コミットをレビュー",
          schedule: { type: "cron", cronExpression: "0 9 * * *" },
          enabled: false,
          runHistory: [],
          notification: { onSuccess: true, onFailure: true },
          createdAt: now,
          updatedAt: now,
        }),

        debug: {
          startSession: async () => ({
            id: "debug-1",
            status: "paused",
            breakpoints: [],
            variables: { input: "sample" },
            steps: [],
          }),
          executeCommand: async () => undefined,
          addBreakpoint: async () => ({
            id: "bp-1",
            path: "step-1",
            condition: "always",
            enabled: true,
          }),
          removeBreakpoint: async () => undefined,
          inspectVariable: async () => ({ value: "sample" }),
          evaluateExpression: async () => ({ result: "ok", type: "string" }),
          onDebugEvent: () => () => {},
        },

        analyticsSummary: async () => ({
          totalSkills: 12,
          totalExecutions: 240,
          overallSuccessRate: 93.5,
          mostUsedSkills: [
            { skillName: "review-skill", executionCount: 80, lastUsed: now },
            { skillName: "test-skill", executionCount: 55, lastUsed: now },
          ],
          recentActivity: [],
        }),
        analyticsTrend: async () => ({
          period: {
            start: "2026-02-20T00:00:00.000Z",
            end: "2026-03-02T00:00:00.000Z",
            granularity: "day",
          },
          dataPoints: [
            {
              timestamp: "2026-03-01T00:00:00.000Z",
              executions: 21,
              errors: 1,
              avgDuration: 820,
            },
            {
              timestamp: "2026-03-02T00:00:00.000Z",
              executions: 24,
              errors: 0,
              avgDuration: 790,
            },
          ],
        }),
        analyticsStatistics: async (skillName: string) => ({
          skillName,
          totalExecutions: 42,
          successRate: 95,
          averageDuration: 820,
          totalTokens: 3200,
          toolUsage: [],
          period: {
            start: "2026-02-20T00:00:00.000Z",
            end: "2026-03-02T00:00:00.000Z",
          },
        }),
        analyticsExport: async () => "ok",
      },
    };
  });
});

test("Skill Advanced Views の画面証跡を取得する", async ({ page }) => {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  for (const scenario of scenarios) {
    await page.goto(scenario.path);
    await page.waitForSelector(scenario.selector, { timeout: 15_000 });
    await expect(page.locator(scenario.selector)).toBeVisible();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, scenario.file),
      fullPage: true,
    });
  }
});
