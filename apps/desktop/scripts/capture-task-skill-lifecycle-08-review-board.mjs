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
  "docs/30-workflows/skill-lifecycle-unification/tasks/step-06-seq-task-08-skill-publishing-version-compatibility",
);
const screenshotDir = path.join(workflowRoot, "outputs/phase-11/screenshots");

const cards = [
  {
    id: "ENTRY-01",
    title: "作成直後の利用導線",
    note: "Task01 の Skill Center entry 画面",
    source: path.join(
      repoRoot,
      "docs/30-workflows/completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-11/screenshots/TC-11-01-create-entry.png",
    ),
    lane: "publishing",
  },
  {
    id: "ENTRY-02",
    title: "あとから利用導線",
    note: "Task01 の Agent entry 画面",
    source: path.join(
      repoRoot,
      "docs/30-workflows/completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-11/screenshots/TC-11-02-execute-entry.png",
    ),
    lane: "publishing",
  },
  {
    id: "COMP-01",
    title: "評価差分・公開判定参照",
    note: "Task04 の ScoreDelta 表示",
    source: path.join(
      repoRoot,
      "docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-11/screenshots/TC-11-02-skill-analysis-delta-dark-desktop.png",
    ),
    lane: "compatibility",
  },
  {
    id: "FLOW-01",
    title: "作成済みスキル利用フロー",
    note: "Task05 の created usage flow",
    source: path.join(
      repoRoot,
      "docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/outputs/phase-11/screenshots/TC-11-01-created-immediate-use-entry.png",
    ),
    lane: "compatibility",
  },
  {
    id: "SAFE-01",
    title: "安全性ゲート契約",
    note: "Task06 の safety gate contract",
    source: path.join(
      repoRoot,
      "docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-11/screenshots/TC-05-safety-gate-contract.png",
    ),
    lane: "safety",
  },
  {
    id: "SAFE-02",
    title: "権限状態遷移",
    note: "Task06 の permission transition",
    source: path.join(
      repoRoot,
      "docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-11/screenshots/TC-03-permission-state-transition.png",
    ),
    lane: "safety",
  },
];

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function loadCards(selectedLane = null) {
  const targets = selectedLane
    ? cards.filter((card) => card.lane === selectedLane)
    : cards;

  return Promise.all(
    targets.map(async (card) => {
      const buffer = await fs.readFile(card.source);
      const stat = await fs.stat(card.source);
      return {
        ...card,
        capturedAt: stat.mtime.toISOString(),
        relativeSource: path.relative(repoRoot, card.source),
        dataUrl: `data:image/png;base64,${buffer.toString("base64")}`,
      };
    }),
  );
}

function renderHtml({ title, subtitle, loadedCards }) {
  const cardHtml = loadedCards
    .map(
      (card) => `
        <article class="card">
          <header>
            <p class="id">${escapeHtml(card.id)}</p>
            <h2>${escapeHtml(card.title)}</h2>
            <p class="time">${escapeHtml(card.capturedAt)}</p>
          </header>
          <img src="${card.dataUrl}" alt="${escapeHtml(card.title)}" />
          <p class="note">${escapeHtml(card.note)}</p>
          <p class="src">${escapeHtml(card.relativeSource)}</p>
        </article>
      `,
    )
    .join("\n");

  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        --bg: #f6f7fb;
        --panel: #ffffff;
        --line: #d6d8e1;
        --text: #101321;
        --muted: #5d6478;
        --accent: #005f73;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "SF Pro Display", "Hiragino Kaku Gothic ProN", sans-serif;
        color: var(--text);
        background: radial-gradient(circle at 10% 0%, #e8f6ff 0, transparent 35%), var(--bg);
      }
      main {
        width: min(1880px, calc(100vw - 40px));
        margin: 0 auto;
        padding: 24px 0 36px;
      }
      h1 {
        margin: 0;
        font-size: 34px;
        letter-spacing: -0.02em;
      }
      .subtitle {
        margin: 10px 0 18px;
        color: var(--muted);
        font-size: 15px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }
      .card {
        border: 1px solid var(--line);
        background: var(--panel);
        border-radius: 14px;
        padding: 12px;
      }
      .id {
        margin: 0;
        color: var(--accent);
        font-size: 11px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      h2 {
        margin: 2px 0 4px;
        font-size: 18px;
      }
      .time {
        margin: 0 0 10px;
        font-size: 11px;
        color: var(--muted);
      }
      img {
        width: 100%;
        border-radius: 10px;
        border: 1px solid #cfd3df;
        display: block;
      }
      .note {
        margin: 10px 0 4px;
        color: var(--muted);
        font-size: 13px;
      }
      .src {
        margin: 0;
        color: #6f7381;
        font-size: 11px;
        word-break: break-all;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(title)}</h1>
      <p class="subtitle">${escapeHtml(subtitle)}</p>
      <section class="grid">${cardHtml}</section>
    </main>
  </body>
</html>`;
}

async function capture({ fileName, title, subtitle, lane = null }) {
  const loadedCards = await loadCards(lane);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1280 } });
    await page.setContent(renderHtml({ title, subtitle, loadedCards }), {
      waitUntil: "load",
    });
    await page.screenshot({
      path: path.join(screenshotDir, fileName),
      fullPage: true,
    });
  } finally {
    await browser.close();
  }
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });

  await capture({
    fileName: "TC-11-01-skill-publishing-visual-review-board.png",
    title: "TASK-SKILL-LIFECYCLE-08 Visual Review Board",
    subtitle:
      "公開導線・互換性判定・安全性ゲートの既存UI証跡を再撮影し、TASK-08設計成果物との整合を確認する。",
  });

  await capture({
    fileName: "TC-11-02-publishing-and-compatibility-focus.png",
    title: "TASK-SKILL-LIFECYCLE-08 Publishing & Compatibility Focus",
    subtitle:
      "公開レベル導線と互換性判定の画面証跡に限定して再検証する。",
    lane: "compatibility",
  });

  await capture({
    fileName: "TC-11-03-safety-gate-and-permission-focus.png",
    title: "TASK-SKILL-LIFECYCLE-08 Safety Gate & Permission Focus",
    subtitle:
      "公開前安全性チェックと権限状態遷移の画面証跡を再検証する。",
    lane: "safety",
  });

  const metadata = {
    capturedAt: new Date().toISOString(),
    workflow: path.relative(repoRoot, workflowRoot),
    outputs: [
      "TC-11-01-skill-publishing-visual-review-board.png",
      "TC-11-02-publishing-and-compatibility-focus.png",
      "TC-11-03-safety-gate-and-permission-focus.png",
    ],
    sources: cards.map((card) => ({
      id: card.id,
      lane: card.lane,
      source: path.relative(repoRoot, card.source),
    })),
  };

  await fs.writeFile(
    path.join(screenshotDir, "TC-11-00-task08-review-metadata.json"),
    `${JSON.stringify(metadata, null, 2)}\n`,
    "utf8",
  );

  console.log("captured", metadata.outputs.length, "screenshots");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
