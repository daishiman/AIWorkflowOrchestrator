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
const workflowDir = path.join(
  repoRoot,
  "docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-03-skilldetail-action-buttons",
);
const screenshotDir = path.join(workflowDir, "outputs/phase-11/screenshots");
const diagnosticsPath = path.join(
  screenshotDir,
  "phase11-handoff-diagnostics.json",
);
const metadataPath = path.join(
  workflowDir,
  "outputs/phase-11/phase11-capture-metadata.json",
);
const port = process.env.SKILLDETAIL_ACTION_BUTTONS_SCREENSHOT_PORT ?? "5196";
const baseUrl = `http://localhost:${port}`;
const route = "/?skipAuth=true";

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

function buildSkill(name, description) {
  return {
    name,
    description,
    path: `.claude/skills/${name}/SKILL.md`,
    allowedTools: ["Read", "Write"],
    updatedAt: new Date("2026-03-19T09:00:00.000Z").toISOString(),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  };
}

function buildImportedSkill(name, description) {
  return {
    ...buildSkill(name, description),
    importedAt: new Date("2026-03-19T09:05:00.000Z").toISOString(),
    status: "active",
  };
}

function createMockScript() {
  return () => {
    const now = new Date("2026-03-19T10:00:00.000Z").toISOString();
    const buildSkillData = (name, description) => ({
      name,
      description,
      path: `.claude/skills/${name}/SKILL.md`,
      allowedTools: ["Read", "Write"],
      updatedAt: now,
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    });
    const buildImportedSkillData = (name, description) => ({
      ...buildSkillData(name, description),
      importedAt: now,
      status: "active",
    });
    const storeKey = "knowledge-studio-store";
    const persistedStore = {
      state: {
        currentView: "skillCenter",
        expandedFolders: [],
      },
      version: 0,
    };

    window.localStorage.setItem("dev-skip-auth", "true");
    window.localStorage.setItem(storeKey, JSON.stringify(persistedStore));

    const onboardingState = {
      "onboarding.hasCompleted": true,
      "onboarding.userName": "E2E User",
      "onboarding.selectedStarterTool": "workspace",
      "onboarding.lastCompletedAt": now,
    };

    const availableSkills = [
      buildSkillData(
        "imported-skill",
        "詳細パネルから編集と分析へ移動できるスキル",
      ),
      buildSkillData(
        "candidate-skill",
        "未追加スキル。アクションボタンは表示しない",
      ),
    ];

    const importedSkills = [
      buildImportedSkillData(
        "imported-skill",
        "詳細パネルから編集と分析へ移動できるスキル",
      ),
    ];

    const fileTree = [
      {
        name: "prompt.md",
        path: "prompt.md",
        type: "file",
      },
      {
        name: "config.json",
        path: "config.json",
        type: "file",
      },
      {
        name: "docs",
        path: "docs",
        type: "directory",
        children: [
          {
            name: "guide.md",
            path: "docs/guide.md",
            type: "file",
          },
        ],
      },
    ];

    const fileContents = {
      "prompt.md": "# Imported Skill\nEdit handoff verification",
      "config.json": '{\n  "version": 1,\n  "enabled": true\n}',
      "docs/guide.md": "# Guide\nSkillCenter handoff verification",
    };

    window.__phase11Calls = {
      getFileTree: [],
      analyze: [],
      readFile: [],
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
          data: { mode: "dark", resolvedTheme: "dark" },
        }),
        set: async () => ({ success: true, data: {} }),
        getSystem: async () => ({ success: true, data: { theme: "dark" } }),
        onSystemChanged: () => () => {},
      },
      store: {
        get: async ({ key, defaultValue }) => ({
          success: true,
          data: key in onboardingState ? onboardingState[key] : defaultValue,
        }),
        set: async ({ key, value }) => {
          onboardingState[key] = value;
          return { success: true };
        },
      },
      notification: {
        getHistory: async () => ({
          success: true,
          data: { notifications: [], totalCount: 0 },
        }),
        onNew: () => () => {},
        markRead: async () => ({ success: true }),
        markAllRead: async () => ({ success: true }),
        delete: async () => ({ success: true }),
      },
      skill: {
        list: async () => availableSkills,
        listAvailable: async () => availableSkills,
        getImported: async () => importedSkills,
        import: async () => undefined,
        importFromSource: async () => ({ imported: [] }),
        remove: async () => undefined,
        getFileTree: async (skillName) => {
          window.__phase11Calls.getFileTree.push(skillName);
          return fileTree;
        },
        readFile: async (_skillName, filePath) => {
          window.__phase11Calls.readFile.push(filePath);
          return fileContents[filePath] ?? "";
        },
        writeFile: async (_skillName, filePath, content) => {
          fileContents[filePath] = content;
          return true;
        },
        createFile: async (_skillName, filePath, content) => {
          fileContents[filePath] = content;
          return true;
        },
        deleteFile: async (_skillName, filePath) => {
          delete fileContents[filePath];
          return true;
        },
        analyze: async (skillName) => {
          window.__phase11Calls.analyze.push(skillName);
          return {
            skillName,
            overallScore: 86,
            categories: [
              {
                name: "Code Quality",
                score: 88,
                details: "重複が少なく保守しやすい構成です",
                issues: [],
              },
              {
                name: "Security",
                score: 84,
                details: "入力値の扱いは良好です",
                issues: [],
              },
            ],
            suggestions: [
              {
                type: "documentation",
                priority: "medium",
                description: "導線の意図をコメントに残す",
                autoFixable: false,
              },
            ],
            risks: [],
            analyzedAt: now,
          };
        },
        applyImprovements: async () => ({
          skillName: "imported-skill",
          applied: [],
          skipped: [],
          errors: [],
          executedAt: now,
        }),
        autoImprove: async () => ({
          skillName: "imported-skill",
          applied: [],
          skipped: [],
          errors: [],
          executedAt: now,
        }),
      },
    };
  };
}

async function capture(page, filename, scenario) {
  process.stdout.write(`Running: ${filename}\n`);
  await scenario(page);
  await page.waitForTimeout(300);
  const outputPath = path.join(screenshotDir, filename);
  await page.screenshot({ path: outputPath, fullPage: true });
  process.stdout.write(`Captured: ${outputPath}\n`);
}

async function dismissOnboardingIfPresent(page) {
  const wizard = page.getByTestId("onboarding-wizard");
  const closeButton = page.getByRole("button", {
    name: /はじめてガイドを閉じる/u,
  });

  if (await closeButton.isVisible().catch(() => false)) {
    await closeButton.click();
    await wizard.waitFor({ state: "hidden", timeout: 10_000 }).catch(() => {
      // 既に閉じた場合はそのまま続行する
    });
    return;
  }

  await wizard.waitFor({ state: "hidden", timeout: 3_000 }).catch(() => {
    // onboarding が出ないケースを許容
  });
}

async function gotoSkillCenter(page) {
  await page.goto(`${baseUrl}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {
    // networkidle 未達でも selector 待機で判定する
  });
  await dismissOnboardingIfPresent(page);
  const skillCenterNav = page.getByRole("button", {
    name: /スキルセンター/u,
  });
  await skillCenterNav.waitFor({ state: "visible", timeout: 15_000 });
  await skillCenterNav.click({ force: true });
  try {
    await page.waitForSelector('[data-testid="skill-center-view"]');
  } catch (error) {
    await page.screenshot({
      path: path.join(screenshotDir, "DEBUG-skillcenter-missing.png"),
      fullPage: true,
    });
    await fs.writeFile(
      path.join(screenshotDir, "DEBUG-skillcenter-missing.html"),
      await page.content(),
      "utf8",
    );
    throw error;
  }
  try {
    await page.waitForSelector('[data-testid="skill-card-imported-skill"]');
    await page.waitForSelector('[data-testid="skill-card-candidate-skill"]');
  } catch (error) {
    await page.screenshot({
      path: path.join(screenshotDir, "DEBUG-skillcenter-no-cards.png"),
      fullPage: true,
    });
    await fs.writeFile(
      path.join(screenshotDir, "DEBUG-skillcenter-no-cards.html"),
      await page.content(),
      "utf8",
    );
    await fs.writeFile(
      path.join(screenshotDir, "DEBUG-skillcenter-no-cards.json"),
      JSON.stringify(
        {
          bodyText: await page.textContent("body"),
          localStorage: await page.evaluate(() =>
            window.localStorage.getItem("knowledge-studio-store"),
          ),
        },
        null,
        2,
      ),
      "utf8",
    );
    throw error;
  }
}

async function openImportedDetail(page, panelTestId) {
  await gotoSkillCenter(page);
  await page.getByTestId("skill-card-imported-skill").click();
  const panel = page.getByTestId(panelTestId);
  await panel.waitFor();
  await panel.getByTestId("action-buttons-zone").waitFor();
  return panel;
}

async function openCandidateDetail(page, panelTestId) {
  await gotoSkillCenter(page);
  await page.getByTestId("skill-card-candidate-skill").click();
  const panel = page.getByTestId(panelTestId);
  await panel.waitFor();
  return panel;
}

async function focusByTab(page, testId, maxTabs = 24) {
  for (let i = 0; i < maxTabs; i += 1) {
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(
      (targetTestId) =>
        document.activeElement?.getAttribute("data-testid") === targetTestId,
      testId,
    );
    if (focused) {
      return true;
    }
  }
  return false;
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
      port,
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
    browser = await chromium.launch({ headless: true });

    const diagnostics = {};

    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: "dark",
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.addInitScript(createMockScript());

    await capture(
      desktopPage,
      "TC-11-01-desktop-imported-detail-panel.png",
      async (page) => {
        await openImportedDetail(page, "skill-detail-panel");
      },
    );

    await capture(
      desktopPage,
      "TC-11-02-desktop-unimported-detail-panel.png",
      async (page) => {
        await openCandidateDetail(page, "skill-detail-panel");
      },
    );

    await capture(
      desktopPage,
      "TC-11-03-desktop-edit-handoff.png",
      async (page) => {
        const panel = await openImportedDetail(page, "skill-detail-panel");
        await panel.getByTestId("edit-skill-button").click();
        await page.waitForSelector('[role="tree"]');
      },
    );
    diagnostics.editHandoff = await desktopPage.evaluate(
      () => window.__phase11Calls,
    );

    await capture(
      desktopPage,
      "TC-11-04-desktop-analyze-handoff.png",
      async (page) => {
        const panel = await openImportedDetail(page, "skill-detail-panel");
        await panel.getByTestId("analyze-skill-button").click();
        await page.waitForSelector('[data-testid="skill-analysis-view"]');
        await page.waitForTimeout(400);
      },
    );
    diagnostics.analyzeHandoff = await desktopPage.evaluate(
      () => window.__phase11Calls,
    );

    await desktopContext.close();

    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      colorScheme: "dark",
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.addInitScript(createMockScript());

    await capture(
      mobilePage,
      "TC-11-05-mobile-imported-bottom-sheet.png",
      async (page) => {
        await openImportedDetail(page, "skill-detail-panel-mobile");
      },
    );

    await mobileContext.close();

    const keyboardContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: "light",
    });
    const keyboardPage = await keyboardContext.newPage();
    await keyboardPage.addInitScript(createMockScript());

    await capture(
      keyboardPage,
      "TC-11-06-keyboard-focus-ring.png",
      async (page) => {
        await openImportedDetail(page, "skill-detail-panel");
        const focused = await focusByTab(page, "edit-skill-button");
        if (!focused) {
          throw new Error("edit-skill-button に Tab で到達できませんでした");
        }
      },
    );

    await capture(
      keyboardPage,
      "TC-11-07-escape-close.png",
      async (page) => {
        await openImportedDetail(page, "skill-detail-panel");
        await page.keyboard.press("Escape");
        await page.waitForSelector('[data-testid="skill-detail-panel"]', {
          state: "hidden",
          timeout: 15_000,
        });
      },
    );

    await keyboardContext.close();

    await fs.writeFile(
      diagnosticsPath,
      JSON.stringify(diagnostics, null, 2),
      "utf8",
    );
    process.stdout.write(`Captured: ${diagnosticsPath}\n`);
    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          baseUrl,
          workflowDir,
          screenshotDir,
          results: [
            {
              tc: "TC-11-01",
              file: "TC-11-01-desktop-imported-detail-panel.png",
              state: "desktop-imported-detail-panel",
            },
            {
              tc: "TC-11-02",
              file: "TC-11-02-desktop-unimported-detail-panel.png",
              state: "desktop-unimported-detail-panel",
            },
            {
              tc: "TC-11-03",
              file: "TC-11-03-desktop-edit-handoff.png",
              state: "desktop-edit-handoff",
            },
            {
              tc: "TC-11-04",
              file: "TC-11-04-desktop-analyze-handoff.png",
              state: "desktop-analyze-handoff",
            },
            {
              tc: "TC-11-05",
              file: "TC-11-05-mobile-imported-bottom-sheet.png",
              state: "mobile-imported-bottom-sheet",
            },
            {
              tc: "TC-11-06",
              file: "TC-11-06-keyboard-focus-ring.png",
              state: "keyboard-focus-ring",
            },
            {
              tc: "TC-11-07",
              file: "TC-11-07-escape-close.png",
              state: "escape-close",
            },
          ],
        },
        null,
        2,
      ),
      "utf8",
    );
    process.stdout.write(`Captured: ${metadataPath}\n`);
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
