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
  "docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch",
);
const screenshotDir = path.join(workflowRoot, "outputs/phase-11/screenshots");
const buildOutputDir = path.join(desktopRoot, "out", "renderer");
const harnessPath = "/?phase11Harness=workspace-layout&skipAuth=true";
const baseUrl = "http://127.0.0.1:4173";

const scenarios = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-source-view.png",
    viewport: { width: 1600, height: 1000 },
    theme: "light",
    mode: "default",
    run: async (page) => {
      await openPanels(page);
      await page.getByTestId("workspace-treeitem-folder-src").click();
      await page.getByTestId("workspace-treeitem-file-app").click();
      await page.getByTestId("source-view").waitFor();
    },
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-markdown-preview.png",
    viewport: { width: 1600, height: 1000 },
    theme: "light",
    mode: "default",
    run: async (page) => {
      await openPanels(page);
      await page.getByTestId("workspace-treeitem-file-readme").click();
      await page.getByTestId("preview-tab-preview").click();
      await page.getByTestId("markdown-preview").waitFor();
    },
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-html-preview.png",
    viewport: { width: 1600, height: 1000 },
    theme: "light",
    mode: "default",
    run: async (page) => {
      await openPanels(page);
      await page.getByTestId("workspace-treeitem-file-html").click();
      await page.getByTestId("preview-tab-preview").click();
      await page.getByTestId("preview-html-iframe").waitFor();
    },
  },
  {
    tc: "TC-11-04",
    file: "TC-11-04-quick-search-dialog.png",
    viewport: { width: 1600, height: 1000 },
    theme: "light",
    mode: "default",
    run: async (page) => {
      await page.keyboard.press("Control+P");
      await page
        .getByRole("dialog", { name: "ファイルをすばやく探す" })
        .waitFor();
      await page.getByTestId("quick-file-search-input").fill("config");
      await page.waitForTimeout(120);
    },
  },
  {
    tc: "TC-11-05",
    file: "TC-11-05-quick-search-select.png",
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
      await page.waitForTimeout(120);
      await page.keyboard.press("Enter");
      await page
        .getByRole("status")
        .filter({ hasText: "/workspace/config.yaml" })
        .waitFor();
      await page.getByTestId("preview-tab-preview").click();
      await page.getByTestId("structured-preview").waitFor();
    },
  },
  {
    tc: "TC-11-06",
    file: "TC-11-06-quick-search-close.png",
    viewport: { width: 1600, height: 1000 },
    theme: "light",
    mode: "default",
    run: async (page) => {
      await openPanels(page);
      await page.keyboard.press("Control+P");
      const dialog = page.getByRole("dialog", { name: "ファイルをすばやく探す" });
      await dialog.waitFor();
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "hidden" });
      await page.getByTestId("workspace-view").waitFor();
    },
  },
  {
    tc: "TC-11-07",
    file: "TC-11-07-read-error.png",
    viewport: { width: 1600, height: 1000 },
    theme: "light",
    mode: "read-error",
    run: async (page) => {
      await openPanels(page);
      await page.getByTestId("workspace-treeitem-file-broken").click();
      await page.getByTestId("preview-alert").waitFor();
    },
  },
  {
    tc: "TC-11-08",
    file: "TC-11-08-mobile-overlay.png",
    viewport: { width: 390, height: 844 },
    theme: "dark",
    mode: "default",
    run: async (page) => {
      await page.getByTestId("workspace-toggle-preview").click();
      await page.getByRole("dialog", { name: "プレビュー" }).waitFor();
    },
  },
  {
    tc: "TC-11-09",
    file: "TC-11-09-ux-terminology.png",
    viewport: { width: 1600, height: 1000 },
    theme: "light",
    mode: "default",
    run: async (page) => {
      await openPanels(page);
      await page.getByTestId("workspace-treeitem-file-readme").click();
      await page.keyboard.press("Control+P");
      await page
        .getByRole("dialog", { name: "ファイルをすばやく探す" })
        .waitFor();
      await page.getByTestId("preview-toolbar").waitFor();
    },
  },
  {
    tc: "TC-11-10",
    file: "TC-11-10-modal-visual-spec.png",
    viewport: { width: 1600, height: 1000 },
    theme: "light",
    mode: "default",
    run: async (page) => {
      await page.keyboard.press("Control+P");
      await page
        .getByRole("dialog", { name: "ファイルをすばやく探す" })
        .waitFor();
    },
  },
  {
    tc: "TC-11-11",
    file: "TC-11-11-coverage-alignment.png",
    viewport: { width: 1400, height: 900 },
    theme: "light",
    mode: "default",
    skipHarness: true,
    run: async (page) => {
      await page.setContent(`<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>TC-11-11 Coverage Alignment</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f4f4f5; color: #111827; margin: 0; padding: 32px; }
      .card { max-width: 1080px; margin: 0 auto; background: white; border: 1px solid #d4d4d8; border-radius: 24px; padding: 28px; box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08); }
      h1 { margin: 0 0 8px; font-size: 28px; }
      p { margin: 0 0 18px; line-height: 1.6; color: #52525b; }
      table { width: 100%; border-collapse: collapse; font-size: 14px; }
      th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e4e4e7; vertical-align: top; }
      th { color: #3f3f46; font-weight: 600; }
      code { background: #f4f4f5; padding: 2px 6px; border-radius: 999px; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>TC-11-11 Coverage Alignment</h1>
      <p>current build の証跡名と TC-ID の対応を Phase 11 成果物へ固定するためのエビデンス。manual-test-result / screenshot-plan / screenshot-coverage の三者がこの命名規則を共有する。</p>
      <table>
        <thead>
          <tr><th>TC</th><th>PNG</th><th>観点</th></tr>
        </thead>
        <tbody>
          <tr><td>TC-11-01</td><td><code>TC-11-01-source-view.png</code></td><td>Source 表示</td></tr>
          <tr><td>TC-11-04</td><td><code>TC-11-04-quick-search-dialog.png</code></td><td>検索モーダル</td></tr>
          <tr><td>TC-11-09</td><td><code>TC-11-09-ux-terminology.png</code></td><td>Task 5D 語彙</td></tr>
          <tr><td>TC-11-10</td><td><code>TC-11-10-modal-visual-spec.png</code></td><td>幅 / 角丸 / 影</td></tr>
        </tbody>
      </table>
    </div>
  </body>
</html>`);
    },
  },
];

async function openPanels(page) {
  await page.getByTestId("workspace-toggle-file").click();
  await page.getByTestId("workspace-file-panel").waitFor();
  await page.getByTestId("workspace-toggle-preview").click();
  await page.getByTestId("workspace-preview-panel").waitFor();
}

function createMockScript(options) {
  return ({ mode, theme }) => {
    const files = {
      "/workspace/src/app.ts": {
        content: "const app = true;\nconsole.log(app);",
        size: 29,
      },
      "/workspace/README.md": {
        content: "# Workspace\n\n<script>alert('xss')</script>\n\n- preview",
        size: 54,
      },
      "/workspace/index.html": {
        content:
          "<h1>Preview</h1><script>window.__xss = true</script><p>safe paragraph</p>",
        size: 72,
      },
      "/workspace/config.yaml": {
        content: "name: workspace\nfeatures:\n  preview: true\n  quickSearch: true\n",
        size: 68,
      },
      "/workspace/broken.html": {
        content: "<h1>broken</h1>",
        size: 16,
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
        id: "file-html",
        name: "index.html",
        type: "file",
        path: "/workspace/index.html",
      },
      {
        id: "file-config",
        name: "config.yaml",
        type: "file",
        path: "/workspace/config.yaml",
      },
      {
        id: "file-broken",
        name: "broken.html",
        type: "file",
        path: "/workspace/broken.html",
      },
    ];

    const now = new Date().toISOString();

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
          if (mode === "read-error" && filePath === "/workspace/broken.html") {
            return {
              success: false,
              error: "Permission denied",
            };
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
                lastModified: new Date(now),
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
  await fs.access(buildOutputDir);

  let server = null;
  const reuseExistingServer = await isServerReachable(baseUrl);

  if (!reuseExistingServer) {
    server = spawn(
      "python3",
      [
        "-m",
        "http.server",
        "4173",
        "--bind",
        "127.0.0.1",
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
  } else {
    console.log("[capture-task-059b] Reusing existing static server on :4173");
  }

  const capturedAt = new Date().toISOString();
  const metadata = {
    capturedAt,
    baseUrl,
    harnessPath,
    buildOutputDir,
    sourceKind: "current-build-static-server",
    workflow: workflowRoot,
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
      if (!scenario.skipHarness) {
        await page.addInitScript(createMockScript(), {
          mode: scenario.mode,
          theme: scenario.theme,
        });
        await page.goto(`${baseUrl}${harnessPath}`, {
          waitUntil: "domcontentloaded",
        });
        await page.getByTestId("workspace-view").waitFor();
      }

      await scenario.run(page);

      const target = path.join(screenshotDir, scenario.file);
      await page.screenshot({ path: target, fullPage: true });

      metadata.screenshots.push({
        tc: scenario.tc,
        file: scenario.file,
        viewport: scenario.viewport,
        theme: scenario.theme,
      });

      await context.close();
      console.log(`[capture-task-059b] ${scenario.tc} -> ${scenario.file}`);
    }

    await fs.writeFile(
      path.join(screenshotDir, "phase11-capture-metadata.json"),
      `${JSON.stringify(metadata, null, 2)}\n`,
      "utf-8",
    );
  } finally {
    if (browser) {
      await browser.close();
    }
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
