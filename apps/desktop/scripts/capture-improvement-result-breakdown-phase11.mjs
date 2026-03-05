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
  "docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui/outputs/phase-11/screenshots",
);
const baseUrl = "http://localhost:5173";

const defaultViewport = { width: 1440, height: 900 };

const scenarios = [
  {
    url: `${baseUrl}/advanced/skill-analysis`,
    selector: '[data-testid="skill-analysis-view"]',
    file: "TC-11-01-default-before-apply-dark.png",
    waitAfterReadyMs: 500,
  },
  {
    url: `${baseUrl}/advanced/skill-analysis?resultMode=mixed`,
    selector: '[data-testid="improvement-result-breakdown"]',
    file: "TC-11-02-result-mixed-dark.png",
    preCapture: async (page) => {
      await page.click('input[type="checkbox"]:first-of-type');
      await page.click("button:has-text('選択を適用')");
      await page.waitForTimeout(140);
    },
  },
  {
    url: `${baseUrl}/advanced/skill-analysis?resultMode=success`,
    selector: '[data-testid="improvement-result-breakdown"]',
    file: "TC-11-03-result-success-light.png",
    colorScheme: "light",
    preCapture: async (page) => {
      await page.click('input[type="checkbox"]:first-of-type');
      await page.click("button:has-text('選択を適用')");
      await page.waitForTimeout(140);
    },
  },
  {
    url: `${baseUrl}/advanced/skill-analysis?resultMode=skipped`,
    selector: '[data-testid="improvement-result-breakdown"]',
    file: "TC-11-04-result-skipped-dark.png",
    preCapture: async (page) => {
      await page.click('input[type="checkbox"]:first-of-type');
      await page.click("button:has-text('選択を適用')");
      await page.waitForTimeout(140);
    },
  },
  {
    url: `${baseUrl}/advanced/skill-analysis?resultMode=error`,
    selector: '[data-testid="improvement-result-breakdown"]',
    file: "TC-11-05-result-error-mobile-dark.png",
    viewport: { width: 390, height: 844 },
    preCapture: async (page) => {
      await page.click('input[type="checkbox"]:first-of-type');
      await page.click("button:has-text('選択を適用')");
      await page.waitForTimeout(140);
    },
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
    const params = new URLSearchParams(window.location.search);
    const resultMode = params.get("resultMode") ?? "mixed";

    const defaultAnalysis = {
      skillName: "demo-skill",
      overallScore: 72,
      categories: [
        {
          name: "Code Quality",
          score: 78,
          details: "可読性と保守性に改善余地があります",
          issues: ["重複ロジック", "命名の一貫性"],
        },
        {
          name: "Security",
          score: 65,
          details: "入力検証の強化が必要です",
          issues: ["境界値チェック不足"],
        },
      ],
      suggestions: [
        {
          type: "security",
          priority: "high",
          description: "入力値検証を追加",
          autoFixable: true,
        },
        {
          type: "structure",
          priority: "medium",
          description: "責務分離のためにフックを抽出",
          autoFixable: false,
        },
      ],
      risks: [
        {
          category: "security",
          level: "high",
          description: "入力値の想定外形式により例外が発生する可能性",
          impact: "ランタイム障害と品質低下",
          mitigation: "入力スキーマと境界値テストを追加",
        },
      ],
      analyzedAt: now,
    };

    const improvedAnalysis = {
      ...defaultAnalysis,
      overallScore: 88,
      suggestions: [],
      risks: [],
    };

    let applyTriggered = false;

    const createImprovementResult = (mode) => {
      if (mode === "success") {
        return {
          skillName: "demo-skill",
          applied: [
            {
              suggestion: defaultAnalysis.suggestions[0],
              result: "success",
              changes: ["入力バリデーションを追加"],
            },
          ],
          skipped: [],
          errors: [],
          executedAt: now,
        };
      }

      if (mode === "skipped") {
        return {
          skillName: "demo-skill",
          applied: [],
          skipped: [defaultAnalysis.suggestions[1]],
          errors: [],
          executedAt: now,
        };
      }

      if (mode === "error") {
        return {
          skillName: "demo-skill",
          applied: [],
          skipped: [],
          errors: [
            {
              suggestion: defaultAnalysis.suggestions[0],
              error: "対象ファイルの書き込み権限がありません",
            },
          ],
          executedAt: now,
        };
      }

      return {
        skillName: "demo-skill",
        applied: [
          {
            suggestion: defaultAnalysis.suggestions[0],
            result: "success",
            changes: ["入力バリデーションを追加"],
          },
        ],
        skipped: [defaultAnalysis.suggestions[1]],
        errors: [
          {
            suggestion: defaultAnalysis.suggestions[0],
            error: "一部ファイルの更新に失敗しました",
          },
        ],
        executedAt: now,
      };
    };

    window.confirm = () => true;

    window.electronAPI = {
      skill: {
        analyze: async () => {
          if (applyTriggered) return improvedAnalysis;
          return defaultAnalysis;
        },
        applyImprovements: async () => {
          applyTriggered = true;
          return createImprovementResult(resultMode);
        },
        autoImprove: async () => createImprovementResult(resultMode),
      },
      auth: {
        checkOnline: async () => ({ success: true, data: { online: true } }),
        getSession: async () => ({
          success: true,
          data: {
            user: {
              id: "e2e-user",
              email: "e2e@example.com",
              displayName: "E2E User",
              avatarUrl: "",
              provider: "google",
              createdAt: now,
              lastSignInAt: now,
            },
            expiresAt: Date.now() + 60 * 60 * 1000,
            isOffline: false,
          },
        }),
        onAuthStateChanged: () => () => {},
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
    };
  };
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });

  const server = spawn(
    "pnpm",
    [
      "exec",
      "vite",
      "--config",
      "vite.e2e.config.ts",
      "--port",
      "5173",
      "--strictPort",
    ],
    {
      cwd: desktopRoot,
      stdio: ["ignore", "pipe", "pipe"],
      detached: true,
    },
  );

  server.stdout.on("data", (data) => process.stdout.write(data));
  server.stderr.on("data", (data) => process.stderr.write(data));

  let browser;
  try {
    await waitForServer(baseUrl);
    browser = await chromium.launch({ headless: true });

    for (const scenario of scenarios) {
      const context = await browser.newContext({
        viewport: scenario.viewport ?? defaultViewport,
        colorScheme: scenario.colorScheme ?? "dark",
      });
      await context.addInitScript(createMockScript());
      const page = await context.newPage();
      await page.goto(scenario.url, { waitUntil: "domcontentloaded" });
      await page.waitForSelector('[data-testid="skill-analysis-view"]', {
        timeout: 15_000,
      });
      await page.waitForTimeout(200);

      if (scenario.preCapture) {
        await scenario.preCapture(page);
      } else {
        await page.waitForTimeout(scenario.waitAfterReadyMs ?? 200);
      }

      await page.waitForSelector(scenario.selector, { timeout: 15_000 });
      const screenshotPath = path.join(screenshotDir, scenario.file);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      process.stdout.write(`Captured: ${screenshotPath}\n`);
      await context.close();
    }
  } finally {
    if (browser) {
      await browser.close();
    }
    if (server.pid) {
      try {
        process.kill(-server.pid, "SIGTERM");
      } catch {
        server.kill("SIGTERM");
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
