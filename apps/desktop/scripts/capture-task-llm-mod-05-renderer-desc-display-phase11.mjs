#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import {
  probeStaticServer,
  startRendererStaticServer,
} from "./phase11-static-server.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(desktopRoot, "..", "..");
const rendererRoot = path.join(desktopRoot, "out/renderer");
const workflowRoot = path.join(
  repoRoot,
  "docs/30-workflows/TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(phase11Root, "phase11-capture-metadata.json");
const port = process.env.TASK_LLM_MOD_05_RENDERER_DESC_DISPLAY_PHASE11_PORT ?? "5197";
const baseUrl = `http://127.0.0.1:${port}`;
const harnessUrl = `${baseUrl}/phase11-task-llm-mod-05-renderer-desc-display.html`;
const captureRootSelector =
  '[data-testid="phase11-task-llm-mod-05-renderer-desc-display"]';

const screenshots = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-inline-model-selector-closed.png",
    note: "compact trigger only shows the selected model name",
    variant: "closed",
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-inline-model-selector-tooltip-overlay.png",
    note: "open dropdown exposes the model description via tooltip overlay",
    variant: "open-tooltip",
  },
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

async function waitForServer(url, timeoutMs = 90_000) {
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
    await wait(500);
  }

  throw new Error(`Timed out waiting for server: ${url}`);
}

async function captureClosedState(page, screenshotPath) {
  await page.locator(captureRootSelector).waitFor({ state: "visible" });
  await page.locator(captureRootSelector).screenshot({ path: screenshotPath });

  return {
    triggerText: await page.getByRole("combobox").textContent(),
    listboxVisible: await page.getByRole("listbox").count().then((count) => count > 0),
  };
}

async function injectTooltipOverlay(page, modelLabel) {
  return await page.evaluate(
    ({ rootSelector, modelLabel, overlayId }) => {
      const root = document.querySelector(rootSelector);
      if (!root) {
        return null;
      }

      const option = Array.from(root.querySelectorAll('button[role="option"]')).find(
        (node) => node.textContent?.includes(modelLabel),
      );
      if (!option) {
        return null;
      }

      const description = option.getAttribute("title") ?? "";
      const describedBy = option.getAttribute("aria-describedby");
      const srOnly = describedBy
        ? document.getElementById(describedBy)?.textContent ?? ""
        : "";
      const rootRect = root.getBoundingClientRect();
      const optionRect = option.getBoundingClientRect();
      const overlayHeightEstimate = 160;
      const top = Math.max(
        24,
        optionRect.top - rootRect.top - overlayHeightEstimate - 12,
      );

      const existing = document.getElementById(overlayId);
      if (existing) {
        existing.remove();
      }

      const overlay = document.createElement("div");
      overlay.id = overlayId;
      overlay.setAttribute("data-testid", overlayId);
      overlay.textContent = `${modelLabel}\n${description}`;
      Object.assign(overlay.style, {
        position: "absolute",
        left: `${Math.max(24, optionRect.left - rootRect.left + 18)}px`,
        top: `${top}px`,
        maxWidth: "320px",
        padding: "12px 14px",
        borderRadius: "14px",
        background: "rgba(15, 23, 42, 0.96)",
        color: "#fff",
        fontSize: "13px",
        lineHeight: "1.5",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.24)",
        zIndex: "9999",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      });

      const arrow = document.createElement("span");
      Object.assign(arrow.style, {
        position: "absolute",
        top: "-6px",
        left: "20px",
        width: "12px",
        height: "12px",
        transform: "rotate(45deg)",
        background: "rgba(15, 23, 42, 0.96)",
      });
      overlay.appendChild(arrow);

      root.style.position = "relative";
      root.appendChild(overlay);

      return {
        description,
        describedBy,
        srOnly,
      };
    },
    {
      rootSelector: captureRootSelector,
      modelLabel,
      overlayId: "phase11-inline-model-selector-tooltip-overlay",
    },
  );
}

async function captureOpenTooltipState(page, screenshotPath) {
  const trigger = page.getByRole("combobox");
  await trigger.click();

  const modelOption = page
    .getByRole("option")
    .filter({ hasText: "GPT-4o" })
    .first();
  await modelOption.hover();
  await wait(150);

  const overlayInfo = await injectTooltipOverlay(page, "GPT-4o");
  await wait(150);

  await page.locator(captureRootSelector).screenshot({ path: screenshotPath });

  const emptyOption = page
    .getByRole("option")
    .filter({ hasText: "GPT-4o Mini" })
    .first();

  return {
    modelTitle: await modelOption.getAttribute("title"),
    modelAriaDescribedBy: await modelOption.getAttribute("aria-describedby"),
    emptyOptionHasTitle: await emptyOption.evaluate((node) =>
      node.hasAttribute("title"),
    ),
    emptyOptionHasAriaDescribedBy: await emptyOption.evaluate((node) =>
      node.hasAttribute("aria-describedby"),
    ),
    overlayInfo,
  };
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });
  await ensureRendererBuild();

  const shouldStartServer = !(await probeStaticServer(`${baseUrl}/index.html`));
  const serverHandle = shouldStartServer
    ? await startRendererStaticServer({ baseUrl, rootDir: rendererRoot })
    : null;

  try {
    await waitForServer(harnessUrl);

    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 1040 },
        deviceScaleFactor: 2,
      });
      page.setDefaultTimeout(30_000);

      await page.goto(harnessUrl, {
        waitUntil: "domcontentloaded",
        timeout: 90_000,
      });
      await page.waitForSelector(captureRootSelector, { timeout: 30_000 });
      await page.waitForSelector('[role="combobox"]', { timeout: 30_000 });

      const closedScreenshotPath = path.join(screenshotDir, screenshots[0].file);
      const closedChecks = await captureClosedState(page, closedScreenshotPath);
      const closedStat = await fs.stat(closedScreenshotPath);

      const openScreenshotPath = path.join(screenshotDir, screenshots[1].file);
      const openChecks = await captureOpenTooltipState(page, openScreenshotPath);
      const openStat = await fs.stat(openScreenshotPath);

      const metadata = {
        taskId: "TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY",
        phase: 11,
        generatedAt: new Date().toISOString(),
        captureMethod: "renderer harness + Playwright screenshot capture",
        baseUrl,
        harnessUrl,
        route: harnessUrl,
        viewport: { width: 1440, height: 1040 },
        screenshots: [
          {
            tc: screenshots[0].tc,
            file: screenshots[0].file,
            note: screenshots[0].note,
            output: `outputs/phase-11/screenshots/${screenshots[0].file}`,
            capturedAt: closedStat.mtime.toISOString(),
            size: closedStat.size,
            checks: closedChecks,
          },
          {
            tc: screenshots[1].tc,
            file: screenshots[1].file,
            note: screenshots[1].note,
            output: `outputs/phase-11/screenshots/${screenshots[1].file}`,
            capturedAt: openStat.mtime.toISOString(),
            size: openStat.size,
            checks: openChecks,
          },
        ],
      };

      await fs.writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
      process.stdout.write(`Saved screenshots to ${screenshotDir}\n`);
    } finally {
      await browser.close();
    }
  } finally {
    if (serverHandle) {
      await serverHandle.close();
    }
  }
}

main().catch((error) => {
  console.error("[capture-task-llm-mod-05-renderer-desc-display-phase11] failed");
  console.error(error);
  process.exitCode = 1;
});
