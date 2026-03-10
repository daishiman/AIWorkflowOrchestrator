import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, "..", "..", "..");
const desktopRoot = path.join(repoRoot, "apps/desktop");
const workflowRoot = path.join(
  repoRoot,
  "docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement",
);
const screenshotDir = path.join(workflowRoot, "outputs/phase-11/screenshots");
const baseUrl = "http://127.0.0.1:4173/phase11-agent-view.html";
const pnpmBin = "/Users/dm/.volta/bin/pnpm";
const useExternalServer = process.env.PHASE11_CAPTURE_EXTERNAL_SERVER === "1";

const scenarios = [
  { file: "TC-01-main-view-light.png", scenario: "main-view", theme: "light" },
  {
    file: "TC-02-chip-selected-light.png",
    scenario: "chip-selected",
    theme: "light",
  },
  {
    file: "TC-03-button-disabled-light.png",
    scenario: "button-disabled",
    theme: "light",
  },
  {
    file: "TC-03-button-enabled-light.png",
    scenario: "button-enabled",
    theme: "light",
  },
  {
    file: "TC-04-floating-executing-light.png",
    scenario: "floating-executing",
    theme: "light",
  },
  {
    file: "TC-04-floating-completed-light.png",
    scenario: "floating-completed",
    theme: "light",
  },
  {
    file: "TC-05-floating-error-light.png",
    scenario: "floating-error",
    theme: "light",
  },
  { file: "TC-06-panel-open-light.png", scenario: "panel-open", theme: "light" },
  { file: "TC-07-recent-list-light.png", scenario: "recent-list", theme: "light" },
  { file: "TC-08-empty-state-light.png", scenario: "empty-state", theme: "light" },
  { file: "TC-09-no-search-light.png", scenario: "no-search", theme: "light" },
  {
    file: "TC-09-with-search-light.png",
    scenario: "with-search",
    theme: "light",
  },
  { file: "TC-11-main-view-dark.png", scenario: "main-view", theme: "dark" },
];

async function waitForServer(url, timeoutMs = 60_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`server timeout: ${url}`);
}

async function captureScenario(browser, entry) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    colorScheme: entry.theme,
  });
  const page = await context.newPage();
  const url = `${baseUrl}?scenario=${entry.scenario}&theme=${entry.theme}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForSelector("[data-testid='phase11-agent-view-harness']", {
    timeout: 15_000,
  });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(screenshotDir, entry.file),
    fullPage: true,
  });
  await context.close();
}

async function main() {
  await mkdir(screenshotDir, { recursive: true });
  const server = useExternalServer
    ? null
    : spawn(
        pnpmBin,
        [
          "exec",
          "vite",
          "--config",
          "vite.e2e.config.ts",
          "--port",
          "4173",
          "--strictPort",
          "--host",
          "127.0.0.1",
        ],
        {
          cwd: desktopRoot,
          stdio: ["ignore", "pipe", "pipe"],
        },
      );

  server?.stdout.on("data", (chunk) => process.stdout.write(chunk));
  server?.stderr.on("data", (chunk) => process.stderr.write(chunk));

  try {
    await waitForServer("http://127.0.0.1:4173/phase11-agent-view.html");
    const browser = await chromium.launch({ headless: true });
    for (const scenario of scenarios) {
      await captureScenario(browser, scenario);
    }
    await browser.close();
    console.log("captured screenshots for agent-view-enhancement");
  } finally {
    server?.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
