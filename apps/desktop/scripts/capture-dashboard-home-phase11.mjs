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
  "docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement",
);
const defaultOutputDir = path.join(workflowRoot, "outputs/phase-11/screenshots");

function parseArgs(argv) {
  const options = {
    outputDir: defaultOutputDir,
    port: process.env.DASHBOARD_HOME_SCREENSHOT_PORT ?? "4281",
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--output-dir" && argv[i + 1]) {
      options.outputDir = path.resolve(process.cwd(), argv[i + 1]);
      i += 1;
      continue;
    }
    if (arg === "--port" && argv[i + 1]) {
      options.port = argv[i + 1];
      i += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

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

const scenarios = [
  {
    tcId: "TC-11-01",
    file: "TC-11-01-home-normal-light-desktop.png",
    route: "/phase11-dashboard-home.html?state=normal&theme=light",
    viewport: { width: 1440, height: 980 },
    colorScheme: "light",
  },
  {
    tcId: "TC-11-02",
    file: "TC-11-02-home-empty-light-desktop.png",
    route: "/phase11-dashboard-home.html?state=empty&theme=light",
    viewport: { width: 1440, height: 980 },
    colorScheme: "light",
  },
  {
    tcId: "TC-11-03",
    file: "TC-11-03-home-loading-dark-desktop.png",
    route: "/phase11-dashboard-home.html?state=loading&theme=dark",
    viewport: { width: 1440, height: 980 },
    colorScheme: "dark",
  },
  {
    tcId: "TC-11-04",
    file: "TC-11-04-home-normal-mobile-dark.png",
    route: "/phase11-dashboard-home.html?state=normal&theme=dark",
    viewport: { width: 390, height: 844 },
    colorScheme: "dark",
  },
  {
    tcId: "TC-11-05",
    file: "TC-11-05-home-normal-kanagawa-desktop.png",
    route: "/phase11-dashboard-home.html?state=normal&theme=kanagawa-dragon",
    viewport: { width: 1440, height: 980 },
    colorScheme: "dark",
  },
];

async function captureScenario(browser, baseUrl, outputDir, scenario) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    colorScheme: scenario.colorScheme,
  });

  try {
    const page = await context.newPage();
    await page.goto(`${baseUrl}${scenario.route}`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await page.waitForSelector('[data-testid="phase11-dashboard-home"]', {
      timeout: 30_000,
    });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(outputDir, scenario.file),
      fullPage: true,
    });

    return {
      tcId: scenario.tcId,
      file: scenario.file,
      route: scenario.route,
      viewport: scenario.viewport,
      colorScheme: scenario.colorScheme,
      capturedAt: new Date().toISOString(),
    };
  } finally {
    await context.close();
  }
}

async function main() {
  const options = parseArgs(process.argv);
  const outputDir = options.outputDir;
  const metadataPath = path.join(outputDir, "phase11-capture-metadata.json");
  const baseUrl = `http://127.0.0.1:${options.port}`;

  await mkdir(outputDir, { recursive: true });

  const server = spawn(
    "pnpm",
    [
      "exec",
      "vite",
      "--config",
      "vite.e2e.config.ts",
      "--port",
      String(options.port),
      "--strictPort",
      "--host",
      "127.0.0.1",
    ],
    {
      cwd: desktopRoot,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", (data) => process.stdout.write(data));
  server.stderr.on("data", (data) => process.stderr.write(data));

  let browser;
  try {
    await waitForServer(`${baseUrl}/phase11-dashboard-home.html`);
    browser = await chromium.launch();
    const captures = [];

    for (const scenario of scenarios) {
      captures.push(await captureScenario(browser, baseUrl, outputDir, scenario));
      process.stdout.write(`✓ ${scenario.file}\n`);
    }

    await writeFile(
      metadataPath,
      JSON.stringify(
        {
          taskId: "TASK-UI-07-DASHBOARD-ENHANCEMENT",
          capturedAt: new Date().toISOString(),
          baseUrl,
          outputDir,
          captures,
        },
        null,
        2,
      ),
    );
    process.stdout.write(`✓ ${path.basename(metadataPath)}\n`);
  } finally {
    if (browser) {
      await browser.close();
    }
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error("[capture-dashboard-home-phase11] failed", error);
  process.exitCode = 1;
});
