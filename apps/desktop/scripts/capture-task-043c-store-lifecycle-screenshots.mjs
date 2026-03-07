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
  "docs/30-workflows/task-043c-store-lifecycle-integration-design",
);
const screenshotDir = path.join(workflowDir, "outputs/phase-11/screenshots");
const port = process.env.TASK_043C_SCREENSHOT_PORT ?? "5178";
const baseUrl = `http://localhost:${port}`;
const route = "/advanced/skill-management-panel";
const defaultViewport = { width: 1440, height: 900 };

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
    const now = new Date();
    const scenario = new URLSearchParams(window.location.search).get("scenario") ?? "mixed";

    const makeImported = (name, description) => ({
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

    const makeAvailable = (name, description, overrides = {}) => ({
      name,
      description,
      path: `/skills/${name}`,
      allowedTools: ["Read"],
      updatedAt: now,
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
      ...overrides,
    });

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const scenarioFactories = {
      mixed: () => ({
        availableSkills: [
          makeAvailable("skill-gamma", "Gamma skill for importing"),
          makeAvailable("skill-delta", "Delta skill for import list"),
        ],
        importedSkills: [
          makeImported("skill-alpha", "Alpha skill for testing"),
          makeImported("skill-beta", "Beta skill for search testing"),
        ],
        importError: null,
        importDelayMs: 0,
      }),
      importFailure: () => ({
        availableSkills: [makeAvailable("skill-gamma", "Gamma skill for importing")],
        importedSkills: [makeImported("skill-alpha", "Alpha skill for testing")],
        importError: "スキルのインポートに失敗: timeout",
        importDelayMs: 0,
      }),
      delayedImport: () => ({
        availableSkills: [makeAvailable("skill-gamma", "Gamma skill for importing")],
        importedSkills: [makeImported("skill-alpha", "Alpha skill for testing")],
        importError: null,
        importDelayMs: 1200,
      }),
    };

    const initialState = scenarioFactories[scenario]?.() ?? scenarioFactories.mixed();

    let availableSkills = [...initialState.availableSkills];
    let importedSkills = [...initialState.importedSkills];
    let importError = initialState.importError;
    const importDelayMs = initialState.importDelayMs;

    const mockUser = {
      id: "e2e-user",
      email: "e2e@example.com",
      displayName: "E2E User",
      avatarUrl: "",
      provider: "google",
      createdAt: now.toISOString(),
      lastSignInAt: now.toISOString(),
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
          data: {
            mode: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
            resolvedTheme: window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light",
          },
        }),
        set: async () => ({ success: true, data: {} }),
        getSystem: async () => ({ success: true, data: { theme: "dark" } }),
        onSystemChanged: () => () => {},
      },
      skill: {
        list: async () => availableSkills,
        getImported: async () => importedSkills,
        import: async (skillName) => {
          if (importDelayMs > 0) {
            await wait(importDelayMs);
          }
          if (importError) {
            throw new Error(importError);
          }

          const alreadyImported = importedSkills.find((skill) => skill.name === skillName);
          if (alreadyImported) {
            availableSkills = availableSkills.filter((skill) => skill.name !== skillName);
            return alreadyImported;
          }

          const imported = makeImported(skillName, `Imported: ${skillName}`);
          importedSkills = [...importedSkills, imported];
          availableSkills = availableSkills.filter((skill) => skill.name !== skillName);
          return imported;
        },
        remove: async (skillName) => {
          importedSkills = importedSkills.filter((skill) => skill.name !== skillName);
        },
        rescan: async () => availableSkills,
        readFile: async () => "# mock",
        writeFile: async () => undefined,
        listBackups: async () => [],
        restoreBackup: async () => undefined,
      },
    };
  };
}

const scenarios = [
  {
    tc: "TC-01",
    scenario: "mixed",
    file: "TC-01-import-normal-state-light.png",
    colorScheme: "light",
    run: async (page) => {
      await page.waitForSelector('[data-testid="skill-management-panel"]');
      await page.waitForSelector('[data-testid="imported-skill-card-skill-alpha"]');
      await page.waitForSelector('[data-testid="available-skill-row-skill-gamma"]');
    },
  },
  {
    tc: "TC-02",
    scenario: "importFailure",
    file: "TC-02-import-error-state-light.png",
    colorScheme: "light",
    run: async (page) => {
      await page.getByLabel("skill-gamma を追加する").click();
      await page
        .getByTestId("skill-import-dialog")
        .getByRole("button", { name: "追加する" })
        .click();
      await page.waitForSelector('[data-testid="skill-import-dialog-error"]');
    },
  },
  {
    tc: "TC-03",
    scenario: "delayedImport",
    file: "TC-03-import-processing-state-light.png",
    colorScheme: "light",
    run: async (page) => {
      await page.getByLabel("skill-gamma を追加する").click();
      await page
        .getByTestId("skill-import-dialog")
        .getByRole("button", { name: "追加する" })
        .click();
      await page.waitForSelector('button[disabled]:has-text("追加中...")');
    },
  },
  {
    tc: "TC-04",
    scenario: "mixed",
    file: "TC-04-render-stability-filter-light.png",
    colorScheme: "light",
    run: async (page) => {
      await page.getByLabel("スキルを検索").fill("alpha");
      await page.waitForSelector('[data-testid="imported-skill-card-skill-alpha"]');
    },
  },
  {
    tc: "TC-05",
    scenario: "mixed",
    file: "TC-05-selector-filtered-available-light.png",
    colorScheme: "light",
    run: async (page) => {
      await page.getByLabel("スキルを検索").fill("gamma");
      await page.waitForSelector('[data-testid="available-skill-row-skill-gamma"]');
    },
  },
  {
    tc: "TC-06",
    scenario: "mixed",
    file: "TC-06-boundary-analysis-view-light.png",
    colorScheme: "light",
    run: async (page) => {
      await page.getByLabel("skill-alpha を分析").click();
      await page.waitForSelector('[data-testid="skill-management-panel-analysis-view"]');
    },
  },
  {
    tc: "TC-07",
    scenario: "mixed",
    file: "TC-07-darkmode-token-compat-dark.png",
    colorScheme: "dark",
    run: async (page) => {
      await page.waitForSelector('[data-testid="skill-management-panel"]');
    },
  },
  {
    tc: "TC-08",
    scenario: "mixed",
    file: "TC-08-devtools-clean-base-light.png",
    colorScheme: "light",
    run: async (page) => {
      await page.waitForSelector('[data-testid="skill-management-panel"]');
      await page.waitForTimeout(250);
    },
  },
];

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

  try {
    await waitForServer(baseUrl);

    for (const scenario of scenarios) {
      const browser = await chromium.launch();
      const context = await browser.newContext({
        viewport: scenario.viewport ?? defaultViewport,
        colorScheme: scenario.colorScheme,
      });
      const page = await context.newPage();
      await page.addInitScript(createMockScript());
      const url = `${baseUrl}${route}?scenario=${scenario.scenario}`;
      await page.goto(url, { waitUntil: "networkidle" });
      await scenario.run(page);
      const outputPath = path.join(screenshotDir, scenario.file);
      await page.screenshot({ path: outputPath, fullPage: true });
      process.stdout.write(`Captured ${scenario.tc}: ${outputPath}\n`);
      await context.close();
      await browser.close();
    }
  } finally {
    if (!server.killed) {
      server.kill("SIGTERM");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
