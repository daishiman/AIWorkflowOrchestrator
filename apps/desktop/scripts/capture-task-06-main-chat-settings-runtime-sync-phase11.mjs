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
  "docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-06-main-chat-settings-runtime-sync",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const port = process.env.TASK06_RUNTIME_SYNC_PHASE11_PORT ?? "5196";
const baseUrl = `http://127.0.0.1:${port}`;
const harnessPath = "/phase11-auth-mode.html";

const screenshots = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-settings-access-matrix.png",
    note: "Settings access card（認証方式/状態メッセージ/APIキー導線）",
    action: async (page) => {
      await page.getByTestId("auth-mode-option-api-key").click();
      await page.getByTestId("auth-key-section").waitFor({ timeout: 20_000 });
      await page.locator("#auth-mode-settings-heading").scrollIntoViewIfNeeded();
    },
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-main-chat-selector-prompt.png",
    note: "Settings 側で確認できる selector/prompt 関連領域（APIキー一覧・認証導線）",
    action: async (page) => {
      await page.locator("#api-keys-settings-heading").scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
    },
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-settings-health-rag-guidance.png",
    note: "Settings の guidance/RAG 領域（RAG設定と認証ガイダンス）",
    action: async (page) => {
      await page.locator("#rag-settings-heading").scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
    },
  },
  {
    tc: "TC-11-04",
    file: "TC-11-04-settings-terminal-launcher.png",
    note: "Settings header 近傍（terminal launcher 導線の有無を確認）",
    action: async (page) => {
      await page.locator("header").first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
    },
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
      authKeyStored: "phase11-authkey-stored",
      authKeyEnvFallback: "phase11-authkey-env",
      providerStore: "phase11-apikey-providers",
    };

    const listeners = new Set();

    const getBool = (key, fallback) => {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      return raw === "true";
    };

    const getMode = () => window.localStorage.getItem(STORAGE_KEYS.mode) ?? "api-key";
    const setMode = (mode) => window.localStorage.setItem(STORAGE_KEYS.mode, mode);

    const getAuthKeyState = () => ({
      stored: getBool(STORAGE_KEYS.authKeyStored, false),
      env: getBool(STORAGE_KEYS.authKeyEnvFallback, false),
    });

    const setAuthKeyState = ({ stored, env }) => {
      window.localStorage.setItem(STORAGE_KEYS.authKeyStored, String(stored));
      window.localStorage.setItem(STORAGE_KEYS.authKeyEnvFallback, String(env));
    };

    const defaultProviders = [
      {
        provider: "openai",
        displayName: "OpenAI",
        status: "registered",
        lastValidatedAt: new Date().toISOString(),
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

    const loadProviders = () => {
      const raw = window.localStorage.getItem(STORAGE_KEYS.providerStore);
      if (!raw) return defaultProviders;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // ignore
      }
      return defaultProviders;
    };

    const saveProviders = (providers) => {
      window.localStorage.setItem(STORAGE_KEYS.providerStore, JSON.stringify(providers));
    };

    const buildStatus = (mode) => {
      const state = getAuthKeyState();
      if (mode === "api-key") {
        if (state.stored || state.env) {
          return {
            mode,
            isValid: true,
            hasCredentials: true,
            message: "Anthropic APIキーを使用できます",
            lastCheckedAt: Date.now(),
          };
        }
        return {
          mode,
          isValid: false,
          hasCredentials: false,
          message: "APIキーが設定されていません",
          errorCode: "auth-mode/no-api-key",
          guidance: "設定画面でAPIキーを入力してください",
          lastCheckedAt: Date.now(),
        };
      }

      return {
        mode,
        isValid: true,
        hasCredentials: true,
        message: "Claude Code CLI の認証情報を使用できます",
        lastCheckedAt: Date.now(),
      };
    };

    const emitChanged = (previousMode, mode) => {
      const event = {
        previousMode,
        mode,
        status: buildStatus(mode),
        changedAt: Date.now(),
      };
      for (const listener of listeners) listener(event);
      return event;
    };

    if (!window.localStorage.getItem(STORAGE_KEYS.mode)) setMode("api-key");
    if (window.localStorage.getItem(STORAGE_KEYS.authKeyStored) === null) {
      setAuthKeyState({ stored: false, env: false });
    }
    if (!window.localStorage.getItem(STORAGE_KEYS.providerStore)) {
      saveProviders(defaultProviders);
    }

    window.__phase11Task06Harness = {
      setAuthKeyState,
      setMode(mode) {
        const previousMode = getMode();
        setMode(mode);
        return emitChanged(previousMode, mode);
      },
      listProviders() {
        return loadProviders();
      },
    };

    const mockUser = {
      id: "phase11-user",
      email: "phase11@example.com",
      displayName: "Phase11 Reviewer",
      avatarUrl: null,
      provider: "google",
      createdAt: new Date().toISOString(),
      lastSignInAt: new Date().toISOString(),
    };

    window.electronAPI = {
      invoke: async () => ({ success: true }),
      auth: {
        checkOnline: async () => ({ success: true, data: { online: true } }),
        getSession: async () => ({
          success: true,
          data: {
            user: mockUser,
            expiresAt: Date.now() + 3600_000,
            isOffline: false,
          },
        }),
        onAuthStateChanged: (callback) => {
          setTimeout(
            () => callback({ authenticated: true, user: mockUser, isOffline: false }),
            10,
          );
          return () => {};
        },
        login: async () => ({ success: true }),
        logout: async () => ({ success: true }),
        refresh: async () => ({
          success: true,
          data: {
            user: mockUser,
            expiresAt: Date.now() + 3600_000,
            isOffline: false,
          },
        }),
      },
      theme: {
        get: async () => ({ success: true, data: { mode: "light", resolvedTheme: "light" } }),
        set: async ({ mode }) => ({
          success: true,
          data: { mode, resolvedTheme: mode === "system" ? "light" : mode },
        }),
        getSystem: async () => ({ success: true, data: { isDark: false, resolvedTheme: "light" } }),
        onSystemChanged: () => () => {},
      },
      authMode: {
        get: async () => ({ success: true, data: { mode: getMode() } }),
        set: async ({ mode }) => {
          const previousMode = getMode();
          setMode(mode);
          emitChanged(previousMode, mode);
          return { success: true };
        },
        status: async () => ({ success: true, data: buildStatus(getMode()) }),
        validate: async (request) => ({ success: true, data: buildStatus(request?.mode ?? getMode()) }),
        onModeChanged: (callback) => {
          listeners.add(callback);
          return () => listeners.delete(callback);
        },
      },
      authKey: {
        exists: async () => {
          const state = getAuthKeyState();
          if (state.stored) return { exists: true, source: "saved" };
          if (state.env) return { exists: true, source: "env-fallback" };
          return { exists: false, source: "not-set" };
        },
        set: async () => {
          setAuthKeyState({ stored: true, env: false });
          return { success: true };
        },
        delete: async () => {
          const state = getAuthKeyState();
          setAuthKeyState({ stored: false, env: state.env });
          return { success: true };
        },
      },
      apiKey: {
        list: async () => {
          const providers = loadProviders();
          const registeredCount = providers.filter((item) => item.status === "registered").length;
          return {
            success: true,
            data: {
              providers,
              registeredCount,
              totalCount: providers.length,
            },
          };
        },
        validate: async () => ({ success: true, data: { status: "valid", message: "ok" } }),
        save: async ({ provider }) => {
          const providers = loadProviders().map((item) =>
            item.provider === provider
              ? { ...item, status: "registered", lastValidatedAt: new Date().toISOString() }
              : item,
          );
          saveProviders(providers);
          return { success: true };
        },
        delete: async ({ provider }) => {
          const providers = loadProviders().map((item) =>
            item.provider === provider ? { ...item, status: "not_registered" } : item,
          );
          saveProviders(providers);
          return { success: true };
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
        getProviders: async () => ({ success: true, data: [] }),
        update: async () => ({ success: true, data: {} }),
        linkProvider: async () => ({ success: true }),
        unlinkProvider: async () => ({ success: true }),
        delete: async () => ({ success: true }),
      },
      llm: {
        getProviders: async () => ({ success: true, data: [] }),
        getSelectedConfig: async () => ({
          success: true,
          data: { providerId: "openai", modelId: "gpt-4o" },
        }),
        setSelectedConfig: async () => ({ success: true }),
        checkHealth: async () => ({
          status: "connected",
          providerId: "openai",
          checkedAt: new Date(),
        }),
      },
      dialog: {
        showOpenDialog: async () => ({ canceled: true, filePaths: [] }),
      },
    };
  };
}

async function collectObservations(page) {
  return page.evaluate(() => ({
    hasAuthModeStatus: Boolean(document.querySelector('[data-testid="auth-mode-status"]')),
    hasAuthKeySection: Boolean(document.querySelector('[data-testid="auth-key-section"]')),
    hasApiKeysSection: Boolean(document.querySelector("#api-keys-settings-heading")),
    hasRagSection: Boolean(document.querySelector("#rag-settings-heading")),
    hasTerminalLauncher: Boolean(
      document.querySelector('[data-testid="settings-terminal-launcher"]') ||
        document.querySelector('[data-testid="terminal-launcher"]'),
    ),
    hasSelectorPanel: Boolean(document.querySelector('[data-testid="llm-selector-panel"]')),
    hasSystemPromptPanel: Boolean(document.querySelector('[data-testid="system-prompt-panel"]')),
  }));
}

async function capture(page, scenario) {
  await scenario.action(page);
  const target = path.join(screenshotDir, scenario.file);
  await page.screenshot({ path: target, fullPage: true });
  const stat = await fs.stat(target);
  const observed = await collectObservations(page);
  return {
    tc: scenario.tc,
    file: scenario.file,
    note: scenario.note,
    capturedAt: stat.mtime.toISOString(),
    observed,
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
      "--host",
      "127.0.0.1",
    ],
    {
      cwd: desktopRoot,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        VITE_SKIP_AUTH: "true",
      },
    },
  );

  server.stdout.on("data", (chunk) => process.stdout.write(chunk.toString()));
  server.stderr.on("data", (chunk) => process.stderr.write(chunk.toString()));

  try {
    await waitForServer(baseUrl);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1512, height: 982 },
      colorScheme: "light",
    });
    await context.addInitScript(createMockScript());
    const page = await context.newPage();

    await page.goto(`${baseUrl}${harnessPath}`, {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
    await page.getByTestId("settings-view").waitFor({ timeout: 20_000 });
    await page.waitForTimeout(600);

    const captured = [];
    for (const scenario of screenshots) {
      captured.push(await capture(page, scenario));
    }

    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          baseUrl,
          harnessPath,
          screenshots: captured,
        },
        null,
        2,
      ),
      "utf8",
    );

    await browser.close();
    process.stdout.write(`Saved screenshots to ${screenshotDir}\n`);
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error("[capture-task-06-main-chat-settings-runtime-sync-phase11] failed", error);
  process.exit(1);
});
