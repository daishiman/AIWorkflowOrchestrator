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
  "docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate",
);
const screenshotDir = path.join(workflowDir, "outputs/phase-11/screenshots");
const captureResultsPath = path.join(screenshotDir, "capture-results.json");
const port = process.env.TASK_SKILL_LIFECYCLE_04_PORT ?? "5187";
const baseUrl = `http://localhost:${port}`;
const defaultViewport = { width: 1440, height: 1600 };
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

async function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // retry until timeout
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for Vite server: ${url}`);
}

function createMockScript() {
  return () => {
    const now = new Date("2026-03-12T13:00:00.000Z").toISOString();
    const listenerStore = {
      stream: [],
      complete: [],
      error: [],
      permission: [],
    };
    const query = () => new URLSearchParams(window.location.search);

    const buildImportedSkill = (name, description) => ({
      name,
      description,
      path: `/mock/skills/${name}`,
      allowedTools: ["Read", "Write"],
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

    const deriveSkillName = (description) => {
      if (/レビュー/.test(description)) return "review-gate-skill";
      if (/議事録/.test(description)) return "minutes-gate-skill";
      if (/block/.test(description)) return "blocked-gate-skill";
      return "lifecycle-gate-skill";
    };

    const buildAnalysis = (mode, skillName) => {
      const base = {
        skillName,
        overallScore: 72,
        categories: [
          {
            name: "Code Quality",
            score: 74,
            details: "構造は概ね良好ですが、改善余地があります。",
            issues: ["責務境界の説明が不足しています。"],
          },
          {
            name: "Security",
            score: 70,
            details: "権限まわりの意図は見えています。",
            issues: ["失敗時の境界説明を追加できます。"],
          },
        ],
        suggestions: [
          {
            type: "documentation",
            priority: "high",
            description: "品質ゲートの理由文を補強",
            autoFixable: true,
          },
          {
            type: "structure",
            priority: "medium",
            description: "判定ロジックの責務境界を明示",
            autoFixable: false,
          },
        ],
        risks: [],
      };

      if (mode === "ready") {
        return {
          ...base,
          overallScore: 88,
          categories: base.categories.map((category) => ({
            ...category,
            score: 88,
            issues: [],
          })),
          suggestions: [],
        };
      }

      if (mode === "hard-block") {
        return {
          ...base,
          overallScore: 86,
          risks: [
            {
              category: "security",
              level: "critical",
              description: "critical risk",
              impact: "利用を停止すべき状態",
            },
          ],
        };
      }

      if (mode === "improved") {
        return {
          ...base,
          overallScore: 91,
          categories: base.categories.map((category) => ({
            ...category,
            score: 92,
            issues: [],
          })),
          suggestions: [],
          risks: [],
        };
      }

      return base;
    };

    const buildPromptEvaluation = (mode, prompt) => {
      if (mode === "revise") {
        return {
          score: 42,
          breakdown: {
            clarity: 44,
            specificity: 41,
            completeness: 42,
            reproducibility: 39,
            security: 62,
          },
          feedback: [`${prompt} は安全性と具体性が不足しています。`],
        };
      }

      if (mode === "ready") {
        return {
          score: 88,
          breakdown: {
            clarity: 89,
            specificity: 88,
            completeness: 86,
            reproducibility: 87,
            security: 92,
          },
          feedback: ["利用開始に十分な依頼文です。"],
        };
      }

      return {
        score: 72,
        breakdown: {
          clarity: 75,
          specificity: 70,
          completeness: 71,
          reproducibility: 72,
          security: 88,
        },
        feedback: ["保存は可能ですが、改善余地があります。"],
      };
    };

    let importedSkills = [buildImportedSkill("existing-skill", "既存の比較用スキル")];
    let availableSkills = [
      {
        name: "existing-skill",
        displayName: "existing-skill",
        description: "既存の比較用スキル",
        version: "1.0.0",
        category: "automation",
        tags: ["automation"],
        author: "phase11-mock",
        path: "/mock/skills/existing-skill",
      },
    ];
    let improvementApplied = false;

    const resolveMode = () => query().get("mode") ?? "warning";

    const emit = (kind, payload) => {
      for (const callback of listenerStore[kind]) {
        callback(payload);
      }
    };

    const mockUser = {
      id: "phase11-user",
      email: "phase11@example.com",
      displayName: "Phase11 User",
      avatarUrl: "",
      provider: "google",
      createdAt: now,
      lastSignInAt: now,
    };

    sessionStorage.setItem("debug-clear-storage", "done");
    localStorage.setItem("dev-skip-auth", "true");
    window.confirm = () => true;

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
          data: { mode: "light", resolvedTheme: "light" },
        }),
        set: async () => ({ success: true, data: {} }),
        getSystem: async () => ({
          success: true,
          data: { isDark: false, resolvedTheme: "light" },
        }),
        onSystemChanged: () => () => {},
      },
      authKey: {
        exists: async () => ({ exists: true }),
        set: async () => ({ success: true }),
        validate: async () => ({ valid: true, message: "ok" }),
        delete: async () => ({ success: true }),
      },
      skillCreator: {
        detectMode: async () => ({ success: true, data: "collaborative" }),
        improveSkill: async (skillName) => ({
          success: true,
          data: {
            applied: false,
            suggestions: [
              {
                category: "evaluation",
                description: `${skillName} の改善候補を整理する`,
                severity: "medium",
                autoFixable: true,
              },
            ],
          },
        }),
      },
      skill: {
        list: async () => availableSkills,
        getImported: async () => importedSkills,
        import: async (skillName) => {
          const imported = buildImportedSkill(skillName, `${skillName} を追加`);
          importedSkills = [imported, ...importedSkills];
          return imported;
        },
        remove: async () => ({ success: true }),
        rescan: async () => availableSkills,
        create: async ({ description }) => {
          const skillName = deriveSkillName(description);
          const imported = buildImportedSkill(skillName, description);
          importedSkills = [imported, ...importedSkills];
          availableSkills = [
            {
              name: skillName,
              displayName: skillName,
              description,
              version: "1.0.0",
              category: "automation",
              tags: ["automation"],
              author: "phase11-mock",
              path: `/mock/skills/${skillName}`,
            },
            ...availableSkills,
          ];
          return {
            path: `/mock/skills/${skillName}`,
          };
        },
        execute: async ({ skillName, prompt }) => {
          const executionId = `exec-${skillName}-${Date.now()}`;
          const mode = resolveMode();
          setTimeout(() => {
            emit("stream", {
              type: "assistant",
              executionId,
              timestamp: Date.now(),
              content: {
                text:
                  mode === "ready"
                    ? `${prompt} を処理し、利用可能な結果を返しました。`
                    : `${prompt} を処理しました。`,
                isPartial: false,
              },
            });
          }, 120);

          if (mode === "ready") {
            setTimeout(() => {
              emit("complete", { executionId });
            }, 240);
          } else {
            setTimeout(() => {
              emit("error", {
                executionId,
                error: "実行エラー（phase11 hardening mock）",
              });
            }, 240);
          }

          return {
            success: true,
            executionId,
          };
        },
        abort: async () => undefined,
        onStream: (callback) => {
          listenerStore.stream.push(callback);
          return () => {
            listenerStore.stream = listenerStore.stream.filter(
              (entry) => entry !== callback,
            );
          };
        },
        onComplete: (callback) => {
          listenerStore.complete.push(callback);
          return () => {
            listenerStore.complete = listenerStore.complete.filter(
              (entry) => entry !== callback,
            );
          };
        },
        onError: (callback) => {
          listenerStore.error.push(callback);
          return () => {
            listenerStore.error = listenerStore.error.filter(
              (entry) => entry !== callback,
            );
          };
        },
        onPermissionRequest: (callback) => {
          listenerStore.permission.push(callback);
          return () => {
            listenerStore.permission = listenerStore.permission.filter(
              (entry) => entry !== callback,
            );
          };
        },
        sendPermissionResponse: async () => ({ success: true }),
        analyze: async (skillName) => {
          const mode = resolveMode();
          if (improvementApplied) {
            return buildAnalysis("improved", skillName);
          }
          return buildAnalysis(mode, skillName);
        },
        applyImprovements: async () => {
          improvementApplied = true;
          return {
            skillName: "review-gate-skill",
            applied: [],
            skipped: [],
            errors: [],
            executedAt: now,
          };
        },
        autoImprove: async () => {
          improvementApplied = true;
          return {
            skillName: "review-gate-skill",
            applied: [],
            skipped: [],
            errors: [],
            executedAt: now,
          };
        },
        evaluatePrompt: async (prompt) => buildPromptEvaluation(resolveMode(), prompt),
        readFile: async (_skillName, relativePath) =>
          `# ${relativePath}\n\nPhase11 mock content`,
        writeFile: async () => undefined,
        listBackups: async () => [],
        restoreBackup: async () => undefined,
      },
      profile: {
        get: async () => ({ success: false, error: "not-implemented" }),
        getProviders: async () => ({ success: true, data: [] }),
        update: async () => ({ success: false, error: "not-implemented" }),
        linkProvider: async () => ({ success: false, error: "not-implemented" }),
        unlinkProvider: async () => ({ success: false, error: "not-implemented" }),
        delete: async () => ({ success: false, error: "not-implemented" }),
      },
      avatar: {
        upload: async () => ({ success: false, error: "not-implemented" }),
        useProvider: async () => ({ success: false, error: "not-implemented" }),
        remove: async () => ({ success: false, error: "not-implemented" }),
      },
    };
  };
}

async function openLifecyclePanel(page, mode) {
  await page.goto(`${baseUrl}/advanced/skill-management-panel?mode=${mode}`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  });
  await page.waitForSelector('[data-testid="skill-management-panel"]');
  await page.getByTestId("skill-management-lifecycle-button").click();
  await page.waitForSelector('[data-testid="skill-lifecycle-panel"]');
}

async function createSkillFlow(page, requestText) {
  await page.getByTestId("skill-lifecycle-request-input").fill(requestText);
  await page.getByTestId("skill-lifecycle-prepare-button").click();
  await page.waitForSelector('[data-testid="skill-evaluation-panel"]');
  await page.getByTestId("skill-lifecycle-create-button").click();
  await page.waitForFunction(() => {
    const label = document.querySelector(
      '[data-testid="skill-lifecycle-created-name"]',
    );
    return label && label.textContent && !label.textContent.includes("未生成");
  });
}

async function navigateWithinSpa(page, pathname) {
  await page.evaluate((nextPath) => {
    window.history.pushState({}, "", nextPath);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, pathname);
}

async function waitForGateStatus(page, expectedLabel) {
  await page.waitForFunction(
    (label) => {
      const element = document.querySelector(
        '[data-testid="skill-evaluation-status"]',
      );
      return element?.textContent?.includes(label) ?? false;
    },
    expectedLabel,
  );
}

async function captureScenario(browser, scenario) {
  const context = await browser.newContext({
    viewport: defaultViewport,
    colorScheme: "light",
  });
  await context.addInitScript(createMockScript());
  const page = await context.newPage();

  try {
    await scenario.run(page);
    await page.waitForTimeout(500);
    const outputPath = path.join(screenshotDir, scenario.file);
    await page.screenshot({
      path: outputPath,
      fullPage: true,
    });
    return {
      tc: scenario.tc,
      title: scenario.title,
      file: scenario.file,
      viewport: defaultViewport,
      capturedAt: new Date().toISOString(),
    };
  } finally {
    await context.close();
  }
}

const scenarios = [
  {
    tc: "TC-11-01",
    title: "低品質 prompt で revise_required になる",
    file: "TC-11-01-revise-required.png",
    run: async (page) => {
      await openLifecyclePanel(page, "revise");
      await page
        .getByTestId("skill-lifecycle-request-input")
        .fill("曖昧にやって");
      await page.getByTestId("skill-lifecycle-prepare-button").click();
      await waitForGateStatus(page, "改善必須");
    },
  },
  {
    tc: "TC-11-02",
    title: "作成直後に save_with_warning になる",
    file: "TC-11-02-save-with-warning.png",
    run: async (page) => {
      await openLifecyclePanel(page, "warning");
      await createSkillFlow(
        page,
        "レビュー観点を整理してから改善案まで返すスキルを作る",
      );
      await waitForGateStatus(page, "保存可・警告あり");
    },
  },
  {
    tc: "TC-11-03",
    title: "実行後に use_ready になる",
    file: "TC-11-03-use-ready.png",
    run: async (page) => {
      await openLifecyclePanel(page, "ready");
      await createSkillFlow(
        page,
        "議事録を整形し、次のアクションを抽出するスキルを作る",
      );
      await page
        .getByTestId("skill-lifecycle-execution-input")
        .fill("この議事録を要約して");
      await page.getByTestId("skill-lifecycle-execute-button").click();
      await waitForGateStatus(page, "利用可");
      await page.getByTestId("skill-evaluation-summary").waitFor();
    },
  },
  {
    tc: "TC-11-04",
    title: "critical risk で hard block になる",
    file: "TC-11-04-hard-block.png",
    run: async (page) => {
      await openLifecyclePanel(page, "hard-block");
      await createSkillFlow(
        page,
        "block 条件のある実行を扱うスキルを作る",
      );
      await waitForGateStatus(page, "改善必須");
      await page.getByText("critical risk が残っているため利用できません。").waitFor();
    },
  },
  {
    tc: "TC-11-05",
    title: "改善後に recommended になる",
    file: "TC-11-05-recommended-after-improve.png",
    run: async (page) => {
      await openLifecyclePanel(page, "warning");
      await createSkillFlow(
        page,
        "レビュー観点を整理してから改善案まで返すスキルを作る",
      );
      await page.getByTestId("skill-lifecycle-improve-button").click();
      await page.getByTestId("skill-lifecycle-analysis-toggle").click();
      await page.getByTestId("skill-lifecycle-analysis-view").waitFor();
      await page.getByText("全自動改善").click();
      await waitForGateStatus(page, "推奨");
      await page
        .getByTestId("skill-analysis-view")
        .getByTestId("skill-evaluation-summary")
        .waitFor();
    },
  },
  {
    tc: "TC-11-06",
    title: "Skill Center から再評価して最新状態が反映される",
    file: "TC-11-06-task05-re-evaluate.png",
    run: async (page) => {
      await openLifecyclePanel(page, "warning");
      await createSkillFlow(
        page,
        "レビュー観点を整理してから改善案まで返すスキルを作る",
      );
      await page.getByTestId("skill-lifecycle-improve-button").click();
      await page.getByTestId("skill-lifecycle-analysis-toggle").click();
      await page.getByText("全自動改善").click();
      await waitForGateStatus(page, "推奨");
      await navigateWithinSpa(page, "/advanced/skill-center");
      await page.getByTestId("skill-center-view").waitFor();
      await page.getByText("利用前の品質ゲート").waitFor();
      await page.getByTestId("skill-evaluation-reevaluate").click();
      await page.waitForFunction(() => {
        const button = document.querySelector(
          '[data-testid="skill-evaluation-reevaluate"]',
        );
        return button?.textContent?.includes("再評価する") ?? false;
      });
      await page.getByTestId("skill-evaluation-status").waitFor();
    },
  },
];

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });

  const server = spawn(
    pnpmCommand,
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

  server.stdout.on("data", (data) => {
    process.stdout.write(data);
  });
  server.stderr.on("data", (data) => {
    process.stderr.write(data);
  });
  server.on("error", (error) => {
    console.error("Failed to start screenshot server:", error);
  });

  let browser;
  try {
    await waitForServer(baseUrl);
    browser = await chromium.launch({ headless: true });
    const results = [];

    for (const scenario of scenarios) {
      const result = await captureScenario(browser, scenario);
      results.push(result);
      console.log(`✓ ${scenario.tc} ${scenario.file}`);
    }

    await fs.writeFile(
      captureResultsPath,
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          baseUrl,
          results,
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
  } finally {
    if (browser) {
      await browser.close();
    }
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
