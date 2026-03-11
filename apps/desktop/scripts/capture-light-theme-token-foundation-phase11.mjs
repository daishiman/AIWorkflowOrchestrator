#!/usr/bin/env node

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
  "docs/30-workflows/light-theme-token-foundation",
);
const outputRoot = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(outputRoot, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const baseUrl = process.env.PHASE11_CAPTURE_BASE_URL ?? "http://127.0.0.1:4173";

const scenarios = [
  {
    id: "TC-11-01",
    file: "TC-11-01-dashboard-light.png",
    route: "/phase11-dashboard.html?theme=light",
    theme: "light",
    selector: '[data-testid="phase11-dashboard-shell"]',
    description: "Dashboard light representative",
  },
  {
    id: "TC-11-02",
    file: "TC-11-02-settings-light.png",
    route: "/phase11-safeinvoke-timeout.html",
    theme: "light",
    selector: '[data-testid="phase11-safeinvoke-timeout-shell"]',
    description: "Settings light representative",
  },
  {
    id: "TC-11-03",
    file: "TC-11-03-auth-shell-light.png",
    route: "/phase11-authguard-timeout.html?theme=light",
    theme: "light",
    selector: '[data-testid="phase11-protected-shell"]',
    description: "Auth shell light representative",
  },
  {
    id: "TC-11-04",
    file: "TC-11-04-agent-main-light.png",
    route: "/phase11-agent-view.html?scenario=main-view&theme=light",
    theme: "light",
    selector: '[data-testid="phase11-agent-view-harness"]',
    description: "AgentView light representative",
  },
  {
    id: "TC-11-05",
    file: "TC-11-05-dashboard-dark-baseline.png",
    route: "/phase11-dashboard.html?theme=dark",
    theme: "dark",
    selector: '[data-testid="phase11-dashboard-shell"]',
    description: "Dashboard dark baseline for comparison",
  },
];

async function run() {
  await fs.mkdir(screenshotDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const metadata = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    viewport: { width: 1440, height: 900 },
    scenarios: [],
  };

  try {
    for (const scenario of scenarios) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        colorScheme: scenario.theme,
      });
      const page = await context.newPage();

      const targetUrl = `${baseUrl}${scenario.route}`;
      await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForSelector(scenario.selector, { timeout: 10000 });
      await page.waitForTimeout(800);

      const outputPath = path.join(screenshotDir, scenario.file);
      await page.screenshot({ path: outputPath, fullPage: true });
      const stat = await fs.stat(outputPath);

      metadata.scenarios.push({
        ...scenario,
        url: targetUrl,
        capturedAt: new Date().toISOString(),
        mtime: stat.mtime.toISOString(),
      });

      console.log(`✓ ${scenario.id} -> ${scenario.file}`);
      await context.close();
    }

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), "utf8");
    console.log(`✓ metadata -> ${metadataPath}`);
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error("[capture-light-theme-token-foundation-phase11] failed", error);
  process.exitCode = 1;
});
