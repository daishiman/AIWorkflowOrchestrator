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
  "docs/30-workflows/ai-runtime-authmode-unification/tasks/step-02-par-task-02-workspace-chat-edit-runtime-activation",
);
const phase11Root = path.join(workflowRoot, "outputs/phase-11");
const rendererRoot = path.join(desktopRoot, "out/renderer");
const screenshotDir = path.join(phase11Root, "screenshots");
const metadataPath = path.join(screenshotDir, "phase11-capture-metadata.json");
const planPath = path.join(phase11Root, "screenshot-plan.json");
const port = process.env.TASK_AI_RUNTIME_CHAT_EDIT_PHASE11_PORT ?? "4176";
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
  "/workspace/src/app.ts":
    "export const app = true;\nexport function sum(a, b) { return a + b; }\n",
  "/workspace/src/README.md": "# Workspace\n\nChat edit runtime capture\n",
};

const scenarios = [
  {
    tc: "TC-11-01",
    file: "TC-11-01-chat-edit-selection.png",
    note: "selection-ready proxy（context chip付き）",
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
    tc: "TC-11-02",
    file: "TC-11-02-chat-edit-generating.png",
    note: "generating proxy（request in-flight）",
    viewport: { width: 1440, height: 960 },
    theme: "light",
    run: async (page) => {
      const input = page.getByTestId("workspace-chat-input");
      await input.fill("generate in progress");
      await page.getByTestId("workspace-chat-send").click();
      await page.waitForTimeout(220);
      await page.waitForSelector('[data-testid="workspace-chat-log"]');
    },
  },
  {
    tc: "TC-11-03",
    file: "TC-11-03-chat-edit-diff-preview.png",
    note: "diff-ready proxy（stream result surface）",
    viewport: { width: 1440, height: 960 },
    theme: "light",
    run: async (page) => {
      const input = page.getByTestId("workspace-chat-input");
      await input.fill("refactor this function");
      await page.getByTestId("workspace-chat-send").click();
      await page.waitForTimeout(120);
      await page.evaluate(() => {
        window.__workspaceHarnessEmitChunk?.(
          "```diff\n- return a + b;\n+ return Number(a) + Number(b);\n```",
        );
        window.__workspaceHarnessEmitEnd?.();
      });
      await page.waitForTimeout(220);
      await page.waitForSelector('[data-testid="workspace-chat-log"]');
    },
  },
  {
    tc: "TC-11-04",
    file: "TC-11-04-chat-edit-handoff.png",
    note: "handoff proxy（CAPABILITY_UNAVAILABLE）",
    viewport: { width: 1440, height: 960 },
    theme: "light",
    run: async (page) => {
      const input = page.getByTestId("workspace-chat-input");
      await input.fill("runtime unavailable");
      await page.getByTestId("workspace-chat-send").click();
      await page.waitForTimeout(120);
      await page.evaluate(() => {
        window.__workspaceHarnessEmitError?.(
          "CAPABILITY_UNAVAILABLE: terminal handoff required",
        );
      });
      await page.waitForSelector('[data-testid="workspace-chat-error"]');
    },
  },
  {
    tc: "TC-11-05",
    file: "TC-11-05-chat-edit-blocked.png",
    note: "blocked proxy（CREDENTIAL_MISSING）",
    viewport: { width: 1440, height: 960 },
    theme: "light",
    run: async (page) => {
      const input = page.getByTestId("workspace-chat-input");
      await input.fill("missing credentials");
      await page.getByTestId("workspace-chat-send").click();
      await page.waitForTimeout(120);
      await page.evaluate(() => {
        window.__workspaceHarnessEmitError?.(
          "CREDENTIAL_MISSING: configure API key",
        );
      });
      await page.waitForSelector('[data-testid="workspace-chat-error"]');
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
    const now = new Date("2026-03-14T00:00:00.000Z").toISOString();
    const chunkListeners = new Set();
    const endListeners = new Set();
    const errorListeners = new Set();
    const watchListeners = new Set();
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
              lastModified: new Date("2026-03-14T10:00:00.000Z"),
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
        return { success: true, data: { id: `conversation-${conversationSeq}` } };
      },
      update: async () => ({ success: true, data: null }),
      delete: async () => ({ success: true }),
      addMessage: async () => ({
        success: true,
        data: { id: `message-${Date.now()}` },
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
  await scenario.run(page);

  const result = await capture(page, scenario);
  await context.close();
  return result;
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });
  await fs.writeFile(planPath, JSON.stringify(createPlan(), null, 2));

  const staticServerScript = `
const http = require("http");
const fs = require("fs");
const path = require("path");
const root = process.cwd();
const port = Number(process.argv[1]);
const mime = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".woff2", "font/woff2"],
]);
const server = http.createServer((req, res) => {
  const clean = decodeURIComponent((req.url || "/").split("?")[0]);
  const relative = clean === "/" ? "/index.html" : clean;
  const filePath = path.normalize(path.join(root, relative));
  if (!filePath.startsWith(root)) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.statusCode = 404;
      res.end("Not Found");
      return;
    }
    res.setHeader("Content-Type", mime.get(path.extname(filePath)) || "application/octet-stream");
    res.end(data);
  });
});
server.listen(port, "127.0.0.1", () => {
  console.log("static-server-ready:" + port);
});
`;

  const server = spawn(
    "node",
    ["-e", staticServerScript, String(port)],
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
      console.log(
        `[capture-task-ai-runtime-chat-edit-phase11] ${scenario.tc} -> ${scenario.file}`,
      );
    }

    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          baseUrl,
          harnessPath,
          records,
          note: "current build proxy capture for step-02 task verification",
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
  console.error("[capture-task-ai-runtime-chat-edit-phase11] failed", error);
  process.exitCode = 1;
});
