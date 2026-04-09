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
  "docs/30-workflows/skill-wizard-multi-select-options",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const manifestPath = path.join(phase11Root, "screenshot-manifest.json");
const devtoolsAuditPath = path.join(phase11Root, "devtools-audit.md");
const port = process.env.SKILL_WIZARD_MULTI_SELECT_PHASE11_PORT ?? "5183";

const baseUrl = `http://127.0.0.1:${port}`;
const route = `${baseUrl}/advanced/skill-create-wizard?skipAuth=true`;

function createMockScript() {
  return () => {
    const now = new Date().toISOString();

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

async function prepareWizardToStep1(page) {
  await page.goto(route, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.waitForSelector('[data-testid="skill-create-wizard"]', {
    timeout: 60_000,
  });

  await page.getByRole("textbox", { name: /目的/ }).fill("Slack に毎日通知する");
  await page.getByRole("button", { name: "外部連携" }).click();
  await page.getByRole("button", { name: "次へ" }).click();
  await page.waitForSelector('[data-testid="wizard-step-conversation-round"]', {
    timeout: 60_000,
  });
  await page.waitForTimeout(200);
}

async function captureScreenshot(page, target, filePath) {
  if (target.kind === "locator") {
    const locator = page.locator(target.selector).first();
    await locator.waitFor({ state: "visible", timeout: 15_000 });
    await locator.screenshot({ path: filePath });
    return;
  }

  await page.screenshot({ path: filePath, fullPage: true });
}

const scenarios = [
  {
    file: "smart-defaults-applied.png",
    target: { kind: "fullPage" },
    preCapture: prepareWizardToStep1,
  },
  {
    file: "q3-schedule-expanded.png",
    target: {
      kind: "locator",
      selector: 'section:has-text("Q3: 実行タイミング")',
    },
    preCapture: prepareWizardToStep1,
  },
  {
    file: "q1-single-select.png",
    target: {
      kind: "locator",
      selector: 'section:has-text("Q1: 利用者（誰が使うか）")',
    },
    preCapture: async (page) => {
      await prepareWizardToStep1(page);
      await page.getByRole("button", { name: "自分のみ" }).click();
      await page.waitForTimeout(150);
    },
  },
  {
    file: "q1-multi-select.png",
    target: {
      kind: "locator",
      selector: 'section:has-text("Q1: 利用者（誰が使うか）")',
    },
    preCapture: async (page) => {
      await prepareWizardToStep1(page);
      await page.getByRole("button", { name: "自分のみ" }).click();
      await page.getByRole("button", { name: "チームメンバー" }).click();
      await page.waitForTimeout(150);
    },
  },
  {
    file: "q1-all-deselected.png",
    target: {
      kind: "locator",
      selector: 'section:has-text("Q1: 利用者（誰が使うか）")',
    },
    preCapture: async (page) => {
      await prepareWizardToStep1(page);
      await page.getByRole("button", { name: "自分のみ" }).click();
      await page.getByRole("button", { name: "チームメンバー" }).click();
      await page.getByRole("button", { name: "自分のみ" }).click();
      await page.getByRole("button", { name: "チームメンバー" }).click();
      await page.waitForTimeout(150);
    },
  },
  {
    file: "q3-schedule-plus-manual.png",
    target: {
      kind: "locator",
      selector: 'section:has-text("Q3: 実行タイミング")',
    },
    preCapture: async (page) => {
      await prepareWizardToStep1(page);
      await page.getByRole("button", { name: "手動実行" }).click();
      await page.waitForTimeout(150);
    },
  },
  {
    file: "q3-schedule-collapsed.png",
    target: {
      kind: "locator",
      selector: 'section:has-text("Q3: 実行タイミング")',
    },
    preCapture: async (page) => {
      await prepareWizardToStep1(page);
      await page.getByRole("button", { name: "手動実行" }).click();
      await page.getByRole("button", { name: "定期実行" }).click();
      await page.waitForTimeout(150);
    },
  },
  {
    file: "apply-summary-card-defaults.png",
    target: {
      kind: "locator",
      selector: '[aria-label="適用サマリー"]',
    },
    preCapture: async (page) => {
      await prepareWizardToStep1(page);
      await page.getByRole("button", { name: "今すぐ生成する" }).click();
      await page.waitForSelector('[aria-label="適用サマリー"]', {
        timeout: 15_000,
      });
      await page.waitForTimeout(150);
    },
  },
  {
    file: "keyboard-focus-button.png",
    target: {
      kind: "locator",
      selector: 'section:has-text("Q1: 利用者（誰が使うか）")',
    },
    preCapture: async (page) => {
      await prepareWizardToStep1(page);
      await page.getByRole("button", { name: "自分のみ" }).focus();
      await page.waitForTimeout(150);
    },
  },
];

async function captureScenario(browser, scenario, outputDir) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
    colorScheme: "dark",
  });
  const consoleIssues = [];

  try {
    await context.addInitScript(createMockScript());
    const page = await context.newPage();

    page.on("pageerror", (error) => {
      consoleIssues.push({
        kind: "pageerror",
        message: error.message,
        stack: error.stack ?? null,
      });
    });

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleIssues.push({
          kind: "console",
          message: message.text(),
          location: message.location(),
        });
      }
    });

    if (scenario.preCapture) {
      await scenario.preCapture(page);
    } else {
      await prepareWizardToStep1(page);
    }

    const targetSelector =
      scenario.target.kind === "locator" ? scenario.target.selector : null;
    if (targetSelector) {
      await page.waitForSelector(targetSelector, { timeout: 15_000 });
    }
    await page.waitForTimeout(150);

    const screenshotPath = path.join(outputDir, scenario.file);
    await captureScreenshot(page, scenario.target, screenshotPath);

    return {
      file: scenario.file,
      screenshotPath,
      consoleIssues,
    };
  } finally {
    await context.close();
  }
}

async function main() {
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
      port,
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
    await waitForServer(route);

    const browser = await chromium.launch({ headless: true });
    const captured = [];
    const consoleIssues = [];

    for (const scenario of scenarios) {
      const result = await captureScenario(browser, scenario, screenshotDir);
      captured.push({
        file: result.file,
        path: `screenshots/${result.file}`,
      });
      consoleIssues.push(...result.consoleIssues);
      process.stdout.write(`Captured ${result.screenshotPath}\n`);
    }

    await fs.writeFile(
      manifestPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          route: "/advanced/skill-create-wizard?skipAuth=true",
          captures: captured,
        },
        null,
        2,
      ),
    );

    await fs.writeFile(
      devtoolsAuditPath,
      [
        "# DevTools Console Audit",
        "",
        `- Checked at: ${new Date().toISOString()}`,
        `- Console error count: ${consoleIssues.length}`,
        "",
        consoleIssues.length === 0
          ? "- Result: PASS (no console or page errors observed)"
          : `- Result: FAIL (${consoleIssues.length} issue(s))`,
        "",
        consoleIssues.length === 0 ? "" : "## Issues",
        ...consoleIssues.map((issue, index) => {
          const header = `### Issue ${index + 1}`;
          if (issue.kind === "pageerror") {
            return [
              header,
              "",
              `- kind: pageerror`,
              `- message: ${issue.message}`,
              issue.stack ? `- stack: ${issue.stack}` : null,
              "",
            ]
              .filter(Boolean)
              .join("\n");
          }

          return [
            header,
            "",
            `- kind: console`,
            `- message: ${issue.message}`,
            issue.location?.url ? `- url: ${issue.location.url}` : null,
            issue.location?.lineNumber
              ? `- line: ${issue.location.lineNumber}`
              : null,
            issue.location?.columnNumber
              ? `- column: ${issue.location.columnNumber}`
              : null,
            "",
          ]
            .filter(Boolean)
            .join("\n");
        }),
        "",
      ].join("\n"),
    );

    await Promise.race([
      browser.close(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);

    if (consoleIssues.length > 0) {
      throw new Error(
        `Console audit detected ${consoleIssues.length} issue(s). See ${devtoolsAuditPath}`,
      );
    }
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
