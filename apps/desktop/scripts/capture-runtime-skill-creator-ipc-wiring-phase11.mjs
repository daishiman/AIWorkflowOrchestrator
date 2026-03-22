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
  "docs/30-workflows/runtime-skill-creator-ipc-wiring",
);
const phase11Root = path.join(workflowRoot, "outputs", "phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const planPath = path.join(phase11Root, "screenshot-plan.json");

const scenarios = [
  {
    tc: "TC-11-09",
    file: "TC-11-09-skill-creator-runtime-surface-review-board.png",
    title: "Skill Creator runtime public surface review board",
    summary:
      "SkillLifecyclePanel から公開 skillCreator surface へ到達し、既存 namespace のまま runtime bridge を使うことを視覚確認する。",
    anchors: [
      {
        file: "apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx",
        keyword: "getSkillCreatorApi",
      },
      {
        file: "apps/desktop/src/preload/index.ts",
        keyword: "skillCreator: skillCreatorAPI",
      },
      {
        file: "apps/desktop/src/preload/skill-creator-api.ts",
        keyword: "planSkill:",
      },
    ],
  },
  {
    tc: "TC-11-10",
    file: "TC-11-10-runtime-ipc-contract-review-board.png",
    title: "Runtime IPC contract review board",
    summary:
      "channels.ts / preload API / main helper / shared contract の4層で `skill-creator:plan/execute-plan/improve-skill` が揃っていることを確認する。",
    anchors: [
      {
        file: "apps/desktop/src/preload/channels.ts",
        keyword: "SKILL_CREATOR_PLAN",
      },
      {
        file: "apps/desktop/src/main/ipc/creatorHandlers.ts",
        keyword: "IPC_CHANNELS.SKILL_CREATOR_PLAN",
      },
      {
        file: "packages/shared/src/types/skillCreator.ts",
        keyword: "export interface SkillCreatorPlanRequest",
      },
    ],
  },
  {
    tc: "TC-11-11",
    file: "TC-11-11-runtime-graceful-degradation-review-board.png",
    title: "Graceful degradation / auth fallback review board",
    summary:
      "RuntimeSkillCreatorFacade 未注入時の一定 failure envelope と、stored key fallback / terminal handoff 経路を確認する。",
    anchors: [
      {
        file: "apps/desktop/src/main/ipc/creatorHandlers.ts",
        keyword: "RUNTIME_SKILL_CREATOR_UNAVAILABLE",
      },
      {
        file: "apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts",
        keyword: "private resolveDecision",
      },
      {
        file: "apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts",
        keyword: "resolveWithService",
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
  const end = index < 0 ? Math.min(lines.length, 16) : Math.min(lines.length, index + 10);
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
        --bg: #f3f6fb;
        --panel: #ffffff;
        --line: #d6dce8;
        --text: #10223a;
        --muted: #4a5c74;
        --accent: #14532d;
        --soft: #e8f5ed;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: "SF Pro Display", "Segoe UI", sans-serif;
        background:
          radial-gradient(circle at top right, rgba(20, 83, 45, 0.14), transparent 38%),
          linear-gradient(180deg, #fbfdff 0%, var(--bg) 100%);
        color: var(--text);
      }
      main {
        width: min(1560px, calc(100vw - 48px));
        margin: 0 auto;
        padding: 28px 0 34px;
      }
      .header {
        border: 1px solid var(--line);
        border-radius: 18px;
        background: var(--panel);
        padding: 20px 22px;
        margin-bottom: 14px;
        box-shadow: 0 18px 44px rgba(16, 34, 58, 0.08);
      }
      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        border-radius: 999px;
        background: var(--soft);
        color: var(--accent);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      h1 {
        margin: 12px 0 0;
        font-size: 30px;
        letter-spacing: -0.03em;
      }
      .summary {
        margin: 10px 0 0;
        color: var(--muted);
        font-size: 14px;
        line-height: 1.7;
      }
      .meta {
        margin: 12px 0 0;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
      }
      .meta-card {
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 12px 14px;
        background: #fbfdff;
      }
      .meta-card strong {
        display: block;
        font-size: 12px;
        color: var(--muted);
        margin-bottom: 6px;
      }
      .meta-card span {
        font-size: 14px;
        line-height: 1.5;
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
        box-shadow: 0 10px 26px rgba(16, 34, 58, 0.06);
      }
      .source,
      .anchor {
        margin: 0 0 8px;
        font-size: 12px;
        color: #23354b;
      }
      pre {
        margin: 0;
        border: 1px solid #c9d4e3;
        border-radius: 10px;
        background: #f7f9fc;
        padding: 12px 14px;
        font-family: "SF Mono", "Menlo", monospace;
        font-size: 12px;
        line-height: 1.55;
        white-space: pre-wrap;
        word-break: break-word;
      }
    </style>
  </head>
  <body>
    <main data-testid="runtime-skill-creator-review-board">
      <section class="header">
        <div class="eyebrow">Phase 11 Review Board</div>
        <h1>${escapeHtml(record.tc)} ${escapeHtml(record.title)}</h1>
        <p class="summary">${escapeHtml(record.summary)}</p>
        <div class="meta">
          <div class="meta-card">
            <strong>Workflow</strong>
            <span>runtime-skill-creator-ipc-wiring</span>
          </div>
          <div class="meta-card">
            <strong>Capture Mode</strong>
            <span>fallback review board</span>
          </div>
          <div class="meta-card">
            <strong>Reason</strong>
            <span>非 UI 中心タスクのため、差分のある公開 surface と契約を review board で可視化</span>
          </div>
        </div>
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
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1240 },
    deviceScaleFactor: 1,
  });

  const metadata = [];

  try {
    for (const scenario of scenarios) {
      const snippets = await Promise.all(
        scenario.anchors.map((anchor) => readSnippet(anchor.file, anchor.keyword)),
      );
      await page.setContent(renderHtml(scenario, snippets), {
        waitUntil: "domcontentloaded",
      });
      await page.getByTestId("runtime-skill-creator-review-board").waitFor();

      const outputPath = path.join(screenshotDir, scenario.file);
      await page.screenshot({
        path: outputPath,
        fullPage: true,
      });

      metadata.push({
        tcId: scenario.tc,
        file: `screenshots/${scenario.file}`,
        title: scenario.title,
        captureMethod: "fallback-review-board",
        generatedAt: new Date().toISOString(),
        sourceAnchors: scenario.anchors,
      });
    }

    await fs.writeFile(
      planPath,
      `${JSON.stringify(
        {
          taskId: "UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001",
          phase: 11,
          captureMethod: "fallback-review-board",
          reason:
            "Renderer UI に直接差分がないため、current workflow 配下に representative review board を生成して public surface を視覚確認する。",
          screenshots: scenarios.map((scenario) => ({
            tcId: scenario.tc,
            state: scenario.title,
            viewport: "1600x1240",
            file: `screenshots/${scenario.file}`,
          })),
          nonVisualCases: [
            {
              tcId: "TC-11-01",
              reason: "関連テスト再実行の可否は CLI 結果で検証",
            },
            {
              tcId: "TC-11-02",
              reason: "型整合は typecheck の結果で検証",
            },
            {
              tcId: "TC-11-03",
              reason: "lint script 未定義は package.json で確認",
            },
          ],
        },
        null,
        2,
      )}\n`,
    );

    await fs.writeFile(
      metadataPath,
      `${JSON.stringify(
        {
          workflow: "runtime-skill-creator-ipc-wiring",
          captureMethod: "fallback-review-board",
          generatedAt: new Date().toISOString(),
          note: "Phase 11 の representative screenshot。非 UI 中心タスクのため review board 方式を採用。",
          screenshots: metadata,
        },
        null,
        2,
      )}\n`,
    );
  } finally {
    await page.close();
    await browser.close();
  }

  process.stdout.write(
    `[capture-runtime-skill-creator-ipc-wiring-phase11] captured ${scenarios.length} screenshot(s)\n`,
  );
}

main().catch((error) => {
  console.error(
    "[capture-runtime-skill-creator-ipc-wiring-phase11] failed",
    error,
  );
  process.exitCode = 1;
});
