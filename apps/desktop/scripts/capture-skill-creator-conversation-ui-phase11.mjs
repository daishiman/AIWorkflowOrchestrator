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
const screenshotDir = path.join(
  repoRoot,
  "outputs/phase-11/task-sdk-sc-02/screenshots",
);
const metadataPath = path.join(
  repoRoot,
  "outputs/phase-11/task-sdk-sc-02/phase11-capture-metadata.json",
);
const planPath = path.join(
  repoRoot,
  "outputs/phase-11/task-sdk-sc-02/screenshot-plan.json",
);
const port = process.env.TASK_SDK_SC_02_PHASE11_PORT ?? "5199";
const baseUrl = `http://127.0.0.1:${port}`;
const harnessPath = "/phase11-skill-creator-conversation-ui.html";
const panelSelector = '[data-testid="phase11-skill-creator-conversation-ui-shell"]';

const baseQuestion = {
  toolCallId: "tc-1",
  type: "single_select",
  question: "使用言語を選択してください",
  options: [
    { value: "typescript", label: "TypeScript" },
    { value: "javascript", label: "JavaScript" },
  ],
};

const multiQuestion = {
  toolCallId: "tc-2",
  type: "multi_select",
  question: "追加したい機能を選んでください",
  options: [
    { value: "auth", label: "認証" },
    { value: "db", label: "DB連携" },
    { value: "api", label: "API" },
  ],
};

const secretQuestion = {
  toolCallId: "tc-3",
  type: "secret",
  question: "シークレット値を入力してください",
  placeholder: "APIキー",
};

const confirmQuestion = {
  toolCallId: "tc-4",
  type: "confirm",
  question: "この内容で進めますか？",
};

const freeTextQuestion = {
  toolCallId: "tc-5",
  type: "free_text",
  question: "補足を入力してください",
  placeholder: "自由に入力してください",
};

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 90_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // retry
    }
    await wait(400);
  }
  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

function startViteServer() {
  const child = spawn(
    "pnpm",
    [
      "exec",
      "vite",
      "--config",
      "vite.e2e.config.ts",
      "--host",
      "127.0.0.1",
      "--port",
      port,
      "--strictPort",
    ],
    {
      cwd: desktopRoot,
      stdio: "pipe",
      env: {
        ...process.env,
        FORCE_COLOR: "0",
      },
    },
  );

  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));
  return child;
}

async function screenshotPanel(page, fileName) {
  const panel = page.locator(panelSelector);
  await panel.screenshot({ path: path.join(screenshotDir, fileName) });
}

async function emitQuestion(page, question) {
  await page.evaluate((payload) => {
    window.__PHASE11_SKILL_CREATOR_CONVERSATION_UI__?.emitQuestion(payload);
  }, question);
  await wait(250);
}

async function emitComplete(page) {
  await page.evaluate(() => {
    window.__PHASE11_SKILL_CREATOR_CONVERSATION_UI__?.emitComplete();
  });
  await wait(250);
}

async function emitError(page, error) {
  await page.evaluate((message) => {
    window.__PHASE11_SKILL_CREATOR_CONVERSATION_UI__?.emitError(message);
  }, error);
  await wait(250);
}

async function resolvePendingAnswer(page) {
  await page.evaluate(() => {
    window.__PHASE11_SKILL_CREATOR_CONVERSATION_UI__?.resolvePendingAnswer();
  });
  await wait(250);
}

async function captureWaitingState(page) {
  await screenshotPanel(page, "TC-11-01-waiting-state.png");
}

async function captureSingleSelect(page) {
  await emitQuestion(page, baseQuestion);
  await screenshotPanel(page, "TC-11-02-single-select-question.png");
}

async function captureSingleSelectFreeText(page) {
  await emitQuestion(page, baseQuestion);
  await page.getByText("その他（自由入力）").click();
  await page.getByRole("textbox").fill("カスタム言語");
  await screenshotPanel(page, "TC-11-03-single-select-free-text-open.png");
}

async function captureMultiSelect(page) {
  await emitQuestion(page, multiQuestion);
  await page.getByText("認証").click();
  await page.getByText("DB連携").click();
  await screenshotPanel(page, "TC-11-04-multi-select-active.png");
}

async function captureSubmittingState(page) {
  await emitQuestion(page, multiQuestion);
  await page.getByText("API").click();
  await page.getByRole("button", { name: "送信" }).click();
  await wait(250);
  await screenshotPanel(page, "TC-11-05-multi-select-submitting.png");
  await resolvePendingAnswer(page);
}

async function captureFreeTextState(page) {
  await emitQuestion(page, freeTextQuestion);
  await page.getByRole("textbox").fill("補足メモ");
  await screenshotPanel(page, "TC-11-06-free-text-question.png");
}

async function captureSecretState(page) {
  await emitQuestion(page, secretQuestion);
  await page.locator('input[type="password"]').fill("secret-12345");
  await screenshotPanel(page, "TC-11-07-secret-question.png");
}

async function captureConfirmState(page) {
  await emitQuestion(page, confirmQuestion);
  await screenshotPanel(page, "TC-11-08-confirm-question.png");
}

async function captureCompleteState(page) {
  await emitComplete(page);
  await screenshotPanel(page, "TC-11-09-complete-state.png");
}

async function captureErrorState(page) {
  await emitError(page, "接続が切断されました");
  await screenshotPanel(page, "TC-11-10-error-state.png");
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });
  const server = startViteServer();

  try {
    await waitForServer(`${baseUrl}${harnessPath}`);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1800 },
    });

    await page.goto(`${baseUrl}${harnessPath}`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await page.locator(panelSelector).waitFor({ timeout: 20_000 });

    const captures = [
      {
        tcId: "TC-11-01",
        file: "TC-11-01-waiting-state.png",
        step: "waiting",
        capture: captureWaitingState,
      },
      {
        tcId: "TC-11-02",
        file: "TC-11-02-single-select-question.png",
        step: "single-select",
        capture: captureSingleSelect,
      },
      {
        tcId: "TC-11-03",
        file: "TC-11-03-single-select-free-text-open.png",
        step: "single-select-free-text",
        capture: captureSingleSelectFreeText,
      },
      {
        tcId: "TC-11-04",
        file: "TC-11-04-multi-select-active.png",
        step: "multi-select",
        capture: captureMultiSelect,
      },
      {
        tcId: "TC-11-05",
        file: "TC-11-05-multi-select-submitting.png",
        step: "multi-select-submitting",
        capture: captureSubmittingState,
      },
      {
        tcId: "TC-11-06",
        file: "TC-11-06-free-text-question.png",
        step: "free-text",
        capture: captureFreeTextState,
      },
      {
        tcId: "TC-11-07",
        file: "TC-11-07-secret-question.png",
        step: "secret",
        capture: captureSecretState,
      },
      {
        tcId: "TC-11-08",
        file: "TC-11-08-confirm-question.png",
        step: "confirm",
        capture: captureConfirmState,
      },
      {
        tcId: "TC-11-09",
        file: "TC-11-09-complete-state.png",
        step: "complete",
        capture: captureCompleteState,
      },
      {
        tcId: "TC-11-10",
        file: "TC-11-10-error-state.png",
        step: "error",
        capture: captureErrorState,
      },
    ];

    const metadata = [];

    for (const entry of captures) {
      await entry.capture(page);
      const outputPath = path.join(screenshotDir, entry.file);
      const stat = await fs.stat(outputPath);
      metadata.push({
        tcId: entry.tcId,
        step: entry.step,
        file: entry.file,
        output: `outputs/phase-11/task-sdk-sc-02/screenshots/${entry.file}`,
        capturedAt: stat.mtime.toISOString(),
      });
      await wait(150);
    }

    const generatedAt = new Date().toISOString();
    await fs.writeFile(
      planPath,
      JSON.stringify(
        {
          taskId: "TASK-SDK-SC-02",
          generatedAt,
          baseUrl,
          harnessPath,
          cases: metadata.map((entry) => ({
            tcId: entry.tcId,
            step: entry.step,
            output: entry.output,
          })),
        },
        null,
        2,
      ),
    );

    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          taskId: "TASK-SDK-SC-02",
          generatedAt,
          baseUrl,
          harnessPath,
          panelSelector,
          captures: metadata,
          lastAnswer: page.evaluate(() =>
            window.__PHASE11_SKILL_CREATOR_CONVERSATION_UI__?.lastAnswer ?? null,
          ),
        },
        null,
        2,
      ),
    );

    await browser.close();
  } finally {
    server.kill("SIGTERM");
  }
}

await main();
