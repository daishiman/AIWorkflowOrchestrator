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
const workflowRoot = path.join(
  repoRoot,
  "docs/30-workflows/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const planPath = path.join(phase11Root, "screenshot-plan.json");
const port = process.env.AUTHGUARD_TIMEOUT_PHASE11_PORT ?? "5182";
const baseUrl = `http://localhost:${port}`;
const harnessPath = "/phase11-authguard-timeout.html";

const viewport = { width: 1440, height: 1600 };
const timeoutMs = 10_250;

const scenarios = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-timeout-fallback-light.png",
    note: "ライトテーマで 10 秒経過後の AuthTimeoutFallback を確認",
    themeMode: "light",
    resolvedTheme: "light",
    mode: "timeout",
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-timeout-fallback-dark.png",
    note: "ダークテーマで 10 秒経過後の AuthTimeoutFallback を確認",
    themeMode: "dark",
    resolvedTheme: "dark",
    mode: "timeout",
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-timeout-to-settings.png",
    note: "timeout fallback から設定画面へ遷移した公開シェルを確認",
    themeMode: "light",
    resolvedTheme: "light",
    mode: "timeout-to-settings",
  },
  {
    tc: "TC-11-04",
    file: "TC-11-04-settings-shell-unauthenticated.png",
    note: "未認証状態での Settings 公開シェルを直接確認",
    themeMode: "light",
    resolvedTheme: "light",
    mode: "settings-shell",
  },
];

async function waitForServer(url, timeout = 60_000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
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

function createPlan() {
  return {
    generatedAt: new Date().toISOString(),
    baseUrl,
    viewport,
    scenarios: scenarios.map((scenario) => ({
      id: scenario.tc,
      description: scenario.note,
      route: harnessPath,
      output: `screenshots/${scenario.file}`,
      priority: "A",
    })),
  };
}

function buildHarnessState(scenario) {
  return {
    currentView: scenario.mode === "settings-shell" ? "settings" : "dashboard",
    isAuthenticated: false,
    isLoading: scenario.mode === "settings-shell" ? false : true,
    isOffline: false,
    authUser: null,
    profile: null,
    linkedProviders: [],
    authError: null,
    autoSyncEnabled: true,
    themeMode: scenario.themeMode,
    resolvedTheme: scenario.resolvedTheme,
    mode: "subscription",
    status: {
      mode: "subscription",
      isValid: true,
      hasCredentials: true,
      message: "サブスクリプション認証は有効です",
      lastCheckedAt: Date.now(),
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
    mockUser,
    mockProfile,
    harnessState: buildHarnessState(scenario),
  };
}

async function capture(page, scenario) {
  const target = path.join(screenshotDir, scenario.file);
  await page.screenshot({ path: target, fullPage: true });
  const stat = await fs.stat(target);
  return {
    tc: scenario.tc,
    file: scenario.file,
    note: scenario.note,
    path: target,
    capturedAt: stat.mtime.toISOString(),
  };
}

async function captureScenario(browser, scenario) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const payload = createInitScriptPayload(scenario);
  page.setDefaultTimeout(30_000);

  page.on("console", (message) => {
    if (message.type() === "error") {
      console.error(`[${scenario.tc}] console error: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    console.error(`[${scenario.tc}] page error: ${error.message}`);
  });

  await page.addInitScript((config) => {
    const { harnessState, mockUser, mockProfile } = config;

    const authSession = {
      user: mockUser,
      expiresAt: Date.now() + 60 * 60 * 1000,
      isOffline: false,
    };

    window.localStorage.setItem("dev-skip-auth", "true");
    window.__PHASE11_AUTHGUARD_TIMEOUT_HARNESS__ = harnessState;

    const genericSuccess = { success: true, data: {} };

    window.electronAPI = {
      auth: {
        checkOnline: async () => ({ success: true, data: { online: true } }),
        getSession: async () => ({ success: true, data: authSession }),
        onAuthStateChanged: () => () => {},
        login: async () => genericSuccess,
        logout: async () => genericSuccess,
        refresh: async () => ({ success: true, data: authSession }),
      },
      authMode: {
        get: async () => ({ success: true, data: { mode: "subscription" } }),
        set: async ({ mode }) => ({ success: true, data: { mode } }),
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
        list: async () => ({ success: true, data: { providers: [] } }),
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
            mode: harnessState.themeMode,
            resolvedTheme: harnessState.resolvedTheme,
          },
        }),
        set: async ({ mode }) => ({
          success: true,
          data: {
            mode,
            resolvedTheme:
              mode === "system" ? harnessState.resolvedTheme : mode,
          },
        }),
        getSystem: async () => ({
          success: true,
          data: {
            isDark: harnessState.resolvedTheme !== "light",
            resolvedTheme: harnessState.resolvedTheme,
          },
        }),
        onSystemChanged: () => () => {},
      },
      dialog: {
        showOpenDialog: async () => ({ canceled: true, filePaths: [] }),
      },
      invoke: async () => genericSuccess,
      app: {
        getVersion: async () => ({
          success: true,
          data: { version: "phase11-mock" },
        }),
        onMenuAction: () => () => {},
      },
      window: {
        getState: async () => ({
          success: true,
          data: { isMaximized: false, isFullScreen: false },
        }),
        onResized: () => () => {},
      },
      workspace: {
        load: async () => ({ success: true, data: { folders: [] } }),
        save: async () => genericSuccess,
        addFolder: async () => genericSuccess,
        removeFolder: async () => genericSuccess,
        validatePaths: async () => ({
          success: true,
          data: { valid: true, invalidPaths: [] },
        }),
        onFolderChanged: () => () => {},
      },
      store: {
        get: async () => ({ success: true, data: { value: null } }),
        set: async () => genericSuccess,
        getSecure: async () => ({ success: true, data: { value: null } }),
        setSecure: async () => genericSuccess,
      },
      file: {
        selectFiles: async () => [],
        selectFolder: async () => null,
      },
    };
  }, payload);

  const url = `${baseUrl}${harnessPath}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90_000 });

  if (scenario.mode === "settings-shell") {
    await page.getByTestId("phase11-settings-shell").waitFor();
    const settingsView = page.getByTestId("settings-view");
    await settingsView.waitFor();
  } else {
    await page.getByRole("status").waitFor();
    await page.getByRole("alert").waitFor({ timeout: timeoutMs + 5_000 });

    if (scenario.mode === "timeout-to-settings") {
      await page.getByRole("button", { name: "設定画面へ" }).click();
      await page.getByTestId("phase11-settings-shell").waitFor();
      await page.getByTestId("settings-view").waitFor();
    }
  }

  const result = await capture(page, scenario);
  await context.close();
  return result;
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });
  await fs.writeFile(planPath, JSON.stringify(createPlan(), null, 2));

  const server = spawn(
    "pnpm",
    [
      "exec",
      "vite",
      "--config",
      "vite.e2e.config.ts",
      "--port",
      port,
      "--strictPort",
    ],
    {
      cwd: desktopRoot,
      stdio: "pipe",
      env: {
        ...process.env,
        VITE_E2E_MODE: "true",
      },
    },
  );

  let serverOutput = "";
  server.stdout.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    serverOutput += chunk.toString();
  });

  try {
    await waitForServer(`${baseUrl}${harnessPath}`);

    const browser = await chromium.launch({ headless: true });
    const captures = [];
    try {
      for (const scenario of scenarios) {
        captures.push(await captureScenario(browser, scenario));
      }
    } finally {
      await browser.close();
    }

    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          baseUrl,
          harnessPath,
          viewport,
          captures,
        },
        null,
        2,
      ),
    );

    console.log(
      JSON.stringify(
        {
          ok: true,
          workflow: path.relative(repoRoot, workflowRoot),
          screenshots: captures,
          metadata: path.relative(repoRoot, metadataPath),
        },
        null,
        2,
      ),
    );
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error("[capture-task-authguard-timeout-phase11] failed", error);
  process.exit(1);
});
