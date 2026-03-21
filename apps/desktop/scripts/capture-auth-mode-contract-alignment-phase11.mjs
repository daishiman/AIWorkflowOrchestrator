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
  "docs/30-workflows/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const port = process.env.AUTH_MODE_PHASE11_PORT ?? "5177";
const baseUrl = `http://localhost:${port}`;
const harnessPath = "/phase11-auth-mode.html";

const screenshots = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-settings-initial.png",
    note: "初期表示。subscription valid。",
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-api-key-missing.png",
    note: "api-key へ切替後、APIキー未設定。",
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-subscription-missing.png",
    note: "subscription へ切替後、subscription token 不在。",
  },
  {
    tc: "TC-11-04",
    file: "TC-11-04-mode-changed.png",
    note: "再読込なしの event 反映。api-key valid。",
  },
  {
    tc: "TC-11-05",
    file: "TC-11-05-restored-mode.png",
    note: "再読込後、api-key valid が復元。",
  },
];

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
    const STORAGE_KEYS = {
      mode: "phase11-auth-mode",
      apiKey: "phase11-auth-has-api-key",
      subscription: "phase11-auth-has-subscription",
      currentView: "phase11-current-view",
    };

    const listeners = new Set();
    const now = () => Date.now();

    const getBool = (key, fallback) => {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      return raw === "true";
    };

    const getMode = () =>
      window.localStorage.getItem(STORAGE_KEYS.mode) ?? "subscription";

    const setMode = (mode) => {
      window.localStorage.setItem(STORAGE_KEYS.mode, mode);
    };

    const setCredentialState = ({ apiKey, subscription }) => {
      window.localStorage.setItem(STORAGE_KEYS.apiKey, String(apiKey));
      window.localStorage.setItem(
        STORAGE_KEYS.subscription,
        String(subscription),
      );
    };

    const getCredentialState = () => ({
      apiKey: getBool(STORAGE_KEYS.apiKey, false),
      subscription: getBool(STORAGE_KEYS.subscription, true),
    });

    const buildStatus = (mode) => {
      const creds = getCredentialState();
      const lastCheckedAt = now();

      if (mode === "api-key") {
        if (creds.apiKey) {
          return {
            mode,
            isValid: true,
            hasCredentials: true,
            message: "Anthropic APIキーを使用できます",
            lastCheckedAt,
          };
        }

        return {
          mode,
          isValid: false,
          hasCredentials: false,
          message: "APIキーが設定されていません",
          errorCode: "auth-mode/no-api-key",
          guidance: "設定画面でAPIキーを入力してください",
          lastCheckedAt,
        };
      }

      if (creds.subscription) {
        return {
          mode,
          isValid: true,
          hasCredentials: true,
          message: "Claude Code CLI の認証情報を使用できます",
          lastCheckedAt,
        };
      }

      return {
        mode,
        isValid: false,
        hasCredentials: false,
        message: "サブスクリプションが見つかりません",
        errorCode: "auth-mode/no-subscription-token",
        guidance: "Claude Code CLIでログインしてください",
        lastCheckedAt,
      };
    };

    const emitChanged = (previousMode, mode) => {
      const event = {
        previousMode,
        mode,
        status: buildStatus(mode),
        changedAt: now(),
      };
      for (const listener of listeners) {
        listener(event);
      }
      return event;
    };

    if (!window.localStorage.getItem(STORAGE_KEYS.mode)) {
      setMode("subscription");
    }
    if (window.localStorage.getItem(STORAGE_KEYS.apiKey) === null) {
      setCredentialState({ apiKey: false, subscription: true });
    }

    const mockUser = {
      id: "phase11-user",
      email: "phase11@example.com",
      displayName: "Phase 11 Reviewer",
      avatarUrl: null,
      provider: "google",
      createdAt: new Date().toISOString(),
      lastSignInAt: new Date().toISOString(),
    };

    const providerStatuses = [
      {
        provider: "openai",
        displayName: "OpenAI",
        status: "not_registered",
        lastValidatedAt: null,
      },
      {
        provider: "anthropic",
        displayName: "Anthropic",
        status: getCredentialState().apiKey ? "registered" : "not_registered",
        lastValidatedAt: getCredentialState().apiKey
          ? new Date().toISOString()
          : null,
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

    window.__phase11AuthModeHarness = {
      setCredentialState,
      getCredentialState,
      getMode,
      setMode(mode) {
        const previousMode = getMode();
        setMode(mode);
        return emitChanged(previousMode, mode);
      },
      getStatus(mode = getMode()) {
        return buildStatus(mode);
      },
      persistSettingsView() {
        const raw = window.localStorage.getItem("knowledge-studio-store");
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          parsed.state = parsed.state || {};
          parsed.state.currentView = "settings";
          window.localStorage.setItem(
            "knowledge-studio-store",
            JSON.stringify(parsed),
          );
        } catch {
          // ignore
        }
      },
    };

    window.electronAPI = {
      invoke: async () => ({ success: true }),
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
            callback({
              authenticated: true,
              user: mockUser,
              isOffline: false,
            });
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
      theme: {
        get: async () => ({
          success: true,
          data: { mode: "dark", resolvedTheme: "dark" },
        }),
        set: async ({ mode }) => ({
          success: true,
          data: {
            mode,
            resolvedTheme: mode === "system" ? "dark" : mode,
          },
        }),
        getSystem: async () => ({
          success: true,
          data: { isDark: true, resolvedTheme: "dark" },
        }),
        onSystemChanged: () => () => {},
      },
      authMode: {
        get: async () => ({
          success: true,
          data: { mode: getMode() },
        }),
        set: async ({ mode }) => {
          if (mode !== "subscription" && mode !== "api-key") {
            return {
              success: false,
              error: {
                code: "auth-mode/invalid-mode",
                message: "Invalid auth mode",
              },
            };
          }

          const previousMode = getMode();
          setMode(mode);
          emitChanged(previousMode, mode);
          return { success: true };
        },
        status: async () => ({
          success: true,
          data: buildStatus(getMode()),
        }),
        validate: async (request) => ({
          success: true,
          data: buildStatus(request?.mode ?? getMode()),
        }),
        onModeChanged: (callback) => {
          listeners.add(callback);
          return () => listeners.delete(callback);
        },
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
        getProviders: async () => ({
          success: true,
          data: [
            {
              provider: "google",
              providerId: "google-phase11",
              email: mockUser.email,
              displayName: mockUser.displayName,
              avatarUrl: null,
              linkedAt: new Date().toISOString(),
            },
          ],
        }),
        update: async ({ updates }) => ({
          success: true,
          data: {
            id: mockUser.id,
            email: mockUser.email,
            displayName: updates?.displayName ?? mockUser.displayName,
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
        linkProvider: async () => ({ success: true }),
        unlinkProvider: async () => ({ success: true }),
        delete: async () => ({ success: true }),
      },
      apiKey: {
        list: async () => ({
          success: true,
          data: { providers: providerStatuses },
        }),
        validate: async () => ({
          success: true,
          data: {
            status: getCredentialState().apiKey ? "valid" : "invalid",
            message: getCredentialState().apiKey
              ? "APIキーは有効です"
              : "APIキーが無効です。キーを確認して再入力してください",
          },
        }),
        save: async () => ({ success: true }),
        delete: async () => ({ success: true }),
      },
      dialog: {
        showOpenDialog: async () => ({
          canceled: true,
          filePaths: [],
        }),
      },
    };
  };
}

async function waitForAuthMode(page, mode) {
  process.stdout.write(`[phase11] waitForAuthMode ${mode}\n`);
  const locator = page.getByTestId(`auth-mode-option-${mode}`);
  await locator.waitFor({ timeout: 20_000 });
  await page.waitForFunction(
    (targetMode) => {
      const button = document.querySelector(
        `[data-testid="auth-mode-option-${targetMode}"]`,
      );
      return button?.getAttribute("aria-checked") === "true";
    },
    mode,
    { timeout: 20_000 },
  );
}

async function waitForStatusMessage(page, message) {
  process.stdout.write(`[phase11] waitForStatusMessage ${message}\n`);
  await page.getByTestId("auth-mode-status-message").waitFor({
    timeout: 20_000,
  });
  await page.waitForFunction(
    (expectedMessage) => {
      const el = document.querySelector(
        "[data-testid='auth-mode-status-message']",
      );
      return el?.textContent?.includes(expectedMessage);
    },
    message,
    { timeout: 20_000 },
  );
}

async function capture(page, tc, file, note) {
  process.stdout.write(`[phase11] capture ${tc} ${file}\n`);
  await page.waitForTimeout(250);
  const target = path.join(screenshotDir, file);
  await page.screenshot({ path: target, fullPage: true });
  const stat = await fs.stat(target);

  return {
    tc,
    file,
    note,
    path: target,
    capturedAt: stat.mtime.toISOString(),
  };
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

  server.stdout.on("data", (chunk) => {
    process.stdout.write(`[vite] ${chunk}`);
  });
  server.stderr.on("data", (chunk) => {
    process.stderr.write(`[vite] ${chunk}`);
  });

  try {
    await waitForServer(baseUrl);

    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1600 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    page.on("console", (msg) => {
      process.stdout.write(`[page:${msg.type()}] ${msg.text()}\n`);
    });
    page.on("pageerror", (error) => {
      process.stderr.write(`[pageerror] ${error.stack ?? error.message}\n`);
    });
    await page.addInitScript(createMockScript());

    process.stdout.write("[phase11] goto harness\n");
    await page.goto(`${baseUrl}${harnessPath}`, {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
    await page
      .waitForLoadState("networkidle", { timeout: 20_000 })
      .catch(() => {
        // fallback to selector waits
      });
    process.stdout.write("[phase11] wait settings view\n");
    await page.getByTestId("settings-view").waitFor({ timeout: 20_000 });
    await waitForAuthMode(page, "subscription");
    await waitForStatusMessage(
      page,
      "Claude Code CLI の認証情報を使用できます",
    );

    const metadata = [];

    metadata.push(
      await capture(
        page,
        screenshots[0].tc,
        screenshots[0].file,
        screenshots[0].note,
      ),
    );

    await page.evaluate(() => {
      window.__phase11AuthModeHarness.setCredentialState({
        apiKey: false,
        subscription: true,
      });
    });
    await page.getByTestId("auth-mode-option-api-key").click();
    await waitForAuthMode(page, "api-key");
    await waitForStatusMessage(page, "APIキーが設定されていません");
    metadata.push(
      await capture(
        page,
        screenshots[1].tc,
        screenshots[1].file,
        screenshots[1].note,
      ),
    );

    await page.evaluate(() => {
      window.__phase11AuthModeHarness.setCredentialState({
        apiKey: false,
        subscription: false,
      });
    });
    await page.getByTestId("auth-mode-option-subscription").click();
    await waitForAuthMode(page, "subscription");
    await waitForStatusMessage(page, "サブスクリプションが見つかりません");
    metadata.push(
      await capture(
        page,
        screenshots[2].tc,
        screenshots[2].file,
        screenshots[2].note,
      ),
    );

    await page.evaluate(() => {
      window.__phase11AuthModeHarness.setCredentialState({
        apiKey: true,
        subscription: false,
      });
    });
    await page.getByTestId("auth-mode-option-api-key").click();
    await waitForAuthMode(page, "api-key");
    await waitForStatusMessage(page, "Anthropic APIキーを使用できます");
    metadata.push(
      await capture(
        page,
        screenshots[3].tc,
        screenshots[3].file,
        screenshots[3].note,
      ),
    );

    await page.reload({ waitUntil: "domcontentloaded", timeout: 90_000 });
    await page
      .waitForLoadState("networkidle", { timeout: 20_000 })
      .catch(() => {
        // fallback to selector waits
      });
    await page.getByTestId("settings-view").waitFor({ timeout: 20_000 });
    await waitForAuthMode(page, "api-key");
    await waitForStatusMessage(page, "Anthropic APIキーを使用できます");
    metadata.push(
      await capture(
        page,
        screenshots[4].tc,
        screenshots[4].file,
        screenshots[4].note,
      ),
    );

    const visualDiagnostics = await page.evaluate(() => {
      const selector = document.querySelector("[role='radiogroup']");
      const status = document.querySelector("[data-testid='auth-mode-status']");
      const selected = document.querySelector(
        "[data-testid='auth-mode-option-api-key'][aria-checked='true']",
      );

      const rectToJson = (rect) => ({
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });

      const selectorRect = selector
        ? rectToJson(selector.getBoundingClientRect())
        : null;
      const statusRect = status
        ? rectToJson(status.getBoundingClientRect())
        : null;
      const selectedStyle = selected ? window.getComputedStyle(selected) : null;
      const statusStyle = status ? window.getComputedStyle(status) : null;

      return {
        selectorRect,
        statusRect,
        selectedButton: selectedStyle
          ? {
              backgroundColor: selectedStyle.backgroundColor,
              color: selectedStyle.color,
              borderRadius: selectedStyle.borderRadius,
            }
          : null,
        statusCard: statusStyle
          ? {
              backgroundColor: statusStyle.backgroundColor,
              color: statusStyle.color,
              borderRadius: statusStyle.borderRadius,
            }
          : null,
      };
    });

    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          baseUrl,
          screenshots: metadata,
          visualDiagnostics,
        },
        null,
        2,
      ),
      "utf8",
    );

    await context.close();
    await browser.close();
    process.stdout.write(`Saved screenshots to ${screenshotDir}\n`);
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
