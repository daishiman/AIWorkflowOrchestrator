import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, "..", "..", "..");
const desktopRoot = path.join(repoRoot, "apps/desktop");
const workflowRoot = path.join(
  repoRoot,
  "docs/30-workflows/completed-tasks/step-02-par-task-03-skill-creator-execute-improve-integration",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const baseUrl = "http://127.0.0.1:4173/phase11-skill-management-panel.html";
const nodeBin = "/opt/homebrew/bin/node";
const useExternalServer = process.env.PHASE11_CAPTURE_EXTERNAL_SERVER === "1";

async function resolveViteBin() {
  const pnpmRoot = path.join(repoRoot, "node_modules/.pnpm");
  const entries = await fs.readdir(pnpmRoot, { withFileTypes: true });
  const viteEntries = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("vite@"))
    .map((entry) => entry.name)
    .sort((left, right) => right.localeCompare(left));

  for (const entry of viteEntries) {
    const candidate = path.join(
      pnpmRoot,
      entry,
      "node_modules/vite/bin/vite.js",
    );
    try {
      await fs.access(candidate);
      return candidate;
    } catch {}
  }

  throw new Error("vite binary を解決できませんでした");
}

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

async function capture() {
  await fs.mkdir(screenshotDir, { recursive: true });
  const viteBin = useExternalServer ? null : await resolveViteBin();

  const server = useExternalServer
    ? null
    : spawn(
        nodeBin,
        [
          viteBin,
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
    await waitForServer(`${baseUrl}?theme=light`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 960 },
      colorScheme: "light",
    });
    const page = await context.newPage();

    await page.goto(`${baseUrl}?theme=light`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await page.waitForSelector("[data-testid='phase11-skill-management-harness']");
    await page.fill(
      "[data-testid='skill-lifecycle-prompt']",
      "Issue を整理して task 仕様書まで生成するスキルを作りたい",
    );
    await page.waitForFunction(() => {
      const element = document.querySelector(
        "[data-testid='skill-lifecycle-mode-hint']",
      );
      return element?.textContent?.includes("create");
    });
    await page.screenshot({
      path: path.join(screenshotDir, "tc-11-01-start.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: /^作成する$/ }).click();
    await page.waitForFunction(() => {
      const created = document.querySelector(
        "[data-testid='skill-lifecycle-created-skill']",
      );
      return created?.textContent?.includes("new-skill");
    });
    await page.screenshot({
      path: path.join(screenshotDir, "tc-11-01-created.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: /^実行する$/ }).click();
    await page.waitForFunction(() => {
      return document.body.textContent?.includes("実行が完了しました");
    });
    await page.screenshot({
      path: path.join(screenshotDir, "tc-11-02-executed.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: /^全自動改善$/ }).click();
    await page.waitForFunction(() => {
      return document.body.textContent?.includes("総合スコア: 92");
    });
    await page.screenshot({
      path: path.join(screenshotDir, "tc-11-03-improved.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: "詳細設定で作成する" }).click();
    await page.waitForSelector("[data-testid='skill-management-panel-create-view']");
    await page.screenshot({
      path: path.join(screenshotDir, "tc-11-04-wizard.png"),
      fullPage: true,
    });

    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          screenshots: [
            "tc-11-01-start.png",
            "tc-11-01-created.png",
            "tc-11-02-executed.png",
            "tc-11-03-improved.png",
            "tc-11-04-wizard.png",
          ],
          route: `${baseUrl}?theme=light`,
        },
        null,
        2,
      ),
      "utf-8",
    );

    await context.close();
    await browser.close();
  } finally {
    server?.kill("SIGTERM");
  }
}

capture().catch((error) => {
  console.error("[capture-task-skill-creator-lifecycle-phase11] failed", error);
  process.exitCode = 1;
});
