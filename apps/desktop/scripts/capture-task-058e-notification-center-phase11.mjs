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
const workflowRoot = path.join(
  repoRoot,
  "docs/30-workflows/completed-tasks/task-058e-ui-08-notification-center",
);
const screenshotDir = path.join(workflowRoot, "outputs/phase-11/screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");

const vitePort = 5185;
const baseUrl = `http://localhost:${vitePort}/?skipAuth=true`;
const pnpmCmd = process.env.PHASE11_PNPM || "/opt/homebrew/bin/pnpm";

const baseNotifications = [
  {
    id: "n-201",
    type: "warning",
    title: "同期ジョブが 1 件遅延しています",
    detail:
      "history indexer の再実行を待っています。30 秒後に自動再試行されます。",
    timestamp: "2026-03-11T01:12:00.000Z",
    isRead: false,
    source: { kind: "system", eventType: "sync-delay" },
  },
  {
    id: "n-202",
    type: "success",
    title: "analysis skill の実行が完了しました",
    detail: "実行時間 1.2s / 出力 3 files / warning 0 件",
    timestamp: "2026-03-11T00:48:00.000Z",
    isRead: false,
    source: { kind: "skill_execution", skillName: "analysis" },
  },
  {
    id: "n-203",
    type: "info",
    title: "ワークスペースの自動保存が完了しました",
    detail: "autosave checkpoint #184 を保存しました。",
    timestamp: "2026-03-10T23:20:00.000Z",
    isRead: true,
    source: { kind: "system", eventType: "autosave" },
  },
];

function createMockScript({ notifications }) {
  return ({ payload }) => {
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
            notifications: clone(payload),
            totalCount: payload.length,
          },
        }),
        markRead: async () => ({ success: true, data: { updated: true } }),
        markAllRead: async () => ({
          success: true,
          data: { updatedCount: payload.length },
        }),
        delete: async () => ({ success: true, data: { deleted: true } }),
        clear: async () => ({
          success: true,
          data: { deletedCount: payload.length },
        }),
        onNew: () => () => {},
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
      // retry
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

async function createPage(browser, viewport, notifications) {
  const context = await browser.newContext({
    viewport,
    colorScheme: "light",
  });
  await context.addInitScript(createMockScript({ notifications }), {
    payload: notifications,
  });

  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-testid="notification-bell-button"]', {
    timeout: 60_000,
  });

  return { context, page };
}

async function capture(browser) {
  const captures = [];

  {
    const { context, page } = await createPage(
      browser,
      { width: 1440, height: 900 },
      baseNotifications,
    );

    const idlePath = path.join(
      screenshotDir,
      "TC-11-01-desktop-idle-badge.png",
    );
    await page.screenshot({ path: idlePath, fullPage: true });
    captures.push({
      testCase: "TC-11-01",
      file: path.basename(idlePath),
      viewport: "desktop",
      state: "idle badge",
    });

    await page.click('[data-testid="notification-bell-button"]');
    await page.waitForSelector('[data-testid="notification-popover"]', {
      timeout: 15_000,
    });

    const openPath = path.join(
      screenshotDir,
      "TC-11-02-desktop-popover-open.png",
    );
    await page.screenshot({ path: openPath, fullPage: true });
    captures.push({
      testCase: "TC-11-02",
      file: path.basename(openPath),
      viewport: "desktop",
      state: "popover open",
    });

    await page.click('[data-testid="notification-item-n-201"]');
    await page.waitForSelector("text=history indexer の再実行を待っています", {
      timeout: 15_000,
    });

    const expandedPath = path.join(
      screenshotDir,
      "TC-11-03-desktop-item-expanded.png",
    );
    await page.screenshot({ path: expandedPath, fullPage: true });
    captures.push({
      testCase: "TC-11-03",
      file: path.basename(expandedPath),
      viewport: "desktop",
      state: "item expanded",
    });

    const item = page.locator('[data-testid="notification-item-n-201"]');
    const box = await item.boundingBox();
    if (!box) {
      throw new Error("notification item bounding box not found");
    }

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - 96, box.y + box.height / 2, {
      steps: 10,
    });
    await page.mouse.up();
    await page.waitForTimeout(150);

    const deleteRevealPath = path.join(
      screenshotDir,
      "TC-11-07-desktop-delete-reveal.png",
    );
    await page.screenshot({ path: deleteRevealPath, fullPage: true });
    captures.push({
      testCase: "TC-11-07",
      file: path.basename(deleteRevealPath),
      viewport: "desktop",
      state: "delete reveal",
    });

    await context.close();
  }

  {
    const { context, page } = await createPage(
      browser,
      { width: 1024, height: 768 },
      baseNotifications,
    );

    await page.click('[data-testid="notification-bell-button"]');
    await page.waitForSelector('[data-testid="notification-popover"]', {
      timeout: 15_000,
    });

    const tabletPath = path.join(
      screenshotDir,
      "TC-11-04-tablet-popover-open.png",
    );
    await page.screenshot({ path: tabletPath, fullPage: true });
    captures.push({
      testCase: "TC-11-04",
      file: path.basename(tabletPath),
      viewport: "tablet",
      state: "popover open",
    });

    await context.close();
  }

  {
    const { context, page } = await createPage(
      browser,
      { width: 390, height: 844 },
      baseNotifications,
    );

    await page.click('[data-testid="notification-bell-button"]');
    await page.waitForSelector('[data-testid="notification-popover"]', {
      timeout: 15_000,
    });

    const mobilePath = path.join(
      screenshotDir,
      "TC-11-05-mobile-overlay-open.png",
    );
    await page.screenshot({ path: mobilePath, fullPage: true });
    captures.push({
      testCase: "TC-11-05",
      file: path.basename(mobilePath),
      viewport: "mobile",
      state: "overlay open",
    });

    await context.close();
  }

  {
    const { context, page } = await createPage(
      browser,
      { width: 1440, height: 900 },
      [],
    );

    await page.click('[data-testid="notification-bell-button"]');
    await page.waitForSelector("text=お知らせはありません", {
      timeout: 15_000,
    });

    const emptyPath = path.join(screenshotDir, "TC-11-06-empty-state.png");
    await page.screenshot({ path: emptyPath, fullPage: true });
    captures.push({
      testCase: "TC-11-06",
      file: path.basename(emptyPath),
      viewport: "desktop",
      state: "empty state",
    });

    await context.close();
  }

  await fs.writeFile(
    metadataPath,
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        baseUrl,
        captures,
      },
      null,
      2,
    ),
    "utf8",
  );

  return captures;
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });

  const server = spawn(
    pnpmCmd,
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
      env: {
        ...process.env,
        PATH: `/opt/homebrew/bin:${process.env.PATH || ""}`,
      },
    },
  );

  server.stdout.on("data", (data) => process.stdout.write(data));
  server.stderr.on("data", (data) => process.stderr.write(data));

  try {
    await waitForServer(`http://localhost:${vitePort}`);

    const browser = await chromium.launch({ headless: true });
    try {
      const captures = await capture(browser);
      console.log(`Captured ${captures.length} screenshots`);
    } finally {
      await browser.close();
    }
  } finally {
    server.kill("SIGTERM");
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
