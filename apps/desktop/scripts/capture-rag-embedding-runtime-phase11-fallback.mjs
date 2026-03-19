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
  "docs/30-workflows/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime",
);
const screenshotDir = path.join(workflowRoot, "outputs", "phase-11", "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");

const captures = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-rag-settings-guidance-review-board.png",
    title: "Settings / RAG Guidance Review Board",
    summary:
      "Settings 側の runtime health / guidance surface を参照し、current workflow の runtime rule と照合する。",
    sourceImage:
      "docs/30-workflows/completed-tasks/TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001/outputs/phase-11/screenshots/TC-11-03-settings-health-rag-guidance-rerun-20260317.png",
    refs: [
      {
        path: "apps/desktop/src/renderer/views/SettingsView/index.tsx",
        anchor: 'data-testid="auth-mode-status"',
      },
      {
        path: "apps/desktop/src/main/ipc/aiHandlers.ts",
        anchor: 'status: "disconnected"',
      },
      {
        path: ".claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md",
        anchor: "AI_CHECK_CONNECTION",
      },
    ],
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-ai-ipc-guidance-review-board.png",
    title: "AI IPC Guidance Contract Review Board",
    summary:
      "AI_CHECK_CONNECTION / AI_INDEX の legacy guidance 契約を、実装・型定義・仕様書の3層で確認する。",
    sourceImage:
      "docs/30-workflows/completed-tasks/TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001/outputs/phase-11/screenshots/TC-11-01-settings-access-matrix-rerun-20260317.png",
    refs: [
      {
        path: "apps/desktop/src/main/ipc/aiHandlers.ts",
        anchor: "AI_INDEX は現在利用できません",
      },
      {
        path: "apps/desktop/src/preload/types.ts",
        anchor: "export interface AICheckConnectionResponse",
      },
      {
        path: ".claude/skills/aiworkflow-requirements/references/llm-ipc-types.md",
        anchor: "AIIndexResponse",
      },
    ],
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-community-guidance-review-board.png",
    title: "Community Guidance Review Board",
    summary:
      "communityHandlers の unavailable guidance を source screenshot と current contract review で確認する。",
    sourceImage:
      "docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-02-par-task-10-claude-code-terminal-surface/outputs/phase-11/screenshots/TC-11-03-terminal-unavailable-guidance.png",
    refs: [
      {
        path: "apps/desktop/src/main/ipc/communityHandlers.ts",
        anchor: "NOT_IN_SCOPE",
      },
      {
        path: "apps/desktop/src/preload/types.ts",
        anchor: "export interface CommunityResult<T>",
      },
      {
        path: ".claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md",
        anchor: "UT-RAG-08-001",
      },
    ],
  },
  {
    tc: "TC-11-04",
    file: "TC-11-04-graphrag-hybrid-review-board.png",
    title: "GraphRAG / HybridRAG Runtime Review Board",
    summary:
      "GraphRAG fallback、HybridRAGFactory の not-ready stub、CommunitySummarizer の partial failure を current workflow 配下で確認する。",
    refs: [
      {
        path: "packages/shared/src/services/search/graphrag-query-service.ts",
        anchor: "fallbackReason",
      },
      {
        path: "packages/shared/src/services/search/hybrid-rag-factory.ts",
        anchor: "FACTORY_NOT_READY",
      },
      {
        path: "packages/shared/src/services/graph/community-summarizer.ts",
        anchor: "Embedding generation failed",
      },
      {
        path: ".claude/skills/aiworkflow-requirements/references/rag-query-pipeline.md",
        anchor: "HybridRAGFactory",
      },
    ],
  },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function readSnippet(relPath, anchor) {
  const absPath = path.join(repoRoot, relPath);
  const raw = await fs.readFile(absPath, "utf8");
  const lines = raw.split(/\r?\n/);
  const index = lines.findIndex((line) => line.includes(anchor));
  const start = index >= 0 ? Math.max(0, index - 4) : 0;
  const end = index >= 0 ? Math.min(lines.length, index + 8) : Math.min(lines.length, 12);
  return {
    relPath,
    anchor,
    found: index >= 0,
    snippet: lines.slice(start, end).join("\n"),
  };
}

async function ensureFile(relPath) {
  const absPath = path.join(repoRoot, relPath);
  await fs.access(absPath);
  return absPath;
}

function buildHtml(capture, snippets, sourceFileUrl) {
  const sourceImage = sourceFileUrl
    ? `
      <section class="source-card">
        <p class="section-title">Source Evidence</p>
        <img src="${escapeHtml(sourceFileUrl)}" alt="source evidence" />
      </section>
    `
    : "";

  const snippetHtml = snippets
    .map(
      (item) => `
        <section class="snippet">
          <p class="meta"><strong>Source:</strong> ${escapeHtml(item.relPath)}</p>
          <p class="meta"><strong>Anchor:</strong> ${escapeHtml(item.anchor)} <span class="badge ${item.found ? "ok" : "ng"}">${item.found ? "FOUND" : "MISSING"}</span></p>
          <pre>${escapeHtml(item.snippet)}</pre>
        </section>
      `,
    )
    .join("\n");

  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(capture.tc)}</title>
    <style>
      body {
        margin: 0;
        background: #f5f7fb;
        color: #0f172a;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .page {
        max-width: 1680px;
        margin: 0 auto;
        padding: 24px;
        display: grid;
        gap: 16px;
      }
      .hero,
      .source-card,
      .snippet {
        background: #ffffff;
        border: 1px solid #d8e0ec;
        border-radius: 16px;
        padding: 16px;
      }
      .hero h1 {
        margin: 0;
        font-size: 26px;
      }
      .hero p {
        margin: 8px 0 0;
        color: #334155;
        line-height: 1.6;
      }
      .note {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        color: #1e3a8a;
        border-radius: 14px;
        padding: 12px 14px;
        font-size: 13px;
      }
      .section-title {
        margin: 0 0 12px;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #475569;
      }
      .source-card img {
        width: 100%;
        display: block;
        border-radius: 10px;
        border: 1px solid #d8e0ec;
      }
      .snippet .meta {
        margin: 0 0 8px;
        font-size: 12px;
        color: #334155;
      }
      pre {
        margin: 0;
        padding: 12px;
        border-radius: 12px;
        border: 1px solid #d8e0ec;
        background: #f8fafc;
        font-size: 12px;
        line-height: 1.5;
        white-space: pre-wrap;
        word-break: break-word;
      }
      .badge {
        display: inline-block;
        margin-left: 8px;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
      }
      .badge.ok {
        background: #dcfce7;
        color: #166534;
      }
      .badge.ng {
        background: #fee2e2;
        color: #991b1b;
      }
    </style>
  </head>
  <body>
    <main class="page" data-testid="rag-runtime-review-board">
      <section class="hero">
        <h1>${escapeHtml(capture.tc)} / ${escapeHtml(capture.title)}</h1>
        <p>${escapeHtml(capture.summary)}</p>
      </section>
      <section class="note">
        Capture mode: fallback review board. current build direct capture は esbuild native binary mismatch のため中止し、
        same-day upstream evidence と current workflow の契約 review board を組み合わせて証跡化した。
      </section>
      ${sourceImage}
      ${snippetHtml}
    </main>
  </body>
</html>`;
}

async function run() {
  await fs.mkdir(screenshotDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1680, height: 1180 } });
  const metadata = [];

  try {
    for (const capture of captures) {
      const snippets = [];
      for (const ref of capture.refs) {
        snippets.push(await readSnippet(ref.path, ref.anchor));
      }

      let sourceFileUrl = null;
      if (capture.sourceImage) {
        const sourceAbsPath = await ensureFile(capture.sourceImage);
        sourceFileUrl = pathToFileURL(sourceAbsPath).toString();
      }

      await page.setContent(buildHtml(capture, snippets, sourceFileUrl), {
        waitUntil: "load",
      });
      await page.getByTestId("rag-runtime-review-board").waitFor();
      await page.waitForTimeout(120);

      const outputPath = path.join(screenshotDir, capture.file);
      await page.screenshot({ path: outputPath, fullPage: true });

      metadata.push({
        tc: capture.tc,
        file: capture.file,
        sourceImage: capture.sourceImage ?? null,
        refs: capture.refs,
      });
      process.stdout.write(
        `[capture-rag-embedding-runtime-phase11-fallback] captured ${capture.tc}: ${capture.file}\n`,
      );
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
        reason: "current build capture blocked by esbuild native binary mismatch",
        workflowRoot: path.relative(repoRoot, workflowRoot),
        screenshots: metadata,
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  console.error("[capture-rag-embedding-runtime-phase11-fallback] failed", error);
  process.exit(1);
});
