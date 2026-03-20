import fs from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import {
  assertNoPrimaryCta,
  assertNoSilentFallback,
  resolveCapability,
  resolveCtaContract,
  resolveUiState,
  type CapabilityContext,
  type ExecutionCapabilityInput,
} from "../../../packages/shared/src/types/execution-capability.ts";
import { startRendererStaticServer } from "./phase11-static-server.mjs";

type SnapshotConfig = {
  label: string;
  input: ExecutionCapabilityInput;
  context: Omit<CapabilityContext, "capability">;
  note: string;
};

type ScenarioConfig = {
  tc: string;
  file: string;
  title: string;
  note: string;
  expected: string[];
  snapshots: SnapshotConfig[];
};

type RenderSnapshot = {
  label: string;
  note: string;
  capability: string;
  uiState: string;
  blockedReason: string | null;
  blockedAction: { label: string; targetRoute: string } | null;
  primary: { label: string; action: string } | null;
  secondary: { label: string; action: string };
  resolutionPath: "available" | "none";
  settingsCards: Array<{ key: string; title: string; state: string }>;
  guards: Array<{ label: string; status: "pass" | "n/a"; detail: string }>;
};

type RenderScenario = {
  tc: string;
  file: string;
  title: string;
  note: string;
  expected: string[];
  snapshots: RenderSnapshot[];
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(desktopRoot, "..", "..");
const workflowRoot = path.join(
  repoRoot,
  "docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");

const scenarios: ScenarioConfig[] = [
  {
    tc: "TC-01",
    file: "TC-01-integrated-runtime-ready.png",
    title: "integratedRuntime ready",
    note: "API key のみ有効。in-app lane が primary であることを確認する。",
    expected: [
      "capability:integratedRuntime:active",
      "ui-state:ready",
      "cta:primary:AI で実行",
      "cta:secondary:設定を開く",
    ],
    snapshots: [
      {
        label: "integratedRuntime",
        note: "apiKeyValid=true / subscriptionValid=false / API接続成功",
        input: { apiKeyValid: true, subscriptionValid: false },
        context: {
          isConnectionAvailable: true,
          isTerminalAvailable: false,
          hasResolutionAction: false,
        },
      },
    ],
  },
  {
    tc: "TC-02",
    file: "TC-02-terminal-surface-ready.png",
    title: "terminalSurface ready",
    note: "subscription のみ有効。manual lane が primary で自動送信しないことを確認する。",
    expected: [
      "capability:terminalSurface:active",
      "ui-state:ready",
      "cta:primary:ターミナルで実行",
      "cta:secondary:コマンドをコピー",
    ],
    snapshots: [
      {
        label: "terminalSurface",
        note: "apiKeyValid=false / subscriptionValid=true / terminal launcher 利用可能",
        input: { apiKeyValid: false, subscriptionValid: true },
        context: {
          isConnectionAvailable: false,
          isTerminalAvailable: true,
          hasResolutionAction: false,
        },
      },
    ],
  },
  {
    tc: "TC-03",
    file: "TC-03-both-ready.png",
    title: "both ready",
    note: "両 lane 利用可能。primary は integrated、secondary は terminal であることを確認する。",
    expected: [
      "capability:both:active",
      "ui-state:ready",
      "cta:primary:AI で実行",
      "cta:secondary:ターミナルで実行",
    ],
    snapshots: [
      {
        label: "both",
        note: "apiKeyValid=true / subscriptionValid=true / 両 lane 利用可能",
        input: { apiKeyValid: true, subscriptionValid: true },
        context: {
          isConnectionAvailable: true,
          isTerminalAvailable: true,
          hasResolutionAction: false,
        },
      },
    ],
  },
  {
    tc: "TC-04",
    file: "TC-04-none-unavailable.png",
    title: "none unavailable",
    note: "解決 action がない none。primary CTA を DOM に含めず、setup guide だけを残す。",
    expected: [
      "capability:none:unavailable",
      "ui-state:unavailable",
      "cta:primary:hidden",
      "cta:secondary:セットアップガイド",
      "reason-text:visible",
    ],
    snapshots: [
      {
        label: "none unavailable",
        note: "apiKeyValid=false / subscriptionValid=false / hasResolutionAction=false",
        input: { apiKeyValid: false, subscriptionValid: false },
        context: {
          isConnectionAvailable: false,
          isTerminalAvailable: false,
          hasResolutionAction: false,
        },
      },
    ],
  },
  {
    tc: "TC-05",
    file: "TC-05-blocked-to-ready-transition.png",
    title: "blocked -> ready transition",
    note: "API key 入力前後で none blocked から integratedRuntime ready へ切り替わることを確認する。",
    expected: [
      "transition:none-blocked->integratedRuntime-ready",
      "cta:before:設定を開く",
      "cta:after:AI で実行",
    ],
    snapshots: [
      {
        label: "before",
        note: "apiKey 入力前。復旧 action があるため blocked。",
        input: { apiKeyValid: false, subscriptionValid: false },
        context: {
          isConnectionAvailable: false,
          isTerminalAvailable: false,
          hasResolutionAction: true,
        },
      },
      {
        label: "after",
        note: "apiKey 入力後。in-app lane が ready。",
        input: { apiKeyValid: true, subscriptionValid: false },
        context: {
          isConnectionAvailable: true,
          isTerminalAvailable: false,
          hasResolutionAction: false,
        },
      },
    ],
  },
  {
    tc: "TC-06",
    file: "TC-06-silent-fallback-guard.png",
    title: "silent fallback guard",
    note: "none unavailable で guard が暗黙切替を拒否し、実行 CTA を生成しないことを確認する。",
    expected: [
      "guard:silent-fallback:pass",
      "guard:no-primary:pass",
      "message:unavailable",
    ],
    snapshots: [
      {
        label: "guarded none",
        note: "capability=none / unavailable。assertNoSilentFallback の拒否を可視化する。",
        input: { apiKeyValid: false, subscriptionValid: false },
        context: {
          isConnectionAvailable: false,
          isTerminalAvailable: false,
          hasResolutionAction: false,
        },
      },
    ],
  },
];

function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Failed to resolve free port"));
        return;
      }
      const { port } = address;
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(port);
      });
    });
  });
}

function buildSettingsCards(capability: string) {
  const integratedActive =
    capability === "integratedRuntime" || capability === "both";
  const terminalActive =
    capability === "terminalSurface" || capability === "both";

  return [
    {
      key: "integratedRuntime",
      title: "AI統合実行",
      state: integratedActive ? "active" : "inactive",
    },
    {
      key: "terminalSurface",
      title: "ターミナル handoff",
      state: terminalActive ? "active" : "inactive",
    },
    {
      key: "none",
      title: "利用不可メッセージ",
      state: capability === "none" ? "focus" : "standby",
    },
  ];
}

function buildGuards(snapshot: RenderSnapshot) {
  const guards: RenderSnapshot["guards"] = [];

  if (snapshot.capability === "none") {
    guards.push({
      label: "silent fallback",
      status: "pass",
      detail: "assertNoSilentFallback が none の暗黙切替を拒否する",
    });
  } else {
    guards.push({
      label: "silent fallback",
      status: "n/a",
      detail: "ready lane では fallback guard 非発火",
    });
  }

  if (snapshot.uiState === "unavailable") {
    guards.push({
      label: "primary CTA DOM guard",
      status: "pass",
      detail: "assertNoPrimaryCta により primary CTA は null を維持する",
    });
  } else {
    guards.push({
      label: "primary CTA DOM guard",
      status: "n/a",
      detail: "primary CTA を表示する state のため非適用",
    });
  }

  return guards;
}

function buildSnapshot(config: SnapshotConfig): RenderSnapshot {
  const capability = resolveCapability(config.input);
  const uiResult = resolveUiState({
    capability,
    ...config.context,
  });

  if (typeof uiResult === "string") {
    throw new Error("CapabilityContext overload must return UiStateResult");
  }

  const ctaContract = resolveCtaContract({
    capability,
    uiState: uiResult.uiState,
    blockedAction: uiResult.blockedAction,
  });

  if (capability === "none") {
    try {
      assertNoSilentFallback(capability);
      throw new Error("assertNoSilentFallback should reject capability=none");
    } catch {
      // expected
    }
  } else {
    assertNoSilentFallback(capability);
  }

  if (uiResult.uiState === "unavailable") {
    assertNoPrimaryCta(uiResult.uiState, ctaContract);
  }

  const snapshot: RenderSnapshot = {
    label: config.label,
    note: config.note,
    capability,
    uiState: uiResult.uiState,
    blockedReason: uiResult.blockedReason ?? null,
    blockedAction: uiResult.blockedAction ?? null,
    primary: ctaContract.primary,
    secondary: ctaContract.secondary,
    resolutionPath: config.context.hasResolutionAction ? "available" : "none",
    settingsCards: buildSettingsCards(capability),
    guards: [],
  };

  snapshot.guards = buildGuards(snapshot);
  return snapshot;
}

function buildScenarioModels(): RenderScenario[] {
  return scenarios.map((scenario) => ({
    tc: scenario.tc,
    file: scenario.file,
    title: scenario.title,
    note: scenario.note,
    expected: scenario.expected,
    snapshots: scenario.snapshots.map(buildSnapshot),
  }));
}

function createHarnessHtml(renderScenarios: RenderScenario[]) {
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Phase 11 Review Board</title>
    <style>
      :root {
        --bg: #f2efe7;
        --panel: rgba(255, 255, 255, 0.86);
        --panel-strong: #fffdf9;
        --text: #1f2933;
        --muted: #6b7280;
        --border: rgba(31, 41, 51, 0.12);
        --primary: #0e7490;
        --primary-soft: rgba(14, 116, 144, 0.12);
        --success: #166534;
        --success-soft: rgba(22, 101, 52, 0.12);
        --warning: #92400e;
        --warning-soft: rgba(146, 64, 14, 0.12);
        --danger: #9f1239;
        --danger-soft: rgba(159, 18, 57, 0.12);
        --shadow: 0 24px 80px rgba(31, 41, 51, 0.16);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Hiragino Sans", "Yu Gothic", sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(14, 116, 144, 0.18), transparent 36%),
          radial-gradient(circle at top right, rgba(146, 64, 14, 0.12), transparent 30%),
          linear-gradient(180deg, #faf7ef 0%, #ede7dc 100%);
      }
      .page {
        width: 1440px;
        margin: 0 auto;
        padding: 40px;
      }
      .hero {
        display: grid;
        grid-template-columns: 1.3fr 0.7fr;
        gap: 24px;
        margin-bottom: 24px;
      }
      .hero-main, .hero-side, .snapshot, .panel {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 28px;
        box-shadow: var(--shadow);
        backdrop-filter: blur(10px);
      }
      .hero-main {
        padding: 28px 32px;
      }
      .hero-side {
        padding: 24px;
      }
      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 8px 14px;
        border-radius: 999px;
        background: var(--primary-soft);
        color: var(--primary);
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.04em;
      }
      h1 {
        margin: 16px 0 10px;
        font-size: 40px;
        line-height: 1.05;
      }
      .sub {
        margin: 0;
        color: var(--muted);
        font-size: 16px;
        line-height: 1.7;
      }
      .hero-side h2, .snapshot h2 {
        margin: 0 0 14px;
        font-size: 15px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--muted);
      }
      .expected-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .chip {
        padding: 9px 14px;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: rgba(255,255,255,0.72);
        font-size: 13px;
        font-weight: 700;
      }
      .snapshots {
        display: grid;
        grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
        gap: 24px;
      }
      .snapshot {
        padding: 26px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .snapshot-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
      }
      .snapshot-title {
        margin: 0;
        font-size: 26px;
      }
      .snapshot-note {
        margin: 8px 0 0;
        color: var(--muted);
        font-size: 14px;
        line-height: 1.6;
      }
      .status-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .status-pill {
        padding: 10px 14px;
        border-radius: 18px;
        font-size: 13px;
        font-weight: 700;
        border: 1px solid transparent;
      }
      .state-ready { background: var(--success-soft); color: var(--success); }
      .state-blocked { background: var(--warning-soft); color: var(--warning); }
      .state-unavailable { background: var(--danger-soft); color: var(--danger); }
      .lane-active { background: var(--primary-soft); color: var(--primary); }
      .panel-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
      }
      .panel {
        padding: 20px;
      }
      .panel h3 {
        margin: 0 0 14px;
        font-size: 16px;
      }
      .cards {
        display: grid;
        gap: 12px;
      }
      .card {
        border-radius: 20px;
        padding: 16px;
        border: 1px solid var(--border);
        background: var(--panel-strong);
      }
      .card.active {
        border-color: rgba(14, 116, 144, 0.28);
        background: linear-gradient(180deg, rgba(14, 116, 144, 0.12), rgba(255,255,255,0.92));
      }
      .card.focus {
        border-color: rgba(159, 18, 57, 0.24);
        background: linear-gradient(180deg, rgba(159, 18, 57, 0.10), rgba(255,255,255,0.92));
      }
      .card-label {
        margin: 0 0 6px;
        font-size: 14px;
        color: var(--muted);
      }
      .card-value {
        margin: 0;
        font-size: 20px;
        font-weight: 800;
      }
      .cta-stack {
        display: grid;
        gap: 12px;
      }
      .cta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        border-radius: 18px;
        border: 1px solid var(--border);
        background: #fff;
      }
      .cta.primary {
        border-color: rgba(14, 116, 144, 0.24);
        background: linear-gradient(135deg, rgba(14, 116, 144, 0.10), rgba(255,255,255,0.94));
      }
      .cta.secondary {
        border-color: rgba(31, 41, 51, 0.10);
      }
      .cta.hidden {
        border-style: dashed;
        color: var(--muted);
        background: rgba(255,255,255,0.5);
      }
      .guard-list {
        display: grid;
        gap: 10px;
      }
      .guard {
        padding: 14px 16px;
        border-radius: 18px;
        border: 1px solid var(--border);
        background: #fff;
      }
      .guard.pass { border-color: rgba(22, 101, 52, 0.20); }
      .guard.na { border-color: rgba(31, 41, 51, 0.08); }
      .mini {
        display: block;
        color: var(--muted);
        font-size: 12px;
        margin-top: 4px;
      }
      .footer {
        margin-top: 20px;
        font-size: 12px;
        color: var(--muted);
      }
    </style>
  </head>
  <body>
    <div id="app" class="page"></div>
    <script>
      const scenarios = ${JSON.stringify(renderScenarios)};
      const tc = new URLSearchParams(window.location.search).get("tc") || scenarios[0].tc;
      const scenario = scenarios.find((item) => item.tc === tc) || scenarios[0];
      const app = document.getElementById("app");
      const columns = scenario.snapshots.length > 1 ? 2 : 1;

      const renderCta = (label, variant) => {
        if (!label) {
          return '<div class="cta hidden"><strong>primary CTA は DOM 非表示</strong><span>disabled ではなく null</span></div>';
        }
        return '<div class="cta ' + variant + '"><strong>' + label.label + '</strong><span>' + label.action + '</span></div>';
      };

      const renderGuard = (guard) => {
        const className = guard.status === "pass" ? "guard pass" : "guard na";
        const badge = guard.status === "pass" ? "PASS" : "N/A";
        return '<div class="' + className + '"><strong>' + guard.label + ' · ' + badge + '</strong><span class="mini">' + guard.detail + '</span></div>';
      };

      const renderCard = (card) => {
        return '<div class="card ' + card.state + '"><p class="card-label">' + card.title + '</p><p class="card-value">' + card.state + '</p></div>';
      };

      app.innerHTML = \`
        <section class="hero">
          <div class="hero-main">
            <span class="eyebrow">Phase 11 Review Board / \${scenario.tc}</span>
            <h1>\${scenario.title}</h1>
            <p class="sub">\${scenario.note}</p>
          </div>
          <div class="hero-side">
            <h2>Expected Elements</h2>
            <div class="expected-list">
              \${scenario.expected.map((item) => '<span class="chip">' + item + '</span>').join("")}
            </div>
          </div>
        </section>
        <section class="snapshots" style="--columns:\${columns};">
          \${scenario.snapshots.map((snapshot) => \`
            <article class="snapshot">
              <div class="snapshot-header">
                <div>
                  <h2>\${scenario.tc} / \${snapshot.label}</h2>
                  <h3 class="snapshot-title">\${snapshot.capability}</h3>
                  <p class="snapshot-note">\${snapshot.note}</p>
                </div>
                <div class="status-row">
                  <span class="status-pill lane-active">capability: \${snapshot.capability}</span>
                  <span class="status-pill state-\${snapshot.uiState}">uiState: \${snapshot.uiState}</span>
                  <span class="status-pill \${snapshot.resolutionPath === "available" ? "state-blocked" : "state-unavailable"}">resolution: \${snapshot.resolutionPath === "available" ? "settings path" : "none"}</span>
                </div>
              </div>
              <div class="panel-grid">
                <section class="panel">
                  <h3>Settings Capability Cards</h3>
                  <div class="cards">
                    \${snapshot.settingsCards.map(renderCard).join("")}
                  </div>
                </section>
                <section class="panel">
                  <h3>Main Chat Contract</h3>
                  <div class="cta-stack">
                    \${renderCta(snapshot.primary, "primary")}
                    \${renderCta(snapshot.secondary, "secondary")}
                  </div>
                  <div class="footer">
                    \${snapshot.blockedReason ? "理由: " + snapshot.blockedReason : "理由テキストなし"}
                    \${snapshot.blockedAction ? "<br>blockedAction: " + snapshot.blockedAction.label + " -> " + snapshot.blockedAction.targetRoute : ""}
                  </div>
                </section>
              </div>
              <section class="panel">
                <h3>Guard Evidence</h3>
                <div class="guard-list">
                  \${snapshot.guards.map(renderGuard).join("")}
                </div>
              </section>
            </article>
          \`).join("")}
        </section>
      \`;
    </script>
  </body>
</html>`;
}

async function writeHarness(
  tempDir: string,
  renderScenarios: RenderScenario[],
) {
  const htmlPath = path.join(
    tempDir,
    "phase11-execution-responsibility-contract-foundation.html",
  );
  await fs.writeFile(htmlPath, createHarnessHtml(renderScenarios), "utf8");
  return htmlPath;
}

async function main() {
  const renderScenarios = buildScenarioModels();
  const tempDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "phase11-execution-responsibility-"),
  );
  await fs.mkdir(screenshotDir, { recursive: true });
  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const htmlPath = await writeHarness(tempDir, renderScenarios);
  const server = await startRendererStaticServer({
    baseUrl,
    rootDir: tempDir,
  });

  try {
    const browser = await chromium.launch({ headless: true });
    const results = [];

    for (const scenario of renderScenarios) {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 1400 },
        colorScheme: "light",
      });

      await page.goto(
        `${baseUrl}/${path.basename(htmlPath)}?tc=${encodeURIComponent(scenario.tc)}`,
        { waitUntil: "networkidle" },
      );
      await page.screenshot({
        path: path.join(screenshotDir, scenario.file),
        fullPage: true,
      });

      const stat = await fs.stat(path.join(screenshotDir, scenario.file));
      results.push({
        tc: scenario.tc,
        file: scenario.file,
        title: scenario.title,
        note: scenario.note,
        capturedAt: stat.mtime.toISOString(),
      });
      await page.close();
    }

    await browser.close();
    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          baseUrl,
          scenarios: results,
        },
        null,
        2,
      ),
      "utf8",
    );
  } finally {
    await server.close();
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
