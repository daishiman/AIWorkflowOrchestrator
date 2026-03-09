#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(desktopRoot, "..", "..");
const workflowRoot = path.join(
  repoRoot,
  "docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001",
);
const screenshotDir = path.join(workflowRoot, "outputs/phase-11/screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const port = "5182";
const baseUrl = `http://127.0.0.1:${port}`;

const scenarios = [
  {
    tcId: "TC-11-01",
    scenario: "agent-view",
    file: "TC-11-01-agent-view-executing.png",
    viewport: { width: 1440, height: 1180 },
    colorScheme: "dark",
    verify: async (page) => {
      await expect(
        page.getByTestId("concurrency-guard-harness"),
      ).toBeVisible();
      await expect(page.getByRole("button", { name: "実行する" })).toHaveCount(
        0,
      );
    },
  },
  {
    tcId: "TC-11-02",
    scenario: "agent-execution",
    file: "TC-11-02-agent-execution-disabled-input.png",
    viewport: { width: 1440, height: 1180 },
    colorScheme: "dark",
    verify: async (page) => {
      await expect(
        page.getByTestId("concurrency-guard-harness"),
      ).toBeVisible();
      await expect(page.getByLabel("メッセージ入力")).toBeDisabled();
      await expect(
        page.getByRole("button", { name: "キャンセル" }),
      ).toBeVisible();
    },
  },
  {
    tcId: "TC-11-03",
    scenario: "chat-panel",
    file: "TC-11-03-chat-panel-disabled-toggle.png",
    viewport: { width: 1440, height: 1180 },
    colorScheme: "dark",
    verify: async (page) => {
      await expect(
        page.getByTestId("concurrency-guard-harness"),
      ).toBeVisible();
      await expect(page.getByTestId("skill-management-toggle")).toBeDisabled();
      await expect(page.getByTestId("skill-streaming-view")).toBeVisible();
    },
  },
];

function startViteServer() {
  const server = spawn(
    "pnpm",
    [
      "exec",
      "vite",
      "--config",
      "vite.e2e.config.ts",
      "--port",
      port,
      "--strictPort",
    ],
    {
      cwd: desktopRoot,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", (chunk) => process.stdout.write(chunk));
  server.stderr.on("data", (chunk) => process.stderr.write(chunk));

  return server;
}

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function captureScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    colorScheme: scenario.colorScheme,
  });
  const page = await context.newPage();
  const pageErrors = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  const url = `${baseUrl}/advanced/concurrency-guard-review?skipAuth=true&scenario=${scenario.scenario}`;
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);
  await scenario.verify(page);

  const screenshotPath = path.join(screenshotDir, scenario.file);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  const stat = await fs.stat(screenshotPath);

  await context.close();

  return {
    tcId: scenario.tcId,
    scenario: scenario.scenario,
    file: scenario.file,
    url,
    capturedAt: stat.mtime.toISOString(),
    pageErrors,
  };
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });

  const server = startViteServer();
  try {
    await waitForServer(baseUrl);

    const browser = await chromium.launch({ headless: true });
    const results = [];

    for (const scenario of scenarios) {
      const result = await captureScenario(browser, scenario);
      results.push(result);
      process.stdout.write(`Captured ${scenario.tcId}: ${scenario.file}\n`);
    }

    await browser.close();
    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          baseUrl,
          route: "/advanced/concurrency-guard-review",
          scenarios: results,
        },
        null,
        2,
      ),
    );
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
