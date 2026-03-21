#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import {
  probeStaticServer,
  startRendererStaticServer,
} from "./phase11-static-server.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(desktopRoot, "..", "..");
const rendererRoot = path.join(desktopRoot, "out/renderer");
const workflowRoot = path.join(
  repoRoot,
  "docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const planPath = path.join(phase11Root, "screenshot-plan.json");
const port = process.env.LLM_CONFIG_PERSISTENCE_PHASE11_PORT ?? "5182";
const baseUrl = `http://127.0.0.1:${port}`;
const harnessUrl = `${baseUrl}/phase11-llm-config-persistence.html`;
const persistKey = "knowledge-studio-store";
const reloadCountKey = "phase11-llm-config-persistence-reload-count";

const screenshots = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-persist-v2-valid-selection.png",
    note: "version 2 の valid selection を localStorage から復元し、selectedProviderId / selectedModelId がそのまま表示される。",
    scenario: "valid",
    action: "none",
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-invalid-provider-cleared.png",
    note: "存在しない provider が null クリアされ、DEFAULT_CONFIG への fallback なしで無効値が可視化される。",
    scenario: "invalid",
    action: "none",
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-legacy-v1-normalized-to-v2.png",
    note: "legacy v1 入力が v2 へ正規化されることを確認する。",
    scenario: "legacy",
    action: "none",
  },
  {
    tc: "TC-11-04",
    file: "TC-11-04-reload-retains-selected-config.png",
    note: "再読み込み後も selectedProviderId / selectedModelId が保持され、mount count が 2 になる。",
    scenario: "valid",
    action: "reload",
  },
];

function buildPersistState(scenario) {
  const baseState = {
    currentView: "settings",
    selectedFile: null,
    expandedFolders: [],
    userProfile: null,
    autoSyncEnabled: false,
    windowSize: { width: 1440, height: 1600 },
    isNavExpanded: true,
    permissionHistory: [],
    notifications: [],
  };

  switch (scenario) {
    case "invalid":
      return {
        state: {
          ...baseState,
          selectedProviderId: "legacy-provider",
          selectedModelId: "legacy-model",
        },
        version: 2,
      };
    case "legacy":
      return {
        state: baseState,
        version: 1,
      };
    case "valid":
    default:
      return {
        state: {
          ...baseState,
          selectedProviderId: "anthropic",
          selectedModelId: "claude-3-5-sonnet",
        },
        version: 2,
      };
  }
}

async function waitForServer(url, timeoutMs = 60_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
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
  throw new Error(`Timed out waiting for server: ${url}`);
}

function createInitScript() {
  return ({ persistState }) => {
    const persistKey = "knowledge-studio-store";
    const reloadCountKey = "phase11-llm-config-persistence-reload-count";

    window.localStorage.clear();
    window.sessionStorage.clear();
    window.localStorage.setItem("dev-skip-auth", "true");
    window.localStorage.setItem(persistKey, JSON.stringify(persistState));
    window.sessionStorage.setItem(reloadCountKey, "0");
  };
}

async function captureScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1320 },
    deviceScaleFactor: 2,
  });
  await context.addInitScript(createInitScript(), {
    persistState: buildPersistState(scenario.scenario),
  });

  const page = await context.newPage();
  page.setDefaultTimeout(30_000);

  try {
    await page.goto(`${harnessUrl}?scenario=${scenario.scenario}`, {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
    await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
    await page.getByTestId("phase11-llm-config-persistence").waitFor({ timeout: 20_000 });

    if (scenario.action === "reload") {
      await Promise.all([
        page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 90_000 }),
        page.getByRole("button", { name: "ページを再読み込み" }).click(),
      ]);
      await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
      await page.getByTestId("phase11-llm-config-persistence").waitFor({ timeout: 20_000 });
      await page.waitForFunction(
        (key) => Number(window.sessionStorage.getItem(key) ?? "0") >= 2,
        reloadCountKey,
        { timeout: 20_000 },
      );
    }

    const screenshotPath = path.join(screenshotDir, scenario.file);
    await page.locator('[data-testid="phase11-llm-config-persistence"]').screenshot({
      path: screenshotPath,
    });

    const stat = await fs.stat(screenshotPath);
    const storageSnapshot = await page.evaluate((key) => {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    }, persistKey);

    const reloadCount = await page.evaluate(
      (key) => Number(window.sessionStorage.getItem(key) ?? "0"),
      reloadCountKey,
    );

    return {
      tc: scenario.tc,
      file: scenario.file,
      scenario: scenario.scenario,
      note: scenario.note,
      path: screenshotPath,
      capturedAt: stat.mtime.toISOString(),
      size: stat.size,
      reloadCount,
      storageSnapshot,
    };
  } finally {
    await context.close();
  }
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });
  await fs.writeFile(
    planPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        captureMethod: "current-renderer-entry + static-server harness",
        baseUrl,
        harnessUrl,
        scenarios: screenshots.map((scenario) => ({
          id: scenario.tc,
          scenario: scenario.scenario,
          action: scenario.action,
          output: `screenshots/${scenario.file}`,
          note: scenario.note,
        })),
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  const shouldStartServer = !(await probeStaticServer(`${baseUrl}/index.html`));
  const serverHandle = shouldStartServer
    ? await startRendererStaticServer({ baseUrl, rootDir: rendererRoot })
    : null;

  const build = spawn(
    "pnpm",
    ["--filter", "@repo/desktop", "build"],
    {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    },
  );

  build.stdout.on("data", (chunk) => process.stdout.write(`[build] ${chunk}`));
  build.stderr.on("data", (chunk) => process.stderr.write(`[build] ${chunk}`));

  await new Promise((resolve, reject) => {
    build.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`pnpm build failed with code ${code}`));
    });
    build.on("error", reject);
  });

  await waitForServer(`${baseUrl}/index.html`);

  const browser = await chromium.launch({ headless: true });
  try {
    const records = [];
    for (const scenario of screenshots) {
      records.push(await captureScenario(browser, scenario));
    }

    await fs.writeFile(
      metadataPath,
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          captureMethod: "current-renderer-entry + static-server harness",
          baseUrl,
          harnessUrl,
          sourceFiles: [
            "apps/desktop/src/renderer/phase11-llm-config-persistence.html",
            "apps/desktop/src/renderer/phase11-llm-config-persistence.tsx",
            "apps/desktop/scripts/capture-llm-config-persistence-phase11.mjs",
          ],
          records,
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
  } finally {
    await browser.close();
    if (serverHandle) {
      await serverHandle.close();
    }
  }

  process.stdout.write(`Saved screenshots to ${screenshotDir}\n`);
}

main().catch((error) => {
  console.error("[capture-llm-config-persistence-phase11] failed", error);
  process.exit(1);
});
