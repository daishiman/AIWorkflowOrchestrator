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
  "docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "visual-review-metadata.json");
const boardPath = path.join(
  screenshotDir,
  "UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001_workspace-review-board_2026-03-12.png",
);

const cards = [
  {
    id: "04A",
    title: "Workspace Layout Foundation",
    note: "3 pane layout / hierarchy / file-browser balance",
    source: path.join(
      repoRoot,
      "docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/outputs/phase-11/screenshots/TC-11-02-3-pane-dark.png",
    ),
  },
  {
    id: "04B",
    title: "Workspace Chat Panel",
    note: "file chip / mention / input hierarchy",
    source: path.join(
      repoRoot,
      "docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/outputs/phase-11/screenshots/TC-11-03-file-chip-attached.png",
    ),
  },
  {
    id: "04C",
    title: "Workspace Preview Quick Search",
    note: "preview + modal layering / search affordance",
    source: path.join(
      repoRoot,
      "docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/outputs/phase-11/screenshots/TC-11-04-quick-search-dialog.png",
    ),
  },
  {
    id: "Mobile",
    title: "Workspace Mobile Overlay",
    note: "narrow viewport overlay / touch-first readability",
    source: path.join(
      repoRoot,
      "docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/outputs/phase-11/screenshots/TC-11-05-mobile-overlay.png",
    ),
  },
];

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function loadCards() {
  return Promise.all(
    cards.map(async (card) => {
      const buffer = await fs.readFile(card.source);
      const stat = await fs.stat(card.source);
      return {
        ...card,
        capturedAt: stat.mtime.toISOString(),
        dataUrl: `data:image/png;base64,${buffer.toString("base64")}`,
      };
    }),
  );
}

function renderHtml(loadedCards) {
  const cardHtml = loadedCards
    .map(
      (card) => `
        <article class="card">
          <div class="card-head">
            <div>
              <p class="eyebrow">${escapeHtml(card.id)}</p>
              <h2>${escapeHtml(card.title)}</h2>
            </div>
            <p class="timestamp">${escapeHtml(card.capturedAt)}</p>
          </div>
          <img alt="${escapeHtml(card.title)}" src="${card.dataUrl}" />
          <p class="note">${escapeHtml(card.note)}</p>
          <p class="source">${escapeHtml(path.relative(repoRoot, card.source))}</p>
        </article>
      `,
    )
    .join("\n");

  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>Workspace Parent Reference Sweep Guard Visual Review</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #eef2f4;
        --panel: rgba(255, 255, 255, 0.92);
        --line: rgba(15, 23, 42, 0.12);
        --text: #14213d;
        --muted: #52606d;
        --accent: #0f6a7b;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: "SF Pro Display", "Helvetica Neue", sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(15, 106, 123, 0.16), transparent 28%),
          linear-gradient(180deg, #f7fafb 0%, var(--bg) 100%);
      }
      main {
        width: min(1500px, calc(100vw - 64px));
        margin: 0 auto;
        padding: 40px 0 56px;
      }
      header {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        align-items: end;
        margin-bottom: 28px;
      }
      h1 {
        margin: 0 0 10px;
        font-size: 38px;
        line-height: 1.08;
        letter-spacing: -0.03em;
      }
      .summary {
        max-width: 880px;
        margin: 0;
        color: var(--muted);
        font-size: 17px;
        line-height: 1.7;
      }
      .stamp {
        min-width: 240px;
        padding: 18px 20px;
        border: 1px solid var(--line);
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.74);
        box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
      }
      .stamp p {
        margin: 0;
        color: var(--muted);
        font-size: 13px;
      }
      .stamp strong {
        display: block;
        margin-top: 8px;
        font-size: 18px;
        color: var(--accent);
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 24px;
      }
      .card {
        padding: 18px;
        border-radius: 28px;
        border: 1px solid var(--line);
        background: var(--panel);
        box-shadow: 0 24px 50px rgba(15, 23, 42, 0.08);
        backdrop-filter: blur(14px);
      }
      .card-head {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: start;
        margin-bottom: 14px;
      }
      .eyebrow {
        margin: 0 0 6px;
        font-size: 12px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--accent);
      }
      .card h2 {
        margin: 0;
        font-size: 21px;
        letter-spacing: -0.02em;
      }
      .timestamp {
        margin: 0;
        max-width: 180px;
        color: var(--muted);
        font-size: 12px;
        line-height: 1.5;
        text-align: right;
      }
      .card img {
        display: block;
        width: 100%;
        border-radius: 20px;
        border: 1px solid rgba(15, 23, 42, 0.1);
      }
      .note {
        margin: 14px 0 6px;
        font-size: 14px;
        line-height: 1.6;
      }
      .source {
        margin: 0;
        color: var(--muted);
        font-size: 12px;
        line-height: 1.5;
        word-break: break-all;
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <div>
          <h1>Workspace Parent Reference Sweep Guard</h1>
          <p class="summary">
            docs-only parent workflow の再監査として、Workspace 04A / 04B / 04C の representative UI
            surface を current branch 上で再確認するための visual review board。
            child workflow の最新 evidence を集約し、Apple UI/UX 観点で hierarchy / spacing / modal layering / mobile overlay を見直す。
          </p>
        </div>
        <div class="stamp">
          <p>Captured</p>
          <strong>2026-03-12</strong>
          <p>workflow: workspace-parent-reference-sweep-guard</p>
        </div>
      </header>
      <section class="grid">
        ${cardHtml}
      </section>
    </main>
  </body>
</html>`;
}

async function main() {
  const loadedCards = await loadCards();
  await fs.mkdir(screenshotDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({
      viewport: { width: 1600, height: 1800 },
      deviceScaleFactor: 1.5,
    });
    await page.setContent(renderHtml(loadedCards), {
      waitUntil: "load",
    });
    await page.screenshot({
      path: boardPath,
      fullPage: true,
    });

    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          output: path.relative(repoRoot, boardPath),
          cards: loadedCards.map((card) => ({
            id: card.id,
            title: card.title,
            note: card.note,
            source: path.relative(repoRoot, card.source),
            capturedAt: card.capturedAt,
          })),
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(
    "[capture-workspace-parent-reference-sweep-guard-review-board] failed",
    error,
  );
  process.exitCode = 1;
});
