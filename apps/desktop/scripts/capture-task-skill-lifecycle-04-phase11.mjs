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
  "docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate",
);
const screenshotDir = path.join(workflowRoot, "outputs/phase-11/screenshots");
const metadataPath = path.join(screenshotDir, "capture-results.json");
const port = process.env.TASK_SKILL_LIFECYCLE_04_PORT ?? "5184";
const baseUrl = `http://127.0.0.1:${port}`;
const route = "/advanced/skill-analysis";

const scenarios = [
  {
    id: "TC-11-01",
    name: "初期表示（desktop/dark）",
    file: "TC-11-01-skill-analysis-baseline-dark-desktop.png",
    viewport: { width: 1440, height: 1100 },
    colorScheme: "dark",
    verifySelector: '[data-testid="skill-analysis-view"]',
  },
  {
    id: "TC-11-02",
    name: "改善適用後 Δバッジ表示（desktop/dark）",
    file: "TC-11-02-skill-analysis-delta-dark-desktop.png",
    viewport: { width: 1440, height: 1100 },
    colorScheme: "dark",
    verifySelector: '[data-testid="score-delta-badge"]',
    preCapture: async (page) => {
      await page.waitForSelector('input[type="checkbox"]', { timeout: 15_000 });
      await page.locator('input[type="checkbox"]').first().click();
      await page.getByRole("button", { name: "選択を適用" }).click();
    },
  },
  {
    id: "TC-11-03",
    name: "改善適用後 Δバッジ表示（desktop/light）",
    file: "TC-11-03-skill-analysis-delta-light-desktop.png",
    viewport: { width: 1440, height: 1100 },
    colorScheme: "light",
    verifySelector: '[data-testid="score-delta-badge"]',
    preCapture: async (page) => {
      await page.waitForSelector('input[type="checkbox"]', { timeout: 15_000 });
      await page.locator('input[type="checkbox"]').first().click();
      await page.getByRole("button", { name: "選択を適用" }).click();
    },
  },
  {
    id: "TC-11-04",
    name: "改善適用後 Δバッジ表示（mobile/dark）",
    file: "TC-11-04-skill-analysis-delta-dark-mobile.png",
    viewport: { width: 390, height: 844 },
    colorScheme: "dark",
    verifySelector: '[data-testid="score-delta-badge"]',
    preCapture: async (page) => {
      await page.waitForSelector('input[type="checkbox"]', { timeout: 15_000 });
      await page.locator('input[type="checkbox"]').first().click();
      await page.getByRole("button", { name: "選択を適用" }).click();
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
    let applyTriggered = false;
    let autoTriggered = false;
    const resolveTheme = () =>
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

    const defaultAnalysis = {
      skillName: "task-skill-lifecycle-04-demo",
      overallScore: 55,
      categories: [
        {
          name: "明確さ",
          score: 60,
          details: "前提条件の記述が弱い",
          issues: ["入力例を追加する"],
        },
        {
          name: "完全性",
          score: 50,
          details: "出力フォーマットが曖昧",
          issues: ["期待フォーマットを固定する"],
        },
      ],
      suggestions: [
        {
          type: "prompt",
          priority: "high",
          description: "目的・制約・出力形式を1ブロックに統合する",
          autoFixable: true,
        },
        {
          type: "documentation",
          priority: "medium",
          description: "評価観点を箇条書きで明示する",
          autoFixable: false,
        },
      ],
      risks: [
        {
          category: "maintenance",
          level: "low",
          description: "再利用時に解釈ブレの恐れ",
          impact: "品質が安定しない可能性",
          mitigation: "テンプレート化して再利用",
        },
      ],
      analyzedAt: now,
    };

    const improvedAnalysis = {
      ...defaultAnalysis,
      overallScore: 82,
      categories: [
        {
          name: "明確さ",
          score: 86,
          details: "目的・制約が明確化された",
          issues: [],
        },
        {
          name: "完全性",
          score: 78,
          details: "出力形式が統一された",
          issues: [],
        },
      ],
      suggestions: [],
      risks: [],
    };

    window.confirm = () => true;

    const mockUser = {
      id: "phase11-user",
      email: "phase11@example.com",
      displayName: "Phase11 User",
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
          data: { mode: "system", resolvedTheme: resolveTheme() },
        }),
        set: async ({ mode }) => ({
          success: true,
          data: {
            mode,
            resolvedTheme: mode === "system" ? resolveTheme() : mode,
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
      },
      skill: {
        analyze: async () => {
          if (applyTriggered || autoTriggered) {
            return improvedAnalysis;
          }
          return defaultAnalysis;
        },
        applyImprovements: async () => {
          applyTriggered = true;
          return {
            skillName: "task-skill-lifecycle-04-demo",
            applied: [],
            skipped: [],
            errors: [],
            executedAt: now,
          };
        },
        autoImprove: async () => {
          autoTriggered = true;
          return {
            skillName: "task-skill-lifecycle-04-demo",
            applied: [],
            skipped: [],
            errors: [],
            executedAt: now,
          };
        },
        evaluatePrompt: async () => ({
          success: true,
          data: {
            score: 82,
            feedback: ["十分に具体的です"],
            breakdown: {
              clarity: 86,
              specificity: 80,
              completeness: 78,
              reproducibility: 82,
              security: 84,
            },
          },
        }),
        list: async () => [],
        getImported: async () => [],
        rescan: async () => [],
        import: async () => undefined,
        remove: async () => undefined,
        execute: async () => ({ executionId: `exec-${Date.now()}` }),
        abort: async () => undefined,
        sendPermissionResponse: async () => undefined,
        onStream: () => () => {},
        onComplete: () => () => {},
        onError: () => () => {},
        onPermissionRequest: () => () => {},
        readFile: async () => "# mock",
        writeFile: async () => undefined,
        listBackups: async () => [],
        restoreBackup: async () => undefined,
      },
    };
  };
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
      env: { ...process.env, FORCE_COLOR: "0" },
    },
  );

  server.stdout.on("data", (data) => process.stdout.write(data));
  server.stderr.on("data", (data) => process.stderr.write(data));

  const results = [];
  let browser;
  try {
    await waitForServer(baseUrl);
    browser = await chromium.launch({ headless: true });

    for (const scenario of scenarios) {
      const context = await browser.newContext({
        viewport: scenario.viewport,
        colorScheme: scenario.colorScheme,
      });
      await context.addInitScript(createMockScript());
      const page = await context.newPage();

      await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
      await page.waitForSelector('[data-testid="skill-analysis-view"]', {
        timeout: 15_000,
      });

      if (scenario.preCapture) {
        await scenario.preCapture(page);
      }

      await page.waitForSelector(scenario.verifySelector, { timeout: 15_000 });
      await page.waitForTimeout(300);

      const filePath = path.join(screenshotDir, scenario.file);
      await page.screenshot({ path: filePath, fullPage: true });
      results.push({
        id: scenario.id,
        name: scenario.name,
        file: scenario.file,
        viewport: scenario.viewport,
        colorScheme: scenario.colorScheme,
        verifySelector: scenario.verifySelector,
        status: "captured",
      });
      await context.close();
      process.stdout.write(`Captured: ${filePath}\n`);
    }
  } finally {
    if (browser) await browser.close();
    server.kill("SIGTERM");
  }

  await fs.writeFile(
    metadataPath,
    JSON.stringify(
      {
        taskId: "TASK-SKILL-LIFECYCLE-04",
        capturedAt: new Date().toISOString(),
        baseUrl,
        route,
        screenshots: results,
      },
      null,
      2,
    ),
    "utf8",
  );
  process.stdout.write(`Wrote metadata: ${metadataPath}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
