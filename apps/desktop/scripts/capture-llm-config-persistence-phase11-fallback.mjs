#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(desktopRoot, "..", "..");
const phase11Root = path.join(
  repoRoot,
  "docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-11",
);
const reviewBoardPath = path.join(phase11Root, "review-board.html");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");

const screenshots = [
  ["TC-11-01", "TC-11-01-persist-v2-valid-selection.png"],
  ["TC-11-02", "TC-11-02-invalid-provider-cleared.png"],
  ["TC-11-03", "TC-11-03-legacy-v1-normalized-to-v2.png"],
  ["TC-11-04", "TC-11-04-reload-retains-selected-config.png"],
];

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1600, height: 1200 },
      deviceScaleFactor: 2,
    });
    await page.goto(pathToFileURL(reviewBoardPath).toString(), {
      waitUntil: "load",
    });

    const records = [];
    for (const [testId, fileName] of screenshots) {
      const screenshotPath = path.join(screenshotDir, fileName);
      await page.locator(`[data-testid="${testId}"]`).screenshot({
        path: screenshotPath,
      });
      const stat = await fs.stat(screenshotPath);
      records.push({
        testId,
        fileName,
        capturedAt: stat.mtime.toISOString(),
        size: stat.size,
      });
    }

    await fs.writeFile(
      metadataPath,
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          captureMethod: "fallback-static-review-board",
          blocker:
            "primary electron-vite build blocked by esbuild architecture mismatch (@esbuild/darwin-arm64 with node x64)",
          sourceFiles: [
            "apps/desktop/src/renderer/phase11-llm-config-persistence.html",
            "apps/desktop/src/renderer/phase11-llm-config-persistence.tsx",
            "apps/desktop/scripts/capture-task-fix-llm-config-persistence-phase11.mjs",
          ],
          reviewBoard: "docs/30-workflows/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-11/review-board.html",
          screenshots: records,
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
