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
  "docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const rendererRoot = path.join(desktopRoot, "out/renderer");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const planPath = path.join(phase11Root, "screenshot-plan.json");
const keyboardLogPath = path.join(
  screenshotDir,
  "TC-11-08-keyboard-interaction-log.md",
);
const port = process.env.TASK_059A_PHASE11_PORT ?? "4174";
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
        id: "file-readme",
        name: "README.md",
        type: "file",
        path: "/workspace/src/README.md",
      },
    ],
  },
];

const baseContents = {
  "/workspace/src/app.ts": "export const app = true;\n",
  "/workspace/src/README.md": "# Workspace\n\nChat panel screenshot harness\n",
};

const scenarios = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-zero-state-light.png",
    note: "zero state light",
    viewport: { width: 1440, height: 960 },
    theme: "light",
    run: async () => {},
  },
  {
    tc: "TC-11-02",
    file: "TC-11-02-zero-state-dark.png",
    note: "zero state dark",
    viewport: { width: 1440, height: 960 },
    theme: "dark",
    run: async () => {},
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-file-chip-attached.png",
    note: "file chip attached",
    viewport: { width: 1440, height: 960 },
    theme: "light",
    run: async (page) => {
      await openFilePanel(page);
      await selectFile(page, "file-app");
      await page.getByTestId("workspace-chat-attach-selected").click();
      await page.waitForSelector('[data-testid="workspace-file-context-chips"]');
    },
  },
  {
    tc: "TC-11-04",
    file: "TC-11-04-mention-dropdown-open.png",
    note: "mention dropdown open",
    viewport: { width: 1440, height: 960 },
    theme: "light",
    run: async (page) => {
      const input = page.getByTestId("workspace-chat-input");
      await input.click();
      await input.type("@app", { delay: 20 });
      await page.waitForSelector('[data-testid="workspace-mention-dropdown"]');
    },
  },
  {
    tc: "TC-11-05",
    file: "TC-11-05-streaming-progress.png",
    note: "streaming in progress",
    viewport: { width: 1440, height: 960 },
    theme: "light",
    run: async (page) => {
      const input = page.getByTestId("workspace-chat-input");
      await input.fill("streaming status check");
      await page.getByTestId("workspace-chat-send").click();
      await page.waitForTimeout(120);
      await page.evaluate(() => {
        window.__workspaceHarnessEmitChunk?.("assistant stream payload");
      });
      await page.waitForSelector('[data-testid="workspace-message-streaming"]');
    },
  },
  {
    tc: "TC-11-06",
    file: "TC-11-06-stream-error-surface.png",
    note: "stream error surface",
    viewport: { width: 1440, height: 960 },
    theme: "light",
    run: async (page) => {
      const input = page.getByTestId("workspace-chat-input");
      await input.fill("error case");
      await page.getByTestId("workspace-chat-send").click();
      await page.waitForTimeout(120);
      await page.evaluate(() => {
        window.__workspaceHarnessEmitError?.("ネットワークエラー");
      });
      await page.waitForSelector('[data-testid="workspace-chat-error"]');
    },
  },
  {
    tc: "TC-11-07",
    file: "TC-11-07-compact-width.png",
    note: "compact width",
    viewport: { width: 900, height: 980 },
    theme: "light",
    run: async (page) => {
      await openFilePanel(page);
      await page.waitForSelector('[role="dialog"][aria-label="ファイル"]');
    },
  },
  {
    tc: "TC-11-08",
    file: "TC-11-08-keyboard-only-flow.png",
    note: "keyboard send + remove + mention",
    viewport: { width: 1440, height: 960 },
    theme: "light",
    run: async (page, recordKeyboardLog) => {
      await openFilePanel(page);
      await selectFile(page, "file-app");
      await page.getByTestId("workspace-chat-attach-selected").click();
      await page.waitForSelector('[data-testid="workspace-file-context-chips"]');

      await page.getByLabel("ファイル背景情報を削除").first().focus();
      await page.keyboard.press("Enter");
      recordKeyboardLog("remove", "Enter", "chip をキーボードで削除");

      const input = page.getByTestId("workspace-chat-input");
      await input.focus();
      await page.keyboard.type("@app");
      recordKeyboardLog("mention", "@app", "mention クエリを入力");

      await page.keyboard.press("ArrowDown");
      recordKeyboardLog("mention", "ArrowDown", "候補を移動");

      await page.keyboard.press("Enter");
      recordKeyboardLog("mention", "Enter", "候補を選択して挿入");

      await page.keyboard.type("責務を要約して");
      recordKeyboardLog("send", "type", "本文を入力");

      await page.keyboard.press("Enter");
      recordKeyboardLog("send", "Enter", "メッセージ送信");

      await page.waitForTimeout(120);
      await page.evaluate(() => {
        window.__workspaceHarnessEmitChunk?.("了解しました。要約します。");
        window.__workspaceHarnessEmitEnd?.();
      });
      await page.waitForTimeout(200);
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

  throw new Error(`Timed out waiting for server: ${url}`);
}

async function openFilePanel(page) {
  await page.getByTestId("workspace-toggle-file").click();
  await page.waitForTimeout(120);
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
  if (fileId === "file-app" || fileId === "file-readme") {
    await expandSrcFolder(page);
  }
  await page.getByTestId(`workspace-treeitem-${fileId}`).click();
  await page.waitForTimeout(100);
}

function createPlan() {
  return {
    generatedAt: new Date().toISOString(),
    baseUrl,
    harnessPath,
    scenarios: scenarios.map((scenario) => ({
      id: scenario.tc,
      description: scenario.note,
      route: harnessPath,
      output: `screenshots/${scenario.file}`,
      viewport: scenario.viewport,
      theme: scenario.theme,
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

function createKeyboardLogger(bucket) {
  return (step, key, detail) => {
    bucket.push({
      at: new Date().toISOString(),
      step,
      key,
      detail,
    });
  };
}

function formatKeyboardLog(items) {
  const lines = [
    "# TC-11-08 Keyboard Interaction Log",
    "",
    "| 時刻 | ステップ | 操作 | 内容 |",
    "| --- | --- | --- | --- |",
  ];

  for (const item of items) {
    lines.push(
      `| ${item.at} | ${item.step} | \`${item.key}\` | ${item.detail} |`,
    );
  }

  return `${lines.join("\n")}\n`;
}

async function captureScenario(browser, scenario, keyboardEvents) {
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
    const now = new Date("2026-03-11T00:00:00.000Z").toISOString();
    const watchListeners = new Set();
    const chunkListeners = new Set();
    const endListeners = new Set();
    const errorListeners = new Set();
    const contents = { ...config.contents };
    const tree = config.tree;
    let streamRequestId = 0;
    let conversationSeq = 0;

    window.localStorage.clear();
    window.sessionStorage.clear();
    window.__PHASE11_WORKSPACE_LAYOUT_HARNESS__ = { theme: config.theme };

    window.__workspaceHarnessEmitChunk = (content) => {
      for (const callback of chunkListeners) {
        callback({ delta: { content } });
      }
    };
    window.__workspaceHarnessEmitEnd = () => {
      for (const callback of endListeners) {
        callback();
      }
    };
    window.__workspaceHarnessEmitError = (message) => {
      for (const callback of errorListeners) {
        callback({ code: "HARNESS_STREAM_ERROR", message, retryable: true });
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
              lastModified: new Date("2026-03-11T10:00:00.000Z"),
              encoding: "utf-8",
            },
          },
        }),
        write: async () => ({ success: true }),
        rename: async () => ({ success: true }),
        watchStart: async () => ({ success: true, watchId: "watch-1" }),
        watchStop: async () => ({ success: true }),
        onChanged: (callback) => {
          watchListeners.add(callback);
          return () => watchListeners.delete(callback);
        },
      },
      llm: {
        streamChat: async () => {
          streamRequestId += 1;
          return { requestId: `stream-${streamRequestId}` };
        },
        cancelStream: async () => ({ success: true }),
        onStreamChunk: (callback) => {
          chunkListeners.add(callback);
          return () => chunkListeners.delete(callback);
        },
        onStreamEnd: (callback) => {
          endListeners.add(callback);
          return () => endListeners.delete(callback);
        },
        onStreamError: (callback) => {
          errorListeners.add(callback);
          return () => errorListeners.delete(callback);
        },
      },
    };

    window.conversationAPI = {
      list: async () => ({ success: true, data: [] }),
      get: async () => ({ success: true, data: null }),
      create: async () => {
        conversationSeq += 1;
        return {
          success: true,
          data: {
            id: `conversation-${conversationSeq}`,
          },
        };
      },
      update: async () => ({ success: true, data: null }),
      delete: async () => ({ success: true }),
      addMessage: async () => ({
        success: true,
        data: {
          id: `message-${Date.now()}`,
        },
      }),
      search: async () => ({ success: true, data: [] }),
    };
  }, payload);

  await page.goto(`${baseUrl}${harnessPath}`, {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await page.waitForSelector('[data-testid="workspace-view"]');
  await page.waitForTimeout(200);
  await scenario.run(page, createKeyboardLogger(keyboardEvents));

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
    const keyboardEvents = [];

    for (const scenario of scenarios) {
      records.push(await captureScenario(browser, scenario, keyboardEvents));
      console.log(`[capture-task-059a] ${scenario.tc} -> ${scenario.file}`);
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

    await fs.writeFile(keyboardLogPath, formatKeyboardLog(keyboardEvents));
  } finally {
    if (browser) {
      await browser.close();
    }
    server.kill("SIGTERM");
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

main().catch((error) => {
  console.error("[capture-task-059a-workspace-chat-panel-phase11] failed", error);
  process.exitCode = 1;
});
