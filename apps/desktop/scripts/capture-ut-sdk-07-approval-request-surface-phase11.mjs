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
  "docs/30-workflows/step-12-par-task-ut-sdk-07-approval-request-surface-001",
);
const screenshotDir = path.join(workflowRoot, "outputs/phase-11/screenshots");
const metadataPath = path.join(
  screenshotDir,
  "phase11-approval-request-surface-capture.json",
);
const port = process.env.UT_SDK_07_APPROVAL_REQUEST_PHASE11_PORT ?? "5199";
const baseUrl = `http://127.0.0.1:${port}`;
const viewport = { width: 1440, height: 1080 };

const scenarios = [
  {
    tcId: "TC-01",
    scenario: "pending-light",
    file: "TC-01-approval-pending-light.png",
    selector: '[data-testid="approval-request-panel"]',
  },
  {
    tcId: "TC-02",
    scenario: "pending-dark",
    file: "TC-02-approval-pending-dark.png",
    selector: '[data-testid="approval-request-panel"]',
  },
  {
    tcId: "TC-03",
    scenario: "expired-light",
    file: "TC-03-approval-expired-light.png",
    selector: '[data-testid="approval-request-panel"]',
  },
  {
    tcId: "TC-04",
    scenario: "expired-dark",
    file: "TC-04-approval-expired-dark.png",
    selector: '[data-testid="approval-request-panel"]',
  },
  {
    tcId: "TC-05",
    scenario: "approved-light",
    file: "TC-05-approval-approved-light.png",
    actionTestId: "approval-approve-button",
    selector: '[data-testid="approval-request-panel"]',
  },
  {
    tcId: "TC-06",
    scenario: "rejected-light",
    file: "TC-06-approval-rejected-light.png",
    actionTestId: "approval-reject-button",
    selector: '[data-testid="approval-request-panel"]',
  },
];

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

async function captureScenario(browser, scenario) {
  const theme = scenario.scenario.endsWith("dark") ? "dark" : "light";
  const context = await browser.newContext({
    viewport,
    colorScheme: theme,
  });
  const page = await context.newPage();
  const url = `${baseUrl}/phase11-approval-request-surface.html?scenario=${scenario.scenario}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForSelector(scenario.selector, { timeout: 20_000 });

  if (scenario.actionTestId) {
    await page.evaluate((actionTestId) => {
      const controller =
        window.__PHASE11_APPROVAL_REQUEST_SURFACE__ ?? undefined;
      if (!controller) {
        throw new Error("phase11 approval request controller is missing");
      }
      if (actionTestId === "approval-approve-button") {
        return controller.approve();
      }
      return controller.reject();
    }, scenario.actionTestId);
    await page.waitForTimeout(800);
  } else if (scenario.scenario.startsWith("expired")) {
    await page.evaluate(() => {
      const controller =
        window.__PHASE11_APPROVAL_REQUEST_SURFACE__ ?? undefined;
      if (!controller) {
        throw new Error("phase11 approval request controller is missing");
      }
      controller.expire();
    });
    await page.waitForTimeout(1_200);
  }

  await page.screenshot({
    path: path.join(screenshotDir, scenario.file),
    fullPage: true,
  });

  await context.close();
  return {
    tcId: scenario.tcId,
    file: scenario.file,
    scenario: scenario.scenario,
    url,
    capturedAt: new Date().toISOString(),
  };
}

async function run() {
  await mkdir(screenshotDir, { recursive: true });

  const server = startViteServer();
  const records = [];
  let browser;

  try {
    await waitForServer(
      `${baseUrl}/phase11-approval-request-surface.html?scenario=pending-light`,
    );

    browser = await chromium.launch({ headless: true });

    for (const scenario of scenarios) {
      const record = await captureScenario(browser, scenario);
      records.push(record);
    }

    await writeFile(metadataPath, `${JSON.stringify(records, null, 2)}\n`);
    process.stdout.write(
      `[capture-ut-sdk-07-approval-request-surface-phase11] captured ${records.length} screenshots\n`,
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
    "[capture-ut-sdk-07-approval-request-surface-phase11] failed",
    error,
  );
  process.exitCode = 1;
});
