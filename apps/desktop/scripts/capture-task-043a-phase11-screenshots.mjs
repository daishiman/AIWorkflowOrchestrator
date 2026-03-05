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
  "docs/30-workflows/task-043a-ipc-contract-and-security-alignment/outputs/phase-11/screenshots",
);
const port = process.env.TASK_043A_SCREENSHOT_PORT ?? "5176";
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
    const getScenarioMode = () =>
      window.localStorage.getItem("task-043a-scenario-mode") ?? "success";

    window.__scenarioMode = getScenarioMode();
    window.__importCallCount = 0;
    window.__importFromSourceCallCount = 0;

    const baseAvailableSkills = [
      {
        name: "new-skill",
        displayName: "New Skill",
        description: "Import success and boundary validation target",
        version: "1.0.0",
        category: "development",
        tags: ["ipc", "import"],
        author: "E2E",
        path: "/skills/new-skill",
        agents: [],
        references: [],
        indexes: [],
        otherFiles: [],
      },
    ];

    const buildImported = (name) => ({
      name,
      description: `Imported: ${name}`,
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

    let availableSkills = [...baseAvailableSkills];
    let importedSkills = [];

    window.__resetTask043AState = () => {
      availableSkills = [...baseAvailableSkills];
      importedSkills = [];
      window.__importCallCount = 0;
      window.__importFromSourceCallCount = 0;
    };

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

          const scenarioMode = getScenarioMode();
          if (scenarioMode === "validation-error") {
            throw new Error("ERR_1001: skillName must be a non-empty string");
          }

          if (scenarioMode === "unauthorized") {
            throw new Error("Unauthorized IPC sender");
          }

          const already = importedSkills.find((skill) => skill.name === skillName);
          if (already) {
            return already;
          }

          const imported = buildImported(skillName);
          importedSkills = [...importedSkills, imported];
          availableSkills = availableSkills.filter((skill) => skill.name !== skillName);
          return imported;
        },
        importFromSource: async () => {
          window.__importFromSourceCallCount += 1;
          return {
            success: true,
            data: {
              success: true,
              skillName: "source-skill",
            },
          };
        },
        remove: async () => undefined,
        rescan: async () => availableSkills,
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

async function loadScenario(page, mode) {
  await page.goto(`${baseUrl}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {
    // networkidle未達でも要素待機で判定
  });
  await page.evaluate((nextMode) => {
    if (typeof window.__resetTask043AState === "function") {
      window.__resetTask043AState();
    }
    window.localStorage.setItem("task-043a-scenario-mode", nextMode);
    window.__scenarioMode = nextMode;
  }, mode);

  await page.goto(`${baseUrl}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {
    // networkidle未達でも要素待機で判定
  });
  await page.waitForSelector('[data-testid="skill-center-view"]');
  await page.waitForSelector('[data-testid="skill-card-new-skill"]');
  await page
    .getByTestId("skill-card-new-skill")
    .getByTestId("add-button")
    .waitFor({ state: "visible" });
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

    await capture(page, "tc-11-01-import-success.png", async (p) => {
      await loadScenario(p, "success");
      const card = p.getByTestId("skill-card-new-skill");
      await card.getByTestId("add-button").click();
      await p.waitForSelector('[data-testid="skill-card-new-skill"]', {
        state: "hidden",
      });
      await p.waitForSelector('[data-testid="skill-count"]');
    });

    await capture(page, "tc-11-02-validation-error.png", async (p) => {
      await loadScenario(p, "validation-error");
      const card = p.getByTestId("skill-card-new-skill");
      await card.getByTestId("add-button").click();
      await p.getByText(/インポートに失敗|ERR_1001/).first().waitFor({
        state: "visible",
      });
      await p.evaluate(() => {
        const badge = document.createElement("div");
        badge.id = "task-043a-validation-badge";
        badge.style.position = "fixed";
        badge.style.left = "20px";
        badge.style.bottom = "20px";
        badge.style.padding = "10px 14px";
        badge.style.background = "rgba(127, 29, 29, 0.92)";
        badge.style.color = "#fee2e2";
        badge.style.borderRadius = "8px";
        badge.style.font = "12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace";
        badge.style.zIndex = "9999";
        badge.textContent = "Expected: ERR_1001 validation path";
        document.body.appendChild(badge);
      });
    });

    await capture(page, "tc-11-03-unauthorized.png", async (p) => {
      await loadScenario(p, "unauthorized");
      const card = p.getByTestId("skill-card-new-skill");
      await card.getByTestId("add-button").click();
      await p
        .getByText(/Unauthorized IPC sender|インポートに失敗/)
        .first()
        .waitFor({ state: "visible" });
      await p.evaluate(() => {
        const badge = document.createElement("div");
        badge.id = "task-043a-unauthorized-badge";
        badge.style.position = "fixed";
        badge.style.left = "20px";
        badge.style.bottom = "20px";
        badge.style.padding = "10px 14px";
        badge.style.background = "rgba(30, 64, 175, 0.92)";
        badge.style.color = "#dbeafe";
        badge.style.borderRadius = "8px";
        badge.style.font = "12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace";
        badge.style.zIndex = "9999";
        badge.textContent = "Expected: unauthorized sender path";
        document.body.appendChild(badge);
      });
    });

    await capture(page, "tc-11-04-channel-boundary.png", async (p) => {
      await loadScenario(p, "success");
      const card = p.getByTestId("skill-card-new-skill");
      await card.getByTestId("add-button").click();
      await p.waitForSelector('[data-testid="skill-card-new-skill"]', {
        state: "hidden",
      });

      const counts = await p.evaluate(() => ({
        importCalls: window.__importCallCount,
        importFromSourceCalls: window.__importFromSourceCallCount,
      }));

      await p.evaluate((diagnostics) => {
        const existing = document.getElementById("task-043a-diagnostics");
        if (existing) {
          existing.remove();
        }
        const badge = document.createElement("div");
        badge.id = "task-043a-diagnostics";
        badge.style.position = "fixed";
        badge.style.right = "20px";
        badge.style.bottom = "20px";
        badge.style.padding = "12px 16px";
        badge.style.background = "rgba(15, 23, 42, 0.9)";
        badge.style.color = "#e2e8f0";
        badge.style.border = "1px solid rgba(148, 163, 184, 0.6)";
        badge.style.borderRadius = "10px";
        badge.style.font = "12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace";
        badge.style.zIndex = "9999";
        badge.textContent = `import=${diagnostics.importCalls}, importFromSource=${diagnostics.importFromSourceCalls}`;
        document.body.appendChild(badge);
      }, counts);

      if (counts.importFromSourceCalls !== 0) {
        throw new Error(
          `Channel boundary violated: importFromSource calls = ${counts.importFromSourceCalls}`,
        );
      }

      await fs.writeFile(
        path.join(screenshotDir, "tc-11-04-channel-boundary-diagnostics.json"),
        JSON.stringify(counts, null, 2),
        "utf8",
      );
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
