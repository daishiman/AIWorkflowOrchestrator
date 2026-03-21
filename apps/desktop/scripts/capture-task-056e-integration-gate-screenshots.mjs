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
  "docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/outputs/phase-11/screenshots",
);
const vitePort = 5178;
const host = "127.0.0.1";
const baseUrl = `http://${host}:${vitePort}`;

const now = new Date("2026-03-06T03:35:00.000Z").toISOString();

const mockPayload = {
  mockSkills: [
    {
      name: "workflow-helper",
      description: "workflow automation and gate verification",
      path: ".claude/skills/workflow-helper/SKILL.md",
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
  ],
  notificationItems: [
    {
      id: "notif-001",
      title: "History Search ready",
      detail:
        "notification:get-history と history:search の統合スモークを確認済みです。",
      source: "system",
      type: "info",
      timestamp: now,
      isRead: false,
    },
    {
      id: "notif-002",
      title: "Navigation contract synced",
      detail: "AppDock の History 導線と currentView の一致を確認しました。",
      source: "system",
      type: "success",
      timestamp: now,
      isRead: false,
    },
    {
      id: "notif-003",
      title: "Spec sync audit",
      detail: "task-workflow / lessons-learned への反映候補を再点検しました。",
      source: "skill",
      type: "info",
      timestamp: now,
      isRead: true,
    },
  ],
  historySearchItems: [
    {
      id: "hist-001",
      title: "Notification ingestion event",
      preview: "notification:new の受信後に unreadCount が 2 件へ同期された。",
      timestamp: now,
      metadata: {
        type: "skill",
        skillName: "workflow-helper",
        status: "completed",
      },
    },
    {
      id: "hist-002",
      title: "History restore proposal",
      preview:
        "history:getFileHistory の一覧と restoreVersion 導線を確認した。",
      timestamp: now,
      metadata: {
        type: "file",
        filePath:
          "docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync/index.md",
        additions: 12,
        deletions: 0,
      },
    },
    {
      id: "hist-003",
      title: "Chat export review",
      preview: "chat history route の空状態と export 導線を監査した。",
      timestamp: now,
      metadata: {
        type: "chat",
        sessionId: "session-empty",
        messageCount: 0,
      },
    },
  ],
  historyStats: {
    chat: 4,
    file: 7,
    skill: 3,
    total: 14,
  },
  versionHistoryItems: [
    {
      conversionId: "conv-003",
      fileId: "file-123",
      version: 3,
      createdAt: now,
      size: 98304,
      mimeType: "text/markdown",
      hash: "hash-003",
      isLatest: true,
    },
    {
      conversionId: "conv-002",
      fileId: "file-123",
      version: 2,
      createdAt: now,
      size: 94208,
      mimeType: "text/markdown",
      hash: "hash-002",
      isLatest: false,
    },
    {
      conversionId: "conv-001",
      fileId: "file-123",
      version: 1,
      createdAt: now,
      size: 90112,
      mimeType: "text/markdown",
      hash: "hash-001",
      isLatest: false,
    },
  ],
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createMockScript() {
  return (payload) => {
    const now = new Date().toISOString();
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const mockUser = {
      id: "phase11-user",
      email: "phase11@example.com",
      displayName: "Phase11 User",
      avatarUrl: null,
      provider: "google",
      createdAt: now,
      lastSignInAt: now,
    };

    localStorage.setItem("dev-skip-auth", "true");

    const versionDetailById = Object.fromEntries(
      payload.versionHistoryItems.map((item) => [
        item.conversionId,
        {
          version: item,
          logs: [
            {
              timestamp: now,
              level: "info",
              message: `version ${item.version} generated`,
            },
          ],
        },
      ]),
    );

    window.historyAPI = {
      getFileHistory: async () => ({
        success: true,
        data: {
          items: clone(payload.versionHistoryItems),
          total: payload.versionHistoryItems.length,
          hasMore: false,
        },
      }),
      getVersionDetail: async (conversionId) => ({
        success: true,
        data:
          versionDetailById[conversionId] ??
          versionDetailById[payload.versionHistoryItems[0].conversionId],
      }),
      getConversionLogs: async () => ({
        success: true,
        data: {
          items: [
            {
              timestamp: now,
              level: "info",
              message: "history log entry",
            },
          ],
          total: 1,
          hasMore: false,
        },
      }),
      restoreVersion: async (_fileId, conversionId) => {
        const selected =
          payload.versionHistoryItems.find(
            (item) => item.conversionId === conversionId,
          ) ?? payload.versionHistoryItems[0];
        return {
          success: true,
          data: clone(selected),
        };
      },
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
            callback({
              authenticated: true,
              user: mockUser,
              isOffline: false,
            });
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
          data: { mode: "light", resolvedTheme: "light" },
        }),
        set: async (request) => ({
          success: true,
          data: {
            mode: request.mode,
            resolvedTheme: request.mode === "dark" ? "dark" : "light",
          },
        }),
        getSystem: async () => ({
          success: true,
          data: { isDark: false, resolvedTheme: "light" },
        }),
        onSystemChanged: () => () => {},
      },
      skill: {
        list: async () => clone(payload.mockSkills),
        getImported: async () => [],
        import: async (skillName) =>
          clone(
            payload.mockSkills.find((skill) => skill.name === skillName) ??
              payload.mockSkills[0],
          ),
        remove: async () => undefined,
        rescan: async () => clone(payload.mockSkills),
        onStream: () => () => {},
        onComplete: () => () => {},
        onError: () => () => {},
        onPermissionRequest: () => () => {},
      },
      notification: {
        getHistory: async () => ({
          success: true,
          data: {
            notifications: clone(payload.notificationItems),
            totalCount: payload.notificationItems.length,
          },
        }),
        markRead: async () => ({ success: true, data: { updated: true } }),
        markAllRead: async () => ({
          success: true,
          data: { updatedCount: payload.notificationItems.length },
        }),
        clear: async () => ({
          success: true,
          data: { deletedCount: payload.notificationItems.length },
        }),
        onNew: () => () => {},
      },
      historySearch: {
        search: async () => ({
          success: true,
          data: {
            items: clone(payload.historySearchItems),
            totalCount: payload.historySearchItems.length,
            hasMore: false,
          },
        }),
        getStats: async () => ({
          success: true,
          data: clone(payload.historyStats),
        }),
      },
    };
  };
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
      // Retry until timeout.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

async function captureDesktop(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
  });
  await context.addInitScript(createMockScript(), clone(mockPayload));

  const page = await context.newPage();
  await page.goto(`${baseUrl}/?skipAuth=true`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector('[aria-label="Main navigation"]', {
    timeout: 60_000,
  });
  await page.waitForSelector('[data-testid="notification-badge"]', {
    timeout: 20_000,
  });
  await page.waitForTimeout(400);

  await page.screenshot({
    path: path.join(screenshotDir, "TC-11-01-dashboard-desktop.png"),
    fullPage: true,
  });

  await page.getByTestId("notification-bell-button").click();
  await page.waitForSelector('[data-testid="notification-popover"]', {
    timeout: 20_000,
  });
  await page.getByTestId("notification-item-notif-001").click();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(screenshotDir, "TC-11-02-notification-popover-desktop.png"),
    fullPage: true,
  });

  await page
    .locator('nav[aria-label="Main navigation"]')
    .getByRole("button", { name: "History", exact: true })
    .click();
  await page.waitForSelector('[data-testid="history-search-view"]', {
    timeout: 20_000,
  });
  await page.waitForSelector('[data-testid="history-item-hist-001"]', {
    timeout: 20_000,
  });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(screenshotDir, "TC-11-03-history-search-desktop.png"),
    fullPage: true,
  });

  await page.goto(`${baseUrl}/chat/history?skipAuth=true`, {
    waitUntil: "domcontentloaded",
  });
  await page
    .getByText("セッションが選択されていません", { exact: true })
    .waitFor({
      timeout: 20_000,
    });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(screenshotDir, "TC-11-04-chat-history-route-desktop.png"),
    fullPage: true,
  });

  await page.goto(`${baseUrl}/history/file-123?skipAuth=true`, {
    waitUntil: "domcontentloaded",
  });
  await page.getByRole("heading", { name: "バージョン履歴" }).waitFor({
    timeout: 20_000,
  });
  await page.getByRole("list", { name: "バージョン履歴" }).waitFor({
    timeout: 20_000,
  });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(
      screenshotDir,
      "TC-11-05-version-history-route-desktop.png",
    ),
    fullPage: true,
  });

  await context.close();
}

async function captureMobile(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    colorScheme: "light",
  });
  await context.addInitScript(createMockScript(), clone(mockPayload));

  const page = await context.newPage();
  await page.goto(`${baseUrl}/?skipAuth=true`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector('[aria-label="Main navigation"]', {
    timeout: 60_000,
  });
  await page
    .locator('nav[aria-label="Main navigation"]')
    .getByRole("button", { name: "History", exact: true })
    .click();
  await page.waitForSelector('[data-testid="history-search-view"]', {
    timeout: 20_000,
  });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(screenshotDir, "TC-11-06-history-search-mobile.png"),
    fullPage: true,
  });

  await context.close();
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
      "--host",
      host,
      "--port",
      String(vitePort),
      "--strictPort",
    ],
    {
      cwd: desktopRoot,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", (data) => process.stdout.write(data));
  server.stderr.on("data", (data) => process.stderr.write(data));

  try {
    await waitForServer(baseUrl);

    const browser = await chromium.launch({ headless: true });
    try {
      await captureDesktop(browser);
      await captureMobile(browser);
    } finally {
      await browser.close();
    }

    console.log(`Screenshots saved to ${screenshotDir}`);
  } finally {
    server.kill("SIGTERM");
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
