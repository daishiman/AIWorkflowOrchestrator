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
const serverPort = 4173;
const screenshotDir = path.join(
  repoRoot,
  "docs/30-workflows/task-061-ui-09-onboarding-wizard/outputs/phase-11/screenshots",
);
const baseUrl = `http://localhost:${serverPort}/phase11-onboarding-wizard.html`;

const scenarios = [
  {
    id: "TC-11-01",
    file: "TC-11-01-desktop-step1-light.png",
    url: `${baseUrl}?surface=dashboard&theme=light&completed=false`,
    selector: '[data-testid="phase11-onboarding-dashboard-shell"]',
    viewport: { width: 1440, height: 980 },
    colorScheme: "light",
  },
  {
    id: "TC-11-02",
    file: "TC-11-02-tablet-step3-dark.png",
    url: `${baseUrl}?surface=dashboard&theme=dark&completed=false`,
    selector: '[data-testid="phase11-onboarding-dashboard-shell"]',
    viewport: { width: 1024, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.getByLabel("オンボーディングの名前入力").fill("春子");
      await page.getByTestId("onboarding-primary-action").click();
      await page.getByText("今日の天気は?").click();
      await page.getByTestId("onboarding-primary-action").click();
      await page.waitForSelector(
        '[data-testid="onboarding-skill-card-aiworkflow-requirements"]',
      );
    },
  },
  {
    id: "TC-11-03",
    file: "TC-11-03-mobile-step4-kanagawa.png",
    url: `${baseUrl}?surface=dashboard&theme=kanagawa-dragon&completed=false`,
    selector: '[data-testid="phase11-onboarding-dashboard-shell"]',
    viewport: { width: 390, height: 844 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.getByLabel("オンボーディングの名前入力").fill("春子");
      await page.getByTestId("onboarding-primary-action").click();
      await page.getByText("おすすめの映画を教えて").click();
      await page.getByTestId("onboarding-primary-action").click();
      await page
        .getByTestId("onboarding-skill-card-aiworkflow-requirements")
        .click();
      await page.getByTestId("onboarding-primary-action").click();
      await page.waitForSelector('[data-testid="onboarding-theme-card-dark"]');
    },
  },
  {
    id: "TC-11-04",
    file: "TC-11-04-settings-rerun-entry-dark.png",
    url: `${baseUrl}?surface=settings&theme=dark&completed=true`,
    selector: 'section[aria-labelledby="onboarding-settings-heading"]',
    viewport: { width: 1440, height: 1180 },
    colorScheme: "dark",
    captureElement: true,
  },
  {
    id: "TC-11-05",
    file: "TC-11-05-settings-rerun-triggered-dark.png",
    url: `${baseUrl}?surface=settings&theme=dark&completed=true`,
    selector: '[data-testid="phase11-onboarding-dashboard-shell"]',
    readySelector: '[data-testid="phase11-onboarding-settings-shell"]',
    viewport: { width: 1440, height: 980 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.getByRole("button", { name: "はじめようを再表示" }).click();
      await page.waitForSelector('[data-testid="onboarding-wizard"]');
    },
  },
];

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // retry until timeout
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

async function captureScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    colorScheme: scenario.colorScheme,
  });
  const page = await context.newPage();

  await page.goto(scenario.url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(scenario.readySelector ?? scenario.selector);

  if (scenario.preCapture) {
    await scenario.preCapture(page);
  }

  await page.waitForSelector(scenario.selector);
  await page.waitForTimeout(250);
  const outputPath = path.join(screenshotDir, scenario.file);
  if (scenario.captureElement) {
    await page.locator(scenario.selector).first().screenshot({ path: outputPath });
  } else {
    await page.screenshot({ path: outputPath, fullPage: true });
  }

  process.stdout.write(`Captured ${scenario.id}: ${scenario.file}\n`);
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
      String(serverPort),
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
    for (const scenario of scenarios) {
      await captureScenario(browser, scenario);
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
