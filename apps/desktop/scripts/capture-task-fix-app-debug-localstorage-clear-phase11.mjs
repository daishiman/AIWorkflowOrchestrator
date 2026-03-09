#!/usr/bin/env node

import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(desktopRoot, '..', '..');
const workflowRoot = path.join(
  repoRoot,
  'docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001',
);
const phase11Root = path.join(workflowRoot, 'outputs/phase-11');
const screenshotDir = path.join(phase11Root, 'screenshots');
const metadataPath = path.join(screenshotDir, 'phase11-capture-metadata.json');
const port = process.env.APP_DEBUG_LOCALSTORAGE_PHASE11_PORT ?? '5181';
const baseUrl = `http://localhost:${port}`;
const appUrl = `${baseUrl}/`;
const harnessUrl = `${baseUrl}/phase11-app-debug-localstorage-clear.html`;

const screenshots = [
  {
    tc: 'TC-11-UI-01',
    file: 'TC-11-UI-01-settings-initial.png',
    note: 'AppDock から SettingsView を開き、autoSyncEnabled=false の初期状態を確認する。',
  },
  {
    tc: 'TC-11-UI-02',
    file: 'TC-11-UI-02-autosync-enabled.png',
    note: 'SettingsView 上で自動同期チェックを有効化した直後。',
  },
  {
    tc: 'TC-11-UI-03',
    file: 'TC-11-UI-03-autosync-persisted-after-reload.png',
    note: 'reload 後に SettingsView を再度開いても autoSyncEnabled=true が保持される。',
  },
];

function buildPersistState({
  autoSyncEnabled = false,
  currentView = 'dashboard',
} = {}) {
  return {
    state: {
      currentView,
      selectedFile: null,
      expandedFolders: [],
      userProfile: null,
      autoSyncEnabled,
      windowSize: { width: 1440, height: 1600 },
      isNavExpanded: true,
      permissionHistory: [],
      notifications: [],
    },
    version: 0,
  };
}

async function waitForServer(url, timeoutMs = 60_000) {
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
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

function createInitScript() {
  const initialPersist = buildPersistState();

  return ({ persistState }) => {
    const persistKey = 'knowledge-studio-store';
    const storedState = persistState ?? initialPersist;
    const nowIso = () => new Date().toISOString();

    window.localStorage.setItem('dev-skip-auth', 'true');
    window.localStorage.setItem(persistKey, JSON.stringify(storedState));

    const mockUser = {
      id: 'phase11-user',
      email: 'phase11@example.com',
      displayName: 'Phase 11 Reviewer',
      avatarUrl: null,
      provider: 'google',
      createdAt: nowIso(),
      lastSignInAt: nowIso(),
    };

    const readPersist = () => {
      const raw = window.localStorage.getItem(persistKey);
      return raw ? JSON.parse(raw) : null;
    };

    const readAutoSync = () => Boolean(readPersist()?.state?.autoSyncEnabled);

    window.__APP_DEBUG_LOCALSTORAGE_PHASE11__ = {
      readPersist,
      readAutoSync,
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
      theme: {
        get: async () => ({
          success: true,
          data: { mode: 'dark', resolvedTheme: 'dark' },
        }),
        set: async ({ mode }) => ({
          success: true,
          data: {
            mode,
            resolvedTheme: mode === 'system' ? 'dark' : mode,
          },
        }),
        getSystem: async () => ({
          success: true,
          data: { isDark: true, resolvedTheme: 'dark' },
        }),
        onSystemChanged: () => () => {},
      },
      authMode: {
        get: async () => ({ success: true, data: { mode: 'subscription' } }),
        set: async () => ({ success: true }),
        status: async () => ({
          success: true,
          data: {
            mode: 'subscription',
            isValid: true,
            hasCredentials: true,
            message: 'Claude Code CLI の認証情報を使用できます',
            lastCheckedAt: Date.now(),
          },
        }),
        validate: async () => ({
          success: true,
          data: {
            mode: 'subscription',
            isValid: true,
            hasCredentials: true,
            message: 'Claude Code CLI の認証情報を使用できます',
            lastCheckedAt: Date.now(),
          },
        }),
        onModeChanged: () => () => {},
      },
      profile: {
        get: async () => ({
          success: true,
          data: {
            id: mockUser.id,
            email: mockUser.email,
            displayName: mockUser.displayName,
            avatarUrl: null,
            linkedProviders: ['google'],
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
              provider: 'google',
              providerId: 'google-phase11',
              email: mockUser.email,
              displayName: mockUser.displayName,
              avatarUrl: null,
              linkedAt: nowIso(),
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
            linkedProviders: ['google'],
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
          data: {
            providers: [
              {
                provider: 'anthropic',
                displayName: 'Anthropic',
                status: 'registered',
                lastValidatedAt: nowIso(),
              },
            ],
          },
        }),
        validate: async () => ({
          success: true,
          data: { status: 'valid', message: 'APIキーは有効です' },
        }),
        save: async () => ({ success: true }),
        delete: async () => ({ success: true }),
      },
      dialog: {
        showOpenDialog: async () => ({ canceled: true, filePaths: [] }),
      },
      system: {
        getVersion: async () => ({
          success: true,
          data: { version: 'phase11-mock' },
        }),
      },
    };
  };
}

async function waitForShellReady(page) {
  await page.getByRole('navigation', { name: 'Main navigation' }).waitFor({
    timeout: 20_000,
  });
}

async function waitForSettingsView(page) {
  await page.getByTestId('settings-view').waitFor({ timeout: 20_000 });
  await page.getByRole('heading', { name: '設定', exact: true }).waitFor({
    timeout: 20_000,
  });
}

async function setPersistCurrentView(page, currentView) {
  await page.evaluate((nextView) => {
    const persistKey = 'knowledge-studio-store';
    const raw = window.localStorage.getItem(persistKey);
    if (!raw) {
      throw new Error(`${persistKey} is not available`);
    }

    const parsed = JSON.parse(raw);
    parsed.state.currentView = nextView;
    window.localStorage.setItem(persistKey, JSON.stringify(parsed));
  }, currentView);
}

async function reloadIntoSettings(page) {
  await setPersistCurrentView(page, 'settings');
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
  await waitForShellReady(page);
  await waitForSettingsView(page);
}

function attachConsoleObservers(page, consoleMessages, repeatedConsoleMessageCounts) {
  page.on('console', (msg) => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    const repeatCount = (repeatedConsoleMessageCounts.get(text) ?? 0) + 1;
    repeatedConsoleMessageCounts.set(text, repeatCount);

    if (text.includes('[AuthModeSlice] Listener already registered, skipping')) {
      if (repeatCount <= 3) {
        process.stdout.write(`[page:${msg.type()}] ${text}\n`);
      } else if (repeatCount === 4) {
        process.stdout.write(
          '[page:log] [AuthModeSlice] Listener already registered, skipping (suppressed)\n',
        );
      }
      return;
    }

    process.stdout.write(`[page:${msg.type()}] ${text}\n`);
  });

  page.on('pageerror', (error) => {
    process.stderr.write(`[pageerror] ${error.stack ?? error.message}\n`);
  });
}

async function focusAutoSync(page) {
  const checkbox = page.getByLabel('自動同期を有効にする');
  await checkbox.scrollIntoViewIfNeeded();
  return checkbox;
}

async function capture(page, tc, file, note) {
  const targetPath = path.join(screenshotDir, file);
  await page.screenshot({ path: targetPath, fullPage: true });
  const stat = await fs.stat(targetPath);
  return {
    tc,
    file,
    note,
    path: targetPath,
    capturedAt: stat.mtime.toISOString(),
  };
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });

  const server = spawn(
    'pnpm',
    ['exec', 'vite', '--config', 'vite.e2e.config.ts', '--port', port, '--strictPort'],
    {
      cwd: desktopRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  server.stdout.on('data', (chunk) => process.stdout.write(`[vite] ${chunk}`));
  server.stderr.on('data', (chunk) => process.stderr.write(`[vite] ${chunk}`));

  const consoleMessages = [];
  const repeatedConsoleMessageCounts = new Map();

  try {
    await waitForServer(baseUrl);

    const browser = await chromium.launch();
    const rootContext = await browser.newContext({
      viewport: { width: 1440, height: 1600 },
      deviceScaleFactor: 2,
    });
    await rootContext.addInitScript(createInitScript(), {
      persistState: buildPersistState(),
    });

    const rootPage = await rootContext.newPage();
    attachConsoleObservers(rootPage, consoleMessages, repeatedConsoleMessageCounts);

    await rootPage.goto(appUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    await rootPage.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
    await waitForShellReady(rootPage);
    const initialNavigationType = await rootPage.evaluate(
      () => performance.getEntriesByType('navigation')[0]?.type ?? 'unknown',
    );

    const settingsContext = await browser.newContext({
      viewport: { width: 1440, height: 1600 },
      deviceScaleFactor: 2,
    });

    const page = await settingsContext.newPage();
    attachConsoleObservers(page, consoleMessages, repeatedConsoleMessageCounts);

    await page.goto(harnessUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 90_000,
    });
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
    await page
      .getByTestId('phase11-app-debug-localstorage-clear-harness')
      .waitFor({ timeout: 20_000 });
    await waitForShellReady(page);
    await waitForSettingsView(page);
    await focusAutoSync(page);

    const metadata = [];
    metadata.push(
      await capture(page, screenshots[0].tc, screenshots[0].file, screenshots[0].note),
    );

    const autoSyncCheckbox = await focusAutoSync(page);
    await autoSyncCheckbox.check();
    await page.waitForFunction(
      () => {
        const raw = window.localStorage.getItem('knowledge-studio-store');
        if (!raw) return false;
        try {
          return JSON.parse(raw)?.state?.autoSyncEnabled === true;
        } catch {
          return false;
        }
      },
      { timeout: 20_000 },
    );
    metadata.push(
      await capture(page, screenshots[1].tc, screenshots[1].file, screenshots[1].note),
    );

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90_000 });
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
    await page
      .getByTestId('phase11-app-debug-localstorage-clear-harness')
      .waitFor({ timeout: 20_000 });
    await waitForShellReady(page);
    await waitForSettingsView(page);
    const reloadedCheckbox = await focusAutoSync(page);
    await page.waitForFunction(
      () => {
        const raw = window.localStorage.getItem('knowledge-studio-store');
        if (!raw) return false;
        try {
          return JSON.parse(raw)?.state?.autoSyncEnabled === true;
        } catch {
          return false;
        }
      },
      { timeout: 20_000 },
    );

    if (!(await reloadedCheckbox.isChecked())) {
      throw new Error('autoSyncEnabled checkbox was not restored after reload');
    }

    metadata.push(
      await capture(page, screenshots[2].tc, screenshots[2].file, screenshots[2].note),
    );

    const storageSnapshot = await page.evaluate(() => {
      const raw = window.localStorage.getItem('knowledge-studio-store');
      return raw ? JSON.parse(raw) : null;
    });

    const debugLogDetected = consoleMessages.some((entry) =>
      entry.text.includes('Clearing all storage for clean auth test'),
    );

    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          baseUrl,
          appUrl,
          harnessUrl,
          screenshots: metadata,
          initialNavigationType,
          storageSnapshot,
          skipAuthCompatibility: 'PASS',
          debugLogDetected,
          repeatedConsoleMessageCounts: Object.fromEntries(
            [...repeatedConsoleMessageCounts.entries()].filter(
              ([, count]) => count > 1,
            ),
          ),
          consoleMessages,
        },
        null,
        2,
      ),
      'utf8',
    );

    if (debugLogDetected) {
      throw new Error('debug storage clear log was detected during capture');
    }

    await settingsContext.close();
    await rootContext.close();
    await browser.close();
    process.stdout.write(`Saved screenshots to ${screenshotDir}\n`);
  } finally {
    server.kill('SIGTERM');
  }
}

main().catch((error) => {
  console.error('[capture-task-fix-app-debug-localstorage-clear-phase11] failed', error);
  process.exit(1);
});
