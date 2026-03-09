#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(desktopRoot, "..", "..");
const workflowRoot = path.join(
  repoRoot,
  "docs/30-workflows/completed-tasks/task-045-lifecycle-test-hardening",
);
const defaultScreenshotDir = path.join(
  workflowRoot,
  "outputs/phase-11/screenshots",
);
const defaultMetadataPath = path.join(
  defaultScreenshotDir,
  "phase11-capture-metadata.json",
);
const port = "5183";
const baseUrl = `http://localhost:${port}`;

function parseArgs(argv) {
  const options = {
    screenshotDir: defaultScreenshotDir,
    metadataPath: defaultMetadataPath,
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--output-dir" && argv[index + 1]) {
      options.screenshotDir = path.resolve(process.cwd(), argv[index + 1]);
      options.metadataPath = path.join(
        options.screenshotDir,
        "phase11-capture-metadata.json",
      );
      index += 1;
    }
  }

  return options;
}

function startViteServer() {
  const server = spawn(
    "pnpm",
    [
      "exec",
      "vite",
      "--config",
      "vite.e2e.config.ts",
      "--port",
      port,
      "--strictPort",
    ],
    {
      cwd: desktopRoot,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", (chunk) => process.stdout.write(chunk));
  server.stderr.on("data", (chunk) => process.stderr.write(chunk));

  return server;
}

async function stopViteServer(server) {
  if (server.killed || server.exitCode !== null) {
    return;
  }

  await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      if (!server.killed && server.exitCode === null) {
        server.kill("SIGKILL");
      }
    }, 5_000);

    server.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });

    server.kill("SIGTERM");
  });
}

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

  throw new Error(`Timed out waiting for ${url}`);
}

function createCreateWizardMockScript() {
  return () => {
    const now = new Date().toISOString();
    sessionStorage.setItem("debug-clear-storage", "done");
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
          await new Promise((resolve) =>
            setTimeout(resolve, mode === "slow" ? 1200 : 300),
          );

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

function createSkillAnalysisMockScript() {
  return () => {
    const now = new Date().toISOString();
    let applyTriggered = false;
    let autoTriggered = false;
    const resolveTheme = () =>
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

    const defaultAnalysis = {
      skillName: "demo-skill",
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
        {
          type: "documentation",
          priority: "low",
          description: "公開APIの説明を補強",
          autoFixable: true,
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

    const improvedAnalysis = {
      ...defaultAnalysis,
      overallScore: 91,
      suggestions: [],
      risks: [],
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

    window.confirm = () => true;
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
          const mode = new URLSearchParams(window.location.search).get("mode");
          if (mode === "error") {
            throw new Error("分析APIエラー（スクリーンショット検証用）");
          }
          if (mode === "loading") {
            return new Promise(() => {});
          }
          if (mode === "improved" || applyTriggered || autoTriggered) {
            return improvedAnalysis;
          }
          return defaultAnalysis;
        },
        applyImprovements: async () => {
          applyTriggered = true;
          return {
            skillName: "demo-skill",
            applied: [],
            skipped: [],
            errors: [],
            executedAt: now,
          };
        },
        autoImprove: async () => {
          autoTriggered = true;
          return {
            skillName: "demo-skill",
            applied: [],
            skipped: [],
            errors: [],
            executedAt: now,
          };
        },
      },
    };
  };
}

function createSkillManagementMockScript() {
  return () => {
    const now = new Date().toISOString();
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
        getImported: async () => defaultImportedSkills,
        remove: async () => undefined,
        readFile: async (_skillName, relativePath) =>
          `# ${relativePath}\n\nMock content`,
        writeFile: async () => undefined,
        listBackups: async () => [],
        restoreBackup: async () => undefined,
        rescan: async () => availableSkills,
        create: async (params) => ({
          path: `/mock/skills/${(params?.description ?? "new-skill").replace(/\s+/g, "-")}`,
        }),
      },
    };
  };
}

const scenarios = [
  {
    tcId: "TC-11-01",
    file: "TC-11-01-create-wizard-initial-dark.png",
    url: `${baseUrl}/advanced/skill-create-wizard`,
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    initScript: createCreateWizardMockScript(),
    verify: async (page) => {
      await expect(page.getByTestId("skill-create-wizard")).toBeVisible();
      await expect(page.getByTestId("wizard-step-describe")).toBeVisible();
      await expect(page.getByRole("button", { name: "次へ" })).toBeDisabled();
    },
  },
  {
    tcId: "TC-11-02",
    file: "TC-11-02-create-wizard-error-dark.png",
    url: `${baseUrl}/advanced/skill-create-wizard?mode=error`,
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    initScript: createCreateWizardMockScript(),
    prepare: async (page) => {
      await page.fill("#skill-description", "スクリーンショット再監査");
      await page.getByRole("button", { name: "次へ" }).click();
      await page.getByRole("button", { name: "スキルを生成" }).click();
    },
    verify: async (page) => {
      await expect(page.getByTestId("skill-create-wizard")).toBeVisible();
      await expect(page.getByText("スキル生成に失敗しました")).toBeVisible();
    },
  },
  {
    tcId: "TC-11-03",
    file: "TC-11-03-analysis-default-dark.png",
    url: `${baseUrl}/advanced/skill-analysis`,
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    initScript: createSkillAnalysisMockScript(),
    verify: async (page) => {
      await expect(page.getByTestId("skill-analysis-view")).toBeVisible();
      await expect(page.getByText("Code Quality")).toBeVisible();
      await expect(page.getByText("入力値検証を追加")).toBeVisible();
    },
  },
  {
    tcId: "TC-11-04",
    file: "TC-11-04-analysis-selection-dark.png",
    url: `${baseUrl}/advanced/skill-analysis`,
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    initScript: createSkillAnalysisMockScript(),
    prepare: async (page) => {
      await page.locator('input[type="checkbox"]').first().click();
    },
    verify: async (page) => {
      await expect(page.getByTestId("skill-analysis-view")).toBeVisible();
      await expect(page.locator('input[type="checkbox"]').first()).toBeChecked();
      await expect(page.getByText("高優先度")).toBeVisible();
    },
  },
  {
    tcId: "TC-11-05",
    file: "TC-11-05-analysis-error-dark.png",
    url: `${baseUrl}/advanced/skill-analysis?mode=error`,
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    initScript: createSkillAnalysisMockScript(),
    verify: async (page) => {
      await expect(page.getByRole("alert")).toBeVisible();
      await expect(
        page.getByText("分析APIエラー（スクリーンショット検証用）"),
      ).toBeVisible();
    },
  },
  {
    tcId: "TC-11-06",
    file: "TC-11-06-analysis-loading-dark.png",
    url: `${baseUrl}/advanced/skill-analysis?mode=loading`,
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    initScript: createSkillAnalysisMockScript(),
    verify: async (page) => {
      await expect(page.getByText("分析中...")).toBeVisible();
    },
  },
  {
    tcId: "TC-11-07",
    file: "TC-11-07-skill-management-list.png",
    url: `${baseUrl}/advanced/skill-management-panel`,
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    initScript: createSkillManagementMockScript(),
    verify: async (page) => {
      await expect(page.getByTestId("skill-management-panel")).toBeVisible();
      await expect(
        page.getByTestId("imported-skill-card-skill-alpha"),
      ).toBeVisible();
      await expect(
        page.getByTestId("available-skill-row-skill-gamma"),
      ).toBeVisible();
    },
  },
  {
    tcId: "TC-11-08",
    file: "TC-11-08-skill-management-create-view.png",
    url: `${baseUrl}/advanced/skill-management-panel`,
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    initScript: createSkillManagementMockScript(),
    prepare: async (page) => {
      await page.getByRole("button", { name: "新規作成" }).click();
    },
    verify: async (page) => {
      await expect(
        page.getByTestId("skill-management-panel-create-view"),
      ).toBeVisible();
      await expect(page.getByTestId("skill-create-wizard")).toBeVisible();
    },
  },
  {
    tcId: "TC-11-09",
    file: "TC-11-09-chat-panel-disabled-toggle.png",
    url: `${baseUrl}/advanced/concurrency-guard-review?skipAuth=true&scenario=chat-panel`,
    viewport: { width: 1440, height: 1180 },
    colorScheme: "dark",
    verify: async (page) => {
      await expect(
        page.getByTestId("concurrency-guard-harness"),
      ).toBeVisible();
      await expect(page.getByTestId("skill-management-toggle")).toBeDisabled();
      await expect(page.getByTestId("skill-streaming-view")).toBeVisible();
    },
  },
];

async function captureScenario(browser, scenario, screenshotDir) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    colorScheme: scenario.colorScheme,
  });
  const page = await context.newPage();
  const pageErrors = [];

  if (scenario.initScript) {
    await context.addInitScript(scenario.initScript);
  }

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  try {
    await page.goto(scenario.url, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(300);

    if (scenario.prepare) {
      await scenario.prepare(page);
      await page.waitForTimeout(300);
    }

    await scenario.verify(page);
    await page.waitForTimeout(200);

    const screenshotPath = path.join(screenshotDir, scenario.file);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    const stat = await fs.stat(screenshotPath);

    return {
      tcId: scenario.tcId,
      file: scenario.file,
      url: scenario.url,
      capturedAt: stat.mtime.toISOString(),
      pageErrors,
    };
  } finally {
    await context.close();
  }
}

async function main() {
  const options = parseArgs(process.argv);
  await fs.mkdir(options.screenshotDir, { recursive: true });

  const server = startViteServer();
  let browser;

  try {
    await waitForServer(baseUrl);
    browser = await chromium.launch({ headless: true });
    const results = [];

    for (const scenario of scenarios) {
      const result = await captureScenario(
        browser,
        scenario,
        options.screenshotDir,
      );
      results.push(result);
      process.stdout.write(`Captured ${scenario.tcId}: ${scenario.file}\n`);
    }

    await fs.writeFile(
      options.metadataPath,
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          baseUrl,
          workflowRoot,
          scenarios: results,
        },
        null,
        2,
      ),
    );
  } finally {
    if (browser) {
      await browser.close();
    }
    await stopViteServer(server);
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
