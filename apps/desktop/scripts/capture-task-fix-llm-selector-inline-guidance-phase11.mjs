#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import {
  probeStaticServer,
  startRendererStaticServer,
} from "./phase11-static-server.mjs";

const repoRoot = path.resolve(".");
const desktopRoot = path.join(repoRoot, "apps/desktop");
const rendererRoot = path.join(desktopRoot, "out/renderer");
const workflowRoot = path.join(
  repoRoot,
  "docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const planPath = path.join(phase11Root, "screenshot-plan.json");
const port = process.env.LLM_SELECTOR_INLINE_GUIDANCE_PHASE11_PORT ?? "4188";
const baseUrl = `http://127.0.0.1:${port}`;
const chatRoute = "/?skipAuth=true";

const mockUser = {
  id: "phase11-user",
  email: "phase11@example.com",
  displayName: "Phase11 User",
  avatarUrl: null,
  provider: "google",
  createdAt: "2026-03-21T00:00:00.000Z",
  lastSignInAt: "2026-03-21T00:00:00.000Z",
};

const workspaceTree = [
  {
    id: "folder-src",
    name: "src",
    type: "folder",
    path: "/workspace/src",
    children: [
      {
        id: "file-guidance",
        name: "guidance.md",
        type: "file",
        path: "/workspace/src/guidance.md",
      },
    ],
  },
];

const workspaceContents = {
  "/workspace/src/guidance.md":
    "# Guidance\n\nWorkspace inline guidance capture harness.\n",
};

const scenarios = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-chatview-inline-guidance-light.png",
    description:
      "ChatView で未選択時バナーが表示され、CTA クリックで currentView=settings へ遷移要求されることを確認する。",
    theme: "light",
    route: chatRoute,
    viewport: { width: 1440, height: 960 },
    surface: "chat",
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-workspace-guidance-blocked-light.png",
    description:
      "WorkspaceView で blocked guidance と『Settings を開く』CTA が表示されることを確認する。",
    theme: "light",
    route: chatRoute,
    viewport: { width: 1440, height: 960 },
    surface: "workspace",
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-chatview-inline-guidance-dark.png",
    description:
      "ダークモードで ChatView バナーの可読性と CTA 色が維持されることを確認する。",
    theme: "dark",
    route: chatRoute,
    viewport: { width: 1440, height: 960 },
    surface: "chat",
  },
  {
    tc: "TC-11-04",
    file: "TC-11-04-chatview-inline-guidance-keyboard-focus.png",
    description:
      "キーボード移動で ChatView バナー CTA にフォーカスできることを確認する。",
    theme: "light",
    route: chatRoute,
    viewport: { width: 1440, height: 960 },
    surface: "chat-keyboard",
  },
];

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      env: process.env,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} failed with code ${code}`));
    });
  });
}

async function ensureRendererBuild() {
  await runCommand("pnpm", ["--filter", "@repo/desktop", "build"], repoRoot);
}

function createPersistedStore(theme, currentView) {
  return {
    state: {
      currentView,
      viewHistory: [currentView],
      themeMode: theme,
      resolvedTheme: theme,
      expandedFolders: [],
      userProfile: { name: "Phase11 User" },
      autoSyncEnabled: false,
      windowSize: { width: 1440, height: 960 },
      isNavExpanded: true,
      permissionHistory: [],
      notifications: [],
    },
    version: 0,
  };
}

function createChatInitScript(theme) {
  return `
    (() => {
      const theme = ${JSON.stringify(theme)};
      const storeKey = "knowledge-studio-store";
      const onboardingState = {
        "onboarding.hasCompleted": true,
        "onboarding.userName": "Phase11 User",
        "onboarding.selectedStarterTool": "chat",
        "onboarding.lastCompletedAt": "2026-03-21T00:00:00.000Z"
      };
      const persistedStore = ${JSON.stringify(createPersistedStore(theme, "chat"))};
      const emptySuccess = { success: true, data: {} };
      const sessionData = {
        user: ${JSON.stringify(mockUser)},
        expiresAt: Date.now() + 60 * 60 * 1000,
        isOffline: false,
      };

      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem("dev-skip-auth", "true");
      localStorage.setItem(storeKey, JSON.stringify(persistedStore));

      window.electronAPI = {
        auth: {
          checkOnline: async () => ({ success: true, data: { online: true } }),
          getSession: async () => ({ success: true, data: sessionData }),
          onAuthStateChanged: () => () => {},
          getProfile: async () => ({
            success: true,
            data: {
              id: sessionData.user.id,
              displayName: sessionData.user.displayName,
              avatarUrl: null,
              linkedProviders: [],
            },
          }),
          getLinkedProviders: async () => ({ success: true, data: [] }),
          login: async () => emptySuccess,
          logout: async () => emptySuccess,
          refresh: async () => emptySuccess,
        },
        theme: {
          get: async () => ({
            success: true,
            data: { mode: theme, resolvedTheme: theme },
          }),
          getSystem: async () => ({ success: true, data: { theme } }),
          set: async () => emptySuccess,
          onSystemChanged: () => () => {},
        },
        store: {
          get: async ({ key, defaultValue }) => ({
            success: true,
            data: key in onboardingState ? onboardingState[key] : (defaultValue ?? null),
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
          markRead: async () => emptySuccess,
          markAllRead: async () => emptySuccess,
          delete: async () => emptySuccess,
        },
        llm: {
          getProviders: async () => [],
          setSelectedConfig: async () => emptySuccess,
          checkHealth: async () => ({
            status: "error",
            providerId: "openai",
            errorMessage: "No providers configured",
            checkedAt: new Date().toISOString(),
          }),
        },
        ai: {
          chat: async () => ({ success: true, data: { message: "unused" } }),
        },
      };
    })();
  `;
}

function createWorkspaceInitPayload(theme) {
  return {
    theme,
    tree: workspaceTree,
    contents: workspaceContents,
  };
}

function createPlan() {
  return {
    generatedAt: new Date().toISOString(),
    captureMethod: "current-renderer-entry + workspace-layout-harness",
    baseUrl,
    scenarios: scenarios.map((scenario) => ({
      id: scenario.tc,
      description: scenario.description,
      route: scenario.route,
      output: `screenshots/${scenario.file}`,
      viewport: scenario.viewport,
      theme: scenario.theme,
      priority: "A",
    })),
  };
}

async function captureChatScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    colorScheme: scenario.theme,
  });
  await context.addInitScript(createChatInitScript(scenario.theme));
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);

  try {
    await page.goto(`${baseUrl}${scenario.route}`, {
      waitUntil: "networkidle",
      timeout: 90_000,
    });
    await page.getByRole("button", { name: "チャット" }).click();
    await page.waitForSelector('[data-testid="chat-view"]');
    await page.waitForSelector('[role="alert"]');

    const checks = {};
    const settingsButton = page.getByRole("button", { name: /設定画面へ/ });

    if (scenario.surface === "chat-keyboard") {
      await page.locator("body").click({ position: { x: 10, y: 10 } });
      for (let i = 0; i < 20; i += 1) {
        const activeLabel = await page.evaluate(
          () => document.activeElement?.getAttribute("aria-label") ?? "",
        );
        if (activeLabel === "設定画面へ移動") {
          break;
        }
        await page.keyboard.press("Tab");
      }
      checks.keyboardFocus = await page.evaluate(
        () =>
          document.activeElement?.getAttribute("aria-label") ===
          "設定画面へ移動",
      );
    } else {
      const screenshotPath = path.join(screenshotDir, scenario.file);
      await page.locator('[data-testid="chat-view"]').screenshot({
        path: screenshotPath,
      });

      await settingsButton.click();
      await page.waitForTimeout(100);
      checks.navigationToSettings = await page.evaluate(() => {
        const raw = window.localStorage.getItem("knowledge-studio-store");
        if (!raw) {
          return false;
        }

        try {
          const parsed = JSON.parse(raw);
          return parsed?.state?.currentView === "settings";
        } catch {
          return false;
        }
      });

      const stat = await fs.stat(screenshotPath);
      return {
        tc: scenario.tc,
        file: scenario.file,
        theme: scenario.theme,
        route: scenario.route,
        viewport: scenario.viewport,
        selector: '[data-testid="chat-view"]',
        capturedAt: stat.mtime.toISOString(),
        size: stat.size,
        checks,
      };
    }

    const screenshotPath = path.join(screenshotDir, scenario.file);
    await page.locator('[data-testid="chat-view"]').screenshot({
      path: screenshotPath,
    });
    const stat = await fs.stat(screenshotPath);
    return {
      tc: scenario.tc,
      file: scenario.file,
      theme: scenario.theme,
      route: scenario.route,
      viewport: scenario.viewport,
      selector: '[data-testid="chat-view"]',
      capturedAt: stat.mtime.toISOString(),
      size: stat.size,
      checks,
    };
  } finally {
    await context.close();
  }
}

async function captureWorkspaceScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    colorScheme: scenario.theme,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);

  try {
    await page.addInitScript((config) => {
      const now = new Date("2026-03-21T00:00:00.000Z").toISOString();
      const contents = { ...config.contents };
      const tree = config.tree;
      let streamRequestId = 0;
      const onboardingState = {
        "onboarding.hasCompleted": true,
        "onboarding.userName": "Phase11 User",
        "onboarding.selectedStarterTool": "workspace",
        "onboarding.lastCompletedAt": "2026-03-21T00:00:00.000Z",
      };
      const emptySuccess = { success: true, data: {} };
      const sessionData = {
        user: {
          id: "phase11-user",
          email: "phase11@example.com",
          displayName: "Phase11 User",
          avatarUrl: null,
          provider: "google",
          createdAt: now,
          lastSignInAt: now,
        },
        expiresAt: Date.now() + 60 * 60 * 1000,
        isOffline: false,
      };

      window.localStorage.clear();
      window.sessionStorage.clear();
      window.localStorage.setItem("dev-skip-auth", "true");
      window.__PHASE11_WORKSPACE_LAYOUT_HARNESS__ = { theme: config.theme };

      window.electronAPI = {
        auth: {
          checkOnline: async () => ({ success: true, data: { online: true } }),
          getSession: async () => ({ success: true, data: sessionData }),
          onAuthStateChanged: () => () => {},
          getProfile: async () => ({
            success: true,
            data: {
              id: sessionData.user.id,
              displayName: sessionData.user.displayName,
              avatarUrl: null,
              linkedProviders: [],
            },
          }),
          getLinkedProviders: async () => ({ success: true, data: [] }),
          login: async () => emptySuccess,
          logout: async () => emptySuccess,
          refresh: async () => emptySuccess,
        },
        theme: {
          get: async () => ({
            success: true,
            data: { mode: config.theme, resolvedTheme: config.theme },
          }),
          getSystem: async () => ({ success: true, data: { theme: config.theme } }),
          set: async () => emptySuccess,
          onSystemChanged: () => () => {},
        },
        store: {
          get: async ({ key, defaultValue }) => ({
            success: true,
            data: key in onboardingState ? onboardingState[key] : (defaultValue ?? null),
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
          markRead: async () => emptySuccess,
          markAllRead: async () => emptySuccess,
          delete: async () => emptySuccess,
        },
        workspace: {
          load: async () => ({
            success: true,
            data: {
              version: 1,
              folders: [
                {
                  id: "folder-1",
                  path: "/workspace",
                  displayName: "workspace",
                  isExpanded: true,
                  expandedPaths: [],
                  addedAt: now,
                },
              ],
              lastSelectedFilePath: null,
              updatedAt: now,
            },
          }),
          save: async () => ({ success: true }),
          addFolder: async () => ({
            success: true,
            data: {
              path: "/workspace",
              displayName: "workspace",
            },
          }),
          validatePaths: async ({ paths }) => ({
            success: true,
            data: { validPaths: paths },
          }),
        },
        file: {
          getTree: async () => ({ success: true, data: tree }),
          read: async ({ filePath }) => ({
            success: true,
            data: {
              content: contents[filePath] ?? "",
              metadata: {
                size: (contents[filePath] ?? "").length,
                lastModified: new Date("2026-03-21T10:00:00.000Z"),
                encoding: "utf-8",
              },
            },
          }),
          write: async () => ({ success: true }),
          rename: async () => ({ success: true }),
          watchStart: async () => ({ success: true, watchId: "watch-1" }),
          watchStop: async () => ({ success: true }),
          onChanged: () => () => {},
        },
        llm: {
          getProviders: async () => [],
          streamChat: async () => {
            streamRequestId += 1;
            return { requestId: `stream-${streamRequestId}` };
          },
          cancelStream: async () => ({ success: true }),
          onStreamChunk: () => () => {},
          onStreamEnd: () => () => {},
          onStreamError: () => () => {},
          setSelectedConfig: async () => ({ success: true }),
          checkHealth: async () => ({
            status: "error",
            providerId: "openai",
            errorMessage: "No providers configured",
            checkedAt: new Date().toISOString(),
          }),
        },
      };

      window.conversationAPI = {
        list: async () => ({ success: true, data: [] }),
        get: async () => ({ success: true, data: null }),
        create: async () => ({
          success: true,
          data: {
            id: "conversation-1",
          },
        }),
        update: async () => ({ success: true, data: null }),
        delete: async () => ({ success: true }),
        addMessage: async () => ({
          success: true,
          data: {
            id: `message-${Date.now()}`,
          },
        }),
        search: async () => ({ success: true, data: [] }),
      };
    }, createWorkspaceInitPayload(scenario.theme));

    await page.goto(`${baseUrl}${scenario.route}`, {
      waitUntil: "load",
      timeout: 90_000,
    });
    await page.getByRole("button", { name: "ワークスペース" }).click();
    await page.waitForSelector('[data-testid="workspace-view"]');
    await page.waitForSelector("text=AIモデルが選択されていません");

    const screenshotPath = path.join(screenshotDir, scenario.file);
    await page.locator('[data-testid="workspace-view"]').screenshot({
      path: screenshotPath,
    });

    await page.getByRole("button", { name: /Settings/ }).click();
    await page.waitForTimeout(100);
    const checks = {
      navigationToSettings: await page.evaluate(() => {
        const raw = window.localStorage.getItem("knowledge-studio-store");
        if (!raw) {
          return false;
        }

        try {
          const parsed = JSON.parse(raw);
          return parsed?.state?.currentView === "settings";
        } catch {
          return false;
        }
      }),
    };

    const stat = await fs.stat(screenshotPath);
    return {
      tc: scenario.tc,
      file: scenario.file,
      theme: scenario.theme,
      route: scenario.route,
      viewport: scenario.viewport,
      selector: '[data-testid="workspace-view"]',
      capturedAt: stat.mtime.toISOString(),
      size: stat.size,
      checks,
    };
  } finally {
    await context.close();
  }
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });
  await ensureRendererBuild();
  await fs.writeFile(planPath, `${JSON.stringify(createPlan(), null, 2)}\n`, "utf8");

  let serverHandle = null;
  if (!(await probeStaticServer(`${baseUrl}/index.html`))) {
    serverHandle = await startRendererStaticServer({
      baseUrl,
      rootDir: rendererRoot,
    });
  }

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const records = [];

    for (const scenario of scenarios) {
      if (scenario.surface === "workspace") {
        records.push(await captureWorkspaceScenario(browser, scenario));
      } else {
        records.push(await captureChatScenario(browser, scenario));
      }
    }

    await fs.writeFile(
      metadataPath,
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          captureMethod: "current-renderer-entry + workspace-layout-harness",
          baseUrl,
          sourceFiles: [
            "apps/desktop/src/renderer/main.tsx",
            "apps/desktop/src/renderer/views/ChatView/index.tsx",
            "apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx",
            "apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx",
            "apps/desktop/scripts/capture-task-fix-llm-selector-inline-guidance-phase11.mjs",
          ],
          records,
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
  } finally {
    if (browser) {
      await browser.close();
    }
    if (serverHandle) {
      await serverHandle.close();
    }
  }
}

main().catch((error) => {
  console.error(
    "[capture-task-fix-llm-selector-inline-guidance-phase11]",
    error,
  );
  process.exitCode = 1;
});
