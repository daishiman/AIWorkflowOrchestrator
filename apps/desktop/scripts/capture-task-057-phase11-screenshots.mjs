#!/usr/bin/env node

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(desktopRoot, "..", "..");
const screenshotDir = path.resolve(
  repoRoot,
  "docs/30-workflows/task-057-ui-02-global-nav-core/outputs/phase-11/screenshots",
);
const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:4173";

const historyItems = [
  {
    id: "history-chat-1",
    title: "Cmd+6 から履歴検索へ移動",
    summary: "ショートカット導線の検証ログ",
    timestamp: new Date("2026-03-06T08:00:00.000Z").toISOString(),
    metadata: {
      type: "chat",
      sessionId: "session-001",
      messageCount: 14,
    },
  },
  {
    id: "history-file-1",
    title: "GlobalNavStrip 実装差分",
    summary: "AppLayout と NavStrip の接続を確認",
    timestamp: new Date("2026-03-06T08:05:00.000Z").toISOString(),
    metadata: {
      type: "file",
      filePath: "apps/desktop/src/renderer/App.tsx",
      additions: 42,
      deletions: 8,
    },
  },
  {
    id: "history-skill-1",
    title: "skillCenter 導線監査",
    summary: "モバイル More 内の導線を検証",
    timestamp: new Date("2026-03-06T08:10:00.000Z").toISOString(),
    metadata: {
      type: "skill",
      skillName: "global-nav-audit",
      status: "success",
    },
  },
];

const historyStats = {
  chat: 12,
  file: 7,
  skill: 3,
  total: 22,
};

function createMockScript() {
  return ({ historyItems: mockHistoryItems, historyStats: mockStats }) => {
    localStorage.setItem("dev-skip-auth", "true");

    const clone = (value) => JSON.parse(JSON.stringify(value));
    const mockUser = {
      id: "phase11-user",
      email: "phase11@example.com",
      displayName: "Phase11 User",
      avatarUrl: null,
      provider: "google",
      createdAt: new Date("2026-03-06T08:00:00.000Z").toISOString(),
      lastSignInAt: new Date("2026-03-06T08:00:00.000Z").toISOString(),
    };

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
        onAuthStateChanged: () => () => undefined,
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
        onSystemChanged: () => () => undefined,
      },
      profile: {
        get: async () => ({ success: true, data: null }),
        getProviders: async () => ({ success: true, data: [] }),
        update: async () => ({ success: true, data: {} }),
        linkProvider: async () => ({ success: true, data: {} }),
        unlinkProvider: async () => ({ success: true, data: {} }),
        delete: async () => ({ success: true, data: {} }),
      },
      avatar: {
        upload: async () => ({ success: true, data: {} }),
        useProvider: async () => ({ success: true, data: {} }),
        remove: async () => ({ success: true, data: {} }),
      },
      notification: {
        getHistory: async () => ({
          success: true,
          data: { notifications: [], totalCount: 0 },
        }),
        markRead: async () => ({ success: true, data: { updated: true } }),
        markAllRead: async () => ({ success: true, data: { updatedCount: 0 } }),
        clear: async () => ({ success: true, data: { deletedCount: 0 } }),
        onNew: () => () => undefined,
      },
      historySearch: {
        search: async () => ({
          success: true,
          data: {
            items: clone(mockHistoryItems),
            totalCount: mockHistoryItems.length,
            hasMore: false,
          },
        }),
        getStats: async () => ({
          success: true,
          data: clone(mockStats),
        }),
      },
      skill: {
        list: async () => [],
        getImported: async () => [],
        import: async () => ({ success: true }),
        remove: async () => ({ success: true }),
        rescan: async () => [],
      },
    };
  };
}

async function preparePage(browser, viewport) {
  const context = await browser.newContext({
    viewport,
    colorScheme: "light",
  });
  await context.addInitScript(createMockScript(), {
    historyItems,
    historyStats,
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/?skipAuth=true`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.waitForSelector('nav[aria-label="Main navigation"]', {
    timeout: 60_000,
  });
  await page.waitForTimeout(600);
  return { context, page };
}

async function captureDesktop(browser) {
  const { context, page } = await preparePage(browser, {
    width: 1440,
    height: 900,
  });

  try {
    await page.screenshot({
      path: path.join(screenshotDir, "TC-11-01-desktop-expanded-dashboard.png"),
      fullPage: true,
    });

    await page.keyboard.press("Control+6");
    await page.waitForSelector('[data-testid="history-search-view"]', {
      timeout: 15_000,
    });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(
        screenshotDir,
        "TC-11-04-desktop-history-search-shortcut.png",
      ),
      fullPage: true,
    });
  } finally {
    await page.close();
    await context.close();
  }
}

async function captureTablet(browser) {
  const { context, page } = await preparePage(browser, {
    width: 900,
    height: 1024,
  });

  try {
    const workspaceButton = page.getByRole("button", {
      name: "ワークスペース",
    });
    await workspaceButton.focus();
    await page.waitForTimeout(250);
    await page.screenshot({
      path: path.join(screenshotDir, "TC-11-02-tablet-collapsed-focus.png"),
      fullPage: true,
    });
  } finally {
    await page.close();
    await context.close();
  }
}

async function captureMobile(browser) {
  const { context, page } = await preparePage(browser, {
    width: 390,
    height: 844,
  });

  try {
    await page.screenshot({
      path: path.join(screenshotDir, "TC-11-03-mobile-default.png"),
      fullPage: true,
    });

    await page.getByRole("button", { name: "その他" }).click();
    await page.waitForSelector(
      '[role="menu"][aria-label="その他のナビゲーション"]',
      {
        timeout: 10_000,
      },
    );
    await page.waitForTimeout(250);
    await page.screenshot({
      path: path.join(screenshotDir, "TC-11-03-mobile-more-menu.png"),
      fullPage: true,
    });
  } finally {
    await page.close();
    await context.close();
  }
}

async function main() {
  await mkdir(screenshotDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  try {
    await captureDesktop(browser);
    await captureTablet(browser);
    await captureMobile(browser);
    console.log(`screenshots captured: ${screenshotDir}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
