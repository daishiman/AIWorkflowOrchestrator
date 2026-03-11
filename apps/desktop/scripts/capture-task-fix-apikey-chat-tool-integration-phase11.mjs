#!/usr/bin/env node

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(desktopRoot, "..", "..");
const workflowRoot = path.join(
  repoRoot,
  "docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const planPath = path.join(phase11Root, "screenshot-plan.json");
const port = process.env.APIKEY_CHAT_INTEGRATION_PHASE11_PORT ?? "5188";
const baseUrl = `http://localhost:${port}`;
const harnessPath = "/phase11-auth-mode.html";

const screenshots = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-settings-apikey-authkey-initial.png",
    note: "初期状態。api-keyモードでApiKeysSectionとAuthKeySectionが同時表示される。",
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-settings-apikey-save-success.png",
    note: "Anthropic APIキー保存後。保存成功フィードバック表示。",
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-settings-authkey-env-fallback.png",
    note: "AuthKeyが環境変数fallbackのとき、sourceに基づくバッジ表示。",
  },
];

async function waitForServer(url, timeoutMs = 60_000) {
  const probe = async () =>
    new Promise((resolve) => {
      const req = http.get(url, (res) => {
        const ok = typeof res.statusCode === "number" && res.statusCode >= 200 && res.statusCode < 500;
        res.resume();
        resolve(ok);
      });
      req.on("error", () => resolve(false));
      req.setTimeout(2_000, () => {
        req.destroy();
        resolve(false);
      });
    });

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await probe()) return;
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

    const defaultProviders = [
      { provider: "openai", displayName: "OpenAI", status: "not_registered", lastValidatedAt: null },
      { provider: "anthropic", displayName: "Anthropic", status: "not_registered", lastValidatedAt: null },
      { provider: "google", displayName: "Google AI", status: "not_registered", lastValidatedAt: null },
      { provider: "xai", displayName: "xAI", status: "not_registered", lastValidatedAt: null },
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
        update: async ({ updates }) => ({
          success: true,
          data: { ...mockUser, displayName: updates?.displayName ?? mockUser.displayName },
        }),
        linkProvider: async () => ({ success: true }),
        unlinkProvider: async () => ({ success: true }),
        delete: async () => ({ success: true }),
      },
      apiKey: {
        list: async () => {
          const providers = loadProviders();
          const registeredCount = providers.filter((p) => p.status === "registered").length;
          return {
            success: true,
            data: { providers, registeredCount, totalCount: providers.length },
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
            item.provider === provider
              ? { ...item, status: "not_registered", lastValidatedAt: null }
              : item,
          );
          saveProviders(providers);
          return { success: true };
        },
      },
      llm: {
        getProviders: async () => ({ success: true, data: [] }),
        getSelectedConfig: async () => ({
          success: true,
          data: { providerId: "anthropic", modelId: "claude-3-5-sonnet-latest" },
        }),
        setSelectedConfig: async () => ({ success: true }),
        sendChat: async () => ({ success: true, data: { content: "ok" } }),
        streamChat: async () => ({ success: true, data: { streamId: "mock" } }),
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

  const plan = {
    generatedAt: new Date().toISOString(),
    harnessPath,
    scenarios: screenshots.map((item) => ({
      tc: item.tc,
      output: `screenshots/${item.file}`,
      description: item.note,
      priority: "A",
    })),
  };
  await fs.writeFile(planPath, JSON.stringify(plan, null, 2), "utf-8");

  const server = spawn(
    "pnpm",
    ["exec", "vite", "--config", "vite.e2e.config.ts", "--port", port, "--strictPort"],
    {
      cwd: desktopRoot,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        VITE_SKIP_AUTH: "true",
      },
    },
  );

  server.stdout.on("data", (data) => {
    process.stdout.write(data.toString());
  });
  server.stderr.on("data", (data) => {
    process.stderr.write(data.toString());
  });

  try {
    await waitForServer(baseUrl);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1512, height: 982 },
      colorScheme: "dark",
    });
    await context.addInitScript(createMockScript());

    const page = await context.newPage();
    await page.goto(`${baseUrl}${harnessPath}`, {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
    await page.waitForTimeout(1500);

    const metadata = [];

    metadata.push(
      await capture(page, screenshots[0].tc, screenshots[0].file, screenshots[0].note),
    );

    await page.getByLabel("Anthropic APIキー入力").fill("sk-ant-phase11-demo");
    await page.getByRole("button", { name: "保存" }).first().click();
    await page.waitForTimeout(600);
    metadata.push(
      await capture(page, screenshots[1].tc, screenshots[1].file, screenshots[1].note),
    );

    await page.evaluate(() => {
      window.__phase11AuthKeyHarness.setAuthKeyState({ stored: false, env: true });
      window.__phase11AuthKeyHarness.setMode("api-key");
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    metadata.push(
      await capture(page, screenshots[2].tc, screenshots[2].file, screenshots[2].note),
    );

    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          baseUrl,
          harnessPath,
          screenshots: metadata,
        },
        null,
        2,
      ),
      "utf-8",
    );

    await context.close();
    await browser.close();

    process.stdout.write(`Saved screenshots to ${screenshotDir}\n`);
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error("[capture-task-fix-apikey-chat-tool-integration-phase11] failed", error);
  process.exit(1);
});
