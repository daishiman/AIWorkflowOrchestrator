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
const workflowRoot = path.join(
  repoRoot,
  "docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const planPath = path.join(phase11Root, "screenshot-plan.json");
const rendererRoot = path.join(desktopRoot, "out/renderer");
const port = process.env.WORKSPACE_CHAT_STREAM_ERROR_PHASE11_PORT ?? "4189";
const baseUrl = `http://127.0.0.1:${port}`;
const harnessPath = "/?phase11Harness=workspace-layout&skipAuth=true";

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
        id: "file-app",
        name: "app.ts",
        type: "file",
        path: "/workspace/src/app.ts",
      },
      {
        id: "file-readme",
        name: "README.md",
        type: "file",
        path: "/workspace/src/README.md",
      },
    ],
  },
];

const workspaceContents = {
  "/workspace/src/app.ts":
    "export const app = true;\nexport function sum(a: number, b: number) {\n  return a + b;\n}\n",
  "/workspace/src/README.md":
    "# Workspace Chat Stream Error\n\nPhase11 screenshot capture harness.\n",
};

const providers = [
  {
    id: "openai",
    name: "OpenAI",
    models: [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        isDefault: true,
      },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    models: [
      {
        id: "claude-3-5-sonnet",
        name: "Claude 3.5 Sonnet",
        isDefault: true,
      },
    ],
  },
];

const seededStore = {
  state: {
    currentView: "workspace",
    viewHistory: ["workspace"],
    themeMode: "light",
    resolvedTheme: "light",
    expandedFolders: [],
    userProfile: { name: "Phase11 User" },
    autoSyncEnabled: false,
    windowSize: { width: 1440, height: 960 },
    isNavExpanded: true,
    permissionHistory: [],
    notifications: [],
    selectedProviderId: "openai",
    selectedModelId: "gpt-4o",
    providers,
    llmIsLoading: false,
    llmError: null,
    healthStatus: {},
  },
  version: 0,
};

const scenarios = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-settings-cta-light.png",
    description:
      "Settings CTA が表示される API_KEY_MISSING のストリーミングエラーを確認する。",
    theme: "light",
    message: "設定未完了時のエラー表示を確認したい",
    error: {
      code: "API_KEY_MISSING",
      message: "API key missing",
    },
    screenshot: async (page) => {
      await page.getByRole("button", { name: "設定を開く" }).waitFor();
    },
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-retry-cta-light.png",
    description:
      "再試行 CTA が表示される NETWORK_ERROR のストリーミングエラーを確認する。",
    theme: "light",
    message: "ネットワーク断の再試行表示を確認したい",
    error: {
      code: "NETWORK_ERROR",
      message: "Connection failed",
    },
    screenshot: async (page) => {
      await page.getByRole("button", { name: "再試行" }).waitFor();
    },
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-rate-limit-hint-dark.png",
    description:
      "RATE_LIMIT で retry CTA と hint が同時に出ることを確認する。",
    theme: "dark",
    message: "レート制限のヒント表示を確認したい",
    error: {
      code: "RATE_LIMIT",
      message: "Too many requests",
    },
    screenshot: async (page) => {
      await page.getByText("しばらく待ってから再試行してください。").waitFor();
      await page.getByRole("button", { name: "再試行" }).waitFor();
    },
  },
  {
    tc: "TC-11-04",
    file: "TC-11-04-dismissed-error-light.png",
    description:
      "dismiss 操作でエラーが閉じられ、入力面が回復することを確認する。",
    theme: "light",
    message: "閉じる操作の回復状態を確認したい",
    error: {
      code: "NETWORK_ERROR",
      message: "Connection failed",
    },
    screenshot: async (page) => {
      await page.getByRole("button", { name: "エラーを閉じる" }).click();
      await page.getByRole("alert").waitFor({ state: "detached" });
      await page.getByTestId("workspace-chat-input").waitFor();
    },
  },
  {
    tc: "TC-11-05",
    file: "TC-11-05-validation-error-no-actions-dark.png",
    description:
      "VALIDATION_ERROR で action なしの非操作エラー表示を確認する。",
    theme: "dark",
    message: "検証失敗の非操作エラーを確認したい",
    error: {
      code: "VALIDATION_ERROR",
      message: "Prompt is empty",
    },
    screenshot: async (page) => {
      await page.getByText("リクエストの検証に失敗しました: Prompt is empty").waitFor();
      await page.getByRole("button", { name: "設定を開く" }).count();
      await page.getByRole("button", { name: "再試行" }).count();
    },
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

async function ensureRendererServer() {
  const reachable = await probeStaticServer(baseUrl);
  if (reachable) {
    return null;
  }

  return await startRendererStaticServer({
    baseUrl,
    rootDir: rendererRoot,
  });
}

async function ensureRendererBuild() {
  await runCommand("pnpm", ["--filter", "@repo/desktop", "build"], repoRoot);
}

function createPlan() {
  return {
    generatedAt: new Date().toISOString(),
    baseUrl,
    harnessPath,
    captureMethod: "current-renderer-entry + workspace-layout-harness + seeded-llm-selection",
    scenarios: scenarios.map((scenario) => ({
      id: scenario.tc,
      description: scenario.description,
      route: harnessPath,
      output: `screenshots/${scenario.file}`,
      viewport: { width: 1440, height: 960 },
      theme: scenario.theme,
      priority: "A",
    })),
  };
}

function createInitScript() {
  return (config) => {
    const now = new Date("2026-03-21T00:00:00.000Z").toISOString();
    const chunkListeners = new Set();
    const endListeners = new Set();
    const errorListeners = new Set();
    const persistedStore = JSON.parse(JSON.stringify(config.persistedStore));
    const tree = config.tree;
    const contents = config.contents;
    const providers = config.providers;
    const emptySuccess = { success: true, data: {} };
    const sessionData = {
      user: config.mockUser,
      expiresAt: Date.now() + 60 * 60 * 1000,
      isOffline: false,
    };

    window.localStorage.clear();
    window.sessionStorage.clear();
    window.localStorage.setItem("dev-skip-auth", "true");
    window.localStorage.setItem(
      "knowledge-studio-store",
      JSON.stringify(persistedStore),
    );
    window.__PHASE11_WORKSPACE_LAYOUT_HARNESS__ = { theme: config.theme };

    window.__workspaceHarnessEmitChunk = (content) => {
      for (const callback of chunkListeners) {
        callback({ delta: { content } });
      }
    };
    window.__workspaceHarnessEmitEnd = () => {
      for (const callback of endListeners) {
        callback();
      }
    };
    window.__workspaceHarnessEmitError = (error) => {
      const payload =
        typeof error === "string"
          ? { code: "UNKNOWN", message: error }
          : error;
      for (const callback of errorListeners) {
        callback(payload);
      }
    };

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
          data:
            key in persistedStore.state
              ? persistedStore.state[key]
              : defaultValue ?? null,
        }),
        set: async ({ key, value }) => {
          persistedStore.state[key] = value;
          window.localStorage.setItem(
            "knowledge-studio-store",
            JSON.stringify(persistedStore),
          );
          return { success: true };
        },
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
              lastModified: now,
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
        getProviders: async () => providers,
        setSelectedConfig: async () => emptySuccess,
        checkHealth: async () => ({
          status: "healthy",
          providerId: "openai",
          checkedAt: now,
        }),
        streamChat: async () => ({ requestId: `request-${Date.now()}` }),
        cancelStream: async () => ({ success: true }),
        onStreamChunk: (callback) => {
          chunkListeners.add(callback);
          return () => chunkListeners.delete(callback);
        },
        onStreamEnd: (callback) => {
          endListeners.add(callback);
          return () => endListeners.delete(callback);
        },
        onStreamError: (callback) => {
          errorListeners.add(callback);
          return () => errorListeners.delete(callback);
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
    };

    window.conversationAPI = {
      list: async () => ({ success: true, data: [] }),
      get: async () => ({ success: true, data: null }),
      create: async () => ({
        success: true,
        data: { id: `conversation-${Date.now()}` },
      }),
      update: async () => ({ success: true, data: null }),
      delete: async () => ({ success: true }),
      addMessage: async () => ({
        success: true,
        data: { id: `message-${Date.now()}` },
      }),
      search: async () => ({ success: true, data: [] }),
    };
  };
}

async function waitForServer(url, timeoutMs = 60_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
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

  throw new Error(`Timed out waiting for static server: ${url}`);
}

async function captureScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    colorScheme: scenario.theme,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);

  page.on("console", (message) => {
    if (message.type() === "error") {
      console.error(`[${scenario.tc}] console error: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    console.error(`[${scenario.tc}] page error: ${error.message}`);
  });

  await page.addInitScript(createInitScript(), {
    theme: scenario.theme,
    mockUser,
    tree: workspaceTree,
    contents: workspaceContents,
    providers,
    persistedStore: seededStore,
  });

  await page.goto(`${baseUrl}${harnessPath}`, {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await page.getByTestId("workspace-view").waitFor();
  await page
    .locator('[data-testid="workspace-chat-model-missing"]')
    .waitFor({ state: "detached" });
  await page.waitForTimeout(150);

  const input = page.getByTestId("workspace-chat-input");
  await input.fill(scenario.message);
  await page.getByTestId("workspace-chat-send").click();
  await page.getByTestId("workspace-chat-cancel").waitFor();
  await page.waitForTimeout(120);
  await page.evaluate((error) => {
    window.__workspaceHarnessEmitError?.(error);
  }, scenario.error);
  await page.getByRole("alert").waitFor();
  await scenario.screenshot(page);

  const target = path.join(screenshotDir, scenario.file);
  await page.screenshot({ path: target, fullPage: true });

  const record = {
    tc: scenario.tc,
    file: scenario.file,
    description: scenario.description,
    theme: scenario.theme,
    errorCode: scenario.error.code,
    capturedAt: new Date().toISOString(),
  };

  await context.close();
  return record;
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });
  await fs.writeFile(planPath, JSON.stringify(createPlan(), null, 2));

  await ensureRendererBuild();
  const server = await ensureRendererServer();
  let browser;

  try {
    await waitForServer(`${baseUrl}${harnessPath}`);
    browser = await chromium.launch({ headless: true });

    const records = [];
    for (const scenario of scenarios) {
      records.push(await captureScenario(browser, scenario));
      console.log(
        `[capture-task-fix-workspace-chat-stream-error-phase11] ${scenario.tc} -> ${scenario.file}`,
      );
    }

    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          baseUrl,
          harnessPath,
          captureMethod: "current-renderer-entry + workspace-layout-harness + seeded-llm-selection",
          records,
        },
        null,
        2,
      ),
    );
  } finally {
    if (browser) {
      await browser.close();
    }
    if (server && typeof server.close === "function") {
      await server.close();
    }
  }
}

main().catch((error) => {
  console.error("[capture-task-fix-workspace-chat-stream-error-phase11]", error);
  process.exitCode = 1;
});
