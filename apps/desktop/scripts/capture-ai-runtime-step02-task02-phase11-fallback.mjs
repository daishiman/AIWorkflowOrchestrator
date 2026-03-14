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
  "docs/30-workflows/ai-runtime-authmode-unification/tasks/step-02-par-task-02-workspace-chat-edit-runtime-activation",
);
const phase11Root = path.join(workflowRoot, "outputs", "phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");

const captures = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-chat-edit-selection.png",
    title: "Selection Ready Contract Review",
    summary:
      "selection と context が有効な状態で action bar と summary panel が成立するかを確認",
    docs: [
      {
        relativePath:
          "outputs/phase-2/ui-ux-realization.md",
        keyword: "1-A. Editor Selection Action Bar",
      },
      {
        relativePath:
          "outputs/phase-2/ui-ux-realization.md",
        keyword: "1-B. Context Summary Panel",
      },
    ],
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-chat-edit-handoff.png",
    title: "Missing API Key / Handoff Contract Review",
    summary:
      "integrated runtime 不可時に handoff guidance を返す fail-fast 境界を確認",
    docs: [
      {
        relativePath:
          "outputs/phase-2/ui-ux-realization.md",
        keyword: "1-D. Inline Guidance Block",
      },
      {
        relativePath: "outputs/phase-2/contract-matrix.md",
        keyword: "RuntimeResolver",
      },
    ],
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-chat-edit-diff-preview.png",
    title: "Diff Preview Contract Review",
    summary:
      "diff-ready から apply/cancel へ遷移する UI 契約の整合を確認",
    docs: [
      {
        relativePath:
          "outputs/phase-2/ui-ux-realization.md",
        keyword: "1-C. Diff Preview Panel",
      },
      {
        relativePath:
          "outputs/phase-2/design-summary.md",
        keyword: "状態遷移",
      },
    ],
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

async function readSnippet(relativePath, keyword) {
  const absPath = path.join(workflowRoot, relativePath);
  const raw = await fs.readFile(absPath, "utf8");
  const lines = raw.split(/\r?\n/);
  const idx = lines.findIndex((line) => line.includes(keyword));
  const start = idx >= 0 ? Math.max(0, idx - 5) : 0;
  const end = idx >= 0 ? Math.min(lines.length, idx + 12) : Math.min(lines.length, 12);
  const snippet = lines.slice(start, end).join("\n");
  return {
    relativePath,
    keyword,
    snippet,
  };
}

function renderHtml({ tc, title, summary, snippets }) {
  const snippetBlocks = snippets
    .map((item) => {
      const source = escapeHtml(item.relativePath);
      const keyword = escapeHtml(item.keyword);
      const body = escapeHtml(item.snippet);
      return `
        <section class="snippet">
          <p class="source"><strong>Source:</strong> ${source}</p>
          <p class="keyword"><strong>Anchor:</strong> ${keyword}</p>
          <pre>${body}</pre>
        </section>
      `;
    })
    .join("\n");

  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(tc)}</title>
    <style>
      body {
        margin: 0;
        background: #f5f7fb;
        color: #0f172a;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .frame {
        max-width: 1560px;
        margin: 0 auto;
        padding: 24px;
        display: grid;
        gap: 16px;
      }
      .header {
        border: 1px solid #d6dbe5;
        border-radius: 14px;
        background: #ffffff;
        padding: 16px;
      }
      .title {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
      }
      .subtitle {
        margin: 8px 0 0;
        color: #475569;
        font-size: 14px;
      }
      .meta {
        border: 1px solid #d6dbe5;
        border-radius: 14px;
        background: #ffffff;
        padding: 14px 16px;
        font-size: 13px;
        color: #334155;
      }
      .snippet {
        border: 1px solid #d6dbe5;
        border-radius: 14px;
        background: #ffffff;
        padding: 14px 16px;
      }
      .source,
      .keyword {
        margin: 0 0 8px;
        font-size: 12px;
        color: #334155;
      }
      pre {
        margin: 0;
        padding: 12px;
        border-radius: 10px;
        border: 1px solid #cfd6e3;
        background: #f8fafc;
        color: #1e293b;
        font-size: 12px;
        line-height: 1.5;
        white-space: pre-wrap;
        word-break: break-word;
      }
    </style>
  </head>
  <body>
    <main class="frame" data-testid="phase11-chat-edit-review-board">
      <header class="header">
        <h1 class="title">${escapeHtml(tc)} / ${escapeHtml(title)}</h1>
        <p class="subtitle">${escapeHtml(summary)}</p>
      </header>
      <section class="meta">
        Capture mode: fallback review board (design-doc based)<br />
        Reason: electron-vite dev capture unavailable (esbuild platform mismatch)
      </section>
      ${snippetBlocks}
    </main>
  </body>
</html>`;
}

async function run() {
  await fs.mkdir(screenshotDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
  const captured = [];

  try {
    for (const item of captures) {
      const snippets = [];
      for (const spec of item.docs) {
        snippets.push(await readSnippet(spec.relativePath, spec.keyword));
      }

      await page.setContent(
        renderHtml({
          tc: item.tc,
          title: item.title,
          summary: item.summary,
          snippets,
        }),
        { waitUntil: "load" },
      );
      await page.getByTestId("phase11-chat-edit-review-board").waitFor();
      await page.waitForTimeout(120);

      const outputPath = path.join(screenshotDir, item.file);
      await page.screenshot({ path: outputPath, fullPage: true });
      captured.push({
        tc: item.tc,
        file: item.file,
        title: item.title,
        sources: item.docs.map((doc) => doc.relativePath),
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
        reason: "electron-vite dev capture unavailable due esbuild platform mismatch",
        workflowRoot: path.relative(repoRoot, workflowRoot),
        screenshots: captured,
      },
      null,
      2,
    ),
  );

  process.stdout.write(
    `[capture-ai-runtime-step02-task02-phase11-fallback] captured ${captured.length} screenshots in ${screenshotDir}\n`,
  );
}

run().catch((error) => {
  console.error("[capture-ai-runtime-step02-task02-phase11-fallback] failed", error);
  process.exit(1);
});
