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
  "docs/30-workflows/TASK-RT-03-skill-creation-result-panel",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const planPath = path.join(phase11Root, "screenshot-plan.json");
const metadataPath = path.join(phase11Root, "phase11-capture-metadata.json");
const port = process.env.TASK_RT_03_SKILL_CREATION_PHASE11_PORT ?? "5201";
const baseUrl = `http://127.0.0.1:${port}`;
const harnessPath = "/phase11-task-rt-03-skill-creation-result-panel.html";
const viewport = { width: 1440, height: 2600 };

const scenarios = [
  {
    tcId: "TC-11-01",
    name: "initial-state",
    file: "ss-01-initial-state.png",
    selector: '[data-testid="phase11-skill-creation-initial-card"]',
  },
  {
    tcId: "TC-11-02",
    name: "plan-complete",
    file: "ss-02-plan-complete.png",
    selector: '[data-testid="phase11-skill-creation-plan-card"]',
  },
  {
    tcId: "TC-11-03",
    name: "execute-success",
    file: "ss-03-execute-success.png",
    selector: '[data-testid="phase11-skill-creation-execute-card"]',
  },
  {
    tcId: "TC-11-04",
    name: "verify-pass",
    file: "ss-04-verify-pass.png",
    selector: '[data-testid="phase11-skill-creation-verify-pass-card"]',
  },
  {
    tcId: "TC-11-05",
    name: "verify-fail",
    file: "ss-05-verify-fail.png",
    selector: '[data-testid="phase11-skill-creation-verify-fail-card"]',
  },
  {
    tcId: "TC-11-06",
    name: "execute-fail",
    file: "ss-06-execute-fail.png",
    selector: '[data-testid="phase11-skill-creation-execute-fail-card"]',
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
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
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
      "--strictPort",
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

async function captureScenario(page, scenario) {
  const target = page.locator(scenario.selector);
  await target.waitFor({ state: "visible" });
  const outputPath = path.join(screenshotDir, scenario.file);
  await target.screenshot({ path: outputPath });
  const stat = await fs.stat(outputPath);
  return {
    tcId: scenario.tcId,
    name: scenario.name,
    file: scenario.file,
    output: `outputs/phase-11/screenshots/${scenario.file}`,
    capturedAt: stat.mtime.toISOString(),
  };
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });

  const server = startViteServer();
  const browser = await chromium.launch({ headless: true });

  try {
    await waitForServer(`${baseUrl}${harnessPath}`);

    const page = await browser.newPage({ viewport });
    await page.goto(`${baseUrl}${harnessPath}`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await page
      .locator('[data-testid="phase11-skill-creation-result-harness"]')
      .waitFor({ state: "visible", timeout: 20_000 });

    const captures = [];
    for (const scenario of scenarios) {
      captures.push(await captureScenario(page, scenario));
    }

    const generatedAt = new Date().toISOString();
    await fs.writeFile(
      planPath,
      JSON.stringify(
        {
          taskId: "TASK-RT-03-SKILL-CREATION-RESULT-PANEL",
          generatedAt,
          harnessPath,
          viewport,
          screenshots: captures,
        },
        null,
        2,
      ),
    );

    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          taskId: "TASK-RT-03-SKILL-CREATION-RESULT-PANEL",
          generatedAt,
          harnessPath,
          viewport,
          screenshotFiles: captures.map((entry) => entry.output),
        },
        null,
        2,
      ),
    );

    process.stdout.write(
      `Captured ${captures.length} screenshots to ${screenshotDir}\n`,
    );
  } finally {
    await browser.close();
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(
    "[capture-task-rt-03-skill-creation-result-panel-phase11] failed",
    error,
  );
  process.exitCode = 1;
});
