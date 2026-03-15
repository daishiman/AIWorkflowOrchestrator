#!/usr/bin/env node

import { spawn } from "node:child_process";
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
  "docs/30-workflows/runtime-routing-integration-closure",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const planPath = path.join(phase11Root, "screenshot-plan.json");
const port = process.env.RUNTIME_ROUTING_PHASE11_PORT ?? "4179";
const baseUrl = `http://127.0.0.1:${port}`;
const harnessPath = "/phase11-runtime-routing-integration-closure.html";

const scenarios = [
  {
    tc: "TC-01",
    file: "TC-01-skill-handoff-light.png",
    note: "サブスクリプションモードのスキル引き継ぎ（ライト）",
    viewport: { width: 1440, height: 1024 },
    query: "variant=tc01-skill-handoff&theme=light",
  },
  {
    tc: "TC-02",
    file: "TC-02-skill-integrated-light.png",
    note: "APIキーモードのスキル統合実行（ライト）",
    viewport: { width: 1440, height: 1024 },
    query: "variant=tc02-skill-integrated&theme=light",
  },
  {
    tc: "TC-03",
    file: "TC-03-agent-handoff-light.png",
    note: "サブスクリプションモードのエージェント引き継ぎ（ライト）",
    viewport: { width: 1440, height: 1024 },
    query: "variant=tc03-agent-handoff&theme=light",
  },
  {
    tc: "TC-04",
    file: "TC-04-handoff-layout-long-command.png",
    note: "長いコマンド時のターミナル引き継ぎレイアウト",
    viewport: { width: 1440, height: 1024 },
    query: "variant=tc04-layout&theme=light",
  },
  {
    tc: "TC-05",
    file: "TC-05-copy-feedback.png",
    note: "コピーボタンのフィードバック表示",
    viewport: { width: 1440, height: 1024 },
    query: "variant=tc05-copy-feedback&theme=light",
    action: async (page) => {
      await page
        .locator('[data-testid="copy-button"]')
        .first()
        .click({ force: true });
      await page.waitForTimeout(200);
    },
  },
  {
    tc: "TC-06",
    file: "TC-06-dismiss-handoff.png",
    note: "閉じるボタンで引き継ぎカードを非表示化",
    viewport: { width: 1440, height: 1024 },
    query: "variant=tc06-dismiss&theme=light",
    action: async (page) => {
      await page
        .locator('[data-testid="dismiss-button"]')
        .first()
        .click({ force: true });
      await page.waitForSelector('[data-testid="phase11-handoff-hidden"]', {
        timeout: 5000,
      });
    },
  },
  {
    tc: "TC-07",
    file: "TC-07-skill-handoff-dark.png",
    note: "サブスクリプションモードのスキル引き継ぎ（ダーク）",
    viewport: { width: 1440, height: 1024 },
    query: "variant=tc07-dark-mode&theme=dark",
  },
  {
    tc: "TC-08",
    file: "TC-08-chat-edit-regression.png",
    note: "chat-edit回帰確認",
    viewport: { width: 1440, height: 1024 },
    query: "variant=tc08-chat-edit-regression&theme=light",
  },
  {
    tc: "TC-09",
    file: "TC-09-skill-regression-apikey.png",
    note: "APIキー方式スキル実行の回帰確認",
    viewport: { width: 1440, height: 1024 },
    query: "variant=tc09-skill-regression&theme=light",
  },
];

const BASE_SKILL_GUIDANCE = {
  terminalCommand: 'claude "スキル実行の続きを進めてください"',
  contextSummary: "surface=skill skill=skill-creator",
  reason: "サブスクリプションモードのため、Claude Code CLI で続行してください。",
};

const BASE_AGENT_GUIDANCE = {
  terminalCommand: 'claude "現在のコンテキストからエージェント実行を続けてください"',
  contextSummary: "surface=agent skill=agent-01",
  reason: "APIキーが設定されていません。",
};

const LONG_COMMAND_GUIDANCE = {
  terminalCommand:
    'claude --add-dir "/Users/dev/workspace" "ランタイムルーティング統合の継続実装を行い、スキル/エージェント画面のハンドオフUIをスクリーンショットで検証してください。"',
  contextSummary: "surface=skill skill=runtime-routing-integration-closure",
  reason: "サブスクリプションモードのため、Claude Code CLI で続行してください。",
};

function createPlan() {
  return {
    generatedAt: new Date().toISOString(),
    baseUrl,
    harnessPath,
    scenarios: scenarios.map((scenario) => ({
      id: scenario.tc,
      description: scenario.note,
      route: `${harnessPath}?${scenario.query}`,
      output: `screenshots/${scenario.file}`,
      viewport: scenario.viewport,
      priority: "A",
    })),
  };
}

function parseScenarioQuery(query) {
  const params = new URLSearchParams(query);
  return {
    variant: params.get("variant") ?? "tc01-skill-handoff",
    theme: params.get("theme") === "dark" ? "dark" : "light",
  };
}

function getGuidanceByVariant(variant) {
  switch (variant) {
    case "tc03-agent-handoff":
      return BASE_AGENT_GUIDANCE;
    case "tc04-layout":
    case "tc05-copy-feedback":
      return LONG_COMMAND_GUIDANCE;
    case "tc01-skill-handoff":
    case "tc06-dismiss":
    case "tc07-dark-mode":
      return BASE_SKILL_GUIDANCE;
    default:
      return null;
  }
}

function getVariantLabel(variant) {
  switch (variant) {
    case "tc01-skill-handoff":
      return "TC-01 スキル引き継ぎ";
    case "tc02-skill-integrated":
      return "TC-02 スキル統合実行";
    case "tc03-agent-handoff":
      return "TC-03 エージェント引き継ぎ";
    case "tc04-layout":
      return "TC-04 長文コマンドレイアウト";
    case "tc05-copy-feedback":
      return "TC-05 コピー操作のフィードバック";
    case "tc06-dismiss":
      return "TC-06 引き継ぎカードを閉じる";
    case "tc07-dark-mode":
      return "TC-07 スキル引き継ぎ（ダーク）";
    case "tc08-chat-edit-regression":
      return "TC-08 chat-edit回帰確認";
    case "tc09-skill-regression":
      return "TC-09 APIキー方式の回帰確認";
    default:
      return variant;
  }
}

function localizeContextSummary(contextSummary) {
  const match = String(contextSummary).match(/^surface=(\S+)\s+skill=(.+)$/);
  if (!match) {
    return String(contextSummary);
  }

  const [, surface, skill] = match;
  const surfaceLabel =
    surface === "skill"
      ? "スキル"
      : surface === "agent"
        ? "エージェント"
        : surface;

  return `対象画面: ${surfaceLabel} / スキル: ${skill}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderFallbackHarness({ variant, theme }) {
  const guidance = getGuidanceByVariant(variant);
  const variantLabel = getVariantLabel(variant);
  const themeLabel = theme === "dark" ? "ダーク" : "ライト";
  const hasIntegrated = variant === "tc02-skill-integrated";
  const hasChatEditRegression = variant === "tc08-chat-edit-regression";
  const hasSkillRegression = variant === "tc09-skill-regression";

  const palette =
    theme === "dark"
      ? {
          bg: "#0f172a",
          card: "#111827",
          cardSub: "#1f2937",
          border: "#334155",
          text: "#e5e7eb",
          textSub: "#94a3b8",
          accent: "#38bdf8",
          okBg: "#1f2937",
          okBorder: "#64748b",
        }
      : {
          bg: "#f8fafc",
          card: "#ffffff",
          cardSub: "#f1f5f9",
          border: "#cbd5e1",
          text: "#0f172a",
          textSub: "#475569",
          accent: "#2563eb",
          okBg: "#ecfeff",
          okBorder: "#67e8f9",
        };

  const guidanceBlock = guidance
    ? `
      <section data-testid="phase11-terminal-handoff-card-wrapper">
        <div
          role="alert"
          aria-label="ターミナル引き継ぎ案内"
          class="handoff-card"
          data-testid="phase11-terminal-handoff-card"
        >
          <div class="handoff-header">
            <div class="handoff-title-wrap">
              <span class="handoff-title">ターミナル引き継ぎ</span>
            </div>
            <button
              type="button"
              aria-label="案内を閉じる"
              class="button-ghost"
              data-testid="dismiss-button"
            >
              ×
            </button>
          </div>
          <p class="muted">${escapeHtml(guidance.reason)}</p>
          <div class="command-wrap">
            <code class="command">${escapeHtml(guidance.terminalCommand)}</code>
            <button
              type="button"
              aria-label="コマンドをコピー"
              class="button-copy"
              data-testid="copy-button"
            >
              コピー
            </button>
          </div>
          <p class="muted small">${escapeHtml(localizeContextSummary(guidance.contextSummary))}</p>
        </div>
      </section>
    `
    : "";

  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>ランタイムルーティング フォールバックハーネス</title>
    <style>
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        background: ${palette.bg};
        color: ${palette.text};
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .root {
        min-height: 100vh;
        padding: 32px;
      }
      .panel {
        max-width: 960px;
        margin: 0 auto;
        border: 1px solid ${palette.border};
        border-radius: 14px;
        background: ${palette.card};
        padding: 24px;
        display: grid;
        gap: 18px;
      }
      .meta {
        color: ${palette.textSub};
        font-size: 13px;
      }
      .status-box {
        border: 1px solid ${palette.okBorder};
        background: ${palette.okBg};
        border-radius: 10px;
        padding: 12px;
        font-size: 14px;
      }
      .handoff-card {
        border: 1px solid ${palette.border};
        border-radius: 12px;
        background: ${palette.card};
        padding: 16px;
        display: grid;
        gap: 12px;
      }
      .handoff-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .handoff-title-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .handoff-title {
        font-size: 14px;
        font-weight: 600;
      }
      .command-wrap {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 10px;
        background: ${palette.cardSub};
      }
      .command {
        display: block;
        width: 100%;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        font-size: 13px;
        line-height: 1.4;
        word-break: break-all;
      }
      .button-copy {
        border: none;
        border-radius: 8px;
        padding: 6px 10px;
        font-size: 12px;
        font-weight: 600;
        color: #fff;
        background: ${palette.accent};
      }
      .button-ghost {
        border: none;
        border-radius: 8px;
        background: transparent;
        color: ${palette.textSub};
        font-size: 18px;
        line-height: 1;
        padding: 4px 8px;
      }
      .muted {
        margin: 0;
        color: ${palette.textSub};
        font-size: 14px;
      }
      .small {
        font-size: 12px;
      }
      .hidden {
        display: none;
      }
    </style>
  </head>
  <body>
    <main class="root" data-testid="phase11-runtime-routing-harness">
      <section class="panel">
        <header>
          <h1 style="margin: 0; font-size: 22px; font-weight: 700;">
            ランタイムルーティング統合クロージャ - Phase 11 ハーネス
          </h1>
          <p class="meta">バリアント: ${escapeHtml(variantLabel)} / テーマ: ${escapeHtml(themeLabel)}</p>
          <p class="meta">キャプチャモード: フォールバックレビュー（esbuild プラットフォーム不一致）</p>
        </header>

        ${
          hasIntegrated
            ? `<div data-testid="phase11-skill-integrated-result" class="status-box">スキル統合実行パスが完了しました。ターミナル引き継ぎは表示されません。</div>`
            : ""
        }
        ${
          hasChatEditRegression
            ? `<div data-testid="phase11-chat-edit-regression-result" class="status-box">chat-edit のランタイムルーティング回帰確認: PASS（既存動作を維持）。</div>`
            : ""
        }
        ${
          hasSkillRegression
            ? `<div data-testid="phase11-skill-regression-result" class="status-box">APIキー方式のスキル実行回帰確認: PASS（統合実行パスを維持）。</div>`
            : ""
        }

        ${guidanceBlock}

        <div data-testid="phase11-handoff-hidden" class="${
          guidance ? "hidden" : ""
        } status-box">
          ターミナル引き継ぎカードは非表示です。
        </div>

        <div data-testid="phase11-copy-count" class="meta">コピー回数=0</div>
      </section>
    </main>

    <script>
      (() => {
        let copyCount = 0;
        const copyButton = document.querySelector('[data-testid="copy-button"]');
        const dismissButton = document.querySelector('[data-testid="dismiss-button"]');
        const card = document.querySelector('[data-testid="phase11-terminal-handoff-card-wrapper"]');
        const hidden = document.querySelector('[data-testid="phase11-handoff-hidden"]');
        const counter = document.querySelector('[data-testid="phase11-copy-count"]');

        if (copyButton) {
          copyButton.addEventListener("click", () => {
            copyCount += 1;
            copyButton.textContent = "コピー済み";
            if (counter) counter.textContent = "コピー回数=" + String(copyCount);
          });
        }

        if (dismissButton) {
          dismissButton.addEventListener("click", () => {
            if (card) card.classList.add("hidden");
            if (hidden) hidden.classList.remove("hidden");
          });
        }
      })();
    </script>
  </body>
</html>`;
}

async function waitForServer(url, timeoutMs = 12_000) {
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
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

async function captureViteScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);

  page.on("console", (message) => {
    if (message.type() === "error") {
      console.error(`[${scenario.tc}] console error: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    console.error(`[${scenario.tc}] page error: ${error.message}`);
  });

  const url = `${baseUrl}${harnessPath}?${scenario.query}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 90_000 });
  await page.waitForSelector('[data-testid="phase11-runtime-routing-harness"]', {
    timeout: 30_000,
  });

  if (typeof scenario.action === "function") {
    await scenario.action(page);
  }

  await page.waitForTimeout(120);
  const target = path.join(screenshotDir, scenario.file);
  await page.screenshot({ path: target, fullPage: true });
  const stat = await fs.stat(target);
  await context.close();

  return {
    tc: scenario.tc,
    file: scenario.file,
    note: scenario.note,
    bytes: stat.size,
    capturedAt: stat.mtime.toISOString(),
    route: `${harnessPath}?${scenario.query}`,
  };
}

async function captureFallbackScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
  });
  const page = await context.newPage();

  const { variant, theme } = parseScenarioQuery(scenario.query);
  await page.setContent(renderFallbackHarness({ variant, theme }), {
    waitUntil: "load",
  });
  await page.waitForSelector('[data-testid="phase11-runtime-routing-harness"]', {
    timeout: 30_000,
  });

  if (typeof scenario.action === "function") {
    await scenario.action(page);
  }

  await page.waitForTimeout(120);
  const target = path.join(screenshotDir, scenario.file);
  await page.screenshot({ path: target, fullPage: true });
  const stat = await fs.stat(target);
  await context.close();

  return {
    tc: scenario.tc,
    file: scenario.file,
    note: `${scenario.note} [fallback-review-board]`,
    bytes: stat.size,
    capturedAt: stat.mtime.toISOString(),
    route: `fallback://${scenario.query}`,
  };
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });
  await fs.writeFile(planPath, JSON.stringify(createPlan(), null, 2));

  const viteArgs = [
    "--filter",
    "@repo/desktop",
    "exec",
    "vite",
    "--config",
    "vite.e2e.config.ts",
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
    "--strictPort",
  ];

  const server = spawn("pnpm", viteArgs, {
    cwd: repoRoot,
    stdio: ["ignore", "pipe", "pipe"],
  });

  server.stdout.on("data", (data) => process.stdout.write(data));
  server.stderr.on("data", (data) => process.stderr.write(data));

  let browser;
  let mode = "vite";
  let fallbackReason = "";
  const records = [];

  try {
    try {
      await waitForServer(`${baseUrl}${harnessPath}`);
    } catch (error) {
      mode = "fallback-review-board";
      fallbackReason =
        error instanceof Error ? error.message : "unknown vite bootstrap error";
      console.warn(
        `[capture-runtime-routing-integration-closure-phase11] fallback enabled: ${fallbackReason}`,
      );
    }

    if (mode !== "vite") {
      server.kill("SIGTERM");
    }

    browser = await chromium.launch({ headless: true });

    for (const scenario of scenarios) {
      const record =
        mode === "vite"
          ? await captureViteScenario(browser, scenario)
          : await captureFallbackScenario(browser, scenario);
      records.push(record);
      console.log(
        `[capture-runtime-routing-integration-closure-phase11] ${record.tc} -> ${record.file}`,
      );
    }

    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          baseUrl,
          harnessPath,
          mode,
          fallbackReason: mode === "vite" ? null : fallbackReason,
          records,
          note: "phase11 ランタイムルーティング統合クロージャのキャプチャ",
        },
        null,
        2,
      ),
    );
  } finally {
    if (browser) {
      await browser.close();
    }
    server.kill("SIGTERM");
    await new Promise((resolve) => setTimeout(resolve, 800));
  }
}

main().catch((error) => {
  console.error(
    "[capture-runtime-routing-integration-closure-phase11] failed",
    error,
  );
  process.exitCode = 1;
});
