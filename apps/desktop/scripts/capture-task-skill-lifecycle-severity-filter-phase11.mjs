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
  "docs/30-workflows/task-skill-creator-layer34-ui-display-severity-filter",
);
const screenshotDir = path.join(
  workflowDir,
  "outputs/phase-11/screenshots",
);
const metadataPath = path.join(
  workflowDir,
  "outputs/phase-11/phase11-capture-metadata.json",
);

const port = process.env.SEVERITY_FILTER_SCREENSHOT_PORT ?? "5198";
const baseUrl = `http://localhost:${port}`;
const targetUrl = `${baseUrl}/phase11-task-rt-04-skill-authkey.html`;

/**
 * wait for Vite dev server to respond
 */
async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for dev server: ${url}`);
}

function buildMockInitScript({ theme = "light", verifyDetail }) {
  const detailJson = JSON.stringify(verifyDetail);
  return `(() => {
    const detail = ${detailJson};
    const workflowState = {
      planId: detail.planId,
      currentPhase: detail.currentPhase,
      awaitingUserInput: null,
      verifyResult: null,
      resumeTokenEnvelope: {
        version: "task-sdk-02-v1",
        planId: detail.planId,
        currentPhase: detail.currentPhase,
        artifactCount: detail.evidenceCount ?? detail.checks.length,
        updatedAt: new Date().toISOString(),
      },
      sourceProvenance: {
        resolvedSkillCreatorRoot: "/tmp/skill-creator",
        warningNote: "mock workflow state",
      },
      handoffBundle: null,
      routeSnapshot: {
        type: detail.route.type,
        summary: detail.route.summary,
      },
    };

    window.__PHASE11_TASK_RT_04_SKILL_AUTHKEY__ = {
      resolvedTheme: ${JSON.stringify(theme)},
      currentPlanId: ${JSON.stringify(verifyDetail.planId)},
      selectedSkillName: "task-rt-04-phase11",
    };

    const noop = () => undefined;

    window.electronAPI = {
      authKey: {
        exists: async () => ({ exists: false }),
        set: async () => ({ success: true }),
        delete: async () => ({ success: true }),
      },
      skillCreator: {
        detectMode: async () => ({ success: true, data: "collaborative" }),
        planSkill: async () => ({ success: true, data: { accepted: true, planId: "plan-001" } }),
        executePlan: async () => ({ success: true, data: { type: "execute_result", success: true } }),
        getWorkflowState: async () => ({ success: true, data: workflowState }),
        onWorkflowStateChanged: (cb) => { cb(workflowState); return noop; },
        submitUserInput: async () => ({ success: true, data: workflowState }),
        getVerifyDetail: async () => ({ success: true, data: detail }),
        reverifyWorkflow: async () => ({ success: true, data: { accepted: true } }),
        improveSkill: async () => ({ success: true, data: { suggestions: [], applied: false } }),
        improveSkillWithFeedback: async () => ({ success: true, data: { suggestions: [], applied: false, type: "result" } }),
        applyRuntimeImprovement: async () => ({ success: true, data: { applied: true } }),
        getDisclosureInfo: async () => ({ success: true, data: { aiServiceName: "mock-service", modelName: "mock-model", externalDestinations: [] } }),
      },
    };
  })();`;
}

function mixedVerifyDetail() {
  return {
    planId: "plan-mixed",
    currentPhase: "verify",
    status: "fail",
    message: "mixed severity dataset",
    checks: [
      {
        id: "L3-INFO-1",
        layer: "layer3",
        severity: "info",
        summary: "info check 1",
      },
      {
        id: "L3-WARN-1",
        layer: "layer3",
        severity: "warning",
        summary: "warning check 1",
      },
      {
        id: "L3-ERR-1",
        layer: "layer3",
        severity: "error",
        summary: "error check 1",
      },
      {
        id: "L4-INFO-1",
        layer: "layer4",
        severity: "info",
        summary: "info only layer4",
      },
      {
        id: "L4-WARN-1",
        layer: "layer4",
        severity: "warning",
        summary: "warning layer4",
      },
    ],
    evidenceCount: 5,
    route: {
      type: "integrated_api",
      summary: "integrated_api (mock)",
    },
    reverifyEligible: true,
    delegatedGovernanceNote: "mock governance",
    delegatedSessionNote: "mock session",
  };
}

function infoOnlyDetail() {
  return {
    planId: "plan-info-only",
    currentPhase: "verify",
    status: "fail",
    message: "info only",
    checks: [
      {
        id: "L3-INFO-1",
        layer: "layer3",
        severity: "info",
        summary: "info only",
      },
    ],
    evidenceCount: 1,
    route: { type: "integrated_api", summary: "integrated_api (mock)" },
    reverifyEligible: true,
    delegatedGovernanceNote: "mock",
    delegatedSessionNote: "mock",
  };
}

function emptyDetail() {
  return {
    planId: "plan-empty",
    currentPhase: "verify",
    status: "pass",
    message: "no checks",
    checks: [],
    evidenceCount: 0,
    route: { type: "integrated_api", summary: "integrated_api (mock)" },
    reverifyEligible: true,
    delegatedGovernanceNote: "mock",
    delegatedSessionNote: "mock",
  };
}

async function captureScenario(browser, { file, theme = "light", detail, filter }) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: theme,
  });
  const page = await context.newPage();

  await page.addInitScript(buildMockInitScript({ theme, verifyDetail: detail }));
  await page.goto(targetUrl, { waitUntil: "networkidle" });
  await page.waitForSelector('[data-testid="skill-lifecycle-verify-detail"]');

  if (filter) {
    const testId = `skill-lifecycle-severity-filter-${filter}`;
    const button = await page.waitForSelector(`[data-testid="${testId}"]`);
    await button.click();
  }

  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, file), fullPage: true });
  await context.close();
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });

  const server = spawn(
    "pnpm",
    [
      "exec",
      "vite",
      "--config",
      "vite.e2e.config.ts",
      "--port",
      port,
      "--strictPort",
    ],
    {
      cwd: desktopRoot,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", (d) => process.stdout.write(d));
  server.stderr.on("data", (d) => process.stderr.write(d));

  let browser;
  try {
    await waitForServer(targetUrl);
    browser = await chromium.launch({ headless: true });

    const mixed = mixedVerifyDetail();

    const captures = [
      { file: "TC-01-default-all-light.png", theme: "light", detail: mixed },
      { file: "TC-02-default-all-dark.png", theme: "dark", detail: mixed },
      { file: "TC-03-warning-plus-light.png", theme: "light", detail: mixed, filter: "warning+" },
      { file: "TC-04-warning-plus-dark.png", theme: "dark", detail: mixed, filter: "warning+" },
      { file: "TC-05-error-only-light.png", theme: "light", detail: mixed, filter: "error" },
      { file: "TC-06-error-only-dark.png", theme: "dark", detail: mixed, filter: "error" },
      { file: "TC-07-empty-layer-light.png", theme: "light", detail: infoOnlyDetail(), filter: "error" },
      { file: "TC-08-no-checks-light.png", theme: "light", detail: emptyDetail() },
    ];

    for (const c of captures) {
      process.stdout.write(`Capturing ${c.file}\n`);
      await captureScenario(browser, c);
    }

    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          capturedAt: new Date().toISOString(),
          baseUrl,
          targetUrl,
          screenshotDir,
          captures: captures.map(({ file, theme, filter, detail }) => ({
            file,
            theme,
            filter: filter ?? "all",
            planId: detail.planId,
          })),
        },
        null,
        2,
      ),
      "utf8",
    );
    process.stdout.write(`Captured metadata: ${metadataPath}\n`);
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

/**
 * 実行方法 (repo root):
 *   cd apps/desktop
 *   pnpm exec node scripts/capture-task-skill-lifecycle-severity-filter-phase11.mjs
 * 必要に応じてポートを指定: SEVERITY_FILTER_SCREENSHOT_PORT=5205 pnpm exec node ...
 */
