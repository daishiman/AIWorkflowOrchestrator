#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import {
  probeStaticServer,
  startRendererStaticServer,
} from "./phase11-static-server.mjs";

const repoRoot = path.resolve(".");
const desktopRoot = path.join(repoRoot, "apps/desktop");
const rendererRoot = path.join(desktopRoot, "out/renderer");
const workflowRoot = path.join(
  repoRoot,
  "docs/30-workflows/completed-tasks/execution-status-type-spec-sync",
);
const screenshotDir = path.join(workflowRoot, "outputs/phase-11/screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const port = process.env.EXECUTION_STATUS_TYPE_SPEC_SYNC_PHASE11_PORT ?? "4187";
const baseUrl = `http://127.0.0.1:${port}`;
const route = "/phase11-execution-status-type-spec-sync.html?theme=light";

const scenarios = [
  {
    tc: "TC-11-01",
    selector: "[data-testid='phase11-status-review']",
    file: "TC-11-01-status-review.png",
    description: "review 状態のラベルと配色を確認する",
  },
  {
    tc: "TC-11-02",
    selector: "[data-testid='phase11-status-improve-ready']",
    file: "TC-11-02-status-improve-ready.png",
    description: "improve_ready 状態のラベルと配色を確認する",
  },
  {
    tc: "TC-11-03",
    selector: "[data-testid='phase11-status-reuse-ready']",
    file: "TC-11-03-status-reuse-ready.png",
    description: "reuse_ready 状態のラベルと配色を確認する",
  },
  {
    tc: "TC-11-04",
    selector: "main",
    file: "TC-11-04-status-review-board.png",
    description: "3状態を並べた review board を確認する",
  },
];

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      env: process.env,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} failed with code ${code}`));
    });
  });
}

async function ensureRendererBuild() {
  await runCommand("pnpm", ["--filter", "@repo/desktop", "build"], repoRoot);
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });
  await ensureRendererBuild();

  let serverHandle = null;
  if (!(await probeStaticServer(`${baseUrl}/index.html`))) {
    serverHandle = await startRendererStaticServer({
      baseUrl,
      rootDir: rendererRoot,
    });
  }

  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({
      viewport: { width: 1600, height: 1180 },
      colorScheme: "light",
    });

    await page.goto(`${baseUrl}${route}`, {
      waitUntil: "networkidle",
    });
    await page.locator("[data-testid='phase11-status-review']").waitFor();

    const captured = [];
    for (const scenario of scenarios) {
      const locator = page.locator(scenario.selector);
      await locator.waitFor();
      const outputPath = path.join(screenshotDir, scenario.file);
      await locator.screenshot({ path: outputPath });
      const stat = await fs.stat(outputPath);
      captured.push({
        tc: scenario.tc,
        file: scenario.file,
        description: scenario.description,
        selector: scenario.selector,
        size: stat.size,
      });
    }

    await fs.writeFile(
      metadataPath,
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          captureMethod: "current-renderer-entry",
          baseUrl,
          route,
          sourceFiles: [
            "apps/desktop/src/renderer/phase11-execution-status-type-spec-sync.html",
            "apps/desktop/src/renderer/phase11-execution-status-type-spec-sync.tsx",
            "packages/shared/src/types/skill.ts",
            "apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx",
            "apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx",
          ],
          scenarios: captured,
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
}

main().catch((error) => {
  console.error("[capture-execution-status-type-spec-sync-phase11]", error);
  process.exitCode = 1;
});
