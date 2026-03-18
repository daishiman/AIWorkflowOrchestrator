#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(desktopRoot, '..', '..');

const workflowRoot = path.join(
  repoRoot,
  'docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-06-main-chat-settings-runtime-sync',
);
const phase11Root = path.join(workflowRoot, 'outputs', 'phase-11');
const screenshotDir = path.join(phase11Root, 'screenshots');
const metadataPath = path.join(screenshotDir, 'phase11-capture-metadata-rerun-20260317.json');

const captures = [
  {
    tc: 'TC-11-01',
    file: 'TC-11-01-settings-access-matrix-rerun-20260317.png',
    title: 'Settings Access Matrix (fallback evidence board)',
    summary: 'SettingsView の access/auth セクション構造と status 表示契約を確認。',
    refs: [
      {
        path: 'apps/desktop/src/renderer/views/SettingsView/index.tsx',
        anchor: 'data-testid="auth-mode-status"',
      },
      {
        path: 'docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-06-main-chat-settings-runtime-sync/phase-11-manual-test.md',
        anchor: 'TC-11-01',
      },
    ],
  },
  {
    tc: 'TC-11-02',
    file: 'TC-11-02-main-chat-selector-prompt-rerun-20260317.png',
    title: 'Provider/Model Runtime Sync (fallback evidence board)',
    summary: 'AI_CHAT での providerId/modelId バリデーションと Main 同期経路を確認。',
    refs: [
      {
        path: 'apps/desktop/src/main/ipc/aiHandlers.ts',
        anchor: 'providerId と modelId はセットで指定してください',
      },
      {
        path: 'apps/desktop/src/main/ipc/llmConfigProvider.ts',
        anchor: 'return currentConfig;',
      },
      {
        path: 'apps/desktop/src/main/ipc/__tests__/aiHandlers.runtime-sync.test.ts',
        anchor: 'IT-001',
      },
    ],
  },
  {
    tc: 'TC-11-03',
    file: 'TC-11-03-settings-health-rag-guidance-rerun-20260317.png',
    title: 'Health/RAG Guidance (fallback evidence board)',
    summary: 'llm:check-health の disconnected 統一を確認。RAG UI は本差分未更新として分離記録。',
    refs: [
      {
        path: 'apps/desktop/src/main/handlers/llm.ts',
        anchor: 'status: "disconnected"',
      },
      {
        path: 'apps/desktop/src/main/handlers/__tests__/llm.test.ts',
        anchor: 'expect(result.status).toBe("disconnected")',
      },
      {
        path: 'docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-06-main-chat-settings-runtime-sync/outputs/phase-11/discovered-issues.md',
        anchor: 'RAG state',
      },
    ],
  },
  {
    tc: 'TC-11-04',
    file: 'TC-11-04-settings-terminal-launcher-rerun-20260317.png',
    title: 'Terminal Launcher Coverage (fallback evidence board)',
    summary: 'Terminal launcher 実画面キャプチャは環境制約で未取得。手順・検証理由・不足を明示。',
    refs: [
      {
        path: 'docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-06-main-chat-settings-runtime-sync/phase-11-manual-test.md',
        anchor: 'TC-11-04',
      },
      {
        path: 'docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-06-main-chat-settings-runtime-sync/outputs/phase-11/screenshot-plan.json',
        anchor: 'TC-11-04',
      },
    ],
  },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function readSnippet(relPath, anchor) {
  const absPath = path.join(repoRoot, relPath);
  const raw = await fs.readFile(absPath, 'utf8');
  const lines = raw.split(/\r?\n/);
  const idx = lines.findIndex((line) => line.includes(anchor));
  const start = idx >= 0 ? Math.max(0, idx - 4) : 0;
  const end = idx >= 0 ? Math.min(lines.length, idx + 8) : Math.min(lines.length, 12);
  return {
    relPath,
    anchor,
    found: idx >= 0,
    snippet: lines.slice(start, end).join('\n'),
  };
}

function renderHtml(capture, snippets) {
  const snippetHtml = snippets
    .map((item) => {
      const state = item.found ? 'FOUND' : 'MISSING';
      return `
      <section class="snippet">
        <p class="meta"><strong>Source:</strong> ${escapeHtml(item.relPath)}</p>
        <p class="meta"><strong>Anchor:</strong> ${escapeHtml(item.anchor)} <span class="badge ${item.found ? 'ok' : 'ng'}">${state}</span></p>
        <pre>${escapeHtml(item.snippet)}</pre>
      </section>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(capture.tc)}</title>
    <style>
      body { margin: 0; background: #f6f8fb; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      .page { max-width: 1600px; margin: 0 auto; padding: 24px; display: grid; gap: 16px; }
      .head { background: white; border: 1px solid #dbe3ef; border-radius: 14px; padding: 16px; }
      h1 { margin: 0; font-size: 24px; }
      .subtitle { margin: 10px 0 0; color: #334155; font-size: 14px; }
      .note { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e3a8a; border-radius: 10px; padding: 12px; font-size: 13px; }
      .snippet { background: white; border: 1px solid #dbe3ef; border-radius: 12px; padding: 12px; }
      .meta { margin: 0 0 8px; font-size: 12px; color: #334155; }
      pre { margin: 0; padding: 12px; border-radius: 10px; border: 1px solid #d4dbe8; background: #f8fafc; font-size: 12px; line-height: 1.45; white-space: pre-wrap; word-break: break-word; }
      .badge { display: inline-block; margin-left: 8px; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
      .badge.ok { background: #dcfce7; color: #166534; }
      .badge.ng { background: #fee2e2; color: #991b1b; }
    </style>
  </head>
  <body>
    <main class="page" data-testid="task06-phase11-review-board">
      <header class="head">
        <h1>${escapeHtml(capture.tc)} / ${escapeHtml(capture.title)}</h1>
        <p class="subtitle">${escapeHtml(capture.summary)}</p>
      </header>
      <section class="note">
        Capture mode: fallback review board (環境制約により Vite dev capture 不可)。<br />
        この画像は「仕様・コード・テスト」の整合証跡として管理する。
      </section>
      ${snippetHtml}
    </main>
  </body>
</html>`;
}

async function run() {
  await fs.mkdir(screenshotDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1660, height: 1160 } });
  const result = [];

  try {
    for (const capture of captures) {
      const snippets = [];
      for (const ref of capture.refs) {
        snippets.push(await readSnippet(ref.path, ref.anchor));
      }

      await page.setContent(renderHtml(capture, snippets), { waitUntil: 'load' });
      await page.getByTestId('task06-phase11-review-board').waitFor();
      await page.waitForTimeout(120);

      const out = path.join(screenshotDir, capture.file);
      await page.screenshot({ path: out, fullPage: true });
      result.push({
        tc: capture.tc,
        file: capture.file,
        mode: 'fallback-review-board',
        refs: capture.refs,
      });
      process.stdout.write(`[capture-task06-phase11-fallback] captured ${capture.tc}: ${capture.file}\n`);
    }
  } finally {
    await browser.close();
  }

  await fs.writeFile(
    metadataPath,
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        mode: 'fallback-review-board',
        reason: 'esbuild platform mismatch prevented vite/electron capture',
        workflowRoot: path.relative(repoRoot, workflowRoot),
        screenshots: result,
      },
      null,
      2,
    ),
  );

  process.stdout.write(`[capture-task06-phase11-fallback] metadata written: ${path.relative(repoRoot, metadataPath)}\n`);
}

run().catch((error) => {
  console.error('[capture-task06-phase11-fallback] failed', error);
  process.exit(1);
});
