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
const workflowRoot = path.join(
  repoRoot,
  "docs/30-workflows/completed-tasks/task-045-task-10a-g-lifecycle-test-hardening",
);
const defaultOutputDir = path.join(
  workflowRoot,
  "outputs/phase-11/screenshots",
);

function parseArgs(argv) {
  const options = {
    outputDir: defaultOutputDir,
    port: process.env.TASK_10A_G_SCREENSHOT_PORT ?? "5186",
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--output-dir" && argv[i + 1]) {
      options.outputDir = path.resolve(process.cwd(), argv[i + 1]);
      i += 1;
      continue;
    }
    if (arg === "--port" && argv[i + 1]) {
      options.port = argv[i + 1];
      i += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // retry until timeout
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

function createMockScript() {
  return () => {
    const now = new Date("2026-03-10T11:30:00.000Z").toISOString();
    const query = new URLSearchParams(window.location.search);
    const analysisMode = query.get("mode") ?? "default";
    let applyTriggered = false;

    localStorage.setItem("dev-skip-auth", "true");

    const resolveTheme = () =>
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

    const mockUser = {
      id: "task-10a-g-phase11-user",
      email: "task-10a-g@example.com",
      displayName: "TASK-10A-G Review",
      avatarUrl: null,
      provider: "google",
      createdAt: now,
      lastSignInAt: now,
    };

    const availableSkills = [
      {
        name: "skill-gamma",
        description: "Gamma skill for lifecycle verification",
        path: "/mock/skills/skill-gamma",
        allowedTools: ["Read"],
        updatedAt: now,
        agents: [],
        references: [],
        scripts: [],
        assets: [],
        schemas: [],
        indexes: [],
        otherFiles: [],
      },
    ];

    const importedSkills = [
      {
        name: "skill-alpha",
        description: "Alpha skill for management verification",
        path: "/mock/skills/skill-alpha",
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
    ];

    const baseAnalysis = {
      skillName: "demo-skill",
      overallScore: 72,
      categories: [
        {
          name: "prompt",
          score: 76,
          details: "プロンプト構造は概ね良好です",
          issues: ["冒頭の目的説明を補強"],
        },
        {
          name: "structure",
          score: 68,
          details: "改善フローの説明が不足しています",
          issues: ["改善手順の粒度が粗い"],
        },
      ],
      suggestions: [
        {
          type: "documentation",
          priority: "high",
          description: "改善結果の説明を追加",
          autoFixable: true,
        },
        {
          type: "structure",
          priority: "medium",
          description: "責務ごとの見出しを整理",
          autoFixable: false,
        },
      ],
      risks: [
        {
          category: "maintainability",
          level: "medium",
          description: "改善フローの可読性が低い",
          impact: "保守コスト増加",
          mitigation: "状態遷移を段階別に明文化",
        },
      ],
      analyzedAt: now,
    };

    const improvedAnalysis = {
      ...baseAnalysis,
      overallScore: 91,
      suggestions: [],
      risks: [],
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
      authKey: {
        set: async () => ({ success: true }),
        exists: async () => ({ exists: true }),
        validate: async () => ({ valid: true, message: "ok" }),
        delete: async () => ({ success: true }),
      },
      skill: {
        list: async () => availableSkills,
        getImported: async () => importedSkills,
        import: async (skillName) => ({
          ...importedSkills[0],
          name: skillName,
          description: `Imported: ${skillName}`,
        }),
        remove: async () => ({ success: true }),
        rescan: async () => availableSkills,
        readFile: async (_skillName, relativePath) =>
          `# ${relativePath}\n\nMock content`,
        writeFile: async () => undefined,
        listBackups: async () => [],
        restoreBackup: async () => undefined,
        create: async ({ description }) => {
          await new Promise((resolve) => setTimeout(resolve, 200));
          return {
            path: `/mock/skills/${(description ?? "new-skill")
              .trim()
              .slice(0, 24)
              .replace(/\s+/g, "-")}`,
          };
        },
        analyze: async () => {
          await new Promise((resolve) => setTimeout(resolve, 200));
          if (analysisMode === "improved" || applyTriggered) {
            return improvedAnalysis;
          }
          return baseAnalysis;
        },
        applyImprovements: async () => {
          applyTriggered = true;
          await new Promise((resolve) => setTimeout(resolve, 150));
          return {
            skillName: "demo-skill",
            applied: [],
            skipped: [],
            errors: [],
            executedAt: now,
          };
        },
        autoImprove: async () => ({
          skillName: "demo-skill",
          applied: [],
          skipped: [],
          errors: [],
          executedAt: now,
        }),
        execute: async () => ({
          executionId: "exec-review-001",
          success: true,
        }),
        abort: async () => undefined,
        sendPermissionResponse: async () => ({ success: true }),
        onStream: () => () => {},
        onComplete: () => () => {},
        onError: () => () => {},
        onPermissionRequest: () => () => {},
      },
    };
  };
}

const scenarios = [
  {
    tcId: "TC-11-01",
    file: "TC-11-01-chatpanel-executing-guard.png",
    route:
      "/advanced/concurrency-guard-review?scenario=chat-panel&skipAuth=true",
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
    readySelector: '[data-testid="chat-panel"]',
    postReady: async (page) => {
      await page.waitForSelector(
        '[data-testid="skill-management-toggle"][disabled]',
      );
    },
  },
  {
    tcId: "TC-11-02",
    file: "TC-11-02-skill-management-panel-default.png",
    route: "/advanced/skill-management-panel?skipAuth=true",
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
    readySelector: '[data-testid="skill-management-panel"]',
    postReady: async (page) => {
      await page.waitForSelector(
        '[data-testid="imported-skill-card-skill-alpha"]',
      );
      await page.waitForSelector(
        '[data-testid="available-skill-row-skill-gamma"]',
      );
    },
  },
  {
    tcId: "TC-11-03",
    file: "TC-11-03-skill-create-wizard-complete.png",
    route: "/advanced/skill-create-wizard?skipAuth=true",
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
    readySelector: '[data-testid="skill-create-wizard"]',
    postReady: async (page) => {
      await page.fill(
        "#skill-description",
        "ファイル整理と命名規則の統一を支援するスキル",
      );
      await page.getByRole("button", { name: "次へ" }).click();
      await page.getByRole("button", { name: "スキルを生成" }).click();
      await page.waitForSelector("text=スキルが作成されました");
    },
  },
  {
    tcId: "TC-11-04",
    file: "TC-11-04-skill-analysis-default.png",
    route: "/advanced/skill-analysis?skipAuth=true",
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
    readySelector: '[data-testid="skill-analysis-view"]',
    postReady: async (page) => {
      await page.waitForSelector("text=demo-skill");
    },
  },
  {
    tcId: "TC-11-05",
    file: "TC-11-05-skill-analysis-improved.png",
    route: "/advanced/skill-analysis?skipAuth=true&mode=improved",
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
    readySelector: '[data-testid="skill-analysis-view"]',
    postReady: async (page) => {
      await page.waitForSelector("text=91");
    },
  },
];

async function captureScenario(browser, baseUrl, outputDir, scenario) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    colorScheme: scenario.colorScheme,
  });

  try {
    await context.addInitScript(createMockScript());
    const page = await context.newPage();
    await page.goto(`${baseUrl}${scenario.route}`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await page.waitForSelector(scenario.readySelector, { timeout: 30_000 });
    if (scenario.postReady) {
      await scenario.postReady(page);
    }
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(outputDir, scenario.file),
      fullPage: true,
    });
    return {
      tcId: scenario.tcId,
      file: scenario.file,
      route: scenario.route,
      viewport: scenario.viewport,
      colorScheme: scenario.colorScheme,
      capturedAt: new Date().toISOString(),
    };
  } finally {
    await context.close();
  }
}

async function main() {
  const options = parseArgs(process.argv);
  const outputDir = options.outputDir;
  const metadataPath = path.join(outputDir, "phase11-capture-metadata.json");
  const baseUrl = `http://127.0.0.1:${options.port}`;

  await mkdir(outputDir, { recursive: true });

  const server = spawn(
    "pnpm",
    [
      "exec",
      "vite",
      "--config",
      "vite.e2e.config.ts",
      "--port",
      String(options.port),
      "--strictPort",
      "--host",
      "127.0.0.1",
    ],
    {
      cwd: desktopRoot,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", (data) => process.stdout.write(data));
  server.stderr.on("data", (data) => process.stderr.write(data));

  let browser;
  try {
    await waitForServer(`${baseUrl}/?skipAuth=true`);
    browser = await chromium.launch();
    const captures = [];
    for (const scenario of scenarios) {
      captures.push(
        await captureScenario(browser, baseUrl, outputDir, scenario),
      );
      console.log(`✓ ${scenario.file}`);
    }

    await writeFile(
      metadataPath,
      JSON.stringify(
        {
          taskId: "TASK-10A-G",
          capturedAt: new Date().toISOString(),
          baseUrl,
          outputDir,
          captures,
        },
        null,
        2,
      ),
      "utf8",
    );
    console.log(`✓ phase11-capture-metadata.json`);
  } finally {
    if (browser) {
      await browser.close();
    }
    if (!server.killed) {
      server.kill("SIGTERM");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
