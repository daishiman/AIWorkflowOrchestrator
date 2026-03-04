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
const workflowDir = path.join(
  repoRoot,
  "docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001",
);
const screenshotDir = path.join(workflowDir, "outputs/phase-11/screenshots");
const port = process.env.SKILL_IMPORT_SCREENSHOT_PORT ?? "5174";
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
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const buildImported = (name, description) => ({
      name,
      description,
      path: `/skills/${name}`,
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
    });

    let availableSkills = [
      {
        name: "already-imported",
        displayName: "Already Imported",
        description: "既に追加済みのスキル",
        version: "1.0.0",
        category: "development",
        tags: ["idempotency"],
        author: "E2E",
        path: "/skills/already-imported",
        agents: [],
        references: [],
        indexes: [],
        otherFiles: [],
      },
      {
        name: "new-skill",
        displayName: "New Skill",
        description: "追加ボタンの状態遷移確認用",
        version: "1.0.0",
        category: "development",
        tags: ["ux"],
        author: "E2E",
        path: "/skills/new-skill",
        agents: [],
        references: [],
        indexes: [],
        otherFiles: [],
      },
    ];

    let importedSkills = [
      buildImported("already-imported", "既に追加済みのスキル"),
    ];

    window.__importCallCount = 0;
    window.__importCallsByName = {};

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
        import: async (skillName) => {
          window.__importCallCount += 1;
          window.__importCallsByName[skillName] =
            (window.__importCallsByName[skillName] ?? 0) + 1;

          const already = importedSkills.find((skill) => skill.name === skillName);
          if (already) {
            return already;
          }

          await sleep(900);
          const imported = buildImported(skillName, `Imported: ${skillName}`);
          importedSkills = [...importedSkills, imported];
          availableSkills = availableSkills.filter((skill) => skill.name !== skillName);
          return imported;
        },
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

    await capture(page, "TC-01-initial-imported-state.png", async (p) => {
      await p.goto(`${baseUrl}${route}`, {
        waitUntil: "domcontentloaded",
        timeout: 90_000,
      });
      await p.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {
        // networkidle未達でも以降の要素待機で十分判定できる
      });
      await p.waitForSelector('[data-testid="skill-center-view"]');
      await p.waitForSelector('[data-testid="skill-card-already-imported"]');
      await p.waitForSelector('[data-testid="skill-card-new-skill"]');
      await p
        .getByTestId("skill-card-already-imported")
        .getByTestId("add-button")
        .waitFor();
    });

    const newSkillCard = page.getByTestId("skill-card-new-skill");
    await newSkillCard.getByTestId("add-button").click();

    await capture(page, "TC-02-new-skill-processing.png", async () => {
      await newSkillCard.getByTestId("spinner").waitFor({ state: "visible" });
    });

    await capture(page, "TC-03-post-import-state.png", async (p) => {
      await p.waitForSelector('[data-testid="skill-card-new-skill"]', {
        state: "hidden",
      });
      await p.waitForSelector('[data-testid="skill-card-already-imported"]');
    });

    await capture(page, "TC-04-imported-detail-panel.png", async (p) => {
      await p.waitForSelector('[data-testid="skill-card-already-imported"]');
      await p.getByTestId("skill-card-already-imported").click();
      await p.waitForSelector('[data-testid="skill-detail-panel"]');
      await p.getByText("追加済み").first().waitFor({ state: "visible" });
    });

    const importDiagnostics = await page.evaluate(() => ({
      total: window.__importCallCount ?? 0,
      byName: window.__importCallsByName ?? {},
    }));
    await fs.writeFile(
      path.join(screenshotDir, "import-call-diagnostics.json"),
      JSON.stringify(importDiagnostics, null, 2),
      "utf8",
    );
    process.stdout.write(
      `Captured: ${path.join(screenshotDir, "import-call-diagnostics.json")}\n`,
    );

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
