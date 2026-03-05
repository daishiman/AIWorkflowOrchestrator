import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../../..");
const outputDir = path.join(
  ROOT,
  "docs/30-workflows/completed-tasks/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/outputs/phase-11/screenshots",
);
// Default capture target for local manual validation.
const baseUrl = process.env.PHASE11_SCREENSHOT_BASE_URL || "http://localhost:5173";

const mockSkills = [
  {
    name: "auth-check-skill",
    description: "auth-check regression verification skill",
    category: "security",
  },
  {
    name: "workflow-audit-skill",
    description: "workflow audit regression skill",
    category: "analysis",
  },
];

async function main() {
  await fs.mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();

  await page.addInitScript(({ skills }) => {
    const now = Date.now();
    const nowIso = new Date().toISOString();

    const mockUser = {
      id: "phase11-user",
      email: "phase11@example.com",
      displayName: "Phase11 User",
      avatarUrl: "",
      provider: "google",
      createdAt: nowIso,
      lastSignInAt: nowIso,
    };

    const authModeStatus = {
      mode: "api-key",
      isValid: true,
      message: "APIキー認証は有効です",
      lastCheckedAt: now,
    };

    const imported = [
      {
        id: "imported-1",
        name: "auth-check-skill",
        path: "security/auth-check-skill.md",
        importedAt: nowIso,
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.electronAPI = {
      auth: {
        checkOnline: async () => ({ success: true, data: { online: true } }),
        getSession: async () => ({
          success: true,
          data: {
            user: mockUser,
            expiresAt: now + 60 * 60 * 1000,
            isOffline: false,
          },
        }),
        onAuthStateChanged: (callback) => {
          setTimeout(() => {
            callback({ authenticated: true, user: mockUser, isOffline: false });
          }, 10);
          return () => {};
        },
        login: async () => ({ success: true, data: {} }),
        logout: async () => ({ success: true, data: {} }),
        refresh: async () => ({ success: true, data: {} }),
      },
      authMode: {
        get: async () => ({ success: true, data: { mode: "api-key" } }),
        set: async ({ mode }) => ({ success: true, data: { mode } }),
        status: async () => ({ success: true, data: authModeStatus }),
        validate: async () => ({ success: true, data: authModeStatus }),
        onModeChanged: () => () => {},
      },
      apiKey: {
        list: async () => ({ success: true, data: { keys: [] } }),
        save: async () => ({ success: true, data: {} }),
        delete: async () => ({ success: true, data: {} }),
        validate: async () => ({ success: true, data: { valid: true } }),
      },
      profile: {
        get: async () => ({ success: true, data: { profile: null } }),
        update: async () => ({ success: true, data: {} }),
        delete: async () => ({ success: true, data: {} }),
        getProviders: async () => ({ success: true, data: [] }),
        linkProvider: async () => ({ success: true, data: {} }),
        unlinkProvider: async () => ({ success: true, data: {} }),
      },
      avatar: {
        upload: async () => ({ success: true, data: { url: "" } }),
        useProvider: async () => ({ success: true, data: {} }),
        remove: async () => ({ success: true, data: {} }),
      },
      theme: {
        get: async () => ({
          success: true,
          data: { mode: "kanagawa-dragon", resolvedTheme: "kanagawa-dragon" },
        }),
        set: async ({ mode }) => ({ success: true, data: { mode, resolvedTheme: mode } }),
        getSystem: async () => ({ success: true, data: { isDark: true, resolvedTheme: "dark" } }),
        onSystemChanged: () => () => {},
      },
      skill: {
        list: async () => skills,
        rescan: async () => skills,
        getImported: async () => imported,
        import: async (skillName) =>
          imported.find((s) => s.name === skillName) || {
            id: "imported-new",
            name: skillName,
            path: `${skillName}.md`,
            importedAt: nowIso,
          },
        remove: async () => undefined,
        execute: async () => ({ success: true, data: { executionId: "exec-1" } }),
        analyze: async () => ({ success: true, data: { summary: "ok" } }),
        applyImprovements: async () => ({ success: true, data: {} }),
        autoImprove: async () => ({ success: true, data: {} }),
        create: async () => ({ success: true, data: { created: true } }),
        onStream: () => () => {},
        onComplete: () => () => {},
        onError: () => () => {},
        onPermissionRequest: () => () => {},
      },
      file: {
        selectFiles: async () => [],
        selectFolder: async () => null,
      },
      workspace: {
        load: async () => ({ success: true, data: { folders: [] } }),
        save: async () => ({ success: true, data: {} }),
        addFolder: async () => ({ success: true, data: { path: "/tmp", name: "tmp" } }),
        removeFolder: async () => ({ success: true, data: {} }),
        validatePaths: async () => ({ success: true, data: { valid: true } }),
        onFolderChanged: () => () => {},
      },
      store: {
        get: async () => ({ success: true, data: { value: null } }),
        set: async () => ({ success: true, data: {} }),
        getSecure: async () => ({ success: true, data: { value: null } }),
        setSecure: async () => ({ success: true, data: {} }),
      },
      app: {
        getVersion: async () => ({ success: true, data: { version: "e2e" } }),
        onMenuAction: () => () => {},
      },
      window: {
        getState: async () => ({ success: true, data: { isMaximized: false, isFullScreen: false } }),
        onResized: () => () => {},
      },
      invoke: async () => ({ success: true, data: {} }),
    };

    window.sessionStorage.setItem("debug-clear-storage", "done");
    window.localStorage.setItem(
      "knowledge-studio-store",
      JSON.stringify({
        state: {
          currentView: "settings",
          selectedFile: null,
          expandedFolders: [],
          userProfile: {
            name: "Phase11 User",
            email: "phase11@example.com",
            avatar: "",
            plan: "free",
          },
          autoSyncEnabled: true,
          windowSize: { width: 1440, height: 960 },
          permissionHistory: [],
        },
        version: 0,
      }),
    );
  }, { skills: mockSkills });

  const scenarios = [
    {
      id: "TC-11-UI-01",
      url: `${baseUrl}/`,
      selector: 'button[aria-label="Settings"]',
      file: "TC-11-UI-01-root-navigation.png",
    },
    {
      id: "TC-11-UI-02",
      url: `${baseUrl}/advanced/skill-center`,
      selector: '[data-testid="skill-center-view"]',
      file: "TC-11-UI-02-skill-center-view.png",
    },
    {
      id: "TC-11-UI-03",
      url: `${baseUrl}/advanced/ui-design-foundation`,
      selector: '[data-testid="ui-design-foundation-preview"]',
      file: "TC-11-UI-03-ui-design-foundation.png",
    },
  ];

  for (const scenario of scenarios) {
    await page.goto(scenario.url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(scenario.selector, { timeout: 20000 });
    const output = path.join(outputDir, scenario.file);
    await page.screenshot({ path: output, fullPage: true });
    process.stdout.write(`Captured ${scenario.id}: ${output}\n`);
  }

  await context.close();
  await browser.close();
}

main().catch((error) => {
  console.error("[capture-electron-sandbox-iterable-phase11] failed", error);
  process.exit(1);
});
