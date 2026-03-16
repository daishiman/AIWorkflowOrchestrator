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
  "docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-04-skill-docs-runtime-integration",
);
const phase11Root = path.join(workflowRoot, "outputs", "phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const planPath = path.join(phase11Root, "screenshot-plan.json");

const scenarios = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-skill-docs-success.png",
    title: "Skill Docs 生成成功導線",
    summary:
      "queryFn DI が stub ではなく LLMDocQueryAdapter 経路へ接続されていることをレビューする。",
    anchors: [
      {
        file: "apps/desktop/src/main/ipc/index.ts",
        keyword: "registerSkillDocsHandlers",
      },
      {
        file: "apps/desktop/src/main/services/skill/SkillDocGenerator.ts",
        keyword: "class SkillDocGenerator",
      },
    ],
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-skill-docs-guidance-only.png",
    title: "API key 未設定時 guidance-only",
    summary:
      "API key 未設定時に code=2001 を返し、設定誘導 guidance を提供する契約をレビューする。",
    anchors: [
      {
        file: "apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts",
        keyword: "code: 2001",
      },
      {
        file: "apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts",
        keyword: 'capability: "guidance-only"',
      },
    ],
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-skill-docs-timeout.png",
    title: "timeout guidance と再試行導線",
    summary:
      "timeout 時に code=3001 / retryable=true へ分類し、再試行 guidance を返す契約をレビューする。",
    anchors: [
      {
        file: "apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts",
        keyword: "code: 3001",
      },
      {
        file: "docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-04-skill-docs-runtime-integration/phase-11-manual-test.md",
        keyword: "TC-11-03",
      },
    ],
  },
  {
    tc: "TC-11-04",
    file: "TC-11-04-skill-docs-rate-limit.png",
    title: "rate limit 待機導線",
    summary:
      "429 受信時に code=3002 / retryable=true で分類されることをレビューする。",
    anchors: [
      {
        file: "apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts",
        keyword: "code: 3002",
      },
      {
        file: "docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-04-skill-docs-runtime-integration/phase-11-manual-test.md",
        keyword: "TC-11-04",
      },
    ],
  },
  {
    tc: "TC-11-05",
    file: "TC-11-05-skill-docs-terminal-handoff.png",
    title: "terminal handoff fallback",
    summary:
      "terminal-handoff は未実装のため未タスク化し、フォールバック設計として管理していることをレビューする。",
    anchors: [
      {
        file: "docs/30-workflows/unassigned-task/task-ut-skill-docs-terminal-handoff-001.md",
        keyword: "UT-SKILL-DOCS-TERMINAL-HANDOFF-001",
      },
      {
        file: "docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-04-skill-docs-runtime-integration/outputs/phase-12/unassigned-task-detection.md",
        keyword: "UT-SKILL-DOCS-TERMINAL-HANDOFF-001",
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

async function readSnippet(relativePath, keyword) {
  const absPath = path.join(repoRoot, relativePath);
  const content = await fs.readFile(absPath, "utf8");
  const lines = content.split(/\r?\n/);
  const index = lines.findIndex((line) => line.includes(keyword));
  const start = index < 0 ? 0 : Math.max(0, index - 4);
  const end = index < 0 ? Math.min(lines.length, 14) : Math.min(lines.length, index + 10);
  return {
    relativePath,
    keyword,
    excerpt: lines.slice(start, end).join("\n"),
  };
}

function renderHtml(record, snippets) {
  const snippetHtml = snippets
    .map(
      (snippet) => `
        <section class="snippet">
          <p class="source"><strong>Source:</strong> ${escapeHtml(snippet.relativePath)}</p>
          <p class="anchor"><strong>Anchor:</strong> ${escapeHtml(snippet.keyword)}</p>
          <pre>${escapeHtml(snippet.excerpt)}</pre>
        </section>
      `,
    )
    .join("\n");

  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(record.tc)}</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f4f7fb;
        --panel: #ffffff;
        --line: #d7deea;
        --text: #0f172a;
        --muted: #475569;
        --accent: #0f766e;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: "SF Pro Display", "Segoe UI", sans-serif;
        background: radial-gradient(circle at top right, rgba(15, 118, 110, 0.16), transparent 42%), var(--bg);
        color: var(--text);
      }
      main {
        width: min(1520px, calc(100vw - 48px));
        margin: 0 auto;
        padding: 24px 0 30px;
      }
      .header {
        border: 1px solid var(--line);
        border-radius: 16px;
        background: var(--panel);
        padding: 18px 20px;
        margin-bottom: 14px;
      }
      h1 {
        margin: 0;
        font-size: 28px;
        letter-spacing: -0.02em;
      }
      .summary {
        margin: 10px 0 0;
        color: var(--muted);
        font-size: 14px;
        line-height: 1.6;
      }
      .meta {
        margin: 10px 0 0;
        font-size: 12px;
        color: var(--accent);
      }
      .grid {
        display: grid;
        gap: 12px;
      }
      .snippet {
        border: 1px solid var(--line);
        border-radius: 14px;
        background: var(--panel);
        padding: 14px 16px;
      }
      .source,
      .anchor {
        margin: 0 0 7px;
        font-size: 12px;
        color: #1e293b;
      }
      pre {
        margin: 0;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        background: #f8fafc;
        padding: 10px 12px;
        font-size: 12px;
        line-height: 1.45;
        white-space: pre-wrap;
        word-break: break-word;
      }
    </style>
  </head>
  <body>
    <main data-testid="skill-docs-runtime-review-board">
      <section class="header">
        <h1>${escapeHtml(record.tc)} / ${escapeHtml(record.title)}</h1>
        <p class="summary">${escapeHtml(record.summary)}</p>
        <p class="meta">Capture mode: fallback review board (reason: electron-vite/esbuild platform mismatch in this environment)</p>
      </section>
      <section class="grid">
        ${snippetHtml}
      </section>
    </main>
  </body>
</html>`;
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
  const captured = [];

  try {
    for (const scenario of scenarios) {
      const snippets = [];
      for (const anchor of scenario.anchors) {
        snippets.push(await readSnippet(anchor.file, anchor.keyword));
      }
      await page.setContent(renderHtml(scenario, snippets), { waitUntil: "load" });
      await page.getByTestId("skill-docs-runtime-review-board").waitFor();
      await page.waitForTimeout(100);
      const outputPath = path.join(screenshotDir, scenario.file);
      await page.screenshot({ path: outputPath, fullPage: true });
      captured.push({
        tc: scenario.tc,
        file: scenario.file,
        note: scenario.summary,
      });
      process.stdout.write(`✓ ${scenario.file}\n`);
    }
  } finally {
    await browser.close();
  }

  const plan = {
    taskId: "TASK-IMP-SKILL-DOCS-AI-RUNTIME-001",
    phase: 11,
    captureMethod: "fallback-review-board",
    reason: "electron-vite / esbuild platform mismatch により current build 直接captureが不可",
    generatedAt: new Date().toISOString(),
    screens: captured,
  };

  await fs.writeFile(planPath, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
  await fs.writeFile(
    metadataPath,
    `${JSON.stringify(
      {
        taskId: "TASK-IMP-SKILL-DOCS-AI-RUNTIME-001",
        capturedAt: new Date().toISOString(),
        outputDir: path.relative(repoRoot, screenshotDir),
        captures: captured,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  process.stdout.write(`✓ ${path.relative(repoRoot, planPath)}\n`);
  process.stdout.write(`✓ ${path.relative(repoRoot, metadataPath)}\n`);
}

main().catch((error) => {
  console.error("[capture-skill-docs-runtime-integration-phase11] failed", error);
  process.exitCode = 1;
});
