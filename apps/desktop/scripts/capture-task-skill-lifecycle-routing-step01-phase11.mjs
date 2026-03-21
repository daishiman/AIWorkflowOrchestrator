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
  "docs/30-workflows/completed-tasks/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation",
);
const outputDir = path.join(workflowRoot, "outputs/phase-11/screenshots");
const metadataPath = path.join(outputDir, "phase11-capture-metadata.json");
const vitePort = process.env.SLR_STEP01_SCREENSHOT_PORT ?? "5194";
const baseUrl = `http://127.0.0.1:${vitePort}`;

const defaultViewport = { width: 1440, height: 960 };

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 90_000) {
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
    await wait(400);
  }
  throw new Error(`Timed out waiting for Vite server: ${url}`);
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
      vitePort,
    ],
    {
      cwd: desktopRoot,
      stdio: "pipe",
      env: {
        ...process.env,
        FORCE_COLOR: "0",
      },
    },
  );

  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));
  return child;
}

function createMockScript() {
  return () => {
    const createNamespaceProxy = (entries = {}) =>
      new Proxy(entries, {
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

    const now = new Date("2026-03-17T02:30:00.000Z").toISOString();

    localStorage.setItem("dev-skip-auth", "true");

    const resolveTheme = () =>
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

    const clone = (value) => JSON.parse(JSON.stringify(value));

    const mockUser = {
      id: "step01-phase11-user",
      email: "step01-phase11@example.com",
      displayName: "Step01 Phase11 Reviewer",
      avatarUrl: null,
      provider: "google",
      createdAt: now,
      lastSignInAt: now,
    };

    const availableSkills = [
      {
        name: "skill-alpha",
        description: "renderView 契約確認用",
        path: "/mock/skills/skill-alpha",
        allowedTools: ["Read", "Write"],
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
        description: "sample imported skill",
        path: "/mock/imported/skill-alpha",
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

    const mockAnalysis = {
      skillName: "skill-alpha",
      overallScore: 84,
      categories: [
        {
          name: "routing",
          score: 88,
          details: "renderView と ViewType 契約は維持されています。",
          issues: [],
        },
      ],
      suggestions: [
        {
          type: "documentation",
          priority: "low",
          description: "ViewType 追加時は screenshot plan を更新する。",
          autoFixable: false,
        },
      ],
      risks: [],
      analyzedAt: now,
    };

    const noop = async () => ({ success: true, data: {} });

    window.confirm = () => true;

    const namespaces = {
      auth: createNamespaceProxy({
        checkOnline: async () => ({ success: true, data: { online: true } }),
        getSession: async () => ({
          success: true,
          data: {
            user: clone(mockUser),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            isOffline: false,
          },
        }),
        onAuthStateChanged: (callback) => {
          setTimeout(() => {
            callback({
              authenticated: true,
              user: clone(mockUser),
              isOffline: false,
            });
          }, 10);
          return () => {};
        },
        login: async () => ({ success: true }),
        logout: noop,
        refresh: async () => ({
          success: true,
          data: {
            user: clone(mockUser),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            isOffline: false,
          },
        }),
      }),
      theme: createNamespaceProxy({
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
      }),
      profile: createNamespaceProxy({
        get: async () => ({ success: true, data: clone(mockUser) }),
        getProviders: async () => ({ success: true, data: [] }),
        update: noop,
        linkProvider: noop,
        unlinkProvider: noop,
        delete: noop,
      }),
      avatar: createNamespaceProxy({
        upload: noop,
        useProvider: noop,
        remove: noop,
      }),
      notification: createNamespaceProxy({
        getHistory: async () => ({
          success: true,
          data: { notifications: [], totalCount: 0 },
        }),
        markRead: noop,
        markAllRead: noop,
        clear: noop,
      }),
      historySearch: createNamespaceProxy({
        search: async () => ({
          success: true,
          data: { items: [], totalCount: 0, hasMore: false },
        }),
        getStats: async () => ({
          success: true,
          data: { chat: 0, file: 0, skill: 0, total: 0 },
        }),
      }),
      authKey: createNamespaceProxy({
        set: noop,
        exists: async () => ({ exists: true }),
        validate: async () => ({ valid: true, message: "ok" }),
        delete: noop,
      }),
      permission: createNamespaceProxy({
        list: async () => ({ success: true, data: [] }),
        clearHistory: noop,
      }),
      store: createNamespaceProxy({
        get: async ({ defaultValue }) => ({
          success: true,
          data: defaultValue,
        }),
        set: noop,
      }),
      skill: createNamespaceProxy({
        list: async () => clone(availableSkills),
        getImported: async () => clone(importedSkills),
        import: async (skillName) => ({
          ...clone(importedSkills[0]),
          name: skillName,
          description: `Imported: ${skillName}`,
        }),
        remove: async () => ({ success: true }),
        rescan: async () => clone(availableSkills),
        analyze: async () => clone(mockAnalysis),
        applyImprovements: async () => ({
          skillName: "skill-alpha",
          applied: [],
          skipped: [],
          errors: [],
          executedAt: now,
        }),
        autoImprove: async () => ({
          skillName: "skill-alpha",
          changes: [],
          summary: "改善は不要です",
        }),
        create: async () => ({ path: "/mock/skills/generated-skill" }),
        readFile: async (_skillName, relativePath) =>
          `# ${relativePath}\n\nMock content`,
        writeFile: async () => undefined,
        listBackups: async () => [],
        restoreBackup: async () => undefined,
      }),
      slideSettings: createNamespaceProxy({
        getOutputDirectory: async () => ({
          success: true,
          data: { directory: "/tmp/slides" },
        }),
        setOutputDirectory: noop,
      }),
      file: createNamespaceProxy({
        read: async () => ({
          success: true,
          data: {
            content: "console.log('phase11');",
            metadata: { size: 24 },
          },
        }),
      }),
      workspace: createNamespaceProxy({
        load: async () => ({ success: true, data: { folders: [], files: [] } }),
      }),
    };

    window.electronAPI = new Proxy(namespaces, {
      get(target, prop) {
        if (prop in target) {
          return target[prop];
        }
        return createNamespaceProxy();
      },
    });
  };
}

async function gotoApp(page, route = "/?skipAuth=true") {
  await page.goto(`${baseUrl}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
}

const scenarios = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-renderview-skill-analysis.png",
    selector: '[data-testid="skill-analysis-view"]',
    note: "SkillAnalysisView 代表画面（advanced route fallback）",
    run: async (page) => {
      await gotoApp(page, "/advanced/skill-analysis?skipAuth=true");
      await page.waitForSelector('[data-testid="skill-analysis-view"]', {
        timeout: 30_000,
      });
    },
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-renderview-skill-create.png",
    selector: '[data-testid="skill-create-wizard"]',
    note: "SkillCreateWizard 代表画面（advanced route fallback）",
    run: async (page) => {
      await gotoApp(page, "/advanced/skill-create-wizard?skipAuth=true");
      await page.waitForSelector('[data-testid="skill-create-wizard"]', {
        timeout: 30_000,
      });
    },
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-renderview-dashboard-regression.png",
    selector: '[data-testid="dashboard-view"]',
    note: "dashboard 回帰がないことを確認",
    run: async (page) => {
      await gotoApp(page);
      await page.waitForSelector('[data-testid="dashboard-view"]', {
        timeout: 30_000,
      });
    },
  },
  {
    tc: "TC-11-04",
    file: "TC-11-04-analysis-close-to-skill-center.png",
    selector: '[data-testid="skill-center-view"]',
    note: "skillAnalysis close で skillCenter へ戻る導線を確認（advanced route）",
    run: async (page) => {
      await gotoApp(page, "/advanced/skill-center?skipAuth=true");
      await gotoApp(page, "/advanced/skill-analysis?skipAuth=true");
      await page.waitForSelector('[data-testid="skill-analysis-view"]', {
        timeout: 30_000,
      });
      await page.getByRole("button", { name: "閉じる" }).click();
      await page.waitForSelector('[data-testid="skill-center-view"]', {
        timeout: 30_000,
      });
    },
  },
  {
    tc: "TC-11-05",
    file: "TC-11-05-legacy-skill-center-alias-normalized.png",
    selector: '[data-testid="skill-center-view"]',
    note: "legacy alias 正規化後と同一到達面（skillCenter）を視覚確認",
    run: async (page) => {
      await gotoApp(page, "/advanced/skill-center?skipAuth=true");
      await page.waitForSelector('[data-testid="skill-center-view"]', {
        timeout: 30_000,
      });
    },
  },
];

async function captureScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport: defaultViewport,
    colorScheme: "dark",
  });
  await context.addInitScript(createMockScript());
  const page = await context.newPage();

  const pageErrors = [];
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
    process.stderr.write(
      `[capture-step01-phase11:${scenario.tc}] ${error.message}\n`,
    );
  });

  try {
    await scenario.run(page);
    await page.waitForTimeout(350);

    const target = path.join(outputDir, scenario.file);
    await page.screenshot({ path: target, fullPage: true });

    return {
      tc: scenario.tc,
      file: scenario.file,
      selector: scenario.selector,
      note: scenario.note,
      pageErrors,
    };
  } finally {
    await context.close();
  }
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  const viteProcess = startViteServer();

  try {
    await waitForServer(`${baseUrl}/?skipAuth=true`);
    const browser = await chromium.launch({ headless: true });
    const captured = [];

    try {
      for (const scenario of scenarios) {
        const record = await captureScenario(browser, scenario);
        captured.push(record);
        process.stdout.write(
          `[capture-step01-phase11] ${record.tc} -> ${record.file}\n`,
        );
      }
    } finally {
      await browser.close();
    }

    await writeFile(
      metadataPath,
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          workflowRoot: path.relative(repoRoot, workflowRoot),
          screenshotDir: path.relative(repoRoot, outputDir),
          baseUrl,
          scenarios: captured,
        },
        null,
        2,
      ),
      "utf8",
    );

    process.stdout.write(
      `[capture-step01-phase11] metadata -> ${metadataPath}\n`,
    );
  } finally {
    viteProcess.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error("[capture-step01-phase11] failed", error);
  process.exitCode = 1;
});
