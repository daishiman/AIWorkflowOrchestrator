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
const workflowDir = path.join(
  repoRoot,
  "docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE",
);
const phase11Dir = path.join(workflowDir, "outputs/phase-11");
const screenshotDir = path.join(phase11Dir, "screenshots");
const metadataPath = path.join(phase11Dir, "phase11-capture-metadata.json");
const port = Number(process.env.CHATVIEW_ERROR_SCREENSHOT_PORT ?? "4173");
const baseUrl = `http://127.0.0.1:${port}/?skipAuth=true`;

const mockUser = {
  id: "phase11-user",
  email: "phase11@example.com",
  displayName: "Phase11 User",
  avatarUrl: null,
  provider: "google",
  createdAt: "2026-03-20T00:00:00.000Z",
  lastSignInAt: "2026-03-20T00:00:00.000Z",
};

function createPersistedStore(theme) {
  return {
    state: {
      currentView: "dashboard",
      viewHistory: ["dashboard"],
      themeMode: theme,
      resolvedTheme: theme,
      expandedFolders: [],
      userProfile: { name: "Phase11 User" },
      autoSyncEnabled: false,
      windowSize: { width: 1440, height: 960 },
      isNavExpanded: true,
      permissionHistory: [],
      notifications: [],
    },
    version: 0,
  };
}

function createMockScript(theme, errorCode) {
  return `
    (() => {
      const theme = ${JSON.stringify(theme)};
      const errorCode = ${JSON.stringify(errorCode)};
      const storeKey = "knowledge-studio-store";
      const onboardingState = {
        "onboarding.hasCompleted": true,
        "onboarding.userName": "Phase11 User",
        "onboarding.selectedStarterTool": "chat",
        "onboarding.lastCompletedAt": "2026-03-20T00:00:00.000Z"
      };
      localStorage.setItem("dev-skip-auth", "true");
      localStorage.setItem(storeKey, JSON.stringify(${JSON.stringify(createPersistedStore(theme))}));
      localStorage.setItem("phase11-theme", theme);

      const sessionData = {
        user: ${JSON.stringify(mockUser)},
        expiresAt: Date.now() + 60 * 60 * 1000,
        isOffline: false,
      };

      const emptySuccess = { success: true, data: {} };

      window.electronAPI = {
        auth: {
          checkOnline: async () => ({ success: true, data: { online: true } }),
          getSession: async () => ({ success: true, data: sessionData }),
          onAuthStateChanged: () => () => {},
          getProfile: async () => ({
            success: true,
            data: {
              id: sessionData.user.id,
              displayName: sessionData.user.displayName,
              avatarUrl: null,
              linkedProviders: [],
            },
          }),
          getLinkedProviders: async () => ({ success: true, data: [] }),
        },
        theme: {
          get: async () => ({
            success: true,
            data: { mode: theme, resolvedTheme: theme },
          }),
          getSystem: async () => ({ success: true, data: { theme } }),
          set: async () => emptySuccess,
          onSystemChanged: () => () => {},
        },
        store: {
          get: async ({ key, defaultValue }) => ({
            success: true,
            data: key in onboardingState ? onboardingState[key] : (defaultValue ?? null),
          }),
          set: async () => emptySuccess,
        },
        ai: {
          chat: async () => ({ success: false, error: errorCode }),
        },
      };
    })();
  `;
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
  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

async function takeScreenshot(page, name) {
  const outputPath = path.join(screenshotDir, name);
  await page.screenshot({ path: outputPath, fullPage: true });
  return outputPath;
}

async function openChatView(browser, theme, errorCode) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    colorScheme: theme,
  });
  await context.addInitScript(createMockScript(theme, errorCode));
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const chatView = page.locator('[data-testid="chat-view"]');
  if (!(await chatView.isVisible().catch(() => false))) {
    await page.getByRole("button", { name: "チャット" }).click();
  }
  await page.waitForSelector('[data-testid="chat-view"]', { timeout: 30_000 });
  return { context, page };
}

async function triggerError(page, message = "phase11 error check") {
  await page.getByLabel("チャットメッセージ入力").fill(message);
  await page.getByLabel("送信").click();
  await page.waitForSelector('[role="alert"]', { timeout: 15_000 });
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });

  const viteCommand =
    process.platform === "darwin"
      ? {
          command: "arch",
          args: [
            "-arm64",
            process.platform === "win32" ? "npx.cmd" : "npx",
            "vite",
            "--config",
            "vite.e2e.config.ts",
            "--host",
            "127.0.0.1",
            "--port",
            String(port),
          ],
        }
      : {
          command: process.platform === "win32" ? "npx.cmd" : "npx",
          args: [
            "vite",
            "--config",
            "vite.e2e.config.ts",
            "--host",
            "127.0.0.1",
            "--port",
            String(port),
          ],
        };

  const vite = spawn(viteCommand.command, viteCommand.args, {
    cwd: desktopRoot,
    env: {
      ...process.env,
      VITE_E2E_MODE: "true",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const viteLogs = [];
  vite.stdout.on("data", (chunk) => viteLogs.push(chunk.toString()));
  vite.stderr.on("data", (chunk) => viteLogs.push(chunk.toString()));

  let browser;
  const captured = [];
  try {
    await waitForServer(`http://127.0.0.1:${port}`);
    browser = await chromium.launch({ headless: true });

    {
      const { context, page } = await openChatView(
        browser,
        "light",
        "API_KEY_MISSING",
      );
      captured.push(
        path.basename(await takeScreenshot(page, "TC-11-01-default-light.png")),
      );
      await triggerError(page);
      captured.push(
        path.basename(
          await takeScreenshot(page, "TC-11-02-api-key-missing-light.png"),
        ),
      );
      await page.getByRole("button", { name: "エラーを閉じる" }).click();
      await page.waitForTimeout(250);
      captured.push(
        path.basename(
          await takeScreenshot(page, "TC-11-03-error-dismissed-light.png"),
        ),
      );
      await context.close();
    }

    {
      const { context, page } = await openChatView(
        browser,
        "dark",
        "API_KEY_MISSING",
      );
      await triggerError(page, "phase11 dark mode");
      captured.push(
        path.basename(
          await takeScreenshot(page, "TC-11-04-api-key-missing-dark.png"),
        ),
      );
      await page.waitForTimeout(5250);
      captured.push(
        path.basename(
          await takeScreenshot(page, "TC-11-05-auto-cleared-dark.png"),
        ),
      );
      await context.close();
    }

    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          workflowDir,
          screenshotDir,
          baseUrl,
          files: captured,
        },
        null,
        2,
      ),
      "utf8",
    );

    process.stdout.write(
      `[capture-chatview-error-silent-failure-phase11] captured ${captured.length} screenshots in ${screenshotDir}\n`,
    );
  } finally {
    if (browser) {
      await browser.close();
    }
    vite.kill("SIGTERM");
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (vite.exitCode === null) {
      vite.kill("SIGKILL");
    }
    if (viteLogs.length > 0) {
      await fs.writeFile(
        path.join(phase11Dir, "phase11-vite.log"),
        viteLogs.join(""),
        "utf8",
      );
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
