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
  "docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const rendererRoot = path.join(desktopRoot, "out/renderer");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const planPath = path.join(phase11Root, "screenshot-plan.json");
const port = process.env.TASK_058B_PHASE11_PORT ?? "4173";
const baseUrl = `http://127.0.0.1:${port}`;
const harnessPath = "/?phase11Harness=workspace-layout";

const baseTree = [
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
      {
        id: "file-config",
        name: "config.json",
        type: "file",
        path: "/workspace/src/config.json",
      },
    ],
  },
  {
    id: "file-readme",
    name: "README.md",
    type: "file",
    path: "/workspace/README.md",
  },
];

const baseContents = {
  "/workspace/src/app.ts": "export const app = true;\n",
  "/workspace/src/config.json": '{\n  "theme": "workspace"\n}\n',
  "/workspace/README.md": "# Workspace\n\nHarness preview\n",
};

const scenarios = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-chat-only-light.png",
    note: "desktop 初期の chat-only 表示",
    viewport: { width: 1440, height: 960 },
    theme: "light",
    run: async () => {},
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-3-pane-dark.png",
    note: "desktop 3-pane 表示と preview の同時表示",
    viewport: { width: 1600, height: 960 },
    theme: "dark",
    run: async (page) => {
      await openFilePanel(page);
      await selectFile(page, "file-app");
      await page.getByTestId("workspace-toggle-preview").click();
      await page.waitForSelector('[data-testid="workspace-preview-panel"]');
    },
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-resize-after-drag.png",
    note: "3-pane で file panel resize を反映した状態",
    viewport: { width: 1600, height: 960 },
    theme: "light",
    run: async (page) => {
      await openFilePanel(page);
      await selectFile(page, "file-app");
      await page.getByTestId("workspace-toggle-preview").click();
      const handle = page.getByTestId("workspace-resize-file");
      await handle.hover();
      await page.mouse.move(262, 280);
      await page.mouse.down();
      await page.mouse.move(340, 280, { steps: 8 });
      await page.mouse.up();
    },
  },
  {
    tc: "TC-11-04",
    file: "TC-11-04-tablet-chat-files.png",
    note: "tablet 幅で chat+files を表示",
    viewport: { width: 1280, height: 920 },
    theme: "light",
    run: async (page) => {
      await openFilePanel(page);
    },
  },
  {
    tc: "TC-11-05",
    file: "TC-11-05-mobile-overlay.png",
    note: "mobile overlay で file panel を表示",
    viewport: { width: 800, height: 1180 },
    theme: "light",
    run: async (page) => {
      await openFilePanel(page);
      await page.waitForSelector('[role="dialog"][aria-label="ファイル"]');
    },
  },
  {
    tc: "TC-11-06",
    file: "TC-11-06-tree-keyboard-nav.png",
    note: "tree keyboard nav と focus 移動",
    viewport: { width: 1440, height: 960 },
    theme: "light",
    run: async (page) => {
      await openFilePanel(page);
      const folder = page.getByTestId("workspace-treeitem-folder-src");
      await folder.focus();
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowDown");
    },
  },
  {
    tc: "TC-11-07",
    file: "TC-11-07-status-bar-selected-file.png",
    note: "selected file の status bar 表示",
    viewport: { width: 1440, height: 960 },
    theme: "light",
    run: async (page) => {
      await openFilePanel(page);
      await selectFile(page, "file-readme");
    },
  },
  {
    tc: "TC-11-08",
    file: "TC-11-08-watcher-updated-preview.png",
    note: "watcher change 後に preview 内容が再読込される",
    viewport: { width: 1600, height: 960 },
    theme: "light",
    run: async (page) => {
      await openFilePanel(page);
      await selectFile(page, "file-app");
      await page.getByTestId("workspace-toggle-preview").click();
      await page.waitForSelector('[data-testid="workspace-preview-panel"]');
      await page.evaluate(() => {
        window.__workspaceHarnessEmitChange?.(
          "/workspace/src/app.ts",
          "export const app = false;\n// watcher updated\n",
        );
      });
      await page.waitForTimeout(400);
    },
  },
];

async function waitForServer(url, timeout = 60_000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
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

async function openFilePanel(page) {
  await page.getByTestId("workspace-toggle-file").click();
  await page.waitForTimeout(100);
}

async function expandSrcFolder(page) {
  const child = page.getByTestId("workspace-treeitem-file-app");
  if ((await child.count()) > 0) {
    return;
  }

  const folder = page.getByTestId("workspace-treeitem-folder-src");
  await folder.focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(100);
}

async function selectFile(page, fileId) {
  if (fileId === "file-app" || fileId === "file-config") {
    await expandSrcFolder(page);
  }
  await page.getByTestId(`workspace-treeitem-${fileId}`).click();
  await page.waitForTimeout(100);
}

function createPlan() {
  return {
    generatedAt: new Date().toISOString(),
    baseUrl,
    scenarios: scenarios.map((scenario) => ({
      id: scenario.tc,
      description: scenario.note,
      route: harnessPath,
      output: `screenshots/${scenario.file}`,
      viewport: scenario.viewport,
      priority: "A",
    })),
  };
}

function createInitPayload(theme) {
  return {
    theme,
    tree: baseTree,
    contents: baseContents,
  };
}

async function capture(page, scenario) {
  const target = path.join(screenshotDir, scenario.file);
  await page.screenshot({ path: target, fullPage: true });
  const stat = await fs.stat(target);
  return {
    tc: scenario.tc,
    file: scenario.file,
    note: scenario.note,
    capturedAt: stat.mtime.toISOString(),
    viewport: scenario.viewport,
    theme: scenario.theme,
  };
}

async function captureScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport: scenario.viewport,
    colorScheme: scenario.theme,
  });
  const page = await context.newPage();
  const payload = createInitPayload(scenario.theme);
  page.setDefaultTimeout(30_000);

  page.on("console", (message) => {
    if (message.type() === "error") {
      console.error(`[${scenario.tc}] console error: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    console.error(`[${scenario.tc}] page error: ${error.message}`);
  });

  await page.addInitScript((config) => {
    const now = new Date("2026-03-10T00:00:00.000Z").toISOString();
    const listeners = new Set();
    const contents = { ...config.contents };
    const tree = config.tree;

    window.localStorage.clear();
    window.sessionStorage.clear();
    window.__PHASE11_WORKSPACE_LAYOUT_HARNESS__ = { theme: config.theme };
    window.__workspaceHarnessEmitChange = (filePath, nextContent) => {
      contents[filePath] = nextContent;
      for (const callback of listeners) {
        callback({
          watchId: "watch-1",
          eventType: "change",
          filePath,
          timestamp: Date.now(),
        });
      }
    };

    window.electronAPI = {
      workspace: {
        load: async () => ({
          success: true,
          data: {
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
          },
        }),
        save: async () => ({ success: true }),
        addFolder: async () => ({
          success: true,
          data: {
            path: "/workspace",
            displayName: "workspace",
          },
        }),
        validatePaths: async ({ paths }) => ({
          success: true,
          data: { validPaths: paths },
        }),
      },
      file: {
        getTree: async () => ({ success: true, data: tree }),
        read: async ({ filePath }) => ({
          success: true,
          data: {
            content: contents[filePath] ?? "",
            metadata: {
              size: (contents[filePath] ?? "").length,
              lastModified: new Date("2026-03-10T12:00:00.000Z"),
              encoding: "utf-8",
            },
          },
        }),
        write: async () => ({ success: true }),
        rename: async () => ({ success: true }),
        watchStart: async () => ({ success: true, watchId: "watch-1" }),
        watchStop: async () => ({ success: true }),
        onChanged: (callback) => {
          listeners.add(callback);
          return () => listeners.delete(callback);
        },
      },
    };
  }, payload);

  await page.goto(`${baseUrl}${harnessPath}`, {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await page.waitForSelector('[data-testid="workspace-view"]');
  await page.waitForTimeout(200);
  await scenario.run(page);

  const result = await capture(page, scenario);
  await context.close();
  return result;
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });
  await fs.writeFile(planPath, JSON.stringify(createPlan(), null, 2));

  const server = spawn(
    "python3",
    ["-m", "http.server", port, "--bind", "127.0.0.1"],
    {
      cwd: rendererRoot,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", (data) => {
    process.stdout.write(data);
  });
  server.stderr.on("data", (data) => {
    process.stderr.write(data);
  });

  let browser;
  try {
    await waitForServer(`${baseUrl}${harnessPath}`);
    browser = await chromium.launch();
    const records = [];

    for (const scenario of scenarios) {
      records.push(await captureScenario(browser, scenario));
    }

    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          baseUrl,
          harnessPath,
          records,
        },
        null,
        2,
      ),
    );
  } finally {
    if (browser) {
      await browser.close();
    }
    server.kill("SIGTERM");
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
