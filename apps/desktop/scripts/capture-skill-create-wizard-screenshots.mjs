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
const defaultWorkflowRoot = path.join(
  repoRoot,
  "docs/30-workflows/W1-par-02c-complete-step",
);
const wizardRoute = "/advanced/skill-create-wizard";
const completeStepHarnessPath = "/phase11-w1-par-02c-complete-step.html";

function resolveWorkflowRoot(workflowRootArg) {
  if (!workflowRootArg) {
    return defaultWorkflowRoot;
  }
  return path.isAbsolute(workflowRootArg)
    ? workflowRootArg
    : path.resolve(repoRoot, workflowRootArg);
}

function parseArgs(argv) {
  const options = {
    workflowRoot:
      process.env.SKILL_WIZARD_SCREENSHOT_WORKFLOW_ROOT ?? defaultWorkflowRoot,
    screenshotDir: null,
    port:
      process.env.SKILL_WIZARD_SCREENSHOT_PORT ??
      process.env.W1_PAR_02C_PHASE11_PORT ??
      "5183",
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--output-dir" && argv[i + 1]) {
      options.screenshotDir = path.resolve(process.cwd(), argv[i + 1]);
      i += 1;
      continue;
    }
    if (arg === "--workflow-root" && argv[i + 1]) {
      options.workflowRoot = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === "--port" && argv[i + 1]) {
      options.port = argv[i + 1];
      i += 1;
    }
  }

  return options;
}

const defaultScenarios = [
  {
    file: "TC-11-01-step0-description-category.png",
    route: wizardRoute,
    selector: '[data-testid="wizard-step-describe"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    note: "Step 0 で説明とカテゴリを入力した状態",
    preCapture: async (page) => {
      await page.fill("#skill-description", "毎日通知するスキル");
      await page.selectOption("#skill-category", "external-integration");
      await page.waitForTimeout(200);
    },
  },
  {
    file: "TC-11-02-step1-page1-defaults.png",
    route: wizardRoute,
    selector: '[data-testid="wizard-step-conversation-round"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill("#skill-description", "毎日通知するスキル");
      await page.selectOption("#skill-category", "external-integration");
      await page.waitForTimeout(100);
      await page.getByRole("button", { name: "次へ" }).click();
      await page.waitForSelector(
        '[data-testid="wizard-step-conversation-round"]',
      );
      await page.waitForTimeout(200);
    },
  },
  {
    file: "TC-11-03-step1-cron-error.png",
    route: wizardRoute,
    selector: '[role="alert"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill("#skill-description", "毎日通知するスキル");
      await page.selectOption("#skill-category", "external-integration");
      await page.getByRole("button", { name: "次へ" }).click();
      await page.waitForSelector(
        '[data-testid="wizard-step-conversation-round"]',
      );
      await page.locator("#schedule-cron").fill("25 99 * * *");
      await page.locator("#schedule-cron").blur();
      await page.waitForSelector("text=cron式の形式が正しくありません");
      await page.waitForTimeout(200);
    },
  },
  {
    file: "TC-11-04-step2-required-q5.png",
    route: wizardRoute,
    selector: '[data-testid="wizard-step-conversation-round"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill("#skill-description", "毎日通知するスキル");
      await page.selectOption("#skill-category", "external-integration");
      await page.getByRole("button", { name: "次へ" }).click();
      await page.waitForSelector(
        '[data-testid="wizard-step-conversation-round"]',
      );
      await page.getByRole("button", { name: "次のページ" }).click();
      await page.waitForSelector("text=Q5: 外部ツール連携（必須★）");
      await page.waitForTimeout(150);
    },
  },
  {
    file: "TC-11-05-summary-card-warning.png",
    route: wizardRoute,
    selector: '[aria-label="適用サマリー"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill("#skill-description", "毎日通知するスキル");
      await page.selectOption("#skill-category", "external-integration");
      await page.getByRole("button", { name: "次へ" }).click();
      await page.waitForSelector(
        '[data-testid="wizard-step-conversation-round"]',
      );
      await page.getByRole("button", { name: "次のページ" }).click();
      await page.getByRole("button", { name: "今すぐ生成する" }).click();
      await page.waitForSelector('[aria-label="適用サマリー"]');
      await page.waitForTimeout(150);
    },
  },
  {
    file: "TC-07-step3-complete-light.png",
    route: wizardRoute,
    selector: '[data-testid="wizard-step-complete"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
    preCapture: async (page) => {
      await page.fill("#purpose", "ファイルを整理して命名規則を統一するスキル");
      await page.click('button:has-text("自動化")');
      await page.click('button:has-text("次へ")');
      await page.click('button:has-text("スキルを生成")');
      await page.waitForSelector("text=スキルの骨格を生成しました");
      await page.waitForTimeout(150);
    },
  },
  {
    file: "TC-08-step3-complete-mobile-dark.png",
    route: wizardRoute,
    selector: '[data-testid="wizard-step-complete"]',
    viewport: { width: 390, height: 844 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill("#purpose", "ファイルを整理して命名規則を統一するスキル");
      await page.click('button:has-text("自動化")');
      await page.click('button:has-text("次へ")');
      await page.click('button:has-text("スキルを生成")');
      await page.waitForSelector("text=スキルの骨格を生成しました");
      await page.waitForTimeout(150);
    },
  },
  {
    file: "TC-09-step3-complete-external-checklist-light.png",
    route: completeStepHarnessPath,
    selector: '[data-testid="phase11-complete-step-external-card"]',
    appReadySelector: '[data-testid="phase11-complete-step-harness"]',
    viewport: { width: 1440, height: 1200 },
    colorScheme: "light",
  },
];

const modeMgmtScenarios = [
  {
    tcId: "TC-01",
    file: "step-0-no-radio.png",
    route: wizardRoute,
    selector: '[data-testid="wizard-step-info"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    note: "Step 0 の初期表示。ラジオボタンが存在しないことを確認する。",
  },
  {
    tcId: "TC-03",
    file: "step-1-conversation.png",
    route: wizardRoute,
    selector: '[data-testid="wizard-step-conversation-round"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill("#skill-name", "朝の通知ワークフロー");
      await page.fill("#purpose", "毎朝Slackに通知するスキルを作成したい");
      await page.click('button[aria-label="外部連携"]');
      await page.getByRole("button", { name: "次へ" }).click();
      await page.waitForSelector(
        '[data-testid="wizard-step-conversation-round"]',
      );
      await page.waitForTimeout(150);
    },
  },
  {
    tcId: "TC-05",
    file: "step-1-questions.png",
    route: wizardRoute,
    selector: '[data-testid="wizard-step-conversation-round"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill("#skill-name", "朝の通知ワークフロー");
      await page.fill("#purpose", "毎朝Slackに通知するスキルを作成したい");
      await page.click('button[aria-label="外部連携"]');
      await page.getByRole("button", { name: "次へ" }).click();
      await page.waitForSelector(
        '[data-testid="wizard-step-conversation-round"]',
      );
      await page.getByRole("button", { name: "次のページ" }).click();
      await page.waitForSelector("text=Q4: 出力先（どこへ）");
      await page.waitForTimeout(150);
    },
  },
  {
    tcId: "TC-06A",
    file: "step-2-generating.png",
    route: `${wizardRoute}?mode=slow`,
    selector: '[data-testid="wizard-step-generate"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill("#skill-name", "朝の通知ワークフロー");
      await page.fill("#purpose", "毎朝Slackに通知するスキルを作成したい");
      await page.click('button[aria-label="外部連携"]');
      await page.getByRole("button", { name: "次へ" }).click();
      await page.waitForSelector(
        '[data-testid="wizard-step-conversation-round"]',
      );
      await page.getByRole("button", { name: "次のページ" }).click();
      await page.waitForTimeout(120);
      await page.getByRole("button", { name: "今すぐ生成する" }).click();
      await page.waitForSelector('[aria-label="適用サマリー"]');
      await page.getByRole("button", { name: "生成する", exact: true }).click();
      await page.waitForSelector('[data-testid="wizard-step-generate"]');
      await page.waitForTimeout(200);
    },
  },
  {
    tcId: "TC-06B",
    file: "step-3-complete.png",
    route: `${wizardRoute}?mode=slow`,
    selector: '[data-testid="wizard-step-complete"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill("#skill-name", "朝の通知ワークフロー");
      await page.fill("#purpose", "毎朝Slackに通知するスキルを作成したい");
      await page.click('button[aria-label="外部連携"]');
      await page.getByRole("button", { name: "次へ" }).click();
      await page.waitForSelector(
        '[data-testid="wizard-step-conversation-round"]',
      );
      await page.getByRole("button", { name: "次のページ" }).click();
      await page.waitForTimeout(120);
      await page.getByRole("button", { name: "今すぐ生成する" }).click();
      await page.waitForSelector('[aria-label="適用サマリー"]');
      await page.getByRole("button", { name: "生成する", exact: true }).click();
      await page.waitForSelector('[data-testid="wizard-step-complete"]');
      await page.waitForTimeout(200);
    },
  },
];

const stateDetailScenarios = [
  {
    tcId: "MTC-01",
    priority: "A",
    file: "MTC-01-template-error-cancel.png",
    route: `${wizardRoute}?mode=error&templateMode=1`,
    selector: '[data-testid="wizard-step-generate"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill("#skill-name", "テンプレート確認スキル");
      await page.fill("#purpose", "Slackで日報を送るテンプレートを確認する");
      await page.click('button[aria-label="外部連携"]');
      await page.click('button:has-text("次へ")');
      await page.waitForSelector(
        '[data-testid="wizard-step-conversation-round"]',
      );
      await page.click('button:has-text("次のページ")');
      await page.click('button:has-text("今すぐ生成する")');
      await page.waitForSelector('[aria-label="適用サマリー"]');
      await page.click('button:has-text("生成する")');
      await page.waitForSelector('[data-testid="wizard-step-generate"]');
      await page.waitForSelector('button:has-text("キャンセル")');
      await page.waitForTimeout(200);
    },
  },
  {
    tcId: "MTC-02",
    priority: "A",
    file: "MTC-02-template-cancel-step0.png",
    route: `${wizardRoute}?mode=error&templateMode=1`,
    selector: '[data-testid="wizard-step-info"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill("#skill-name", "テンプレート確認スキル");
      await page.fill("#purpose", "Slackで日報を送るテンプレートを確認する");
      await page.click('button[aria-label="外部連携"]');
      await page.click('button:has-text("次へ")');
      await page.waitForSelector(
        '[data-testid="wizard-step-conversation-round"]',
      );
      await page.click('button:has-text("次のページ")');
      await page.click('button:has-text("今すぐ生成する")');
      await page.waitForSelector('[aria-label="適用サマリー"]');
      await page.click('button:has-text("生成する")');
      await page.waitForSelector('[data-testid="wizard-step-generate"]');
      await page.click('button:has-text("キャンセル")');
      await page.waitForSelector('[data-testid="wizard-step-info"]');
      await page.waitForTimeout(200);
    },
  },
  {
    tcId: "MTC-03",
    priority: "A",
    file: "MTC-03-normal-error-no-cancel.png",
    route: `${wizardRoute}?mode=error`,
    selector: '[data-testid="wizard-step-generate"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill("#skill-name", "通常モード確認スキル");
      await page.fill("#purpose", "Slackで通知する");
      await page.click('button[aria-label="外部連携"]');
      await page.click('button:has-text("次へ")');
      await page.waitForSelector(
        '[data-testid="wizard-step-conversation-round"]',
      );
      await page.click('button:has-text("次のページ")');
      await page.click('button:has-text("今すぐ生成する")');
      await page.waitForSelector('[aria-label="適用サマリー"]');
      await page.click('button:has-text("生成する")');
      await page.waitForSelector('[data-testid="wizard-step-generate"]');
      await page.waitForSelector("text=生成エラー");
      await page.waitForTimeout(200);
    },
  },
  {
    tcId: "MTC-04",
    priority: "B",
    file: "MTC-04-retry-reset-step1.png",
    route: wizardRoute,
    selector: '[data-testid="wizard-step-conversation-round"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill("#skill-name", "リトライ確認スキル");
      await page.fill("#purpose", "Slackで日報を送る");
      await page.click('button[aria-label="外部連携"]');
      await page.click('button:has-text("次へ")');
      await page.waitForSelector(
        '[data-testid="wizard-step-conversation-round"]',
      );
      await page.click('button:has-text("自分のみ")');
      await page.click('button:has-text("次のページ")');
      await page.click('button:has-text("今すぐ生成する")');
      await page.waitForSelector('[aria-label="適用サマリー"]');
      await page.click('button:has-text("生成する")');
      await page.waitForSelector('[data-testid="wizard-step-complete"]');
      await page.click('[data-testid="complete-step-feedback-unsatisfied"]');
      await page.waitForSelector('[data-testid="wizard-step-info"]');
      await page.click('button:has-text("次へ")');
      await page.waitForSelector(
        '[data-testid="wizard-step-conversation-round"]',
      );
      await page.waitForTimeout(200);
    },
  },
  {
    tcId: "MTC-05",
    priority: "B",
    file: "MTC-05-q5-external-checklist.png",
    route: wizardRoute,
    selector: '[data-testid="wizard-step-complete"]',
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    preCapture: async (page) => {
      await page.fill("#skill-name", "外部連携確認スキル");
      await page.fill("#purpose", "Slackで日報を送る");
      await page.click('button[aria-label="外部連携"]');
      await page.click('button:has-text("次へ")');
      await page.waitForSelector(
        '[data-testid="wizard-step-conversation-round"]',
      );
      await page.click('button:has-text("次のページ")');
      await page.click('button:has-text("Slack")');
      await page.click('button:has-text("今すぐ生成する")');
      await page.waitForSelector('[aria-label="適用サマリー"]');
      await page.click('button:has-text("生成する")');
      await page.waitForSelector('[data-testid="wizard-step-complete"]');
      await page.waitForSelector(
        '[data-testid="complete-step-external-checklist"]',
      );
      await page.waitForTimeout(200);
    },
  },
];

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

function createMockScript() {
  return () => {
    const now = new Date().toISOString();

    const mode = new URLSearchParams(window.location.search).get("mode");

    const mockUser = {
      id: "e2e-user",
      email: "e2e@example.com",
      displayName: "E2E User",
      avatarUrl: "",
      provider: "google",
      createdAt: now,
      lastSignInAt: now,
    };

    window.electronAPI = {
      auth: {
        checkOnline: async () => ({ success: true, data: { online: true } }),
        getSession: async () => ({
          success: true,
          data: {
            user: mockUser,
            expiresAt: Date.now() + 60 * 60 * 1000,
            isOffline: false,
          },
        }),
        onAuthStateChanged: (callback) => {
          setTimeout(() => {
            callback({ authenticated: true, user: mockUser, isOffline: false });
          }, 10);
          return () => {};
        },
        login: async () => ({ success: true }),
        logout: async () => ({ success: true, data: {} }),
        refresh: async () => ({ success: true, data: {} }),
      },
      theme: {
        get: async () => ({
          success: true,
          data: { mode: "dark", resolvedTheme: "dark" },
        }),
        set: async () => ({ success: true, data: {} }),
        getSystem: async () => ({ success: true, data: { theme: "dark" } }),
        onSystemChanged: () => () => {},
      },
      skill: {
        create: async (params) => {
          if (mode === "slow") {
            await new Promise((resolve) => setTimeout(resolve, 1200));
          } else {
            await new Promise((resolve) => setTimeout(resolve, 300));
          }

          if (mode === "error") {
            throw new Error("スクリーンショット検証用エラー");
          }

          const safeName = (params?.description ?? "new-skill")
            .slice(0, 30)
            .replace(/\s+/g, "-");

          return {
            path: `/mock/skills/${safeName}`,
          };
        },
      },
    };
  };
}

async function captureScenario(browser, scenario, outputDir, baseUrl) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    colorScheme: scenario.colorScheme,
  });
  const scenarioUrl = `${baseUrl}${scenario.route}`;

  try {
    await context.addInitScript(createMockScript());
    const page = await context.newPage();

    await page.goto(scenarioUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await page.waitForSelector(
      scenario.appReadySelector ?? '[data-testid="skill-create-wizard"]',
      {
        timeout: 60_000,
      },
    );

    if (scenario.preCapture) {
      await scenario.preCapture(page);
    }

    await page.waitForSelector(scenario.selector, { timeout: 15_000 });
    await page.waitForTimeout(150);

    const targetPath = path.join(outputDir, scenario.file);
    if (scenario.captureSelector) {
      await page.locator(scenario.captureSelector).screenshot({
        path: targetPath,
      });
    } else {
      await page.screenshot({
        path: targetPath,
        fullPage: true,
      });
    }
  } catch (error) {
    throw new Error(
      `Screenshot capture failed for ${scenario.file} (${scenarioUrl})`,
      { cause: error },
    );
  } finally {
    await context.close();
  }
}

async function main() {
  const options = parseArgs(process.argv);
  const workflowRoot = resolveWorkflowRoot(options.workflowRoot);
  const phase11Root = path.join(workflowRoot, "outputs/phase-11");
  const screenshotDir =
    options.screenshotDir ?? path.join(phase11Root, "screenshots");
  const screenshotPlanPath = path.join(phase11Root, "screenshot-plan.json");
  const captureMetadataPath = path.join(
    phase11Root,
    "phase11-capture-metadata.json",
  );
  const baseUrl = `http://127.0.0.1:${options.port}`;
  const scenarioList = String(options.workflowRoot).includes(
    "WC-par-03a-fix-state-detail",
  )
    ? stateDetailScenarios
    : String(options.workflowRoot).includes("WB-par-02a-fix-mode-mgmt")
      ? modeMgmtScenarios
      : defaultScenarios;
  const needsHarness = scenarioList.some(
    (scenario) => scenario.appReadySelector !== undefined,
  );

  await fs.mkdir(screenshotDir, { recursive: true });

  const server = spawn(
    "pnpm",
    [
      "exec",
      "vite",
      "--config",
      "vite.e2e.config.ts",
      "--host",
      "127.0.0.1",
      "--port",
      options.port,
      "--strictPort",
    ],
    {
      cwd: desktopRoot,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", (data) => process.stdout.write(data));
  server.stderr.on("data", (data) => process.stderr.write(data));

  try {
    await waitForServer(`${baseUrl}${wizardRoute}`);
    if (needsHarness) {
      await waitForServer(`${baseUrl}${completeStepHarnessPath}`);
    }

    const browser = await chromium.launch({ headless: true });
    const capturedFiles = [];
    for (const scenario of scenarioList) {
      await captureScenario(browser, scenario, screenshotDir, baseUrl);
      const screenshotPath = path.join(screenshotDir, scenario.file);
      const stat = await fs.stat(screenshotPath);
      capturedFiles.push({
        tcId: scenario.tcId ?? scenario.file.slice(0, 5),
        state: scenario.file.replace(/\.png$/, ""),
        file: `screenshots/${scenario.file}`,
        capturedAt: stat.mtime.toISOString(),
        priority: scenario.priority ?? "B",
      });
      process.stdout.write(
        `Captured ${path.join(screenshotDir, scenario.file)}\n`,
      );
    }
    const generatedAt = new Date().toISOString();
    await fs.writeFile(
      screenshotPlanPath,
      JSON.stringify(
        {
          generatedAt,
          route: wizardRoute,
          captures: capturedFiles.map((entry) => ({
            tcId: entry.tcId,
            state: entry.state,
            priority: entry.priority,
            file: entry.file,
          })),
        },
        null,
        2,
      ),
    );

    await fs.writeFile(
      captureMetadataPath,
      JSON.stringify(
        {
          generatedAt,
          captureMethod: "current_build_vite_playwright",
          baseUrl,
          harnessPath: completeStepHarnessPath,
          viewportSet: [
            { width: 1440, height: 900 },
            { width: 390, height: 844 },
            { width: 1440, height: 1200 },
          ],
          screenshots: capturedFiles.map((entry) => ({
            tcId: entry.tcId,
            file: entry.file.replace("screenshots/", ""),
            output: `outputs/phase-11/${entry.file}`,
            capturedAt: entry.capturedAt,
            captureMethod: "current_build_vite_playwright",
          })),
        },
        null,
        2,
      ),
    );

    await Promise.race([
      browser.close(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
  } finally {
    if (!server.killed) {
      server.kill("SIGKILL");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
