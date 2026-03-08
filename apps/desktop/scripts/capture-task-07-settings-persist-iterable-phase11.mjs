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
  "docs/30-workflows/07-TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001",
);
const screenshotDir = path.join(workflowRoot, "outputs/phase-11/screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const port = "5187";
const baseUrl = `http://127.0.0.1:${port}`;

const scenarios = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-settings-normal.png",
    note: "正常 persist state で settings 画面に到達できる",
    preset: "normal",
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-settings-corrupted-viewhistory-null.png",
    note: "viewHistory=null でも settings 画面に到達できる",
    preset: "viewHistoryNull",
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-settings-corrupted-expandedfolders-number.png",
    note: "expandedFolders=number でも settings 画面に到達できる",
    preset: "expandedFoldersNumber",
  },
];

function createInitScript() {
  return ({ preset }) => {
    const baseState = {
      currentView: "settings",
      viewHistory: ["dashboard", "settings"],
      expandedFolders: ["skills", "docs"],
      responsiveMode: "desktop",
    };

    if (preset === "viewHistoryNull") baseState.viewHistory = null;
    if (preset === "expandedFoldersNumber") baseState.expandedFolders = 42;

    window.localStorage.setItem(
      "knowledge-studio-store",
      JSON.stringify({ state: baseState, version: 0 }),
    );
  };
}

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for ${url}`);
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
      port,
      "--strictPort",
      "--host",
      "127.0.0.1",
    ],
    { cwd: desktopRoot, stdio: ["ignore", "pipe", "pipe"] },
  );
  server.stdout.on("data", (d) => process.stdout.write(d));
  server.stderr.on("data", (d) => process.stderr.write(d));

  try {
    await waitForServer(baseUrl);
    const browser = await chromium.launch({ headless: true });
    const results = [];

    for (const scenario of scenarios) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        colorScheme: "dark",
      });
      await context.addInitScript(createInitScript(), { preset: scenario.preset });
      const page = await context.newPage();
      await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 90000 });
      await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(1500);

      const out = path.join(screenshotDir, scenario.file);
      await page.screenshot({ path: out, fullPage: true });
      const stat = await fs.stat(out);
      results.push({
        tc: scenario.tc,
        file: scenario.file,
        note: scenario.note,
        capturedAt: stat.mtime.toISOString(),
      });
      await context.close();
      process.stdout.write(`Captured ${scenario.tc}: ${out}\n`);
    }
    await browser.close();

    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          baseUrl,
          scenarios: results,
        },
        null,
        2,
      ),
    );
    process.stdout.write(`Saved metadata: ${metadataPath}\n`);
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
