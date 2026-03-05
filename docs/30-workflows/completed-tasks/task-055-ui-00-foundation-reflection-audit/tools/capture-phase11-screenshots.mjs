#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workflowDir = path.resolve(__dirname, "..");
const repoRoot = path.resolve(workflowDir, "..", "..", "..");
const desktopRoot = path.join(repoRoot, "apps", "desktop");
const requireFromDesktop = createRequire(path.join(desktopRoot, "package.json"));
const { chromium } = requireFromDesktop("playwright");

const planPath = path.join(workflowDir, "outputs", "phase-11", "screenshot-plan.json");
const screenshotDir = path.join(workflowDir, "outputs", "phase-11", "screenshots");
const baseUrl = "http://localhost:5173";

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

async function applyAction(page, action) {
  if (!action) return;

  if (action.type === "fill") {
    await page.fill(action.target, action.value ?? "");
    await page.waitForTimeout(250);
    return;
  }

  if (action.type === "click") {
    await page.click(action.target);
    await page.waitForTimeout(250);
  }
}

async function captureScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    colorScheme: scenario.theme === "dark" ? "dark" : "light",
  });

  await context.addInitScript(createMockScript());
  const page = await context.newPage();
  const url = `${baseUrl}${scenario.route}`;
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-testid='organisms-showcase-view']", {
    timeout: 15_000,
  });

  await applyAction(page, scenario.action);

  if (scenario.selector) {
    await page.waitForSelector(scenario.selector, { timeout: 10_000 });
  }

  const outputPath = path.join(screenshotDir, scenario.file);

  if (scenario.selector) {
    await page.locator(scenario.selector).first().screenshot({ path: outputPath });
  } else {
    await page.screenshot({ path: outputPath, fullPage: true });
  }

  await context.close();
}

async function main() {
  const raw = await fs.readFile(planPath, "utf8");
  const plan = JSON.parse(raw);

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
    await waitForServer(baseUrl);

    const browser = await chromium.launch({ headless: true });
    for (const scenario of plan.scenarios) {
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
