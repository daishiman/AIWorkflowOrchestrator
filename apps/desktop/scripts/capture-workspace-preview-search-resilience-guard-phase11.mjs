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
  "docs/30-workflows/workspace-preview-search-resilience-guard",
);
const screenshotDir = path.join(workflowRoot, "outputs/phase-11/screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const buildOutputDir = path.join(desktopRoot, "out", "renderer");
const harnessPath = "/?phase11Harness=workspace-layout&skipAuth=true";
const defaultBaseUrl = "http://127.0.0.1:4173";
const baseUrl = process.env.PHASE11_BASE_URL ?? defaultBaseUrl;

const scenarios = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-quick-search-results.png",
    viewport: { width: 1600, height: 1000 },
    theme: "light",
    mode: "default",
    run: async (page) => {
      await openPanels(page);
      await page.keyboard.press("Control+P");
      await page
        .getByRole("dialog", { name: "ファイルをすばやく探す" })
        .waitFor();
      await page.getByTestId("quick-file-search-input").fill("config");
      await page.waitForTimeout(150);
      await page.getByTestId("quick-file-search-item-0").waitFor();
    },
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-quick-search-no-match-dark.png",
    viewport: { width: 1600, height: 1000 },
    theme: "dark",
    mode: "default",
    run: async (page) => {
      await openPanels(page);
      await page.keyboard.press("Control+P");
      await page
        .getByRole("dialog", { name: "ファイルをすばやく探す" })
        .waitFor();
      await page.getByTestId("quick-file-search-input").fill("zzz-no-hit");
      await page.getByTestId("quick-file-search-empty-state").waitFor();
    },
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-quick-search-select-preview.png",
    viewport: { width: 1600, height: 1000 },
    theme: "light",
    mode: "default",
    run: async (page) => {
      await openPanels(page);
      await page.keyboard.press("Control+P");
      await page
        .getByRole("dialog", { name: "ファイルをすばやく探す" })
        .waitFor();
      await page.getByTestId("quick-file-search-input").fill("app");
      await page.waitForTimeout(150);
      await page.keyboard.press("Enter");
      await page.getByTestId("source-view").waitFor();
    },
  },
  {
    tc: "TC-11-04",
    file: "TC-11-04-structured-preview-fallback.png",
    viewport: { width: 1600, height: 1000 },
    theme: "light",
    mode: "default",
    run: async (page) => {
      await openPanels(page);
      await page.getByTestId("workspace-treeitem-file-invalid-json").click();
      await page.getByTestId("preview-tab-preview").click();
      await page.getByTestId("preview-structured-fallback-alert").waitFor();
    },
  },
  {
    tc: "TC-11-05",
    file: "TC-11-05-preview-timeout-alert.png",
    viewport: { width: 1600, height: 1000 },
    theme: "light",
    mode: "timeout",
    run: async (page) => {
      await openPanels(page);
      await page.getByTestId("workspace-treeitem-file-hanging").click();
      await page.getByTestId("preview-alert").waitFor({ timeout: 25_000 });
    },
  },
];

async function openPanels(page) {
  await page.getByTestId("workspace-toggle-file").click();
  await page.getByTestId("workspace-file-panel").waitFor();
  await page.getByTestId("workspace-toggle-preview").click();
  await page.getByTestId("workspace-preview-panel").waitFor();
}

function createMockScript() {
  return ({ mode, theme }) => {
    const now = new Date().toISOString();
    const files = {
      "/workspace/src/app.ts": {
        content: "const app = true;\nconsole.log(app);\n",
        size: 35,
      },
      "/workspace/README.md": {
        content: "# Workspace Preview\n\nThis is a preview harness.\n",
        size: 48,
      },
      "/workspace/config.yaml": {
        content: "name: workspace\npreview: true\nquickSearch: true\n",
        size: 49,
      },
      "/workspace/invalid.json": {
        content: '{\n  "items":\n',
        size: 14,
      },
      "/workspace/hanging.md": {
        content: "# never returned\n",
        size: 17,
      },
    };

    const tree = [
      {
        id: "folder-src",
        name: "src",
        type: "folder",
        path: "/workspace/src",
        children: [
          {
            id: "file-app",
            name: "app.ts",
            type: "file",
            path: "/workspace/src/app.ts",
          },
        ],
      },
      {
        id: "file-readme",
        name: "README.md",
        type: "file",
        path: "/workspace/README.md",
      },
      {
        id: "file-config",
        name: "config.yaml",
        type: "file",
        path: "/workspace/config.yaml",
      },
      {
        id: "file-invalid-json",
        name: "invalid.json",
        type: "file",
        path: "/workspace/invalid.json",
      },
      {
        id: "file-hanging",
        name: "hanging.md",
        type: "file",
        path: "/workspace/hanging.md",
      },
    ];

    const persistedWorkspace = {
      version: 1,
      folders: [
        {
          id: "folder-1",
          path: "/workspace",
          displayName: "workspace",
          isExpanded: true,
          expandedPaths: [],
          addedAt: now,
        },
      ],
      lastSelectedFilePath: null,
      updatedAt: now,
    };

    window.__PHASE11_WORKSPACE_LAYOUT_HARNESS__ = {
      theme,
    };

    window.electronAPI = {
      workspace: {
        load: async () => ({ success: true, data: persistedWorkspace }),
        save: async () => ({ success: true }),
        addFolder: async () => ({
          success: false,
          error: { code: "CANCELED", message: "capture mode" },
        }),
        removeFolder: async () => ({ success: true }),
        validatePaths: async ({ paths }) => ({
          success: true,
          data: {
            validPaths: paths,
            invalidPaths: [],
          },
        }),
      },
      file: {
        getTree: async () => ({ success: true, data: tree }),
        read: async ({ filePath }) => {
          if (mode === "timeout" && filePath === "/workspace/hanging.md") {
            return new Promise(() => {});
          }

          const matched = files[filePath];
          if (!matched) {
            return { success: false, error: "file-not-found" };
          }

          return {
            success: true,
            data: {
              content: matched.content,
              metadata: {
                size: matched.size,
                lastModified: now,
                encoding: "utf-8",
              },
            },
          };
        },
        write: async () => ({ success: true }),
        rename: async () => ({ success: true }),
        watchStart: async () => ({ success: true, watchId: "watch-1" }),
        watchStop: async () => ({ success: true }),
        onChanged: () => () => {},
      },
      store: {
        get: async () => ({ success: true, data: null }),
        set: async () => ({ success: true }),
      },
      app: {
        getVersion: async () => ({ success: true, data: "1.0.0" }),
        onMenuAction: () => () => {},
      },
      theme: {
        get: async () => ({
          success: true,
          data: {
            mode: theme,
            resolvedTheme: theme,
          },
        }),
        set: async () => ({ success: true }),
        getSystem: async () => ({ success: true, data: { theme } }),
        onSystemChanged: () => () => {},
      },
      auth: {
        checkOnline: async () => ({ success: true, data: { online: true } }),
        getSession: async () => ({ success: false, error: { code: "NO_SESSION" } }),
        login: async () => ({ success: true }),
        logout: async () => ({ success: true }),
        refresh: async () => ({ success: true }),
        onAuthStateChanged: () => () => {},
      },
    };
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

  throw new Error(`Timed out waiting for static server: ${url}`);
}

async function isServerReachable(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

async function stopServer(server, timeoutMs = 5_000) {
  if (!server || server.killed) {
    return;
  }

  const waitForExit = new Promise((resolve) => {
    server.once("exit", resolve);
  });

  server.kill("SIGTERM");

  const didExit = await Promise.race([
    waitForExit.then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), timeoutMs)),
  ]);

  if (!didExit) {
    server.kill("SIGKILL");
    await waitForExit;
  }
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });

  let server = null;
  const reuseExistingServer = await isServerReachable(baseUrl);

  if (!reuseExistingServer) {
    await fs.access(buildOutputDir);

    server = spawn(
      "python3",
      [
        "-m",
        "http.server",
        String(new URL(baseUrl).port || 4173),
        "--bind",
        new URL(baseUrl).hostname || "127.0.0.1",
        "--directory",
        buildOutputDir,
      ],
      {
        cwd: repoRoot,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    server.stdout.on("data", (chunk) => {
      process.stdout.write(chunk);
    });
    server.stderr.on("data", (chunk) => {
      process.stderr.write(chunk);
    });
  }

  const capturedAt = new Date().toISOString();
  const metadata = {
    workflow: workflowRoot,
    capturedAt,
    baseUrl,
    harnessPath,
    buildOutputDir,
    sourceKind: reuseExistingServer
      ? "external-dev-server"
      : "auto-static-server-current-build",
    screenshots: [],
  };

  let browser;

  try {
    await waitForServer(baseUrl);
    browser = await chromium.launch({ headless: true });

    for (const scenario of scenarios) {
      const context = await browser.newContext({
        viewport: scenario.viewport,
        colorScheme: scenario.theme,
      });
      const page = await context.newPage();

      await page.addInitScript(createMockScript(), {
        mode: scenario.mode,
        theme: scenario.theme,
      });
      await page.goto(`${baseUrl}${harnessPath}`, {
        waitUntil: "domcontentloaded",
      });
      await page.getByTestId("workspace-view").waitFor();

      await scenario.run(page);

      const target = path.join(screenshotDir, scenario.file);
      await page.screenshot({ path: target, fullPage: true });

      metadata.screenshots.push({
        tc: scenario.tc,
        file: scenario.file,
        viewport: scenario.viewport,
        theme: scenario.theme,
        mode: scenario.mode,
      });

      await context.close();
    }

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  } finally {
    if (browser) {
      await browser.close();
    }
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error("[capture-workspace-preview-search-resilience-guard-phase11]", error);
  process.exitCode = 1;
});
