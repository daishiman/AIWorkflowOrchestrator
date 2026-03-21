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
  "docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots",
);

const baseRoute = "http://localhost:5173/advanced/skill-create-wizard";

function parseArgs(argv) {
  const options = {
    screenshotDir,
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

const scenarios = [
  {
    file: "TC-01-step1-initial-dark.png",
    url: baseRoute,
    selector: '[data-testid="wizard-step-describe"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
  },
  {
    file: "TC-02-step1-filled-dark.png",
    url: baseRoute,
    selector: '[data-testid="wizard-step-describe"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill(
        "#skill-description",
        "ファイルを整理して命名規則を統一するスキル",
      );
      await page.waitForTimeout(200);
    },
  },
  {
    file: "TC-03-step2-configure-dark.png",
    url: baseRoute,
    selector: '[data-testid="wizard-step-configure"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill(
        "#skill-description",
        "ファイルを整理して命名規則を統一するスキル",
      );
      await page.click('button:has-text("次へ")');
      await page.waitForTimeout(200);
    },
  },
  {
    file: "TC-04-step3-generating-dark.png",
    url: `${baseRoute}?mode=slow`,
    selector: '[data-testid="wizard-step-generate"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill(
        "#skill-description",
        "ファイルを整理して命名規則を統一するスキル",
      );
      await page.click('button:has-text("次へ")');
      await page.click('button:has-text("スキルを生成")');
      await page.waitForSelector("text=生成中...");
      await page.waitForTimeout(150);
    },
  },
  {
    file: "TC-05-step4-complete-dark.png",
    url: baseRoute,
    selector: '[data-testid="wizard-step-complete"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill(
        "#skill-description",
        "ファイルを整理して命名規則を統一するスキル",
      );
      await page.click('button:has-text("次へ")');
      await page.click('button:has-text("スキルを生成")');
      await page.waitForSelector("text=スキルが作成されました");
      await page.waitForTimeout(150);
    },
  },
  {
    file: "TC-06-step3-error-dark.png",
    url: `${baseRoute}?mode=error`,
    selector: '[data-testid="wizard-step-generate"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill(
        "#skill-description",
        "ファイルを整理して命名規則を統一するスキル",
      );
      await page.click('button:has-text("次へ")');
      await page.click('button:has-text("スキルを生成")');
      await page.waitForSelector("text=スキル生成に失敗しました");
      await page.waitForTimeout(150);
    },
  },
  {
    file: "TC-07-step1-initial-light.png",
    url: baseRoute,
    selector: '[data-testid="wizard-step-describe"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
  },
  {
    file: "TC-08-step1-initial-mobile-dark.png",
    url: baseRoute,
    selector: '[data-testid="wizard-step-describe"]',
    viewport: { width: 390, height: 844 },
    colorScheme: "dark",
  },
];

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

function createMockScript() {
  return () => {
    const now = new Date().toISOString();

    const mode = new URLSearchParams(window.location.search).get("mode");

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
        create: async (params) => {
          if (mode === "slow") {
            await new Promise((resolve) => setTimeout(resolve, 1200));
          } else {
            await new Promise((resolve) => setTimeout(resolve, 300));
          }

          if (mode === "error") {
            throw new Error("スクリーンショット検証用エラー");
          }

          const safeName = (params?.description ?? "new-skill")
            .slice(0, 30)
            .replace(/\s+/g, "-");

          return {
            path: `/mock/skills/${safeName}`,
          };
        },
      },
    };
  };
}

async function captureScenario(browser, scenario, outputDir) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    colorScheme: scenario.colorScheme,
  });

  try {
    await context.addInitScript(createMockScript());
    const page = await context.newPage();

    await page.goto(scenario.url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector('[data-testid="skill-create-wizard"]', {
      timeout: 15_000,
    });

    if (scenario.preCapture) {
      await scenario.preCapture(page);
    }

    await page.waitForSelector(scenario.selector, { timeout: 15_000 });
    await page.waitForTimeout(150);

    await page.screenshot({
      path: path.join(outputDir, scenario.file),
      fullPage: true,
    });
  } catch (error) {
    throw new Error(
      `Screenshot capture failed for ${scenario.file} (${scenario.url})`,
      { cause: error },
    );
  } finally {
    await context.close();
  }
}

async function main() {
  const options = parseArgs(process.argv);
  await fs.mkdir(options.screenshotDir, { recursive: true });

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

  server.stdout.on("data", (data) => process.stdout.write(data));
  server.stderr.on("data", (data) => process.stderr.write(data));

  try {
    await waitForServer("http://localhost:5173");

    const browser = await chromium.launch({ headless: true });
    for (const scenario of scenarios) {
      await captureScenario(browser, scenario, options.screenshotDir);
      process.stdout.write(
        `Captured ${path.join(options.screenshotDir, scenario.file)}\n`,
      );
    }
    await browser.close();
  } finally {
    server.kill("SIGTERM");
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
