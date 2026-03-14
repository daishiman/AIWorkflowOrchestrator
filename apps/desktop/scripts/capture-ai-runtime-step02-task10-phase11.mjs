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
  "docs/30-workflows/ai-runtime-authmode-unification/tasks/step-02-par-task-10-claude-code-terminal-surface",
);
const phase11Root = path.join(workflowRoot, "outputs", "phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const port = process.env.AI_RUNTIME_STEP02_TASK10_PHASE11_PORT ?? "5191";
const baseUrl = `http://127.0.0.1:${port}`;
const harnessPath = "/phase11-terminal-surface.html";

const screenshots = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-terminal-claude-transcript.png",
    label: "TC-11-01: 現在は terminal placeholder（Coming soon）で実装前状態を確認",
    scenario: "terminal",
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-terminal-controls.png",
    label: "TC-11-02: abort/retry/history control は未実装で placeholder 状態を確認",
    scenario: "terminal",
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-terminal-unavailable-guidance.png",
    label: "TC-11-03: unavailable guidance UI は本タスク未実装（spec_created）",
    scenario: "terminal",
  },
  {
    tc: "TC-11-04",
    file: "TC-11-04-terminal-no-auto-send.png",
    label: "TC-11-04: no auto-send は契約のみ定義済み、UI実装は未着手",
    scenario: "terminal",
  },
  {
    tc: "TC-11-05",
    file: "TC-11-05-terminal-persistent-launcher.png",
    label: "TC-11-05: persistent launcher は本タスクの実装対象として保留",
    scenario: "terminal",
  },
  {
    tc: "TC-11-06",
    file: "TC-11-06-terminal-manual-share.png",
    label: "TC-11-06: manual transcript share は仕様化済み、実装は未着手",
    scenario: "terminal",
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
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

async function run() {
  await fs.mkdir(screenshotDir, { recursive: true });

  const devServer = spawn(
    "pnpm",
    [
      "--filter",
      "@repo/desktop",
      "dev",
      "--",
      "--host",
      "127.0.0.1",
      "--port",
      port,
    ],
    {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
      },
    },
  );

  let stderrBuffer = "";
  let stdoutBuffer = "";
  devServer.stdout?.on("data", (chunk) => {
    stdoutBuffer += chunk.toString();
  });
  devServer.stderr?.on("data", (chunk) => {
    stderrBuffer += chunk.toString();
  });

  try {
    await waitForServer(`${baseUrl}/`);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1600, height: 980 } });
    const captured = [];

    for (const shot of screenshots) {
      const url = new URL(harnessPath, baseUrl);
      url.searchParams.set("scenario", shot.scenario);
      url.searchParams.set("label", shot.label);

      await page.goto(url.toString(), { waitUntil: "networkidle" });
      await page.getByTestId("phase11-terminal-surface-harness").waitFor();
      await page.getByTestId("terminal-placeholder").waitFor();

      const outputPath = path.join(screenshotDir, shot.file);
      await page.screenshot({ path: outputPath, fullPage: true });

      captured.push({ tc: shot.tc, file: shot.file, label: shot.label });
    }

    await browser.close();

    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          baseUrl,
          harnessPath,
          screenshots: captured,
        },
        null,
        2,
      ),
    );

    process.stdout.write(
      `[capture-ai-runtime-step02-task10-phase11] captured ${captured.length} screenshots in ${screenshotDir}\n`,
    );
  } finally {
    devServer.kill("SIGTERM");
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!devServer.killed) {
      devServer.kill("SIGKILL");
    }

    if (stderrBuffer.trim().length > 0) {
      process.stderr.write(stderrBuffer);
    }
    if (stdoutBuffer.trim().length > 0) {
      process.stdout.write(stdoutBuffer);
    }
  }
}

run().catch((error) => {
  console.error("[capture-ai-runtime-step02-task10-phase11] failed", error);
  process.exit(1);
});
