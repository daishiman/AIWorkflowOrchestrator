#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(desktopRoot, "..", "..");
const workflowRoot = path.join(
  repoRoot,
  "docs/30-workflows/skill-creator-agent-sdk-lane/step-10-seq-task-p0-08-session-resume-renderer-integration",
);
const screenshotDir = path.join(workflowRoot, "outputs/phase-11/screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const port = process.env.P0_08_SESSION_RESUME_PHASE11_PORT ?? "5197";
const baseUrl = `http://127.0.0.1:${port}`;
const viewport = { width: 1440, height: 960 };

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 90_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
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

function startViteServer() {
  const child = spawn(
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
    ],
    {
      cwd: desktopRoot,
      stdio: "pipe",
      env: {
        ...process.env,
        FORCE_COLOR: "0",
      },
    },
  );

  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));
  return child;
}

async function openScenario(browser, scenario, theme = "light") {
  const context = await browser.newContext({
    viewport,
    colorScheme: theme,
  });
  const page = await context.newPage();
  const url = `${baseUrl}/phase11-session-resume-renderer-integration.html?scenario=${scenario}&theme=${theme}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  return { context, page, url };
}

async function captureImage(page, fileName) {
  const filePath = path.join(screenshotDir, fileName);
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

async function run() {
  await mkdir(screenshotDir, { recursive: true });

  const server = startViteServer();
  const records = [];
  let browser;

  try {
    await waitForServer(
      `${baseUrl}/phase11-session-resume-renderer-integration.html?scenario=no-session&theme=light`,
    );

    browser = await chromium.launch({ headless: true });

    {
      const { context, page, url } = await openScenario(
        browser,
        "no-session",
        "light",
      );
      await page.waitForSelector('[data-testid="session-empty-state"]', {
        timeout: 20_000,
      });
      await captureImage(page, "tc-01-no-session.png");
      records.push({
        tcId: "TC-01",
        file: "tc-01-no-session.png",
        url,
        capturedAt: new Date().toISOString(),
      });
      await context.close();
    }

    {
      const { context, page, url } = await openScenario(
        browser,
        "no-session-dark",
        "dark",
      );
      await page.waitForSelector('[data-testid="session-empty-state"]', {
        timeout: 20_000,
      });
      await captureImage(page, "tc-02-no-session-dark.png");
      records.push({
        tcId: "TC-02",
        file: "tc-02-no-session-dark.png",
        url,
        capturedAt: new Date().toISOString(),
      });
      await context.close();
    }

    {
      const { context, page, url } = await openScenario(
        browser,
        "session-list",
        "light",
      );
      await page.waitForSelector('[data-testid="session-resume-prompt"]', {
        timeout: 20_000,
      });
      await captureImage(page, "tc-03-session-list.png");
      records.push({
        tcId: "TC-03",
        file: "tc-03-session-list.png",
        url,
        capturedAt: new Date().toISOString(),
      });
      await context.close();
    }

    {
      const { context, page, url } = await openScenario(
        browser,
        "after-skip",
        "light",
      );
      await page.waitForSelector('[data-testid="session-resume-prompt"]', {
        timeout: 20_000,
      });
      await page.getByTestId("session-start-new-btn").click();
      await page.waitForSelector('[data-testid="session-new-start-state"]', {
        timeout: 20_000,
      });
      await captureImage(page, "tc-04-after-skip.png");
      records.push({
        tcId: "TC-04",
        file: "tc-04-after-skip.png",
        url,
        capturedAt: new Date().toISOString(),
      });
      await context.close();
    }

    {
      const { context, page, url } = await openScenario(
        browser,
        "error-banner",
        "light",
      );
      await page.waitForSelector('[data-testid="session-resume-prompt"]', {
        timeout: 20_000,
      });
      await page.getByTestId("session-resume-btn-session-001-abc").click();
      await page.waitForSelector('[data-testid="session-error-banner"]', {
        timeout: 20_000,
      });
      await captureImage(page, "tc-05-error-banner.png");
      records.push({
        tcId: "TC-05",
        file: "tc-05-error-banner.png",
        url,
        capturedAt: new Date().toISOString(),
      });
      await context.close();
    }

    {
      const { context, page, url } = await openScenario(
        browser,
        "session-indicator",
        "light",
      );
      await page.waitForSelector('[data-testid="session-indicator"]', {
        timeout: 20_000,
      });
      await captureImage(page, "tc-06-session-indicator.png");
      records.push({
        tcId: "TC-06",
        file: "tc-06-session-indicator.png",
        url,
        capturedAt: new Date().toISOString(),
      });
      await context.close();
    }

    await writeFile(metadataPath, `${JSON.stringify(records, null, 2)}\n`);
    process.stdout.write(
      `[capture-task-p0-08-session-resume-renderer-integration-phase11] captured ${records.length} screenshots\n`,
    );
  } finally {
    if (browser) {
      await browser.close().catch(() => undefined);
    }
    server.kill("SIGTERM");
  }
}

run().catch((error) => {
  console.error(
    "[capture-task-p0-08-session-resume-renderer-integration-phase11] failed",
    error,
  );
  process.exitCode = 1;
});
