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
  "docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey",
);
const screenshotDir = path.join(workflowRoot, "outputs/phase-11/screenshots");
const boardPath = path.join(
  screenshotDir,
  "TC-11-00-created-skill-usage-review-board.png",
);
const metadataPath = path.join(
  screenshotDir,
  "TC-11-00-created-skill-usage-review-board.metadata.json",
);

const cards = [
  {
    id: "A",
    title: "作成直後に使う（Skill Center 入口）",
    source: path.join(
      repoRoot,
      "docs/30-workflows/completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-11/screenshots/TC-11-01-create-entry.png",
    ),
    note: "create entry の代表画面証跡（Task01）",
  },
  {
    id: "B",
    title: "あとから使う（Agent 入口）",
    source: path.join(
      repoRoot,
      "docs/30-workflows/completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-11/screenshots/TC-11-02-execute-entry.png",
    ),
    note: "execute entry の代表画面証跡（Task01）",
  },
  {
    id: "C",
    title: "履歴/改善への戻り（Improve 入口）",
    source: path.join(
      repoRoot,
      "docs/30-workflows/completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-11/screenshots/TC-11-03-improve-entry.png",
    ),
    note: "improve entry の代表画面証跡（Task01）",
  },
  {
    id: "D",
    title: "評価差分表示（desktop）",
    source: path.join(
      repoRoot,
      "docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-11/screenshots/TC-11-02-skill-analysis-delta-dark-desktop.png",
    ),
    note: "ScoreDelta 表示の代表証跡（Task04）",
  },
  {
    id: "E",
    title: "評価差分表示（mobile）",
    source: path.join(
      repoRoot,
      "docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-11/screenshots/TC-11-04-skill-analysis-delta-dark-mobile.png",
    ),
    note: "mobile 代表証跡（Task04）",
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
          <header class="card-head">
            <div>
              <p class="eyebrow">${escapeHtml(card.id)}</p>
              <h2>${escapeHtml(card.title)}</h2>
            </div>
            <p class="timestamp">${escapeHtml(card.capturedAt)}</p>
          </header>
          <img src="${card.dataUrl}" alt="${escapeHtml(card.title)}" />
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
    <title>TASK-SKILL-LIFECYCLE-05 Review Board</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f4f8fb;
        --panel: rgba(255, 255, 255, 0.94);
        --line: rgba(15, 23, 42, 0.12);
        --text: #172033;
        --muted: #5c6b7d;
        --accent: #0a6f80;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "SF Pro Display", "Helvetica Neue", sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(10, 111, 128, 0.18), transparent 32%),
          linear-gradient(180deg, #fbfdff 0%, var(--bg) 100%);
      }
      main {
        width: min(1780px, calc(100vw - 56px));
        margin: 0 auto;
        padding: 28px 0 40px;
      }
      header {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 18px;
      }
      h1 {
        margin: 0 0 8px;
        font-size: 34px;
        letter-spacing: -0.02em;
      }
      .summary {
        margin: 0;
        color: var(--muted);
        font-size: 15px;
        line-height: 1.65;
        max-width: 960px;
      }
      .stamp {
        min-width: 250px;
        padding: 14px 16px;
        border: 1px solid var(--line);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.78);
      }
      .stamp p {
        margin: 0;
        color: var(--muted);
        font-size: 12px;
      }
      .stamp strong {
        display: block;
        margin-top: 6px;
        font-size: 16px;
        color: var(--accent);
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }
      .card {
        padding: 12px;
        border-radius: 16px;
        border: 1px solid var(--line);
        background: var(--panel);
      }
      .card-head {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
      }
      .eyebrow {
        margin: 0 0 4px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: var(--accent);
      }
      .card h2 {
        margin: 0;
        font-size: 17px;
        letter-spacing: -0.01em;
      }
      .timestamp {
        margin: 0;
        font-size: 11px;
        text-align: right;
        color: var(--muted);
      }
      .card img {
        display: block;
        width: 100%;
        border-radius: 10px;
        border: 1px solid rgba(15, 23, 42, 0.11);
      }
      .note {
        margin: 9px 0 4px;
        font-size: 13px;
        color: var(--muted);
      }
      .source {
        margin: 0;
        font-size: 11px;
        color: #6b7280;
        word-break: break-all;
      }
      @media (max-width: 1400px) {
        .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <div>
          <h1>TASK-SKILL-LIFECYCLE-05 Visual Review Board</h1>
          <p class="summary">
            created skill usage journey（作成直後/あとから/履歴から再利用）と、評価差分表示の画面検証を再実施するため、
            既存 completed workflow の最新証跡を同一ボードへ集約した。
          </p>
        </div>
        <div class="stamp">
          <p>Captured At</p>
          <strong>${new Date().toISOString()}</strong>
          <p>workflow: step-04-seq-task-05-created-skill-usage-journey</p>
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
  await fs.mkdir(screenshotDir, { recursive: true });
  const loadedCards = await loadCards();
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({
      viewport: { width: 1880, height: 1280 },
      deviceScaleFactor: 1.3,
    });
    await page.setContent(renderHtml(loadedCards), { waitUntil: "load" });
    await page.screenshot({ path: boardPath, fullPage: true });
  } finally {
    await browser.close();
  }

  await fs.writeFile(
    metadataPath,
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        output: path.relative(repoRoot, boardPath),
        cards: loadedCards.map((card) => ({
          id: card.id,
          title: card.title,
          source: path.relative(repoRoot, card.source),
          sourceCapturedAt: card.capturedAt,
        })),
      },
      null,
      2,
    ),
    "utf8",
  );

  process.stdout.write(`captured review board: ${boardPath}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
