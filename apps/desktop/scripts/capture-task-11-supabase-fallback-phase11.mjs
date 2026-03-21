import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../../..");
const WORKFLOW_DIR = path.join(
  ROOT,
  "docs/30-workflows/11-TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001",
);
const OUTPUT_DIR = path.join(WORKFLOW_DIR, "outputs/phase-11");
const SCREENSHOT_DIR = path.join(OUTPUT_DIR, "screenshots");
const PLAN_PATH = path.join(OUTPUT_DIR, "screenshot-plan.json");
const METADATA_PATH = path.join(
  SCREENSHOT_DIR,
  "phase11-capture-metadata.json",
);
const baseUrl =
  process.env.PHASE11_SCREENSHOT_BASE_URL || "http://127.0.0.1:5173";

const viewport = { width: 1440, height: 2200 };

const scenarios = [
  {
    id: "TC-11-UI-01",
    file: "TC-11-UI-01-settings-overview.png",
    description: "Settings 全体の正常表示",
    route: "/phase11-auth-mode.html",
    target: "settings-view",
  },
  {
    id: "TC-11-UI-02",
    file: "TC-11-UI-02-profile-fallback-error.png",
    description: "Profile 通知設定更新で fallback エラーを表示",
    route: "/phase11-auth-mode.html",
    target: "profile-section",
    profileFailure: true,
  },
  {
    id: "TC-11-UI-03",
    file: "TC-11-UI-03-avatar-fallback-error.png",
    description: "Avatar アップロードで fallback エラーを表示",
    route: "/phase11-auth-mode.html",
    target: "account-section",
    avatarFailure: true,
  },
];

function createScenarioPlan() {
  return {
    generatedAt: new Date().toISOString(),
    baseUrl,
    viewport,
    scenarios: scenarios.map((scenario) => ({
      id: scenario.id,
      description: scenario.description,
      route: scenario.route,
      output: `screenshots/${scenario.file}`,
      target: scenario.target,
      priority: "A",
    })),
  };
}

function buildInitScriptConfig(scenario) {
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const mockUser = {
    id: "phase11-user",
    email: "phase11@example.com",
    displayName: "Phase11 User",
    avatarUrl: "https://placehold.co/128x128/png",
    provider: "google",
    createdAt: nowIso,
    lastSignInAt: nowIso,
  };
  const mockProfile = {
    id: "phase11-user",
    displayName: "Phase11 User",
    email: "phase11@example.com",
    avatarUrl: "https://placehold.co/128x128/png",
    plan: "pro",
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
  const linkedProviders = [
    {
      provider: "google",
      providerId: "google-phase11",
      email: "phase11@example.com",
      displayName: "Phase11 User",
      avatarUrl: "https://placehold.co/128x128/png",
      linkedAt: nowIso,
    },
    {
      provider: "github",
      providerId: "github-phase11",
      email: "phase11-gh@example.com",
      displayName: "Phase11 GitHub",
      avatarUrl: "https://placehold.co/128x128/png?text=GH",
      linkedAt: nowIso,
    },
  ];
  const authModeStatus = {
    mode: "subscription",
    isValid: true,
    hasCredentials: true,
    message: "サブスクリプション認証は有効です",
    lastCheckedAt: now,
  };
  const apiKeyProviders = [
    {
      provider: "openai",
      displayName: "OpenAI",
      status: "registered",
      lastValidatedAt: nowIso,
    },
    {
      provider: "anthropic",
      displayName: "Anthropic",
      status: "not_registered",
      lastValidatedAt: null,
    },
    {
      provider: "google",
      displayName: "Google AI",
      status: "registered",
      lastValidatedAt: nowIso,
    },
    {
      provider: "xai",
      displayName: "xAI",
      status: "not_registered",
      lastValidatedAt: null,
    },
  ];

  return {
    scenario,
    now,
    nowIso,
    mockUser,
    mockProfile,
    linkedProviders,
    authModeStatus,
    apiKeyProviders,
  };
}

async function captureScenario(browser, scenario) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const initConfig = buildInitScriptConfig(scenario);
  page.setDefaultTimeout(20_000);

  page.on("console", (message) => {
    if (message.type() === "error") {
      console.error(`[${scenario.id}] console error: ${message.text()}`);
    }
  });

  page.on("pageerror", (error) => {
    console.error(`[${scenario.id}] page error: ${error.message}`);
  });

  await page.addInitScript((config) => {
    const {
      scenario,
      now,
      nowIso,
      mockUser,
      mockProfile,
      linkedProviders,
      authModeStatus,
      apiKeyProviders,
    } = config;

    const authSession = {
      user: mockUser,
      expiresAt: now + 60 * 60 * 1000,
      isOffline: false,
    };

    const profileNotConfiguredMessage =
      "Profile service is not configured. Supabase environment variables are required.";
    const avatarNotConfiguredMessage =
      "Avatar service is not configured. Supabase environment variables are required.";

    window.localStorage.setItem("dev-skip-auth", "true");
    window.__PHASE11_AUTH_HARNESS__ = {
      isAuthenticated: true,
      isLoading: false,
      isOffline: false,
      authUser: mockUser,
      profile: mockProfile,
      linkedProviders,
      authError: null,
      userProfile: {
        name: mockProfile.displayName,
        email: mockProfile.email,
        avatar: mockProfile.avatarUrl ?? "",
        plan: mockProfile.plan,
      },
      autoSyncEnabled: true,
      themeMode: "kanagawa-dragon",
      resolvedTheme: "kanagawa-dragon",
      mode: "subscription",
      status: authModeStatus,
    };

    const genericSuccess = { success: true, data: {} };

    window.electronAPI = {
      auth: {
        checkOnline: async () => ({ success: true, data: { online: true } }),
        getSession: async () => ({ success: true, data: authSession }),
        onAuthStateChanged: (callback) => {
          setTimeout(() => {
            callback({
              authenticated: true,
              user: mockUser,
              isOffline: false,
            });
          }, 10);
          return () => {};
        },
        login: async () => genericSuccess,
        logout: async () => genericSuccess,
        refresh: async () => ({ success: true, data: authSession }),
      },
      authMode: {
        get: async () => ({ success: true, data: { mode: "subscription" } }),
        set: async ({ mode }) => ({ success: true, data: { mode } }),
        status: async () => ({ success: true, data: authModeStatus }),
        validate: async () => ({ success: true, data: authModeStatus }),
        onModeChanged: (callback) => {
          callback({ mode: "subscription", status: authModeStatus });
          return () => {};
        },
      },
      apiKey: {
        list: async () => ({
          success: true,
          data: { providers: apiKeyProviders },
        }),
        save: async () => genericSuccess,
        delete: async () => genericSuccess,
        validate: async () => ({
          success: true,
          data: { valid: true, provider: "openai", lastValidatedAt: nowIso },
        }),
      },
      profile: {
        get: async () => ({ success: true, data: mockProfile }),
        update: async () => ({ success: true, data: mockProfile }),
        delete: async () => genericSuccess,
        getProviders: async () => ({ success: true, data: linkedProviders }),
        linkProvider: async ({ provider }) => ({
          success: true,
          data: {
            provider,
            email: `${provider}@example.com`,
            avatarUrl: `https://placehold.co/128x128/png?text=${provider}`,
          },
        }),
        unlinkProvider: async () => genericSuccess,
      },
      avatar: {
        upload: async () =>
          scenario.avatarFailure
            ? {
                success: false,
                error: {
                  code: "avatar/not-configured",
                  message: avatarNotConfiguredMessage,
                },
              }
            : {
                success: true,
                data: {
                  avatarUrl:
                    "https://placehold.co/128x128/png?text=Uploaded+Avatar",
                },
              },
        useProvider: async ({ provider }) =>
          scenario.avatarFailure
            ? {
                success: false,
                error: {
                  code: "avatar/not-configured",
                  message: avatarNotConfiguredMessage,
                },
              }
            : {
                success: true,
                data: {
                  avatarUrl: `https://placehold.co/128x128/png?text=${provider}`,
                },
              },
        remove: async () =>
          scenario.avatarFailure
            ? {
                success: false,
                error: {
                  code: "avatar/not-configured",
                  message: avatarNotConfiguredMessage,
                },
              }
            : genericSuccess,
      },
      theme: {
        get: async () => ({
          success: true,
          data: {
            mode: "kanagawa-dragon",
            resolvedTheme: "kanagawa-dragon",
          },
        }),
        set: async ({ mode }) => ({
          success: true,
          data: { mode, resolvedTheme: mode === "system" ? "dark" : mode },
        }),
        getSystem: async () => ({
          success: true,
          data: { isDark: true, resolvedTheme: "dark" },
        }),
        onSystemChanged: () => () => {},
      },
      dialog: {
        showOpenDialog: async () => ({
          canceled: false,
          filePaths: ["/tmp/profile-import.json"],
        }),
      },
      invoke: async (channel) => {
        if (channel === "profile:update-notifications") {
          if (scenario.profileFailure) {
            return {
              success: false,
              error: {
                code: "profile/not-configured",
                message: profileNotConfiguredMessage,
              },
            };
          }
          return genericSuccess;
        }

        if (channel === "profile:export") {
          return {
            success: true,
            filePath: "/tmp/profile-export.json",
          };
        }

        if (channel === "profile:import") {
          return genericSuccess;
        }

        return genericSuccess;
      },
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
  }, initConfig);

  const url = `${baseUrl}${scenario.route}`;
  console.log(`[${scenario.id}] goto ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const settingsView = page.getByTestId("settings-view");
  console.log(`[${scenario.id}] wait settings-view`);
  try {
    await settingsView.waitFor({ timeout: 20_000 });
  } catch (error) {
    const bodyText = await page.locator("body").textContent();
    console.error(
      `[${scenario.id}] settings-view timeout. body snippet: ${bodyText?.slice(0, 500)}`,
    );
    throw error;
  }
  console.log(`[${scenario.id}] settings-view ready`);

  if (scenario.id === "TC-11-UI-02") {
    console.log(`[${scenario.id}] trigger profile fallback`);
    await page
      .getByRole("checkbox", { name: "メール通知" })
      .evaluate((checkbox) => {
        if (checkbox instanceof HTMLElement) {
          checkbox.click();
        }
      });
    await page.getByText(/Profile service is not configured/i).waitFor({
      timeout: 10_000,
    });
    console.log(`[${scenario.id}] profile fallback rendered`);
  }

  if (scenario.id === "TC-11-UI-03") {
    console.log(`[${scenario.id}] trigger avatar fallback`);
    await page
      .getByRole("button", { name: "アバターを編集" })
      .evaluate((button) => {
        if (button instanceof HTMLElement) {
          button.click();
        }
      });
    await page
      .getByRole("menuitem", { name: "アップロード" })
      .evaluate((item) => {
        if (item instanceof HTMLElement) {
          item.click();
        }
      });
    await page.getByText(/Avatar service is not configured/i).waitFor({
      timeout: 10_000,
    });
    console.log(`[${scenario.id}] avatar fallback rendered`);
  }

  const screenshotPath = path.join(SCREENSHOT_DIR, scenario.file);

  if (scenario.target === "settings-view") {
    await page.screenshot({ path: screenshotPath, fullPage: true });
  } else if (scenario.target === "profile-section") {
    await page.getByTestId("profile-section").scrollIntoViewIfNeeded();
    await page.getByTestId("profile-section").screenshot({
      path: screenshotPath,
    });
  } else {
    await page
      .getByRole("region", { name: "アカウント設定" })
      .scrollIntoViewIfNeeded();
    await page.getByRole("region", { name: "アカウント設定" }).screenshot({
      path: screenshotPath,
    });
  }

  console.log(`[${scenario.id}] saved ${screenshotPath}`);

  await context.close();

  return {
    id: scenario.id,
    route: url,
    output: path.relative(WORKFLOW_DIR, screenshotPath),
    target: scenario.target,
  };
}

async function main() {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
  await fs.writeFile(PLAN_PATH, JSON.stringify(createScenarioPlan(), null, 2));

  const browser = await chromium.launch({ headless: true });
  const captures = [];

  try {
    for (const scenario of scenarios) {
      captures.push(await captureScenario(browser, scenario));
    }
  } finally {
    await browser.close();
  }

  const metadata = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    viewport,
    captures,
  };

  await fs.writeFile(METADATA_PATH, JSON.stringify(metadata, null, 2));

  console.log(
    JSON.stringify(
      {
        ok: true,
        workflow: path.relative(ROOT, WORKFLOW_DIR),
        screenshots: captures,
        metadata: path.relative(ROOT, METADATA_PATH),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("[capture-task-11-supabase-fallback-phase11] failed", error);
  process.exit(1);
});
