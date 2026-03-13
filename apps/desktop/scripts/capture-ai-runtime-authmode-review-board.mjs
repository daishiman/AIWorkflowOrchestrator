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
  "docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation",
);
const screenshotDir = path.join(workflowRoot, "outputs/phase-11/screenshots");
const outputPath = path.join(
  screenshotDir,
  "TC-11-00-settings-authmode-review-board.png",
);
const metadataPath = path.join(
  screenshotDir,
  "TC-11-00-settings-authmode-review-board.metadata.json",
);

const cards = [
  {
    id: "Block-1",
    title: "認証方式カード",
    note: "Claude Agent SDK 認証方式（サブスクリプション/APIキー）の状態整合を確認。",
    source: path.join(screenshotDir, "TC-11-01-access-card-sync.png"),
  },
  {
    id: "Block-2",
    title: "Claude Agent SDK APIキー",
    note: "APIキー不足時の guidance と状態表示の整合を確認。",
    source: path.join(screenshotDir, "TC-11-02-runtime-missing-api-key.png"),
  },
  {
    id: "Block-3",
    title: "Terminal / Provider 状態",
    note: "terminal unavailable 表示と provider 行の補助判読を確認。",
    source: path.join(screenshotDir, "TC-11-03-terminal-unavailable.png"),
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
  const rendered = loadedCards
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
    <title>AI Runtime/AuthMode Settings Review Board</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #0b1220;
        --panel: rgba(17, 24, 39, 0.85);
        --line: rgba(148, 163, 184, 0.28);
        --text: #f8fafc;
        --muted: #cbd5e1;
        --accent: #38bdf8;
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
          radial-gradient(circle at top right, rgba(56, 189, 248, 0.24), transparent 35%),
          linear-gradient(180deg, #050a14 0%, var(--bg) 100%);
      }
      main {
        width: min(1700px, calc(100vw - 48px));
        margin: 0 auto;
        padding: 28px 0 34px;
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
        letter-spacing: -0.03em;
      }
      .summary {
        margin: 0;
        color: var(--muted);
        font-size: 15px;
        line-height: 1.7;
        max-width: 1000px;
      }
      .stamp {
        min-width: 250px;
        padding: 14px 16px;
        border: 1px solid var(--line);
        border-radius: 16px;
        background: rgba(15, 23, 42, 0.68);
      }
      .stamp p {
        margin: 0;
        font-size: 12px;
        color: var(--muted);
      }
      .stamp strong {
        display: block;
        margin-top: 6px;
        color: var(--accent);
        font-size: 16px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
      }
      .card {
        padding: 12px;
        border-radius: 16px;
        border: 1px solid var(--line);
        background: var(--panel);
        backdrop-filter: blur(10px);
      }
      .card-head {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 10px;
      }
      .eyebrow {
        margin: 0 0 4px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--accent);
        font-size: 11px;
      }
      .card h2 {
        margin: 0;
        font-size: 18px;
        letter-spacing: -0.01em;
      }
      .timestamp {
        margin: 0;
        text-align: right;
        color: var(--muted);
        font-size: 11px;
        line-height: 1.4;
      }
      .card img {
        width: 100%;
        display: block;
        border-radius: 10px;
        border: 1px solid rgba(148, 163, 184, 0.25);
      }
      .note {
        margin: 10px 0 4px;
        color: var(--muted);
        font-size: 13px;
        line-height: 1.55;
      }
      .source {
        margin: 0;
        color: #94a3b8;
        font-size: 11px;
        line-height: 1.45;
        word-break: break-all;
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <div>
          <h1>Claude Agent SDK Settings Review Board</h1>
          <p class="summary">
            設定画面レビューの対象3領域（認証方式カード / Claude Agent SDK APIキー / APIキー設定一覧）を
            step-01 の実証跡から再確認するための review board。
          </p>
        </div>
        <div class="stamp">
          <p>Recaptured At</p>
          <strong>${new Date().toISOString()}</strong>
          <p>workflow: ai-runtime-authmode-unification / step-01</p>
        </div>
      </header>
      <section class="grid">
        ${rendered}
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
      viewport: { width: 1800, height: 1120 },
      deviceScaleFactor: 1.5,
    });

    await page.setContent(renderHtml(loadedCards), { waitUntil: "load" });
    await page.screenshot({ path: outputPath, fullPage: true });

    const stat = await fs.stat(outputPath);
    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          capturedAt: stat.mtime.toISOString(),
          output: path.relative(repoRoot, outputPath),
          cards: loadedCards.map((card) => ({
            id: card.id,
            source: path.relative(repoRoot, card.source),
            capturedAt: card.capturedAt,
          })),
        },
        null,
        2,
      ),
    );

    process.stdout.write(
      `[capture-ai-runtime-authmode-review-board] captured: ${outputPath}\n`,
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error("[capture-ai-runtime-authmode-review-board] failed", error);
  process.exit(1);
});
