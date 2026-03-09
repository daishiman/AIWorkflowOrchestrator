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
const screenshotDir = path.join(
  repoRoot,
  "docs/30-workflows/completed-tasks/TASK-10A-A-SKILL-MANAGEMENT-PANEL/outputs/phase-11/screenshots",
);
const baseUrl = "http://localhost:5173";
const panelRoute = "/advanced/skill-management-panel";

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Retry until timeout.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

function createMockScript() {
  return () => {
    const now = new Date().toISOString();
    const defaultAnalysis = {
      skillName: "skill-alpha",
      overallScore: 72,
      categories: [
        {
          name: "Code Quality",
          score: 78,
          details: "可読性と保守性に改善余地があります",
          issues: ["重複ロジック", "命名の一貫性"],
        },
        {
          name: "Security",
          score: 65,
          details: "入力検証の強化が必要です",
          issues: ["境界値チェック不足"],
        },
      ],
      suggestions: [
        {
          type: "security",
          priority: "high",
          description: "入力値検証を追加",
          autoFixable: true,
        },
        {
          type: "structure",
          priority: "medium",
          description: "責務分離のためにフックを抽出",
          autoFixable: false,
        },
      ],
      risks: [
        {
          category: "security",
          level: "high",
          description: "入力値の想定外形式により例外が発生する可能性",
          impact: "ランタイム障害と品質低下",
          mitigation: "入力スキーマと境界値テストを追加",
        },
      ],
      analyzedAt: now,
    };
    const defaultImportedSkills = [
      {
        name: "skill-alpha",
        description: "Alpha skill for screenshot test",
        path: "/skills/skill-alpha",
        allowedTools: ["Read", "Write"],
        updatedAt: now,
        importedAt: now,
        status: "active",
        agents: [],
        references: [],
        scripts: [],
        assets: [],
        schemas: [],
        indexes: [],
        otherFiles: [],
      },
      {
        name: "skill-beta",
        description: "Beta skill for screenshot test",
        path: "/skills/skill-beta",
        allowedTools: ["Read"],
        updatedAt: now,
        importedAt: now,
        status: "active",
        agents: [],
        references: [],
        scripts: [],
        assets: [],
        schemas: [],
        indexes: [],
        otherFiles: [],
      },
    ];

    const availableSkills = [
      {
        name: "skill-gamma",
        displayName: "Skill Gamma",
        description: "Gamma skill",
        version: "1.0.0",
        category: "automation",
        tags: ["automation"],
        author: "E2E",
        path: "/skills/skill-gamma",
      },
    ];

    let importedSkills = [...defaultImportedSkills];
    const wait = (ms) =>
      new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    const getMockDelayMs = () => {
      const value = window.localStorage.getItem("mock-skill-delay-ms");
      const parsed = Number(value ?? "0");
      return Number.isFinite(parsed) ? parsed : 0;
    };

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
        list: async () => availableSkills,
        getImported: async () => {
          const delayMs = getMockDelayMs();
          if (delayMs > 0) {
            await wait(delayMs);
          }
          return importedSkills;
        },
        analyze: async () => defaultAnalysis,
        applyImprovements: async () => ({
          skillName: "skill-alpha",
          applied: [],
          skipped: [],
          errors: [],
          executedAt: now,
        }),
        autoImprove: async () => ({
          skillName: "skill-alpha",
          applied: [],
          skipped: [],
          errors: [],
          executedAt: now,
        }),
        remove: async (skillName) => {
          importedSkills = importedSkills.filter((s) => s.name !== skillName);
        },
        readFile: async (_skillName, relativePath) =>
          `# ${relativePath}\n\nMock content`,
        writeFile: async () => undefined,
        listBackups: async () => [],
        restoreBackup: async () => undefined,
        rescan: async () => availableSkills,
      },
    };
  };
}

async function captureScenario(page, filename, runScenario) {
  await runScenario(page);
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(screenshotDir, filename),
    fullPage: true,
  });
  console.log(`✓ ${filename}`);
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
      "--port",
      "5173",
      "--strictPort",
    ],
    {
      cwd: desktopRoot,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", (data) => {
    process.stdout.write(data);
  });
  server.stderr.on("data", (data) => {
    process.stderr.write(data);
  });

  let browser;
  try {
    await waitForServer(baseUrl);
    browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: "dark",
    });
    const page = await context.newPage();
    await page.addInitScript(createMockScript());

    await captureScenario(page, "tc-01-skill-list.png", async (p) => {
      await p.goto(`${baseUrl}${panelRoute}`);
      await p.waitForSelector('[data-testid="skill-management-panel"]');
      await p.waitForSelector("text=skill-alpha");
    });

    await captureScenario(page, "tc-02-search-no-result.png", async (p) => {
      await p.goto(`${baseUrl}${panelRoute}`);
      await p.waitForSelector('[data-testid="skill-management-panel"]');
      await p.getByLabel("スキルを検索").fill("nonexistent-skill");
      await p.waitForSelector("text=検索条件に一致するスキルはありません");
    });

    await captureScenario(page, "tc-03-editor-view.png", async (p) => {
      await p.goto(`${baseUrl}${panelRoute}`);
      await p.waitForSelector('[data-testid="skill-management-panel"]');
      await p.getByLabel("skill-alpha を編集").click();
      await p.waitForSelector('[data-testid="skill-management-panel-editor-view"]');
    });

    await captureScenario(page, "tc-04-analysis-view.png", async (p) => {
      await p.goto(`${baseUrl}${panelRoute}`);
      await p.waitForSelector('[data-testid="skill-management-panel"]');
      await p.getByLabel("skill-alpha を分析").click();
      await p.waitForSelector(
        '[data-testid="skill-management-panel-analysis-view"]',
      );
    });

    await captureScenario(page, "tc-05-delete-dialog.png", async (p) => {
      await p.goto(`${baseUrl}${panelRoute}`);
      await p.waitForSelector('[data-testid="skill-management-panel"]');
      await p.getByLabel("skill-alpha を削除").click();
      await p.waitForSelector('[role="dialog"]');
    });

    await captureScenario(page, "tc-06-create-view.png", async (p) => {
      await p.goto(`${baseUrl}${panelRoute}`);
      await p.waitForSelector('[data-testid="skill-management-panel"]');
      await p.getByRole("button", { name: "新規作成" }).click();
      await p.waitForSelector('[data-testid="skill-management-panel-create-view"]');
    });

    await captureScenario(page, "tc-07-loading.png", async (p) => {
      await p.goto(`${baseUrl}${panelRoute}`);
      await p.evaluate(() => {
        window.localStorage.setItem("mock-skill-delay-ms", "2000");
      });
      await p.goto(`${baseUrl}${panelRoute}`);
      await p.waitForSelector("text=読み込み中...");
      await p.evaluate(() => {
        window.localStorage.setItem("mock-skill-delay-ms", "0");
      });
    });

    await captureScenario(page, "tc-08-empty-state.png", async (p) => {
      await p.goto(`${baseUrl}${panelRoute}`);
      await p.waitForSelector('[data-testid="skill-management-panel"]');
      await p.getByLabel("skill-alpha を削除").click();
      await p.getByRole("button", { name: "削除する" }).click();
      await p.waitForTimeout(200);
      await p.getByLabel("skill-beta を削除").click();
      await p.getByRole("button", { name: "削除する" }).click();
      await p.waitForSelector("text=インポート済みのスキルはありません");
    });

    await captureScenario(page, "tc-09-keyboard-focus.png", async (p) => {
      await p.goto(`${baseUrl}${panelRoute}`);
      await p.waitForSelector('[data-testid="skill-management-panel"]');
      await p.keyboard.press("Tab");
      await p.keyboard.press("Tab");
      await p.waitForTimeout(150);
    });

    await captureScenario(page, "tc-10-dark-mode.png", async (p) => {
      await p.goto(`${baseUrl}${panelRoute}`);
      await p.waitForSelector('[data-testid="skill-management-panel"]');
    });

    await context.close();
  } finally {
    if (browser) await browser.close();
    if (!server.killed) {
      server.kill("SIGTERM");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
