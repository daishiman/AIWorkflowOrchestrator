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
  "docs/30-workflows/05-TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const port = process.env.SETTINGS_AUTHKEY_PHASE11_PORT ?? "5178";
const baseUrl = `http://localhost:${port}`;
const harnessPath = "/phase11-auth-mode.html";

const screenshots = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-authkey-not-set.png",
    note: "api-keyモードでAuthKeySection表示、未設定バッジ。",
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-authkey-save-success.png",
    note: "APIキー保存操作後、保存成功メッセージ表示。",
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-authkey-env-fallback.png",
    note: "環境変数fallback時、環境変数で設定済みバッジ。",
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
    };

    const listeners = new Set();

    const getBool = (key, fallback) => {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      return raw === "true";
    };

    const getMode = () => window.localStorage.getItem(STORAGE_KEYS.mode) ?? "subscription";
    const setMode = (mode) => window.localStorage.setItem(STORAGE_KEYS.mode, mode);

    const getAuthKeyState = () => ({
      stored: getBool(STORAGE_KEYS.authKeyStored, false),
      env: getBool(STORAGE_KEYS.authKeyEnvFallback, false),
    });

    const setAuthKeyState = ({ stored, env }) => {
      window.localStorage.setItem(STORAGE_KEYS.authKeyStored, String(stored));
      window.localStorage.setItem(STORAGE_KEYS.authKeyEnvFallback, String(env));
    };

    const buildStatus = (mode) => {
      const state = getAuthKeyState();
      if (mode === "api-key") {
        if (state.stored) {
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

    if (!window.localStorage.getItem(STORAGE_KEYS.mode)) setMode("subscription");
    if (window.localStorage.getItem(STORAGE_KEYS.authKeyStored) === null) {
      setAuthKeyState({ stored: false, env: false });
    }

    window.__phase11AuthKeyHarness = {
      setAuthKeyState,
      setMode(mode) {
        const prev = getMode();
        setMode(mode);
        return emitChanged(prev, mode);
      },
    };

    const mockUser = {
      id: "phase11-user",
      email: "phase11@example.com",
      displayName: "Phase 11 Reviewer",
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
          data: { user: mockUser, expiresAt: Date.now() + 3600000, isOffline: false },
        }),
        onAuthStateChanged: (callback) => {
          setTimeout(() => callback({ authenticated: true, user: mockUser, isOffline: false }), 10);
          return () => {};
        },
        login: async () => ({ success: true }),
        logout: async () => ({ success: true }),
        refresh: async () => ({
          success: true,
          data: { user: mockUser, expiresAt: Date.now() + 3600000, isOffline: false },
        }),
      },
      theme: {
        get: async () => ({ success: true, data: { mode: "dark", resolvedTheme: "dark" } }),
        set: async ({ mode }) => ({
          success: true,
          data: { mode, resolvedTheme: mode === "system" ? "dark" : mode },
        }),
        getSystem: async () => ({ success: true, data: { isDark: true, resolvedTheme: "dark" } }),
        onSystemChanged: () => () => {},
      },
      authMode: {
        get: async () => ({ success: true, data: { mode: getMode() } }),
        set: async ({ mode }) => {
          const prev = getMode();
          setMode(mode);
          emitChanged(prev, mode);
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
          return { exists: state.stored || state.env };
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
        update: async ({ updates }) => ({ success: true, data: { ...mockUser, displayName: updates?.displayName ?? mockUser.displayName } }),
        linkProvider: async () => ({ success: true }),
        unlinkProvider: async () => ({ success: true }),
        delete: async () => ({ success: true }),
      },
      apiKey: {
        list: async () => ({ success: true, data: { providers: [] } }),
        validate: async () => ({ success: true, data: { status: "valid", message: "ok" } }),
        save: async () => ({ success: true }),
        delete: async () => ({ success: true }),
      },
      dialog: {
        showOpenDialog: async () => ({ canceled: true, filePaths: [] }),
      },
    };
  };
}

async function capture(page, tc, file, note) {
  const target = path.join(screenshotDir, file);
  await page.waitForTimeout(300);
  await page.screenshot({ path: target, fullPage: true });
  const stat = await fs.stat(target);
  return { tc, file, note, path: target, capturedAt: stat.mtime.toISOString() };
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });

  const server = spawn(
    "pnpm",
    ["exec", "vite", "--config", "vite.e2e.config.ts", "--port", port, "--strictPort"],
    { cwd: desktopRoot, stdio: ["ignore", "pipe", "pipe"] },
  );

  server.stdout.on("data", (chunk) => process.stdout.write(`[vite] ${chunk}`));
  server.stderr.on("data", (chunk) => process.stderr.write(`[vite] ${chunk}`));

  try {
    await waitForServer(baseUrl);

    const browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1440, height: 1700 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.addInitScript(createMockScript());

    await page.goto(`${baseUrl}${harnessPath}`, { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page.getByTestId("settings-view").waitFor({ timeout: 20_000 });

    await page.getByTestId("auth-mode-option-api-key").click();
    await page.getByTestId("auth-key-section").waitFor({ timeout: 20_000 });
    await page.waitForFunction(() => {
      const badge = document.querySelector("[data-testid='auth-key-status-badge']");
      return badge?.getAttribute("data-status") === "not-set";
    });
    const metadata = [];
    metadata.push(await capture(page, screenshots[0].tc, screenshots[0].file, screenshots[0].note));

    await page.getByLabel("Anthropic APIキー入力").fill("sk-ant-phase11-demo");
    await page.getByTestId("save-auth-key-button").click();
    await page.getByTestId("auth-key-status-message").waitFor({ timeout: 20_000 });
    metadata.push(await capture(page, screenshots[1].tc, screenshots[1].file, screenshots[1].note));

    await page.evaluate(() => {
      window.__phase11AuthKeyHarness.setAuthKeyState({ stored: false, env: true });
      window.__phase11AuthKeyHarness.setMode("api-key");
    });
    await page.reload({ waitUntil: "domcontentloaded", timeout: 90_000 });
    await page.getByTestId("settings-view").waitFor({ timeout: 20_000 });
    await page.getByTestId("auth-mode-option-api-key").click();
    await page.waitForFunction(() => {
      const badge = document.querySelector("[data-testid='auth-key-status-badge']");
      return badge?.getAttribute("data-status") === "env-fallback";
    });
    metadata.push(await capture(page, screenshots[2].tc, screenshots[2].file, screenshots[2].note));

    await fs.writeFile(
      metadataPath,
      JSON.stringify({ capturedAt: new Date().toISOString(), baseUrl, harnessPath, screenshots: metadata }, null, 2),
      "utf8",
    );

    await browser.close();
    process.stdout.write(`Saved screenshots to ${screenshotDir}\n`);
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error("[capture-settings-authkey-ui-alignment-phase11] failed", error);
  process.exitCode = 1;
});
