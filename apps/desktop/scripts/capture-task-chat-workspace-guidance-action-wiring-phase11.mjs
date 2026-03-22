#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import {
  probeStaticServer,
  startRendererStaticServer,
} from "./phase11-static-server.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(desktopRoot, "..", "..");
const rendererRoot = path.join(desktopRoot, "out", "renderer");
const workflowRoot = path.join(
  repoRoot,
  "docs/30-workflows/step-03-par-task-04-chat-workspace-guidance-action-wiring",
);
const phase11Root = path.join(workflowRoot, "outputs", "phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const planPath = path.join(phase11Root, "screenshot-plan.json");
const port =
  process.env.TASK04_CHAT_WORKSPACE_GUIDANCE_PHASE11_PORT ?? "4191";
const baseUrl = `http://127.0.0.1:${port}`;
const appRoute = "/?skipAuth=true";

const mockUser = {
  id: "phase11-user",
  email: "phase11@example.com",
  displayName: "Phase11 User",
  avatarUrl: null,
  provider: "google",
  createdAt: "2026-03-22T00:00:00.000Z",
  lastSignInAt: "2026-03-22T00:00:00.000Z",
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
    "# Guidance\n\nWorkspace blocked guidance capture harness.\n",
};

const scenarios = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-chat-blocked-light.png",
    description:
      "ChatView で blocked guidance banner と『設定を見る』CTA が表示されることを確認する。",
    theme: "light",
    viewport: { width: 1440, height: 960 },
    kind: "chat-blocked",
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-settings-after-guidance-cta-light.png",
    description:
      "ChatView の guidance CTA クリック後、SettingsView に 1クリックで遷移することを確認する。",
    theme: "light",
    viewport: { width: 1440, height: 960 },
    kind: "settings-after-cta",
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-chat-ready-light.png",
    description:
      "Provider / Model 選択済みでは ChatView の guidance banner が非表示であることを確認する。",
    theme: "light",
    viewport: { width: 1440, height: 960 },
    kind: "chat-ready",
  },
  {
    tc: "TC-11-04",
    file: "TC-11-04-workspace-blocked-light.png",
    description:
      "WorkspaceView で blocked guidance block が表示され、Settings への primary CTA が配線されていることを確認する。",
    theme: "light",
    viewport: { width: 1440, height: 960 },
    kind: "workspace-blocked",
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

function createPersistedStore({
  theme,
  currentView,
  selectedProviderId,
  selectedModelId,
}) {
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
      selectedProviderId,
      selectedModelId,
    },
    version: 2,
  };
}

function createAppInitScript(options) {
  const persistedStore = createPersistedStore(options);

  return `
    (() => {
      const storeKey = "knowledge-studio-store";
      const onboardingState = {
        "onboarding.hasCompleted": true,
        "onboarding.userName": "Phase11 User",
        "onboarding.selectedStarterTool": ${JSON.stringify(
          options.currentView === "workspace" ? "workspace" : "chat",
        )},
        "onboarding.lastCompletedAt": "2026-03-22T00:00:00.000Z"
      };
      const persistedStore = ${JSON.stringify(persistedStore)};
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
            data: { mode: ${JSON.stringify(options.theme)}, resolvedTheme: ${JSON.stringify(
              options.theme,
            )} },
          }),
          getSystem: async () => ({ success: true, data: { theme: ${JSON.stringify(
            options.theme,
          )} } }),
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
          streamChat: async () => ({ requestId: "phase11-stream-1" }),
          cancelStream: async () => ({ success: true }),
          onStreamChunk: () => () => {},
          onStreamEnd: () => () => {},
          onStreamError: () => () => {},
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
    captureMethod: "current-renderer-entry",
    baseUrl,
    scenarios: scenarios.map((scenario) => ({
      id: scenario.tc,
      description: scenario.description,
      route: appRoute,
      output: `screenshots/${scenario.file}`,
      viewport: scenario.viewport,
      theme: scenario.theme,
      priority: "A",
    })),
  };
}

async function captureChatScenario(browser, scenario) {
  const selectedConfig =
    scenario.kind === "chat-ready"
      ? {
          selectedProviderId: "openai",
          selectedModelId: "gpt-4o",
        }
      : {
          selectedProviderId: null,
          selectedModelId: null,
        };

  const context = await browser.newContext({
    viewport: scenario.viewport,
    colorScheme: scenario.theme,
  });
  await context.addInitScript(
    createAppInitScript({
      theme: scenario.theme,
      currentView: "chat",
      ...selectedConfig,
    }),
  );
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);

  try {
    await page.goto(`${baseUrl}${appRoute}`, {
      waitUntil: "networkidle",
      timeout: 90_000,
    });
    await page.getByRole("button", { name: "チャット" }).click();
    await page.waitForSelector('[data-testid="chat-view"]');

    const chatView = page.locator('[data-testid="chat-view"]');
    const screenshotPath = path.join(screenshotDir, scenario.file);
    const checks = {};

    if (scenario.kind === "chat-blocked") {
      await page.getByRole("alert").waitFor();
      checks.bannerVisible = await page.getByRole("alert").isVisible();
      await chatView.screenshot({ path: screenshotPath });
    }

    if (scenario.kind === "settings-after-cta") {
      const settingsButton = chatView.getByRole("button", {
        name: "設定画面へ移動",
      });
      await settingsButton.click();
      await page.getByTestId("settings-view").waitFor();
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
      await page.locator('[data-testid="settings-view"]').screenshot({
        path: screenshotPath,
      });
    }

    if (scenario.kind === "chat-ready") {
      await page.waitForTimeout(150);
      checks.bannerHidden =
        (await page.getByRole("alert").count().catch(() => 0)) === 0;
      await chatView.screenshot({ path: screenshotPath });
    }

    const stat = await fs.stat(screenshotPath);
    return {
      tc: scenario.tc,
      file: scenario.file,
      theme: scenario.theme,
      route: appRoute,
      viewport: scenario.viewport,
      selector:
        scenario.kind === "settings-after-cta"
          ? '[data-testid="settings-view"]'
          : '[data-testid="chat-view"]',
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
      const now = new Date("2026-03-22T00:00:00.000Z").toISOString();
      const contents = { ...config.contents };
      const tree = config.tree;
      let onboardingState = {
        "onboarding.hasCompleted": true,
        "onboarding.userName": "Phase11 User",
        "onboarding.selectedStarterTool": "workspace",
        "onboarding.lastCompletedAt": "2026-03-22T00:00:00.000Z",
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

      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem("dev-skip-auth", "true");
      localStorage.setItem(
        "knowledge-studio-store",
        JSON.stringify({
          state: {
            currentView: "chat",
            viewHistory: ["chat"],
            themeMode: config.theme,
            resolvedTheme: config.theme,
            expandedFolders: [],
            userProfile: { name: "Phase11 User" },
            autoSyncEnabled: false,
            windowSize: { width: 1440, height: 960 },
            isNavExpanded: true,
            permissionHistory: [],
            notifications: [],
            selectedProviderId: null,
            selectedModelId: null,
          },
          version: 2,
        }),
      );

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
            data: { path: "/workspace", displayName: "workspace" },
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
                lastModified: new Date("2026-03-22T10:00:00.000Z"),
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
          streamChat: async () => ({ requestId: "phase11-workspace-stream-1" }),
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
          data: { id: "conversation-1" },
        }),
        update: async () => ({ success: true, data: null }),
        delete: async () => ({ success: true }),
        addMessage: async () => ({
          success: true,
          data: { id: `message-${Date.now()}` },
        }),
        search: async () => ({ success: true, data: [] }),
      };
    }, createWorkspaceInitPayload(scenario.theme));

    await page.goto(`${baseUrl}${appRoute}`, {
      waitUntil: "networkidle",
      timeout: 90_000,
    });
    await page.getByRole("button", { name: "ワークスペース" }).click();
    await page.getByTestId("workspace-view").waitFor();
    await page.getByText("AIモデルが選択されていません。").waitFor();

    const workspaceView = page.locator('[data-testid="workspace-view"]');
    const screenshotPath = path.join(screenshotDir, scenario.file);
    await workspaceView.screenshot({ path: screenshotPath });

    const settingsButton = workspaceView.getByRole("button", {
      name: "設定を見る",
    });
    await settingsButton.click();
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
      route: appRoute,
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
      if (scenario.kind === "workspace-blocked") {
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
          captureMethod: "current-renderer-entry",
          baseUrl,
          sourceFiles: [
            "apps/desktop/src/renderer/guidance/modelSelectionGuidance.ts",
            "apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx",
            "apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx",
            "apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatInput.tsx",
            "apps/desktop/src/renderer/views/WorkspaceView/components/GuidanceBlock.tsx",
            "apps/desktop/scripts/capture-task-chat-workspace-guidance-action-wiring-phase11.mjs",
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
    "[capture-task-chat-workspace-guidance-action-wiring-phase11]",
    error,
  );
  process.exitCode = 1;
});
