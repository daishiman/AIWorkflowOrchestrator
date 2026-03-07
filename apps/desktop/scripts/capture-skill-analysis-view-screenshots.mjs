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
const defaultScreenshotDir = path.join(
  repoRoot,
  "docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots",
);
const baseUrl = "http://localhost:5173";

const defaultViewport = { width: 1440, height: 900 };

const scenarios = [
  {
    url: `${baseUrl}/advanced/skill-analysis`,
    selector: 'text=総合スコア',
    file: "TC-01-analysis-default-dark.png",
    waitAfterReadyMs: 600,
  },
  {
    url: `${baseUrl}/advanced/skill-analysis`,
    selector: 'text=総合スコア',
    file: "TC-02-analysis-selection-dark.png",
    preCapture: async (page) => {
      await page.waitForSelector('input[type="checkbox"]', { timeout: 15_000 });
      await page.locator('input[type="checkbox"]').first().click();
      await page.waitForTimeout(200);
    },
  },
  {
    url: `${baseUrl}/advanced/skill-analysis?mode=improved`,
    selector: 'text=改善提案はありません',
    file: "TC-03-analysis-apply-improved-dark.png",
    waitAfterReadyMs: 800,
  },
  {
    url: `${baseUrl}/advanced/skill-analysis?mode=improved&flow=auto`,
    selector: 'text=改善提案はありません',
    file: "TC-04-analysis-auto-improved-dark.png",
    waitAfterReadyMs: 800,
  },
  {
    url: `${baseUrl}/advanced/skill-analysis?mode=error`,
    selector: '[role="alert"]',
    file: "TC-05-analysis-error-dark.png",
    waitAfterReadyMs: 600,
  },
  {
    url: `${baseUrl}/advanced/skill-analysis?mode=loading`,
    selector: 'text=分析中...',
    file: "TC-06-analysis-loading-dark.png",
    waitAfterReadyMs: 600,
  },
  {
    url: `${baseUrl}/advanced/skill-analysis`,
    selector: 'text=総合スコア',
    file: "TC-07-analysis-default-light.png",
    colorScheme: "light",
    waitAfterReadyMs: 600,
  },
  {
    url: `${baseUrl}/advanced/skill-analysis`,
    selector: 'text=総合スコア',
    file: "TC-08-analysis-default-mobile-dark.png",
    viewport: { width: 390, height: 844 },
    waitAfterReadyMs: 600,
  },
];

function parseArgs(argv) {
  const options = {
    screenshotDir: defaultScreenshotDir,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--output-dir" && argv[i + 1]) {
      options.screenshotDir = path.resolve(process.cwd(), argv[i + 1]);
      i += 1;
    }
  }

  return options;
}

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
    let applyTriggered = false;
    let autoTriggered = false;
    const resolveTheme = () =>
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

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
        {
          type: "documentation",
          priority: "low",
          description: "公開APIの説明を補強",
          autoFixable: true,
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
      overallScore: 91,
      suggestions: [],
      risks: [],
    };

    window.confirm = () => true;

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
          data: { mode: "system", resolvedTheme: resolveTheme() },
        }),
        set: async ({ mode }) => ({
          success: true,
          data: {
            mode,
            resolvedTheme: mode === "system" ? resolveTheme() : mode,
          },
        }),
        getSystem: async () => ({
          success: true,
          data: {
            isDark: resolveTheme() === "dark",
            resolvedTheme: resolveTheme(),
          },
        }),
        onSystemChanged: () => () => {},
      },
      skill: {
        analyze: async () => {
          const mode = new URLSearchParams(window.location.search).get("mode");
          if (mode === "error") {
            throw new Error("分析APIエラー（スクリーンショット検証用）");
          }
          if (mode === "loading") {
            return new Promise(() => {});
          }
          if (mode === "improved" || applyTriggered || autoTriggered) {
            return improvedAnalysis;
          }
          return defaultAnalysis;
        },
        applyImprovements: async () => {
          applyTriggered = true;
          return {
            skillName: "demo-skill",
            applied: [],
            skipped: [],
            errors: [],
            executedAt: now,
          };
        },
        autoImprove: async () => {
          autoTriggered = true;
          return {
            skillName: "demo-skill",
            applied: [],
            skipped: [],
            errors: [],
            executedAt: now,
          };
        },
      },
    };
  };
}

async function main() {
  const options = parseArgs(process.argv);
  const screenshotDir = options.screenshotDir;
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

    browser = await chromium.launch({ headless: true });
    for (const scenario of scenarios) {
      const context = await browser.newContext({
        viewport: scenario.viewport ?? defaultViewport,
        colorScheme: scenario.colorScheme ?? "dark",
      });
      await context.addInitScript(createMockScript());
      const page = await context.newPage();

      await page.goto(scenario.url, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(scenario.selector, { timeout: 15_000 });
      if (scenario.preCapture) {
        await scenario.preCapture(page);
        await page.waitForSelector(scenario.selector, { timeout: 15_000 });
      }
      await page.waitForTimeout(scenario.waitAfterReadyMs ?? 300);

      const screenshotPath = path.join(screenshotDir, scenario.file);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      process.stdout.write(`Captured: ${screenshotPath}\n`);

      await context.close();
    }
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
