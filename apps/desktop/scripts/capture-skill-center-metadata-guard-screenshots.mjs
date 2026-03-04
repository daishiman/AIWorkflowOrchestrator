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
  "docs/30-workflows/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001/outputs/phase-11/screenshots",
);
const port = process.env.SKILL_CENTER_SCREENSHOT_PORT ?? "5173";
const baseUrl = `http://localhost:${port}`;
const route = "/advanced/skill-center";

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
          data: { mode: "dark", resolvedTheme: "dark" },
        }),
        set: async () => ({ success: true, data: {} }),
        getSystem: async () => ({ success: true, data: { theme: "dark" } }),
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

async function capture(page, filename, scenario) {
  await scenario(page);
  await page.waitForTimeout(300);
  const output = path.join(screenshotDir, filename);
  await page.screenshot({ path: output, fullPage: true });
  process.stdout.write(`Captured: ${output}\n`);
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
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: "dark",
    });
    const page = await context.newPage();
    await page.addInitScript(createMockScript());

    await capture(page, "TC-01-skill-center-initial.png", async (p) => {
      await p.goto(`${baseUrl}${route}`);
      await p.waitForSelector('[data-testid="skill-center-view"]');
      await p.waitForSelector('[data-testid="skill-card-grid"]');
      await p.waitForSelector("text=healthy-skill");
      await p.waitForSelector("text=broken-metadata-skill");
    });

    await capture(page, "TC-02-search-with-missing-description.png", async (p) => {
      await p.goto(`${baseUrl}${route}`);
      await p.waitForSelector('[data-testid="skill-search-input"]');
      await p.getByTestId("skill-search-input").fill("healthy");
      await p.waitForSelector("text=healthy-skill");
    });

    await capture(page, "TC-03-detail-panel-malformed-metadata.png", async (p) => {
      await p.goto(`${baseUrl}${route}`);
      await p.waitForSelector('[data-testid="skill-card-broken-metadata-skill"]');
      await p.getByTestId("skill-card-broken-metadata-skill").click();
      await p.waitForSelector('[data-testid="skill-detail-panel"]');
      await p.waitForSelector("text=broken-metadata-skill");
    });

    await capture(page, "TC-04-featured-and-category.png", async (p) => {
      await p.goto(`${baseUrl}${route}`);
      await p.waitForSelector('[data-testid="featured-section"]');
      await p.waitForSelector('[data-testid="category-tabs"]');
    });

    await context.close();
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
