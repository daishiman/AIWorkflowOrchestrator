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
  "docs/30-workflows/skill-lifecycle-routing/tasks/step-03-seq-task-04-agentview-improve-route",
);
const screenshotDir = path.join(workflowRoot, "outputs/phase-11/screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const vitePort = process.env.SLR_STEP03_SCREENSHOT_PORT ?? "5196";
const baseUrl = `http://127.0.0.1:${vitePort}`;
const viewport = { width: 1440, height: 960 };

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
      vitePort,
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

async function openHarnessPage(browser, scenario, theme = "light") {
  const context = await browser.newContext({
    viewport,
    colorScheme: theme,
  });
  const page = await context.newPage();
  const url = `${baseUrl}/phase11-agentview-improve-route.html?scenario=${scenario}&theme=${theme}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  return { context, page, url };
}

async function captureImage(page, fileName) {
  const filePath = path.join(screenshotDir, fileName);
  await page.screenshot({
    path: filePath,
    fullPage: true,
  });
  return filePath;
}

async function run() {
  await mkdir(screenshotDir, { recursive: true });

  const server = startViteServer();
  const metadata = [];

  try {
    await waitForServer(
      `${baseUrl}/phase11-agentview-improve-route.html?scenario=cta-visible&theme=light`,
    );

    const browser = await chromium.launch({ headless: true });

    {
      const { context, page, url } = await openHarnessPage(
        browser,
        "cta-visible",
        "light",
      );
      await page.waitForSelector('[data-testid="agent-view"]', {
        timeout: 20_000,
      });
      await page.waitForSelector('[aria-label="スキル改善提案"]', {
        timeout: 20_000,
      });
      await wait(300);
      await captureImage(page, "TC-11-01-agent-cta-visible-light.png");
      const selected = await page.getByRole("radio", { name: "skill-alpha" }).getAttribute("aria-checked");
      metadata.push({
        tcId: "TC-11-01",
        url,
        file: "TC-11-01-agent-cta-visible-light.png",
        selectedSkillChecked: selected,
        capturedAt: new Date().toISOString(),
      });
      await context.close();
    }

    {
      const { context, page, url } = await openHarnessPage(
        browser,
        "cta-hidden",
        "light",
      );
      await page.waitForSelector('[data-testid="agent-view"]', {
        timeout: 20_000,
      });
      await wait(300);
      const ctaCount = await page.locator('[aria-label="スキル改善提案"]').count();
      if (ctaCount !== 0) {
        throw new Error("TC-11-02: CTA バナーが非表示条件で残っています");
      }
      await captureImage(page, "TC-11-02-agent-cta-hidden-light.png");
      metadata.push({
        tcId: "TC-11-02",
        url,
        file: "TC-11-02-agent-cta-hidden-light.png",
        ctaCount,
        capturedAt: new Date().toISOString(),
      });
      await context.close();
    }

    {
      const { context, page, url } = await openHarnessPage(
        browser,
        "cta-visible",
        "light",
      );
      await page.waitForSelector('[aria-label="スキル改善提案"]', {
        timeout: 20_000,
      });
      await page.getByRole("button", { name: "スキルを分析・改善する" }).click();
      await page.waitForSelector('[data-testid="skill-analysis-view"]', {
        timeout: 20_000,
      });
      await page.waitForSelector('text=選択を適用', { timeout: 20_000 });
      await wait(300);
      await captureImage(page, "TC-11-03-skill-analysis-from-agent-light.png");
      const headerText = await page.locator('[data-testid="skill-analysis-view"] h1').textContent();
      metadata.push({
        tcId: "TC-11-03",
        url,
        file: "TC-11-03-skill-analysis-from-agent-light.png",
        headerText,
        capturedAt: new Date().toISOString(),
      });
      await context.close();
    }

    {
      const { context, page, url } = await openHarnessPage(
        browser,
        "analysis",
        "light",
      );
      await page.waitForSelector('[data-testid="skill-analysis-view"]', {
        timeout: 20_000,
      });
      await page.waitForSelector('text=選択を適用', { timeout: 20_000 });
      await page.getByRole("button", { name: "エージェントに戻る" }).click();
      await page.waitForSelector('[data-testid="agent-view"]', {
        timeout: 20_000,
      });
      await page.waitForSelector('[aria-label="スキル改善提案"]', {
        timeout: 20_000,
      });
      await wait(300);
      await captureImage(page, "TC-11-04-agent-return-from-analysis-light.png");
      const selected = await page.getByRole("radio", { name: "skill-alpha" }).getAttribute("aria-checked");
      metadata.push({
        tcId: "TC-11-04",
        url,
        file: "TC-11-04-agent-return-from-analysis-light.png",
        selectedSkillChecked: selected,
        capturedAt: new Date().toISOString(),
      });
      await context.close();
    }

    {
      const { context, page, url } = await openHarnessPage(
        browser,
        "analysis",
        "light",
      );
      await page.waitForSelector('[data-testid="skill-analysis-view"]', {
        timeout: 20_000,
      });
      await page.waitForSelector('text=エージェントで再実行', {
        timeout: 20_000,
      });
      await page.getByRole("button", { name: "エージェントで再実行" }).click();
      await page.waitForSelector('[data-testid="agent-view"]', {
        timeout: 20_000,
      });
      await page.waitForSelector('[aria-label="スキル改善提案"]', {
        timeout: 20_000,
      });
      await wait(300);
      await captureImage(page, "TC-11-05-agent-rerun-from-analysis-light.png");
      const selected = await page.getByRole("radio", { name: "skill-alpha" }).getAttribute("aria-checked");
      metadata.push({
        tcId: "TC-11-05",
        url,
        file: "TC-11-05-agent-rerun-from-analysis-light.png",
        selectedSkillChecked: selected,
        capturedAt: new Date().toISOString(),
      });
      await context.close();
    }

    {
      const { context, page, url } = await openHarnessPage(
        browser,
        "cta-visible",
        "dark",
      );
      await page.waitForSelector('[data-testid="agent-view"]', {
        timeout: 20_000,
      });
      await page.waitForSelector('[aria-label="スキル改善提案"]', {
        timeout: 20_000,
      });
      await wait(300);
      await captureImage(page, "TC-11-06-agent-cta-visible-dark.png");
      const theme = await page.evaluate(
        () => document.documentElement.getAttribute("data-theme"),
      );
      metadata.push({
        tcId: "TC-11-06",
        url,
        file: "TC-11-06-agent-cta-visible-dark.png",
        theme,
        capturedAt: new Date().toISOString(),
      });
      await context.close();
    }

    await browser.close();
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    console.log("Captured Task04 Phase 11 screenshots.");
  } finally {
    server.kill("SIGTERM");
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
