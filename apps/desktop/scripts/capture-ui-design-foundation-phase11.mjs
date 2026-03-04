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
  "docs/30-workflows/completed-tasks/task-050-ui-00-ui-design-foundation/outputs/phase-11/screenshots",
);

const vitePort = 5174;
const baseUrl = `http://localhost:${vitePort}/advanced/ui-design-foundation`;

const scenarios = [
  {
    file: "TC-UI-00-301-overview-dark-desktop.png",
    url: baseUrl,
    selector: '[data-testid="ui-design-foundation-preview"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
  },
  {
    file: "TC-UI-00-302-overview-light-desktop.png",
    url: baseUrl,
    selector: '[data-testid="ui-design-foundation-preview"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
    preCapture: async (page) => {
      await page.click('[data-testid="theme-light"]');
      await page.waitForTimeout(150);
    },
  },
  {
    file: "TC-UI-00-303-overview-dark-mobile.png",
    url: baseUrl,
    selector: '[data-testid="ui-design-foundation-preview"]',
    viewport: { width: 390, height: 844 },
    colorScheme: "dark",
  },
  {
    file: "TC-UI-00-304-panel-open-dark.png",
    url: baseUrl,
    selector: '[role="dialog"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.click('[data-testid="open-panel"]');
      await page.waitForTimeout(200);
    },
  },
  {
    file: "TC-UI-00-305-confirm-dialog-dark.png",
    url: baseUrl,
    selector: '[role="alertdialog"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.click('[data-testid="open-dialog"]');
      await page.waitForTimeout(200);
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
      // retry until timeout
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

function createMockScript() {
  return () => {
    const now = new Date().toISOString();

    sessionStorage.setItem("debug-clear-storage", "done");

    const mockUser = {
      id: "phase11-user",
      email: "phase11@example.com",
      displayName: "Phase11 User",
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
  await page.waitForSelector('[data-testid="ui-design-foundation-preview"]');

  if (scenario.preCapture) {
    await scenario.preCapture(page);
  }

  await page.waitForSelector(scenario.selector);
  await page.waitForTimeout(200);

  const outputPath = path.join(screenshotDir, scenario.file);
  await page.screenshot({ path: outputPath, fullPage: true });
  await context.close();

  console.log(`✅ captured: ${scenario.file}`);
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
      String(vitePort),
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
    await waitForServer(`http://localhost:${vitePort}`);

    const browser = await chromium.launch();
    try {
      for (const scenario of scenarios) {
        await captureScenario(browser, scenario);
      }
    } finally {
      await browser.close();
    }

    console.log(`\n🎉 Screenshots saved to ${screenshotDir}`);
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
