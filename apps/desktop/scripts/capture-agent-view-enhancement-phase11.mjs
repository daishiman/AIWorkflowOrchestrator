import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const repoRoot = '/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260307-073000-wt2';
const desktopRoot = path.join(repoRoot, 'apps/desktop');
const screenshotDir = path.join(repoRoot, 'docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-11/screenshots');
const baseUrl = 'http://127.0.0.1:4173/?skipAuth=true';

const makeSkills = (count) => Array.from({ length: count }).map((_, i) => ({
  id: `skill-${i+1}`,
  name: `skill-${i+1}`,
  description: `skill ${i+1}`,
  category: 'analysis',
  tags: ['phase11'],
  path: `.claude/skills/skill-${i+1}/SKILL.md`,
  status: 'active',
  version: '1.0.0',
  createdAt: new Date('2026-03-07T00:00:00.000Z').toISOString(),
  updatedAt: new Date('2026-03-07T00:00:00.000Z').toISOString(),
}));

function initScript({ skillCount }) {
  const skills = makeSkills(skillCount);
  return ({ skills }) => {
    sessionStorage.setItem('debug-clear-storage', 'done');
    localStorage.setItem('dev-skip-auth', 'true');
    const mockUser = {
      id: 'phase11-user',
      email: 'phase11@example.com',
      displayName: 'Phase11 User',
      avatarUrl: null,
      provider: 'google',
      createdAt: new Date('2026-03-07T00:00:00.000Z').toISOString(),
      lastSignInAt: new Date('2026-03-07T00:00:00.000Z').toISOString(),
    };

    window.electronAPI = {
      auth: {
        checkOnline: async () => ({ success: true, data: { online: true } }),
        getSession: async () => ({ success: true, data: { user: mockUser, expiresAt: Date.now() + 86400000, isOffline: false } }),
        onAuthStateChanged: (cb) => { setTimeout(() => cb({ authenticated: true, user: mockUser, isOffline: false }), 10); return () => undefined; },
        login: async () => ({ success: true }),
        logout: async () => ({ success: true, data: {} }),
        refresh: async () => ({ success: true, data: {} }),
      },
      theme: {
        get: async () => ({ success: true, data: { mode: 'light', resolvedTheme: 'light' } }),
        set: async (request) => ({ success: true, data: { mode: request.mode, resolvedTheme: request.mode === 'dark' ? 'dark' : 'light' } }),
        getSystem: async () => ({ success: true, data: { isDark: false, resolvedTheme: 'light' } }),
        onSystemChanged: () => () => undefined,
      },
      profile: { get: async () => ({ success: true, data: null }), getProviders: async () => ({ success: true, data: [] }), update: async () => ({ success: true, data: {} }), linkProvider: async () => ({ success: true, data: {} }), unlinkProvider: async () => ({ success: true, data: {} }), delete: async () => ({ success: true, data: {} }) },
      avatar: { upload: async () => ({ success: true, data: {} }), useProvider: async () => ({ success: true, data: {} }), remove: async () => ({ success: true, data: {} }) },
      notification: { getHistory: async () => ({ success: true, data: { notifications: [], totalCount: 0 } }), markRead: async () => ({ success: true, data: { updated: true } }), markAllRead: async () => ({ success: true, data: { updatedCount: 0 } }), clear: async () => ({ success: true, data: { deletedCount: 0 } }), onNew: () => () => undefined },
      historySearch: { search: async () => ({ success: true, data: { items: [], totalCount: 0, hasMore: false } }), getStats: async () => ({ success: true, data: { chat: 0, file: 0, skill: 0, total: 0 } }) },
      skill: {
        list: async () => skills,
        getImported: async () => skills,
        import: async () => ({ success: true }),
        remove: async () => ({ success: true }),
        rescan: async () => skills,
        execute: async () => ({ success: true, data: { executionId: 'exec-1' } }),
      },
      llm: { listProviders: async () => ({ success: true, data: [] }), getCurrentModel: async () => ({ success: true, data: null }), selectModel: async () => ({ success: true, data: {} }) },
      permissions: { getMode: async () => ({ success: true, data: 'default' }), setMode: async () => ({ success: true, data: {} }), getRemembered: async () => ({ success: true, data: [] }), clearRemembered: async () => ({ success: true, data: {} }) },
    };
  };
}

async function waitForServer(url, timeoutMs = 60000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('server timeout');
}

async function openAgent(page) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('nav[aria-label="Main navigation"]', { timeout: 60000 });
  await page.keyboard.press('Control+4');
  await page.waitForSelector('[data-testid="agent-view"]', { timeout: 30000 });
  await page.waitForTimeout(500);
}

async function captureScenario(browser, name, opts) {
  const context = await browser.newContext({ viewport: opts.viewport || { width: 1440, height: 900 }, colorScheme: opts.colorScheme || 'light' });
  await context.addInitScript(initScript({ skillCount: opts.skillCount }), { skills: makeSkills(opts.skillCount) });
  const page = await context.newPage();
  await openAgent(page);
  if (opts.openSettings) {
    await page.getByRole('button', { name: '詳細設定' }).click();
    await page.waitForSelector('[data-testid="advanced-settings-panel"]', { timeout: 15000 });
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: path.join(screenshotDir, name), fullPage: true });
  await context.close();
}

async function main() {
  await mkdir(screenshotDir, { recursive: true });
  const server = spawn('pnpm', ['exec', 'vite', '--config', 'vite.e2e.config.ts', '--port', '4173', '--strictPort', '--host', '127.0.0.1'], {
    cwd: desktopRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', (d) => process.stdout.write(d));
  server.stderr.on('data', (d) => process.stderr.write(d));
  try {
    await waitForServer('http://127.0.0.1:4173');
    const browser = await chromium.launch({ headless: true });
    await captureScenario(browser, 'TC-01-main-view-light.png', { skillCount: 3, colorScheme: 'light' });
    await captureScenario(browser, 'TC-06-panel-open-light.png', { skillCount: 3, colorScheme: 'light', openSettings: true });
    await captureScenario(browser, 'TC-08-empty-state-light.png', { skillCount: 0, colorScheme: 'light' });
    await captureScenario(browser, 'TC-09-with-search-light.png', { skillCount: 11, colorScheme: 'light' });
    await captureScenario(browser, 'TC-11-main-view-dark.png', { skillCount: 3, colorScheme: 'dark' });
    await browser.close();
    console.log('captured screenshots for agent-view-enhancement');
  } finally {
    server.kill('SIGTERM');
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
