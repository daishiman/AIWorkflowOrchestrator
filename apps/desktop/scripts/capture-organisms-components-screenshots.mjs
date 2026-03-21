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
  "docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/outputs/phase-11/screenshots",
);

const baseRoute = "http://localhost:5173/advanced/organisms-showcase";

const scenarios = [
  {
    file: "TC-01-organisms-default-dark-desktop.png",
    url: `${baseRoute}?card=default&detail=open&view=list`,
    selector: '[data-testid="organisms-showcase-view"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
  },
  {
    file: "TC-02-search-filter-active-dark-desktop.png",
    url: `${baseRoute}?card=default&detail=open&view=list`,
    selector: '[data-testid="showcase-search-filter-list"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill('[role="searchbox"]', "a");
      await page.click('button:has-text("カテゴリA")');
      await page.waitForTimeout(250);
    },
  },
  {
    file: "TC-03-cardgrid-loading-dark-desktop.png",
    url: `${baseRoute}?card=loading&detail=open&view=list`,
    selector: '[data-testid="showcase-card-grid"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
  },
  {
    file: "TC-04-cardgrid-empty-light-desktop.png",
    url: `${baseRoute}?card=empty&detail=open&view=list`,
    selector: '[data-testid="showcase-card-grid"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
  },
  {
    file: "TC-05-master-detail-mobile-dialog-dark.png",
    url: `${baseRoute}?card=default&detail=open&view=list`,
    selector: '[data-testid="showcase-master-detail"]',
    viewport: { width: 390, height: 844 },
    colorScheme: "dark",
  },
  {
    file: "TC-06-search-grid-mobile-dark.png",
    url: `${baseRoute}?card=default&detail=closed&view=grid`,
    selector: '[data-testid="showcase-search-filter-list"]',
    viewport: { width: 390, height: 844 },
    colorScheme: "dark",
    captureElement: true,
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
    };
  };
}

async function captureScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    colorScheme: scenario.colorScheme,
  });

  await context.addInitScript(createMockScript());
  const page = await context.newPage();
  await page.goto(scenario.url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-testid="organisms-showcase-view"]');

  if (scenario.preCapture) {
    await scenario.preCapture(page);
  }

  await page.waitForSelector(scenario.selector);
  await page.waitForTimeout(200);

  const outputPath = path.join(screenshotDir, scenario.file);
  if (scenario.captureElement) {
    await page
      .locator(scenario.selector)
      .first()
      .screenshot({ path: outputPath });
  } else {
    await page.screenshot({
      path: outputPath,
      fullPage: true,
    });
  }

  await context.close();
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
    },
  );

  server.stdout.on("data", (data) => process.stdout.write(data));
  server.stderr.on("data", (data) => process.stderr.write(data));

  try {
    await waitForServer("http://localhost:5173");

    const browser = await chromium.launch({ headless: true });
    for (const scenario of scenarios) {
      await captureScenario(browser, scenario);
      process.stdout.write(`Captured ${scenario.file}\n`);
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
