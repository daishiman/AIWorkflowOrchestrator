#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import {
  LIGHT_THEME_CONTRAST_WORKFLOW,
  LIGHT_THEME_SCREENSHOT_SCENARIOS,
  createLightThemeScreenshotPlan,
} from "./light-theme-contrast-guard.config.mjs";
import {
  canAutoStartLocalStaticServer,
  probeStaticServer,
  startRendererStaticServer,
} from "./phase11-static-server.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(desktopRoot, "..", "..");
const workflowRoot = path.join(repoRoot, LIGHT_THEME_CONTRAST_WORKFLOW);
const phase11Root = path.join(workflowRoot, "outputs", "phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const planPath = path.join(phase11Root, "screenshot-plan.json");
const rendererRoot = path.join(desktopRoot, "out", "renderer");
const assetRoot = path.join(rendererRoot, "assets");
const baseUrl = process.env.PHASE11_CAPTURE_BASE_URL ?? "http://127.0.0.1:4173";
const viewport = { width: 1440, height: 960 };
const readinessUrl = `${baseUrl}/phase11-light-theme-contrast-guard.html?surface=settings&theme=light`;

function createProviderList() {
  return [
    {
      provider: "openai",
      displayName: "OpenAI",
      status: "registered",
      lastValidatedAt: "2026-03-11T08:30:00+09:00",
    },
    {
      provider: "anthropic",
      displayName: "Anthropic",
      status: "registered",
      lastValidatedAt: "2026-03-11T08:45:00+09:00",
    },
    {
      provider: "google",
      displayName: "Google AI",
      status: "not_registered",
      lastValidatedAt: null,
    },
    {
      provider: "xai",
      displayName: "xAI",
      status: "not_registered",
      lastValidatedAt: null,
    },
  ];
}

function createWorkspaceMatches() {
  return [
    {
      text: "const themeMode = 'light';",
      line: 12,
      column: 7,
      length: 5,
      filePath: "/workspace/project/src/theme.ts",
    },
    {
      text: "export const themeSummary = 'light contrast guard';",
      line: 4,
      column: 30,
      length: 5,
      filePath: "/workspace/project/src/theme.ts",
    },
    {
      text: "Review the light mode screenshots before release.",
      line: 8,
      column: 12,
      length: 5,
      filePath: "/workspace/project/README.md",
    },
  ];
}

function createHarnessPayload(scenario) {
  const now = "2026-03-11T10:15:00+09:00";

  return {
    surface: scenario.surface,
    theme: scenario.theme,
    dashboardNow: now,
    initialShowReplace: true,
    workspacePath: "/workspace/project",
    storeState: {
      themeMode: scenario.theme,
      resolvedTheme: scenario.theme,
      currentView: scenario.surface === "settings" ? "settings" : "dashboard",
      dashboardStats: {
        totalDocs: 150,
        ragIndexed: 120,
        pending: 2,
        storageUsed: 650,
        storageTotal: 1000,
      },
      activityFeed: [
        {
          id: "1",
          message: "ライトテーマ監査のスクリーンショット導線を確認",
          time: "2026-03-11T09:58:00+09:00",
          type: "info",
        },
        {
          id: "2",
          message: "hardcoded color audit を実行",
          time: "2026-03-11T09:15:00+09:00",
          type: "success",
        },
      ],
      autoSyncEnabled: true,
      isLoading: false,
      isAuthenticated: false,
      authError: null,
      authUser: {
        id: "phase11-user",
        displayName: "Phase11 User",
        email: "phase11@example.com",
        avatarUrl: null,
        createdAt: now,
        lastSignInAt: now,
      },
      profile: {
        id: "phase11-profile",
        displayName: "Phase11 User",
        email: "phase11@example.com",
        avatarUrl: null,
        plan: "free",
      },
      linkedProviders: [],
      mode: "subscription",
      status: {
        mode: "subscription",
        isValid: true,
        hasCredentials: true,
        message: "サブスクリプション認証は有効です",
        lastCheckedAt: Date.now(),
      },
    },
  };
}

function createInitScriptPayload(scenario) {
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const mockUser = {
    id: "phase11-user",
    email: "phase11@example.com",
    displayName: "Phase11 User",
    avatarUrl: null,
    provider: "google",
    createdAt: nowIso,
    lastSignInAt: nowIso,
  };
  const mockProfile = {
    id: mockUser.id,
    displayName: mockUser.displayName,
    email: mockUser.email,
    avatarUrl: null,
    plan: "free",
    timezone: "Asia/Tokyo",
    locale: "ja",
    notificationSettings: {
      email: true,
      desktop: true,
      sound: true,
      workflowComplete: true,
      workflowError: true,
    },
    preferences: {},
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  return {
    scenario,
    harnessPayload: createHarnessPayload(scenario),
    mockUser,
    mockProfile,
    providerList: createProviderList(),
    workspaceMatches: createWorkspaceMatches(),
  };
}

async function collectAssetEntries() {
  try {
    const entries = await fs.readdir(assetRoot);
    return entries.sort();
  } catch {
    return [];
  }
}

async function captureWorkspaceSearch(page) {
  const input = page.getByTestId("search-input");
  await input.fill("light");
  await input.press("Enter");
  await page.waitForSelector('[data-testid="result-item"]', {
    timeout: 10_000,
  });
}

async function captureScenario(browser, scenario, assetEntries) {
  const context = await browser.newContext({
    viewport,
    colorScheme: scenario.theme,
  });
  const page = await context.newPage();
  const payload = createInitScriptPayload(scenario);

  await page.addInitScript((config) => {
    const {
      harnessPayload,
      mockUser,
      mockProfile,
      providerList,
      workspaceMatches,
    } = config;

    const session = {
      user: mockUser,
      expiresAt: Date.now() + 60 * 60 * 1000,
      isOffline: false,
    };

    window.sessionStorage.setItem("debug-clear-storage", "done");
    window.localStorage.setItem("dev-skip-auth", "true");
    window.__PHASE11_LIGHT_THEME_CONTRAST_GUARD__ = harnessPayload;

    const genericSuccess = { success: true, data: {} };

    window.electronAPI = {
      invoke: async (channel) => {
        if (channel === "search:workspace:execute") {
          return {
            success: true,
            data: {
              matches: workspaceMatches,
              totalCount: workspaceMatches.length,
              fileCount: 2,
            },
          };
        }

        if (channel === "replace:workspace:all") {
          return {
            success: true,
            data: {
              replacedCount: 3,
              fileCount: 2,
            },
          };
        }

        throw new Error(`Unsupported invoke channel: ${channel}`);
      },
      auth: {
        checkOnline: async () => ({ success: true, data: { online: true } }),
        getSession: async () => ({ success: true, data: session }),
        onAuthStateChanged: () => () => {},
        login: async () => genericSuccess,
        logout: async () => ({ success: true, data: {} }),
        refresh: async () => ({ success: true, data: session }),
      },
      authMode: {
        get: async () => ({
          success: true,
          data: { mode: "subscription" },
        }),
        set: async ({ mode }) => ({
          success: true,
          data: { mode },
        }),
        status: async () => ({
          success: true,
          data: {
            mode: "subscription",
            isValid: true,
            hasCredentials: true,
            message: "サブスクリプション認証は有効です",
            lastCheckedAt: Date.now(),
          },
        }),
        validate: async () => ({
          success: true,
          data: {
            mode: "subscription",
            isValid: true,
            hasCredentials: true,
            message: "サブスクリプション認証は有効です",
            lastCheckedAt: Date.now(),
          },
        }),
        onModeChanged: () => () => {},
      },
      apiKey: {
        list: async () => ({
          success: true,
          data: { providers: providerList },
        }),
        save: async () => genericSuccess,
        delete: async () => genericSuccess,
        validate: async () => ({
          success: true,
          data: { valid: true, provider: "anthropic" },
        }),
      },
      profile: {
        get: async () => ({ success: true, data: mockProfile }),
        update: async () => ({ success: true, data: mockProfile }),
        delete: async () => genericSuccess,
        getProviders: async () => ({ success: true, data: [] }),
        linkProvider: async () => genericSuccess,
        unlinkProvider: async () => genericSuccess,
      },
      avatar: {
        upload: async () => genericSuccess,
        useProvider: async () => genericSuccess,
        remove: async () => genericSuccess,
      },
      theme: {
        get: async () => ({
          success: true,
          data: {
            mode: harnessPayload.theme,
            resolvedTheme: harnessPayload.theme,
          },
        }),
        set: async ({ mode }) => ({
          success: true,
          data: {
            mode,
            resolvedTheme: mode,
          },
        }),
        getSystem: async () => ({
          success: true,
          data: { theme: harnessPayload.theme },
        }),
        onSystemChanged: () => () => {},
      },
    };
  }, payload);

  try {
    const targetUrl = `${baseUrl}${scenario.route}`;
    await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30_000 });
    await page.waitForSelector(scenario.selector, { timeout: 15_000 });
    await page.waitForTimeout(500);

    if (scenario.surface === "workspace-search") {
      await captureWorkspaceSearch(page);
    }

    const outputPath = path.join(
      screenshotDir,
      path.basename(scenario.output),
    );
    await page.locator(scenario.selector).screenshot({
      path: outputPath,
    });
    const stat = await fs.stat(outputPath);

    return {
      id: scenario.id,
      surface: scenario.surface,
      theme: scenario.theme,
      route: scenario.route,
      selector: scenario.selector,
      output: scenario.output,
      capturedAt: stat.mtime.toISOString(),
      size: stat.size,
      assetEntries,
    };
  } finally {
    await context.close();
  }
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });
  await fs.writeFile(
    planPath,
    JSON.stringify(createLightThemeScreenshotPlan(baseUrl), null, 2),
    "utf8",
  );

  const assetEntries = await collectAssetEntries();
  let staticServer = null;

  if (!(await probeStaticServer(readinessUrl))) {
    if (!canAutoStartLocalStaticServer(baseUrl)) {
      throw new Error(
        `Static server is not reachable and auto-start is unavailable for ${baseUrl}`,
      );
    }
    staticServer = await startRendererStaticServer({
      baseUrl,
      rootDir: rendererRoot,
    });

    if (!(await probeStaticServer(readinessUrl))) {
      throw new Error(`Failed to start local static server for ${readinessUrl}`);
    }
  }

  const browser = await chromium.launch({ headless: true });
  const metadata = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    viewport,
    assetEntries,
    scenarios: [],
  };

  try {
    for (const scenario of LIGHT_THEME_SCREENSHOT_SCENARIOS) {
      const result = await captureScenario(browser, scenario, assetEntries);
      metadata.scenarios.push(result);
      console.log(`✓ ${result.id} -> ${path.basename(result.output)}`);
    }
  } finally {
    await browser.close();
    await staticServer?.close();
  }

  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), "utf8");
  console.log(`✓ screenshot-plan.json -> ${planPath}`);
  console.log(`✓ phase11-capture-metadata.json -> ${metadataPath}`);
}

main().catch((error) => {
  console.error(
    "[capture-light-theme-contrast-regression-guard-phase11] failed",
    error,
  );
  process.exitCode = 1;
});
