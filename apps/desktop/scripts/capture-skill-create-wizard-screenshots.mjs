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
const workflowRoot = path.join(
  repoRoot,
  "docs/30-workflows/W1-par-02c-complete-step",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const screenshotPlanPath = path.join(phase11Root, "screenshot-plan.json");
const captureMetadataPath = path.join(
  phase11Root,
  "phase11-capture-metadata.json",
);
const port = process.env.W1_PAR_02C_PHASE11_PORT ?? "5183";

const baseUrl = `http://127.0.0.1:${port}`;
const baseRoute = `${baseUrl}/advanced/skill-create-wizard`;
const completeStepHarnessPath = "/phase11-w1-par-02c-complete-step.html";

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
    file: "TC-11-01-step0-description-category.png",
    url: baseRoute,
    selector: '[data-testid="wizard-step-describe"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    note: "Step 0 で説明とカテゴリを入力した状態",
    preCapture: async (page) => {
      await page.fill("#skill-description", "毎日通知するスキル");
      await page.selectOption("#skill-category", "external-integration");
      await page.waitForTimeout(200);
    },
  },
  {
    file: "TC-11-02-step1-page1-defaults.png",
    url: baseRoute,
    selector: '[data-testid="wizard-step-conversation-round"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill("#skill-description", "毎日通知するスキル");
      await page.selectOption("#skill-category", "external-integration");
      await page.waitForTimeout(100);
      await page.getByRole("button", { name: "次へ" }).click();
      await page.waitForSelector(
        '[data-testid="wizard-step-conversation-round"]',
      );
      await page.waitForTimeout(200);
    },
  },
  {
    file: "TC-11-03-step1-cron-error.png",
    url: baseRoute,
    selector: '[role="alert"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill("#skill-description", "毎日通知するスキル");
      await page.selectOption("#skill-category", "external-integration");
      await page.getByRole("button", { name: "次へ" }).click();
      await page.waitForSelector(
        '[data-testid="wizard-step-conversation-round"]',
      );
      await page.locator("#schedule-cron").fill("25 99 * * *");
      await page.locator("#schedule-cron").blur();
      await page.waitForSelector("text=cron式の形式が正しくありません");
      await page.waitForTimeout(200);
    },
  },
  {
    file: "TC-11-04-step2-required-q5.png",
    url: baseRoute,
    selector: '[data-testid="wizard-step-conversation-round"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill("#skill-description", "毎日通知するスキル");
      await page.selectOption("#skill-category", "external-integration");
      await page.getByRole("button", { name: "次へ" }).click();
      await page.waitForSelector(
        '[data-testid="wizard-step-conversation-round"]',
      );
      await page.getByRole("button", { name: "次のページ" }).click();
      await page.waitForSelector("text=Q5: 外部ツール連携（必須★）");
      await page.waitForTimeout(150);
    },
  },
  {
    file: "TC-11-05-summary-card-warning.png",
    url: baseRoute,
    selector: '[aria-label="適用サマリー"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill("#skill-description", "毎日通知するスキル");
      await page.selectOption("#skill-category", "external-integration");
      await page.getByRole("button", { name: "次へ" }).click();
      await page.waitForSelector(
        '[data-testid="wizard-step-conversation-round"]',
      );
      await page.getByRole("button", { name: "次のページ" }).click();
      await page.getByRole("button", { name: "今すぐ生成する" }).click();
      await page.waitForSelector('[aria-label="適用サマリー"]');
      await page.waitForTimeout(150);
    },
  },
  {
    file: "TC-07-step3-complete-light.png",
    url: baseRoute,
    selector: '[data-testid="wizard-step-complete"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
    preCapture: async (page) => {
      await page.fill("#purpose", "ファイルを整理して命名規則を統一するスキル");
      await page.click('button:has-text("自動化")');
      await page.click('button:has-text("次へ")');
      await page.click('button:has-text("スキルを生成")');
      await page.waitForSelector("text=スキルの骨格を生成しました");
      await page.waitForTimeout(150);
    },
  },
  {
    file: "TC-08-step3-complete-mobile-dark.png",
    url: baseRoute,
    selector: '[data-testid="wizard-step-complete"]',
    viewport: { width: 390, height: 844 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill("#purpose", "ファイルを整理して命名規則を統一するスキル");
      await page.click('button:has-text("自動化")');
      await page.click('button:has-text("次へ")');
      await page.click('button:has-text("スキルを生成")');
      await page.waitForSelector("text=スキルの骨格を生成しました");
      await page.waitForTimeout(150);
    },
  },
  {
    file: "TC-09-step3-complete-external-checklist-light.png",
    url: `${baseUrl}${completeStepHarnessPath}`,
    selector: '[data-testid="phase11-complete-step-external-card"]',
    appReadySelector: '[data-testid="phase11-complete-step-harness"]',
    viewport: { width: 1440, height: 1200 },
    colorScheme: "light",
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

    await page.goto(scenario.url, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await page.waitForSelector(
      scenario.appReadySelector ?? '[data-testid="skill-create-wizard"]',
      {
        timeout: 60_000,
      },
    );

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
      "--host",
      "127.0.0.1",
      "--port",
      port,
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
    await waitForServer(baseRoute);
    await waitForServer(`${baseUrl}${completeStepHarnessPath}`);

    const browser = await chromium.launch({ headless: true });
    const capturedFiles = [];
    for (const scenario of scenarios) {
      await captureScenario(browser, scenario, options.screenshotDir);
      const screenshotPath = path.join(options.screenshotDir, scenario.file);
      const stat = await fs.stat(screenshotPath);
      capturedFiles.push({
        tcId: scenario.file.slice(0, 5),
        state: scenario.file.replace(/\.png$/, ""),
        file: `screenshots/${scenario.file}`,
        capturedAt: stat.mtime.toISOString(),
      });
      process.stdout.write(
        `Captured ${path.join(options.screenshotDir, scenario.file)}\n`,
      );
    }
    const generatedAt = new Date().toISOString();
    await fs.writeFile(
      screenshotPlanPath,
      JSON.stringify(
        {
          generatedAt,
          route: "/advanced/skill-create-wizard",
          captures: capturedFiles.map((entry) => ({
            tcId: entry.tcId,
            state: entry.state,
            priority:
              entry.tcId === "TC-05" ||
              entry.tcId === "TC-07" ||
              entry.tcId === "TC-08" ||
              entry.tcId === "TC-09"
                ? "A"
                : "B",
            file: entry.file,
          })),
        },
        null,
        2,
      ),
    );

    await fs.writeFile(
      captureMetadataPath,
      JSON.stringify(
        {
          generatedAt,
          captureMethod: "current_build_vite_playwright",
          baseUrl,
          harnessPath: completeStepHarnessPath,
          viewportSet: [
            { width: 1440, height: 900 },
            { width: 390, height: 844 },
            { width: 1440, height: 1200 },
          ],
          screenshots: capturedFiles.map((entry) => ({
            tcId: entry.tcId,
            file: entry.file.replace("screenshots/", ""),
            output: `outputs/phase-11/${entry.file}`,
            capturedAt: entry.capturedAt,
            captureMethod: "current_build_vite_playwright",
          })),
        },
        null,
        2,
      ),
    );

    await Promise.race([
      browser.close(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
  } finally {
    if (!server.killed) {
      server.kill("SIGKILL");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
