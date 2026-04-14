#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import net from "node:net";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(desktopRoot, "..", "..");
const workflowRoot = path.join(
  repoRoot,
  "docs/30-workflows/WC-par-03a-fix-state-detail",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const screenshotPlanPath = path.join(phase11Root, "screenshot-plan.json");
const captureMetadataPath = path.join(phase11Root, "phase11-capture-metadata.json");
let port = process.env.WC_PAR_03A_PHASE11_PORT ?? null;
let baseUrl = null;
let wizardRoute = null;
const viewport = { width: 1440, height: 960 };

const scenarios = [
  {
    tcId: "TC-03",
    state: "template-error-cancel",
    file: "TC-SW-FIX-STATE-DETAIL-11-03-template-error-cancel.png",
    selector: '[data-testid="wizard-step-generate"]',
    note: "template モードの error 画面で、最初からやり直すボタンが表示される状態",
    preCapture: async (page) => {
      await fillStep0(page);
      await page.getByRole("button", { name: "次へ" }).click();
      await page.waitForSelector('[data-testid="wizard-step-conversation-round"]');
      await page.getByRole("button", { name: "今すぐ生成する" }).click();
      await page.waitForSelector('[aria-label="適用サマリー"]');
      await page.getByRole("button", { name: "生成する", exact: true }).click();
      await page.waitForSelector('button:has-text("最初からやり直す")');
      await page.waitForTimeout(200);
    },
  },
  {
    tcId: "TC-04",
    state: "template-error-step0",
    file: "TC-SW-FIX-STATE-DETAIL-11-04-template-error-step0.png",
    selector: '[data-testid="wizard-step-info"]',
    note: "template モードの error 画面からキャンセル後、Step 0 に戻った状態",
    preCapture: async (page) => {
      await fillStep0(page);
      await page.getByRole("button", { name: "次へ" }).click();
      await page.waitForSelector('[data-testid="wizard-step-conversation-round"]');
      await page.getByRole("button", { name: "今すぐ生成する" }).click();
      await page.waitForSelector('[aria-label="適用サマリー"]');
      await page.getByRole("button", { name: "生成する", exact: true }).click();
      await page.waitForSelector('button:has-text("最初からやり直す")');
      await page.getByRole("button", { name: "最初からやり直す" }).click();
      await page.waitForSelector('[data-testid="wizard-step-info"]');
      await page.waitForTimeout(200);
    },
  },
  {
    tcId: "TC-05",
    state: "normal-error-no-cancel",
    file: "TC-SW-FIX-STATE-DETAIL-11-05-normal-error-no-cancel.png",
    selector: '[data-testid="wizard-step-generate"]',
    note: "通常モードの error 画面で、template 用のキャンセルボタンが表示されない状態",
    preCapture: async (page) => {
      await fillStep0(page);
      await page.getByRole("button", { name: "次へ" }).click();
      await page.waitForSelector('[data-testid="wizard-step-conversation-round"]');
      await answerAllQuestions(page);
      await page.getByRole("button", { name: "今すぐ生成する" }).click();
      await page.waitForSelector('[aria-label="適用サマリー"]');
      await page.getByRole("button", { name: "生成する", exact: true }).click();
      await page.waitForSelector('[role="alert"]');
      await page.waitForTimeout(200);
    },
  },
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 90_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // retry
    }
    await wait(400);
  }
  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

async function findFreePort(preferredPort = null) {
  const normalize = (value) => {
    if (!value) return null;
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  };

  const tryPort = async (candidate) =>
    new Promise((resolve, reject) => {
      const server = net.createServer();
      server.unref();
      server.on("error", reject);
      server.listen(candidate, "127.0.0.1", () => {
        const address = server.address();
        const resolved =
          typeof address === "object" && address && "port" in address
            ? address.port
            : candidate;
        server.close(() => resolve(resolved));
      });
    });

  const normalizedPreferred = normalize(preferredPort);
  if (normalizedPreferred) {
    try {
      return await tryPort(normalizedPreferred);
    } catch {
      // fall through to ephemeral port
    }
  }

  return await tryPort(0);
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
      port,
      "--strictPort",
    ],
    {
      cwd: desktopRoot,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        FORCE_COLOR: "0",
        VITE_USE_GLOBAL_NAV_STRIP: "false",
      },
    },
  );

  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));
  return child;
}

function createNamespaceProxy(entries = {}) {
  return new Proxy(entries, {
    get(target, prop) {
      if (prop in target) {
        return target[prop];
      }
      if (typeof prop === "string" && prop.startsWith("on")) {
        return () => () => {};
      }
      return async () => ({ success: true, data: {} });
    },
  });
}

function createMockScript() {
  return () => {
    const now = new Date("2026-04-14T00:00:00.000Z").toISOString();
    const mode = new URLSearchParams(window.location.search).get("mode");
    const mockUser = {
      id: "phase11-state-detail-user",
      email: "phase11-state-detail@example.com",
      displayName: "Phase 11 State Detail Reviewer",
      avatarUrl: null,
      provider: "google",
      createdAt: now,
      lastSignInAt: now,
    };

    localStorage.setItem("dev-skip-auth", "true");
    localStorage.setItem(
      "knowledge-studio-store",
      JSON.stringify({
        state: {
          currentView: "skillCenter",
        },
        version: 2,
      }),
    );

    const resolveTheme = () =>
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

    const namespaces = {
      auth: createNamespaceProxy({
        checkOnline: async () => ({ success: true, data: { online: true } }),
        getSession: async () => ({
          success: true,
          data: {
            user: { ...mockUser },
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            isOffline: false,
          },
        }),
        onAuthStateChanged: (callback) => {
          setTimeout(() => {
            callback({
              authenticated: true,
              user: { ...mockUser },
              isOffline: false,
            });
          }, 10);
          return () => {};
        },
        login: async () => ({ success: true }),
        logout: async () => ({ success: true, data: {} }),
        refresh: async () => ({ success: true, data: {} }),
      }),
      theme: createNamespaceProxy({
        get: async () => ({
          success: true,
          data: { mode: "system", resolvedTheme: resolveTheme() },
        }),
        set: async ({ mode: nextMode }) => ({
          success: true,
          data: {
            mode: nextMode,
            resolvedTheme: nextMode === "system" ? resolveTheme() : nextMode,
          },
        }),
        getSystem: async () => ({
          success: true,
          data: {
            isDark: resolveTheme() === "dark",
            resolvedTheme: resolveTheme(),
          },
        }),
        onSystemChanged: () => () => {},
      }),
      skill: createNamespaceProxy({
        create: async () => {
          if (mode === "error") {
            await wait(400);
            throw new Error("スクリーンショット検証用エラー");
          }
          return {
            success: true,
            data: { path: "/mock/skills/phase11-state-detail" },
          };
        },
      }),
      notification: createNamespaceProxy(),
      historySearch: createNamespaceProxy(),
      store: createNamespaceProxy(),
      permission: createNamespaceProxy(),
      profile: createNamespaceProxy(),
      avatar: createNamespaceProxy(),
    };

    window.confirm = () => true;
    window.electronAPI = namespaces;
  };
}

async function openWizard(page) {
  await page.goto(wizardRoute, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.waitForSelector('[data-testid="skill-create-wizard"]', {
    timeout: 60_000,
  });
  await page.waitForSelector('[data-testid="wizard-step-info"]', {
    timeout: 60_000,
  });
  await page.waitForTimeout(200);
}

async function fillStep0(page) {
  await page.fill("#skill-name", "状態詳細検証スキル");
  await page.fill("#purpose", "Slack で通知するスキル");
  await page.click('button[aria-label="外部連携"]');
  await page.waitForTimeout(150);
}

async function answerAllQuestions(page) {
  await page.click('button:has-text("自分のみ")');
  await page.click('button:has-text("テキスト")');
  await page.click('button:has-text("手動実行")');
  await page.click('button:has-text("次のページ")');
  await page.waitForSelector('[data-testid="wizard-step-conversation-round"]');
  await page.click('button:has-text("チャット返信")');
  await page.click('button:has-text("Slack")');
  await page.click('button:has-text("Markdown")');
  await page.waitForTimeout(150);
}

async function captureScenario(browser, scenario, outputDir) {
  const context = await browser.newContext({
    viewport,
    colorScheme: "dark",
  });
  try {
    await context.addInitScript(createMockScript());
    const page = await context.newPage();
    await openWizard(page);
    await scenario.preCapture(page);
    await page.waitForSelector(scenario.selector, { timeout: 15_000 });
    await page.waitForTimeout(150);

    const targetPath = path.join(outputDir, scenario.file);
    await page.locator(scenario.selector).screenshot({ path: targetPath });
  } catch (error) {
    throw new Error(`Screenshot capture failed for ${scenario.file}`, {
      cause: error,
    });
  } finally {
    await context.close();
  }
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });

  port = String(await findFreePort(port));
  baseUrl = `http://127.0.0.1:${port}`;
  wizardRoute = `${baseUrl}/advanced/skill-create-wizard?skipAuth=true&mode=error`;

  const server = startViteServer();
  try {
    await waitForServer(wizardRoute);
    const browser = await chromium.launch({ headless: true });
    const captured = [];

    for (const scenario of scenarios) {
      await captureScenario(browser, scenario, screenshotDir);
      const screenshotPath = path.join(screenshotDir, scenario.file);
      const stat = await fs.stat(screenshotPath);
      captured.push({
        tcId: scenario.tcId,
        state: scenario.state,
        file: `outputs/phase-11/screenshots/${scenario.file}`,
        note: scenario.note,
        selector: scenario.selector,
        capturedAt: stat.mtime.toISOString(),
      });
      process.stdout.write(`Captured ${screenshotPath}\n`);
    }

    const generatedAt = new Date().toISOString();
    await fs.writeFile(
      screenshotPlanPath,
      JSON.stringify(
        {
          taskId: "TASK-SW-FIX-STATE-DETAIL-001",
          generatedAt,
          captureMethod: "current_build_vite_playwright",
          workflowRoot:
            "docs/30-workflows/WC-par-03a-fix-state-detail",
          route: "/advanced/skill-create-wizard?skipAuth=true&mode=error",
          captures: captured.map(({ tcId, state, file, note }) => ({
            tcId,
            state,
            file,
            note,
          })),
        },
        null,
        2,
      ),
      "utf8",
    );

    await fs.writeFile(
      captureMetadataPath,
      JSON.stringify(
        {
          taskId: "TASK-SW-FIX-STATE-DETAIL-001",
          generatedAt,
          captureMethod: "current_build_vite_playwright",
          workflowRoot:
            "docs/30-workflows/WC-par-03a-fix-state-detail",
          harnessPath: "/advanced/skill-create-wizard",
          route: "/advanced/skill-create-wizard?skipAuth=true&mode=error",
          viewport,
          cases: captured.map(({ tcId, state, file, selector, capturedAt }) => ({
            tcId,
            state,
            output: file,
            selector,
            capturedAt,
          })),
        },
        null,
        2,
      ),
      "utf8",
    );
    await browser.close();
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
