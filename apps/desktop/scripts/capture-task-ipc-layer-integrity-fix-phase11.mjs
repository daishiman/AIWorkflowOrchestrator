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
  "docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-05-ipc-layer-integrity-fix",
);
const outputDir = path.join(
  workflowRoot,
  "outputs/phase-11/screenshots-app-sanity",
);
const metadataPath = path.join(outputDir, "visual-sanity-capture-metadata.json");
const vitePort = process.env.IPC_LAYER_INTEGRITY_SCREENSHOT_PORT ?? "5197";
const baseUrl = `http://127.0.0.1:${vitePort}`;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // retry until timeout
    }
    await wait(500);
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
      "--strictPort",
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
    const now = new Date("2026-03-19T15:15:00.000Z").toISOString();

    sessionStorage.setItem("debug-clear-storage", "done");
    localStorage.setItem("dev-skip-auth", "true");

    const resolveTheme = () =>
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

    const clone = (value) => JSON.parse(JSON.stringify(value));

    const mockUser = {
      id: "ipc-layer-integrity-reviewer",
      email: "phase11-ipc-layer-integrity@example.com",
      displayName: "IPC Layer Integrity Reviewer",
      avatarUrl: null,
      provider: "google",
      createdAt: now,
      lastSignInAt: now,
    };

    const availableSkills = [
      {
        name: "skill-alpha",
        description: "IPC layer integrity visual sanity review helper",
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
      {
        name: "skill-beta",
        description: "Lifecycle improve surface review helper",
        path: "/mock/skills/skill-beta",
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
        description: "Imported sample skill for IPC layer review",
        path: "/mock/imported/skill-alpha",
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

    const mockAnalysis = {
      skillName: "skill-alpha",
      overallScore: 84,
      categories: [
        {
          name: "prompt",
          score: 88,
          details: "目的の書き出しは明快です",
          issues: ["改善サイクルの説明を追加するとより分かりやすい"],
        },
      ],
      suggestions: [
        {
          type: "documentation",
          priority: "medium",
          description: "改善の入口説明を明文化する",
          autoFixable: false,
        },
      ],
      risks: [],
      analyzedAt: now,
    };

    const noop = async () => ({ success: true, data: {} });

    window.confirm = () => true;

    window.electronAPI = {
      auth: {
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
        refresh: noop,
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
      profile: {
        get: async () => ({ success: true, data: clone(mockUser) }),
        getProviders: async () => ({ success: true, data: [] }),
        update: noop,
        linkProvider: noop,
        unlinkProvider: noop,
        delete: noop,
      },
      avatar: {
        upload: noop,
        useProvider: noop,
        remove: noop,
      },
      notification: {
        getHistory: async () => ({
          success: true,
          data: { notifications: [], totalCount: 0 },
        }),
        markRead: noop,
        markAllRead: noop,
        clear: noop,
        onNew: () => () => {},
      },
      historySearch: {
        search: async () => ({
          success: true,
          data: {
            items: [],
            totalCount: 0,
            hasMore: false,
          },
        }),
        getStats: async () => ({
          success: true,
          data: { chat: 0, file: 0, skill: 0, total: 0 },
        }),
      },
      authKey: {
        set: noop,
        exists: async () => ({ exists: true }),
        validate: async () => ({ valid: true, message: "ok" }),
        delete: noop,
      },
      permission: {
        list: async () => ({ success: true, data: [] }),
        clearHistory: noop,
      },
      skill: {
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
        create: async () => ({
          path: "/mock/skills/generated-skill",
        }),
        readFile: async (_skillName, relativePath) =>
          `# ${relativePath}\n\nMock content`,
        writeFile: async () => undefined,
        listBackups: async () => [],
        restoreBackup: async () => undefined,
        getDetail: async (skillId) => ({
          id: skillId,
          name: skillId,
          description: "Mock detail for visual sanity review",
          path: `/mock/skills/${skillId}`,
          agents: [],
          references: [],
          scripts: [],
          assets: [],
          schemas: [],
          indexes: [],
          otherFiles: [],
          allowedTools: ["Read"],
          updatedAt: now,
        }),
        update: async () => undefined,
      },
      slideSettings: {
        getOutputDirectory: async () => ({
          success: true,
          data: { directory: "/tmp/slides" },
        }),
        setOutputDirectory: noop,
      },
      store: {
        get: async ({ key, defaultValue }) => {
          if (key === "onboarding.hasCompleted") {
            return { success: true, data: true };
          }
          if (key === "onboarding.userName") {
            return { success: true, data: "IPC Layer Integrity Reviewer" };
          }
          if (key === "onboarding.selectedStarterTool") {
            return { success: true, data: "skillCenter" };
          }
          if (key === "onboarding.lastCompletedAt") {
            return { success: true, data: now };
          }
          return { success: true, data: defaultValue };
        },
        set: noop,
      },
      file: {
        read: async () => ({
          success: true,
          data: {
            content: "console.log('phase11');",
            metadata: { size: 24 },
          },
        }),
      },
      workspace: {
        load: async () => ({ success: true, data: { folders: [], files: [] } }),
      },
    };
  };
}

async function createBrowserPage(browser, viewport) {
  const context = await browser.newContext({
    viewport,
    colorScheme: "light",
  });

  await context.addInitScript(createMockScript());
  const page = await context.newPage();

  return { context, page };
}

async function gotoApp(page, route = "/?skipAuth=true") {
  await page.goto(`${baseUrl}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
}

async function captureSkillCenterOverview(page) {
  await gotoApp(page);
  await page.getByRole("button", { name: "スキルセンター" }).click();
  await page.waitForSelector('[data-testid="skill-center-view"]', {
    timeout: 30_000,
  });
  await wait(500);
  await page.screenshot({
    path: path.join(outputDir, "TC-VS-01-skill-center-overview.png"),
    fullPage: true,
  });
}

async function captureSkillCenterJourney(page) {
  await gotoApp(page);
  await page.getByRole("button", { name: "スキルセンター" }).click();
  await page.waitForSelector('[data-testid="skill-lifecycle-journey"]', {
    timeout: 30_000,
  });
  await wait(500);
  await page.screenshot({
    path: path.join(outputDir, "TC-VS-02-skill-center-journey.png"),
    fullPage: true,
  });
}

async function captureAgent(page) {
  await gotoApp(page);
  await page.getByRole("button", { name: "エージェント" }).click();
  await page.waitForSelector('[data-testid="agent-view"]', {
    timeout: 30_000,
  });
  await wait(500);
  await page.screenshot({
    path: path.join(outputDir, "TC-VS-03-agent-view.png"),
    fullPage: true,
  });
}

async function captureImproveFlow(page) {
  await gotoApp(page, "/advanced/skill-management-panel?skipAuth=true");
  await page.waitForSelector('[data-testid="skill-management-panel"]', {
    timeout: 30_000,
  });
  await page.getByRole("button", { name: "skill-alpha を分析" }).click();
  await page.waitForSelector(
    '[data-testid="skill-management-panel-analysis-view"]',
    {
      timeout: 30_000,
    },
  );
  await wait(500);
  await page.screenshot({
    path: path.join(outputDir, "TC-VS-04-skill-management-analysis.png"),
    fullPage: true,
  });
}

async function captureCreateWizard(page) {
  await gotoApp(page, "/advanced/skill-create-wizard?skipAuth=true");
  await page.waitForSelector('[data-testid="skill-create-wizard"]', {
    timeout: 30_000,
  });
  await wait(500);
  await page.screenshot({
    path: path.join(outputDir, "TC-VS-05-create-wizard.png"),
    fullPage: true,
  });
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  const viteProcess = startViteServer();

  try {
    await waitForServer(`${baseUrl}/?skipAuth=true`);
    const browser = await chromium.launch({ headless: true });
    const { context, page } = await createBrowserPage(browser, {
      width: 1440,
      height: 1024,
    });

    try {
      await captureSkillCenterOverview(page);
      await captureSkillCenterJourney(page);
      await captureAgent(page);
      await captureImproveFlow(page);
      await captureCreateWizard(page);

      await writeFile(
        metadataPath,
        JSON.stringify(
          {
            capturedAt: new Date().toISOString(),
            baseUrl,
            workflowRoot: path.relative(repoRoot, workflowRoot),
            screenshots: [
              "TC-VS-01-skill-center-overview.png",
              "TC-VS-02-skill-center-journey.png",
              "TC-VS-03-agent-view.png",
              "TC-VS-04-skill-management-analysis.png",
              "TC-VS-05-create-wizard.png",
            ],
          },
          null,
          2,
        ),
      );
    } finally {
      await page.close();
      await context.close();
      await browser.close();
    }
  } finally {
    viteProcess.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error("[capture-task-ipc-layer-integrity-fix-phase11] failed", error);
  process.exitCode = 1;
});
