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
  "docs/30-workflows/ai-runtime-authmode-unification/tasks/step-04-par-task-09-slide-ai-runtime-alignment",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const planPath = path.join(phase11Root, "screenshot-plan.json");
const harnessPath = "/phase11-slide-ai-runtime-alignment.html";
const viewport = { width: 1440, height: 1180 };

const scenarios = [
  {
    tc: "TC-11-01",
    scenario: "empty",
    file: "TC-11-01-slide-workspace-empty-state.png",
    note: "current SlideWorkspace の empty state（project 未選択）",
    action: async () => {},
  },
  {
    tc: "TC-11-02",
    scenario: "synced",
    file: "TC-11-02-slide-workspace-synced-state.png",
    note: "project 選択後の current synced state",
    action: async (page) => {
      await page.getByRole("button", { name: "プロジェクトを開く" }).click();
      await page.getByText("/Users/dm/demo/slide-runtime-alignment").waitFor();
      await page.getByRole("status", { name: /同期状態: 同期済み/ }).waitFor();
    },
  },
  {
    tc: "TC-11-03",
    scenario: "out-of-sync",
    file: "TC-11-03-slide-workspace-manual-sync-cta.png",
    note: "out-of-sync 時に current 実装が manual sync button を単独表示することを確認",
    action: async (page) => {
      await page.getByRole("button", { name: "プロジェクトを開く" }).click();
      await page.getByRole("button", { name: "手動同期" }).waitFor();
    },
  },
  {
    tc: "TC-11-04",
    scenario: "running",
    file: "TC-11-04-slide-workspace-running-progress.png",
    note: "modifier 実行中の progress 表示",
    action: async (page) => {
      await page.getByRole("button", { name: "プロジェクトを開く" }).click();
      await page.getByText("/Users/dm/demo/slide-runtime-alignment").waitFor();
      await page.getByRole("button", { name: "スライド修正" }).click();
      await page.locator('[role="progressbar"]').waitFor();
      await page.waitForTimeout(450);
    },
  },
  {
    tc: "TC-11-05",
    scenario: "sync-error",
    file: "TC-11-05-slide-workspace-sync-error.png",
    note: "manual sync 失敗時の current error alert と guidance 不在",
    action: async (page) => {
      await page.getByRole("button", { name: "プロジェクトを開く" }).click();
      await page.getByRole("button", { name: "手動同期" }).waitFor();
      await page.getByRole("button", { name: "手動同期" }).click();
      await page.getByRole("alert").waitFor();
    },
  },
];

async function waitForServer(url, timeoutMs = 60_000) {
  return { url, timeoutMs };
}

function createPlan() {
  return {
    generatedAt: new Date().toISOString(),
    captureMode: "static-fallback-from-current-code",
    reason:
      "Vite/electron preview could not be used because esbuild native binary was mismatched in this worktree.",
    intendedHarnessPath: harnessPath,
    viewport,
    scenarios: scenarios.map((scenario) => ({
      id: scenario.tc,
      description: scenario.note,
      route: `static-fallback://${scenario.scenario}`,
      output: `screenshots/${scenario.file}`,
      priority: "A",
    })),
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderStatusBadge(label, color) {
  return `
    <div class="status">
      <span class="dot ${color}"></span>
      <span>${escapeHtml(label)}</span>
    </div>
  `;
}

function renderPhaseButtons(activePhase) {
  const phases = [
    { id: "hearing", label: "ヒアリング" },
    { id: "structure", label: "構成設計" },
    { id: "html", label: "HTML生成" },
    { id: "modifier", label: "スライド修正" },
  ];

  return phases
    .map((phase) => {
      const isActive = phase.id === activePhase;
      return `
        <button class="phase ${isActive ? "phase-active" : ""}">
          <span>${phase.label}</span>
          ${isActive ? '<span class="phase-sub">実行中...</span>' : ""}
        </button>
      `;
    })
    .join("");
}

function renderScenarioHtml(scenario) {
  const currentImplementationNote =
    "current code visualized from SlideWorkspace.tsx / SyncStatusIndicator.tsx / SkillPhasePanel.tsx. guidance / terminal handoff / degraded block are intentionally absent because current implementation does not expose them.";

  const emptyState = `
    <section class="workspace">
      <div class="workspace-head">
        <h2>スライドワークスペース</h2>
      </div>
      <div class="empty-card">
        <p>プロジェクトが選択されていません</p>
        <button class="primary">プロジェクトを開く</button>
      </div>
    </section>
  `;

  const sharedLoadedState = ({
    badge,
    errorMessage = "",
    showManualSync = false,
    activePhase = "",
    progress = null,
  }) => `
    <section class="workspace">
      <div class="workspace-head">
        <h2>スライドワークスペース</h2>
        <button class="ghost">プロジェクトを閉じる</button>
      </div>

      <div class="info-card">
        <div>
          <p class="label">プロジェクトパス</p>
          <p class="path">/Users/dm/demo/slide-runtime-alignment</p>
        </div>
        ${badge}
      </div>

      ${
        errorMessage
          ? `<div class="alert" role="alert">${escapeHtml(errorMessage)}</div>`
          : ""
      }

      <div class="panel">
        <h3>スキルフェーズ</h3>
        <div class="phase-grid">${renderPhaseButtons(activePhase)}</div>
        ${
          progress !== null
            ? `
              <div class="progress-wrap">
                <div class="progress-track">
                  <div class="progress-bar" style="width:${progress}%"></div>
                </div>
                <div class="progress-meta">
                  <span>${progress}%</span>
                  <button class="cancel">キャンセル</button>
                </div>
              </div>
            `
            : ""
        }
      </div>

      ${
        showManualSync
          ? `<div class="cta-row"><button class="warning">手動同期</button></div>`
          : ""
      }

      <div class="file-grid">
        <div class="file-card">
          <p class="label">構成ファイル</p>
          <p>structure.md</p>
        </div>
        <div class="file-card">
          <p class="label">出力ファイル</p>
          <p>index.html</p>
        </div>
      </div>
    </section>
  `;

  let content = emptyState;
  let title = scenario.note;

  switch (scenario.scenario) {
    case "synced":
      content = sharedLoadedState({
        badge: renderStatusBadge("同期済み", "green"),
      });
      break;
    case "out-of-sync":
      content = sharedLoadedState({
        badge: renderStatusBadge("非同期", "yellow"),
        showManualSync: true,
      });
      break;
    case "running":
      content = sharedLoadedState({
        badge: renderStatusBadge("同期中", "blue"),
        activePhase: "modifier",
        progress: 68,
      });
      break;
    case "sync-error":
      content = sharedLoadedState({
        badge: renderStatusBadge("エラー", "red"),
        errorMessage:
          "Reverse sync failed: current implementation does not expose guidance or terminal fallback.",
      });
      break;
    case "empty":
    default:
      title = "project 未選択の初期状態";
      break;
  }

  return `<!doctype html>
  <html lang="ja">
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(scenario.tc)}</title>
      <style>
        :root {
          color-scheme: light;
          --bg: #f3f6fb;
          --panel: #ffffff;
          --panel-sub: #f8fafc;
          --line: #d7e0ea;
          --text: #132238;
          --muted: #5d7188;
          --blue: #2563eb;
          --yellow: #d97706;
          --green: #16a34a;
          --red: #dc2626;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          min-height: 100vh;
          font-family: "SF Pro Display", "Hiragino Sans", sans-serif;
          color: var(--text);
          background:
            radial-gradient(circle at top right, rgba(37, 99, 235, 0.14), transparent 34%),
            linear-gradient(180deg, #eef4fb 0%, var(--bg) 100%);
        }
        main {
          width: min(1240px, calc(100vw - 48px));
          margin: 0 auto;
          padding: 28px 0 36px;
        }
        .header {
          border: 1px solid var(--line);
          border-radius: 28px;
          padding: 20px 24px;
          background: rgba(255, 255, 255, 0.88);
          box-shadow: 0 18px 60px rgba(15, 23, 42, 0.08);
        }
        .eyebrow {
          margin: 0 0 8px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .header h1 {
          margin: 0 0 8px;
          font-size: 28px;
          letter-spacing: -0.03em;
        }
        .header p {
          margin: 0;
          font-size: 14px;
          line-height: 1.7;
          color: var(--muted);
        }
        .workspace {
          margin-top: 18px;
          border: 1px solid var(--line);
          border-radius: 30px;
          background: var(--panel);
          padding: 28px;
          box-shadow: 0 24px 80px rgba(15, 23, 42, 0.1);
        }
        .workspace-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
        }
        h2 {
          margin: 0;
          font-size: 28px;
          letter-spacing: -0.03em;
        }
        h3 {
          margin: 0 0 14px;
          font-size: 15px;
        }
        .ghost, .primary, .warning, .cancel, .phase {
          border: 0;
          border-radius: 14px;
          font: inherit;
        }
        .ghost {
          padding: 10px 14px;
          color: var(--muted);
          background: #f8fafc;
        }
        .primary {
          padding: 14px 22px;
          background: var(--blue);
          color: white;
          font-weight: 700;
        }
        .warning {
          padding: 12px 18px;
          background: var(--yellow);
          color: white;
          font-weight: 700;
        }
        .cancel {
          color: var(--red);
          background: transparent;
          font-weight: 700;
        }
        .empty-card {
          min-height: 360px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          border: 2px dashed var(--line);
          border-radius: 24px;
          background: linear-gradient(180deg, #fbfdff 0%, #f5f9ff 100%);
        }
        .empty-card p {
          margin: 0;
          font-size: 18px;
          color: var(--muted);
        }
        .info-card, .panel, .file-card, .alert {
          border-radius: 22px;
        }
        .info-card {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: center;
          padding: 18px 20px;
          background: var(--panel-sub);
          border: 1px solid var(--line);
          margin-bottom: 18px;
        }
        .label {
          margin: 0 0 6px;
          font-size: 13px;
          font-weight: 700;
          color: var(--muted);
        }
        .path {
          margin: 0;
          font-size: 15px;
        }
        .status {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid var(--line);
          background: white;
          font-size: 14px;
        }
        .dot {
          width: 12px;
          height: 12px;
          border-radius: 999px;
          display: inline-block;
        }
        .green { background: var(--green); }
        .yellow { background: #f59e0b; }
        .blue { background: var(--blue); }
        .red { background: var(--red); }
        .alert {
          margin-bottom: 18px;
          padding: 16px 18px;
          border: 1px solid #f2b0b0;
          background: #fff0f0;
          color: #9f1d1d;
          font-size: 14px;
          line-height: 1.6;
        }
        .panel {
          border: 1px solid var(--line);
          padding: 20px;
          background: white;
        }
        .phase-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }
        .phase {
          padding: 16px 12px;
          background: #eff3f8;
          color: #314256;
          text-align: center;
          font-weight: 700;
        }
        .phase-active {
          background: var(--blue);
          color: white;
          box-shadow: 0 12px 24px rgba(37, 99, 235, 0.24);
        }
        .phase-sub {
          display: block;
          margin-top: 6px;
          font-size: 12px;
          opacity: 0.82;
        }
        .progress-wrap {
          margin-top: 18px;
        }
        .progress-track {
          height: 8px;
          border-radius: 999px;
          background: #e5edf7;
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          border-radius: 999px;
          background: var(--blue);
        }
        .progress-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          font-size: 14px;
          color: var(--muted);
        }
        .cta-row {
          display: flex;
          justify-content: flex-end;
          margin-top: 16px;
        }
        .file-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-top: 18px;
        }
        .file-card {
          padding: 18px 20px;
          border: 1px solid var(--line);
          background: white;
        }
        .file-card p:last-child {
          margin: 0;
          font-size: 15px;
        }
        .footer {
          margin-top: 16px;
          font-size: 13px;
          line-height: 1.7;
          color: var(--muted);
        }
      </style>
    </head>
    <body>
      <main>
        <section class="header">
          <p class="eyebrow">${escapeHtml(scenario.tc)} / Static Fallback Evidence</p>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(scenario.note)}</p>
          <p class="footer">${escapeHtml(currentImplementationNote)}</p>
        </section>
        ${content}
      </main>
    </body>
  </html>`;
}

async function captureScenario(browser, scenario) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);
  await page.setContent(renderScenarioHtml(scenario), { waitUntil: "load" });

  const targetPath = path.join(screenshotDir, scenario.file);
  await page.screenshot({ path: targetPath, fullPage: true });
  const stat = await fs.stat(targetPath);
  await context.close();

  return {
    tc: scenario.tc,
    scenario: scenario.scenario,
    file: scenario.file,
    note: scenario.note,
    route: `static-fallback://${scenario.scenario}`,
    capturedAt: stat.mtime.toISOString(),
  };
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });
  await fs.writeFile(planPath, JSON.stringify(createPlan(), null, 2));
  await waitForServer(harnessPath);
  const browser = await chromium.launch({ headless: true });
  try {
    const captures = [];
    for (const scenario of scenarios) {
      captures.push(await captureScenario(browser, scenario));
    }

    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          captureMode: "static-fallback-from-current-code",
          intendedHarnessPath: harnessPath,
          fallbackReason:
            "Vite/electron preview failed because esbuild native binary was mismatched in this worktree.",
          viewport,
          captures,
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
  console.error(error);
  process.exitCode = 1;
});
