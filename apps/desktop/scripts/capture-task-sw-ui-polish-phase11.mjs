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
  "docs/30-workflows/TASK-SW-UI-POLISH-001",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const screenshotPlanPath = path.join(phase11Root, "screenshot-plan.json");
const metadataPath = path.join(phase11Root, "phase11-capture-metadata.json");

const port = process.env.TASK_SW_UI_POLISH_PHASE11_PORT ?? "5199";
const baseUrl = `http://127.0.0.1:${port}`;
const route = `${baseUrl}/advanced/skill-create-wizard?skipAuth=true`;
const viewport = { width: 1440, height: 900 };

const scenarios = [
  {
    tcId: "TC-01",
    file: "TASK-SW-UI-POLISH-001-category-limit-light.png",
    theme: "light",
    description: "カテゴリ上限到達時のライトテーマ画面",
    mode: "category-limit",
  },
  {
    tcId: "TC-02",
    file: "TASK-SW-UI-POLISH-001-category-limit-dark.png",
    theme: "dark",
    description: "カテゴリ上限到達時のダークテーマ画面",
    mode: "category-limit",
  },
  {
    tcId: "TC-03",
    file: "TASK-SW-UI-POLISH-001-progressbar-light.png",
    theme: "light",
    description: "ProgressBar 更新後のライトテーマ画面",
    mode: "progressbar",
  },
  {
    tcId: "TC-04",
    file: "TASK-SW-UI-POLISH-001-progressbar-dark.png",
    theme: "dark",
    description: "ProgressBar 更新後のダークテーマ画面",
    mode: "progressbar",
  },
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 90_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // retry
    }
    await wait(400);
  }

  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

function createMockScript(theme) {
  return () => {
    const now = new Date("2026-04-16T09:00:00.000Z").toISOString();
    const mockUser = {
      id: `task-sw-ui-polish-${theme}`,
      email: `task-sw-ui-polish-${theme}@example.com`,
      displayName: `TASK-SW-UI-POLISH-001 ${theme}`,
      avatarUrl: "",
      provider: "google",
      createdAt: now,
      lastSignInAt: now,
    };

    const createResultPath = (description) => {
      const safeName = (description ?? "new-skill")
        .slice(0, 30)
        .replace(/\s+/g, "-");
      return `/mock/skills/${safeName}`;
    };

    window.localStorage.setItem("dev-skip-auth", "true");

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
            callback({
              authenticated: true,
              user: mockUser,
              isOffline: false,
            });
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
          data: { mode: theme, resolvedTheme: theme },
        }),
        set: async () => ({ success: true, data: {} }),
        getSystem: async () => ({ success: true, data: { theme } }),
        onSystemChanged: () => () => {},
      },
      skill: {
        create: async (params) => ({
          success: true,
          data: { path: createResultPath(params?.description) },
        }),
      },
    };
  };
}

async function openWizard(page, theme) {
  await page.addInitScript(createMockScript(theme));
  await page.goto(route, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForSelector('[data-testid="skill-create-wizard"]', {
    timeout: 60_000,
  });
  await page.waitForSelector('[data-testid="wizard-step-info"]', {
    timeout: 60_000,
  });
  await page.waitForTimeout(200);
}

async function prepareCategoryLimit(page) {
  await page.fill("#skill-name", "UI仕上げ確認スキル");
  await page.fill(
    "#purpose",
    "カテゴリの選択上限と選択状態の見た目を確認する",
  );
  await page.click('button[aria-label="自動化"]');
  await page.click('button[aria-label="外部連携"]');
  await page.click('button[aria-label="データ分析"]');
  await page.waitForTimeout(200);
}

async function prepareProgressBar(page) {
  await page.fill("#skill-name", "進捗バー確認スキル");
  await page.fill(
    "#purpose",
    "回答数の増加に応じて進捗バーが更新されることを確認する",
  );
  await page.click('button[aria-label="自動化"]');
  await page.getByRole("button", { name: "次へ" }).click();
  await page.waitForSelector('[data-testid="wizard-step-conversation-round"]', {
    timeout: 60_000,
  });
  await page.waitForTimeout(100);
  await page.getByRole("button", { name: "自分のみ" }).click();
  await page.waitForTimeout(350);
}

async function captureScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport,
    colorScheme: scenario.theme,
  });
  const page = await context.newPage();

  try {
    await openWizard(page, scenario.theme);

    if (scenario.mode === "category-limit") {
      await prepareCategoryLimit(page);
      await page.waitForSelector('[data-testid="wizard-step-info"]', {
        timeout: 60_000,
      });
    } else if (scenario.mode === "progressbar") {
      await prepareProgressBar(page);
      await page.waitForSelector('[data-testid="wizard-step-conversation-round"]', {
        timeout: 60_000,
      });
    }

    await page.screenshot({
      path: path.join(screenshotDir, scenario.file),
      fullPage: true,
    });
  } finally {
    await context.close();
  }
}

function buildScreenshotPlan() {
  return {
    taskId: "TASK-SW-UI-POLISH-001",
    route: "/advanced/skill-create-wizard?skipAuth=true",
    captures: scenarios.map((scenario) => ({
      tcId: scenario.tcId,
      state: scenario.description,
      theme: scenario.theme,
      file: `screenshots/${scenario.file}`,
    })),
  };
}

function buildCaptureMetadata() {
  const generatedAt = new Date().toISOString();
  return {
    taskId: "TASK-SW-UI-POLISH-001",
    generatedAt,
    captureMethod: "current_build_vite_playwright",
    baseUrl,
    route,
    viewportSet: [viewport],
    screenshots: scenarios.map((scenario) => ({
      tcId: scenario.tcId,
      file: scenario.file,
      output: `outputs/phase-11/screenshots/${scenario.file}`,
      theme: scenario.theme,
      capturedAt: generatedAt,
      captureMethod: "current_build_vite_playwright",
    })),
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
      "--host",
      "127.0.0.1",
      "--port",
      port,
      "--strictPort",
    ],
    {
      cwd: desktopRoot,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        FORCE_COLOR: "0",
      },
    },
  );

  server.stdout.on("data", (chunk) => process.stdout.write(chunk));
  server.stderr.on("data", (chunk) => process.stderr.write(chunk));

  try {
    await waitForServer(`http://127.0.0.1:${port}`);
    const browser = await chromium.launch();
    try {
      for (const scenario of scenarios) {
        await captureScenario(browser, scenario);
        console.log(`✅ captured ${scenario.file}`);
      }
    } finally {
      await browser.close();
    }

    await fs.writeFile(
      screenshotPlanPath,
      `${JSON.stringify(buildScreenshotPlan(), null, 2)}\n`,
      "utf8",
    );
    await fs.writeFile(
      metadataPath,
      `${JSON.stringify(buildCaptureMetadata(), null, 2)}\n`,
      "utf8",
    );

    console.log(`\n🎉 Screenshots saved to ${screenshotDir}`);
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
