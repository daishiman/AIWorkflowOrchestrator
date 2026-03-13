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
  "docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard",
);
const defaultOutputDir = path.join(workflowRoot, "outputs/phase-11/screenshots");

function parseArgs(argv) {
  const options = {
    outputDir: defaultOutputDir,
    port: process.env.ONBOARDING_WIZARD_SCREENSHOT_PORT ?? "4287",
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--output-dir" && argv[index + 1]) {
      options.outputDir = path.resolve(process.cwd(), argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--port" && argv[index + 1]) {
      options.port = argv[index + 1];
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
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

  throw new Error(`Timed out waiting for screenshot harness: ${url}`);
}

const scenarios = [
  {
    tcId: "TC-11-01",
    file: "TC-11-01-onboarding-step1-light-desktop.png",
    route: "/phase11-onboarding-wizard.html?theme=light",
    viewport: { width: 1440, height: 980 },
    colorScheme: "light",
  },
  {
    tcId: "TC-11-02",
    file: "TC-11-02-onboarding-step2-dark-desktop.png",
    route: "/phase11-onboarding-wizard.html?theme=dark",
    viewport: { width: 1440, height: 980 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.getByRole("button", { name: "次へ" }).click();
      await page.getByRole("button", { name: "要点だけ教えて" }).click();
      await page.waitForSelector('[data-testid="onboarding-ai-response"]');
    },
  },
  {
    tcId: "TC-11-03",
    file: "TC-11-03-onboarding-step3-dark-tablet.png",
    route: "/phase11-onboarding-wizard.html?theme=dark",
    viewport: { width: 1024, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.getByRole("button", { name: "次へ" }).click();
      await page.getByRole("button", { name: "要点だけ教えて" }).click();
      await page.getByRole("button", { name: "次へ" }).click();
      await page.getByTestId("onboarding-starter-workspace").click();
      await page.waitForSelector('[data-testid="onboarding-step-starter"]');
    },
  },
  {
    tcId: "TC-11-04",
    file: "TC-11-04-onboarding-step4-light-desktop.png",
    route: "/phase11-onboarding-wizard.html?theme=light",
    viewport: { width: 1440, height: 980 },
    colorScheme: "light",
    preCapture: async (page) => {
      await page.getByRole("button", { name: "次へ" }).click();
      await page.getByRole("button", { name: "要点だけ教えて" }).click();
      await page.getByRole("button", { name: "次へ" }).click();
      await page.getByTestId("onboarding-starter-workspace").click();
      await page.getByRole("button", { name: "次へ" }).click();
      await page.getByTestId("onboarding-theme-system").click();
      await page.waitForSelector('[data-testid="onboarding-step-theme"]');
    },
  },
  {
    tcId: "TC-11-05",
    file: "TC-11-05-onboarding-step3-dark-mobile.png",
    route: "/phase11-onboarding-wizard.html?theme=dark",
    viewport: { width: 390, height: 844 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.getByRole("button", { name: "次へ" }).click();
      await page.getByRole("button", { name: "要点だけ教えて" }).click();
      await page.getByRole("button", { name: "次へ" }).click();
      await page.getByTestId("onboarding-starter-skillCenter").click();
      await page.getByTestId("onboarding-starter-skillCenter").scrollIntoViewIfNeeded();
      await page.waitForSelector('[data-testid="onboarding-step-starter"]');
    },
  },
  {
    tcId: "TC-11-06",
    file: "TC-11-06-onboarding-complete-kanagawa-desktop.png",
    route: "/phase11-onboarding-wizard.html?theme=kanagawa-dragon",
    viewport: { width: 1440, height: 980 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.getByRole("button", { name: "次へ" }).click();
      await page.getByRole("button", { name: "要点だけ教えて" }).click();
      await page.getByRole("button", { name: "次へ" }).click();
      await page.getByTestId("onboarding-starter-agent").click();
      await page.getByRole("button", { name: "次へ" }).click();
      await page.getByTestId("onboarding-theme-kanagawa-dragon").click();
      await page.getByRole("button", { name: "完了する" }).click();
      await page.waitForSelector('[data-testid="onboarding-step-complete"]');
    },
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
    await page.waitForSelector('[data-testid="onboarding-wizard"]', {
      timeout: 30_000,
    });

    if (scenario.preCapture) {
      await scenario.preCapture(page);
    }

    await page.waitForTimeout(250);
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
    await waitForServer(`${baseUrl}/phase11-onboarding-wizard.html`);
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
          taskId: "TASK-061-UI-09-ONBOARDING-WIZARD",
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
  console.error("[capture-task-061-onboarding-wizard-phase11] failed", error);
  process.exitCode = 1;
});
