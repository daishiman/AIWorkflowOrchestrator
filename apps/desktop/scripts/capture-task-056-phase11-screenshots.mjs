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
  "docs/30-workflows/completed-tasks/task-056-ui-01-store-ipc-architecture/outputs/phase-11/screenshots",
);

const vitePort = 5177;
const baseUrl = `http://localhost:${vitePort}/?skipAuth=true`;

const availableSkills = [
  {
    name: "workflow-helper",
    description: "workflow automation and guard checks",
    path: ".claude/skills/workflow-helper/SKILL.md",
    allowedTools: ["Read"],
    updatedAt: new Date("2026-03-05T00:00:00.000Z").toISOString(),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  },
  {
    name: "history-inspector",
    description: "history and timeline analysis helper",
    path: ".claude/skills/history-inspector/SKILL.md",
    allowedTools: ["Read"],
    updatedAt: new Date("2026-03-05T00:00:00.000Z").toISOString(),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  },
];

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // retry until timeout
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

function createMockScript() {
  return (mockSkills) => {
    const now = new Date().toISOString();
    localStorage.setItem("dev-skip-auth", "true");

    let importedSkills = [];
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
      skill: {
        list: async () => clone(mockSkills),
        getImported: async () => clone(importedSkills),
        import: async (skillName) => {
          const target = mockSkills.find((s) => s.name === skillName);
          if (!target) throw new Error(`Skill not found: ${skillName}`);
          const imported = {
            ...clone(target),
            importedAt: now,
            status: "active",
          };
          importedSkills = [...importedSkills, imported];
          return imported;
        },
        remove: async (skillName) => {
          importedSkills = importedSkills.filter((s) => s.name !== skillName);
        },
        rescan: async () => clone(mockSkills),
      },
      notification: {
        getHistory: async () => ({
          success: true,
          data: { notifications: [], totalCount: 0 },
        }),
        markRead: async () => ({ success: true, data: { updated: true } }),
        markAllRead: async () => ({ success: true, data: { updatedCount: 0 } }),
        clear: async () => ({ success: true, data: { deletedCount: 0 } }),
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
    };

    // Avoid unused warning in browser context.
    void mockUser;
  };
}

async function captureDesktop(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
  });
  await context.addInitScript(createMockScript(), availableSkills);

  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[aria-label="Main navigation"]', {
    timeout: 60_000,
  });
  const nav = page.locator('nav[aria-label="Main navigation"]');
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(screenshotDir, "TC-056-11-01-dashboard-desktop.png"),
    fullPage: true,
  });

  await nav.getByRole("button", { name: "Workspace", exact: true }).click();
  await page.getByText("Workspace", { exact: true }).waitFor({
    timeout: 15_000,
  });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(screenshotDir, "TC-056-11-02-workspace-desktop.png"),
    fullPage: true,
  });

  await nav.getByRole("button", { name: "Skills", exact: true }).click();
  await page.waitForSelector('[data-testid="skill-center-view"]', {
    timeout: 20_000,
  });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(screenshotDir, "TC-056-11-03-skill-center-desktop.png"),
    fullPage: true,
  });

  await nav.getByRole("button", { name: "History", exact: true }).click();
  await page.getByText("History Search", { exact: true }).waitFor({
    timeout: 15_000,
  });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(screenshotDir, "TC-056-11-04-history-search-desktop.png"),
    fullPage: true,
  });

  await context.close();
}

async function captureMobile(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    colorScheme: "light",
  });
  await context.addInitScript(createMockScript(), availableSkills);

  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[aria-label="Main navigation"]', {
    timeout: 60_000,
  });
  const nav = page.locator('nav[aria-label="Main navigation"]');
  await page.waitForTimeout(300);

  await nav.getByRole("button", { name: "History", exact: true }).click();
  await page.getByText("History Search", { exact: true }).waitFor({
    timeout: 15_000,
  });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(screenshotDir, "TC-056-11-05-history-search-mobile.png"),
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
