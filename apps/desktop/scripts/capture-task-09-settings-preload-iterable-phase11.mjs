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
const workflowRoot = path.join(repoRoot, 'docs/30-workflows/09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001');
const screenshotDir = path.join(workflowRoot, 'outputs/phase-11/screenshots');
const metadataPath = path.join(screenshotDir, 'phase11-capture-metadata.json');
const port = '5179';
const baseUrl = `http://localhost:${port}`;

const scenarios = [
  { id: 'TC-11-01', file: 'TC-11-01-settings-apikey-normal.png', mode: 'normal', note: '正常系: providers配列を表示' },
  { id: 'TC-11-02', file: 'TC-11-02-settings-apikey-api-missing.png', mode: 'missingApi', note: '異常系: apiKey APIなしでエラー表示' },
  { id: 'TC-11-03', file: 'TC-11-03-settings-apikey-nonarray-providers.png', mode: 'nonArrayProviders', note: '異常系: providers非配列でフォールバック' },
];

function createMockScript() {
  return ({ mode }) => {
    const now = new Date().toISOString();
    const mockUser = {
      id: 'phase11-user',
      email: 'phase11@example.com',
      displayName: 'Phase11 Reviewer',
      avatarUrl: '',
      provider: 'google',
      createdAt: now,
      lastSignInAt: now,
    };
    const baseApiKey = {
      list: async () => ({
        success: true,
        data: {
          providers: [
            { provider: 'openai', configured: true, maskedKey: 'sk-***', updatedAt: now },
            { provider: 'anthropic', configured: false, maskedKey: null, updatedAt: null },
          ],
        },
      }),
      validate: async () => ({ success: true, data: { status: 'valid', message: 'ok' } }),
      save: async () => ({ success: true }),
      delete: async () => ({ success: true }),
    };

    let apiKey = baseApiKey;
    if (mode === 'missingApi') apiKey = undefined;
    if (mode === 'nonArrayProviders') {
      apiKey = { ...baseApiKey, list: async () => ({ success: true, data: { providers: 'broken-shape' } }) };
    }

    window.electronAPI = {
      auth: {
        checkOnline: async () => ({ success: true, data: { online: true } }),
        getSession: async () => ({ success: true, data: { user: mockUser, expiresAt: Date.now() + 3600000, isOffline: false } }),
        onAuthStateChanged: (cb) => { setTimeout(() => cb({ authenticated: true, user: mockUser, isOffline: false }), 10); return () => {}; },
        login: async () => ({ success: true }),
        logout: async () => ({ success: true }),
        refresh: async () => ({ success: true }),
      },
      theme: {
        get: async () => ({ success: true, data: { mode: 'dark', resolvedTheme: 'dark' } }),
        set: async () => ({ success: true, data: {} }),
        getSystem: async () => ({ success: true, data: { isDark: true, resolvedTheme: 'dark' } }),
        onSystemChanged: () => () => {},
      },
      profile: {
        get: async () => ({ success: true, data: { id: mockUser.id, email: mockUser.email, displayName: mockUser.displayName, avatarUrl: null, linkedProviders: ['google'], notificationSettings: { email: true, desktop: true, sound: true, workflowComplete: true, workflowError: true } } }),
        getProviders: async () => ({ success: true, data: [] }),
        update: async () => ({ success: true, data: {} }),
        linkProvider: async () => ({ success: true }),
        unlinkProvider: async () => ({ success: true }),
        delete: async () => ({ success: true }),
      },
      apiKey,
      authMode: {
        get: async () => ({ success: true, data: { mode: 'api-key' } }),
        status: async () => ({ success: true, data: { mode: 'api-key', isValid: true, hasCredentials: true, message: 'APIキー認証', lastCheckedAt: Date.now() } }),
        validate: async () => ({ success: true, data: { mode: 'api-key', isValid: true, hasCredentials: true, message: 'APIキー認証', lastCheckedAt: Date.now() } }),
        onModeChanged: () => () => {},
        set: async () => ({ success: true }),
      },
      dialog: { showOpenDialog: async () => ({ canceled: true, filePaths: [] }) },
      file: { selectFiles: async () => [], selectFolder: async () => null },
      invoke: async () => ({ success: true }),
    };

    window.localStorage.setItem('debug-clear-storage', 'done');
    window.localStorage.setItem('knowledge-studio-store', JSON.stringify({ state: { currentView: 'settings' }, version: 0 }));
  };
}

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try { const res = await fetch(url); if (res.ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });
  const server = spawn('pnpm', ['exec', 'vite', '--config', 'vite.e2e.config.ts', '--port', port, '--strictPort'], { cwd: desktopRoot, stdio: ['ignore', 'pipe', 'pipe'] });
  server.stdout.on('data', (d) => process.stdout.write(d));
  server.stderr.on('data', (d) => process.stderr.write(d));

  try {
    await waitForServer(baseUrl);
    const browser = await chromium.launch({ headless: true });
    const results = [];
    for (const scenario of scenarios) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
      await context.addInitScript(createMockScript(), { mode: scenario.mode });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      const out = path.join(screenshotDir, scenario.file);
      await page.screenshot({ path: out, fullPage: true });
      const stat = await fs.stat(out);
      results.push({ tc: scenario.id, file: scenario.file, note: scenario.note, capturedAt: stat.mtime.toISOString() });
      await context.close();
      process.stdout.write(`Captured ${scenario.id}: ${out}\n`);
    }
    await browser.close();
    await fs.writeFile(metadataPath, JSON.stringify({ capturedAt: new Date().toISOString(), baseUrl, scenarios: results }, null, 2));
  } finally {
    server.kill('SIGTERM');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
