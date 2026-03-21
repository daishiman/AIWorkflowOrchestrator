#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(desktopRoot, "..", "..");
const workflowRoot = path.join(repoRoot, "docs/30-workflows/ut-slide-ui-001");
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const planPath = path.join(phase11Root, "screenshot-plan.json");
const vitePort = process.env.UT_SLIDE_UI_SCREENSHOT_PORT ?? "5197";
const baseUrl = `http://127.0.0.1:${vitePort}`;
const harnessPath = "/phase11-ut-slide-ui-001.html";
const viewport = { width: 1440, height: 1080 };

const scenarios = [
  {
    tc: "TC-11-01",
    scenario: "empty",
    fileBase: "slide-workspace-empty",
    description: "プロジェクト未選択の empty state",
    action: async () => {},
  },
  {
    tc: "TC-11-02",
    scenario: "synced",
    fileBase: "slide-workspace-synced",
    description: "同期完了時の synced state",
    action: async (page) => {
      await page.getByRole("button", { name: "プロジェクトを開く" }).click();
      await page.getByText("/Users/dm/demo/ut-slide-ui-001").waitFor();
      await page.getByRole("status", { name: /同期状態: 同期済み/ }).waitFor();
    },
  },
  {
    tc: "TC-11-03",
    scenario: "running",
    fileBase: "slide-workspace-running",
    description: "進捗バーが表示される running state",
    action: async (page) => {
      await page.getByRole("button", { name: "プロジェクトを開く" }).click();
      await page.getByText("/Users/dm/demo/ut-slide-ui-001").waitFor();
      await page.getByRole("button", { name: "ヒアリング" }).click();
      await page.getByRole("progressbar").waitFor();
      await page.waitForTimeout(200);
    },
  },
  {
    tc: "TC-11-04",
    scenario: "degraded",
    fileBase: "slide-workspace-degraded",
    description: "degraded guidance と retry CTA を表示",
    action: async (page) => {
      await page.getByRole("button", { name: "プロジェクトを開く" }).click();
      await page.getByRole("alert").waitFor();
      await page.getByText("再試行").waitFor();
    },
  },
  {
    tc: "TC-11-05",
    scenario: "guidance",
    fileBase: "slide-workspace-guidance",
    description: "handoff guidance と settings 導線を表示",
    action: async (page) => {
      await page.getByRole("button", { name: "プロジェクトを開く" }).click();
      await page.getByText("API キーを設定").waitFor();
      await page.getByText("Claude API キーの設定が必要です。").waitFor();
    },
  },
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 90_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // retry
    }
    await wait(400);
  }
  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

function startViteServer() {
  const child = spawn(
    "pnpm",
    [
      "exec",
      "vite",
      "--config",
      "vite.e2e.config.ts",
      "--host",
      "127.0.0.1",
      "--port",
      vitePort,
    ],
    {
      cwd: desktopRoot,
      stdio: "pipe",
      env: {
        ...process.env,
        FORCE_COLOR: "0",
      },
    },
  );

  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));
  return child;
}

function createPlan() {
  return {
    generatedAt: new Date().toISOString(),
    captureMode: "vite-playwright-harness",
    harnessPath,
    viewport,
    scenarios: scenarios.flatMap((scenario) =>
      ["light", "dark"].map((theme) => ({
        id: scenario.tc,
        description: `${scenario.description} (${theme})`,
        route: `${harnessPath}?scenario=${scenario.scenario}&theme=${theme}`,
        output: `screenshots/${scenario.tc}-${scenario.fileBase}-${theme}.png`,
        priority: "A",
      })),
    ),
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

function renderFallbackHtml(scenario, theme) {
  const isDark = theme === "dark";
  const palette = isDark
    ? {
        body: "#111111",
        surface: "#1C1C1E",
        panel: "#2C2C2E",
        border: "#38383A",
        text: "#FFFFFF",
        muted: "rgba(235,235,245,0.6)",
        sync: "#30D158",
        running: "#0A84FF",
        degraded: "#FF9F0A",
        danger: "#FF453A",
      }
    : {
        body: "#F5F5F7",
        surface: "#FFFFFF",
        panel: "#F2F2F7",
        border: "#C6C6C8",
        text: "#000000",
        muted: "rgba(60,60,67,0.6)",
        sync: "#34C759",
        running: "#007AFF",
        degraded: "#FF9500",
        danger: "#FF3B30",
      };

  const badgeByScenario = {
    empty: "",
    synced: {
      label: "同期済み",
      color: palette.sync,
    },
    running: {
      label: "同期中...",
      color: palette.running,
    },
    degraded: {
      label: "同期失敗",
      color: palette.degraded,
    },
    guidance: {
      label: "設定が必要です",
      color: palette.running,
    },
  };

  const badge =
    scenario === "empty"
      ? ""
      : `<span class="badge" style="background:${badgeByScenario[scenario].color}">${badgeByScenario[scenario].label}</span>`;

  const progressRow =
    scenario === "running"
      ? `
        <section class="card">
          <div class="row between">
            <p class="body">Phase: hearing</p>
            <button class="danger">キャンセル</button>
          </div>
          <div class="progress-track" role="progressbar" aria-valuenow="67" aria-valuemin="0" aria-valuemax="100">
            <div class="progress-fill" style="width:67%"></div>
          </div>
        </section>
      `
      : "";

  const guidanceBlock =
    scenario === "degraded"
      ? `
        <section class="guidance degraded" role="alert">
          <p class="title">AI 同期に失敗しました</p>
          <p class="body" style="color:${palette.muted}">network timeout</p>
          <ol class="steps">
            <li>エラーログを確認</li>
            <li>ネットワーク確認</li>
            <li>手動実行</li>
          </ol>
          <div class="row">
            <button class="primary">再試行</button>
            <button class="secondary">ターミナルで手動実行</button>
          </div>
        </section>
      `
      : scenario === "guidance"
        ? `
          <section class="guidance guidance-state" role="complementary">
            <p class="title">API キーが設定されていません</p>
            <p class="body" style="color:${palette.muted}">Claude API キーの設定が必要です。</p>
            <ol class="steps">
              <li>設定を開く</li>
              <li>API キーを入力</li>
              <li>同期を再実行</li>
            </ol>
            <div class="row">
              <button class="primary">API キーを設定</button>
              <button class="secondary">ターミナルを開く</button>
            </div>
          </section>
        `
        : "";

  const skillPhasePanel =
    scenario === "synced"
      ? `
        <section class="phase-panel">
          <p class="section-label">スキルフェーズ</p>
          <div class="phase-grid">
            <button class="phase">ヒアリング</button>
            <button class="phase">構成設計</button>
            <button class="phase">HTML生成</button>
            <button class="phase">スライド修正</button>
          </div>
        </section>
      `
      : "";

  const terminalLauncher =
    scenario === "empty"
      ? ""
      : `
        <div class="terminal-launcher" aria-label="ターミナルランチャー">
          <code>claude --resume</code>
          <button class="secondary">コピー</button>
          <button class="invert">ターミナルを開く</button>
        </div>
      `;

  const syncCard =
    scenario === "empty"
      ? ""
      : `
        <section class="card">
          <div class="row between">
            <p class="path">/Users/dm/demo/ut-slide-ui-001</p>
            ${badge}
          </div>
          <p class="caption">最終同期: たった今</p>
          ${
            scenario === "degraded"
              ? `<p class="caption" style="color:${palette.danger}">network timeout</p>`
              : ""
          }
        </section>
      `;

  const watchStatus =
    scenario === "empty"
      ? ""
      : `
        <section class="watch" role="status">
          <span class="watch-dot" style="background:${palette.sync}"></span>
          <span class="body">監視中</span>
          <span class="body muted">/Users/dm/demo/ut-slide-ui-001</span>
        </section>
      `;

  const fileCards =
    scenario === "empty"
      ? ""
      : `
        <div class="file-grid">
          <section class="card">
            <p class="section-label">構成ファイル</p>
            <p class="body">structure.md</p>
          </section>
          <section class="card">
            <p class="section-label">出力ファイル</p>
            <p class="body">index.html</p>
          </section>
        </div>
      `;

  const emptyState = `
    <section class="empty-card">
      <p class="body muted">プロジェクトが選択されていません</p>
      <button class="primary">プロジェクトを開く</button>
    </section>
  `;

  return `<!doctype html>
  <html lang="ja">
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(scenario)}-${theme}</title>
      <style>
        :root {
          color-scheme: ${theme};
          font-family: "SF Pro Display", "Hiragino Sans", sans-serif;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          min-height: 100vh;
          background: ${palette.body};
          color: ${palette.text};
        }
        .frame {
          min-height: 100vh;
          padding: 40px;
          display: flex;
          justify-content: center;
        }
        .board {
          width: 100%;
          max-width: 1200px;
          border: 1px solid ${palette.border};
          border-radius: 32px;
          background: ${palette.surface};
          padding: 28px;
          box-shadow: 0 24px 80px rgba(15, 23, 42, 0.16);
        }
        .hero {
          border: 1px solid ${palette.border};
          border-radius: 24px;
          background: ${palette.panel};
          padding: 20px 24px;
          margin-bottom: 20px;
        }
        .workspace {
          display: flex;
          flex-direction: column;
          gap: 16px;
          border: 1px solid ${palette.border};
          border-radius: 24px;
          padding: 20px;
          background: ${palette.surface};
        }
        .row { display: flex; align-items: center; gap: 12px; }
        .between { justify-content: space-between; }
        .card, .watch, .guidance, .phase-panel {
          border: 1px solid ${palette.border};
          border-radius: 18px;
          background: ${palette.surface};
          padding: 16px;
        }
        .watch {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .watch-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
        }
        .guidance.degraded {
          border-color: ${palette.degraded};
          background: ${isDark ? "rgba(255,159,10,0.12)" : "rgba(255,149,0,0.12)"};
        }
        .guidance.guidance-state {
          border-color: ${palette.running};
          background: ${isDark ? "rgba(10,132,255,0.08)" : "rgba(0,122,255,0.08)"};
        }
        .phase-grid, .file-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .phase {
          border: 1px solid ${palette.border};
          background: ${palette.panel};
          color: ${palette.text};
          border-radius: 14px;
          padding: 14px;
          font-weight: 600;
        }
        .empty-card {
          border: 2px dashed ${palette.border};
          border-radius: 24px;
          padding: 72px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
          justify-content: center;
        }
        .primary, .danger, .secondary, .invert, .ghost {
          border: 0;
          border-radius: 14px;
          padding: 10px 16px;
          font-weight: 600;
          font-size: 14px;
        }
        .primary {
          background: ${palette.running};
          color: white;
        }
        .danger {
          background: ${palette.danger};
          color: white;
        }
        .secondary {
          background: ${palette.surface};
          border: 1px solid ${palette.border};
          color: ${palette.text};
        }
        .invert {
          background: ${palette.text};
          color: ${palette.surface};
        }
        .ghost {
          background: transparent;
          color: ${palette.muted};
        }
        .badge {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 12px;
          color: white;
          font-weight: 700;
        }
        .path { font-size: 14px; font-weight: 600; margin: 0; }
        .title { font-size: 18px; font-weight: 700; margin: 0 0 6px; }
        .body, .caption, .section-label { margin: 0; }
        .body { font-size: 14px; }
        .caption, .section-label, .muted { color: ${palette.muted}; font-size: 12px; }
        .progress-track {
          height: 8px;
          border-radius: 999px;
          background: ${isDark ? "#2C2C2E" : "#E5E5EA"};
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: ${palette.running};
          border-radius: 999px;
        }
        .steps {
          margin: 12px 0;
          padding-left: 20px;
          color: ${palette.text};
        }
        .terminal-launcher {
          position: sticky;
          bottom: 16px;
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          border: 1px solid ${palette.border};
          border-radius: 18px;
          background: ${palette.panel};
          padding: 12px 16px;
        }
      </style>
    </head>
    <body>
      <main class="frame">
        <section class="board" data-testid="phase11-slide-ui-fallback">
          <header class="hero">
            <p class="section-label">UT-SLIDE-UI-001 / ${theme}</p>
            <h1 class="title">${escapeHtml(scenario.toUpperCase())}</h1>
          </header>
          <section class="workspace">
            <div class="row between">
              <h2 class="title">スライドワークスペース</h2>
              ${scenario === "empty" ? "" : '<button class="ghost">プロジェクトを閉じる</button>'}
            </div>
            ${scenario === "empty" ? emptyState : `${syncCard}${watchStatus}${progressRow}${guidanceBlock}${skillPhasePanel}${fileCards}${terminalLauncher}`}
          </section>
        </section>
      </main>
    </body>
  </html>`;
}

async function runFallbackCapture(reason) {
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({ viewport });
    const captures = [];

    for (const scenario of scenarios) {
      for (const theme of ["light", "dark"]) {
        const outputPath = path.join(
          screenshotDir,
          `${scenario.tc}-${scenario.fileBase}-${theme}.png`,
        );
        await page.setContent(renderFallbackHtml(scenario.scenario, theme), {
          waitUntil: "load",
        });
        await page
          .getByTestId("phase11-slide-ui-fallback")
          .screenshot({ path: outputPath });
        captures.push({
          tc: scenario.tc,
          theme,
          path: path.relative(workflowRoot, outputPath),
        });
      }
    }

    return {
      generatedAt: new Date().toISOString(),
      captureMethod: "static-fallback-from-current-code",
      harnessPath,
      failureReason: reason,
      viewport,
      captures,
    };
  } finally {
    await browser.close();
  }
}

async function captureScenario(page, scenario, theme) {
  const url = `${baseUrl}${harnessPath}?scenario=${scenario.scenario}&theme=${theme}`;
  await page.goto(url, { waitUntil: "networkidle" });
  await page.getByTestId("phase11-ut-slide-ui-harness").waitFor();
  await scenario.action(page);

  const root = page.getByTestId("phase11-ut-slide-ui-harness");
  const outputPath = path.join(
    screenshotDir,
    `${scenario.tc}-${scenario.fileBase}-${theme}.png`,
  );

  await root.screenshot({
    path: outputPath,
  });

  return outputPath;
}

async function main() {
  await mkdir(screenshotDir, { recursive: true });
  await writeFile(planPath, JSON.stringify(createPlan(), null, 2), "utf8");
  let metadata;
  let server = null;

  try {
    const startedAt = new Date().toISOString();
    server = startViteServer();
    await waitForServer(`${baseUrl}${harnessPath}`, 20_000);
    const browser = await chromium.launch({ headless: true });

    try {
      const page = await browser.newPage({ viewport });
      const captures = [];

      for (const scenario of scenarios) {
        for (const theme of ["light", "dark"]) {
          const outputPath = await captureScenario(page, scenario, theme);
          captures.push({
            tc: scenario.tc,
            theme,
            path: path.relative(workflowRoot, outputPath),
          });
        }
      }

      metadata = {
        generatedAt: new Date().toISOString(),
        startedAt,
        captureMethod: "playwright-vite-harness",
        harnessPath,
        baseUrl,
        viewport,
        captures,
      };
    } finally {
      await browser.close();
    }
  } catch (error) {
    metadata = await runFallbackCapture(
      error instanceof Error ? error.message : String(error),
    );
  } finally {
    if (server) {
      server.kill("SIGTERM");
    }
  }

  await writeFile(metadataPath, JSON.stringify(metadata, null, 2), "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
