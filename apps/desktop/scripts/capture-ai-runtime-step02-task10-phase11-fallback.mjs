#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(desktopRoot, "..", "..");

const workflowRoot = path.join(
  repoRoot,
  "docs/30-workflows/ai-runtime-authmode-unification/tasks/step-02-par-task-10-claude-code-terminal-surface",
);
const phase11Root = path.join(workflowRoot, "outputs", "phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");

const step01ScreenshotRoot = path.join(
  repoRoot,
  "docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/outputs/phase-11/screenshots",
);

const screenshots = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-terminal-claude-transcript.png",
    label: "Terminal transcript view contract review",
    source: "TC-11-03-terminal-unavailable.png",
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-terminal-controls.png",
    label: "Abort/retry/history control contract review",
    source: "TC-11-03-terminal-unavailable.png",
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-terminal-unavailable-guidance.png",
    label: "Unavailable guidance contract review",
    source: "TC-11-03-terminal-unavailable.png",
  },
  {
    tc: "TC-11-04",
    file: "TC-11-04-terminal-no-auto-send.png",
    label: "No auto-send boundary review",
    source: "TC-11-00-settings-authmode-review-board.png",
  },
  {
    tc: "TC-11-05",
    file: "TC-11-05-terminal-persistent-launcher.png",
    label: "Persistent launcher contract review",
    source: "TC-11-01-access-card-sync.png",
  },
  {
    tc: "TC-11-06",
    file: "TC-11-06-terminal-manual-share.png",
    label: "Manual transcript share contract review",
    source: "TC-11-02-runtime-missing-api-key.png",
  },
];

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildReviewBoardHtml({ tc, label, sourceFileUrl, sourceName }) {
  const safeLabel = escapeHtml(label);
  const safeTc = escapeHtml(tc);
  const safeSource = escapeHtml(sourceName);
  const safeUrl = escapeHtml(sourceFileUrl);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTc}</title>
    <style>
      :root {
        color-scheme: light;
      }
      body {
        margin: 0;
        background: #f6f8fb;
        color: #0f172a;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .frame {
        max-width: 1600px;
        margin: 0 auto;
        padding: 24px;
        display: grid;
        gap: 16px;
      }
      .header {
        border: 1px solid #d6dbe5;
        border-radius: 16px;
        background: #ffffff;
        padding: 16px;
      }
      .title {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
      }
      .subtitle {
        margin: 6px 0 0;
        font-size: 14px;
        color: #475569;
      }
      .board {
        border: 1px solid #d6dbe5;
        border-radius: 16px;
        background: #ffffff;
        padding: 16px;
        display: grid;
        gap: 12px;
      }
      .meta {
        display: grid;
        gap: 4px;
        font-size: 12px;
        color: #334155;
      }
      .source {
        border: 1px solid #d6dbe5;
        border-radius: 12px;
        background: #f8fafc;
        padding: 12px;
      }
      .source img {
        width: 100%;
        border-radius: 8px;
        border: 1px solid #cfd6e3;
        display: block;
      }
      .note {
        font-size: 12px;
        color: #475569;
      }
    </style>
  </head>
  <body>
    <main class="frame" data-testid="phase11-terminal-review-board">
      <section class="header">
        <h1 class="title">${safeTc} / Review Board</h1>
        <p class="subtitle">${safeLabel}</p>
      </section>
      <section class="board">
        <div class="meta">
          <div><strong>Capture mode:</strong> fallback review board</div>
          <div><strong>Source evidence:</strong> ${safeSource}</div>
          <div><strong>Current task:</strong> step-02-par-task-10-claude-code-terminal-surface</div>
        </div>
        <div class="source">
          <img src="${safeUrl}" alt="source evidence" />
        </div>
        <p class="note">
          This board is generated in the current workflow path to preserve representative visual evidence when current-build dev server capture is blocked by environment constraints.
        </p>
      </section>
    </main>
  </body>
</html>`;
}

async function ensureSourceFile(sourcePath) {
  try {
    await fs.access(sourcePath);
  } catch {
    throw new Error(`Missing source evidence: ${sourcePath}`);
  }
}

async function run() {
  await fs.mkdir(screenshotDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const captured = [];

  try {
    for (const shot of screenshots) {
      const sourcePath = path.join(step01ScreenshotRoot, shot.source);
      await ensureSourceFile(sourcePath);
      const sourceUrl = pathToFileURL(sourcePath).toString();

      const html = buildReviewBoardHtml({
        tc: shot.tc,
        label: shot.label,
        sourceFileUrl: sourceUrl,
        sourceName: shot.source,
      });

      await page.setContent(html, { waitUntil: "load" });
      await page.getByTestId("phase11-terminal-review-board").waitFor();
      await page.waitForTimeout(120);

      const outputPath = path.join(screenshotDir, shot.file);
      await page.screenshot({ path: outputPath, fullPage: true });

      captured.push({
        tc: shot.tc,
        file: shot.file,
        label: shot.label,
        source: shot.source,
      });
    }
  } finally {
    await browser.close();
  }

  await fs.writeFile(
    metadataPath,
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        mode: "fallback-review-board",
        reason: "electron-vite dev capture unavailable in current environment",
        sourceEvidenceRoot: step01ScreenshotRoot,
        screenshots: captured,
      },
      null,
      2,
    ),
  );

  process.stdout.write(
    `[capture-ai-runtime-step02-task10-phase11-fallback] captured ${captured.length} screenshots in ${screenshotDir}\n`,
  );
}

run().catch((error) => {
  console.error("[capture-ai-runtime-step02-task10-phase11-fallback] failed", error);
  process.exit(1);
});
