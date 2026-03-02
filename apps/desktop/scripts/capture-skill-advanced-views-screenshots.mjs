#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(desktopRoot, "..", "..");
const screenshotDir = path.join(
  repoRoot,
  "docs/30-workflows/skill-advanced-views/outputs/phase-11/screenshots",
);
const baseUrl = "http://localhost:5173";

const scenarios = [
  {
    route: "/advanced/chain-builder",
    selector: '[data-testid="skill-chain-builder-view"]',
    file: "TC-04-chain-builder.png",
  },
  {
    route: "/advanced/schedule-manager",
    selector: '[data-testid="schedule-manager-view"]',
    file: "TC-05-schedule-manager.png",
  },
  {
    route: "/advanced/debug-panel",
    selector: '[data-testid="debug-panel"]',
    file: "TC-06-debug-panel.png",
  },
  {
    route: "/advanced/analytics-dashboard",
    selector: '[data-testid="analytics-dashboard"]',
    file: "TC-07-analytics-dashboard.png",
  },
];

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Retry until timeout.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

function createMockScript() {
  return () => {
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

    window.electronAPI = {
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
        onAuthStateChanged: (callback) => {
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
        chainSave: async (chain) => chain,
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
        scheduleAdd: async (input) => ({
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
        analyticsStatistics: async (skillName) => ({
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
  };
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });

  const server = spawn(
    "pnpm",
    ["exec", "vite", "--config", "vite.e2e.config.ts", "--port", "5173", "--strictPort"],
    {
      cwd: desktopRoot,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", (data) => {
    process.stdout.write(data);
  });
  server.stderr.on("data", (data) => {
    process.stderr.write(data);
  });

  let browser;
  try {
    await waitForServer(baseUrl);
    browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.addInitScript(createMockScript());

    for (const scenario of scenarios) {
      const url = `${baseUrl}${scenario.route}`;
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(scenario.selector, { timeout: 15_000 });
      await page.waitForTimeout(400);
      const screenshotPath = path.join(screenshotDir, scenario.file);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      process.stdout.write(`Captured: ${screenshotPath}\n`);
    }

    await context.close();
  } finally {
    if (browser) {
      await browser.close();
    }
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

