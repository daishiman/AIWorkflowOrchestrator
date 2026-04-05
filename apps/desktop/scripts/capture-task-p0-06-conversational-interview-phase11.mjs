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
const outputRoot = path.join(
  repoRoot,
  "docs/30-workflows/TASK-P0-06-conversational-interview-ui/outputs/phase-11",
);
const screenshotDir = path.join(outputRoot, "screenshots");
const metadataPath = path.join(outputRoot, "phase11-capture-metadata.json");
const port = process.env.TASK_P0_06_PHASE11_PORT ?? "5203";
const baseUrl = `http://127.0.0.1:${port}`;
const pageUrl = `${baseUrl}/phase11-task-rt-04-skill-authkey.html`;
const workflowPlanId = "phase12-p0-06";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 90_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // retry
    }
    await wait(500);
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

function makeRequest(id, kind, title, prompt, options = [], placeholder) {
  return {
    requestId: id,
    reason: "plan_review",
    title,
    prompt,
    kind,
    options: options.length > 0 ? options : undefined,
    placeholder,
    allowSkip: false,
    requestedAt: "2026-04-05T00:00:00.000Z",
  };
}

function makeSnapshot(planId, request, artifactCount, currentPhase = "review") {
  return {
    planId,
    currentPhase,
    awaitingUserInput: request,
    verifyResult: null,
    sourceProvenance: {
      resolvedSkillCreatorRoot: "/mock/skill-creator",
      warningNote: "phase11 visual harness",
    },
    resumeTokenEnvelope: {
      version: "task-sdk-02-v1",
      planId,
      currentPhase,
      artifactCount,
      routeSnapshot: {
        type: "integrated_api",
        permissionMode: "default",
        launcher: "mock",
      },
      sourceProvenance: {
        resolvedSkillCreatorRoot: "/mock/skill-creator",
        warningNote: "phase11 visual harness",
      },
      updatedAt: "2026-04-05T00:00:00.000Z",
    },
    routeSnapshot: {
      type: "integrated_api",
      permissionMode: "default",
      launcher: "mock",
    },
    handoffBundle: null,
  };
}

const snapshots = [
  makeSnapshot(
    workflowPlanId,
    makeRequest(
      "req-1",
      "single_select",
      "入力 1",
      "最も近い実装方針を選んでください",
      [
        { id: "typescript", label: "TypeScript" },
        { id: "javascript", label: "JavaScript" },
        { id: "rust", label: "Rust" },
      ],
    ),
    1,
  ),
  makeSnapshot(
    workflowPlanId,
    makeRequest(
      "req-2",
      "multi_select",
      "入力 2",
      "反映したい要素を選んでください",
      [
        { id: "docs", label: "docs" },
        { id: "code", label: "code" },
        { id: "tests", label: "tests" },
      ],
    ),
    2,
  ),
  makeSnapshot(
    workflowPlanId,
    makeRequest(
      "req-3",
      "free_text",
      "入力 3",
      "補足を入力してください",
      [],
      "自由に入力してください",
    ),
    3,
  ),
  makeSnapshot(
    workflowPlanId,
    makeRequest(
      "req-4",
      "secret",
      "入力 4",
      "APIキーを入力してください",
      [],
      "APIキー",
    ),
    4,
  ),
  makeSnapshot(
    workflowPlanId,
    makeRequest(
      "req-5",
      "confirm",
      "入力 5",
      "この内容で進めますか？",
    ),
    5,
  ),
];

function buildInitScript() {
  return `
(() => {
  const snapshots = ${JSON.stringify(snapshots)};
  let snapshotIndex = 0;
  let workflowStateListeners = [];

  const currentSnapshot = () => snapshots[snapshotIndex];
  const broadcastWorkflowState = (snapshot) => {
    for (const listener of workflowStateListeners) {
      listener(snapshot);
    }
  };

  window.__PHASE11_TASK_RT_04_SKILL_AUTHKEY__ = {
    resolvedTheme: "light",
    selectedSkillName: "phase11-conversational-interview",
    skillExecutionStatus: "idle",
    streamingMessages: [],
    isSkillExecuting: false,
    workflowSnapshot: currentSnapshot(),
    workflowError: null,
    generationError: null,
    generationProgress: null,
    currentPlanId: currentSnapshot().planId,
    currentPlanResult: null,
    handoffGuidance: null,
    skillError: null,
    isGenerating: false,
    isAnalyzing: false,
    isImproving: false,
  };

  window.electronAPI = {
    authKey: {
      exists: async () => ({ exists: false, source: "not-set" }),
      set: async () => ({ success: true }),
      delete: async () => ({ success: true }),
    },
    skillCreator: {
      getAdapterStatus: async () => ({
        success: true,
        data: { status: "ready", failureReason: null },
      }),
      onAdapterStatusChanged: () => () => {},
      onWorkflowStateChanged: (callback) => {
        workflowStateListeners.push(callback);
        setTimeout(() => callback(currentSnapshot()), 0);
        return () => {
          workflowStateListeners = workflowStateListeners.filter(
            (item) => item !== callback,
          );
        };
      },
      getWorkflowState: async () => ({
        success: true,
        data: currentSnapshot(),
      }),
      submitUserInput: async () => {
        snapshotIndex = Math.min(snapshotIndex + 1, snapshots.length - 1);
        const nextSnapshot = currentSnapshot();
        setTimeout(() => broadcastWorkflowState(nextSnapshot), 0);
        return { success: true, data: nextSnapshot };
      },
      getDisclosureInfo: async () => ({
        success: true,
        data: {
          aiServiceName: "Mock AI",
          modelName: "mock-model",
          externalDestinations: ["none"],
        },
      }),
      getVerifyDetail: async () => ({
        success: true,
        data: {
          planId: currentSnapshot().planId,
          currentPhase: "verify",
          status: "pass",
          message: "visual harness",
          checks: [],
          evidenceCount: 0,
          route: { type: "integrated_api", summary: "mock" },
          reverifyEligible: true,
          delegatedGovernanceNote: "mock",
          delegatedSessionNote: "mock",
        },
      }),
      detectMode: async () => ({ success: true, data: "collaborative" }),
      planSkill: async () => ({
        success: true,
        data: {
          accepted: true,
          planId: "plan-visual-harness",
          estimatedSteps: 5,
        },
      }),
      executePlan: async () => ({
        success: true,
        data: { type: "integrated_api", success: true },
      }),
      improveSkill: async () => ({
        success: true,
        data: { suggestions: [], applied: false },
      }),
      improveSkillWithFeedback: async () => ({
        success: true,
        data: { suggestions: [], applied: false, type: "result" },
      }),
      reverifyWorkflow: async () => ({ success: true, data: { accepted: true } }),
    },
  };
})();`;
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });
  const server = startViteServer();

  try {
    await waitForServer(pageUrl);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1400 },
      colorScheme: "light",
    });

    await page.addInitScript(buildInitScript());
    await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.getByTestId("skill-lifecycle-question-host").waitFor({
      timeout: 20_000,
    });

    const host = page.getByTestId("skill-lifecycle-question-host");
    const capture = async (file) => {
      await host.screenshot({ path: path.join(screenshotDir, file) });
      await wait(200);
    };

    await capture("s01-initial-display.png");

    await page.getByTestId("chip-typescript").click();
    await capture("s02-single-select-selected.png");

    await page.getByTestId("interview-submit").click();
    await page.getByTestId("multi-select-checkbox").waitFor({
      timeout: 20_000,
    });
    await capture("s02b-single-select-submitted.png");

    await page.getByTestId("checkbox-docs").click();
    await page.getByTestId("checkbox-tests").click();
    await capture("s03-multi-select-checked.png");

    await page.getByTestId("interview-submit").click();
    await page.getByTestId("free-text-textarea").waitFor({
      timeout: 20_000,
    });
    await capture("s03b-multi-select-submitted.png");

    await capture("s11a-beginner-mode.png");

    const textBox = page.getByTestId("free-text-textarea");
    await textBox.fill("仕様の補足を追記します");
    await capture("s04-free-text-typing.png");

    await page.getByRole("button", { name: "エンジニア" }).click();
    await capture("s11b-engineer-mode.png");

    await textBox.fill("");
    await page.getByTestId("interview-submit").click();
    await page.getByRole("alert").waitFor({ timeout: 20_000 });
    await capture("s09-validation-error.png");

    await textBox.fill("APIキー未設定時の分岐を確認します");
    await page.getByTestId("interview-submit").click();
    await page.getByTestId("secret-input-field").waitFor({
      timeout: 20_000,
    });
    await capture("s08-api-key-guidance-banner.png");
    await capture("s10-progress-bar.png");

    const secretInput = page.getByTestId("secret-input-field");
    await secretInput.fill("phase12-secret-key");
    await page.getByTestId("interview-submit").click();
    await page.getByTestId("confirm-buttons").waitFor({
      timeout: 20_000,
    });
    await capture("s05-secret-masked.png");
    await capture("s06-confirm-buttons.png");

    await page.getByTestId("interview-undo").click();
    await page.getByTestId("secret-input-field").waitFor({
      timeout: 20_000,
    });
    await capture("s07-undo-restored.png");

    await browser.close();

    const generatedAt = new Date().toISOString();
    await fs.writeFile(
      metadataPath,
      `${JSON.stringify(
        {
          taskId: "TASK-P0-06",
          generatedAt,
          targetUrl: pageUrl,
          screenshots: [
            "s01-initial-display.png",
            "s02-single-select-selected.png",
            "s02b-single-select-submitted.png",
            "s03-multi-select-checked.png",
            "s03b-multi-select-submitted.png",
            "s11a-beginner-mode.png",
            "s04-free-text-typing.png",
            "s11b-engineer-mode.png",
            "s09-validation-error.png",
            "s08-api-key-guidance-banner.png",
            "s10-progress-bar.png",
            "s05-secret-masked.png",
            "s06-confirm-buttons.png",
            "s07-undo-restored.png",
          ],
        },
        null,
        2,
      )}\\n`,
    );
    console.log(`screenshots saved to ${screenshotDir}`);
  } finally {
    server.kill("SIGTERM");
  }
}

await main();
