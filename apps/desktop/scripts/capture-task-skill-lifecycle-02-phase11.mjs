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
  "docs/30-workflows/skill-lifecycle-unification/tasks/step-02-par-task-02-chat-platform-unification",
);
const outputDir = path.join(workflowRoot, "outputs/phase-11/screenshots");
const metadataPath = path.join(outputDir, "phase11-capture-metadata.json");
const vitePort = process.env.SKILL_LIFECYCLE_PHASE11_PORT ?? "4173";
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
      // keep waiting
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
    const now = new Date("2026-03-11T22:30:00.000Z").toISOString();
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const sharedNoop = async () => ({ success: true, data: {} });
    const providerCatalog = [
      {
        id: "openai",
        name: "OpenAI",
        isAvailable: true,
        models: [
          {
            id: "gpt-4o",
            name: "GPT-4o",
            description: "Phase11 mock default model",
            contextWindow: 128000,
            isDefault: true,
          },
        ],
      },
    ];
    const availableSkills = [
      {
        name: "skill-alpha",
        description: "作成導線の検証に使うスキル",
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
        description: "改善導線の検証に使うスキル",
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
        ...availableSkills[0],
        importedAt: now,
        status: "active",
      },
    ];
    const workspaceData = {
      version: 1,
      folders: [
        {
          id: "folder-1",
          path: "/workspace",
          displayName: "AIWorkflowOrchestrator",
          isExpanded: true,
          expandedPaths: [],
          addedAt: now,
        },
      ],
      lastSelectedFilePath: null,
      updatedAt: now,
    };
    const workspaceTree = [
      {
        id: "file-1",
        name: "chatSlice.ts",
        type: "file",
        path: "/workspace/apps/desktop/src/renderer/store/slices/chatSlice.ts",
      },
      {
        id: "file-2",
        name: "ChatView.tsx",
        type: "file",
        path: "/workspace/apps/desktop/src/renderer/views/ChatView/index.tsx",
      },
    ];
    const mockUser = {
      id: "skill-lifecycle-phase11-user",
      email: "phase11-chat-platform@example.com",
      displayName: "Phase11 Chat Platform",
      avatarUrl: null,
      provider: "google",
      createdAt: now,
      lastSignInAt: now,
    };

    const streamChunkListeners = [];
    const streamEndListeners = [];
    const streamErrorListeners = [];

    sessionStorage.setItem("debug-clear-storage", "done");
    localStorage.setItem("dev-skip-auth", "true");
    localStorage.removeItem("knowledge-studio-store");
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
        logout: sharedNoop,
        refresh: sharedNoop,
      },
      theme: {
        get: async () => ({
          success: true,
          data: { mode: "light", resolvedTheme: "light" },
        }),
        set: async ({ mode }) => ({
          success: true,
          data: { mode, resolvedTheme: mode === "system" ? "light" : mode },
        }),
        getSystem: async () => ({
          success: true,
          data: { isDark: false, resolvedTheme: "light" },
        }),
        onSystemChanged: () => () => {},
      },
      profile: {
        get: async () => ({ success: true, data: clone(mockUser) }),
        getProviders: async () => ({ success: true, data: [] }),
        update: sharedNoop,
        linkProvider: sharedNoop,
        unlinkProvider: sharedNoop,
        delete: sharedNoop,
      },
      avatar: {
        upload: sharedNoop,
        useProvider: sharedNoop,
        remove: sharedNoop,
      },
      notification: {
        getHistory: async () => ({
          success: true,
          data: { notifications: [], totalCount: 0 },
        }),
        markRead: sharedNoop,
        markAllRead: sharedNoop,
        clear: sharedNoop,
        onNew: () => () => {},
      },
      historySearch: {
        search: async () => ({
          success: true,
          data: { items: [], totalCount: 0, hasMore: false },
        }),
        getStats: async () => ({
          success: true,
          data: { chat: 0, file: 0, skill: 0, total: 0 },
        }),
      },
      authKey: {
        set: sharedNoop,
        exists: async () => ({ exists: true }),
        validate: async () => ({ valid: true, message: "ok" }),
        delete: sharedNoop,
      },
      permission: {
        list: async () => ({ success: true, data: [] }),
        clearHistory: sharedNoop,
      },
      workspace: {
        load: async () => ({ success: true, data: clone(workspaceData) }),
        save: sharedNoop,
        addFolder: sharedNoop,
        removeFolder: sharedNoop,
        validatePaths: async () => ({
          success: true,
          data: {
            validPaths: ["/workspace"],
            invalidPaths: [],
          },
        }),
        onFolderChanged: () => () => {},
      },
      file: {
        getTree: async () => ({ success: true, data: clone(workspaceTree) }),
        read: async ({ filePath }) => ({
          success: true,
          data: {
            content:
              filePath?.includes("ChatView")
                ? "export const ChatView = () => null;\n"
                : "export const createChatSlice = () => ({})\n",
            metadata: {
              size: 42,
              lastModified: new Date(now),
              encoding: "utf-8",
            },
          },
        }),
        watchStart: async () => ({ success: true, watchId: "watch-1" }),
        watchStop: async () => ({ success: true }),
        onChanged: () => () => {},
      },
      llm: {
        getProviders: async () => clone(providerCatalog),
        checkHealth: async () => ({
          status: "healthy",
          providerId: "openai",
          latency: 12,
          checkedAt: new Date(now),
        }),
        sendChat: async () => ({
          message: {
            role: "assistant",
            content: "mock response",
          },
        }),
        streamChat: async (request) => {
          const lastMessage = request.messages.at(-1)?.content ?? "";
          if (lastMessage.includes("失敗")) {
            throw new Error("stream start failed for phase11");
          }
          return { requestId: "stream-ok-1" };
        },
        cancelStream: async () => ({ success: true }),
        onStreamChunk: (callback) => {
          streamChunkListeners.push(callback);
          return () => {};
        },
        onStreamEnd: (callback) => {
          streamEndListeners.push(callback);
          return () => {};
        },
        onStreamError: (callback) => {
          streamErrorListeners.push(callback);
          return () => {};
        },
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
        analyze: async () => ({
          skillName: "skill-alpha",
          overallScore: 86,
          categories: [],
          suggestions: [],
          risks: [],
          analyzedAt: now,
        }),
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
      },
      slideSettings: {
        getOutputDirectory: async () => ({
          success: true,
          data: { directory: "/tmp/slides" },
        }),
        setOutputDirectory: sharedNoop,
      },
      dialog: {
        showOpenDialog: async () => ({ canceled: true, filePaths: [] }),
        showSaveDialog: async () => ({ canceled: true }),
      },
      invoke: async () => ({}),
    };
  };
}

async function createBrowserPage(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1024 },
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

async function captureChatGeneral(page) {
  await gotoApp(page);
  await page.getByRole("button", { name: "チャット" }).click();
  await page.waitForSelector('[data-testid="chat-view"]', {
    timeout: 30_000,
  });
  await page.waitForFunction(
    () => !(document.body.textContent ?? "").includes("モデル未選択"),
  );
  await wait(500);
  await page.locator('[data-testid="chat-view"]').screenshot({
    path: path.join(outputDir, "TC-02-01-chat-general-foundation.png"),
  });
}

async function captureChatRetryError(page) {
  await page.getByLabel("チャットメッセージ入力").fill(
    "失敗させて retry 導線を確認する",
  );
  await page.waitForFunction(() => {
    const sendButton = document.querySelector('[data-testid="chat-send-button"]');
    return sendButton instanceof HTMLButtonElement && !sendButton.disabled;
  });
  await page.getByRole("button", { name: "送信" }).click();
  await page.waitForSelector('[data-testid="chat-stream-error"]', {
    timeout: 30_000,
  });
  await wait(300);
  await page.locator('[data-testid="chat-view"]').screenshot({
    path: path.join(outputDir, "TC-02-02-chat-retry-error-state.png"),
  });
}

async function captureWorkspaceSurface(page) {
  await page.getByRole("button", { name: "ワークスペース" }).click();
  await page.waitForSelector('[data-testid="workspace-view"]', {
    timeout: 30_000,
  });
  await page.waitForTimeout(400);
  await page.locator('[data-testid="workspace-view"]').screenshot({
    path: path.join(outputDir, "TC-02-03-workspace-surface.png"),
  });
}

async function captureWorkspaceHandoff(page) {
  await page.getByTestId("workspace-toggle-file").click();
  await page.waitForSelector('[data-testid="workspace-file-panel"]', {
    timeout: 30_000,
  });
  await page.getByTestId("workspace-treeitem-file-1").click();
  await page.waitForSelector('[data-testid="workspace-attach-selected-file"]', {
    timeout: 30_000,
  });
  await page.getByTestId("workspace-attach-selected-file").click();
  await page.getByTestId("workspace-open-chat").click();
  await page.waitForSelector('[data-testid="chat-context-summary"]', {
    timeout: 30_000,
  });
  await wait(400);
  await page.locator('[data-testid="chat-view"]').screenshot({
    path: path.join(outputDir, "TC-02-04-workspace-handoff-chat.png"),
  });
}

async function captureSkillCenterJourney(page) {
  await page.getByRole("button", { name: "スキルセンター" }).click();
  await page.waitForSelector('[data-testid="skill-lifecycle-journey"]', {
    timeout: 30_000,
  });
  await wait(400);
  await page.locator('[data-testid="skill-center-view"]').screenshot({
    path: path.join(outputDir, "TC-02-05-skill-center-journey.png"),
  });
}

async function captureSkillLifecycleHandoff(page) {
  await page.getByTestId("skill-lifecycle-start-improve").click();
  await page.waitForSelector('[data-testid="chat-context-summary"]', {
    timeout: 30_000,
  });
  await page.waitForFunction(() => {
    const summary = document.querySelector('[data-testid="chat-context-summary"]');
    return summary?.textContent?.includes("Skill Lifecycle") ?? false;
  });
  await wait(400);
  await page.locator('[data-testid="chat-view"]').screenshot({
    path: path.join(outputDir, "TC-02-06-skill-lifecycle-handoff-chat.png"),
  });
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const viteProcess = startViteServer();

  try {
    await waitForServer(`${baseUrl}/?skipAuth=true`);
    const browser = await chromium.launch({ headless: true });
    const { context, page } = await createBrowserPage(browser);

    try {
      await captureChatGeneral(page);
      await captureChatRetryError(page);
      await captureWorkspaceSurface(page);
      await captureWorkspaceHandoff(page);
      await captureSkillCenterJourney(page);
      await captureSkillLifecycleHandoff(page);

      await writeFile(
        metadataPath,
        JSON.stringify(
          {
            capturedAt: new Date().toISOString(),
            baseUrl,
            screenshots: [
              "TC-02-01-chat-general-foundation.png",
              "TC-02-02-chat-retry-error-state.png",
              "TC-02-03-workspace-surface.png",
              "TC-02-04-workspace-handoff-chat.png",
              "TC-02-05-skill-center-journey.png",
              "TC-02-06-skill-lifecycle-handoff-chat.png",
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
  console.error(error);
  process.exitCode = 1;
});
