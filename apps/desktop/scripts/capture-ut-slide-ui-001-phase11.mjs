#!/usr/bin/env node

import fs from "node:fs/promises";
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
const viewport = { width: 1440, height: 1180 };
const capturedAt = new Date().toISOString();

const terminalCommand = "claude --resume slide-runtime";
const projectPath = "/Users/dm/demo/slide-runtime";
const screenshotBasePath = "outputs/phase-11/screenshots";

const scenarios = [
  {
    tc: "TC-11-01",
    state: "empty",
    title: "empty state",
    note: "プロジェクト未選択。空状態カードのみを表示する。",
    files: {
      light: "TC-11-01-empty-light.png",
      dark: "TC-11-01-empty-dark.png",
    },
  },
  {
    tc: "TC-11-02",
    state: "synced",
    title: "synced state",
    note: "handoff なし。SlideSyncCard / SlideWatchStatus / SkillPhasePanel / TerminalLauncher を表示する。",
    files: {
      light: "TC-11-02-synced-light.png",
      dark: "TC-11-02-synced-dark.png",
    },
  },
  {
    tc: "TC-11-03",
    state: "running",
    title: "running state",
    note: "progress 行と cancel surface を表示する。",
    files: {
      light: "TC-11-03-running-light.png",
      dark: "TC-11-03-running-dark.png",
    },
  },
  {
    tc: "TC-11-04",
    state: "degraded",
    title: "degraded state",
    note: "retry CTA と terminal fallback CTA を表示する。",
    files: {
      light: "TC-11-04-degraded-light.png",
      dark: "TC-11-04-degraded-dark.png",
    },
  },
  {
    tc: "TC-11-05",
    state: "guidance",
    title: "guidance state",
    note: "handoffGuidance を反映し、settings CTA を表示する。",
    files: {
      light: "TC-11-05-guidance-light.png",
      dark: "TC-11-05-guidance-dark.png",
    },
  },
];

function renderSyncBadge(state) {
  switch (state) {
    case "synced":
      return { label: "同期済み", color: "#34C759", darkColor: "#30D158" };
    case "running":
      return { label: "同期中...", color: "#007AFF", darkColor: "#0A84FF" };
    case "degraded":
      return { label: "同期失敗", color: "#FF9500", darkColor: "#FF9F0A" };
    case "guidance":
      return {
        label: "設定が必要です",
        color: "#007AFF",
        darkColor: "#0A84FF",
      };
    default:
      return null;
  }
}

function renderSyncCard(theme, state) {
  const badge = renderSyncBadge(state);
  if (!badge) {
    return "";
  }

  const errorText =
    state === "degraded"
      ? `<p class="error-text">Reverse sync failed: runtime bridge returned SLIDE_E007.</p>`
      : "";
  const lastSyncText =
    state === "synced"
      ? `<p class="meta-text">最終同期: 5分前</p>`
      : state === "guidance"
        ? `<p class="meta-text">handoff: ${terminalCommand}</p>`
        : "";

  return `
    <section class="card sync-card">
      <div class="sync-head">
        <p class="project-path">${projectPath}</p>
        <span class="badge" style="background:${theme === "dark" ? badge.darkColor : badge.color};">
          ${badge.label}
        </span>
      </div>
      ${lastSyncText}
      ${errorText}
    </section>
  `;
}

function renderWatchStatus() {
  return `
    <section class="watch-row" aria-label="監視状態: 監視中">
      <span class="watch-dot"></span>
      <span class="watch-label">監視中</span>
      <span class="watch-path">${projectPath}</span>
    </section>
  `;
}

function renderProgressRow() {
  return `
    <section class="card progress-card" data-testid="slide-progress-row">
      <div class="progress-head">
        <p>Phase: structure</p>
        <button class="danger">キャンセル</button>
      </div>
      <div class="progress-track">
        <div class="progress-bar" style="width: 68%;"></div>
      </div>
    </section>
  `;
}

function renderGuidanceBlock(state) {
  if (state === "degraded") {
    return `
      <section class="card guidance-card guidance-card-degraded" role="alert">
        <p class="guidance-title">AI 同期に失敗しました</p>
        <p class="guidance-reason">Reverse sync failed: runtime bridge returned SLIDE_E007.</p>
        <ol class="guidance-steps">
          <li><strong>エラーログを確認</strong>: 詳細なエラー情報を確認してください</li>
          <li><strong>ネットワーク確認</strong>: 接続状態を確認してください</li>
          <li><strong>手動実行</strong>: 必要なら CLI コマンドへ切り替えて継続できます</li>
        </ol>
        <div class="cta-row">
          <button class="primary">再試行</button>
          <button class="secondary">ターミナルで手動実行</button>
        </div>
      </section>
    `;
  }

  if (state === "guidance") {
    return `
      <section class="card guidance-card guidance-card-guidance" role="complementary">
        <p class="guidance-title">統合実行の設定が必要です</p>
        <p class="guidance-reason">API キーが未設定です</p>
        <ol class="guidance-steps">
          <li><strong>設定を開く</strong>: AI ランタイムを確認します</li>
          <li><strong>設定を保存</strong>: Claude API キーを入力して保存します</li>
          <li><strong>同期を再実行</strong>: この画面に戻って再試行します</li>
        </ol>
        <div class="cta-row">
          <button class="primary">API キーを設定</button>
          <button class="secondary">ターミナルを開く</button>
        </div>
      </section>
    `;
  }

  return "";
}

function renderSkillPhasePanel() {
  return `
    <section class="card phase-card">
      <p class="section-title">SkillPhasePanel</p>
      <div class="phase-grid">
        <button class="phase-button">hearing</button>
        <button class="phase-button">structure</button>
        <button class="phase-button">html</button>
        <button class="phase-button">modifier</button>
      </div>
    </section>
  `;
}

function renderFileGrid() {
  return `
    <section class="file-grid">
      <div class="card file-card">
        <p class="section-label">構成ファイル</p>
        <p>structure.md</p>
      </div>
      <div class="card file-card">
        <p class="section-label">出力ファイル</p>
        <p>index.html</p>
      </div>
    </section>
  `;
}

function renderTerminalLauncher() {
  return `
    <section class="card terminal-launcher" role="complementary" aria-label="ターミナルランチャー">
      <code>${terminalCommand}</code>
      <button class="secondary small">コピー</button>
      <button class="terminal-open small">ターミナルを開く</button>
    </section>
  `;
}

function renderWorkspace(theme, scenario) {
  if (scenario.state === "empty") {
    return `
      <main class="workspace-shell">
        <div class="meta-ribbon">
          <span>UT-SLIDE-UI-001 / static fallback capture</span>
          <span>${theme}</span>
          <span>${scenario.tc} ${scenario.title}</span>
        </div>
        <section class="workspace">
          <div class="workspace-head">
            <h1>スライドワークスペース</h1>
          </div>
          <section class="empty-card">
            <p>プロジェクトが選択されていません</p>
            <button class="primary large">プロジェクトを開く</button>
          </section>
        </section>
      </main>
    `;
  }

  const dynamicPanel =
    scenario.state === "running"
      ? renderProgressRow()
      : scenario.state === "synced"
        ? renderSkillPhasePanel()
        : renderGuidanceBlock(scenario.state);

  return `
    <main class="workspace-shell">
      <div class="meta-ribbon">
        <span>UT-SLIDE-UI-001 / static fallback capture</span>
        <span>${theme}</span>
        <span>${scenario.tc} ${scenario.title}</span>
      </div>
      <section class="workspace">
        <div class="workspace-head">
          <h1>スライドワークスペース</h1>
          <button class="ghost">プロジェクトを閉じる</button>
        </div>
        ${renderSyncCard(theme, scenario.state)}
        ${renderWatchStatus()}
        ${dynamicPanel}
        ${renderFileGrid()}
        <div class="terminal-anchor">
          ${renderTerminalLauncher()}
        </div>
      </section>
      <aside class="review-note">
        <p><strong>capture method</strong>: static fallback from current code contract</p>
        <p><strong>reason</strong>: esbuild native binary mismatch prevents Vite/Electron live preview in this worktree</p>
      </aside>
    </main>
  `;
}

function renderHtml(theme, scenario) {
  const palette =
    theme === "dark"
      ? {
          bodyStart: "#09090B",
          bodyEnd: "#111827",
          surface: "#111827",
          surfaceAlt: "#1F2937",
          surfaceMuted: "#0F172A",
          text: "#F9FAFB",
          secondary: "rgba(229, 231, 235, 0.72)",
          border: "#374151",
          shadow: "rgba(15, 23, 42, 0.48)",
          watchDot: "#30D158",
          danger: "#FF453A",
          dangerText: "#FF8E8A",
          meta: "#93C5FD",
        }
      : {
          bodyStart: "#F8FAFC",
          bodyEnd: "#E2E8F0",
          surface: "#FFFFFF",
          surfaceAlt: "#F8FAFC",
          surfaceMuted: "#E5E7EB",
          text: "#0F172A",
          secondary: "rgba(71, 85, 105, 0.88)",
          border: "#CBD5E1",
          shadow: "rgba(15, 23, 42, 0.16)",
          watchDot: "#34C759",
          danger: "#FF3B30",
          dangerText: "#DC2626",
          meta: "#1D4ED8",
        };

  return `<!doctype html>
  <html lang="ja">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${scenario.tc} ${scenario.title}</title>
      <style>
        :root {
          color-scheme: ${theme};
          font-family: "SF Pro Display", "Inter", "Hiragino Sans", sans-serif;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(59, 130, 246, 0.16), transparent 32%),
            linear-gradient(180deg, ${palette.bodyStart} 0%, ${palette.bodyEnd} 100%);
          color: ${palette.text};
        }
        .workspace-shell {
          width: min(1120px, calc(100vw - 64px));
          margin: 32px auto 40px;
        }
        .meta-ribbon {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 16px;
          font-size: 12px;
          color: ${palette.secondary};
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .workspace {
          background: color-mix(in srgb, ${palette.surface} 92%, transparent);
          border: 1px solid ${palette.border};
          box-shadow: 0 24px 60px ${palette.shadow};
          border-radius: 28px;
          padding: 24px;
        }
        .workspace-head,
        .sync-head,
        .progress-head,
        .cta-row,
        .terminal-launcher {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .workspace-head h1,
        .guidance-title,
        .section-title {
          margin: 0;
          font-size: 22px;
          line-height: 1.2;
        }
        .section-title {
          font-size: 15px;
        }
        .card,
        .empty-card {
          background: ${palette.surface};
          border: 1px solid ${palette.border};
          border-radius: 18px;
          padding: 18px;
        }
        .empty-card {
          border-style: dashed;
          min-height: 280px;
          display: grid;
          place-items: center;
          text-align: center;
          gap: 16px;
          color: ${palette.secondary};
        }
        .sync-card,
        .progress-card,
        .guidance-card,
        .phase-card {
          margin-top: 16px;
        }
        .watch-row {
          margin-top: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: ${palette.secondary};
          font-size: 14px;
        }
        .watch-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: ${palette.watchDot};
          box-shadow: 0 0 0 6px color-mix(in srgb, ${palette.watchDot} 18%, transparent);
        }
        .watch-label {
          color: ${palette.text};
          font-weight: 600;
        }
        .watch-path,
        .project-path,
        .meta-text,
        .section-label,
        .review-note {
          color: ${palette.secondary};
        }
        .project-path {
          flex: 1;
          min-width: 0;
          font-size: 15px;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .meta-text,
        .guidance-reason,
        .section-label,
        .review-note,
        code {
          font-size: 13px;
          line-height: 1.5;
        }
        .error-text {
          margin: 10px 0 0;
          color: ${palette.dangerText};
          font-size: 13px;
        }
        .progress-track {
          width: 100%;
          height: 10px;
          margin-top: 16px;
          border-radius: 999px;
          background: ${palette.surfaceMuted};
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          border-radius: inherit;
          background: #0A84FF;
        }
        .guidance-card-guidance {
          background: color-mix(in srgb, #0A84FF 12%, ${palette.surface});
          border-color: #0A84FF;
        }
        .guidance-card-degraded {
          background: color-mix(in srgb, #FF9F0A 14%, ${palette.surface});
          border-color: #FF9F0A;
        }
        .guidance-title,
        .guidance-reason {
          margin: 0 0 8px;
        }
        .guidance-steps {
          margin: 0;
          padding-left: 20px;
          color: ${palette.secondary};
          font-size: 14px;
          line-height: 1.6;
        }
        .phase-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-top: 12px;
        }
        .phase-button {
          justify-content: center;
        }
        .file-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 16px;
        }
        .terminal-anchor {
          display: flex;
          justify-content: flex-end;
          margin-top: 16px;
        }
        .terminal-launcher {
          width: min(560px, 100%);
        }
        code {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: ${palette.text};
          background: color-mix(in srgb, ${palette.surfaceMuted} 80%, transparent);
          padding: 10px 12px;
          border-radius: 12px;
        }
        button {
          border: 0;
          border-radius: 12px;
          padding: 10px 16px;
          font: inherit;
          cursor: default;
        }
        .large { padding: 12px 20px; }
        .small { padding: 9px 12px; font-size: 12px; }
        .primary {
          background: #0A84FF;
          color: #ffffff;
        }
        .secondary {
          border: 1px solid ${palette.border};
          background: transparent;
          color: ${palette.text};
        }
        .danger {
          background: ${palette.danger};
          color: #ffffff;
        }
        .ghost {
          background: transparent;
          color: ${palette.secondary};
          border: 1px solid ${palette.border};
        }
        .terminal-open {
          background: ${theme === "dark" ? "#FFFFFF" : "#000000"};
          color: ${theme === "dark" ? "#000000" : "#FFFFFF"};
        }
        .review-note {
          margin-top: 12px;
          display: grid;
          gap: 4px;
        }
        .review-note p {
          margin: 0;
        }
      </style>
    </head>
    <body>
      ${renderWorkspace(theme, scenario)}
    </body>
  </html>`;
}

async function captureScenario(page, scenario, theme) {
  const fileName = scenario.files[theme];
  const filePath = path.join(screenshotDir, fileName);

  await page.setContent(renderHtml(theme, scenario), {
    waitUntil: "domcontentloaded",
  });
  await page.screenshot({ path: filePath, fullPage: true });

  return {
    tc: scenario.tc,
    theme,
    file: fileName,
    path: `${screenshotBasePath}/${fileName}`,
    note: scenario.note,
    captureMode: "static-fallback-from-current-code",
    capturedAt: new Date().toISOString(),
  };
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const captures = [];

  try {
    for (const scenario of scenarios) {
      captures.push(await captureScenario(page, scenario, "light"));
      captures.push(await captureScenario(page, scenario, "dark"));
    }
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }

  await fs.writeFile(
    metadataPath,
    `${JSON.stringify(
      {
        capturedAt,
        captureMode: "static-fallback-from-current-code",
        failureReason:
          "esbuild native binary mismatch (@esbuild/darwin-arm64 vs darwin-x64) prevented Vite/Electron live preview in this worktree.",
        script: "apps/desktop/scripts/capture-ut-slide-ui-001-phase11.mjs",
        viewport,
        terminalCommand,
        captures,
      },
      null,
      2,
    )}\n`,
  );

  console.log(`Screenshots saved to ${screenshotDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
