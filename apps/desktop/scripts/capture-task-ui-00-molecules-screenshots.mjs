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
  "docs/30-workflows/task-ui-00-molecules/outputs/phase-11/screenshots",
);
const port = process.env.TASK_UI_00_SCREENSHOT_PORT ?? "5181";
const baseUrl = `http://localhost:${port}`;
const route = "/advanced/skill-center";

const scenarios = [
  {
    id: "TC-01",
    file: "TC-01-skill-center-default-dark.png",
    mode: "dark",
    colorScheme: "dark",
    viewport: { width: 1440, height: 900 },
    action: async (page) => {
      await page.goto(`${baseUrl}${route}`);
      await page.waitForSelector('[data-testid="skill-center-view"]');
      await page.waitForSelector("text=healthy-skill");
    },
  },
  {
    id: "TC-02",
    file: "TC-02-skill-center-search-dark.png",
    mode: "dark",
    colorScheme: "dark",
    viewport: { width: 1440, height: 900 },
    action: async (page) => {
      await page.goto(`${baseUrl}${route}`);
      await page.waitForSelector('[data-testid="skill-search-input"]');
      await page.getByTestId("skill-search-input").fill("healthy");
      await page.waitForSelector("text=healthy-skill");
    },
  },
  {
    id: "TC-03",
    file: "TC-03-skill-center-default-light.png",
    mode: "light",
    colorScheme: "light",
    viewport: { width: 1440, height: 900 },
    action: async (page) => {
      await page.goto(`${baseUrl}${route}`);
      await page.waitForSelector('[data-testid="skill-center-view"]');
      await page.waitForSelector("text=healthy-skill");
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "light");
        document.documentElement.style.colorScheme = "light";
      });
      await page.waitForTimeout(300);
    },
  },
  {
    id: "TC-04",
    file: "TC-04-skill-center-default-mobile-dark.png",
    mode: "dark",
    colorScheme: "dark",
    viewport: { width: 390, height: 844 },
    action: async (page) => {
      await page.goto(`${baseUrl}${route}`);
      await page.waitForSelector('[data-testid="skill-center-view"]');
      await page.waitForSelector("text=healthy-skill");
    },
  },
];

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

function createMockScript(themeMode) {
  return () => {
    const now = new Date().toISOString();

    const availableSkills = [
      {
        name: "healthy-skill",
        displayName: "Healthy Skill",
        description: "テストと設計を補助するツール",
        version: "1.0.0",
        category: "testing",
        tags: ["test"],
        author: "E2E",
        path: "/skills/healthy-skill",
        agents: [{ filename: "agent.md", relativePath: "agents/agent.md", size: 128 }],
        references: [],
        indexes: [],
        otherFiles: [],
      },
      {
        name: "broken-metadata-skill",
        displayName: "Broken Metadata Skill",
        description: undefined,
        version: "1.0.0",
        category: "unknown",
        tags: [],
        author: "E2E",
        path: "/skills/broken-metadata-skill",
        agents: undefined,
        references: undefined,
        indexes: undefined,
        otherFiles: undefined,
      },
    ];

    const importedSkills = [
      {
        name: "imported-skill",
        description: "既存インポート済み",
        path: "/skills/imported-skill",
        allowedTools: ["Read"],
        updatedAt: now,
        importedAt: now,
        status: "active",
        agents: [],
        references: [],
        scripts: [],
        assets: [],
        schemas: [],
        indexes: [],
        otherFiles: [],
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
          data: { mode: themeMode, resolvedTheme: themeMode },
        }),
        set: async () => ({ success: true, data: {} }),
        getSystem: async () => ({ success: true, data: { theme: themeMode } }),
        onSystemChanged: () => () => {},
      },
      skill: {
        list: async () => availableSkills,
        getImported: async () => importedSkills,
        import: async (skillName) => ({
          name: skillName,
          description: `Imported: ${skillName}`,
          path: `/skills/${skillName}`,
          allowedTools: ["Read"],
          updatedAt: now,
          importedAt: now,
          status: "active",
          agents: [],
          references: [],
          scripts: [],
          assets: [],
          schemas: [],
          indexes: [],
          otherFiles: [],
        }),
        remove: async () => undefined,
      },
    };
  };
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });

  const server = spawn(
    "pnpm",
    ["exec", "vite", "--config", "vite.e2e.config.ts", "--port", port, "--strictPort"],
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
    browser = await chromium.launch();

    for (const scenario of scenarios) {
      const context = await browser.newContext({
        viewport: scenario.viewport,
        colorScheme: scenario.colorScheme,
      });
      const page = await context.newPage();
      await page.addInitScript(createMockScript(scenario.mode));

      await scenario.action(page);
      await page.waitForTimeout(300);

      const outputPath = path.join(screenshotDir, scenario.file);
      await page.screenshot({ path: outputPath, fullPage: true });
      process.stdout.write(`Captured ${scenario.id}: ${outputPath}\n`);

      await context.close();
    }
  } finally {
    if (browser) {
      await browser.close();
    }
    if (!server.killed) {
      server.kill("SIGTERM");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
