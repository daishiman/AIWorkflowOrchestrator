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
  "docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design",
);
const screenshotDir = path.join(workflowDir, "outputs/phase-11/screenshots");
const port = process.env.TASK_043B_SCREENSHOT_PORT ?? "5176";
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
      }),
      importedEmpty: () => ({
        availableSkills: [
          makeAvailable("skill-gamma", "Gamma skill for importing"),
          makeAvailable("skill-delta", "Delta skill for import list"),
        ],
        importedSkills: [],
        importError: null,
      }),
      importFailure: () => ({
        availableSkills: [makeAvailable("skill-gamma", "Gamma skill for importing")],
        importedSkills: [makeImported("skill-alpha", "Alpha skill for testing")],
        importError: "スキルのインポートに失敗: timeout",
      }),
      nullish: () => ({
        availableSkills: [
          makeAvailable("skill-nullish", "", {
            description: undefined,
            allowedTools: undefined,
            agents: undefined,
            references: undefined,
            scripts: undefined,
            assets: undefined,
            schemas: undefined,
            indexes: undefined,
            otherFiles: undefined,
          }),
        ],
        importedSkills: [],
        importError: null,
      }),
    };

    const initialState =
      scenarioFactories[scenario]?.() ?? scenarioFactories.mixed();

    let availableSkills = [...initialState.availableSkills];
    let importedSkills = [...initialState.importedSkills];
    let importError = initialState.importError;

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
            mode: window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light",
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
    tc: "TC-11-01",
    scenario: "mixed",
    file: "TC-11-01-mixed-state-light.png",
    colorScheme: "light",
    run: async (page) => {
      await page.waitForSelector('[data-testid="skill-management-panel"]');
      await page.waitForSelector('[data-testid="imported-skill-card-skill-alpha"]');
      await page.waitForSelector('[data-testid="available-skill-row-skill-gamma"]');
    },
  },
  {
    tc: "TC-11-02",
    scenario: "importedEmpty",
    file: "TC-11-02-imported-empty-light.png",
    colorScheme: "light",
    run: async (page) => {
      await page.waitForSelector('[data-testid="skill-management-imported-empty"]');
      await page.waitForSelector('[data-testid="available-skill-row-skill-gamma"]');
    },
  },
  {
    tc: "TC-11-03",
    scenario: "mixed",
    file: "TC-11-03-no-result-light.png",
    colorScheme: "light",
    run: async (page) => {
      await page.getByLabel("スキルを検索").fill("nonexistent-skill");
      await page.waitForSelector('[data-testid="skill-management-no-result"]');
    },
  },
  {
    tc: "TC-11-04",
    scenario: "importFailure",
    file: "TC-11-04-fetch-error-light.png",
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
    tc: "TC-11-05",
    scenario: "mixed",
    file: "TC-11-05-dialog-open-light.png",
    colorScheme: "light",
    run: async (page) => {
      await page.getByLabel("skill-gamma を追加する").click();
      await page.waitForSelector('[data-testid="skill-import-dialog"]');
    },
  },
  {
    tc: "TC-11-06",
    scenario: "mixed",
    file: "TC-11-06-import-success-light.png",
    colorScheme: "light",
    run: async (page) => {
      await page.getByLabel("skill-gamma を追加する").click();
      await page
        .getByTestId("skill-import-dialog")
        .getByRole("button", { name: "追加する" })
        .click();
      await page.waitForSelector('[data-testid="skill-management-success"]');
      await page.waitForSelector('[data-testid="imported-skill-card-skill-gamma"]');
    },
  },
  {
    tc: "TC-11-07",
    scenario: "mixed",
    file: "TC-11-07-keyboard-dialog-light.png",
    colorScheme: "light",
    run: async (page) => {
      await page.getByLabel("skill-gamma を追加する").focus();
      await page.keyboard.press("Enter");
      await page.waitForSelector('[data-testid="skill-import-dialog"]');
      await page.keyboard.press("Tab");
      await page.waitForTimeout(200);
    },
  },
  {
    tc: "TC-11-08",
    scenario: "mixed",
    file: "TC-11-08-mixed-state-dark.png",
    colorScheme: "dark",
    run: async (page) => {
      await page.getByLabel("skill-gamma を追加する").click();
      await page.waitForSelector('[data-testid="skill-import-dialog"]');
    },
  },
  {
    tc: "TC-11-09",
    scenario: "nullish",
    file: "TC-11-09-nullish-metadata-light.png",
    colorScheme: "light",
    run: async (page) => {
      await page.waitForSelector('[data-testid="available-skill-row-skill-nullish"]');
    },
  },
  {
    tc: "VIS-11-MOBILE",
    scenario: "mixed",
    file: "VIS-11-mobile-dark.png",
    colorScheme: "dark",
    viewport: { width: 390, height: 844 },
    run: async (page) => {
      await page.waitForSelector('[data-testid="skill-management-panel"]');
      await page.waitForSelector('[data-testid="available-skill-row-skill-gamma"]');
    },
  },
];

async function captureScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport: scenario.viewport ?? defaultViewport,
    colorScheme: scenario.colorScheme,
  });
  await context.addInitScript(createMockScript());
  const page = await context.newPage();

  await page.goto(`${baseUrl}${route}?scenario=${scenario.scenario}`, {
    waitUntil: "domcontentloaded",
  });
  await scenario.run(page);
  await page.waitForTimeout(300);

  const outputPath = path.join(screenshotDir, scenario.file);
  await page.screenshot({ path: outputPath, fullPage: true });
  process.stdout.write(`Captured ${scenario.tc}: ${outputPath}\n`);

  await context.close();
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

  server.stdout.on("data", (data) => process.stdout.write(data));
  server.stderr.on("data", (data) => process.stderr.write(data));

  let browser;
  try {
    await waitForServer(baseUrl);
    browser = await chromium.launch({ headless: true });

    for (const scenario of scenarios) {
      await captureScenario(browser, scenario);
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
