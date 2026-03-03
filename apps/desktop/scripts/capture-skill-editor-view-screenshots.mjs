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
  "docs/30-workflows/skill-editor-view-closure/outputs/phase-11/screenshots",
);
const baseUrl = "http://localhost:5173";

const defaultViewport = { width: 1440, height: 900 };

const scenarios = [
  {
    url: `${baseUrl}/advanced/skill-editor`,
    selector: '[role="tree"]',
    file: "01-filetree-keyboard-focus.png",
    preCapture: async (page) => {
      await page.click('[role="tree"]');
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      await page.waitForTimeout(250);
    },
  },
  {
    url: `${baseUrl}/advanced/skill-editor`,
    selector: 'button[aria-label="ナビゲーション開く"]',
    file: "02-mobile-drawer-closed.png",
    viewport: { width: 390, height: 844 },
  },
  {
    url: `${baseUrl}/advanced/skill-editor`,
    selector: '[data-testid="mobile-drawer"]',
    file: "03-mobile-drawer-open.png",
    viewport: { width: 390, height: 844 },
    preCapture: async (page) => {
      await page.click('button[aria-label="ナビゲーション開く"]');
      await page.waitForSelector('[data-testid="drawer-overlay"]', {
        timeout: 10_000,
      });
      await page.waitForTimeout(250);
    },
  },
  {
    url: `${baseUrl}/advanced/skill-editor`,
    readySelector: 'text=prompt.md',
    selector: 'text=保存しました',
    file: "04-save-toast-success.png",
    preCapture: async (page) => {
      await page.click('text=prompt.md');
      await page.waitForFunction(() => {
        const textarea = document.querySelector("textarea");
        return Boolean(textarea && textarea.value.includes("Initial prompt"));
      });
      await page.fill("textarea", "# Updated prompt\\n保存動作の確認");
      await page.click('button[aria-label="保存"]');
      await page.waitForSelector('text=保存しました', { timeout: 10_000 });
    },
  },
  {
    url: `${baseUrl}/advanced/skill-editor-readonly`,
    selector: 'text=読み取り専用 — 編集できません',
    file: "05-readonly-indicator.png",
  },
  {
    url: `${baseUrl}/advanced/skill-editor`,
    readySelector: 'button[aria-label="閉じる"]',
    selector: '[data-testid="unsaved-dialog-overlay"]',
    file: "06-navigation-breadcrumb.png",
    preCapture: async (page) => {
      await page.click('text=prompt.md');
      await page.fill("textarea", "# unsaved\nclose confirmation");
      await page.click('button[aria-label="閉じる"]');
      await page.waitForSelector('[data-testid="unsaved-dialog-overlay"]', {
        timeout: 10_000,
      });
    },
  },
  {
    url: `${baseUrl}/advanced/skill-editor`,
    selector: 'text=docs',
    file: "07-animation-motion.png",
    preCapture: async (page) => {
      await page.click('text=docs');
      await page.waitForTimeout(250);
    },
  },
  {
    url: `${baseUrl}/advanced/skill-editor`,
    selector: '[role="toolbar"]',
    file: "08-full-editor-view.png",
    preCapture: async (page) => {
      await page.click('text=prompt.md');
      await page.waitForTimeout(200);
    },
  },
];

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

function createMockScript() {
  return () => {
    const now = new Date().toISOString();
    const fileContents = {
      "prompt.md": "# Demo Skill\\nInitial prompt",
      "config.json": '{\\n  "version": 1,\\n  "enabled": true\\n}',
      "docs/guide.md": "# Guide\\nThis is a demo guide.",
    };

    const fileTree = [
      {
        name: "prompt.md",
        path: "prompt.md",
        type: "file",
      },
      {
        name: "config.json",
        path: "config.json",
        type: "file",
      },
      {
        name: "docs",
        path: "docs",
        type: "directory",
        children: [
          {
            name: "guide.md",
            path: "docs/guide.md",
            type: "file",
          },
        ],
      },
    ];

    const mockUser = {
      id: "e2e-user",
      email: "e2e@example.com",
      displayName: "E2E User",
      avatarUrl: "",
      provider: "google",
      createdAt: now,
      lastSignInAt: now,
    };

    window.confirm = () => true;

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
            callback({ authenticated: true, user: mockUser, isOffline: false });
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
        listAvailable: async () => [],
        importFromSource: async () => ({ imported: [] }),
        remove: async () => ({ removed: true }),
        getFileTree: async () => fileTree,
        readFile: async (_skillName, filePath) => fileContents[filePath] ?? "",
        writeFile: async (_skillName, filePath, content) => {
          if (window.location.pathname.includes("readonly")) {
            throw new Error("読み取り専用スキルのため保存できません");
          }
          fileContents[filePath] = content;
          return true;
        },
        createFile: async (_skillName, filePath, content) => {
          fileContents[filePath] = content;
          return true;
        },
        deleteFile: async (_skillName, filePath) => {
          delete fileContents[filePath];
          return true;
        },
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
      "--port",
      "5173",
      "--strictPort",
    ],
    {
      cwd: desktopRoot,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", (data) => {
    process.stdout.write(data);
  });
  server.stderr.on("data", (data) => {
    process.stderr.write(data);
  });

  let browser;
  try {
    await waitForServer(baseUrl);

    browser = await chromium.launch({ headless: true });
    for (const scenario of scenarios) {
      const context = await browser.newContext({
        viewport: scenario.viewport ?? defaultViewport,
        colorScheme: "dark",
      });
      await context.addInitScript(createMockScript());
      const page = await context.newPage();

      await page.goto(scenario.url, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(scenario.readySelector ?? scenario.selector, {
        timeout: 15_000,
      });
      if (scenario.preCapture) {
        await scenario.preCapture(page);
        await page.waitForSelector(scenario.selector, { timeout: 15_000 });
      }
      await page.waitForTimeout(300);

      const screenshotPath = path.join(screenshotDir, scenario.file);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      process.stdout.write(`Captured: ${screenshotPath}\\n`);

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
