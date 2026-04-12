#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
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
  "docs/30-workflows/TASK-UI-SCHEDULE-VISUAL-PICKER-001",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const screenshotPlanPath = path.join(phase11Root, "screenshot-plan.json");
const captureMetadataPath = path.join(phase11Root, "phase11-capture-metadata.json");
const port = process.env.TASK_UI_SCHEDULE_VISUAL_PICKER_PHASE11_PORT ?? "5186";
const esbuildBinaryPath = path.join(
  repoRoot,
  "node_modules/.pnpm/@esbuild+darwin-arm64@0.25.12/node_modules/@esbuild/darwin-arm64/bin/esbuild",
);

const baseUrl = `http://127.0.0.1:${port}`;
const pickerPage = `${baseUrl}/phase11-task-ui-schedule-visual-picker.html`;

const scenarios = [
  {
    id: "ss-001",
    scenario: 1,
    file: "ss-001.png",
    route: `${pickerPage}?mode=picker&scenario=ss-001&preset=empty`,
    selector: '[data-testid="phase11-picker-card"]',
    viewport: { width: 1440, height: 980 },
    description: "VisualCronPicker 初期表示（毎日 09:00 の既定状態）",
    state: "initial-default",
    required: true,
  },
  {
    id: "ss-002",
    scenario: 1,
    file: "ss-002.png",
    route: `${pickerPage}?mode=picker&scenario=ss-002&preset=daily`,
    selector: '[data-testid="phase11-picker-card"]',
    viewport: { width: 1440, height: 980 },
    description: "毎日 9:00 設定後・CronPreview 表示",
    state: "configured-daily",
    required: true,
  },
  {
    id: "ss-003",
    scenario: 2,
    file: "ss-003.png",
    route: `${pickerPage}?mode=picker&scenario=ss-003&preset=daily`,
    selector: '[data-testid="phase11-picker-card"]',
    viewport: { width: 1440, height: 980 },
    description: "WeekdaySelector で月水金選択状態",
    state: "weekday-selected",
    required: true,
    action: async (page) => {
      await page.getByRole("button", { name: "毎週" }).click();
      for (const label of ["月曜日", "水曜日", "金曜日"]) {
        const button = page.getByRole("button", { name: label });
        const pressed = await button.getAttribute("aria-pressed");
        if (pressed !== "true") {
          await button.click();
        }
      }
    },
  },
  {
    id: "ss-004",
    scenario: 3,
    file: "ss-004.png",
    route: `${pickerPage}?mode=picker&scenario=ss-004&preset=monthly`,
    selector: '[data-testid="phase11-picker-card"]',
    viewport: { width: 1440, height: 980 },
    description: "DayOfMonthSelector で 1 日選択状態",
    state: "dom-selected",
    required: true,
  },
  {
    id: "ss-005",
    scenario: 4,
    file: "ss-005.png",
    route: `${pickerPage}?mode=picker&scenario=ss-005&preset=weekly`,
    selector: '[data-testid="phase11-picker-card"]',
    viewport: { width: 1440, height: 980 },
    description: "既存スケジュール読み込み直後（逆変換確認）",
    state: "loaded-from-store",
    required: true,
  },
  {
    id: "ss-006",
    scenario: 5,
    file: "ss-006.png",
    route: `${pickerPage}?mode=picker&scenario=ss-006&preset=custom`,
    selector: '[data-testid="phase11-picker-card"]',
    viewport: { width: 1440, height: 980 },
    description: "AdvancedToggle ON・直接入力状態",
    state: "advanced-mode",
    required: true,
  },
  {
    id: "ss-007",
    scenario: 6,
    file: "ss-007.png",
    route: `${pickerPage}?mode=picker&scenario=ss-007&preset=weekly`,
    selector: '[data-testid="phase11-picker-card"]',
    waitSelector: '[role="alert"]',
    viewport: { width: 1440, height: 980 },
    description: "曜日未選択エラー表示状態",
    state: "validation-error",
    required: true,
    action: async (page) => {
      for (const label of [
        "月曜日",
        "火曜日",
        "水曜日",
        "木曜日",
        "金曜日",
        "土曜日",
        "日曜日",
      ]) {
        const button = page.getByRole("button", { name: label });
        const pressed = await button.getAttribute("aria-pressed");
        if (pressed === "true") {
          await button.click();
        }
      }
    },
  },
  {
    id: "ss-008",
    scenario: 7,
    file: "ss-008.png",
    route: `${pickerPage}?mode=picker&scenario=ss-008&preset=daily`,
    selector: '[data-testid="phase11-picker-card"]',
    viewport: { width: 1440, height: 980 },
    description: "キーボードフォーカスリング表示状態",
    state: "keyboard-focus",
    required: true,
    action: async (page) => {
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
    },
  },
  {
    id: "ss-009",
    scenario: 8,
    file: "ss-009.png",
    route: `${pickerPage}?mode=picker&scenario=ss-009&preset=daily`,
    selector: '[data-testid="phase11-picker-card"]',
    viewport: { width: 800, height: 980 },
    description: "ウィンドウ幅 800px での全体レイアウト",
    state: "small-screen",
    required: true,
  },
  {
    id: "ss-010",
    scenario: 9,
    file: "ss-010.png",
    route: `${pickerPage}?mode=wizard&scenario=ss-010`,
    selector: '[data-testid="phase11-wizard-card"]',
    waitSelector: '[role="alert"]',
    viewport: { width: 1440, height: 1200 },
    description: "cronExpression / timezone のエラー表示状態",
    state: "validation-error-skill-wizard",
    required: true,
    action: async (page) => {
      const cronInput = page.locator("#schedule-cron");
      await cronInput.fill("0 9 * *");
      await cronInput.blur();

      const timezoneSelect = page.locator("#schedule-timezone");
      await timezoneSelect.selectOption("Mars/Phobos").catch(async () => {
        await timezoneSelect.evaluate((el) => {
          const select = el;
          const option = document.createElement("option");
          option.value = "Mars/Phobos";
          option.textContent = "Mars/Phobos";
          select.appendChild(option);
          select.value = "Mars/Phobos";
          select.dispatchEvent(new Event("change", { bubbles: true }));
        });
      });
      await timezoneSelect.blur();
    },
  },
];

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

function releasePort(portNumber) {
  const lookup = spawnSync("lsof", ["-ti", `:${portNumber}`], {
    encoding: "utf8",
  });

  if (lookup.status !== 0) {
    return;
  }

  const pids = lookup.stdout
    .trim()
    .split(/\s+/)
    .filter((pid) => pid.length > 0);

  if (pids.length === 0) {
    return;
  }

  spawnSync("kill", ["-9", ...pids], { stdio: "ignore" });
}

async function captureScenario(browser, scenario, outputDir) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    colorScheme: "dark",
  });

  try {
    const page = await context.newPage();
    await page.goto(scenario.route, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });

    await page.waitForSelector(
      scenario.route.includes("mode=wizard")
        ? '[data-testid="phase11-wizard-card"]'
        : '[data-testid="phase11-picker-card"]',
      {
        timeout: 60_000,
      },
    );

    await page.waitForTimeout(150);

    if (scenario.action) {
      await scenario.action(page);
      await page.waitForTimeout(200);
    }

    await page.waitForSelector(scenario.waitSelector ?? scenario.selector, {
      timeout: 15_000,
    });
    const locator = page.locator(scenario.selector);
    await locator.screenshot({
      path: path.join(outputDir, scenario.file),
    });

    const stat = await fs.stat(path.join(outputDir, scenario.file));
    return {
      id: scenario.id,
      scenario: scenario.scenario,
      file: `screenshots/${scenario.file}`,
      description: scenario.description,
      state: scenario.state,
      route: scenario.route,
      selector: scenario.selector,
      viewport: scenario.viewport,
      capturedAt: stat.mtime.toISOString(),
      required: scenario.required,
    };
  } catch (error) {
    throw new Error(
      `Screenshot capture failed for ${scenario.file} (${scenario.route})`,
      { cause: error },
    );
  } finally {
    await context.close();
  }
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });
  releasePort(port);

  const server = spawn(
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
      env: {
        ...process.env,
        ESBUILD_BINARY_PATH: esbuildBinaryPath,
        npm_config_esbuild_binary_path: esbuildBinaryPath,
      },
      cwd: desktopRoot,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", (data) => process.stdout.write(data));
  server.stderr.on("data", (data) => process.stderr.write(data));

  try {
    await waitForServer(pickerPage);

    const browser = await chromium.launch({ headless: true });
    const capturedFiles = [];

    for (const scenario of scenarios) {
      const captured = await captureScenario(browser, scenario, screenshotDir);
      capturedFiles.push(captured);
      process.stdout.write(
        `Captured ${path.join(screenshotDir, scenario.file)}\n`,
      );
    }

    const generatedAt = new Date().toISOString();

    await fs.writeFile(
      screenshotPlanPath,
      JSON.stringify(
        {
          feature: "TASK-UI-SCHEDULE-VISUAL-PICKER-001",
          phase: 11,
          generatedAt,
          captureScript:
            "apps/desktop/scripts/capture-task-ui-schedule-visual-picker-phase11.mjs",
          screenshots: capturedFiles.map((entry) => ({
            id: entry.id,
            scenario: entry.scenario,
            description: entry.description,
            state: entry.state,
            file: entry.file,
            route: entry.route,
            selector: entry.selector,
            viewport: entry.viewport,
            required: entry.required,
          })),
        },
        null,
        2,
      ),
    );

    await fs.writeFile(
      captureMetadataPath,
      JSON.stringify(
        {
          generatedAt,
          captureMethod: "current_build_vite_playwright",
          baseUrl,
          harnessPath: "/phase11-task-ui-schedule-visual-picker.html",
          screenshots: capturedFiles,
        },
        null,
        2,
      ),
    );

    await Promise.race([
      browser.close(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
  } finally {
    if (!server.killed) {
      server.kill("SIGKILL");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
