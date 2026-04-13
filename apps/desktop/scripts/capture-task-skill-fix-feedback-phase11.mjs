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
const screenshotDir = path.join(repoRoot, "outputs/phase-11/screenshots");
const metadataPath = path.join(
  repoRoot,
  "outputs/phase-11/phase11-capture-metadata.json",
);
const port = process.env.TASK_SW_FIX_FEEDBACK_PHASE11_PORT ?? "5184";

const baseUrl = `http://127.0.0.1:${port}`;
const managementRoute = `${baseUrl}/advanced/skill-management-panel?skipAuth=true`;
const wizardRoute = `${baseUrl}/advanced/skill-create-wizard?skipAuth=true`;

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

function createMockScript() {
  return () => {
    const now = new Date().toISOString();
    const scenario =
      new URLSearchParams(window.location.search).get("scenario") ?? "default";

    const makeImportedSkill = (name, description) => ({
      name,
      description,
      path: `/mock/skills/${name}`,
      allowedTools: ["Read"],
      updatedAt: now,
      importedAt: now,
      status: "active",
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    });

    const makeAvailableSkill = (name, description) => ({
      name,
      displayName: name,
      description,
      version: "1.0.0",
      category: "automation",
      tags: ["automation"],
      author: "E2E",
      path: `/mock/skills/${name}`,
    });

    let importedSkills = [
      makeImportedSkill("skill-alpha", "Alpha skill for screenshot test"),
      makeImportedSkill("skill-beta", "Beta skill for screenshot test"),
    ];

    const availableSkills = [
      makeAvailableSkill("skill-gamma", "Gamma skill"),
      makeAvailableSkill("skill-delta", "Delta skill"),
    ];

    const generatedSkill = makeImportedSkill(
      "phase11-feedback-skill",
      "Generated after LLM executePlan",
    );

    const addGeneratedSkill = () => {
      importedSkills = [
        generatedSkill,
        ...importedSkills.filter((skill) => skill.name !== generatedSkill.name),
      ];
    };

    const mockUser = {
      id: "e2e-user",
      email: "e2e@example.com",
      displayName: "E2E User",
      avatarUrl: "",
      provider: "google",
      createdAt: now,
      lastSignInAt: now,
    };

    let workflowSnapshot = {
      planId: "plan-feedback-001",
      currentPhase: "review",
      awaitingUserInput: null,
      verifyResult: {
        status: "pass",
        nextAction: "handoff",
      },
      resumeTokenEnvelope: {
        version: "task-sdk-02-v1",
        planId: "plan-feedback-001",
        currentPhase: "review",
        artifactCount: 1,
        updatedAt: now,
      },
      handoffBundle: null,
      persistResult:
        scenario === "llm-error"
          ? { skillPath: "" }
          : { skillPath: generatedSkill.path },
    };

    window.localStorage.setItem("dev-skip-auth", "true");

    window.electronAPI = {
      auth: {
        checkOnline: async () => ({ success: true, data: { online: true } }),
        getSession: async () => ({
          success: true,
          data: {
            user: mockUser,
            expiresAt: Date.now() + 60 * 60 * 1000,
            isOffline: false,
          },
        }),
        onAuthStateChanged: (callback) => {
          setTimeout(() => {
            callback({ authenticated: true, user: mockUser, isOffline: false });
          }, 10);
          return () => {};
        },
        login: async () => ({ success: true }),
        logout: async () => ({ success: true, data: {} }),
        refresh: async () => ({ success: true, data: {} }),
      },
      theme: {
        get: async () => ({
          success: true,
          data: { mode: "dark", resolvedTheme: "dark" },
        }),
        set: async () => ({ success: true, data: {} }),
        getSystem: async () => ({ success: true, data: { theme: "dark" } }),
        onSystemChanged: () => () => {},
      },
      skill: {
        list: async () => availableSkills,
        getImported: async () => importedSkills,
        create: async () => {
          if (scenario === "template-success") {
            addGeneratedSkill();
          }
          return { path: generatedSkill.path };
        },
        remove: async (skillName) => {
          importedSkills = importedSkills.filter((skill) => skill.name !== skillName);
        },
        readFile: async (_skillName, relativePath) =>
          `# ${relativePath}\n\nMock content`,
        writeFile: async () => undefined,
        listBackups: async () => [],
        restoreBackup: async () => undefined,
        rescan: async () => availableSkills,
      },
      skillCreator: {
        planSkill: async (prompt) => ({
          success: true,
          data: {
            type: "integrated_api",
            planId: "plan-feedback-001",
            skillSpec: `# generated skill spec\n\n${prompt}`,
            estimatedSteps: 2,
          },
        }),
        executePlan: async () => {
          if (scenario !== "llm-error") {
            addGeneratedSkill();
          }
          return {
            success: true,
            data: { accepted: true, planId: "plan-feedback-001" },
          };
        },
        getWorkflowState: async () => ({ success: true, data: workflowSnapshot }),
      },
    };
  };
}

async function captureScenario(page, file, runScenario, selector) {
  await runScenario(page);
  await page.waitForSelector(selector, { timeout: 15_000 });
  await page.waitForTimeout(200);
  await page.locator(selector).first().screenshot({
    path: path.join(screenshotDir, file),
  });
  return {
    file,
    selector,
  };
}

async function captureManagementList(page) {
  await page.goto(managementRoute, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-testid="skill-management-panel"]', {
    timeout: 60_000,
  });
  await page.waitForSelector('[data-testid="skill-management-imported-section"]');

  await page.getByRole("button", { name: "詳細ウィザード" }).click();
  await page.waitForSelector('[data-testid="skill-create-wizard"]', {
    timeout: 15_000,
  });

  await page.getByRole("radio", { name: /LLM/ }).click();
  await page.getByLabel("目的・背景").fill(
    "Slack通知をLLMで作成して、完了後に一覧へ反映する",
  );
  await page.getByRole("button", { name: "次へ" }).click();
  await page.waitForSelector('[data-testid="wizard-step-generate"]', {
    timeout: 15_000,
  });
  await page.getByRole("button", { name: "実行する" }).click();
  await page.waitForSelector('[data-testid="wizard-step-complete"]', {
    timeout: 15_000,
  });
  await page.getByRole("button", { name: "今すぐ実行する" }).click();
  await page.waitForSelector('[data-testid="skill-management-panel"]', {
    timeout: 15_000,
  });
  await page.waitForSelector(
    '[data-testid="imported-skill-card-phase11-feedback-skill"]',
    { timeout: 15_000 },
  );
}

async function captureLlmError(page) {
  await page.goto(`${wizardRoute}&scenario=llm-error`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector('[data-testid="skill-create-wizard"]', {
    timeout: 60_000,
  });

  await page.getByRole("radio", { name: /LLM/ }).click();
  await page.getByLabel("目的・背景").fill(
    "LLM フローで skillPath が null のときのエラー表示を確認する",
  );
  await page.getByRole("button", { name: "次へ" }).click();
  await page.waitForSelector('[data-testid="wizard-step-generate"]', {
    timeout: 15_000,
  });
  await page.getByRole("button", { name: "実行する" }).click();
  await page.waitForSelector('[data-testid="complete-step-error-header"]', {
    timeout: 15_000,
  });
}

async function captureTemplateSuccess(page) {
  await page.goto(`${wizardRoute}&scenario=template-success`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector('[data-testid="skill-create-wizard"]', {
    timeout: 60_000,
  });

  await page.getByRole("textbox", { name: /目的/ }).fill(
    "Slack通知をテンプレートから作成する",
  );
  await page.getByRole("button", { name: "外部連携" }).click();
  await page.getByRole("button", { name: "次へ" }).click();
  await page.waitForSelector('[data-testid="wizard-step-conversation-round"]', {
    timeout: 15_000,
  });
  await page.getByRole("button", { name: "今すぐ生成する" }).click();
  await page.getByRole("button", { name: /^生成する$/ }).click();
  await page.waitForSelector('[data-testid="wizard-step-complete"]', {
    timeout: 30_000,
  });
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
      "--host",
      "127.0.0.1",
      "--port",
      port,
      "--strictPort",
    ],
    {
      cwd: desktopRoot,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  server.stdout.on("data", (data) => process.stdout.write(data));
  server.stderr.on("data", (data) => process.stderr.write(data));

  try {
    await waitForServer(managementRoute);
    const browser = await chromium.launch({ headless: true });
    const captures = [];

    {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 1200 },
        colorScheme: "dark",
      });
      try {
        await context.addInitScript(createMockScript());
        const page = await context.newPage();
        captures.push(
          await captureScenario(
            page,
            "skill-list-updated-after-llm.png",
            captureManagementList,
            '[data-testid="skill-management-imported-section"]',
          ),
        );
      } finally {
        await context.close();
      }
    }

    {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 1200 },
        colorScheme: "dark",
      });
      try {
        await context.addInitScript(createMockScript());
        const page = await context.newPage();
        captures.push(
          await captureScenario(
            page,
            "complete-step-null-error.png",
            captureLlmError,
            '[data-testid="complete-step-error-header"]',
          ),
        );

        // 同一状態の全体証跡として、成功ヘッダーが表示されない root を保存する。
        await page.locator('[data-testid="complete-step"]').screenshot({
          path: path.join(screenshotDir, "complete-step-null-no-success.png"),
        });
        captures.push({
          file: "complete-step-null-no-success.png",
          selector: '[data-testid="complete-step"]',
        });
      } finally {
        await context.close();
      }
    }

    {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 1200 },
        colorScheme: "light",
      });
      try {
        await context.addInitScript(createMockScript());
        const page = await context.newPage();
        captures.push(
          await captureScenario(
            page,
            "complete-step-success.png",
            captureTemplateSuccess,
            '[data-testid="wizard-step-complete"]',
          ),
        );
      } finally {
        await context.close();
      }
    }

    const generatedAt = new Date().toISOString();
    await fs.writeFile(
      metadataPath,
      JSON.stringify(
        {
          generatedAt,
          captureMethod: "current_build_vite_playwright",
          baseUrl,
          screenshots: captures.map((entry) => ({
            file: entry.file,
            selector: entry.selector,
            output: `outputs/phase-11/screenshots/${entry.file}`,
          })),
        },
        null,
        2,
      ),
    );

    await Promise.race([
      browser.close(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
  } finally {
    if (!server.killed) {
      server.kill("SIGKILL");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
