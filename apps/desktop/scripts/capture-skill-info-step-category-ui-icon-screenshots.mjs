#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(desktopRoot, "..", "..");
const workflowRoot = path.join(
  repoRoot,
  "docs/30-workflows/skill-info-step-category-ui-icon",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const screenshotPlanPath = path.join(phase11Root, "screenshot-plan.json");
const metadataPath = path.join(phase11Root, "phase11-capture-metadata.json");
const port = process.env.SKILL_INFO_STEP_CATEGORY_UI_ICON_PHASE11_PORT ?? "5198";
const baseUrl = `http://127.0.0.1:${port}`;
const route = `${baseUrl}/advanced/skill-create-wizard?skipAuth=true`;
const viewport = { width: 1440, height: 960 };

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 90_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // retry
    }
    await wait(400);
  }

  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

function startViteServer() {
  const child = spawn(
    "pnpm",
    [
      "exec",
      "vite",
      "--config",
      "vite.e2e.config.ts",
      "--host",
      "127.0.0.1",
      "--port",
      port,
      "--strictPort",
    ],
    {
      cwd: desktopRoot,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        FORCE_COLOR: "0",
        VITE_USE_GLOBAL_NAV_STRIP: "false",
      },
    },
  );

  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));
  return child;
}

function createMockScript() {
  return () => {
    const createNamespaceProxy = (entries = {}) =>
      new Proxy(entries, {
        get(target, prop) {
          if (prop in target) {
            return target[prop];
          }
          if (typeof prop === "string" && prop.startsWith("on")) {
            return () => () => {};
          }
          return async () => ({ success: true, data: {} });
        },
      });

    const now = new Date("2026-04-11T00:00:00.000Z").toISOString();
    const mockUser = {
      id: "phase11-skill-info-user",
      email: "phase11-skill-info@example.com",
      displayName: "Phase 11 SkillInfo Reviewer",
      avatarUrl: null,
      provider: "google",
      createdAt: now,
      lastSignInAt: now,
    };

    localStorage.setItem("dev-skip-auth", "true");
    localStorage.setItem(
      "knowledge-studio-store",
      JSON.stringify({
        state: {
          currentView: "skillCenter",
        },
        version: 2,
      }),
    );

    const resolveTheme = () =>
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

    const namespaces = {
      auth: createNamespaceProxy({
        checkOnline: async () => ({ success: true, data: { online: true } }),
        getSession: async () => ({
          success: true,
          data: {
            user: { ...mockUser },
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            isOffline: false,
          },
        }),
        onAuthStateChanged: (callback) => {
          setTimeout(() => {
            callback({
              authenticated: true,
              user: { ...mockUser },
              isOffline: false,
            });
          }, 10);
          return () => {};
        },
        login: async () => ({ success: true }),
        logout: async () => ({ success: true, data: {} }),
        refresh: async () => ({ success: true, data: {} }),
      }),
      theme: createNamespaceProxy({
        get: async () => ({
          success: true,
          data: { mode: "system", resolvedTheme: resolveTheme() },
        }),
        set: async ({ mode }) => ({
          success: true,
          data: {
            mode,
            resolvedTheme: mode === "system" ? resolveTheme() : mode,
          },
        }),
        getSystem: async () => ({
          success: true,
          data: {
            isDark: resolveTheme() === "dark",
            resolvedTheme: resolveTheme(),
          },
        }),
        onSystemChanged: () => () => {},
      }),
      skill: createNamespaceProxy({
        create: async () => ({
          success: true,
          data: { path: "/mock/skills/phase11-skill-info" },
        }),
      }),
      notification: createNamespaceProxy(),
      historySearch: createNamespaceProxy(),
      store: createNamespaceProxy(),
      permission: createNamespaceProxy(),
      profile: createNamespaceProxy(),
      avatar: createNamespaceProxy(),
    };

    window.confirm = () => true;
    window.electronAPI = namespaces;
  };
}

async function openWizard(page) {
  await page.goto(route, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.waitForSelector('[data-testid="skill-create-wizard"]', {
    timeout: 60_000,
  });
  await page.waitForSelector('[data-testid="wizard-step-info"]', {
    timeout: 60_000,
  });
  await page.waitForSelector('[role="group"][aria-label="カテゴリを選択"]', {
    timeout: 60_000,
  });
  await page.waitForTimeout(200);
}

async function injectTooltipOverlay(page, label) {
  await page.evaluate((targetLabel) => {
    const step = document.querySelector('[data-testid="wizard-step-info"]');
    const group = document.querySelector(
      '[role="group"][aria-label="カテゴリを選択"]',
    );
    if (!step || !group) {
      return;
    }

    const button = Array.from(group.querySelectorAll("button")).find(
      (node) => node.getAttribute("aria-label") === targetLabel,
    );
    if (!button) {
      return;
    }

    const title = button.getAttribute("title") ?? "";
    const stepRect = step.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    step.style.position = "relative";
    button.style.outline = "3px solid rgba(37, 99, 235, 0.45)";
    button.style.outlineOffset = "2px";

    const existing = document.getElementById("phase11-tooltip-overlay");
    if (existing) {
      existing.remove();
    }

    const overlay = document.createElement("div");
    overlay.id = "phase11-tooltip-overlay";
    overlay.setAttribute("data-testid", "phase11-tooltip-overlay");
    overlay.textContent = `${targetLabel}\n${title}`;
    Object.assign(overlay.style, {
      position: "absolute",
      left: `${Math.max(16, buttonRect.left - stepRect.left)}px`,
      top: `${buttonRect.bottom - stepRect.top + 14}px`,
      maxWidth: "360px",
      padding: "12px 14px",
      borderRadius: "14px",
      background: "rgba(17, 24, 39, 0.96)",
      color: "#ffffff",
      fontSize: "13px",
      lineHeight: "1.5",
      boxShadow: "0 18px 40px rgba(15, 23, 42, 0.24)",
      zIndex: "9999",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    });

    const arrow = document.createElement("span");
    Object.assign(arrow.style, {
      position: "absolute",
      top: "-6px",
      left: "22px",
      width: "12px",
      height: "12px",
      transform: "rotate(45deg)",
      background: "rgba(17, 24, 39, 0.96)",
    });
    overlay.appendChild(arrow);
    step.appendChild(overlay);
  }, label);
}

async function captureLocator(page, selector, filePath) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: "visible", timeout: 15_000 });
  await locator.screenshot({ path: filePath });
}

async function captureScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport,
    colorScheme: "light",
  });

  try {
    await context.addInitScript(createMockScript());
    const page = await context.newPage();

    await scenario.prepare(page);
    await page.waitForSelector(scenario.selector, { timeout: 15_000 });
    await page.waitForTimeout(150);
    const screenshotPath = path.join(screenshotDir, scenario.file);
    await captureLocator(page, scenario.selector, screenshotPath);

    const screenshotStat = await stat(screenshotPath);
    return {
      ...scenario,
      screenshotPath,
      capturedAt: screenshotStat.mtime.toISOString(),
    };
  } finally {
    await context.close();
  }
}

const scenarios = [
  {
    id: "SS-01",
    state: "カテゴリ未選択（初期状態）",
    file: "ss-01-initial.png",
    selector: '[data-testid="wizard-step-info"]',
    prepare: async (page) => {
      await openWizard(page);
    },
  },
  {
    id: "SS-02",
    state: "「自動化」カテゴリ選択済み",
    file: "ss-02-automation.png",
    selector: '[data-testid="wizard-step-info"]',
    prepare: async (page) => {
      await openWizard(page);
      await page.getByRole("button", { name: "自動化" }).click();
      await page.waitForTimeout(150);
    },
  },
  {
    id: "SS-03",
    state: "ホバー時ツールチップ表示",
    file: "ss-03-tooltip.png",
    selector: '[data-testid="wizard-step-info"]',
    prepare: async (page) => {
      await openWizard(page);
      await page.getByRole("button", { name: "自動化" }).hover();
      await page.waitForTimeout(150);
      await injectTooltipOverlay(page, "自動化");
      await page.waitForTimeout(150);
    },
  },
  {
    id: "SS-04",
    state: "全カテゴリボタン（アイコン確認）",
    file: "ss-04-all-icons.png",
    selector: '[data-testid="wizard-step-info"]',
    prepare: async (page) => {
      await openWizard(page);
    },
  },
];

async function writeOutputs(capturedScreenshots) {
  const generatedAt = new Date().toISOString();

  await writeFile(
    screenshotPlanPath,
    JSON.stringify(
      {
        taskId: "UT-SKILL-WIZARD-CATEGORY-UI-ICON-001",
        phase: 11,
        route: "/advanced/skill-create-wizard?skipAuth=true",
        captureMethod: "current-build-vite-playwright",
        generatedAt,
        screenshots: capturedScreenshots.map((entry) => ({
          id: entry.id,
          state: entry.state,
          file: `screenshots/${entry.file}`,
          selector: entry.selector,
        })),
      },
      null,
      2,
    ),
  );

  await writeFile(
    metadataPath,
    JSON.stringify(
      {
        taskId: "UT-SKILL-WIZARD-CATEGORY-UI-ICON-001",
        phase: 11,
        generatedAt,
        captureMethod: "current-build-vite-playwright",
        baseUrl,
        route,
        viewport,
        screenshotCount: capturedScreenshots.length,
        screenshots: capturedScreenshots.map((entry) => ({
          id: entry.id,
          state: entry.state,
          file: entry.file,
          output: `outputs/phase-11/screenshots/${entry.file}`,
          capturedAt: entry.capturedAt,
        })),
      },
      null,
      2,
    ),
  );
}

async function main() {
  await mkdir(screenshotDir, { recursive: true });

  const server = startViteServer();

  try {
    await waitForServer(route);

    const browser = await chromium.launch({ headless: true });
    const captured = [];
    for (const scenario of scenarios) {
      const result = await captureScenario(browser, scenario);
      captured.push(result);
      process.stdout.write(`Captured ${result.screenshotPath}\n`);
    }

    await writeOutputs(captured);

    await Promise.race([
      browser.close(),
      wait(1_000),
    ]);
  } finally {
    if (!server.killed) {
      server.kill("SIGKILL");
    }
  }
}

main().catch((error) => {
  console.error("[capture-skill-info-step-category-ui-icon-screenshots] failed");
  console.error(error);
  process.exitCode = 1;
});
