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
  "docs/30-workflows/completed-tasks/task-056c-notification-history-domain/outputs/phase-11/screenshots",
);
const baseUrl = "http://127.0.0.1:5173";

const scenarios = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-dashboard-after.png",
    url: `${baseUrl}/?skipAuth=true`,
    waitFor: async (page) => {
      await page.waitForSelector('[data-testid="dashboard-view"]', {
        timeout: 30_000,
      });
    },
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-chat-history-after.png",
    url: `${baseUrl}/chat/history?skipAuth=true`,
    waitFor: async (page) => {
      await page
        .getByText("セッションが選択されていません", { exact: true })
        .waitFor({ timeout: 30_000 });
    },
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-history-page-after.png",
    url: `${baseUrl}/history/file-123?skipAuth=true`,
    waitFor: async (page) => {
      await page.getByRole("heading", { name: "バージョン履歴" }).waitFor({
        timeout: 30_000,
      });
      await page.getByRole("list", { name: "バージョン履歴" }).waitFor({
        timeout: 30_000,
      });
    },
  },
];

async function waitForServer(url, timeoutMs = 60_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
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

function createMockScript() {
  return () => {
    const now = new Date().toISOString();
    const mockUser = {
      id: "e2e-user",
      email: "e2e@example.com",
      displayName: "E2E User",
      avatarUrl: "",
      provider: "google",
      createdAt: now,
      lastSignInAt: now,
    };

    const historyItems = [
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
    ];

    const versionDetailById = Object.fromEntries(
      historyItems.map((item) => [
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

    sessionStorage.setItem("debug-clear-storage", "done");
    localStorage.setItem("dev-skip-auth", "true");

    window.historyAPI = {
      getFileHistory: async () => ({
        success: true,
        data: {
          items: historyItems,
          total: historyItems.length,
          hasMore: false,
        },
      }),
      getVersionDetail: async (conversionId) => ({
        success: true,
        data: versionDetailById[conversionId] ?? {
          version: historyItems[0],
          logs: [],
        },
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
          historyItems.find((item) => item.conversionId === conversionId) ??
          historyItems[0];
        return {
          success: true,
          data: selected,
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
          data: { mode: "dark", resolvedTheme: "dark" },
        }),
        set: async () => ({ success: true, data: {} }),
        getSystem: async () => ({ success: true, data: { theme: "dark" } }),
        onSystemChanged: () => () => {},
      },
      skill: {
        list: async () => [],
        getImported: async () => [],
        rescan: async () => [],
        remove: async () => undefined,
        onStream: () => () => {},
        onComplete: () => () => {},
        onError: () => () => {},
        onPermissionRequest: () => () => {},
      },
    };
  };
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
      "127.0.0.1",
      "--port",
      "5173",
      "--strictPort",
    ],
    {
      cwd: desktopRoot,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", (chunk) => {
    process.stdout.write(chunk);
  });
  server.stderr.on("data", (chunk) => {
    process.stderr.write(chunk);
  });

  let browser;
  try {
    await waitForServer(baseUrl);
    browser = await chromium.launch({ headless: true });

    for (const scenario of scenarios) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        colorScheme: "light",
      });
      await context.addInitScript(createMockScript());
      const page = await context.newPage();

      await page.goto(scenario.url, { waitUntil: "domcontentloaded" });
      await scenario.waitFor(page);
      await page.waitForTimeout(800);

      const outputPath = path.join(screenshotDir, scenario.file);
      await page.screenshot({ path: outputPath, fullPage: true });
      process.stdout.write(`Captured ${scenario.tc}: ${outputPath}\n`);

      await context.close();
    }
  } finally {
    if (browser) {
      await browser.close();
    }
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
