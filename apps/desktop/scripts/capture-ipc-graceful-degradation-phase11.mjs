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
  "docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001",
);
const screenshotDir = path.join(workflowRoot, "outputs/phase-11/screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const port = process.env.IPC_GRACEFUL_PHASE11_PORT ?? "5186";
const baseUrl = `http://localhost:${port}`;
const captureDate = new Date().toISOString().slice(0, 10);

const scenarios = [
  {
    id: "TC-11-01",
    file: `TC-11-01-dashboard-root-${captureDate}.png`,
    url: `${baseUrl}/?skipAuth=true`,
    selector: '[data-testid="dashboard-view"]',
    currentView: "dashboard",
    note: "Graceful Degradation 導入後も、ルート画面でダッシュボードが安定表示されることを確認。",
  },
  {
    id: "TC-11-02",
    file: `TC-11-02-settings-auth-surfaces-${captureDate}.png`,
    url: `${baseUrl}/phase11-auth-mode.html?skipAuth=true`,
    selector: '[data-testid="settings-view"]',
    currentView: "dashboard",
    note: "Settings 画面で認証方式・API Key・プロフィール関連 surface が描画されることを確認。",
  },
  {
    id: "TC-11-03",
    file: `TC-11-03-skill-center-standalone-${captureDate}.png`,
    url: `${baseUrl}/advanced/skill-center?skipAuth=true`,
    selector: '[data-testid="skill-center-view"]',
    currentView: "dashboard",
    note: "Standalone Skill Center 画面が描画され、Graceful Degradation の影響で renderer が崩れていないことを確認。",
  },
];

function createMockScript() {
  return ({ currentView }) => {
    const now = new Date().toISOString();
    const mockUser = {
      id: "phase11-user",
      email: "phase11@example.com",
      displayName: "Phase 11 Reviewer",
      avatarUrl: "",
      provider: "google",
      createdAt: now,
      lastSignInAt: now,
    };

    const authModeStatus = {
      mode: "api-key",
      isValid: true,
      hasCredentials: true,
      message: "Anthropic APIキーを使用できます",
      lastCheckedAt: Date.now(),
    };

    const skills = [
      {
        name: "graceful-startup-audit",
        description: "IPC 登録の部分失敗を点検するツール",
        category: "analysis",
      },
      {
        name: "auth-surface-check",
        description: "認証 surface の健全性を確認するツール",
        category: "security",
      },
      {
        name: "workflow-trace-sync",
        description: "workflow の traceability を確認するツール",
        category: "ops",
      },
    ];

    const importedSkills = [
      {
        id: "imported-1",
        name: "graceful-startup-audit",
        path: "analysis/graceful-startup-audit.md",
        importedAt: now,
      },
    ];

    window.localStorage.setItem("dev-skip-auth", "true");
    window.localStorage.setItem(
      "knowledge-studio-store",
      JSON.stringify({
        state: {
          currentView,
          selectedFile: null,
          expandedFolders: [],
          userProfile: {
            name: mockUser.displayName,
            email: mockUser.email,
            avatar: "",
            plan: "free",
          },
          autoSyncEnabled: true,
          windowSize: { width: 1440, height: 960 },
          permissionHistory: [],
          notifications: [],
        },
        version: 0,
      }),
    );

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
        logout: async () => ({ success: true }),
        refresh: async () => ({
          success: true,
          data: {
            user: mockUser,
            expiresAt: Date.now() + 60 * 60 * 1000,
            isOffline: false,
          },
        }),
      },
      authMode: {
        get: async () => ({ success: true, data: { mode: "api-key" } }),
        set: async ({ mode }) => ({ success: true, data: { mode } }),
        status: async () => ({ success: true, data: authModeStatus }),
        validate: async () => ({ success: true, data: authModeStatus }),
        onModeChanged: (callback) => {
          callback({
            previousMode: "subscription",
            mode: "api-key",
            status: authModeStatus,
            changedAt: Date.now(),
          });
          return () => {};
        },
      },
      authKey: {
        exists: async () => ({ exists: true }),
        set: async () => ({ success: true }),
        delete: async () => ({ success: true }),
      },
      apiKey: {
        list: async () => ({
          success: true,
          data: {
            providers: [
              {
                provider: "anthropic",
                displayName: "Anthropic",
                status: "registered",
                lastValidatedAt: now,
              },
              {
                provider: "openai",
                displayName: "OpenAI",
                status: "not_registered",
                lastValidatedAt: null,
              },
            ],
            registeredCount: 1,
            totalCount: 2,
          },
        }),
        validate: async () => ({
          success: true,
          data: { status: "valid", message: "ok" },
        }),
        save: async () => ({ success: true }),
        delete: async () => ({ success: true }),
      },
      profile: {
        get: async () => ({
          success: true,
          data: {
            id: mockUser.id,
            email: mockUser.email,
            displayName: mockUser.displayName,
            avatarUrl: null,
            linkedProviders: ["google"],
            notificationSettings: {
              email: true,
              desktop: true,
              sound: true,
              workflowComplete: true,
              workflowError: true,
            },
          },
        }),
        getProviders: async () => ({ success: true, data: [] }),
        update: async () => ({ success: true, data: {} }),
        linkProvider: async () => ({ success: true }),
        unlinkProvider: async () => ({ success: true }),
        delete: async () => ({ success: true }),
      },
      avatar: {
        upload: async () => ({ success: true, data: { url: "" } }),
        useProvider: async () => ({ success: true }),
        remove: async () => ({ success: true }),
      },
      theme: {
        get: async () => ({
          success: true,
          data: { mode: "dark", resolvedTheme: "dark" },
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
      skill: {
        list: async () => skills,
        getImported: async () => importedSkills,
        import: async (skillName) =>
          importedSkills.find((skill) => skill.name === skillName) ?? {
            id: "imported-new",
            name: skillName,
            path: `${skillName}.md`,
            importedAt: now,
          },
        remove: async () => undefined,
        rescan: async () => skills,
        execute: async () => ({
          success: true,
          data: { executionId: "exec-1" },
        }),
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
        save: async () => ({ success: true }),
        addFolder: async () => ({
          success: true,
          data: { path: "/tmp/workspace", name: "workspace" },
        }),
        removeFolder: async () => ({ success: true }),
        validatePaths: async () => ({ success: true, data: { valid: true } }),
        onFolderChanged: () => () => {},
      },
      dialog: {
        showOpenDialog: async () => ({ canceled: true, filePaths: [] }),
      },
      store: {
        get: async () => ({ success: true, data: { value: null } }),
        set: async () => ({ success: true }),
        getSecure: async () => ({ success: true, data: { value: null } }),
        setSecure: async () => ({ success: true }),
      },
      app: {
        getVersion: async () => ({
          success: true,
          data: { version: "phase11" },
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
      invoke: async () => ({ success: true }),
    };
  };
}

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
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
  throw new Error(`Timed out waiting for ${url}`);
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });

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
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  server.stdout.on("data", (chunk) => process.stdout.write(chunk));
  server.stderr.on("data", (chunk) => process.stderr.write(chunk));

  try {
    await waitForServer(baseUrl);
    const browser = await chromium.launch({ headless: true });
    const results = [];

    for (const scenario of scenarios) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 960 },
        colorScheme: "dark",
      });
      await context.addInitScript(createMockScript(), {
        currentView: scenario.currentView,
      });
      const page = await context.newPage();
      await page.goto(scenario.url, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(scenario.selector, { timeout: 30_000 });
      await page.waitForTimeout(1_200);
      const outputPath = path.join(screenshotDir, scenario.file);
      await page.screenshot({ path: outputPath });
      const stat = await fs.stat(outputPath);
      results.push({
        tc: scenario.id,
        file: scenario.file,
        url: scenario.url,
        note: scenario.note,
        capturedAt: stat.mtime.toISOString(),
      });
      await context.close();
      process.stdout.write(`Captured ${scenario.id}: ${outputPath}\n`);
    }

    await browser.close();
    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          baseUrl,
          viewport: { width: 1440, height: 960 },
          scenarios: results,
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
  console.error("[capture-ipc-graceful-degradation-phase11] failed", error);
  process.exit(1);
});
