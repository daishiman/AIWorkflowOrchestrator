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
  "docs/30-workflows/task-056c-notification-history-domain/outputs/phase-11/screenshots",
);

const vitePort = 5184;
const baseUrl = `http://localhost:${vitePort}/?skipAuth=true`;

function createMockScript() {
  return ({ notifications, historyItems, stats }) => {
    sessionStorage.setItem("debug-clear-storage", "done");
    localStorage.setItem("dev-skip-auth", "true");

    const clone = (value) => JSON.parse(JSON.stringify(value));

    window.electronAPI = {
      auth: {
        checkOnline: async () => ({ success: true, data: { online: true } }),
        getSession: async () => ({ success: false, error: "no-session" }),
        onAuthStateChanged: () => () => {},
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
      notification: {
        getHistory: async () => ({
          success: true,
          data: {
            notifications: clone(notifications),
            totalCount: notifications.length,
          },
        }),
        markRead: async () => ({ success: true, data: { updated: true } }),
        markAllRead: async () => ({
          success: true,
          data: { updatedCount: notifications.length },
        }),
        clear: async () => ({
          success: true,
          data: { deletedCount: notifications.length },
        }),
        onNew: () => () => {},
      },
      historySearch: {
        search: async (request) => {
          const filtered = historyItems.filter((item) => {
            const filterPass =
              request.filter === "all" || item.type === request.filter;
            if (!filterPass) {
              return false;
            }

            const q = String(request.query || "").trim().toLowerCase();
            if (q === "") {
              return true;
            }

            return (
              item.title.toLowerCase().includes(q) ||
              item.preview.toLowerCase().includes(q)
            );
          });

          const offset = request.offset ?? 0;
          const limit = request.limit ?? 30;
          const sliced = filtered.slice(offset, offset + limit);

          return {
            success: true,
            data: {
              items: clone(sliced),
              totalCount: filtered.length,
              hasMore: offset + limit < filtered.length,
            },
          };
        },
        getStats: async () => ({ success: true, data: clone(stats) }),
      },
    };
  };
}

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

async function captureScreenshots(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
  });

  await context.addInitScript(createMockScript(), {
    notifications: [
      {
        id: "n-101",
        type: "warning",
        title: "履歴同期に遅延があります",
        detail: "history indexer が高負荷のため 30 秒遅延しています。",
        timestamp: "2026-03-05T12:15:00.000Z",
        isRead: false,
        source: { kind: "system", eventType: "history-delay" },
      },
      {
        id: "n-102",
        type: "success",
        title: "検索キャッシュを更新しました",
        detail: "history cache refresh completed",
        timestamp: "2026-03-05T11:55:00.000Z",
        isRead: false,
        source: { kind: "system", eventType: "cache-refresh" },
      },
      {
        id: "n-103",
        type: "info",
        title: "analysis skill 実行完了",
        detail: "実行時間 1.4s / 出力 2 files",
        timestamp: "2026-03-05T11:40:00.000Z",
        isRead: true,
        source: { kind: "skill_execution", skillName: "analysis" },
      },
    ],
    historyItems: [
      {
        id: "h-201",
        type: "chat",
        title: "React state audit",
        preview: "setState の競合パターンを確認",
        timestamp: "2026-03-05T11:20:00.000Z",
        metadata: { type: "chat", sessionId: "session-201", messageCount: 12 },
      },
      {
        id: "h-202",
        type: "file",
        title: "notificationSlice.ts 更新",
        preview: "ingestNotification と setNotificationHistory を追加",
        timestamp: "2026-03-05T11:02:00.000Z",
        metadata: {
          type: "file",
          filePath: "apps/desktop/src/renderer/store/slices/notificationSlice.ts",
          additions: 32,
          deletions: 4,
        },
      },
      {
        id: "h-203",
        type: "skill",
        title: "quality-checker 実行",
        preview: "coverage gate verification",
        timestamp: "2026-03-05T10:48:00.000Z",
        metadata: {
          type: "skill",
          skillName: "quality-checker",
          executionId: "exec-203",
          status: "success",
        },
      },
    ],
    stats: { chat: 14, file: 9, skill: 7, total: 30 },
  });

  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[aria-label="Main navigation"]', {
    timeout: 60_000,
  });
  await page.waitForSelector('[data-testid="notification-bell-button"]', {
    timeout: 15_000,
  });

  await page.click('[data-testid="notification-bell-button"]');
  await page.waitForSelector('[data-testid="notification-popover"]', {
    timeout: 15_000,
  });
  await page.screenshot({
    path: path.join(screenshotDir, "TC-01-notification-popover.png"),
    fullPage: true,
  });

  const nav = page.locator('nav[aria-label="Main navigation"]');
  await nav.getByRole("button", { name: "History", exact: true }).click();
  await page.waitForSelector('[data-testid="history-search-view"]', {
    timeout: 15_000,
  });
  await page.waitForSelector('[data-testid="history-item-h-201"]', {
    timeout: 15_000,
  });

  await page.screenshot({
    path: path.join(screenshotDir, "TC-02-history-search-result.png"),
    fullPage: true,
  });

  await page.locator('[data-testid="history-stats-panel"]').screenshot({
    path: path.join(screenshotDir, "TC-03-history-stats-panel.png"),
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
    await waitForServer(`http://localhost:${vitePort}`);

    const browser = await chromium.launch({ headless: true });
    try {
      await captureScreenshots(browser);
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
