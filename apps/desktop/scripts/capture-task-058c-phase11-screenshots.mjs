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
  "docs/30-workflows/task-058c-ui-06-history-search-view",
);
const screenshotDir = path.join(workflowRoot, "outputs/phase-11/screenshots");
const baseUrl = "http://127.0.0.1:5173";

const scenarios = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-initial.png",
    scenario: "default",
    viewport: { width: 1440, height: 1200 },
    waitFor: async (page) => {
      await page.getByRole("heading", { name: "あなたの記録" }).waitFor();
      await page.getByText("React コンポーネントの設計").waitFor();
    },
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-search.png",
    scenario: "default",
    viewport: { width: 1440, height: 1200 },
    waitFor: async (page) => {
      await page.getByRole("heading", { name: "あなたの記録" }).waitFor();
      await page.getByText("React コンポーネントの設計").waitFor();
      await page.getByLabel("やりとりを検索").fill("slides");
      await page.waitForTimeout(450);
      await page.getByText("skill:presentation-generator 実行").waitFor();
    },
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-accordion.png",
    scenario: "default",
    viewport: { width: 1440, height: 1200 },
    waitFor: async (page) => {
      await page.getByText("skill:presentation-generator 実行").waitFor();
      await page.getByRole("button", { name: /skill:presentation-generator 実行/i }).click();
      await page.getByText("12340ms").waitFor();
    },
  },
  {
    tc: "TC-11-11",
    file: "TC-11-11-error.png",
    scenario: "error",
    viewport: { width: 1440, height: 1200 },
    waitFor: async (page) => {
      await page.getByText("記録の読み込みに失敗しました").waitFor();
    },
  },
  {
    tc: "TC-11-12",
    file: "TC-11-12-empty.png",
    scenario: "empty",
    viewport: { width: 1440, height: 1200 },
    waitFor: async (page) => {
      await page.getByText("まだ記録がありません").waitFor();
    },
  },
  {
    tc: "TC-11-21",
    file: "TC-11-21-mobile-sticky.png",
    scenario: "default",
    viewport: { width: 390, height: 844 },
    waitFor: async (page) => {
      await page.getByText("React コンポーネントの設計").waitFor();
      await page.mouse.wheel(0, 240);
      await page.waitForTimeout(200);
    },
  },
];

function createMockScript(scenario) {
  return (inputScenario) => {
    const isoDate = (offsetDays, hour) => {
      const date = new Date();
      date.setHours(hour, 0, 0, 0);
      date.setDate(date.getDate() + offsetDays);
      return date.toISOString();
    };

    const items = [
      {
        id: "chat-1",
        type: "chat",
        title: "React コンポーネントの設計",
        preview: "Composition をどう使うか整理したやりとり",
        timestamp: isoDate(0, 14),
        metadata: {
          type: "chat",
          sessionId: "session-1",
          messageCount: 6,
          lastModel: "claude-opus-4-6",
        },
      },
      {
        id: "file-1",
        type: "file",
        title: "src/components/Button.tsx",
        preview: "ボタンのスタイルを整理して分岐を削減",
        timestamp: isoDate(0, 11),
        metadata: {
          type: "file",
          filePath: "src/components/Button.tsx",
          additions: 12,
          deletions: 3,
        },
      },
      {
        id: "skill-1",
        type: "skill",
        title: "skill:presentation-generator 実行",
        preview: "slides.html を出力しました",
        timestamp: isoDate(-1, 10),
        metadata: {
          type: "skill",
          skillName: "presentation-generator",
          executionId: "exec-1",
          status: "success",
          outputFile: "slides.html",
          executionTimeMs: 12340,
          modelUsed: "claude-opus-4-6",
        },
      },
    ];

    const mockUser = {
      id: "phase11-user",
      email: "phase11@example.com",
      displayName: "Phase11 User",
      avatarUrl: "",
      provider: "google",
      createdAt: new Date().toISOString(),
      lastSignInAt: new Date().toISOString(),
    };

    localStorage.setItem("dev-skip-auth", "true");

    const activeScenario = inputScenario ?? "default";
    const search = async (request = { query: "" }) => {
      if (activeScenario === "error") {
        return {
          success: false,
          error: { code: "UNKNOWN_ERROR", message: "phase11 mock error" },
        };
      }

      if (activeScenario === "empty") {
        return {
          success: true,
          data: {
            items: [],
            totalCount: 0,
            hasMore: false,
          },
        };
      }

      const normalized = (request.query ?? "").trim().toLowerCase();
      const filteredItems =
        normalized === ""
          ? items
          : items.filter((item) => {
              return (
                item.title.toLowerCase().includes(normalized) ||
                item.preview.toLowerCase().includes(normalized)
              );
            });

      return {
        success: true,
        data: {
          items: filteredItems,
          totalCount: filteredItems.length,
          hasMore: false,
        },
      };
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
      historySearch: {
        search,
        getStats: async () => ({
          success: true,
          data: { chat: 1, file: 1, skill: 1, total: 3 },
        }),
      },
      file: {
        read: async ({ filePath }) => ({
          success: true,
          data: { content: `opened:${filePath}` },
        }),
        write: async () => ({ success: true, data: {} }),
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

async function waitForServer(url, timeoutMs = 60_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
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

  throw new Error(`Timed out waiting for server: ${url}`);
}

async function isServerReachable(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

async function stopServer(server, timeoutMs = 5_000) {
  if (!server || server.killed) {
    return;
  }

  const waitForExit = new Promise((resolve) => {
    server.once("exit", resolve);
  });

  server.kill("SIGTERM");

  const didExit = await Promise.race([
    waitForExit.then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), timeoutMs)),
  ]);

  if (!didExit) {
    server.kill("SIGKILL");
    await waitForExit;
  }
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });

  let server = null;
  const reuseExistingServer = await isServerReachable(baseUrl);

  if (!reuseExistingServer) {
    server = spawn(
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
  } else {
    console.log("[capture-task-058c] Reusing existing Vite server on :5173");
  }

  let browser;
  try {
    await waitForServer(baseUrl);
    browser = await chromium.launch({ headless: true });

    for (const scenario of scenarios) {
      const context = await browser.newContext({
        viewport: scenario.viewport,
        colorScheme: "dark",
      });
      const page = await context.newPage();
      await page.addInitScript(createMockScript(scenario.scenario), scenario.scenario);
      await page.goto(`${baseUrl}/advanced/history-search?skipAuth=true`, {
        waitUntil: "domcontentloaded",
      });
      await scenario.waitFor(page);
      await page.screenshot({
        path: path.join(screenshotDir, scenario.file),
        fullPage: true,
      });
      await context.close();
      console.log(`[capture-task-058c] ${scenario.tc} -> ${scenario.file}`);
    }
  } finally {
    if (browser) {
      await browser.close();
    }
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
