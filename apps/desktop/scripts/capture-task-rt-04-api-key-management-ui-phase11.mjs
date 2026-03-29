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
  "docs/30-workflows/step-08-par-task-rt-04-api-key-management-ui",
);
const phase11Root = path.join(workflowRoot, "outputs", "phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const planPath = path.join(phase11Root, "screenshot-plan.json");
const port = process.env.TASK_RT_04_PHASE11_PORT ?? "5198";
const baseUrl = `http://127.0.0.1:${port}`;
const harnessPath = "/phase11-task-rt-04-skill-authkey.html";
const viewport = { width: 1440, height: 2200 };

const cases = [
  {
    tcId: "TC-11-01",
    scenario: "initial",
    file: "TC-11-01-skill-authkey-initial.png",
    note: "SkillLifecyclePanel 上で未設定状態と保存 CTA を確認する。",
    validate: async (page) => {
      await page.getByTestId("skill-api-key-status-badge").waitFor();
      await page.getByTestId("skill-api-key-save-button").waitFor();
    },
  },
  {
    tcId: "TC-11-02",
    scenario: "saved",
    file: "TC-11-02-skill-authkey-action.png",
    note: "保存成功後、設定済みバッジと保存済み source を確認する。",
    validate: async (page) => {
      await page.getByTestId("skill-api-key-status-badge").waitFor();
      await page.getByTestId("skill-api-key-delete-button").waitFor();
      await page.getByTestId("skill-api-key-source").waitFor();
    },
  },
  {
    tcId: "TC-11-03",
    scenario: "env-fallback",
    file: "TC-11-03-skill-authkey-fallback.png",
    note: "env-fallback 状態で設定済みバッジと環境変数 source を確認する。",
    validate: async (page) => {
      await page.getByTestId("skill-api-key-status-badge").waitFor();
      await page.getByTestId("skill-api-key-delete-button").waitFor();
      await page.getByTestId("skill-api-key-source").waitFor();
    },
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

function createMockScript() {
  return ({ scenario }) => {
    const STORAGE_KEYS = {
      authKeyStored: "phase11-task-rt-04-authkey-stored",
      authKeyEnvFallback: "phase11-task-rt-04-authkey-env",
    };

    const setScenarioState = (nextScenario) => {
      if (nextScenario === "saved") {
        window.localStorage.setItem(STORAGE_KEYS.authKeyStored, "true");
        window.localStorage.setItem(STORAGE_KEYS.authKeyEnvFallback, "false");
        return;
      }
      if (nextScenario === "env-fallback") {
        window.localStorage.setItem(STORAGE_KEYS.authKeyStored, "false");
        window.localStorage.setItem(STORAGE_KEYS.authKeyEnvFallback, "true");
        return;
      }
      window.localStorage.setItem(STORAGE_KEYS.authKeyStored, "false");
      window.localStorage.setItem(STORAGE_KEYS.authKeyEnvFallback, "false");
    };

    const getState = () => ({
      stored:
        window.localStorage.getItem(STORAGE_KEYS.authKeyStored) === "true",
      env:
        window.localStorage.getItem(STORAGE_KEYS.authKeyEnvFallback) === "true",
    });

    setScenarioState(scenario);

    window.__PHASE11_TASK_RT_04_SKILL_AUTHKEY__ = {
      resolvedTheme: "light",
      selectedSkillName: "task-rt-04-phase11",
      skillExecutionStatus: "idle",
      streamingMessages: [],
      isSkillExecuting: false,
      workflowSnapshot: null,
      workflowError: null,
      generationError: null,
      generationProgress: null,
      currentPlanId: null,
      currentPlanResult: null,
      handoffGuidance: null,
    };

    window.electronAPI = {
      authKey: {
        exists: async () => {
          const state = getState();
          if (state.stored) return { exists: true, source: "saved" };
          if (state.env) return { exists: true, source: "env-fallback" };
          return { exists: false, source: "not-set" };
        },
        set: async () => {
          setScenarioState("saved");
          return { success: true };
        },
        delete: async () => {
          const state = getState();
          window.localStorage.setItem(STORAGE_KEYS.authKeyStored, "false");
          window.localStorage.setItem(
            STORAGE_KEYS.authKeyEnvFallback,
            String(state.env),
          );
          return { success: true };
        },
      },
      skillCreator: {
        onWorkflowStateChanged: () => () => {},
      },
    };
  };
}

async function captureCase(browser, entry) {
  const context = await browser.newContext({
    viewport,
    colorScheme: "light",
  });
  const page = await context.newPage();
  await page.addInitScript(createMockScript(), {
    scenario: entry.scenario,
  });
  const url = `${baseUrl}${harnessPath}?scenario=${entry.scenario}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.getByTestId("skill-lifecycle-panel").waitFor({ timeout: 20_000 });
  await page.getByTestId("skill-api-key-panel").scrollIntoViewIfNeeded();
  await entry.validate(page);
  await wait(250);

  const panel = page.getByTestId("skill-api-key-panel");
  const outputPath = path.join(screenshotDir, entry.file);
  await panel.screenshot({ path: outputPath });
  await context.close();

  const stat = await fs.stat(outputPath);
  return {
    tcId: entry.tcId,
    scenario: entry.scenario,
    file: entry.file,
    output: `outputs/phase-11/screenshots/${entry.file}`,
    note: entry.note,
    capturedAt: stat.mtime.toISOString(),
    captureMethod: "current_build_vite_playwright",
  };
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });
  const server = startViteServer();

  try {
    await waitForServer(`${baseUrl}${harnessPath}`);
    const browser = await chromium.launch({ headless: true });
    const captured = [];

    for (const entry of cases) {
      captured.push(await captureCase(browser, entry));
    }

    await browser.close();

    const generatedAt = new Date().toISOString();
    await fs.writeFile(
      planPath,
      JSON.stringify(
        {
          taskId: "TASK-RT-04",
          generatedAt,
          captureMethod: "current_build_vite_playwright",
          harnessPath,
          viewport,
          cases: captured.map((entry) => ({
            tcId: entry.tcId,
            state: entry.scenario,
            output: entry.output,
          })),
        },
        null,
        2,
      ),
    );

    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          taskId: "TASK-RT-04",
          generatedAt,
          captureMethod: "current_build_vite_playwright",
          baseUrl,
          harnessPath,
          viewport,
          screenshots: captured,
        },
        null,
        2,
      ),
    );

    console.log(
      `[capture-task-rt-04-api-key-management-ui-phase11] captured ${captured.length} screenshots`,
    );
  } finally {
    server.kill("SIGTERM");
    await wait(500);
    if (!server.killed) {
      server.kill("SIGKILL");
    }
  }
}

main().catch((error) => {
  console.error(
    "[capture-task-rt-04-api-key-management-ui-phase11] failed",
    error,
  );
  process.exit(1);
});
